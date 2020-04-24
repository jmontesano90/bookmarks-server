module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DB_URL: process.env.DB_URL || "postgresql://postgres@localhost/bookmarks",
  //API_TOKEN: process.env.API_TOKEN || "a9ef7761-e682-41f7-af53-0d556e939b75",
};
