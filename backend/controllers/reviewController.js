const Order = require("../model/Order");
const Product = require("../model/Product");
const Review = require("../model/Review");

const getProductReviews = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error("Review fetch failed:", error);
    res.status(500).json({ message: "Unable to fetch reviews" });
  }
};

const createReview = async (req, res) => {
  try {
    const productId = req.body.productId;
    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || "").trim();

    if (!productId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "A rating from 1 to 5 is required" });
    }

    const order = await Order.findOne({
      user: req.user._id,
      status: "delivered",
      "items.productId": productId,
    });
    if (!order) {
      return res.status(403).json({ message: "You can review a product after it is delivered" });
    }

    const existingReview = await Review.findOne({ user: req.user._id, product: productId });
    if (existingReview) {
      return res.status(409).json({ message: "You have already reviewed this product" });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      order: order._id,
      rating,
      comment,
    });

    const aggregate = await Review.aggregate([
      { $match: { product: review.product } },
      { $group: { _id: "$product", average: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    const updatedProduct = await Product.findByIdAndUpdate(productId, {
      ratings: Number(aggregate[0].average.toFixed(1)),
      numReviews: aggregate[0].count,
    }, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(201).json({
      review: await review.populate("user", "name"),
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Review creation failed:", error);
    res.status(500).json({ message: "Unable to submit review" });
  }
};

module.exports = { getProductReviews, createReview };
