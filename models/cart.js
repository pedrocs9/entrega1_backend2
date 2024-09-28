import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    products: [
        {
            product: String,
            quantity: { type: Number, required: true }
        }
    ]
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;