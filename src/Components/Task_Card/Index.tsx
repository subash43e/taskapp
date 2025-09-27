"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { updateTask, deleteTask, Task } from "@/src/Firebase/taskService";
import { showNotification } from "../../notificationSlice";
import { updateTask as updateTaskInState, deleteTask as deleteTaskFromState } from "../../tasksSlice";
import emailService from "../../services/emailNotificationService";
import notificationScheduler from "../../services/notificationScheduler";

interface TaskCardProps {
  id: string;
  color: string;
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  tags: string[];
  completed?: boolean;
  onTaskUpdate: () => void;
  onTaskEdit?: (task: Task) => void;
}

export default function Task_Card({ 
  id,
  color, 
  title, 
  description,
  dueDate, 
  dueTime,
  priority, 
  category, 
  tags,
  completed = false,
  onTaskUpdate,
  onTaskEdit
}: TaskCardProps) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isCompleted, setIsCompleted] = useState(completed);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleComplete = async () => {
    try {
      const newStatus = !isCompleted;
      setIsCompleted(newStatus);
      
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }
      
      // Update task in database using TaskService
      await updateTask(user.uid, id, { 
        completed: newStatus
      });
      
      // Update task in Redux state
      dispatch(updateTaskInState({
        id,
        updates: {
          completed: newStatus,
          updatedAt: new Date().toISOString()
        }
      }));
      
      // If task is completed, send notification and cancel reminders
      if (newStatus) {
        // Send email notification for task completion
        await emailService.sendTaskCompletionNotification({
          taskName: title,
          completedAt: new Date(),
          userEmail: user?.email || "user@example.com",
          category,
          priority
        });

        // Cancel any scheduled reminders for this task
        notificationScheduler.cancelTaskReminders(id);

        // Show success notification
        dispatch(showNotification({
          message: `Great job! "${title}" marked as complete 🎉`,
          type: 'success'
        }));
      } else {
        // Task was uncompleted, reschedule reminders if needed
        if (dueDate && dueTime) {
          notificationScheduler.scheduleTaskReminder({
            taskId: id,
            taskName: title,
            dueDate,
            dueTime,
            userEmail: user?.email || "user@example.com",
            category,
            priority
          });
        }
        
        dispatch(showNotification({
          message: `"${title}" marked as active`,
          type: 'info'
        }));
      }
      
      onTaskUpdate();
    } catch (error) {
      console.error("Error updating task:", error);
      setIsCompleted(isCompleted); // Revert on error
      dispatch(showNotification({
        message: "Failed to update task status",
        type: 'error'
      }));
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        setIsDeleting(true);
        
        if (!user?.uid) {
          throw new Error('User not authenticated');
        }
        
        // Delete task from database using TaskService
        await deleteTask(user.uid, id);
        
        // Remove task from Redux state
        dispatch(deleteTaskFromState(id));
        
        dispatch(showNotification({
          message: "Task deleted successfully!",
          type: 'success'
        }));
        
        onTaskUpdate();
      } catch (error) {
        console.error("Error deleting task:", error);
        setIsDeleting(false);
        dispatch(showNotification({
          message: "Failed to delete task. Please try again.",
          type: 'error'
        }));
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (isDeleting) {
    return (
      <div className='flex flex-row gap-2 p-4 bg-red-900/20 rounded-md items-center mb-3 opacity-50'>
        <div className="text-white">Deleting...</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-row gap-2 p-4 bg-[#1f2937] rounded-md items-center mb-3 transition-all duration-200 relative group ${
      isCompleted ? 'opacity-60' : ''
    }`}>
      <input 
        type="checkbox" 
        className="accent-blue-500 cursor-pointer" 
        checked={isCompleted}
        onChange={handleToggleComplete}
      />
      
      {/* Color indicator */}
      <div className={`h-8 w-2 rounded`} style={{ backgroundColor: color }} />
      
      {/* Task details */}
      <div className='flex flex-col justify-center ml-2 flex-1'>
        <h1 className={`text-white font-semibold text-lg ${isCompleted ? 'line-through' : ''}`}>
          {title}
        </h1>
        {description && (
          <p className={`text-gray-300 text-sm mb-1 ${isCompleted ? 'line-through' : ''}`}>
            {description}
          </p>
        )}
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-400">
            📅 {formatDate(dueDate)} {dueTime && `⏰ ${formatTime(dueTime)}`}
          </span>
          <span className={`font-medium ${getPriorityColor(priority)}`}>
            ⚡ {priority}
          </span>
          <span className="text-blue-300">
            📁 {category}
          </span>
        </div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag, idx) => (
              <span key={idx} className="bg-blue-700 text-white px-2 py-0.5 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Menu button */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-white p-1"
          title="More options"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
          </svg>
        </button>
        
        {showMenu && (
          <div className="absolute right-0 top-8 bg-gray-700 rounded-md shadow-lg z-10 py-1 min-w-32">
            {onTaskEdit && (
              <button
                onClick={() => {
                  setShowMenu(false);
                  onTaskEdit({
                    id,
                    taskName: title,
                    description,
                    dueDate,
                    dueTime,
                    priority,
                    category,
                    tags,
                    color,
                    completed
                  } as Task);
                }}
                className="block w-full text-left px-4 py-2 text-blue-400 hover:bg-gray-600 text-sm"
              >
                Edit
              </button>
            )}
            <button
              onClick={handleDeleteTask}
              className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-600 text-sm"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}