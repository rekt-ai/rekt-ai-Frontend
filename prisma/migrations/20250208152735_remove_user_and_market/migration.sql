/*
  Warnings:

  - You are about to drop the column `marketId` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the `Market` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `timestamp` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userAddress` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_marketId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_userId_fkey";

-- DropIndex
DROP INDEX "Chat_marketId_idx";

-- DropIndex
DROP INDEX "Chat_userId_idx";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "marketId",
DROP COLUMN "userId",
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "timestamp" BIGINT NOT NULL,
ADD COLUMN     "userAddress" TEXT NOT NULL;

-- DropTable
DROP TABLE "Market";

-- DropTable
DROP TABLE "User";
