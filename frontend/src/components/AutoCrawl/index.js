import { useState } from "react";
import axios from "axios";
import "./autoCrawl.css";

// Component Notification để hiển thị thông báo
const Notification = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  // Hàm xử lý đóng thông báo với hiệu ứng
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Thời gian của hiệu ứng slideOut (phải khớp với CSS)
  };

  // Tự động đóng thông báo sau 5 giây
  setTimeout(() => {
    handleClose();
  }, 5000);

  return (
    <div className={`notification ${type} ${isExiting ? "exit" : ""}`}>
      <div className="notification-icon">
        {type === "success" ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 6L9 17L4 12"
              stroke="#28a745"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 18L18 6M6 6L18 18"
              stroke="#dc3545"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <div className="notification-message">{message}</div>
      <button className="notification-close" onClick={handleClose}>
        ✕
      </button>
    </div>
  );
};

function AutoCrawl() {
  const [numPostsToCrawl, setNumPostsToCrawl] = useState("");
  const [fanpageLink, setFanpageLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]); // State để quản lý danh sách thông báo

  // Hàm để thêm thông báo mới
  const addNotification = (message, type) => {
    const id = Date.now(); // ID duy nhất cho mỗi thông báo
    setNotifications((prev) => [...prev, { id, message, type }]);
  };

  // Hàm để xóa thông báo
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const handleCrawl = async () => {
    if (!fanpageLink.trim()) {
      addNotification("Vui lòng nhập link fanpage!", "error");
      return;
    }
    if (!numPostsToCrawl || numPostsToCrawl <= 0) {
      addNotification("Vui lòng nhập số lượng bài đăng hợp lệ để thu thập!", "error");
      return;
    }

    setLoading(true);
    setError("");
    setPosts([]);

    try {
      const response = await axios.post("http://localhost:8000/crawl", {
        num_posts: parseInt(numPostsToCrawl),
        fanpage_link: fanpageLink,
      });
      const crawledPosts = response.data.posts;
      setPosts(crawledPosts);

      // Thêm thông báo thành công
      addNotification(`Thu thập thành công ${crawledPosts.length} bài viết!`, "success");
    } catch (error) {
      console.error("Error crawling:", error);
      let errorMessage = "Lỗi không xác định";
      if (error.response) {
        errorMessage = error.response.data.detail || "Lỗi không xác định";
      } else {
        errorMessage = "Không thể kết nối đến server";
      }
      setError(errorMessage);

      // Thêm thông báo lỗi
      addNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      {/* Hiển thị danh sách thông báo */}
      <div className="notification-container">
        {notifications.map((notif) => (
          <Notification
            key={notif.id}
            message={notif.message}
            type={notif.type}
            onClose={() => removeNotification(notif.id)}
          />
        ))}
      </div>

      <h2>Crawl Tự Động</h2>
      <input
        type="text"
        value={fanpageLink}
        onChange={(e) => setFanpageLink(e.target.value)}
        placeholder="Nhập link fanpage Facebook"
      />
      <br />
      <input
        type="number"
        value={numPostsToCrawl}
        onChange={(e) => setNumPostsToCrawl(e.target.value)}
        placeholder="Nhập số lượng bài viết muốn thu thập"
        min="1"
      />
      <br />
      <button onClick={handleCrawl} disabled={loading}>
        {loading ? "Đang thu thập..." : "Bắt đầu thu thập"}
      </button>
      {loading && (
        <div className="loading">
          <video
            src="/loading-animation.mp4"
            className="loading-video"
            autoPlay
            loop
            muted
            playsInline
          />
          <p>Đang thu thập dữ liệu, vui lòng chờ...</p>
        </div>
      )}
      {error && (
        <div className="error">
          <h3>Lỗi:</h3>
          <p>{error}</p>
        </div>
      )}
      {posts.length > 0 && (
        <div className="posts-table">
          <h3>Danh sách bài viết vừa crawl</h3>
          <table>
            <thead>
              <tr>
                <th>Nội dung bài viết</th>
                <th>Loại bài viết</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post, index) => (
                <tr key={index}>
                  <td>{post.text}</td>
                  <td>{post.label}</td>
                  <td>{post.is_duplicate ? "Bài trùng" : "Bài mới"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AutoCrawl;