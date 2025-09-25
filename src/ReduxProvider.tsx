"use client";
import { Provider } from "react-redux";
import { store } from "./store";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./Firebase/firebase";
import { setUser } from "./authSlice";
import notificationScheduler from "./services/notificationScheduler";

onAuthStateChanged(auth, (user) => {
  if (user) {
    store.dispatch(setUser({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    }));
    notificationScheduler.setUserEmail(user.email || "user@example.com");
  } else {
    store.dispatch(setUser(null));
  }
});

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
