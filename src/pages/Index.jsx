import React, { useState } from "react";
import { toast } from "sonner";
import MediaSyncPlayer from "@/components/MediaSyncPlayer";
import Examples from "@/components/Examples";
import { useVideo } from "@/contexts/VideoContext";
import Movies from "@/components/Movies";
import { useLocation } from "react-router-dom";

const Index = () => {
  const [videoId, setVideoId] = useState("");
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const { addVideo, selectedVideos } = useVideo();
  const location = useLocation();

  const handleSyncAndPlay = () => {
    if (!videoId) {
      toast.info("Please provide a YouTube Video ID");
      return;
    }

    setIsMediaLoaded(true);
    toast.success("Media loaded successfully!");
  };

  const handleSelectExample = (exampleId) => {
    setVideoId(exampleId);
    setIsMediaLoaded(true); // Immediately load media

    // Give time for MediaSyncPlayer to mount before requesting fullscreen
    setTimeout(() => {
      const videoContainer = document.querySelector(
        "[data-fullscreen-container]"
      );
      if (videoContainer && document.fullscreenEnabled) {
        videoContainer.requestFullscreen().catch((err) => {
          console.error("Error attempting to enable fullscreen:", err);
        });
      }
    }, 1000); // Wait 1 second for component to mount and initialize
  };

  const handleSelectVideo = (video) => {
    addVideo(video);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      {location.pathname === "/movies" ? (
        <div className="max-w-7xl mx-auto space-y-6">
          <Movies />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-6">
          <Examples
            onSelectExample={handleSelectExample}
            onSelectVideo={handleSelectVideo}
            selectedVideos={selectedVideos}
          />

          {isMediaLoaded && <MediaSyncPlayer videoId={videoId} />}
        </div>
      )}
    </div>
  );
};

export default Index;
