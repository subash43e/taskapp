"use client"

import Task_Card from "@/src/Components/Task_Card/Index";


export default function Home() {
  const task_card_Color_Indicator = "bg-yellow-400";
  const task_card_title = "Grocery Shopping";
  const task_card_due_date = "Due Today";
  return (
    <>
      <div className="p-4">
        <section className='flex gap-1 justify-between mb-4'>
          <p>search task</p>
          <p>filter</p>
          <p>sort by</p>
        </section>
        <section>
          {/* Task Card */}
          <Task_Card 
            color={task_card_Color_Indicator}
            title={task_card_title}
            dueDate={task_card_due_date}
          />
          <Task_Card 
            color={task_card_Color_Indicator}
            title={task_card_title}
            dueDate={task_card_due_date}
          />
          {/* Add more cards below as needed */}
        </section>
      </div>
    </>
  );
}

