const app = require("../src/app");
const API_TOKEN = process.env.API_TOKEN;

describe("App", () => {
  it('GET / responds with 200 containing "Hello, world!"', () => {
    return supertest(app)
      .get("/")
      .set("Authorization", `Bearer ${API_TOKEN}`)
      .expect(200, "Hello, world!");
  });
});
