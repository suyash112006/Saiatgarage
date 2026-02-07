'use client';

import React, { useState, useEffect } from 'react';
import { Search, User, ChevronRight, Phone, MapPin, Pencil, Plus } from 'lucide-react';
import Link from 'next/link';
import { searchGeneral } from '@/app/actions/search';
import { motion, AnimatePresence } from 'framer-motion';

// Debounce helper
function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export default function DashboardSearch({ initialActivity }: { initialActivity: any[] }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            setIsSearching(true);
            searchGeneral(debouncedQuery).then((data) => {
                setResults(data);
                setIsSearching(false);
            });
        } else {
            setResults([]);
        }
    }, [debouncedQuery]);

    const showResults = query.length >= 2;
    const displayItems = showResults ? results : initialActivity;

    return (
        <>
            <motion.div
                className="dashboard-search-container"
                style={{ marginBottom: '24px' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                <motion.div
                    className="search-box dashboard-search"
                    animate={{
                        scale: isFocused ? 1.01 : 1,
                        borderColor: isFocused ? '#3b82f6' : '#e2e8f0',
                        boxShadow: isFocused ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                    }}
                    whileHover={{
                        scale: isFocused ? 1.01 : 1.005,
                        boxShadow: isFocused ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : '0 4px 20px -5px rgba(0, 0, 0, 0.1)'
                    }}
                    style={{
                        borderRadius: '16px',
                        padding: '14px 20px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                >
                    <AnimatePresence mode="wait">
                        {isSearching ? (
                            <motion.div
                                key="loader"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"
                            ></motion.div>
                        ) : (
                            <motion.div
                                key="icon"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                            >
                                <Search size={20} className="text-slate-400" style={{ flexShrink: 0 }} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <input
                        style={{
                            fontSize: '15px',
                            fontWeight: 400,
                            color: '#0f172a',
                            width: '100%',
                            border: 'none',
                            outline: 'none',
                            backgroundColor: 'transparent'
                        }}
                        placeholder="Search by name or vehicle no ....."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                </motion.div>
            </motion.div>

            <motion.div
                className="card recent-activity"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                    borderRadius: '24px',
                    marginBottom: '24px',
                    width: '100%',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)'
                }}
            >
                {!showResults && (
                    <div className="card-header border-b bg-slate-50/50">
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent Activity</h3>
                        <Link href="/dashboard/customers" className="btn btn-outline btn-sm" style={{ borderRadius: '12px' }}>View All Customers</Link>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {showResults && results.length === 0 && !isSearching ? (
                        <motion.div
                            key="not-found"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="empty-state p-6 bg-white flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        Customer Not Found
                                        <span className="text-xs font-normal text-slate-400">No profile exists for "<span className="font-bold text-slate-900">{query}</span>"</span>
                                    </h3>
                                </div>
                            </div>
                            <Link
                                href={`/dashboard/customers/add?mobile=${query}`}
                                className="btn btn-primary shadow-lg shadow-primary/20 flex items-center px-6 py-3 rounded-xl text-sm font-bold"
                            >
                                <Plus size={18} className="mr-2" />
                                Create New Profile
                            </Link>
                        </motion.div>
                    ) : displayItems.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="empty-state p-10 text-center" style={{ color: '#64748b' }}
                        >
                            No recent activity to show.
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full bg-white"
                        >
                            {/* Header */}
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2.5fr 2fr 1.5fr',
                                    backgroundColor: '#f8fafc',
                                    borderBottom: '1px solid #e2e8f0'
                                }}
                            >
                                <div style={{ padding: '0.75rem 1.5rem', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', borderRight: '1px solid #e2e8f0' }}>Name / Vehicle</div>
                                <div style={{ padding: '0.75rem 1.5rem', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', borderRight: '1px solid #e2e8f0' }}>Mobile Contact</div>
                                <div style={{ padding: '0.75rem 1.5rem', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Location</div>
                            </div>

                            {/* Body */}
                            <motion.div
                                className="bg-white"
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    visible: { transition: { staggerChildren: 0.05 } }
                                }}
                            >
                                {displayItems.map((item, idx) => {
                                    const rowItem = item.customer_name ? {
                                        type: 'job',
                                        id: item.id,
                                        name: item.customer_name,
                                        customer_name: item.customer_name,
                                        mobile: item.mobile,
                                        address: item.address,
                                        vehicle_number: item.vehicle_number
                                    } : item;

                                    return <SearchResultRow key={idx} item={rowItem} isLast={idx === displayItems.length - 1} />;
                                })}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
}


function SearchResultRow({ item, isLast }: { item: any, isLast: boolean }) {
    let href = '#';
    let name = '';
    let mobile = '';
    let address = '';

    if (item.type === 'customer') {
        href = item.latest_job_id ? `/dashboard/jobs/${item.latest_job_id}` : `/dashboard/customers/${item.id}`;
        name = item.name;
        mobile = item.phone || item.mobile || '—';
        address = item.address || '—';
    } else if (item.type === 'vehicle') {
        href = item.latest_job_id ? `/dashboard/jobs/${item.latest_job_id}` : `/dashboard/customers/${item.owner_id}`;
        name = `${item.brand} ${item.model} (${item.vehicle_number})`;
        mobile = item.mobile || '—';
        address = item.address || '—';
    } else if (item.type === 'job') {
        href = `/dashboard/jobs/${item.id}`;
        name = item.name || `Job #${item.id} - ${item.vehicle_number}`;
        mobile = item.mobile || '—';
        address = item.address || '—';
    }

    const initial = (name || '?').charAt(0).toUpperCase();

    return (
        <div
            className="hover:bg-slate-50 active:bg-slate-100 active:scale-[0.99] transition-all duration-150 cursor-pointer group"
            style={{
                display: 'grid',
                gridTemplateColumns: '2.5fr 2fr 1.5fr',
                borderBottom: isLast ? 'none' : '1px solid #e2e8f0',
                transformOrigin: 'center'
            }}
            onClick={() => window.location.href = href}
        >
            {/* Name Column: Avatar + Name */}
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderRight: '1px solid #e2e8f0', minWidth: 0 }}>
                <div style={{ height: '2.25rem', width: '2.25rem', flexShrink: 0, borderRadius: '9999px', backgroundColor: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', transition: 'transform 0.2s' }}>
                    {initial}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {name}
                </div>
            </div>

            {/* Mobile Column: Icon + Mobile */}
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.75rem', color: '#334155', padding: '1rem 1.5rem', borderRight: '1px solid #e2e8f0', minWidth: 0 }}>
                <Phone size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
                <span style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mobile}</span>
            </div>

            {/* Address Column: Icon + Address */}
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.75rem', color: '#64748b', padding: '1rem 1.5rem', minWidth: 0 }}>
                <MapPin size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
                <span style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{address}</span>
            </div>
        </div>
    );
}
