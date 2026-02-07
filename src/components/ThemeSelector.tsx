"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useState, useEffect } from "react";
import { updateUserTheme } from "@/app/actions/user";
import clsx from "clsx";

interface ThemeSelectorProps {
    userId: number;
    initialTheme: string;
}

export default function ThemeSelector({ userId, initialTheme }: ThemeSelectorProps) {
    const [theme, setTheme] = useState(initialTheme);

    useEffect(() => {
        // Sync with document on mount/change
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    async function handleThemeChange(newTheme: string) {
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        await updateUserTheme(userId, newTheme);
    }

    return (
        <div className="card mt-8">
            <div className="card-header">
                <div className="card-icon">
                    <Monitor size={18} />
                </div>
                <h3>Interface Theme</h3>
            </div>

            <div className="flex gap-4">
                <button
                    className={clsx("btn btn-outline flex-1 py-4 flex-col gap-2 h-auto", { "active border-primary bg-primary-light text-primary": theme === 'light' })}
                    onClick={() => handleThemeChange('light')}
                >
                    <Sun size={20} />
                    <span className="text-xs">Light Mode</span>
                </button>
                <button
                    className={clsx("btn btn-outline flex-1 py-4 flex-col gap-2 h-auto", { "active border-primary bg-primary-light text-primary": theme === 'dark' })}
                    onClick={() => handleThemeChange('dark')}
                >
                    <Moon size={20} />
                    <span className="text-xs">Dark Mode</span>
                </button>
                <button
                    className={clsx("btn btn-outline flex-1 py-4 flex-col gap-2 h-auto", { "active border-primary bg-primary-light text-primary": theme === 'system' })}
                    onClick={() => handleThemeChange('system')}
                >
                    <Monitor size={20} />
                    <span className="text-xs">System Default</span>
                </button>
            </div>
        </div>
    );
}
