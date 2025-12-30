import React from 'react';

import { Sidebar } from './Sidebar';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {


    return (
        <div className="flex h-screen bg-gray-50 font-['Inter']">
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 px-8 py-4 flex justify-between items-center md:hidden">
                    <span className="text-xl font-bold text-gray-800">DigitBill</span>
                    {/* Mobile menu button would go here */}
                </header>
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
