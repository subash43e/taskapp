"use client"
import Task_Card from "@/src/Components/Task_Card/Index";
import { db } from "@/src/Firebase/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { showTaskEdit } from "@/src/store";
import Loading from "../Inbox/Loading";
import SearchBar from "@/src/Components/SearchBar";
import ProtectedRoute from "@/src/Components/ProtectedRoute";

export default function UpcomingPage() {
  const dispatch = useDispatch();
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUpcomingTasks = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "tasks"));
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      const TaskList: any = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((task: any) => {
          const taskDate = new Date(task.dueDate);
          return taskDate > today && !task.completed;
        })
        .sort((a: any, b: any) => {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
      
      setTasks(TaskList);
    } catch (error) {
      console.error("Error fetching upcoming tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingTasks();
  }, []);

  // Group tasks by date
  const groupTasksByDate = (tasks: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    tasks.forEach(task => {
      const date = new Date(task.dueDate);
      const dateKey = date.toDateString();
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(task);
    });
    
    return groups;
  };

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

  const groupedTasks = groupTasksByDate(filteredTasks);

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) return "Today";
    if (isTomorrow) return "Tomorrow";
    
    // Check if it's within this week
    const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 7) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return dayNames[date.getDay()];
    }
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <ProtectedRoute>
      <div className="p-4">
        <section className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Upcoming</h1>
        <div className="text-sm text-gray-300">
          {filteredTasks.length} upcoming {filteredTasks.length === 1 ? 'task' : 'tasks'}
        </div>
      </section>

      <section className="mb-4">
        <div className="w-full md:w-1/2">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search upcoming tasks..."
          />
        </div>
      </section>

      <section>
        {loading ? (
          <Loading />
        ) : filteredTasks.length === 0 && !searchQuery ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <div className="text-gray-400 text-lg mb-2">No upcoming tasks</div>
            <div className="text-gray-500 text-sm">All caught up!</div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No upcoming tasks match your search
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTasks).map(([dateString, tasksForDate]) => (
              <div key={dateString}>
                <h2 className="text-lg font-semibold text-gray-300 mb-3 sticky top-0 bg-[#111827] py-2">
                  {formatDateHeader(dateString)} ({tasksForDate.length})
                </h2>
                <div className="space-y-2 ml-4">
                  {tasksForDate.map((task: any) => (
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
                      onTaskUpdate={fetchUpcomingTasks}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
    </ProtectedRoute>
  );
}