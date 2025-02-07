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

// Get all users or a specific user
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { walletAddress } = req.query

    if (walletAddress) {
      const user = await prisma.user.findUnique({
        where: { walletAddress: walletAddress.toString() },
        include: { chats: true }
      })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      return res.status(200).json(user)
    }

    const users = await prisma.user.findMany({
      include: { chats: true }
    })
    return res.status(200).json(users)
  } catch (error: unknown) {
    return res.status(500).json({ error: 'Failed to fetch users' })
  }
}

// Create new user
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { walletAddress } = req.body

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' })
    }

    const user = await prisma.user.create({
      data: { walletAddress }
    })

    return res.status(201).json(user)
  } catch (error: unknown) {
    if (typeof error === 'object' && error && 'code' in error) {
      const prismaError = error as PrismaError;
      if (prismaError.code === 'P2002') {
        return res.status(400).json({ error: 'User with this wallet address already exists' })
      }
    }
    return res.status(500).json({ error: 'Failed to create user' })
  }
}

// Update user
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { walletAddress } = req.query
    const updateData = req.body

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' })
    }

    const user = await prisma.user.update({
      where: { walletAddress: walletAddress.toString() },
      data: updateData
    })

    return res.status(200).json(user)
  } catch (error: unknown) {
    if (typeof error === 'object' && error && 'code' in error) {
      const prismaError = error as PrismaError;
      if (prismaError.code === 'P2025') {
        return res.status(404).json({ error: 'User not found' })
      }
    }
    return res.status(500).json({ error: 'Failed to update user' })
  }
}

// Delete user
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { walletAddress } = req.query

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' })
    }

    await prisma.user.delete({
      where: { walletAddress: walletAddress.toString() }
    })

    return res.status(200).json({ message: 'User deleted successfully' })
  } catch (error: unknown) {
    if (typeof error === 'object' && error && 'code' in error) {
      const prismaError = error as PrismaError;
      if (prismaError.code === 'P2025') {
        return res.status(404).json({ error: 'User not found' })
      }
    }
    return res.status(500).json({ error: 'Failed to delete user' })
  }
} 