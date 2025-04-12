import React from "react";

function MainMenu({ activeMenu, setActiveMenu }) {
  return (
    <div className="main-menu">
      <button
        className={activeMenu === "crawl" ? "active" : ""}
        onClick={() => setActiveMenu("crawl")}
      >
        Crawl Dữ Liệu
      </button>
      <button
        className={activeMenu === "display" ? "active" : ""}
        onClick={() => setActiveMenu("display")}
      >
        Hiển Thị
      </button>
    </div>
  );
}

export default MainMenu;