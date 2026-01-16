import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="size-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-card-dark transition-colors text-slate-600 dark:text-slate-300"
            aria-label="Toggle theme"
            title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
        >
            <span className="material-symbols-outlined">
                {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
        </button>
    );
};
