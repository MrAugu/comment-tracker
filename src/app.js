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

(async function () {
  await fastify.register(require("fastify-cookie"));
  await fastify.register(require("./plugins/authentication"));

  fastify.get("/", async (request, response) => {
    response.type("application/json");
  });

  fastify.get("/me", { preValidation: [fastify.authenticate] }, async (request, response) => { // eslint-disable-line
    return { "hello": "yellow" };
  });



  fastify.post("/login", async (request, response) => {
    
  });
  
  fastify.db.connect().then(() => {
    fastify.listen(parseInt(process.env.PORT), "127.0.0.1", (error, address) => {
      if (error) throw error;
      console.log(`Listening at ${address}.`);
    });
  });
}());