'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface CollapsibleSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    className?: string;
}

export default function CollapsibleSection({
    title,
    icon,
    children,
    defaultOpen = false,
    className
}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [isMobile, setIsMobile] = useState(false);

    // Initial check and listener for screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // On desktop, always open. On mobile, use state.
    const showContent = !isMobile || isOpen;

    return (
        <div className={clsx("card bg-white overflow-hidden transition-all duration-300", className, {
            'rounded-2xl border border-slate-100 shadow-sm': isMobile,
            'rounded-[24px] mb-8 p-10': !isMobile
        })}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "flex items-center justify-between w-full text-left transition-colors",
                    {
                        'p-5 bg-slate-50/50 active:bg-slate-100': isMobile,
                        'mb-6 pointer-events-none cursor-default': !isMobile
                    }
                )}
            >
                <h3 className={clsx("section-title text-slate-900 flex items-center gap-2 font-bold uppercase tracking-wider border-0 pb-0", {
                    'text-sm': isMobile,
                    'text-2xl': !isMobile
                })}>
                    {icon}
                    {title}
                </h3>

                {/* Mobile Chevron */}
                <ChevronDown
                    size={20}
                    className={clsx("text-slate-400 transition-transform md:hidden", {
                        'rotate-180': isOpen
                    })}
                />
            </button>

            <div
                className={clsx("transition-all duration-300 ease-in-out", {
                    'max-h-0 opacity-0': isMobile && !isOpen,
                    'max-h-[5000px] opacity-100': !isMobile || isOpen,
                })}
            >
                <div className={clsx({ 'p-5 pt-0': isMobile })}>
                    {children}
                </div>
            </div>
        </div>
    );
}
