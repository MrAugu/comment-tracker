"use strict";
const fastify = require("fastify")({
  logger: false
});
const { join } = require("path");
require("dotenv").config({
  path: join(__dirname, "../.env")
});

(async function () { 
  // Package Manager Plugins
  await fastify.register(require("fastify-cookie"));

  // In-Home Plugins
  await fastify.register(require("./plugins/services"));
  await fastify.register(require("./plugins/authentication"));

  // Routes
  await fastify.register(require("./routes/session"));
  await fastify.register(require("./routes/user"));

  fastify.db.connect().then(() => {
    fastify.listen(parseInt(process.env.PORT), "127.0.0.1", (error, address) => {
      if (error) throw error;
      console.log(`Listening at ${address}.`);
    });
  });
}());