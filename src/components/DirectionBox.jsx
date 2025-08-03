// import { useState, useEffect } from "react";
// import axios from "axios";
// import {
//     MdClose,
//     MdSearch,
//     MdLocationOn,
//     MdPinDrop,
//     MdDirectionsCar,
//     MdDirectionsTransit,
//     MdDirectionsWalk,
//     MdDirectionsBike,
//     MdSwapVert,
// } from "react-icons/md";
// import RoutingMachine from "./RoutingMachine";
// import '../styles/DirectionBox.css';

// const DirectionBox = ({
//     onClose,
//     onRouteSelected,
//     routeInfo,
//     transportMode,
//     onTransportModeChange,
//     map,
//     from,
//     to,
//     onRouteInfo,
//     onStepClick,
//     setBusRoutes,
//     setAllRoutes  // test
// }) => {
//     const [fromText, setFromText] = useState(""); // Lưu text do người dùng nhập
//     const [toText, setToText] = useState("");     // Lưu text do người dùng nhập
//     const [fromCoords, setFromCoords] = useState(null); // Lưu tọa độ
//     const [toCoords, setToCoords] = useState(null);    // Lưu tọa độ
//     const [localTransportMode, setLocalTransportMode] = useState(transportMode || 'car');

//     // Cập nhật tọa độ khi có giá trị từ bên ngoài
//     useEffect(() => {
//         if (from) setFromCoords(from);
//         if (to) setToCoords(to);
//     }, [from, to]);

//     useEffect(() => {
//         setLocalTransportMode(transportMode || 'car');
//     }, [transportMode]);

//     const transportOptions = [
//         { mode: "car", icon: <MdDirectionsCar />, label: "Ô tô" },
//         { mode: "bus", icon: <MdDirectionsTransit />, label: "Xe buýt" },
//         { mode: "walk", icon: <MdDirectionsWalk />, label: "Đi bộ" },
//         { mode: "bike", icon: <MdDirectionsBike />, label: "Xe đạp" },
//     ];

//     const handleClose = () => {
//         setFromText("");
//         setToText("");
//         setFromCoords(null);
//         setToCoords(null);
//         setLocalTransportMode("car");
//         onClose?.();
//     };

//     const geocode = async (query) => {
//         try {
//             const res = await axios.get("https://nominatim.openstreetmap.org/search", {
//                 params: {
//                     q: query,
//                     format: "json",
//                     limit: 1,
//                 },
//             });

//             if (res.data.length > 0) {
//                 const { lat, lon } = res.data[0];
//                 const latitude = parseFloat(lat);
//                 const longitude = parseFloat(lon);
//                 if (isNaN(latitude) || isNaN(longitude)) {
//                     throw new Error("Invalid coordinates");
//                 }
//                 return [latitude, longitude];
//             }
//         } catch (error) {
//             console.error("Lỗi tìm địa điểm:", error);
//         }

//         return null;
//     };

//     const handleFindRoute = async () => {
//         const fromCoords = await geocode(fromText);
//         const toCoords = await geocode(toText);

//         if (fromCoords && toCoords) {
//             setFromCoords(fromCoords); // Cập nhật tọa độ
//             setToCoords(toCoords);    // Cập nhật tọa độ
//             onRouteSelected?.(fromCoords, toCoords, localTransportMode);
//         } else {
//             alert("Không tìm thấy địa điểm.");
//         }
//     };

//     // Ấn Enter
//     const handleKeyDown = (e) => {
//         if (e.key === 'Enter') {
//             if (fromText.trim() !== '' && toText.trim() !== '') {
//                 handleFindRoute();
//             }
//         }
//     };

//     const handleSwap = () => {
//         setFromText(toText);
//         setToText(fromText);
//         setFromCoords(toCoords);
//         setToCoords(fromCoords);
//     };

//     // Chọn phương tiện di chuyển
//     const handleTransportModeChange = async (mode) => {
//         setLocalTransportMode(mode);
//         onTransportModeChange?.(mode);

//         if (fromCoords && toCoords) {
//             onRouteSelected?.(fromCoords, toCoords, mode);
//         }

