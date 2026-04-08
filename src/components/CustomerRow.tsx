"use client";

import { useRouter } from "next/navigation";
import { Phone, MapPin, Trash2, User } from "lucide-react";
import { deleteCustomer } from "@/app/actions/customer";

interface CustomerRowProps {
    customer: any;
    index: number;
    isAdmin: boolean;
}

export function CustomerRow({ customer, index, isAdmin }: CustomerRowProps) {
    const router = useRouter();
    const initials = customer.name ? customer.name.charAt(0).toUpperCase() : "?";

    async function handleDelete(e: React.MouseEvent) {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete ${customer.name}? This will remove all their vehicles and job history.`)) {
            const result = await deleteCustomer(customer.id);
            if (result.error) {
                alert(result.error);
            }
        }
    }

    return (
        <tr
            className="clickable-row"
            onClick={() => {
                router.push(`/dashboard/customers/${customer.id}`);
            }}
        >
            <td className="text-slate-400 font-mono text-[10px] font-bold w-8 pl-4">
                {String(index + 1).padStart(2, '0')}
            </td>
            <td>
                <div className="name-cell">
                    <div className="avatar">{initials}</div>
                    <span className="name-text">{customer.name}</span>
                </div>
            </td>

            <td>
                <span className="cell-icon">
                    <Phone size={14} />
                    {customer.mobile}
                </span>
            </td>

            <td>
                <span className="cell-icon muted">
                    <MapPin size={14} />
                    {customer.address || "—"}
                </span>
            </td>

            {isAdmin && (
                <td className="text-center">
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={handleDelete}
                            className="btn-icon danger animate-icon"
                            title="Delete Customer"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </td>
            )}
        </tr>
    );
}
