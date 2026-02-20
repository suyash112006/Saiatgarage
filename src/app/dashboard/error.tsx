'use client';

import React, { useEffect } from 'react';
import { WifiOff, RefreshCcw, AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('--- Dashboard Error Boundary Caught ---');
        console.error(error);
        console.error('---------------------------------------');
    }, [error]);

    const isConnectionError = error.message?.includes('ENOTFOUND') ||
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('ETIMEDOUT') ||
        error.message?.includes('database');

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white dark:bg-[#121212] rounded-3xl border-2 border-dashed border-slate-100 dark:border-zinc-800 m-6">
            <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
                {isConnectionError ? (
                    <WifiOff size={40} className="text-amber-500" />
                ) : (
                    <AlertTriangle size={40} className="text-amber-500" />
                )}
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                {isConnectionError ? 'Connection Interrupted' : 'Something went wrong'}
            </h2>

            <p className="max-w-md text-slate-500 dark:text-zinc-400 mb-8 font-medium leading-relaxed">
                {isConnectionError
                    ? "We're having trouble reaching the database. This usually happens due to a temporary DNS issue or internet interruption. Please check your connection."
                    : "An unexpected error occurred while loading this section of the dashboard. Our team has been notified."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                    onClick={() => reset()}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-100"
                >
                    <RefreshCcw size={18} />
                    Try Again
                </button>

                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-8 py-3 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all"
                >
                    <Home size={18} />
                    Dashboard Home
                </Link>
            </div>

            {process.env.NODE_ENV === 'development' && (
                <div className="mt-12 p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl text-left max-w-2xl w-full border border-slate-100 dark:border-zinc-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Technical Details (Dev Only)</p>
                    <code className="text-xs text-red-500 dark:text-red-400 break-all font-mono">
                        {error.message}
                    </code>
                </div>
            )}
        </div>
    );
}
