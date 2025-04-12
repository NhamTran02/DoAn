import { useState } from "react";
import axios from "axios";

function ManualCrawl() {
  const [inputText, setInputText] = useState("");
  const [classification, setClassification] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClassify = async () => {
    if (!inputText.trim()) {
      alert("Vui lòng nhập văn bản để phân loại.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.post("http://localhost:8000/classify", { text: inputText });
      const labelMap = {
        neutral: "Neutral",
        positive: "Positive",
        negative: "Negative",
      };
      const mappedClassification = labelMap[response.data.classification] || response.data.classification;
      setClassification(mappedClassification);
    } catch (error) {
      console.error("Error classifying:", error);
      if (error.response) {
        setError(error.response.data.detail || "Lỗi không xác định");
        setClassification("");
      } else {
        setError("Không thể kết nối đến server");
        setClassification("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <h2>Crawl Thủ Công</h2>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Nhập văn bản để phân loại (positive/negative/neutral)"
        rows="5"
        cols="50"
      />
      <br />
      <button onClick={handleClassify} disabled={loading}>
        {loading ? "Đang phân loại..." : "Phân loại"}
      </button>
      {classification && (
        <div className="result">
          <h3>Kết quả phân loại:</h3>
          <p className={classification}>{classification}</p>
        </div>
      )}
      {error && (
        <div className="error">
          <h3>Lỗi:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

export default ManualCrawl;