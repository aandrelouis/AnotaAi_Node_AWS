const express = require('express');
const connectDB = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
require('dotenv').config();

const app = express();

connectDB().catch(error => {
    console.error("Database connection failed:", error);
    process.exit(1);
});

app.use(express.json());
app.use('/', routes)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});