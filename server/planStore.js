import sql from "mssql";
import { getPool } from "./db.js";
import { getUserById } from "./userStore.js";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function nullableDate(value) {
  const text = normalizeText(value);
  return text || null;
}

function formatDate(value) {
  return value ? String(value).slice(0, 10) : null;
}

function mapPlanRows(rows) {
  const map = new Map();
  for (const row of rows) {
    const planId = row.PlanID;
    if (!map.has(planId)) {
      map.set(planId, {
        id: planId,
        clientUserId: row.ClientUserID,
        clientFullName: row.ClientFullName ?? "",
        planAdi: row.PlanAdi,
        baslangicTarihi: formatDate(row.BaslangicTarihi),
        bitisTarihi: formatDate(row.BitisTarihi),
        createdAt: row.CreatedAt instanceof Date ? row.CreatedAt.toISOString() : row.CreatedAt,
        updatedAt:
          row.UpdatedAt instanceof Date
            ? row.UpdatedAt.toISOString()
            : (row.UpdatedAt ?? (row.CreatedAt instanceof Date ? row.CreatedAt.toISOString() : row.CreatedAt)),
        ogunler: [],
      });
    }
    if (row.PlanOgunID != null) {
      map.get(planId).ogunler.push({
        planOgunId: row.PlanOgunID,
        gun: formatDate(row.Gun),
        ogunler: row.Ogunler,
      });
    }
  }
  return [...map.values()];
}

async function fetchPlans(whereClause, bind) {
  const pool = await getPool();
  const request = pool.request();
  bind(request);
  const result = await request.query(`
    SELECT
      p.PlanID,
      p.DietitianUserID,
      p.ClientUserID,
      p.PlanAdi,
      p.BaslangicTarihi,
      p.BitisTarihi,
      p.CreatedAt,
      p.UpdatedAt,
      cu.FullName AS ClientFullName,
      po.PlanOgunID,
      po.Gun,
      po.Ogunler
    FROM BeslenmePlani p
    INNER JOIN Users cu ON cu.UserID = p.ClientUserID
    LEFT JOIN PlanOgun po ON po.PlanID = p.PlanID
    WHERE ${whereClause}
    ORDER BY p.PlanID DESC, po.Gun ASC, po.PlanOgunID ASC
  `);
  return mapPlanRows(result.recordset);
}

function normalizeOgunRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => {
      const gun = normalizeText(row?.gun);
      const ogunler =
        typeof row?.ogunler === "string"
          ? row.ogunler.trim()
          : String(row?.ogunler ?? "").trim();
      if (!gun || !ogunler) return null;
      return { gun, ogunler };
    })
    .filter(Boolean);
}

async function assertClient(clientUserId) {
  const client = await getUserById(clientUserId);
  if (!client || client.role !== "danisan") {
    return { ok: false, code: "CLIENT_INVALID" };
  }
  if ((client.status ?? "approved") !== "approved") {
    return { ok: false, code: "CLIENT_INACTIVE" };
  }
  return { ok: true, client };
}

export async function listPlansByDietitian(dietitianUserId) {
  return fetchPlans("p.DietitianUserID = @dietitianUserId", (request) => {
    request.input("dietitianUserId", sql.Int, Number(dietitianUserId));
  });
}

export async function getPlanByDietitian(dietitianUserId, planId) {
  const plans = await fetchPlans(
    "p.DietitianUserID = @dietitianUserId AND p.PlanID = @planId",
    (request) => {
      request.input("dietitianUserId", sql.Int, Number(dietitianUserId));
      request.input("planId", sql.Int, Number(planId));
    }
  );
  return plans[0] ?? null;
}

