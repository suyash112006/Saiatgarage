'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Loader2, FileText, Clock, ChevronDown, X } from 'lucide-react';
import { createJob } from '@/app/actions/job';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CreateJobModalProps {
    vehicle: any;
    customer: any;
}

export default function CreateJobModal({ vehicle, customer }: CreateJobModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    function handleClose() {
        setIsOpen(false);
        setError('');
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

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(event.currentTarget);
        formData.append('vehicleId', vehicle.id.toString());
        formData.append('customerId', customer.id.toString());

        try {
            const result = await createJob(formData);

            if (result.error) {
                setError(result.error);
                setLoading(false);
            } else if (result.success && result.jobId) {
                setLoading(false);
                setIsOpen(false);
                toast.success('Job Card Created Successfully');
                router.push(`/dashboard/jobs/${result.jobId}`);
            } else {
                setError('Failed to create Job Card.');
                setLoading(false);
            }
        } catch (err) {
            setError('Server connection error.');
            setLoading(false);
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn-primary text-xs px-4 py-2 rounded-xl shadow-lg shadow-primary/10 flex items-center"
            >
                <Plus size={16} className="mr-2" />
                New Job
            </button>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content max-w-md" ref={modalRef}>
                <div className="modal-header">
                    <div className="modal-header-left">
                        <div className="card-icon">
                            <FileText size={18} />
                        </div>
                        <div>
                            <h3>Open Job Card</h3>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                For {vehicle.model} <span className="font-mono font-bold" style={{ color: 'var(--text-main)' }}>({vehicle.vehicle_number})</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={handleClose} type="button" className="icon-btn" style={{ color: 'var(--text-muted)' }}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium flex items-center gap-2">
                                <X size={14} />{error}
                            </div>
                        )}

                        <div className="form-field">
                            <label>Complaint / Job Description</label>
                            <div className="input-wrapper items-start">
                                <FileText size={16} style={{ position: 'absolute', top: '15px', left: '12px', zIndex: 10 }} />
                                <textarea
                                    name="complaint"
                                    rows={3}
                                    placeholder="(Optional) Describe the issues reported..."
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <div className="flex justify-between items-center mb-2">
                                <label className="mb-0">Current KM *</label>
                                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                                    Prev: {vehicle.last_km} KM
                                </span>
                            </div>
                            <div className="input-wrapper">
                                <Clock size={16} />
                                <input
                                    type="number"
                                    name="kmReading"
                                    defaultValue={vehicle.last_km}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Initial Status</label>
                            <div className="input-wrapper relative">
                                <select
                                    name="status"
                                    defaultValue="OPEN"
                                    className="appearance-none flex-1 pr-8 outline-none"
                                >
                                    <option value="OPEN">OPEN</option>
                                    <option value="IN_PROGRESS">IN PROGRESS</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={handleClose} className="btn btn-outline">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={18} />Saving...</span>
                            ) : (
                                <span className="flex items-center gap-2"><Plus size={18} />Create Job</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
