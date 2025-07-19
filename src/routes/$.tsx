import { createFileRoute } from "@tanstack/react-router";
import { set } from "firebase/database";
import { nanoid } from "nanoid";
import { useState, type FormEvent } from "react";
import { refs } from "../database";
import { useUserStore } from "../stores/user-store";

export const Route = createFileRoute("/$")({
  component: RouteComponent,
});

function RouteComponent() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const user = useUserStore();

  const { _splat } = Route.useParams();
  const navigate = Route.useNavigate();

  const isCreate = !_splat;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const username = formData.get("username") as string;

    if (!username && !user.name) {
      setError("Username is required");
      return;
    }

    setLoading(true);

    const name = username || user.name;

    const id = !_splat ? nanoid() : _splat;

    const room = refs.room(id);

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
      await set(refs.roomUser(room, user.id), {
        id: user.id,
        name,
        isOwner: false,
        isOnline: true,
        vote: null,
        group: "default",
      });
    }

    user.set((u) => ({ ...u, name }));

    navigate({
      to: "/room/$id",
      params: { id },
    });
  }

  const title = isCreate ? "Create room" : "Join room";

  return (
    <main className="font-sans bg-paper h-full flex-col flex items-center justify-center p-16">
      <title key="title">{title}</title>

      <h1 className="mb-10">{title}</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col bg-paper-light p-8 rounded-lg shadow-md"
      >
        {user.name ? (
          <p>Logged in as {user.name}</p>
        ) : (
          <input
            type="text"
            placeholder="Username"
            name="username"
            className="mb-4 p-2 border border-gray-300 rounded-lg"
          />
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button
          type="submit"
          className="mt-2 flex justify-center align-center text rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors text-white px-4 py-2"
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
