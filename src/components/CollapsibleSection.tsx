'use client';

import { useState } from 'react';
import clsx from 'clsx';

interface CollapsibleSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    className?: string;
    rightElement?: React.ReactNode;
}

export default function CollapsibleSection({
    title,
    icon,
    children,
    defaultOpen = false,
    className,
    rightElement,
}: CollapsibleSectionProps) {
    return (
        <div className={clsx("card transition-all duration-300", className, "rounded-[24px] mb-8 p-5 md:p-10 border", "borderColor: 'var(--border)'")}>
            <div className="flex items-center justify-between w-full text-left transition-colors mb-4 md:mb-6">
                <h3 className="section-title flex items-center gap-2 font-bold uppercase tracking-wider border-0 pb-0 text-lg md:text-2xl" style={{ color: 'var(--text-main)' }}>
                    {icon}
                    {title}
                </h3>
                {rightElement && (
                    <div className="flex items-center">
                        {rightElement}
                    </div>
                )}
            </div>

            <div className="transition-all duration-300 ease-in-out max-h-[5000px] opacity-100">
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
}
