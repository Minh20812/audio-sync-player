import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import PlayerControls from "./PlayerControl";
import { formatArchiveId, formatArchiveFilename } from "@/utils/archive";
import { useYouTubePlayer } from "../hooks/useYouTubePlayer";
import { useVideoSync } from "../hooks/useVideoSync";
import { useFullscreen } from "../hooks/useFullscreen";
import VideoPlayer from "./VideoPlayer";
import FullscreenControls from "./FullscreenControls";
import AudioPlayer from "./AudioPlayer";
import ErrorDisplay from "./ErrorDisplay";
import LoadingDisplay from "./LoadingDisplay";
import InfoPanel from "./InfoPanel";

const MediaSyncPlayer = ({ videoId }) => {
  // State
  const [volume, setVolume] = useState(0.25);
  const [audioVolume, setAudioVolume] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [currentQuality, setCurrentQuality] = useState("default");

  // Refs
  const audioRef = useRef(null);
  const videoContainerRef = useRef(null);

  // Constants
  const videoQualities = [
    { label: "Auto", value: "default" },
    { label: "144p", value: "tiny" },
    { label: "240p", value: "small" },
    { label: "360p", value: "medium" },
    { label: "480p", value: "large" },
    { label: "720p", value: "hd720" },
    { label: "1080p", value: "hd1080" },
  ];

  // Validate video ID
  const validateVideoId = (id) => {
    if (!id) return null;
    let cleanId = id.toString().trim();
    const youtubeRegex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = cleanId.match(youtubeRegex);
    if (match) cleanId = match[1];
    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanId)) return cleanId;
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

  // Custom hooks
  const { youtubePlayerRef, youtubeReady, error, isLoading, setError } =
    useYouTubePlayer(validVideoId, volume, isMobile);

  const { isPlaying, setIsPlaying, currentTime, duration } = useVideoSync(
    youtubePlayerRef,
    audioRef,
    youtubeReady
  );

  const {
    isFullscreen,
    showFullscreenControls,
    setShowFullscreenControls,
    handleFullscreen,
    fullscreenTimeoutRef,
  } = useFullscreen(isMobile);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Validate video ID on change
  useEffect(() => {
    if (!videoId) {
      setError("Không có video ID được cung cấp");
      return;
    }
    if (!validVideoId) {
      setError(`Video ID không hợp lệ: "${videoId}". Vui lòng kiểm tra lại.`);
      return;
    }
    setError(null);
  }, [videoId, validVideoId, setError]);

  // Update audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume;
    }
  }, [audioVolume]);

  // Helper functions
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Event handlers
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
        alert("Thiết bị hoặc trình duyệt không hỗ trợ xoay ngang tự động.");
      }
    }
  };

  const handleSeek = (time) => {
    if (!youtubePlayerRef.current || !audioRef.current) return;
    try {
      youtubePlayerRef.current.seekTo(time, true);
      audioRef.current.currentTime = time;
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

  // Render error state
  if (error) {
    return (
      <ErrorDisplay
        error={error}
        videoId={videoId}
        validVideoId={validVideoId}
      />
    );
  }

  // Render loading state
  if (isLoading) {
    return <LoadingDisplay />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6 px-2 md:px-0">
      {/* Video Player */}
      <Card className="overflow-hidden bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 rounded-xl">
        <VideoPlayer videoContainerRef={videoContainerRef}>
          {/* Fullscreen Controls Overlay */}
          <FullscreenControls
            isFullscreen={isFullscreen}
            showFullscreenControls={showFullscreenControls}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            isMobile={isMobile}
            captionsEnabled={captionsEnabled}
            showQualityMenu={showQualityMenu}
            currentQuality={currentQuality}
            videoQualities={videoQualities}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            onSkipBack={handleSkipBack}
            onSkipForward={handleSkipForward}
            onFullscreen={() => handleFullscreen(videoContainerRef)}
            onRotateLandscape={handleRotateLandscape}
            onToggleCaptions={handleToggleCaptions}
            onQualityMenuToggle={() => setShowQualityMenu((v) => !v)}
            onQualityChange={handleSetQuality}
            formatTime={formatTime}
            fullscreenTimeoutRef={fullscreenTimeoutRef}
          />
        </VideoPlayer>
      </Card>

      {/* Audio Player (Hidden but functional) */}
      <AudioPlayer
        audioRef={audioRef}
        validVideoId={validVideoId}
        formattedArchiveFilename={formattedArchiveFilename}
        audioUrl={audioUrl}
      />

      {/* Controls (for non-fullscreen) */}
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
          onFullscreen={() => handleFullscreen(videoContainerRef)}
          isMobile={isMobile}
        />
      )}

      {/* Info Panel */}
      <InfoPanel
        validVideoId={validVideoId}
        youtubeUrl={youtubeUrl}
        audioRef={audioRef}
        audioUrl={audioUrl}
        isMobile={isMobile}
      />
    </div>
  );
};

export default MediaSyncPlayer;
