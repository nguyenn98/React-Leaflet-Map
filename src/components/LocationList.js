import React from 'react'
import '../styles/LocationList.css';
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const LocationList = ({ geoData, onLocationClick }) => {
    return (
        <div className="location-list"
            style={{
                width: "250px", height: "100%", overflowY: "auto",
                background: "#fff", padding: "10px",
                borderRadius: "3px", border: "none"
            }}>
            <h3>Danh sách địa điểm</h3>
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
                                    cursor: "pointer", padding: "8px", margin: "5px 0",
                                    background: "#f4f4f4", borderRadius: "5px"
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