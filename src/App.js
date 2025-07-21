import './App.css';
import MapView from './layouts/MapView';
import Header from './layouts/Header';

import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
function App() {
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });

  return (
    <>
      {/* <Header /> */}
      <MapView />
    </>
  )

}

export default App;
