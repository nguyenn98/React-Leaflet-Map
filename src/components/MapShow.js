import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap, LayersControl, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ReactDOMServer from "react-dom/server";
import { useSearchParams } from "react-router-dom";

import { FiEye } from "react-icons/fi";
import { FiEyeOff } from "react-icons/fi";
import { LiaUniversitySolid } from "react-icons/lia";
import { FaLocationDot } from "react-icons/fa6";
import { TbRoadSign } from "react-icons/tb";

import LocationList from "./LocationList";
import LocationPopup from "./LocationPopup";
import RoutingMachine from "./RoutingMachine";
import DirectionBox from "./DirectionBox";
import { getLogoFromWikidata } from "../utils/wikidata";
import axios from "axios";

import { logoUniversity } from "../data/logoUniversity";
import '../styles/MapOpacity.css'

const { BaseLayer } = LayersControl;

// Điều khiển zoom tới vị trí mới
const MapController = ({ position, initialZoom }) => {
    const map = useMap();

    useEffect(() => {
        if (!position) return;
        const currentZoom = map.getZoom();
        const currentCenter = map.getCenter();
        const positionLatLng = L.latLng(position);

        // Nếu đang ở đúng vị trí rồi thì không cần làm gì
        if (currentCenter.equals(positionLatLng)) return;

        if (currentZoom === initialZoom) {
            map.panTo(positionLatLng);
        } else {
            map.flyTo(positionLatLng, initialZoom, { animate: true });
        }
    }, [position, initialZoom]);

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

const MapShow = ({ position, geoData, highlight, setHighlight, showDirection, setShowDirection }) => {
    const [showLayer, setShowLayer] = useState(true);    // Trạng thái hiển thị layer
    const [opacity, setOpacity] = useState(1);           // Mặc định là 1 (không mờ)
    const [currentPosition, setCurrentPosition] = useState(position);  // Dùng state để cập nhật vị trí
    const [popupInfo, setPopupInfo] = useState(null);
    const [logoMap, setLogoMap] = useState({});
    const [isPopupFromMapClick, setIsPopupFromMapClick] = useState(false);
    const mapRef = useRef(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const initialZoom = parseInt(searchParams.get("zoom")) || 17;
    const [isHighlighting, setIsHighlighting] = useState(false);

    const [routeInfo, setRouteInfo] = useState(null);
    const [routeFrom, setRouteFrom] = useState(null);
    const [routeTo, setRouteTo] = useState(null);
    const [transportMode, setTransportMode] = useState("car"); // 👉 khai báo thêm dòng này

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

            // Lấy zoom hiện tại từ map
            const map = mapRef.current;
            const zoom = mapRef.current ? mapRef.current.getZoom() : initialZoom;

            // Cập nhật URL
            const newParams = new URLSearchParams();
            newParams.set("vitri", `${lat},${lng}`);
            newParams.set("zoom", zoom);
            setSearchParams(newParams);

            // Cập nhật popup và marker
            setPopupInfo({
                position: [lat, lng],
                lat,
                lng,
                name: res.data.name || "Vị trí chưa xác định",
                address,
            });
            setCurrentPosition([lat, lng]);
            setIsPopupFromMapClick(true);
        } catch (err) {
            console.error("Lỗi Nominatim:", err);
        }
    };

    // Memoize onRouteInfo để tránh render lại không cần thiết
    const onRouteInfo = useCallback((info) => {
        setRouteInfo(info);
    }, []);

    // Hàm xử lý khi đóng DirectionBox
    const handleCloseDirectionBox = () => {
        setShowDirection(false);
        setRouteInfo(null); // Reset thông tin lộ trình
        setRouteFrom(null); // Reset điểm xuất phát
        setRouteTo(null);   // Reset điểm đích
        setTransportMode("car"); // Reset phương thức di chuyển
    };

    useEffect(() => {
        if (highlight) {
            setIsHighlighting(true);
            setTimeout(() => {
                setIsHighlighting(false);
                setHighlight(false);
            }, 8000);
        }
    }, [highlight, setHighlight]);

    // Khi position thay đổi từ kết quả tìm kiếm, currentPosition sẽ được cập nhật theo.
    useEffect(() => {
        console.log("Position cập nhật từ tìm kiếm:", position);
        if (position) {
            setCurrentPosition(position);
        }
    }, [position]);

    // useEffect để đọc vitri từ URL khi mở trang
    useEffect(() => {
        const vitri = searchParams.get("vitri");
        const zoom = parseInt(searchParams.get("zoom")) || 17;

        if (vitri) {
            const [lat, lng] = vitri.split(",").map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
                const fetchAddress = async () => {
                    try {
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
                            name: res.data.name || "Vị trí được chia sẻ",
                            address,
                        });

                        setCurrentPosition([lat, lng]);
                        setIsPopupFromMapClick(true);
                        setCurrentPosition([lat, lng]); // MapController sẽ xử lý pan/fly

                    } catch (err) {
                        console.error("Lỗi khi lấy địa chỉ từ URL:", err);
                    }
                };

                fetchAddress();
            }
        }
    }, []);

    // Thêm đoạn này để ẩn popup trắng khi tìm kiếm
    useEffect(() => {
        if (position && isPopupFromMapClick) {
            setPopupInfo(null); // Ẩn popup trắng nếu là từ tìm kiếm
            setIsPopupFromMapClick(false);
        }
        setCurrentPosition(position); // Vẫn cập nhật vị trí
    }, [position]);


    // Hàm xử lý click vào danh sách
    const handleLocationClick = (location, feature) => {
        setPopupInfo(feature); // để popup hiển thị thông tin đúng
        setIsPopupFromMapClick(false);
        setCurrentPosition(location);
        setHighlight(true);

        setTimeout(() => setHighlight(false), 2000);
    };

    const MapClickHandler = ({ onClick }) => {
        useMapEvents({
            click: (e) => {
                const { lat, lng } = e.latlng;
                onClick([lat, lng]);
                // Tắt icon xanh khi click map
                setHighlight(false);
                setIsHighlighting(false);
            },
        });
        return null;
    };

    // Xử lý zoom trên thanh link
    const ZoomSyncHandler = () => {
        const map = useMap();

        useEffect(() => {
            const handleZoomEnd = () => {
                const newZoom = map.getZoom();
                searchParams.set("zoom", newZoom);
                setSearchParams(searchParams);
            };

            map.on("zoomend", handleZoomEnd);
            return () => {
                map.off("zoomend", handleZoomEnd);
            };
        }, [map, searchParams, setSearchParams]);

        return null;
    };

    // để fetch logo nếu chưa có
    const markers = useMemo(() => {
        if (!geoData) return [];

        return geoData.features
            .map((feature, index) => {
                const geometry = feature.geometry;
                let center = null;

                if (geometry.type === "Point") {
                    const [lng, lat] = geometry.coordinates;
                    center = [lat, lng];
                } else if (
                    geometry.type === "Polygon" ||
                    geometry.type === "MultiPolygon"
                ) {
                    const bounds = L.geoJSON(feature).getBounds();
                    center = bounds.getCenter();
                } else {
                    return null; // Không hỗ trợ loại khác
                }

                const name = feature.properties.name;
                const normalize = (str) => {
                    return str
                        ?.normalize("NFKC")
                        .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, "-")
                        .replace(/\s+/g, " ")
                        .trim()
                        .toLowerCase();
                };

                const logoEntry = logoUniversity.find(
                    (u) => normalize(u.name) === normalize(name)
                );

                if (!logoEntry) {
                    console.warn("Không khớp logo:", normalize(name));
                } else {
                    console.log("Logo khớp:", normalize(name), logoEntry.logo);
                }

                const logoUrl = logoEntry
                    ? `${process.env.PUBLIC_URL}${logoEntry.logo}`
                    : null;

                const icon = logoUrl
                    ? new L.DivIcon({
                        html: `<img src="${logoUrl}" class="university-marker-appear" style="width: 40px; height: 40px;" />`,
                        className: "",
                        iconSize: [40, 40],
                        iconAnchor: [20, 50],
                        popupAnchor: [0, -50],
                    })
                    : universityIcon;

                return (
                    <Marker key={index} position={center} icon={icon}>
                        <Popup>{name || "Trường học"}</Popup>
                    </Marker>
                );
            })
            .filter(Boolean); // Bỏ null
    }, [geoData, logoMap]);


    const handleSelectFeature = async (feature) => {
        const wikidata = feature?.properties?.wikidata;
        if (!wikidata || logoMap[wikidata]) return;

        const logo = await getLogoFromWikidata(wikidata);
        if (logo) {
            setLogoMap((prev) => ({ ...prev, [wikidata]: logo }));
        }
    };

    // hàm tạo icon theo trạng thái
    const createDynamicIcon = () => {
        const iconHtml = ReactDOMServer.renderToString(
            <FaLocationDot
                className={isHighlighting ? "highlight-marker" : ""}
                style={{ color: isHighlighting ? "#00FFCC" : "red", fontSize: isHighlighting ? "40px" : "24px" }}
            />
        );

        return new L.DivIcon({
            html: iconHtml,
            className: "",
            iconSize: isHighlighting ? [40, 40] : [24, 24],
            iconAnchor: isHighlighting ? [20, 40] : [12, 24],
            popupAnchor: isHighlighting ? [0, -40] : [0, -24]
        });
    };

    return (
        <div style={{ position: "relative" }}>
            <MapContainer
                center={position}
                zoom={initialZoom}
                style={{ height: "100vh", width: "100%" }}
                whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
            >
                <MapClickHandler onClick={handleMapClick} />
                <ZoomSyncHandler />
                {popupInfo && isPopupFromMapClick && (
                    <LocationPopup
                        info={popupInfo}
                        onClose={() => {
                            setPopupInfo(null);
                            setIsPopupFromMapClick(false);
                        }}
                    />
                )}
                {currentPosition && <MapController position={currentPosition} initialZoom={initialZoom} />}
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
                            <GeoJSON
                                data={geoData}
                                onEachFeature={(feature, layer) => {
                                    onEachFeature(feature, layer);

                                    // Thêm sự kiện click vào vùng Polygon
                                    layer.on('click', () => {
                                        setPopupInfo(null);             // Ẩn popup nếu đang hiển thị
                                        setIsPopupFromMapClick(false);  // Đánh dấu không phải popup từ map click
                                        setCurrentPosition(null);       // Ẩn Marker đỏ

                                        // Gọi tải logo khi người dùng click
                                        handleSelectFeature(feature);
                                    });
                                }}
                                style={geoJSONStyle}
                            />

                        )
                    }
                </LayersControl>

                {/* Hiển thị marker tại vị trí tìm kiếm */}
                {
                    currentPosition && (
                        <Marker position={currentPosition} icon={createDynamicIcon()}>
                            <Popup>Vị trí tìm kiếm</Popup>
                        </Marker>
                    )
                }

                {/* Hiển thị Marker cho các Polygon và MultiPolygon */}
                {
                    showLayer && markers
                }

                {/* Thêm điều kiện vẽ route */}
                {routeFrom && routeTo && (
                    <RoutingMachine
                        from={routeFrom}
                        to={routeTo}
                        mode={transportMode}
                        onRouteInfo={onRouteInfo}
                    />
                )}

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
            {!showDirection &&
                <div style={{
                    display: "flex", position: "absolute",
                    left: 59, top: 68, zIndex: 1000,
                    height: "500px", border: "none"
                }}>
                    <LocationList geoData={geoData} onLocationClick={handleLocationClick} />
                </div>
            }
            <button
                onClick={() => setShowDirection(true)}
                style={{
                    position: "absolute",
                    bottom: 307,
                    right: 10,
                    zIndex: 1000,
                    width: "48px",
                    height: "48px",
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <TbRoadSign size={28} color='#666' />
            </button>

            {showDirection && (
                <div style={{
                    position: "absolute",
                    top: 15,
                    left: 40,
                    zIndex: 1001,
                    background: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                }}>
                    <DirectionBox
                        onClose={handleCloseDirectionBox}
                        onRouteSelected={(from, to, mode) => {
                            setRouteFrom(from);
                            setRouteTo(to);
                            setTransportMode(mode);
                        }}
                        routeInfo={routeInfo}
                        transportMode={transportMode}
                        onTransportModeChange={(mode) => setTransportMode(mode)}
                    />

                </div>
            )}
        </div>
    );
};

export default MapShow;
