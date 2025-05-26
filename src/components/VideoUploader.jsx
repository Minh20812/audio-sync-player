import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Youtube } from "lucide-react";

const VideoUploader = ({ videoId, setVideoId }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Youtube className="w-5 h-5 text-blue-400" />
        <Label htmlFor="youtube-id" className="text-white font-medium">
          YouTube Video ID
        </Label>
      </div>

      <Input
        id="youtube-id"
        type="text"
        placeholder="Enter YouTube video ID (e.g., 6GsSuBX3qSM)"
        value={videoId || ""}
        onChange={(e) => setVideoId(e.target.value)}
        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400"
      />

      <div className="text-sm text-gray-400">
        Enter the YouTube video ID. You can find it in the URL after "v=" or
        after "youtu.be/".
      </div>
    </div>
  );
};

export default VideoUploader;
