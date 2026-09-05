const Order = require("../model/Order");
const Product = require("../model/Product");
const sendEmail = require("../utils/sendEmail");

const createOrder = async (req, res) => {
  try {
    const { items, paymentId } = req.body;
    const address = req.body.address
      ? { ...req.body.address, fullname: req.body.address.fullname || req.body.address.fullName }
      : req.body.address;
    if (
      !items ||
      items.length === 0 ||
      !address ||
      !paymentId
    ) {
      return res.status(400).json({ message: "Invalid order data" });
    } else {
      const products = await Product.find({
        _id: { $in: items.map((item) => item.productId) },
      });

      if (products.length !== items.length) {
        return res.status(400).json({ message: "One or more products not found" });
      }

      const orderItems = items.map((item) => {
        const product = products.find(
          (product) => product._id.toString() === item.productId.toString(),
        );
        const qty = Number(item.qty);

        if (!product || !Number.isInteger(qty) || qty <= 0) {
          throw new Error("Invalid order item");
        }

        return {
          productId: product._id,
          qty,
          price: product.price,
        };
      });
      const calculatedTotal = orderItems.reduce(
        (total, item) => total + item.price * item.qty,
        0,
      );

      const newOrder = new Order({
        user: req.user._id,
        items: orderItems,
        totalAmount: calculatedTotal,
        address,
        paymentId,
      });
      await newOrder.save();
      const message = `Dear ${req.user.name},\n\nYour order has been successfully created. Here are the details:\n\nOrder ID: ${newOrder._id}\nTotal Amount: ${calculatedTotal}\nShipping Address: ${address.fullname}, ${address.street}, ${address.city}, ${address.postalCode}, ${address.country}\n\nThank you for shopping with us!\n\nBest regards,\nShopNest Team`;

      await sendEmail(req.user.email, "Order Created", message);
      res
        .status(201)
        .json({ message: "Order created successfully", order: newOrder });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate(
      "items.productId",
      "name price",
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "error fetching orders", error });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "id name");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "error fetching orders", error });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const status = String(req.body.status || "").toLowerCase();
    if (!["pending", "shipped", "delivered"].includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    existingOrder.status = status;
    await existingOrder.save();
    res.json({
      message: "Order status updated successfully",
      order: existingOrder,
    });
  } catch (error) {
    res.status(500).json({ message: "error updating order status", error });
  }
};

module.exports = {
  createOrder,
  myOrders,
  getOrders,
  updateOrderStatus,
};
