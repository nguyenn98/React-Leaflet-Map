const fs = require("fs-extra");
const path = require("path");
const puppeteer = require("puppeteer");
const NodeGeocoder = require("node-geocoder");

const geocoder = NodeGeocoder({ provider: "openstreetmap" });

const MAX_RESULTS = 20;
const BASE_URL = "https://thuephongtro.com";

// Phân loại loại hình từ tiêu đề
const detectType = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes("ở ghép")) return "ở ghép";
  if (lower.includes("chung cư mini")) return "chung cư mini";
  if (lower.includes("nhà nguyên căn")) return "nhà nguyên căn";
  if (lower.includes("ký túc xá") || lower.includes("ktx")) return "ký túc xá";
  if (lower.includes("khu tập thể")) return "khu tập thể";
  if (lower.includes("homestay")) return "homestay";
  return "phòng trọ";
};

const crawlHousingFromThuePhongTro = async (universityName) => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  const searchUrl = `${BASE_URL}/tim-kiem.html?q=nh%C3%A0+tr%E1%BB%8D+g%E1%BA%A7n+${encodeURIComponent(
    universityName
  )}+H%C3%A0+N%E1%BB%99i`;

  await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

  const results = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll(".list-item .post-title > a"));
    return items.map((el) => ({
      title: el.innerText.trim(),
      url: el.href,
    }));
  });

  await browser.close();

  const features = [];

  for (const { title, url } of results.slice(0, MAX_RESULTS)) {
    try {
      const res = await geocoder.geocode(`${title}, Hà Nội`);
      if (res.length > 0) {
        const { longitude, latitude } = res[0];
        features.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          properties: {
            name: title,
            type: detectType(title),
            url,
            source_university: universityName,
            category: "housing",
          },
        });
      }
    } catch (err) {
      console.warn("❌ Lỗi geocode:", title);
    }
  }

  return features;
};

const main = async () => {
  let universities;
  try {
    universities = await fs.readJson(path.join(__dirname, "universities.geojson"));
  } catch (err) {
    console.error("❌ Không đọc được universities.geojson:", err);
    process.exit(1);
  }

  const allFeatures = [];

  for (const feature of universities.features) {
    const uniName = feature.properties.name;
    console.log(`🔍 Crawl nhà trọ quanh: ${uniName}`);
    const features = await crawlHousingFromThuePhongTro(uniName);
    console.log(`   ✅ Lấy được ${features.length} địa điểm\n`);
    allFeatures.push(...features);
  }

  const output = {
    type: "FeatureCollection",
    features: allFeatures,
  };

  await fs.ensureDir(path.join(__dirname, "../data"));
  await fs.writeJson(path.join(__dirname, "../data/housing.geojson"), output, { spaces: 2 });
  console.log("🏡 Đã ghi file housing.geojson");
};

main();
