#!/usr/bin/env tsx
/**
 * Script to reset a user's password
 * Usage: npx tsx scripts/reset-user-password.ts <email> <newPassword>
 */
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";

async function resetPassword() {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.error("Usage: npx tsx scripts/reset-user-password.ts <email> <newPassword>");
    process.exit(1);
  }

  const [email, newPassword] = args;
  
  console.log("Resetting password for:", email);
  
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.error("❌ User not found");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });
  
  console.log("✅ Password updated successfully");
  console.log("New password:", newPassword);
  
  // Verify it works
  const verify = await bcrypt.compare(newPassword, hashedPassword);
  console.log("Verification test:", verify ? "✅ PASSED" : "❌ FAILED");
  
  await prisma.$disconnect();
}

resetPassword().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
