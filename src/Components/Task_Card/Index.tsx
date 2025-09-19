interface TaskCardProps {
  color: string;
  title: string;
  dueDate: string;
}

export default function Task_Card({ color, title, dueDate }: TaskCardProps) {
  return (
    <div className='flex flex-row gap-2 p-4 bg-[#1f2937] rounded-md items-center mb-3'>
      <input type="checkbox" className="accent-blue-500" />
      {/* Color indicator */}
      <div className={`h-8 w-2 rounded ${color}`} />
      {/* Task details */}
      <div className='flex flex-col justify-center ml-2'>
        <h1 className="text-white font-semibold text-lg">
          {title}
        </h1>
        <p className="text-gray-400 text-sm">
          {dueDate}
        </p>
      </div>
    </div>
  )
}