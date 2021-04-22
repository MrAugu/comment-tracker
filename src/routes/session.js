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
      bio: "I am a quite mysterious person.",
      createdTimestamp: Date.now()
    });
    
    if (user.result && user.result.ok === 1) return response.code(201).send(httpCodes["200"](undefined, 201));
    else return response.code(500).send(httpCodes["500"]("Database operation failed."));
  });

  fastify.post("/login", async (request, response) => {
    response.type("application/json");

    if (request.user) {
      return  response.code(200).send(httpCodes["DATA_200"]({
        token: request.user.token
      }, "Used the authorization header."));
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
      expires: (Date.now() + (1000 * 60 * 60 * 0.5)),
      id: user._id,
      hash: user.password,
      displayName: user.displayName,
      color: user.color
    }, process.env.KEY);

    const refreshToken = jwt.sign({
      id: user._id
    }, process.env.REFRESH_KEY);

    return response.code(200).send(httpCodes["DATA_200"]({
      token,
      refreshToken
    }));
  });

  fastify.get("/logout", {
    preValidation: [fastify.authenticate]
  }, async (request, response) => {
    return response.code(204).send();
  });
};

module.exports = routes;