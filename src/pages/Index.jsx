import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Music } from "lucide-react";
import { toast } from "sonner";
import VideoUploader from "@/components/VideoUploader";
import AudioUploader from "@/components/AudioUploader";
import MediaPlayer from "@/components/MediaPlayer";
import ControlsPanel from "@/components/ControlsPanel";
import ProjectManager from "@/components/ProjectManager";
// import BabyElephantWalkPlayer from "@/components/SoundCloudPlayer";
import SoundCloudPlayer from "@/components/SoundCloudPlayer";

const Index = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [videoId, setVideoId] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [audioOffset, setAudioOffset] = useState(0);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [soundCloudUrl, setSoundCloudUrl] = useState("");
  const [idSoundCloud, setIdSoundCloud] = useState("");
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
    if (!videoId || !idSoundCloud) {
      toast.info(
        "Please provide both YouTube Video ID and SoundCloud Track ID"
      );
      return;
    }

    // Simple validation for video ID format
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      toast.error("Please enter a valid YouTube video ID");
      return;
    }

    setIsMediaLoaded(true);
    toast.success("YouTube video and SoundCloud track are ready to play!");
  };

  // Update togglePlayPause function
  const togglePlayPause = () => {
    if (!isMediaLoaded) return;

    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);

    // YouTube control
    if (youtubeRef.current) {
      if (newPlayingState) {
        youtubeRef.current.playVideo();
      } else {
        youtubeRef.current.pauseVideo();
      }
    }

    // SoundCloud will be controlled automatically through the useEffect in SoundCloudPlayer
  };

  // Handle loading project from ProjectManager
  const handleLoadProject = ({
    youtubeUrl: url,
    videoId: id,
    audioFileName,
  }) => {
    setYoutubeUrl(url);
    setVideoId(id);
    setIsMediaLoaded(true);
    // Note: In real implementation, you'd fetch the audio file from Supabase Storage
    toast.info(`Project loaded! Audio file: ${audioFileName}`);
    toast.info(
      "Note: Audio file needs to be re-uploaded (not stored in this demo)"
    );
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
              <VideoUploader videoId={videoId} setVideoId={setVideoId} />
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Music className="w-5 h-5 text-purple-400" />
                  <Label className="text-white font-medium">
                    SoundCloud Track ID
                  </Label>
                </div>
                <Input
                  id="idSoundCloud"
                  type="text"
                  placeholder="Enter SoundCloud track ID"
                  value={idSoundCloud}
                  onChange={(e) => setIdSoundCloud(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Button
                onClick={handleSyncAndPlay}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full"
                disabled={!videoId || !idSoundCloud}
              >
                <Play className="w-5 h-5 mr-2" />
                Sync & Load Media
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Media Players */}
        {isMediaLoaded && (
          <>
            <MediaPlayer
              videoId={videoId}
              youtubeRef={youtubeRef}
              videoMuted={videoMuted}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
            />
            <SoundCloudPlayer
              idSoundCloud={idSoundCloud}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              audioOffset={audioOffset}
            />
          </>
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

        {/* Project Manager Section */}
        <ProjectManager
          videoId={videoId}
          audioFile={audioFile}
          onLoadProject={handleLoadProject}
          currentVideoId={videoId}
        />

        {/* <BabyElephantWalkPlayer idSoundCloud={idSoundCloud} /> */}
      </div>
    </div>
  );
};

export default Index;
