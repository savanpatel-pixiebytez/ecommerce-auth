const ProductModel = require("../Model/Product");

exports.findProductById = (id) => {
  return ProductModel.findByPk(id, { include: ["user"] })
    .then((product) => {
      return product;
    })
    .catch((err) => {
      console.log(">> Error while finding comment: ", err);
    });
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const productData = await ProductModel.findAll();
    res.status(200).json({
      success: true,
      data: productData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

exports.createProduct = async (req, res, next) => {
  const data = req.body;
  console.log(data);
  try {
    const product = await ProductModel.create(data, {
      userId: req.body.userId,
    });
    res.status(200).json({
      success: true,
      message: "Product created.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

exports.updateProduct = async (req, res, next) => {
  const data = req.body;
  // console.log(data);
  try {
    const product = await ProductModel.update(data, {
      where: { id: data["id"] },
    });
    res.status(200).json({
      success: true,
      message: "Product Updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

exports.deleteProduct = async (req, res, next) => {
  const data = req.body;
  console.log(data);
  try {
    const product = await ProductModel.destroy({
      where: { id: data["id"] },
    });
    res.status(200).json({
      success: true,
      message: "Product Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};
