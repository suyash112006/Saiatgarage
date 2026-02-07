"use client";

import { useState } from "react";
import { Search, Trash2, User, Phone, Edit, MoreHorizontal } from "lucide-react";
import { CustomerRow } from "./CustomerRow";
import Link from "next/link";
import { deleteCustomer } from "@/app/actions/customer";

interface CustomerTableProps {
    initialCustomers: any[];
}

export default function CustomerTable({ initialCustomers }: CustomerTableProps) {
    const [search, setSearch] = useState("");

    async function handleDelete(id: number) {
        if (confirm(`Are you sure you want to delete this customer? This will remove all their vehicles and job history.`)) {
            const result = await deleteCustomer(id);
            if (result.error) {
                alert(result.error);
            }
        }
    }

    const filteredCustomers = initialCustomers.filter(c => {
        const matchesSearch =
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.mobile.includes(search) ||
            (c.address && c.address.toLowerCase().includes(search.toLowerCase()));

        return matchesSearch;
    });

    return (
        <div className="card">
            <div className="table-toolbar flex justify-between items-center gap-4">
                <div className="search-box" style={{ width: '280px', margin: 0 }}>
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Mobile View: Cards */}
            <div className="md:hidden space-y-4">
                {filteredCustomers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <User size={48} className="mb-4 opacity-50" />
                        <p className="font-bold uppercase tracking-widest text-xs">No customers found</p>
                    </div>
                ) : (
                    filteredCustomers.map((customer) => (
                        <div key={customer.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-slate-900">{customer.name}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                                        <Phone size={12} />
                                        {customer.mobile}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/dashboard/customers/${customer.id}/edit`} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                                        <Edit size={16} />
                                    </Link>
                                    <button onClick={() => handleDelete(customer.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            {customer.address && (
                                <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    {customer.address}
                                </div>
                            )}
                            <Link href={`/dashboard/customers/${customer.id}`} className="btn btn-outline w-full justify-center text-xs py-2 h-auto">
                                View Vehicles
                            </Link>
                        </div>
                    ))
                )}
            </div>

            <div className="hidden md:block table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th className="w-8 pl-4">#</th>
                            <th>Name</th>
                            <th>Mobile</th>
                            <th>Address</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <div className="bg-slate-50 p-4 rounded-full mb-4">
                                            <User size={32} className="opacity-20" />
                                        </div>
                                        <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">
                                            {search ? "No customers match your search." : "No customers found. Add your first customer!"}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredCustomers.map((c: any, i: number) => (
                                <CustomerRow key={c.id} customer={c} index={i} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
