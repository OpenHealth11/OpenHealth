/**
 * POST gövdesinde öğün mü aktivite mi olduğunu çözümler.
 * Bazı istemciler veya proxy katmanları `kind` alanını düşürebilir;
 * `aktivite` dolu ve `besin` boşsa aktivite kabul edilir.
 */
export function resolveDailyTrackingKind(payload) {
  if (!payload || typeof payload !== "object") return "meal";
  const raw = payload.kind;
  if (raw === "activity") return "activity";
  if (raw === "meal") return "meal";

  const besin = String(payload.besin ?? "").trim();
  const aktivite = String(payload.aktivite ?? "").trim();
  if (aktivite && !besin) return "activity";

  return "meal";
}
