"use strict";

/**
 * DISCLAIMER
 * 
 * This is just a dummie testing app to experiment with fastify and related modules
 * such as JWT - this app follows little good practices, though many of the things
 * that I did here should NEVER EVER IN A MILLION YEARS go into prouction or even
 * dream of it.
 * 
 * ~MrAugu
 */

const jwt = require("jsonwebtoken");
const fastify = require("fastify");
require("make-promises-safe");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, ".env")
});
const host = fastify({
  logger: true
});
const DatabaseManager = require("./structures/DatabaseManager");
const manager = new DatabaseManager({
  useSrv: true,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  usePort: false,
  name: process.env.DATABASE_NAME,
  params: {
    retryWrites: true,
    w: "majority"
  }
});
host.db = manager;
const { HTTP_400, HTTP_200, HTTP_500, HTTP_401 } = require("./codes.json");

host.register(require("./plugins/authentication"));

host.post("/signup", async (request, response) => {
  response.type("application/json");

  // In a real world app, you would want more validation here.
  if (!request.body || !request.body.username || !request.body.password) return response.code(400).send(HTTP_400);

  var user = await host.db.collections.users.findOne({
    "username": request.body.username
  });
  
  if (user) return response.code(400).send(Object.assign(HTTP_400, { message: "Resource already exists." }));

  // In a real world app, you would encrypt passwords.
  user = await host.db.collections.users.insertOne({
    "username": request.body.username,
    "password": request.body.password
  });

  if (user && user.result && user.result.ok === 1) return response.code(201).send(Object.assign(HTTP_200, { statusCode: 201, message: "Resource created." }));
  else return response.code(503).send(Object.assign(HTTP_500, { statusCode: 503, message: "Database operation failed." }));
});

host.post("/login", async (request, response) => {
  response.type("application/json");

  // In a real world app, you would want more validation here.
  if (!request.body || !request.body.username || !request.body.password) return response.code(400).send(HTTP_400);

  var user = await host.db.collections.users.findOne({
    "username": request.body.username,
    "password": request.body.password
  });

  if (!user) return response.code(401).send(HTTP_401);

  const token = jwt.sign({ username: user.username }, process.env.SECRET);

  response.setCookie("token", token, {
    domain: "127.0.0.1",
    path: "/",
    secure: false,
    httpOnly: true,
    sameSite: false
  });

  return response.code(200).send(Object.assign(HTTP_200, {
    data: { token }
  }));
});

host.get("/users/@me", { preValidation: host.authenticate }, async function (request, response) {
  const dbUser = await host.db.collections.users.findOne({
    username: request.user.username
  });

  return {
    "statusCode": 200,
    "error": null,
    "message": "Request fulfilled.",
    "data": {
      ...dbUser
    }
  }
});

manager.connect().then(() => {
  host.listen(parseInt(process.env.PORT, 10), (error, address) => {
    if (error) throw error;
    console.log(`Host listening on ${address}.`);
  });
});