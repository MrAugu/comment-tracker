const fastify = require("fastify");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, ".env")
});
const host = fastify({
  logger: true
});
const DatabaseManager = require("./structures/DatabaseManager");
const manager = new DatabaseManager({
  useSrv: true,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  usePort: false,
  name: process.env.DATABASE_NAME,
  params: {
    retryWrites: true,
    w: "majority"
  }
});

host.get("/", async (request, response) => {
  response.type("application/json");
  response.code(200);
  return {
    "hello": ["w", "o", "r", "l", "d"],
    "using": "fastify"
  };
});

manager.connect().then(() => {
  host.listen(parseInt(process.env.PORT, 10), (error, address) => {
    if (error) throw error;
    console.log(`Host listening on ${address}.`);
  });
});