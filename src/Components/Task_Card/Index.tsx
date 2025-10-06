"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { updateTask, deleteTask, Task } from "@/src/Firebase/taskService";
import { showNotification } from "../../notificationSlice";
import {
  updateTask as updateTaskInState,
  deleteTask as deleteTaskFromState,
} from "../../tasksSlice";
import emailService from "../../services/emailNotificationService";
import notificationScheduler from "../../services/notificationScheduler";

interface TaskCardProps {
  id: string;
  color: string;
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  priority: "High" | "Medium" | "Low";
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
  onTaskEdit,
}: TaskCardProps) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  
  // State for task status and UI
  const [isCompleted, setIsCompleted] = useState(completed);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // NEW STATE for collapsible functionality
  const [showDetails, setShowDetails] = useState(false); 

  // Sync prop change with local state
  useEffect(() => {
    setIsCompleted(completed);
  }, [completed]);

  // Handler for completing/uncompleting the task
  const handleToggleComplete = async () => {
    try {
      const newStatus = !isCompleted;
      setIsCompleted(newStatus);

      if (!user?.uid) {
        throw new Error("User not authenticated");
      }

      // Update task in database & Redux state
      const updates = {
        completed: newStatus,
        updatedAt: new Date().toISOString(),
      };
      await updateTask(user.uid, id, updates);
      dispatch(updateTaskInState({ id, updates }));

      // Handle side-effects (notifications/reminders)
      if (newStatus) {
        // Task completed: send notification and cancel reminders
        await emailService.sendTaskCompletionNotification({
          taskName: title,
          completedAt: new Date(),
          userEmail: user?.email || "user@example.com",
          category,
          priority,
        });
        notificationScheduler.cancelTaskReminders(id);
        dispatch(
          showNotification({
            message: `Great job! "${title}" marked as complete 🎉`,
            type: "success",
          })
        );
      } else {
        // Task uncompleted: reschedule reminders if applicable
        if (dueDate && dueTime) {
          notificationScheduler.scheduleTaskReminder({
            taskId: id,
            taskName: title,
            dueDate,
            dueTime,
            userEmail: user?.email || "user@example.com",
            category,
            priority,
          });
        }
        dispatch(
          showNotification({
            message: `"${title}" marked as active`,
            type: "info",
          })
        );
      }

      onTaskUpdate();
    } catch (error) {
      console.error("Error updating task:", error);
      setIsCompleted(isCompleted); // Revert on error
      dispatch(
        showNotification({
          message: "Failed to update task status",
          type: "error",
        })
      );
    }
  };

  // Handler for deleting the task
  const handleDeleteTask = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        setIsDeleting(true);

        if (!user?.uid) {
          throw new Error("User not authenticated");
        }

        await deleteTask(user.uid, id);
        notificationScheduler.cancelTaskReminders(id); // Also cancel reminders on delete
        dispatch(deleteTaskFromState(id));

        dispatch(
          showNotification({
            message: "Task deleted successfully!",
            type: "success",
          })
        );

        onTaskUpdate();
      } catch (error) {
        console.error("Error deleting task:", error);
        setIsDeleting(false);
        dispatch(
          showNotification({
            message: "Failed to delete task. Please try again.",
            type: "error",
          })
        );
      }
    }
  };

  // Function to get the priority color based on the task
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-gray-400";
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

  const formatTime = (timeString?: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (isDeleting) {
    return (
      <div className="flex flex-row gap-2 p-4 bg-red-900/20 rounded-md items-center mb-3 opacity-50">
        <div className="text-white">Deleting...</div>
      </div>
    );
  }


  // Task Card Component

  return (
    <div
      className={`bg-[#1f2937] rounded-md mb-3 transition-all duration-200 relative group ${
        isCompleted ? "opacity-60" : ""
      }`}
    >
      {/* Task Header (Always Visible and Clickable for Collapse) */}
      <div
        className="flex flex-row gap-2 p-4 items-center cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        {/* Checkbox and Color Indicator (Not part of the click area for collapse) */}
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()} // Prevent click from triggering collapse
        >
          <input
            type="checkbox"
            className="accent-blue-500 cursor-pointer"
            checked={isCompleted}
            onChange={handleToggleComplete}
            title={isCompleted ? "Mark as Active" : "Mark as Complete"}
          />
          <div className={`h-8 w-2 rounded`} style={{ backgroundColor: color }} />
        </div>

        {/* Task Title (Main Clickable Area) */}
        <div className="flex-1 min-w-0">
          <h1
            className={`text-white font-semibold text-lg truncate ${
              isCompleted ? "line-through" : ""
            }`}
          >
            {title}
          </h1>
        </div>

        {/* Priority and Collapse Icon */}
        <div className="flex items-center gap-3 text-sm ml-auto">
          {/* Priority Tag */}
          <span className={`font-medium ${getPriorityColor(priority)} hidden sm:inline`}>
            ⚡ {priority}
          </span>
          
          {/* Collapse/Expand Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-5 h-5 text-gray-400 transform transition-transform ${
              showDetails ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Menu button (Not part of the click area for collapse) */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-white p-1"
            title="More options"
          >
            {/* The three-dot icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
              />
            </svg>
          </button>

          {/* Menu Dropdown */}
          {showMenu && (
            <div className="absolute right-0 top-8 bg-gray-700 rounded-md shadow-lg z-20 py-1 min-w-32">
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
                      completed,
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

      {/* Collapsible Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          showDetails ? "max-h-96 opacity-100 p-4 pt-0" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-gray-700 pt-3">
          {/* Description */}
          {description && (
            <p
              className={`text-gray-300 text-base mb-3 ${
                isCompleted ? "line-through" : ""
              }`}
            >
              {description}
            </p>
          )}

          {/* Metadata (Date, Time, Category, Priority on smaller screens) */}
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-gray-400">
                📅 {formatDate(dueDate)} {dueTime && `⏰ ${formatTime(dueTime)}`}
              </span>
              <span className={`font-medium ${getPriorityColor(priority)} inline sm:hidden`}>
                ⚡ {priority}
              </span>
              <span className="text-blue-300">📁 {category}</span>
            </div>
            
            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-700 text-white px-2 py-0.5 rounded text-xs whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}