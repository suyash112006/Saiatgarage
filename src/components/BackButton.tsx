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
            className="flex items-center justify-center w-10 h-10 bg-white text-blue-600 border border-slate-100 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.08)] hover:bg-slate-50 active:scale-95 transition-all mr-6 group shrink-0"
            title="Go Back"
        >
            <ArrowLeft size={20} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>
    );
}
