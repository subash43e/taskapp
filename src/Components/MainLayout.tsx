"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { RootState, setSidebarSize, setIsResizing, setStartX, setStartWidth } from '../store';
import Navbar from "./NavBar";
import { Sidebar } from "./Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
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
  }, [isResizing, startX, startWidth, dispatch, collapsed]);

  return (
    <div className="min-h-screen w-full flex flex-col">
      <header>
          <Navbar />
      </header>
      <section className="flex-1 flex bg-blue-900 overflow-hidden" >
        <div style={{ width: collapsed ? '72px' : `${size}px` }} className="min-w-[56px] max-w-[300px]">
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>
        {!collapsed && (
          <div
            className={`w-[2px] hover:w-1 top-0 bottom-0 right-0 cursor-col-resize hover:bg-blue-600 ${isResizing ? "bg-blue-600" : ""}`}
            onMouseDown={handleMouseDown}
          />
        )}
        <main className="flex-1 overflow-auto bg-slate-700 text-white">
          {children}
        </main>
      </section>
    </div>
  );
}