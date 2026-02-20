import React from 'react';

export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"></div>
            ))}
        </div>
    );
}

export function RecentActivitySkeleton() {
    return (
        <div className="animate-pulse">
            <div className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl mb-4"></div>
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 w-full bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                ))}
            </div>
        </div>
    );
}
