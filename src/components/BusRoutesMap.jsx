import React, { useEffect, useState } from "react";
import { loadAllGtfs, getRouteCoordinates } from "../utils/parseGtfs";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";

const BusRoutesMap = () => {
  const [gtfsData, setGtfsData] = useState(null);

  useEffect(() => {
    loadAllGtfs().then(setGtfsData);
  }, []);

  if (!gtfsData) return <div>Loading...</div>;

  return (
    <MapContainer center={[21.0285, 105.8542]} zoom={12} style={{ height: "100vh" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {gtfsData.routes.map((route) => {
        const coords = getRouteCoordinates(route.route_id, gtfsData.routes, gtfsData.stops, gtfsData.trips, gtfsData.stopTimes);
        return <Polyline key={route.route_id} positions={coords} color="blue" />;
      })}
    </MapContainer>
  );
};

export default BusRoutesMap;