//         // 👇 THÊM ĐOẠN NÀY
//         if (mode === "bus") {
//             const { loadAllGtfs, getRouteCoordinates, filterBusRoutesNearPath } = await import("../utils/gtfsUtils");

//             const gtfsData = await loadAllGtfs();
//             const allRoutes = gtfsData.routes.map((route) => {
//                 const coords = getRouteCoordinates(
//                     route.route_id,
//                     gtfsData.routes,
//                     gtfsData.stops,
//                     gtfsData.trips,
//                     gtfsData.stopTimes
//                 );

//                 return {
//                     id: route.route_id,
//                     name: route.route_long_name,
//                     color: route.route_color || "#0066cc",
//                     coordinates: coords,
//                 };
//             }).filter(r => r.coordinates.length > 1);
//             setAllRoutes?.(allRoutes); // ✅ THÊM DÒNG NÀY test


//             if (fromCoords && toCoords) {
//                 // Gọi hàm lọc
//                 const filteredRoutes = filterBusRoutesNearPath(
//                     allRoutes,
//                     [fromCoords, toCoords], // đường A–B
//                     300 // khoảng cách 300m
//                 );
//                 setBusRoutes?.(filteredRoutes);
//             } else {
//                 setBusRoutes?.(allRoutes); // fallback nếu chưa có to/from
//             }
//         }

//     };


//     return (
//         <div
//             style={{ pointerEvents: 'auto', zIndex: 1001 }}
//             onClick={e => e.stopPropagation()}
//             onMouseDown={e => e.stopPropagation()}
//             onTouchStart={e => e.stopPropagation()}
//             onWheel={e => e.stopPropagation()}
//         >
//             <div className="direction-box">
//                 <button className="close-button" onClick={handleClose}>
//                     <MdClose color="#555" size={20} />
//                 </button>

//                 <div className="direction-row">
//                     <MdLocationOn color="#555" size={20} />
//                     <input
//                         type="text"
//                         placeholder="Vị trí của bạn"
//                         value={fromText}
//                         onChange={(e) => setFromText(e.target.value)}
//                         onKeyDown={handleKeyDown}
//                     />
//                     <button className="swap-button" onClick={handleSwap}>
//                         <MdSwapVert size={20} color="#666" />
//                     </button>
//                 </div>

//                 <div
//                     style={{
//                         display: 'flex',
//                         flexDirection: 'column',
//                         alignItems: 'center',
//                         gap: '4px',
//                         position: 'absolute',
//                         top: 49,
//                         left: 24.45,
//                     }}>
//                     {[...Array(3)].map((_, i) => (
//                         <span
//                             key={i}
//                             style={{
//                                 width: '3px',
//                                 height: '3px',
//                                 backgroundColor: 'rgba(97, 94, 94, 1)',
//                                 borderRadius: '50%',
//                                 display: 'inline-block',
//                             }}
//                         ></span>
//                     ))}
//                 </div>



//                 <div className="direction-row">
//                     <MdPinDrop color="#555" size={20} />
//                     <input
//                         type="text"
//                         placeholder="Chọn điểm đến hoặc nhấp bản đồ"
//                         value={toText}
//                         onChange={(e) => setToText(e.target.value)}
//                         onKeyDown={handleKeyDown}
//                     />
//                     <button className="search-button" onClick={handleFindRoute}>
//                         <MdSearch color="#666" size={18} />
//                     </button>
//                 </div>

//                 <div className="transport-options">
//                     {transportOptions.map((t) => (
//                         <button
//                             key={t.mode}
//                             className={`transport-btn ${localTransportMode === t.mode ? "active" : ""}`}
//                             onClick={() => handleTransportModeChange(t.mode)}
//                         >
//                             {t.icon}
//                             <span>{t.label}</span>
//                         </button>
//                     ))}
//                 </div>
//                 <div style={{ marginTop: '-10px', color: '#5f6368' }}>
//                     Quãng đường: {routeInfo ? `${(routeInfo.distance / 1000).toFixed(1)} km` : "-"}
//                 </div>
//                 <div style={{ marginTop: '-10px', color: '#5f6368' }}>
//                     Thời gian ước tính: {routeInfo ? `${Math.round(routeInfo.time / 60)} phút` : "-"}
//                 </div>


