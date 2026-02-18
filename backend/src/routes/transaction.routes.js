import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import Transaction from '../models/transaction.models.js';
import Customer from '../models/customer.models.js';

const router = express.Router();

// Get all transactions
router.get('/', protectRoute, async (req, res) => {
    try {
        const { limit = 50, offset = 0, customerId, type } = req.query;
        
        const filter = {};
        if (customerId) filter.customerId = customerId;
        if (type) filter.type = type;
        
        const transactions = await Transaction.find(filter)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset))
            .populate('customerId', 'name phone');
        
        const total = await Transaction.countDocuments(filter);
        
        res.status(200).json({
            transactions,
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get transaction by ID
router.get('/:id', protectRoute, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('customerId');
        
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        
        res.status(200).json(transaction);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get dashboard stats
router.get('/stats/dashboard', protectRoute, async (req, res) => {
    try {
        const totalSales = await Transaction.aggregate([
            { $match: { type: 'sale' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        
        const totalReceivable = await Customer.aggregate([
            { $match: { balance: { $gt: 0 } } },
            { $group: { _id: null, total: { $sum: '$balance' } } }
        ]);
        
        const totalPayable = await Customer.aggregate([
            { $match: { balance: { $lt: 0 } } },
            { $group: { _id: null, total: { $sum: '$balance' } } }
        ]);
        
        const recentTransactions = await Transaction.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('customerId', 'name phone');
        
        res.status(200).json({
            totalSales: totalSales[0]?.total || 0,
            totalReceivable: totalReceivable[0]?.total || 0,
            totalPayable: Math.abs(totalPayable[0]?.total || 0),
            recentTransactions,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create manual transaction
router.post('/', protectRoute, async (req, res) => {
    try {
        const transaction = await Transaction.create(req.body);
        
        // Update customer balance
        if (transaction.customerId) {
            const customer = await Customer.findById(transaction.customerId);
            if (customer) {
                if (transaction.type === 'sale') {
                    customer.balance += transaction.totalAmount - transaction.paidAmount;
                } else if (transaction.type === 'payment_in') {
                    customer.balance -= transaction.totalAmount;
                }
                customer.totalTransactions += 1;
                customer.lastTransactionDate = new Date();
                await customer.save();
            }
        }
        
        res.status(201).json(transaction);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
