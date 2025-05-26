import { supabase } from "@/lib/supabase";

export class ProjectService {
  /**
   * Save a new project with audio file upload
   */
  static async saveProject({ name, youtubeUrl, videoId, audioFile, userId }) {
    try {
      let audioUrl = null;
      let fileName = null;

      if (!userId) {
        throw new Error("User ID is required");
      }

      // Upload audio file to Supabase Storage if provided
      if (audioFile) {
        fileName = `${Date.now()}_${audioFile.name.replace(
          /[^a-zA-Z0-9.-]/g,
          "_"
        )}`;
        const filePath = `${userId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("audio-files")
          .upload(filePath, audioFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error(
            `Failed to upload audio file: ${uploadError.message}`
          );
        }

        // Get public URL for the uploaded file
        const {
          data: { publicUrl },
        } = supabase.storage.from("audio-files").getPublicUrl(filePath);

        audioUrl = publicUrl;
      }

      // Insert project data into database
      const projectData = {
        name: name.trim(),
        youtube_url: youtubeUrl,
        video_id: videoId,
        audio_filename: audioFile?.name || null,
        audio_size: audioFile?.size || null,
        audio_url: audioUrl,
        user_id: userId,
      };

      // const { data, error } = await supabase
      //   .from("projects")
      //   .insert([projectData])
      //   .select()
      //   .single();

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Database error:", error);
        throw new Error(`Failed to save project: ${error.message}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error("ProjectService.saveProject error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all projects for a user
   */
  static async getProjects(userId) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Database error:", error);
        throw new Error(`Failed to load projects: ${error.message}`);
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("ProjectService.getProjects error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a project and its associated audio file
   */
  static async deleteProject(projectId, userId) {
    try {
      // First, get the project to find the audio file path
      const { data: project, error: fetchError } = await supabase
        .from("projects")
        .select("audio_url, user_id")
        .eq("id", projectId)
        .eq("user_id", userId)
        .single();

      if (fetchError) {
        console.error("Fetch error:", fetchError);
        throw new Error(`Failed to find project: ${fetchError.message}`);
      }

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      // Delete audio file from storage if it exists
      if (project.audio_url) {
        try {
          // Extract file path from URL
          const urlParts = project.audio_url.split("/");
          const fileName = urlParts[urlParts.length - 1];
          const filePath = `${userId}/${fileName}`;

          const { error: deleteFileError } = await supabase.storage
            .from("audio-files")
            .remove([filePath]);

          if (deleteFileError) {
            console.warn("Failed to delete audio file:", deleteFileError);
            // Continue with project deletion even if file deletion fails
          }
        } catch (fileError) {
          console.warn("Error deleting audio file:", fileError);
          // Continue with project deletion
        }
      }

      // Delete project from database
      const { error: deleteError } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)
        .eq("user_id", userId);

      if (deleteError) {
        console.error("Delete error:", deleteError);
        throw new Error(`Failed to delete project: ${deleteError.message}`);
      }

      return { success: true };
    } catch (error) {
      console.error("ProjectService.deleteProject error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update project details
   */
  static async updateProject(projectId, updates, userId) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Update error:", error);
        throw new Error(`Failed to update project: ${error.message}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error("ProjectService.updateProject error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get audio file URL for streaming
   */
  static async getAudioFileUrl(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from("audio-files")
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        console.error("Signed URL error:", error);
        throw new Error(`Failed to get audio file URL: ${error.message}`);
      }

      return { success: true, url: data.signedUrl };
    } catch (error) {
      console.error("ProjectService.getAudioFileUrl error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Search projects by name or YouTube URL
   */
  static async searchProjects(query, userId) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .or(`name.ilike.%${query}%,youtube_url.ilike.%${query}%`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Search error:", error);
        throw new Error(`Failed to search projects: ${error.message}`);
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("ProjectService.searchProjects error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get project statistics
   */
  static async getProjectStats(userId) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("audio_size")
        .eq("user_id", userId);

      if (error) {
        console.error("Stats error:", error);
        throw new Error(`Failed to get project stats: ${error.message}`);
      }

      const totalProjects = data.length;
      const totalStorageUsed = data.reduce((sum, project) => {
        return sum + (project.audio_size || 0);
      }, 0);

      return {
        success: true,
        stats: {
          totalProjects,
          totalStorageUsed,
          averageFileSize:
            totalProjects > 0 ? totalStorageUsed / totalProjects : 0,
        },
      };
    } catch (error) {
      console.error("ProjectService.getProjectStats error:", error);
      return { success: false, error: error.message };
    }
  }
}

// Authentication helper functions
export class AuthService {
  /**
   * Get current user
   */
  static async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Auth error:", error);
        return { success: false, error: error.message };
      }

      return { success: true, user };
    } catch (error) {
      console.error("AuthService.getCurrentUser error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sign in with email and password
   */
  static async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("AuthService.signIn error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sign up with email and password
   */
  static async signUp(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Sign up error:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("AuthService.signUp error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sign out
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("AuthService.signOut error:", error);
      return { success: false, error: error.message };
    }
  }
}

// Utility functions
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const validateYouTubeUrl = (url) => {
  const regex =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  return regex.test(url);
};

export const extractVideoId = (url) => {
  const regex =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};
