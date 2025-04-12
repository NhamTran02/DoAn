import { useState, useEffect } from "react";
import axios from "axios";
import PostTable from "../PostTable";
import Pagination from "../Pagination";

function PositivePosts() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get("http://localhost:8000/positive-posts", {
          params: { page, limit }
        });
        setPosts(response.data.posts);
        setTotalPages(response.data.total_pages);
        setTotalPosts(response.data.total);
      } catch (error) {
        console.error("Error fetching positive posts:", error);
        setError("Không thể lấy danh sách bài viết tích cực");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePostUpdated = (postId, newText, newLabel) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              text: newText,
              neutral: newLabel === "neutral",
              negative: newLabel === "negative",
              positive: newLabel === "positive",
            }
          : post
      )
    );
  };

  const handlePostDeleted = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    setTotalPosts((prevTotal) => prevTotal - 1);
    setTotalPages(Math.ceil((totalPosts - 1) / limit));
  };

  return (
    <div className="section">
      <h2>Bài Viết Tích Cực (Tổng: {totalPosts} bài)</h2>
      {error && (
        <div className="error">
          <h3>Lỗi:</h3>
          <p>{error}</p>
        </div>
      )}
      {loading ? (
        <p>Đang tải...</p>
      ) : posts.length > 0 ? (
        <>
          <PostTable
            posts={posts}
            tableType="classified" // Truyền tableType là "classified"
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </>
      ) : (
        <p>Không có bài viết nào để hiển thị.</p>
      )}
    </div>
  );
}

export default PositivePosts;