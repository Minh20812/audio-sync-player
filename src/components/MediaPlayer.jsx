import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

const MediaPlayer = ({
  videoId,
  audioFile,
  audioRef,
  youtubeRef,
  videoMuted,
  isPlaying,
  setIsPlaying,
}) => {
  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }

    window.onYouTubeIframeAPIReady = () => {
      youtubeRef.current = new window.YT.Player("youtube-player", {
        height: "100%",
        width: "100%",
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }
  }, [videoId]);

  useEffect(() => {
    if (youtubeRef.current) {
      if (videoMuted) {
        youtubeRef.current.mute();
      } else {
        youtubeRef.current.unMute();
      }
    }
  }, [videoMuted]);

  const audioUrl = audioFile ? URL.createObjectURL(audioFile) : "";

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-6">
          {/* YouTube Video Player */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">YouTube Video</h3>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <div id="youtube-player" className="w-full h-full"></div>
            </div>
          </div>

          {/* Audio Player */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">External Audio</h3>
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-6 border border-white/10">
              <audio
                ref={audioRef}
                src={audioUrl}
                controls
                className="w-full"
                style={{
                  filter: "invert(1) hue-rotate(180deg)",
                  borderRadius: "8px",
                }}
              />
              <div className="mt-4 text-center">
                <p className="text-gray-300 text-sm">{audioFile?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaPlayer;
