const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const createOrder = async (req, res) => {
        try {
                if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
                        return res.status(500).json({ message: "Payment gateway is not configured" });
                }

                const amount = Number(req.body.amount);
                if (!Number.isFinite(amount) || amount <= 0) {
                        return res.status(400).json({ message: "Payment amount must be greater than zero" });
                }

                const instance = new Razorpay({
                        key_id: process.env.RAZORPAY_KEY_ID,
                        key_secret: process.env.RAZORPAY_KEY_SECRET,
                });
                const options = {
                        amount: Math.round(amount * 100),
                        currency: "INR",
                        receipt: crypto.randomBytes(10).toString("hex"),
                };
                const order = await instance.orders.create(options);
                res.status(200).json({ ...order, key_id: process.env.RAZORPAY_KEY_ID });
        } catch (error) {
                console.error("Razorpay order creation failed:", error);
                res.status(500).json({ message: "Unable to initialize payment" });
        };
};

const verifypayment = async (req, res) => {
        try {
                const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
                const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                        .update(razorpay_order_id + "|" + razorpay_payment_id)
                        .digest('hex');
                if(generated_signature === razorpay_signature){
                        res.status(200).json({ message: "Payment verified successfully" });
                } else {
                        res.status(400).json({ message: "Payment verification failed" });
                }
        } catch (error) {
                console.error("Razorpay payment verification failed:", error);
                res.status(500).json({ message: "Unable to verify payment" });
        }
};

module.exports = { createOrder, verifypayment };