//                 {fromCoords && toCoords && map && (
//                     <RoutingMachine
//                         key={`${fromCoords}-${toCoords}-${localTransportMode}`} // ép render lại
//                         from={fromCoords}
//                         to={toCoords}
//                         mode={localTransportMode}
//                         map={map}
//                         onRouteInfo={onRouteInfo}
//                     />
//                 )}
//             </div>
//         </div>
//     );
// };

// export default DirectionBox;


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

// const DirectionBox = ({
//     onClose,
//     onRouteSelected,
//     routeInfo,
//     transportMode,
//     onTransportModeChange,
//     map,
//     from,
//     to,
//     onRouteInfo,
//     onStepClick,
//     setBusRoutes,
//     setAllRoutes
// }) => {
//     const [fromText, setFromText] = useState("");
//     const [toText, setToText] = useState("");
//     const [fromCoords, setFromCoords] = useState(null);
//     const [toCoords, setToCoords] = useState(null);
//     const [localTransportMode, setLocalTransportMode] = useState(transportMode || 'car');

//     useEffect(() => {
//         if (from) setFromCoords(from);
//         if (to) setToCoords(to);
//     }, [from, to]);

//     useEffect(() => {
//         setLocalTransportMode(transportMode || 'car');
//     }, [transportMode]);

//     const transportOptions = [
//         { mode: "car", icon: <MdDirectionsCar />, label: "Ô tô" },
//         { mode: "bus", icon: <MdDirectionsTransit />, label: "Xe buýt" },
//         { mode: "walk", icon: <MdDirectionsWalk />, label: "Đi bộ" },
//         { mode: "bike", icon: <MdDirectionsBike />, label: "Xe đạp" },
//     ];

//     const handleClose = () => {
//         setFromText("");
//         setToText("");
//         setFromCoords(null);
//         setToCoords(null);
//         setLocalTransportMode("car");
//         onClose?.();
//     };

//     const geocode = async (query) => {
//         try {
//             const res = await axios.get("https://nominatim.openstreetmap.org/search", {
//                 params: {
//                     q: query,
//                     format: "json",
//                     limit: 1,
//                 },
//             });

//             if (res.data.length > 0) {
//                 const { lat, lon } = res.data[0];
//                 const latitude = parseFloat(lat);
//                 const longitude = parseFloat(lon);
//                 if (isNaN(latitude) || isNaN(longitude)) {
//                     throw new Error("Invalid coordinates");
//                 }
//                 return [latitude, longitude];
//             }
//         } catch (error) {
//             console.error("Lỗi tìm địa điểm:", error);
//         }

//         return null;
//     };

//     const handleFindRoute = async () => {
//         const from = await geocode(fromText);
//         const to = await geocode(toText);

//         if (from && to) {
//             setFromCoords(from);
//             setToCoords(to);
//             onRouteSelected?.(from, to, localTransportMode);

//             if (localTransportMode === "bus") {
//                 await handleBusRoute(from, to);
//             }
//         } else {
//             alert("Không tìm thấy địa điểm.");
//         }
//     };

//     const handleKeyDown = (e) => {
//         if (e.key === 'Enter') {
//             if (fromText.trim() !== '' && toText.trim() !== '') {
//                 handleFindRoute();
//             }
//         }
//     };

//     const handleSwap = () => {
//         setFromText(toText);
//         setToText(fromText);
//         setFromCoords(toCoords);
//         setToCoords(fromCoords);
//     };

//     const handleTransportModeChange = async (mode) => {
//         setLocalTransportMode(mode);
//         onTransportModeChange?.(mode);

//         if (fromCoords && toCoords) {
//             onRouteSelected?.(fromCoords, toCoords, mode);

//             if (mode === "bus") {
//                 await handleBusRoute(fromCoords, toCoords);
//             }
//         }
//     };

//     const handleBusRoute = async (fromCoords, toCoords) => {
//         console.log("📥 Bắt đầu handleBusRoute từ:", fromCoords, "đến", toCoords);

