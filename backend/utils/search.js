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


export const generateUserSearchQuery = (searchQuery) => {
   const query = {
    $or: [
      { name: { $regex: searchQuery, $options: "i" } },
      { email: { $regex: searchQuery, $options: "i" } }
    ]
  };
    if (!isNaN(searchQuery)) {
    query.$or.push({ mobileNumber: Number(searchQuery) });
  }
  return query;
}