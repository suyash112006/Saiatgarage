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
            className="flex items-center justify-center w-10 h-10 bg-white text-blue-600 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:bg-slate-50 active:scale-95 transition-all group shrink-0"
            title="Go Back"
        >
            <ArrowLeft size={20} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>
    );
}
