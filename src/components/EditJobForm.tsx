'use client';

import { useState } from 'react';
import { updateJob } from '@/app/actions/job';
import { useRouter } from 'next/navigation';
import { Save, User, Phone, MapPin, Hash, Car, Clock, Settings, CheckCircle, AlertCircle, Loader2, ClipboardList, FileText } from 'lucide-react';
import Link from 'next/link';

interface EditJobFormProps {
    job: any;
    mechanics: { id: number; name: string }[];
    isLocked: boolean;
}

export default function EditJobForm({ job, mechanics, isLocked }: EditJobFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(event.currentTarget);

        try {
            const result = await updateJob(formData);
            if (result.success) {
                router.push(`/dashboard/jobs/${job.id}`);
                router.refresh();
            } else {
                setError(result.error || 'Failed to update job');
                setLoading(false);
            }
        } catch (err) {
            setError('An unexpected error occurred');
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <input type="hidden" name="jobId" value={job.id} />
            <input type="hidden" name="customerId" value={job.customer_id} />
            <input type="hidden" name="vehicleId" value={job.vehicle_id} />

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-2 text-sm font-bold">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* SECTION 1: Customer Details */}
            <div className="mb-12">
                <h3 className="section-title text-slate-900 flex items-center gap-2 mb-6 font-bold uppercase tracking-wider text-xs">
                    <User size={18} className="text-primary" />
                    Customer Details
                </h3>
                <div className="form-grid">
                    <div className="form-field">
                        <label>Full Name *</label>
                        <div className={`input-wrapper ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                            <User size={16} />
                            <input
                                type="text"
                                name="customerName"
                                defaultValue={job.customer_name}
                                required
                                readOnly={isLocked}
                            />
                        </div>
                    </div>
                    <div className="form-field">
                        <label>Mobile Number *</label>
                        <div className={`input-wrapper ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Phone size={16} />
                            <input
                                type="text"
                                name="mobile"
                                defaultValue={job.mobile}
                                required
                                readOnly={isLocked}
                            />
                        </div>
                    </div>
                    <div className="form-field full">
                        <label>Address</label>
                        <div className={`input-wrapper ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                            <MapPin size={16} />
                            <textarea
                                name="address"
                                defaultValue={job.address}
                                rows={2}
                                readOnly={isLocked}
                                style={{ height: 'auto', paddingTop: '12px' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: Vehicle Details */}
            <div className="mb-12 pt-12 border-t border-slate-100">
                <h3 className="section-title text-slate-900 flex items-center gap-2 mb-6 font-bold uppercase tracking-wider text-xs">
                    <Car size={18} className="text-primary" />
                    Vehicle Details
                </h3>
                <div className="form-grid">
                    <div className="form-field">
                        <label>Vehicle Number *</label>
                        <div className={`input-wrapper ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Hash size={16} />
                            <input
                                type="text"
                                name="vehicleNumber"
                                defaultValue={job.vehicle_number}
                                required
                                readOnly={isLocked}
                                className="font-mono uppercase font-black"
                            />
                        </div>
                    </div>
                    <div className="form-field">
                        <label>Model *</label>
                        <div className={`input-wrapper ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Car size={16} />
                            <input
                                type="text"
                                name="model"
                                defaultValue={job.model}
                                required
                                readOnly={isLocked}
                            />
                        </div>
                    </div>
                    <div className="form-field">
                        <label>KM Reading *</label>
                        <div className="input-wrapper">
                            <Clock size={16} />
                            <input
                                type="number"
                                name="kmReading"
                                defaultValue={job.km_reading}
                                required
                            />
                        </div>
                        <p className="mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Previous: {job.last_km || 0} KM</p>
                    </div>
                </div>
            </div>

            {/* SECTION 3: Work Description */}
            <div className="mb-12 pt-12 border-t border-slate-100">
                <h3 className="section-title text-slate-900 flex items-center gap-2 mb-6 font-bold uppercase tracking-wider text-xs">
                    <ClipboardList size={18} className="text-primary" />
                    Work Description & Complaints
                </h3>
                <div className="form-field full">
                    <div className="input-wrapper">
                        <FileText size={16} style={{ position: 'absolute', top: '16px' }} />
                        <textarea
                            name="complaint"
                            rows={5}
                            placeholder="Type detailed complaints or task list here..."
                            defaultValue={job.complaint} // Note: Using job.complaint from getJobDetails mapping
                            required
                            style={{ height: 'auto', paddingTop: '12px' }}
                        />
                    </div>
                </div>
            </div>

            {/* SECTION 4: Job Management */}
            <div className="mb-0 pt-12 border-t border-slate-100">
                <h3 className="section-title text-slate-900 flex items-center gap-2 mb-6 font-bold uppercase tracking-wider text-xs">
                    <Settings size={18} className="text-primary" />
                    Workflow & Assignment
                </h3>
                <div className="form-grid">
                    <div className="form-field">
                        <label>Workflow Status *</label>
                        <div className="input-wrapper">
                            <CheckCircle size={16} />
                            <select name="status" defaultValue={job.status} required className="font-bold text-primary">
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="BILLED">Billed</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-field">
                        <label>Assigned Mechanic</label>
                        <div className="input-wrapper">
                            <User size={16} />
                            <select name="mechanicId" defaultValue={job.assigned_mechanic_id || ""}>
                                <option value="">-- Unassigned --</option>
                                {mechanics.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-actions pt-8 border-t border-slate-100 flex justify-end gap-3 mt-10">
                <Link
                    href={`/dashboard/jobs/${job.id}`}
                    className="btn btn-outline border-slate-200"
                    style={{ borderRadius: '16px', padding: '12px 28px' }}
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    style={{ borderRadius: '16px', padding: '12px 32px', fontWeight: 600 }}
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>
        </form>
    );
}
