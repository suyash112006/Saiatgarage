'use client';

import { Share2 } from 'lucide-react';
import { useState } from 'react';
import ShareModal from './ShareModal';

interface ShareInvoiceButtonProps {
    invoice: {
        id: number;
        job_id: number;
        invoice_no: string;
        customer_name: string;
        customer_mobile: string | null;
        grandTotal: number;
    }
}

export default function ShareInvoiceButton({ invoice }: ShareInvoiceButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-outline border-2 shadow-sm flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-all hover:bg-slate-50 hover:translate-y-[-2px] active:scale-95"
                title="Share Invoice"
            >
                <Share2 size={18} />
                <span>Share</span>
            </button>

            <ShareModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                invoice={invoice}
            />
        </>
    );
}
