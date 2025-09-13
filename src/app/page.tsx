"use client"
import { useEffect, useState } from "react";
import Navbar from "../Components/NavBar";
import { Sidebar } from "../Components/Sidebar";

export default function Home() {

  const [size, setSize] = useState(350);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = () => setIsResizing(true);


  useEffect(() => {

    const handlingMouseMoving = (e) => {
      if (!isResizing) return;
      e.preventDefault();
      const movement = e.movementX;
      setSize(size + movement);
      console.log(e);
    }

    const handleMouseUp = () => setIsResizing(false);

    window.addEventListener("mousemove", handlingMouseMoving);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handlingMouseMoving);
      window.removeEventListener("mouseup", handleMouseUp);
    }
  }, [size, isResizing])


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
        <div style={{ width: `${size}px` }} >
          <Sidebar />
        </div>
        <div
          className={`w-1 top-0 bottom-0 right-0 cursor-col-resize hover:bg-blue-600 ${isResizing ? "bg-blue-600" : ""
            }`}
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
