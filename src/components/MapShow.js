import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap, LayersControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { FiEye } from "react-icons/fi";
import { FiEyeOff } from "react-icons/fi";

import LocationList from "./LocationList";

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

    return (
        <div style={{ position: "relative" }}>
            <MapContainer center={position} zoom={14} style={{ height: "100vh", width: "100%" }}>
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
                            <Marker key={index} position={center} icon={defaultIcon}>
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
                bottom: 60,
                right: 10,
                zIndex: 1000,
                background: "rgb(247, 242, 242)",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid gray",
                width: "220px",
                height: "40px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)"

            }}>
                <label style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#333",
                }}>
                    Độ mờ của bản đồ: {Math.round((1 - opacity) * 100)}%</label> <br />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}  //Đảo ngược giá trị khi thay đổi
                    style={{ width: "100%", height: "5px" }}
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
