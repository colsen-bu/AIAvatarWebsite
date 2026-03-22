import { NextRequest, NextResponse } from "next/server";
import { getLobby, getWikiUrl, normalizeLobbyCode, publishRoles } from "@/lib/botcLobbyStore";

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

  const hostKey = req.headers.get("x-host-key");
  if (!hostKey || hostKey !== lobby.hostKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const appBaseUrl = typeof body?.appBaseUrl === "string" && body.appBaseUrl
    ? body.appBaseUrl
    : "";

  const releasedPlayers = publishRoles(lobby);
  const links = releasedPlayers.map((player) => ({
    playerId: player.id,
    name: player.name,
    role: player.role,
    wikiUrl: player.role ? getWikiUrl(player.role) : null,
    personalLink: `${appBaseUrl}?lobby=${encodeURIComponent(lobby.code)}&player=${encodeURIComponent(player.id)}`
  }));

  return NextResponse.json({
    lobbyCode: lobby.code,
    releasedCount: releasedPlayers.length,
    links
  });
}
