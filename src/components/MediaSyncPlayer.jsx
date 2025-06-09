import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Minimize,
} from "lucide-react";
import PlayerControls from "./PlayerControl";
import { getYouTubeVideoId } from "@/utils/youtubeUtils";

const MediaSyncPlayer = ({ videoId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.15); // 15% cho YouTube
  const [audioVolume, setAudioVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenControls, setShowFullscreenControls] = useState(false);

  const audioRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const videoContainerRef = useRef(null);
  const fullscreenTimeoutRef = useRef();
  const [youtubeReady, setYoutubeReady] = useState(false);
  const [isYouTubeReady, setIsYouTubeReady] = useState(false);

  const audioUrl = `https://archive.org/download/${videoId}/${videoId}.mp3`;
  const youtubeUrl = `https://youtube.com/watch?v=${videoId}`;

  useEffect(() => {
    // Define YouTube API callback
    window.onYouTubeIframeAPIReady = () => {
      setIsYouTubeReady(true);
    };

    // Initialize player when API is ready
    if (window.YT && isYouTubeReady) {
      youtubePlayerRef.current = new window.YT.Player("youtube-player", {
        height: "100%",
        width: "100%",
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          cc_load_policy: 1,
          cc_lang_pref: "en",
          hl: "en",
          vq: "medium",
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(15);
            event.target.loadModule("captions");
            event.target.loadModule("cc");
            event.target.setPlaybackQuality("medium");
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            }
          },
        },
      });
    }
  }, [videoId, isYouTubeReady]);

  // Load YouTube IFrame API
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);

    window.onYouTubeIframeAPIReady = () => {
      youtubePlayerRef.current = new window.YT.Player("youtube-player", {
        height: "100%",
        width: "100%",
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          cc_load_policy: 1, // Hiển thị phụ đề
          cc_lang_pref: "en", // Ưu tiên tiếng Anh
          hl: "en", // Ngôn ngữ giao diện
        },
        events: {
          onReady: () => {
            setYoutubeReady(true);
            // Đặt âm lượng mặc định 15% khi player sẵn sàng
            if (youtubePlayerRef.current) {
              youtubePlayerRef.current.setVolume(15);

              // Bật phụ đề tiếng Anh
              try {
                const tracks = youtubePlayerRef.current.getOption(
                  "captions",
                  "tracklist"
                );
                if (tracks && tracks.length > 0) {
                  // Tìm track tiếng Anh
                  const englishTrack = tracks.find(
                    (track) =>
                      track.languageCode === "en" ||
                      track.languageCode === "en-US" ||
                      track.languageCode === "en-GB"
                  );

                  if (englishTrack) {
                    youtubePlayerRef.current.setOption(
                      "captions",
                      "track",
                      englishTrack
                    );
                  } else if (tracks.length > 0) {
                    // Nếu không có tiếng Anh, dùng track đầu tiên
                    youtubePlayerRef.current.setOption(
                      "captions",
                      "track",
                      tracks[0]
                    );
                  }
                }

                // Hiển thị phụ đề
                youtubePlayerRef.current.setOption(
                  "captions",
                  "displaySettings",
                  {
                    background: "#000000",
                    backgroundOpacity: 0.75,
                    color: "#FFFFFF",
                    fontFamily: "Arial",
                    fontSize: 1,
                  }
                );
              } catch (error) {
                console.log("Không thể thiết lập phụ đề:", error);
              }
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING && !isPlaying) {
              setIsPlaying(true);
              if (audioRef.current) {
                audioRef.current.play();
              }
            } else if (
              event.data === window.YT.PlayerState.PAUSED &&
              isPlaying
            ) {
              setIsPlaying(false);
              if (audioRef.current) {
                audioRef.current.pause();
              }
            }
          },
        },
      });
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Sync time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (youtubePlayerRef.current && youtubeReady) {
        const ytTime = youtubePlayerRef.current.getCurrentTime();
        const ytDuration = youtubePlayerRef.current.getDuration();

        setCurrentTime(ytTime);
        setDuration(ytDuration);

        // Sync audio with YouTube
        if (
          audioRef.current &&
          Math.abs(audioRef.current.currentTime - ytTime) > 0.5
        ) {
          audioRef.current.currentTime = ytTime;
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [youtubeReady]);

  // Set initial audio volume when ref is ready
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume;
    }
  }, [audioVolume]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (document.fullscreenElement) {
        setShowFullscreenControls(true);
        // Auto-hide controls after 3 seconds
        if (fullscreenTimeoutRef.current) {
          clearTimeout(fullscreenTimeoutRef.current);
        }
        fullscreenTimeoutRef.current = setTimeout(() => {
          setShowFullscreenControls(false);
        }, 3000);
      } else {
        setShowFullscreenControls(false);
        if (fullscreenTimeoutRef.current) {
          clearTimeout(fullscreenTimeoutRef.current);
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (fullscreenTimeoutRef.current) {
        clearTimeout(fullscreenTimeoutRef.current);
      }
    };
  }, []);

  // Show controls on mouse move in fullscreen
  useEffect(() => {
    const handleMouseMove = () => {
      if (isFullscreen) {
        setShowFullscreenControls(true);
        if (fullscreenTimeoutRef.current) {
          clearTimeout(fullscreenTimeoutRef.current);
        }
        fullscreenTimeoutRef.current = setTimeout(() => {
          setShowFullscreenControls(false);
        }, 3000);
      }
    };

    if (isFullscreen) {
      document.addEventListener("mousemove", handleMouseMove);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        if (fullscreenTimeoutRef.current) {
          clearTimeout(fullscreenTimeoutRef.current);
        }
      };
    }
  }, [isFullscreen]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (!youtubePlayerRef.current || !audioRef.current) return;

    if (isPlaying) {
      youtubePlayerRef.current.pauseVideo();
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      youtubePlayerRef.current.playVideo();
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (time) => {
    if (!youtubePlayerRef.current || !audioRef.current) return;

    youtubePlayerRef.current.seekTo(time, true);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.setVolume(newVolume * 100);
    }
  };

  const handleAudioVolumeChange = (newVolume) => {
    setAudioVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleFullscreen = () => {
    if (!videoContainerRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoContainerRef.current.requestFullscreen();
    }
  };

  const handleSkipBack = () => {
    const newTime = Math.max(0, currentTime - 10);
    handleSeek(newTime);
  };

  const handleSkipForward = () => {
    const newTime = Math.min(duration, currentTime + 10);
    handleSeek(newTime);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Video Player */}
      <Card className="overflow-hidden bg-black/20 backdrop-blur-sm border-white/10">
        <div
          ref={videoContainerRef}
          data-fullscreen-container
          className="aspect-video relative"
        >
          <div id="youtube-player" className="absolute inset-0"></div>

          {/* Fullscreen Controls Overlay */}
          {isFullscreen && (
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
                showFullscreenControls
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={1}
                    onValueChange={(value) => handleSeek(value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-white">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSkipBack}
                    className="text-white hover:bg-white/20 h-14 w-14"
                  >
                    <SkipBack className="w-8 h-8" />
                  </Button>

                  <Button
                    onClick={handlePlayPause}
                    className="h-16 w-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSkipForward}
                    className="text-white hover:bg-white/20 h-14 w-14"
                  >
                    <SkipForward className="w-8 h-8" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleFullscreen}
                    className="text-white hover:bg-white/20 h-14 w-14"
                  >
                    <Minimize className="w-8 h-8" />
                  </Button>
                </div>

                {/* Volume Controls */}
                <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-white" />
                    <span className="text-sm text-white min-w-[60px]">
                      Video
                    </span>
                    <Slider
                      value={[volume]}
                      max={1}
                      step={0.01}
                      onValueChange={(value) => handleVolumeChange(value[0])}
                      className="flex-1"
                    />
                    <span className="text-sm text-white min-w-[40px]">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-white" />
                    <span className="text-sm text-white min-w-[60px]">
                      Audio
                    </span>
                    <Slider
                      value={[audioVolume]}
                      max={1}
                      step={0.01}
                      onValueChange={(value) =>
                        handleAudioVolumeChange(value[0])
                      }
                      className="flex-1"
                    />
                    <span className="text-sm text-white min-w-[40px]">
                      {Math.round(audioVolume * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Audio Player (Hidden but functional) */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Controls */}
      <PlayerControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        audioVolume={audioVolume}
        onPlayPause={handlePlayPause}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onAudioVolumeChange={handleAudioVolumeChange}
        onFullscreen={handleFullscreen}
      />

      {/* Info Panel */}
      <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              Video YouTube
            </h3>
            <p className="text-gray-300 text-sm break-all">{youtubeUrl}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              Audio Archive.org
            </h3>
            <p className="text-gray-300 text-sm break-all">{audioUrl}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MediaSyncPlayer;
