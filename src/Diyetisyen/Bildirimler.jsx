function Bildirimler({ bildirimler }) {
  return (
    <div className="dy-page">
      <h2 className="dy-page-title">Bildirimler</h2>

      <div className="dy-card">
        <div className="dy-list">
          {bildirimler.map((item) => (
            <div className="dy-list-item" key={item.id}>
              <div>
                <strong>{item.mesaj}</strong>
                <p>{item.saat}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default Bildirimler;