import React from 'react';

export const Sidebar = () => {

  return (
    <div className={`w-full bg-gray-800 text-white h-screen p-4`}>
      <h2 className="text-2xl font-bold mb-6">Tasks</h2>
      <nav>
        <ul>
          <li className="mb-2">
            <a href="#"
              className="flex items-center p-2 rounded-lg hover:bg-gray-700"
              draggable={false}
              onMouseDown={e => e.preventDefault()}
            >
              <span className="mr-3">📥</span> Inbox
            </a>
          </li>
          <li className="mb-2">
            <a
              href="#"
              className="flex items-center p-2 rounded-lg hover:bg-gray-700"
              draggable={false}
              onMouseDown={e => e.preventDefault()}
            >
              <span className="mr-3">☀️</span> Today
            </a>
          </li>
          <li className="mb-2">
            <a
              href="#"
              className="flex items-center p-2 rounded-lg hover:bg-gray-700"
              draggable={false}
              onMouseDown={e => e.preventDefault()}
            >
              <span className="mr-3">📅</span> Calendar
            </a>
          </li>
          <li className="mb-2">
            <a
              href="#"
              className="flex items-center p-2 rounded-lg hover:bg-gray-700"
              draggable={false}
              onMouseDown={e => e.preventDefault()}
            >
              <span className="mr-3">🔜</span> Upcoming
            </a>
          </li>
          <li className="mb-2">
            <a
              href="#"
              className="flex items-center p-2 rounded-lg hover:bg-gray-700"
              draggable={false}
              onMouseDown={e => e.preventDefault()}
            >
              <span className="mr-3">✅</span> Completed
            </a>
          </li>
          <li className="mb-2">
            <a
              href="#"
              className="flex items-center p-2 rounded-lg hover:bg-gray-700"
              draggable={false}
              onMouseDown={e => e.preventDefault()}
            >
              <span className="mr-3">🗑️</span> Trash
            </a>
          </li>
        </ul>
      </nav>
      <div className="mt-8">
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center">
          <span className="mr-2">+</span> New Task
        </button>
      </div>
    </div>
  )
};
