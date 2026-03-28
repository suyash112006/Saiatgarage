'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Minus, X, Search, Check, Settings, Loader2 } from 'lucide-react';
import { addJobServices } from '@/app/actions/job';
import { toast } from 'sonner';

interface AddServiceFormProps {
    jobId: number;
    masterServices: any[];
    isAdmin: boolean;
}

export default function AddServiceForm({ jobId, masterServices, isAdmin }: AddServiceFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedServices, setSelectedServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    function handleClose() {
        setIsOpen(false);
        setQuery('');
        setSelectedServices([]);
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

    const filtered = (masterServices || []).filter(s =>
        s && s.name && (
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.category.toLowerCase().includes(query.toLowerCase())
        )
    );

    const toggleService = (service: any) => {
        if (selectedServices.find(s => s.id === service.id)) {
            setSelectedServices(selectedServices.filter(s => s.id !== service.id));
        } else {
            setSelectedServices([...selectedServices, { ...service, quantity: 1 }]);
        }
    };

    const updateServiceQuantity = (serviceId: number, delta: number) => {
        setSelectedServices(selectedServices.map(s => {
            if (s.id === serviceId) {
                const newQty = Math.max(1, (s.quantity || 1) + delta);
                return { ...s, quantity: newQty };
            }
            return s;
        }));
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (selectedServices.length === 0) return;
        
        setLoading(true);

        try {
            const servicesWithQty = selectedServices.map(s => ({ 
                id: s.id, 
                quantity: s.quantity || 1 
            }));
            const res = await addJobServices(jobId, servicesWithQty);
            if (res.success) {
                toast.success(`${selectedServices.length} services added successfully`);
                handleClose();
                return;
            } else {
                toast.error(res.error || 'Failed to add services');
                setLoading(false);
            }
        } catch (err) {
            setLoading(false);
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
                Add Service
            </button>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content max-w-lg" ref={modalRef}>
                <div className="modal-header">
                    <div className="modal-header-left">
                        <div className="card-icon">
                            <Plus size={18} />
                        </div>
                        <div>
                            <h3 style={{ color: 'var(--text-main)' }}>Add Job Service</h3>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Select and add multiple services to this job card</p>
                        </div>
                    </div>
                    <button onClick={handleClose} type="button" className="icon-btn" title="Close">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <input type="hidden" name="jobId" value={jobId} />

                    <div className="modal-body space-y-5">
                        <div className="form-field">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Select Service</label>
                                {selectedServices.length > 0 && (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary text-white animate-in zoom-in">
                                        {selectedServices.length} Selected
                                    </span>
                                )}
                            </div>
                            <div className="input-wrapper relative">
                                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Search service..."
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
                                    <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>No services found</p>
                                </div>
                            ) : (
                                (query.length > 0 ? filtered : (masterServices || []).slice(0, 50)).map((s) => {
                                    const isSelected = !!selectedServices.find(sel => sel.id === s.id);
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => toggleService(s)}
                                            className="w-full text-left p-3 rounded-xl transition-all flex justify-between items-center group mb-2 last:mb-0 active:scale-[0.98]"
                                            style={{ 
                                                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-main)', 
                                                border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                                                outline: 'none' 
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0" style={{ backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-card)', color: isSelected ? '#fff' : 'var(--text-muted)' }}>
                                                    {isSelected ? <Check size={18} /> : <Settings size={18} />}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>{s.name}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {isSelected && (
                                                    <div className="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-lg p-1" onClick={(e) => e.stopPropagation()}>
                                                        <button 
                                                            type="button"
                                                            onClick={() => updateServiceQuantity(s.id, -1)}
                                                            className="w-7 h-7 flex items-center justify-center rounded-md bg-[#334155] hover:bg-[#475569] text-blue-400 transition-all active:scale-95"
                                                        >
                                                            <Minus size={14} strokeWidth={3} />
                                                        </button>
                                                        <span className="text-xs font-bold w-5 text-center" style={{ color: 'var(--text-main)' }}>
                                                            {selectedServices.find(sel => sel.id === s.id)?.quantity || 1}
                                                        </span>
                                                        <button 
                                                            type="button"
                                                            onClick={() => updateServiceQuantity(s.id, 1)}
                                                            className="w-7 h-7 flex items-center justify-center rounded-md bg-[#334155] hover:bg-[#475569] text-blue-400 transition-all active:scale-95"
                                                        >
                                                            <Plus size={14} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="text-right flex flex-col items-end gap-1">
                                                    {isAdmin && (
                                                        <div className="text-sm font-black" style={{ color: 'var(--text-main)' }}>
                                                            ₹{s.base_price}
                                                        </div>
                                                    )}
                                                    <div className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', boxShadow: 'none' }}>
                                                        {s.category}
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
                            disabled={selectedServices.length === 0 || loading}
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
                                    Save Service
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
