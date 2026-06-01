/** Diyetisyen PlanYonetimi’nde kaydedilen PlanOgun JSON satırından öğün listesi üretir. */
export function mealsFromNutritionPlan(plan) {
  if (!plan?.ogunler?.length) return [];
  const raw = plan.ogunler[0]?.ogunler;
  if (typeof raw !== "string" || !raw.trim().startsWith("{")) return [];
  try {
    const meta = JSON.parse(raw);
    const list = Array.isArray(meta.meals) ? meta.meals : [];
    return list.map((m, idx) => ({
      id: m.id ?? idx + 1,
      ogun:
        typeof m.ogunAdi === "string" && m.ogunAdi.trim() ? m.ogunAdi.trim() : "Öğün",
      saat: typeof m.saat === "string" && m.saat.trim() ? m.saat.trim() : "—",
      yemek: typeof m.icerik === "string" && m.icerik.trim() ? m.icerik.trim() : "—",
      kalori: m.kalori != null && m.kalori !== "" ? m.kalori : "—",
    }));
  } catch {
    return [];
  }
}

/** API plan listesi en yeni plandan eskiye sıralı gelir (planStore sırası). */
export function mealsFromLatestPlan(plans) {
  if (!Array.isArray(plans) || plans.length === 0) return [];
  return mealsFromNutritionPlan(plans[0]);
}
