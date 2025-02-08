import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

interface PrismaError {
  code?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      if (req.query.userAddress) {
        return handleGetByWalletAddress(req, res);
      }
      return handleGet(req, res);
    case "POST":
      return handlePost(req, res);
    case "PUT":
      return handlePut(req, res);
    case "DELETE":
      return handleDelete(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Get all chats or a specific chat
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, limit, offset } = req.query;

    if (id) {
      // Get specific chat
      const chat = await prisma.chat.findUnique({
        where: { id: String(id) },
      });

      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      return res.status(200).json(chat);
    }

    // Parse pagination parameters
    const take = limit ? parseInt(limit.toString()) : 50;
    const skip = offset ? parseInt(offset.toString()) : 0;

    // Get paginated chats
    const chats = await prisma.chat.findMany({
      orderBy: {
        timestamp: 'desc'  // Most recent chats first
      },
      take,
      skip,
    });

    // Get total count for pagination
    const total = await prisma.chat.count();

    return res.status(200).json({
      chats,
      pagination: {
        total,
        limit: take,
        offset: skip,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch chats" });
  }
}

// Create new chat
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { chatData, imageUrl, timestamp, userAddress } = req.body;

    // Validate required fields
    if (!chatData || !timestamp || !userAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const chat = await prisma.chat.create({
      data: {
        chatData,
        imageUrl,
        timestamp: BigInt(timestamp),
        userAddress,
      },
    });

    return res.status(201).json(chat);
  } catch (error: unknown) {
    if (typeof error === "object" && error && "code" in error) {
      const prismaError = error as PrismaError;
      if (prismaError.code === "P2002") {
        return res
          .status(400)
          .json({ error: "Chat with this ID already exists" });
      }
    }
    return res.status(500).json({ error: "Failed to create chat" });
  }
}

// Update chat
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { chatData, imageUrl, timestamp, userAddress } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Chat ID is required" });
    }

    const processedData = {
      ...(chatData && { chatData }),
      ...(imageUrl && { imageUrl }),
      ...(timestamp && { timestamp: BigInt(timestamp) }),
      ...(userAddress && { userAddress }),
    };

    const chat = await prisma.chat.update({
      where: { id: String(id) },
      data: processedData,
    });

    return res.status(200).json(chat);
  } catch (error: unknown) {
    if (typeof error === "object" && error && "code" in error) {
      const prismaError = error as PrismaError;
      if (prismaError.code === "P2025") {
        return res.status(404).json({ error: "Chat not found" });
      }
    }
    return res.status(500).json({ error: "Failed to update chat" });
  }
}

// Delete chat
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Chat ID is required" });
    }

    await prisma.chat.delete({
      where: { id: String(id) },
    });

    return res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error: unknown) {
    if (typeof error === "object" && error && "code" in error) {
      const prismaError = error as PrismaError;
      if (prismaError.code === "P2025") {
        return res.status(404).json({ error: "Chat not found" });
      }
    }
    return res.status(500).json({ error: "Failed to delete chat" });
  }
}

// New function to get chats by wallet address
async function handleGetByWalletAddress(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userAddress, limit, offset } = req.query;
    
    if (!userAddress) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    // Parse pagination parameters
    const take = limit ? parseInt(limit.toString()) : 50;
    const skip = offset ? parseInt(offset.toString()) : 0;

    const chats = await prisma.chat.findMany({
      where: {
        userAddress: userAddress.toString(),
      },
      orderBy: {
        timestamp: 'desc'  // Most recent chats first
      },
      take,
      skip,
    });

    // Get total count for pagination
    const total = await prisma.chat.count({
      where: {
        userAddress: userAddress.toString(),
      },
    });

    return res.status(200).json({
      chats,
      pagination: {
        total,
        limit: take,
        offset: skip,
      },
    });
  } catch (error) {
    console.error('Error fetching chats by wallet address:', error);
    return res.status(500).json({ error: "Failed to fetch chats" });
  }
}
