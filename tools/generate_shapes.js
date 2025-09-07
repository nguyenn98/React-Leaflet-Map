// const fs = require("fs");
// const fetch = require("node-fetch");

// const DATA_DIR = "./public/gtfs";
// // const OSRM_URL = "https://osrm-back-end.onrender.com/route/v1/driving"; 
// const OSRM_URL = "http://localhost:5000/route/v1/driving";

// function loadCsv(path) {
//   const lines = fs.readFileSync(path, "utf8").trim().split("\n");
//   const headers = lines[0].split(",");
//   return lines.slice(1).map(line => {
//     const values = line.split(",");
//     return Object.fromEntries(headers.map((h, i) => [h.trim(), values[i]?.trim()]));
//   });
// }

// function saveCsv(path, data) {
//   if (data.length === 0) return;
//   const headers = Object.keys(data[0]);
//   const lines = [headers.join(",")];
//   for (const row of data) {
//     lines.push(headers.map(h => row[h]).join(","));
//   }
//   fs.writeFileSync(path, lines.join("\n"));
// }

// async function fetchWithRetry(url, retries = 3, delay = 2000) {
//   for (let i = 0; i < retries; i++) {
//     try {
//       const res = await fetch(url, { timeout: 20000 });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       return await res.json();
//     } catch (e) {
//       console.warn(`⚠️ Lỗi lần ${i + 1}: ${e.message}`);
//       if (i < retries - 1) await new Promise(r => setTimeout(r, delay));
//     }
//   }
//   throw new Error("Fetch thất bại sau nhiều lần retry");
// }

// async function generateShapes() {
//   const stops = loadCsv(`${DATA_DIR}/stops.txt`);
//   const stopTimes = loadCsv(`${DATA_DIR}/stop_times.txt`);
//   const trips = loadCsv(`${DATA_DIR}/trips.txt`);

//   const stopsMap = Object.fromEntries(stops.map(s => [s.stop_id, s]));

//   // Nếu đã có cache thì load vào
//   let shapes = fs.existsSync(`${DATA_DIR}/shapes_generated.txt`)
//     ? loadCsv(`${DATA_DIR}/shapes_generated.txt`)
//     : [];

//   let tripsWithShape = fs.existsSync(`${DATA_DIR}/trips_with_shape_id.txt`)
//     ? loadCsv(`${DATA_DIR}/trips_with_shape_id.txt`)
//     : [];

//   const doneTripIds = new Set(tripsWithShape.map(t => t.trip_id));

//   let shapeCounter = tripsWithShape.length + 1;

//   for (const [idx, trip] of trips.entries()) {
//     const tripId = trip.trip_id;
//     if (doneTripIds.has(tripId)) {
//       console.log(`⏩ Bỏ qua trip ${tripId} (đã có trong cache)`);
//       continue;
//     }

//     console.log(`🚌 Đang xử lý trip ${tripId} (${idx + 1}/${trips.length})`);

//     const tripStops = stopTimes
//       .filter(st => st.trip_id === tripId)
//       .sort((a, b) => parseInt(a.stop_sequence) - parseInt(b.stop_sequence));

//     if (tripStops.length < 2) continue;

//     const shapeId = `shape_${shapeCounter++}`;
//     tripsWithShape.push({ ...trip, shape_id: shapeId });

//     let seq = 1;
//     for (let i = 0; i < tripStops.length - 1; i++) {
//       const s1 = stopsMap[tripStops[i].stop_id];
//       const s2 = stopsMap[tripStops[i + 1].stop_id];
//       if (!s1 || !s2) continue;

//       const url = `${OSRM_URL}/${s1.stop_lon},${s1.stop_lat};${s2.stop_lon},${s2.stop_lat}?overview=full&geometries=geojson`;

//       try {
//         console.log(`   ↪️  Đoạn ${i + 1}/${tripStops.length - 1}`);
//         const json = await fetchWithRetry(url);
//         if (json.routes && json.routes[0]) {
//           const coords = json.routes[0].geometry.coordinates;
//           for (const [lon, lat] of coords) {
//             shapes.push({
//               shape_id: shapeId,
//               shape_pt_lat: lat,
//               shape_pt_lon: lon,
//               shape_pt_sequence: seq++
//             });
//           }
//         }
//       } catch (e) {
//         console.error(`❌ Lỗi OSRM trip ${tripId}, đoạn ${i + 1}:`, e.message);
//       }

