"use client";

import { userAtom } from "@/atoms/user";
import ButtonWithConfirm from "@/components/button-with-confirm";
import EditableText from "@/components/editable-text";
import { useRefs } from "@/database";
import { fib } from "@/helpers/number";
import { RoomManager } from "@/helpers/room";
import useConfetti from "@/hooks/use-confetti";
import useGuard from "@/hooks/use-guard";
import { Confetti, Room } from "@/types";
import confetti from "canvas-confetti";
import clsx from "clsx";
import {
  child,
  onDisconnect,
  onValue,
  ref,
  remove,
  set,
} from "firebase/database";
import { useAtom, useAtomValue } from "jotai";
import Link from "next/link";
import { Fragment, useCallback, useEffect } from "react";
import { useDatabase, useDatabaseObjectData } from "reactfire";
import styles from "./page.module.css";

import { preferencesAtom } from "@/atoms/preferences";
import PreferencesButton from "@/components/preferences-button/preferences-button";
import { Toaster, toast } from "react-hot-toast";

interface Props {
  params: { id: string };
}

const numbers = [
  "i-ph-coffee-bold",
  0.5,
  ...Array.from({ length: 8 }).map((_, i) => fib(i + 2)),
  "i-ph-infinity-bold",
];

function isIcon(value: string | number | null): value is string {
  return typeof value === "string" && value.startsWith("i-ph");
}

function renderVote(value: string | number | null, size = "text-lg") {
  if (isIcon(value)) {
    return <div className={clsx(value, size)} />;
  }

  return value;
}

