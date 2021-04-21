"use strict";
const fp = require("fastify-plugin");

async function plugin (fastify, options) { // eslint-disable-line no-unused-vars
  fastify.register(require("fastify-cookie"));
}

module.exports = fp(plugin, {
  fastify: "3.x",
  name: "cookies"
});