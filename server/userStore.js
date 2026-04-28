import sql from "mssql";
import { getPool } from "./db.js";

const ROLE_API_TO_DB = {
  danisan: "Danisan",
  diyetisyen: "Diyetisyen",
};

const ROLE_DB_TO_API = {
  Danisan: "danisan",
  "Danışan": "danisan",
  Diyetisyen: "diyetisyen",
};

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(value) {
  const text = normalizeText(value);
  return text || null;
}

function nullableDate(value) {
  const text = normalizeText(value);
  return text || null;
}

function nullableNumber(value) {
  if (value === "" || value == null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function iso(value) {
  return value instanceof Date ? value.toISOString() : value ?? null;
}

function mapRowToUser(row) {
  if (!row) return null;
  return {
    id: row.UserID,
    fullName: row.FullName,
    email: row.Email?.trim().toLowerCase() ?? "",
    passwordHash: row.PasswordHash,
    role: ROLE_DB_TO_API[row.Role] ?? row.Role,
    status: row.StatusCode ?? "approved",
    yas: row.Yas ?? "",
    sonGorusme: row.SonGorusme ? String(row.SonGorusme).slice(0, 10) : "",
    durum: row.Durum ?? "Pasif",
    diyetisyenId: row.DietitianID ?? null,
    boy: row.Boy ?? "",
    kilo: row.Kilo ?? "",
    hedef: row.Hedef ?? "",
    alerji: row.Alerji ?? "",
    hastalik: row.Hastalik ?? "",
    kanGrubu: row.KanGrubu ?? "",
    dogumTarihi: row.DogumTarihi ? String(row.DogumTarihi).slice(0, 10) : "",
    cinsiyet: row.Cinsiyet ?? "",
    aktiviteSeviyesi: row.AktiviteSeviyesi ?? "",
    kronikRahatsizlik: row.KronikRahatsizlik ?? "",
    kullanilanIlaclar: row.KullanilanIlaclar ?? "",
    ameliyatGecmisi: row.AmeliyatGecmisi ?? "",
    sigaraAlkol: row.SigaraAlkol ?? "",
    saglikNotu: row.SaglikNotu ?? "",
    resetToken: row.ResetToken ?? null,
    resetTokenExpiresAt: iso(row.ResetTokenExpiresAt),
    createdAt: iso(row.CreatedAt),
    updatedAt: iso(row.UpdatedAt),
  };
}

async function fetchUserByClause(whereSql, bind) {
  const pool = await getPool();
  const request = pool.request();
  bind(request);
  const result = await request.query(`
    SELECT
      u.UserID,
      u.FullName,
      u.Email,
      u.PasswordHash,
      u.Role,
      u.ResetToken,
      u.ResetTokenExpiresAt,
      u.CreatedAt,
      u.UpdatedAt,
      s.StatusCode,
      c.DietitianID,
      c.Yas,
      c.Boy,
      c.Kilo,
      c.Hedef,
      c.SonGorusme,
      c.Durum,
      c.Alerji,
      c.Hastalik,
      c.KanGrubu,
      c.DogumTarihi,
      c.Cinsiyet,
      c.AktiviteSeviyesi,
      c.KronikRahatsizlik,
      c.KullanilanIlaclar,
      c.AmeliyatGecmisi,
      c.SigaraAlkol,
      c.SaglikNotu
    FROM Users u
    INNER JOIN AccountStatuses s ON s.AccountStatusID = u.AccountStatusID
    LEFT JOIN Clients c ON c.UserID = u.UserID
    WHERE ${whereSql}
  `);
  return mapRowToUser(result.recordset[0]);
}

async function resolveAccountStatusId(executor, statusCode) {
  const result = await executor
    .input("statusCode", sql.NVarChar(20), statusCode)
    .query("SELECT AccountStatusID FROM AccountStatuses WHERE StatusCode = @statusCode");
  const id = result.recordset[0]?.AccountStatusID;
  if (id == null) {
    throw new Error(`AccountStatuses missing code: ${statusCode}`);
  }
  return id;
}

export async function loadDb() {
  const pool = await getPool();
  const [usersResult, requestsResult] = await Promise.all([
    pool.request().query(`
      SELECT
        u.UserID,
        u.FullName,
        u.Email,
        u.PasswordHash,
        u.Role,
        u.ResetToken,
        u.ResetTokenExpiresAt,
        u.CreatedAt,
        u.UpdatedAt,
        s.StatusCode,
        c.DietitianID,
        c.Yas,
        c.Boy,
        c.Kilo,
        c.Hedef,
        c.SonGorusme,
        c.Durum,
        c.Alerji,
        c.Hastalik,
        c.KanGrubu,
        c.DogumTarihi,
        c.Cinsiyet,
        c.AktiviteSeviyesi,
        c.KronikRahatsizlik,
        c.KullanilanIlaclar,
        c.AmeliyatGecmisi,
        c.SigaraAlkol,
        c.SaglikNotu
      FROM Users u
      INNER JOIN AccountStatuses s ON s.AccountStatusID = u.AccountStatusID
      LEFT JOIN Clients c ON c.UserID = u.UserID
    `),
    pool.request().query(`
      SELECT
        RequestID,
        DanisanUserID,
        DietitianID,
        Talep,
        Tarih,
        Durum,
        CreatedAt
      FROM DietitianRequests
    `),
  ]);

  return {
    users: usersResult.recordset.map(mapRowToUser),
    requests: requestsResult.recordset.map((row) => ({
      id: row.RequestID,
      danisanId: row.DanisanUserID,
      diyetisyenId: row.DietitianID,
      talep: row.Talep,
      tarih: row.Tarih ? String(row.Tarih).slice(0, 10) : "",
      durum: row.Durum,
      createdAt: iso(row.CreatedAt),
    })),
  };
}

export async function findUserByEmail(email) {
  const normalized = normalizeText(email).toLowerCase();
  if (!normalized) return null;
  return fetchUserByClause("u.NormalizedEmail = @email", (request) => {
    request.input("email", sql.NVarChar(100), normalized);
  });
}

export async function getUserById(id) {
  const userId = Number(id);
  if (!Number.isFinite(userId)) return null;
  return fetchUserByClause("u.UserID = @userId", (request) => {
    request.input("userId", sql.Int, userId);
  });
}

export async function listApprovedDanisanlar() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT u.UserID, u.FullName, u.Email
    FROM Users u
    INNER JOIN AccountStatuses s ON s.AccountStatusID = u.AccountStatusID
    WHERE u.Role IN (N'Danisan', N'Danışan')
      AND s.StatusCode = N'approved'
    ORDER BY u.FullName ASC
  `);
  return result.recordset.map((row) => ({
    id: row.UserID,
    fullName: row.FullName,
    email: row.Email?.trim().toLowerCase() ?? "",
  }));
}

export async function createUser({ fullName, email, passwordHash, role }) {
  const roleDb = ROLE_API_TO_DB[role];
  if (!roleDb) return null;

  const normalizedEmail = normalizeText(email).toLowerCase();
  const trimmedName = normalizeText(fullName);
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const duplicate = await new sql.Request(transaction)
      .input("email", sql.NVarChar(100), normalizedEmail)
      .query("SELECT 1 AS x FROM Users WHERE NormalizedEmail = @email");

    if (duplicate.recordset.length > 0) {
      await transaction.rollback();
      return null;
    }

    const statusCode = role === "diyetisyen" ? "pending" : "approved";
    const accountStatusId = await resolveAccountStatusId(
      new sql.Request(transaction),
      statusCode
    );

    const inserted = await new sql.Request(transaction)
      .input("fullName", sql.NVarChar(100), trimmedName)
      .input("email", sql.NVarChar(100), normalizedEmail)
      .input("passwordHash", sql.NVarChar(255), passwordHash)
      .input("role", sql.NVarChar(20), roleDb)
      .input("accountStatusId", sql.Int, accountStatusId)
      .query(`
        INSERT INTO Users (FullName, Email, PasswordHash, Role, AccountStatusID)
        OUTPUT INSERTED.UserID
        VALUES (@fullName, @email, @passwordHash, @role, @accountStatusId)
      `);

    const userId = inserted.recordset[0].UserID;

    if (role === "danisan") {
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
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {
      /* ignore rollback errors */
    }
    if (error?.number === 2627 || error?.number === 2601) {
      return null;
    }
    throw error;
  }
}

export async function getUserMeasurements(userId) {
  const targetUser = await getUserById(userId);
  if (!targetUser) return null;

  const pool = await getPool();
  const result = await pool
    .request()
    .input("userId", sql.Int, Number(userId))
    .query(`
      SELECT
        MeasurementID,
        Tarih,
        Kilo,
        Boy,
        BelCevresi,
        KalcaCevresi,
        YagOrani,
        NotText,
        CreatedAt
      FROM UserMeasurements
      WHERE UserID = @userId
      ORDER BY Tarih DESC, MeasurementID DESC
    `);

  return result.recordset.map((row) => ({
    id: row.MeasurementID,
    tarih: row.Tarih ? String(row.Tarih).slice(0, 10) : "",
    kilo: row.Kilo ?? "",
    boy: row.Boy ?? "",
    belCevresi: row.BelCevresi ?? "",
    kalcaCevresi: row.KalcaCevresi ?? "",
    yagOrani: row.YagOrani ?? "",
    not: row.NotText ?? "",
    createdAt: iso(row.CreatedAt),
  }));
}

export async function addUserMeasurement(userId, measurementData) {
  const targetUser = await getUserById(userId);
  if (!targetUser) return null;

  const pool = await getPool();
  const result = await pool
    .request()
    .input("userId", sql.Int, Number(userId))
    .input("tarih", sql.Date, nullableDate(measurementData.tarih))
    .input("kilo", sql.Decimal(5, 2), nullableNumber(measurementData.kilo))
    .input("boy", sql.Decimal(5, 2), nullableNumber(measurementData.boy))
    .input("belCevresi", sql.Decimal(5, 2), nullableNumber(measurementData.belCevresi))
    .input("kalcaCevresi", sql.Decimal(5, 2), nullableNumber(measurementData.kalcaCevresi))
    .input("yagOrani", sql.Decimal(5, 2), nullableNumber(measurementData.yagOrani))
    .input("notText", sql.NVarChar(sql.MAX), nullableText(measurementData.not))
    .query(`
      INSERT INTO UserMeasurements
        (UserID, Tarih, Kilo, Boy, BelCevresi, KalcaCevresi, YagOrani, NotText)
      OUTPUT
        INSERTED.MeasurementID,
        INSERTED.Tarih,
        INSERTED.Kilo,
        INSERTED.Boy,
        INSERTED.BelCevresi,
        INSERTED.KalcaCevresi,
        INSERTED.YagOrani,
        INSERTED.NotText,
        INSERTED.CreatedAt
      VALUES
        (@userId, @tarih, @kilo, @boy, @belCevresi, @kalcaCevresi, @yagOrani, @notText)
    `);

  const row = result.recordset[0];
  return {
    id: row.MeasurementID,
    tarih: row.Tarih ? String(row.Tarih).slice(0, 10) : "",
    kilo: row.Kilo ?? "",
    boy: row.Boy ?? "",
    belCevresi: row.BelCevresi ?? "",
    kalcaCevresi: row.KalcaCevresi ?? "",
    yagOrani: row.YagOrani ?? "",
    not: row.NotText ?? "",
    createdAt: iso(row.CreatedAt),
  };
}

export async function setResetToken(email, resetToken, resetTokenExpiresAt) {
  const normalizedEmail = normalizeText(email).toLowerCase();
  const pool = await getPool();
  await pool
    .request()
    .input("email", sql.NVarChar(100), normalizedEmail)
    .input("resetToken", sql.NVarChar(128), resetToken)
    .input("resetTokenExpiresAt", sql.DateTime2, resetTokenExpiresAt)
    .query(`
      UPDATE Users
      SET ResetToken = @resetToken,
          ResetTokenExpiresAt = @resetTokenExpiresAt,
          UpdatedAt = SYSUTCDATETIME()
      WHERE NormalizedEmail = @email
    `);
  return findUserByEmail(normalizedEmail);
}

export async function findUserByResetToken(token) {
  const value = normalizeText(token);
  if (!value) return null;
  return fetchUserByClause("u.ResetToken = @token", (request) => {
    request.input("token", sql.NVarChar(128), value);
  });
}

export async function updateUserPassword(userId, passwordHash) {
  const pool = await getPool();
  await pool
    .request()
    .input("userId", sql.Int, Number(userId))
    .input("passwordHash", sql.NVarChar(255), passwordHash)
    .query(`
      UPDATE Users
      SET PasswordHash = @passwordHash,
          ResetToken = NULL,
          ResetTokenExpiresAt = NULL,
          UpdatedAt = SYSUTCDATETIME()
      WHERE UserID = @userId
    `);
  return getUserById(userId);
}

export async function updateUserProfile(userId, profileData) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    await new sql.Request(transaction)
      .input("userId", sql.Int, Number(userId))
      .input("fullName", sql.NVarChar(100), normalizeText(profileData.fullName))
      .query(`
        UPDATE Users
        SET FullName = @fullName,
            UpdatedAt = SYSUTCDATETIME()
        WHERE UserID = @userId
      `);

    await new sql.Request(transaction)
      .input("userId", sql.Int, Number(userId))
      .input("boy", sql.Decimal(5, 2), nullableNumber(profileData.boy))
      .input("kilo", sql.Decimal(5, 2), nullableNumber(profileData.kilo))
      .input("hedef", sql.Decimal(5, 2), nullableNumber(profileData.hedef))
      .input("alerji", sql.NVarChar(sql.MAX), nullableText(profileData.alerji))
      .input("hastalik", sql.NVarChar(sql.MAX), nullableText(profileData.hastalik))
      .query(`
        UPDATE Clients
        SET Boy = @boy,
            Kilo = @kilo,
            Hedef = @hedef,
            Alerji = @alerji,
            Hastalik = @hastalik,
            UpdatedAt = SYSUTCDATETIME()
        WHERE UserID = @userId
      `);

    await transaction.commit();
    return getUserById(userId);
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {
      /* ignore rollback errors */
    }
    throw error;
  }
}

export async function updateUserHealthInfo(userId, healthData) {
  const pool = await getPool();
  await pool
    .request()
    .input("userId", sql.Int, Number(userId))
    .input("kanGrubu", sql.NVarChar(20), nullableText(healthData.kanGrubu))
    .input("dogumTarihi", sql.Date, nullableDate(healthData.dogumTarihi))
    .input("cinsiyet", sql.NVarChar(30), nullableText(healthData.cinsiyet))
    .input("aktiviteSeviyesi", sql.NVarChar(50), nullableText(healthData.aktiviteSeviyesi))
    .input("kronikRahatsizlik", sql.NVarChar(sql.MAX), nullableText(healthData.kronikRahatsizlik))
    .input("kullanilanIlaclar", sql.NVarChar(sql.MAX), nullableText(healthData.kullanilanIlaclar))
    .input("ameliyatGecmisi", sql.NVarChar(sql.MAX), nullableText(healthData.ameliyatGecmisi))
    .input("sigaraAlkol", sql.NVarChar(sql.MAX), nullableText(healthData.sigaraAlkol))
    .input("saglikNotu", sql.NVarChar(sql.MAX), nullableText(healthData.saglikNotu))
    .query(`
      UPDATE Clients
      SET KanGrubu = @kanGrubu,
          DogumTarihi = @dogumTarihi,
          Cinsiyet = @cinsiyet,
          AktiviteSeviyesi = @aktiviteSeviyesi,
          KronikRahatsizlik = @kronikRahatsizlik,
          KullanilanIlaclar = @kullanilanIlaclar,
          AmeliyatGecmisi = @ameliyatGecmisi,
          SigaraAlkol = @sigaraAlkol,
          SaglikNotu = @saglikNotu,
          UpdatedAt = SYSUTCDATETIME()
      WHERE UserID = @userId
    `);
  return getUserById(userId);
}

export async function getClientsByDiyetisyenId(diyetisyenUserId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("dietitianUserId", sql.Int, Number(diyetisyenUserId))
    .query(`
      SELECT
        u.UserID,
        u.FullName,
        u.Email,
        s.StatusCode,
        c.Yas,
        c.Boy,
        c.Kilo,
        c.Hedef,
        c.SonGorusme,
        c.Durum,
        c.Alerji,
        c.Hastalik,
        c.DietitianID
      FROM Clients c
      INNER JOIN Users u ON u.UserID = c.UserID
      INNER JOIN AccountStatuses s ON s.AccountStatusID = u.AccountStatusID
      INNER JOIN Dietitians d ON d.DietitianID = c.DietitianID
      WHERE d.UserID = @dietitianUserId
      ORDER BY u.FullName ASC
    `);

  return result.recordset.map((row) => ({
    id: row.UserID,
    fullName: row.FullName,
    email: row.Email?.trim().toLowerCase() ?? "",
    role: "danisan",
    status: row.StatusCode ?? "approved",
    yas: row.Yas ?? "",
    boy: row.Boy ?? "",
    kilo: row.Kilo ?? "",
    hedef: row.Hedef ?? "",
    sonGorusme: row.SonGorusme ? String(row.SonGorusme).slice(0, 10) : "",
    durum: row.Durum ?? "Pasif",
    alerji: row.Alerji ?? "",
    hastalik: row.Hastalik ?? "",
    diyetisyenId: row.DietitianID ?? null,
  }));
}

export async function getRequestsByDiyetisyenId(diyetisyenUserId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("dietitianUserId", sql.Int, Number(diyetisyenUserId))
    .query(`
      SELECT
        r.RequestID,
        r.DanisanUserID,
        r.DietitianID,
        r.Talep,
        r.Tarih,
        r.Durum,
        u.FullName AS DanisanAdi
      FROM DietitianRequests r
      INNER JOIN Dietitians d ON d.DietitianID = r.DietitianID
      LEFT JOIN Users u ON u.UserID = r.DanisanUserID
      WHERE d.UserID = @dietitianUserId
        AND r.Durum = N'pending'
      ORDER BY r.Tarih DESC, r.RequestID DESC
    `);

  return result.recordset.map((row) => ({
    id: row.RequestID,
    danisanId: row.DanisanUserID,
    diyetisyenId: row.DietitianID,
    danisanAdi: row.DanisanAdi ?? "",
    talep: row.Talep,
    tarih: row.Tarih ? String(row.Tarih).slice(0, 10) : "",
    durum: row.Durum,
  }));
}

export async function approveRequest(requestId) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const requestResult = await new sql.Request(transaction)
      .input("requestId", sql.Int, Number(requestId))
      .query(`
        SELECT RequestID, DanisanUserID, DietitianID, Durum
        FROM DietitianRequests
        WHERE RequestID = @requestId
      `);

    const row = requestResult.recordset[0];
    if (!row) {
      await transaction.rollback();
      return null;
    }

    await new sql.Request(transaction)
      .input("danisanUserId", sql.Int, row.DanisanUserID)
      .input("dietitianId", sql.Int, row.DietitianID)
      .query(`
        UPDATE Clients
        SET DietitianID = @dietitianId,
            Durum = N'Aktif',
            UpdatedAt = SYSUTCDATETIME()
        WHERE UserID = @danisanUserId
      `);

    await new sql.Request(transaction)
      .input("requestId", sql.Int, row.RequestID)
      .query(`
        UPDATE DietitianRequests
        SET Durum = N'approved'
        WHERE RequestID = @requestId
      `);

    await transaction.commit();
    return getUserById(row.DanisanUserID);
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {
      /* ignore rollback errors */
    }
    throw error;
  }
}

export async function rejectRequest(requestId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("requestId", sql.Int, Number(requestId))
    .query(`
      UPDATE DietitianRequests
      SET Durum = N'rejected'
      OUTPUT INSERTED.RequestID
      WHERE RequestID = @requestId
    `);

  if (result.recordset.length === 0) return null;
  return { id: result.recordset[0].RequestID };
}
