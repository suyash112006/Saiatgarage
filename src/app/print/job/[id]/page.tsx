import { getJobDetails } from '@/app/actions/job';
import { getSession } from '@/app/actions/auth';
import { notFound, redirect } from 'next/navigation';
import PrintButton from '@/components/PrintButton';
import AutoDownloadPDF from '@/components/AutoDownloadPDF';

// Define params type for Next.js 15+
type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ download?: string }>;

export default async function PrintJobPage(props: { params: Params, searchParams: SearchParams }) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const isDownload = searchParams.download === '1';

    const session = await getSession();
    if (!session) redirect('/login');

    const jobId = parseInt(params.id);
    const data = await getJobDetails(jobId);
    if (!data) notFound();

    const { job, services, parts } = data;

    // Combine items for tables - mimicking the invoice's item collection logic
    const partsItems = parts.map((p: any) => ({ ...p, type: 'part' }));
    const serviceItems = services.map((s: any) => ({ ...s, type: 'service' }));
    const allItems = [...partsItems, ...serviceItems];

    // Robust Calculations to prevent NaN
    const subtotal = allItems.reduce((acc, item) => {
        const price = Number(item.price || item.cost || 0);
        const qty = Number(item.quantity || item.qty || 1);
        return acc + (price * qty);
    }, 0);

    // Pagination logic (Keeping it consistent with Invoice's multi-page support if needed)
    const itemsPerPageFirst = 12;
    const itemsPerPageOthers = 20;
    const pages: any[][] = [];

    let currentItemIdx = 0;
    while (currentItemIdx < allItems.length || (pages.length === 0)) {
        const isFirstPage = pages.length === 0;
        const limit = isFirstPage ? itemsPerPageFirst : itemsPerPageOthers;
        const chunk = allItems.slice(currentItemIdx, currentItemIdx + limit);
        pages.push(chunk);
        currentItemIdx += limit;
        if (currentItemIdx >= allItems.length) break;
    }

    return (
        <>
            <div className="no-print fixed top-6 right-6 z-50">
                <PrintButton />
            </div>

            <div className="invoice-container">
                {pages.map((pageItems, pageIdx) => {
                    const isFirstPage = pageIdx === 0;
                    const isLastPage = pageIdx === pages.length - 1;

                    // Group items by type for separate tables on this page
                    const pageParts = pageItems.filter(item => item.type === 'part');
                    const pageServices = pageItems.filter(item => item.type === 'service');

                    return (
                        <div key={pageIdx} className={`invoice-page ${!isLastPage ? 'page-break' : ''} bg-white text-slate-900 shadow-none`}>

                            {/* Header */}

                            {/* Header */}
                            <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-100">
                                <div className="text-left">
                                    <h1 className="text-4xl font-black text-slate-900 leading-none">SAI AUTO TECHNIC</h1>
                                    {!isFirstPage && <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest italic">Continued - Job #{job.job_no || job.id}</p>}
                                    {isFirstPage && <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-[0.3em]">Servicing & Maintenance</p>}
                                </div>
                                {isFirstPage && (
                                    <div className="text-right text-[11px] text-slate-600 leading-relaxed font-medium">
                                        <p>Plot No. 4, Sr. No. 273, Shanka Savitr Nagar,</p>
                                        <p>Near Comfort Zone, Ambad, Nashik – 422010</p>
                                        <p className="mt-1 font-bold text-slate-900">Mobile: 9371026774</p>
                                    </div>
                                )}
                            </div>

                            {isFirstPage && (
                                <>
                                    <div className="text-left mb-8">
                                        <h2 className="text-4xl font-black text-slate-900 tracking-[0.2em] uppercase leading-tight m-0">JOB CARD</h2>
                                    </div>

                                    {/* Customer & Vehicle Info Table */}
                                    <div className="mb-8 text-sm">
                                        <table className="w-full border-collapse">
                                            <tbody>
                                                <tr>
                                                    <td className="py-2 pr-3 text-slate-600 font-medium w-[115px]">Customer Name :</td>
                                                    <td className="py-2 font-semibold text-slate-900">{job.customer_name}</td>
                                                    <td className="py-2 pr-3 text-slate-600 font-medium w-[95px]">Vehicle No :</td>
                                                    <td className="py-2 font-bold text-slate-900 font-mono text-lg">{job.vehicle_number}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2 pr-3 text-slate-600 font-medium">Address :</td>
                                                    <td className="py-2 text-slate-700">{job.address || '—'}</td>
                                                    <td className="py-2 pr-3 text-slate-600 font-medium uppercase text-[10px] tracking-wider">Kilometers :</td>
                                                    <td className="py-2 text-slate-700 font-bold">{job.km_reading ? job.km_reading.toLocaleString() : '—'} KM</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2 pr-3 text-slate-600 font-medium">Contact No :</td>
                                                    <td className="py-2 text-slate-700 font-mono">{job.mobile || '—'}</td>
                                                    <td className="py-2 pr-3 text-slate-600 font-medium w-[95px]">Model :</td>
                                                    <td className="py-2 text-slate-700">{job.model}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2 pr-3 text-slate-600 font-medium">Date :</td>
                                                    <td className="py-2 text-slate-700">{new Date(job.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                                    <td className="py-2 pr-3 text-slate-600 font-medium w-[95px]">Job No :</td>
                                                    <td className="py-2 font-bold text-slate-900">#{job.job_no || job.id}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Complaint Section */}
                                    <div className="mb-8">
                                        <h3 className="font-black text-slate-400 mb-2 uppercase tracking-widest border-l-2 border-slate-900 pl-2" style={{ fontSize: '14px' }}>Complaints / Estimated Work</h3>
                                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-700 leading-relaxed min-h-[60px]">
                                            {job.complaint || 'No specific complaints recorded.'}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Line Items Container */}
                            <div className="mb-8 min-h-[300px]">
                                {/* Parts Table */}
                                {pageParts.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="font-black text-slate-400 mb-2 uppercase tracking-widest border-l-2 border-primary pl-2" style={{ fontSize: '14px' }}>Parts / Materials</h3>
                                        <table className="w-full border-collapse table-fixed invoice-table">
                                            <thead>
                                                <tr>
                                                    <th className="text-center pb-3 px-2" style={{ width: '40px' }}>Sr</th>
                                                    <th className="text-left pb-3 px-2">Description</th>
                                                    <th className="text-left pb-3 px-2" style={{ width: '60px' }}>Qty</th>
                                                    <th className="text-left pb-3 px-2" style={{ width: '90px' }}>Rate</th>
                                                    <th className="text-right pb-3 px-2" style={{ width: '100px' }}>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pageParts.map((item: any, idx: number) => {
                                                    const srNo = partsItems.indexOf(item) + 1;
                                                    const price = Number(item.price || item.unit_price || 0);
                                                    const qty = Number(item.quantity || item.qty || 1);
                                                    return (
                                                        <tr key={`part-${idx}`}>
                                                            <td className="text-center text-slate-600 py-3 px-2">{srNo}</td>
                                                            <td className="py-3 px-2">
                                                                <span className="text-slate-900 font-medium">{item.part_name || 'Part'}</span>
                                                                {item.part_no && <span className="text-xs text-slate-500 ml-2">#{item.part_no}</span>}
                                                            </td>
                                                            <td className="text-left text-slate-700 py-3 px-2">{qty}</td>
                                                            <td className="text-left text-slate-700 py-3 px-2">₹{price.toLocaleString('en-IN')}</td>
                                                            <td className="text-right font-bold text-slate-900 py-3 px-2">₹{(price * qty).toLocaleString('en-IN')}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Services / Labour Table */}
                                {pageServices.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="font-black text-slate-400 mb-2 uppercase tracking-widest border-l-2 border-blue-500 pl-2" style={{ fontSize: '14px' }}>Labour / Services</h3>
                                        <table className="w-full border-collapse table-fixed invoice-table">
                                            <thead>
                                                <tr>
                                                    <th className="text-center pb-3 px-2" style={{ width: '40px' }}>Sr</th>
                                                    <th className="text-left pb-3 px-2">Description</th>
                                                    <th className="text-left pb-3 px-2" style={{ width: '60px' }}>Qty</th>
                                                    <th className="text-left pb-3 px-2" style={{ width: '90px' }}>Rate</th>
                                                    <th className="text-right pb-3 px-2" style={{ width: '100px' }}>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pageServices.map((item: any, idx: number) => {
                                                    const srNo = serviceItems.indexOf(item) + 1;
                                                    const price = Number(item.price || item.cost || 0);
                                                    const qty = Number(item.quantity || item.qty || 1);
                                                    return (
                                                        <tr key={`service-${idx}`}>
                                                            <td className="text-center text-slate-600 py-3 px-2">{srNo}</td>
                                                            <td className="py-3 px-2">
                                                                <span className="text-slate-900 font-medium">{item.service_name || 'Service'}</span>
                                                            </td>
                                                            <td className="text-left text-slate-700 py-3 px-2">{qty}</td>
                                                            <td className="text-left text-slate-700 py-3 px-2">₹{price.toLocaleString('en-IN')}</td>
                                                            <td className="text-right font-bold text-slate-900 py-3 px-2">₹{(price * qty).toLocaleString('en-IN')}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {isLastPage && (
                                <>
                                    {/* Totals Section */}
                                    <div className="mt-8 pt-4 border-t border-slate-900">
                                        <div className="flex justify-end">
                                            <div className="w-[300px]">
                                                <div className="flex justify-between items-center py-2 px-4 bg-slate-900 rounded-xl text-white">
                                                    <span className="text-[10px] uppercase font-black tracking-[0.2em]">Total Billing Estimate</span>
                                                    <span className="text-xl font-black font-mono tracking-tighter">₹ {subtotal.toLocaleString('en-IN')}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 mt-2 text-right italic font-medium">This is an estimated billing amount subject to actual repairs.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer / Signature Section strictly matches Invoice */}
                                    <div className="mt-20 pt-8 border-t border-slate-100 flex justify-between items-end">
                                        <div className="text-left">
                                            <p className="text-sm text-slate-600 font-medium">Thank you for Choosing us for your vehicle care</p>
                                            <p className="text-base font-black text-slate-900 mt-1 uppercase tracking-tighter">SAI AUTO TECHNIC</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="mb-2">
                                                <div className="mt-12"></div>
                                                <p className="text-xs text-slate-500 mt-2 font-medium">Authorised Signatory</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="mt-auto pt-8 text-[10px] text-slate-400 flex justify-between items-center no-print">
                                <span>SAI AUTO TECHNIC | JOB CARD</span>
                                <span>Page {pageIdx + 1} of {pages.length}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isDownload && (
                <AutoDownloadPDF 
                    elementSelector=".invoice-container" 
                    filename={`JobCard_${job.vehicle_number || job.id}.pdf`}
                />
            )}
        </>
    );
}
