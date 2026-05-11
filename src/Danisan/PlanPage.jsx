import React, { useEffect, useMemo, useState } from "react";
import { FiClock, FiCoffee, FiSun, FiMoon, FiCheckCircle } from "react-icons/fi";
import { mealsFromNutritionPlan } from "./planDisplay";

function PlanPage({ plans = [], loading = false, error = "" }) {
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  useEffect(() => {
    setSelectedPlanId((prev) => {
      if (!plans.length) return null;
      if (prev != null && plans.some((p) => Number(p.id) === Number(prev))) return prev;
      return plans[0].id;
    });
  }, [plans]);

  const selectedPlan = useMemo(
    () => plans.find((p) => Number(p.id) === Number(selectedPlanId)) ?? plans[0] ?? null,
    [plans, selectedPlanId]
  );

  const meals = useMemo(
    () => (selectedPlan ? mealsFromNutritionPlan(selectedPlan) : []),
    [selectedPlan]
  );

  const getMealStyle = (ogunAdi) => {
    const name = String(ogunAdi ?? "").toLowerCase();
    if (name.includes("kahvaltı")) return { icon: <FiCoffee />, color: "#f59e0b", bg: "#fef3c7" };
    if (name.includes("öğle")) return { icon: <FiSun />, color: "#0ea5e9", bg: "#e0f2fe" };
    if (name.includes("akşam")) return { icon: <FiMoon />, color: "#8b5cf6", bg: "#ede9fe" };
    return { icon: <FiCheckCircle />, color: "#10b981", bg: "#d1fae5" };
  };

  return (
    <div className="page" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
      <h2 className="page-title" style={{ marginBottom: "25px", fontWeight: "800", color: "#1e4d3b" }}>
        Beslenme Planım
      </h2>

      {loading ? (
        <p style={{ color: "#64748b" }}>Planınız yükleniyor…</p>
      ) : error ? (
        <div className="card" style={{ padding: "20px", borderRadius: "16px", backgroundColor: "#fef2f2", color: "#991b1b" }}>
          {error}
        </div>
      ) : plans.length === 0 ? (
        <div className="card" style={{ padding: "24px", borderRadius: "16px", backgroundColor: "white", color: "#64748b" }}>
          Henüz diyetisyeninizden atanmış bir beslenme planı yok. Plan oluşturulduğunda burada görünecek.
        </div>
      ) : (
        <>
          <div
            style={{
              marginBottom: "24px",
              padding: "20px",
              borderRadius: "16px",
              backgroundColor: "white",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
            }}
          >
            {plans.length > 1 ? (
              <label style={{ display: "block", marginBottom: "12px", fontWeight: "700", color: "#334155" }}>
                Plan seçin
                <select
                  value={selectedPlanId ?? ""}
                  onChange={(e) => setSelectedPlanId(Number(e.target.value))}
                  style={{
                    display: "block",
                    marginTop: "8px",
                    width: "100%",
                    maxWidth: "420px",
                    padding: "10px 12px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "15px",
                  }}
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.planAdi || `Plan #${p.id}`}{" "}
                      {p.baslangicTarihi ? `(${p.baslangicTarihi})` : ""}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {selectedPlan ? (
              <div style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6 }}>
                <p style={{ margin: "0 0 6px 0", fontWeight: "700", color: "#1e4d3b", fontSize: "18px" }}>
                  {selectedPlan.planAdi || "Beslenme planı"}
                </p>
                {selectedPlan.dietitianFullName ? (
                  <p style={{ margin: "0 0 4px 0" }}>Diyetisyen: {selectedPlan.dietitianFullName}</p>
                ) : null}
                <p style={{ margin: 0 }}>
                  {selectedPlan.baslangicTarihi ? `Başlangıç: ${selectedPlan.baslangicTarihi}` : null}
                  {selectedPlan.bitisTarihi ? ` · Bitiş: ${selectedPlan.bitisTarihi}` : ""}
                </p>
              </div>
            ) : null}
          </div>

          {meals.length === 0 ? (
            <div className="card" style={{ padding: "20px", borderRadius: "16px", backgroundColor: "#fffbeb", color: "#92400e" }}>
              Bu planda henüz öğün detayı bulunmuyor (diyetisyen içerik eklediğinde burada listelenir).
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "25px",
              }}
            >
              {meals.map((meal) => {
                const style = getMealStyle(meal.ogun);

                return (
                  <div
                    key={meal.id}
                    className="card meal-card"
                    style={{
                      padding: "25px",
                      borderRadius: "20px",
                      backgroundColor: "white",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
                      borderLeft: `6px solid ${style.color}`,
                      transition: "transform 0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                        paddingBottom: "15px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <h3
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          fontSize: "20px",
                          color: "#1e4d3b",
                          margin: 0,
                          fontWeight: "800",
                        }}
                      >
                        <span style={{ color: style.color, display: "flex", alignItems: "center", fontSize: "24px" }}>
                          {style.icon}
                        </span>
                        {meal.ogun}
                      </h3>

                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "14px",
                          color: "#64748b",
                          fontWeight: "600",
                          backgroundColor: "#f8fafc",
                          padding: "6px 12px",
                          borderRadius: "10px",
                        }}
                      >
                        <FiClock size={16} /> {meal.saat}
                      </span>
                    </div>

                    <p style={{ color: "#334155", fontSize: "16px", lineHeight: "1.6", marginBottom: "20px", fontWeight: "500" }}>
                      {meal.yemek}
                    </p>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <div
                        style={{
                          fontWeight: "700",
                          color: style.color,
                          fontSize: "15px",
                          backgroundColor: style.bg,
                          padding: "8px 16px",
                          borderRadius: "12px",
                          display: "inline-block",
                        }}
                      >
                        {meal.kalori} kcal
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PlanPage;
