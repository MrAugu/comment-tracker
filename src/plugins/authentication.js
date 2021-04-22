"use strict";
const fp = require("fastify-plugin");
const httpCodes = require("../utils/httpCodes");
const jwt = require("jsonwebtoken");

async function plugin (fastify, options) { // eslint-disable-line no-unused-vars 
  fastify.decorate("authenticate", async function (request, response) { // eslint-disable-line no-unused-vars
    if (!request.headers.authorization) return response.code(401).send(httpCodes["401"]());
    const [bearer, token] = request.headers.authorization.split(" ");
    if (!bearer || !token || bearer !== "Bearer") return response.code(401).send(httpCodes["401"]());
    try {
      const verifiedToken = jwt.verify(token, process.env.KEY);
      if (verifiedToken.expires <= Date.now()) response.code(401).send(httpCodes["401"]("Token has expired."));
      request.user = verifiedToken;
      request.user.token = token;
    } catch (e) {
      return response.code(401).send(httpCodes["401"]());
    }
  });
}

module.exports = fp(plugin, {
  fastify: "3.x",
  name: "auth"
});