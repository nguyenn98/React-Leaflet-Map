import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap, LayersControl, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ReactDOMServer from "react-dom/server";

import { FiEye } from "react-icons/fi";
import { FiEyeOff } from "react-icons/fi";
// import { FaUniversity } from "react-icons/fa";
import { LiaUniversitySolid } from "react-icons/lia";

import LocationList from "./LocationList";
import LocationPopup from "./LocationPopup"; // Đảm bảo đường dẫn đúng
import axios from "axios";

import '../styles/MapOpacity.css'

const { BaseLayer } = LayersControl;

// Điều khiển zoom tới vị trí mới
const MapController = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        if (!position) {
            return
        }
        map.flyTo(position, 16, { animate: true });

    }, [position, map]);

    return null;
};

// Icon các trường đại học
const universityIcon = new L.DivIcon({
    html: ReactDOMServer.renderToString(
        <LiaUniversitySolid style={{ color: "black", fontSize: "24px" }} />
    ),
    className: "", // bỏ class mặc định
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
});


// Icon mặc định của vị trí tìm kiếm
const defaultIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/128/684/684908.png',
    iconSize: [24, 24],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});
// Icon phóng to + đổi màu xanh (success)
const highlightIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/17784/17784432.png", // Icon xanh 
    iconSize: [40, 40], // Phóng to hơn
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
})

// Hàm xử lý sự kiện click vào khu vực
const onEachFeature = (feature, layer) => {
    if (feature.properties) {
        const name = feature.properties.name || "Trường không xác định";
        const housenumber = feature.properties["addr:housenumber"] || "Không rõ";
        const street = feature.properties["addr:street"] || "Không rõ";
        const subdistrict = feature.properties["addr:subdistrict"] || "Không rõ";
        const district = feature.properties["addr:district"] || "Không rõ";
        const city = feature.properties["addr:city"] || "Không rõ";
        const website = feature.properties.website ? `<a href="${feature.properties.website}" target="_blank">${feature.properties.website}</a>` : "Không có";

        layer.bindPopup(
            `<b>${name}</b><br/>
            <b>Địa chỉ:</b> Số ${housenumber} Đ. ${street}, ${subdistrict}, ${district}, ${city}. <br/>
            <b>Website:</b> ${website}`
        );
    }
};


// Hàm style cho khu vực trên bản đồ
const geoJSONStyle = {
    color: "#d9534f",  // Màu viền đỏ
    weight: 2,
    opacity: 1,
    fillOpacity: 0.3,
    fillColor: "#f0ad4e" // Màu cam nhẹ để nổi bật trường học
};

