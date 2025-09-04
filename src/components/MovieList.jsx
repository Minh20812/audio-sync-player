import React from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export const MovieList = ({ movies, onSelectMovie, selectedMovieId }) => {
  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Play className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Chưa có phim nào
        </h3>
        <p className="text-muted-foreground">
          Thêm phim đầu tiên của bạn để bắt đầu xem
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Thư Viện Phim</h2>
        <div className="text-sm text-muted-foreground">
          {movies.length} phim
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="group relative cursor-pointer transition-all duration-300 hover:scale-105"
            onClick={() => onSelectMovie(movie)}
          >
            {/* Netflix-style movie card */}
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gradient-card border border-border shadow-card group-hover:shadow-hover transition-all duration-300">
              {/* Movie poster placeholder */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="h-12 w-12 text-white/60" />
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-white/90 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                  <Play className="h-6 w-6 text-black" />
                </div>
              </div>

              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <span>{movie.episodes.length} tập</span>
                  <span>•</span>
                  <span>{movie.createdAt.getFullYear()}</span>
                </div>
              </div>

              {/* Episode count badge */}
              <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-white">
                {movie.episodes.length > 1
                  ? `${movie.episodes.length} tập`
                  : "Full"}
              </div>
            </div>

            {/* Netflix-style info panel (appears on hover) */}
            <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-b-lg p-4 opacity-0 group-hover:opacity-100 translate-y-0 group-hover:translate-y-0 transition-all duration-300 z-10 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <Button
                  size="sm"
                  className="bg-white text-black hover:bg-white/90 rounded-full px-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectMovie(movie);
                  }}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Phát
                </Button>
                <div className="flex-1"></div>
                <span className="text-xs text-muted-foreground">
                  {movie.createdAt.toLocaleDateString("vi-VN")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {movie.episodes.length > 1
                  ? `Bộ phim ${movie.episodes.length} tập đầy hấp dẫn`
                  : "Phim điện ảnh đầy thú vị"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
