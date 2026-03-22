import { NextRequest, NextResponse } from "next/server";
import { getLobby, getWikiUrl, normalizeLobbyCode } from "@/lib/botcLobbyStore";

interface Params {
  params: Promise<{ lobbyCode: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  const { lobbyCode } = await params;
  const code = normalizeLobbyCode(lobbyCode);
  const lobby = getLobby(code);

  if (!lobby) {
    return NextResponse.json({ error: "Lobby not found" }, { status: 404 });
  }

  const hostKey = req.headers.get("x-host-key");
  if (hostKey && hostKey === lobby.hostKey) {
    return NextResponse.json({
      lobbyCode: lobby.code,
      edition: lobby.edition,
      createdAt: lobby.createdAt,
      players: lobby.players.map((player) => ({
        id: player.id,
        name: player.name,
        role: player.role,
        roleReleased: player.roleReleased,
        wikiUrl: player.role ? getWikiUrl(player.role) : null
      }))
    });
  }

  const playerId = req.nextUrl.searchParams.get("playerId");
  if (playerId) {
    const player = lobby.players.find((entry) => entry.id === playerId);
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json({
      lobbyCode: lobby.code,
      player: {
        id: player.id,
        name: player.name,
        roleReleased: player.roleReleased,
        role: player.roleReleased ? player.role : null,
        wikiUrl: player.roleReleased && player.role ? getWikiUrl(player.role) : null
      }
    });
  }

  return NextResponse.json({
    lobbyCode: lobby.code,
    edition: lobby.edition,
    playerCount: lobby.players.length
  });
}
