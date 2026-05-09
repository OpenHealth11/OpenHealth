export default function DiyetisyenTopbar({ fullName }) {
  return (
    <header style={{ 
      height: "80px", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "flex-end", 
      padding: "0 40px",
      backgroundColor: "transparent"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#1e4d3b" }}>{fullName}</p>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Uzman Diyetisyen</span>
        </div>
        <div style={{ 
          width: "45px", height: "45px", backgroundColor: "white", 
          borderRadius: "12px", display: "flex", alignItems: "center", 
          justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
          color: "#1e4d3b", fontWeight: "800"
        }}>
          {fullName ? fullName[0] : "D"}
        </div>
      </div>
    </header>
  );
}