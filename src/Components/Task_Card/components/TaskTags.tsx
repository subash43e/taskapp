interface TaskTagsProps {
  tags: string[];
}

export const TaskTags = ({ tags }: TaskTagsProps) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="bg-[#16a085] text-white px-2 py-0.5 rounded text-xs whitespace-nowrap"
        >
          {tag}
        </span>
      ))}
    </div>
  );
};