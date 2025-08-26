import React from "react";
import { Outlet } from "react-router-dom";
import HamburgerMenu from "../features/nav/HamburgerMenu";

// На страницах авторизации/регистрации хедер скрыт, гамбургер оставлен как у тебя.
const AuthLayout: React.FC = () => {
  return (
    <>
      <HamburgerMenu />
      <Outlet />
    </>
  );
};

export default AuthLayout;
