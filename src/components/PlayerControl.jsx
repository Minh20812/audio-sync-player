import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Headphones,
  Maximize,
} from "lucide-react";

const PlayerControls = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  audioVolume,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onAudioVolumeChange,
  onFullscreen,
}) => {
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSkipBack = () => {
    onSeek(Math.max(0, currentTime - 10));
  };

  const handleSkipForward = () => {
    onSeek(Math.min(duration, currentTime + 10));
  };

  return (
    <Card className="p-3 sm:p-4 md:p-6 bg-white/10 backdrop-blur-sm border-white/20">
      <div className="space-y-4 sm:space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={(value) => onSeek(value[0])}
            className="w-full"
          />
          <div className="flex justify-between text-xs sm:text-sm text-gray-300">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkipBack}
            className="text-white hover:bg-white/20 h-10 w-10 sm:h-12 sm:w-12"
          >
            <SkipBack className="w-4 h-4 sm:w-6 sm:h-6" />
          </Button>

          <Button
            onClick={onPlayPause}
            className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            ) : (
              <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkipForward}
            className="text-white hover:bg-white/20 h-10 w-10 sm:h-12 sm:w-12"
          >
            <SkipForward className="w-4 h-4 sm:w-6 sm:h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onFullscreen}
            className="text-white hover:bg-white/20 h-10 w-10 sm:h-12 sm:w-12"
          >
            <Maximize className="w-4 h-4 sm:w-6 sm:h-6" />
          </Button>
        </div>

        {/* Volume Controls */}
        <div className="space-y-4 sm:space-y-6">
          {/* Video Volume */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
              <span className="text-xs sm:text-sm text-white font-medium">
                Video Volume
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Slider
                value={[volume]}
                max={1}
                step={0.01}
                onValueChange={(value) => onVolumeChange(value[0])}
                className="flex-1"
              />
              <span className="text-xs sm:text-sm text-gray-300 min-w-[35px] sm:min-w-[40px] text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>

          {/* Audio Volume */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
              <span className="text-xs sm:text-sm text-white font-medium">
                Audio Volume
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Slider
                value={[audioVolume]}
                max={1}
                step={0.01}
                onValueChange={(value) => onAudioVolumeChange(value[0])}
                className="flex-1"
              />
              <span className="text-xs sm:text-sm text-gray-300 min-w-[35px] sm:min-w-[40px] text-right">
                {Math.round(audioVolume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PlayerControls;
