import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

const ControlsPanel = ({
  isPlaying,
  togglePlayPause,
  videoMuted,
  setVideoMuted,
  audioOffset,
  setAudioOffset,
  youtubeRef,
}) => {
  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Playback Controls */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={togglePlayPause}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full w-16 h-16"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>

            <Button
              onClick={() => setVideoMuted(!videoMuted)}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              {videoMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
              <span className="ml-2">
                {videoMuted ? "Unmute Video" : "Mute Video"}
              </span>
            </Button>
          </div>

          {/* Audio Offset Control */}
          <div className="flex-1 max-w-md space-y-2">
            <Label className="text-white text-sm">
              Audio Offset: {audioOffset > 0 ? "+" : ""}
              {audioOffset}s
            </Label>
            <Slider
              value={[audioOffset]}
              onValueChange={(value) => setAudioOffset(value[0])}
              min={-5}
              max={5}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>-5s (Audio Early)</span>
              <span>+5s (Audio Late)</span>
            </div>
          </div>

          {/* Sync Status */}
          <div className="text-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-1"></div>
            <p className="text-white text-sm">Synced</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlsPanel;
