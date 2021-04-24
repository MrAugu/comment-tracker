"use strict";
const AutoLoad = require("fastify-autoload");
const fastify = require("fastify")({
  logger: false
});
const { join } = require("path");
require("dotenv").config({
  path: join(__dirname, "../.env")
});

(async function () {
  fastify.addHook("onSend", async (request, response) => {
    response.header("Access-Control-Allow-Origin", process.env.ALLOW_ORIGIN);
    response.header("Access-Control-Allow-Credentials", true);
  });

  await fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
    options: {}
  });

  await fastify.register(AutoLoad, {
    dir: join(__dirname, "routes"),
    options: {}
  });

  fastify.db.connect().then(() => {
    fastify.listen(parseInt(process.env.PORT), "0.0.0.0", (error, address) => {
      if (error) throw error;
      console.log(`Listening at ${address}.`);
    });
  });
}());