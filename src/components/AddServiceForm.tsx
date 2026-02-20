'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, X, Search, IndianRupee, Settings, Loader2 } from 'lucide-react';
import { addJobService } from '@/app/actions/job';
import { toast } from 'sonner';

interface AddServiceFormProps {
    jobId: number;
    masterServices: any[];
    isAdmin: boolean;
}

export default function AddServiceForm({ jobId, masterServices, isAdmin }: AddServiceFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedService, setSelectedService] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    function handleClose() {
        setIsOpen(false);
        setQuery('');
        setSelectedService(null);
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

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const res = await addJobService(formData);
            if (res.success) {
                toast.success('Service added successfully');
                handleClose();
                return;
            } else {
                toast.error(res.error || 'Failed to add service');
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
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Select and add services to this job card</p>
                        </div>
                    </div>
                    <button onClick={handleClose} type="button" className="icon-btn" title="Close">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <input type="hidden" name="jobId" value={jobId} />
                    <input type="hidden" name="serviceId" value={selectedService?.id || ''} />

                    <div className="modal-body space-y-5">
                        <div className="form-field">
                            <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Select Service</label>
                            <div className="input-wrapper relative">
                                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Search service..."
                                    value={selectedService ? selectedService.name : query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        if (selectedService) setSelectedService(null);
                                    }}
                                    className="pl-10"
                                    autoFocus
                                />
                            </div>

                            {!selectedService && query.length > 0 && (
                                <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                    {filtered.length === 0 ? (
                                        <div className="p-8 text-center rounded-xl border-2 border-dashed" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)', opacity: 0.5 }}>
                                            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>No services found</p>
                                        </div>
                                    ) : (
                                        filtered.map((s) => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedService(s);
                                                    setQuery('');
                                                }}
                                                className="w-full text-left p-3 rounded-xl transition-all flex justify-between items-center group mb-2 last:mb-0 active:scale-[0.98]"
                                                style={{ backgroundColor: 'var(--bg-main)', border: 'none', boxShadow: 'none', outline: 'none' }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                                                        <Settings size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>{s.name}</div>
                                                    </div>
                                                </div>
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
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {selectedService && (
                            <div className="grid grid-cols-2 gap-4 pt-2 animate-pulse">
                                {isAdmin ? (
                                    <div className="form-field">
                                        <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Service Price</label>
                                        <div className="input-wrapper" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)' }}>
                                            <IndianRupee size={16} style={{ color: 'var(--text-muted)' }} />
                                            <input
                                                type="number"
                                                name="price"
                                                className="w-full px-2 outline-none text-sm font-bold"
                                                style={{ backgroundColor: 'transparent', color: 'var(--text-main)' }}
                                                defaultValue={selectedService.base_price}
                                                required
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <input type="hidden" name="price" value={selectedService.base_price} />
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
                            disabled={!selectedService || loading}
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
