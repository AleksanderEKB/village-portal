import React from "react";
import '../styles.scss';
import HamburgerMenu from '../../nav/HamburgerMenu';

const Header: React.FC = () => {
    return (
        <header className="header_root">
            <div className="header_image_container">
                <picture>
                    <source 
                        media="(max-width: 699px)" 
                        srcSet="https://bobrovsky.online/media/default/b2.webp" 
                    />
                    <img 
                        src="https://bobrovsky.online/media/default/b1.webp" 
                        alt="Header" 
                        className="header_image" 
                    />
                </picture>
                {/* Кнопка внутри header; позиционируется фиксировано в правом верхнем углу и не двигается при скролле */}
                <HamburgerMenu />
            </div>
        </header>
    );
};

export default Header;
