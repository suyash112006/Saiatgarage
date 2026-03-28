'use client';

import { X, MessageCircle, Download, Link2, Share2, Check, Phone } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { logInvoiceShare } from '@/app/actions/invoice';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: {
        id: number;
        job_id: number;
        invoice_no: string;
        customer_name: string;
        customer_mobile: string | null;
        grandTotal: number;
    };
    type?: 'invoice' | 'estimate';
    garageName?: string;
}

export default function ShareModal({ isOpen, onClose, invoice, type = 'invoice', garageName = 'Garage' }: ShareModalProps) {
    const [isCopied, setIsCopied] = useState(false);
    const [isPDFCopied, setIsPDFCopied] = useState(false);
    // Allow manual override if mobile is missing
    const [mobileOverride, setMobileOverride] = useState('');

    if (!isOpen) return null;

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    const isEstimate = invoice.invoice_no?.toUpperCase().startsWith('EST') || type === 'estimate';
    const docLabel = isEstimate ? 'Estimate' : 'Invoice';

    // The printable PDF URL — send this directly so the customer taps → PDF opens
    const pdfUrl = (isEstimate
        ? `${origin}/dashboard/jobs/${invoice.job_id}/estimate`
        : `${origin}/print/job/${invoice.job_id}`) + '?download=1';

    const formattedTotal = Number(invoice.grandTotal).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    // Resolve the number to use
    const rawMobile = mobileOverride || invoice.customer_mobile || '';
    const cleanMobile = rawMobile.replace(/\D/g, '');
    const fullMobile = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const hasMobile = fullMobile.length >= 10;

    // WhatsApp message — includes the direct PDF link so customer taps it instantly
    const whatsappMessage =
        `Hello ${invoice.customer_name},\n\n` +
        `Your *${docLabel} #${invoice.invoice_no}* from *${garageName}* is ready.\n` +
        `💰 Total: ₹${formattedTotal}\n\n` +
        `📄 Open / Download PDF:\n${pdfUrl}\n\n` +
        `Thank you for choosing ${garageName}! 🙏`;

    // ── Clipboard helper ──────────────────────────────────────────────────────
    const copyToClipboard = async (text: string) => {
        if (navigator.clipboard && window.isSecureContext) {
            try { await navigator.clipboard.writeText(text); return true; } catch { /* fall through */ }
        }
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            Object.assign(ta.style, { position: 'fixed', top: 0, left: 0, opacity: '0.01', zIndex: '-1' });
            document.body.appendChild(ta);
            ta.focus(); ta.select(); ta.setSelectionRange(0, 99999);
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            return ok;
        } catch { return false; }
    };

    // ── WhatsApp: open wa.me with number pre-filled + PDF link in message ────
    const handleWhatsAppShare = async () => {
        if (!hasMobile) {
            toast.error('Please enter the customer\'s WhatsApp number first');
            return;
        }
        const waUrl = `https://wa.me/${fullMobile}?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(waUrl, '_blank');
        await logInvoiceShare(invoice.id, 'whatsapp');
        toast.success(`Opening WhatsApp for +${fullMobile}`);
    };

    const handleCopyLink = async () => {
        const ok = await copyToClipboard(shareUrl);
        if (ok) {
            setIsCopied(true);
            toast.success('Invoice link copied');
            setTimeout(() => setIsCopied(false), 2000);
            await logInvoiceShare(invoice.id, 'link');
        } else toast.error('Failed to copy link');
    };

    const handleCopyPDFLink = async () => {
        const ok = await copyToClipboard(pdfUrl);
        if (ok) {
            setIsPDFCopied(true);
            toast.success('PDF link copied');
            setTimeout(() => setIsPDFCopied(false), 2000);
            await logInvoiceShare(invoice.id, 'pdf_link');
        } else toast.error('Failed to copy PDF link');
    };

    const handleSystemShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: `${docLabel} #${invoice.invoice_no}`, text: whatsappMessage, url: pdfUrl });
                await logInvoiceShare(invoice.id, 'system_share');
            } catch { /* user cancelled */ }
        } else {
            handleCopyLink();
        }
    };

    const handleDownloadPDF = async () => {
        window.location.href = pdfUrl;
        await logInvoiceShare(invoice.id, 'pdf');
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content max-w-md">
                {/* Header */}
                <div className="modal-header border-b-0">
                    <div className="modal-header-left">
                        <div className="card-icon">
                            <Share2 size={18} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                                Share {docLabel}
                            </h3>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                {docLabel} #{invoice.invoice_no} · {invoice.customer_name}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="icon-btn" title="Close">
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '16px 24px 24px' }}>

                    {/* ── WhatsApp number row ─────────────────────────── */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: 'rgba(37,211,102,0.06)',
                        border: '1.5px solid rgba(37,211,102,0.2)',
                        marginBottom: '16px',
                    }}>
                        <Phone size={15} style={{ color: '#25D366', flexShrink: 0 }} />
                        {invoice.customer_mobile ? (
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '10px', fontWeight: 700, color: '#25D366', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                                    Customer WhatsApp
                                </p>
                                <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 0', fontFamily: 'monospace' }}>
                                    +91 {invoice.customer_mobile}
                                </p>
                            </div>
                        ) : (
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '10px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
                                    No number saved — enter manually
                                </p>
                                <input
                                    type="tel"
                                    maxLength={10}
                                    value={mobileOverride}
                                    onChange={e => setMobileOverride(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="10-digit mobile number"
                                    style={{
                                        border: 'none', outline: 'none', background: 'transparent',
                                        fontSize: '14px', fontWeight: 700, color: 'var(--text-main)',
                                        width: '100%', fontFamily: 'monospace',
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* ── Action grid ────────────────────────────────── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>

                        {/* WhatsApp — sends PDF link directly to the number */}
                        <button
                            onClick={handleWhatsAppShare}
                            style={{
                                padding: '18px 12px',
                                background: hasMobile ? 'rgba(37,211,102,0.08)' : 'var(--bg-main)',
                                border: `1.5px solid ${hasMobile ? 'rgba(37,211,102,0.35)' : 'var(--border)'}`,
                                borderRadius: '14px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                                cursor: hasMobile ? 'pointer' : 'not-allowed',
                                opacity: hasMobile ? 1 : 0.45,
                                transition: 'all 0.15s',
                            }}
                        >
                            <div style={{
                                width: '42px', height: '42px', borderRadius: '50%',
                                background: '#25D366',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: hasMobile ? '0 4px 12px rgba(37,211,102,0.35)' : 'none',
                            }}>
                                <MessageCircle size={20} fill="white" color="white" />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-main)', margin: 0 }}>
                                    WhatsApp
                                </p>
                                <p style={{ fontSize: '9px', color: hasMobile ? '#25D366' : 'var(--text-muted)', fontWeight: 600, margin: '2px 0 0' }}>
                                    {hasMobile ? `→ +${fullMobile.slice(0, 4)}…` : 'Number needed'}
                                </p>
                            </div>
                        </button>

                        {/* Print / Open PDF */}
                        <button
                            onClick={handleDownloadPDF}
                            style={{
                                padding: '18px 12px',
                                background: 'var(--primary-light)',
                                border: '1.5px solid var(--primary)',
                                borderRadius: '14px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                                cursor: 'pointer', transition: 'all 0.15s', opacity: 0.85,
                            }}
                        >
                            <div style={{
                                width: '42px', height: '42px', borderRadius: '50%',
                                background: 'var(--primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                            }}>
                                <Download size={20} color="white" />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-main)', margin: 0 }}>
                                    Download PDF
                                </p>
                                <p style={{ fontSize: '9px', color: 'var(--primary)', fontWeight: 600, margin: '2px 0 0' }}>
                                    Print or save
                                </p>
                            </div>
                        </button>


                    </div>
                </div>

                <div className="modal-footer" style={{ borderTop: 'none', background: 'transparent', paddingTop: 0 }}>
                    <button onClick={onClose} className="btn btn-outline" style={{ width: '100%', borderRadius: '12px' }}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
