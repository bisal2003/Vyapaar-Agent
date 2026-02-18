import axios from 'axios';
import Product from '../models/product.models.js';
import Customer from '../models/customer.models.js';
import Transaction from '../models/transaction.models.js';

const AGENT_API_URL = process.env.AGENT_API_URL || 'http://localhost:8000';

/**
 * Service to interact with Python AI agents
 */
class AgentService {
    /**
     * Process a message tagged with @v
     * @param {string} messageText - The message text from customer
     * @param {string} context - Additional context from seller
     * @param {Object} customer - Customer object
     * @returns {Object} - Transaction data and invoice/bill
     */
    async processVyapaarCommand(messageText, context, customer) {
        try {
            // Build command for the agent
            const command = this.buildCommand(messageText, context, customer);
            
            console.log('Sending command to AI agent:', command);
            
            // Call the invoice agent
            const response = await axios.get(`${AGENT_API_URL}/invoice`, {
                params: { command },
                timeout: 30000, // 30 second timeout
            });

            if (response.data.status === 'success') {
                // Process the generated invoice
                const invoice = response.data.document;
                
                // Create transaction from invoice
                const transaction = await this.createTransactionFromInvoice(
                    invoice,
                    customer,
                    response.data.json_path
                );
                
                return {
                    success: true,
                    transaction,
                    invoice,
                    message: 'Invoice generated successfully!',
                };
            } else if (response.data.status === 'needs_clarification') {
                return {
                    success: false,
                    needsClarification: true,
                    questions: response.data.clarification_questions,
                    partialDocument: response.data.partial_document,
                    message: 'Need more information',
                };
            } else {
                throw new Error('Unexpected agent response');
            }
        } catch (error) {
            console.error('Agent service error:', error.message);
            
            // Fallback: manual parsing
            return await this.fallbackManualParsing(messageText, context, customer);
        }
    }

    /**
     * Build command string for AI agent
     */
    buildCommand(messageText, context, customer) {
        let command = `Generate GST invoice for ${customer.name}`;
        
        // Add items from message
        const items = this.extractItemsFromMessage(messageText);
        if (items.length > 0) {
            command += ` with items: ${items.map(i => `${i.quantity}${i.unit} ${i.name}`).join(', ')}`;
        }
        
        // Add additional context
        if (context && context.trim()) {
            command += `. Additional context: ${context}`;
        }
        
        return command;
    }

