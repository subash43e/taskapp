import React from 'react';
import './sidebar-animations.css';
import Link from 'next/link';

export interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  // ...existing code...

  return (
    <div className='w-full h-full bg-gray-800 text-white p-4 relative select-none transition-all duration-300 flex flex-col'>
      <h2 className={`text-2xl font-bold mb-4 ${collapsed ? "hidden" : "block"}`}>Tasks</h2>
      <div>
        {!collapsed ? (
          <div
            className="text-white absolute right-4 top-6 cursor-pointer animate-slide-in-left duration-300"
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 hover:scale-[114%] transition-transform duration-200">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </div>
        ) : (
          <div
            className="text-white cursor-pointer mb-2 flex items-center p-2 rounded-lg hover:bg-gray-700 animate-slide-in-right duration-300"
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 hover:scale-[114%] transition-transform duration-200">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
            </svg>
          </div>
        )}
      </div>
      <ul className="flex flex-col h-full">
        <li className="mb-2" title='Inbox'>
          <Link href="/Inbox"
            className="flex items-center p-2 rounded-lg hover:bg-gray-700"
            draggable={false}
            onMouseDown={e => e.preventDefault()}
          >
            <span className="mr-3">{!collapsed ? "📥 Inbox" : "📥"}</span>
          </Link>
        </li>
        <li className="mb-2" title='Today'>
          <Link
            href="/Today"
            className="flex items-center p-2 rounded-lg hover:bg-gray-700"
            draggable={false}
            onMouseDown={e => e.preventDefault()}
          >
            <span className="mr-3">{!collapsed ? "☀️ Today" : "☀️"}</span>
          </Link>
        </li>
        <li className="mb-2" title='Upcoming'>
          <Link
            href="/Upcoming"
            className="flex items-center p-2 rounded-lg hover:bg-gray-700"
            draggable={false}
            onMouseDown={e => e.preventDefault()}
          >
            <span className="mr-3">{!collapsed ? "🔜 Upcoming" : "🔜"}</span>
          </Link>
        </li>
        <li className="mb-2" title='Completed'>
          <Link
            href="/Completed"
            className="flex items-center p-2 rounded-lg hover:bg-gray-700"
            draggable={false}
            onMouseDown={e => e.preventDefault()}
          >
            <span className="mr-3">{!collapsed ? "✅ Completed" : "✅"}</span>
          </Link>
        </li>
          {/* New Task button removed */}
      </ul>

    </div>
  )
};
