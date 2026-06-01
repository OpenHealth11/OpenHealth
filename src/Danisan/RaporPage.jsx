import React, { useMemo } from "react";
import { FiTrendingDown, FiDroplet, FiZap, FiTarget, FiPieChart, FiActivity } from "react-icons/fi";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";

function formatTrRange(fromStr, toStr) {
  if (!fromStr || !toStr) return null;
  const parse = (s) => {
    const [y, m, d] = String(s).slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  try {
    const from = parse(fromStr);
    const to = parse(toStr);
    const opts = { day: "numeric", month: "long", year: "numeric" };
    return `${from.toLocaleDateString("tr-TR", opts)} – ${to.toLocaleDateString("tr-TR", opts)}`;
  } catch {
    return `${fromStr} → ${toStr}`;
  }
}

function RaporPage({ rapor, kayitlar = [], water }) {
  
  const { kaloriData, suData } = useMemo(() => {
    const rawKData = [];
    const rawSData = [];
    const guvenliKayitlar = Array.isArray(kayitlar) ? kayitlar : [];

    const bugun = new Date();
    const bugunkuSu = Number(water?.icilen) || 0;
    console.log("Rapor water:", water, "bugunkuSu:", bugunkuSu);

    // Son 7 günü hesaplayıp listeye ekliyoruz
    for (let i = 6; i >= 0; i--) {
      const d = new Date(bugun);
      d.setDate(d.getDate() - i);
      const tarihStr = d.toISOString().split('T')[0];
      const gunAdi = d.toLocaleDateString("tr-TR", { weekday: 'short' }); 

      const oGunkiToplamKalori = guvenliKayitlar
        .filter(kayit => kayit.tarih === tarihStr && kayit.kind !== "activity")
        .reduce((toplam, kayit) => toplam + Number(kayit.kalori || 0), 0);

      rawKData.push({ gun: gunAdi, kalori: oGunkiToplamKalori });
      rawSData.push({ gun: gunAdi, bardak: (i === 0) ? bugunkuSu : 0 });
    }

    return { kaloriData: rawKData, suData: rawSData };
  }, [kayitlar,water]);

  if (!rapor) {
    return (
      <div className="page" style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "#64748b" }}>Rapor verileri hazırlanıyor...</p>
      </div>
    );
  }

  return (
    <div className="page" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
      
      {/* Üst Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "35px" }}>
        <div>
          <h2 style={{ fontSize: "28px", fontWeight: "900", color: "#1e4d3b", margin: 0 }}>Haftalık Analiz</h2>
          <p style={{ color: "#64748b", margin: "5px 0 0 0", fontWeight: "500" }}>
            Son {rapor.days ?? 7} günlük performansının özeti.
          </p>
        </div>
        <div style={{ backgroundColor: "white", padding: "10px 20px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "10px" }}>
          <FiPieChart color="#10b981" />
          <span style={{ fontWeight: "700", color: "#1e4d3b", fontSize: "14px" }}>
            {formatTrRange(rapor.periodFrom, rapor.periodTo) ?? `Son ${rapor.days ?? 7} gün`}
          </span>
        </div>
      </div>

      {/* Üst Kartlar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "25px", marginBottom: "30px" }}>
        <div className="card" style={{ padding: "30px", borderRadius: "24px", backgroundColor: "white", borderLeft: "6px solid #f59e0b" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <h3 style={{ fontSize: "14px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>Ortalama Kalori</h3>
              <p style={{ fontSize: "28px", fontWeight: "900", color: "#1e4d3b", margin: 0 }}>{rapor.ortalamaKalori || 0} <span style={{ fontSize: "14px", fontWeight: "600", color: "#94a3b8" }}>kcal</span></p>
            </div>
            <div style={{ backgroundColor: "#fef3c7", padding: "12px", borderRadius: "14px", color: "#f59e0b" }}><FiZap size={24} /></div>
          </div>
        </div>

        <div className="card" style={{ padding: "30px", borderRadius: "24px", backgroundColor: "white", borderLeft: "6px solid #0ea5e9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <h3 style={{ fontSize: "14px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>Su Ortalaması</h3>
              <p style={{ fontSize: "28px", fontWeight: "900", color: "#1e4d3b", margin: 0 }}>{rapor.suOrtalama || 0} <span style={{ fontSize: "14px", fontWeight: "600", color: "#94a3b8" }}>Bardak</span></p>
            </div>
            <div style={{ backgroundColor: "#e0f2fe", padding: "12px", borderRadius: "14px", color: "#0ea5e9" }}><FiDroplet size={24} /></div>
          </div>
        </div>

        <div className="card" style={{ padding: "30px", borderRadius: "24px", backgroundColor: "white", borderLeft: "6px solid #ef4444" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <h3 style={{ fontSize: "14px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>Kilo Değişimi</h3>
              <p style={{ fontSize: "28px", fontWeight: "900", color: "#1e4d3b", margin: 0 }}>{rapor.kiloDegisim || "-"}</p>
            </div>
            <div style={{ backgroundColor: "#fee2e2", padding: "12px", borderRadius: "14px", color: "#ef4444" }}><FiTrendingDown size={24} /></div>
          </div>
        </div>

        <div className="card" style={{ padding: "30px", borderRadius: "24px", backgroundColor: "white", borderLeft: "6px solid #10b981" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <h3 style={{ fontSize: "14px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>Programa Uyum</h3>
              <p style={{ fontSize: "28px", fontWeight: "900", color: "#1e4d3b", margin: 0 }}>%{rapor.uyumOrani || 0}</p>
            </div>
            <div style={{ backgroundColor: "#dcfce7", padding: "12px", borderRadius: "14px", color: "#10b981" }}><FiTarget size={24} /></div>
          </div>
        </div>
      </div>

      {/* GRAFİKLER BÖLÜMÜ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "25px", marginTop: "30px" }}>
        
        {/* DİNAMİK KALORİ GRAFİĞİ */}
        <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <FiActivity color="#f59e0b" size={20} />
            <h3 style={{ margin: 0, color: "#1e4d3b", fontSize: "16px" }}>Haftalık Kalori Değişimi</h3>
          </div>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={kaloriData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="gun" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}
                  itemStyle={{ color: "#f59e0b", fontWeight: "bold" }}
                  formatter={(value) => [`${value} kcal`, "Toplam Kalori"]}
                />
                <Line type="monotone" dataKey="kalori" stroke="#f59e0b" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SU GRAFİĞİ */}
        <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <FiDroplet color="#0ea5e9" size={20} />
            <h3 style={{ margin: 0, color: "#1e4d3b", fontSize: "16px" }}>Haftalık Su Tüketimi</h3>
          </div>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={suData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="gun" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}
                  itemStyle={{ color: "#0ea5e9", fontWeight: "bold" }}
                  formatter={(value) => [`${value} Bardak`, "İçilen Su"]}
                />
                <Bar dataKey="bardak" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Alt Bilgi */}
      <div style={{ marginTop: "30px", padding: "25px", backgroundColor: "white", borderRadius: "24px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ minWidth: "50px", height: "50px", backgroundColor: "#f1f5f9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", color: "#1e4d3b" }}>
          D
        </div>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px", fontStyle: "italic" }}>
          "Harika bir hafta geçirdin! Kalori dengeni koruman çok önemli. Su tüketimine de bu şekilde devam edelim."
        </p>
      </div>

    </div>
  );
}

export default RaporPage;