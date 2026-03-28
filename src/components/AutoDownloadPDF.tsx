'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

interface AutoDownloadPDFProps {
    elementSelector: string;
    filename: string;
}

export default function AutoDownloadPDF({ elementSelector, filename }: AutoDownloadPDFProps) {
    const [isGenerating, setIsGenerating] = useState(true);

    const handleDownload = () => {
        const element = document.querySelector(elementSelector);
        if (!element) {
            console.error('PDF element not found:', elementSelector);
            return;
        }

        const opt = {
            margin: 0,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 3, 
                useCORS: true, 
                logging: false,
                letterRendering: true,
                backgroundColor: '#ffffff'
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        // @ts-ignore
        if (typeof html2pdf !== 'undefined') {
            // @ts-ignore
            html2pdf().set(opt).from(element).save().then(() => {
                // Navigate back after download finishes or starts
                setTimeout(() => {
                    window.history.back();
                }, 1000);
            });
        }
    };

    return (
        <>
            <Script
                src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
                strategy="afterInteractive"
                onLoad={handleDownload}
            />
            {isGenerating && (
                <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-lg font-bold text-slate-800 tracking-tight">Generating PDF...</p>
                    <p className="text-sm text-slate-400 mt-1">Your download will start automatically.</p>
                </div>
            )}
        </>
    );
}
