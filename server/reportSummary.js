/**
 * Günlük takip + ölçümlerden haftalık rapor özeti (saf fonksiyon).
 * Su ortalaması: WaterTracking tablosundan (opsiyonel) gelir.
 */

export function buildWeeklyReportSummary({
  entries,
  measurements,
  profileKilo,
  profileHedef,
  daysWindow,
  suOrtalama = null,
}) {
  const meals = (entries || []).filter((e) => !e.kind || e.kind === "meal");

  const byDay = new Map();
  for (const e of meals) {
    const d = typeof e.tarih === "string" ? e.tarih.slice(0, 10) : "";
    if (!d) continue;
    byDay.set(d, (byDay.get(d) || 0) + (Number(e.kalori) || 0));
  }
  const dayTotals = [...byDay.values()];
  const ortalamaKalori = dayTotals.length
    ? Math.round(dayTotals.reduce((a, b) => a + b, 0) / dayTotals.length)
    : 0;

  const mealCount = meals.length;
  const uyumOrani =
    mealCount > 0 && daysWindow > 0
      ? Math.min(100, Math.round((mealCount / (daysWindow * 3)) * 100))
      : 0;

  let kiloDegisim = "—";
  const sorted = [...(measurements || [])].sort((a, b) =>
    String(a.tarih ?? "").localeCompare(String(b.tarih ?? ""))
  );
  const withKilo = sorted.filter((m) => Number.isFinite(Number(m.kilo)));
  if (withKilo.length >= 2) {
    const first = Number(withKilo[0].kilo);
    const last = Number(withKilo[withKilo.length - 1].kilo);
    const diff = last - first;
    kiloDegisim = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)} kg (dönem içi ölçüm)`;
  } else if (
    profileKilo !== "" &&
    profileKilo != null &&
    profileHedef !== "" &&
    profileHedef != null
  ) {
    const k = Number(profileKilo);
    const h = Number(profileHedef);
    if (Number.isFinite(k) && Number.isFinite(h)) {
      const diff = k - h;
      kiloDegisim = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)} kg (hedefe göre)`;
    }
  }

  return {
    ortalamaKalori,
    suOrtalama,
    kiloDegisim,
    uyumOrani,
    kaynak: "server",
    meta: {
      mealCount,
      trackedDays: byDay.size,
      days: daysWindow,
    },
  };
}
