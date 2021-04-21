"use strict";
const httpCodes = require("../utils/httpCodes");
const jwt = require("jsonwebtoken");

const routes = async (fastify) => {
  fastify.post("/signup", async (request, response) => {
    response.type("application/json");
    if (!request.body || !request.body.username || !request.body.password) return response.code(400).send(httpCodes["400"]());
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
    
    if (user.result && user.result.ok === 1) return response.code(201).send(httpCodes["200"](undefined, 201));
    else return response.code(500).send(httpCodes["500"]("Database operation failed."));
  });

  fastify.post("/login", async (request, response) => {
    response.type("application/json");

    if (request.cookies.token && !request.query.ignoreCookie) {
      try {
        const parsedToken = jwt.verify(request.cookies.token, process.env.KEY);
        if (parsedToken.username && parsedToken.expires > Date.now()) return  response.code(200).send(httpCodes["DATA_200"]({
          token: request.cookies.token
        }, "Used token cookie."));
      } catch (error) {
        // eslint-disable-line no-empty
      }
    }

    if (!request.body || !request.body.username || !request.body.password) return response.code(400).send(httpCodes["400"]());
    const user = await fastify.db.collections.users.findOne({
      username: request.body.username
    });
    if (!user) return response.code(400).send(httpCodes["400"]("The provided parameters are invalid."));

    const newPasswordHash = fastify.crypto.hash(request.body.password);
    if (newPasswordHash !== user.password) return response.code(400).send(httpCodes["400"]("The provided parameters are invalid."));

    const token = jwt.sign({
      username: user.username,
      expires: (Date.now() + (1000 * 60 * 60 * 24 * 2)),
      id: user._id,
      hash: user.password,
      displayName: user.displayName,
      color: user.color
    }, process.env.KEY);

    response.setCookie("token", token);

    return response.code(200).send(httpCodes["DATA_200"]({
      token
    }));
  });

  fastify.get("/logout", {
    preValidation: [fastify.authenticate]
  }, async (request, response) => {
    response.clearCookie("token");

    return response.code(204).send();
  });
};

module.exports = routes;