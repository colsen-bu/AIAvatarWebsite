import { NextRequest, NextResponse } from "next/server";
import { addPlayer, getLobby, normalizeLobbyCode } from "@/lib/botcLobbyStore";

interface Params {
  params: Promise<{ lobbyCode: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  const { lobbyCode } = await params;
  const code = normalizeLobbyCode(lobbyCode);
  const lobby = getLobby(code);

  if (!lobby) {
    return NextResponse.json({ error: "Lobby not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name : "";
    const player = addPlayer(lobby, name);

    return NextResponse.json({
      lobbyCode: lobby.code,
      player: {
        id: player.id,
        name: player.name
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to join lobby";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