//       // nghỉ 1 giây để tránh nghẽn
//       await new Promise(r => setTimeout(r, 1000));
//     }

//     // Ghi file tạm sau mỗi trip (để nếu dừng vẫn resume được)
//     saveCsv(`${DATA_DIR}/shapes_generated.txt`, shapes);
//     saveCsv(`${DATA_DIR}/trips_with_shape_id.txt`, tripsWithShape);
//     console.log(`✅ Đã lưu cache sau trip ${tripId}`);
//   }

//   console.log("🎉 Hoàn tất! Dữ liệu đầy đủ trong public/gtfs/");
// }

// generateShapes();


// tools/generate_shapes.js
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

async function fetchWithRetry(url, retries = 3, delay = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { timeout: 15000 });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`⚠️ Lỗi lần ${i + 1}: ${e.message}`);
      if (i < retries - 1) await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error("Fetch thất bại sau nhiều lần retry");
}

async function generateShapes() {
  const stops = loadCsv(`${DATA_DIR}/stops.txt`);
  const stopTimes = loadCsv(`${DATA_DIR}/stop_times.txt`);
  const trips = loadCsv(`${DATA_DIR}/trips.txt`);

  const stopsMap = Object.fromEntries(stops.map(s => [s.stop_id, s]));

  let shapes = fs.existsSync(`${DATA_DIR}/shapes_generated.txt`)
    ? loadCsv(`${DATA_DIR}/shapes_generated.txt`)
    : [];

  let tripsWithShape = fs.existsSync(`${DATA_DIR}/trips_with_shape_id.txt`)
    ? loadCsv(`${DATA_DIR}/trips_with_shape_id.txt`)
    : [];

  const doneTripIds = new Set(tripsWithShape.map(t => t.trip_id));
  let shapeCounter = tripsWithShape.length + 1;

  for (const [idx, trip] of trips.entries()) {
    const tripId = trip.trip_id;
    if (doneTripIds.has(tripId)) {
      console.log(`⏩ Bỏ qua trip ${tripId} (đã có trong cache)`);
      continue;
    }

    console.log(`🚌 Đang xử lý trip ${tripId} (${idx + 1}/${trips.length})`);

    const tripStops = stopTimes
      .filter(st => st.trip_id === tripId)
      .sort((a, b) => parseInt(a.stop_sequence) - parseInt(b.stop_sequence));

    if (tripStops.length < 2) continue;

    const shapeId = `shape_${shapeCounter++}`;
    tripsWithShape.push({ ...trip, shape_id: shapeId });

    let seq = 1;

    // ✅ Chạy song song theo batches
    const segmentBatches = [];
    for (let i = 0; i < tripStops.length - 1; i++) {
      const s1 = stopsMap[tripStops[i].stop_id];
      const s2 = stopsMap[tripStops[i + 1].stop_id];
      if (!s1 || !s2) continue;

      const url = `${OSRM_URL}/${s1.stop_lon},${s1.stop_lat};${s2.stop_lon},${s2.stop_lat}?overview=full&geometries=geojson`;

      segmentBatches.push(async () => {
        try {
          const json = await fetchWithRetry(url);
          if (json.routes && json.routes[0]) {
            const coords = json.routes[0].geometry.coordinates;
            return coords.map(([lon, lat]) => ({
              shape_id: shapeId,
              shape_pt_lat: lat,
              shape_pt_lon: lon,
              shape_pt_sequence: seq++,
            }));
          }
        } catch (e) {
          console.error(`❌ Lỗi OSRM trip ${tripId}, đoạn ${i + 1}: ${e.message}`);
          return [];
        }
        return [];
      });
    }

    // Chia batch 5 request 1 lần
    for (let i = 0; i < segmentBatches.length; i += 5) {
      const batch = segmentBatches.slice(i, i + 5);
      const results = await Promise.all(batch.map(fn => fn()));
      results.forEach(points => {
        shapes.push(...points);
      });
    }

    // Ghi cache sau mỗi trip
    saveCsv(`${DATA_DIR}/shapes_generated.txt`, shapes);
    saveCsv(`${DATA_DIR}/trips_with_shape_id.txt`, tripsWithShape);

    console.log(`✅ Đã lưu cache sau trip ${tripId}`);
  }

  console.log("🎉 Hoàn tất! Dữ liệu đầy đủ trong public/gtfs/");
}

generateShapes();
