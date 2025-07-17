import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import SearchBox from "../components/SearchBox";
import MapShow from "../components/MapShow";

const MapView = () => {
  const [geoData, setGeoData] = useState(null);
  const [position, setPosition] = useState([21.028511, 105.804817]); // Hà Nội
  const [highlight, setHighlight] = useState(false);

  const [showDirection, setShowDirection] = useState(false);

  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        const response = await fetch(process.env.PUBLIC_URL + "/data/universities.geojson");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setGeoData(data);
      } catch (error) {
        console.error("Lỗi khi load GeoJSON:", error);
      }
    };
    fetchGeoJSON();
  }, []);

  return (
    <div>
      {/* <SearchBox onSearch={setPosition} /> */}
      {
        !showDirection &&
        <SearchBox onSearch={(pos) => { setPosition(pos); setHighlight(true); }} />
      }
      <MapShow
        position={position}
        geoData={geoData}
        highlight={highlight}
        setHighlight={setHighlight}
        showDirection={showDirection}
        setShowDirection={setShowDirection}
      />

    </div>
  );
};

export default MapView;
