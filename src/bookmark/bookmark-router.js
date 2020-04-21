const express = require("express");
const uuid = require("uuid/v4");
const bookMarkRouter = express.Router();
const bodyParser = express.json();
const { bookmarks } = require("../store");
const logger = require("../logger");
const BookmMarksService = require("../bookmarks-service");

const serializeBookmark = (bookmark) => ({
  id: bookmark.id,
  title: bookmark.title,
  url: bookmark.url,
  description: bookmark.description,
  rating: Number(bookmark.rating),
});

bookMarkRouter
  .route("/bookmarks")
  .get((req, res, next) => {
    BookmMarksService.getAllBookMarks(req.app.get("db"))
      .then((bookmarks) => {
        res.json(bookmarks.map(serializeBookmark));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res) => {
    const { title, url, description, rating } = req.body;
    if (!title) {
      logger.error(`Title is required`);
      return res.status(400).send("Invalid data");
    }
    if (!url) {
      logger.error(`Url is required`);
      return res.status(400).send("Invalid data");
    }
    if (!description) {
      logger.error(`Description is required`);
      return res.status(400).send("Invalid data");
    }
    if (!rating) {
      logger.error(`Rating is required`);
      return res.status(400).send("Invalid data");
    }

    const id = uuid();

    const bookmark = {
      title,
      url,
      description,
      rating,
      id,
    };

    bookmarks.push(bookmark);

    logger.info(`Bookmark with ${id} created`);

    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${id}`)
      .json(bookmark);
  });

bookMarkRouter
  .route("/bookmarks/:id")
  .get((req, res, next) => {
    const { bookmark_id } = req.params;
    BookmMarksService.getById(req.app.get("db"), bookmark_id)
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
  .delete((req, res) => {
    const { id } = req.params;
    const bookmarkIndex = bookmarks.findIndex((book) => book.id == id);

    if (bookmarkIndex === -1) {
      logger.error(`List with id ${id} not found`);
      return res.status(404).send("Not Found");
    }

    bookmarks.splice(bookmarkIndex, 1);
    logger.info(`List with id ${id} deleted`);
    res.status(204).end();
  });

module.exports = bookMarkRouter;
