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

  // Ví dụ: "04" + direction_id
  const match = route.routeId.match(/^(\d+)([A-Z]*)?$/); 
  if (match) {
    const routeNumber = match[1];   // "04"
    const suffix = match[2] || "";  // "B" nếu có
    const direction =
      route.directionId === "1" ? " (Chiều về)" : " (Chiều đi)";
    return `Tuyến ${parseInt(routeNumber, 10)}${suffix}${direction}`;
  }

  return route.routeId;
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
            {getFriendlyRouteName(r)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BusRouteSelector;

