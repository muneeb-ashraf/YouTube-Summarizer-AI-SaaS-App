import { summarySchema } from "@/validations/summaryValidation";
import vine, { errors } from "@vinejs/vine";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/db.config";
import { getUserCoins } from "@/actions/fetchActions";

interface Metadata {
  title: string;
  duration: string;
  author: string;
  views: string;
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: "UnAuthorized" }, { status: 401 });
  }
  try { 
    const body = await req.json();
    const validator = vine.compile(summarySchema);
    const payload = await validator.validate(body);

    const userCoins = await getUserCoins(payload.user_id);
    if (userCoins === null || (userCoins?.coins && userCoins.coins < 10)) {
      return NextResponse.json(
        { message: "You don't have sufficient coins for summary. Please add your coins." },
        { status: 400 }
      );
    } 

    let transcript = '';
    let metadata: Metadata = { title: '', duration: '', author: '', views: '' };

    try {
      const videoId = new URL(payload.url!).searchParams.get('v');
      const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
      const body = await response.text();

      const YT_INITIAL_PLAYER_RESPONSE_RE =
        /ytInitialPlayerResponse\s*=\s*({.+?})\s*;\s*(?:var\s+(?:meta|head)|<\/script|\n)/;
      const playerResponseMatch = body.match(YT_INITIAL_PLAYER_RESPONSE_RE);

      if (!playerResponseMatch) {
        throw new Error("Unable to parse playerResponse");
      }

      const player = JSON.parse(playerResponseMatch[1]);
      metadata = {
        title: player.videoDetails.title,
        duration: player.videoDetails.lengthSeconds,
        author: player.videoDetails.author,
        views: player.videoDetails.viewCount,
      };

      const tracks = player.captions.playerCaptionsTracklistRenderer.captionTracks;
      if (!tracks || tracks.length === 0) {
        throw new Error("No Transcript available for this video. Please try another video.");
      }

      tracks.sort((track1: { languageCode: string; kind: string }, track2: { languageCode: string; kind: string }) => {
        const langCode1 = track1.languageCode;
        const langCode2 = track2.languageCode;
        if (langCode1 === 'en' && langCode2 !== 'en') return -1;
        if (langCode1 !== 'en' && langCode2 === 'en') return 1;
        if (track1.kind !== 'asr' && track2.kind === 'asr') return -1;
        if (track1.kind === 'asr' && track2.kind !== 'asr') return 1;
        return 0;
      });

      const transcriptResponse = await fetch(`${tracks[0].baseUrl}&fmt=json3`);
      const transcriptData = await transcriptResponse.json();

      transcript = transcriptData.events
      .filter((x: { segs?: { utf8: string }[] }) => x.segs)
      .map((x: { segs: { utf8: string }[] }) =>
        x.segs.map((y: { utf8: string }) => y.utf8).join(' ')
      )
      .join(' ')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\s+/g, ' ');

    } catch (error) {
      return NextResponse.json(
        { message: "No Transcript available for this video. Please try another video" },
        { status: 404 }
      );
    }

    const chat = await prisma.summary.create({
      data: {
        ...payload,
        user_id: Number(payload.user_id),
        title: metadata.title ?? "No Title found!",
        
      },
    });

    return NextResponse.json({
      message: "Url Added Successfully!",
      data: chat,
    });

  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return NextResponse.json(
        { message: "Please check validation errors", errors: error.messages },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { message: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}
