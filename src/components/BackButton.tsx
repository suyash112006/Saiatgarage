'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function BackButton() {
    const router = useRouter();
    const pathname = usePathname();

    // Hide on main dashboard page and login
    if (pathname === '/dashboard' || pathname === '/login') {
        return null;
    }

    return (
        <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-2xl shadow-sm hover:shadow-md transition-all group shrink-0"
            style={{
                backgroundColor: 'var(--bg-card)',
                color: 'var(--primary)',
                borderColor: 'var(--border)',
                borderWidth: '1px'
            }}
            title="Go Back"
        >
            <ArrowLeft size={20} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>
    );
}
