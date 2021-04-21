"use strict";
const httpCodes = require("../utils/httpCodes");

const routes = async (fastify) => {
  fastify.get("/comments", async (request, response) => {
    let comments = await fastify.db.collections.comments.find({}).toArray();
    comments = comments.map(comment => ({
      for: comment.for,
      by: comment.by,
      content: fastify.crypto.decrypt(comment.content)
    }));
    return response.code(200).send(httpCodes["DATA_200"](comments));
  });

  fastify.post("/comments", {
    preValidation: [fastify.authenticate]
  }, async (request, response) => {
    if (!request.body || !request.body.content || !request.body.for) return response.code(400).send(httpCodes["400"]());
    if (request.body.content.length < 3 || request.body.content.length > 2000) return response.code(400).send(httpCodes["400"]("Invalid content length."));

    try {
      const forUser = await fastify.db.collections.users.findOne({
        _id: fastify.db.id(request.body.for)
      });
      if (!forUser) return response.code(400).send(httpCodes["400"]("Invalid target user id."));
    } catch (e) {
      return response.code(400).send(httpCodes["400"]("Invalid target user id."));
    }

    const inserted = await fastify.db.collections.comments.insertOne({
      for: fastify.db.id(request.body.for),
      by: fastify.db.id(request.user.id),
      content: fastify.crypto.encrypt(request.body.content)
    });

    if (inserted && inserted.result && inserted.result.ok === 1) return response.code(200).send(httpCodes["200"]());
    else return response.code(500).send(httpCodes["500"]("Database operation failed."));
  });

  fastify.patch("/comments/:id", {
    preValidation: [fastify.authenticate]
  }, async (request, response) => {
    if (!request.body || !request.body.content) return response.code(400).send(httpCodes["400"]());
  });
};

module.exports = routes;