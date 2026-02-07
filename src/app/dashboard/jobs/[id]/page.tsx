
import { getJobDetails, updateJobStatus, deleteJobCard, getMasterServices, getMasterParts, removeJobService, removeJobPart, getMechanics } from '@/app/actions/job';
import { getInvoiceByJobId, generateInvoice } from '@/app/actions/invoice';
import AssignMechanicDropdown from '@/components/AssignMechanicDropdown';
import { getSession } from '@/app/actions/auth';
import Link from 'next/link';
import {
    ArrowLeft, Clock, FileText,
    Printer, User, Phone, MapPin,
    Zap, ClipboardList, Car, Trash2, Pencil, CheckCircle,
    IndianRupee, Cpu, Settings, Trash, Receipt, Lock, X
} from 'lucide-react';
import { notFound, redirect } from 'next/navigation';
import AddServiceForm from '@/components/AddServiceForm';
import AddPartForm from '@/components/AddPartForm';
import CollapsibleSection from '@/components/CollapsibleSection';
import JobActionsFooter from '@/components/JobActionsFooter';


type Params = Promise<{ id: string }>;

export default async function JobDetailPage(props: { params: Params }) {
    const params = await props.params;
    const jobId = parseInt(params.id);
    const data = await getJobDetails(jobId);
    const session = await getSession();
    const isAdmin = session?.role === 'admin';

    if (!data) notFound();

    const { job, services, parts } = data;
    const masterServices = await getMasterServices();
    const masterParts = await getMasterParts();
    const mechanics = isAdmin ? await getMechanics() : [];
    const existingInvoice = isAdmin ? await getInvoiceByJobId(jobId) : null;

    const statusColors: any = {
        'OPEN': 'bg-slate-100 text-slate-700',
        'IN_PROGRESS': 'bg-blue-100 text-blue-700',
        'COMPLETED': 'bg-green-100 text-green-700',
        'BILLED': 'bg-purple-100 text-purple-700',
    };

    // Mechanics are locked out ONLY if job is billed or completed.
    const isLocked = job.status === 'BILLED' || (job.status === 'COMPLETED' && !isAdmin);

    return (
        <div className="dashboard-container">
            <nav className="breadcrumbs text-muted mb-2">
                <span className="breadcrumb-item text-slate-400">Dashboard</span>
                <span className="breadcrumb-separator mx-2 text-slate-300">/</span>
                <span className="breadcrumb-item text-slate-400">Jobs</span>
                <span className="breadcrumb-separator mx-2 text-slate-300">/</span>
                <span className="breadcrumb-item active text-primary font-bold">#{job.id}</span>
            </nav>

            <div className="page-header mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Job Card #{job.id}</h1>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold uppercase tracking-wide">
                            <span className={`w - 2 h - 2 rounded - full ${statusColors[job.status]?.replace('bg-', 'bg-').replace('text-', 'bg-') || 'bg-slate-400'} `}></span>
                            {job.status}
                        </div>
                        <span className="text-slate-300">|</span>
                        <div className="flex items-center gap-1.5 font-medium">
                            <Car size={16} className="text-slate-400" />
                            <span className="text-slate-700">{job.model}</span>
                        </div>
                        <span className="text-slate-300">|</span>
                        <div className="font-mono font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                            {job.vehicle_number}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    {/* Invoice Button - Admin Only, COMPLETED or BILLED jobs with items */}
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
                                className="btn btn-primary shadow-xl flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Receipt size={20} />
                                {existingInvoice ? 'Update Invoice' : 'Generate Invoice'}
                            </button>
                        </form>
                    )}

                    {/* ALWAYS ON Print Estimate for Admin */}
                    {isAdmin && (services.length > 0 || parts.length > 0) && (
                        <Link
                            href={`/dashboard/jobs/${job.id}/estimate`}
                            target="_blank"
                            className="btn bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 shadow-sm flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-all"
                            title="Print Estimate / Proforma"
                        >
                            <FileText size={20} className="text-slate-400" />
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

                    {isAdmin && (
                        <form action={async () => {
                            'use server';
                            await deleteJobCard(jobId);
                            redirect('/dashboard/jobs');
                        }}>
                            <button
                                type="submit"
                                className="btn-icon animate-icon border border-red-200 hover:bg-red-50 text-red-500 rounded-xl"
                                title="Delete Job Card"
                            >
                                <Trash2 size={18} />
                            </button>
                        </form>
                    )}

                    {/* Status Update Button - Only for non-BILLED jobs */}
                    {
                        job.status !== 'BILLED' && (
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
                        )
                    }


                    {/* BILLED Badge - Only show for mechanics (admins can still edit) */}
                    {
                        job.status === 'BILLED' && !isAdmin && (
                            <div className="flex items-center gap-2 px-6 py-3 bg-purple-50 text-purple-700 rounded-2xl border-2 border-purple-200">
                                <Lock size={18} />
                                <span className="text-sm font-black uppercase tracking-wider">Job Billed & Locked</span>
                            </div>
                        )
                    }

                    {
                        isAdmin && (job.status === 'OPEN') && (
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
                        )
                    }
                </div >
            </div >

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-4">
                    {/* SECTION 1: Customer Details */}
                    <CollapsibleSection title="Customer Profile" icon={<User className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] text-primary" />} defaultOpen>
                        <div className="form-grid">
                            <div className="form-field">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <User size={16} className="text-slate-400" />
                                    <span className="font-bold text-slate-900 text-sm">{job.customer_name}</span>
                                </div>
                            </div>
                            <div className="form-field">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mobile Number</label>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <Phone size={16} className="text-slate-400" />
                                    <span className="font-bold text-slate-900 text-sm">{job.mobile || '—'}</span>
                                </div>
                            </div>
                            <div className="form-field col-span-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Address</label>
                                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <MapPin size={16} className="text-slate-400 mt-0.5" />
                                    <span className="font-bold text-slate-900 text-sm">{job.address || '—'}</span>
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {/* SECTION 2: Vehicle Details */}
                    <CollapsibleSection title="Vehicle Details" icon={<Car className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] text-primary" />}>
                        <div className="form-grid">
                            <div className="form-field">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Vehicle Model</label>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <Car size={16} className="text-slate-400" />
                                    <span className="font-bold text-slate-900 text-sm">{job.model}</span>
                                </div>
                            </div>
                            <div className="form-field">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Vehicle Number</label>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <div className="font-mono font-black text-slate-900 text-sm tracking-wide bg-white px-2 py-0.5 rounded border border-slate-100 uppercase">
                                        {job.vehicle_number}
                                    </div>
                                </div>
                            </div>
                            <div className="form-field">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Current KM</label>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <Clock size={16} className="text-slate-400" />
                                    <span className="font-bold text-slate-900 text-sm">{job.km_reading?.toLocaleString() || 0} km</span>
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {/* SECTION 3: Allocation */}
                    <CollapsibleSection title="Allocation" icon={<Settings className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] text-primary" />}>
                        <div className="form-grid">
                            {isAdmin ? (
                                <div className="form-field">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Lead Mechanic</label>
                                    <div className="relative">
                                        <AssignMechanicDropdown
                                            jobId={jobId}
                                            mechanics={mechanics}
                                            currentMechanicId={job.assigned_mechanic_id}
                                            isLocked={isLocked}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 text-sm text-slate-500 bg-slate-50 rounded-lg">
                                    Mechanic Assignment is managed by Admin.
                                </div>
                            )}
                        </div>
                    </CollapsibleSection>

                    {/* SECTION 4: Work Description */}
                    <CollapsibleSection title="Work Description" icon={<ClipboardList className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] text-primary" />}>
                        <div className="form-field full">
                            <div className="input-wrapper">
                                <FileText size={16} className="text-slate-400" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                                <textarea
                                    readOnly
                                    value={job.complaint || 'No description provided'}
                                    className="w-full bg-slate-50 border-0 focus:ring-0 text-slate-700 font-bold text-sm resize-none appearance-none"
                                    style={{ minHeight: '120px', padding: '12px 16px 12px 44px', borderRadius: '12px' }}
                                />
                            </div>
                        </div>
                    </CollapsibleSection>

                    {/* SECTION 5: Services */}
                    <CollapsibleSection title="Services & Labour" icon={<Settings className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] text-primary" />}>
                        <div className="flex justify-end mb-4">
                            {!isLocked && <AddServiceForm jobId={jobId} masterServices={masterServices} isAdmin={isAdmin} />}
                        </div>

                        {services.length === 0 ? (
                            <div className="py-8 text-center border-b border-dashed border-slate-200 mb-8">
                                <p className="text-sm text-slate-400 font-medium">No services added yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3 mb-6">
                                {services.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-300 transition-all">
                                        <div>
                                            <div className="text-sm font-bold text-slate-900 mb-1">{item.service_name}</div>
                                            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">QTY: {item.quantity}</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {isAdmin && <div className="text-sm font-black text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</div>}
                                            {!isLocked && (
                                                <form action={async () => {
                                                    'use server';
                                                    await removeJobService(jobId, item.id);
                                                }}>
                                                    <button type="submit" className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                                                        <X size={18} />
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CollapsibleSection>

                    {/* SECTION 6: Parts */}
                    <CollapsibleSection title="Parts & Inventory" icon={<Cpu className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] text-primary" />}>
                        <div className="flex justify-end mb-4">
                            {!isLocked && <AddPartForm jobId={jobId} masterParts={masterParts} isAdmin={isAdmin} />}
                        </div>

                        {parts.length === 0 ? (
                            <div className="py-8 text-center mb-4">
                                <p className="text-sm text-slate-400 font-medium">No parts added yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {parts.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-300 transition-all">
                                        <div>
                                            <div className="text-sm font-bold text-slate-900 mb-1">{item.part_name}</div>
                                            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{item.part_no} • QTY: {item.quantity}</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {isAdmin && <div className="text-sm font-black text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</div>}
                                            {!isLocked && (
                                                <form action={async () => {
                                                    'use server';
                                                    await removeJobPart(jobId, item.id);
                                                }}>
                                                    <button type="submit" className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                                                        <X size={18} />
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CollapsibleSection>
                </div>

                {/* Right Sidebar: Summary & Status */}
                <div className="space-y-6 lg:sticky lg:top-8">
                    {isAdmin && (
                        <div className="card border border-slate-200 bg-white mb-6 overflow-hidden rounded-[24px]">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="card-icon !w-8 !h-8">
                                        <FileText size={16} />
                                    </div>
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Job Bill Summary</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-slate-500">Services Total</span>
                                        <span className="text-sm font-bold text-slate-900">₹{job.total_services_amount?.toLocaleString() || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-slate-500">Parts Total</span>
                                        <span className="text-sm font-bold text-slate-900">₹{job.total_parts_amount?.toLocaleString() || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-slate-500">Tax (GST 18%)</span>
                                        <span className="text-sm font-bold text-slate-900">₹{job.tax_amount?.toLocaleString() || 0}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-dashed border-slate-200">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Grand Total</span>
                                        <span className="text-2xl font-black text-primary">₹{job.grand_total?.toLocaleString() || 0}</span>
                                    </div>
                                </div>

                                {isAdmin && (job.status === 'COMPLETED' || job.status === 'BILLED') && (services.length > 0 || parts.length > 0) && (
                                    <form action={async () => {
                                        'use server';
                                        const result = await generateInvoice(jobId);
                                        if (result.success && result.invoiceId) {
                                            redirect(`/dashboard/invoices/${result.invoiceId}`);
                                        }
                                    }} className="pt-2">
                                        <button type="submit" className="btn btn-primary w-full py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                            {existingInvoice ? 'Update & View Invoice' : 'Generate Final Bill'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="card border-slate-200 bg-white mb-6" style={{ padding: '24px', borderRadius: '24px' }}>
                        <h3 className="section-title text-slate-900 flex items-center gap-2 mb-6 font-bold uppercase tracking-wider text-2xl border-0 pb-0">
                            <ClipboardList size={18} className="text-primary" />
                            Job Activity Log
                        </h3>
                        <div className="space-y-6">
                            <div className="relative pl-6 border-l-2 border-slate-100 space-y-6">
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-green-500 ring-4 ring-white border border-green-200" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">Job Card Created</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5 font-medium uppercase tracking-tight">{new Date(job.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                    </div>
                                </div>
                                {job.started_at && (
                                    <div className="relative">
                                        <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-white border border-primary/20" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">Work Started</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5 font-medium uppercase tracking-tight">{new Date(job.started_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                        </div>
                                    </div>
                                )}
                                {job.completed_at && (
                                    <div className="relative">
                                        <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-green-500 ring-4 ring-white border border-green-200" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">Work Marked Completed</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5 font-medium uppercase tracking-tight">{new Date(job.completed_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                        </div>
                                    </div>
                                )}
                                {job.status === 'BILLED' && (
                                    <div className="relative">
                                        <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-white border border-purple-200" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">Job Billed & Closed</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5 font-black uppercase tracking-widest text-[9px]">Finalized</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-8 mb-4">
                <Link href="/dashboard/jobs" className="text-[13px] font-semibold text-slate-500 hover:text-primary transition-colors inline-flex items-center gap-2">
                    <ArrowLeft size={14} />
                    Return to Job Board
                </Link>
            </div>

            <JobActionsFooter>
                {/* Status Update Button - Only for non-BILLED jobs */}
                {
                    job.status !== 'BILLED' && (
                        <form action={async () => {
                            'use server';
                            const nextStatus = job.status === 'OPEN' ? 'IN_PROGRESS' :
                                job.status === 'IN_PROGRESS' ? 'COMPLETED' : job.status;
                            if (nextStatus !== job.status) {
                                await updateJobStatus(jobId, nextStatus);
                            }
                        }} className="w-full">
                            {job.status === 'IN_PROGRESS' && services.length === 0 && parts.length === 0 ? (
                                <button
                                    type="button"
                                    className="btn btn-outline shadow-lg flex items-center justify-center gap-2 opacity-50 cursor-not-allowed w-full"
                                    disabled
                                    title="Add at least one service or part to complete the job"
                                >
                                    <CheckCircle size={18} /> Add Items to Complete
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className={`btn ${job.status === 'OPEN' ? 'btn-primary' : job.status === 'IN_PROGRESS' ? '!bg-green-600 !text-white !border-green-600 hover:!bg-green-700' : 'btn-outline'} shadow-lg flex items-center justify-center gap-2 w-full`}
                                    disabled={job.status === 'COMPLETED' && !isAdmin}
                                >
                                    {job.status === 'OPEN' && <><Zap size={18} className="fill-white" /> Start Work</>}
                                    {job.status === 'IN_PROGRESS' && <><CheckCircle size={18} /> Complete Work</>}
                                    {job.status === 'COMPLETED' && (isAdmin ? 'Waiting Invoice' : 'Waiting Billing')}
                                </button>
                            )}
                        </form>
                    )
                }

                {/* Invoice Button logic for footer if COMPLETED/BILLED and Admin */}
                {isAdmin && (job.status === 'COMPLETED' || job.status === 'BILLED') && (services.length > 0 || parts.length > 0) && (
                    <form action={async () => {
                        'use server';
                        const result = await generateInvoice(jobId);
                        if (result.success && result.invoiceId) {
                            redirect(`/dashboard/invoices/${result.invoiceId}`);
                        }
                    }} className="w-full">
                        <button
                            type="submit"
                            className="btn btn-primary shadow-xl flex items-center justify-center gap-2 w-full"
                        >
                            <Receipt size={20} />
                            {existingInvoice ? 'Update & View Invoice' : 'Generate Invoice'}
                        </button>
                    </form>
                )}
            </JobActionsFooter>
        </div >
    );
}
