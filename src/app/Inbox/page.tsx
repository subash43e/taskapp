"use client"
import Task_Card from "@/src/Components/Task_Card/Index";
import { db } from "@/src/Firebase/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { showTaskEdit } from "@/src/store";
import Loading from "./Loading";
import SearchBar from "@/src/Components/SearchBar";
import ProtectedRoute from "@/src/Components/ProtectedRoute";

export default function Home() {
  const dispatch = useDispatch();
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, completed
  const [sortBy, setSortBy] = useState("dueDate"); // dueDate, priority, created
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const TaskList: any = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(TaskList);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter and sort tasks
  const getFilteredAndSortedTasks = () => {
    let filtered = tasks.filter((task: any) => {
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
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "dueDate":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "priority":
          const priorityOrder = { "High": 3, "Medium": 2, "Low": 1 };
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                 (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
        case "created":
        default:
          return new Date(b.createdAt?.toDate?.() || b.createdAt).getTime() - 
                 new Date(a.createdAt?.toDate?.() || a.createdAt).getTime();
      }
    });

    return filtered;
  };

  const filteredTasks = getFilteredAndSortedTasks();
  const completedCount = tasks.filter((task: any) => task.completed).length;
  const activeCount = tasks.filter((task: any) => !task.completed).length;

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
              <div className="text-gray-500 text-sm">Click the "New Task" button to create your first task</div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No tasks match your current filters
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
    </>
    </ProtectedRoute>
  );
}

