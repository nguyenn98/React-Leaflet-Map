const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const RADIUS = 2500; // bán kính tìm quanh trường

// Tạo truy vấn Overpass theo danh mục
const buildOverpassQuery = (lat, lon, category) => {
    switch (category) {
        case "printing":
            return `
        [out:json][timeout:25];
        (
          node["shop"="copyshop"](around:${RADIUS},${lat},${lon});
          node["amenity"="printer"](around:${RADIUS},${lat},${lon});
          node["name"~"in ấn|in màu|photocopy|photo|in luận văn|ép plastic|scan|in tài liệu", i](around:${RADIUS},${lat},${lon});
        );
        out body;
      `;
        case "bookstore":
            return `
        [out:json][timeout:25];
        (
          node["shop"="books"](around:${RADIUS},${lat},${lon});
          node["name"~"nhà sách|giáo trình|sách tham khảo|NXB|nhà xuất bản", i](around:${RADIUS},${lat},${lon});
        );
        out body;
      `;
        case "career":
            return `
        [out:json][timeout:25];
        (
          node["office"="employment_agency"](around:${RADIUS},${lat},${lon});
          node["name"~"tư vấn hướng nghiệp|trung tâm hướng nghiệp|career center", i](around:${RADIUS},${lat},${lon});
        );
        out body;
      `;
        default:
            return "";
    }
};

// Fetch các điểm quanh từng trường
const fetchServices = async () => {
    const universities = await fs.readJson(path.join(__dirname, "universities.geojson"));

    const services = [];

    for (const feature of universities.features) {
        const name = feature.properties.name;
        const [lon, lat] = feature.geometry.coordinates;

        if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
            console.warn(`⚠️ Tọa độ không hợp lệ: ${name}`);
            continue;
        }

        console.log(`📍 Trường: ${name}`);

        const fetchCategory = async (category, label) => {
            const query = buildOverpassQuery(lat, lon, category);
            try {
                const res = await axios.post(OVERPASS_URL, query, {
                    headers: { "Content-Type": "text/plain" },
                });

                const elements = res.data.elements || [];
                console.log(`   ➕ ${label}: ${elements.length} điểm`);

                for (const el of elements) {
                    if (el.lat && el.lon) {
                        services.push({
                            type: "Feature",
                            geometry: {
                                type: "Point",
                                coordinates: [el.lon, el.lat],
                            },
                            properties: {
                                name: el.tags?.name || `${label} gần ${name}`,
                                source_university: name,
                                type: category,
                                category: "student_services",
                            },
                        });
                    }
                }
            } catch (err) {
                console.error(`❌ Lỗi khi lấy ${label} quanh ${name}:`, err.message);
            }
        };

        await fetchCategory("printing", "In ấn, photocopy");
        await fetchCategory("bookstore", "Hiệu sách, giáo trình");
        await fetchCategory("career", "Tư vấn hướng nghiệp");

        await new Promise((r) => setTimeout(r, 1200)); // tránh spam Overpass
    }

    await fs.ensureDir(path.join(__dirname, "../data"));
    await fs.writeJson(path.join(__dirname, "../data/student-services.geojson"), {
        type: "FeatureCollection",
        features: services,
    }, { spaces: 2 });

    console.log("✅ Đã lưu file student-services.geojson thành công!");
};

fetchServices();
