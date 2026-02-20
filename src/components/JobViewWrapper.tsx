
import { getJobDetails, updateJobStatus, deleteJobCard, getMasterServices, getMasterParts, removeJobService, removeJobPart, getMechanics } from '@/app/actions/job';
import { getGeneralSettings } from '@/app/actions/settings';
import { getInvoiceByJobId, generateInvoice } from '@/app/actions/invoice';
import AssignMechanicDropdown from '@/components/AssignMechanicDropdown';
import { getSession } from '@/app/actions/auth';
import Link from 'next/link';
import {
    Clock, FileText,
    Printer, User, Phone, MapPin,
    Zap, ClipboardList, Car, Trash2, Pencil, CheckCircle,
    IndianRupee, Cpu, Settings, Trash, Receipt, Lock, X, Hash, Tag
} from 'lucide-react';
import { notFound, redirect } from 'next/navigation';
import AddServiceForm from '@/components/AddServiceForm';
import AddPartForm from '@/components/AddPartForm';
import CollapsibleSection from '@/components/CollapsibleSection';
import JobActionsFooter from '@/components/JobActionsFooter';

interface JobViewWrapperProps {
    jobId: number;
}

export default async function JobViewWrapper({ jobId }: JobViewWrapperProps) {
    const data = await getJobDetails(jobId);
    const session = await getSession();
    const isAdmin = session?.role === 'admin';

    if (!data) notFound();

    const { job, services, parts } = data;
    const masterServices = await getMasterServices();
    const masterParts = await getMasterParts();
    const mechanics = isAdmin ? await getMechanics() : [];
    const existingInvoice = isAdmin ? await getInvoiceByJobId(jobId) : null;

    const { settings } = await getGeneralSettings();
    const taxRate = settings?.tax_rate || '18';

    // Mechanics are locked out if job is billed or completed. Admins are never locked out.
    const isLocked = !isAdmin && (job.status === 'BILLED' || job.status === 'COMPLETED');

    return (
        <>
            <div className="page-header mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-main)' }}>Job Card #{job.job_no || job.id}</h1>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold uppercase tracking-wide" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                            <span className={`w-2 h-2 rounded-full ${job.status === 'COMPLETED' ? 'bg-green-500' : job.status === 'IN_PROGRESS' ? 'bg-blue-500' : job.status === 'BILLED' ? 'bg-purple-500' : 'bg-slate-400'}`}></span>
                            {job.status}
                        </div>
                        <span style={{ color: 'var(--border)' }}>|</span>
                        <div className="flex items-center gap-2.5 font-medium">
                            <Car size={16} style={{ color: 'var(--text-muted)' }} />
                            <span style={{ color: 'var(--text-main)' }}>{job.model}</span>
                        </div>
                        <span style={{ color: 'var(--border)' }}>|</span>
                        <div className="font-mono font-bold px-2 py-0.5 rounded border" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)', color: 'var(--text-main)' }}>
                            {job.vehicle_number}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    {isAdmin && (job.status === 'COMPLETED' || job.status === 'BILLED') && (services.length > 0 || parts.length > 0) && (
                        <form action={async () => {
                            'use server';
                            const result = await generateInvoice(jobId);
                            if (result.success && result.invoiceId) {
                                redirect(`/dashboard/invoices/${result.invoiceId}`);
                            }
                        }} className="hidden md:block">
                            <button
                                type="submit"
                                className="btn btn-primary shadow-xl flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-all hover:scale-[1.02]"
                            >
                                <Receipt size={20} />
                                {existingInvoice ? 'Update Invoice' : 'Generate Invoice'}
                            </button>
                        </form>
                    )}

                    {isAdmin && (services.length > 0 || parts.length > 0) && (
                        <Link
                            href={`/dashboard/jobs/${job.id}/estimate`}
                            target="_blank"
                            className="btn btn-outline border-2 shadow-sm flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-all"
                            title="Print Estimate / Proforma"
                        >
                            <FileText size={20} style={{ color: 'var(--text-muted)' }} />
                            <span className="hidden md:inline">Print Estimate</span>
                        </Link>
                    )}

                    {!isLocked && (
                        <div className="flex gap-2">
                            <Link href={`/dashboard/jobs/${job.id}/edit`} className="btn btn-outline border-slate-200 shadow-sm rounded-xl px-4 py-2 hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-bold" >
                                <Pencil size={18} />
                                <span className="hidden md:inline">Edit Info</span>
                            </Link >
                        </div >
                    )}

                    {job.status !== 'BILLED' && (
                        <form action={async () => {
                            'use server';
                            const nextStatus = job.status === 'OPEN' ? 'IN_PROGRESS' :
                                job.status === 'IN_PROGRESS' ? 'COMPLETED' : job.status;
                            if (nextStatus !== job.status) {
                                await updateJobStatus(jobId, nextStatus);
                            }
                        }} className="hidden md:block">
                            {job.status === 'IN_PROGRESS' && services.length === 0 && parts.length === 0 ? (
                                <button
                                    type="button"
                                    className="btn btn-outline shadow-lg flex items-center gap-2 opacity-50 cursor-not-allowed"
                                    disabled
                                    title="Add at least one service or part to complete the job"
                                    style={{ borderRadius: '16px', padding: '12px 32px', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                >
                                    <CheckCircle size={18} /> Add Items to Complete
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className={`btn ${job.status === 'OPEN' ? 'btn-primary' : job.status === 'IN_PROGRESS' ? '!bg-green-600 !text-white !border-green-600 hover:!bg-green-700' : 'btn-outline'} shadow-lg flex items-center gap-2`}
                                    disabled={job.status === 'COMPLETED' && !isAdmin}
                                    style={{ borderRadius: '16px', padding: '12px 32px', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                >
                                    {job.status === 'OPEN' && <><Zap size={18} className="fill-white" /> Start Work</>}
                                    {job.status === 'IN_PROGRESS' && <><CheckCircle size={18} /> Complete Work</>}
                                    {job.status === 'COMPLETED' && (isAdmin ? 'Waiting Invoice' : 'Waiting Billing')}
                                </button>
                            )}
                        </form>
                    )}

                    {job.status === 'BILLED' && !isAdmin && (
                        <div className="flex items-center gap-2 px-6 py-3 bg-purple-50 text-purple-700 rounded-2xl border-2 border-purple-200">
                            <Lock size={18} />
                            <span className="text-sm font-black uppercase tracking-wider">Job Billed & Locked</span>
                        </div>
                    )}

                    {isAdmin && (job.status === 'OPEN') && (
                        <form action={async () => {
                            'use server';
                            await deleteJobCard(jobId);
                            redirect('/dashboard/jobs');
                        }}>
                            <button
                                type="submit"
                                title="Delete Job"
                                className="btn btn-outline text-red-500 hover:bg-red-50 border-red-100 px-4 py-2 rounded-xl"
                            >
                                <Trash2 size={18} />
                            </button>
                        </form>
                    )}
                </div >
            </div >

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-4">
                    <CollapsibleSection title="Customer Profile" icon={<User className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] text-primary" />} defaultOpen>
                        <div className="form-grid">
                            <div className="form-field">
                                <label className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                                <div className="flex items-center gap-3 p-3 border rounded-xl" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)' }}>
                                    <User size={16} style={{ color: 'var(--text-muted)' }} />
                                    <span className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>{job.customer_name}</span>
                                </div>
                            </div>
                            <div className="form-field">
                                <label className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Mobile Number</label>
                                <div className="flex items-center gap-3 p-3 border rounded-xl" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)' }}>
                                    <Phone size={16} style={{ color: 'var(--text-muted)' }} />
                                    <span className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>{job.mobile || '—'}</span>
                                </div>
                            </div>
                            <div className="form-field col-span-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Address</label>
                                <div className="flex items-start gap-3 p-3 border rounded-xl" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)' }}>
                                    <MapPin size={16} style={{ color: 'var(--text-muted)', marginTop: '2px' }} />
                                    <span className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>{job.address || '—'}</span>
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Vehicle Details" icon={<Car className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] text-primary" />}>
                        {(() => {
                            const modelParts = (job.model || '').split(' ');
                            const brand = modelParts.length > 1 ? modelParts[0] : '—';
                            const modelName = modelParts.length > 1 ? modelParts.slice(1).join(' ') : job.model || '—';
                            return (
                                <div className="form-grid">
                                    <div className="form-field">
                                        <label className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Brand</label>
                                        <div className="flex items-center gap-3 p-3 border rounded-xl" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)' }}>
                                            <Tag size={16} style={{ color: 'var(--text-muted)' }} />
                                            <span className="font-bold text-sm capitalize" style={{ color: 'var(--text-main)' }}>{brand}</span>
                                        </div>
                                    </div>
                                    <div className="form-field">
                                        <label className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Model</label>
                                        <div className="flex items-center gap-3 p-3 border rounded-xl" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)' }}>
                                            <Car size={16} style={{ color: 'var(--text-muted)' }} />
                                            <span className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>{modelName}</span>
                                        </div>
                                    </div>
                                    <div className="form-field">
                                        <label className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Vehicle Number</label>
                                        <div className="flex items-center gap-3 p-3 border rounded-xl" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)' }}>
                                            <div className="font-mono font-black text-sm tracking-wide px-2 py-0.5 rounded border uppercase" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-main)' }}>
                                                {job.vehicle_number}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-field">
                                        <label className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Current KM</label>
                                        <div className="flex items-center gap-3 p-3 border rounded-xl" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)' }}>
                                            <Clock size={16} style={{ color: 'var(--text-muted)' }} />
                                            <span className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>{job.km_reading?.toLocaleString() || 0} km</span>
                                        </div>
                                    </div>
                                    <div className="form-field">
                                        <label className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>VIN Number</label>
                                        <div className="flex items-center gap-3 p-3 border rounded-xl" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)' }}>
                                            <Hash size={16} style={{ color: 'var(--text-muted)' }} />
                                            <span className="font-mono font-bold text-sm tracking-wide px-2 py-0.5 rounded border uppercase" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-main)' }}>
                                                {job.vin || '—'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </CollapsibleSection>

                    <CollapsibleSection title="Allocation" icon={<Settings className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] text-primary" />}>
                        <div className="form-grid">
                            {isAdmin ? (
                                <div className="form-field">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Lead Mechanic</label>
                                    <div className="relative">
                                        <AssignMechanicDropdown jobId={jobId} mechanics={mechanics} currentMechanicId={job.assigned_mechanic_id} isLocked={isLocked} />
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 text-sm text-slate-500 bg-slate-50 rounded-lg">Mechanic Assignment is managed by Admin.</div>
                            )}
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Work Description" icon={<ClipboardList className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] text-primary" />}>
                        <div className="form-field full">
                            <div className="input-wrapper relative">
                                <FileText size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                                <textarea readOnly value={job.complaint || 'No description provided'} className="w-full border-0 focus:ring-0 font-bold text-sm resize-none appearance-none" style={{ minHeight: '120px', padding: '12px 16px 12px 44px', borderRadius: '12px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Services & Labour" icon={<Settings className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] text-primary" />}>
                        <div className="flex justify-end mb-4">{!isLocked && <AddServiceForm jobId={jobId} masterServices={masterServices} isAdmin={isAdmin} />}</div>
                        {services.length === 0 ? (
                            <div className="py-8 text-center border-b border-dashed border-slate-200 mb-8"><p className="text-sm text-slate-400 font-medium">No services added yet</p></div>
                        ) : (
                            <div className="space-y-3 mb-6">
                                {services.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center p-4 border rounded-xl hover:border-blue-300 transition-all" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)' }}>
                                        <div>
                                            <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-main)' }}>{item.service_name}</div>
                                            <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>QTY: {item.quantity}</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {isAdmin && <div className="text-sm font-black" style={{ color: 'var(--text-main)' }}>₹{(item.price * item.quantity).toLocaleString()}</div>}
                                            {!isLocked && (
                                                <form action={async () => { 'use server'; await removeJobService(jobId, item.id); }}>
                                                    <button type="submit" className="icon-btn hover:text-red-500 hover:border-red-500/30 transition-all"><X size={18} /></button>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CollapsibleSection>

                    <CollapsibleSection title="Parts & Inventory" icon={<Cpu className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] text-primary" />}>
                        <div className="flex justify-end mb-4">{!isLocked && <AddPartForm jobId={jobId} masterParts={masterParts} isAdmin={isAdmin} />}</div>
                        {parts.length === 0 ? (
                            <div className="py-8 text-center mb-4"><p className="text-sm text-slate-400 font-medium">No parts added yet</p></div>
                        ) : (
                            <div className="space-y-3">
                                {parts.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center p-4 border rounded-xl hover:border-blue-300 transition-all" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)' }}>
                                        <div>
                                            <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-main)' }}>{item.part_name}</div>
                                            <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{item.part_no} • QTY: {item.quantity}</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {isAdmin && <div className="text-sm font-black" style={{ color: 'var(--text-main)' }}>₹{(item.price * item.quantity).toLocaleString()}</div>}
                                            {!isLocked && (
                                                <form action={async () => { 'use server'; await removeJobPart(jobId, item.id); }}>
                                                    <button type="submit" className="icon-btn hover:text-red-500 hover:border-red-500/30 transition-all"><X size={18} /></button>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CollapsibleSection>
                </div>

                <div className="space-y-6 lg:sticky lg:top-8">
                    {isAdmin && (
                        <div className="card border mb-6 overflow-hidden rounded-[24px]" style={{ borderColor: 'var(--border)' }}>
                            <div className="p-6 border-b" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="card-icon !w-8 !h-8"><FileText size={16} /></div>
                                    <h3 className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Job Bill Summary</h3>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center"><span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Services Total</span><span className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>₹{Number(job.total_services_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Parts Total</span><span className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>₹{Number(job.total_parts_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Tax (GST {taxRate}%)</span><span className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>₹{Number(job.tax_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                </div>
                                <div className="pt-4 border-t border-dashed" style={{ borderColor: 'var(--border)' }}>
                                    <div className="flex justify-between items-end"><span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Grand Total</span><span className="text-2xl font-black text-primary">₹{Number(job.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                </div>
                                {isAdmin && (job.status === 'COMPLETED' || job.status === 'BILLED') && (services.length > 0 || parts.length > 0) && (
                                    <form action={async () => { 'use server'; const result = await generateInvoice(jobId); if (result.success && result.invoiceId) { redirect(`/dashboard/invoices/${result.invoiceId}`); } }} className="pt-2">
                                        <button type="submit" className="btn btn-primary w-full py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">{existingInvoice ? 'Update & View Invoice' : 'Generate Final Bill'}</button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="card border mb-6" style={{ padding: '24px', borderRadius: '24px', borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-2 mb-8" style={{ border: 'none', padding: 0 }}>
                            <ClipboardList size={18} className="text-primary" />
                            <span className="font-bold uppercase tracking-wider text-xs" style={{ color: 'var(--text-muted)' }}>Job Activity Log</span>
                        </div>
                        <div className="space-y-6">
                            <div className="relative pl-0 space-y-6">
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-green-500 border border-green-200" style={{ boxShadow: '0 0 0 4px var(--bg-main)' }} />
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm font-bold leading-none" style={{ color: 'var(--text-main)', margin: 0 }}>Job Card Created</p>
                                        <p className="text-[11px] font-medium uppercase tracking-tight" style={{ color: 'var(--text-muted)', margin: 0 }}>{new Date(job.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                    </div>
                                </div>
                                {job.started_at && (
                                    <div className="relative">
                                        <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-primary border border-primary/20" style={{ boxShadow: '0 0 0 4px var(--bg-card)' }} />
                                        <div className="flex flex-col gap-2">
                                            <p className="text-sm font-bold leading-none" style={{ color: 'var(--text-main)', margin: 0 }}>Work Started</p>
                                            <p className="text-[11px] font-medium uppercase tracking-tight" style={{ color: 'var(--text-muted)', margin: 0 }}>{new Date(job.started_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                        </div>
                                    </div>
                                )}
                                {job.completed_at && (
                                    <div className="relative">
                                        <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-green-500 border border-green-200" style={{ boxShadow: '0 0 0 4px var(--bg-card)' }} />
                                        <div className="flex flex-col gap-2">
                                            <p className="text-sm font-bold leading-none" style={{ color: 'var(--text-main)', margin: 0 }}>Work Marked Completed</p>
                                            <p className="text-[11px] font-medium uppercase tracking-tight" style={{ color: 'var(--text-muted)', margin: 0 }}>{new Date(job.completed_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                        </div>
                                    </div>
                                )}
                                {job.status === 'BILLED' && (
                                    <div className="relative">
                                        <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-purple-500 border border-purple-200" style={{ boxShadow: '0 0 0 4px var(--bg-card)' }} />
                                        <div className="flex flex-col gap-2">
                                            <p className="text-sm font-bold leading-none" style={{ color: 'var(--text-main)', margin: 0 }}>Job Billed & Closed</p>
                                            <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)', margin: 0 }}>Finalized</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <JobActionsFooter>
                {job.status !== 'BILLED' && (
                    <form action={async () => { 'use server'; const nextStatus = job.status === 'OPEN' ? 'IN_PROGRESS' : job.status === 'IN_PROGRESS' ? 'COMPLETED' : job.status; if (nextStatus !== job.status) { await updateJobStatus(jobId, nextStatus); } }} className="w-full">
                        {job.status === 'IN_PROGRESS' && services.length === 0 && parts.length === 0 ? (
                            <button type="button" className="btn btn-outline shadow-lg flex items-center justify-center gap-2 opacity-50 cursor-not-allowed w-full" disabled title="Add at least one service or part to complete the job"><CheckCircle size={18} /> Add Items to Complete</button>
                        ) : (
                            <button type="submit" className={`btn ${job.status === 'OPEN' ? 'btn-primary' : job.status === 'IN_PROGRESS' ? '!bg-green-600 !text-white !border-green-600 hover:!bg-green-700' : 'btn-outline'} shadow-lg flex items-center justify-center gap-2 w-full`} disabled={job.status === 'COMPLETED' && !isAdmin}>
                                {job.status === 'OPEN' && <><Zap size={18} className="fill-white" /> Start Work</>}
                                {job.status === 'IN_PROGRESS' && <><CheckCircle size={18} /> Complete Work</>}
                                {job.status === 'COMPLETED' && (isAdmin ? 'Waiting Invoice' : 'Waiting Billing')}
                            </button>
                        )}
                    </form>
                )}
                {isAdmin && (job.status === 'COMPLETED' || job.status === 'BILLED') && (services.length > 0 || parts.length > 0) && (
                    <form action={async () => { 'use server'; const result = await generateInvoice(jobId); if (result.success && result.invoiceId) { redirect(`/dashboard/invoices/${result.invoiceId}`); } }} className="w-full">
                        <button type="submit" className="btn btn-primary shadow-xl flex items-center justify-center gap-2 w-full"><Receipt size={20} />{existingInvoice ? 'Update & View Invoice' : 'Generate Invoice'}</button>
                    </form>
                )}
            </JobActionsFooter>
        </>
    );
}
