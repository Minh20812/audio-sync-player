import { useState, useRef, useEffect } from "react";

export const useVideoSync = (youtubePlayerRef, audioRef, youtubeReady) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

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
  }, [youtubeReady, youtubePlayerRef, audioRef]);

  // Handle play/pause sync
  useEffect(() => {
    if (!youtubePlayerRef.current) return;

    const handleStateChange = (event) => {
      if (event.data === window.YT.PlayerState.PLAYING && !isPlaying) {
        setIsPlaying(true);
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
        }
      } else if (event.data === window.YT.PlayerState.PAUSED && isPlaying) {
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }
    };

    youtubePlayerRef.current.addEventListener(
      "onStateChange",
      handleStateChange
    );

    return () => {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.removeEventListener(
          "onStateChange",
          handleStateChange
        );
      }
    };
  }, [isPlaying, youtubePlayerRef, audioRef]);

  return {
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
  };
};
