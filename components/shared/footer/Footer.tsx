import React from "react";
import TopFooter from "./TopFooter";
import BottomFotter from "./BottomFotter";

export default function Footer() {
  return (
    <div className="bottom-0 text-sm  w-full ">
      <div className="wrapper dark-mode-colors">
        <TopFooter />
      </div>
      <BottomFotter />
    </div>
  );
}
