import React from 'react'
import '../styles/LocationList.css';
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const LocationList = ({ geoData, onLocationClick }) => {
    return (
        <div className="location-list"
            style={{
                width: "249px", height: "100%", overflowY: "auto",
                background: "#fff", padding: "10px", marginLeft: '-30px',
                borderTopLeftRadius: "5px", borderTopRightRadius: "5px", border: "none"
            }}>
            <h3 style={{ marginLeft: '4px' }}>Danh sách Đại Học</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {
                    geoData?.features?.map((feature, index) => {
                        const { type, coordinates } = feature.geometry;
                        let coords;
                        if (type === "Point") {
                            const [lon, lat] = coordinates;
                            coords = [lat, lon];   // Đổi từ [lon, lat] sang [lat, lon]
                        } else if (type === "Polygon" || type === "MultiPolygon") {
                            const bounds = L.geoJSON(feature).getBounds();
                            coords = bounds.getCenter();
                        } else {
                            return null;
                        }

                        return (
                            <li key={index}
                                onClick={() => onLocationClick(coords)}
                                style={{
                                    cursor: "pointer", padding: "9px", margin: "6px 2px",
                                    background: "#f4f4f4", borderRadius: "5px", fontSize: '15px'
                                }}
                            >
                                {feature.properties.name || "Địa điểm không rõ"}
                            </li>
                        );
                    })
                }
            </ul>
        </div>
    )
}

export default LocationList