import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";


const VideoUploader = ({
  youtubeUrl,
  setYoutubeUrl,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Upload className="w-5 h-5 text-blue-400" />
        <Label htmlFor="youtube-url" className="text-white font-medium">
          YouTube Video URL
        </Label>
      </div>

      <Input
        id="youtube-url"
        type="url"
        placeholder="https://www.youtube.com/watch?v=..."
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400"
      />

      <div className="text-sm text-gray-400">
        Paste any YouTube video URL. The video will be embedded for synchronized
        playback.
      </div>
    </div>
  );
};

export default VideoUploader;
