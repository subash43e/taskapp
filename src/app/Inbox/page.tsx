"use client"

import Task_Card from "@/src/Components/Task_Card/index";
import { db } from "@/src/Firebase/firebase";
import { collection, doc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
export default function Home() {

  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const querySnapshot = await getDocs(collection(db, "tasks"));
      const TaskList:any = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(TaskList);
    };
    fetchTasks();
  }, []);

  const task_card_Color_Indicator = "#" + Math.floor(Math.random()*16777215).toString(16);
  console.log(task_card_Color_Indicator);
  return (
    <>
      <div className="p-4">
        <section className='flex gap-1 justify-between mb-4'>
          <p>Search your task</p>
          <span className="flex gap-4">
            <p>filter</p>
            <p>sort by</p>
          </span>
        </section>
        <section>
          {tasks.map((task: any) => (
            <Task_Card
              key={task.id}
              color={task_card_Color_Indicator}
              title={task.taskName}
              dueDate={task.dueDate}
            />))}

          {/* Add more cards below as needed */}
        </section>
      </div>
    </>
  );
}

