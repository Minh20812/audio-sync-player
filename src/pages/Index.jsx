import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Music } from "lucide-react";
import { toast } from "sonner";
import VideoUploader from "@/components/VideoUploader";
import MediaPlayer from "@/components/MediaPlayer";
import ControlsPanel from "@/components/ControlsPanel";
import SoundCloudPlayer from "@/components/SoundCloudPlayer";
import ArchivePlayer from "@/components/ArchivePlayer";
import Examples from "@/components/Examples";
import { extractSoundCloudTrackId } from "@/utils/soundcloud";

const Index = () => {
  const [videoId, setVideoId] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [audioOffset, setAudioOffset] = useState(0);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [idSoundCloud, setIdSoundCloud] = useState("");
  const [audioSource, setAudioSource] = useState("soundcloud");
  const youtubeRef = useRef(null);

  const handleSyncAndPlay = () => {
    if (!videoId) {
      toast.info("Please provide a YouTube Video ID");
      return;
    }

    if (audioSource === "soundcloud" && !idSoundCloud) {
      toast.info("Please provide a SoundCloud Track ID");
      return;
    }

    setIsMediaLoaded(true);
    toast.success(
      `YouTube video and ${
        audioSource === "soundcloud" ? "SoundCloud" : "Archive"
      } audio are ready to play!`
    );
  };

  const handleSelectExample = (exampleId) => {
    setVideoId(exampleId);
    setAudioSource("archive"); // Since examples use Archive.org
    toast.success("Example loaded! Click 'Sync & Load Media' to start");
  };

  const togglePlayPause = () => {
    if (!isMediaLoaded) return;

    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);

    if (youtubeRef.current) {
      if (newPlayingState) {
        youtubeRef.current.playVideo();
      } else {
        youtubeRef.current.pauseVideo();
      }
    }
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Music className="w-5 h-5 text-purple-400" />
                    <Label className="text-white font-medium">
                      Audio Source
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={
                        audioSource === "soundcloud" ? "default" : "outline"
                      }
                      onClick={() => setAudioSource("soundcloud")}
                      className={
                        audioSource === "soundcloud"
                          ? "bg-purple-600"
                          : "border-white/20 text-white"
                      }
                    >
                      SoundCloud
                    </Button>
                    <Button
                      variant={
                        audioSource === "archive" ? "default" : "outline"
                      }
                      onClick={() => setAudioSource("archive")}
                      className={
                        audioSource === "archive"
                          ? "bg-purple-600"
                          : "border-white/20 text-white"
                      }
                    >
                      Archive.org
                    </Button>
                  </div>
                </div>

                {audioSource === "soundcloud" ? (
                  <Input
                    id="idSoundCloud"
                    type="text"
                    placeholder="Enter SoundCloud track ID"
                    value={idSoundCloud || ""}
                    onChange={(e) => setIdSoundCloud(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400"
                  />
                ) : (
                  <div className="text-sm text-gray-400">
                    Using YouTube video ID for Archive.org audio
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Button
                onClick={handleSyncAndPlay}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full"
                disabled={
                  !videoId || (audioSource === "soundcloud" && !idSoundCloud)
                }
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
            {audioSource === "soundcloud" ? (
              <SoundCloudPlayer
                idSoundCloud={idSoundCloud}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                audioOffset={audioOffset}
              />
            ) : (
              <ArchivePlayer
                archiveId={videoId}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                audioOffset={audioOffset}
              />
            )}
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

        {/* Add Examples section before the main input card */}
        <Examples onSelectExample={handleSelectExample} />
      </div>
    </div>
  );
};

export default Index;
