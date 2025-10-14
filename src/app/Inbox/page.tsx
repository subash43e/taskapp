"use client"
import Task_Card from "@/src/Components/Task_Card/Index";
import { getUserTasks, type Task } from "@/src/Firebase/taskService";
import { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { showTaskEdit, RootState } from "@/src/store";
import { setTasks, setTasksLoading, setTasksError } from '@/src/tasksSlice';
import Loading from "./Loading";
import SearchBar from "@/src/Components/SearchBar";
import ProtectedRoute from "@/src/Components/ProtectedRoute";

export default function Home() {
  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const loading = useSelector((state: RootState) => state.tasks.loading);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, completed
  const [sortBy, setSortBy] = useState("dueDate"); // dueDate, priority, created
  const user = useSelector((state: RootState) => state.auth.user);

  const fetchTasks = useCallback(async () => {
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
  },[dispatch,user])

  useEffect(() => {
    if (user?.uid) {
      fetchTasks();
    }
  }, [fetchTasks,user]);

  // Filter and sort tasks
  const getFilteredAndSortedTasks = () => {
    const filtered = tasks.filter((task: Task) => {
      // Search filter
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || (
        task.taskName?.toLowerCase().includes(q) ||
        task.description?.toLowerCase().includes(q) ||
        task.category?.toLowerCase().includes(q) ||
        task.tags?.some((tag: string) => tag.toLowerCase().includes(q))
      );

      // Status filter
      const matchesStatus = filterStatus === "all" || 
        (filterStatus === "completed" && task.completed) ||
        (filterStatus === "active" && !task.completed);

      return matchesSearch && matchesStatus;
    });

    // Sort tasks
  filtered.sort((a: Task, b: Task) => {
      switch (sortBy) {
        case "dueDate":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "priority":
          const priorityOrder = { "High": 3, "Medium": 2, "Low": 1 };
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                 (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
        case "created":
        default:
     return new Date(b.createdAt || '').getTime() - 
       new Date(a.createdAt || '').getTime();
      }
    });

    return filtered;
  };

  const filteredTasks = getFilteredAndSortedTasks();
  const completedCount = tasks.filter((task: Task) => task.completed).length;
  const activeCount = tasks.filter((task: Task) => !task.completed).length;

  return (
    <ProtectedRoute>
      <>
        <div className="p-4">
          <section className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Inbox</h1>
          <div className="flex gap-4 text-sm text-gray-300">
            <span>{activeCount} active</span>
            <span>{completedCount} completed</span>
            <span>{tasks.length} total</span>
          </div>
        </section>

        <section className="mb-4 flex flex-col gap-4 md:flex-row md:gap-6 md:justify-between items-center">
          <div className="w-full md:w-1/2">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="Search tasks, categories, tags..."
            />
          </div>
          
          <div className="flex gap-4">
            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex items-center gap-2 cursor-pointer bg-[#232b38] rounded-lg px-6 py-3 text-gray-200 shadow hover:bg-[#2c3545] transition-colors border-none outline-none"
                title="Task_Filter_btn"
              >
                <option value="all">All Tasks</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex items-center gap-2 cursor-pointer bg-[#232b38] rounded-lg px-6 py-3 text-gray-200 shadow hover:bg-[#2c3545] transition-colors border-none outline-none"
                title="Task_sorting_btn"
              >
                <option value="created">Sort by Created</option>
                <option value="dueDate">Sort by Due Date</option>
                <option value="priority">Sort by Priority</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          {loading ? (
            <Loading />
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">No tasks yet</div>
              <div className="text-gray-500 text-sm">Click the &quot;New Task&quot; button to create your first task</div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No tasks match your current filters
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task: Task) => (
                <Task_Card
                  key={task.id}
                  id={task.id || ''}
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
    </>
    </ProtectedRoute>
  );
}

