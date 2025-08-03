// import { Polyline } from "react-leaflet";

// const BusMap = ({ busRoutes, allRoutes, onSelectRoute }) => {
//     if (!busRoutes || busRoutes.length === 0) return null;

//     console.log("📌 BusMap received:", busRoutes);
//     busRoutes.forEach((r) => {
//         console.log(`Route ${r.id}: ${r.coordinates?.length} points`);
//     });

//     return (
//         <>
//             <select
//                 onChange={(e) => {
//                     const selectedId = e.target.value;
//                     if (selectedId === "") {
//                         onSelectRoute(null); // hiện tất cả
//                     } else {
//                         const selectedRoute = allRoutes.find(r => r.id === selectedId);
//                         if (selectedRoute) {
//                             onSelectRoute(selectedRoute);
//                         }
//                     }
//                 }}
//                 style={{
//                     position: "absolute",
//                     top: 10,
//                     right: 10,
//                     zIndex: 1000,
//                     padding: "4px 8px",
//                 }}
//             >
//                 <option value="">Chọn tuyến</option>
//                 {allRoutes.map((r) => (
//                     <option key={r.id} value={r.id}>
//                         {r.name || `Tuyến ${r.id}`}
//                     </option>
//                 ))}
//             </select>

//             {busRoutes.map((route) => (
//                 <Polyline
//                     key={route.id}
//                     positions={route.coordinates}
//                     color={route.color || "blue"}
//                     weight={5}
//                     opacity={0.8}
//                 />
//             ))}
//         </>
//     );
// };

// export default BusMap;



import { Polyline } from "react-leaflet";

const BusMap = ({ busRoutes, allRoutes, onSelectRoute }) => {
  if (!busRoutes || busRoutes.length === 0) return null;

  return (
    <>
      <select
        onChange={(e) => {
          const selectedId = e.target.value;
          if (selectedId === "") {
            onSelectRoute(null);
          } else {
            const selectedRoute = allRoutes.find((r) => r.id === selectedId);
            if (selectedRoute) {
              onSelectRoute(selectedRoute);
            }
          }
        }}
        style={{
          position: "absolute",
          top: "70px", // Đẩy xuống thấp hơn header/map controls
          right: "20px",
          zIndex: 2000, // Cao hơn cả bản đồ và control khác
          padding: "6px 10px",
          fontSize: "14px",
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: "6px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          cursor: "pointer",
        }}
      >
        <option value="">🚌 Chọn tuyến xe buýt</option>
        {allRoutes.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name || `Tuyến ${r.id}`}
          </option>
        ))}
      </select>


      {busRoutes.map((route) => (
        <Polyline
          key={route.id}
          positions={route.coordinates}
          color={route.color || "#3366cc"}
          weight={5}
          opacity={0.8}
        />
      ))}
    </>
  );
};

export default BusMap;

