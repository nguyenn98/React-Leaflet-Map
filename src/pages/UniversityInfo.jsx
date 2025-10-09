import { useEffect, useState } from "react";
import Select from "react-select";
import L from "leaflet";
import "../styles/UniversityInfo.css";

export default function UniversityInfo() {
  const [universities, setUniversities] = useState([]);
  const [geoData, setGeoData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null); // ✅ Thêm state lưu dòng được click

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

  const normalizeName = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/gi, "")
      .trim()
      .toLowerCase();

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
    <div className="max-w-5xl mx-auto p-6 animate-fadeIn">
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
              setSelectedRow(null); // reset chọn dòng khi đổi trường
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
                zIndex: 9999, // ⚡ Giúp menu nổi lên trên
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
                scrollbarWidth: "thin", // Firefox
                scrollbarColor: "#93c5fd #f1f5f9",
                "&::-webkit-scrollbar": {
                  width: "10px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#93c5fd",
                  borderRadius: "8px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#60a5fa",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#f1f5f9",
                },
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused
                  ? "#e0f2fe"
                  : state.isSelected
                    ? "#bfdbfe"
                    : "#fff",
                color: "#1e293b",
                padding: "10px 14px",
                cursor: "pointer",
                fontWeight: 500,
                transition: "0.15s",
              }),
              singleValue: (base) => ({
                ...base,
                color: "#1e293b",
                fontWeight: 500,
              }),
            }}
          />
        </div>
      </div>

      {/* Thông tin chi tiết */}
      {selected && (
        <div className="border rounded-2xl p-6 shadow-md bg-white hover:shadow-lg transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
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
          </div>

          <p className="text-gray-600 mb-6">
            📅 Năm tuyển sinh:{" "}
            <span className="font-medium">{selected.year}</span> | 📚 Số ngành:{" "}
            <span className="font-medium">{selected.majors.length}</span>
          </p>

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
                      className={`
          border-t cursor-pointer transition-all duration-300
          ${isSelected ? "bg-blue-300 scale-[1.01] ring-2 ring-blue-400" : baseColor}
          hover:bg-blue-50
        `}
                      style={{
                        transition: "background-color 0.3s ease, transform 0.15s ease",
                      }}
                    >
                      <td className="px-4 py-2 font-medium">{m.name}</td>
                      <td className="px-4 py-2 text-right font-semibold text-gray-800">
                        {m.score ? m.score : "—"}
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
