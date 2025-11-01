const handleNotFound = (res, resourceName) => {
  res.status(404).json({ error: `${resourceName} not found` });
};

module.exports = { handleNotFound };
