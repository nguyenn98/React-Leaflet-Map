// BusPolylineLayer.jsx
// import { Polyline } from "react-leaflet";

// const BusPolylineLayer = ({ busRoutes }) => {
//   if (!busRoutes || busRoutes.length === 0) return null;

//   return (
//     <>
//       {busRoutes.map((route) => (
//         <Polyline
//           key={route.id}
//           positions={route.coordinates}
//           color={route.color || "#3366cc"}
//           weight={5}
//           opacity={0.8}
//         />
//       ))}
//     </>
//   );
// };

// export default BusPolylineLayer;

import { Polyline } from "react-leaflet";

const BusPolylineLayer = ({ busRoutes }) => {
  if (!busRoutes || busRoutes.length === 0) return null;

  return (
    <>
      {busRoutes.map((route, idx) => {
        if (route.type === "trip") {
          // Trường hợp đi 1 tuyến thẳng
          return (
            <Polyline
              key={`trip-${idx}`}
              positions={route.polyline}
              color={route.color || "#3366cc"}
              weight={5}
              opacity={0.8}
            />
          );
        } else if (route.type === "transfer" && route.parts) {
          // Trường hợp phải đổi tuyến → có 2 đoạn polyline
          return route.parts.map((part, pIdx) => (
            <Polyline
              key={`transfer-${idx}-${pIdx}`}
              positions={part.polyline}
              color={pIdx === 0 ? "#cc3333" : "#33aa33"} // màu khác để dễ phân biệt 2 tuyến
              weight={5}
              opacity={0.8}
            />
          ));
        } else {
          return null;
        }
      })}
    </>
  );
};

export default BusPolylineLayer;
