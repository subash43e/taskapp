interface InlineLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export default function InlineLoader({ size = 'md', message }: InlineLoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex items-center justify-center py-4">
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-blue-600 mx-auto mb-1 ${sizeClasses[size]}`}></div>
        {message && <p className="text-xs text-gray-500">{message}</p>}
      </div>
    </div>
  );
}