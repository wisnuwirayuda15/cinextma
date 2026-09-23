import { syncHistory } from "@/actions/histories";
import { ContentType } from "@/types";
import { diff } from "@/utils/helpers";
import { useDocumentVisibility } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import useSupabaseUser from "./useSupabaseUser";

export type PlayerEventType = "play" | "pause" | "seeked" | "ended" | "timeupdate";

export interface BasePlayerEventEnvelope<T> {
  type: "PLAYER_EVENT" | "MEDIA_DATA";
  data: T;
}

export interface VidlinkEventData {
  event: PlayerEventType;
  currentTime: number;
  duration: number;
  mtmdbId: number;
  mediaType: ContentType;
  season?: number;
  episode?: number;
}

export type VidlinkPlayerMessage = BasePlayerEventEnvelope<VidlinkEventData>;

export interface VidkingEventData {
  event: PlayerEventType;
  currentTime: number;
  duration: number;
  id: string | number;
  mediaType: ContentType;
  season?: number;
  episode?: number;
  progress?: number;
}

export type VidkingPlayerMessage = BasePlayerEventEnvelope<VidkingEventData>;

export interface UnifiedPlayerEventData {
  event: PlayerEventType;
  currentTime: number;
  duration: number;
  mediaId: string | number;
  mediaType: ContentType;
  season?: number;
  episode?: number;
  progress?: number;
}

export interface PlayerAdapter<RawMessage extends BasePlayerEventEnvelope<any>> {
  /** Domain origin for identifying source */
  origin: `https://${string}`;
  /** Converts raw → unified structure */
  parse: (raw: RawMessage) => UnifiedPlayerEventData | null;
}

export type AdapterMap = Record<string, PlayerAdapter<any>>;

export const playerAdapters = {
  vidlink: {
    origin: "https://vidlink.pro",
    parse: (raw) => {
      if (raw.type !== "PLAYER_EVENT") return null;
      const d = raw.data;
      return {
        ...d,
        mediaId: d.mtmdbId,
      };
    },
  } satisfies PlayerAdapter<VidlinkPlayerMessage>,

  vidking: {
    origin: "https://www.vidking.net",
    parse: (raw) => {
      if (raw.type !== "PLAYER_EVENT") return null;
      const d = raw.data;
      return {
        ...d,
        mediaId: d.id,
      };
    },
  } satisfies PlayerAdapter<VidkingPlayerMessage>,
} as const satisfies AdapterMap;

export interface UsePlayerEventsOptions {
  metadata?: { season?: number; episode?: number };
  saveHistory?: boolean;
  onPlay?: (data: UnifiedPlayerEventData) => void;
  onPause?: (data: UnifiedPlayerEventData) => void;
  onSeeked?: (data: UnifiedPlayerEventData) => void;
  onEnded?: (data: UnifiedPlayerEventData) => void;
  onTimeUpdate?: (data: UnifiedPlayerEventData) => void;
}

export function usePlayerEvents(options: UsePlayerEventsOptions = {}) {
  const { data: user } = useSupabaseUser();
  const documentState = useDocumentVisibility();

  const { metadata, saveHistory, onPlay, onPause, onSeeked, onEnded, onTimeUpdate } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lastEvent, setLastEvent] = useState<PlayerEventType | null>(null);

  const eventDataRef = useRef<UnifiedPlayerEventData | null>(null);
  const lastSyncedTimeRef = useRef(0);

  // the message/unload listeners are registered once, so read the latest values through refs
  const userRef = useRef(user);
  userRef.current = user;
  const optionsRef = useRef({ saveHistory, metadata });
  optionsRef.current = { saveHistory, metadata };

  const shouldSync = (data: UnifiedPlayerEventData) => {
    if (!optionsRef.current.saveHistory || !userRef.current) return false;
    return diff(data.currentTime, lastSyncedTimeRef.current) > 5; // prevent spam
  };

  const withMetadata = (data: UnifiedPlayerEventData): UnifiedPlayerEventData => ({
    ...data,
    season: data.season || optionsRef.current.metadata?.season || 0,
    episode: data.episode || optionsRef.current.metadata?.episode || 0,
  });

  const syncToServer = async (data: UnifiedPlayerEventData, completed?: boolean) => {
    if (!completed && !shouldSync(data)) return;
    if (!optionsRef.current.saveHistory || !userRef.current) return;

    const { success, message } = await syncHistory(withMetadata(data), completed);
    if (success) lastSyncedTimeRef.current = data.currentTime;
    else console.error("Save history failed:", message);
  };

  // save progress once each time the tab gets hidden
  useEffect(() => {
    if (documentState === "visible") return;
    if (!eventDataRef.current) return;
    syncToServer(eventDataRef.current);
  }, [documentState]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const data = eventDataRef.current;
      if (!data || !shouldSync(data)) return;

      const payload = { ...withMetadata(data), completed: data.event === "ended" };
      if (navigator.sendBeacon("/api/player/save-history", JSON.stringify(payload))) {
        lastSyncedTimeRef.current = data.currentTime;
      }
    };

    const handleMessage = (event: MessageEvent) => {
      const adapter = Object.values(playerAdapters).find((a) => a.origin === event.origin);
      if (!adapter) return;

      let rawData: any;
      try {
        rawData = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch (err) {
        console.warn("Invalid JSON from player:", err);
        return;
      }

      const parsed = adapter.parse(rawData);
      if (!parsed) return;

      eventDataRef.current = parsed;
      setLastEvent(parsed.event);

      switch (parsed.event) {
        case "play":
          setIsPlaying(true);
          onPlay?.(parsed);
          break;
        case "pause":
          setIsPlaying(false);
          onPause?.(parsed);
          break;
        case "ended":
          setIsPlaying(false);
          syncToServer(parsed, true);
          onEnded?.(parsed);
          break;
        case "seeked":
          setCurrentTime(parsed.currentTime);
          setDuration(parsed.duration);
          onSeeked?.(parsed);
          break;
        case "timeupdate":
          setCurrentTime(parsed.currentTime);
          setDuration(parsed.duration);
          onTimeUpdate?.(parsed);
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      handleBeforeUnload();
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return { isPlaying, currentTime, duration, lastEvent };
}
