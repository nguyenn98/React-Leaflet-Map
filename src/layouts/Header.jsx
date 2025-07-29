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
                <div className="nav-item">
                    <img style={{ width: '32px', marginTop: '-6px' }} src="/gate.png" />
                    Trang chủ
                </div>
                <div className="nav-item">
                    <img style={{ width: '40px' }} src="/infoUniversity.png" />
                    Học tập
                </div>
                <div className="nav-item">
                    <img style={{ width: '47px', marginTop: '-6px' }} src="/food2.png" />
                    Ăn uống
                </div>
                <div className="nav-item" >
                    <img style={{ width: '50px', marginTop: '-6px' }} src="/house.png" />
                    Nhà trọ
                </div>
                <div className="nav-item">
                    <img style={{ width: '65px', marginTop: '-6px' }} src="/vehicle.png" />
                    Di chuyển
                </div>
                <div className="nav-item">
                    <img style={{ width: '55px', marginTop: '-6px' }} src="/service.png" />
                    Dịch vụ
                </div>
            </nav>
        </header>
    );
};

export default Header;
