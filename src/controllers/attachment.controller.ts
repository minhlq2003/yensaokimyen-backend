import { Request, Response } from "express";
import prisma from "../prisma/client";
import { uploadFile } from "../utils/uploadUtils";

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const image = req.file;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!image) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Upload the file to S3 and get the URL
    const imageUrl = await uploadFile(image);

    // Save attachment information to the database
    const attachment = await prisma.attachment.create({
      data: {
        userId: userId,
        fileName: image.originalname,
        fileUrl: imageUrl,
      },
    });

    // Update user's avatar if needed
    await prisma.users.update({
      where: { id: userId },
      data: { avatar: imageUrl },
    });
    res.status(200).json({
      ok: 1,
      message: "File uploaded successfully",
      attachment: {
        id: attachment.id,
        fileName: attachment.fileName,
        fileUrl: attachment.fileUrl,
        userId: attachment.userId,
      },
    });
  } catch (error: any) {
    console.error("Upload image error:", error);
    res
      .status(400)
      .json({ ok: 0, message: `Error uploading image: ${error.message}` });
  }
};

export const getAllAttachments = async (req: Request, res: Response) => {
  try {
    // Get query parameters for pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    const totalCount = await prisma.attachment.count();

    const attachments = await prisma.attachment.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: attachments,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get all attachments error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving attachments",
      error: (error as Error).message,
    });
  }
};
