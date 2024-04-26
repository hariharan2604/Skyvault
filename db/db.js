const { MongoClient } = require('mongodb');
const env = require("dotenv");
env.config();
const uri = process.env.MONGO_URI; // Assuming MongoDB is running locally on default port
const client = new MongoClient(uri);


async function connectToDB() {
    try {
        await client.connect();
        console.log('Connected successfully to server');
        return client;

    } catch (err) {
        console.error('Error occurred:', err);
    }
}

module.exports = { client, connectToDB };