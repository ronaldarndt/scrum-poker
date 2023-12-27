import { DatabaseReference, child, ref } from "firebase/database";
import { useDatabase } from "reactfire";

export function useRefs() {
  const db = useDatabase();

  return {
    rooms: ref(db, "rooms"),
    room: (id: string) => ref(db, `rooms/${id}`),
    roomUsers: (roomId: string) => ref(db, `rooms/${roomId}/users`),
    roomUser: (room: DatabaseReference, userId: string) =>
      child(room, `users/${userId}`),
  };
}
