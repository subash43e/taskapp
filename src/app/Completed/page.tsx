"use client"
import Task_Card from "@/src/Components/Task_Card/Index";
import { useEffect, useState, useMemo } from "react";
import Loading from "../Inbox/Loading";
import SearchBar from "@/src/Components/SearchBar";
import ProtectedRoute from "@/src/Components/ProtectedRoute";
import { getUserTasks, type Task } from "@/src/Firebase/taskService";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/src/store';
import { setTasks, setTasksLoading, setTasksError } from '@/src/tasksSlice';

export default function CompletedPage() {
  const dispatch = useDispatch();
  const allTasks = useSelector((state: RootState) => state.tasks.tasks);
  const loading = useSelector((state: RootState) => state.tasks.loading);
  const [searchQuery, setSearchQuery] = useState("");
  const user = useSelector((state: RootState) => state.auth.user);

  const fetchTasks = async () => {
    try {
      dispatch(setTasksLoading(true));
      
      if (!user?.uid) {
        console.error("User not authenticated");
        dispatch(setTasks([]));
        return;
      }

      // Use the new TaskService to get user-specific tasks
      const userTasks = await getUserTasks(user.uid);
      dispatch(setTasks(userTasks));
      
    } catch (error) {
      console.error("Error fetching tasks:", error);
      dispatch(setTasksError(error instanceof Error ? error.message : 'Failed to fetch tasks'));
    } finally {
      dispatch(setTasksLoading(false));
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchTasks();
    }
  }, [user]);

  // Filter completed tasks from all tasks
  const tasks = useMemo(() => {
    return allTasks.filter(task => task.completed);
  }, [allTasks]);

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
    <ProtectedRoute>
      <div className="p-4">
        <section className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Completed</h1>
        <div className="text-sm text-gray-300">
          {filteredTasks.length} completed {filteredTasks.length === 1 ? 'task' : 'tasks'}
        </div>
      </section>

      <section className="mb-4">
        <div className="w-full md:w-1/2">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search completed tasks..."
          />
        </div>
      </section>

      <section>
        {loading ? (
          <Loading />
        ) : filteredTasks.length === 0 && !searchQuery ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <div className="text-gray-400 text-lg mb-2">No completed tasks yet</div>
            <div className="text-gray-500 text-sm">Complete some tasks to see them here</div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No completed tasks match your search
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
                priority={task.priority}
                category={task.category}
                tags={task.tags || []}
                completed={task.completed || false}
                onTaskUpdate={fetchTasks}
              />
            ))}
          </div>
        )}
      </section>
    </div>
    </ProtectedRoute>
  );
}