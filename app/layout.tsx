"use client";

import "@unocss/reset/normalize.css";
import { getDatabase } from "firebase/database";
import { Provider } from "jotai";
import { Inter } from "next/font/google";
import { PropsWithChildren } from "react";
import {
  DatabaseProvider,
  FirebaseAppProvider,
  useFirebaseApp,
} from "reactfire";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const firebaseConfig = {
  apiKey: "AIzaSyDTIJI2yFHmwLx3gKH_iHr9nDvMmFIoOrA",
  authDomain: "scrum-poker-53753.firebaseapp.com",
  databaseURL: "https://scrum-poker-53753-default-rtdb.firebaseio.com",
  projectId: "scrum-poker-53753",
  storageBucket: "scrum-poker-53753.appspot.com",
  messagingSenderId: "864064981647",
  appId: "1:864064981647:web:642b0def4a58fa1b657efa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <Provider>
        <App>{children}</App>
      </Provider>
    </FirebaseAppProvider>
  );
}

function App({ children }: PropsWithChildren) {
  const app = useFirebaseApp();
  const db = getDatabase(app);

  return (
    <DatabaseProvider sdk={db}>
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width" />
          <title>Scrum Poker</title>
          <link rel="icon" type="image/x-icon" href="/favicon.svg" />
        </head>

        <body className={inter.className + " bg-slate-400 dark:bg-slate-900"}>
          {children}
        </body>
      </html>
    </DatabaseProvider>
  );
}
