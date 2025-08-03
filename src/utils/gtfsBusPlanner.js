import * as turf from '@turf/turf';
import Papa from 'papaparse';

// ----------------- Load GTFS -----------------

export async function loadGtfsFile(filename) {
  const response = await fetch(`/gtfs/${filename}`);
  const text = await response.text();
  return Papa.parse(text, { header: true, skipEmptyLines: true }).data;
}

export async function loadGtfsData() {
  const [routes, stops, trips, stopTimes] = await Promise.all([
    loadGtfsFile("routes.txt"),
    loadGtfsFile("stops.txt"),
    loadGtfsFile("trips.txt"),
    loadGtfsFile("stop_times.txt")
  ]);
  return { routes, stops, trips, stopTimes };
}

// ----------------- Tìm bến gần nhất -----------------

export function findNearestStop(point, stops) {
  let minDist = Infinity;
  let nearest = null;

  for (const stop of stops) {
    const dist = turf.distance(
      turf.point([point[1], point[0]]),
      turf.point([+stop.stop_lon, +stop.stop_lat]),
      { units: "meters" }
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = stop;
    }
  }

  return nearest;
}

// ----------------- Tìm tuyến đi qua 2 bến -----------------

export function findRoutesBetweenStops(startStopId, endStopId, trips, stopTimes) {
  const tripMap = {};

  for (const st of stopTimes) {
    if (!tripMap[st.trip_id]) tripMap[st.trip_id] = [];
    tripMap[st.trip_id].push(st.stop_id);
  }

  const validTripIds = Object.entries(tripMap)
    .filter(([_, stopIds]) => {
      const i1 = stopIds.indexOf(startStopId);
      const i2 = stopIds.indexOf(endStopId);
      return i1 !== -1 && i2 !== -1 && i1 < i2;
    })
    .map(([tripId]) => tripId);

  const routeIds = new Set(trips.filter(t => validTripIds.includes(t.trip_id)).map(t => t.route_id));
  return Array.from(routeIds);
}

// ----------------- Lấy toạ độ tuyến -----------------

export function getRouteCoordinates(routeId, routes, stops, trips, stopTimes) {
  const routeTrips = trips.filter((t) => t.route_id === routeId);
  if (routeTrips.length === 0) return [];

  const tripId = routeTrips[0].trip_id;

  const stopsForTrip = stopTimes
    .filter((st) => st.trip_id === tripId)
    .sort((a, b) => Number(a.stop_sequence) - Number(b.stop_sequence));

  const coordinates = stopsForTrip.map(({ stop_id }) => {
    const stop = stops.find((s) => s.stop_id === stop_id);
    return stop ? [Number(stop.stop_lat), Number(stop.stop_lon)] : null;
  }).filter(Boolean);

  return coordinates;
}
