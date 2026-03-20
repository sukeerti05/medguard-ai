const VisitTimeline = ({ visits }) => {
  return (
    <div>
      <h2>Medical History Timeline</h2>
      {visits.map(v => (
        <div key={v._id}>
          📅 {new Date(v.visit_date).toDateString()} – {v.doctor_name}
        </div>
      ))}
    </div>
  );
};

export default VisitTimeline;