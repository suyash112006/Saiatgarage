'use client';

import { useState } from 'react';
import { assignMechanic } from '@/app/actions/job';
import { UserCheck, Loader2 } from 'lucide-react';

interface Mechanic {
    id: number;
    name: string;
}

export default function AssignMechanicDropdown({
    jobId,
    mechanics,
    currentMechanicId,
    isLocked
}: {
    jobId: number,
    mechanics: Mechanic[],
    currentMechanicId?: number,
    isLocked: boolean
}) {
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState(currentMechanicId || '');

    async function handleAssign(mId: number) {
        setLoading(true);
        const res = await assignMechanic(jobId, mId);
        setLoading(false);
        if (res.success) {
            setSelectedId(mId);
        }
    }

    const currentMechanic = mechanics.find(m => m.id === Number(selectedId));

    return (
        <div className="input-wrapper">
            <UserCheck size={16} className="text-slate-400" />
            <select
                value={selectedId}
                onChange={(e) => handleAssign(Number(e.target.value))}
                disabled={isLocked || loading}
                style={{ backgroundImage: loading ? 'none' : undefined }}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-base text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-slate-100 transition-all"
            >
                <option value="">-- Select Mechanic --</option>
                {mechanics.map((m) => (
                    <option key={m.id} value={m.id}>
                        {m.name}
                    </option>
                ))}
            </select>
            {loading && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                </div>
            )}
        </div>
    );
}
