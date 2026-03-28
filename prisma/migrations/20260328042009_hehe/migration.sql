-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "paymentVerifiedBy" TEXT;

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "heroImage" TEXT,
ADD COLUMN     "paymentQrCode" TEXT;

-- CreateTable
CREATE TABLE "NonServiceableArea" (
    "id" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NonServiceableArea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NonServiceableArea_pincode_key" ON "NonServiceableArea"("pincode");