//         try {
//             const gtfs = await loadGtfsData();
//             console.log("📦 GTFS data:", gtfs);

//             const nearestStart = findNearestStop(fromCoords, gtfs.stops);
//             const nearestEnd = findNearestStop(toCoords, gtfs.stops);
//             console.log("✅ Bến gần nhất:", nearestStart, nearestEnd);

//             const stopTimes = gtfs.stopTimes;
//             const trips = gtfs.trips;

//             const tripsFrom = stopTimes
//                 .filter(s => s.stop_id === nearestStart.stop_id)
//                 .map(s => s.trip_id);
//             console.log("🚌 Trips tại điểm đi:", tripsFrom);

//             const tripsTo = stopTimes
//                 .filter(s => s.stop_id === nearestEnd.stop_id)
//                 .map(s => s.trip_id);
//             console.log("🚌 Trips tại điểm đến:", tripsTo);

//             // Tìm tuyến chung
//             const sharedTrips = tripsFrom.filter(trip => tripsTo.includes(trip));
//             console.log("🔄 Các trip chung:", sharedTrips);

//             if (sharedTrips.length > 0) {
//                 // Tuyến trực tiếp
//                 const routeIds = sharedTrips.map(tripId => {
//                     const trip = trips.find(t => t.trip_id === tripId);
//                     return trip?.route_id;
//                 }).filter(Boolean);

//                 const uniqueRoutes = [...new Set(routeIds)];

//                 const allRoutes = uniqueRoutes.map(routeId => {
//                     const route = gtfs.routes.find(r => r.route_id === routeId);
//                     return {
//                         id: routeId,
//                         name: route?.route_long_name || `Tuyến ${routeId}`,
//                         color: route?.route_color || "#0066cc",
//                         coordinates: getRouteCoordinates(routeId, gtfs.routes, gtfs.stops, gtfs.trips, gtfs.stopTimes)
//                     };
//                 }).filter(r => r.coordinates.length > 1);

//                 setAllRoutes?.(allRoutes);
//                 setBusRoutes?.(allRoutes);
//                 return;
//             }

//             console.warn("⚠️ Không có trip nào chạy qua cả hai bến. Đang tìm cách chuyển tuyến...");

//             // Tìm các điểm stop_id mà các tripFrom đi qua
//             const stopsFrom = new Set(
//                 tripsFrom.flatMap(tripId =>
//                     stopTimes.filter(s => s.trip_id === tripId).map(s => s.stop_id)
//                 )
//             );

//             // Tìm các điểm stop_id mà các tripTo đi qua
//             const stopsTo = new Set(
//                 tripsTo.flatMap(tripId =>
//                     stopTimes.filter(s => s.trip_id === tripId).map(s => s.stop_id)
//                 )
//             );

//             // Tìm điểm giao nhau: stop_id
//             const transferStops = Array.from(stopsFrom).filter(stopId => stopsTo.has(stopId));
//             console.log("🔁 Các điểm chuyển tuyến khả dụng:", transferStops);

//             if (transferStops.length === 0) {
//                 alert("Không có tuyến nào phù hợp.");
//                 return;
//             }

//             const bestTransferStopId = transferStops[0]; // chọn điểm đầu tiên
//             const transferStop = gtfs.stops.find(s => s.stop_id === bestTransferStopId);

//             // // Tìm route từ from → transfer
//             // const firstTripId = stopTimes.find(s => s.stop_id === nearestStart.stop_id && tripsFrom.includes(s.trip_id))?.trip_id;
//             // const firstRouteId = trips.find(t => t.trip_id === firstTripId)?.route_id;

//             // // Tìm route từ transfer → to
//             // const secondTripId = stopTimes.find(s => s.stop_id === nearestEnd.stop_id && tripsTo.includes(s.trip_id))?.trip_id;
//             // const secondRouteId = trips.find(t => t.trip_id === secondTripId)?.route_id;

