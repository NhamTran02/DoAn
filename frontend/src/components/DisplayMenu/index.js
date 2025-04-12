import { useState } from "react";
import RawPosts from "../RawPosts";           
import AllClassifiedPosts from "../AllClassifiedPosts";
import PositivePosts from "../PositivePosts";    
import NegativePosts from "../NegativePosts";   
import NeutralPosts from "../NeutralPosts";      
import Stats from "../Stats";

function DisplayMenu() {
  const [activeTask, setActiveTask] = useState("raw");

  return (
    <div className="menu-container">
      <div className="taskbar">
        <button
          className={activeTask === "raw" ? "active" : ""}
          onClick={() => setActiveTask("raw")}
        >
          Bài Viết Thô
        </button>
        <button
          className={activeTask === "all" ? "active" : ""}
          onClick={() => setActiveTask("all")}
        >
          Bài Viết Đã Phân Loại
        </button>
        <button
          className={activeTask === "positive" ? "active" : ""}
          onClick={() => setActiveTask("positive")}
        >
          Bài Viết Tích Cực
        </button>
        <button
          className={activeTask === "negative" ? "active" : ""}
          onClick={() => setActiveTask("negative")}
        >
          Bài Viết Tiêu Cực
        </button>
        <button
          className={activeTask === "neutral" ? "active" : ""}
          onClick={() => setActiveTask("neutral")}
        >
          Bài Viết Trung Lập
        </button>
        <button 
          className={activeTask==="stats"? "active" : ""}
          onClick={() => setActiveTask("stats")}
        >
          Thống kê bài viết 
        </button>
      </div>
      <div className="content">
        {activeTask === "raw" && <RawPosts />}
        {activeTask === "all" && <AllClassifiedPosts />}
        {activeTask === "positive" && <PositivePosts />}
        {activeTask === "negative" && <NegativePosts />}
        {activeTask === "neutral" && <NeutralPosts />}
        {activeTask === "stats" && <Stats />}
      </div>
    </div>
  );
}

export default DisplayMenu;