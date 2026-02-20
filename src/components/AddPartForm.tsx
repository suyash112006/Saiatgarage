'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, X, Search, IndianRupee, Cpu, Loader2 } from 'lucide-react';
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
    const modalRef = useRef<HTMLDivElement>(null);

    function handleClose() {
        setIsOpen(false);
        setQuery('');
        setSelectedPart(null);
        setLoading(false);
    }

    useEffect(() => {
        if (!isOpen) return;
        function handleOutsideClick(e: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                handleClose();
            }
        }
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isOpen]);

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
                className="btn btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
            >
                <Plus size={18} />
                Add Part
            </button>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content max-w-lg" ref={modalRef}>
                <div className="modal-header">
                    <div className="modal-header-left">
                        <div className="card-icon">
                            <Cpu size={18} />
                        </div>
                        <div>
                            <h3 style={{ color: 'var(--text-main)' }}>Add Inventory Part</h3>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Search and add parts from inventory</p>
                        </div>
                    </div>
                    <button onClick={handleClose} type="button" className="icon-btn" title="Close">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <input type="hidden" name="jobId" value={jobId} />
                    <input type="hidden" name="partId" value={selectedPart?.id || ''} />

                    <div className="modal-body space-y-5">
                        <div className="form-field">
                            <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Search Inventory</label>
                            <div className="input-wrapper relative">
                                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Search part name or number..."
                                    value={selectedPart ? selectedPart.name : query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        if (selectedPart) setSelectedPart(null);
                                    }}
                                    className="pl-10"
                                    autoFocus
                                />
                            </div>

                            {!selectedPart && query.length > 0 && (
                                <div
                                    className="mt-4 space-y-3 pr-2 custom-scrollbar"
                                    style={{ maxHeight: '300px', overflowY: 'auto' }}
                                >
                                    {filtered.length === 0 ? (
                                        <div className="p-8 text-center rounded-xl border-2 border-dashed" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)', opacity: 0.5 }}>
                                            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Not in inventory</p>
                                        </div>
                                    ) : (
                                        filtered.map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedPart(p);
                                                    setQuery('');
                                                }}
                                                className="w-full text-left p-3 rounded-xl transition-all flex justify-between items-center group mb-2 last:mb-0 active:scale-[0.98]"
                                                style={{ backgroundColor: 'var(--bg-main)', border: 'none', boxShadow: 'none', outline: 'none' }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                                                        <Cpu size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>{p.name}</div>
                                                        <div className="text-[10px] font-medium tracking-[0.02em] mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>{p.part_no || 'NO-PART-NO'}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-1">
                                                    {isAdmin && (
                                                        <div className="text-sm font-black" style={{ color: 'var(--text-main)' }}>
                                                            ₹{p.unit_price}
                                                        </div>
                                                    )}
                                                    <div className="text-[10px] font-bold px-2 py-0.5 rounded border-0 uppercase tracking-wider" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', boxShadow: 'none' }}>
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
                                        <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Unit Price</label>
                                        <div className="input-wrapper" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)' }}>
                                            <IndianRupee size={16} style={{ color: 'var(--text-muted)' }} />
                                            <input
                                                type="number"
                                                name="price"
                                                className="w-full px-2 outline-none text-sm font-bold"
                                                style={{ backgroundColor: 'transparent', color: 'var(--text-main)' }}
                                                defaultValue={selectedPart.unit_price}
                                                required
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <input type="hidden" name="price" value={selectedPart.unit_price} />
                                )}
                                <div className="form-field">
                                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Quantity</label>
                                    <div className="input-wrapper" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)' }}>
                                        <Plus size={16} style={{ color: 'var(--text-muted)' }} />
                                        <input
                                            type="number"
                                            name="quantity"
                                            className="w-full px-2 outline-none text-sm font-bold"
                                            style={{ backgroundColor: 'transparent', color: 'var(--text-main)' }}
                                            defaultValue={1}
                                            max={selectedPart.stock_quantity}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
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
                            className="btn btn-primary"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={18} />
                                    Saving...
                                </span>
                            ) : (
                                <>
                                    <Plus size={18} className="mr-2" />
                                    Save Part
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
