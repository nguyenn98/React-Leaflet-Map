import { useEffect, useState } from "react";
import Select from "react-select";
import L from "leaflet";
import { logoUniversity } from "../data/logoUniversity"; // import logo data
import "../styles/UniversityInfo.css";

export default function UniversityInfo() {
  const [universities, setUniversities] = useState([]);
  const [geoData, setGeoData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/data/scores_2024.json")
      .then((res) => res.json())
      .then((data) => setUniversities(data));
  }, []);

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/data/universities.geojson")
      .then((res) => res.json())
      .then((data) => setGeoData(data.features));
  }, []);

  // Chuẩn hóa tên trường để so sánh chính xác hơn
  const normalizeName = (str) =>
    str
      ?.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
      .replace(/[^a-z0-9\s]/gi, "") // bỏ ký tự đặc biệt
      // .replace(/\b(truong|dai hoc|hoc vien|dh|hv)\b/g, "") // bỏ các từ thường gây trùng lặp
      .replace(
        /\b(truong|dai hoc|hoc vien|dh|hv|co so|campus|university|academy|vien|khoa|truong dh|truong hv)\b/g,
        ""
      ) // bỏ từ gây trùng
      .trim()
      .toLowerCase();

  // Hàm lấy logo trường — khớp thông minh hơn
  const getUniversityLogo = (name) => {
    if (!name) return "/images/default_university.png";

    const normalizedInput = normalizeName(name);

    // 1 Ưu tiên tìm khớp chính xác (so sánh name)
    let match = logoUniversity.find(
      (item) => normalizeName(item.name) === normalizedInput
    );

    // 2 Nếu chưa thấy, thử tìm khớp gần (chứa trong chuỗi)
    if (!match) {
      match = logoUniversity.find(
        (item) =>
          normalizeName(item.name).includes(normalizedInput) ||
          normalizedInput.includes(normalizeName(item.name))
      );
    }

    // 3 Nếu vẫn chưa có, thử tìm bằng code hoặc từ khóa đặc biệt
    if (!match) {
      const keywordMap = {
        "bach khoa": "HUST",
        "kinh te quoc dan": "NEU",
        "ngoai thuong": "FTU",
        "giao thong van tai": "UTC",
        "kien truc": "HAU",
        "luat ha noi": "HLU",
        "my thuat cong nghiep": "MTCN",
        "lam nghiep": "VNUF",
        "mo dia chat": "HUMG",
        "khoa hoc tu nhien": "VNU-HUS",
        "xa hoi va nhan van": "VNU-USSH",
        "viet nhat": "VJU",
        "rmit": "RMIT",
        "vinuni": "VINUNI",
        "tran quoc tuan": "SQLQ1",
        "lao dong va xa hoi": "ULSA",
        "quan tri va kinh doanh": "HSB",
      };

      for (const key in keywordMap) {
        if (normalizedInput.includes(key)) {
          match = logoUniversity.find((item) => item.code === keywordMap[key]);
          if (match) break;
        }
      }
    }

    // 4 Nếu không có vẫn trả về ảnh mặc định
    return match ? match.logo : "/images/default_university.png";
  };

  const handleViewOnMap = () => {
    if (!selected || !geoData) return;

    const target = normalizeName(selected.university);
    const match = geoData.find((f) =>
      normalizeName(f.properties.name).includes(target)
    );

    if (match && match.geometry) {
      let lat, lng;
      if (match.geometry.type === "Point") {
        [lng, lat] = match.geometry.coordinates;
      } else {
        const layer = L.geoJSON(match);
        const center = layer.getBounds().getCenter();
        lat = center.lat;
        lng = center.lng;
      }

      if (lat && lng) {
        const vitri = `${lat},${lng}`;
        const mapUrl = `https://roadtouniversity.onrender.com/?vitri=${encodeURIComponent(
          vitri
        )}&zoom=17&university=${encodeURIComponent(selected.university)}`;
        window.open(mapUrl, "_blank");
      } else {
        alert("Không tìm thấy tọa độ hợp lệ của trường này.");
      }
    } else {
      alert("Không tìm thấy vị trí của trường trong bản đồ.");
    }
  };

  const options = universities.map((u) => ({
    value: u.university,
    label: u.university,
  }));

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fadeIn">
      <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-700 drop-shadow-sm">
        🎓 Thông tin các trường đại học Hà Nội (2024)
      </h1>

      {/* Ô chọn trường */}
      <div className="flex justify-center mb-8">
        <div className="w-96">
          <Select
            classNamePrefix="react-select"
            menuPortalTarget={document.body}
            options={options}
            placeholder="-- Chọn trường đại học --"
            onChange={(opt) => {
              const found = universities.find(
                (u) => u.university === opt?.value
              );
              setSelected(found || null);
              setSelectedRow(null);
            }}
            styles={{
              control: (base, state) => ({
                ...base,
                borderRadius: "12px",
                borderColor: state.isFocused ? "#2563eb" : "#cbd5e1",
                boxShadow: state.isFocused
                  ? "0 0 0 4px rgba(37,99,235,0.3)"
                  : "0 4px 12px rgba(0,0,0,0.08)",
                padding: "4px",
                "&:hover": { borderColor: "#2563eb" },
              }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
              }),
              menu: (base) => ({
                ...base,
                borderRadius: "10px",
                marginTop: "8px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                zIndex: 10,
              }),
              menuList: (base) => ({
                ...base,
                maxHeight: "250px",
                overflowY: "auto",
              }),
            }}
          />
        </div>
      </div>

      {/* Thông tin chi tiết */}
      {selected && (
        <div className="border rounded-2xl p-6 shadow-md bg-white hover:shadow-lg transition-all duration-300">
          {/* Hiển thị logo ở đầu */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {selected.university}
              </h2>
              {selected.source_url && (
                <a
                  href={selected.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm hover:underline"
                >
                  Xem nguồn →
                </a>
              )}
              <p className="text-gray-600 mb-6">
                📅 Năm tuyển sinh:{" "}
                <span className="font-medium">{selected.year}</span> | 📚 Số ngành:{" "}
                <span className="font-medium">{selected.majors.length}</span>
              </p>
            </div>

            <img
              src={getUniversityLogo(selected.university)}
              alt={selected.university}
              className="object-contain rounded-xl shadow-sm border w-16 h-16"
              onError={(e) => (e.target.src = "/images/default_university.png")}
            />
          </div>

          {/* Bảng điểm */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full border-collapse">
              <thead className="bg-blue-50 text-gray-700 uppercase text-sm">
                <tr>
                  <th className="px-4 py-2 text-left">Ngành học</th>
                  <th className="px-4 py-2 text-right">Điểm chuẩn</th>
                </tr>
              </thead>
              <tbody>
                {selected.majors.map((m, i) => {
                  const baseColor =
                    m.score >= 27
                      ? "bg-green-50"
                      : m.score <= 20
                        ? "bg-red-50"
                        : "bg-white";

                  const isSelected = selectedRow === i;

                  return (
                    <tr
                      key={i}
                      onClick={() => setSelectedRow(i)}
                      className={`border-t cursor-pointer transition-all duration-300 ${isSelected
                        ? "bg-blue-100 scale-[1.01] ring-1 ring-blue-400"
                        : baseColor
                        } hover:bg-blue-50`}
                    >
                      <td className="px-4 py-2 font-medium">{m.name}</td>
                      <td className="px-4 py-2 text-right font-semibold text-gray-800">
                        {m.score
                          ? typeof m.score === "object"
                            ? Object.entries(m.score)
                              .map(([key, val]) => `${key}: ${val}`)
                              .join(", ")
                            : m.score
                          : "—"}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Nút xem bản đồ */}
          <div className="mt-6 text-right">
            <button
              onClick={handleViewOnMap}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-2.5 rounded-lg shadow hover:opacity-90 active:scale-95 transition-all"
            >
              🗺️ Xem trên bản đồ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
