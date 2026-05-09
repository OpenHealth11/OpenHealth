import sql from "mssql";

let poolPromise = null;

/**
 * @returns {Promise<import('mssql').ConnectionPool>}
 */
export function getPool() {
  const conn = process.env.MSSQL_CONNECTION_STRING?.trim();
  if (!conn) {
    throw new Error("MSSQL_CONNECTION_STRING is not set");
  }
  if (!poolPromise) {
    poolPromise = sql
      .connect(conn)
      .then((pool) => {
        pool.on("error", (err) => {
          console.error("[mssql pool]", err);
          poolPromise = null;
        });
        return pool;
      })
      .catch((err) => {
        poolPromise = null;
        throw err;
      });
  }
  return poolPromise;
}

export function clearPoolForTests() {
  poolPromise = null;
}
