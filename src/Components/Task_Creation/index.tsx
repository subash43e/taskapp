import React, { useState } from "react";

const priorities = ["Low", "Medium", "High"];
const categories = ["Design", "Development", "Testing", "Research"];
const projects = ["Website Redesign", "Mobile App", "API Integration"];

export default function TaskCreation() {
    const [taskName, setTaskName] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("");
    const [category, setCategory] = useState("");
    const [project, setProject] = useState("");

    return (
        <div className="w-full h-full flex justify-center items-start p-6 overflow-y-auto">
            {/* Form Card */}
            <div className="bg-gray-800 rounded-2xl shadow-lg p-8 w-[520px] max-w-[95vw]">
                <h2 className="text-white font-bold text-2xl mb-6">Create New Task</h2>
                <form>
                    {/* Task Name */}
                    <label className="text-gray-300 font-medium text-sm">Task Name</label>
                    <input
                        type="text"
                        placeholder="e.g., Write project proposal"
                        value={taskName}
                        onChange={e => setTaskName(e.target.value)}
                        className="w-full mt-2 mb-6 px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-base outline-none focus:border-blue-500 transition-colors"
                    />

                    {/* Description */}
                    <label className="text-gray-300 font-medium text-sm">Description</label>
                    <textarea
                        placeholder="Add a detailed description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={4}
                        className="w-full mt-2 mb-6 px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-base resize-none outline-none focus:border-blue-500 transition-colors"
                    />

                    {/* Row: Due Date & Priority */}
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <label className="text-gray-300 font-medium text-sm">Due Date</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-base outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-gray-300 font-medium text-sm">Priority</label>
                            <select
                                value={priority}
                                onChange={e => setPriority(e.target.value)}
                                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-base outline-none focus:border-blue-500 transition-colors appearance-none"
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

                    {/* Row: Category & Project */}
                    <div className="flex gap-4 mb-8">
                        <div className="flex-1">
                            <label className="text-gray-300 font-medium text-sm">Category</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-base outline-none focus:border-blue-500 transition-colors appearance-none"
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="text-gray-300 font-medium text-sm">Project</label>
                            <select
                                value={project}
                                onChange={e => setProject(e.target.value)}
                                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-base outline-none focus:border-blue-500 transition-colors appearance-none"
                            >
                                <option value="">Select Project</option>
                                {projects.map(p => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Create Task Button */}
                    <button
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base border-none rounded-lg px-6 py-2.5 cursor-pointer flex items-center gap-2 ml-auto transition-colors"
                    >
                        <span className="text-xl font-bold">+</span>
                        Create Task
                    </button>
                </form>
            </div>
        </div>
    );
}
