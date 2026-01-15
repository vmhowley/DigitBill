import { Check, ChevronDown, Search } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface Option {
    id: string | number;
    title: string;
    subtitle?: string;
    extra?: string;
}

interface SearchableSelectProps {
    options: Option[];
    onSelect: (option: Option) => void;
    placeholder?: string;
    selectedId?: string | number;
    label?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    onSelect,
    placeholder = "Buscar...",
    selectedId,
    label
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(o => o.id === selectedId);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(option =>
        option.title.toLowerCase().includes(search.toLowerCase()) ||
        (option.subtitle && option.subtitle.toLowerCase().includes(search.toLowerCase()))
    );

    const handleSelect = (option: Option) => {
        onSelect(option);
        setIsOpen(false);
        setSearch('');
    };

    return (
        <div className="relative" ref={containerRef}>
            {label && <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{label}</label>}

            <div
                className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-border-dark dark:text-white rounded-xl flex items-center justify-between cursor-pointer transition-all hover:border-primary/50 ${isOpen ? 'ring-2 ring-primary border-primary bg-white' : ''}`}
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) setTimeout(() => inputRef.current?.focus(), 100);
                }}
            >
                <div className="flex-1 truncate">
                    {selectedOption ? (
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold">{selectedOption.title}</span>
                            {selectedOption.subtitle && <span className="text-[10px] text-slate-400 font-mono">{selectedOption.subtitle}</span>}
                        </div>
                    ) : (
                        <span className="text-slate-400 text-sm">{placeholder}</span>
                    )}
                </div>
                <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-2 border-b border-slate-100 dark:border-border-dark flex items-center gap-2">
                        <Search size={16} className="text-slate-400" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Type to filter..."
                            className="w-full bg-transparent border-none focus:ring-0 text-sm py-1 outline-none dark:text-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 text-sm italic">No se encontraron resultados</div>
                        ) : (
                            filteredOptions.map(option => (
                                <div
                                    key={option.id}
                                    className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer flex justify-between items-center transition-colors border-b border-slate-50 dark:border-border-dark last:border-none ${selectedId === option.id ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                    onClick={() => handleSelect(option)}
                                >
                                    <div className="flex flex-col min-w-0">
                                        <span className={`text-sm font-bold truncate ${selectedId === option.id ? 'text-primary' : 'text-slate-800 dark:text-white'}`}>
                                            {option.title}
                                        </span>
                                        {option.subtitle && <span className="text-xs text-slate-400 font-mono truncate">{option.subtitle}</span>}
                                    </div>
                                    {selectedId === option.id && <Check size={16} className="text-primary shrink-0 ml-2" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
