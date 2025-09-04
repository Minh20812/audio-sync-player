import React, { useRef, useEffect, useState } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  Maximize,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const PlayerVideo = ({ url, title }) => {
  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const hlsRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentMethod, setCurrentMethod] = useState("iframe");
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [showIframe, setShowIframe] = useState(false);

  const updateStatus = (method, status, message = "") => {
    setCurrentMethod(method);
    setStatus(status);
    setErrorMessage(message);
  };

  const isShareUrl = (url) => url.includes("/share/");
  const isM3u8Url = (url) => url.includes(".m3u8");

  const tryIframeMethod = () => {
    updateStatus("iframe", "loading");
    setShowIframe(true);

    // Iframe will load, we'll handle success/error through events
    const timer = setTimeout(() => {
      if (status === "loading") {
        updateStatus("iframe", "success");
      }
    }, 3000);

    return () => clearTimeout(timer);
  };

  const tryHLSMethod = () => {
    const video = videoRef.current;
    if (!video) return;

    updateStatus("hls", "loading");
    setShowIframe(false);

    try {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          updateStatus("hls", "success");
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            updateStatus("hls", "error", `HLS Error: ${data.details}`);
            tryDirectMethod();
          }
        });

        hlsRef.current = hls;
      } else {
        tryDirectMethod();
      }
    } catch (error) {
      updateStatus(
        "hls",
        "error",
        `HLS Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      tryDirectMethod();
    }
  };

  const tryDirectMethod = () => {
    const video = videoRef.current;
    if (!video) return;

    updateStatus("direct", "loading");
    setShowIframe(false);

    video.src = url;
    video.load();

    const handleLoadedMetadata = () => {
      updateStatus("direct", "success");
    };

    const handleError = () => {
      updateStatus(
        "failed",
        "error",
        "Không thể tải video. Thử mở link trực tiếp."
      );
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("error", handleError);
    };
  };

  useEffect(() => {
    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Choose loading strategy based on URL
    if (isShareUrl(url)) {
      tryIframeMethod();
    } else if (isM3u8Url(url)) {
      tryHLSMethod();
    } else {
      tryDirectMethod();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [url]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (video && !showIframe) {
      if (video.paused) {
        video.play().catch(() => {
          setErrorMessage("Không thể phát video");
        });
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const requestFullscreen = () => {
    const element = showIframe ? iframeRef.current : videoRef.current;
    if (element) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if ("webkitRequestFullscreen" in element) {
        element.webkitRequestFullscreen();
      }
    }
  };

  const openInNewTab = () => {
    window.open(url, "_blank");
  };

  const retryWithMethod = (method) => {
    if (method === "hls") {
      tryHLSMethod();
    } else if (method === "direct") {
      tryDirectMethod();
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-4 w-4 animate-spin text-accent" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusText = () => {
    switch (currentMethod) {
      case "iframe":
        return status === "loading"
          ? "Đang tải iframe..."
          : "Video iframe sẵn sàng";
      case "hls":
        return status === "loading" ? "Đang tải HLS..." : "Video HLS sẵn sàng";
      case "direct":
        return status === "loading"
          ? "Đang tải direct..."
          : "Video direct sẵn sàng";
      case "failed":
        return "Không thể tải video";
    }
  };

  return (
    <div className="relative bg-card rounded-xl overflow-hidden shadow-player">
      <div className="aspect-video bg-gradient-dark relative">
        {/* Video Element */}
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${
            showIframe ? "hidden" : "block"
          }`}
          poster="/placeholder.svg"
          crossOrigin="anonymous"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Iframe Element */}
        {showIframe && (
          <iframe
            ref={iframeRef}
            src={url}
            className="w-full h-full border-0"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
          />
        )}

        {/* Video Controls Overlay - Only show for video, not iframe */}
        {!showIframe && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlayPause}
                className="bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white border-0"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>

              <div className="flex items-center gap-2 flex-1">
                <Volume2 className="h-4 w-4 text-white" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="flex-1 accent-primary"
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={requestFullscreen}
                className="bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white border-0"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <h3 className="text-xl font-bold text-foreground">{title}</h3>

        {/* Status Display */}
        <div className="flex items-center gap-2 text-sm">
          {getStatusIcon()}
          <span className="text-muted-foreground">{getStatusText()}</span>
        </div>

        {/* Error Alert */}
        {status === "error" && (
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{errorMessage}</span>
              <div className="flex gap-2">
                {currentMethod !== "hls" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => retryWithMethod("hls")}
                    className="border-destructive text-destructive hover:bg-destructive/10"
                  >
                    Thử HLS
                  </Button>
                )}
                {currentMethod !== "direct" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => retryWithMethod("direct")}
                    className="border-destructive text-destructive hover:bg-destructive/10"
                  >
                    Thử Direct
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openInNewTab}
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Mở Link
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};
