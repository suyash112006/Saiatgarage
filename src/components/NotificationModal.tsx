'use client';

import { X, Calendar, ArrowRight, Bell, FileText, User, Car, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';


interface NotificationModalProps {
    notification: any;
    onClose: () => void;
}

export default function NotificationModal({ notification, onClose }: NotificationModalProps) {
    const router = useRouter();

    if (!notification) return null;

    const handleAction = () => {
        if (notification.type === 'JOB' && notification.reference_id) {
            router.push(`/dashboard/jobs/${notification.reference_id}`);
        } else if (notification.type === 'CUSTOMER' && notification.reference_id) {
            router.push(`/dashboard/customers/${notification.reference_id}`); // Assuming customer page logic
        } else if (notification.type === 'VEHICLE' && notification.reference_id) {
            // Vehicles usually on customer page, might need logic to find customer if not directly linkable
            // For now, maybe just close or go to customers list? 
            // Actually vehicle notification likely triggered on customer page context.
            // We'll leave it as closing for now or implementing specific navigation if we store customer_id too.
            // Notification ref_id is vehicle_id. We might not have customer_id easily unless we fetch it.
            onClose();
            return;
        }
        onClose();
    };

    // Determine Icon and Color based on type
    let Icon = Bell;
    let iconBg = 'bg-slate-100';
    let iconColor = 'text-slate-600';
    let title = 'Notification';

    switch (notification.type) {
        case 'JOB':
            Icon = FileText;
            iconBg = 'bg-blue-100';
            iconColor = 'text-blue-600';
            title = 'Job Update';
            break;
        case 'CUSTOMER':
            Icon = User;
            iconBg = 'bg-green-100';
            iconColor = 'text-green-600';
            title = 'New Customer';
            break;
        case 'VEHICLE':
            Icon = Car;
            iconBg = 'bg-purple-100';
            iconColor = 'text-purple-600';
            title = 'Vehicle Added';
            break;
        default:
            Icon = Bell;
            iconBg = 'bg-orange-100';
            iconColor = 'text-orange-600';
            title = 'System Alert';
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content max-w-lg">
                <div className="modal-header">
                    <div className="modal-header-left">
                        <div className={`card-icon ${iconBg} ${iconColor} bg-opacity-50`}>
                            <Icon size={18} />
                        </div>
                        <div>
                            <h3>{title}</h3>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <Clock size={10} />
                                {new Date(notification.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} type="button" className="icon-btn">
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body space-y-5">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-slate-700 font-medium leading-relaxed">
                            {notification.message}
                        </p>
                    </div>

                    {notification.reference_id && (
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Reference ID:</span>
                            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                                #{notification.reference_id}
                            </span>
                        </div>
                    )}
                </div>

                <div className="modal-footer flex justify-center gap-3 pt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-outline"
                    >
                        Close
                    </button>
                    {(notification.type === 'JOB' || notification.type === 'CUSTOMER') && (
                        <button
                            type="button"
                            onClick={handleAction}
                            className="btn btn-primary shadow-lg shadow-primary/20"
                        >
                            <span className="flex items-center gap-2">
                                View Details
                                <ArrowRight size={16} />
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
