import { useState, useEffect } from "react";
import { useMap } from "react-leaflet";
import { MdOutlineShare, MdClose } from 'react-icons/md';
import ReactDOM from "react-dom";
import "../styles/LocationPopup.css";

const LocationPopup = ({ info, onClose }) => {
    const map = useMap();
    const [showToast, setShowToast] = useState(false);

    if (!info) return null;

    const handleShare = () => {
        const { lat, lng } = info;
        const zoom = 17;
        const url = `http://localhost:3000/?vitri=${lat},${lng}&zoom=${zoom}`;
        navigator.clipboard.writeText(url);
        map.flyTo([lat, lng], zoom);

        // Hiện thông báo đã sao chép
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
    };

    const getDetailAddress = (name, address) => {
        let detail = address;
        if (address.startsWith(name + ',')) {
            detail = address.slice(name.length + 2);
        }
        return detail.replace(/\d{5,6}(, )?/g, '').trim();
    };

    const popup = (
        <div className="fixed-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-content">
                <img
                    src="https://maps.gstatic.com/tactile/reveal/no_street_view_1x_030525.png"
                    alt="thumbnail"
                    style={{ width: '84px', height: '105px', marginRight: '9px' }}
                />
                <div className="popupText">
                    <div style={{ height: '99px', width: '185px' }}>
                        <div className="title">{info.name || "Vị trí không rõ"}</div>
                        <div className="address">{getDetailAddress(info.name || "", info.address || "")}</div>
                        <hr style={{ marginTop: '2.5px' }} className="line" />
                        <div className="coords">
                            {info.lat?.toFixed(6)}, {info.lng?.toFixed(6)}
                        </div>
                    </div>
                </div>
                <div className="actions">
                    <button type="button" className="share" onClick={handleShare}>
                        <MdOutlineShare />
                    </button>
                    <button type="button" className="close" onClick={onClose}>
                        <MdClose />
                    </button>
                </div>
            </div>
        </div>
    );
    return ReactDOM.createPortal(
        <>
            {popup}
            {showToast && (
                <div className="popup-toast">
                    Đã sao chép liên kết!
                </div>
            )}
        </>,
        document.body
    );
};

export default LocationPopup;