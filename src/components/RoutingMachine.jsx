import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

const RoutingMachine = ({ from, to, mode, onRouteInfo }) => {
  const map = useMap();
  const routingControlRef = useRef(null);
  const prevFromRef = useRef(null);
  const prevToRef = useRef(null);
  const prevModeRef = useRef(null);

  useEffect(() => {
    if (!from || !to || !map) return;

    // Kiểm tra xem tọa độ hoặc mode có thay đổi không
    const fromChanged = !prevFromRef.current || from[0] !== prevFromRef.current[0] || from[1] !== prevFromRef.current[1];
    const toChanged = !prevToRef.current || to[0] !== prevToRef.current[0] || to[1] !== prevToRef.current[1];
    const modeChanged = prevModeRef.current !== mode;

    if (!fromChanged && !toChanged && !modeChanged) {
      return; // Không làm gì nếu không có thay đổi
    }

    // Cập nhật giá trị trước đó
    prevFromRef.current = from;
    prevToRef.current = to;
    prevModeRef.current = mode;

    // Xóa tuyến đường cũ nếu có
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    // Ánh xạ mode sang profile hợp lệ của OSRM
    const profileMap = {
      car: "driving",
      bus: "driving",
      walk: "walking",
      bike: "cycling",
    };

    // Đảm bảo mode hợp lệ
    const selectedProfile = profileMap[mode] || "driving";

    // Kiểm tra tọa độ hợp lệ
    if (
      isNaN(from[0]) || isNaN(from[1]) || from[0] < -90 || from[0] > 90 || from[1] < -180 || from[1] > 180 ||
      isNaN(to[0]) || isNaN(to[1]) || to[0] < -90 || to[0] > 90 || to[1] < -180 || to[1] > 180
    ) {
      console.error("Tọa độ không hợp lệ:", { from, to });
      return;
    }

    const control = L.Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      routeWhileDragging: false,
      createMarker: () => null,
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        profile: selectedProfile,
        useHints: false,
      }),
    }).addTo(map);

    control.on("routesfound", function (e) {
      const route = e.routes[0];
      const steps = route.instructions || [];

      onRouteInfo({
        distance: route.summary.totalDistance,
        time: route.summary.totalTime,
        steps: steps.map((s) => ({
          text: s.text,
          distance: s.distance,
          time: s.time,
        })),
      });
    });

    routingControlRef.current = control;

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [map, from, to, mode, onRouteInfo]);

  return null;
};

export default RoutingMachine;