import { getInvoice } from '@/app/actions/invoice';
import { redirect } from 'next/navigation';
import PrintInvoiceButton from '@/components/PrintInvoiceButton';
import ShareInvoiceButton from '@/components/ShareInvoiceButton';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return {
        title: `Invoice #${id} | SAI AUTO TECHNIC`,
    };
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const invoice = await getInvoice(Number(id));

    if (!invoice) redirect('/dashboard/invoices');

    // Combine items but keep track of types for table splitting
    const partsItems = invoice.parts.map((p: any) => ({ ...p, type: 'part' }));
    const serviceItems = invoice.services.map((s: any) => ({ ...s, type: 'service' }));
    const allItems = [...partsItems, ...serviceItems];

    // Pagination logic
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
            {/* Action Bar - Fixed on Screen */}
            <div className="no-print fixed top-6 right-6 z-50 flex items-center gap-3">
                <ShareInvoiceButton invoice={invoice} />
                <PrintInvoiceButton />
            </div>

            {/* Invoice Container - Optimized for A4 */}
            <div className="invoice-container">
                {pages.map((pageItems, pageIdx) => {
                    const isFirstPage = pageIdx === 0;
                    const isLastPage = pageIdx === pages.length - 1;

                    // Group items by type for separate tables on this page
                    const pageParts = pageItems.filter(item => item.type === 'part');
                    const pageServices = pageItems.filter(item => item.type === 'service');

                    return (
                        <div key={pageIdx} className={`invoice-page ${!isLastPage ? 'page-break' : ''}`}>
                            {/* Watermark */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 watermark-text -rotate-12 pointer-events-none select-none no-print">
                                <h1 className="text-[12rem] font-black tracking-tighter">INVOICE</h1>
                            </div>

                            {/* Header - Show full branding only on first page */}
                            <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-100">
                                <div className="text-left">
                                    <h1 className="text-4xl font-black text-slate-900 leading-none">SAI AUTO TECHNIC</h1>
                                    {!isFirstPage && <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest italic">Continued - Invoice #{invoice.invoice_no}</p>}
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
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-[0.2em] uppercase py-1.5 inline-block px-12">INVOICE</h2>
                                    </div>

                                    {/* Customer & Vehicle Info Table */}
                                    <div className="mb-8 text-sm">
                                        <table className="w-full border-collapse">
                                            <tbody>
                                                <tr>
                                                    <td className="py-2 pr-3 text-slate-600 font-medium w-[115px]">Customer Name :</td>
                                                    <td className="py-2 font-semibold text-slate-900">{invoice.customer_name}</td>
                                                    <td className="py-2 pr-3 text-slate-600 font-medium w-[95px]">Vehicle No :</td>
                                                    <td className="py-2 font-semibold text-slate-900">{invoice.vehicle_number}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2 pr-3 text-slate-600 font-medium">Address :</td>
                                                    <td className="py-2 text-slate-700">{invoice.customer_address || '—'}</td>
                                                    <td className="py-2 pr-3 text-slate-600 font-medium">Kilometers :</td>
                                                    <td className="py-2 text-slate-700">{invoice.km_reading ? invoice.km_reading.toLocaleString() : '—'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2 pr-3 text-slate-600 font-medium">Contact No :</td>
                                                    <td className="py-2 text-slate-700">{invoice.customer_mobile || '—'}</td>
                                                    <td className="py-2 pr-3 text-slate-600 font-medium w-[95px]">Model :</td>
                                                    <td className="py-2 text-slate-700">{invoice.vehicle_model}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2 pr-3 text-slate-600 font-medium">Date :</td>
                                                    <td className="py-2 text-slate-700">{new Date(invoice.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                                    <td className="py-2 pr-3 text-slate-600 font-medium w-[95px]">Invoice No :</td>
                                                    <td className="py-2 font-bold text-slate-900">{invoice.invoice_no}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                            {/* Line Items Container */}
                            <div className="mb-8 min-h-[400px]">
                                {/* Parts Table */}
                                {pageParts.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="font-black text-slate-400 mb-2 uppercase tracking-widest border-l-2 border-primary pl-2" style={{ fontSize: '16px' }}>Parts / Materials</h3>
                                        <table className="w-full border-collapse table-fixed invoice-table">
                                            <thead>
                                                <tr>
                                                    <th className="text-center pb-3 px-2" style={{ width: '40px' }}>Sr</th>
                                                    <th className="text-left pb-3 px-2">Description</th>
                                                    <th className="text-left pb-3 px-2" style={{ width: '60px' }}>Qty</th>
                                                    <th className="text-left pb-3 px-2" style={{ width: '90px' }}>Rate</th>
                                                    <th className="text-left pb-3 px-2" style={{ width: '100px' }}>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pageParts.map((item: any, idx: number) => {
                                                    const srNo = partsItems.indexOf(item) + 1;
                                                    return (
                                                        <tr key={`part-${idx}`}>
                                                            <td className="text-center text-slate-600 py-3 px-2">{srNo}</td>
                                                            <td className="py-3 px-2">
                                                                <span className="text-slate-900">{item.part_name || 'Part'}</span>
                                                                {item.part_no && <span className="text-xs text-slate-500 ml-2">#{item.part_no}</span>}
                                                            </td>
                                                            <td className="text-left text-slate-700 py-3 px-2">{item.quantity}</td>
                                                            <td className="text-left text-slate-700 py-3 px-2">{item.price.toLocaleString()}</td>
                                                            <td className="text-left font-semibold text-slate-900 py-3 px-2">{(item.price * item.quantity).toLocaleString()}</td>
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
                                        <h3 className="font-black text-slate-400 mb-2 uppercase tracking-widest border-l-2 border-blue-500 pl-2" style={{ fontSize: '16px' }}>Labour / Services</h3>
                                        <table className="w-full border-collapse table-fixed invoice-table">
                                            <thead>
                                                <tr>
                                                    <th className="text-center pb-3 px-2" style={{ width: '40px' }}>Sr</th>
                                                    <th className="text-left pb-3 px-2">Description</th>
                                                    <th className="text-left pb-3 px-2" style={{ width: '60px' }}>Qty</th>
                                                    <th className="text-left pb-3 px-2" style={{ width: '90px' }}>Rate</th>
                                                    <th className="text-left pb-3 px-2" style={{ width: '100px' }}>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pageServices.map((item: any, idx: number) => {
                                                    const srNo = serviceItems.indexOf(item) + 1;
                                                    return (
                                                        <tr key={`service-${idx}`}>
                                                            <td className="text-center text-slate-600 py-3 px-2">{srNo}</td>
                                                            <td className="py-3 px-2">
                                                                <span className="text-slate-900">{item.service_name || 'Service'}</span>
                                                            </td>
                                                            <td className="text-left text-slate-700 py-3 px-2">{item.quantity}</td>
                                                            <td className="text-left text-slate-700 py-3 px-2">{item.price.toLocaleString()}</td>
                                                            <td className="text-left font-semibold text-slate-900 py-3 px-2">{(item.price * item.quantity).toLocaleString()}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Filler rows for spatial consistency if very few items */}
                                {pageItems.length < 3 && Array.from({ length: 3 - pageItems.length }).map((_, i) => (
                                    <div key={`filler-${i}`} className="py-8">&nbsp;</div>
                                ))}
                            </div>

                            {isLastPage && (
                                <>
                                    {/* Totals Section */}
                                    <div className="mt-8 pt-4">
                                        <table className="w-full border-collapse">
                                            <tbody>
                                                <tr>
                                                    <td className="text-left text-slate-600 pb-2 font-medium">Subtotal</td>
                                                    <td className="text-right font-semibold text-slate-900 pb-2 px-2" style={{ width: '120px' }}>
                                                        ₹ {Number(invoice.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-left text-slate-600 pb-2 font-medium">Tax (GST {invoice.taxRate}%)</td>
                                                    <td className="text-right font-semibold text-slate-900 pb-2 px-2" style={{ width: '120px' }}>
                                                        ₹ {Number(invoice.taxTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-left text-slate-600 pt-3 pb-2 font-bold border-t border-slate-500">Grand Total</td>
                                                    <td className="text-right font-black text-lg text-slate-900 pt-3 pb-2 px-2 border-t border-slate-500" style={{ width: '120px' }}>
                                                        ₹ {Number(invoice.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Footer / Signature Section */}
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
                                <span>SAI AUTO TECHNIC | INVOICE</span>
                                <span>Page {pageIdx + 1} of {pages.length}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
