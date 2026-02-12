'use client';

import { useState } from 'react';
import { Plus, X, Search, IndianRupee } from 'lucide-react';
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

    function handleClose() {
        setIsOpen(false);
        setQuery('');
        setSelectedService(null);
    }

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
                className="btn btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
                <Plus size={18} />
                Add Service
            </button>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content max-w-lg">
                <div className="modal-header">
                    <div className="modal-header-left">
                        <div className="card-icon">
                            <Plus size={18} />
                        </div>
                        <div>
                            <h3>Add Job Service</h3>
                            <p className="text-xs text-slate-500 mt-1">Select and add services to this job card</p>
                        </div>
                    </div>
                    <button onClick={handleClose} type="button" className="icon-btn">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <input type="hidden" name="jobId" value={jobId} />
                    <input type="hidden" name="serviceId" value={selectedService?.id || ''} />

                    <div className="modal-body space-y-5">
                        <div className="form-field">
                            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">Select Service</label>
                            <div className="input-wrapper relative">
                                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search oil change, wash..."
                                    value={selectedService ? selectedService.name : query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        if (selectedService) setSelectedService(null);
                                    }}
                                    className="pl-10"
                                />
                            </div>

                            {!selectedService && query.length > 0 && (
                                <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl shadow-slate-200/50 max-h-60 overflow-y-auto overflow-x-hidden">
                                    {filtered.length === 0 ? (
                                        <div className="p-4 text-center">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">No services found</p>
                                        </div>
                                    ) : (
                                        filtered.map((s, i) => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedService(s);
                                                    setQuery('');
                                                }}
                                                className={`w-full text-left p-4 hover:bg-slate-50 flex justify-between items-center transition-colors rounded-none outline-none focus:bg-slate-50 ${i !== filtered.length - 1 ? 'border-b border-slate-100' : ''}`}
                                            >
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900">{s.name}</div>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-1">
                                                    {isAdmin && (
                                                        <div className="text-sm font-black text-slate-900">
                                                            ₹{s.base_price}
                                                        </div>
                                                    )}
                                                    <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase">
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
                                        <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">Service Price</label>
                                        <div className="input-wrapper">
                                            <IndianRupee size={16} />
                                            <input
                                                type="number"
                                                name="price"
                                                className="w-full bg-slate-50 px-2 outline-none text-sm font-bold"
                                                defaultValue={selectedService.base_price}
                                                required
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <input type="hidden" name="price" value={selectedService.base_price} />
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
                            disabled={!selectedService || loading}
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
