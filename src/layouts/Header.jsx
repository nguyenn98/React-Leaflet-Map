import React from "react";
import "../styles/Header.css";

const Header = () => {
    return (
        <header className="custom-header">
            <div className="header-box logo-box">
                <img src="/roadtouniversity.png" alt="Logo trang chủ" className="header-logo" />
            </div>
            <div className="header-box empty-box"> {/* Chừa trống cho info dự án sau */}</div>
            <div className="header-box empty-box"> {/* Chừa trống cho tính năng sau */}</div>
        </header>
    );
};

export default Header;
