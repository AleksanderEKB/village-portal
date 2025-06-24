import React from "react";
import '../styles.scss';
import '../../shared/styles/pagination.scss';
import '../../shared/styles/buttons.scss';

const imageUrl: string = "https://bobrovsky.online/media/default/header.webp";

const Header: React.FC = () => {
    return (
        <header className="header_root">
            <div className="header_image_container">
                <img src={imageUrl} alt="Header" className="header_image" />
                <div className="header_text">
                    <h1>Бобровский</h1>
                </div>
            </div>
        </header>
    );
};

export default Header;
