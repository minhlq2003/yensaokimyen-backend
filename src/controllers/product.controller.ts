import { Request, Response } from "express";
import prisma from "../prisma/client";
import { Prisma, ProductImages } from "../../generated/prisma";

// GET all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const {
      sortBy = "id",
      sortOrder = "asc",
      page = 1,
      limit = 25,
      search = "",
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const sortOrderStr =
      String(sortOrder).toLowerCase() === "asc" ? "asc" : "desc";

    const findOptions: Prisma.ProductFindManyArgs = {
      include: {
        category: true,
        images: true,
      },
      skip,
      take,
      where: {},
    };

    if (search) {
      findOptions.where = {
        OR: [
          {
            name: {
              contains: String(search),
            },
          },
        ],
      };
    }

    if (sortBy) {
      if (sortBy === "sold") {
        findOptions.orderBy = {
          sold: sortOrderStr as Prisma.SortOrder,
        };
      }
    }
    const products = await prisma.product.findMany(findOptions);
    res.json({
      status: true,
      data: products,
      meta: {
        total: products.length,
        page: 1,
        limit: 10,
      },
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching books.",
    });
  }
};

export const getProductById = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        images: true,
        category: true, // nếu bạn cũng cần
      },
    });
    if (!product) return res.status(404).json({ message: "Not found" });
    return res.json({
      status: "success",
      data: product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST create product
export const createProduct = async (req: Request, res: Response) => {
  const { name, description, price, categoryId, images, stock, sold, status } =
    req.body;

  try {
    const result = await prisma.$transaction(async (prismaClient) => {
      // Tạo sản phẩm chính
      const product = await prismaClient.product.create({
        data: {
          status,
          stock: Number(stock),
          sold: Number(sold),
          name,
          description,
          price: Number(price),
          categoryId: Number(categoryId),
        },
      });

      // Nếu có ảnh, thêm vào bảng product_images
      if (images && Array.isArray(images) && images.length > 0) {
        await prismaClient.productImages.createMany({
          data: images.map((url: any) => ({
            productId: product.id,
            url: url.url,
          })),
        });
      }

      // Trả lại sản phẩm đã tạo, bao gồm ảnh
      const fullProduct = await prismaClient.product.findUnique({
        where: { id: product.id },
        include: {
          images: true,
          category: true,
        },
      });

      return fullProduct;
    });

    res.status(201).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res
      .status(500)
      .json({ status: "error", message: "Failed to create product." });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, categoryId, images, sold, stock, status } =
    req.body;

  try {
    const result = await prisma.$transaction(async (prismaClient) => {
      // Cập nhật thông tin sản phẩm chính
      const updatedProduct = await prismaClient.product.update({
        where: { id: Number(id) },
        data: {
          status,
          name,
          sold,
          stock,
          description,
          price: Number(price),
          categoryId: Number(categoryId),
        },
      });

      // Xoá tất cả ảnh cũ nếu có ảnh mới được cung cấp
      if (images && Array.isArray(images)) {
        await prismaClient.productImages.deleteMany({
          where: { id: Number(id) },
        });

        if (images.length > 0) {
          await prismaClient.productImages.createMany({
            data: images.map((url: any) => ({
              productId: Number(id),
              url: url.url,
            })),
          });
        }
      }

      // Trả lại sản phẩm đã cập nhật cùng ảnh và danh mục
      const fullProduct = await prismaClient.product.findUnique({
        where: { id: Number(id) },
        include: {
          images: true,
          category: true,
        },
      });

      return fullProduct;
    });

    res.json({
      status: "success",
      data: result,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res
      .status(500)
      .json({ status: "error", message: "Failed to update product." });
  }
};

// DELETE product
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.product.delete({ where: { id: Number(id) } });
  res.status(204).send();
};
