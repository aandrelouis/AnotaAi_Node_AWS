const express = require('express');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');

const router = express.Router();

router.use('/category', categoryRoutes);
router.use('/products', productRoutes);

router.get('/error', (req, res, next) => {
    const err = new Error('Test error');
    next(err);
});

module.exports = router;
