const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const RADIUS_FOOD = 1200; // bán kính 1.2km
const RADIUS_SERVICES = 2000; // bán kính 2km
const RADIUS_HOUSING = 5500; // bán kính 5.5km

const buildOverpassQuery = (lat, lon, category) => {
    switch (category) {
        case "food":
            return `
                [out:json][timeout:25];
                (
                node["amenity"="restaurant"](around:${RADIUS_FOOD},${lat},${lon});
                node["cuisine"="street_food"](around:${RADIUS_FOOD},${lat},${lon});
                node["amenity"="fast_food"](around:${RADIUS_FOOD},${lat},${lon});
                node["name"~"quán ăn|bún|phở|mì|cơm|cháo|hủ tiếu", i](around:${RADIUS_FOOD},${lat},${lon});
                );
                out body;
                `;

        case "services":
            return `
                [out:json][timeout:25];
                (
                node["shop"="copyshop"](around:${RADIUS_SERVICES},${lat},${lon});
                node["office"="printing"](around:${RADIUS_SERVICES},${lat},${lon});
                node["amenity"="printer"](around:${RADIUS_SERVICES},${lat},${lon});
                node["name"~"in ấn|photocopy|photo|in màu|in nhanh|in A4", i](around:${RADIUS_SERVICES},${lat},${lon});
                );
                out body;
                `;

        // case "housing":
        //     return `
        //         [out:json][timeout:25];
        //         (
        //         node["building"~"apartments|dormitory|terrace|semidetached"](around:${RADIUS_HOUSING},${lat},${lon});
        //         node["name"~"nhà trọ|phòng trọ|phòng thuê|cho thuê|ktx|kí túc xá|ký túc xá|homestay|khu tập thể|chung cư mini|ở ghép|phòng ghép|phòng trọ chung chủ|phòng trọ riêng lẻ|căn hộ dịch vụ", i]
        //             (around:${RADIUS_HOUSING},${lat},${lon})
        //         );
        //         out center;
        //     `;
        case "housing":
    return `
        [out:json][timeout:25];
        (
        node["building"~"apartments|dormitory|terrace|semidetached"](around:${RADIUS_HOUSING},${lat},${lon});
        node["name"~"nhà trọ|phòng trọ|làng sinh viên|homestay|khu tập thể|chung cư mini|phòng ghép|ở ghép|phòng trọ chung chủ|phòng trọ riêng lẻ|phòng thuê", i](around:${RADIUS_HOUSING},${lat},${lon});
        );
        out body;
        `;


        default:
            return "";
    }
};

const fetchNearbyData = async () => {
    const universities = await fs.readJson(path.join(__dirname, "universities.geojson"));

    const food = [];
    const services = [];
    const housing = [];

    for (const feature of universities.features) {
        const name = feature.properties.name || "Unnamed";
        const [lon, lat] = feature.geometry.coordinates;

        if (
            typeof lat !== "number" || typeof lon !== "number" ||
            isNaN(lat) || isNaN(lon) ||
            lat < -90 || lat > 90 || lon < -180 || lon > 180
        ) {
            console.warn(`⚠️  Toạ độ không hợp lệ tại trường ${name}:`, lat, lon);
            continue;
        }

        console.log(`🔍 Trường: ${name}`);

        const fetchCategory = async (category, targetArray, defaultLabel) => {
            const query = buildOverpassQuery(lat, lon, category);
            try {
                const res = await axios.post(OVERPASS_URL, query, {
                    headers: { "Content-Type": "text/plain" },
                });
                const elements = res.data.elements || [];

                for (const el of elements) {
                    if (el.lon && el.lat) {
                        targetArray.push({
                            type: "Feature",
                            geometry: { type: "Point", coordinates: [el.lon, el.lat] },
                            properties: {
                                name: el.tags?.name || defaultLabel,
                                source_university: name,
                                category
                            }
                        });
                    }
                }

                console.log(`   📍 ${category}: ${elements.length} điểm`);
            } catch (err) {
                console.error(`❌ Lỗi ${category} tại trường ${name}:`, err.message);
            }
        };

        await fetchCategory("food", food, "Quán ăn");
        await fetchCategory("services", services, "Dịch vụ");
        await fetchCategory("housing", housing, "Nhà trọ");

        await new Promise((res) => setTimeout(res, 1200)); // chống spam API
    }

    await fs.ensureDir(path.join(__dirname, "../data"));

    await fs.writeJson(path.join(__dirname, "../data/food.geojson"), {
        type: "FeatureCollection", features: food
    }, { spaces: 2 });

    await fs.writeJson(path.join(__dirname, "../data/services.geojson"), {
        type: "FeatureCollection", features: services
    }, { spaces: 2 });

    await fs.writeJson(path.join(__dirname, "../data/housing.geojson"), {
        type: "FeatureCollection", features: housing
    }, { spaces: 2 });

    console.log("✅ Hoàn tất. Đã tạo 3 file .geojson trong thư mục /data/");
};

fetchNearbyData();

