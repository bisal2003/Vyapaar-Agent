import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    hsnCode: {
        type: String,
        default: '',
    },
    unit: {
        type: String,
        default: 'pc', // pc, kg, ltr, etc.
    },
    price: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        default: 0,
    },
    gstRate: {
        type: Number,
        default: 18, // GST percentage
    },
    category: {
        type: String,
        default: 'General',
    },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
