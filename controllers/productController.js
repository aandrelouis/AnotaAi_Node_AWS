const Product = require('../models/product');
const Category = require('../models/category');
const { publishMessage } = require('../services/snsService');

exports.getAllProducts = async (request, response) => {
    try {
        const products = await Product.find();
        response.status(200).json(products);
    }
    catch (error) {
        response.status(500).json({ message: "Erro ao buscar os produtos" });
    }
};

exports.createProduct = async (request, response) => {
    try {
        const { title, ownerId, description, price, categoryId } = request.body;

        const category = await Category.findById({ _id: categoryId });

        if (!category) {
            return response.status(404).json({ message: "Categoria não existe" })
        }

        const product = new Product({ title, ownerId, description, price, category: category._id })
        await product.save();
        await publishMessage(JSON.stringify({ ...product.toObject(), type: "product" }));

        response.status(201).json({ message: "Produto criado com sucesso", product })
    }
    catch (error) {
        console.log(error)
        response.status(500).json({ message: "Erro ao criar o produto", error: error.message })
    }
};

exports.updateProduct = async (request, response) => {
    try {
        const { id } = request.params;
        const { title, description, price, categoryId } = request.body;

        const product = await Product.findById(id);
        if (!product) {
            return response.status(404).json({ message: "Produto não existe" });
        }

        if (categoryId) {
            const category = await Category.findById({ _id: categoryId });
            if (!category) {
                return response.status(404).json({ message: "Categoria não existe" });
            }
            product.category = categoryId;
        }

        if (title) product.title = title;
        if (description) product.description = description;
        if (price) product.price = price;
        await product.save();
        await publishMessage(JSON.stringify({ ...product.toObject(), type: "product" }));
        return response.status(200).json({ message: "Produto editado com sucesso", product });

    }
    catch (error) {
        return response.status(500).json({ message: "Erro ao editar o produto" });
    }
};

exports.deleteProduct = async (request, response) => {
    try {
        const { id } = request.params;

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return response.status(404).json({ message: "Produto não encontrado" });
        }
        await publishMessage(JSON.stringify({ ...product.toObject(), type: "product_deleted" }));
        response.status(200).json({ message: "Produto deletado com sucesso" })
    }
    catch (error) {
        response.status(500).json({ message: "Erro ao deletar o produto", error: error.message });
    }
};

