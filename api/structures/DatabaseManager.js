"use strict";

const { MongoClient, ObjectId, Db, Collection } = require("mongodb");
const queryString = require("querystring");
const DefaultConnectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

/**
 * Represents a database manager - a small layer of abstraction over the naked database driver.
 */
class DatabaseManager {
    /**
     * @param {object} options - Represents a set of options used to connect to the db.
     */
  constructor (options) {
    /**
     * The name of the database.
     * 
     * @type {string}
     */
    this.name = options.name || "data";

    /**
     * Database username.
     * 
     * @type {string}
     */
    this.username = options.username || "";

    /**
     * Database user password.
     * 
     * @type {string}
     */
    this.password = options.password || "";

    /**
     * Database port.
     * 
     * @type {number}
     */
    this.port = options.port || 27017;

    /**
     * Database host.
     * 
     * @type {string}
     */
    this.host = options.host || "localhost";

    /**
     * The database connection.
     * 
     * @type {MongoClient|null}
     */
    this.client = null;

    /**
     * The selected database.
     * 
     * @type {Db}
     */
    this.db = null;

    /**
     * Mongodb connection options.
     * 
     * @type {Object}
     */
    this.connectionOptions = Object.assign(DefaultConnectionOptions, (options.connectionOptions || {}));

    /**
     * Whether to use +srv prefix or not.
     * 
     * @type {boolean}
     */
    this.useSrv = options.useSrv || false;

    /**
     * The mongodb url query params.
     * 
     * @type {object}
     */
    this.params = queryString.stringify(options.params || {});

    /**
     * Whether to use the port or not.
     * 
     * @type {boolean}
     */
    this.usePort = (options.usePort === null || options.usePort === undefined) ? true : options.usePort;

    /**
     * Property used to dynamically get collections by name.
     * 
     * @type {Collection}
     */
    this.collections = new Proxy({}, {
      get: (target, property, receiver) => {
        if (!this.db) throw new Error("Must be connected before accesing the collections.");
        return this.db.collection(property);
      }
    });
  }

  /**
   * Creates the connection between node and the database.
   * 
   * @returns {Promise<boolean>}
   */
  connect () {
    return new Promise((resolve, reject) => {
      if (this.db) resolve(true);
      MongoClient.connect(this.url, this.connectionOptions, (error, client) => {
        if (error) reject(error);
        this.client = client;
        this.db = client.db(this.name);
        resolve(client);
      });
    });
  }

  get url () {
    return `mongodb${this.useSrv ? "+srv" : ""}://${this.username && this.password ? `${encodeURIComponent(this.username)}:${encodeURIComponent(this.password)}@` : ""}${this.host}${this.port && this.usePort ? `:${this.port}` : ""}/${this.name}${this.params ? `?${this.params}` :  ""}`;
  }

  /**
   * Returns a mongodb object id type.
   * 
   * @param {string} _id
   * @returns {ObjectId} The object id as object.
   */
  id (_id) {
    return new ObjectId(_id);
  }
}

module.exports = DatabaseManager;