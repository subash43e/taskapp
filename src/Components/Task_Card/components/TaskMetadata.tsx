interface TaskMetadataProps {
  dueDate: string;
  dueTime?: string | undefined;
  priority: string;
  category: string;
}

export const TaskMetadata = ({
  dueDate,
  dueTime,
  priority,
  category,
}: TaskMetadataProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

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
    <div className="flex items-center gap-3">
      <span className="text-gray-400">
        📅 {formatDate(dueDate)} {dueTime && `⏰ ${formatTime(dueTime)}`}
      </span>
      <span className={`font-medium ${getPriorityColor(priority)} inline sm:hidden`}>
        ⚡ {priority}
      </span>
      <span className="text-blue-300">📁 {category}</span>
    </div>
  );
};