import { getSession } from '@/app/actions/auth';
import ThemeSelector from '@/components/ThemeSelector';
import { Suspense } from 'react';
import SettingsWrapper from '@/components/SettingsWrapper';

export default async function SettingsPage() {
    const session = await getSession();
    const isAdmin = session?.role === 'admin';

    return (
        <div className="dashboard-container">
            <div className="page-header">
                <div>
                    <nav className="breadcrumbs text-muted mb-1">
                        <span className="breadcrumb-item">Dashboard</span>
                        <span className="breadcrumb-separator mx-1">/</span>
                        <span className="breadcrumb-item active text-primary font-medium">Settings</span>
                    </nav>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle text-muted">Manage garage profile and users</p>
                </div>
            </div>

            <Suspense fallback={<div className="p-10 text-center text-muted">Loading settings...</div>}>
                <SettingsWrapper session={session} isAdmin={isAdmin} />
            </Suspense>

            {/* Interface Theme selector */}
            <ThemeSelector userId={session?.id} initialTheme={session?.theme || 'light'} />
        </div>
    );
}
