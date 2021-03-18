const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../Controller/Product");
const { isSignedIn, findUserById } = require("../Controller/User");

// Params
router.param("userId", findUserById);

//Create Routes
router.post("/product/:userId", isSignedIn, createProduct);

//Update Routes
router.put("/product", updateProduct);

//Delete Routes
router.delete("/product", deleteProduct);

//Product Listing Routes
router.get("/product", getAllProducts);

module.exports = router;
