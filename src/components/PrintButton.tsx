"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
    return (
        <div className="fixed bottom-8 right-8 print:hidden">
            <button
                onClick={() => window.print()}
                className="bg-slate-900 hover:bg-black text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
            >
                <Printer size={20} />
                Print Job Card
            </button>
        </div>
    );
}
