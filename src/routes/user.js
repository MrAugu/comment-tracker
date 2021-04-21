"use strict";
const httpCodes = require("../utils/httpCodes");
const validColors = [
  "red", "yellow", "orange",
  "green", "blue", "pink",
  "purple", "black", "white",
  "gray", "aqua", "peach"
];
const jwt = require("jsonwebtoken");

const routes = async (fastify) => {
  fastify.get("/users", async (request, response) => {
    response.type("application/json");
    let users = await fastify.db.collections.users.find({}).toArray();
    users = users.map(user => ({
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      color: user.color,
      bio: user.bio,
      createdTimestamp: user.createdTimestamp
    }));
    response.code(200).send(httpCodes["DATA_200"](users));
  });

  
  fastify.get("/me", {
    preValidation: [fastify.authenticate]
  }, async (request, response) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.type("application/json");
    return response.code(200).send(httpCodes["DATA_200"]({
      username: request.user.username,
      id: request.user.id,
      hash: request.user.hash,
      color: request.user.color,
      displayName: request.user.displayName
    }));
  });

  fastify.patch("/me", {
    preValidation: [fastify.authenticate]
  }, async (request, response) =>  {
    if (!request.body || (!request.body.color && !request.body.bio && !request.body.displayName && !request.body.newPassword) || (request.body.newPassword && !request.body.oldPassword)) return response.code(400).send(httpCodes["400"]());
    const updateQuery = {
      "$set": {}
    };
    
    if (request.body.color && !validColors.includes(request.body.color)) return response.code(400).send(httpCodes["400"]("Invalid color."));
    else if (request.body.color) updateQuery.$set.color = request.body.color;

    if (request.body.bio && (request.body.bio.length > 250 || request.body.bio.length < 8)) return response.code(400).send(httpCodes["400"]("Invalid bio length."));
    else if (request.body.bio) updateQuery.$set.bio = request.body.bio;

    if (request.body.displayName && (request.body.displayName.length < 2 || request.body.displayName > 30)) return response.code(400).send(httpCodes["400"]("Invalid displayName length."));
    else if (request.body.displayName) updateQuery.$set.displayName = request.body.displayName;

    if (request.body.newPassword) {
      const oldPasswordHash = fastify.crypto.hash(request.body.oldPassword);
      if (request.user.hash !== oldPasswordHash ) return response.code(400).send(httpCodes["400"]("Unable to update password."));
      const newPasswordHash = fastify.crypto.hash(request.body.newPassword);
      updateQuery.$set.password = newPasswordHash;
    }

    const updated = await fastify.db.collections.users.updateOne({
      _id: fastify.db.id(request.user.id)
    }, updateQuery);

    const token = jwt.sign({
      username: request.user.username,
      expires: (Date.now() + (1000 * 60 * 60 * 24 * 2)),
      id: request.user.id,
      hash: updateQuery.$set.password || request.user.hash,
      displayName: updateQuery.$set.displayName || request.user.displayName,
      color: updateQuery.$set.color || request.user.color
    }, process.env.KEY);

    if (updated && updated.result && updated.result.ok === 1) {
      response.setCookie("token", token);
      return response.code(200).send(httpCodes["200"]());
    } else {
      return response.code(500).send(httpCodes["500"]("Database operation failed."));
    }
  });
};

module.exports = routes;
