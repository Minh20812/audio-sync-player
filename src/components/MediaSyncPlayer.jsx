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
  Maximize,
  RotateCw,
} from "lucide-react";
import PlayerControls from "./PlayerControl";
import { formatArchiveId, formatArchiveFilename } from "@/utils/archive";

const MediaSyncPlayer = ({ videoId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.15);
  const [audioVolume, setAudioVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenControls, setShowFullscreenControls] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const audioRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const videoContainerRef = useRef(null);
  const fullscreenTimeoutRef = useRef();
  const [youtubeReady, setYoutubeReady] = useState(false);
  const [isYouTubeAPILoaded, setIsYouTubeAPILoaded] = useState(false);

  const formattedArchiveId = formatArchiveId(videoId);
  const formattedArchiveFilename = formatArchiveFilename(videoId);

  const audioUrl = `https://archive.org/download/${formattedArchiveId}/${formattedArchiveFilename}`;
  const youtubeUrl = `https://youtube.com/watch?v=${videoId}`;

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load YouTube IFrame API (only once)
  useEffect(() => {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      setIsYouTubeAPILoaded(true);
      return;
    }

    // Check if script is already loading
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const checkAPI = setInterval(() => {
        if (window.YT && window.YT.Player) {
          setIsYouTubeAPILoaded(true);
          clearInterval(checkAPI);
        }
      }, 100);
      return () => clearInterval(checkAPI);
    }

    // Load the API
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);

    window.onYouTubeIframeAPIReady = () => {
      setIsYouTubeAPILoaded(true);
    };

    return () => {
      // Don't remove script as it might be used by other components
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  // Initialize/Update YouTube Player when videoId changes
  useEffect(() => {
    if (!isYouTubeAPILoaded || !videoId) return;

    // Destroy existing player
    if (youtubePlayerRef.current && youtubePlayerRef.current.destroy) {
      try {
        youtubePlayerRef.current.destroy();
      } catch (error) {
        console.log("Error destroying player:", error);
      }
    }

    // Reset states
    setYoutubeReady(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    // Create new player
    const initPlayer = () => {
      try {
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
            cc_load_policy: 1,
            cc_lang_pref: "en",
            hl: "en",
            vq: isMobile ? "small" : "medium",
          },
          events: {
            onReady: (event) => {
              setYoutubeReady(true);
              event.target.setVolume(volume * 100);
              event.target.setPlaybackQuality(isMobile ? "small" : "medium");

              // Setup captions
              try {
                const tracks = event.target.getOption("captions", "tracklist");
                if (tracks && tracks.length > 0) {
                  const englishTrack = tracks.find(
                    (track) =>
                      track.languageCode === "en" ||
                      track.languageCode === "en-US" ||
                      track.languageCode === "en-GB"
                  );

                  if (englishTrack) {
                    event.target.setOption("captions", "track", englishTrack);
                  } else if (tracks.length > 0) {
                    event.target.setOption("captions", "track", tracks[0]);
                  }
                }

                event.target.setOption("captions", "displaySettings", {
                  background: "#000000",
                  backgroundOpacity: 0.75,
                  color: "#FFFFFF",
                  fontFamily: "Arial",
                  fontSize: isMobile ? 0.8 : 1,
                });
              } catch (error) {
                console.log("Cannot setup captions:", error);
              }
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.PLAYING && !isPlaying) {
                setIsPlaying(true);
                if (audioRef.current) {
                  audioRef.current.play().catch(console.error);
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
      } catch (error) {
        console.error("Error creating YouTube player:", error);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initPlayer, 100);
    return () => clearTimeout(timer);
  }, [videoId, isYouTubeAPILoaded, volume, isMobile]);

  // Sync time updates
  useEffect(() => {
    if (!youtubeReady) return;

    const interval = setInterval(() => {
      if (youtubePlayerRef.current && youtubePlayerRef.current.getCurrentTime) {
        try {
          const ytTime = youtubePlayerRef.current.getCurrentTime();
          const ytDuration = youtubePlayerRef.current.getDuration();

          setCurrentTime(ytTime);
          setDuration(ytDuration);

          // Sync audio with video
          if (
            audioRef.current &&
            Math.abs(audioRef.current.currentTime - ytTime) > 0.5
          ) {
            audioRef.current.currentTime = ytTime;
          }
        } catch (error) {
          console.log("Error syncing time:", error);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [youtubeReady]);

  // Update audio volume
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
    if (!isFullscreen) return;

    const handleShowControls = () => {
      setShowFullscreenControls(true);
      if (fullscreenTimeoutRef.current)
        clearTimeout(fullscreenTimeoutRef.current);
      fullscreenTimeoutRef.current = setTimeout(() => {
        setShowFullscreenControls(false);
      }, 3000);
    };

    document.addEventListener("click", handleShowControls);

    return () => {
      document.removeEventListener("click", handleShowControls);
      if (fullscreenTimeoutRef.current)
        clearTimeout(fullscreenTimeoutRef.current);
    };
  }, [isFullscreen]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (!youtubePlayerRef.current || !audioRef.current) return;

    try {
      if (isPlaying) {
        youtubePlayerRef.current.pauseVideo();
        audioRef.current.pause();
        setIsPlaying(false);
        if (isFullscreen) {
          setShowFullscreenControls(true);
          if (fullscreenTimeoutRef.current) {
            clearTimeout(fullscreenTimeoutRef.current);
          }
        }
      } else {
        youtubePlayerRef.current.playVideo();
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
        if (isFullscreen) {
          if (fullscreenTimeoutRef.current) {
            clearTimeout(fullscreenTimeoutRef.current);
          }
          fullscreenTimeoutRef.current = setTimeout(() => {
            setShowFullscreenControls(false);
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Error in play/pause:", error);
    }
  };

  const handleRotateLandscape = async () => {
    if (isMobile && screen.orientation && screen.orientation.lock) {
      try {
        await screen.orientation.lock("landscape");
      } catch (error) {
        // Fallback hoặc thông báo nếu không hỗ trợ
        alert("Thiết bị hoặc trình duyệt không hỗ trợ xoay ngang tự động.");
      }
    }
  };

  const handleSeek = (time) => {
    if (!youtubePlayerRef.current || !audioRef.current) return;

    try {
      youtubePlayerRef.current.seekTo(time, true);
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    } catch (error) {
      console.error("Error seeking:", error);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (youtubePlayerRef.current && youtubePlayerRef.current.setVolume) {
      try {
        youtubePlayerRef.current.setVolume(newVolume * 100);
      } catch (error) {
        console.error("Error setting volume:", error);
      }
    }
  };

  const handleAudioVolumeChange = (newVolume) => {
    setAudioVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleFullscreen = async () => {
    if (!videoContainerRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
      // Unlock orientation when exiting fullscreen
      if (screen.orientation && screen.orientation.unlock) {
        try {
          screen.orientation.unlock();
        } catch (error) {
          console.log("Could not unlock orientation:", error);
        }
      }
    } else {
      try {
        await videoContainerRef.current.requestFullscreen();

        // Lock to landscape orientation on mobile when entering fullscreen
        if (isMobile && screen.orientation && screen.orientation.lock) {
          try {
            await screen.orientation.lock("landscape");
          } catch (error) {
            console.log("Could not lock orientation to landscape:", error);
            // Fallback: try to lock to any landscape orientation
            try {
              await screen.orientation.lock("landscape-primary");
            } catch (fallbackError) {
              console.log(
                "Could not lock to landscape-primary:",
                fallbackError
              );
            }
          }
        }
      } catch (error) {
        console.error("Error entering fullscreen:", error);
      }
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (youtubePlayerRef.current && youtubePlayerRef.current.destroy) {
        try {
          youtubePlayerRef.current.destroy();
        } catch (error) {
          console.log("Error destroying player on unmount:", error);
        }
      }
      if (fullscreenTimeoutRef.current) {
        clearTimeout(fullscreenTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6 px-2 md:px-0">
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
              className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-transform duration-300 z-20
    ${showFullscreenControls ? "translate-y-0" : "translate-y-[50%]"}
  `}
              style={{ willChange: "transform" }}
            >
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 space-y-2 md:space-y-4">
                {/* Progress Bar */}
                <div className="space-y-1 md:space-y-2">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={1}
                    onValueChange={(value) => handleSeek(value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs md:text-sm text-white">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-2 md:gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSkipBack}
                    className="text-white hover:bg-white/20 h-10 w-10 md:h-14 md:w-14"
                  >
                    <SkipBack className="w-5 h-5 md:w-8 md:h-8" />
                  </Button>

                  <Button
                    onClick={handlePlayPause}
                    className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    ) : (
                      <Play className="w-6 h-6 md:w-8 md:h-8 text-white ml-0.5 md:ml-1" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSkipForward}
                    className="text-white hover:bg-white/20 h-10 w-10 md:h-14 md:w-14"
                  >
                    <SkipForward className="w-5 h-5 md:w-8 md:h-8" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleFullscreen}
                    className="text-white hover:bg-white/20 h-10 w-10 md:h-14 md:w-14"
                  >
                    <Minimize className="w-5 h-5 md:w-8 md:h-8" />
                  </Button>

                  {/* Nút xoay ngang chỉ hiển thị trên mobile và fullscreen */}
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRotateLandscape}
                      className="text-white hover:bg-white/20 h-10 w-10 md:h-14 md:w-14"
                      title="Xoay ngang màn hình"
                    >
                      <RotateCw className="w-5 h-5 md:w-8 md:h-8" />
                    </Button>
                  )}
                </div>

                {/* Volume Controls */}
                <div
                  className={`${
                    isMobile ? "space-y-3" : "grid grid-cols-2 gap-6"
                  } max-w-2xl mx-auto`}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" />
                    <span className="text-xs md:text-sm text-white min-w-[40px] md:min-w-[60px]">
                      Video
                    </span>
                    <Slider
                      value={[volume]}
                      max={1}
                      step={0.01}
                      onValueChange={(value) => handleVolumeChange(value[0])}
                      className="flex-1"
                    />
                    <span className="text-xs md:text-sm text-white min-w-[35px] md:min-w-[40px]">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2 md:gap-3">
                    <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" />
                    <span className="text-xs md:text-sm text-white min-w-[40px] md:min-w-[60px]">
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
                    <span className="text-xs md:text-sm text-white min-w-[35px] md:min-w-[40px]">
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
        key={videoId} // Force re-render when videoId changes
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
        isMobile={isMobile}
      />

      {/* Info Panel */}
      <Card className="p-4 md:p-6 bg-white/10 backdrop-blur-sm border-white/20">
        <div
          className={`${isMobile ? "space-y-4" : "grid md:grid-cols-2 gap-6"}`}
        >
          <div className="space-y-2">
            <h3 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full flex-shrink-0"></span>
              Video YouTube
            </h3>
            <p className="text-gray-300 text-xs md:text-sm break-all">
              {youtubeUrl}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-full flex-shrink-0"></span>
              Audio Archive.org
            </h3>
            <p className="text-gray-300 text-xs md:text-sm break-all">
              {audioUrl}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MediaSyncPlayer;
