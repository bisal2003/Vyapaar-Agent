import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        default: '',
    },
    address: {
        type: String,
        default: '',
    },
    gstin: {
        type: String,
        default: '',
    },
    balance: {
        type: Number,
        default: 0, // Positive = to receive, Negative = to pay
    },
    totalTransactions: {
        type: Number,
        default: 0,
    },
    lastTransactionDate: {
        type: Date,
        default: null,
    },
    notes: {
        type: String,
        default: '',
    },
}, { timestamps: true });

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
