import { useState, useRef, useEffect } from "react";

export const useFullscreen = (isMobile) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenControls, setShowFullscreenControls] = useState(false);
  const fullscreenTimeoutRef = useRef();

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

  const handleFullscreen = async (videoContainerRef) => {
    if (!videoContainerRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
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
        if (isMobile && screen.orientation && screen.orientation.lock) {
          try {
            await screen.orientation.lock("landscape");
          } catch (error) {
            console.log("Could not lock orientation to landscape:", error);
          }
        }
      } catch (error) {
        console.error("Error entering fullscreen:", error);
      }
    }
  };

  return {
    isFullscreen,
    showFullscreenControls,
    setShowFullscreenControls,
    handleFullscreen,
    fullscreenTimeoutRef,
  };
};
