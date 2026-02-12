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

    // On desktop, always open. 
    const showContent = true;

    return (
        <div className={clsx("card bg-white overflow-hidden transition-all duration-300", className, "rounded-[24px] mb-8 p-10")}>
            <div
                className="flex items-center justify-between w-full text-left transition-colors mb-6 pointer-events-none cursor-default"
            >
                <h3 className="section-title text-slate-900 flex items-center gap-2 font-bold uppercase tracking-wider border-0 pb-0 text-2xl">
                    {icon}
                    {title}
                </h3>
            </div>

            <div
                className="transition-all duration-300 ease-in-out max-h-[5000px] opacity-100"
            >
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
}
