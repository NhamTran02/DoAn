import { useState, useEffect } from "react";
import axios from "axios";
import { Pie, Line } from "react-chartjs-2";
import "./Stats.css";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Đăng ký các thành phần cần thiết của Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartDataLabels
);

function Stats() {
  const [labelStats, setLabelStats] = useState(null);
  const [dateStats, setDateStats] = useState(null);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState(""); // State cho ngày bắt đầu
  const [endDate, setEndDate] = useState(""); // State cho ngày kết thúc
  const [loading, setLoading] = useState(false); // State cho trạng thái loading

  // Lấy dữ liệu thống kê nhãn
  useEffect(() => {
    const fetchLabelStats = async () => {
      try {
        const response = await axios.get("http://localhost:8000/stats/classified-posts/labels");
        setLabelStats(response.data);
      } catch (err) {
        setError("Lỗi khi lấy thống kê nhãn: " + err.message);
      }
    };
    fetchLabelStats();
  }, []);

  // Lấy dữ liệu thống kê theo ngày
  const fetchDateStats = async () => {
    try {
      setLoading(true); // Bật trạng thái loading
      setError(""); // Xóa lỗi trước đó
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate && endDate !== "") params.end_date = endDate;

      const response = await axios.get("http://localhost:8000/stats/classified-posts/by-date", {
        params,
      });
      setDateStats(response.data);
    } catch (err) {
      setError("Lỗi khi lấy thống kê theo ngày: " + err.message);
    } finally {
      setLoading(false); // Tắt trạng thái loading
    }
  };

  // Gọi fetchDateStats khi component mount và khi startDate hoặc endDate thay đổi
  useEffect(() => {
    fetchDateStats();
  }, [startDate, endDate]); // Thêm startDate và endDate vào dependency array

  // Dữ liệu cho Pie Chart (phân bố nhãn)
  const pieData = labelStats
    ? {
        labels: ["Neutral", "	Negative", "Positive"],
        datasets: [
          {
            data: [labelStats.neutral, labelStats.negative, labelStats.positive],
            backgroundColor: ["#FFCE56", "#FF6384", "#4caf50"],
            hoverBackgroundColor: ["#FFCE56", "#FF6384", "#4caf50"],
          },
        ],
      }
    : null;

  // Cấu hình options cho Pie Chart
  const pieOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
      datalabels: {
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%`;
        },
        color: "#fff",
        font: {
          weight: "bold",
          size: 16,
        },
        textAlign: "center",
      },
    },
    maintainAspectRatio: false,
  };

  // Dữ liệu cho Line Chart (số bài viết theo ngày)
  const lineData = dateStats
    ? {
        labels: dateStats.map((item) => item.date),
        datasets: [
          {
            label: "Số bài viết",
            data: dateStats.map((item) => item.count),
            fill: false,
            borderColor: "#36A2EB",
            backgroundColor: "#36A2EB",
            tension: 0.1,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      }
    : null;

  // Cấu hình options cho Line Chart
  const lineOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
      datalabels: {
        formatter: (value) => {
          return value;
        },
        color: "#000",
        font: {
          weight: "bold",
          size: 16,
        },
        align: "top",
        anchor: "end",
        offset: 10,
        clamp: false,
        clip: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Ngày",
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: "Số bài viết",
        },
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 10,
        },
        grid: {
          color: "#e0e0e0",
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="section">
      <h1>Thống Kê Bài Viết</h1>
      {error && (
        <div className="error">
          <h3>Lỗi:</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Biểu đồ phân bố nhãn */}
      <div className="chart-container" style={{ marginBottom: "40px" }}>
        <h3>Biểu đồ bài viết thống kê theo nhãn</h3>
        {labelStats ? (
          <div className="chart-wrapper pie-chart-wrapper">
            <div className="chart">
              <Pie data={pieData} options={pieOptions} height={500} width={500} />
            </div>
            <div className="custom-legend">
              <p>Chú thích:</p>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: "#FF6384" }}></span>
                <span>Negative</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: "#4caf50" }}></span>
                <span>Positive</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: "#FFCE56" }}></span>
                <span>Neutral</span>
              </div>
            </div>
          </div>
        ) : (
          <p>Đang tải dữ liệu...</p>
        )}
      </div>

      {/* Biểu đồ số bài viết theo ngày */}
      <div className="chart-container" style={{ marginTop: "100px" }}>
        <h3>Số bài viết theo ngày</h3>
        <div className="date-filter" style={{ marginBottom: "20px", marginTop: "50px" }}>
          <label style={{ marginRight: "10px" }}>
            Ngày bắt đầu:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ marginLeft: "5px", marginRight: "20px", width: "120px" }}
            />
          </label>
          <label style={{ marginRight: "10px" }}>
            Ngày kết thúc:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ marginLeft: "5px", marginRight: "20px", width: "120px" }}
            />
          </label>
          <button onClick={fetchDateStats} style={{ padding: "5px 10px" }}>
            Tìm kiếm
          </button>
        </div>
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : dateStats ? (
          dateStats.length > 0 ? (
            <div className="chart-wrapper line-chart-wrapper">
              <div className="chart">
                <Line data={lineData} options={lineOptions} height={400} width={800} />
              </div>
              <div className="custom-legend" style={{ display: "flex", flexDirection: "row", marginLeft: "20px" }}>
                <p style={{ marginRight: "20px" }}>Chú thích:</p>
                <div className="legend-item" style={{ marginBottom: "-5px" }}>
                  <span className="legend-color" style={{ backgroundColor: "#36A2EB" }}></span>
                  <span>Số bài viết</span>
                </div>
              </div>
            </div>
          ) : (
            <p>Không có dữ liệu trong khoảng thời gian đã chọn.</p>
          )
        ) : (
          <p>Đang tải dữ liệu...</p>
        )}
      </div>
    </div>
  );
}

export default Stats;