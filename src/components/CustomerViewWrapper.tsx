
import { getCustomerDetails } from '@/app/actions/vehicle';
import Link from 'next/link';
import { Phone, MapPin, User, Car, History, FileText, ChevronRight } from 'lucide-react';
import AddVehicleForm from '@/components/AddVehicleForm';
import EditCustomerModal from '@/components/EditCustomerModal';
import CollapsibleSection from '@/components/CollapsibleSection';
import CreateJobModal from '@/components/CreateJobModal';
import { notFound } from 'next/navigation';

interface CustomerViewWrapperProps {
    customerId: string;
}

export default async function CustomerViewWrapper({ customerId }: CustomerViewWrapperProps) {
    const data: any = await getCustomerDetails(customerId);

    if (!data) notFound();

    const { customer, vehicles, jobs, carLibrary } = data;

    return (
        <>
            <div className="page-header mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-main)' }}>{customer.name}</h1>
                    <div className="flex items-center gap-3 text-sm mt-1">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider" style={{ background: 'rgba(var(--text-main-rgb, 0,0,0), 0.05)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                            <User size={14} style={{ color: 'var(--text-muted)' }} />
                            UID: #{customer.id.toString().padStart(4, '0')}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <EditCustomerModal customer={customer} />
                    <AddVehicleForm customerId={customer.id} carLibrary={carLibrary} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-4">
                    <CollapsibleSection title="Account Identity" icon={<User className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] text-primary" />} defaultOpen>
                        <div className="form-grid">
                            <div className="form-field">
                                <label className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Mobile Number</label>
                                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(var(--text-main-rgb, 0,0,0), 0.03)', border: '1px solid var(--border)' }}>
                                    <Phone size={16} style={{ color: 'var(--text-muted)' }} />
                                    <span className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>{customer.mobile || 'No mobile documented'}</span>
                                </div>
                            </div>
                            <div className="form-field col-span-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Mailing Address</label>
                                <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(var(--text-main-rgb, 0,0,0), 0.03)', border: '1px solid var(--border)' }}>
                                    <MapPin size={16} style={{ color: 'var(--text-muted)', marginTop: '2px' }} />
                                    <span className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>{customer.address || 'No address documented'}</span>
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title={`Active Fleet (${vehicles.length})`} icon={<Car className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] text-primary" />}>
                        {vehicles.length === 0 ? (
                            <div className="py-12 text-center rounded-xl" style={{ border: '2px dashed var(--border)' }}>
                                <Car size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>No vehicles registered</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {vehicles.map((v: any) => (
                                    <div key={v.id} className="flex justify-between items-center p-4 rounded-xl transition-all group" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                                                <Car size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-base font-black" style={{ color: 'var(--text-main)' }}>{v.model}</h4>
                                                    <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>({v.last_km.toLocaleString('en-IN')} KM)</span>
                                                </div>
                                                <div className="text-lg font-mono font-bold uppercase tracking-widest mt-1 leading-none" style={{ color: 'var(--text-main)' }}>{v.vehicle_number}</div>
                                            </div>
                                        </div>
                                        <CreateJobModal vehicle={v} customer={customer} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CollapsibleSection>
                </div>

                <div className="space-y-6 lg:sticky lg:top-8">
                    <div className="card" style={{ padding: '24px', borderRadius: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <h3 className="section-title flex items-center gap-2 mb-6 font-bold uppercase tracking-wider text-sm border-0 pb-0" style={{ color: 'var(--text-main)' }}>
                            <History size={18} className="text-primary" /> Service History
                        </h3>
                        <div className="space-y-3">
                            {jobs.length === 0 ? (
                                <div className="py-8 text-center rounded-xl" style={{ background: 'rgba(var(--text-main-rgb, 0,0,0), 0.03)', border: '1px solid var(--border)', borderStyle: 'dashed' }}>
                                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>No service history</p>
                                </div>
                            ) : (
                                jobs.slice(0, 5).map((j: any) => (
                                    <Link key={j.id} href={`/dashboard/jobs/${j.id}`} className="flex justify-between items-center p-4 rounded-xl transition-all group" style={{ background: 'rgba(var(--text-main-rgb, 0,0,0), 0.03)', border: '1px solid var(--border)' }}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all shrink-0" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h4 className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>#{(j.job_no || j.id)}</h4>
                                                </div>
                                                <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{j.model}</div>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} style={{ color: 'var(--text-muted)', opacity: 0.5 }} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
