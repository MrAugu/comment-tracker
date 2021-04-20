"use strict";

const fastify = require("fastify")({ logger: false });
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const DatabaseManager = require("./structures/DatabaseManager");
fastify.db = new DatabaseManager({
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  name: process.env.DB_NAME,
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  useSrv: process.env.DB_SRV === "TRUE",
  params: {
    retryWrites: true,
    w: "majority"
  },
  usePort: false
});
const Crypt = require("./structures/Crypt");
fastify.crypto = new Crypt({
  key: process.env.KEY
});
const httpCodes = require("./utils/httpCodes");

(async function () { 
  await fastify.register(require("fastify-cookie"));
  await fastify.register(require("./plugins/authentication"));

  fastify.get("/", async (request, response) => {
    response.type("application/json");
  });

  fastify.get("/me", { preValidation: [fastify.authenticate] }, async (request, response) => { // eslint-disable-line
    return { "hello": "yellow" };
  });

  fastify.post("/signup", async (request, response) => {
    response.type("application/json");
    if (!request.body || !request.body.username || !request.body.password) return response.code(400).send(httpCodes["400"]);
    let user = await fastify.db.collections.users.findOne({
      username: request.body.username
    });
    if (user) return response.code(400).send(httpCodes["400"]("The provided parameters are invalid."));
    user = await fastify.db.collections.users.insertOne({
      username: request.body.username,
      password: fastify.crypto.hash(request.body.password),
      displayName: request.body.username.toLowerCase(),
      color: "red",
      bio: "I am a quite mysterious person."
    });

    if (user.result && user.result.ok === 1) return response.code(201).send(httpCodes["201"]);
    else return response.code(500).send(httpCodes["500"]("Database operaton failed."));
  });

  fastify.get("/users", async (request, response) => {
    response.type("application/json");
    const users = await fastify.db.collections.users.find({}).toArray();
    response.code(200).send(JSON.stringify(users, null, 4));
  });

  fastify.db.connect().then(() => {
    fastify.listen(parseInt(process.env.PORT), "127.0.0.1", (error, address) => {
      if (error) throw error;
      console.log(`Listening at ${address}.`);
    });
  });
}());