import React from "react";
import '../styles.scss';

const Header: React.FC = () => {
    return (
        <header className="header_root">
            <div className="header_image_container">
                <picture>
                    <source 
                        media="(max-width: 699px)" 
                        srcSet="https://bhair.online/media/default/header_mobile.jpg" 
                    />
                    <img 
                        src="https://bhair.online/media/default/header_desktop.jpg" 
                        alt="Header" 
                        className="header_image" 
                    />
                </picture>
            </div>
        </header>
    );
};

export default Header;
