export const extractArchiveFilename = (archiveId) => {
  if (!archiveId) return null;
  const parts = archiveId.split("_");
  return parts[0] || null;
};
