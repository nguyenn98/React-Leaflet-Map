// file node mới nhất 
import fs from "fs";
import csv from "csv-parser";
import fetch from "node-fetch";

const OSRM_URL = "https://osrm-back-end.onrender.com/route/v1/driving"; // đổi thành backend OSRM của bạn

// 1. Load stops.txt -> map stop_id -> [lon, lat]
async function loadStops(stopsFile) {
    return new Promise((resolve, reject) => {
        const stops = {};
        fs.createReadStream(stopsFile)
            .pipe(csv())
            .on("data", (row) => {
                const id = row.stop_id;
                const lat = parseFloat(row.stop_lat);
                const lon = parseFloat(row.stop_lon);
                stops[id] = [lon, lat];
            })
            .on("end", () => resolve(stops))
            .on("error", reject);
    });
}

// 2. Gọi OSRM để snap theo đường
async function snapRoute(coords) {
    const coordString = coords.map(c => c.join(",")).join(";");
    const url = `${OSRM_URL}/${coordString}?overview=full&geometries=geojson`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!data.routes || !data.routes[0]) {
            console.error("❌ OSRM không trả về route:", url);
            return null;
        }
        return data.routes[0].geometry;
    } catch (err) {
        console.error("❌ Lỗi fetch OSRM:", err);
        return null;
    }
}

// 3. Convert routes.json + stops.txt -> GeoJSON
async function convert(routesFile, stopsFile, outputFile) {
    const stops = await loadStops(stopsFile);
    const routes = JSON.parse(fs.readFileSync(routesFile, "utf8"));

    const features = [];

    for (const r of routes) {
        if (!r.route_name) continue;

        // Xử lý chiều đi
        if (r.go_stops && r.go_stops.length > 1) {
            const goCoords = r.go_stops.map(id => stops[id]).filter(Boolean);
            if (goCoords.length > 1) {
                const geometry = await snapRoute(goCoords);
                if (geometry) {
                    features.push({
                        type: "Feature",
                        properties: {
                            route_name: r.route_name + " (Chiều đi)",
                            operator: r.operator,
                            price: r.price,
                            hours: r.hours,
                            frequency: r.frequency,
                            direction: "go"
                        },
                        geometry
                    });
                }
            }
        }

        // Xử lý chiều về
        if (r.return_stops && r.return_stops.length > 1) {
            const returnCoords = r.return_stops.map(id => stops[id]).filter(Boolean);
            if (returnCoords.length > 1) {
                const geometry = await snapRoute(returnCoords);
                if (geometry) {
                    features.push({
                        type: "Feature",
                        properties: {
                            route_name: r.route_name + " (Chiều về)",
                            operator: r.operator,
                            price: r.price,
                            hours: r.hours,
                            frequency: r.frequency,
                            direction: "return"
                        },
                        geometry
                    });
                }
            }
        }
    }

    const geojson = { type: "FeatureCollection", features };
    fs.writeFileSync(outputFile, JSON.stringify(geojson, null, 2), "utf8");
    console.log(`✅ Xuất file GeoJSON: ${outputFile}`);
}

// Run
convert(
    "./public/custom/routes.json", // đường dẫn mới
    "./public/gtfs/stops.txt",     // đường dẫn mới
    "./public/custom/bus_routes.geojson" // nơi xuất file GeoJSON
);