// const getFriendlyRouteName = (route) => {
//   if (!route || !route.id) return "Tuyến không rõ";

//   const match = route.id.match(/Route_(\d+)_?(\d+)?/);
//   if (match) {
//     const routeNumber = match[1];
//     const direction = match[2] === "2" ? " (Chiều về)" : " (Chiều đi)";
//     return `Tuyến ${routeNumber}${match[2] ? direction : ""}`;
//   }

//   return route.name || route.id;
// };

// const BusRouteSelector = ({ allRoutes, onSelectRoute }) => {
//   return (
//     <div
//       style={{
//         position: "absolute",
//         top: "70px",
//         right: "20px",
//         zIndex: 2000,
//         pointerEvents: "auto",
//       }}
//     >
//       <select
//         onChange={(e) => {
//           const selectedId = e.target.value;
//           if (selectedId === "") {
//             onSelectRoute(null);
//           } else {
//             const selectedRoute = allRoutes.find((r) => r.id === selectedId);
//             if (selectedRoute) {
//               onSelectRoute(selectedRoute);
//             }
//           }
//         }}
//         style={{
//           padding: "6px 10px",
//           fontSize: "14px",
//           backgroundColor: "white",
//           border: "1px solid #ccc",
//           borderRadius: "6px",
//           boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
//           cursor: "pointer",
//         }}
//       >
//         <option value="">🚌 Chọn tuyến xe buýt</option>
//         {allRoutes.map((r) => (
//           <option key={r.id} value={r.id}>
//             {getFriendlyRouteName(r)}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// };

// export default BusRouteSelector;


const getFriendlyRouteName = (route) => {
  if (!route || !route.routeId) return "Tuyến không rõ";

  // Match cả dạng "01_1", "BRT01_2", "09CT_1"...
  const match = route.routeId.match(/^([A-Za-z0-9]+)_(\d)$/);
  if (match) {
    const routeNumber = match[1];   // "01", "BRT01", "09CT"
    const direction = match[2] === "2" ? " (Chiều về)" : " (Chiều đi)";
    return `Tuyến ${routeNumber}${direction}`;
  }

  return route.routeId; // fallback nếu không match
};

const BusRouteSelector = ({ allRoutes, onSelectRoute }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "70px",
        right: "20px",
        zIndex: 2000,
        pointerEvents: "auto",
      }}
    >
      <select
        defaultValue=""
        onChange={(e) => {
          const selectedId = e.target.value;
          if (!selectedId) {
            onSelectRoute(null);
          } else {
            const selectedRoute = allRoutes.find((r) => r.routeId === selectedId);
            if (selectedRoute) onSelectRoute(selectedRoute);
          }
        }}
        style={{
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
          <option key={r.routeId} value={r.routeId}>
            {getFriendlyRouteName(r)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BusRouteSelector;
