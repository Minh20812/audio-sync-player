import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Minimize,
  RotateCw,
  Captions,
  CaptionsOff,
  SlidersHorizontal,
} from "lucide-react";
import QualityMenu from "./QualityMenu";

const FullscreenControls = ({
  isFullscreen,
  showFullscreenControls,
  isPlaying,
  currentTime,
  duration,
  isMobile,
  captionsEnabled,
  showQualityMenu,
  currentQuality,
  videoQualities,
  onPlayPause,
  onSeek,
  onSkipBack,
  onSkipForward,
  onFullscreen,
  onRotateLandscape,
  onToggleCaptions,
  onQualityMenuToggle,
  onQualityChange,
  formatTime,
  fullscreenTimeoutRef,
}) => {
  if (!isFullscreen) return null;

  return (
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
            onValueChange={(value) => onSeek(value[0])}
            className="w-full"
          />
          <div className="flex justify-between text-xs sm:text-sm text-white font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onQualityMenuToggle}
            className="text-white hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12"
            title="Chất lượng"
          >
            <SlidersHorizontal className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>

          <QualityMenu
            show={showQualityMenu}
            qualities={videoQualities}
            currentQuality={currentQuality}
            onQualityChange={onQualityChange}
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={onSkipBack}
            className="text-white hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12"
          >
            <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>

          <Button
            onClick={onPlayPause}
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
            onClick={onSkipForward}
            className="text-white hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12"
          >
            <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onFullscreen}
            className="text-white hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12"
            title="Fullscreen"
          >
            <Minimize className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>

          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRotateLandscape}
              className="text-white hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12"
              title="Xoay ngang"
            >
              <RotateCw className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCaptions}
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
  );
};

export default FullscreenControls;
