const Category = require('../models/category');
const { publishMessage } = require('../services/snsService');

exports.getAllCategories = async (request, response) => {
    try {
        const categories = await Category.find();
        response.status(200).json(categories);
    }
    catch (error) {
        response.status(500).json({ message: "Erro ao buscar as categorias" });
    }
};

exports.getCategoryById = async (request, response) => {
    try {
        const { id } = request.params;
        const category = await Category.findById(id);

        if (!category) {
            response.status(404).json({ message: "Categoria não encontrada" });
        }

        response.status(200).json({ message: "Categoria encontrada com sucesso", category });
    }
    catch (error) {
        response.status(500).json({ message: "Erro ao buscar a categoria", error: error.message });
    }
};


exports.createCategory = async (request, response) => {
    try {
        const { title, description, ownerId } = request.body;
        const category = new Category({ title, description, ownerId });
        await category.save();
        await publishMessage(JSON.stringify({ ...category.toObject(), type: "category" }));
        response.status(201).json({ message: "Categoria criada com sucesso", category });
    }
    catch (error) {
        response.status(500).json({ message: "Erro ao criar a categoria", error: error.message });
    }
};

exports.updateCategory = async (request, response) => {
    try {
        const { id } = request.params;
        const params = request.body;

        const category = await Category.findByIdAndUpdate(id, params, { new: true, runValidators: true });

        if (!category) {
            return response.status(404).json({ message: "Categoria não encontrada" })
        }
        await publishMessage(JSON.stringify({ ...category.toObject(), type: "category" }));
        response.status(200).json({ message: "Categoria editada com sucesso", category });
    }
    catch (error) {
        response.status(500).json({ message: "Erro ao editar a categoria", error: error.message });
    }
};

exports.deleteCategory = async (request, response) => {
    try {
        const { id } = request.params;

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return response.status(404).json({ message: "Categoria não encontrada" });
        }
        await publishMessage(JSON.stringify({ ...category.toObject(), type: "category_deleted" }));
        response.status(200).json({ message: "Categoria deletada com sucesso" })
    }
    catch (error) {
        response.status(500).json({ message: "Erro ao deletar a categoria", error: error.message });
    }
};
