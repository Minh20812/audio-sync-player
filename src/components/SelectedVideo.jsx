import React, { useState } from "react";
import { Trash2, Copy, X, Bot } from "lucide-react";
import { useVideo } from "../contexts/VideoContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const SelectedVideos = () => {
  const { selectedVideos, removeVideo, clearVideos } = useVideo();
  const [openGroups, setOpenGroups] = useState({});
  const [editTexts, setEditTexts] = useState({});

  const generateCopyText = (startIndex, endIndex) => {
    const videosToInclude = selectedVideos.slice(startIndex, endIndex);
    const links = videosToInclude
      .map((video) =>
        video.url
          ? video.url
          : video.id
          ? `https://www.youtube.com/watch?v=${video.id}`
          : ""
      )
      .filter(Boolean)
      .join("\n");
    return `@YouTube

Tôi sẽ gửi bạn các link video YouTube. Hãy giúp tôi tạo các bản tóm tắt nội dung các video này sao cho phù hợp để nghe bằng giọng nói (text-to-speech).

🎯 Yêu cầu quan trọng:

- Trích xuất và ghi đúng **tên đầy đủ của video** như hiển thị trên YouTube.

- Trích xuất và ghi đúng **tên kênh YouTube** đăng tải video.

- Không dịch hoặc rút gọn tiêu đề hoặc tên kênh.

- Dịch tên video sang tiếng Việt và đặt phần dịch này ở ngay đầu phần tóm tắt, trước khi đọc tên video gốc.

🎧 Yêu cầu tóm tắt:

- Mở đầu bằng câu:  

  👉 “Tiêu đề tiếng Việt: [Tên video dịch tiếng Việt].

  👉 “Bạn đang nghe tóm tắt video ‘[Tên Video]’ đến từ kênh ‘[Tên Kênh]’.”

- Giới thiệu ngắn nội dung chính của video.

- Tóm tắt theo trình tự logic hoặc mạch nội dung trong video.

- Nếu video có hướng dẫn, hãy chia thành từng bước rõ ràng.

- Văn phong thân thiện, tự nhiên, dễ hiểu, phù hợp để nghe (không quá học thuật hay khô khan).

- Không cần xưng “tôi” hoặc “bạn” trong phần nội dung chính, hãy kể như một người dẫn chuyện đang tóm tắt.

- Kết thúc bằng câu:  

  👉 “Và đó là toàn bộ nội dung chính của video.”

🔗 Đây là link video:
${links}`;
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Nội dung đã được copy vào clipboard");
    });
  };

  const handleToggleGroup = (groupNumber) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupNumber]: !prev[groupNumber],
    }));
  };

  const handleEditChange = (groupNumber, value) => {
    setEditTexts((prev) => ({
      ...prev,
      [groupNumber]: value,
    }));
  };

  const renderCopyGroups = () => {
    const groups = [];
    for (let i = 0; i < selectedVideos.length; i += 4) {
      const endIndex = Math.min(i + 4, selectedVideos.length);
      const groupNumber = Math.floor(i / 4) + 1;
      const defaultText = generateCopyText(i, endIndex);
      const editText = editTexts[groupNumber] ?? defaultText;
      const isOpen = openGroups[groupNumber] ?? false;

      groups.push(
        <div
          key={`group-${groupNumber}`}
          className="bg-gray-50 rounded-lg p-4 border"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">
              Nhóm {groupNumber} ({endIndex - i} video)
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleToggleGroup(groupNumber)}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
              >
                {isOpen ? "Ẩn" : "Hiện"}
              </button>
              <button
                onClick={() => handleCopy(editText)}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </button>
            </div>
          </div>
          {isOpen && (
            <div>
              <textarea
                className="w-full rounded border p-3 text-sm font-mono text-gray-800 whitespace-pre-wrap mb-2"
                rows={8}
                value={editText}
                onChange={(e) => handleEditChange(groupNumber, e.target.value)}
              />
              <div className="mt-1 text-xs text-gray-500">
                Video {i + 1} - {endIndex}
              </div>
            </div>
          )}
        </div>
      );
    }
    return groups;
  };

  if (selectedVideos.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Copy className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chưa có video nào được chọn
          </h2>
          <p className="text-gray-600 mb-6">
            Hãy quay lại trang tìm kiếm để thêm video vào danh sách
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tìm video
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-3 mb-2">
          <a href="/" className="inline-block">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
          </a>
          <h1 className="text-2xl font-bold text-gray-900">Video đã chọn</h1>
        </div>
        <p className="text-gray-600">
          {selectedVideos.length} video - {Math.ceil(selectedVideos.length / 4)}{" "}
          nhóm copy
        </p>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 sm:mt-0">
          {selectedVideos.length > 0 && (
            <button
              onClick={clearVideos}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Xóa tất cả</span>
            </button>
          )}
          {/* Nút truy cập Gemini */}
          <a
            href="https://gemini.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={`bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm w-full sm:w-auto justify-center`}
          >
            <Bot />
          </a>
        </div>
      </div>

      {/* Copy Groups */}
      <div className="space-y-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900">Nội dung copy</h2>
        {renderCopyGroups()}
      </div>

      {/* Video List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Danh sách video
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {selectedVideos.map((video, index) => (
            <div
              key={video.id}
              className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex space-x-4">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-24 h-18 object-cover rounded flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {video.channel}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>#{index + 1}</span>
                        {video.duration && <span>• {video.duration}</span>}
                        {video.views && <span>• {video.views}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => removeVideo(video.id)}
                      className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectedVideos;
