"use strict";
const DatabaseManager = require("../structures/DatabaseManager");
const Crypt = require("../structures/Crypt");
const fp = require("fastify-plugin");

async function plugin (fastify) {
  fastify.decorate("db", new DatabaseManager({
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
  }));

  fastify.decorate("crypto", new Crypt({
    key: process.env.KEY
  }));
}

module.exports = fp(plugin, {
  fastify: "3.x",
  name: "services"
});