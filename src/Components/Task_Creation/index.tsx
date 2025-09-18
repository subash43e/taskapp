import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import { RootState, hideTaskCreation } from '../../store';
import { setTaskName, setDescription, setDueDate, setPriority, setCategory, setProject } from '../../taskCreationSlice';

const priorities = ["Low", "Medium", "High"];
const categories = ["Design", "Development", "Testing", "Research"];
const projects = ["Website Redesign", "Mobile App", "API Integration"];

export default function TaskCreation() {
    const dispatch = useDispatch();
    const { taskName, description, dueDate, priority, category, project } = useSelector((state: RootState) => state.taskCreation);

    return (
        <div className="w-full h-full flex justify-center items-start p-6 overflow-y-auto">
            <div className="bg-gray-800 rounded-2xl shadow-lg p-8 w-[520px] max-w-[95vw]">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-white font-bold text-2xl mb-6">Create New Task</h2>
                    <div className="mb-6 hover:bg-red-400 rounded-2xl bg-red-600" onClick={() => dispatch(hideTaskCreation())}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </div>
                </div>
                <form>
                    <label className="text-gray-300 font-medium text-sm">Task Name</label>
                    <input
                        type="text"
                        placeholder="e.g., Write project proposal"
                        value={taskName}
                        onChange={e => dispatch(setTaskName(e.target.value))}
                        className="w-full mt-2 mb-6 px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-base outline-none focus:border-blue-500 transition-colors"
                    />

                    <label className="text-gray-300 font-medium text-sm">Description</label>
                    <textarea
                        placeholder="Add a detailed description"
                        value={description}
                        onChange={e => dispatch(setDescription(e.target.value))}
                        rows={4}
                        className="w-full mt-2 mb-6 px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-base resize-none outline-none focus:border-blue-500 transition-colors"
                    />

                    <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <label className="text-gray-300 font-medium text-sm">Due Date</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={e => dispatch(setDueDate(e.target.value))}
                                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-base outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-gray-300 font-medium text-sm">Priority</label>
                            <select
                                value={priority}
                                onChange={e => dispatch(setPriority(e.target.value))}
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

                    <div className="flex gap-4 mb-8">
                        <div className="flex-1">
                            <label className="text-gray-300 font-medium text-sm">Category</label>
                            <select
                                value={category}
                                onChange={e => dispatch(setCategory(e.target.value))}
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
                                onChange={e => dispatch(setProject(e.target.value))}
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

                    <div className="flex gap-2 items-center justify-between">
                        <button
                            type="button"
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold text-base border-none rounded-lg px-4 py-2.5 cursor-pointer transition-colors"
                            onClick={() => dispatch(hideTaskCreation())}
                        >
                            Close
                        </button>
                        <button
                            type="button"
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
