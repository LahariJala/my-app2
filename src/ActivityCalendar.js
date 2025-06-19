import React, { useState } from "react";

const ActivityCalendar = ({ activities, onClose }) => {
  const [activityList, setActivityList] = useState(activities || []);
  const [editIndex, setEditIndex] = useState(null);
  const [editedActivity, setEditedActivity] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleDelete = (index) => {
    const updated = [...activityList];
    updated.splice(index, 1);
    setActivityList(updated);
    localStorage.setItem("farmActivities", JSON.stringify(updated));
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditedActivity(activityList[index].activity);
  };

  const handleSaveEdit = (index) => {
    const updated = [...activityList];
    updated[index].activity = editedActivity;
    setActivityList(updated);
    localStorage.setItem("farmActivities", JSON.stringify(updated));
    setEditIndex(null);
  };

  const renderSection = (title, filterFn) => {
    const filtered = activityList.filter(filterFn);

    return (
      <div style={{ marginBottom: "20px" }}>
        <h4>{title}</h4>
        {filtered.length === 0 ? (
          <p>No {title.toLowerCase()}.</p>
        ) : (
          filtered.map((item, index) => (
            <div
              key={index}
              style={{
                marginBottom: "10px",
                borderBottom: "1px solid #ccc",
                paddingBottom: "8px",
              }}
            >
              <p><strong>📅 Date:</strong> {item.date}</p>
              <p><strong>📍 Location:</strong> {item.locationName || "Unknown"}</p>
              {editIndex === index ? (
                <>
                  <input
                    type="text"
                    value={editedActivity}
                    onChange={(e) => setEditedActivity(e.target.value)}
                    style={{ width: "100%", padding: "6px" }}
                  />
                  <button onClick={() => handleSaveEdit(index)} style={{ marginRight: "6px" }}>💾 Save</button>
                  <button onClick={() => setEditIndex(null)}>❌ Cancel</button>
                </>
              ) : (
                <>
                  <p><strong>📝 Activity:</strong> {item.activity}</p>
                  <button onClick={() => handleEdit(index)} style={{ marginRight: "6px" }}>✏️ Edit</button>
                  <button onClick={() => handleDelete(index)}>🗑️ Delete</button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        left: 20,
        width: "340px",
        maxHeight: "80vh",
        overflowY: "auto",
        background: "#fefefe",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 0 12px rgba(0,0,0,0.2)",
        zIndex: 1000,
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header with close button */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px",
      }}>
        <h3 style={{ margin: 0 }}>📖 Farm Activities</h3>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            color: "#e74c3c"
          }}
          aria-label="Close"
        >
          ✖
        </button>
      </div>

      {/* Sections */}
      {renderSection("Past Activities", (a) => a.date < today)}
      {renderSection("Upcoming Activities", (a) => a.date >= today)}
    </div>
  );
};

export default ActivityCalendar;
