"use client"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {

  // Simulated tasks array. Replace with actual data fetching logic.
  const tasks = []; // Example: const tasks = useTasksFromStoreOrApi();

  if (tasks.length === 0) {
    return (
      <div>
        <p>Please click the "New Task" button and create a new task.</p>
      </div>
    );
  } else {
    return (
      <div>
        <p>Please check your inbox for tasks.</p>
      </div>
    );
  }



  // const router = useRouter();
  // useEffect(() => {
  //   router.replace("/Inbox");
  // }, [router]);
  // return null;
}

