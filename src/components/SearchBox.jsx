import React, { useState } from 'react'
import { BsSearch } from "react-icons/bs";

const SearchBox = ({ onSearch }) => {

    const [query, setQuery] = useState("");

    const handleSearch = async () => {
        if (!query) {
            return;
        }

        // Kiểm tra nếu nhập tọa độ (lat, lon)
        const coordRegex = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
        if (coordRegex.test(query)) {
            const [lat, lon] = query.split(",").map((val) => parseFloat(val.trim()));
            onSearch([lat, lon], true);  // true để bật hiệu màu
            return;
        }

        // Tìm kiếm theo địa chỉ
        let url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.length > 0) {
                const { lat, lon } = data[0];
                console.log("Đã tìm kiếm:", lat, lon); // Kiểm tra vị trí
                onSearch([parseFloat(lat), parseFloat(lon)], true);  // true để bật hiệu màu
            } else {
                alert("Không tìm thấy địa điểm!");
            }
        } catch (error) {
            console.error('Lỗi tìm kiếm', error);

        }
    };

    return (
        <div style={{
            position: "absolute", top: 83, left: 13.5,
            zIndex: 1000, background: "white", padding: 10, height: "35px",
            borderRadius: 5, width: "250px", alignItems: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
            <input
                type='text'
                placeholder='Nhập địa điểm hoặc tọa độ cần tìm'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleSearch(); // Gọi hàm tìm kiếm khi nhấn Enter
                    }
                }}
                style={{
                    padding: 5,
                    marginRight: 5,
                    width: "195px",
                    border: "none",
                    outline: "none",
                    fontSize: "14px",
                    background: "rgb(248, 247, 247)",
                    height: "28px",
                    borderRadius: "5px",
                }}
            />

            <button onClick={handleSearch}
                style={{
                    border: "none",
                    padding: "12px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            ><BsSearch /></button>
        </div>
    )
}

export default SearchBox