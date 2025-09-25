"use client"
import Task_Card from "@/src/Components/Task_Card/Index";
import TaskService, { Task } from "@/src/Firebase/taskService";
import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { showTaskEdit } from "@/src/store";
import { RootState } from '@/src/store';
import { setTasks, setTasksLoading, setTasksError } from '@/src/tasksSlice';
import Loading from "../Inbox/Loading";
import SearchBar from "@/src/Components/SearchBar";
import ProtectedRoute from "@/src/Components/ProtectedRoute";

export default function TodayPage() {
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
      const userTasks = await TaskService.getUserTasks(user.uid);
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

  // Filter today's tasks from all tasks
  const tasks = useMemo(() => {
    const today = new Date().toDateString();
    return allTasks.filter(task => {
      const taskDate = new Date(task.dueDate).toDateString();
      return taskDate === today && !task.completed; // Only show incomplete today's tasks
    });
  }, [allTasks]);

  // Filter tasks based on search query
  const filteredTasks = tasks.filter((task: Task) => {
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
                onTaskUpdate={fetchTasks}
                onTaskEdit={(task) => dispatch(showTaskEdit(task))}
              />
            ))}
          </div>
        )}
      </section>
    </div>
    </ProtectedRoute>
  );
}