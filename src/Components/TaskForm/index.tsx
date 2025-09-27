import React, { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { RootState, hideTaskCreation } from '../../store';
import { showNotification } from '../../notificationSlice';
import { addTask, updateTask as updateTaskInState } from '../../tasksSlice';
import { 
  setTaskName, 
  setDescription, 
  setDueDate, 
  setDueTime,
  setPriority, 
  setColor, 
  removeTag, 
  clearAllTags, 
  setTagInput,
  setCategoryInput,
  setShowCategorySuggestions,
  setShowTagSuggestions,
  addCategory,
  selectCategory,
  selectTag,
  resetTaskForm
} from '../../taskCreationSlice';
import { createTask, updateTask } from "@/src/Firebase/taskService";
import notificationScheduler from "../../services/notificationScheduler";

const priorities = ["Low", "Medium", "High"];

interface TaskFormProps {
  mode: 'create' | 'edit';
  task?: import("@/src/Firebase/taskService").Task; // For edit mode
  onClose: () => void;
  onTaskUpdate?: () => void; // Optional callback for additional updates
}

export default function TaskForm({ mode, task, onClose, onTaskUpdate }: TaskFormProps) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { 
    taskName, 
    description, 
    dueDate, 
    dueTime,
    priority, 
    color, 
    tags,
    tagInput,
    categoryInput,
    showCategorySuggestions: showSuggestions,
    showTagSuggestions,
    availableCategories: categories,
    availableTags
  } = useSelector((state: RootState) => state.taskCreation);

  // Populate form with existing task data for edit mode
  useEffect(() => {
    if (mode === 'edit' && task) {
      dispatch(setTaskName(task.taskName || ''));
      dispatch(setDescription(task.description || ''));
      dispatch(setDueDate(task.dueDate || ''));
      dispatch(setDueTime(task.dueTime || ''));
      dispatch(setPriority(task.priority || ''));
      dispatch(setCategoryInput(task.category || ''));
      dispatch(setColor(task.color || '#2196f3'));
      dispatch(setTagInput(''));
      // Set tags - ensure it's an array
      const taskTags = Array.isArray(task.tags) ? task.tags : [];
      dispatch(clearAllTags());
      taskTags.forEach((tag: string) => dispatch(selectTag(tag)));
    } else if (mode === 'create') {
      // Reset form for create mode
      dispatch(resetTaskForm());
    }
  }, [mode, task, dispatch]);

  // Filter categories and tags for autocomplete
  const filteredCategories = categoryInput
    ? categories.filter(c => c.toLowerCase().includes(categoryInput.toLowerCase()))
    : categories;
        
  const filteredTags = tagInput
    ? availableTags.filter(t => t.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(t))
    : availableTags.filter(t => !tags.includes(t));

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setCategoryInput(e.target.value));
    dispatch(setShowCategorySuggestions(true));
  };

  const handleCategorySelect = (cat: string) => {
    dispatch(selectCategory(cat));
  };
  
  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setTagInput(e.target.value));
    dispatch(setShowTagSuggestions(true));
  };

  const handleTagSelect = (tag: string) => {
    dispatch(selectTag(tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!user?.uid) {
      dispatch(showNotification({
        message: "You must be logged in to manage tasks.",
        type: "error"
      }));
      return;
    }

    // For edit mode, check if user owns this task
    if (mode === 'edit' && task?.userId && task.userId !== user.uid) {
      dispatch(showNotification({
        message: "You can only edit your own tasks.",
        type: "error"
      }));
      return;
    }

    // Form validation
    const requiredFields = [
      { key: "taskName", value: taskName, label: "Task Name" },
      { key: "description", value: description, label: "Description" },
      { key: "dueDate", value: dueDate, label: "Due Date" },
      { key: "dueTime", value: dueTime, label: "Due Time" },
      { key: "priority", value: priority, label: "Priority" },
      { key: "category", value: categoryInput, label: "Category" },
    ];

    for (const field of requiredFields) {
      if (!field.value || (typeof field.value === "string" && !field.value.trim())) {
        dispatch(showNotification({
          message: `${field.label} is required`,
          type: 'error'
        }));
        return;
      }
    }

    try {
      const cleanedTags = tags.filter(tag => tag.trim() !== "");
      
      const taskData = {
        taskName: taskName.trim(),
        description: description.trim(),
        dueDate,
        dueTime,
        priority: priority as 'High' | 'Medium' | 'Low',
        category: categoryInput.trim(),
        tags: cleanedTags,
        color
      };

      if (mode === 'create') {
        // Save new category if it doesn't exist
        if (categoryInput && !categories.some(c => c.toLowerCase() === categoryInput.toLowerCase())) {
          dispatch(addCategory(categoryInput));
        }
        
        // Create new task
        const taskId = await createTask(user.uid, {
          ...taskData,
          completed: false
        });
        
        // Create the task object for Redux state
        const newTask = {
          id: taskId,
          ...taskData,
          completed: false,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Add the task to Redux state for real-time updates
        dispatch(addTask(newTask));
        
        // Schedule reminders for the new task if it has date and time
        if (dueDate && dueTime) {
          notificationScheduler.scheduleTaskReminder({
            id: taskId,
            taskName: taskName.trim(),
            dueDate,
            dueTime,
            userEmail: user?.email || "user@example.com",
            category: categoryInput.trim(),
            priority
          });
          
          console.log(`Scheduled reminders for task: ${taskName}`);
        }
        
        dispatch(hideTaskCreation());
        dispatch(showNotification({
          message: `Task "${taskName}" created successfully! ${dueTime ? 'Reminders have been set.' : ''}`,
          type: 'success'
        }));
      } else {
        // Update existing task only if task and task.id are defined
        if (task && task.id) {
          await updateTask(user.uid, task.id, taskData);
          // Update Redux state with the new data
          dispatch(updateTaskInState({
            id: task.id,
            updates: {
              ...taskData,
              updatedAt: new Date().toISOString()
            }
          }));
          dispatch(showNotification({
            message: `Task "${taskName}" updated successfully!`,
            type: 'success'
          }));
        } else {
          dispatch(showNotification({
            message: "Task ID is missing. Cannot update task.",
            type: 'error'
          }));
        }
      }
      
      // Clean up and close
      dispatch(resetTaskForm());
      onClose();
      onTaskUpdate?.(); // Call optional callback
      
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} task:`, error);
      dispatch(showNotification({
        message: `Failed to ${mode} task. Please try again.`,
        type: 'error'
      }));
    }
  };

  const handleClose = () => {
    dispatch(resetTaskForm());
    if (mode === 'create') {
      dispatch(hideTaskCreation());
    }
    onClose();
  };

  return (
    <div className="w-full h-full flex justify-center items-start p-6 overflow-y-auto">
      <div className="bg-gray-800 rounded-2xl shadow-lg p-8 w-[820px] max-w-[95vw]">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-white font-bold text-2xl mb-6">
            {mode === 'create' ? 'Create New Task' : 'Edit Task'}
          </h2>
          <button
            onClick={handleClose}
            className="mb-6 hover:bg-red-400 rounded-xl bg-red-600 text-white p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="text-gray-300 font-medium text-sm block mb-2">Task Name</label>
            <input
              type="text"
              placeholder="e.g., Write project proposal"
              value={taskName}
              onChange={e => dispatch(setTaskName(e.target.value))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-base outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="text-gray-300 font-medium text-sm block mb-2">Description</label>
            <textarea
              placeholder="Add a detailed description"
              value={description}
              onChange={e => dispatch(setDescription(e.target.value))}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-base resize-none outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <label className="text-gray-300 font-medium text-sm block mb-2">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => dispatch(setDueDate(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-base outline-none focus:border-blue-500 transition-colors pr-10"
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div className="flex-1">
              <label className="text-gray-300 font-medium text-sm block mb-2">Due Time</label>
              <input
                type="time"
                value={dueTime}
                onChange={e => dispatch(setDueTime(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-base outline-none focus:border-blue-500 transition-colors"
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div className="flex-1">
              <label className="text-gray-300 font-medium text-sm block mb-2">Priority</label>
              <select
                value={priority}
                onChange={e => dispatch(setPriority(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-base outline-none focus:border-blue-500 transition-colors appearance-none"
              >
                <option value="">Select Priority</option>
                {priorities.map(p => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4 mb-8 items-start">
            <div className="flex-1 relative">
              <label className="text-gray-300 font-medium text-sm block mb-2">Category</label>
              <input
                type="text"
                placeholder="Type or select category"
                value={categoryInput}
                onChange={handleCategoryChange}
                onFocus={() => dispatch(setShowCategorySuggestions(true))}
                onBlur={() => setTimeout(() => dispatch(setShowCategorySuggestions(false)), 150)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-base outline-none focus:border-blue-500 transition-colors"
                autoComplete="off"
              />
              {showSuggestions && filteredCategories.length > 0 && (
                <ul className="absolute z-10 bg-gray-700 border border-gray-600 rounded-lg mt-1 w-full max-h-40 overflow-y-auto">
                  {filteredCategories.map(c => (
                    <li
                      key={c}
                      className="px-4 py-2 text-white cursor-pointer hover:bg-blue-600"
                      onMouseDown={() => handleCategorySelect(c)}
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              )}
              {showSuggestions && categoryInput && !filteredCategories.some(c => c.toLowerCase() === categoryInput.toLowerCase()) && mode === 'create' && (
                <div className="absolute z-10 bg-gray-700 border border-gray-600 rounded-lg mt-1 w-full">
                  <div className="px-4 py-2 text-green-400">Add "{categoryInput}" as new category</div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-center">
              <label className="text-gray-300 font-medium text-sm block mb-2 self-start">Color</label>
              <input
                type="color"
                value={color}
                onChange={e => dispatch(setColor(e.target.value))}
                className="w-12 h-12 p-0 border-none bg-transparent cursor-pointer self-start"
                title="Pick a color for this task"
              />
            </div>

            <div className="flex-1 relative">
              <div className="flex justify-between items-center mb-2">
                <label className="text-gray-300 font-medium text-sm">Tags</label>
                {tags.length > 0 && (
                  <button 
                    type="button"
                    onClick={() => dispatch(clearAllTags())}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Type or select tag and press Enter"
                value={tagInput}
                onChange={handleTagChange}
                onFocus={() => dispatch(setShowTagSuggestions(true))}
                onBlur={() => setTimeout(() => dispatch(setShowTagSuggestions(false)), 150)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && tagInput.trim()) {
                    e.preventDefault();
                    dispatch(selectTag(tagInput.trim()));
                  }
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-base outline-none focus:border-blue-500 transition-colors"
                autoComplete="off"
              />
              
              {/* Tag suggestions dropdown */}
              {showTagSuggestions && filteredTags.length > 0 && (
                <ul className="absolute z-10 bg-gray-700 border border-gray-600 rounded-lg mt-1 w-full max-h-40 overflow-y-auto">
                  {filteredTags.map(t => (
                    <li
                      key={t}
                      className="px-4 py-2 text-white cursor-pointer hover:bg-blue-600"
                      onMouseDown={() => handleTagSelect(t)}
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              )}
              
              {/* New tag suggestion */}
              {showTagSuggestions && tagInput && !availableTags.some(t => t.toLowerCase() === tagInput.toLowerCase()) && tagInput.trim() !== "" && (
                <div className="absolute z-10 bg-gray-700 border border-gray-600 rounded-lg mt-1 w-full">
                  <div 
                    className="px-4 py-2 text-green-400 cursor-pointer hover:bg-gray-600"
                    onMouseDown={() => handleTagSelect(tagInput.trim())}
                  >
                    Add "{tagInput}" as new tag
                  </div>
                </div>
              )}
              
              {/* Display selected tags */}
              <div className="flex flex-wrap gap-2 mt-3 min-h-[28px]">
                {tags.map((tag, idx) => (
                  <span key={idx} className="bg-blue-700 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                    {tag}
                    <button 
                      type="button" 
                      className="ml-1 text-red-400 hover:text-red-600" 
                      onClick={() => dispatch(removeTag(tag))}
                      title="Remove tag"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-center justify-between">
            <button
              type="button"
              className="bg-red-600 hover:bg-red-400 text-white font-semibold text-base border-none rounded-lg px-4 py-2.5 cursor-pointer transition-colors"
              onClick={handleClose}
            >
              {mode === 'create' ? 'Close' : 'Cancel'}
            </button>
            <button
              type="submit"
              className={`${
                mode === 'create' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
              } text-white font-semibold text-base border-none rounded-lg px-4 py-2.5 cursor-pointer flex items-center gap-2 transition-colors`}
            >
              <span>{mode === 'create' ? '+' : '✓'}</span>
              {mode === 'create' ? 'Create Task' : 'Update Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}