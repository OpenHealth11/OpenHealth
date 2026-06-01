import sql from "mssql";
import { getPool } from "./db.js";

const ROLE_API_TO_DB = {
  danisan: "Danışan",
  diyetisyen: "Diyetisyen",
};

const ROLE_DB_TO_API = {
  Danışan: "danisan",
  Diyetisyen: "diyetisyen",
};

function mapRowToUser(row) {
  if (!row) return null;
  return {
    id: row.UserID,
    fullName: row.FullName,
    email: row.Email.trim().toLowerCase(),
    passwordHash: row.PasswordHash,
    role: ROLE_DB_TO_API[row.Role] ?? row.Role,
    status: row.StatusCode,
    createdAt: row.CreatedAt instanceof Date ? row.CreatedAt.toISOString() : row.CreatedAt,
  };
}

export async function findUserByEmail(email) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("email", sql.NVarChar(100), email.trim().toLowerCase())
    .query(`
      SELECT u.UserID, u.FullName, u.Email, u.PasswordHash, u.Role, u.CreatedAt, s.StatusCode
      FROM Users u
      INNER JOIN AccountStatuses s ON s.AccountStatusID = u.AccountStatusID
      WHERE LOWER(LTRIM(RTRIM(u.Email))) = @email
    `);
  return mapRowToUser(result.recordset[0]) ?? null;
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
        OUTPUT INSERTED.UserID, INSERTED.FullName, INSERTED.Email, INSERTED.PasswordHash,
               INSERTED.Role, INSERTED.CreatedAt
        VALUES (@fullName, @email, @passwordHash, @role, @accountStatusId)
      `);

    const row = insert.recordset[0];
    const userId = row.UserID;

    if (roleDb === "Danışan") {
      await new sql.Request(transaction)
        .input("userId", sql.Int, userId)
        .query("INSERT INTO Clients (UserID) VALUES (@userId)");
    } else {
      await new sql.Request(transaction)
        .input("userId", sql.Int, userId)
        .query("INSERT INTO Dietitians (UserID) VALUES (@userId)");
    }

    await transaction.commit();

    return {
      id: userId,
      fullName: row.FullName,
      email: row.Email.trim().toLowerCase(),
      passwordHash: row.PasswordHash,
      role,
      status: statusCode,
      createdAt:
        row.CreatedAt instanceof Date ? row.CreatedAt.toISOString() : row.CreatedAt,
    };
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

export async function getNotifications(userId) {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("userId", sql.Int, userId)
    .query(`
      SELECT
        NotificationID,
        NotificationType,
        Severity,
        Title,
        Body,
        CreatedAt,
        ReadAt
      FROM Notifications
      WHERE RecipientUserID = @userId
      ORDER BY CreatedAt DESC
    `);

  return result.recordset;
}

export async function createNotification({
  recipientUserId,
  notificationType,
  title,
  body,
  severity = "normal",
}) {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("recipientUserId", sql.Int, recipientUserId)
    .input("notificationType", sql.NVarChar(40), notificationType)
    .input("severity", sql.NVarChar(20), severity)
    .input("title", sql.NVarChar(200), title)
    .input("body", sql.NVarChar(sql.MAX), body)
    .query(`
      INSERT INTO Notifications
      (
        RecipientUserID,
        NotificationType,
        Severity,
        Title,
        Body
      )
      OUTPUT INSERTED.*
      VALUES
      (
        @recipientUserId,
        @notificationType,
        @severity,
        @title,
        @body
      )
    `);

  return result.recordset[0];
}

export async function getDietitianUserIdByClientUserId(clientUserId) {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("clientUserId", sql.Int, clientUserId)
    .query(`
      SELECT d.UserID AS DietitianUserID
      FROM Clients c
      INNER JOIN Dietitians d
        ON d.DietitianID = c.DietitianID
      WHERE c.UserID = @clientUserId
    `);

  return result.recordset[0]?.DietitianUserID ?? null;
}

export async function getDailyTracking(userId) {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("userId", sql.Int, userId)
    .query(`
      SELECT
      TrackingID,
      Notes,
      RecordDate,
      Durum,
      DietitianNote
      FROM DailyTracking
      WHERE ClientID = @userId
      ORDER BY RecordDate DESC, TrackingID DESC
    `);

  return result.recordset;
}

export async function createDailyTracking(userId, notes, recordDate) {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("userId", sql.Int, userId)
    .input("notes", sql.NVarChar(sql.MAX), notes)
    .input("recordDate", sql.Date, recordDate)
    .query(`
      INSERT INTO DailyTracking
      (
        ClientID,
        Notes,
        RecordDate
      )
      OUTPUT INSERTED.*
      VALUES
      (
        @userId,
        @notes,
        @recordDate
      )
    `);

  return result.recordset[0];
}

export async function getDailyTrackingForDietitian(dietitianUserId) {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("dietitianUserId", sql.Int, dietitianUserId)
    .query(`
      SELECT
        dt.TrackingID,
        u.FullName,
        dt.Notes,
        dt.RecordDate,
        dt.Durum,
        dt.DietitianNote
      FROM DailyTracking dt
      INNER JOIN Clients c
        ON c.ClientID = dt.ClientID
      INNER JOIN Users u
        ON u.UserID = c.UserID
      INNER JOIN Dietitians d
        ON d.DietitianID = c.DietitianID
      WHERE d.UserID = @dietitianUserId
      ORDER BY dt.RecordDate DESC, dt.TrackingID DESC
    `);

  return result.recordset;
}

export async function createDailyTrackingFeedback(
  trackingId,
  dietitianUserId,
  comment
) {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("trackingId", sql.Int, trackingId)
    .input("dietitianUserId", sql.Int, dietitianUserId)
    .input("comment", sql.NVarChar(sql.MAX), comment)
    .query(`
      INSERT INTO DailyTrackingFeedback
      (
        TrackingID,
        DietitianUserID,
        Comment
      )
      OUTPUT INSERTED.*
      VALUES
      (
        @trackingId,
        @dietitianUserId,
        @comment
      )
    `);

  return result.recordset[0];
}

export async function getDailyTrackingFeedback(trackingId) {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("trackingId", sql.Int, trackingId)
    .query(`
      SELECT
        FeedbackID,
        TrackingID,
        DietitianUserID,
        Comment,
        CreatedAt
      FROM DailyTrackingFeedback
      WHERE TrackingID = @trackingId
      ORDER BY CreatedAt DESC
    `);

  return result.recordset;
} 

export async function updateDailyTrackingStatus(
  trackingId,
  status,
  dietitianNote = null
) {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("trackingId", sql.Int, trackingId)
    .input("status", sql.NVarChar(30), status)
    .input("dietitianNote", sql.NVarChar(sql.MAX), dietitianNote)
    .query(`
      UPDATE DailyTracking
      SET
        Durum = @status,
        DietitianNote = @dietitianNote
      OUTPUT INSERTED.*
      WHERE TrackingID = @trackingId
    `);

  return result.recordset[0];
}