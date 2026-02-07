'use client';

import { Printer } from 'lucide-react';

export default function PrintInvoiceButton() {
    return (
        <div className="no-print fixed top-6 right-6 z-50">
            <button
                onClick={() => window.print()}
                className="btn btn-primary shadow-xl flex items-center gap-2 px-6 py-3 rounded-2xl"
            >
                <Printer size={20} />
                Print Invoice
            </button>
        </div>
    );
}
