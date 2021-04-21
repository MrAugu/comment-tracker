"use strict";
const httpCodes = require("../utils/httpCodes");

const routes = async (fastify) => {
  fastify.get("/comments", async (request, response) => {
    let comments = await fastify.db.collections.comments.find({}).toArray();
    comments = comments.map(comment => ({
      id: comment._id,
      for: comment.for,
      by: comment.by,
      content: fastify.crypto.decrypt(comment.content),
      edits: comment.edits.map(comment => ({
        editedAt: comment.editedAt,
        previousContent: fastify.crypto.decrypt(comment.previousContent)
      }))
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
      content: fastify.crypto.encrypt(request.body.content),
      edits: []
    });

    if (inserted && inserted.result && inserted.result.ok === 1) return response.code(200).send(httpCodes["200"]());
    else return response.code(500).send(httpCodes["500"]("Database operation failed."));
  });

  fastify.patch("/comments/:id", {
    preValidation: [fastify.authenticate]
  }, async (request, response) => {
    if (!request.body || !request.body.newContent) return response.code(400).send(httpCodes["400"]());
    if (request.body.newContent.length < 3 || request.body.newContent.length > 2000) return response.code(400).send(httpCodes["400"]("Invalid content length."));
    const updateQuery = {
      "$set": {
        "content": fastify.crypto.encrypt(request.body.newContent)
      },
      "$push": {}
    };

    try {
      const comment = await fastify.db.collections.comments.findOne({
        _id: fastify.db.id(request.params.id)
      });
      if (!comment) return response.code(404).send(httpCodes["400"]("Invalid comment id.", 404));

      if (comment.by.toString() !== request.user.id) return response.code(403).send(httpCodes["400"]("You don't have access to this comment.", 403));
      if (fastify.crypto.decrypt(comment.content).toLowerCase() === request.body.newContent.toLowerCase()) return response.code(400).send(httpCodes["400"]("You can't edit the same comment with the same content."));

      updateQuery.$push.edits = {
        editedAt: Date.now(),
        previousContent: comment.content
      };
    } catch (e) {
      return response.code(404).send(httpCodes["400"]("Invalid comment id.", 404));
    }

    const updated = await fastify.db.collections.comments.updateOne({
      _id: fastify.db.id(request.params.id)
    }, updateQuery);

    if (updated && updated.result && updated.result.ok === 1) return response.code(200).send(httpCodes["200"]());
    else return response.code(500).send(httpCodes["500"]("Database operation failed."));
  });
};

module.exports = routes;