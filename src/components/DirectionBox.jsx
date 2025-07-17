import { useState } from "react";
import axios from "axios";
import { MdClose, MdSearch, MdLocationOn, MdPinDrop, MdSwapVert } from "react-icons/md";

import '../styles/DirectionBox.css';


const DirectionBox = ({ onClose, onRouteSelected }) => {
    const [fromText, setFromText] = useState("");
    const [toText, setToText] = useState("");

    const geocode = async (query) => {
        const res = await axios.get("https://nominatim.openstreetmap.org/search", {
            params: {
                q: query,
                format: "json",
                limit: 1,
            },
        });

        if (res.data.length > 0) {
            const { lat, lon } = res.data[0];
            return [parseFloat(lat), parseFloat(lon)];
        }

        return null;
    };

    const handleFindRoute = async () => {
        const from = await geocode(fromText);
        const to = await geocode(toText);

        if (from && to) {
            onRouteSelected(from, to);
        } else {
            alert("Không tìm thấy địa điểm.");
        }
    };

    const handleSwap = () => {
        const temp = fromText;
        setFromText(toText);
        setToText(temp);
    };

    return (
        // <div className="direction-box">
        //     <div className="direction-header">
        //         <MdLocationOn color="#555" size={20} />
        //         <input
        //             type="text"
        //             placeholder="Vị trí của bạn"
        //             value={fromText}
        //             onChange={(e) => setFromText(e.target.value)}
        //         />
        //         <button onClick={onClose}>
        //             <MdClose color="#666" size={18} />
        //         </button>
        //     </div>

        //     {/* Nút hoán đổi */}
        //     <div className="swap-button-container">
        //         <button className="swap-button" onClick={handleSwap} title="Đổi vị trí">
        //             <MdSwapVert size={22} color="#444" />
        //         </button>
        //     </div>

        //     <div className="direction-body">
        //         <MdPinDrop color="#555" size={20} />
        //         <input
        //             type="text"
        //             placeholder="Chọn điểm đến hoặc nhấp vào bản đồ"
        //             value={toText}
        //             onChange={(e) => setToText(e.target.value)}
        //         />
        //         <button onClick={handleFindRoute}>
        //             <MdSearch color="#666" size={18} />
        //         </button>
        //     </div>
        // </div>
        <div className="direction-box">
            {/* Nút đóng lên góc phải ngoài khung */}
            <button className="close-button" onClick={onClose}>
                <MdClose color="#555" size={20} />
            </button>

            {/* Dòng input đầu: Xuất phát */}
            <div className="direction-row">
                <MdLocationOn color="#555" size={20} />
                <input
                    type="text"
                    placeholder="Vị trí của bạn"
                    value={fromText}
                    onChange={(e) => setFromText(e.target.value)}
                />
                <button className="swap-button" onClick={handleSwap} title="Đổi vị trí">
                    <MdSwapVert size={20} color="#666" />
                </button>
            </div>

            {/* Dòng input đến */}
            <div className="direction-row">
                <MdPinDrop color="#555" size={20} />
                <input
                    type="text"
                    placeholder="Chọn điểm đến hoặc nhấp vào bản đồ"
                    value={toText}
                    onChange={(e) => setToText(e.target.value)}
                />
                <button className="search-button" onClick={handleFindRoute}>
                    <MdSearch color="#666" size={18} />
                </button>
            </div>
        </div>


    );
};

export default DirectionBox;
