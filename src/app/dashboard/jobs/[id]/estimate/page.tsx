import { getJobDetails } from '@/app/actions/job';
import { getSession } from '@/app/actions/auth';
import { notFound, redirect } from 'next/navigation';
import PrintInvoiceButton from '@/components/PrintInvoiceButton';

export const dynamic = 'force-dynamic';

export default async function EstimatePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const jobId = parseInt(params.id);
    const session = await getSession();

    // Admin only
    if (session?.role !== 'admin') {
        redirect('/dashboard');
    }

    const data = await getJobDetails(jobId);
    if (!data) notFound();

    const { job, services, parts } = data;

    // Calculate totals
    const servicesTotal = services.reduce((sum: number, s: any) => sum + (s.price * s.quantity), 0);
    const partsTotal = parts.reduce((sum: number, p: any) => sum + (p.price * p.quantity), 0);
    const grandTotal = servicesTotal + partsTotal;

    return (
        <>
            <PrintInvoiceButton />

            <div className="invoice-container">
                <div className="invoice-page">
                    {/* Watermark for Estimate */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] -rotate-12 pointer-events-none select-none">
                        <h1 className="text-[12rem] font-black tracking-tighter">ESTIMATE</h1>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8 pb-6 border-b-2 border-slate-400">
                        <h1 className="text-3xl font-black text-slate-900 mb-2">SAI AUTO TECHNIC</h1>
                        <p className="text-sm text-slate-600 mb-4">Servicing / Maintenance</p>
                        <div className="text-xs text-slate-700 leading-relaxed space-y-1">
                            <p>Plot No. 4, Sr. No. 273, Shanka Savitr Nagar,</p>
                            <p>Near Comfort Zone, Ambad, Nashik – 422010</p>
                            <p className="mt-2 font-semibold">Mobile: 9371026774</p>
                        </div>
                        <div className="mt-8 flex flex-col items-center">
                            <span className="bg-[#0f172a] text-white px-6 py-1.5 text-lg font-black tracking-[0.2em] rounded-full inline-block leading-none uppercase">ESTIMATE</span>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">(Proforma Invoice / Subject to changes)</p>
                        </div>
                    </div>

                    {/* Customer & Vehicle Info */}
                    <div className="mb-8 text-sm">
                        <table className="w-full border-collapse">
                            <tbody>
                                <tr>
                                    <td className="py-2 pr-3 text-slate-600 font-medium w-[140px]">Customer Name :</td>
                                    <td className="py-2 font-semibold text-slate-900">{job.customer_name}</td>
                                    <td className="py-2 pr-3 text-slate-600 font-medium w-[120px]">Vehicle No :</td>
                                    <td className="py-2 font-semibold text-slate-900">{job.vehicle_number}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-3 text-slate-600 font-medium">Contact No :</td>
                                    <td className="py-2 text-slate-700">{job.mobile || '—'}</td>
                                    <td className="py-2 pr-3 text-slate-600 font-medium">Model :</td>
                                    <td className="py-2 text-slate-700">{job.model}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-3 text-slate-600 font-medium">Date :</td>
                                    <td className="py-2 text-slate-700">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                    <td className="py-2 pr-3 text-slate-600 font-medium">Kilometers :</td>
                                    <td className="py-2 text-slate-700">{job.km_reading ? job.km_reading.toLocaleString() : '—'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Parts Table */}
                    {parts.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">Estimate: Parts / Materials</h3>
                            <table className="w-full border-collapse table-fixed invoice-table">
                                <thead>
                                    <tr className="border-b-2 border-slate-400">
                                        <th className="text-center pb-3 px-2" style={{ width: '40px' }}>Sr</th>
                                        <th className="text-left pb-3 px-2">Particulars</th>
                                        <th className="text-left pb-3 px-2" style={{ width: '80px' }}>Qty</th>
                                        <th className="text-left pb-3 px-2" style={{ width: '100px' }}>Rate</th>
                                        <th className="text-left pb-3 px-2" style={{ width: '120px' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parts.map((part: any, idx: number) => (
                                        <tr key={idx} className="border-b border-slate-200">
                                            <td className="text-center text-slate-600 py-3 px-2">{idx + 1}</td>
                                            <td className="py-3 px-2">
                                                <span className="text-slate-900">{part.part_name || 'Part'}</span>
                                                {part.part_no && <span className="text-xs text-slate-500 ml-2">#{part.part_no}</span>}
                                            </td>
                                            <td className="text-left text-slate-700 py-3 px-2">{part.quantity}</td>
                                            <td className="text-left text-slate-700 py-3 px-2">{part.price.toLocaleString()}</td>
                                            <td className="text-left font-semibold text-slate-900 py-3 px-2">{(part.price * part.quantity).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Labour Table */}
                    {services.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">Estimate: Labour Charges</h3>
                            <table className="w-full border-collapse table-fixed invoice-table">
                                <thead>
                                    <tr className="border-b-2 border-slate-400">
                                        <th className="text-center pb-3 px-2" style={{ width: '40px' }}>Sr</th>
                                        <th className="text-left pb-3 px-2">Labour Description</th>
                                        <th className="text-left pb-3 px-2" style={{ width: '120px' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.map((service: any, idx: number) => (
                                        <tr key={idx} className="border-b border-slate-200">
                                            <td className="text-center text-slate-600 py-3 px-2">{idx + 1}</td>
                                            <td className="text-slate-900 py-3 px-2">{service.service_name || 'Service'}</td>
                                            <td className="text-left font-semibold text-slate-900 py-3 px-2">{(service.price * service.quantity).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Totals Section */}
                    <div className="mt-8 pt-4 border-t border-slate-300">
                        <table className="w-full border-collapse">
                            <tbody>
                                <tr>
                                    <td className="text-left text-slate-600 pb-2 font-medium">Estimated Parts Total</td>
                                    <td className="text-right font-semibold text-slate-900 pb-2 px-2" style={{ width: '140px' }}>
                                        ₹ {partsTotal.toLocaleString()}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-left text-slate-600 pb-2 font-medium">Estimated Labour Total</td>
                                    <td className="text-right font-semibold text-slate-900 pb-2 px-2">
                                        ₹ {servicesTotal.toLocaleString()}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-left text-slate-600 pb-2 font-bold text-lg">Estimated Grand Total</td>
                                    <td className="text-right font-black text-2xl text-primary pb-2 px-2">
                                        ₹ {grandTotal.toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="text-[10px] text-slate-400 italic mt-6">* This is a computer-generated estimate and does not include taxes unless specified. Prices are subject to final invoice at the time of delivery.</p>
                    </div>

                    {/* Footer */}
                    <div className="mt-16 text-center">
                        <p className="text-sm text-slate-600">Generated by Admin System</p>
                        <p className="text-base font-bold text-slate-900 mt-2">SAI AUTO TECHNIC</p>
                    </div>
                </div>
            </div>
        </>
    );
}
