import {
  child,
  getDatabase,
  ref,
  type DatabaseReference,
} from "firebase/database";
import { app } from "./lib/firebase";

const db = getDatabase(app);

export const refs = {
  rooms: ref(db, "rooms"),
  room: (id: string) => ref(db, `rooms/${id}`),
  roomUsers: (roomId: string) => ref(db, `rooms/${roomId}/users`),
  roomUser: (room: DatabaseReference, userId: string) =>
    child(room, `users/${userId}`),
};
