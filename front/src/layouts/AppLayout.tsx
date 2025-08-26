import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../features/header/components/Header";
import HamburgerMenu from "../features/nav/HamburgerMenu";

const AppLayout: React.FC = () => {
  return (
    <>
      <HamburgerMenu />
      <Header />
      <Outlet />
    </>
  );
};

export default AppLayout;
