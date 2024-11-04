import { NextRequest, NextResponse } from "next/server";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { loadSummarizationChain } from "langchain/chains";
import { TokenTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import { PromptTemplate } from "@langchain/core/prompts";
import { summaryTemplate } from "@/lib/prompts";
import { llm } from "@/lib/langchain";
import { getServerSession } from "next-auth";
import { authOptions, CustomSession } from "../auth/[...nextauth]/options";
import { getUserCoins } from "@/actions/fetchActions";
import { coinsSpend, minusCoins, updateSummary } from "@/actions/commonActions";
import prisma from "@/lib/db.config";

interface SummarizePayload {
  url: string;
  id: string;
}

export async function POST(req: NextRequest) {
  try {
    const session: CustomSession | null = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "UnAuthorized" }, { status: 401 });
    }
    const body: SummarizePayload = await req.json();

    // * Check if user has sufficient coins
    const userCoins = await getUserCoins(session?.user?.id!);
    if (userCoins === null || (userCoins?.coins && userCoins.coins < 10)) {
      return NextResponse.json(
        {
          message:
            "You don't have sufficient coins for summary. Please add your coins.",
        },
        { status: 400 }
      );
    }

    // * Check if there is already a summary available for the URL
    const existingSummary = await prisma.summary.findFirst({
      select: {
        response: true,
      },
      where: {
        url: body.url,
      },
    });

    if (existingSummary != null && existingSummary.response) {
      // * Check if coins have already been deducted for this summary
      const existingCoinSpend = await prisma.coinSpend.findFirst({
        where: {
          user_id: Number(session?.user?.id),
          summary_id: body.id,
        },
      });

      if (!existingCoinSpend) {
        // Deduct coins and record spend only if not previously deducted
        await minusCoins(session?.user?.id!, body?.id!);
        await coinsSpend(session?.user?.id!, body?.id!);
      } else {
        console.log("Duplicate request detected. Skipping coin decrement.");
      }

      return NextResponse.json({
        message: "Podcast video Summary",
        data: existingSummary.response,
      });
    }

    // * Extract video transcript
    let text: Document<Record<string, any>>[];
    try {
      const loader = YoutubeLoader.createFromUrl(body.url!, {
        language: "en",
        addVideoInfo: true,
      });
      text = await loader.load();
    } catch (error) {
      return NextResponse.json(
        {
          message:
            "No Transcript available for this video. Please try another video.",
        },
        { status: 404 }
      );
    }

    const splitter = new TokenTextSplitter({
      chunkSize: 15000,
      chunkOverlap: 250,
    });
    const docsSummary = await splitter.splitDocuments(text);
    const summaryPrompt = PromptTemplate.fromTemplate(summaryTemplate);
    const summaryChain = loadSummarizationChain(llm, {
      type: "map_reduce",
      verbose: true,
      combinePrompt: summaryPrompt,
    });
    const res = await summaryChain.invoke({ input_documents: docsSummary });

    // Deduct coins and record spend if not previously deducted
    const existingCoinSpend = await prisma.coinSpend.findFirst({
      where: {
        user_id: Number(session?.user?.id),
        summary_id: body.id,
      },
    });

    if (!existingCoinSpend) {
      await minusCoins(session?.user?.id!, body?.id!);
      await coinsSpend(session?.user?.id!, body?.id!);
    } else {
      console.log("Duplicate request detected. Skipping coin decrement.");
    }

    // Update or create the summary in the database
    await updateSummary(body?.id!, res?.text);

    return NextResponse.json({
      message: "Podcast video Summary",
      data: res?.text,
    });
  } catch (error) {
    console.log("The error is", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}
