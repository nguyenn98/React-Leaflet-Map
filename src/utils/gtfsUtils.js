import Papa from "papaparse";
import * as turf from '@turf/turf';

/**
 * Trả về các tuyến xe buýt gần đoạn đường A–B.
 * @param {Array} allRoutes - Mảng các tuyến xe buýt với coordinates.
 * @param {Array} routeCoords - Đường A–B dạng mảng [[lat, lng], ...]
 * @param {number} maxDistanceMeters - Khoảng cách tối đa (m)
 */
export function filterBusRoutesNearPath(allRoutes, routeCoords, maxDistanceMeters = 200) {
  const pathLine = turf.lineString(routeCoords.map(([lat, lng]) => [lng, lat])); // Đổi [lat, lng] -> [lng, lat]

  return allRoutes.filter(route => {
    if (!route.coordinates || route.coordinates.length < 2) return false;

    const routeLine = turf.lineString(route.coordinates.map(([lat, lng]) => [lng, lat]));

    const distance = turf.pointToLineDistance(
      turf.center(routeLine),
      pathLine,
      { units: 'meters' }
    );

    return distance <= maxDistanceMeters;
  });
}

export async function loadGtfsFile(filename) {
  const response = await fetch(`/gtfs/${filename}`);
  const csvText = await response.text();

  return Papa.parse(csvText, { header: true, skipEmptyLines: true }).data;
}

export async function loadAllGtfs() {
  const [routes, stops, trips, stopTimes, calendar] = await Promise.all([
    loadGtfsFile("routes.txt"),
    loadGtfsFile("stops.txt"),
    loadGtfsFile("trips.txt"),
    loadGtfsFile("stop_times.txt"),
    loadGtfsFile("calendar.txt"),
  ]);
  return { routes, stops, trips, stopTimes, calendar };
}

export function getRouteCoordinates(routeId, routes, stops, trips, stopTimes) {
  const routeTrips = trips.filter((t) => t.route_id === routeId);

  if (routeTrips.length === 0) return [];

  const tripId = routeTrips[0].trip_id;

  const stopsForTrip = stopTimes
    .filter((st) => st.trip_id === tripId)
    .sort((a, b) => Number(a.stop_sequence) - Number(b.stop_sequence));

  const coordinates = stopsForTrip
    .map(({ stop_id }) => {
      const stop = stops.find((s) => s.stop_id === stop_id);
      return stop ? [Number(stop.stop_lat), Number(stop.stop_lon)] : null;
    })
    .filter(Boolean);

  return coordinates;
}