export async function createPlanForDietitian(dietitianUserId, payload) {
  const check = await assertClient(payload.clientUserId);
  if (!check.ok) return check;

  const planAdi = normalizeText(payload.planAdi);
  const baslangicTarihi = normalizeText(payload.baslangicTarihi);
  if (!planAdi || !baslangicTarihi) {
    return { ok: false, code: "VALIDATION" };
  }

  const ogunler = normalizeOgunRows(payload.ogunler);
  if (ogunler.length === 0) {
    return { ok: false, code: "NO_MEAL_CONTENT" };
  }

  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const inserted = await new sql.Request(transaction)
      .input("dietitianUserId", sql.Int, Number(dietitianUserId))
      .input("clientUserId", sql.Int, check.client.id)
      .input("planAdi", sql.NVarChar(100), planAdi)
      .input("baslangicTarihi", sql.Date, baslangicTarihi)
      .input("bitisTarihi", sql.Date, nullableDate(payload.bitisTarihi))
      .query(`
        INSERT INTO BeslenmePlani
          (DietitianUserID, ClientUserID, PlanAdi, BaslangicTarihi, BitisTarihi)
        OUTPUT INSERTED.PlanID
        VALUES
          (@dietitianUserId, @clientUserId, @planAdi, @baslangicTarihi, @bitisTarihi)
      `);

    const planId = inserted.recordset[0].PlanID;

    for (const row of ogunler) {
      await new sql.Request(transaction)
        .input("planId", sql.Int, planId)
        .input("gun", sql.Date, row.gun)
        .input("ogunler", sql.NVarChar(sql.MAX), row.ogunler)
        .query(`
          INSERT INTO PlanOgun (PlanID, Gun, Ogunler)
          VALUES (@planId, @gun, @ogunler)
        `);
    }

    await transaction.commit();
    return { ok: true, plan: await getPlanByDietitian(dietitianUserId, planId) };
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {
      /* ignore rollback errors */
    }
    throw error;
  }
}

export async function updatePlanForDietitian(dietitianUserId, planId, payload) {
  const existing = await getPlanByDietitian(dietitianUserId, planId);
  if (!existing) return { ok: false, code: "NOT_FOUND" };

  let clientUserId = existing.clientUserId;
  if (payload.clientUserId != null) {
    const check = await assertClient(Number(payload.clientUserId));
    if (!check.ok) return check;
    clientUserId = check.client.id;
  }

  const planAdi =
    typeof payload.planAdi === "string" && payload.planAdi.trim()
      ? payload.planAdi.trim()
      : existing.planAdi;
  const baslangicTarihi =
    typeof payload.baslangicTarihi === "string" && payload.baslangicTarihi.trim()
      ? payload.baslangicTarihi.trim()
      : existing.baslangicTarihi;
  const bitisTarihi =
    payload.bitisTarihi === undefined
      ? existing.bitisTarihi
      : nullableDate(payload.bitisTarihi);

  const nextOgunler =
    Array.isArray(payload.ogunler) ? normalizeOgunRows(payload.ogunler) : null;
  if (Array.isArray(payload.ogunler) && nextOgunler.length === 0) {
    return { ok: false, code: "NO_MEAL_CONTENT" };
  }

  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    await new sql.Request(transaction)
      .input("planId", sql.Int, Number(planId))
      .input("dietitianUserId", sql.Int, Number(dietitianUserId))
      .input("clientUserId", sql.Int, clientUserId)
      .input("planAdi", sql.NVarChar(100), planAdi)
      .input("baslangicTarihi", sql.Date, baslangicTarihi)
      .input("bitisTarihi", sql.Date, bitisTarihi)
      .query(`
        UPDATE BeslenmePlani
        SET ClientUserID = @clientUserId,
            PlanAdi = @planAdi,
            BaslangicTarihi = @baslangicTarihi,
            BitisTarihi = @bitisTarihi,
            UpdatedAt = SYSUTCDATETIME()
        WHERE PlanID = @planId
          AND DietitianUserID = @dietitianUserId
      `);

    if (nextOgunler) {
      await new sql.Request(transaction)
        .input("planId", sql.Int, Number(planId))
        .query("DELETE FROM PlanOgun WHERE PlanID = @planId");

      for (const row of nextOgunler) {
        await new sql.Request(transaction)
          .input("planId", sql.Int, Number(planId))
          .input("gun", sql.Date, row.gun)
          .input("ogunler", sql.NVarChar(sql.MAX), row.ogunler)
          .query(`
            INSERT INTO PlanOgun (PlanID, Gun, Ogunler)
            VALUES (@planId, @gun, @ogunler)
          `);
      }
    }

    await transaction.commit();
    return { ok: true, plan: await getPlanByDietitian(dietitianUserId, planId) };
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {
      /* ignore rollback errors */
    }
    throw error;
  }
}

