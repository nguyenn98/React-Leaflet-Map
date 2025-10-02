import React from "react";
import "../styles/Header.css";
import { Link } from "react-router-dom";

const Header = () => {
    return (
        <header className="custom-header">
            <div className="header-left">
                <img
                    src="/roadtouniversity.png"
                    alt="Logo trang chủ"
                    className="header-logo"
                />

                <span className="header-title">
                    <span style={{ color: "#FAFAFA", marginRight: "4px" }}>Road to</span>
                    University
                </span>
            </div>

            <nav className="header-nav">
                <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="nav-item">
                        <img
                            style={{ width: "35px", height: "40px", paddingRight: "3px" }}
                            src="/gate.png"
                            alt="Trang chủ"
                        />
                        <p>Trang chủ</p>
                    </div>
                </Link>

                <Link to="/study" style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="nav-item">
                        <img
                            style={{ width: "38px", height: "40px", paddingRight: "3px" }}
                            src="/infoUniversity.png"
                            alt="Học tập"
                        />
                        <p>Học tập</p>
                    </div>
                </Link>

                <Link to="/food" style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="nav-item">
                        <img
                            style={{ width: "45px", height: "36px", paddingRight: "3px" }}
                            src="/food2.png"
                            alt="Ăn uống"
                        />
                        <p>Ăn uống</p>
                    </div>
                </Link>

                <Link to="/housing" style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="nav-item">
                        <img
                            style={{ width: "48px", height: "40px", paddingRight: "3px" }}
                            src="/house.png"
                            alt="Nhà trọ"
                        />
                        <p>Nhà trọ</p>
                    </div>
                </Link>

                <Link to="/transport" style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="nav-item">
                        <img
                            style={{ width: "62px", height: "40px", paddingRight: "3px" }}
                            src="/vehicle.png"
                            alt="Di chuyển"
                        />
                        <p>Di chuyển</p>
                    </div>
                </Link>

                <Link to="/services" style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="nav-item">
                        <img
                            style={{ width: "52px", height: "40px", paddingRight: "3px" }}
                            src="/service.png"
                            alt="Dịch vụ"
                        />
                        <p>Dịch vụ</p>
                    </div>
                </Link>

                <Link to="/info" style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="nav-item">
                        <img
                            style={{ width: "37px", height: "37px", paddingRight: "3px" }}
                            src="/info1.png"
                            alt="Thông tin"
                        />
                        <p>Thông tin</p>
                    </div>
                </Link>
            </nav>
        </header>
    );
};

export default Header;
