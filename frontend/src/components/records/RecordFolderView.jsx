const categories = ["MRI", "Blood Test", "CT Scan", "X-Ray"];

const RecordFolderView = ({ records }) => {
  return (
    <div>
      {categories.map(cat => (
        <div key={cat}>
          <h2>📂 {cat}</h2>
          {records.filter(r => r.category === cat)
            .map(r => (
              <div key={r._id} style={{ border:"1px solid #ccc", margin:"5px", padding:"10px" }}>
                📄 {r.test_name} – {new Date(r.test_date).toDateString()}
              </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default RecordFolderView;