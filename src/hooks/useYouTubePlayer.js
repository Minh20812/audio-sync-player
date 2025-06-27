import { useState, useRef, useEffect } from "react";

export const useYouTubePlayer = (videoId, volume, isMobile) => {
  const [youtubeReady, setYoutubeReady] = useState(false);
  const [isYouTubeAPILoaded, setIsYouTubeAPILoaded] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const youtubePlayerRef = useRef(null);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsYouTubeAPILoaded(true);
      return;
    }

    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const checkAPI = setInterval(() => {
        if (window.YT && window.YT.Player) {
          setIsYouTubeAPILoaded(true);
          clearInterval(checkAPI);
        }
      }, 100);
      return () => clearInterval(checkAPI);
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);

    window.onYouTubeIframeAPIReady = () => {
      setIsYouTubeAPILoaded(true);
    };

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  // Initialize YouTube Player
  useEffect(() => {
    if (!isYouTubeAPILoaded || !videoId || error) {
      setIsLoading(false);
      return;
    }

    if (youtubePlayerRef.current && youtubePlayerRef.current.destroy) {
      try {
        youtubePlayerRef.current.destroy();
      } catch (error) {
        console.log("Error destroying player:", error);
      }
    }

    setYoutubeReady(false);
    setError(null);

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
              setIsLoading(false);
              event.target.setVolume(volume * 100);
              event.target.setPlaybackQuality(isMobile ? "small" : "medium");
            },
            onError: (event) => {
              let errorMessage = "Lỗi không xác định";
              switch (event.data) {
                case 2:
                  errorMessage = `Video ID không hợp lệ: "${videoId}"`;
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
            },
          },
        });
      } catch (error) {
        setError(`Không thể tạo YouTube player: ${error.message}`);
        setIsLoading(false);
      }
    };

    const timer = setTimeout(initPlayer, 100);
    return () => clearTimeout(timer);
  }, [videoId, isYouTubeAPILoaded, volume, isMobile, error]);

  return {
    youtubePlayerRef,
    youtubeReady,
    error,
    isLoading,
    setError,
  };
};
