interface TaskHeaderProps {
  title: string;
  color: string;
  isCompleted: boolean;
  priority: string;
  showDetails: boolean;
  onToggleComplete: () => void;
  onToggleDetails: () => void;
}

export const TaskHeader = ({
  title,
  color,
  isCompleted,
  priority,
  showDetails,
  onToggleComplete,
  onToggleDetails,
}: TaskHeaderProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div
      className="flex flex-row gap-2 p-4 items-center cursor-pointer w-full"
      onClick={onToggleDetails}
    >
      <div
        className="flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          className="accent-blue-500 cursor-pointer"
          checked={isCompleted}
          onChange={onToggleComplete}
          title={isCompleted ? "Mark as Active" : "Mark as Complete"}
        />
        <div
          className={`h-8 w-2 rounded`}
          style={{ backgroundColor: color }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <h1
          className={`text-white font-semibold text-lg truncate ${
            isCompleted ? "line-through" : ""
          }`}
        >
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3 text-sm ml-auto">
        <span className={`font-medium ${getPriorityColor(priority)} hidden sm:inline mr-4`}>
          ⚡ {priority}
        </span>
        
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-5 h-5 text-gray-400 transform transition-transform ${
            showDetails ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};