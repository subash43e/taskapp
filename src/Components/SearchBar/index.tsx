import React, { useState } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = 'Search...' }) => {
    const [query, setQuery] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        onSearch(value.trim()); // Real-time search
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSearch(query.trim());
    };

    const handleClear = () => {
        setQuery('');
        onSearch(''); // Reset search to show all tasks
    };

    return (
        <form onSubmit={handleSubmit} title='Search_Bar'>
            <div className="content-center mx-auto">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={query}
                        className="pl-10 pr-12 py-2 w-full rounded-md border border-gray-600 bg-gray-700/50 placeholder:text-gray-400 caret-white text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder={placeholder}
                        onChange={handleInputChange}
                        aria-label="Search"
                    />
                    <div className="absolute left-3 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </div>
                    {query && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-3 text-gray-400 hover:text-white transition-colors"
                            aria-label="Clear search"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </form>
    );
};

export default SearchBar;