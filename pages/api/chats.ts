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
      const chat = await prisma.chat.findUnique({
        where: { id: String(id) },
      });

      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      // Convert BigInt to string before sending response
      return res.status(200).json({
        ...chat,
        timestamp: chat.timestamp.toString(),
      });
    }

    // Parse pagination parameters with better error handling
    let take = 50;
    let skip = 0;

    try {
      if (limit) take = parseInt(limit.toString());
      if (offset) skip = parseInt(offset.toString());
    } catch (parseError) {
      console.error("Pagination parameter parsing error:", parseError);
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    // Get paginated chats
    const chats = await prisma.chat.findMany({
      orderBy: {
        timestamp: "desc",
      },
      take,
      skip,
    });

    const total = await prisma.chat.count();

    // Convert BigInt to string for each chat
    const serializedChats = chats.map((chat) => ({
      ...chat,
      timestamp: chat.timestamp.toString(),
    }));

    return res.status(200).json({
      chats: serializedChats,
      pagination: {
        total,
        limit: take,
        offset: skip,
      },
    });
  } catch (error: unknown) {
    console.error("Error in handleGet:", error);
    return res.status(500).json({
      error: "Failed to fetch chats",
      details: error instanceof Error ? error.message : undefined,
    });
  }
}

// Create new chat
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { chatData, imageUrl, timestamp, userAddress } = req.body;

    // Validate required fields
    if (!chatData || !timestamp || !userAddress) {
      return res.status(400).json({
        error: "Missing required fields",
        missing: {
          chatData: !chatData,
          timestamp: !timestamp,
          userAddress: !userAddress,
        },
      });
    }

    // Ensure chatData is in the correct format
    const processedChatData =
      typeof chatData === "object" ? JSON.stringify(chatData) : chatData;

    const newChat = {
      chatData: processedChatData,
      imageUrl,
      timestamp: BigInt(timestamp),
      userAddress,
    };

    const chat = await prisma.chat.create({
      data: newChat,
    });

    // Convert BigInt to string in the response
    return res.status(201).json({
      ...chat,
      timestamp: chat.timestamp.toString(),
    });
  } catch (error: unknown) {
    // Detailed error logging
    console.error("Detailed error in handlePost:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (typeof error === "object" && error && "code" in error) {
      const prismaError = error as PrismaError;
      if (prismaError.code === "P2002") {
        return res
          .status(400)
          .json({ error: "Chat with this ID already exists" });
      }
    }

    // Return more detailed error information
    return res.status(500).json({
      error: "Failed to create chat",
      details: error instanceof Error ? error.message : "Unknown error",
      type: error instanceof Error ? error.name : typeof error,
    });
  }
}

// Update chat
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { chatData, imageUrl, timestamp, userAddress } = req.body;

    // Debug log incoming data
    console.log("Update request:", {
      id,
      chatData,
      imageUrl,
      timestamp,
      userAddress,
    });

    if (!id) {
      return res.status(400).json({ error: "Chat ID is required" });
    }

    // Process chatData if it exists
    const processedChatData =
      chatData && typeof chatData === "object"
        ? JSON.stringify(chatData)
        : chatData;

    const processedData = {
      ...(processedChatData !== undefined && { chatData: processedChatData }),
      ...(imageUrl && { imageUrl }),
      ...(timestamp && { timestamp: BigInt(timestamp) }),
      ...(userAddress && { userAddress }),
    };

    // Debug log processed data
    console.log("Processed update data:", processedData);

    const chat = await prisma.chat.update({
      where: { id: String(id) },
      data: processedData,
    });

    // Convert BigInt to string in the response
    return res.status(200).json({
      ...chat,
      timestamp: chat.timestamp.toString(),
    });
  } catch (error: unknown) {
    // Detailed error logging
    console.error("Error in handlePut:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (typeof error === "object" && error && "code" in error) {
      const prismaError = error as PrismaError;
      if (prismaError.code === "P2025") {
        return res.status(404).json({ error: "Chat not found" });
      }
    }

    return res.status(500).json({
      error: "Failed to update chat",
      details: error instanceof Error ? error.message : "Unknown error",
      type: error instanceof Error ? error.name : typeof error,
    });
  }
}

// Delete chat
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  try {
    // Debug log
    console.log("Delete request for chat ID:", id);
    
    if (!id) {
      return res.status(400).json({
        error: "Chat ID is required",
        details: "No ID provided in query parameters",
      });
    }

    // Verify the chat exists before deleting
    const existingChat = await prisma.chat.findUnique({
      where: { id: String(id) },
    });

    if (!existingChat) {
      return res.status(404).json({
        error: "Chat not found",
        details: `No chat found with ID: ${id}`,
      });
    }

    await prisma.chat.delete({
      where: { id: String(id) },
    });

    return res.status(200).json({
      message: "Chat deleted successfully",
      deletedChatId: id,
    });
  } catch (error: unknown) {
    // Detailed error logging
    console.error("Error in handleDelete:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (typeof error === "object" && error && "code" in error) {
      const prismaError = error as PrismaError;
      if (prismaError.code === "P2025") {
        return res.status(404).json({
          error: "Chat not found",
          details: `Unable to delete chat with ID: ${id}`,
        });
      }
    }

    return res.status(500).json({
      error: "Failed to delete chat",
      details: error instanceof Error ? error.message : "Unknown error",
      type: error instanceof Error ? error.name : typeof error,
    });
  }
}

// New function to get chats by wallet address
async function handleGetByWalletAddress(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { userAddress, limit, offset } = req.query;

    if (!userAddress) {
      return res.status(400).json({
        error: "Wallet address is required",
        details: "userAddress parameter is missing",
      });
    }

    // Parse pagination parameters with error handling
    let take = 50;
    let skip = 0;

    try {
      if (limit) take = parseInt(limit.toString());
      if (offset) skip = parseInt(offset.toString());

      // Validate pagination parameters
      if (take < 0 || skip < 0) {
        throw new Error("Pagination parameters must be positive numbers");
      }
    } catch (parseError) {
      return res.status(400).json({
        error: "Invalid pagination parameters",
        details:
          parseError instanceof Error
            ? parseError.message
            : "Invalid number format",
      });
    }

    const chats = await prisma.chat.findMany({
      where: {
        userAddress: userAddress.toString(),
      },
      orderBy: {
        timestamp: "desc", // Most recent chats first
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

    // Convert BigInt timestamps to strings
    const serializedChats = chats.map((chat) => ({
      ...chat,
      timestamp: chat.timestamp.toString(),
      chatData:
        typeof chat.chatData === "string"
          ? JSON.parse(chat.chatData)
          : chat.chatData,
    }));

    return res.status(200).json({
      chats: serializedChats,
      pagination: {
        total,
        limit: take,
        offset: skip,
        hasMore: skip + take < total,
      },
      userAddress,
    });
  } catch (error: unknown) {
    console.error("Error fetching chats by wallet address:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return res.status(500).json({
      error: "Failed to fetch chats",
      details: error instanceof Error ? error.message : "Unknown error",
      type: error instanceof Error ? error.name : typeof error,
    });
  }
}
