// components/RouteResults.jsx
import { MdDirectionsTransit, MdDirectionsWalk } from "react-icons/md";

const RouteResults = ({ routes, onSelect }) => {
  if (!routes || routes.length === 0) {
    return <div style={{ color: "#666", fontSize: "14px", marginTop: "8px" }}>
      Không tìm thấy tuyến phù hợp
    </div>;
  }

  return (
    <div style={{
      marginTop: "12px",
      background: "#fff",
      borderRadius: "8px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      padding: "8px",
      maxHeight: "200px",
      overflowY: "auto"
    }}>
      {routes.map((r, idx) => (
        <div
          key={idx}
          onClick={() => onSelect(r)}
          style={{
            padding: "8px",
            borderBottom: "1px solid #eee",
            cursor: "pointer"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <MdDirectionsTransit size={18} color="#1976d2" />
            <span style={{ fontWeight: 500 }}>
              {r.route_name || `Phương án ${idx + 1}`}
            </span>
          </div>
          <div style={{ fontSize: "13px", color: "#555", marginTop: "2px" }}>
            ⏱ {Math.round(r.time / 60)} phút &nbsp; • &nbsp;
            {r.price ? `${r.price}đ` : "12.000đ"}
          </div>
          <div style={{ fontSize: "12px", color: "#777" }}>
            Tuyến: {r.steps?.map(s => s.route).join(" → ")}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RouteResults;
