const UserModel = require("../Model/User");
var jwt = require("jsonwebtoken");
require("dotenv").config();
var expressJwt = require("express-jwt");

// Params

// exports.findUserById = (tutorialId) => {
//   UserModel.findByPk(userId, { include: ["products"] })
//     .then((user) => {
//       req.profile = user;
//       next();
//     })
//     .catch((err) => {
//       return res.status(400).json({
//         error: "No user found in DB",
//       });
//     });
// };

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
  console.log(data);
  try {
    const user = await UserModel.create(data);
    res.status(200).json({
      success: true,
      message: "User created.",
    });
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
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          err: "No User Found",
        });
      } else if (!user.validPassword(password)) {
        console.log("invalid pass");
        return res.status(401).json({
          err: "Password do not match",
        });
      } else {
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
