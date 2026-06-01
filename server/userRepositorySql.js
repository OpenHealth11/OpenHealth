import sql from "mssql";
import { resolveDailyTrackingKind } from "./dailyTrackingKind.js";
import { getPool } from "./db.js";
import { buildWeeklyReportSummary } from "./reportSummary.js";

// diyetdb.sql CHECK: Role IN (N'Danisan', N'Diyetisyen') — ş ile Danışan yazılamaz.
const ROLE_API_TO_DB = {
  danisan: "Danisan",
  diyetisyen: "Diyetisyen",
};

const ROLE_DB_TO_API = {
  Danisan: "danisan",
  Diyetisyen: "diyetisyen",
  Danışan: "danisan",
};

const USER_FROM = `
FROM Users u
INNER JOIN AccountStatuses s ON s.AccountStatusID = u.AccountStatusID
LEFT JOIN Clients c ON c.UserID = u.UserID
LEFT JOIN Users dt ON dt.UserID = c.DietitianUserID
`;

const USER_SELECT = `
SELECT u.UserID, u.FullName, u.Email, u.PasswordHash, u.Role, u.CreatedAt,
       u.ResetToken, u.ResetTokenExpiresAt,
       s.StatusCode,
       c.DietitianUserID,
       c.Yas,
       c.Boy, c.Kilo, c.Hedef, c.SonGorusme, c.Durum, c.Alerji, c.Hastalik,
       c.KanGrubu, c.DogumTarihi, c.Cinsiyet, c.AktiviteSeviyesi, c.KronikRahatsizlik,
       c.KullanilanIlaclar, c.AmeliyatGecmisi, c.SigaraAlkol, c.SaglikNotu
`;

function fmtNum(v) {
  if (v == null || v === "") return "";
  return String(v);
}

function fmtDate(v) {
  if (!v) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

export function mapFullUser(row) {
  if (!row) return null;
  return {
    id: row.UserID,
    fullName: row.FullName,
    email: row.Email.trim().toLowerCase(),
    passwordHash: row.PasswordHash,
    role: ROLE_DB_TO_API[row.Role] ?? row.Role,
    status: row.StatusCode,
    resetToken: row.ResetToken ?? undefined,
    resetTokenExpiresAt:
      row.ResetTokenExpiresAt instanceof Date
        ? row.ResetTokenExpiresAt.toISOString()
        : row.ResetTokenExpiresAt ?? undefined,
    createdAt:
      row.CreatedAt instanceof Date ? row.CreatedAt.toISOString() : row.CreatedAt,
    boy: fmtNum(row.Boy),
    kilo: fmtNum(row.Kilo),
    hedef: fmtNum(row.Hedef),
    sonGorusme: fmtDate(row.SonGorusme),
    durum: row.Durum ?? "Pasif",
    yas: row.Yas != null ? String(row.Yas) : "",
    diyetisyenId: row.DietitianUserID != null ? row.DietitianUserID : null,
    alerji: row.Alerji ?? "",
    hastalik: row.Hastalik ?? "",
    kanGrubu: row.KanGrubu ?? "",
    dogumTarihi: fmtDate(row.DogumTarihi),
    cinsiyet: row.Cinsiyet ?? "",
    aktiviteSeviyesi: row.AktiviteSeviyesi ?? "",
    kronikRahatsizlik: row.KronikRahatsizlik ?? "",
    kullanilanIlaclar: row.KullanilanIlaclar ?? "",
    ameliyatGecmisi: row.AmeliyatGecmisi ?? "",
    sigaraAlkol: row.SigaraAlkol ?? "",
    saglikNotu: row.SaglikNotu ?? "",
    measurements: [],
  };
}

async function resolveAccountStatusId(transaction, statusCode) {
  const r = await new sql.Request(transaction)
    .input("code", sql.NVarChar(20), statusCode)
    .query(
      "SELECT AccountStatusID FROM AccountStatuses WHERE StatusCode = @code"
    );
  const id = r.recordset[0]?.AccountStatusID;
  if (id == null) {
    throw new Error(`AccountStatuses missing code: ${statusCode}`);
  }
  return id;
}

export async function findUserByEmail(email) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("email", sql.NVarChar(100), email.trim().toLowerCase())
    .query(`
      ${USER_SELECT}
      ${USER_FROM}
      WHERE LOWER(LTRIM(RTRIM(u.Email))) = @email
    `);
  return mapFullUser(result.recordset[0]) ?? null;
}

export async function getUserById(id) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("id", sql.Int, Number(id))
    .query(`
      ${USER_SELECT}
      ${USER_FROM}
      WHERE u.UserID = @id
    `);
  return mapFullUser(result.recordset[0]) ?? null;
}

export async function findUserByResetToken(token) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("token", sql.NVarChar(128), token)
    .query(`
      ${USER_SELECT}
      ${USER_FROM}
      WHERE u.ResetToken = @token
    `);
  return mapFullUser(result.recordset[0]) ?? null;
}

