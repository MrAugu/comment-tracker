"use strict";
const fp = require("fastify-plugin");
const httpCodes = require("../utils/httpCodes");
const jwt = require("jsonwebtoken");

async function plugin (fastify, options) { // eslint-disable-line no-unused-vars 
  fastify.decorate("authenticate", async function (request, response) { // eslint-disable-line no-unused-vars
    if (!request.cookies.token) return response.code(401).send(httpCodes["401"]());
    try {
      const parsedToken = jwt.verify(request.cookies.token, process.env.KEY);
      if (parsedToken.expires <= Date.now()) response.code(401).send(httpCodes["401"]("Token has expired."));
      request.user = parsedToken;
    } catch (e) {
      return response.code(401).send(httpCodes["401"]());
    }
  });
}

module.exports = fp(plugin, {
  fastify: "3.x",
  name: "auth"
});