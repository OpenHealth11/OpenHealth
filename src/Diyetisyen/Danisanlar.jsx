function Danisanlar({ danisanlar }) {
  return (
    <div className="dy-page">
      <h2 className="dy-page-title">Danışanlar</h2>

      <div className="dy-table-card dy-card">
        <table className="dy-table">
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>Yaş</th>
              <th>Kilo</th>
              <th>Hedef</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {danisanlar.map((item) => (
              <tr key={item.id}>
                <td>{item.fullName}</td>
                <td>{item.yas}</td>
                <td>{item.kilo} kg</td>
                <td>{item.hedef} kg</td>
                <td>
                  <span
                    className={`dy-status ${
                      item.durum === "Aktif" ? "active" : "passive"
                    }`}
                  >
                    {item.durum}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default Danisanlar;
