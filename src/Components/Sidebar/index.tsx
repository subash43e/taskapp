import React from 'react';

export const Sidebar = () => {

  return (
    <div className={`w-full bg-gray-800 text-white h-screen p-4 relative select-none`}>
      <h2 className="text-2xl font-bold mb-6">Tasks</h2>
      <div className='text-white absolute right-0 top-5 cursor-pointer'>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
      </div>
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
      <div className="mt-8">
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center">
          <span className="mr-2">+</span> New Task
        </button>
      </div>
    </div>
  )
};
