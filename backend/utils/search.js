//For searching in Task model
export const generateSearchQuery = (searchQuery) => {
  return {
    $or: [
      { title: { $regex: searchQuery, $options: "i" } },
      { category: { $regex: searchQuery, $options: "i" } },
      { description: { $regex: searchQuery, $options: "i" } },
      { status: { $regex: searchQuery, $options: "i" } },
    ],
  };
};

// For searching in Group model
export const generateGroupSearchQuery = (searchQuery) => {
  return {
    $or: [
      { name: { $regex: searchQuery, $options: "i" } },
      { description: { $regex: searchQuery, $options: "i" } },
    ],
  };
};
