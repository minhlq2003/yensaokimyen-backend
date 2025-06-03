"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const client_1 = __importDefault(require("../prisma/client"));
// GET all products
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield client_1.default.product.findMany();
    res.json(products);
});
exports.getAllProducts = getAllProducts;
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield client_1.default.product.findUnique({ where: { id } });
        if (!product)
            return res.status(404).json({ message: "Not found" });
        return res.json(product);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getProductById = getProductById;
// POST create product
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, price, categoryId } = req.body;
    const product = yield client_1.default.product.create({
        data: { name, description, price: Number(price), categoryId },
    });
    res.status(201).json(product);
});
exports.createProduct = createProduct;
// PUT update product
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, description, price, categoryId } = req.body;
    const product = yield client_1.default.product.update({
        where: { id },
        data: { name, description, price: Number(price), categoryId },
    });
    res.json(product);
});
exports.updateProduct = updateProduct;
// DELETE product
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield client_1.default.product.delete({ where: { id } });
    res.status(204).send();
});
exports.deleteProduct = deleteProduct;
