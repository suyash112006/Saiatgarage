'use client';

import { useState } from 'react';
import { updateMechanicNotes } from '@/app/actions/job';
import { StickyNote, Save, Loader2, CheckCircle } from 'lucide-react';

export default function MechanicNotesBox({ jobId, initialNotes, isLocked }: { jobId: number, initialNotes: string, isLocked: boolean }) {
    const [notes, setNotes] = useState(initialNotes || '');
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    async function handleSave() {
        setLoading(true);
        const res = await updateMechanicNotes(jobId, notes);
        setLoading(false);
        if (res.success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    }

    return (
        <div className="card p-5 rounded-2xl border-slate-200 bg-white">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <div className="card-icon !w-6 !h-6 !bg-primary/10">
                        <StickyNote size={12} className="text-primary" />
                    </div>
                    Internal Mechanic Notes
                </h4>
                {saved && (
                    <span className="text-[10px] font-bold text-green-600 flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                        <CheckCircle size={12} /> Saved
                    </span>
                )}
            </div>

            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add work notes (e.g. 'Brake pads worn, recommend change next service'). Only visible to staff."
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none disabled:opacity-50"
                rows={3}
                disabled={isLocked || loading}
            />

            {!isLocked && (
                <button
                    onClick={handleSave}
                    disabled={loading || notes === initialNotes}
                    className="mt-3 btn btn-primary w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Notes
                </button>
            )}
        </div>
    );
}