export async function addPlanOgun(dietitianUserId, planId, body) {
  const plan = await getPlanByDietitian(dietitianUserId, planId);
  if (!plan) return { ok: false, code: "NOT_FOUND" };

  const gun = normalizeText(body.gun);
  const ogunler =
    typeof body.ogunler === "string"
      ? body.ogunler.trim()
      : String(body.ogunler ?? "").trim();

  if (!gun || !ogunler) {
    return { ok: false, code: "VALIDATION" };
  }

  const pool = await getPool();
  const result = await pool
    .request()
    .input("planId", sql.Int, Number(planId))
    .input("dietitianUserId", sql.Int, Number(dietitianUserId))
    .input("gun", sql.Date, gun)
    .input("ogunler", sql.NVarChar(sql.MAX), ogunler)
    .query(`
      INSERT INTO PlanOgun (PlanID, Gun, Ogunler)
      OUTPUT INSERTED.PlanOgunID, INSERTED.Gun, INSERTED.Ogunler
      SELECT @planId, @gun, @ogunler
      WHERE EXISTS (
        SELECT 1
        FROM BeslenmePlani
        WHERE PlanID = @planId AND DietitianUserID = @dietitianUserId
      )
    `);

  if (result.recordset.length === 0) {
    return { ok: false, code: "NOT_FOUND" };
  }

  const row = result.recordset[0];
  return {
    ok: true,
    plan: await getPlanByDietitian(dietitianUserId, planId),
    planOgun: {
      planOgunId: row.PlanOgunID,
      gun: formatDate(row.Gun),
      ogunler: row.Ogunler,
    },
  };
}

export async function updatePlanOgun(dietitianUserId, planId, planOgunId, body) {
  const plan = await getPlanByDietitian(dietitianUserId, planId);
  if (!plan) return { ok: false, code: "NOT_FOUND" };

  const target = plan.ogunler.find((row) => row.planOgunId === Number(planOgunId));
  if (!target) return { ok: false, code: "NOT_FOUND" };

  const gun =
    typeof body.gun === "string" && body.gun.trim() ? body.gun.trim() : target.gun;
  const ogunler =
    typeof body.ogunler === "string" && body.ogunler.trim()
      ? body.ogunler.trim()
      : target.ogunler;

  await (await getPool())
    .request()
    .input("planId", sql.Int, Number(planId))
    .input("dietitianUserId", sql.Int, Number(dietitianUserId))
    .input("planOgunId", sql.Int, Number(planOgunId))
    .input("gun", sql.Date, gun)
    .input("ogunler", sql.NVarChar(sql.MAX), ogunler)
    .query(`
      UPDATE po
      SET po.Gun = @gun,
          po.Ogunler = @ogunler,
          po.UpdatedAt = SYSUTCDATETIME()
      FROM PlanOgun po
      INNER JOIN BeslenmePlani p ON p.PlanID = po.PlanID
      WHERE po.PlanID = @planId
        AND po.PlanOgunID = @planOgunId
        AND p.DietitianUserID = @dietitianUserId
    `);

  return {
    ok: true,
    plan: await getPlanByDietitian(dietitianUserId, planId),
    planOgun: {
      planOgunId: Number(planOgunId),
      gun,
      ogunler,
    },
  };
}

export async function deletePlanOgun(dietitianUserId, planId, planOgunId) {
  const plan = await getPlanByDietitian(dietitianUserId, planId);
  if (!plan) return { ok: false, code: "NOT_FOUND" };
  if (plan.ogunler.length <= 1) return { ok: false, code: "NO_MEAL_CONTENT" };

  const pool = await getPool();
  const result = await pool
    .request()
    .input("planId", sql.Int, Number(planId))
    .input("dietitianUserId", sql.Int, Number(dietitianUserId))
    .input("planOgunId", sql.Int, Number(planOgunId))
    .query(`
      DELETE po
      OUTPUT DELETED.PlanOgunID
      FROM PlanOgun po
      INNER JOIN BeslenmePlani p ON p.PlanID = po.PlanID
      WHERE po.PlanID = @planId
        AND po.PlanOgunID = @planOgunId
        AND p.DietitianUserID = @dietitianUserId
    `);

  if (result.recordset.length === 0) {
    return { ok: false, code: "NOT_FOUND" };
  }

  return { ok: true, plan: await getPlanByDietitian(dietitianUserId, planId) };
}

export async function deletePlanByDietitian(dietitianUserId, planId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("planId", sql.Int, Number(planId))
    .input("dietitianUserId", sql.Int, Number(dietitianUserId))
    .query(`
      DELETE FROM BeslenmePlani
      OUTPUT DELETED.PlanID
      WHERE PlanID = @planId
        AND DietitianUserID = @dietitianUserId
    `);

  return { ok: result.recordset.length > 0 };
}
