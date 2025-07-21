import { useMap } from "react-leaflet";
import DirectionBox from "./DirectionBox";

const DirectionWrapper = (props) => {
    const map = useMap();
    return <DirectionBox {...props} map={map} />;
};

export default DirectionWrapper;
