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
  fastify.addHook("onSend", (request, response, done) => {
    response.header("Access-Control-Allow-Origin", process.env.ALLOW_ORIGIN);
    response.header("Access-Control-Allow-Credentials", true);
    done();
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
    fastify.listen(parseInt(process.env.PORT), "127.0.0.1", (error, address) => {
      if (error) throw error;
      console.log(`Listening at ${address}.`);
    });
  });
}());