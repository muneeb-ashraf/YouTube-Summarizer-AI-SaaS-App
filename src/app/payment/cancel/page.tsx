import { clearCache } from "@/actions/commonActions";
import prisma from "@/lib/db.config";
import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";

// Define searchParams as a Promise type
type SearchParams = Promise<{ txnId: string | undefined }>;

export default async function CancelTxn({
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
      status: 0,
    },
    where: {
      id: txnId,
    },
  });

  clearCache("transactions");

  return (
    <div className="h-screen flex justify-center items-center flex-col ">
      <Image src="/images/cancel.png" width={512} height={512} alt="cancel" />
      <h1 className="text-3xl font-bold text-red-400">
        Payment Canceled by the user
      </h1>
    </div>
  );
}
