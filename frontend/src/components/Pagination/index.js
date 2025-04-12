import React from "react";
import PropTypes from "prop-types";
import "./pagination.css";

function Pagination({ currentPage, totalPages, onPageChange, loading }) {
  const handlePreviousPage = () => {
    if (currentPage > 1 && !loading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && !loading) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== currentPage && !loading) {
      onPageChange(pageNumber);
    }
  };

  // Logic hiển thị phân trang động
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 3; // Số trang hiển thị ở giữa (trang hiện tại + 2 trang lân cận)

    // Nếu tổng số trang nhỏ hơn hoặc bằng 5, hiển thị tất cả
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => handlePageClick(i)}
            className={currentPage === i ? "active" : ""}
            disabled={loading}
          >
            {i}
          </button>
        );
      }
    } else {
      // Trang đầu tiên luôn hiển thị
      pageNumbers.push(
        <button
          key={1}
          onClick={() => handlePageClick(1)}
          className={currentPage === 1 ? "active" : ""}
          disabled={loading}
        >
          1
        </button>
      );

      // Thêm dấu ... nếu trang hiện tại cách trang 1 hơn 2 bước
      if (currentPage > 3) {
        pageNumbers.push(
          <span key="ellipsis-start" className="ellipsis">
            ...
          </span>
        );
      }

      // Tính toán các trang lân cận để hiển thị
      let startPage = Math.max(2, currentPage - 1); // Trang bắt đầu của dải giữa
      let endPage = Math.min(totalPages - 1, currentPage + 1); // Trang kết thúc của dải giữa

      // Điều chỉnh startPage và endPage để luôn hiển thị 3 trang (nếu có thể)
      if (currentPage <= 3) {
        startPage = 2;
        endPage = 4;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
        endPage = totalPages - 1;
      }

      // Hiển thị các trang lân cận
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => handlePageClick(i)}
            className={currentPage === i ? "active" : ""}
            disabled={loading}
          >
            {i}
          </button>
        );
      }

      // Thêm dấu ... nếu trang hiện tại cách trang cuối hơn 2 bước
      if (currentPage < totalPages - 2) {
        pageNumbers.push(
          <span key="ellipsis-end" className="ellipsis">
            ...
          </span>
        );
      }

      // Trang cuối cùng luôn hiển thị
      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => handlePageClick(totalPages)}
          className={currentPage === totalPages ? "active" : ""}
          disabled={loading}
        >
          {totalPages}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="pagination">
      <button onClick={handlePreviousPage} disabled={currentPage === 1 || loading}>
        Trang trước
      </button>
      {renderPageNumbers()}
      <button onClick={handleNextPage} disabled={currentPage === totalPages || loading}>
        Trang sau
      </button>
    </div>
  );
}

// Định nghĩa PropTypes để kiểm tra kiểu dữ liệu của props
Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default Pagination;