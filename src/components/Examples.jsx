import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Loader } from "lucide-react";
import { toast } from "sonner";
import {
  parseVideoUrlsFromDrive,
  fetchVideosFromFirestore,
  clearFirestoreVideos,
} from "@/utils/videoUtils";

const Examples = ({ onSelectExample }) => {
  const [videos, setVideos] = useState([]);
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = localStorage.getItem("examples_currentPage");
    const savedTime = localStorage.getItem("examples_currentPage_time");
    if (saved && savedTime) {
      const now = Date.now();
      if (now - parseInt(savedTime, 10) < 3600000) {
        // 1h = 3600000ms
        return parseInt(saved, 10);
      }
    }
    return 1;
  });
  const [addedCount, setAddedCount] = useState(0);
  const itemsPerPage = 4;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadVideos = async () => {
      const videoList = await fetchVideosFromFirestore();
      setVideos(videoList);
    };
    loadVideos();
  }, []);

  useEffect(() => {
    localStorage.setItem("examples_currentPage", currentPage);
    localStorage.setItem("examples_currentPage_time", Date.now().toString());
  }, [currentPage]);

  const handleUpdateLinks = async () => {
    try {
      setIsLoading(true);
      await clearFirestoreVideos();
      const { validVideos, addedCount } = await parseVideoUrlsFromDrive();
      setVideos(validVideos);
      setAddedCount(addedCount);
      toast.success(`Đã lưu ${addedCount} video mới vào Firestore!`);
    } catch (error) {
      console.error("Error updating links:", error);
      toast.error("Có lỗi xảy ra khi cập nhật link mới!");
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(videos.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = videos.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSelectExample = (videoId) => {
    onSelectExample(videoId);
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <h3 className="text-white font-medium text-sm sm:text-base">
            Try These Examples:
          </h3>
          <Button
            variant="solid"
            onClick={handleUpdateLinks}
            disabled={isLoading}
            className={`bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm w-full sm:w-auto justify-center ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
            ) : (
              <RefreshCcw className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
            {isLoading ? "Đang cập nhật..." : "Cập nhật link mới"}
          </Button>
        </div>

        {/* Hiển thị thông báo số lượng dữ liệu đã thêm */}
        {addedCount > 0 && (
          <p className="text-xs sm:text-sm text-green-500 mb-3">
            Đã lưu {addedCount} video mới từ Google Drive vào Firestore.
          </p>
        )}

        <div className="grid gap-2 sm:gap-3">
          {currentItems.map((video) => (
            <div
              key={video.id}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3 w-full sm:flex-1">
                <img
                  src={video.thumbnail}
                  alt={`Thumbnail for ${video.id}`}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="space-y-1 min-w-0 flex-1">
                  <h4 className="text-white font-medium text-sm sm:text-base line-clamp-2 break-words">
                    {video.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-400 truncate">
                    {video.channel}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleSelectExample(video.id)}
                className="bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 w-full sm:w-auto"
              >
                Play Now
              </Button>
            </div>
          ))}
        </div>

        {/* Nút chuyển trang */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
          <Button
            variant="outline"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="text-gray-400 hover:text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 w-full sm:w-auto"
          >
            Previous
          </Button>
          <span className="text-white text-xs sm:text-sm order-first sm:order-none">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="text-gray-400 hover:text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 w-full sm:w-auto"
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Examples;
