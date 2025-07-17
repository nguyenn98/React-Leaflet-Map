import { useRef, useState, useEffect } from 'react';
import '../styles/LocationList.css';
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const LocationList = ({ geoData, onLocationClick, showDirection }) => {
    const contentRef = useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);

    const toggleExpand = () => setIsExpanded(prev => !prev);

    // Reset khi danh sách bị thu gọn
    useEffect(() => {
        if (!isExpanded) {
            setSelectedIndex(null);
        }
    }, [isExpanded]);

    // Reset khi click ra ngoài danh sách
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contentRef.current && !contentRef.current.contains(event.target)) {
                setSelectedIndex(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    if (showDirection) return null;

    return (
        <div
            className="location-list-container"
            style={{
                width: "249px",
                background: "rgb(255,255,255)",
                padding: "10px",
                marginLeft: '-30px',
                borderRadius: "8px",
                boxShadow: "0 0 6px rgba(0,0,0,0.1)",
                overflow: "hidden",
                transition: "max-height 0.3s ease",
                maxHeight: isExpanded ? "500px" : "50px",
            }}
        >
            {/* Header - click to toggle */}
            <div
                onClick={toggleExpand}
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    backgroundColor: isExpanded ? "#f5f5f5" : "#fafafa",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "#333",
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = isExpanded ? "#f5f5f5" : "#fafafa"}
            >
                <span style={{ opacity: 0.9 }}>Danh sách Đại Học</span>
                <span style={{
                    fontSize: "18px",
                    transition: "transform 0.3s ease",
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    opacity: 0.8,
                }}>
                    ▼
                </span>
            </div>


            {/* Danh sách địa điểm */}
            <div
                ref={contentRef}
                style={{
                    overflowY: "auto",
                    maxHeight: "400px",
                    marginTop: isExpanded ? "10px" : "0",
                    transition: "opacity 0.2s ease",
                    opacity: isExpanded ? 1 : 0,
                    pointerEvents: isExpanded ? "auto" : "none",
                }}
            >
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {geoData?.features?.map((feature, index) => {
                        const { type, coordinates } = feature.geometry;
                        let coords;
                        if (type === "Point") {
                            const [lon, lat] = coordinates;
                            coords = [lat, lon];
                        } else if (type === "Polygon" || type === "MultiPolygon") {
                            const bounds = L.geoJSON(feature).getBounds();
                            coords = bounds.getCenter();
                        } else {
                            return null;
                        }

                        return (
                            <li
                                key={index}
                                onClick={() => {
                                    onLocationClick(coords, feature);
                                    setSelectedIndex(index);
                                }}
                                style={{
                                    cursor: "pointer",
                                    padding: "9px",
                                    margin: "6.2px 2px",
                                    background:
                                        selectedIndex === index
                                            ? "#d0ebff"
                                            : "var(--bg, #f4f4f4)",
                                    color: selectedIndex === index ? "#666" : "#222",
                                    borderRadius: "5px",
                                    fontSize: '15px',
                                    fontWeight: selectedIndex === index ? "bold" : "normal",
                                    border: selectedIndex === index ? "1px solid #228be6" : "none",
                                    transition: "background-color 0.2s ease",
                                }}
                                onMouseEnter={e => e.currentTarget.style.setProperty('--bg', '#e6f4ff')}
                                onMouseLeave={e => e.currentTarget.style.setProperty('--bg', '#f4f4f4')}

                            >
                                {feature.properties.name || "Địa điểm không rõ"}
                            </li>

                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default LocationList;



