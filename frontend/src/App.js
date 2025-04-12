import { useState } from "react";
import MainMenu from "./components/MainMenu";
import CrawlMenu from "./components/CrawlMenu";
import DisplayMenu from "./components/DisplayMenu";
import "./App.css";

function App() {
  const [activeMenu, setActiveMenu] = useState("crawl");

  return (
    <div className="App">
      <MainMenu activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <h1>Bảng điều khiển trình thu thập dữ liệu Facebook và phân tích bài viết trên HOU Confessions</h1>
      {activeMenu === "crawl" && <CrawlMenu />}
      {activeMenu === "display" && <DisplayMenu />}
    </div>
  );
}

export default App;