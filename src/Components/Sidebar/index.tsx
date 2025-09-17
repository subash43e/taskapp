import React from 'react';

export const Sidebar = () => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className={`w-full bg-gray-800 text-white h-screen p-4 relative select-none`}>
      <h2 className={`text-2xl font-bold mb-6 ${collapsed ? "hidden" : "block"}`}>Tasks</h2>
      <div>
        {!collapsed ? (
          <div
            className="text-white absolute right-4 top-6 cursor-pointer"
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
          >
            {/* Left Arrow */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 hover:scale-[114%] transition-transform duration-200">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </div>
        ) : (
          <div
            className="text-white absolute right-4 top-6 cursor-pointer"
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
          >
            {/* Hamburger */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 hover:scale-[114%] transition-transform duration-200">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
            </svg>
          </div>
        )}
      </div>
      <ul>
        <li className="mb-2" title='Inbox'>
          <a href="#"
            className="flex items-center p-2 rounded-lg hover:bg-gray-700"
            draggable={false}
            onMouseDown={e => e.preventDefault()}
          >
            <span className="mr-3">{!collapsed ?"📥 Inbox" : "📥"}</span>
          </a>
        </li>
        <li className="mb-2" title='Today'>
          <a
            href="#"
            className="flex items-center p-2 rounded-lg hover:bg-gray-700"
            draggable={false}
            onMouseDown={e => e.preventDefault()}
          >
            <span className="mr-3">{!collapsed ?"☀️ Today" : "☀️"}</span>
          </a>
        </li>
        <li className="mb-2" title='Calendar'>
          <a
            href="#"
            className="flex items-center p-2 rounded-lg hover:bg-gray-700"
            draggable={false}
            onMouseDown={e => e.preventDefault()}
          >
            <span className="mr-3">{!collapsed ?"📅 Calendar" : "📅"}</span>
          </a>
        </li>
        <li className="mb-2" title='Upcoming'>
          <a
            href="#"
            className="flex items-center p-2 rounded-lg hover:bg-gray-700"
            draggable={false}
            onMouseDown={e => e.preventDefault()}
          >
            <span className="mr-3">{!collapsed ?"🔜 Upcoming" : "🔜"}</span>
          </a>
        </li>
        <li className="mb-2" title='Completed'>
          <a
            href="#"
            className="flex items-center p-2 rounded-lg hover:bg-gray-700"
            draggable={false}
            onMouseDown={e => e.preventDefault()}
          >
            <span className="mr-3">{!collapsed ?"✅ Completed" : "✅"}</span>
          </a>
        </li>
        <li className="mb-2" title='Trash'>
          <a
            href="#"
            className="flex items-center p-2 rounded-lg hover:bg-gray-700"
            draggable={false}
            onMouseDown={e => e.preventDefault()}
          >
            <span className="mr-3">{!collapsed ?"🗑️ Trash" : "🗑️"}</span>
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
