import React from "react";
import "../styles/Header.css";

const Header = () => {
    return (
        <header className="custom-header">
            <div className="header-box logo-box" style={{ marginLeft: '20px', width: '250px' }}>
                <img src="/roadtouniversity.png" alt="Logo trang chủ" className="header-logo" />
                <span style={{ marginLeft: '7px' }}>Road To University</span>
            </div>
            <div className="header-box empty-box">📚 Học tập</div>
            <div className="header-box empty-box">🍜 Ăn uống</div>
            <div className="header-box empty-box">🏠 Nhà trọ</div>
            <div className="header-box empty-box">🚌 Di chuyển</div>
            <div className="header-box empty-box">🖨 In ấn</div>
        </header>
    );
};

export default Header;
