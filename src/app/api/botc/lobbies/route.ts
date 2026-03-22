import { NextRequest, NextResponse } from "next/server";
import { createLobby } from "@/lib/botcLobbyStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const edition = typeof body?.edition === "string" && body.edition ? body.edition : "TB";

    const lobby = createLobby(edition);

    return NextResponse.json({
      lobbyCode: lobby.code,
      hostKey: lobby.hostKey,
      edition: lobby.edition,
      createdAt: lobby.createdAt
    });
  } catch (error) {
    console.error("Failed to create BOTC lobby", error);
    return NextResponse.json({ error: "Failed to create lobby" }, { status: 500 });
  }
}
