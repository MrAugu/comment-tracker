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
  "201": (message = "The resource was created.", code = 201) => ({
    statusCode: code,
    error: "Request fulfileld",
    message
  }),
  "200": (message = "The request was handled succesfully.", code = 200) => ({
    statusCode: code,
    error: "Request fulfileld",
    message
  }),
  "DATA_200": (message = "The resource was found.", data = {}, code = 200) => ({
    statusCode: code,
    error: "Request fulfileld",
    message,
    data
  }),
};