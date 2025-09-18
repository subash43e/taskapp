"use client"
import React from "react";
import { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { RootState, setSidebarSize, setIsResizing, setStartX, setStartWidth } from '../store';
import Navbar from "../Components/NavBar";
import { Sidebar } from "../Components/Sidebar";


export default function Home() {
  const dispatch = useDispatch();
  const size = useSelector((state: RootState) => state.ui.sidebarSize);
  const isResizing = useSelector((state: RootState) => state.ui.isResizing);
  const startX = useSelector((state: RootState) => state.ui.startX);
  const startWidth = useSelector((state: RootState) => state.ui.startWidth);
  const [collapsed, setCollapsed] = React.useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (collapsed) return;
    e.preventDefault();
    dispatch(setIsResizing(true));
    dispatch(setStartX(e.clientX));
    dispatch(setStartWidth(size));
  };

  useEffect(() => {
    if (collapsed) return;
    const handlingMouseMoving = (e: MouseEvent) => {
      if (!isResizing) return;
      e.preventDefault();
      const currentX = e.clientX;
      const diff = currentX - startX;
      const newWidth = startWidth + diff;
      const constrainedWidth = Math.min(Math.max(newWidth, 165), 300);
      dispatch(setSidebarSize(constrainedWidth));
    };
    const handleMouseUp = () => dispatch(setIsResizing(false));
    if (isResizing) {
      window.addEventListener("mousemove", handlingMouseMoving);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handlingMouseMoving);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, startX, startWidth, dispatch, size, collapsed]);

  return (
    <div>
      {/* Navigation for Task Managing Application. */}
      <section>
        <nav>
          <Navbar />
        </nav>
      </section>
      <section className="bg-blue-900 h-screen flex" >
        {/* Side bar code going here. */}
        <div style={{ width: collapsed ? '72px' : `${size}px` }} className="min-w-[56px] max-w-[300px]" >
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>
        {!collapsed && (
          <div
            className={`w-[2px] hover:w-1 top-0 bottom-0 right-0 cursor-col-resize hover:bg-blue-600 ${isResizing ? "bg-blue-600" : ""}`}
            onMouseDown={handleMouseDown}
          />
        )}
        {/* Body code here going here. */}
        <main className="resize-y  bg-slate-700 grow text-white">
          <h1>hello</h1>
        </main>
      </section>
    </div>
  );
}

