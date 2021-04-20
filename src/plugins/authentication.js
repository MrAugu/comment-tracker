"use strict";

const fp = require("fastify-plugin");

async function plugin (fastify, options) { // eslint-disable-line no-unused-vars 
  fastify.decorate("authenticate", async function (request, response) { // eslint-disable-line no-unused-vars
    console.log("Prevalidation of the request.");
  });
}

module.exports = fp(plugin, {
  fastify: "3.x",
  name: "auth"
});