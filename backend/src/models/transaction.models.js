import mongoose from 'mongoose';

const transactionItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    unit: {
        type: String,
        default: 'pc',
    },
    rate: {
        type: Number,
        required: true,
    },
    gstRate: {
        type: Number,
        default: 18,
    },
    hsnCode: {
        type: String,
        default: '',
    },
    amount: {
        type: Number,
        required: true,
    },
});

const transactionSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['sale', 'purchase', 'payment_in', 'payment_out'],
        required: true,
    },
    documentType: {
        type: String,
        enum: ['GST Invoice', 'Bill of Supply', 'Payment Receipt', 'Quotation'],
        default: 'GST Invoice',
    },
    invoiceNumber: {
        type: String,
        unique: true,
        sparse: true,
    },
    items: [transactionItemSchema],
    subtotal: {
        type: Number,
        default: 0,
    },
    gstAmount: {
        type: Number,
        default: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    paymentMode: {
        type: String,
        enum: ['cash', 'upi', 'card', 'bank_transfer', 'credit'],
        default: 'cash',
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'unpaid', 'partial'],
        default: 'paid',
    },
    paidAmount: {
        type: Number,
        default: 0,
    },
    notes: {
        type: String,
        default: '',
    },
    messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null,
    },
    agentGenerated: {
        type: Boolean,
        default: false,
    },
    jsonData: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
}, { timestamps: true });

// Generate invoice number before saving
transactionSchema.pre('save', async function(next) {
    if (!this.invoiceNumber && this.type === 'sale') {
        const count = await mongoose.model('Transaction').countDocuments({ type: 'sale' });
        const year = new Date().getFullYear();
        this.invoiceNumber = `INV/${year}/${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
