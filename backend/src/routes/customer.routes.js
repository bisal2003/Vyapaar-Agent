import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import Customer from '../models/customer.models.js';
import Transaction from '../models/transaction.models.js';

const router = express.Router();

// Get all customers
router.get('/', protectRoute, async (req, res) => {
    try {
        const customers = await Customer.find().sort({ name: 1 });
        res.status(200).json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get customer by ID
router.get('/:id', protectRoute, async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json(customer);
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get customer by phone
router.get('/phone/:phone', protectRoute, async (req, res) => {
    try {
        const customer = await Customer.findOne({ phone: req.params.phone });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json(customer);
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create new customer
router.post('/', protectRoute, async (req, res) => {
    try {
        const { name, phone, email, address, gstin, notes } = req.body;
        
        // Check if customer with phone already exists
        const existingCustomer = await Customer.findOne({ phone });
        if (existingCustomer) {
            return res.status(400).json({ message: 'Customer with this phone already exists' });
        }
        
        const customer = await Customer.create({
            name,
            phone,
            email,
            address,
            gstin,
            notes,
        });
        
        res.status(201).json(customer);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update customer
router.put('/:id', protectRoute, async (req, res) => {
    try {
        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        res.status(200).json(customer);
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get customer transactions
router.get('/:id/transactions', protectRoute, async (req, res) => {
    try {
        const transactions = await Transaction.find({ customerId: req.params.id })
            .sort({ createdAt: -1 })
            .limit(50);
        
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
