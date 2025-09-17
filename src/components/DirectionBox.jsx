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

import {
    loadGtfsData,
    findNearestStop,
    findRoutesBetweenStops,
    getRouteCoordinates,
} from "../utils/gtfsBusPlanner";

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
    setBusRoutes,
    setAllRoutes
}) => {
    const [fromText, setFromText] = useState("");
    const [toText, setToText] = useState("");
    const [fromCoords, setFromCoords] = useState(null);
    const [toCoords, setToCoords] = useState(null);
    const [localTransportMode, setLocalTransportMode] = useState(transportMode || 'car');

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
        const from = await geocode(fromText);
        const to = await geocode(toText);

        if (from && to) {
            setFromCoords(from);
            setToCoords(to);
            onRouteSelected?.(from, to, localTransportMode);

            if (localTransportMode === "bus") {
                await handleBusRoute(from, to);
            }
        } else {
            alert("Không tìm thấy địa điểm.");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (fromText.trim() !== '' && toText.trim() !== '') {
                handleFindRoute();
            }
        }
    };

    const handleSwap = () => {
        setFromText(toText);
        setToText(fromText);
        setFromCoords(toCoords);
        setToCoords(fromCoords);
    };

    const handleTransportModeChange = async (mode) => {
        setLocalTransportMode(mode);
        onTransportModeChange?.(mode);

        if (fromCoords && toCoords) {
            onRouteSelected?.(fromCoords, toCoords, mode);

            if (mode === "bus") {
                await handleBusRoute(fromCoords, toCoords);
            }
        }
    };

    // const handleBusRoute = async (fromCoords, toCoords) => {
    //     console.log("📥 Bắt đầu handleBusRoute từ:", fromCoords, "đến", toCoords);

    //     try {
    //         const gtfs = await loadGtfsData();
    //         console.log("📦 GTFS data:", gtfs);

    //         const nearestStart = findNearestStop(fromCoords, gtfs.stops);
    //         const nearestEnd = findNearestStop(toCoords, gtfs.stops);
    //         console.log("✅ Bến gần nhất:", nearestStart, nearestEnd);

    //         const { stopTimes, trips, routes, stops } = gtfs;

    //         const tripsFrom = stopTimes.filter(s => s.stop_id === nearestStart.stop_id).map(s => s.trip_id);
    //         const tripsTo = stopTimes.filter(s => s.stop_id === nearestEnd.stop_id).map(s => s.trip_id);

    //         const sharedTrips = tripsFrom.filter(trip => tripsTo.includes(trip));

    //         console.log("✅ Bến gần nhất FROM:", nearestStart);
    //         console.log("✅ Bến gần nhất TO:", nearestEnd);
    //         console.log("🚌 Trips from:", tripsFrom);
    //         console.log("🚌 Trips to:", tripsTo);
    //         console.log("✅ Shared trips:", sharedTrips);

    //         if (sharedTrips.length > 0) {
    //             const routeIds = sharedTrips.map(tripId => trips.find(t => t.trip_id === tripId)?.route_id).filter(Boolean);
    //             const uniqueRoutes = [...new Set(routeIds)];

    //             const allRoutes = uniqueRoutes.map(routeId => {
    //                 const route = routes.find(r => r.route_id === routeId);
    //                 return {
    //                     id: routeId,
    //                     name: route?.route_long_name || `Tuyến ${routeId}`,
    //                     color: route?.route_color || "#0066cc",
    //                     coordinates: getRouteCoordinates(routeId, routes, stops, trips, stopTimes)
    //                 };
    //             }).filter(r => r.coordinates.length > 1);

    //             setAllRoutes?.(allRoutes);
    //             setBusRoutes?.(allRoutes);

    //             onStepClick?.([
    //                 {
    //                     type: "bus",
    //                     description: `Lên tuyến ${allRoutes[0]?.name || "?"} tại ${nearestStart.stop_name}`,
    //                 },
    //                 {
    //                     type: "bus",
    //                     description: `Xuống tại ${nearestEnd.stop_name}`,
    //                 },
    //             ]);

    //             return;
    //         }

    //         // Nếu không có tuyến trực tiếp, tìm tuyến chuyển tiếp
    //         const stopsFrom = new Set(tripsFrom.flatMap(tripId => stopTimes.filter(s => s.trip_id === tripId).map(s => s.stop_id)));
    //         const stopsTo = new Set(tripsTo.flatMap(tripId => stopTimes.filter(s => s.trip_id === tripId).map(s => s.stop_id)));
    //         const transferStops = Array.from(stopsFrom).filter(stopId => stopsTo.has(stopId));

    //         console.log("🔁 Đang kiểm tra tuyến chuyển tiếp...");
    //         console.log("📍 Tất cả stops trong tripsFrom:", Array.from(stopsFrom));
    //         console.log("📍 Tất cả stops trong tripsTo:", Array.from(stopsTo));
    //         console.log("📍 Transfer stops chung:", transferStops);

    //         if (transferStops.length > 0) {
    //             const bestTransferStopId = transferStops[0];
    //             const transferStop = stops.find(s => s.stop_id === bestTransferStopId);

    //             const trip1 = tripsFrom.find(tripId => stopTimes.some(s => s.trip_id === tripId && s.stop_id === bestTransferStopId));
    //             const trip2 = tripsTo.find(tripId => stopTimes.some(s => s.trip_id === tripId && s.stop_id === bestTransferStopId));

    //             if (trip1 && trip2) {
    //                 const firstRouteId = trips.find(t => t.trip_id === trip1)?.route_id;
    //                 const secondRouteId = trips.find(t => t.trip_id === trip2)?.route_id;

    //                 const routesFound = [];

    //                 if (firstRouteId) {
    //                     const route = routes.find(r => r.route_id === firstRouteId);
    //                     routesFound.push({
    //                         id: firstRouteId,
    //                         name: route?.route_long_name || `Tuyến ${firstRouteId}`,
    //                         color: route?.route_color || "#ff9900",
    //                         coordinates: getRouteCoordinates(firstRouteId, routes, stops, trips, stopTimes)
    //                     });
    //                 }

    //                 if (secondRouteId && secondRouteId !== firstRouteId) {
    //                     const route = routes.find(r => r.route_id === secondRouteId);
    //                     routesFound.push({
    //                         id: secondRouteId,
    //                         name: route?.route_long_name || `Tuyến ${secondRouteId}`,
    //                         color: route?.route_color || "#00cc66",
    //                         coordinates: getRouteCoordinates(secondRouteId, routes, stops, trips, stopTimes)
    //                     });
    //                 }

    //                 setAllRoutes?.(routesFound);
    //                 setBusRoutes?.(routesFound);

    //                 onStepClick?.([
    //                     {
    //                         type: "bus",
    //                         description: `Lên tuyến ${routesFound[0]?.name || "?"} tại ${nearestStart.stop_name}`,
    //                     },
    //                     {
    //                         type: "transfer",
    //                         description: `Xuống tại ${transferStop?.stop_name} và chuyển sang tuyến ${routesFound[1]?.name || "?"}`,
    //                     },
    //                     {
    //                         type: "bus",
    //                         description: `Lên tuyến ${routesFound[1]?.name || "?"} và xuống tại ${nearestEnd.stop_name}`,
    //                     },
    //                 ]);

    //                 return;
    //             }
    //         }

    //         // 🔴 Không có tuyến đi thẳng, không có điểm chung → fallback: gợi ý tuyến gần đúng
    //         console.warn("⚠️ Không tìm thấy tuyến phù hợp. Gợi ý tuyến gần nhất đi được từ điểm đầu.");

    //         const firstTrip = tripsFrom[0];
    //         const routeId = trips.find(t => t.trip_id === firstTrip)?.route_id;

    //         if (routeId) {
    //             const route = routes.find(r => r.route_id === routeId);
    //             const fallbackRoute = {
    //                 id: routeId,
    //                 name: route?.route_long_name || `Tuyến ${routeId}`,
    //                 color: "#999999",
    //                 coordinates: getRouteCoordinates(routeId, routes, stops, trips, stopTimes)
    //             };

    //             setAllRoutes?.([fallbackRoute]);
    //             setBusRoutes?.([fallbackRoute]);

    //             onStepClick?.([
    //                 {
    //                     type: "bus",
    //                     description: `Không có tuyến nào đi đến ${nearestEnd.stop_name}. Gợi ý: bắt tuyến ${fallbackRoute.name} tại ${nearestStart.stop_name}`,
    //                 },
    //                 {
    //                     type: "walk",
    //                     description: `Đi bộ đến điểm đến từ tuyến gần nhất.`,
    //                 },
    //             ]);
    //         } else {
    //             alert("Không tìm thấy tuyến xe buýt phù hợp.");
    //         }

    //     } catch (error) {
    //         console.error("❌ Lỗi khi xử lý handleBusRoute:", error);
    //         alert("Đã xảy ra lỗi khi tìm đường đi bằng xe buýt.");
    //     }
    // };

    // Hàm lấy polyline từ trip
    const drawTrip = (trip, gtfs) => {
        if (!trip) {
            console.warn("⚠️ Không có trip để vẽ");
            return null;
        }

        // Lấy shape tương ứng
        const shape = gtfs.shapes[trip.shape_id];
        if (!shape || shape.length === 0) {
            console.warn("⚠️ Không có shape cho trip:", trip.trip_id);
            return null;
        }

        const polyline = shape.map(([lat, lon]) => [lat, lon]);
        console.log(`✏️ Vẽ trip ${trip.trip_id}, ${polyline.length} điểm`);

        return {
            type: "trip",
            trip,
            polyline,
        };
    };

    // Hàm vẽ 2 đoạn khi phải chuyển tuyến
    const drawTransfer = (fromStop, toStop, transferStopId, gtfs) => {
        console.log("✏️ Vẽ tuyến chuyển tiếp qua:", transferStopId);

        // 1. Trip đi từ FROM → transfer
        const tripsFrom = gtfs.stopTimes.filter(st => st.stop_id === fromStop.stop_id).map(st => st.trip_id);
        const tripsToTransfer = gtfs.stopTimes.filter(st => st.stop_id === transferStopId).map(st => st.trip_id);
        const sharedTripFrom = tripsFrom.find(tid => tripsToTransfer.includes(tid));

        let polyline1 = [];
        if (sharedTripFrom) {
            const trip1 = gtfs.trips.find(t => t.trip_id === sharedTripFrom);
            const shape1 = gtfs.shapes[trip1.shape_id];
            if (shape1) polyline1 = shape1.map(([lat, lon]) => [lat, lon]);
        }

        // 2. Trip đi từ transfer → TO
        const tripsFromTransfer = gtfs.stopTimes.filter(st => st.stop_id === transferStopId).map(st => st.trip_id);
        const tripsTo = gtfs.stopTimes.filter(st => st.stop_id === toStop.stop_id).map(st => st.trip_id);
        const sharedTripTo = tripsFromTransfer.find(tid => tripsTo.includes(tid));

        let polyline2 = [];
        if (sharedTripTo) {
            const trip2 = gtfs.trips.find(t => t.trip_id === sharedTripTo);
            const shape2 = gtfs.shapes[trip2.shape_id];
            if (shape2) polyline2 = shape2.map(([lat, lon]) => [lat, lon]);
        }

        return {
            type: "transfer",
            transferStopId,
            parts: [
                { polyline: polyline1, via: transferStopId },
                { polyline: polyline2, via: toStop.stop_id },
            ],
        };
    };


    const handleBusRoute = async (fromCoords, toCoords) => {
        console.log("📥 Bắt đầu handleBusRoute từ:", fromCoords, "đến", toCoords);

        try {
            const gtfs = await loadGtfsData();
            console.log("📦 GTFS data:", gtfs);

            const nearestStart = findNearestStop(fromCoords, gtfs.stops);
            const nearestEnd = findNearestStop(toCoords, gtfs.stops);

            console.log("✅ Bến gần nhất FROM:", nearestStart);
            console.log("✅ Bến gần nhất TO:", nearestEnd);

            // --- Step 1: Shared trip ---
            const tripsFrom = gtfs.stopTimes
                .filter(st => st.stop_id === nearestStart.stop_id)
                .map(st => st.trip_id);

            const tripsTo = gtfs.stopTimes
                .filter(st => st.stop_id === nearestEnd.stop_id)
                .map(st => st.trip_id);

            console.log("🚌 Trips from:", tripsFrom);
            console.log("🚌 Trips to:", tripsTo);

            const sharedTrips = tripsFrom.filter(tid => tripsTo.includes(tid));

            if (sharedTrips.length > 0) {
                console.log("✅ Có trip chung:", sharedTrips[0]);
                const trip = gtfs.trips.find(t => t.trip_id === sharedTrips[0]);
                return drawTrip(trip, gtfs); // hàm vẽ trip từ shapes
            }

            // --- Step 2: Shared route_id ---
            const routesFrom = tripsFrom.map(tid => gtfs.trips.find(t => t.trip_id === tid)?.route_id);
            const routesTo = tripsTo.map(tid => gtfs.trips.find(t => t.trip_id === tid)?.route_id);

            const sharedRoutes = routesFrom.filter(rid => routesTo.includes(rid));
            if (sharedRoutes.length > 0) {
                console.log("✅ Có tuyến chung (khác chiều):", sharedRoutes[0]);
                const trip = gtfs.trips.find(t => t.route_id === sharedRoutes[0]);
                return drawTrip(trip, gtfs);
            }

            // --- Step 3: Transfer ---
            console.log("🔁 Đang kiểm tra tuyến chuyển tiếp...");
            const stopsFromTrips = tripsFrom.flatMap(tid =>
                gtfs.stopTimes.filter(st => st.trip_id === tid).map(st => st.stop_id)
            );
            const stopsToTrips = tripsTo.flatMap(tid =>
                gtfs.stopTimes.filter(st => st.trip_id === tid).map(st => st.stop_id)
            );

            const transferStops = stopsFromTrips.filter(sid => stopsToTrips.includes(sid));
            if (transferStops.length > 0) {
                console.log("✅ Có điểm chuyển tiếp:", transferStops[0]);
                // TODO: vẽ 2 đoạn: FROM → transfer, transfer → TO
                return drawTransfer(nearestStart, nearestEnd, transferStops[0], gtfs);
            }

            // --- Step 4: Fallback ---
            console.warn("⚠️ Không tìm thấy tuyến phù hợp. Gợi ý tuyến gần nhất đi được từ điểm đầu.");
            const fallbackTrip = gtfs.trips.find(t => tripsFrom.includes(t.trip_id));
            return drawTrip(fallbackTrip, gtfs);

        } catch (err) {
            console.error("❌ Lỗi handleBusRoute:", err);
        }
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
                        onKeyDown={handleKeyDown}
                    />
                    <button className="swap-button" onClick={handleSwap}>
                        <MdSwapVert size={20} color="#666" />
                    </button>
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        position: 'absolute',
                        top: 49,
                        left: 24.45,
                    }}>
                    {[...Array(3)].map((_, i) => (
                        <span
                            key={i}
                            style={{
                                width: '3px',
                                height: '3px',
                                backgroundColor: 'rgba(97, 94, 94, 1)',
                                borderRadius: '50%',
                                display: 'inline-block',
                            }}
                        ></span>
                    ))}
                </div>

                <div className="direction-row">
                    <MdPinDrop color="#555" size={20} />
                    <input
                        type="text"
                        placeholder="Chọn điểm đến hoặc nhấp bản đồ"
                        value={toText}
                        onChange={(e) => setToText(e.target.value)}
                        onKeyDown={handleKeyDown}
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

                <div style={{ marginTop: '-10px', color: '#5f6368' }}>
                    Quãng đường: {routeInfo ? `${(routeInfo.distance / 1000).toFixed(1)} km` : "-"}
                </div>
                <div style={{ marginTop: '-10px', color: '#5f6368' }}>
                    Thời gian ước tính: {routeInfo ? `${Math.round(routeInfo.time / 60)} phút` : "-"}
                </div>

                {fromCoords && toCoords && map && (
                    <RoutingMachine
                        key={`${fromCoords}-${toCoords}-${localTransportMode}`}
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