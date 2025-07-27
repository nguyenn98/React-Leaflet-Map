import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-polylinedecorator";

const RoutingMachine = ({ from, to, mode, onRouteInfo }) => {
  const map = useMap();
  const routingControlRef = useRef(null);
  const polylineRef = useRef(null);
  const decoratorRef = useRef(null);

  useEffect(() => {
    if (!from || !to || !map) return;

    // Xóa các lớp cũ nếu có
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
    }
    if (decoratorRef.current) {
      map.removeLayer(decoratorRef.current);
    }

    const profileMap = {
      car: "driving",
      bus: "driving",
      walk: "walking",
      bike: "cycling",
    };
    const selectedProfile = profileMap[mode] || "driving";

    const control = L.Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      routeWhileDragging: true, // Cho phép kéo điểm
      draggableWaypoints: true,
      addWaypoints: false,
      createMarker: (i, waypoint, n) => {
        const isStart = i === 0;
        const iconHtml = isStart
          ? `<div style="font-size: 24px; color: #1976d2;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5
                  c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5
                  14.5 7.62 14.5 9 13.38 11.5 12 11.5z"/>
              </svg>
            </div>`
          : `<div style="display: flex; flex-direction: column; align-items: center; font-size: 22px; color: #ff6600;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 4.25 4 9.44 6.17 11.91.41.48 1.25.48 1.66 0
                  C15 18.44 19 13.25 19 9c0-3.87-3.13-7-7-7zm0 9.5
                  c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5
                  14.5 7.62 14.5 9 13.38 11.5 12 11.5z"/>
              </svg>
              <div style="width: 28px; height: 4px; background-color: #ff6600; margin-top: -1px; border-radius: 2px;"></div>
            </div>`;

        return L.marker(waypoint.latLng, {
          icon: L.divIcon({
            className: "",
            html: iconHtml,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          }),
          draggable: true,
        });
      },
      lineOptions: {
        styles: [{ color: "transparent" }],
      },
      router: L.Routing.osrmv1({
        serviceUrl: "http://localhost:5000/route/v1",
        profile: selectedProfile,
        useHints: false,
      }),
    }).addTo(map);

    const drawRoute = (e) => {
      const route = e.routes[0];
      const coordinates = route.coordinates;

      if (polylineRef.current) map.removeLayer(polylineRef.current);
      if (decoratorRef.current) map.removeLayer(decoratorRef.current);

      const polyline = L.polyline(coordinates, {
        color: "#08eb5fab",
        weight: 6,
        opacity: 0.9,
      }).addTo(map);
      polylineRef.current = polyline;

      const decorator = L.polylineDecorator(polyline, {
        patterns: [
          {
            offset: 40,
            repeat: 80,
            symbol: L.Symbol.arrowHead({
              pixelSize: 10,
              polygon: false,
              pathOptions: { stroke: true, color: "#ff6600", weight: 2 },
            }),
          },
        ],
      }).addTo(map);
      decoratorRef.current = decorator;

      // ⚠️ Fix thời gian nếu không phải ô tô
      let adjustedTime = route.summary.totalTime;
      if (mode === "bus") adjustedTime *= 1.5;
      else if (mode === "walk") adjustedTime *= 4.0;
      else if (mode === "bike") adjustedTime *= 2.0;

      if (onRouteInfo) {
        onRouteInfo({
          distance: route.summary.totalDistance,
          time: adjustedTime,
          steps: route.instructions.map((s) => ({
            text: s.text,
            distance: s.distance,
            time: s.time,
            latlng: coordinates[s.index],
          })),
        });
      }
    };

    control.on("routesfound", drawRoute);

    routingControlRef.current = control;

    return () => {
      if (routingControlRef.current) map.removeControl(routingControlRef.current);
      if (polylineRef.current) map.removeLayer(polylineRef.current);
      if (decoratorRef.current) map.removeLayer(decoratorRef.current);
      routingControlRef.current = null;
      polylineRef.current = null;
      decoratorRef.current = null;
    };
  }, [map, from, to, mode, onRouteInfo]);

  return null;
};

export default RoutingMachine;
