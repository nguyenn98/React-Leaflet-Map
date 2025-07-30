import Papa from "papaparse";

// Hàm load file GTFS (đường dẫn đến public/gtfs/)
export async function loadGtfsFile(filename) {
  const response = await fetch(`/gtfs/${filename}`);
  const csvText = await response.text();

  return Papa.parse(csvText, { header: true, skipEmptyLines: true }).data;
}

// Hàm load tất cả dữ liệu GTFS cần thiết
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

// Hàm đơn giản nối dữ liệu để lấy tuyến bus với dãy điểm toạ độ
export function getRouteCoordinates(routeId, routes, stops, trips, stopTimes) {
  // Lọc trips theo routeId
  const routeTrips = trips.filter((t) => t.route_id === routeId);

  if (routeTrips.length === 0) return [];

  // Lấy trip đầu tiên (đơn giản)
  const tripId = routeTrips[0].trip_id;

  // Lọc stopTimes theo trip_id, sắp xếp theo stop_sequence
  const stopsForTrip = stopTimes
    .filter((st) => st.trip_id === tripId)
    .sort((a, b) => Number(a.stop_sequence) - Number(b.stop_sequence));

  // Map toạ độ trạm
  const coordinates = stopsForTrip.map(({ stop_id }) => {
    const stop = stops.find((s) => s.stop_id === stop_id);
    return stop ? [Number(stop.stop_lat), Number(stop.stop_lon)] : null;
  }).filter(Boolean);

  return coordinates;
}
