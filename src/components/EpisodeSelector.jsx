import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Film } from "lucide-react";

export const EpisodeSelector = ({
  movie,
  selectedEpisode,
  onSelectEpisode,
}) => {
  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Film className="h-5 w-5 text-primary" />
          {movie.title}
          <Badge variant="secondary" className="ml-auto bg-secondary/50">
            {movie.episodes.length} tập
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
          {movie.episodes.map((episode) => (
            <Button
              key={episode.id}
              variant={
                selectedEpisode.id === episode.id ? "default" : "outline"
              }
              size="sm"
              onClick={() => onSelectEpisode(episode)}
              className={`
                ${
                  selectedEpisode.id === episode.id
                    ? "bg-gradient-primary shadow-glow"
                    : "bg-secondary border-border hover:bg-secondary/80"
                }
                transition-all duration-300
              `}
            >
              {episode.isFullMovie ? "Full" : episode.number}
            </Button>
          ))}
        </div>

        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Play className="h-4 w-4" />
            Đang xem:{" "}
            {selectedEpisode.isFullMovie
              ? "Phim Full"
              : `Tập ${selectedEpisode.number}`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
