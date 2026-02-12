import { getCustomerDetails } from '@/app/actions/vehicle';
import EditCustomerForm from '@/components/EditCustomerForm';
import { User } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Params = Promise<{ id: string }>;

export default async function EditCustomerPage(props: { params: Params }) {
    const params = await props.params;
    const data: any = await getCustomerDetails(params.id);

    if (!data || !data.customer) notFound();

    return (
        <div className="dashboard-container">
            <div className="page-header mb-8">
                <div>
                    <nav className="breadcrumbs text-muted mb-2">
                        <Link href="/dashboard" className="breadcrumb-item text-slate-400 hover:text-primary transition-colors">Dashboard</Link>
                        <span className="breadcrumb-separator mx-2 text-slate-300">/</span>
                        <Link href="/dashboard/customers" className="breadcrumb-item text-slate-400 hover:text-primary transition-colors">Customers</Link>
                        <span className="breadcrumb-separator mx-2 text-slate-300">/</span>
                        <Link href={`/dashboard/customers/${params.id}`} className="breadcrumb-item text-slate-400 hover:text-primary transition-colors">#{params.id.toString().padStart(4, '0')}</Link>
                        <span className="breadcrumb-separator mx-2 text-slate-300">/</span>
                        <span className="breadcrumb-item active text-primary font-bold">Edit Profile</span>
                    </nav>

                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Profile</h1>
                            <p className="text-slate-500 text-sm">Update customer information</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <EditCustomerForm customer={data.customer} />
            </div>
        </div>
    );
}
