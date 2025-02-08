"use client";

import { userAtom } from "@/atoms/user";
import { useRefs } from "@/database";
import { set } from "firebase/database";
import { useAtom } from "jotai";
import { nanoid } from "nanoid";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "../page.module.css";

export const runtime = "edge";

export default function CatchAllPage({ params }: { params: { id?: string } }) {
  const [user, setUser] = useAtom(userAtom);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { room: getRoomRef, roomUser } = useRefs();

  const router = useRouter();

  const isCreate = !params.id;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const username = (
      e.currentTarget.elements.namedItem("username") as HTMLInputElement
    )?.value;

    if (!username && !user.name) {
      setError("Username is required");
      return;
    }

    setLoading(true);

    const name = username || user.name;

    const id = !params.id ? nanoid() : params.id;

    const room = getRoomRef(id);

    if (isCreate) {
      await set(room, {
        id,
        ownerId: user.id,
        show: false,
        groups: {
          default: {
            name: "Users",
            id: "default",
            timestamp: Date.now(),
          },
        },
        users: {
          [user.id]: {
            id: user.id,
            name,
            isOwner: true,
            isOnline: true,
            vote: null,
            group: "default",
          },
        },
      });
    } else {
      await set(roomUser(room, user.id), {
        id: user.id,
        name,
        isOwner: false,
        isOnline: true,
        vote: null,
        group: "default",
      });
    }

    setUser((u) => ({ ...u, name: username }));

    router.push("/room/" + id);
  }

  const title = isCreate ? "Create room" : "Join room";

  return (
    <main className={styles.main}>
      <Head>
        <title key="title">{title}</title>
      </Head>

      <h1 className="title mb-10 text">{title}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col">
        {user.name ? (
          <p className="text">Logged in as {user.name}</p>
        ) : (
          <input
            type="text"
            placeholder="Username"
            name="username"
            className="text"
          />
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button
          type="submit"
          className="btn mt-2 flex justify-center align-center text"
          disabled={loading}
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 ml-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
          ) : (
            title
          )}
        </button>
      </form>
    </main>
  );
}
