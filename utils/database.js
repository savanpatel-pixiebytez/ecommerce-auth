const Sequelize = require("sequelize");

const sequelize = new Sequelize("product", "", "", {
  host: "localhost",
  dialect: "sqlite",
  storage: "./ecommerceDB.sqlite",
});

module.exports = sequelize;
