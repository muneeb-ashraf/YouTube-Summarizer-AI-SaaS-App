import { addCoins, clearCache } from "@/actions/commonActions";
import prisma from "@/lib/db.config";
import { getCoinsFromAmount } from "@/lib/utils";
import { notFound } from "next/navigation";
import React from "react";
import Image from "next/image";

// Define searchParams as a Promise type
type SearchParams = Promise<{ txnId: string | undefined }>;

export default async function SuccessTxn({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const txnId = params["txnId"];

  if (!txnId) return notFound(); // Handle case if txnId is undefined

  const transaction = await prisma.transactions.findUnique({
    where: {
      status: 2,
      id: txnId,
    },
  });

  console.log("The transaction is", transaction);

  if (!transaction) {
    return notFound();
  }

  await prisma.transactions.update({
    data: {
      status: 1,
    },
    where: {
      id: txnId,
    },
  });

  await addCoins(transaction.user_id, getCoinsFromAmount(transaction.amount));
  clearCache("userCoins");
  clearCache("transactions");

  return (
    <div className="h-screen flex justify-center items-center flex-col ">
      <Image src="/images/check.png" width={512} height={512} alt="success" />
      <h1 className="text-3xl font-bold text-green-400">
        Payment Processed successfully!
      </h1>
    </div>
  );
}
