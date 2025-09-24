
import React from 'react';

const Loading = () => (
        <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid mb-3"></div>
                <span className="text-white text-lg font-semibold">Loading...</span>
        </div>
);

export default Loading;