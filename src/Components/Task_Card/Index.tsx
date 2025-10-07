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
import { TaskHeader } from "./components/TaskHeader";
import { TaskMenu } from "./components/TaskMenu";
import { TaskDetails } from "./components/TaskDetails";

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
  onTaskEdit?: (task: Partial<Task>) => void;
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

  const taskData: Partial<Task> = {
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
  };

  return (
    <div
      className={`bg-[#1f2937] rounded-md mb-3 transition-all duration-200 relative group hover:bg-[#1a2231] ${
        isCompleted ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex-grow">
          <TaskHeader
            title={title}
            color={color}
            isCompleted={isCompleted}
            priority={priority}
            showDetails={showDetails}
            onToggleComplete={handleToggleComplete}
            onToggleDetails={() => setShowDetails(!showDetails)}
          />
        </div>
        <div className="flex-shrink-0">
          <TaskMenu
            showMenu={showMenu}
            setShowMenu={setShowMenu}
            onTaskEdit={onTaskEdit}
            onTaskDelete={handleDeleteTask}
            taskData={taskData}
          />
        </div>
      </div>

      <TaskDetails
        description={description}
        dueDate={dueDate}
        dueTime={dueTime}
        priority={priority}
        category={category}
        tags={tags}
        isCompleted={isCompleted}
        showDetails={showDetails}
      />
    </div>
  );
}