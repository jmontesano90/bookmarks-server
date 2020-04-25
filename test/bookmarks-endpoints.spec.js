const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const { makeBookMarksArray } = require("./bookmarks.fixtures");

const API_TOKEN = process.env.API_TOKEN;

describe("Bookmarks Endpoints", function () {
  let db;

  db = knex({
    client: "pg",
    connection: process.env.TEST_DB_URL,
  });
  app.set("db", db);

  after("disconnect from db", () => db.destroy());

  before("clean the table", () => db("bookmarks").truncate());

  afterEach("cleanup", () => db("bookmarks").truncate());

  describe(`GET /api/bookmarks`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/bookmarks")
          .set("Authorization", `Bearer ${API_TOKEN}`)
          .expect(200, []);
      });
    });
    context("Given there are bookmarks in the database", () => {
      const testBookMarks = makeBookMarksArray();

      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testBookMarks);
      });

      it("responds with 200 and all of the articles", () => {
        return supertest(app)
          .get("/api/bookmarks")
          .set("Authorization", `Bearer ${API_TOKEN}`)
          .expect(200, testBookMarks);
      });
    });
  });

  describe(`GET /api/bookmarks/:id`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => {
        const bookmarkId = 123456;
        return supertest(app)
          .get(`/api/bookmarks/${bookmarkId}`)
          .set("Authorization", `Bearer ${API_TOKEN}`)
          .expect(404, { error: { message: `Bookmark Not Found` } });
      });
    });
    context("Given there are bookmarks in the database", () => {
      const testBookMarks = makeBookMarksArray();

      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testBookMarks);
      });

      it("responds with 200 and the specified bookmark", () => {
        const bookmarkId = 2;
        const expectedBookmark = testBookMarks[bookmarkId - 1];
        return supertest(app)
          .get(`/api/bookmarks/${bookmarkId}`)
          .set("Authorization", `Bearer ${API_TOKEN}`)
          .expect(200, expectedBookmark);
      });
    });
  });

  describe(`POST /api/bookmarks`, () => {
    it(`creates a bookmark, responding with 201 and the new article`, function () {
      const newBookMark = {
        title: "New test Bookmark",
        url: "test.com",
        description: "Test new bookmark content",
        rating: 1,
      };
      return supertest(app)
        .post("/api/bookmarks")
        .set("Authorization", `Bearer ${API_TOKEN}`)
        .send(newBookMark)
        .expect(201)
        .expect((res) => {
          expect(res.body.title).to.eql(newBookMark.title);
          expect(res.body.url).to.eql(newBookMark.url);
          expect(res.body.description).to.eql(newBookMark.description);
          expect(res.body.rating).to.eql(newBookMark.rating);
        })
        .then((postRes) =>
          supertest(app)
            .get(`/api/bookmarks/${postRes.body.id}`)
            .set("Authorization", `Bearer ${API_TOKEN}`)
            .expect(postRes.body)
        );
    });

    const requiredFields = ["title", "url", "description", "rating"];
    requiredFields.forEach((field) => {
      const newBookMark = {
        title: "New test Bookmark",
        url: "test.com",
        description: "Test new bookmark content",
        rating: 1,
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newBookMark[field];

        return supertest(app)
          .post("/api/bookmarks")
          .set("Authorization", `Bearer ${API_TOKEN}`)
          .send(newBookMark)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` },
          });
      });
    });
  });

  describe(`DELETE /api/bookmarks/:id`, () => {
    context("Given there are bookmarks in the database", () => {
      const testBookMarks = makeBookMarksArray();

      beforeEach("insert bookmarks", () => {
        const idToRemove = 2;
        const expectedBookMarks = testBookMarks.filter(
          (bookmark) => bookmark.id !== idToRemove
        );

        return supertest(app)
          .delete(`/api/bookmarks/${idToRemove}`)
          .expect(204)
          .then((res) =>
            supertest(app).get(`/api/bookmarks`).expect(expectedBookMarks)
          );
      });
    });
  });

  describe.only(`PATCH /api/bookmarks/id`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => {
        const bookmarkId = 123456;
        return supertest(app)
          .patch(`/api/bookmarks/${bookmarkId}`)
          .set("Authorization", `Bearer ${API_TOKEN}`)
          .expect(404, { error: { message: `Bookmark Not Found` } });
      });
    });

    context("Given there are bookmarks in the database", () => {
      const testBookmarks = makeBookMarksArray();

      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testBookmarks);
      });

      it("responds with 204 and updates the bookmark", () => {
        const idToUpdate = 2;
        const updateBookmark = {
          title: "updated bookmark title",
          url: "updatedbookmark.com",
          description: "updated bookmark content",
          rating: "4",
        };
        const expectedBookmark = {
          ...testBookmarks[idToUpdate - 1],
          ...updateBookmark,
        };
        return supertest(app)
          .patch(`/api/bookmarks/${idToUpdate}`)
          .set("Authorization", `Bearer ${API_TOKEN}`)
          .send(updateBookmark)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/bookmarks/${idToUpdate}`)
              .set("Authorization", `Bearer ${API_TOKEN}`)
              .expect(expectedBookmark)
          );
      });
    });
  });
});
