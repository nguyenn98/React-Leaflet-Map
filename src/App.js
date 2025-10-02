import './App.css';
import MapView from './layouts/MapView';
import Header from './layouts/Header';

import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import StudyPage from './pages/StudyPage';
import { Routes, Route } from "react-router-dom";  // chỉ cần Routes + Route

function App() {
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<MapView />} />
        <Route path="/study" element={<StudyPage />} />
      </Routes>
    </>
  );
}

export default App;
