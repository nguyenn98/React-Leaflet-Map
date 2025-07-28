import React from "react";
import "../styles/Header.css";

const Header = () => {
    return (
        <header className="custom-header">
            <div className="header-left">
                <img src="/roadtouniversity.png" alt="Logo trang chủ" className="header-logo" />
                <span className="header-title">Road To University</span>
            </div>
            <nav className="header-nav">
            <div className="nav-item" style={{ display: "flex" }}><img style={{width: '30px'}} src="/Untitled_design__4_-removebg-preview.png" /> Trang chủ</div>
                <div className="nav-item">📚 Học tập</div>
                <div className="nav-item">🍜 Ăn uống</div>
                <div className="nav-item">🏠 Nhà trọ</div>
                <div className="nav-item">🚌 Di chuyển</div>
                <div className="nav-item">🖨 Dịch vụ</div>
            </nav>
        </header>
    );
};

export default Header;
