const fs = require("fs");
const fetch = require("node-fetch");

const DATA_DIR = "./public/gtfs";
const OSRM_URL = "http://localhost:5000/route/v1/driving"; // OSRM local

function loadCsv(path) {
  const lines = fs.readFileSync(path, "utf8").trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map(line => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((h, i) => [h.trim(), values[i]?.trim()]));
  });
}

function saveCsv(path, data) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const lines = [headers.join(",")];
  for (const row of data) {
    lines.push(headers.map(h => row[h]).join(","));
  }
  fs.writeFileSync(path, lines.join("\n"));
}

async function fetchRoute(coords) {
  const coordStr = coords.map(c => `${c[1]},${c[0]}`).join(";");
  const url = `${OSRM_URL}/${coordStr}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
  const json = await res.json();
  return json.routes[0]?.geometry?.coordinates || [];
}

async function generateShapes() {
  const stops = loadCsv(`${DATA_DIR}/stops.txt`);
  const stopTimes = loadCsv(`${DATA_DIR}/stop_times.txt`);
  const trips = loadCsv(`${DATA_DIR}/trips.txt`);

  const stopsMap = Object.fromEntries(stops.map(s => [s.stop_id, s]));

  let shapes = [];
  let tripsWithShape = [];

  let shapeCounter = 1;

  for (const [idx, trip] of trips.entries()) {
    console.log(`🚌 Đang xử lý trip ${trip.trip_id} (${idx + 1}/${trips.length})`);

    const tripStops = stopTimes
      .filter(st => st.trip_id === trip.trip_id)
      .sort((a, b) => parseInt(a.stop_sequence) - parseInt(b.stop_sequence));

    if (tripStops.length < 2) continue;

    const coords = tripStops
      .map(st => stopsMap[st.stop_id])
      .filter(Boolean)
      .map(s => [parseFloat(s.stop_lat), parseFloat(s.stop_lon)]);

    try {
      const routeCoords = await fetchRoute(coords);
      const shapeId = `shape_${shapeCounter++}`;
      tripsWithShape.push({ ...trip, shape_id: shapeId });

      let seq = 1;
      for (const [lon, lat] of routeCoords) {
        shapes.push({
          shape_id: shapeId,
          shape_pt_lat: lat,
          shape_pt_lon: lon,
          shape_pt_sequence: seq++,
        });
      }

      console.log(`✅ Trip ${trip.trip_id} OK, ${routeCoords.length} điểm`);
    } catch (e) {
      console.error(`❌ Lỗi trip ${trip.trip_id}: ${e.message}`);
    }

    // Ghi cache tạm sau mỗi trip (phòng crash)
    saveCsv(`${DATA_DIR}/shapes_generated.txt`, shapes);
    saveCsv(`${DATA_DIR}/trips_with_shape_id.txt`, tripsWithShape);
  }

  console.log("🎉 Hoàn tất generate-shapes-multistop!");
}

generateShapes();
