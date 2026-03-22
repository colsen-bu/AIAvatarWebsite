import { NextRequest, NextResponse } from "next/server";
import { getLobby, normalizeLobbyCode, setPlayerRole } from "@/lib/botcLobbyStore";

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

  try {
    const body = await req.json();
    const playerId = typeof body?.playerId === "string" ? body.playerId : "";
    const role = typeof body?.role === "string" ? body.role : "";
    const player = setPlayerRole(lobby, playerId, role);

    return NextResponse.json({
      player: {
        id: player.id,
        name: player.name,
        role: player.role,
        roleReleased: player.roleReleased
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to assign role";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
