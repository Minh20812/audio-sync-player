import React, { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { extractArchiveFilename } from "@/utils/archive";

const ArchivePlayer = ({ archiveId, isPlaying, setIsPlaying, audioOffset }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      setTimeout(() => {
        audio.play();
      }, audioOffset * 1000);
    } else {
      audio.pause();
    }
  }, [isPlaying, audioOffset]);

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardContent className="p-6">
        <h3 className="text-white font-semibold text-lg mb-4">Archive Audio</h3>
        <audio
          ref={audioRef}
          controls
          className="w-full"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source
            src={`https://archive.org/download/${archiveId}/${archiveId}.mp3`}
            type="audio/mpeg"
          />
          Your browser does not support the audio element.
        </audio>
      </CardContent>
    </Card>
  );
};

export default ArchivePlayer;
