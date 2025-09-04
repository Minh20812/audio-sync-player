import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import db from "@/utils/firebaseConfig";
import { toast } from "sonner";
import { getYouTubeVideoId } from "@/utils/videoUtils";

const SearchVideo = ({ onVideoFound }) => {
  const [searchUrl, setSearchUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setIsLoading(true);

      // Validate và lấy video ID từ URL
      const videoId = getYouTubeVideoId(searchUrl);
      if (!videoId) {
        toast.error("URL YouTube không hợp lệ!");
        return;
      }

      // Tạo các possible URLs để tìm kiếm
      const possibleUrls = [
        `https://www.youtube.com/watch?v=${videoId}`,
        `https://youtu.be/${videoId}`,
      ];

      // Query Firestore
      const videosRef = collection(db, "latest_video_links");
      const q = query(videosRef, where("url", "in", possibleUrls));

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("Không tìm thấy video trong cơ sở dữ liệu!");
        return;
      }

      // Lấy document đầu tiên tìm thấy
      const videoDoc = querySnapshot.docs[0];
      const videoData = {
        id: videoDoc.id,
        ...videoDoc.data(),
      };

      // Callback với kết quả tìm thấy
      onVideoFound?.(videoData);
      toast.success("Đã tìm thấy video!");
      setSearchUrl(""); // Clear input
    } catch (error) {
      console.error("Error searching video:", error);
      toast.error("Có lỗi xảy ra khi tìm kiếm!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Nhập URL video YouTube..."
          value={searchUrl}
          onChange={(e) => setSearchUrl(e.target.value)}
          className="w-full bg-white/5 text-white placeholder:text-gray-400"
        />
      </div>
      <Button
        onClick={handleSearch}
        disabled={isLoading || !searchUrl.trim()}
        className={`${
          isLoading ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
        } text-white flex items-center gap-2`}
      >
        {isLoading ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Search className="w-4 h-4" />
        )}
        <span>{isLoading ? "Đang tìm..." : "Tìm kiếm"}</span>
      </Button>
    </div>
  );
};

export default SearchVideo;
