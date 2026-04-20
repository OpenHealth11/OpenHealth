function PlanPage({ meals }) {
  return (
    <div className="page">
      <h2 className="page-title">Beslenme Planım</h2>

      <div className="meal-grid">
        {meals.map((meal) => (
          <div className="card meal-card" key={meal.id}>
            <div className="meal-top">
              <h3>{meal.ogun}</h3>
              <span>{meal.saat}</span>
            </div>
            <p>{meal.yemek}</p>
            <div className="meal-calorie">{meal.kalori} kcal</div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default PlanPage;