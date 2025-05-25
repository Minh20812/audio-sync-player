import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { toast } from "sonner";
import VideoUploader from "@/components/VideoUploader";
import AudioUploader from "@/components/AudioUploader";
import MediaPlayer from "@/components/MediaPlayer";
import ControlsPanel from "@/components/ControlsPanel";

const Index = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [videoId, setVideoId] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [audioOffset, setAudioOffset] = useState(0);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const audioRef = useRef(null);
  const youtubeRef = useRef(null);

  // Extract YouTube video ID from URL
  const extractVideoId = (url) => {
    const regex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : "";
  };

  const handleSyncAndPlay = () => {
    if (!youtubeUrl || !audioFile) {
      toast.info("Please provide both a YouTube URL and an audio file.");
      return;
    }

    const id = extractVideoId(youtubeUrl);
    if (!id) {
      toast.error("Please enter a valid YouTube URL.");
      return;
    }

    setVideoId(id);
    setIsMediaLoaded(true);
    toast.success("YouTube video and audio are ready to play!");
  };

  const togglePlayPause = () => {
    if (!isMediaLoaded) return;

    if (isPlaying) {
      // Pause both
      if (youtubeRef.current) {
        youtubeRef.current.pauseVideo();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else {
      // Play both with offset
      if (youtubeRef.current) {
        youtubeRef.current.playVideo();
      }
      if (audioRef.current) {
        setTimeout(() => {
          audioRef.current?.play();
        }, audioOffset * 1000);
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        togglePlayPause();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying, isMediaLoaded]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 py-8">
          <h1 className="text-4xl font-bold text-white">
            Video Audio Sync Studio
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Import a YouTube video and overlay your custom audio for language
            learning, dubbing, or content creation
          </p>
        </div>

        {/* Import Section */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <VideoUploader
                youtubeUrl={youtubeUrl}
                setYoutubeUrl={setYoutubeUrl}
              />
              <AudioUploader
                audioFile={audioFile}
                setAudioFile={setAudioFile}
              />
            </div>

            <div className="flex justify-center mt-6">
              <Button
                onClick={handleSyncAndPlay}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
                disabled={!youtubeUrl || !audioFile}
              >
                <Play className="w-5 h-5 mr-2" />
                Sync & Load Media
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Media Player Section */}
        {isMediaLoaded && (
          <MediaPlayer
            videoId={videoId}
            audioFile={audioFile}
            audioRef={audioRef}
            youtubeRef={youtubeRef}
            videoMuted={videoMuted}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />
        )}

        {/* Controls Panel */}
        {isMediaLoaded && (
          <ControlsPanel
            isPlaying={isPlaying}
            togglePlayPause={togglePlayPause}
            videoMuted={videoMuted}
            setVideoMuted={setVideoMuted}
            audioOffset={audioOffset}
            setAudioOffset={setAudioOffset}
            youtubeRef={youtubeRef}
          />
        )}

        {/* Keyboard Shortcuts Help */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardContent className="p-4">
            <div className="text-center text-gray-300">
              <p className="text-sm">
                <span className="font-semibold">Keyboard Shortcuts:</span>
                <span className="ml-2">Spacebar - Play/Pause both media</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
