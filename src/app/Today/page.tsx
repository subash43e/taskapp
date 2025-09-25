"use client"
import Task_Card from "@/src/Components/Task_Card/Index";
import { db } from "@/src/Firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { showTaskEdit } from "@/src/store";
import Loading from "../Inbox/Loading";
import SearchBar from "@/src/Components/SearchBar";

export default function TodayPage() {
  const dispatch = useDispatch();
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTodayTasks = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const querySnapshot = await getDocs(collection(db, "tasks"));
      
      const TaskList: any = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((task: any) => {
          const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
          return taskDate === today && !task.completed;
        });
      
      setTasks(TaskList);
    } catch (error) {
      console.error("Error fetching today's tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayTasks();
  }, []);

  // Filter tasks based on search query
  const filteredTasks = tasks.filter((task: any) => {
    const q = searchQuery.toLowerCase();
    return !q || (
      task.taskName?.toLowerCase().includes(q) ||
      task.description?.toLowerCase().includes(q) ||
      task.category?.toLowerCase().includes(q) ||
      task.tags?.some((tag: string) => tag.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-4">
      <section className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Today</h1>
        <div className="text-sm text-gray-300">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} due today
        </div>
      </section>

      <section className="mb-4">
        <div className="w-full md:w-1/2">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search today's tasks..."
          />
        </div>
      </section>

      <section>
        {loading ? (
          <Loading />
        ) : filteredTasks.length === 0 && !searchQuery ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-gray-400 text-lg mb-2">No tasks due today</div>
            <div className="text-gray-500 text-sm">Enjoy your day!</div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No tasks match your search
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task: any) => (
              <Task_Card
                key={task.id}
                id={task.id}
                color={task.color}
                title={task.taskName}
                description={task.description}
                dueDate={task.dueDate}
                dueTime={task.dueTime}
                priority={task.priority}
                category={task.category}
                tags={task.tags || []}
                completed={task.completed || false}
                onTaskUpdate={fetchTodayTasks}
                onTaskEdit={(task) => dispatch(showTaskEdit(task))}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}