import mongoose from 'mongoose';
import Customer from '../models/customer.models.js';
import Product from '../models/product.models.js';
import Transaction from '../models/transaction.models.js';
import User from '../models/user.models.js';
import bcrypt from 'bcryptjs';

/**
 * Seed dummy data for development/demo
 */
export const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Clear existing data
        await Customer.deleteMany({});
        await Product.deleteMany({});
        await Transaction.deleteMany({});
        
        console.log('✅ Cleared existing data');
        
        // Create dummy products
        const products = await Product.insertMany([
            {
                name: 'Basmati Rice',
                description: 'Premium quality Basmati rice',
                hsnCode: '10063020',
                unit: 'kg',
                price: 120,
                stock: 500,
                gstRate: 5,
                category: 'Grains',
            },
            {
                name: 'Sunflower Oil',
                description: 'Refined sunflower cooking oil',
                hsnCode: '15121110',
                unit: 'ltr',
                price: 180,
                stock: 200,
                gstRate: 18,
                category: 'Oils',
            },
            {
                name: 'Sugar',
                description: 'White crystal sugar',
                hsnCode: '17011390',
                unit: 'kg',
                price: 45,
                stock: 300,
                gstRate: 5,
                category: 'Sweeteners',
            },
            {
                name: 'Wheat Flour',
                description: 'Whole wheat flour (atta)',
                hsnCode: '11010010',
                unit: 'kg',
                price: 40,
                stock: 400,
                gstRate: 5,
                category: 'Grains',
            },
            {
                name: 'Tea Powder',
                description: 'Premium CTC tea powder',
                hsnCode: '09023010',
                unit: 'kg',
                price: 350,
                stock: 100,
                gstRate: 12,
                category: 'Beverages',
            },
            {
                name: 'Red Chilli Powder',
                description: 'Spicy red chilli powder',
                hsnCode: '09042210',
                unit: 'kg',
                price: 250,
                stock: 80,
                gstRate: 5,
                category: 'Spices',
            },
            {
                name: 'Turmeric Powder',
                description: 'Pure turmeric powder',
                hsnCode: '09103010',
                unit: 'kg',
                price: 180,
                stock: 90,
                gstRate: 5,
                category: 'Spices',
            },
            {
                name: 'Toor Dal',
                description: 'Premium toor dal (arhar)',
                hsnCode: '07136010',
                unit: 'kg',
                price: 110,
                stock: 250,
                gstRate: 5,
                category: 'Pulses',
            },
            {
                name: 'Moong Dal',
                description: 'Green moong dal',
                hsnCode: '07133190',
                unit: 'kg',
                price: 130,
                stock: 200,
                gstRate: 5,
                category: 'Pulses',
            },
            {
                name: 'Salt',
                description: 'Iodized table salt',
                hsnCode: '25010051',
                unit: 'kg',
                price: 20,
                stock: 500,
                gstRate: 0,
                category: 'Seasonings',
            },
        ]);
        
        console.log(`✅ Created ${products.length} products`);
        
        // Create dummy customers
        const customers = await Customer.insertMany([
            {
                name: 'Rajesh Kumar',
                phone: '+919876543210',
                email: 'rajesh@example.com',
                address: '123, MG Road, Bangalore, Karnataka - 560001',
                gstin: '29ABCDE1234F1Z5',
                balance: 5000,
                totalTransactions: 8,
                lastTransactionDate: new Date('2026-02-14'),
                notes: 'Regular customer, pays on time',
            },
            {
                name: 'Priya Sharma',
                phone: '+919876543211',
                email: 'priya@example.com',
                address: '456, Park Street, Kolkata, West Bengal - 700016',
                gstin: '19XYZAB5678G2H9',
                balance: 3200,
                totalTransactions: 5,
                lastTransactionDate: new Date('2026-02-13'),
                notes: 'Prefers UPI payments',
            },
            {
                name: 'Amit Patel',
                phone: '+919876543212',
                email: 'amit@example.com',
                address: '789, Station Road, Ahmedabad, Gujarat - 380001',
                gstin: '24PQRST9012C3D4',
                balance: -2000,
                totalTransactions: 12,
                lastTransactionDate: new Date('2026-02-15'),
                notes: 'Bulk buyer, monthly credit settlement',
            },
            {
                name: 'Sunita Reddy',
                phone: '+919876543213',
                email: 'sunita@example.com',
                address: '321, Jubilee Hills, Hyderabad, Telangana - 500033',
                gstin: '36LMNOP3456E7F8',
                balance: 7500,
                totalTransactions: 15,
                lastTransactionDate: new Date('2026-02-12'),
                notes: 'VIP customer, restaurant owner',
            },
            {
                name: 'Vijay Singh',
                phone: '+919876543214',
                email: 'vijay@example.com',
                address: '567, Civil Lines, Jaipur, Rajasthan - 302001',
                gstin: '08GHIJK7890I1J2',
                balance: 1500,
                totalTransactions: 3,
                lastTransactionDate: new Date('2026-02-10'),
                notes: 'New customer',
            },
            {
                name: 'Meera Nair',
                phone: '+919876543215',
                email: 'meera@example.com',
                address: '890, Marine Drive, Kochi, Kerala - 682031',
                gstin: '32UVWXY1234K5L6',
                balance: 0,
                totalTransactions: 10,
                lastTransactionDate: new Date('2026-02-11'),
                notes: 'Always pays immediately',
            },
        ]);
        
        console.log(`✅ Created ${customers.length} customers`);
        
        // Create dummy users for chat (if not exists)
        const existingUsers = await User.find({});
        if (existingUsers.length === 0) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            
            await User.insertMany([
                {
                    email: 'seller@vyapaar.com',
                    fullName: 'Seller (You)',
                    password: hashedPassword,
                    profilePic: 'https://avatar.iran.liara.run/public/boy?username=seller',
                },
                {
                    email: 'rajesh@example.com',
                    fullName: 'Rajesh Kumar',
                    password: hashedPassword,
                    profilePic: 'https://avatar.iran.liara.run/public/boy?username=rajesh',
                },
                {
                    email: 'priya@example.com',
                    fullName: 'Priya Sharma',
                    password: hashedPassword,
                    profilePic: 'https://avatar.iran.liara.run/public/girl?username=priya',
                },
                {
                    email: 'amit@example.com',
                    fullName: 'Amit Patel',
                    password: hashedPassword,
                    profilePic: 'https://avatar.iran.liara.run/public/boy?username=amit',
                },
            ]);
            
            console.log('✅ Created chat users');
        }
        
        // Create sample transactions
        const sampleTransactions = [
            {
                customerId: customers[0]._id,
                customerName: customers[0].name,
                type: 'sale',
                documentType: 'GST Invoice',
                items: [
                    {
                        productId: products[0]._id, // Basmati Rice
                        productName: products[0].name,
                        quantity: 10,
                        unit: 'kg',
                        rate: 120,
                        gstRate: 5,
                        hsnCode: products[0].hsnCode,
                        amount: 1200,
                    },
                ],
                subtotal: 1200,
                gstAmount: 60,
                totalAmount: 1260,
                paymentMode: 'upi',
                paymentStatus: 'paid',
                paidAmount: 1260,
                agentGenerated: false,
            },
            {
                customerId: customers[1]._id,
                customerName: customers[1].name,
                type: 'sale',
                documentType: 'GST Invoice',
                items: [
                    {
                        productId: products[1]._id, // Sunflower Oil
                        productName: products[1].name,
                        quantity: 5,
                        unit: 'ltr',
                        rate: 180,
                        gstRate: 18,
                        hsnCode: products[1].hsnCode,
                        amount: 900,
                    },
                    {
                        productId: products[2]._id, // Sugar
                        productName: products[2].name,
                        quantity: 10,
                        unit: 'kg',
                        rate: 45,
                        gstRate: 5,
                        hsnCode: products[2].hsnCode,
                        amount: 450,
                    },
                ],
                subtotal: 1350,
                gstAmount: 184.5,
                totalAmount: 1534.5,
                paymentMode: 'credit',
                paymentStatus: 'unpaid',
                paidAmount: 0,
                agentGenerated: true,
            },
        ];
        
        await Transaction.insertMany(sampleTransactions);
        console.log(`✅ Created ${sampleTransactions.length} sample transactions`);
        
        console.log('🎉 Database seeding completed successfully!');
        
        return {
            success: true,
            message: 'Database seeded successfully',
            stats: {
                products: products.length,
                customers: customers.length,
                transactions: sampleTransactions.length,
            },
        };
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
};
