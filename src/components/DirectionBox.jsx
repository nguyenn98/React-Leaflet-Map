import { useState, useEffect } from "react";
import axios from "axios";
import {
    MdClose,
    MdSearch,
    MdLocationOn,
    MdPinDrop,
    MdDirectionsCar,
    MdDirectionsTransit,
    MdDirectionsWalk,
    MdDirectionsBike,
    MdSwapVert,
} from "react-icons/md";

import '../styles/DirectionBox.css';

const DirectionBox = ({ onClose, onRouteSelected, routeInfo, transportMode, onTransportModeChange }) => {
    const [fromText, setFromText] = useState("");
    const [toText, setToText] = useState("");
    const [localTransportMode, setLocalTransportMode] = useState(transportMode || 'car');

    const transportOptions = [
        { mode: "car", icon: <MdDirectionsCar />, label: "Ô tô", speed: 40 },
        { mode: "bus", icon: <MdDirectionsTransit />, label: "Xe buýt", speed: 20 },
        { mode: "walk", icon: <MdDirectionsWalk />, label: "Đi bộ", speed: 5 },
        { mode: "bike", icon: <MdDirectionsBike />, label: "Xe đạp", speed: 15 },
    ];

    // Đồng bộ localTransportMode với transportMode từ props
    useEffect(() => {
        setLocalTransportMode(transportMode || 'car');
    }, [transportMode]);

    // Hàm đóng DirectionBox và reset state
    const handleClose = () => {
        setFromText("");
        setToText("");
        setLocalTransportMode("car");
        onClose();
    };

    const geocode = async (query) => {
        try {
            const res = await axios.get("https://nominatim.openstreetmap.org/search", {
                params: {
                    q: query,
                    format: "json",
                    limit: 1,
                },
            });

            if (res.data.length > 0) {
                const { lat, lon } = res.data[0];
                const latitude = parseFloat(lat);
                const longitude = parseFloat(lon);
                if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
                    throw new Error("Tọa độ không hợp lệ");
                }
                return [latitude, longitude];
            }
        } catch (error) {
            console.error("Lỗi khi tìm kiếm địa điểm:", error);
        }

        return null;
    };

    const handleFindRoute = async () => {
        const from = await geocode(fromText);
        const to = await geocode(toText);

        if (from && to) {
            onRouteSelected(from, to, transportMode);
        } else {
            alert("Không tìm thấy địa điểm. Hãy kiểm tra lại.");
        }
    };

    const handleSwap = () => {
        setFromText(toText);
        setToText(fromText);
    };

    // Hàm chọn phương tiện di chuyển
    const handleTransportModeChange = (mode) => {
        setLocalTransportMode(mode);
        onTransportModeChange(mode); // Cập nhật transportMode trong MapShow
    };

    return (
        <div className="direction-box">
            {/* Nút đóng */}
            <button className="close-button" onClick={handleClose}>
                <MdClose color="#555" size={20} />
            </button>

            {/* Input: Vị trí xuất phát */}
            <div className="direction-row">
                <MdLocationOn color="#555" size={20} />
                <input
                    type="text"
                    placeholder="Vị trí của bạn"
                    value={fromText}
                    onChange={(e) => setFromText(e.target.value)}
                />
                <button className="swap-button" onClick={handleSwap} title="Đổi vị trí">
                    <MdSwapVert size={20} color="#666" />
                </button>
            </div>

            {/* Input: Điểm đến */}
            <div className="direction-row">
                <MdPinDrop color="#555" size={20} />
                <input
                    type="text"
                    placeholder="Chọn điểm đến hoặc nhấp vào bản đồ"
                    value={toText}
                    onChange={(e) => setToText(e.target.value)}
                />
                <button className="search-button" onClick={handleFindRoute}>
                    <MdSearch color="#666" size={18} />
                </button>
            </div>

            {/* Chọn phương tiện di chuyển */}
            <div className="transport-options">
                {transportOptions.map((t) => (
                    <button
                        key={t.mode}
                        className={`transport-btn ${localTransportMode === t.mode ? "active" : ""}`}
                        onClick={() => handleTransportModeChange(t.mode)}
                    >
                        {t.icon}
                        <span>{t.label}</span>
                    </button>
                ))}
            </div>

            {/* Hiển thị kết quả đường đi nếu có */}
            {routeInfo && (
                <div className="route-info">
                    <div className="route-summary">
                        <strong>Khoảng cách:</strong> {(routeInfo.distance / 1000).toFixed(2)} km<br />
                        <strong>Thời gian ước tính:</strong> {Math.round(routeInfo.time / 60)} phút
                    </div>
                    <ol className="route-steps">
                        {routeInfo.steps.map((step, i) => (
                            <li key={i}>
                                {step.text} – {step.distance.toFixed(0)} m
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
};

export default DirectionBox;
