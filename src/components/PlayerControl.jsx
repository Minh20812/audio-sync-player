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
    <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={(value) => onSeek(value[0])}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-300">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkipBack}
            className="text-white hover:bg-white/20 h-12 w-12"
          >
            <SkipBack className="w-6 h-6" />
          </Button>

          <Button
            onClick={onPlayPause}
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
            className="text-white hover:bg-white/20 h-12 w-12"
          >
            <SkipForward className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onFullscreen}
            className="text-white hover:bg-white/20 h-12 w-12"
          >
            <Maximize className="w-6 h-6" />
          </Button>
        </div>

        {/* Volume Controls */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-white" />
            <span className="text-sm text-white min-w-[80px]">Video</span>
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={(value) => onVolumeChange(value[0])}
              className="flex-1"
            />
            <span className="text-sm text-gray-300 min-w-[40px]">
              {Math.round(volume * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Headphones className="w-5 h-5 text-white" />
            <span className="text-sm text-white min-w-[80px]">Audio</span>
            <Slider
              value={[audioVolume]}
              max={1}
              step={0.01}
              onValueChange={(value) => onAudioVolumeChange(value[0])}
              className="flex-1"
            />
            <span className="text-sm text-gray-300 min-w-[40px]">
              {Math.round(audioVolume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PlayerControls;
