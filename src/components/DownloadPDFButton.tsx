'use client';

import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import Script from 'next/script';

interface DownloadPDFButtonProps {
    elementSelector: string;
    filename: string;
}

export default function DownloadPDFButton({ elementSelector, filename }: DownloadPDFButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    const handleDownload = async () => {
        if (!scriptLoaded) return;
        
        setIsGenerating(true);
        const element = document.querySelector(elementSelector) as HTMLElement;
        
        if (!element) {
            console.error('PDF element not found:', elementSelector);
            setIsGenerating(false);
            return;
        }

        // Force light mode styles and data-theme
        const originalTheme = document.documentElement.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', 'light');
        element.setAttribute('data-theme', 'light');
        element.classList.add('force-light', 'pdf-capture');

        // Give the browser a moment to repaint
        await new Promise(resolve => setTimeout(resolve, 300));

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

        // @ts-expect-error - html2pdf is loaded from a script tag
        if (typeof html2pdf !== 'undefined') {
            try {
                // @ts-expect-error - html2pdf is loaded from a script tag
                await html2pdf().set(opt).from(element).save();
            } catch (err) {
                console.error('PDF Generation Error:', err);
            } finally {
                // Restore theme and remove class
                if (originalTheme) {
                    document.documentElement.setAttribute('data-theme', originalTheme);
                }
                element.classList.remove('force-light', 'pdf-capture');
                setIsGenerating(false);
            }
        } else {
            setIsGenerating(false);
            if (originalTheme) document.documentElement.setAttribute('data-theme', originalTheme);
            element.classList.remove('force-light', 'pdf-capture');
        }
    };

    return (
        <>
            <Script
                src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
                strategy="lazyOnload"
                onLoad={() => setScriptLoaded(true)}
            />
            
            <button
                onClick={handleDownload}
                disabled={isGenerating || !scriptLoaded}
                className={`btn shadow-lg flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-all active:scale-95 ${
                    isGenerating 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-slate-900 text-white hover:scale-105'
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
