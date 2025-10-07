import { TaskMetadata } from "./TaskMetadata";
import { TaskTags } from "./TaskTags";

interface TaskDetailsProps {
  description?: string | undefined;
  dueDate: string;
  dueTime?: string | undefined;
  priority: string;
  category: string;
  tags: string[];
  isCompleted: boolean;
  showDetails: boolean;
}

export const TaskDetails = ({
  description = '',
  dueDate,
  dueTime = undefined,
  priority,
  category,
  tags,
  isCompleted,
  showDetails,
}: TaskDetailsProps) => {
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ${
        showDetails ? "max-h-96 opacity-100 p-4 pt-0" : "max-h-0 opacity-0"
      }`}
    >
      <div className="border-t border-gray-700 pt-3">
        {description && (
          <p
            className={`text-gray-300 text-base mb-3 ${
              isCompleted ? "line-through" : ""
            }`}
          >
            {description}
          </p>
        )}

        <div className="flex flex-col gap-2 text-sm">
          <TaskMetadata
            dueDate={dueDate}
            dueTime={dueTime}
            priority={priority}
            category={category}
          />
          <TaskTags tags={tags} />
        </div>
      </div>
    </div>
  );
};