import db from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
import CreateJobForm from '@/components/CreateJobForm';

export const dynamic = 'force-dynamic';

export default async function CreateJobPage(props: {
    searchParams: Promise<{ vehicleId: string }>
}) {
    const searchParams = await props.searchParams;

    if (!searchParams.vehicleId) {
        redirect('/dashboard/customers'); // Needs a vehicle to start
    }

    const vehicleRes = await db.query(`
    SELECT v.*, c.name as customer_name, c.id as customer_id 
    FROM vehicles v 
    JOIN customers c ON v.customer_id = c.id 
    WHERE v.id = $1
  `, [searchParams.vehicleId]);
    const vehicle = vehicleRes.rows[0];

    if (!vehicle) {
        return <div className="p-8 text-center text-red-500 font-bold">Vehicle not found</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="page-header mb-8">
                <div>
                    <nav className="breadcrumbs text-muted mb-1">
                        <span className="breadcrumb-item">Dashboard</span>
                        <span className="breadcrumb-separator mx-2">/</span>
                        <span className="breadcrumb-item">Jobs</span>
                        <span className="breadcrumb-separator mx-2">/</span>
                        <span className="breadcrumb-item active text-primary font-bold">New Job</span>
                    </nav>

                    <h1 className="page-title">Open New Job Card</h1>
                    <p className="page-subtitle text-slate-500">
                        Initialize a service request for vehicle
                        <span className="ml-1 font-mono font-black text-slate-900">{vehicle.vehicle_number}</span>
                    </p>
                </div>

                <Link href={`/dashboard/customers/${vehicle.customer_id}`} className="btn btn-outline border-slate-200 shadow-sm">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Customer
                </Link>
            </div>

            <CreateJobForm vehicle={vehicle} />
        </div>
    );
}