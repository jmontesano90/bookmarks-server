const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const { makeBookMarksArray } = require("./bookmarks.fixtures");

describe.only("Bookmarks Endpoints", function () {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean the table", () => db("bookmarks").truncate());

  afterEach("cleanup", () => db("bookmarks").truncate());

  describe(`GET /bookmarks`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app).get("/bookmarks").expect(200, []);
      });
    });
    context("Given there are bookmarks in the database", () => {
      const testBookMarks = makeBookMarksArray();

      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testBookMarks);
      });

      it("responds with 200 and all of the articles", () => {
        return supertest(app).get("/bookmarks").expect(200, testBookMarks);
      });
    });
  });

  describe(`GET /bookmarks/:id`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => {
        const bookmarkId = 123456;
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .expect(404, { error: { message: `Bookmark doesn't exist` } });
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
          .get(`/articles/${bookmarkId}`)
          .expect(200, expectedBookmark);
      });
    });
  });
});