export default function Room({ params }: Props) {
  const [{ id }, setUser] = useAtom(userAtom);
  const preferences = useAtomValue(preferencesAtom);

  const db = useDatabase();
  const { room: getRoomRef } = useRefs();
  const roomRef = getRoomRef(params.id);
  const room = useDatabaseObjectData<Room>(roomRef);

  const manager = new RoomManager(room.data, roomRef);

  useConfetti({
    confetti: room.data?.confetti,
    onLaunch: handleLaunch,
    enabled: preferences.confetti,
  });

  useGuard(
    () => !room.data?.users || !!room.data.users[id],
    "/join/" + params.id,
    [id, room.data?.users, params.id],
  );

  useEffect(() => {
    const connectedRef = ref(db, ".info/connected");

    return onValue(connectedRef, (snap) => {
      if (snap.val() !== true) return;

      const con = ref(db, "rooms/" + params.id + "/users/" + id + "/isOnline");

      onDisconnect(con).set(false);

      set(con, true);
    });
  }, [db, id, params.id]);

  useEffect(() => {
    if (!preferences.confetti) return;

    return onValue(child(roomRef, "show"), (snap) => {
      if (!snap.exists() || !snap.val()) return;

      const groupId = room.data?.users?.[id]?.group;
      const group = room.data?.groups?.[groupId];

      if (!group) return;

      const votes = Object.values(room.data?.users ?? {})
        .filter((x) => x.group === groupId && x.isOnline)
        .map((x) => x.vote);

      if (votes.every((x) => x === votes[0])) {
        confetti({
          particleCount: 200,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.data?.users?.[id]?.group, id, preferences.confetti]);

  const getTitle = useCallback(() => {
    if (!manager.owner) {
      return "Room " + params.id;
    }

    return manager.owner.name + "'s room";
  }, [manager.owner, params.id]);

  useEffect(() => {
    document.title = getTitle();
  }, [getTitle]);

  function handleLaunch(ctx: Confetti) {
    const confettiRef = child(roomRef, "confetti/" + ctx.id);

    set(confettiRef, ctx);

    setTimeout(() => {
      remove(confettiRef);
    }, 5000);
  }

  const user = room.data?.users?.[id];

  const loading = room.status === "loading";

  if (!params.id) {
    return <p>Invalid room id</p>;
  }

  if (room.status === "error") {
    return <p>Error: {room.error?.message}</p>;
  }

  return (
    <div className="flex flex-col h-full justify-between p-8">
      <Toaster />
      <div className="flex flex-col">
        <div className="flex flex-row justify-between">
          <div className="flex flex-row items-center">
            <Link href="..">
              <button className="i-ph-arrow-left p-4 me-2" />
            </Link>
            <h1 className="title text">{getTitle()}</h1>

            {!!navigator.clipboard?.writeText ? (
              <button
                className="ms-4 flex flex-row text-xs text-gray-600 dark:text-gray-400"
                onClick={() => {
                  toast.promise(
                    navigator.clipboard.writeText(window.location.href),
                    {
                      loading: "Copying link...",
                      success: "Copied!",
                      error: "Failed to copy",
                    },
                    {
                      position: "bottom-center",
                    },
                  );
                }}
                type="reset"
              >
                Copy link <div className="i-ph-copy ms-1 text-sm" />
              </button>
            ) : null}
          </div>

          <div className="flex flex-row">
            <EditableText
              wrapper={(props) => <p {...props} />}
              className="text"
              value={manager.getUser(id)?.name ?? ""}
              onChange={(v) => {
                setUser((u) => ({ ...u, name: v }));
                manager.getUserManager(id).setName(v);
              }}
            />
            <PreferencesButton />
          </div>
        </div>
        <section className="flex flex-row justify-center mt-16">
          {numbers.map((value) => (
            <div key={value}>
              <button
                className={clsx(
                  "btn h[6rem] w[6rem] me-2 position-relative transform-gpu flex justify-center items-center",
                  "hover:scale-125 duration-150 delay-0",
                  "hover:ms-4 hover:me-6 transition-all",
                  styles.button,
                )}
                onClick={() => manager.getUserManager(id).setVote(value)}
                disabled={loading}
              >
                {renderVote(value, "text-2xl")}
              </button>
            </div>
          ))}
        </section>
      </div>

      <section>
        <section className="flex flex-row mt-24 mb-10">
          <button
            className="btn me-2"
            onClick={() => manager.toggleShow()}
            disabled={loading}
          >
            {room.data?.show ? "Hide votes" : "Show Votes"}
          </button>
          <button
            className="btn me-2"
            onClick={() => manager.resetVotes()}
            disabled={loading}
          >
            Delete votes
          </button>

          <button
            className="btn"
            disabled={loading}
            onClick={() => manager.createGroup()}
          >
            Create group
          </button>
        </section>

        {Object.values(room.data?.groups ?? {})
          .sort((a, b) => a.timestamp - b.timestamp)
          .map((group) => (
            <Fragment key={group.id}>
              <div className="flex flex-row mt-5">
                <EditableText
                  onChange={(v) => manager.getGroupManager(group.id).setName(v)}
                  value={group.name}
                  wrapper={(props) => <h2 {...props} />}
                  className="title text"
                />

                {group.id !== user.group ? (
                  <button
                    className="ms-2 h[2rem] w[4rem] text-sm"
                    onClick={() =>
                      manager.getUserManager(id).setGroup(group.id)
                    }
                  >
                    Join
                  </button>
                ) : null}
                {user.isOwner && group.id !== "default" ? (
                  <ButtonWithConfirm
                    className="ms-2 h[2rem] w[5rem] text-sm"
                    text="Delete"
                    confirmText="Sure?"
                    confirmClass="bg-red hover:bg-red-600"
                    onConfirm={() => manager.getGroupManager(group.id).delete()}
                  />
                ) : null}
              </div>

              <ul>
                {Object.values(room.data?.users ?? {})
                  .filter((x) => x.group === group.id && x.isOnline)
                  .map((user) => (
                    <li
                      key={user.id}
                      className="text flex flex-row items-center "
                    >
                      {user.name} -{" "}
                      <b className="text text-2xl">
                        {room.data?.show
                          ? renderVote(user.vote)
                          : user.vote
                            ? "?"
                            : ""}
                      </b>
                    </li>
                  ))}

                {loading ? (
                  <div className="h-2 bg-slate-700 rounded col-span-2 w[5rem] h[1rem]" />
                ) : null}
              </ul>
            </Fragment>
          ))}
      </section>
    </div>
  );
}
