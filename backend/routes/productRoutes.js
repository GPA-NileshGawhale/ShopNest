const express = require("express");
const router = express.Router();
const { protect} = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const { getProducts, getProductById, createProduct ,updateProduct, deleteProduct} = require("../controllers/productController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Temporary storage for uploaded files

// all products
router.route("/").get(getProducts).post(protect, admin, upload.single("image"), createProduct);
//specific product
router.route("/:id").get(getProductById).put(protect, admin, upload.single("image"), updateProduct).delete(protect, admin, deleteProduct);

module.exports = router;