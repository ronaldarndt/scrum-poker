import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import clsx from "clsx";
import { child, get, remove, set } from "firebase/database";
import { Fragment, useCallback, useState } from "react";
import { LuArrowLeft, LuCopy } from "react-icons/lu";
import { toast, Toaster } from "sonner";
import ButtonWithConfirm from "../../components/button-with-confirm";
import EditableText from "../../components/editable-text";
import { refs } from "../../database";
import useConfetti from "../../hooks/use-confetti";
import useDatabase from "../../hooks/use-database";
import cn from "../../lib/cn";
import { fib } from "../../lib/number";
import { RoomManager } from "../../lib/room-manager";
import { useUserStore } from "../../stores/user-store";
import type { Confetti, Room } from "../../types";

const numbers = [
  0.5,
  ...Array.from({ length: 8 })
    .map((_, i) => fib(i + 2))
    .map((x) => (x === 13 ? "12 + 1" : x)),
];

export const Route = createFileRoute("/room/$id")({
  component: RouteComponent,
  beforeLoad: async ({ params }) => {
    const { id } = params;

    if (!id) {
      throw new Error("Room ID is required");
    }

    const room = refs.room(id);

    const data = await get(room);

    if (!data.exists()) {
      throw new Error("Room not found");
    }

    const roomData = data.val() as Room;

    const user = useUserStore.getState();

    if (!user.name || !roomData.users[user.id]) {
      throw redirect({
        to: "/$",
        params: { _splat: id },
      });
    }

    return { data: roomData };
  },
  loader: ({ context }) => context.data,
});

function RouteComponent() {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { id: userId, set: setUser } = useUserStore();

  const { id: roomId } = Route.useParams();
  const roomData = Route.useLoaderData();

  const room = refs.room(roomId);
  const [data, loading] = useDatabase<Room>(room, { initialData: roomData });

  console.log(data?.confetti);

  useConfetti({
    confetti: data?.confetti,
    onLaunch: handleLaunch,
    enabled: true,
  });

  const manager = new RoomManager(data, room);
  const user = data?.users?.[userId];

  const getTitle = useCallback(() => {
    if (!manager.owner) {
      return "Room " + roomId;
    }

    return manager.owner.name + "'s room";
  }, [manager.owner, roomId]);

  function handleLaunch(ctx: Confetti) {
    const confettiRef = child(room, "confetti/" + ctx.id);

    set(confettiRef, ctx);

    setTimeout(() => {
      remove(confettiRef);
    }, 5000);
  }

  return (
    <main className="font-sans bg-paper h-full p-2">
      <Toaster />
      <div className="flex flex-col">
        <div className="flex flex-row justify-between">
          <div className="flex flex-row items-center">
            <Link to="..">
              <LuArrowLeft className="me-2" />
            </Link>
            <h1>{getTitle()}</h1>

            <button
              className="ms-4 flex flex-row text-xs text-gray-600 dark:text-gray-400 cursor-pointer"
              onClick={() => {
                toast.promise(
                  navigator.clipboard.writeText(
                    window.location.href.replace("/room", ""),
                  ),
                  {
                    loading: "Copying link...",
                    success: "Copied!",
                    error: "Failed to copy",
                    position: "bottom-center",
                  },
                );
              }}
              type="reset"
            >
              Copy link <LuCopy className="ms-1" />
            </button>
          </div>

          <div className="flex flex-row">
            <EditableText
              wrapper={(props) => <p {...props} />}
              className="text"
              value={manager.getUser(userId)?.name ?? ""}
              onChange={(v) => {
                setUser((u) => ({ ...u, name: v }));
                manager.getUserManager(userId).setName(v);
              }}
            />
          </div>
        </div>
        <section className="flex flex-row justify-center mt-16 flex-wrap gap-2">
          {numbers.map((value) => {
            const selected = user?.vote === value;

            return (
              <div key={value}>
                <button
                  className={cn(
                    "size-24 position-relative transform-gpu flex justify-center items-center",
                    "hover:scale-125 duration-150 delay-0",
                    "hover:ms-4 hover:me-6 transition-all",
                    "bg-gray-800 hover:bg-gray-700 text-white rounded-lg",
                    selected && "bg-gray-700",
                  )}
                  onClick={() => manager.getUserManager(userId).setVote(value)}
                  disabled={loading}
                >
                  {value}
                </button>
              </div>
            );
          })}
        </section>
      </div>

      <section className="flex flex-col gap-1">
        <section className="flex flex-row mt-24 mb-10 gap-2">
          <button
            className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg p-2"
            onClick={() => manager.toggleShow()}
            disabled={loading}
          >
            {data?.show ? "Hide votes" : "Show Votes"}
          </button>
          <button
            className={clsx(
              "bg-gray-800 hover:bg-gray-700 text-white rounded-lg p-2 w-36",
              isConfirmingDelete && "bg-red-600 hover:bg-red-700",
            )}
            onClick={() => {
              if (isConfirmingDelete) {
                manager.resetVotes();
                setIsConfirmingDelete(false);
                return;
              }

              setIsConfirmingDelete(true);
              setTimeout(() => setIsConfirmingDelete(false), 3000);
            }}
            disabled={loading}
          >
            {isConfirmingDelete ? "Confirm?" : "Delete votes"}
          </button>

          <button
            className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg p-2"
            disabled={loading}
            onClick={() => manager.createGroup()}
          >
            Create group
          </button>
        </section>

        {Object.values(data?.groups ?? {})
          .sort((a, b) => a.timestamp - b.timestamp)
          .map((group) => (
            <Fragment key={group.id}>
              <div className="flex flex-row">
                <EditableText
                  onChange={(v) => manager.getGroupManager(group.id).setName(v)}
                  value={group.name}
                  wrapper={(props) => <h2 {...props} />}
                  className="title text"
                />

                {group.id !== user?.group ? (
                  <button
                    className="ms-2 h[2rem] w[4rem] text-sm"
                    onClick={() =>
                      manager.getUserManager(roomId).setGroup(group.id)
                    }
                  >
                    Join
                  </button>
                ) : null}

                {user?.isOwner && group.id !== "default" ? (
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
                {Object.values(data?.users ?? {})
                  .filter((x) => x.group === group.id && x.isOnline)
                  .map((user) => (
                    <li
                      key={user.id}
                      className="flex flex-row items-center gap-1"
                    >
                      {user.name} -
                      <b className="text-2xl">
                        {data?.show ? user.vote : user.vote ? "?" : ""}
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
    </main>
  );
}