export async function listApprovedDanisanlar() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT u.UserID AS id, u.FullName AS fullName, u.Email AS email
    FROM Users u
    INNER JOIN AccountStatuses s ON s.AccountStatusID = u.AccountStatusID
    WHERE u.Role = N'Danisan' AND s.StatusCode = N'approved'
    ORDER BY u.FullName
  `);
  return result.recordset.map((r) => ({
    id: r.id,
    fullName: r.fullName,
    email: r.email,
  }));
}

export async function listApprovedDietitians() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT u.UserID AS id, u.FullName AS fullName, u.Email AS email
    FROM Users u
    INNER JOIN AccountStatuses s ON s.AccountStatusID = u.AccountStatusID
    WHERE u.Role = N'Diyetisyen' AND s.StatusCode = N'approved'
    ORDER BY u.FullName
  `);
  return result.recordset.map((r) => ({
    id: r.id,
    fullName: r.fullName,
    email: String(r.email ?? "").trim().toLowerCase(),
  }));
}

const ADMIN_ACCOUNT_STATUSES = new Set(["approved", "rejected", "pending"]);

export async function listPendingDietitianAccounts() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT u.UserID AS id, u.Email AS email, u.FullName AS fullName,
           u.CreatedAt AS createdAt, s.StatusCode AS status
    FROM Users u
    INNER JOIN AccountStatuses s ON s.AccountStatusID = u.AccountStatusID
    WHERE u.Role = N'Diyetisyen' AND s.StatusCode = N'pending'
    ORDER BY u.CreatedAt DESC
  `);
  return result.recordset.map((r) => ({
    id: r.id,
    email: String(r.email ?? "").trim().toLowerCase(),
    fullName: r.fullName,
    status: r.status,
    createdAt:
      r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
  }));
}

export async function setDietitianAccountStatus(userId, statusCode) {
  if (!ADMIN_ACCOUNT_STATUSES.has(statusCode)) return null;
  const pool = await getPool();
  const id = Number(userId);
  const result = await pool
    .request()
    .input("uid", sql.Int, id)
    .input("code", sql.NVarChar(20), statusCode)
    .query(`
      UPDATE Users
      SET AccountStatusID = (SELECT AccountStatusID FROM AccountStatuses WHERE StatusCode = @code),
          UpdatedAt = SYSUTCDATETIME()
      WHERE UserID = @uid AND Role = N'Diyetisyen'
    `);
  const n = result.rowsAffected?.[0] ?? 0;
  if (!n) return null;
  return getUserById(id);
}

export async function createUser({ fullName, email, passwordHash, role }) {
  const roleDb = ROLE_API_TO_DB[role];
  if (!roleDb) return null;

  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const dup = await new sql.Request(transaction)
      .input("email", sql.NVarChar(100), email.trim().toLowerCase())
      .query("SELECT 1 AS x FROM Users WHERE LOWER(LTRIM(RTRIM(Email))) = @email");
    if (dup.recordset.length > 0) {
      await transaction.rollback();
      return null;
    }

    const statusCode = role === "diyetisyen" ? "pending" : "approved";
    const accountStatusId = await resolveAccountStatusId(transaction, statusCode);

    const insert = await new sql.Request(transaction)
      .input("fullName", sql.NVarChar(100), fullName.trim())
      .input("email", sql.NVarChar(100), email.trim().toLowerCase())
      .input("passwordHash", sql.NVarChar(255), passwordHash)
      .input("role", sql.NVarChar(20), roleDb)
      .input("accountStatusId", sql.Int, accountStatusId)
      .query(`
        INSERT INTO Users (FullName, Email, PasswordHash, Role, AccountStatusID)
        OUTPUT INSERTED.UserID
        VALUES (@fullName, @email, @passwordHash, @role, @accountStatusId)
      `);

    const userId = insert.recordset[0].UserID;

    if (roleDb === "Danisan") {
      await new sql.Request(transaction)
        .input("userId", sql.Int, userId)
        .query("INSERT INTO Clients (UserID) VALUES (@userId)");
    } else {
      await new sql.Request(transaction)
        .input("userId", sql.Int, userId)
        .query("INSERT INTO Dietitians (UserID) VALUES (@userId)");
    }

    await transaction.commit();
    return getUserById(userId);
  } catch (e) {
    try {
      await transaction.rollback();
    } catch {
      /* ignore */
    }
    if (e?.number === 2627 || e?.number === 2601) {
      return null;
    }
    throw e;
  }
}

export async function setResetToken(email, resetToken, resetTokenExpiresAt) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("email", sql.NVarChar(100), email.trim().toLowerCase())
    .input("token", sql.NVarChar(128), resetToken)
    .input("exp", sql.DateTime2, new Date(resetTokenExpiresAt))
    .query(`
      UPDATE Users
      SET ResetToken = @token, ResetTokenExpiresAt = @exp, UpdatedAt = SYSUTCDATETIME()
      OUTPUT INSERTED.UserID
      WHERE LOWER(LTRIM(RTRIM(Email))) = @email
    `);
  if (result.recordset.length === 0) return null;
  return getUserById(result.recordset[0].UserID);
}

export async function updateUserPassword(userId, passwordHash) {
  const pool = await getPool();
  await pool
    .request()
    .input("id", sql.Int, Number(userId))
    .input("hash", sql.NVarChar(255), passwordHash)
    .query(`
      UPDATE Users
      SET PasswordHash = @hash, ResetToken = NULL, ResetTokenExpiresAt = NULL, UpdatedAt = SYSUTCDATETIME()
      WHERE UserID = @id
    `);
  return getUserById(userId);
}

export async function updateUserProfile(userId, profileData) {
  const pool = await getPool();
  const id = Number(userId);
  await pool
    .request()
    .input("id", sql.Int, id)
    .input("fullName", sql.NVarChar(100), String(profileData.fullName ?? "").trim())
    .input("boy", sql.Decimal(5, 2), profileData.boy === "" || profileData.boy == null ? null : Number(profileData.boy))
    .input("kilo", sql.Decimal(5, 2), profileData.kilo === "" || profileData.kilo == null ? null : Number(profileData.kilo))
    .input("hedef", sql.Decimal(5, 2), profileData.hedef === "" || profileData.hedef == null ? null : Number(profileData.hedef))
    .input("alerji", sql.NVarChar(4000), profileData.alerji ?? "")
    .input("hastalik", sql.NVarChar(4000), profileData.hastalik ?? "")
    .input("ilaclar", sql.NVarChar(4000), profileData.kullanilanIlaclar ?? "")
    .query(`
      UPDATE Users SET FullName = @fullName, UpdatedAt = SYSUTCDATETIME() WHERE UserID = @id;
      UPDATE Clients SET Boy = @boy, Kilo = @kilo, Hedef = @hedef, Alerji = @alerji, Hastalik = @hastalik,
          KullanilanIlaclar = @ilaclar, UpdatedAt = SYSUTCDATETIME()
      WHERE UserID = @id;
    `);
  return getUserById(id);
}

export async function updateUserHealthInfo(userId, healthData) {
  const pool = await getPool();
  const id = Number(userId);
  let dogumTarihi = null;
  if (healthData.dogumTarihi) {
    const d = new Date(healthData.dogumTarihi);
    if (!Number.isNaN(d.getTime())) dogumTarihi = d;
  }
  await pool
    .request()
    .input("id", sql.Int, id)
    .input("kanGrubu", sql.NVarChar(20), healthData.kanGrubu ?? "")
    .input("dogumTarihi", sql.Date, dogumTarihi)
    .input("cinsiyet", sql.NVarChar(30), healthData.cinsiyet ?? "")
    .input("aktiviteSeviyesi", sql.NVarChar(50), healthData.aktiviteSeviyesi ?? "")
    .input("kronik", sql.NVarChar(4000), healthData.kronikRahatsizlik ?? "")
    .input("ilaclar", sql.NVarChar(4000), healthData.kullanilanIlaclar ?? "")
    .input("ameliyat", sql.NVarChar(4000), healthData.ameliyatGecmisi ?? "")
    .input("sigara", sql.NVarChar(4000), healthData.sigaraAlkol ?? "")
    .input("notu", sql.NVarChar(4000), healthData.saglikNotu ?? "")
    .query(`
      UPDATE Clients SET
        KanGrubu = @kanGrubu,
        DogumTarihi = @dogumTarihi,
        Cinsiyet = @cinsiyet,
        AktiviteSeviyesi = @aktiviteSeviyesi,
        KronikRahatsizlik = @kronik,
        KullanilanIlaclar = @ilaclar,
        AmeliyatGecmisi = @ameliyat,
        SigaraAlkol = @sigara,
        SaglikNotu = @notu,
        UpdatedAt = SYSUTCDATETIME()
      WHERE UserID = @id;
    `);
  return getUserById(id);
}

function mapMeasurementRow(r) {
  return {
    id: r.MeasurementID,
    tarih: fmtDate(r.Tarih),
    kilo: fmtNum(r.Kilo),
    boy: fmtNum(r.Boy),
    belCevresi: fmtNum(r.BelCevresi),
    kalcaCevresi: fmtNum(r.KalcaCevresi),
    yagOrani: fmtNum(r.YagOrani),
    not: r.NotText ?? "",
    createdAt:
      r.CreatedAt instanceof Date ? r.CreatedAt.toISOString() : r.CreatedAt,
  };
}

export async function getUserMeasurements(userId) {
  const user = await getUserById(userId);
  if (!user) return null;
  const pool = await getPool();
  const result = await pool
    .request()
    .input("uid", sql.Int, Number(userId))
    .query(`
      SELECT MeasurementID, Tarih, Kilo, Boy, BelCevresi, KalcaCevresi, YagOrani, NotText, CreatedAt
      FROM UserMeasurements
      WHERE UserID = @uid
      ORDER BY Tarih DESC, MeasurementID DESC
    `);
  return result.recordset.map(mapMeasurementRow);
}

export async function addUserMeasurement(userId, measurementData) {
  const user = await getUserById(userId);
  if (!user) return null;
  const pool = await getPool();
  const result = await pool
    .request()
    .input("uid", sql.Int, Number(userId))
    .input("tarih", sql.Date, new Date(measurementData.tarih))
    .input("kilo", sql.Decimal(5, 2), measurementData.kilo === "" || measurementData.kilo == null ? null : Number(measurementData.kilo))
    .input("boy", sql.Decimal(5, 2), measurementData.boy === "" || measurementData.boy == null ? null : Number(measurementData.boy))
    .input("bel", sql.Decimal(5, 2), measurementData.belCevresi === "" || measurementData.belCevresi == null ? null : Number(measurementData.belCevresi))
    .input("kalca", sql.Decimal(5, 2), measurementData.kalcaCevresi === "" || measurementData.kalcaCevresi == null ? null : Number(measurementData.kalcaCevresi))
    .input("yag", sql.Decimal(5, 2), measurementData.yagOrani === "" || measurementData.yagOrani == null ? null : Number(measurementData.yagOrani))
    .input("notText", sql.NVarChar(4000), typeof measurementData.not === "string" ? measurementData.not.trim() : "")
    .query(`
      INSERT INTO UserMeasurements (UserID, Tarih, Kilo, Boy, BelCevresi, KalcaCevresi, YagOrani, NotText)
      OUTPUT INSERTED.MeasurementID, INSERTED.Tarih, INSERTED.Kilo, INSERTED.Boy, INSERTED.BelCevresi, INSERTED.KalcaCevresi, INSERTED.YagOrani, INSERTED.NotText, INSERTED.CreatedAt
      VALUES (@uid, @tarih, @kilo, @boy, @bel, @kalca, @yag, @notText)
    `);
  return mapMeasurementRow(result.recordset[0]);
}

export async function getClientsByDiyetisyenId(diyetisyenUserId) {
  const pool = await getPool();
  const duid = Number(diyetisyenUserId);
  const result = await pool
    .request()
    .input("duid", sql.Int, duid)
    .query(`
      SELECT u.UserID AS id, u.FullName AS fullName, c.Yas AS yas, c.Boy AS boy, c.Kilo AS kilo, c.Hedef AS hedef,
             c.SonGorusme AS sonGorusme, c.Durum AS durum, c.Alerji AS alerji, c.Hastalik AS hastalik,
             c.KullanilanIlaclar AS kullanilanIlaclar
      FROM Clients c
      INNER JOIN Users u ON u.UserID = c.UserID
      WHERE c.DietitianUserID = @duid
      ORDER BY u.FullName
    `);
  return result.recordset.map((r) => ({
    id: r.id,
    fullName: r.fullName,
    yas: r.yas != null ? String(r.yas) : "",
    boy: fmtNum(r.boy),
    kilo: fmtNum(r.kilo),
    hedef: fmtNum(r.hedef),
    sonGorusme: fmtDate(r.sonGorusme),
    durum: r.durum ?? "Pasif",
    alerji: r.alerji ?? "",
    hastalik: r.hastalik ?? "",
    kullanilanIlaclar: r.kullanilanIlaclar ?? "",
  }));
}

export async function getRequestsByDiyetisyenId(diyetisyenUserId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("duid", sql.Int, Number(diyetisyenUserId))
    .query(`
      SELECT r.RequestID AS id, du.FullName AS danisanAdi, r.Talep AS talep,
             CONVERT(VARCHAR(10), r.Tarih, 23) AS tarih
      FROM DietitianRequests r
      INNER JOIN Users du ON du.UserID = r.DanisanUserID
      WHERE r.DietitianUserID = @duid AND r.Durum = N'pending'
      ORDER BY r.RequestID DESC
    `);
  return result.recordset.map((r) => ({
    id: r.id,
    danisanAdi: r.danisanAdi ?? "",
    talep: r.talep ?? "",
    tarih: r.tarih ?? "",
    durum: "pending",
  }));
}

export async function approveRequest(requestId) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    const reqRow = await new sql.Request(transaction)
      .input("rid", sql.Int, Number(requestId))
      .query(`
        SELECT RequestID, DanisanUserID, DietitianUserID, Durum
        FROM DietitianRequests WHERE RequestID = @rid
      `);
    const row = reqRow.recordset[0];
    if (!row || row.Durum !== "pending") {
      await transaction.rollback();
      return null;
    }
    await new sql.Request(transaction)
      .input("duid", sql.Int, row.DietitianUserID)
      .input("danisanUid", sql.Int, row.DanisanUserID)
      .query(`
        UPDATE Clients SET DietitianUserID = @duid, Durum = N'Aktif', UpdatedAt = SYSUTCDATETIME()
        WHERE UserID = @danisanUid
      `);
    await new sql.Request(transaction)
      .input("rid", sql.Int, Number(requestId))
      .query(`UPDATE DietitianRequests SET Durum = N'approved' WHERE RequestID = @rid`);
    await transaction.commit();
    await insertNotification({
      userId: row.DanisanUserID,
      title: "Talep onaylandı",
      message: "Diyetisyen atama talebiniz onaylandı.",
      notificationType: "request_approved",
      relatedEntityType: "DietitianRequest",
      relatedEntityId: Number(requestId),
    });
    await insertNotification({
      userId: row.DietitianUserID,
      title: "Yeni danışan",
      message: "Bir danışan atama talebini onayladınız.",
      notificationType: "request_approved",
      relatedEntityType: "DietitianRequest",
      relatedEntityId: Number(requestId),
    });
    return getUserById(row.DanisanUserID);
  } catch (e) {
    try {
      await transaction.rollback();
    } catch {
      /* ignore */
    }
    throw e;
  }
}

export async function rejectRequest(requestId) {
  const pool = await getPool();
  const pending = await pool
    .request()
    .input("rid", sql.Int, Number(requestId))
    .query(`
      SELECT DanisanUserID, DietitianUserID
      FROM DietitianRequests
      WHERE RequestID = @rid AND Durum = N'pending'
    `);
  const row = pending.recordset[0];
  if (!row) return null;

  const result = await pool
    .request()
    .input("rid", sql.Int, Number(requestId))
    .query(`
      UPDATE DietitianRequests SET Durum = N'rejected' WHERE RequestID = @rid AND Durum = N'pending'
    `);
  if (!(result.rowsAffected?.[0] > 0)) return null;

  await insertNotification({
    userId: row.DanisanUserID,
    title: "Talep reddedildi",
    message: "Diyetisyen atama talebiniz reddedildi.",
    notificationType: "request_rejected",
    relatedEntityType: "DietitianRequest",
    relatedEntityId: Number(requestId),
  });
  return { id: requestId };
}

export async function createRequest(danisanUserId, diyetisyenUserId) {
  const pool = await getPool();
  const duid = Number(diyetisyenUserId);
  const dietCheck = await pool
    .request()
    .input("uid", sql.Int, duid)
    .query(`SELECT 1 AS x FROM Dietitians WHERE UserID = @uid`);
  if (!dietCheck.recordset.length) return null;

  const ures = await pool
    .request()
    .input("uid", sql.Int, Number(danisanUserId))
    .query(`SELECT UserID, FullName FROM Users WHERE UserID = @uid`);
  const u = ures.recordset[0];
  if (!u) return null;

  const ins = await pool
    .request()
    .input("danisanUid", sql.Int, Number(danisanUserId))
    .input("duid", sql.Int, duid)
    .query(`
      INSERT INTO DietitianRequests (DanisanUserID, DietitianUserID, Talep, Durum)
      VALUES (@danisanUid, @duid, N'Diyetisyen atanma isteği', N'pending');
      SELECT RequestID, Tarih
      FROM DietitianRequests
      WHERE RequestID = CAST(SCOPE_IDENTITY() AS INT);
    `);
  const out = ins.recordset[0];
  if (!out) return null;
  await insertNotification({
    userId: duid,
    title: "Yeni talep",
    message: `${u.FullName ?? "Danışan"} diyetisyen atama talebi gönderdi.`,
    notificationType: "request_pending",
    relatedEntityType: "DietitianRequest",
    relatedEntityId: out.RequestID,
  });
  return {
    id: out.RequestID,
    danisanId: danisanUserId,
    diyetisyenId: duid,
    danisanAdi: u.FullName ?? "",
    talep: "Diyetisyen atanma isteği",
    tarih: fmtDate(out.Tarih),
    durum: "pending",
  };
}

/** Notes kolonunda JSON: öğün (meal) veya fiziksel aktivite (activity). */
function encodeDailyTrackingNotes(payload) {
  if (payload.kind === "activity") {
    return JSON.stringify({
      v: 1,
      kind: "activity",
      aktivite: String(payload.aktivite ?? "").slice(0, 200),
      sure: Math.max(0, Number(payload.sure) || 0),
      yakilanKalori: Math.max(0, Number(payload.yakilanKalori) || 0),
      not: String(payload.not ?? "").slice(0, 500),
    });
  }
  return JSON.stringify({
    v: 1,
    kind: "meal",
    besin: String(payload.besin ?? "").slice(0, 500),
    kalori: Number(payload.kalori) || 0,
    ogun: String(payload.ogun ?? "").slice(0, 80),
  });
}

/** @returns {{ kind:'meal', besin, kalori, ogun } | { kind:'activity', aktivite, sure, yakilanKalori, not }} */
function decodeDailyTrackingNotes(raw) {
  if (!raw || typeof raw !== "string") {
    return { kind: "meal", besin: "", kalori: 0, ogun: "-" };
  }
  try {
    const j = JSON.parse(raw);
    if (j && typeof j === "object") {
      if (j.kind === "activity") {
        return {
          kind: "activity",
          aktivite: typeof j.aktivite === "string" ? j.aktivite : "",
          sure: Math.max(0, Number(j.sure) || 0),
          yakilanKalori: Math.max(0, Number(j.yakilanKalori) || 0),
          not: typeof j.not === "string" ? j.not : "",
        };
      }
      return {
        kind: "meal",
        besin: typeof j.besin === "string" ? j.besin : "",
        kalori: Number(j.kalori) || 0,
        ogun: typeof j.ogun === "string" ? j.ogun : "-",
      };
    }
  } catch {
    /* eski düz metin */
  }
  return { kind: "meal", besin: raw.slice(0, 500), kalori: 0, ogun: "-" };
}

/** @param {{ from?: string, to?: string }} [range] YYYY-MM-DD */
export async function listDailyTrackingForClientUser(clientUserId, range = {}) {
  const pool = await getPool();
  const uid = Number(clientUserId);
  const req = pool.request().input("uid", sql.Int, uid);
  let dateClause = "";
  if (range.from && typeof range.from === "string") {
    req.input("from", sql.Date, new Date(`${range.from}T12:00:00`));
    dateClause += " AND dt.RecordDate >= @from";
  }
  if (range.to && typeof range.to === "string") {
    req.input("to", sql.Date, new Date(`${range.to}T12:00:00`));
    dateClause += " AND dt.RecordDate <= @to";
  }
  const result = await req.query(`
    SELECT dt.TrackingID, dt.RecordDate, dt.Notes
    FROM DailyTracking dt
    INNER JOIN Clients c ON c.ClientID = dt.ClientID AND c.UserID = @uid
    WHERE 1=1 ${dateClause}
    ORDER BY dt.RecordDate DESC, dt.TrackingID DESC
  `);
  return result.recordset.map((row) => {
    const dec = decodeDailyTrackingNotes(row.Notes);
    if (dec.kind === "activity") {
      return {
        id: row.TrackingID,
        tarih: fmtDate(row.RecordDate),
        kind: "activity",
        aktivite: dec.aktivite,
        sure: dec.sure,
        yakilanKalori: dec.yakilanKalori,
        not: dec.not,
      };
    }
    return {
      id: row.TrackingID,
      tarih: fmtDate(row.RecordDate),
      kind: "meal",
      besin: dec.besin,
      kalori: dec.kalori,
      ogun: dec.ogun,
    };
  });
}

export async function insertDailyMealForClientUser(clientUserId, payload) {
  const pool = await getPool();
  const uid = Number(clientUserId);
  const cidRes = await pool
    .request()
    .input("uid", sql.Int, uid)
    .query(`SELECT ClientID FROM Clients WHERE UserID = @uid`);
  const clientId = cidRes.recordset[0]?.ClientID;
  if (clientId == null) return null;

  const tarihRaw =
    typeof payload.tarih === "string" && payload.tarih.trim()
      ? payload.tarih.trim().slice(0, 10)
      : fmtDate(new Date());
  const recordDate = new Date(`${tarihRaw}T12:00:00`);

  const isActivity = resolveDailyTrackingKind(payload) === "activity";
  let notes;
  if (isActivity) {
    const aktivite = String(payload.aktivite ?? "").trim();
    const sure = Number(payload.sure);
    if (!aktivite || !Number.isFinite(sure) || sure <= 0) {
      return null;
    }
    notes = encodeDailyTrackingNotes({
      kind: "activity",
      aktivite,
      sure,
      yakilanKalori: payload.yakilanKalori,
      not: payload.not,
    });
  } else {
    const besin = String(payload.besin ?? "").trim();
    const ogun = String(payload.ogun ?? "").trim() || "Öğün";
    const kalori = Number(payload.kalori);
    if (!besin || !Number.isFinite(kalori) || kalori < 0) {
      return null;
    }
    notes = encodeDailyTrackingNotes({
      kind: "meal",
      besin,
      kalori,
      ogun,
    });
  }

  const ins = await pool
    .request()
    .input("cid", sql.Int, Number(clientId))
    .input("rd", sql.Date, recordDate)
    .input("notes", sql.NVarChar(sql.MAX), notes)
    .query(`
      INSERT INTO DailyTracking (ClientID, Notes, RecordDate)
      OUTPUT INSERTED.TrackingID, INSERTED.RecordDate, INSERTED.Notes
      VALUES (@cid, @notes, @rd)
    `);
  const row = ins.recordset[0];
  if (!row) return null;
  const dec = decodeDailyTrackingNotes(row.Notes);
  const client = await getUserById(uid);
  if (client?.diyetisyenId) {
    const label =
      dec.kind === "activity"
        ? `Aktivite: ${dec.aktivite}`
        : `Öğün: ${dec.besin || dec.ogun}`;
    await insertNotification({
      userId: client.diyetisyenId,
      title: "Yeni günlük kayıt",
      message: `${client.fullName ?? "Danışan"} — ${label}`,
      notificationType: "daily_tracking_added",
      relatedEntityType: "DailyTracking",
      relatedEntityId: row.TrackingID,
    });
  }
  if (dec.kind === "activity") {
    return {
      id: row.TrackingID,
      tarih: fmtDate(row.RecordDate),
      kind: "activity",
      aktivite: dec.aktivite,
      sure: dec.sure,
      yakilanKalori: dec.yakilanKalori,
      not: dec.not,
    };
  }
  return {
    id: row.TrackingID,
    tarih: fmtDate(row.RecordDate),
    kind: "meal",
    besin: dec.besin,
    kalori: dec.kalori,
    ogun: dec.ogun,
  };
}

export async function deleteDailyMealForClientUser(clientUserId, trackingId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("uid", sql.Int, Number(clientUserId))
    .input("tid", sql.Int, Number(trackingId))
    .query(`
      DELETE dt
      FROM DailyTracking dt
      INNER JOIN Clients c ON c.ClientID = dt.ClientID AND c.UserID = @uid
      WHERE dt.TrackingID = @tid
    `);
  return result.rowsAffected?.[0] > 0;
}

/** @param {{ from?: string, to?: string }} [range] */
export async function listDailyTrackingForDietitianUser(diyetisyenUserId, range = {}) {
  const pool = await getPool();
  const did = Number(diyetisyenUserId);
  const req = pool.request().input("did", sql.Int, did);
  let dateClause = "";
  if (range.from && typeof range.from === "string") {
    req.input("from", sql.Date, new Date(`${range.from}T12:00:00`));
    dateClause += " AND dt.RecordDate >= @from";
  }
  if (range.to && typeof range.to === "string") {
    req.input("to", sql.Date, new Date(`${range.to}T12:00:00`));
    dateClause += " AND dt.RecordDate <= @to";
  }
  const result = await req.query(`
    SELECT dt.TrackingID, dt.RecordDate, dt.Notes, u.FullName AS DanisanAdi
    FROM DailyTracking dt
    INNER JOIN Clients c ON c.ClientID = dt.ClientID
    INNER JOIN Users u ON u.UserID = c.UserID
    WHERE c.DietitianUserID = @did ${dateClause}
    ORDER BY dt.RecordDate DESC, dt.TrackingID DESC
  `);

  return result.recordset.map((row) => {
    const dec = decodeDailyTrackingNotes(row.Notes);
    const base = {
      id: row.TrackingID,
      danisanAdi: row.DanisanAdi ?? "",
      tarih: fmtDate(row.RecordDate),
      su: 0,
      durum: "Takipte",
    };
    if (dec.kind === "activity") {
      return {
        ...base,
        kind: "activity",
        ogun: "Aktivite",
        detay: dec.aktivite,
        kalori: 0,
        aktiviteSure: dec.sure,
        yakilanKalori: dec.yakilanKalori,
        not: dec.not,
      };
    }
    return {
      ...base,
      kind: "meal",
      detay: dec.besin,
      ogun: dec.ogun,
      kalori: dec.kalori,
      not: "",
    };
  });
}

/** Son `days` gün (bugün dahil) için DailyTracking + UserMeasurements özeti. */
export async function getWeeklyReportSummaryForClientUser(clientUserId, opts = {}) {
  const daysWindow = Math.min(Math.max(Number(opts.days) || 7, 1), 90);
  const end = new Date();
  end.setHours(12, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - (daysWindow - 1));
  const pad = (n) => String(n).padStart(2, "0");
  const isoLocal = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromStr = isoLocal(start);
  const toStr = isoLocal(end);

  const entries = await listDailyTrackingForClientUser(clientUserId, {
    from: fromStr,
    to: toStr,
  });
  const allMeas = await getUserMeasurements(clientUserId);
  const measurements = (allMeas || []).filter((m) => {
    const t = (m.tarih ?? "").slice(0, 10);
    return t >= fromStr && t <= toStr;
  });
  const user = await getUserById(clientUserId);
  const suOrtalama = await getWaterAverageForClientUser(clientUserId, fromStr, toStr);
  const core = buildWeeklyReportSummary({
    entries,
    measurements,
    profileKilo: user?.kilo,
    profileHedef: user?.hedef,
    daysWindow,
    suOrtalama,
  });
  return {
    ...core,
    periodFrom: fromStr,
    periodTo: toStr,
    days: daysWindow,
  };
}

async function clientIdForUser(pool, clientUserId) {
  const r = await pool
    .request()
    .input("uid", sql.Int, Number(clientUserId))
    .query(`SELECT ClientID FROM Clients WHERE UserID = @uid`);
  return r.recordset[0]?.ClientID ?? null;
}

function fmtDateTime(v) {
  if (!v) return "";
  if (v instanceof Date) {
    return v.toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return String(v);
}

function mapNotificationRow(row) {
  const type = String(row.NotificationType ?? "").toLowerCase();
  const kritik =
    type.includes("critical") ||
    type.includes("kritik") ||
    type === "measurement_alert";
  const mesaj = row.Title
    ? `${row.Title}: ${row.Message ?? ""}`
    : String(row.Message ?? "");
  return {
    id: row.NotificationID,
    mesaj,
    saat: fmtDateTime(row.CreatedAt),
    tur: kritik ? "kritik" : "normal",
    isRead: Boolean(row.IsRead),
    notificationType: row.NotificationType ?? "",
    createdAt:
      row.CreatedAt instanceof Date
        ? row.CreatedAt.toISOString()
        : row.CreatedAt,
  };
}

export async function insertNotification({
  userId,
  title,
  message,
  notificationType,
  relatedEntityType = null,
  relatedEntityId = null,
}) {
  const pool = await getPool();
  await pool
    .request()
    .input("uid", sql.Int, Number(userId))
    .input("title", sql.NVarChar(120), String(title ?? "").slice(0, 120))
    .input("message", sql.NVarChar(sql.MAX), String(message ?? ""))
    .input("type", sql.NVarChar(50), String(notificationType ?? "general").slice(0, 50))
    .input("relType", sql.NVarChar(50), relatedEntityType)
    .input("relId", sql.BigInt, relatedEntityId != null ? Number(relatedEntityId) : null)
    .query(`
      INSERT INTO Notifications (UserID, Title, Message, NotificationType, RelatedEntityType, RelatedEntityID)
      VALUES (@uid, @title, @message, @type, @relType, @relId)
    `);
}

export async function listNotificationsForUser(userId, limit = 50) {
  const pool = await getPool();
  const lim = Math.min(Math.max(Number(limit) || 50, 1), 200);
  const result = await pool
    .request()
    .input("uid", sql.Int, Number(userId))
    .input("lim", sql.Int, lim)
    .query(`
      SELECT TOP (@lim)
        NotificationID, UserID, Title, Message, NotificationType,
        IsRead, RelatedEntityType, RelatedEntityID, CreatedAt, ReadAt
      FROM Notifications
      WHERE UserID = @uid
      ORDER BY CreatedAt DESC, NotificationID DESC
    `);
  return result.recordset.map(mapNotificationRow);
}

export async function markNotificationRead(userId, notificationId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("uid", sql.Int, Number(userId))
    .input("nid", sql.BigInt, Number(notificationId))
    .query(`
      UPDATE Notifications
      SET IsRead = 1, ReadAt = SYSUTCDATETIME()
      OUTPUT INSERTED.NotificationID
      WHERE NotificationID = @nid AND UserID = @uid
    `);
  return result.recordset.length > 0;
}

export async function getWaterTrackingForClientUser(clientUserId, recordDate) {
  const pool = await getPool();
  const clientId = await clientIdForUser(pool, clientUserId);
  if (clientId == null) return null;

  const tarih =
    typeof recordDate === "string" && recordDate.trim()
      ? recordDate.trim().slice(0, 10)
      : fmtDate(new Date());
  const rd = new Date(`${tarih}T12:00:00`);

  const result = await pool
    .request()
    .input("cid", sql.Int, Number(clientId))
    .input("rd", sql.Date, rd)
    .query(`
      SELECT TargetGlasses, ConsumedGlasses, RecordDate
      FROM WaterTracking
      WHERE ClientID = @cid AND RecordDate = @rd
    `);

  if (result.recordset[0]) {
    const row = result.recordset[0];
    return {
      icilen: Number(row.ConsumedGlasses) || 0,
      hedef: Number(row.TargetGlasses) || 8,
      tarih: fmtDate(row.RecordDate),
    };
  }
  return { icilen: 0, hedef: 8, tarih };
}

export async function upsertWaterTrackingForClientUser(
  clientUserId,
  { consumedGlasses, targetGlasses, recordDate }
) {
  const pool = await getPool();
  const clientId = await clientIdForUser(pool, clientUserId);
  if (clientId == null) return null;

  const tarih =
    typeof recordDate === "string" && recordDate.trim()
      ? recordDate.trim().slice(0, 10)
      : fmtDate(new Date());
  const rd = new Date(`${tarih}T12:00:00`);
  const consumed = Math.max(0, Math.min(99, Number(consumedGlasses) || 0));
  const target = Math.max(1, Math.min(30, Number(targetGlasses) || 8));

  await pool
    .request()
    .input("cid", sql.Int, Number(clientId))
    .input("rd", sql.Date, rd)
    .input("target", sql.Int, target)
    .input("consumed", sql.Int, consumed)
    .query(`
      MERGE WaterTracking AS t
      USING (SELECT @cid AS ClientID, @rd AS RecordDate) AS s
      ON t.ClientID = s.ClientID AND t.RecordDate = s.RecordDate
      WHEN MATCHED THEN
        UPDATE SET
          ConsumedGlasses = @consumed,
          TargetGlasses = @target,
          UpdatedAt = SYSUTCDATETIME()
      WHEN NOT MATCHED THEN
        INSERT (ClientID, RecordDate, TargetGlasses, ConsumedGlasses)
        VALUES (@cid, @rd, @target, @consumed);
    `);

  return getWaterTrackingForClientUser(clientUserId, tarih);
}

export async function getWaterAverageForClientUser(clientUserId, fromStr, toStr) {
  const pool = await getPool();
  const clientId = await clientIdForUser(pool, clientUserId);
  if (clientId == null) return null;

  const result = await pool
    .request()
    .input("cid", sql.Int, Number(clientId))
    .input("from", sql.Date, new Date(`${fromStr}T12:00:00`))
    .input("to", sql.Date, new Date(`${toStr}T12:00:00`))
    .query(`
      SELECT AVG(CAST(ConsumedGlasses AS FLOAT)) AS avgGlasses
      FROM WaterTracking
      WHERE ClientID = @cid AND RecordDate >= @from AND RecordDate <= @to
    `);

  const avg = result.recordset[0]?.avgGlasses;
  if (avg == null || Number.isNaN(Number(avg))) return null;
  return Math.round(Number(avg) * 10) / 10;
}
