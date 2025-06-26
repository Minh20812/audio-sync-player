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
  Captions,
  CaptionsOff,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react";
import PlayerControls from "./PlayerControl";
import { formatArchiveId, formatArchiveFilename } from "@/utils/archive";

const MediaSyncPlayer = ({ videoId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.25);
  const [audioVolume, setAudioVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenControls, setShowFullscreenControls] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [currentQuality, setCurrentQuality] = useState("default");
  const videoQualities = [
    { label: "Auto", value: "default" },
    { label: "144p", value: "tiny" },
    { label: "240p", value: "small" },
    { label: "360p", value: "medium" },
    { label: "480p", value: "large" },
    { label: "720p", value: "hd720" },
    { label: "1080p", value: "hd1080" },
  ];

  const audioRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const videoContainerRef = useRef(null);
  const fullscreenTimeoutRef = useRef();
  const [youtubeReady, setYoutubeReady] = useState(false);
  const [isYouTubeAPILoaded, setIsYouTubeAPILoaded] = useState(false);

  // Validate and clean video ID
  const validateVideoId = (id) => {
    if (!id) return null;

    // Remove any URL parameters or extra characters
    let cleanId = id.toString().trim();

    // Extract video ID from YouTube URL if provided
    const youtubeRegex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = cleanId.match(youtubeRegex);

    if (match) {
      cleanId = match[1];
    }

    // Validate format (YouTube video IDs are 11 characters)
    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanId)) {
      return cleanId;
    }

    return null;
  };

  const validVideoId = validateVideoId(videoId);
  const formattedArchiveId = validVideoId
    ? formatArchiveId(validVideoId)
    : null;
  const formattedArchiveFilename = validVideoId
    ? formatArchiveFilename(validVideoId)
    : [];
  // Ưu tiên .ogg trước .mp3
  const sortedArchiveFilename = [
    ...formattedArchiveFilename.filter((name) => name.endsWith(".ogg")),
    ...formattedArchiveFilename.filter((name) => name.endsWith(".mp3")),
  ];

  const audioUrl = sortedArchiveFilename.map((name) => [
    `https://archive.org/download/${formattedArchiveId}/${name}`,
    name.endsWith(".ogg") ? "audio/ogg" : "audio/mpeg",
  ]);
  const youtubeUrl = validVideoId
    ? `https://youtube.com/watch?v=${validVideoId}`
    : null;

  // Check if video ID is valid
  useEffect(() => {
    if (!videoId) {
      setError("Không có video ID được cung cấp");
      setIsLoading(false);
      return;
    }

    if (!validVideoId) {
      setError(`Video ID không hợp lệ: "${videoId}". Vui lòng kiểm tra lại.`);
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);
  }, [videoId, validVideoId]);

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
    if (!isYouTubeAPILoaded || !validVideoId || error) {
      setIsLoading(false);
      return;
    }

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
    setError(null);

    // Create new player
    const initPlayer = () => {
      try {
        youtubePlayerRef.current = new window.YT.Player("youtube-player", {
          height: "100%",
          width: "100%",
          videoId: validVideoId,
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
              setIsLoading(false);
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
            onError: (event) => {
              let errorMessage = "Lỗi không xác định";
              switch (event.data) {
                case 2:
                  errorMessage = `Video ID không hợp lệ: "${validVideoId}"`;
                  break;
                case 5:
                  errorMessage = "Lỗi HTML5 player";
                  break;
                case 100:
                  errorMessage = "Video không tồn tại hoặc đã bị xóa";
                  break;
                case 101:
                case 150:
                  errorMessage =
                    "Video không thể phát được do hạn chế của chủ sở hữu";
                  break;
                default:
                  errorMessage = `Lỗi YouTube player: ${event.data}`;
              }
              setError(errorMessage);
              setIsLoading(false);
              console.error("YouTube Player Error:", event.data, errorMessage);
            },
          },
        });
      } catch (error) {
        console.error("Error creating YouTube player:", error);
        setError(`Không thể tạo YouTube player: ${error.message}`);
        setIsLoading(false);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initPlayer, 100);
    return () => clearTimeout(timer);
  }, [validVideoId, isYouTubeAPILoaded, volume, isMobile, error]);

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

  const handleSetQuality = (quality) => {
    setCurrentQuality(quality);
    setShowQualityMenu(false);
    if (
      youtubePlayerRef.current &&
      youtubePlayerRef.current.setPlaybackQuality &&
      quality !== "default"
    ) {
      youtubePlayerRef.current.setPlaybackQuality(quality);
    }
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

  const handleToggleCaptions = () => {
    if (!youtubePlayerRef.current) return;
    try {
      if (captionsEnabled) {
        youtubePlayerRef.current.unloadModule("captions");
      } else {
        youtubePlayerRef.current.loadModule("captions");
      }
      setCaptionsEnabled((prev) => !prev);
    } catch (error) {
      console.error("Error toggling captions:", error);
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

  // Render error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6 px-2 md:px-0">
        <Card className="overflow-hidden bg-red-500/20 backdrop-blur-sm border-red-500/30">
          <div className="aspect-video relative flex items-center justify-center bg-red-900/20">
            <div className="text-center space-y-4 p-8">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
              <h3 className="text-xl font-semibold text-red-200">
                Lỗi Video Player
              </h3>
              <p className="text-red-300 max-w-md">{error}</p>
              <div className="space-y-2 text-sm text-red-400">
                <p>
                  <strong>Video ID được cung cấp:</strong> {videoId}
                </p>
                {validVideoId && (
                  <p>
                    <strong>Video ID hợp lệ:</strong> {validVideoId}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6 px-2 md:px-0">
        <Card className="overflow-hidden bg-black/20 backdrop-blur-sm border-white/10">
          <div className="aspect-video relative flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="text-white">Đang tải video player...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6 px-2 md:px-0">
      {/* Video Player */}
      <Card className="overflow-hidden bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 rounded-xl">
        <div
          ref={videoContainerRef}
          data-fullscreen-container
          className="aspect-video relative"
        >
          <div id="youtube-player" className="absolute inset-0" />

          {isFullscreen && (
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent transition-transform duration-300 z-20 ${
                showFullscreenControls ? "translate-y-0" : "translate-y-[30%]"
              }`}
              style={{ willChange: "transform" }}
            >
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 space-y-3">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={1}
                    onValueChange={(value) => handleSeek(value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs sm:text-sm text-white font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
                  {/* Chất lượng */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowQualityMenu((v) => !v)}
                    className="text-white hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12"
                    title="Chất lượng"
                  >
                    <SlidersHorizontal className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>

                  {showQualityMenu && (
                    <div className="absolute bottom-24 right-4 sm:right-6 bg-neutral-900/90 border border-white/10 rounded-md shadow-xl z-40 w-44 animate-fade-in transition-opacity duration-200">
                      <div className="py-2">
                        {videoQualities.map((q) => (
                          <button
                            key={q.value}
                            onClick={() => {
                              handleSetQuality(q.value);
                              setShowQualityMenu(false); // đóng menu sau khi chọn
                            }}
                            className={`flex items-center justify-between w-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors ${
                              q.value === currentQuality
                                ? "font-bold text-blue-400"
                                : ""
                            }`}
                          >
                            <span>{q.label}</span>
                            {q.value === currentQuality && (
                              <svg
                                className="w-4 h-4 text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Các nút điều khiển chính */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSkipBack}
                    className="text-white hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12"
                  >
                    <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>

                  <Button
                    onClick={handlePlayPause}
                    className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-xl"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    ) : (
                      <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSkipForward}
                    className="text-white hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12"
                  >
                    <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>

                  {/* Fullscreen */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleFullscreen}
                    className="text-white hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12"
                    title="Fullscreen"
                  >
                    <Minimize className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>

                  {/* Rotate (mobile) */}
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRotateLandscape}
                      className="text-white hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12"
                      title="Xoay ngang"
                    >
                      <RotateCw className="w-5 h-5 sm:w-6 sm:h-6" />
                    </Button>
                  )}

                  {/* Captions */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleCaptions}
                    className="text-white hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12"
                    title={captionsEnabled ? "Tắt phụ đề" : "Bật phụ đề"}
                  >
                    {captionsEnabled ? (
                      <CaptionsOff className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <Captions className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Audio Player (Hidden but functional) */}
      {validVideoId && formattedArchiveFilename.length > 0 && (
        <audio
          controls
          preload="metadata"
          crossOrigin="anonymous"
          ref={audioRef}
          key={validVideoId}
        >
          {audioUrl.map(([src, type]) => (
            <source key={src} src={src} type={type} />
          ))}
          Trình duyệt của bạn không hỗ trợ audio.
        </audio>
      )}

      {/* Controls */}
      {validVideoId && !error && (
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
      )}

      {/* Info Panel */}
      {validVideoId && youtubeUrl && (
        <Card className="p-4 md:p-6 bg-white/10 backdrop-blur-sm border-white/20">
          <div
            className={`${
              isMobile ? "space-y-4" : "grid md:grid-cols-2 gap-6"
            }`}
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
                {audioRef.current?.currentSrc ||
                  (audioUrl.length > 0 ? audioUrl[0][0] : "N/A")}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MediaSyncPlayer;
