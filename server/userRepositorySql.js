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
