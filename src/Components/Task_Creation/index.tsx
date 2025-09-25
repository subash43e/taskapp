import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import { RootState, hideTaskCreation } from '../../store';
import { showNotification } from '../../notificationSlice';
import { 
  setTaskName, 
  setDescription, 
  setDueDate, 
  setDueTime,
  setPriority, 
  setCategory, 
  setColor, 
  setTags, 
  addTag, 
  removeTag, 
  clearAllTags, 
  addMultipleTags,
  setTagInput,
  setCategoryInput,
  setShowCategorySuggestions,
  setShowTagSuggestions,
  addCategory,
  addAvailableTag,
  selectCategory,
  selectTag,
  resetTaskForm
} from '../../taskCreationSlice';
import { db } from "@/src/Firebase/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import notificationScheduler from "../../services/notificationScheduler";

const priorities = ["Low", "Medium", "High"];
// Using categories and tags from Redux store now
// Removed projects


export default function TaskCreation() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const { 
        taskName, 
        description, 
        dueDate, 
        dueTime,
        priority, 
        category, 
        color, 
        tags,
        tagInput,
        categoryInput,
        showCategorySuggestions: showSuggestions,
        showTagSuggestions,
        availableCategories: categories,
        availableTags
    } = useSelector((state: RootState) => state.taskCreation);

    // Filter categories for autocomplete
    const filteredCategories = categoryInput
        ? categories.filter(c => c.toLowerCase().includes(categoryInput.toLowerCase()))
        : categories;
        
    // Filter tags for autocomplete
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

    const manageSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
                alert(`${field.label} is required`);
                return;
            }
        }

        try {
            // Save new category if it doesn't exist
            if (categoryInput && !categories.some(c => c.toLowerCase() === categoryInput.toLowerCase())) {
                dispatch(addCategory(categoryInput));
            }
            
            // Prepare cleaned tags (filter out any potential empty values)
            const cleanedTags = tags.filter(tag => tag.trim() !== "");
            
            // Save the task to Firestore
            const docRef = await addDoc(collection(db, "tasks"), {
                taskName: taskName.trim(),
                description: description.trim(),
                dueDate,
                dueTime,
                priority,
                category: categoryInput.trim(),
                tags: cleanedTags,
                color,
                completed: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            
            // Schedule reminders for the new task if it has date and time
            if (dueDate && dueTime) {
                notificationScheduler.scheduleTaskReminder({
                    id: docRef.id,
                    taskName: taskName.trim(),
                    dueDate,
                    dueTime,
                    userEmail: user?.email || "user@example.com", // This should come from user auth
                    category: categoryInput.trim(),
                    priority
                });
                
                console.log(`Scheduled reminders for task: ${taskName}`);
            }
            
            // Reset form after successful submission
            dispatch(hideTaskCreation());
            dispatch(resetTaskForm());
            dispatch(showNotification({
                message: `Task "${taskName}" created successfully! ${dueTime ? 'Reminders have been set.' : ''}`,
                type: 'success'
            }));
        } catch (error) {
            console.error("Error adding task: ", error);
            dispatch(showNotification({
                message: "Failed to create task. Please try again.",
                type: 'error'
            }));
        }
    };

    return (
        <div className="w-full h-full flex justify-center items-start p-6 overflow-y-auto">
            <div className="bg-gray-800 rounded-2xl shadow-lg p-8 w-[820px] max-w-[95vw]">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-white font-bold text-2xl mb-6">Create New Task</h2>
                    <div className="mb-6 hover:bg-red-400 rounded-xl bg-red-600 text-white" onClick={() => dispatch(hideTaskCreation())}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </div>
                </div>
                <form onSubmit={manageSubmit}>
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
                                style={{
                                    colorScheme: "dark"
                                }}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-gray-300 font-medium text-sm block mb-2">Due Time</label>
                            <input
                                type="time"
                                value={dueTime}
                                onChange={e => dispatch(setDueTime(e.target.value))}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-base outline-none focus:border-blue-500 transition-colors"
                                style={{
                                    colorScheme: "dark"
                                }}
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
                            {showSuggestions && categoryInput && !filteredCategories.some(c => c.toLowerCase() === categoryInput.toLowerCase()) && (
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
                            onClick={() => dispatch(hideTaskCreation())}
                        >
                            Close
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base border-none rounded-lg px-4 py-2.5 cursor-pointer flex items-center gap-2 transition-colors"
                        >
                            <span className="font-bold">+</span>
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}