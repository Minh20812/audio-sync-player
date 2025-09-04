import { Play, Pause } from "lucide-react";
import { useState } from "react";

const VideoThumbnail = ({ video, onPlay }) => {
  const [showVideo, setShowVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fallback thumbnail URL từ YouTube
  const fallbackThumbnail = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;

  const toggleVideo = () => {
    setShowVideo(!showVideo);
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative group">
      {showVideo ? (
        <iframe
          src={`https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1`}
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
          allowFullScreen
        />
      ) : (
        <img
          src={video.thumbnail || fallbackThumbnail}
          alt={`Thumbnail for ${video.id}`}
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackThumbnail;
          }}
        />
      )}

      <button
        onClick={toggleVideo}
        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
      >
        {isPlaying ? (
          <Pause className="w-6 h-6 text-white" />
        ) : (
          <Play className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
};

export default VideoThumbnail;
