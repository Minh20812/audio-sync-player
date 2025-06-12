export const extractArchiveFilename = (archiveId) => {
  if (!archiveId) return null;
  const parts = archiveId.split("_");
  return parts[0] || null;
};

export const formatArchiveId = (archiveId) => {
  if (!archiveId) return null;

  // Nếu archiveId bắt đầu bằng "_", thêm "a" vào đầu
  if (archiveId.startsWith("_")) {
    return `a${archiveId}`;
  }

  return archiveId;
};