//             // Trip từ from → transfer
//             const trip1 = tripsFrom.find(tripId =>
//                 stopTimes.some(s => s.trip_id === tripId && s.stop_id === bestTransferStopId)
//             );
//             const trip2 = tripsTo.find(tripId =>
//                 stopTimes.some(s => s.trip_id === tripId && s.stop_id === bestTransferStopId)
//             );

//             if (!trip1 || !trip2) {
//                 alert("Không có tuyến nào phù hợp.");
//                 return;
//             }

//             const firstRouteId = trips.find(t => t.trip_id === trip1)?.route_id;
//             const secondRouteId = trips.find(t => t.trip_id === trip2)?.route_id;


//             const routesFound = [];

//             if (firstRouteId) {
//                 const route = gtfs.routes.find(r => r.route_id === firstRouteId);
//                 routesFound.push({
//                     id: firstRouteId,
//                     name: route?.route_long_name || `Tuyến ${firstRouteId}`,
//                     color: route?.route_color || "#ff9900",
//                     coordinates: getRouteCoordinates(firstRouteId, gtfs.routes, gtfs.stops, gtfs.trips, gtfs.stopTimes)
//                 });
//             }

//             if (secondRouteId && secondRouteId !== firstRouteId) {
//                 const route = gtfs.routes.find(r => r.route_id === secondRouteId);
//                 routesFound.push({
//                     id: secondRouteId,
//                     name: route?.route_long_name || `Tuyến ${secondRouteId}`,
//                     color: route?.route_color || "#00cc66",
//                     coordinates: getRouteCoordinates(secondRouteId, gtfs.routes, gtfs.stops, gtfs.trips, gtfs.stopTimes)
//                 });
//             }

//             console.log("🛣️ Routes tìm được:", routesFound);
//             setAllRoutes?.(routesFound);
//             setBusRoutes?.(routesFound);

//         } catch (error) {
//             console.error("❌ Lỗi khi xử lý handleBusRoute:", error);
//             alert("Đã xảy ra lỗi khi tìm đường đi bằng xe buýt.");
//         }
//     };


//     console.log("📥 Bắt đầu handleBusRoute từ:", JSON.stringify(fromCoords), "đến", JSON.stringify(toCoords));

//     return (
//         <div
//             style={{ pointerEvents: 'auto', zIndex: 1001 }}
//             onClick={e => e.stopPropagation()}
//             onMouseDown={e => e.stopPropagation()}
//             onTouchStart={e => e.stopPropagation()}
//             onWheel={e => e.stopPropagation()}
//         >
//             <div className="direction-box">
//                 <button className="close-button" onClick={handleClose}>
//                     <MdClose color="#555" size={20} />
//                 </button>

//                 <div className="direction-row">
//                     <MdLocationOn color="#555" size={20} />
//                     <input
//                         type="text"
//                         placeholder="Vị trí của bạn"
//                         value={fromText}
//                         onChange={(e) => setFromText(e.target.value)}
//                         onKeyDown={handleKeyDown}
//                     />
//                     <button className="swap-button" onClick={handleSwap}>
//                         <MdSwapVert size={20} color="#666" />
//                     </button>
//                 </div>

//                 <div
//                     style={{
//                         display: 'flex',
//                         flexDirection: 'column',
//                         alignItems: 'center',
//                         gap: '4px',
//                         position: 'absolute',
//                         top: 49,
//                         left: 24.45,
//                     }}>
//                     {[...Array(3)].map((_, i) => (
//                         <span
//                             key={i}
//                             style={{
//                                 width: '3px',
//                                 height: '3px',
//                                 backgroundColor: 'rgba(97, 94, 94, 1)',
//                                 borderRadius: '50%',
//                                 display: 'inline-block',
//                             }}
//                         ></span>
//                     ))}
//                 </div>

//                 <div className="direction-row">
//                     <MdPinDrop color="#555" size={20} />
//                     <input
//                         type="text"
//                         placeholder="Chọn điểm đến hoặc nhấp bản đồ"
//                         value={toText}
//                         onChange={(e) => setToText(e.target.value)}
//                         onKeyDown={handleKeyDown}
//                     />
//                     <button className="search-button" onClick={handleFindRoute}>
//                         <MdSearch color="#666" size={18} />
//                     </button>
//                 </div>

