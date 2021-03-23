const UserModel = require("../Model/User");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
var expressJwt = require("express-jwt");
const nodemailer = require("nodemailer");

// Params

exports.findUserById = (req, res, next, id) => {
  UserModel.findOne({ where: { id: id } })
    .then((user) => {
      req.profile = user;
      next();
    })
    .catch((err) => {
      return res.status(400).json({
        error: "No user found in DB",
      });
    });
};

// Signup Controller
exports.signup = async (req, res, next) => {
  const data = req.body;
  try {
    UserModel.count({ where: { email: data["email"] } })
      .then(async (emailCount) => {
        if (emailCount == 0) {
          //TODO: /^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,}$/i  Implement regex
          const password = data["password"];
          const saltRounds = 11;
          const securePassword = await bcrypt.hash(password, saltRounds);
          data["password"] = securePassword;
          const user = await UserModel.create(data);
        } else {
          return res.status(500).json({
            success: false,
            message: "Email already exists",
          });
        }
      })
      .catch((err) => {
        return res.status(400).json({
          error: "Email Already exists",
        });
      });

    // res.status(200).json({
    //   success: true,
    //   message: "User created.",
    // });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

// Signin Controller
exports.signin = (req, res, next) => {
  const { email, password } = req.body;

  UserModel.findOne({ where: { email: email } })
    .then(async (user) => {
      if (!user) {
        return res.status(401).json({
          err: "No User Found",
        });
      } else {
        const login = await bcrypt.compare(password, user["password"]);
        if (!login) {
          return res.status(401).json({
            err: "Password do not match",
          });
        }
        //create token for cookie
        const token = jwt.sign({ _id: user.id }, process.env.SECRET);

        //put token in cookie
        res.cookie("token", token, { expire: new Date() + 9999 });

        //send response to front end
        const { _id, name, email, role } = user;
        return res.json({ token, user: { _id, name, email, role } });
        //TODO: res.redirect("/"); Add this res after postman testing complete.
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

// SignOut Controller
exports.signout = (req, res, next) => {
  res.clearCookie("token");
  res.json({
    msg: "User signed out successfully",
  });
};

//Protected Routes
exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  algorithms: ["sha1", "RS256", "HS256"],
  userProperty: "auth",
});

//Custom middleware
exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile.id === req.auth._id;
  if (!checker) {
    res.status(403).json({
      error: "ACCESS DENIED",
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "Sorry, you do not have Admin previliges",
    });
  }
  next();
};

// Get All Users data
exports.getAllUsers = async (req, res, next) => {
  try {
    const userData = await UserModel.findAll();

    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

exports.getUser = (req, res) => {
  // TODO: Resolve issue of password undefined
  // req.profile.password = undefined;
  req.profile.createdAt = undefined;
  req.profile.updatedAt = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

exports.updateUser = (req, res) => {
  UserModel.update(
    {
      id: req.body.id,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: req.body.password,
      salt: req.body.salt,
      role: req.body.role,
      userproduct: req.body.userproduct,
    },
    { where: { id: req.profile.id } }
  )
    .then((user) => {
      return res.status(200).json({
        success: "User Successfully updated",
      });
    })
    .catch((err) => {
      return res.status(400).json({
        error: "Unauthorised to change the information",
      });
    });
};

exports.confirmationMail = async (req, res) => {
  console.log(req.body);
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "savan.gatesaniya@gmail.com", // generated ethereal user
        pass: process.env.EMAIL_PASSWORD, // generated ethereal password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: "savan.gatesaniya@gmail.com", // sender address
      to: req.body.email, // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });
    res.status(200).json({
      success: true,
      msg: "User created",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};
