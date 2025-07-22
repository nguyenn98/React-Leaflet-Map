import { useMap } from "react-leaflet";
import DirectionBox from "./DirectionBox";
import DirectionOverlay from "./DirectionOverlay";

const DirectionWrapper = ({ onStepClick, ...rest }) => {
    const map = useMap();
    return <DirectionOverlay {...rest} map={map} onStepClick={onStepClick}/>;
};

export default DirectionWrapper;
