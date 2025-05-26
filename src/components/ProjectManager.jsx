import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Save, FolderOpen, Trash2, Play, Calendar, Music } from "lucide-react";
import { ProjectService } from "@/services/supabaseService";
import { useAuth } from "@/contexts/AuthContext";
import Auth from "@/components/SignIn";

// Mock Supabase client - Replace with actual Supabase configuration
const mockSupabase = {
  from: (table) => ({
    select: () => ({
      data: JSON.parse(localStorage.getItem("projects") || "[]"),
      error: null,
    }),
    insert: (data) => {
      const projects = JSON.parse(localStorage.getItem("projects") || "[]");
      const newProject = {
        ...data,
        id: Date.now(),
        created_at: new Date().toISOString(),
      };
      projects.push(newProject);
      localStorage.setItem("projects", JSON.stringify(projects));
      return { data: [newProject], error: null };
    },
    delete: () => ({
      eq: (column, value) => {
        const projects = JSON.parse(localStorage.getItem("projects") || "[]");
        const filtered = projects.filter((p) => p.id !== value);
        localStorage.setItem("projects", JSON.stringify(filtered));
        return { data: [], error: null };
      },
    }),
  }),
};

const ProjectManager = ({
  videoId,
  audioFile,
  onLoadProject,
  currentVideoId,
}) => {
  const [projects, setProjects] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load projects from Supabase
  const loadProjects = async () => {
    try {
      if (!user?.id) {
        setProjects([]);
        return;
      }

      const { success, data, error } = await ProjectService.getProjects(
        user.id
      );
      if (!success) throw new Error(error);
      setProjects(data || []);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadProjects();
    }
  }, [user?.id]);

  // Save current project
  const saveProject = async () => {
    if (!user?.id) {
      toast.error("Please sign in to save projects");
      return;
    }

    if (!projectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    if (!videoId || !audioFile) {
      toast.error("Please provide both YouTube URL and audio file");
      return;
    }

    setIsLoading(true);
    try {
      const { success, data, error } = await ProjectService.saveProject({
        name: projectName.trim(),
        videoId: videoId,
        audioFile: audioFile,
        userId: user.id,
      });

      if (!success) throw new Error(error);

      toast.success("Project saved successfully!");
      setProjectName("");
      setIsDialogOpen(false);
      loadProjects();
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project");
    } finally {
      setIsLoading(false);
    }
  };

  // Update the deleteProject function
  const deleteProject = async (projectId) => {
    if (!user?.id) return;
    try {
      const { success, error } = await ProjectService.deleteProject(
        projectId,
        user.id
      );
      if (!success) throw new Error(error);

      toast.success("Project deleted successfully");
      loadProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  // Load project
  const loadProject = (project) => {
    onLoadProject({
      videoId: project.youtube_url,
      videoId: project.video_id,
      audioFileName: project.audio_filename,
    });
    toast.success(`Loaded project: ${project.name}`);
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Project Manager
          </div>
          {user ? (
            <div className="text-sm text-gray-400">{user.email}</div>
          ) : (
            <Auth />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Save Current Project */}
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={!videoId || !audioFile}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Current Project
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-600">
              <DialogHeader>
                <DialogTitle className="text-white">Save Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-name" className="text-gray-200">
                    Project Name
                  </Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name..."
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="text-sm text-gray-400">
                  <p>YouTube: {videoId}</p>
                  <p>Audio: {audioFile?.name}</p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-gray-600 text-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveProject}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? "Saving..." : "Save Project"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Projects List */}
        <div className="space-y-3">
          <h3 className="text-white font-medium">
            Saved Projects ({projects.length})
          </h3>

          {projects.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No saved projects yet</p>
              <p className="text-sm">
                Save your current project to see it here
              </p>
            </div>
          ) : (
            <div className="grid gap-3 max-h-64 overflow-y-auto">
              {projects.map((project) => (
                <Card key={project.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate">
                          {project.name}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(project.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Music className="w-3 h-3" />
                            {project.audio_filename}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {project.youtube_url}
                        </p>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => loadProject(project)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteProject(project.id)}
                          className="border-red-500 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-blue-200 text-sm">
            <strong>Note:</strong> This demo uses localStorage. In production,
            integrate with Supabase:
          </p>
          <ul className="text-blue-200 text-xs mt-2 space-y-1 ml-4">
            <li>• Create 'projects' table in Supabase</li>
            <li>• Upload audio files to Supabase Storage</li>
            <li>• Replace ProjectService with actual Supabase client</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectManager;
