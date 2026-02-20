'use client';

import { X, MessageCircle, Download, Link2, Share2, Check } from 'lucide-react';
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
}

export default function ShareModal({ isOpen, onClose, invoice }: ShareModalProps) {
    const [isCopied, setIsCopied] = useState(false);
    const [isPDFCopied, setIsPDFCopied] = useState(false);

    if (!isOpen) return null;

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const pdfUrl = typeof window !== 'undefined' ? `${window.location.origin}/print/job/${invoice.job_id}` : '';

    const copyToClipboard = async (text: string) => {
        if (!text) return false;

        // 1. Try modern API first (requires secure context)
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (err) {
                console.warn('Modern clipboard API failed:', err);
            }
        }

        // 2. Reliable Fallback: Hidden textarea
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;

            // Ensure textArea is in the DOM but minimally visible/obtrusive
            textArea.style.position = "fixed";
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.width = "2em";
            textArea.style.height = "2em";
            textArea.style.padding = "0";
            textArea.style.border = "none";
            textArea.style.outline = "none";
            textArea.style.boxShadow = "none";
            textArea.style.background = "transparent";
            textArea.style.opacity = "0.01";
            textArea.style.zIndex = "-1"; // Ensure it doesn't block UI

            document.body.appendChild(textArea);

            // Selection logic for multiple platforms
            textArea.setAttribute("readonly", ""); // Prevent mobile keyboard
            textArea.focus();
            textArea.select();
            textArea.setSelectionRange(0, 99999);

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (successful) return true;
        } catch (err) {
            console.error('Copy fallback error:', err);
        }

        return false;
    };

    const formattedTotal = Number(invoice.grandTotal).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const shareMessage = `Hello ${invoice.customer_name},\n\nYour invoice #${invoice.invoice_no} from SAI AUTO TECHNIC is ready.\nTotal: ₹${formattedTotal}\n\nView/Download: ${shareUrl}\n\nThank you for choosing SAI AUTO TECHNIC!`;

    const handleWhatsAppShare = async () => {
        if (!invoice.customer_mobile) {
            toast.error('Customer mobile number is missing');
            return;
        }
        const cleanMobile = invoice.customer_mobile.replace(/\D/g, '');
        const fullMobile = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
        const waUrl = `https://wa.me/${fullMobile}?text=${encodeURIComponent(shareMessage)}`;
        window.open(waUrl, '_blank');
        await logInvoiceShare(invoice.id, 'whatsapp');
    };

    const handleCopyLink = async () => {
        const success = await copyToClipboard(shareUrl);
        if (success) {
            setIsCopied(true);
            toast.success('Link copied to clipboard');
            setTimeout(() => setIsCopied(false), 2000);
            await logInvoiceShare(invoice.id, 'link');
        } else {
            toast.error('Failed to copy link');
        }
    };

    const handleCopyPDFLink = async () => {
        const success = await copyToClipboard(pdfUrl);
        if (success) {
            setIsPDFCopied(true);
            toast.success('PDF Link copied');
            setTimeout(() => setIsPDFCopied(false), 2000);
            await logInvoiceShare(invoice.id, 'pdf_link');
        } else {
            toast.error('Failed to copy PDF link');
        }
    };

    const handleSystemShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Invoice #${invoice.invoice_no}`,
                    text: shareMessage,
                    url: shareUrl,
                });
                await logInvoiceShare(invoice.id, 'system_share');
            } catch (err) {
                // Ignore AbortError (user cancelled)
            }
        } else {
            handleCopyLink();
        }
    };

    const handleDownloadPDF = async () => {
        window.print();
        await logInvoiceShare(invoice.id, 'pdf');
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content max-w-md">
                <div className="modal-header border-b-0">
                    <div className="modal-header-left">
                        <div className="card-icon">
                            <Share2 size={18} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Share Invoice</h3>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Invoice #{invoice.invoice_no}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="icon-btn" title="Close">
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '24px', paddingTop: '8px' }}>
                    <div className="form-grid" style={{ gap: '12px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                        {/* WhatsApp Option */}
                        <button
                            onClick={handleWhatsAppShare}
                            className="btn"
                            style={{
                                height: 'unset',
                                padding: '20px 12px',
                                background: 'rgba(37, 211, 102, 0.05)',
                                border: '1px solid rgba(37, 211, 102, 0.2)',
                                color: 'var(--text-main)',
                                flexDirection: 'column',
                                borderRadius: '16px'
                            }}
                        >
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                                <MessageCircle size={20} fill="white" color="white" />
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>WhatsApp</span>
                        </button>

                        {/* Download PDF Option */}
                        <button
                            onClick={handleDownloadPDF}
                            className="btn"
                            style={{
                                height: 'unset',
                                padding: '20px 12px',
                                background: 'var(--primary-light)',
                                border: '1px solid var(--primary)',
                                opacity: 0.8,
                                color: 'var(--text-main)',
                                flexDirection: 'column',
                                borderRadius: '16px'
                            }}
                        >
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', border: 'none', justifyContent: 'center', marginBottom: '8px', color: 'white' }}>
                                <Download size={20} />
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Print PDF</span>
                        </button>

                        {/* Copy Link Option */}
                        <button
                            onClick={handleCopyLink}
                            className="btn"
                            style={{
                                height: 'unset',
                                padding: '20px 12px',
                                background: 'var(--bg-main)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-main)',
                                flexDirection: 'column',
                                borderRadius: '16px'
                            }}
                        >
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                                {isCopied ? <Check size={20} color="#10b981" /> : <Link2 size={20} />}
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{isCopied ? 'Copied' : 'Copy Invoice'}</span>
                        </button>

                        {/* Copy PDF Link Option */}
                        <button
                            onClick={handleCopyPDFLink}
                            className="btn"
                            style={{
                                height: 'unset',
                                padding: '20px 12px',
                                background: 'var(--bg-main)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-main)',
                                flexDirection: 'column',
                                borderRadius: '16px'
                            }}
                        >
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                                {isPDFCopied ? <Check size={20} color="#10b981" /> : <Download size={20} />}
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{isPDFCopied ? 'Copied' : 'Copy PDF Link'}</span>
                        </button>

                        {/* System Share Option */}
                        <button
                            onClick={handleSystemShare}
                            className="btn"
                            style={{
                                height: 'unset',
                                padding: '20px 12px',
                                background: 'var(--bg-main)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-main)',
                                flexDirection: 'column',
                                borderRadius: '16px',
                                gridColumn: 'span 2'
                            }}
                        >
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--text-main)', color: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                                <Share2 size={20} />
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Share</span>
                        </button>
                    </div>
                </div>

                <div className="modal-footer" style={{ borderTop: 'none', background: 'transparent' }}>
                    <button onClick={onClose} className="btn btn-outline" style={{ width: '100%', borderRadius: '12px' }}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
