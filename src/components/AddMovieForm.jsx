import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Film } from "lucide-react";
import { toast } from "sonner";

export const AddMovieForm = ({ onAddMovie }) => {
  const [title, setTitle] = useState("");
  const [linksText, setLinksText] = useState("");

  const parseLinks = (text) => {
    const lines = text
      .trim()
      .split("\n")
      .filter((line) => line.trim());
    const parsed = [];

    for (const line of lines) {
      const parts = line.split("|");
      if (parts.length === 2) {
        const episodePart = parts[0].trim();
        const url = parts[1].trim();

        if (episodePart.toLowerCase() === "full") {
          parsed.push({
            episodeNumber: "Full",
            url,
            isFullMovie: true,
          });
        } else {
          const episodeNumber = parseInt(episodePart);
          if (!isNaN(episodeNumber)) {
            parsed.push({
              episodeNumber,
              url,
              isFullMovie: false,
            });
          }
        }
      }
    }

    return parsed;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Vui lòng nhập tên phim");
      return;
    }

    if (!linksText.trim()) {
      toast.error("Vui lòng nhập links phim");
      return;
    }

    const parsedLinks = parseLinks(linksText);

    if (parsedLinks.length === 0) {
      toast.error("Không tìm thấy links hợp lệ");
      return;
    }

    const episodes = parsedLinks.map((link, index) => ({
      id: `${Date.now()}-${index}`,
      number: typeof link.episodeNumber === "number" ? link.episodeNumber : 1,
      url: link.url,
      isFullMovie: link.isFullMovie,
    }));

    const newMovie = {
      id: Date.now().toString(),
      title: title.trim(),
      episodes,
      currentEpisode: 1,
      createdAt: new Date(),
    };

    onAddMovie(newMovie);

    // Reset form
    setTitle("");
    setLinksText("");

    toast.success(`Đã thêm phim "${title}" với ${episodes.length} tập`);
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Thêm Phim Mới
        </h2>
        <p className="text-muted-foreground">
          Thêm phim yêu thích vào thư viện của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label
            htmlFor="title"
            className="text-foreground font-medium text-base"
          >
            Tên Phim
          </Label>
          <Input
            id="title"
            type="text"
            placeholder="Nhập tên phim..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-input border-border focus:ring-primary h-12 text-base"
          />
        </div>

        <div className="space-y-3">
          <Label
            htmlFor="links"
            className="text-foreground font-medium text-base"
          >
            Links Phim
          </Label>
          <Textarea
            id="links"
            placeholder={`Nhập links theo định dạng:\n\n1|https://vip.opstream10.com/share/...\n2|https://vip.opstream10.com/share/...\n3|https://vip.opstream10.com/share/...\n\nhoặc:\n\nFull|https://vip.opstream90.com/share/...`}
            value={linksText}
            onChange={(e) => setLinksText(e.target.value)}
            rows={10}
            className="bg-input border-border focus:ring-primary font-mono text-sm resize-none"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold rounded-md transition-all duration-300"
        >
          <Plus className="h-5 w-5 mr-2" />
          Thêm Vào Thư Viện
        </Button>
      </form>
    </div>
  );
};
