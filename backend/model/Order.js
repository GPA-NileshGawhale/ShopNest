const mangoose = require('mongoose');

const orderSchema = new mangoose.Schema({
    user: {type: mangoose.Schema.Types.ObjectId, ref: 'User', required: true},
    items: [{
        productId: {type: mangoose.Schema.Types.ObjectId, ref: 'Product', required: true},
        qty: {type: Number, required: true, },
        price: {type: Number, required: true}
    }],
    totalAmount: {type: Number, required: true, default: 0},
    address: {
        fullname: {type: String, required: true},
        street: {type: String, required: true},
        city: {type: String, required: true},
        postalCode: {type: String, required: true},
        country: {type: String, required: true}
    },
    paymentId: {type: String},
    status: {type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending'},
}, {timestamps: true});

module.exports = mangoose.model('Order', orderSchema);