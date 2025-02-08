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

// Get all markets or a specific market
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { marketId } = req.query

    if (marketId) {
      // Get specific market
      const market = await prisma.market.findUnique({
        where: { 
          marketId: BigInt(marketId.toString()) 
        },
        include: {
          chats: true
        }
      })

      if (!market) {
        return res.status(404).json({ error: 'Market not found' })
      }

      return res.status(200).json(market)
    }

    // Get all markets
    const markets = await prisma.market.findMany({
      include: {
        chats: true
      }
    })
    return res.status(200).json(markets)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch markets' })
  }
}

// Create new market
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { marketId, startTime, deadline, participationFee, name } = req.body

    // Validate required fields
    if (!marketId || !startTime || !deadline || !participationFee || !name) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const market = await prisma.market.create({
      data: {
        marketId: BigInt(marketId),
        startTime: BigInt(startTime),
        deadline: BigInt(deadline),
        participationFee: BigInt(participationFee),
        name
      }
    })

    return res.status(201).json(market)
  } catch (error: unknown) {
    if (typeof error === 'object' && error && 'code' in error) {
      const prismaError = error as PrismaError;
      if (prismaError.code === 'P2002') {
        return res.status(400).json({ error: 'Market with this ID already exists' })
      }
    }
    return res.status(500).json({ error: 'Failed to create market' })
  }
}

// Update market
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { marketId } = req.query
    const updateData = req.body

    if (!marketId) {
      return res.status(400).json({ error: 'Market ID is required' })
    }

    // Convert BigInt fields if they exist in updateData
    const processedData = {
      ...updateData,
      ...(updateData.startTime && { startTime: BigInt(updateData.startTime) }),
      ...(updateData.deadline && { deadline: BigInt(updateData.deadline) }),
      ...(updateData.participationFee && { participationFee: BigInt(updateData.participationFee) })
    }

    const market = await prisma.market.update({
      where: { 
        marketId: BigInt(marketId.toString()) 
      },
      data: processedData
    })

    return res.status(200).json(market)
  } catch (error: unknown) {
    if (typeof error === 'object' && error && 'code' in error) {
      const prismaError = error as PrismaError;
      if (prismaError.code === 'P2025') {
        return res.status(404).json({ error: 'Market not found' })
      }
    }
    return res.status(500).json({ error: 'Failed to update market' })
  }
}

// Delete market
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { marketId } = req.query

    if (!marketId) {
      return res.status(400).json({ error: 'Market ID is required' })
    }

    await prisma.market.delete({
      where: { 
        marketId: BigInt(marketId.toString()) 
      }
    })

    return res.status(200).json({ message: 'Market deleted successfully' })
  } catch (error: unknown) {
    if (typeof error === 'object' && error && 'code' in error) {
      const prismaError = error as PrismaError;
      if (prismaError.code === 'P2025') {
        return res.status(404).json({ error: 'Market not found' })
      }
    }
    return res.status(500).json({ error: 'Failed to delete market' })
  }
} 