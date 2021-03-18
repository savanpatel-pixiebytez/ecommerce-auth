const express = require("express");
const router = express.Router();

// TODO: Add isAuthenticate to check that user is manipulating its own account only

const {
  findUserById,
  signup,
  getAllUsers,
  signin,
  isSignedIn,
  signout,
  getUser,
  updateUser,
  isAuthenticated,
} = require("../Controller/User");

// Params
router.param("userId", findUserById);

// Authentication Routes
router.post("/signup", signup);

router.post("/signin", signin);

router.get("/signout", signout);

// User Routes
router.get("/users", isSignedIn, getAllUsers);

router.get("/user/:userId", isSignedIn, isAuthenticated, getUser);

router.put("/user/:userId", isSignedIn, isAuthenticated, updateUser);

// Get all the products associated with the particular user
// router.get(
//   "/products/user/:userId",
//   isSignedIn,
//   isAuthenticated,
//   userPurchaseList
// );

//TODO: TEST ROUTES (Remove after project Completion)
router.get("/test", isSignedIn, (req, res) => {
  res.json(req.auth);
});

module.exports = router;
