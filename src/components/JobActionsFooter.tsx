'use client';

import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

// This component teleports actions to a fixed bottom bar on mobile
// On desktop, it renders them normally (or rather, the parent handles desktop layout)
export default function JobActionsFooter({ children }: { children: ReactNode }) {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth < 768;
        }
        return false;
    });

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (isMobile) {
        // Portal to body for fixed positioning on mobile
        return createPortal(
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50 flex gap-3 pb-safe">
                {children}
            </div>,
            document.body
        );
    }

    // On desktop, just render children inline (or null if we want to hide it and show header buttons)
    // Actually, the page structure handles desktop buttons in the header. 
    // This component is specifically for the "Primary Action fixed at bottom" on mobile.
    // So on desktop, we might want to hide this if these are DUPLICATE actions.
    // Let's assume we pass the MOBILE-ONLY content here.
    return null;
}
