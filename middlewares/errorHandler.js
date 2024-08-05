const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Servidor com Problema' });
};

module.exports = errorHandler;
