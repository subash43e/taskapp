import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { RootState } from '../../store';
import { hideNotification } from '../../notificationSlice';

export default function NotificationToast() {
  const dispatch = useDispatch();
  const { message, type, show } = useSelector((state: RootState) => state.notification);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        dispatch(hideNotification());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, dispatch]);

  if (!show) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 border-green-500';
      case 'error':
        return 'bg-red-600 border-red-500';
      default:
        return 'bg-blue-600 border-blue-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={`${getTypeStyles()} text-white px-4 py-3 rounded-lg shadow-lg border-l-4 max-w-sm`}>
        <div className="flex items-center">
          <span className="mr-2 font-bold">{getIcon()}</span>
          <p className="text-sm">{message}</p>
          <button
            onClick={() => dispatch(hideNotification())}
            className="ml-4 text-white hover:text-gray-300"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}