//                 <div className="transport-options">
//                     {transportOptions.map((t) => (
//                         <button
//                             key={t.mode}
//                             className={`transport-btn ${localTransportMode === t.mode ? "active" : ""}`}
//                             onClick={() => handleTransportModeChange(t.mode)}
//                         >
//                             {t.icon}
//                             <span>{t.label}</span>
//                         </button>
//                     ))}
//                 </div>

//                 <div style={{ marginTop: '-10px', color: '#5f6368' }}>
//                     Quãng đường: {routeInfo ? `${(routeInfo.distance / 1000).toFixed(1)} km` : "-"}
//                 </div>
//                 <div style={{ marginTop: '-10px', color: '#5f6368' }}>
//                     Thời gian ước tính: {routeInfo ? `${Math.round(routeInfo.time / 60)} phút` : "-"}
//                 </div>

//                 {fromCoords && toCoords && map && (
//                     <RoutingMachine
//                         key={`${fromCoords}-${toCoords}-${localTransportMode}`}
//                         from={fromCoords}
//                         to={toCoords}
//                         mode={localTransportMode}
//                         map={map}
//                         onRouteInfo={onRouteInfo}
//                     />
//                 )}
//             </div>
//         </div>
//     );
// };

// export default DirectionBox;


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

    const handleBusRoute = async (fromCoords, toCoords) => {
        console.log("📥 Bắt đầu handleBusRoute từ:", fromCoords, "đến", toCoords);

        try {
            const gtfs = await loadGtfsData();
            console.log("📦 GTFS data:", gtfs);

            const nearestStart = findNearestStop(fromCoords, gtfs.stops);
            const nearestEnd = findNearestStop(toCoords, gtfs.stops);
            console.log("✅ Bến gần nhất:", nearestStart, nearestEnd);

            const { stopTimes, trips, routes, stops } = gtfs;

            const tripsFrom = stopTimes.filter(s => s.stop_id === nearestStart.stop_id).map(s => s.trip_id);
            const tripsTo = stopTimes.filter(s => s.stop_id === nearestEnd.stop_id).map(s => s.trip_id);

            const sharedTrips = tripsFrom.filter(trip => tripsTo.includes(trip));

            console.log("✅ Bến gần nhất FROM:", nearestStart);
            console.log("✅ Bến gần nhất TO:", nearestEnd);
            console.log("🚌 Trips from:", tripsFrom);
            console.log("🚌 Trips to:", tripsTo);
            console.log("✅ Shared trips:", sharedTrips);

            if (sharedTrips.length > 0) {
                const routeIds = sharedTrips.map(tripId => trips.find(t => t.trip_id === tripId)?.route_id).filter(Boolean);
                const uniqueRoutes = [...new Set(routeIds)];

                const allRoutes = uniqueRoutes.map(routeId => {
                    const route = routes.find(r => r.route_id === routeId);
                    return {
                        id: routeId,
                        name: route?.route_long_name || `Tuyến ${routeId}`,
                        color: route?.route_color || "#0066cc",
                        coordinates: getRouteCoordinates(routeId, routes, stops, trips, stopTimes)
                    };
                }).filter(r => r.coordinates.length > 1);

                setAllRoutes?.(allRoutes);
                setBusRoutes?.(allRoutes);

                onStepClick?.([
                    {
                        type: "bus",
                        description: `Lên tuyến ${allRoutes[0]?.name || "?"} tại ${nearestStart.stop_name}`,
                    },
                    {
                        type: "bus",
                        description: `Xuống tại ${nearestEnd.stop_name}`,
                    },
                ]);

                return;
            }

            // Nếu không có tuyến trực tiếp, tìm tuyến chuyển tiếp
            const stopsFrom = new Set(tripsFrom.flatMap(tripId => stopTimes.filter(s => s.trip_id === tripId).map(s => s.stop_id)));
            const stopsTo = new Set(tripsTo.flatMap(tripId => stopTimes.filter(s => s.trip_id === tripId).map(s => s.stop_id)));
            const transferStops = Array.from(stopsFrom).filter(stopId => stopsTo.has(stopId));

            console.log("🔁 Đang kiểm tra tuyến chuyển tiếp...");
            console.log("📍 Tất cả stops trong tripsFrom:", Array.from(stopsFrom));
            console.log("📍 Tất cả stops trong tripsTo:", Array.from(stopsTo));
            console.log("📍 Transfer stops chung:", transferStops);

            if (transferStops.length > 0) {
                const bestTransferStopId = transferStops[0];
                const transferStop = stops.find(s => s.stop_id === bestTransferStopId);

                const trip1 = tripsFrom.find(tripId => stopTimes.some(s => s.trip_id === tripId && s.stop_id === bestTransferStopId));
                const trip2 = tripsTo.find(tripId => stopTimes.some(s => s.trip_id === tripId && s.stop_id === bestTransferStopId));

                if (trip1 && trip2) {
                    const firstRouteId = trips.find(t => t.trip_id === trip1)?.route_id;
                    const secondRouteId = trips.find(t => t.trip_id === trip2)?.route_id;

                    const routesFound = [];

                    if (firstRouteId) {
                        const route = routes.find(r => r.route_id === firstRouteId);
                        routesFound.push({
                            id: firstRouteId,
                            name: route?.route_long_name || `Tuyến ${firstRouteId}`,
                            color: route?.route_color || "#ff9900",
                            coordinates: getRouteCoordinates(firstRouteId, routes, stops, trips, stopTimes)
                        });
                    }

                    if (secondRouteId && secondRouteId !== firstRouteId) {
                        const route = routes.find(r => r.route_id === secondRouteId);
                        routesFound.push({
                            id: secondRouteId,
                            name: route?.route_long_name || `Tuyến ${secondRouteId}`,
                            color: route?.route_color || "#00cc66",
                            coordinates: getRouteCoordinates(secondRouteId, routes, stops, trips, stopTimes)
                        });
                    }

                    setAllRoutes?.(routesFound);
                    setBusRoutes?.(routesFound);

                    onStepClick?.([
                        {
                            type: "bus",
                            description: `Lên tuyến ${routesFound[0]?.name || "?"} tại ${nearestStart.stop_name}`,
                        },
                        {
                            type: "transfer",
                            description: `Xuống tại ${transferStop?.stop_name} và chuyển sang tuyến ${routesFound[1]?.name || "?"}`,
                        },
                        {
                            type: "bus",
                            description: `Lên tuyến ${routesFound[1]?.name || "?"} và xuống tại ${nearestEnd.stop_name}`,
                        },
                    ]);

                    return;
                }
            }

            // 🔴 Không có tuyến đi thẳng, không có điểm chung → fallback: gợi ý tuyến gần đúng
            console.warn("⚠️ Không tìm thấy tuyến phù hợp. Gợi ý tuyến gần nhất đi được từ điểm đầu.");

            const firstTrip = tripsFrom[0];
            const routeId = trips.find(t => t.trip_id === firstTrip)?.route_id;

            if (routeId) {
                const route = routes.find(r => r.route_id === routeId);
                const fallbackRoute = {
                    id: routeId,
                    name: route?.route_long_name || `Tuyến ${routeId}`,
                    color: "#999999",
                    coordinates: getRouteCoordinates(routeId, routes, stops, trips, stopTimes)
                };

                setAllRoutes?.([fallbackRoute]);
                setBusRoutes?.([fallbackRoute]);

                onStepClick?.([
                    {
                        type: "bus",
                        description: `Không có tuyến nào đi đến ${nearestEnd.stop_name}. Gợi ý: bắt tuyến ${fallbackRoute.name} tại ${nearestStart.stop_name}`,
                    },
                    {
                        type: "walk",
                        description: `Đi bộ đến điểm đến từ tuyến gần nhất.`,
                    },
                ]);
            } else {
                alert("Không tìm thấy tuyến xe buýt phù hợp.");
            }

        } catch (error) {
            console.error("❌ Lỗi khi xử lý handleBusRoute:", error);
            alert("Đã xảy ra lỗi khi tìm đường đi bằng xe buýt.");
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
