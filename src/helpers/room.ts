import { Room } from "@/types";
import {
  DatabaseReference,
  child,
  remove,
  serverTimestamp,
  set,
  update,
} from "firebase/database";
import { nanoid } from "nanoid";

export class RoomManager {
  constructor(
    private room: Room | undefined,
    private ref: DatabaseReference,
  ) {}

  public get owner() {
    return this.room?.users[this.room?.ownerId];
  }

  public getUser(id: string) {
    return this.room?.users[id];
  }

  public getUserManager(id: string) {
    return new UserManager(this.room, this.getUser(id), this.ref);
  }

  public toggleShow() {
    if (!this.room) return;

    return set(child(this.ref, "show"), !this.room.show);
  }

  public resetVotes() {
    if (!this.room) return;

    const updates: Record<string, null | false> = {
      show: false,
    };

    for (const user of Object.values(this.room.users)) {
      updates["users/" + user.id + "/vote"] = null;
    }

    return update(this.ref, updates);
  }

  public createGroup() {
    const groupId = nanoid();

    const groupCount = Object.values(this.room?.groups ?? {}).length;

    return set(child(this.ref, "groups/" + groupId), {
      id: groupId,
      name: "Group " + groupCount,
      timestamp: serverTimestamp(),
    });
  }

  public getGroup(id: string) {
    return this.room?.groups[id];
  }

  public getGroupManager(id: string) {
    return new GroupManager(this.room, this.getGroup(id), this.ref);
  }
}

class UserManager {
  constructor(
    private room: Room | undefined,
    private user: Room["users"][string] | undefined,
    private roomRef: DatabaseReference,
  ) {}

  public setName(newName: string) {
    if (!this.user) return;

    return set(child(this.roomRef, "users/" + this.user.id + "/name"), newName);
  }

  public setVote(vote: string | number) {
    if (!this.user) return;
    return set(child(this.roomRef, "users/" + this.user.id + "/vote"), vote);
  }

  public setGroup(groupId: string) {
    if (!this.user) return;
    return set(
      child(this.roomRef, "users/" + this.user.id + "/groupId"),
      groupId,
    );
  }
}

class GroupManager {
  constructor(
    private room: Room | undefined,
    private group: Room["groups"][string] | undefined,
    private roomRef: DatabaseReference,
  ) {}

  public setName(newName: string) {
    if (!this.group) return;

    return set(
      child(this.roomRef, "groups/" + this.group.id + "/name"),
      newName,
    );
  }

  public delete() {
    if (!this.group) return;

    return remove(child(this.roomRef, "groups/" + this.group.id));
  }
}
