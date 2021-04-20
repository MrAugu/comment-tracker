const plugin = require("fastify-plugin");
const { HTTP_401 } = require("../codes.json");

module.exports = plugin(async function (fastify, options) {
  fastify.register(require("fastify-jwt"), {
    secret: process.env.SECRET,
    cookie: {
      cookieName: "token"
    }
  });

  fastify.register(require("fastify-cookie"));

  fastify.decorate("authenticate", async function (request, response) {
    try {
      await request.jwtVerify();
      console.log("hai");
    } catch (error) {
       return response.type("application/json").code(401).send(Object.assign(HTTP_401, { message: error }));
    }
  });
});