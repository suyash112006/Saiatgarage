'use client';

import { useState } from 'react';
import { Plus, X, Search, IndianRupee, Cpu } from 'lucide-react';
import { addJobPart } from '@/app/actions/job';
import { toast } from 'sonner';

interface AddPartFormProps {
    jobId: number;
    masterParts: any[];
    isAdmin: boolean;
}

export default function AddPartForm({ jobId, masterParts, isAdmin }: AddPartFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedPart, setSelectedPart] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    function handleClose() {
        setIsOpen(false);
        setQuery('');
        setSelectedPart(null);
    }

    const filtered = (masterParts || []).filter(p =>
        p && p.name && (
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.part_no && p.part_no.toLowerCase().includes(query.toLowerCase()))
        )
    );

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const res = await addJobPart(formData);
            if (res.success) {
                toast.success('Part added successfully');
                handleClose();
                return;
            } else {
                toast.error(res.error || 'Failed to add part');
                setLoading(false);
            }
        } catch (err: any) {
            setLoading(false);
            if (err.message && err.message.includes('Insufficient stock')) {
                toast.error(err.message);
            } else {
                toast.error('Failed to add part. Please try again.');
            }
            console.error(err);
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
                <Plus size={18} />
                Add Part
            </button>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content max-w-lg">
                <div className="modal-header">
                    <div className="modal-header-left">
                        <div className="card-icon">
                            <Cpu size={18} />
                        </div>
                        <div>
                            <h3>Add Inventory Part</h3>
                            <p className="text-xs text-slate-500 mt-1">Search and add parts from inventory</p>
                        </div>
                    </div>
                    <button onClick={handleClose} type="button" className="icon-btn">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <input type="hidden" name="jobId" value={jobId} />
                    <input type="hidden" name="partId" value={selectedPart?.id || ''} />

                    <div className="modal-body space-y-5">
                        <div className="form-field">
                            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">Search Inventory</label>
                            <div className="input-wrapper relative">
                                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search part name or number..."
                                    value={selectedPart ? selectedPart.name : query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        if (selectedPart) setSelectedPart(null);
                                    }}
                                    className="pl-10"
                                />
                            </div>

                            {!selectedPart && query.length > 0 && (
                                <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl shadow-slate-200/50 max-h-60 overflow-y-auto overflow-x-hidden">
                                    {filtered.length === 0 ? (
                                        <div className="p-4 text-center">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Not in inventory</p>
                                        </div>
                                    ) : (
                                        filtered.map((p, i) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedPart(p);
                                                    setQuery('');
                                                }}
                                                className={`w-full text-left p-4 hover:bg-slate-50 flex justify-between items-center transition-colors rounded-none outline-none focus:bg-slate-50 ${i !== filtered.length - 1 ? 'border-b border-slate-100' : ''}`}
                                            >
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900">{p.name}</div>
                                                    <div className="text-[10px] font-medium text-slate-400 tracking-[0.02em] mt-0.5 font-mono">{p.part_no || 'NO-PART-NO'}</div>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-1">
                                                    {isAdmin && (
                                                        <div className="text-sm font-black text-slate-900">
                                                            ₹{p.unit_price}
                                                        </div>
                                                    )}
                                                    <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                                        {p.stock_quantity} IN STOCK
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {selectedPart && (
                            <div className="grid grid-cols-2 gap-4 animate-pulse pt-2">
                                {isAdmin ? (
                                    <div className="form-field">
                                        <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">Unit Price</label>
                                        <div className="input-wrapper">
                                            <IndianRupee size={16} />
                                            <input
                                                type="number"
                                                name="price"
                                                className="w-full bg-slate-50 px-2 outline-none text-sm font-bold"
                                                defaultValue={selectedPart.unit_price}
                                                required
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <input type="hidden" name="price" value={selectedPart.unit_price} />
                                )}
                                <div className="form-field">
                                    <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">Quantity</label>
                                    <div className="input-wrapper">
                                        <Plus size={16} />
                                        <input
                                            type="number"
                                            name="quantity"
                                            className="w-full bg-slate-50 px-2 outline-none text-sm font-bold"
                                            defaultValue={1}
                                            max={selectedPart.stock_quantity}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer flex justify-center gap-3 pt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn btn-outline"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedPart || loading}
                            className="btn btn-primary shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </span>
                            ) : (
                                <>
                                    <Plus size={18} className="mr-2" />
                                    Save Part to Job
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
