import { useState } from "react";
import ManualCrawl from "../ManualCrawl"; // Sửa đường dẫn
import AutoCrawl from "../AutoCrawl";     // Sửa đường dẫn

function CrawlMenu() {
  const [activeTask, setActiveTask] = useState("manual");

  return (
    <div className="menu-container">
      <div className="taskbar">
        <button
          className={activeTask === "manual" ? "active" : ""}
          onClick={() => setActiveTask("manual")}
        >
          Crawl Thủ Công
        </button>
        <button
          className={activeTask === "auto" ? "active" : ""}
          onClick={() => setActiveTask("auto")}
        >
          Crawl Tự Động
        </button>
      </div>
      <div className="content">
        {activeTask === "manual" && <ManualCrawl />}
        {activeTask === "auto" && <AutoCrawl />}
      </div>
    </div>
  );
}

export default CrawlMenu;