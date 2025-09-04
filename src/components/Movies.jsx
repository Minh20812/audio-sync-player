import React, { useState, useEffect } from "react";
import { AddMovieForm } from "@/components/AddMovieForm";
import { MovieList } from "@/components/MovieList";
import { PlayerVideo } from "@/components/PlayerVideo";
import { EpisodeSelector } from "@/components/EpisodeSelector";
import { Button } from "@/components/ui/button";
import { Plus, Home, Play } from "lucide-react";
import { Link } from "react-router-dom";

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Load movies from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("streaming-movies");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const moviesWithDates = parsed.map((movie) => ({
          ...movie,
          createdAt: new Date(movie.createdAt),
        }));
        setMovies(moviesWithDates);
      } catch (error) {
        console.error("Error loading movies:", error);
      }
    }
  }, []);

  // Save movies to localStorage
  useEffect(() => {
    localStorage.setItem("streaming-movies", JSON.stringify(movies));
  }, [movies]);

  const handleAddMovie = (movie) => {
    setMovies((prev) => [movie, ...prev]);
    setShowAddForm(false);
  };

  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    setSelectedEpisode(movie.episodes[0] || null);
  };

  const handleSelectEpisode = (episode) => {
    setSelectedEpisode(episode);
  };

  const handleBackToHome = () => {
    setSelectedMovie(null);
    setSelectedEpisode(null);
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Netflix-style Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background to-transparent">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-2xl font-bold text-primary">STREAMFLIX</div>
              <nav className="hidden md:flex items-center gap-6">
                <span
                  className={`text-sm transition-colors cursor-pointer ${
                    !selectedMovie && !showAddForm
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={handleBackToHome}
                >
                  Trang Chủ
                </span>
                <span
                  className={`text-sm transition-colors cursor-pointer ${
                    selectedMovie
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Thư Viện
                </span>
                <span
                  className={`text-sm transition-colors cursor-pointer ${
                    selectedMovie
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Link to="/">Youtube</Link>
                </span>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {(selectedMovie || showAddForm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToHome}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Trang Chủ
                </Button>
              )}

              {!showAddForm && !selectedMovie && (
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-4 py-2 text-sm font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm Phim
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8">
        {showAddForm && (
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              <AddMovieForm onAddMovie={handleAddMovie} />
            </div>
          </div>
        )}

        {!showAddForm && !selectedMovie && (
          <div className="container mx-auto px-6">
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          </div>
        )}

        {selectedMovie && selectedEpisode && (
          <div className="space-y-8 px-6">
            {/* Video Player Section */}
            <div className="w-full max-w-7xl mx-auto">
              <PlayerVideo
                url={selectedEpisode.url}
                title={`${selectedMovie.title} - ${
                  selectedEpisode.isFullMovie
                    ? "Full"
                    : `Tập ${selectedEpisode.number}`
                }`}
              />
            </div>

            {/* Movie Info & Episodes */}
            <div className="container mx-auto grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {selectedMovie.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span>{selectedMovie.createdAt.getFullYear()}</span>
                    <span>•</span>
                    <span>
                      {selectedMovie.episodes.length > 1
                        ? `${selectedMovie.episodes.length} tập`
                        : "Phim lẻ"}
                    </span>
                    <span>•</span>
                    <span>HD</span>
                  </div>
                  <p className="text-muted-foreground max-w-2xl">
                    {selectedMovie.episodes.length > 1
                      ? `Bộ phim ${selectedMovie.episodes.length} tập với nội dung hấp dẫn và kịch tính.`
                      : "Phim điện ảnh đầy thú vị với chất lượng HD."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <EpisodeSelector
                  movie={selectedMovie}
                  selectedEpisode={selectedEpisode}
                  onSelectEpisode={handleSelectEpisode}
                />
              </div>
            </div>
          </div>
        )}

        {movies.length === 0 && !showAddForm && !selectedMovie && (
          <div className="container mx-auto px-6">
            {/* Netflix-style hero section */}
            <div className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-r from-background via-background/90 to-transparent">
              <div className="text-center max-w-2xl">
                <div className="mx-auto w-32 h-32 bg-gradient-primary rounded-full flex items-center justify-center mb-8 shadow-glow">
                  <Play className="h-16 w-16 text-white" />
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                  Chào mừng đến với
                  <br />
                  <span className="text-primary">StreamFlix</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Nền tảng streaming cá nhân của bạn.
                  <br />
                  Thêm links phim và tận hưởng trải nghiệm xem phim đỉnh cao.
                </p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold rounded-md transition-all duration-300 hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Bắt Đầu Ngay
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Movies;