    /**
     * Extract items from natural language message
     */
    extractItemsFromMessage(messageText) {
        const items = [];
        const text = messageText.toLowerCase();
        
        // Common patterns: "5kg rice", "2 liters oil", "10 packets sugar"
        const patterns = [
            /(\d+(?:\.\d+)?)\s*(kg|kgs|kilogram|kilograms)\s+(?:of\s+)?(\w+(?:\s+\w+)?)/gi,
            /(\d+(?:\.\d+)?)\s*(liter|liters|ltr|ltrs|l)\s+(?:of\s+)?(\w+(?:\s+\w+)?)/gi,
            /(\d+(?:\.\d+)?)\s*(packet|packets|pack|packs|pc|pcs|piece|pieces)\s+(?:of\s+)?(\w+(?:\s+\w+)?)/gi,
            /(\d+(?:\.\d+)?)\s*(\w+(?:\s+\w+)?)/gi, // Fallback: number + item name
        ];
        
        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const quantity = parseFloat(match[1]);
                let unit = match[2] ? match[2].toLowerCase() : 'pc';
                const name = match[3] || match[2]; // For fallback pattern
                
                // Normalize units
                if (['kg', 'kgs', 'kilogram', 'kilograms'].includes(unit)) unit = 'kg';
                else if (['liter', 'liters', 'ltr', 'ltrs', 'l'].includes(unit)) unit = 'ltr';
                else if (['packet', 'packets', 'pack', 'packs', 'pc', 'pcs', 'piece', 'pieces'].includes(unit)) unit = 'pc';
                
                items.push({ quantity, unit, name: name.trim() });
            }
        });
        
        return items;
    }

    /**
     * Create transaction from AI-generated invoice
     */
    async createTransactionFromInvoice(invoice, customer, jsonPath) {
        const items = [];
        let subtotal = 0;
        let gstAmount = 0;
        
        // Process each item in the invoice
        for (const item of invoice.items || []) {
            // Try to find matching product
            let product = await Product.findOne({ 
                name: new RegExp(item.description || item.item_name, 'i') 
            });
            
            // If not found, create a basic product entry
            if (!product) {
                product = await Product.create({
                    name: item.description || item.item_name,
                    hsnCode: item.hsn_code || '',
                    unit: item.unit || 'pc',
                    price: item.rate || item.price_per_unit || 0,
                    gstRate: item.gst_rate || 18,
                    stock: 1000, // Default stock
                });
            }
            
            const quantity = parseFloat(item.quantity || 1);
            const rate = parseFloat(item.rate || item.price_per_unit || product.price);
            const amount = quantity * rate;
            const itemGst = amount * (product.gstRate / 100);
            
            subtotal += amount;
            gstAmount += itemGst;
            
            items.push({
                productId: product._id,
                productName: product.name,
                quantity,
                unit: product.unit,
                rate,
                gstRate: product.gstRate,
                hsnCode: product.hsnCode,
                amount,
            });
        }
        
        const totalAmount = subtotal + gstAmount;
        
        // Create transaction
        const transaction = await Transaction.create({
            customerId: customer._id,
            customerName: customer.name,
            type: 'sale',
            documentType: invoice.document_type || 'GST Invoice',
            items,
            subtotal,
            gstAmount,
            totalAmount,
            paymentMode: 'credit', // Default to credit
            paymentStatus: 'unpaid',
            paidAmount: 0,
            agentGenerated: true,
            jsonData: invoice,
        });
        
        // Update customer balance
        customer.balance += totalAmount;
        customer.totalTransactions += 1;
        customer.lastTransactionDate = new Date();
        await customer.save();
        
        // Update product stock
        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }
        
        return transaction;
    }

    /**
     * Fallback manual parsing when agent is unavailable
     */
    async fallbackManualParsing(messageText, context, customer) {
        console.log('Using fallback manual parsing...');
        
        const items = this.extractItemsFromMessage(messageText);
        
        if (items.length === 0) {
            return {
                success: false,
                needsClarification: true,
                message: 'Could not understand the order. Please specify items with quantities.',
            };
        }
        
        const transactionItems = [];
        let subtotal = 0;
        let gstAmount = 0;
        
        for (const item of items) {
            // Find product
            const product = await Product.findOne({ 
                name: new RegExp(item.name, 'i') 
            });
            
            if (!product) {
                return {
                    success: false,
                    message: `Product "${item.name}" not found in inventory.`,
                };
            }
            
            const amount = item.quantity * product.price;
            const itemGst = amount * (product.gstRate / 100);
            
            subtotal += amount;
            gstAmount += itemGst;
            
            transactionItems.push({
                productId: product._id,
                productName: product.name,
                quantity: item.quantity,
                unit: product.unit,
                rate: product.price,
                gstRate: product.gstRate,
                hsnCode: product.hsnCode,
                amount,
            });
        }
        
        const totalAmount = subtotal + gstAmount;
        
        const transaction = await Transaction.create({
            customerId: customer._id,
            customerName: customer.name,
            type: 'sale',
            documentType: 'GST Invoice',
            items: transactionItems,
            subtotal,
            gstAmount,
            totalAmount,
            paymentMode: 'credit',
            paymentStatus: 'unpaid',
            paidAmount: 0,
            agentGenerated: true,
        });
        
        // Update customer
        customer.balance += totalAmount;
        customer.totalTransactions += 1;
        customer.lastTransactionDate = new Date();
        await customer.save();
        
        // Update stock
        for (const item of transactionItems) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }
        
        return {
            success: true,
            transaction,
            message: 'Invoice created (fallback mode)',
        };
    }
}

export default new AgentService();
