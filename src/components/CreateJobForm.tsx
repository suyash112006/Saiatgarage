'use client';

import { createJob } from '@/app/actions/job';
import { useState } from 'react';
import { Save, Clock, FileText, Loader2, AlertCircle, Car, User, Phone, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateJobForm({ vehicle }: { vehicle: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(event.currentTarget);
        formData.append('vehicleId', vehicle.id.toString());
        formData.append('customerId', vehicle.customer_id.toString());

        try {
            const result = await createJob(formData);

            if (result.error) {
                setError(result.error);
                setLoading(false);
            } else if (result.success && result.jobId) {
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

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto pb-28 md:pb-0">
            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm mb-8 flex items-center gap-2 font-medium animate-pulse">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <div className="card">
                {/* Header with `header-group` to fix left alignment */}
                <div className="card-header border-b border-slate-100 pb-4 mb-6">
                    <div className="header-group">
                        <div className="card-icon">
                            <FileText size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Job Configuration</h3>
                            <p className="text-xs text-slate-400 font-medium">Create a new job card for {vehicle.model}</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-6">
                    {/* Vehicle & Customer Summary Cards - Side by Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {/* Vehicle Summary */}
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm flex-shrink-0">
                                <Car size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Vehicle Details</p>
                                <p className="text-sm font-bold text-slate-900">{vehicle.vehicle_number}</p>
                                <p className="text-xs text-slate-500 font-medium">{vehicle.model}</p>
                            </div>
                        </div>

                        {/* Customer Summary */}
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm flex-shrink-0">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer Profile</p>
                                <p className="text-sm font-bold text-slate-900">{vehicle.customer_name}</p>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                    <Phone size={12} />
                                    {vehicle.mobile || 'No Mobile'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Complaint */}
                        <div className="form-field">
                            <label className="text-xs font-semibold text-muted mb-1 block">
                                Complaint / Job Description
                            </label>
                            <div className="input-wrapper relative">
                                <FileText size={18} className="absolute top-3.5 left-3.5 text-slate-400 z-10" />
                                <textarea
                                    name="complaint"
                                    rows={3}
                                    className="w-full !pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-900 text-sm placeholder:text-slate-400"
                                    placeholder="(Optional) Describe the issues reported by the customer..."
                                />
                            </div>
                        </div>

                        {/* Grid for KM and Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-field">
                                <label className="text-xs font-semibold text-muted mb-1 block">
                                    Current KM Reading <span className="text-red-500">*</span>
                                </label>
                                <div className="input-wrapper relative">
                                    <Clock size={18} className="absolute top-1/2 -translate-y-1/2 left-3.5 text-slate-400 z-10" />
                                    <input
                                        type="number"
                                        name="kmReading"
                                        defaultValue={vehicle.last_km}
                                        required
                                        className="w-full !pl-10 !pr-36 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-900 text-sm"
                                    />
                                    <div className="absolute right-1.5 top-1.5 bottom-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 flex items-center justify-center pointer-events-none z-10">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            Prev: {vehicle.last_km} KM
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="form-field">
                                <label className="text-xs font-semibold text-muted mb-1 block">Initial Status</label>
                                <div className="input-wrapper relative">
                                    <Clock size={18} className="absolute top-1/2 -translate-y-1/2 left-3.5 text-slate-400 z-10" />
                                    <select
                                        name="status"
                                        defaultValue="OPEN"
                                        className="w-full !pl-10 !pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-900 text-sm appearance-none"
                                    >
                                        <option value="OPEN">OPEN / PENDING</option>
                                        <option value="IN_PROGRESS">IN PROGRESS</option>
                                    </select>
                                    <ChevronRight size={16} className="absolute top-1/2 -translate-y-1/2 right-3.5 text-slate-400 pointer-events-none rotate-90 z-10" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-footer fixed bottom-[64px] md:bottom-0 left-0 right-0 z-40 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex justify-between gap-3 md:static md:bg-slate-50/50 md:shadow-none md:border-t md:rounded-b-[inherit] md:justify-end">
                    <Link href={`/dashboard/customers/${vehicle.customer_id}`} className="btn btn-outline border-slate-200 bg-white hover:bg-slate-50 flex-1 md:flex-none justify-center">
                        Cancel
                    </Link>
                    <button type="submit" className="btn btn-primary flex-1 md:flex-none justify-center" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
                        Create Job Card
                    </button>
                </div>
            </div>
        </form>
    );
}
