const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
const path = require("path");

puppeteer.use(StealthPlugin());

(async () => {
  const url = "http://timbus.vn/fleets.aspx";
  console.log("🔍 Truy cập", url);

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-extensions", // tắt extension
      "--disable-default-apps",
      "--window-size=1200,800",
    ],
    ignoreDefaultArgs: ["--enable-automation"], // né detection
    defaultViewport: null,
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    const title = await page.title();
    console.log("✅ Trang đã tải:", title);

    await page.waitForSelector("#MainContent_GridView1", { timeout: 15000 });

    const data = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("#MainContent_GridView1 tr"));
      return rows.map((row) => {
        const cells = Array.from(row.querySelectorAll("td")).map((td) => td.innerText.trim());
        return cells;
      });
    });

    console.log("✅ Đã lấy", data.length, "dòng dữ liệu.");

    const filePath = path.join(__dirname, "timbus_fleets.json");
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log("💾 Đã lưu vào:", filePath);
  } catch (error) {
    console.error("❌ Lỗi khi crawl dữ liệu:", error.message);

    try {
      await page.screenshot({ path: "error_screenshot.png", fullPage: true });
      console.log("🖼️ Đã chụp lại màn hình tại lỗi: error_screenshot.png");
    } catch (screenshotError) {
      console.log("⚠️ Lỗi khi chụp ảnh lỗi:", screenshotError.message);
    }
  } finally {
    await browser.close();
  }
})();
