import { getCustomerDetails } from '@/app/actions/vehicle';
import Link from 'next/link';
import {
    ArrowLeft, User, Phone, MapPin, Car, Plus, History,
    Calendar, ChevronRight, ClipboardList, Shield, Pencil,
    Printer, CalendarDays, ExternalLink, Info, FileText
} from 'lucide-react';
import AddVehicleForm from '@/components/AddVehicleForm';
import { notFound } from 'next/navigation';

type Params = Promise<{ id: string }>;

export default async function CustomerDetailPage(props: { params: Params }) {
    const params = await props.params;
    const data: any = await getCustomerDetails(params.id);

    if (!data) notFound();

    const { customer, vehicles, jobs } = data;

    return (
        <div className="dashboard-container">
            {/* 1. Breadcrumbs */}
            <nav className="breadcrumbs text-muted mb-2">
                <Link href="/dashboard" className="breadcrumb-item text-slate-400 hover:text-primary transition-colors">Dashboard</Link>
                <span className="breadcrumb-separator mx-2 text-slate-300">/</span>
                <Link href="/dashboard/customers" className="breadcrumb-item text-slate-400 hover:text-primary transition-colors">Customers</Link>
                <span className="breadcrumb-separator mx-2 text-slate-300">/</span>
                <span className="breadcrumb-item active text-primary font-bold">#{customer.id.toString().padStart(4, '0')}</span>
            </nav>

            {/* 2. Header */}
            <div className="page-header mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">{customer.name}</h1>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                            <User size={14} className="text-slate-400" />
                            UID: #{customer.id.toString().padStart(4, '0')}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                            <Calendar size={14} className="text-slate-400" />
                            Since {new Date(customer.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <Link
                        href={`/dashboard/customers/${customer.id}/edit`}
                        className="btn btn-outline border-slate-200 shadow-sm rounded-xl px-4 py-2 hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-bold"
                    >
                        <Pencil size={18} />
                        Edit Profile
                    </Link>
                    <AddVehicleForm customerId={customer.id} />
                </div>
            </div>

            {/* 3. Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Column: Profile & Fleet */}
                <div className="lg:col-span-2 space-y-8">

                    {/* SECTION 1: Account Identity */}
                    <div className="card form-card" style={{ padding: '40px', borderRadius: '24px' }}>
                        <h3 className="section-title text-slate-900 flex items-center gap-2 mb-6 font-bold uppercase tracking-wider text-2xl">
                            <User size={18} className="text-primary" />
                            Account Identity
                        </h3>

                        <div className="form-grid">
                            <div className="form-field">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mobile Number</label>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <Phone size={16} className="text-slate-400" />
                                    <span className="font-bold text-slate-900 text-sm">{customer.mobile}</span>
                                </div>
                            </div>
                            <div className="form-field">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Membership Status</label>
                                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                                    <Shield size={16} className="text-emerald-500" />
                                    <span className="font-bold text-emerald-700 text-sm">Verified Client</span>
                                </div>
                            </div>
                            <div className="form-field col-span-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mailing Address</label>
                                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <MapPin size={16} className="text-slate-400 mt-0.5" />
                                    <span className="font-bold text-slate-900 text-sm">{customer.address || 'No address documented'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Active Fleet */}
                    <div className="card" style={{ padding: '32px', borderRadius: '24px' }}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="section-title text-slate-900 flex items-center gap-2 mb-0 font-bold uppercase tracking-wider text-2xl border-0 pb-0">
                                <Car size={18} className="text-primary" />
                                Active Fleet <span className="text-slate-400 text-lg ml-2">({vehicles.length})</span>
                            </h3>
                        </div>

                        {vehicles.length === 0 ? (
                            <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                                <Car size={40} className="mx-auto mb-4 text-slate-200" />
                                <p className="text-sm text-slate-500 font-bold">No vehicles registered yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {vehicles.map((v: any) => (
                                    <div key={v.id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-300 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors shrink-0">
                                                <Car size={18} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h4 className="text-sm font-bold text-slate-900">{v.model}</h4>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1.5 py-0.5 bg-white rounded border border-slate-100">
                                                        {v.last_km.toLocaleString('en-IN')} KM
                                                    </span>
                                                </div>
                                                <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wide">
                                                    {v.vehicle_number}
                                                </div>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/dashboard/jobs/new?vehicleId=${v.id}&customerId=${customer.id}`}
                                            className="btn btn-sm btn-primary shadow-sm rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 px-3 py-1.5 h-auto"
                                        >
                                            <Plus size={12} />
                                            New Job
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* Right Column: Service History Sidebar */}
                <div className="space-y-6 lg:sticky lg:top-8">

                    {/* Stats Card */}
                    <div className="card p-0 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                        <div className="grid grid-cols-2 divide-x divide-slate-100">
                            <div className="p-6 text-center hover:bg-slate-50 transition-colors">
                                <div className="text-3xl font-black text-slate-900 mb-1">{vehicles.length}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Vehicles</div>
                            </div>
                            <div className="p-6 text-center hover:bg-slate-50 transition-colors">
                                <div className="text-3xl font-black text-slate-900 mb-1">{jobs.length}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Visits</div>
                            </div>
                        </div>
                    </div>

                    {/* Service History Log */}
                    <div className="card border-slate-200 bg-white mb-6" style={{ padding: '24px', borderRadius: '24px' }}>
                        <h3 className="section-title text-slate-900 flex items-center gap-2 mb-6 font-bold uppercase tracking-wider text-lg border-0 pb-0">
                            <History size={18} className="text-primary" />
                            Service History
                        </h3>

                        <div className="space-y-3">
                            {jobs.length === 0 ? (
                                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">No service history</p>
                                </div>
                            ) : (
                                jobs.slice(0, 5).map((j: any) => (
                                    <Link key={j.id} href={`/dashboard/jobs/${j.id}`} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-300 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors shrink-0">
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h4 className="text-sm font-bold text-slate-900">JC-{j.id.toString().padStart(4, '0')}</h4>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1.5 py-0.5 bg-white rounded border border-slate-100">
                                                        {new Date(j.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                </div>
                                                <div className="text-xs font-medium text-slate-500">
                                                    {j.model}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded border 
                                                ${j.status === 'BILLED' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                    j.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                                {j.status}
                                            </span>
                                            <div className="text-right hidden sm:block">
                                                <div className="text-sm font-black text-slate-900">₹{j.grand_total?.toLocaleString() || '0'}</div>
                                            </div>
                                            <ChevronRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                                        </div>
                                    </Link>
                                ))
                            )}

                            {jobs.length > 5 && (
                                <div className="pt-2 text-center">
                                    <button className="text-xs font-bold text-primary hover:underline uppercase tracking-wide">
                                        View All History
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

function CheckCircle({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    )
}
