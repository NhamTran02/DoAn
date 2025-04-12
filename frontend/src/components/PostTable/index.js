import { useState } from "react";
import axios from "axios";
import "./postTable.css";

function PostTable({ posts, showType = true, tableType = "classified", onPostUpdated, onPostDeleted }) {
  const [editingPost, setEditingPost] = useState(null); // Bài viết đang được chỉnh sửa
  const [editedText, setEditedText] = useState(""); // Nội dung chỉnh sửa
  const [error, setError] = useState("");

  const handleEdit = (post) => {
    setEditingPost(post);
    setEditedText(post.text);
    setError("");
  };

  const handleUpdate = async (postId) => {
    if (!postId || isNaN(postId)) {
      setError("ID bài viết không hợp lệ");
      return;
    }
    try {
      // Gọi API tương ứng dựa trên tableType
      const apiUrl = tableType === "crawler" 
        ? `http://localhost:8000/crawler-posts/${postId}` 
        : `http://localhost:8000/classified-posts/${postId}`;
      
      const response = await axios.put(apiUrl, {
        text: editedText,
      });

      setEditingPost(null);
      setEditedText("");
      // Nếu là classified_posts, response sẽ có classification
      const newLabel = tableType === "classified" ? response.data.classification : null;
      onPostUpdated(postId, editedText, newLabel); // Cập nhật giao diện
      alert("Cập nhật bài viết thành công!");
    } catch (err) {
      setError("Lỗi khi cập nhật bài viết: " + err.message);
    }
  };

  const handleDelete = async (postId) => {
    if (!postId || isNaN(postId)) {
      setError("ID bài viết không hợp lệ");
      return;
    }
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        await axios.delete(`http://localhost:8000/posts/${postId}`);
        onPostDeleted(postId); // Cập nhật giao diện
        alert("Xóa bài viết thành công!");
      } catch (err) {
        setError("Lỗi khi xóa bài viết: " + err.message);
      }
    }
  };

  // Hàm để xác định màu sắc dựa trên loại bài viết
  const getLabelColor = (post) => {
    if (post.neutral) return "#FFCE56"; // Trung lập
    if (post.positive) return "#4caf50"; // Tích cực
    return "#f44336"; // Tiêu cực
  };

  return (
    <div className="post-table">
      {error && (
        <div className="error">
          <h3>Lỗi:</h3>
          <p>{error}</p>
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th>URL</th>
            <th>Nội dung</th>
            {showType && <th>Loại</th>}
            <th>Chức năng</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <td>
                {post.url === "Manually entered" ? (
                  "Manually entered"
                ) : post.url ? (
                  <a href={post.url} target="_blank" rel="noopener noreferrer">
                    Link
                  </a>
                ) : (
                  "N/A"
                )}
              </td>
              <td>
                {editingPost && editingPost.id === post.id ? (
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    rows="3"
                    cols="50"
                  />
                ) : (
                  post.text
                )}
              </td>
              {showType && (
                <td style={{ color: getLabelColor(post) }}>
                  {post.neutral ? "Neutral" : post.positive ? "Positive" : "Negative"}
                </td>
              )}
              <td className="action-column">
                {editingPost && editingPost.id === post.id ? (
                  <>
                    <button onClick={() => handleUpdate(post.id)}>Lưu</button>
                    <button onClick={() => setEditingPost(null)}>Hủy</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(post)}>Sửa</button>
                    <button onClick={() => handleDelete(post.id)}>Xóa</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PostTable;