const express = require('express');
const{createOrder, verifypayment} = require('../controllers/paymentController');
const router = express.Router();

router.post('/create-order', createOrder);
router.post('/verify-payment', verifypayment);

module.exports = router;