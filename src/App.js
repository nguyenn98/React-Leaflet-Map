import './App.css';
import MapView from './layouts/MapView';
import Header from './layouts/Header';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import UniversityInfo from './pages/UniversityInfo';
import { Routes, Route } from "react-router-dom";

function App() {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });

  return (
    <div className="app-wrapper">
      <Header />
      <div className="main-scroll-area">
        <Routes>
          <Route path="/" element={<MapView />} />
          <Route path="/universityinfo" element={<UniversityInfo />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

