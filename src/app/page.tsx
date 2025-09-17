"use client"
import { useEffect, useState } from "react";
import Navbar from "../Components/NavBar";
import { Sidebar } from "../Components/Sidebar";

export default function Home() {

  const [size, setSize] = useState(230);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(180);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(size);
  }

  useEffect(() => {
    const handlingMouseMoving = (e: MouseEvent) => {
      if (!isResizing) return;
      e.preventDefault();
      
      const currentX = e.clientX;
      const diff = currentX - startX;
      const newWidth = startWidth + diff;
      
      // Apply min and max constraints
      const constrainedWidth = Math.min(Math.max(newWidth, 160), 400);
      setSize(constrainedWidth);
    }

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener("mousemove", handlingMouseMoving);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handlingMouseMoving);
      window.removeEventListener("mouseup", handleMouseUp);
    }
  }, [isResizing, startX, startWidth])


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
        <div style={{ width: `${size}px` }} className="min-w-[160px] max-w-[300px]" >
          <Sidebar />
        </div>

        <div
          className={`w-[2px] hover:w-1 top-0 bottom-0 right-0 cursor-col-resize hover:bg-blue-600 ${isResizing ? "bg-blue-600" : ""}`}
          onMouseDown={handleMouseDown} 
        />

        {/* Body code here going here. */}
        <main className="resize-y border border-white bg-yellow-300 grow">
          <h1>hello</h1>
        </main>
      </section>
    </div>
  );
}
