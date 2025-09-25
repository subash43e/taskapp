"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { RootState, setSidebarSize, setIsResizing, setStartX, setStartWidth, hideTaskEdit } from '../store';
import Navbar from "./NavBar";
import { Sidebar } from "./Sidebar";
import TaskCreation from "./Task_Creation";
import TaskEdit from "./TaskEdit";
import NotificationToast from "./NotificationToast";
import notificationScheduler from "../services/notificationScheduler";
import emailService, { EmailConfig } from "../services/emailNotificationService";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const size = useSelector((state: RootState) => state.ui.sidebarSize);
  const isResizing = useSelector((state: RootState) => state.ui.isResizing);
  const startX = useSelector((state: RootState) => state.ui.startX);
  const startWidth = useSelector((state: RootState) => state.ui.startWidth);
  const showTaskCreation = useSelector((state: RootState) => state.ui.showTaskCreation);
  const showTaskEdit = useSelector((state: RootState) => state.ui.showTaskEdit);
  const editingTask = useSelector((state: RootState) => state.ui.editingTask);
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

  // Initialize notification services
  useEffect(() => {
    const initializeNotifications = async () => {
      // Request browser notification permission
      const hasPermission = await notificationScheduler.requestNotificationPermission();
      if (hasPermission) {
        console.log('Browser notifications enabled');
      }
      
      // Load and configure email service
      const userEmail = localStorage.getItem("userEmail") || "";
      const emailProvider = (localStorage.getItem("emailProvider") as 'mock' | 'web3forms' | 'custom') || 'mock';
      const web3formsKey = localStorage.getItem("web3formsKey") || "";
      const customApiEndpoint = localStorage.getItem("customApiEndpoint") || "";

      const emailConfig: EmailConfig = {
        provider: emailProvider,
        ...(emailProvider === 'web3forms' && { accessKey: web3formsKey }),
        ...(emailProvider === 'custom' && { apiEndpoint: customApiEndpoint })
      };
      
      emailService.configure(emailConfig);
      notificationScheduler.setUserEmail(userEmail);
      
      // Schedule daily digest (8 AM)
      notificationScheduler.scheduleDailyDigest(8);
    };

    initializeNotifications();
  }, []);

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
        <main className="flex-1 overflow-auto bg-[#111827] text-white">
          {children}
        </main>
      </section>
      {/* Task Creation Modal */}
      {showTaskCreation && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
          <TaskCreation />
        </div>
      )}
      {/* Task Edit Modal */}
      {showTaskEdit && editingTask && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
          <TaskEdit 
            task={editingTask} 
            onClose={() => dispatch(hideTaskEdit())}
            onTaskUpdate={() => window.location.reload()} // Simple refresh for now
          />
        </div>
      )}
      {/* Notification Toast */}
      <NotificationToast />
    </div>
  );
}