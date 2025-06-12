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
  const [currentPage, setCurrentPage] = useState(1);
  const [addedCount, setAddedCount] = useState(0); // State để lưu số lượng dữ liệu đã thêm
  const itemsPerPage = 4; // Số lượng video hiển thị mỗi trang
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadVideos = async () => {
      const videoList = await fetchVideosFromFirestore();
      setVideos(videoList);
    };
    loadVideos();
  }, []);

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

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-medium">Try These Examples:</h3>
          <Button
            variant="solid"
            onClick={handleUpdateLinks}
            disabled={isLoading}
            className={`bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCcw className="w-4 h-4" />
            )}
            {isLoading ? "Đang cập nhật..." : "Cập nhật link mới"}
          </Button>
        </div>

        {/* Hiển thị thông báo số lượng dữ liệu đã thêm */}
        {addedCount > 0 && (
          <p className="text-sm text-green-500 mb-3">
            Đã lưu {addedCount} video mới từ Google Drive vào Firestore.
          </p>
        )}

        <div className="grid gap-3">
          {currentItems.map((video) => (
            <div
              key={video.id}
              className="flex items-center justify-between bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <img
                  src={video.thumbnail}
                  alt={`Thumbnail for ${video.id}`}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="space-y-1">
                  <h4 className="text-white font-medium">{video.title}</h4>
                  <p className="text-sm text-gray-400">{video.channel}</p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => onSelectExample(video.id)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Play Now
              </Button>
            </div>
          ))}
        </div>

        {/* Nút chuyển trang */}
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="text-gray-400 hover:text-white"
          >
            Previous
          </Button>
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="text-gray-400 hover:text-white"
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Examples;
