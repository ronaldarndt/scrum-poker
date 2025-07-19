import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDTIJI2yFHmwLx3gKH_iHr9nDvMmFIoOrA",
  authDomain: "scrum-poker-53753.firebaseapp.com",
  databaseURL: "https://scrum-poker-53753-default-rtdb.firebaseio.com",
  projectId: "scrum-poker-53753",
  storageBucket: "scrum-poker-53753.appspot.com",
  messagingSenderId: "864064981647",
  appId: "1:864064981647:web:642b0def4a58fa1b657efa",
};

export const app = initializeApp(firebaseConfig);
