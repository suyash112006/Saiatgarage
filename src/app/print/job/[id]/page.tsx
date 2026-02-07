import { getJobDetails } from '@/app/actions/job';
import { getSession } from '@/app/actions/auth';
import { notFound, redirect } from 'next/navigation';
import PrintButton from '@/components/PrintButton';
import '@/styles/variables.css';

// Define params type for Next.js 15+
type Params = Promise<{ id: string }>;

export default async function PrintJobPage(props: { params: Params }) {
    const params = await props.params;
    const session = await getSession();
    if (!session) redirect('/login');

    const jobId = parseInt(params.id);
    const data = await getJobDetails(jobId);
    if (!data) notFound();

    const { job, services, parts } = data;

    // Calculate total if not set
    const serviceTotal = services.reduce((acc: number, s: any) => acc + s.cost, 0);
    const partsTotal = parts.reduce((acc: number, p: any) => acc + (p.qty * p.unit_price), 0);
    const calculatedTotal = serviceTotal + partsTotal;
    const displayTotal = job.total_amount || calculatedTotal;

    return (
        <div className="bg-white min-h-screen p-8 print:p-0 text-slate-900 font-sans">
            {/* Header / Logo Area */}
            <div className="flex justify-between items-start mb-12 border-b border-slate-200 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-1">GaragePro</h1>
                    <p className="text-sm text-slate-500 font-medium">Professional Garage Services</p>
                </div>
                <div className="text-right">
                    <div className="inline-block bg-slate-100 rounded-lg px-4 py-2 mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Job Card</span>
                    </div>
                    <p className="font-mono font-bold text-xl text-slate-900">#{job.id}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-12 mb-12">
                {/* 1. Customer Information */}
                <div>
                    <h3 className="section-title text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Customer Information</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Owner Name</label>
                            <div className="font-bold text-slate-800 text-base">{job.customer_name}</div>
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Primary Contact</label>
                            <div className="font-mono text-slate-700 font-medium">{job.mobile}</div>
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Address</label>
                            <div className="text-slate-600 text-sm leading-relaxed">{data.job.address || '—'}</div>
                        </div>
                    </div>
                </div>

                {/* 2. Vehicle Specification */}
                <div>
                    <h3 className="section-title text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Vehicle Specification</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Reg. Number</label>
                            <div className="font-mono font-black text-xl text-slate-900 bg-slate-100 inline-block px-2 py-1 rounded">{job.vehicle_number}</div>
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Manufacturer</label>
                            <div className="font-bold text-slate-800">{job.brand}</div>
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Model Name</label>
                            <div className="font-bold text-slate-800">{job.model}</div>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Fuel System</label>
                            <div className="font-bold text-slate-800 capitalize">{job.fuel_type || '—'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Service Records */}
            <div className="mb-12">
                <h3 className="section-title text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-6">Service Records</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Complaints */}
                    <div className="md:col-span-2 mb-4">
                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Complaints / Estimated Work</label>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm font-medium text-slate-700 min-h-[80px] w-full">
                            {job.complaint || 'No specific complaints recorded.'}
                        </div>
                    </div>

                    {/* Services List */}
                    <div>
                        <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-3">Labor & Services</h4>
                        {services.length === 0 ? (
                            <div className="text-xs text-slate-400 italic py-2">No services recorded.</div>
                        ) : (
                            <table className="w-full text-sm">
                                <tbody>
                                    {services.map((s: any) => (
                                        <tr key={s.id} className="border-b border-slate-50 last:border-0">
                                            <td className="py-2 text-slate-700 font-medium">{s.service_name}</td>
                                            <td className="py-2 text-right font-mono font-bold text-slate-900">₹{s.cost?.toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Parts List */}
                    <div>
                        <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-3">Spares & Inventory</h4>
                        {parts.length === 0 ? (
                            <div className="text-xs text-slate-400 italic py-2">No parts allocated.</div>
                        ) : (
                            <table className="w-full text-sm">
                                <tbody>
                                    {parts.map((p: any) => (
                                        <tr key={p.id} className="border-b border-slate-50 last:border-0">
                                            <td className="py-2">
                                                <div className="text-slate-700 font-medium">{p.part_name}</div>
                                                <div className="text-[10px] text-slate-400">Qty: {p.qty} × ₹{p.unit_price}</div>
                                            </td>
                                            <td className="py-2 text-right font-mono font-bold text-slate-900">₹{(p.qty * p.unit_price).toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer / Totals */}
            <div className="mt-8 border-t-2 border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-end gap-8">
                <div className="flex gap-12">
                    <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Created At</label>
                        <div className="font-bold text-slate-900">{new Date(job.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Status</label>
                        <div className="font-bold text-slate-900 capitalize">{job.status.replace('_', ' ')}</div>
                    </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-2xl min-w-[280px]">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Billing Estimate</label>
                    <div className="text-3xl font-black font-mono tracking-tight">₹{displayTotal.toLocaleString('en-IN')}</div>
                </div>
            </div>

            {/* Print Button (Hidden in Print) */}
            <PrintButton />
        </div>
    );
}
