/*
  Warnings:

  - A unique constraint covering the columns `[user_id,summary_id]` on the table `coin_spend` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "coin_spend_user_id_summary_id_key" ON "coin_spend"("user_id", "summary_id");
