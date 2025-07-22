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
import RoutingMachine from "./RoutingMachine";
import '../styles/DirectionBox.css';

const DirectionBox = ({
    onClose,
    onRouteSelected,
    routeInfo,
    transportMode,
    onTransportModeChange,
    map,
    from,
    to,
    onRouteInfo,
    onStepClick,
}) => {
    const [fromText, setFromText] = useState(""); // Lưu text do người dùng nhập
    const [toText, setToText] = useState("");     // Lưu text do người dùng nhập
    const [fromCoords, setFromCoords] = useState(null); // Lưu tọa độ
    const [toCoords, setToCoords] = useState(null);    // Lưu tọa độ
    const [localTransportMode, setLocalTransportMode] = useState(transportMode || 'car');

    // Cập nhật tọa độ khi có giá trị từ bên ngoài
    useEffect(() => {
        if (from) setFromCoords(from);
        if (to) setToCoords(to);
    }, [from, to]);

    useEffect(() => {
        setLocalTransportMode(transportMode || 'car');
    }, [transportMode]);

    const transportOptions = [
        { mode: "car", icon: <MdDirectionsCar />, label: "Ô tô" },
        { mode: "bus", icon: <MdDirectionsTransit />, label: "Xe buýt" },
        { mode: "walk", icon: <MdDirectionsWalk />, label: "Đi bộ" },
        { mode: "bike", icon: <MdDirectionsBike />, label: "Xe đạp" },
    ];

    const handleClose = () => {
        setFromText("");
        setToText("");
        setFromCoords(null);
        setToCoords(null);
        setLocalTransportMode("car");
        onClose?.();
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
                if (isNaN(latitude) || isNaN(longitude)) {
                    throw new Error("Invalid coordinates");
                }
                return [latitude, longitude];
            }
        } catch (error) {
            console.error("Lỗi tìm địa điểm:", error);
        }

        return null;
    };

    const handleFindRoute = async () => {
        const fromCoords = await geocode(fromText);
        const toCoords = await geocode(toText);

        if (fromCoords && toCoords) {
            setFromCoords(fromCoords); // Cập nhật tọa độ
            setToCoords(toCoords);    // Cập nhật tọa độ
            onRouteSelected?.(fromCoords, toCoords, localTransportMode);
        } else {
            alert("Không tìm thấy địa điểm.");
        }
    };

    const handleSwap = () => {
        setFromText(toText);
        setToText(fromText);
        setFromCoords(toCoords);
        setToCoords(fromCoords);
    };

    const handleTransportModeChange = (mode) => {
        setLocalTransportMode(mode);
        onTransportModeChange?.(mode);
    };

    return (
        <div
            style={{ pointerEvents: 'auto', zIndex: 1001 }}
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            onTouchStart={e => e.stopPropagation()}
            onWheel={e => e.stopPropagation()}
        >
            <div className="direction-box">
                <button className="close-button" onClick={handleClose}>
                    <MdClose color="#555" size={20} />
                </button>

                <div className="direction-row">
                    <MdLocationOn color="#555" size={20} />
                    <input
                        type="text"
                        placeholder="Vị trí của bạn"
                        value={fromText}
                        onChange={(e) => setFromText(e.target.value)}
                    />
                    <button className="swap-button" onClick={handleSwap}>
                        <MdSwapVert size={20} color="#666" />
                    </button>
                </div>

                <div className="direction-row">
                    <MdPinDrop color="#555" size={20} />
                    <input
                        type="text"
                        placeholder="Chọn điểm đến hoặc nhấp bản đồ"
                        value={toText}
                        onChange={(e) => setToText(e.target.value)}
                    />
                    <button className="search-button" onClick={handleFindRoute}>
                        <MdSearch color="#666" size={18} />
                    </button>
                </div>

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

                {/* {routeInfo && (
                    <div className="route-info">
                        <div className="route-summary">
                            <strong>Khoảng cách:</strong> {(routeInfo.distance / 1000).toFixed(2)} km<br />
                            <strong>Thời gian ước tính:</strong> {Math.round(routeInfo.time / 60)} phút
                        </div>
                        <ol className="route-steps">
                            {routeInfo.steps.map((step, i) => (
                                <li
                                    key={i}
                                    className="route-step"
                                    onClick={() => onStepClick?.(step, i)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {step.text} – {step.distance.toFixed(0)} m
                                </li>
                            ))}
                        </ol>
                    </div>
                )} */}

                {fromCoords && toCoords && map && (
                    <RoutingMachine
                        from={fromCoords}
                        to={toCoords}
                        mode={localTransportMode}
                        map={map}
                        onRouteInfo={onRouteInfo}
                    />
                )}
            </div>
        </div>
    );
};

export default DirectionBox;