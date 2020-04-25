const express = require("express");
const uuid = require("uuid/v4");
const bookMarkRouter = express.Router();
const bodyParser = express.json();
const { bookmarks } = require("../store");
const logger = require("../logger");
const BookmarksService = require("../bookmarks-service");
const jsonParser = express.json();
const path = require("path");

const serializeBookmark = (bookmark) => ({
  id: bookmark.id,
  title: bookmark.title,
  url: bookmark.url,
  description: bookmark.description,
  rating: Number(bookmark.rating),
});

bookMarkRouter
  .route("/api/bookmarks")
  .get((req, res, next) => {
    BookmarksService.getAllBookMarks(req.app.get("db"))
      .then((bookmarks) => {
        res.json(bookmarks.map(serializeBookmark));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, url, description, rating } = req.body;
    const newBookMark = { title, url, description, rating };

    for (const [key, value] of Object.entries(newBookMark)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    BookmarksService.insertBookmark(req.app.get("db"), newBookMark)
      .then((bookmark) => {
        res
          .status(201)
          .location(path.posix.join(`/api/bookmarks/${bookmark.id}`))
          .json(serializeBookmark(bookmark));
      })
      .catch(next);
  });

bookMarkRouter
  .route("/api/bookmarks/:bookmark_id")
  .all((req, res, next) => {
    const { bookmark_id } = req.params;
    BookmarksService.getById(req.app.get("db"), bookmark_id)
      .then((bookmark) => {
        if (!bookmark) {
          logger.error(`Bookmark with id ${bookmark_id} not found.`);
          return res.status(404).json({
            error: { message: `Bookmark Not Found` },
          });
        }
        res.json(serializeBookmark(bookmark));
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    const { bookmark_id } = req.params;
    BookmarksService.deleteBookmark(req.app.get("db"), bookmark_id)
      .then((numRowsAffected) => {
        logger.info(`Bookmark with id ${bookmark_id} deleted.`);
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, description, url, rating } = req.body;
    const bookmarkToUpdate = { title, description, url, rating };
    BookmarksService.updateBookmark(
      req.app.get("db"),
      req.params.bookmark_id,
      bookmarkToUpdate
    )
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = bookMarkRouter;
