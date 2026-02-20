'use client';

import { Printer } from 'lucide-react';

export default function PrintInvoiceButton() {
    return (
        <button
            onClick={() => window.print()}
            className="btn btn-primary shadow-xl flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-all hover:translate-y-[-2px] active:scale-95"
        >
            <Printer size={18} />
            <span>Print Invoice</span>
        </button>
    );
}
