const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");
const Product = require("./Product");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
      maxlength: 32,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
      maxlength: 32,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      isEmail: true,
      unique: {
        args: true,
        msg: "Email address already in use!",
      },
      trim: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
      is: /^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,}$/i,
      set(value) {
        this.salt = uuidv4();
        this.setDataValue(
          "password",
          crypto.createHash("sha256", this.salt).update(value).digest("hex")
        );
      },
    },

    salt: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    userproduct: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
    },
  },
  { timestamps: true }
);

// User.hasMany(Product, { as: "products" });

User.prototype.validPassword = function (enteredpassword) {
  let enteredPwdEncrypted = crypto
    .createHash("sha256", this.salt)
    .update(enteredpassword)
    .digest("hex");
  return enteredPwdEncrypted === this.password;
};

module.exports = User;

// TODO: ERRORS =>
// Default value of [] for userproduct
// function(plainpassword){
//   return this.securePassword(plainpassword) === this.encry_password
// },
