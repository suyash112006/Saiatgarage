'use client';

import { Download, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Script from 'next/script';

interface DownloadPDFButtonProps {
    elementSelector: string;
    filename: string;
}

export default function DownloadPDFButton({ elementSelector, filename }: DownloadPDFButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    // Effect to check if script is already loaded (handles client-side navigation)
    useEffect(() => {
        // @ts-expect-error - html2pdf is a global variable
        if (typeof window !== 'undefined' && typeof window.html2pdf !== 'undefined') {
            setScriptLoaded(true);
        }
    }, []);

    const handleDownload = async () => {
        if (!scriptLoaded) return;
        
        setIsGenerating(true);
        const element = document.querySelector(elementSelector) as HTMLElement;
        
        if (!element) {
            console.error('PDF element not found:', elementSelector);
            setIsGenerating(false);
            return;
        }

        // Force light mode styles only on the target element
        element.setAttribute('data-theme', 'light');
        element.classList.add('force-light', 'pdf-capture');

        // Scroll to top for html2canvas to work correctly
        window.scrollTo(0, 0);

        const opt = {
            margin: 0,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, // 3 is sometimes too heavy for mobile/low-memory
                useCORS: true, 
                logging: false,
                letterRendering: true,
                backgroundColor: '#ffffff'
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'], before: '.page-break', avoid: '.invoice-page' }
        };

        // @ts-expect-error - html2pdf is loaded from a script tag
        if (typeof html2pdf !== 'undefined') {
            try {
                // @ts-expect-error - html2pdf is loaded from a script tag
                await html2pdf().set(opt).from(element).save();
            } catch (err) {
                console.error('PDF Generation Error:', err);
            } finally {
                // Restore element specific classes
                element.classList.remove('force-light', 'pdf-capture');
                setIsGenerating(false);
            }
        } else {
            setIsGenerating(false);
            element.classList.remove('force-light', 'pdf-capture');
        }
    };

    return (
        <>
            <Script
                src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
                strategy="lazyOnload"
                onReady={() => setScriptLoaded(true)}
            />
            
            <button
                onClick={handleDownload}
                disabled={isGenerating || !scriptLoaded}
                className={`btn shadow-xl flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-all active:scale-95 ${
                    isGenerating 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'btn-primary hover:translate-y-[-2px]'
                }`}
                title="Download PDF"
            >
                {isGenerating ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <Download size={18} />
                )}
                <span>{isGenerating ? 'Generating...' : 'Download PDF'}</span>
            </button>
        </>
    );
}
