const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getProductReviews, createReview } = require("../controllers/reviewController");

const router = express.Router();

router.get("/product/:productId", getProductReviews);
router.post("/", protect, createReview);

module.exports = router;
