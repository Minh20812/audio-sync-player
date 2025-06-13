export const extractArchiveFilename = (archiveId) => {
  if (!archiveId) return null;
  const parts = archiveId.split("_");
  return parts[0] || null;
};

export const formatArchiveId = (archiveId) => {
  if (!archiveId) return null;

  if (archiveId.startsWith("_")) {
    return `a${archiveId}`;
  }

  if (archiveId.startsWith("-")) {
    const match = archiveId.match(/^-(.{10})/);
    if (match) {
      return `a__${match[1]}`;
    }
  }

  return archiveId;
};

export const formatArchiveFilename = (archiveFilename) => {
  if (!archiveFilename) return null;

  if (archiveFilename.startsWith("-")) {
    const match = archiveFilename.match(/^-(.{10})/);
    if (match) {
      return `__${match[1]}.mp3`;
    }
  } else {
    return `${archiveFilename}.mp3`;
  }

  return archiveFilename;
};
