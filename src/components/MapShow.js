import { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap, LayersControl, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ReactDOMServer from "react-dom/server";
import { useSearchParams } from "react-router-dom";

import { FiEye } from "react-icons/fi";
import { FiEyeOff } from "react-icons/fi";
import { LiaUniversitySolid } from "react-icons/lia";

import LocationList from "./LocationList";
import LocationPopup from "./LocationPopup";
import { getLogoFromWikidata } from "../utils/wikidata";
import axios from "axios";

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
    const [logoMap, setLogoMap] = useState({});
    const [isPopupFromMapClick, setIsPopupFromMapClick] = useState(false);
    const mapRef = useRef(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const initialZoom = parseInt(searchParams.get("zoom")) || 14;

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

    useEffect(() => {
        if (highlight) {
            setMarkerIcon(highlightIcon);

            setTimeout(() => {
                setMarkerIcon(defaultIcon);
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

                        // if (mapRef.current) {
                        //     mapRef.current.setView([lat, lng], zoom, { animate: true });
                        // }
                        setCurrentPosition([lat, lng]); // MapController sẽ xử lý pan/fly

                    } catch (err) {
                        console.error("Lỗi khi lấy địa chỉ từ URL:", err);
                    }
                };

                fetchAddress();
            }
        }
    }, []);

    // Thêm logo các trường đại học từng trường hiển thị trên map
    // useEffect(() => {
    //     if (!geoData) return;

    //     const fetchLogos = async () => {
    //         const newLogoMap = {};
    //         for (const feature of geoData.features) {
    //             const wikidata = feature.properties.wikidata;
    //             console.log("wikidata:", wikidata);
    //             if (wikidata && !logoMap[wikidata]) {
    //                 const logoUrl = await getLogoFromWikidata(wikidata);
    //                 console.log(`→ Logo for ${wikidata}: ${logoUrl}`);
    //                 if (logoUrl) {
    //                     newLogoMap[wikidata] = logoUrl;
    //                 }
    //             }
    //         }
    //         setLogoMap((prev) => ({ ...prev, ...newLogoMap }));
    //     };
    //     fetchLogos();
    // }, [geoData]);

    // Hàm xử lý click vào danh sách
    const handleLocationClick = (location, feature) => {
        setPopupInfo(feature); // để popup hiển thị thông tin đúng
        setIsPopupFromMapClick(false);
        setCurrentPosition(location);
        setHighlight(true);

        // if (mapRef.current) {
        //     mapRef.current.flyTo(location, mapRef.current.getZoom(), { animate: true });
        // }

        setTimeout(() => setHighlight(false), 2000);
    };

    const MapClickHandler = ({ onClick }) => {
        useMapEvents({
            click: (e) => {
                const { lat, lng } = e.latlng;
                onClick([lat, lng]);
                // Tắt icon xanh khi click map
                setHighlight(false);
                setMarkerIcon(defaultIcon);
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

    const markers = useMemo(() => {
        if (!geoData) return [];

        return geoData.features
            .map((feature, index) => {
                if (
                    feature.geometry.type !== "Polygon" &&
                    feature.geometry.type !== "MultiPolygon"
                ) return null;

                const bounds = L.geoJSON(feature).getBounds();
                const center = bounds.getCenter();
                const wikidata = feature.properties.wikidata;
                const logoUrl = wikidata ? logoMap[wikidata] : null;

                const icon = logoUrl
                    ? L.icon({
                        iconUrl: logoUrl,
                        iconSize: [40, 40],
                        iconAnchor: [20, 40],
                        popupAnchor: [0, -40],
                    })
                    : universityIcon;

                return (
                    <Marker key={index} position={center} icon={icon}>
                        <Popup>{feature.properties.name || "Trường học"}</Popup>
                    </Marker>
                );
            })
            .filter(Boolean); // Xoá các phần tử null
    }, [geoData, logoMap]);

    // để fetch logo nếu chưa có
    const handleSelectFeature = async (feature) => {
        const wikidata = feature?.properties?.wikidata;
        if (!wikidata || logoMap[wikidata]) return;

        const logo = await getLogoFromWikidata(wikidata);
        if (logo) {
            setLogoMap((prev) => ({ ...prev, [wikidata]: logo }));
        }
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
                        <Marker position={currentPosition} icon={markerIcon}>
                            <Popup>Vị trí tìm kiếm</Popup>
                        </Marker>
                    )
                }

                {/* Hiển thị Marker cho các Polygon và MultiPolygon */}
                {
                    showLayer && markers
                }
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
                height: "500px", border: "none"
            }}>
                <LocationList geoData={geoData} onLocationClick={handleLocationClick} />

            </div>
        </div>
    );
};

export default MapShow;
