import { Task } from "@/src/Firebase/taskService";

interface TaskMenuProps {
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  onTaskEdit?: (task: Partial<Task>) => void;
  onTaskDelete: () => void;
  taskData: Partial<Task>;
}

export const TaskMenu = ({
  showMenu,
  setShowMenu,
  onTaskEdit,
  onTaskDelete,
  taskData,
}: TaskMenuProps) => {
  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="text-gray-400 hover:text-white p-1"
        title="More options"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
          />
        </svg>
      </button>

      {showMenu && (
        <div className="absolute right-0 top-8 bg-gray-700 rounded-md shadow-lg z-20 py-1 min-w-32">
          {onTaskEdit && (
            <button
              onClick={() => {
                setShowMenu(false);
                onTaskEdit(taskData);
              }}
              className="block w-full text-left px-4 py-2 text-blue-400 hover:bg-gray-600 text-sm"
            >
              Edit
            </button>
          )}
          <button
            onClick={onTaskDelete}
            className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-600 text-sm"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};