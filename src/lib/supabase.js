// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database table names (for consistency)
export const TABLES = {
  PROJECTS: "projects",
  PROFILES: "profiles",
};

// Storage bucket names
export const BUCKETS = {
  AUDIO_FILES: "audio-files",
  THUMBNAILS: "thumbnails",
};

// Supported file types
export const SUPPORTED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/aac",
  "audio/webm",
];

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  AUDIO_FILE: 50 * 1024 * 1024, // 50MB
  THUMBNAIL: 5 * 1024 * 1024, // 5MB
};

// Error messages
export const ERROR_MESSAGES = {
  INVALID_YOUTUBE_URL: "Please enter a valid YouTube URL",
  FILE_TOO_LARGE: "File size exceeds the maximum limit",
  UNSUPPORTED_FILE_TYPE: "Unsupported file type",
  NETWORK_ERROR: "Network error. Please check your connection",
  UNAUTHORIZED: "You are not authorized to perform this action",
  PROJECT_NOT_FOUND: "Project not found",
  STORAGE_QUOTA_EXCEEDED: "Storage quota exceeded",
};

// Success messages
export const SUCCESS_MESSAGES = {
  PROJECT_SAVED: "Project saved successfully!",
  PROJECT_DELETED: "Project deleted successfully",
  PROJECT_UPDATED: "Project updated successfully",
  FILE_UPLOADED: "File uploaded successfully",
};

// Validation functions
export const validateFile = (file, maxSize = FILE_SIZE_LIMITS.AUDIO_FILE) => {
  const errors = [];

  if (!file) {
    errors.push("No file selected");
    return { isValid: false, errors };
  }

  if (file.size > maxSize) {
    errors.push(
      `File size (${formatFileSize(
        file.size
      )}) exceeds maximum limit (${formatFileSize(maxSize)})`
    );
  }

  if (
    !SUPPORTED_AUDIO_TYPES.includes(file.type) &&
    !file.name.match(/\.(mp3|wav|ogg|aac|webm)$/i)
  ) {
    errors.push(
      "Unsupported file type. Please use MP3, WAV, OGG, AAC, or WebM files"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const validateYouTubeUrl = (url) => {
  const patterns = [
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /^https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];

  return patterns.some((pattern) => pattern.test(url));
};

export const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
};

// Real-time subscription helpers
export const subscribeToProjects = (userId, callback) => {
  return supabase
    .channel("projects")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: TABLES.PROJECTS,
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

// Storage helpers
export const getAudioFilePublicUrl = (filePath) => {
  return supabase.storage.from(BUCKETS.AUDIO_FILES).getPublicUrl(filePath);
};

export const generateSignedUrl = async (filePath, expiresIn = 3600) => {
  return await supabase.storage
    .from(BUCKETS.AUDIO_FILES)
    .createSignedUrl(filePath, expiresIn);
};

// Authentication helpers
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
};

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};

// Database helpers
export const upsertUserProfile = async (userId, profileData) => {
  return await supabase.from(TABLES.PROFILES).upsert({
    id: userId,
    ...profileData,
    updated_at: new Date().toISOString(),
  });
};

export default supabase;
