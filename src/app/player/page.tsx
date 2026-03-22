"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

interface PlayerStatus {
  id: string;
  name: string;
  roleReleased: boolean;
  role: string | null;
  wikiUrl: string | null;
}

export default function PlayerPage() {
  const searchParams = useSearchParams();

  const initialLobby = useMemo(
    () => (searchParams.get("lobby") || "").trim().toUpperCase(),
    [searchParams]
  );
  const initialPlayer = useMemo(
    () => (searchParams.get("player") || "").trim(),
    [searchParams]
  );

  const [lobbyCode, setLobbyCode] = useState(initialLobby);
  const [playerId, setPlayerId] = useState(initialPlayer);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<PlayerStatus | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (lobbyCode) {
      params.set("lobby", lobbyCode);
    } else {
      params.delete("lobby");
    }

    if (playerId) {
      params.set("player", playerId);
    } else {
      params.delete("player");
    }

    const query = params.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ""}`;
    window.history.replaceState({}, "", url);
  }, [lobbyCode, playerId]);

  useEffect(() => {
    if (!lobbyCode || !playerId) {
      return;
    }

    let canceled = false;

    const fetchStatus = async () => {
      try {
        const response = await fetch(
          `/api/botc/lobbies/${encodeURIComponent(lobbyCode)}?playerId=${encodeURIComponent(playerId)}`
        );
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.error || "Could not load your player status.");
        }

        if (!canceled) {
          setStatus(data.player);
          setMessage("");
        }
      } catch (error) {
        if (!canceled) {
          const nextMessage = error instanceof Error ? error.message : "Could not load your player status.";
          setMessage(nextMessage);
        }
      }
    };

    fetchStatus();
    const timer = window.setInterval(fetchStatus, 4000);

    return () => {
      canceled = true;
      window.clearInterval(timer);
    };
  }, [lobbyCode, playerId]);

  const canJoin = Boolean(lobbyCode) && !playerId;

  const joinLobby = async () => {
    if (!lobbyCode) {
      setMessage("Enter your lobby code first.");
      return;
    }

    if (!name.trim()) {
      setMessage("Enter your name first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/botc/lobbies/${encodeURIComponent(lobbyCode)}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Unable to join lobby.");
      }

      setPlayerId(data.player.id);
      setStatus({
        id: data.player.id,
        name: data.player.name,
        roleReleased: false,
        role: null,
        wikiUrl: null
      });
      setName("");
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Unable to join lobby.";
      setMessage(nextMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-4 py-10">
      <div className="mx-auto max-w-xl rounded-xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-2xl">
        <h1 className="text-2xl font-semibold tracking-wide">Blood on the Clocktower</h1>
        <p className="mt-1 text-sm text-neutral-400">Player Lobby</p>

        {!lobbyCode && (
          <div className="mt-6 space-y-3">
            <label className="block text-sm text-neutral-300">Lobby Code</label>
            <input
              type="text"
              value={lobbyCode}
              onChange={(event) => setLobbyCode(event.target.value.toUpperCase().trim())}
              placeholder="Enter lobby code"
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
          </div>
        )}

        {canJoin && (
          <div className="mt-6 space-y-3">
            <div className="text-sm text-neutral-300">
              Lobby: <span className="font-semibold text-white">{lobbyCode}</span>
            </div>
            <label className="block text-sm text-neutral-300">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
            <button
              onClick={joinLobby}
              disabled={loading}
              className="rounded-md border border-white bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Joining..." : "Join Lobby"}
            </button>
          </div>
        )}

        {status && (
          <div className="mt-6 rounded-md border border-neutral-700 bg-neutral-950 p-4">
            <p className="text-sm text-neutral-300">
              Welcome, <span className="font-semibold text-white">{status.name}</span>
            </p>
            {!status.roleReleased && (
              <p className="mt-3 text-sm text-neutral-400">
                Waiting for the Storyteller to assign and release your role.
              </p>
            )}

            {status.roleReleased && status.role && (
              <>
                <p className="mt-3 text-sm text-neutral-300">
                  Your role: <span className="font-semibold text-white">{status.role}</span>
                </p>
                {status.wikiUrl && (
                  <a
                    href={status.wikiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-100 transition hover:bg-neutral-800"
                  >
                    Open Role Wiki
                  </a>
                )}
              </>
            )}
          </div>
        )}

        {message && <p className="mt-4 text-sm text-red-300">{message}</p>}
      </div>
    </main>
  );
}
