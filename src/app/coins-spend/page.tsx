import React from "react";
import { authOptions, CustomSession } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import {
  getCoinsSpend,
  getTransactions,
  getUserCoins,
} from "@/actions/fetchActions";
import DashNav from "@/components/dashboard/DashNav";
import Link from "next/link";

export default async function CoinsSpend() {
  const session: CustomSession | null = await getServerSession(authOptions);
  const userCoins = await getUserCoins(session?.user?.id!);
  const coinsSpends = await getCoinsSpend(session?.user?.id!);

  // Additional filtering logic to remove duplicates based on id, title, and URL
  const uniqueCoinsSpends = coinsSpends.filter((item, index, self) => {
    return (
      index ===
      self.findIndex(
        (t) =>
          t.summary_id === item.summary_id &&
          t.summary?.title === item.summary?.title &&
          t.summary?.url === item.summary?.url
      )
    );
  });

  return (
    <div className="container">
      <DashNav user={session?.user!} userCoins={userCoins} />
      <div className="text-center w-full">
        <h1 className="text-2xl font-bold mb-4">Coins Spend History</h1>

        <div className="flex justify-center items-center space-y-6 flex-col">
          {uniqueCoinsSpends &&
            uniqueCoinsSpends.length > 0 &&
            uniqueCoinsSpends.map((item, index) => (
              <div
                className="w-full text-left md:w-[500px] rounded-md p-4 border border-dashed"
                key={index}
              >
                <Link href={`/summarize?id=${item.summary_id}`}>
                  <h1 className="font-bold my-2">{item.summary?.title}</h1>
                </Link>

                <p className="my-2">
                  <strong>URL</strong> {item.summary.url}
                </p>
                <p>Created At :- {new Date(item.created_at).toDateString()}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
