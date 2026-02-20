'use client';

import { useState, useMemo } from 'react';
import { updateJob } from '@/app/actions/job';
import { useRouter } from 'next/navigation';
import { Save, User, Phone, MapPin, Hash, Car, Clock, Settings, CheckCircle, AlertCircle, Loader2, ClipboardList, FileText, ChevronDown, Tag } from 'lucide-react';
import Link from 'next/link';

interface EditJobFormProps {
    job: any;
    mechanics: { id: number; name: string }[];
    isLocked: boolean;
    carLibrary: { brand: string; model: string }[];
}

export default function EditJobForm({ job, mechanics, isLocked, carLibrary }: EditJobFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Parse current model to pre-select brand/model if possible
    const currentParts = (job.model || '').split(' ');
    const [selectedBrand, setSelectedBrand] = useState(currentParts.length > 1 ? currentParts[0] : '');
    const [selectedModel, setSelectedModel] = useState(currentParts.length > 1 ? currentParts.slice(1).join(' ') : job.model || '');
    const [customBrand, setCustomBrand] = useState('');
    const [customModel, setCustomModel] = useState('');

    const brands = useMemo(() => {
        return Array.from(new Set(carLibrary.map(item => item.brand))).sort();
    }, [carLibrary]);

    const availableModels = useMemo(() => {
        if (!selectedBrand || selectedBrand === 'Other') return [];
        return carLibrary
            .filter(item => item.brand === selectedBrand)
            .map(item => item.model)
            .sort();
    }, [selectedBrand, carLibrary]);

    // Build the combined model string for submission
    const getFinalModel = () => {
        const brand = selectedBrand === 'Other' ? customBrand : selectedBrand;
        const model = selectedModel === 'Other' ? customModel : selectedModel;
        if (brand && model) return `${brand} ${model}`;
        if (model) return model;
        return job.model;
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(event.currentTarget);
        // Ensure the final model string is submitted correctly
        formData.set('model', getFinalModel());

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
                <h3 className="section-title flex items-center gap-2 mb-6 font-bold uppercase tracking-wider text-xs" style={{ color: 'var(--text-main)' }}>
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
                        <label>Mobile Number</label>
                        <div className={`input-wrapper ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Phone size={16} />
                            <input
                                type="text"
                                name="mobile"
                                defaultValue={job.mobile}
                                readOnly={isLocked}
                            />
                        </div>
                    </div>
                    <div className="form-field full">
                        <label>Address</label>
                        <div className={`input-wrapper items-start ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                            <MapPin size={16} style={{ position: 'absolute', top: '15px', left: '12px', zIndex: 10 }} />
                            <textarea
                                name="address"
                                defaultValue={job.address}
                                rows={2}
                                readOnly={isLocked}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: Vehicle Details */}
            <div className="mb-12 pt-12 border-t" style={{ borderColor: 'var(--border)' }}>
                <h3 className="section-title flex items-center gap-2 mb-6 font-bold uppercase tracking-wider text-xs" style={{ color: 'var(--text-main)' }}>
                    <Car size={18} className="text-primary" />
                    Vehicle Details
                </h3>
                <div className="form-grid">
                    <div className="form-field">
                        <label>Job Card # (Sequence) *</label>
                        <div className="input-wrapper">
                            <Hash size={16} />
                            <input
                                type="text"
                                name="jobNo"
                                defaultValue={job.job_no}
                                required
                                className="font-bold text-primary"
                            />
                        </div>
                    </div>
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
                        <label>Brand</label>
                        <div className={`input-wrapper relative ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Tag size={16} />
                            <select
                                value={selectedBrand}
                                onChange={e => { setSelectedBrand(e.target.value); setSelectedModel(''); }}
                                disabled={isLocked}
                                className="font-bold appearance-none flex-1 pr-10 outline-none"
                            >
                                <option value="">-- Select Brand --</option>
                                {brands.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                                <option value="Other">Other (type manually)</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-4 pointer-events-none text-slate-400" />
                        </div>
                        {selectedBrand === 'Other' && (
                            <div className="input-wrapper mt-2">
                                <Tag size={16} />
                                <input
                                    type="text"
                                    placeholder="Enter brand name"
                                    value={customBrand}
                                    onChange={e => setCustomBrand(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                    <div className="form-field">
                        <label>Model *</label>
                        <div className={`input-wrapper relative ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Car size={16} />
                            {availableModels.length > 0 ? (
                                <>
                                    <select
                                        value={selectedModel}
                                        onChange={e => setSelectedModel(e.target.value)}
                                        disabled={isLocked}
                                        required
                                        className="font-bold appearance-none flex-1 pr-10 outline-none"
                                    >
                                        <option value="">-- Select Model --</option>
                                        {availableModels.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                        <option value="Other">Other (type manually)</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 pointer-events-none text-slate-400" />
                                </>
                            ) : (
                                <input
                                    type="text"
                                    value={selectedModel}
                                    onChange={e => setSelectedModel(e.target.value)}
                                    placeholder={selectedBrand ? 'Enter model name' : 'Select a brand first'}
                                    required
                                    readOnly={isLocked}
                                    className="font-bold"
                                />
                            )}
                        </div>
                        {selectedModel === 'Other' && (
                            <div className="input-wrapper mt-2">
                                <Car size={16} />
                                <input
                                    type="text"
                                    placeholder="Enter model name"
                                    value={customModel}
                                    onChange={e => setCustomModel(e.target.value)}
                                />
                            </div>
                        )}
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
                    </div>
                    <div className="form-field">
                        <label>VIN Number</label>
                        <div className={`input-wrapper ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Hash size={16} />
                            <input
                                type="text"
                                name="vin"
                                defaultValue={job.vin}
                                readOnly={isLocked}
                                placeholder="17 Digit VIN"
                                maxLength={17}
                                className="font-mono"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 3: Work Description */}
            <div className="mb-12 pt-12 border-t" style={{ borderColor: 'var(--border)' }}>
                <h3 className="section-title flex items-center gap-2 mb-6 font-bold uppercase tracking-wider text-xs" style={{ color: 'var(--text-main)' }}>
                    <ClipboardList size={18} className="text-primary" />
                    Work Description & Complaints
                </h3>
                <div className="form-field full">
                    <div className="input-wrapper items-start">
                        <FileText size={16} style={{ position: 'absolute', top: '15px', left: '12px', zIndex: 10 }} />
                        <textarea
                            name="complaint"
                            rows={5}
                            placeholder="(Optional) Type detailed complaints or task list here..."
                            defaultValue={job.complaint}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* SECTION 4: Job Management */}
            <div className="mb-0 pt-12 border-t" style={{ borderColor: 'var(--border)' }}>
                <h3 className="section-title flex items-center gap-2 mb-6 font-bold uppercase tracking-wider text-xs" style={{ color: 'var(--text-main)' }}>
                    <Settings size={18} className="text-primary" />
                    Workflow & Assignment
                </h3>
                <div className="form-grid">
                    <div className="form-field">
                        <label>Workflow Status *</label>
                        <div className="input-wrapper relative">
                            <CheckCircle size={16} />
                            <select name="status" defaultValue={job.status} required className="font-bold text-primary appearance-none flex-1 pr-10 outline-none">
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="BILLED">Billed</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 pointer-events-none text-slate-400" />
                        </div>
                    </div>

                    <div className="form-field">
                        <label>Assigned Mechanic</label>
                        <div className="input-wrapper relative">
                            <User size={16} />
                            <select name="mechanicId" defaultValue={job.assigned_mechanic_id || ""} className="appearance-none flex-1 pr-10 outline-none">
                                <option value="">-- Unassigned --</option>
                                {mechanics.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 pointer-events-none text-slate-400" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-actions pt-8 border-t flex justify-end gap-3 mt-10" style={{ borderColor: 'var(--border)' }}>
                <Link
                    href={`/dashboard/jobs/${job.id}`}
                    className="btn btn-outline"
                    style={{ borderRadius: '16px', padding: '12px 28px' }}
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary flex items-center justify-center gap-2"
                    style={{ borderRadius: '16px', padding: '12px 32px', fontWeight: 600 }}
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>
        </form>
    );
}
