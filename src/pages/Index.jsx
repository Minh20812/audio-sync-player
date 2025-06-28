import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Play, Music } from "lucide-react";
import { toast } from "sonner";
import VideoUploader from "@/components/VideoUploader";
import MediaSyncPlayer from "@/components/MediaSyncPlayer";
import Examples from "@/components/Examples";
import { useVideo } from "@/contexts/VideoContext";

const Index = () => {
  const [videoId, setVideoId] = useState("");
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const { addVideo, selectedVideos } = useVideo();

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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* <div className="text-center space-y-2 py-8">
          <h1 className="text-4xl font-bold text-white">
            Video Audio Sync Studio
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Import a YouTube video and sync with Archive.org audio
          </p>
        </div> */}

        <Examples
          onSelectExample={handleSelectExample}
          onSelectVideo={handleSelectVideo}
          selectedVideos={selectedVideos}
        />

        {isMediaLoaded && <MediaSyncPlayer videoId={videoId} />}

        {/* <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <VideoUploader videoId={videoId} setVideoId={setVideoId} />
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Music className="w-5 h-5 text-purple-400" />
                  <Label className="text-white font-medium">
                    Archive Audio
                  </Label>
                </div>
                <div className="text-sm text-gray-400">
                  Using YouTube video ID for Archive.org audio
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Button
                onClick={handleSyncAndPlay}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full"
                disabled={!videoId}
              >
                <Play className="w-5 h-5 mr-2" />
                Sync & Load Media
              </Button>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};

export default Index;
