'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { updateJob } from '@/app/actions/job';
import { useRouter } from 'next/navigation';
import {
    Save, User, Phone, MapPin, Hash, Car, Clock, Settings,
    CheckCircle, AlertCircle, Loader2, ClipboardList, FileText,
    ChevronDown, Tag, X, Pencil
} from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    job: any;
    mechanics: { id: number; name: string }[];
    isLocked: boolean;
    carLibrary: { brand: string; model: string }[];
}

export default function EditJobButton({ job, mechanics, isLocked, carLibrary }: Props) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setMounted(true); }, []);

    // Keyboard close
    useEffect(() => {
        if (!isOpen) return;
        function onKey(e: KeyboardEvent) { if (e.key === 'Escape') handleClose(); }
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen]);

    // Parse brand/model
    const currentParts = (job.vehicle_model || '').split(' ');
    const [selectedBrand, setSelectedBrand] = useState(currentParts.length > 1 ? currentParts[0] : '');
    const [selectedModel, setSelectedModel] = useState(currentParts.length > 1 ? currentParts.slice(1).join(' ') : job.vehicle_model || '');
    const [customBrand, setCustomBrand] = useState('');
    const [customModel, setCustomModel] = useState('');

    const brands = useMemo(() => Array.from(new Set(carLibrary.map(i => i.brand))).sort(), [carLibrary]);
    const availableModels = useMemo(() => {
        if (!selectedBrand || selectedBrand === 'Other') return [];
        return carLibrary.filter(i => i.brand === selectedBrand).map(i => i.model).sort();
    }, [selectedBrand, carLibrary]);

    function getFinalModel() {
        const brand = selectedBrand === 'Other' ? customBrand : selectedBrand;
        const model = selectedModel === 'Other' ? customModel : selectedModel;
        if (brand && model) return `${brand} ${model}`;
        return model || job.vehicle_model;
    }

    function handleClose() {
        setIsOpen(false);
        setError('');
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');
        const formData = new FormData(e.currentTarget);
        formData.set('model', getFinalModel());
        formData.set('jobId', job.id.toString());
        formData.set('customerId', job.customer_id.toString());
        formData.set('vehicleId', job.vehicle_id.toString());

        try {
            const result = await updateJob(formData);
            if (result.success) {
                toast.success('Job updated successfully');
                router.refresh();
                handleClose();
            } else {
                setError(result.error || 'Failed to update');
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    }

    const modal = isOpen && mounted ? (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'jeFadeIn 0.15s ease',
        }}>
            <style>{`
                @keyframes jeFadeIn { from { opacity:0 } to { opacity:1 } }
                @keyframes jeSlideUp { from { opacity:0; transform: scale(0.97) translateY(16px) } to { opacity:1; transform:scale(1) translateY(0) } }
                .je-close:hover { background:rgba(239,68,68,0.1)!important; color:#ef4444!important; }
                .je-cancel:hover { border-color:var(--primary)!important; color:var(--primary)!important; }
            `}</style>

            {/* Backdrop click */}
            <div style={{ position: 'absolute', inset: 0 }} onClick={handleClose} />

            {/* Modal panel */}
            <div
                ref={modalRef}
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '760px',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
                    animation: 'jeSlideUp 0.22s cubic-bezier(0.16,1,0.3,1)',
                    overflow: 'hidden',
                }}
            >
                {/* ── Header ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.4)', flexShrink: 0 }}>
                            <Car size={22} color="#fff" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
                                Edit Job #{job.job_no || job.id}
                            </h3>
                            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                                Update customer, vehicle & job details
                            </p>
                        </div>
                    </div>
                    <button className="je-close" type="button" onClick={handleClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.15s', flexShrink: 0 }}>
                        <X size={16} />
                    </button>
                </div>

                {/* ── Scrollable form ── */}
                <form id="edit-job-modal-form" onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    {error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, color: '#ef4444', fontSize: 13, fontWeight: 700 }}>
                            <AlertCircle size={16} />{error}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

                        {/* Customer Details */}
                        <section>
                            <h4 style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <User size={14} />Customer Profile
                            </h4>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label>Full Name *</label>
                                    <div className={`input-wrapper ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <User size={16} />
                                        <input type="text" name="customerName" defaultValue={job.customer_name} required readOnly={isLocked} />
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label>Mobile Number</label>
                                    <div className={`input-wrapper ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <Phone size={16} />
                                        <input type="text" name="mobile" defaultValue={job.customer_mobile} readOnly={isLocked} />
                                    </div>
                                </div>
                                <div className="form-field full">
                                    <label>Address</label>
                                    <div className={`input-wrapper items-start ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <MapPin size={16} style={{ position: 'absolute', top: 15, left: 12, zIndex: 10 }} />
                                        <textarea name="address" defaultValue={job.customer_address} rows={2} readOnly={isLocked} className="w-full" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Vehicle Details */}
                        <section>
                            <h4 style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Car size={14} />Vehicle Details
                            </h4>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label>Job Card # *</label>
                                    <div className="input-wrapper">
                                        <Hash size={16} />
                                        <input type="text" name="jobNo" defaultValue={job.job_no} required className="font-bold text-primary" />
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label>Vehicle Number *</label>
                                    <div className={`input-wrapper ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <Hash size={16} />
                                        <input type="text" name="vehicleNumber" defaultValue={job.vehicle_number} required readOnly={isLocked} className="font-mono uppercase font-black" />
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label>Brand</label>
                                    <div className={`input-wrapper relative ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <Tag size={16} />
                                        <select value={selectedBrand} onChange={e => { setSelectedBrand(e.target.value); setSelectedModel(''); }} disabled={isLocked} className="font-bold appearance-none flex-1 pr-10 outline-none">
                                            <option value="">-- Select Brand --</option>
                                            {brands.map(b => <option key={b} value={b}>{b}</option>)}
                                            <option value="Other">Other</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 pointer-events-none text-slate-400" />
                                    </div>
                                    {selectedBrand === 'Other' && (
                                        <div className="input-wrapper mt-2"><Tag size={16} /><input type="text" placeholder="Enter brand" value={customBrand} onChange={e => setCustomBrand(e.target.value)} /></div>
                                    )}
                                </div>
                                <div className="form-field">
                                    <label>Model *</label>
                                    <div className={`input-wrapper relative ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <Car size={16} />
                                        {availableModels.length > 0 ? (<>
                                            <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} disabled={isLocked} required className="font-bold appearance-none flex-1 pr-10 outline-none">
                                                <option value="">-- Select Model --</option>
                                                {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                                                <option value="Other">Other</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-4 pointer-events-none text-slate-400" />
                                        </>) : (
                                            <input type="text" value={selectedModel} onChange={e => setSelectedModel(e.target.value)} placeholder={selectedBrand ? 'Enter model' : 'Select a brand first'} required readOnly={isLocked} className="font-bold" />
                                        )}
                                    </div>
                                    {selectedModel === 'Other' && (
                                        <div className="input-wrapper mt-2"><Car size={16} /><input type="text" placeholder="Enter model" value={customModel} onChange={e => setCustomModel(e.target.value)} /></div>
                                    )}
                                </div>
                                <div className="form-field">
                                    <label>KM Reading *</label>
                                    <div className="input-wrapper">
                                        <Clock size={16} />
                                        <input type="number" name="kmReading" defaultValue={job.km_reading} required />
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label>VIN Number</label>
                                    <div className={`input-wrapper ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <Hash size={16} />
                                        <input type="text" name="vin" defaultValue={job.vin} readOnly={isLocked} placeholder="17 Digit VIN" maxLength={17} className="font-mono" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Work Description */}
                        <section>
                            <h4 style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ClipboardList size={14} />Work Description
                            </h4>
                            <div className="form-field full">
                                <div className="input-wrapper items-start">
                                    <FileText size={16} style={{ position: 'absolute', top: 15, left: 12, zIndex: 10 }} />
                                    <textarea name="complaint" rows={4} placeholder="Type complaints or task list..." defaultValue={job.complaint} className="w-full" />
                                </div>
                            </div>
                        </section>

                        {/* Assignment & Status */}
                        <section>
                            <h4 style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Settings size={14} />Assignment &amp; Status
                            </h4>
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
                                        <select name="mechanicId" defaultValue={job.assigned_mechanic_id || ''} className="appearance-none flex-1 pr-10 outline-none">
                                            <option value="">-- Unassigned --</option>
                                            {mechanics.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-4 pointer-events-none text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </form>

                {/* ── Footer ── */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-main)', flexShrink: 0 }}>
                    <button className="je-cancel btn btn-outline" type="button" onClick={handleClose} style={{ borderRadius: 12, padding: '10px 22px', fontSize: 14, transition: 'all 0.15s' }}>
                        Cancel
                    </button>
                    <button type="submit" form="edit-job-modal-form" disabled={loading} className="btn btn-primary" style={{ borderRadius: 12, padding: '10px 26px', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(59,130,246,0.35)' }}>
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    ) : null;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn-outline border-slate-200 shadow-sm rounded-xl px-4 py-2 hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-bold"
            >
                <Pencil size={18} />
                <span className="hidden md:inline">Edit Info</span>
            </button>
            {mounted && modal ? createPortal(modal, document.body) : null}
        </>
    );
}
