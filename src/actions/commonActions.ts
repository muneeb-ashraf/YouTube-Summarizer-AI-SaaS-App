"use server";
import prisma from "@/lib/db.config";
import { revalidateTag, unstable_cache } from "next/cache";

export async function updateSummary(id: string, data: string): Promise<void> {
  await prisma.summary.update({
    data: {
      response: data,
    },
    where: {
      id: id,
    },
  });
}

export async function minusCoins(user_id: string | number, summaryId: string): Promise<void> {
  // Check if an entry with the same user_id and summaryId already exists in coinSpend
  const existingEntry = await prisma.coinSpend.findFirst({
    where: {
      user_id: Number(user_id),
      summary_id: summaryId,
    },
  });

  // If no existing entry, proceed with coin decrement
  if (!existingEntry) {
    await prisma.user.update({
      where: {
        id: Number(user_id),
      },
      data: {
        coins: {
          decrement: 5,
        },
      },
    });
    console.log("Coins decremented by 10.");
  } else {
    console.log("Duplicate entry detected. Skipping coin decrement.");
  }
}

export async function addCoins(
  user_id: string | number,
  coins: number
): Promise<void> {
  await prisma.user.update({
    where: {
      id: Number(user_id),
    },
    data: {
      coins: {
        increment: coins,
      },
    },
  });
}

export async function coinsSpend(
  user_id: string | number,
  summaryId: string
): Promise<void> {
  // Check if an entry with the same user_id and summaryId already exists in coinSpend
  const existingEntry = await prisma.coinSpend.findFirst({
    where: {
      user_id: Number(user_id),
      summary_id: summaryId,
    },
  });

  // If no existing entry is found, create a new entry
  if (!existingEntry) {
    await prisma.coinSpend.create({
      data: {
        user_id: Number(user_id),
        summary_id: summaryId,
      },
    });
    console.log("Coin spend entry created.");
  } else {
    console.log("Duplicate entry detected. Skipping database insert.");
  }
}

export const clearCache = async (key: string) => {
  revalidateTag(key);
};
