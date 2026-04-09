const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']); // Use Cloudflare/Google
require('dotenv').config();

const seedDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected successfully!');
        process.exit(0);
    } catch (err) {
        console.error('CRASH:', err.stack);
        process.exit(1);
    }
};
seedDB();