const MapShow = ({ position, geoData, highlight, setHighlight }) => {
    const [markerIcon, setMarkerIcon] = useState(defaultIcon);
    const [showLayer, setShowLayer] = useState(true);    // Trạng thái hiển thị layer
    const [opacity, setOpacity] = useState(1);           // Mặc định là 1 (không mờ)
    const [currentPosition, setCurrentPosition] = useState(position);  // Dùng state để cập nhật vị trí
    const [popupInfo, setPopupInfo] = useState(null);

    const handleMapClick = async (latlng) => {
        try {
            const [lat, lng] = latlng;
            const res = await axios.get('https://nominatim.openstreetmap.org/reverse.php', {
                params: {
                    lat,
                    lon: lng,
                    format: 'jsonv2',
                    zoom: 18,
                    addressdetails: 1,
                },
            });

            const address = res.data.display_name || "Không rõ địa chỉ";

            setPopupInfo({
                position: [lat, lng],
                lat,
                lng,
                name: res.data.name || "Vị trí chưa xác định",
                address,
            });
            setCurrentPosition([lat, lng]);
        } catch (err) {
            console.error("Lỗi Nominatim:", err);
        }
    };

    useEffect(() => {
        if (highlight) {
            setMarkerIcon(highlightIcon);

            setTimeout(() => {
                setMarkerIcon(defaultIcon);
                setHighlight(false);
            }, 7000);
        }
    }, [highlight, setHighlight]);

    // Khi position thay đổi từ kết quả tìm kiếm, currentPosition sẽ được cập nhật theo.
    useEffect(() => {
        console.log("Position cập nhật từ tìm kiếm:", position);
        if (position) {
            setCurrentPosition(position);
        }
    }, [position]);

    // Hàm xử lý click vào danh sách
    const handleLocationClick = (location) => {
        setCurrentPosition(location);
        setHighlight(true);
        setTimeout(() => setHighlight(false), 2000);
    }
    const MapClickHandler = ({ onClick }) => {
        useMapEvents({
            click: (e) => {
                const { lat, lng } = e.latlng;
                onClick([lat, lng]);
            },
        });
        return null;
    };

    return (
        <div style={{ position: "relative" }}>
            <MapContainer center={position} zoom={14} style={{ height: "100vh", width: "100%" }}>
                <MapClickHandler onClick={handleMapClick} />
                {popupInfo && (
                    <LocationPopup
                        info={popupInfo}
                        onClose={() => setPopupInfo(null)}
                    />

                )}
                <MapController position={currentPosition} />
                {/* Thêm LayersControl */}
                <LayersControl position="topright">
                    {/* Bản đồ nền mặc định */}
                    <BaseLayer checked name="OpenStreetMap">
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            opacity={opacity}
                        />
                    </BaseLayer>
                    {/* Bản đồ vệ tinh */}
                    <BaseLayer name="Satellite">
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution="&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                            opacity={opacity}
                        />
                    </BaseLayer>

                    {/* Hiển thị lớp dữ liệu GeoJSON các trường đại học tại Hà Nội*/}
                    {
                        geoData && showLayer && (
                            <GeoJSON data={geoData} onEachFeature={onEachFeature} style={geoJSONStyle} />
                        )
                    }
                </LayersControl>

                {/* Hiển thị marker tại vị trí tìm kiếm */}
                {
                    currentPosition && (
                        <Marker position={currentPosition} icon={markerIcon}>
                            <Popup>Vị trí tìm kiếm</Popup>
                        </Marker>
                    )
                }

                {/* Hiển thị Marker cho các Polygon và MultiPolygon */}
                {geoData && showLayer && geoData.features.map((feature, index) => {
                    if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
                        const bounds = L.geoJSON(feature).getBounds();
                        const center = bounds.getCenter();
                        return (
                            <Marker key={index} position={center} icon={universityIcon}>
                                <Popup>{feature.properties.name || "Trường học"}</Popup>
                            </Marker>
                        );
                    }
                    return null;
                })}
            </MapContainer>


            {/* Nút bật/tắt layer */}
            <button
                onClick={() => setShowLayer(!showLayer)}
                style={{
                    position: "absolute",
                    top: 65,
                    right: 10,
                    zIndex: 1001,
                    width: "48px",
                    height: "45px",
                    background: "#FFFFFF",
                    padding: "10px",
                    borderRadius: "7px",
                    border: "1px solid rgb(204, 197, 197)",
                    cursor: "pointer"
                }}
            >
                {showLayer ? <FiEyeOff /> : <FiEye />}
            </button>

            {/* Thanh trượt điều chỉnh độ mờ của bản đồ nền */}
            <div style={{
                position: "absolute",
                top: 120,
                right: 11,
                zIndex: 1000,
                background: "#fff",
                padding: "8px 10px",
                borderRadius: "7px",
                width: "26px",
                height: "140px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between"
            }}>
                <input
                    type="range"
                    orient="vertical"
                    min="0"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="opacity-slider"
                />
            </div>

            {/* Danh sách địa điểm */}
            <div style={{
                display: "flex", position: "absolute",
                left: 59, top: 68, zIndex: 1000,
                height: "500px", border: "1px solid #DDDDDD"
            }}>
                <LocationList geoData={geoData} onLocationClick={handleLocationClick} />

            </div>
        </div>
    );
};

export default MapShow;
