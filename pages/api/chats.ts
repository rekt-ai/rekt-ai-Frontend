import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

interface PrismaError {
  code?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res)
    case 'POST':
      return handlePost(req, res)
    case 'PUT':
      return handlePut(req, res)
    case 'DELETE':
      return handleDelete(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

// Get all chats or specific chat(s)
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, userWalletAddress, marketId } = req.query

    if (id) {
      const chat = await prisma.chat.findUnique({
        where: { id: id.toString() },
        include: {
          user: true,
          market: true
        }
      })

      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' })
      }

      return res.status(200).json(chat)
    }

    // Get chats by user wallet or market ID
    const where = {
      ...(userWalletAddress && {
        user: { walletAddress: userWalletAddress.toString() }
      }),
      ...(marketId && {
        market: { marketId: BigInt(marketId.toString()) }
      })
    }

    const chats = await prisma.chat.findMany({
      where,
      include: {
        user: true,
        market: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return res.status(200).json(chats)
  } catch (error: unknown) {
    return res.status(500).json({ error: 'Failed to fetch chats' })
  }
}

// Create new chat
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { chatData, userWalletAddress, marketId } = req.body

    if (!chatData || !userWalletAddress || !marketId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Find or create user
    const user = await prisma.user.upsert({
      where: { walletAddress: userWalletAddress },
      update: {},
      create: { walletAddress: userWalletAddress }
    })

    // Find market
    const market = await prisma.market.findUnique({
      where: { marketId: BigInt(marketId) }
    })

    if (!market) {
      return res.status(404).json({ error: 'Market not found' })
    }

    const chat = await prisma.chat.create({
      data: {
        chatData,
        userId: user.id,
        marketId: market.id
      },
      include: {
        user: true,
        market: true
      }
    })

    return res.status(201).json(chat)
  } catch (error: unknown) {
    return res.status(500).json({ error: 'Failed to create chat' })
  }
}

// Update chat
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query
    const { chatData } = req.body

    if (!id) {
      return res.status(400).json({ error: 'Chat ID is required' })
    }

    if (!chatData) {
      return res.status(400).json({ error: 'Chat data is required' })
    }

    const chat = await prisma.chat.update({
      where: { id: id.toString() },
      data: { chatData },
      include: {
        user: true,
        market: true
      }
    })

    return res.status(200).json(chat)
  } catch (error: unknown) {
    if (typeof error === 'object' && error && 'code' in error) {
      const prismaError = error as PrismaError;
      if (prismaError.code === 'P2025') {
        return res.status(404).json({ error: 'Chat not found' })
      }
    }
    return res.status(500).json({ error: 'Failed to update chat' })
  }
}

// Delete chat
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ error: 'Chat ID is required' })
    }

    await prisma.chat.delete({
      where: { id: id.toString() }
    })

    return res.status(200).json({ message: 'Chat deleted successfully' })
  } catch (error: unknown) {
    if (typeof error === 'object' && error && 'code' in error) {
      const prismaError = error as PrismaError;
      if (prismaError.code === 'P2025') {
        return res.status(404).json({ error: 'Chat not found' })
      }
    }
    return res.status(500).json({ error: 'Failed to delete chat' })
  }
} 