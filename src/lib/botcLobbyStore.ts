export interface BotcLobbyPlayer {
  id: string;
  name: string;
  role: string | null;
  roleReleased: boolean;
  joinedAt: number;
}

export interface BotcLobby {
  code: string;
  hostKey: string;
  edition: string;
  createdAt: number;
  players: BotcLobbyPlayer[];
}

type BotcLobbyStore = Map<string, BotcLobby>;

const LOBBY_TTL_MS = 1000 * 60 * 60 * 12;
const LOBBY_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function getGlobalStore(): BotcLobbyStore {
  const globalRef = globalThis as typeof globalThis & { __botcLobbyStore?: BotcLobbyStore };
  if (!globalRef.__botcLobbyStore) {
    globalRef.__botcLobbyStore = new Map<string, BotcLobby>();
  }
  return globalRef.__botcLobbyStore;
}

function cleanupExpiredLobbies(): void {
  const store = getGlobalStore();
  const now = Date.now();
  for (const [code, lobby] of store.entries()) {
    if (now - lobby.createdAt > LOBBY_TTL_MS) {
      store.delete(code);
    }
  }
}

function randomFromAlphabet(length: number): string {
  let output = "";
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * LOBBY_CODE_ALPHABET.length);
    output += LOBBY_CODE_ALPHABET[index];
  }
  return output;
}

export function createLobby(edition: string): BotcLobby {
  cleanupExpiredLobbies();

  const store = getGlobalStore();
  let code = "";

  for (let i = 0; i < 10; i += 1) {
    const candidate = randomFromAlphabet(6);
    if (!store.has(candidate)) {
      code = candidate;
      break;
    }
  }

  if (!code) {
    throw new Error("Unable to create unique lobby code");
  }

  const hostKey = crypto.randomUUID();
  const lobby: BotcLobby = {
    code,
    hostKey,
    edition,
    createdAt: Date.now(),
    players: []
  };

  store.set(code, lobby);
  return lobby;
}

export function getLobby(code: string): BotcLobby | undefined {
  cleanupExpiredLobbies();
  return getGlobalStore().get(code);
}

export function normalizeLobbyCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function normalizePlayerName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, 40);
}

export function addPlayer(lobby: BotcLobby, name: string): BotcLobbyPlayer {
  const normalized = normalizePlayerName(name);
  if (!normalized) {
    throw new Error("Player name is required");
  }

  if (lobby.players.some((player) => player.name.toLowerCase() === normalized.toLowerCase())) {
    throw new Error("That player name is already in the lobby");
  }

  const player: BotcLobbyPlayer = {
    id: crypto.randomUUID(),
    name: normalized,
    role: null,
    roleReleased: false,
    joinedAt: Date.now()
  };

  lobby.players.push(player);
  return player;
}

export function setPlayerRole(lobby: BotcLobby, playerId: string, role: string): BotcLobbyPlayer {
  const player = lobby.players.find((entry) => entry.id === playerId);
  if (!player) {
    throw new Error("Player not found");
  }

  const normalizedRole = role.trim();
  if (!normalizedRole) {
    throw new Error("Role is required");
  }

  player.role = normalizedRole;
  player.roleReleased = false;
  return player;
}

export function publishRoles(lobby: BotcLobby): BotcLobbyPlayer[] {
  const released: BotcLobbyPlayer[] = [];

  for (const player of lobby.players) {
    if (!player.role) {
      continue;
    }

    player.roleReleased = true;
    released.push(player);
  }

  return released;
}

export function getWikiUrl(role: string): string {
  return `https://wiki.bloodontheclocktower.com/${encodeURIComponent(role.replace(/\s+/g, "_"))}`;
}
