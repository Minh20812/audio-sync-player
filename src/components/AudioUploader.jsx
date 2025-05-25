import React, { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Upload, Music } from "lucide-react";

const AudioUploader = ({ audioFile, setAudioFile }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (
      file &&
      (file.type.startsWith("audio/") ||
        file.name.endsWith(".mp3") ||
        file.name.endsWith(".wav"))
    ) {
      setAudioFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type.startsWith("audio/") ||
        file.name.endsWith(".mp3") ||
        file.name.endsWith(".wav"))
    ) {
      setAudioFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Music className="w-5 h-5 text-purple-400" />
        <Label className="text-white font-medium">External Audio File</Label>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer bg-white/5"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav"
          onChange={handleFileSelect}
          className="hidden"
        />

        {audioFile ? (
          <div className="space-y-2">
            <Music className="w-8 h-8 text-purple-400 mx-auto" />
            <p className="text-white font-medium">{audioFile.name}</p>
            <p className="text-sm text-gray-400">
              {(audioFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-white">Drop your audio file here</p>
            <p className="text-sm text-gray-400">
              or click to browse (MP3, WAV supported)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioUploader;
