import { getInvoice } from '@/app/actions/invoice';
import { redirect } from 'next/navigation';
import PrintInvoiceButton from '@/components/PrintInvoiceButton';

export const dynamic = 'force-dynamic';

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const invoice = await getInvoice(Number(id));

    if (!invoice) {
        redirect('/dashboard/jobs');
    }

    return (
        <>
            <PrintInvoiceButton />

            {/* Invoice Container - Optimized for A4 */}
            <div className="invoice-container">
                <div className="invoice-page">
                    {/* Header - Traditional Invoice Style */}
                    <div className="text-center mb-8 pb-6 border-b-2 border-slate-400">
                        <h1 className="text-3xl font-black text-slate-900 mb-2">SAI AUTO TECHNIC</h1>
                        <p className="text-sm text-slate-600 mb-4">Servicing / Maintenance</p>
                        <div className="text-xs text-slate-700 leading-relaxed space-y-1">
                            <p>Plot No. 4, Sr. No. 273, Shanka Savitr Nagar,</p>
                            <p>Near Comfort Zone, Ambad, Nashik – 422010</p>
                            <p className="mt-2 font-semibold">Mobile: 9371026774</p>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-wider mt-6">INVOICE</h2>
                    </div>

                    {/* Customer & Vehicle Info Table */}
                    <div className="mb-8 text-sm">
                        <table className="w-full border-collapse">
                            <tbody>
                                <tr>
                                    <td className="py-2 pr-3 text-slate-600 font-medium w-[140px]">Customer Name :</td>
                                    <td className="py-2 font-semibold text-slate-900">{invoice.customer_name}</td>
                                    <td className="py-2 pr-3 text-slate-600 font-medium w-[120px]">Vehicle No :</td>
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
                                    <td className="py-2 text-slate-700">{invoice.customer_mobile}</td>
                                    <td className="py-2 pr-3 text-slate-600 font-medium">Model :</td>
                                    <td className="py-2 text-slate-700">{invoice.vehicle_model}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-3 text-slate-600 font-medium">Date :</td>
                                    <td className="py-2 text-slate-700">{new Date(invoice.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                    <td className="py-2 pr-3 text-slate-600 font-medium">Invoice No :</td>
                                    <td className="py-2 font-bold text-slate-900">{invoice.invoice_no}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Parts / Materials Table */}
                    {invoice.parts.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">Parts / Materials</h3>
                            <table className="w-full border-collapse table-fixed invoice-table">
                                <thead>
                                    <tr className="border-b-2 border-slate-400">
                                        <th className="text-center pb-3 px-2" style={{ width: '40px' }}>Sr</th>
                                        <th className="text-left pb-3 px-2" style={{ textAlign: 'left' }}>Particulars</th>
                                        <th className="text-left pb-3 px-2" style={{ width: '80px', textAlign: 'left' }}>Qty</th>
                                        <th className="text-left pb-3 px-2" style={{ width: '100px', textAlign: 'left' }}>Rate</th>
                                        <th className="text-left pb-3 px-2" style={{ width: '120px', textAlign: 'left' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.parts.map((part: any, idx: number) => (
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

                    {/* Labour Charges Table */}
                    {invoice.services.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">Labour Charges</h3>
                            <table className="w-full border-collapse table-fixed invoice-table">
                                <thead>
                                    <tr className="border-b-2 border-slate-400">
                                        <th className="text-center pb-3 px-2" style={{ width: '40px' }}>Sr</th>
                                        <th className="text-left pb-3 px-2" style={{ textAlign: 'left' }}>Labour Description</th>
                                        <th className="text-left pb-3 px-2" style={{ width: '120px', textAlign: 'left' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.services.map((service: any, idx: number) => (
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
                                    <td className="text-left text-slate-600 pb-2 font-medium">Subtotal</td>
                                    <td className="text-right font-semibold text-slate-900 pb-2 px-2" style={{ width: '120px' }}>
                                        ₹ {invoice.subtotal.toLocaleString()}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-left text-slate-600 pb-2 font-medium">Tax (GST 18%)</td>
                                    <td className="text-right font-semibold text-slate-900 pb-2 px-2" style={{ width: '120px' }}>
                                        ₹ {invoice.taxTotal.toLocaleString()}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-left text-slate-600 pt-2 border-t border-slate-200 font-bold">Grand Total</td>
                                    <td className="text-right font-black text-lg text-slate-900 pt-2 border-t border-slate-200 px-2" style={{ width: '120px' }}>
                                        ₹ {invoice.grandTotal.toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>




                    {/* Footer */}
                    <div className="mt-16">
                        <div className="mb-10 text-right">
                            <p className="text-xs text-slate-500 mb-2">Authorised Signatory</p>
                            <div className="border-b-2 border-slate-400 w-56 ml-auto mt-10"></div>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-slate-600 mt-8">Thank you for visiting</p>
                            <p className="text-base font-bold text-slate-900 mt-2">SAI AUTO TECHNIC</p>
                        </div>
                    </div>
                </div >
            </div >
        </>
    );
}
