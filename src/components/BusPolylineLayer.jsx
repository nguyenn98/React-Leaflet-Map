import { Polyline } from "react-leaflet";

const BusPolylineLayer = ({ busRoutes }) => {
  if (!busRoutes || busRoutes.length === 0) return null;

  return (
    <>
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

export default BusPolylineLayer;
