export interface RoomGroup {
  id: string;
  name: string;
  timestamp: number;
}

export interface Confetti {
  id: string;
  velocity: number;
  angle: number;
  position: {
    x: number;
    y: number;
  };
}

export interface User {
  id: string;
  name: string;
  isOwner: boolean;
  isOnline: boolean;
  vote: string | null;
  group: string;
}

export interface Room {
  id: string;
  ownerId: string;
  show: boolean;
  users: Record<string, User>;
  groups: Record<string, RoomGroup>;
  confetti: Record<string, Confetti>;
}
