"use client"
import Task_Card from "@/src/Components/Task_Card/Index";
import { db } from "@/src/Firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Suspense, useEffect, useState } from "react";
import Loading from "./Loading";
import SearchBar from "@/src/Components/SearchBar";
export default function Home() {

  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      const querySnapshot = await getDocs(collection(db, "tasks"));
      const TaskList: any = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(TaskList);
    };
    fetchTasks();
  }, []);

  // Filter tasks based on search query
  const filteredTasks = tasks.filter((task: any) => {
    const q = searchQuery.toLowerCase();
    return (
      task.taskName?.toLowerCase().includes(q) ||
      task.description?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="p-4">
        <section className="mb-4 flex flex-col gap-4 md:flex-row md:gap-6 md:justify-between items-center">
          <div className="w-full md:w-1/2">
            {/* SearchBar integration */}
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="Search tasks..."
            />
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 bg-[#232b38] rounded-lg px-6 py-3 text-gray-200 shadow hover:bg-[#2c3545] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 019 16v-2.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filter
            </button>
            <button className="flex items-center gap-2 bg-[#232b38] rounded-lg px-6 py-3 text-gray-200 shadow hover:bg-[#2c3545] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
              Sort by
            </button>
          </div>
        </section>
        <section>
          {tasks.length === 0 ? <Loading /> : (
            filteredTasks.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No tasks found.</div>
            ) : (
              filteredTasks.map((task: any) => (
                <Task_Card
                  key={task.id}
                  color={task.color}
                  title={task.taskName}
                  dueDate={task.dueDate}
                />
              ))
            )
          )}
        </section>
      </div>
    </>
  );
}

