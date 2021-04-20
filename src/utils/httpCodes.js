"use strict";

module.exports = {
  "400": (message = "The request body is invaid.", code = 400) => ({
    statusCode: code,
    error: "Bad request",
    message
  }),
  "500": (message = "The server is unable fulfill the request, try again later.", code = 400) => ({
    statusCode: code,
    error: "Internal server error",
    message
  }),
  "200": (message = "Request fulfilled", code = 200) => ({
    statusCode: code,
    error: null,
    message
  }),
  "DATA_200": (data = {}, message = "Request fulfileld", code = 200) => ({
    statusCode: code,
    error: null,
    message,
    data
  }),
  "401": (message = "You are not authorized.", code = 401) => ({
    statusCode: code,
    error: "Unauthorized",
    message
  })
};