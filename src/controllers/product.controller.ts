import { Request, Response } from "express";
import prisma from "../prisma/client";

// GET all products
export const getAllProducts = async (req: Request, res: Response) => {
  const products = await prisma.product.findMany();
  res.json(products);
};

export const getProductById = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ message: "Not found" });
    return res.json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST create product
export const createProduct = async (req: Request, res: Response) => {
  const { name, description, price, categoryId } = req.body;
  const product = await prisma.product.create({
    data: { name, description, price: Number(price), categoryId },
  });
  res.status(201).json(product);
};

// PUT update product
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, categoryId } = req.body;
  const product = await prisma.product.update({
    where: { id },
    data: { name, description, price: Number(price), categoryId },
  });
  res.json(product);
};

// DELETE product
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.product.delete({ where: { id } });
  res.status(204).send();
};
