import { supabase } from "@/lib/supabase";

// Save project with file upload
const saveProject = async () => {
  if (!projectName.trim() || !youtubeUrl || !audioFile) {
    toast.error("Please provide all required fields");
    return;
  }

  setIsLoading(true);
  try {
    // Upload audio file to Supabase Storage
    const fileName = `${Date.now()}_${audioFile.name}`;
    const filePath = `${user.id}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("audio-files")
      .upload(filePath, audioFile);

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("audio-files").getPublicUrl(filePath);

    // Save project data
    const { data, error } = await supabase.from("projects").insert([
      {
        name: projectName.trim(),
        youtube_url: youtubeUrl,
        video_id: currentVideoId,
        audio_filename: audioFile.name,
        audio_size: audioFile.size,
        audio_url: publicUrl,
        user_id: user.id,
      },
    ]);

    if (error) throw error;

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

// Load projects
const loadProjects = async () => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    setProjects(data || []);
  } catch (error) {
    console.error("Error loading projects:", error);
    toast.error("Failed to load projects");
  }
};

// Delete project
const deleteProject = async (project) => {
  try {
    // Delete audio file from storage
    if (project.audio_url) {
      const filePath = project.audio_url.split("/").pop();
      await supabase.storage
        .from("audio-files")
        .remove([`${project.user_id}/${filePath}`]);
    }

    // Delete project record
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);

    if (error) throw error;

    toast.success("Project deleted successfully");
    loadProjects();
  } catch (error) {
    console.error("Error deleting project:", error);
    toast.error("Failed to delete project");
  }
};
