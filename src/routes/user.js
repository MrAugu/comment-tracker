"use strict";
const httpCodes = require("../utils/httpCodes");

const routes = async (fastify) => {
  fastify.get("/users", async (request, response) => {
    response.type("application/json");
    const users = await fastify.db.collections.users.find({}).toArray();
    response.code(200).send(httpCodes["DATA_200"](users));
  });

  
  fastify.get("/me", {
    preValidation: [fastify.authenticate]
  }, async (request, response) => {
    response.type("application/json");
    const user = await fastify.db.collections.users.findOne({
      username: request.user.username
    });
    if (!user) return response.code(500).send(httpCodes["500"]());

    return response.code(200).send(httpCodes["DATA_200"](user));
  });
};

module.exports = routes;