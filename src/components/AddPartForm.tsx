'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Minus, X, Search, Check, Cpu, Loader2 } from 'lucide-react';
import { addJobParts } from '@/app/actions/job';
import { toast } from 'sonner';

interface AddPartFormProps {
    jobId: number;
    masterParts: any[];
    isAdmin: boolean;
}

export default function AddPartForm({ jobId, masterParts, isAdmin }: AddPartFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedParts, setSelectedParts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    function handleClose() {
        setIsOpen(false);
        setQuery('');
        setSelectedParts([]);
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

    const togglePart = (part: any) => {
        if (selectedParts.find(p => p.id === part.id)) {
            setSelectedParts(selectedParts.filter(p => p.id !== part.id));
        } else {
            if (part.stock_quantity <= 0) {
                toast.error('This part is out of stock');
                return;
            }
            setSelectedParts([...selectedParts, { ...part, quantity: 1 }]);
        }
    };

    const updatePartQuantity = (partId: number, delta: number) => {
        setSelectedParts(selectedParts.map(p => {
            if (p.id === partId) {
                const newQty = Math.max(1, (p.quantity || 1) + delta);
                // Also check stock limit
                if (newQty > p.stock_quantity) {
                    toast.error(`Only ${p.stock_quantity} units available`);
                    return p;
                }
                return { ...p, quantity: newQty };
            }
            return p;
        }));
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (selectedParts.length === 0) return;
        
        setLoading(true);

        try {
            const partsWithQty = selectedParts.map(p => ({ 
                id: p.id, 
                quantity: p.quantity || 1 
            }));
            const res = await addJobParts(jobId, partsWithQty);
            if (res.success) {
                toast.success(`${selectedParts.length} parts added successfully`);
                handleClose();
                return;
            } else {
                toast.error(res.error || 'Failed to add parts');
                setLoading(false);
            }
        } catch (err: any) {
            setLoading(false);
            toast.error('Failed to add parts. Please try again.');
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
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Select and add multiple parts from inventory</p>
                        </div>
                    </div>
                    <button onClick={handleClose} type="button" className="icon-btn" title="Close">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body space-y-5">
                        <div className="form-field">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Select Parts</label>
                                {selectedParts.length > 0 && (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary text-white animate-in zoom-in">
                                        {selectedParts.length} Selected
                                    </span>
                                )}
                            </div>
                            <div className="input-wrapper relative">
                                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Search part name or number..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="pl-10"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div
                            className="space-y-3 pr-2 custom-scrollbar"
                            style={{ maxHeight: '350px', overflowY: 'auto', marginTop: '10px' }}
                        >
                            {query.length > 0 && filtered.length === 0 ? (
                                <div className="p-8 text-center rounded-xl border-2 border-dashed" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)', opacity: 0.5 }}>
                                    <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Not in inventory</p>
                                </div>
                            ) : (
                                (query.length > 0 ? filtered : (masterParts || []).slice(0, 50)).map((p) => {
                                    const isSelected = !!selectedParts.find(sel => sel.id === p.id);
                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => togglePart(p)}
                                            className="w-full text-left p-3 rounded-xl transition-all flex justify-between items-center group mb-2 last:mb-0 active:scale-[0.98]"
                                            style={{ 
                                                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-main)', 
                                                border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                                                outline: 'none' 
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0" style={{ backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-card)', color: isSelected ? '#fff' : 'var(--text-muted)' }}>
                                                    {isSelected ? <Check size={18} /> : <Cpu size={18} />}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>{p.name}</div>
                                                    <div className="text-[10px] font-medium tracking-[0.02em] mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>{p.part_no || 'NO-PART-NO'}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {isSelected && (
                                                    <div className="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-lg p-1" onClick={(e) => e.stopPropagation()}>
                                                        <button 
                                                            type="button"
                                                            onClick={() => updatePartQuantity(p.id, -1)}
                                                            className="w-7 h-7 flex items-center justify-center rounded-md bg-[#334155] hover:bg-[#475569] text-blue-400 transition-all active:scale-95"
                                                        >
                                                            <Minus size={14} strokeWidth={3} />
                                                        </button>
                                                        <span className="text-xs font-bold w-5 text-center" style={{ color: 'var(--text-main)' }}>
                                                            {selectedParts.find(sel => sel.id === p.id)?.quantity || 1}
                                                        </span>
                                                        <button 
                                                            type="button"
                                                            onClick={() => updatePartQuantity(p.id, 1)}
                                                            className="w-7 h-7 flex items-center justify-center rounded-md bg-[#334155] hover:bg-[#475569] text-blue-400 transition-all active:scale-95"
                                                        >
                                                            <Plus size={14} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="text-right flex flex-col items-end gap-1">
                                                    {isAdmin && (
                                                        <div className="text-sm font-black" style={{ color: 'var(--text-main)' }}>
                                                            ₹{p.unit_price}
                                                        </div>
                                                    )}
                                                    <div className="text-[10px] font-bold px-2 py-0.5 rounded border-0 uppercase tracking-wider" style={{ backgroundColor: isSelected ? 'transparent' : 'var(--bg-card)', color: 'var(--text-muted)', boxShadow: 'none' }}>
                                                        {p.stock_quantity} IN STOCK
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
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
                            disabled={selectedParts.length === 0 || loading}
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
