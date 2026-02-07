import { getSession } from '@/app/actions/auth';
import db from '@/lib/db';
import { User, Settings, Moon, Sun, Monitor } from 'lucide-react';
import UserManagement from '@/components/UserManagement';
import GeneralSettingsForm from '@/components/GeneralSettingsForm';
import ThemeSelector from '@/components/ThemeSelector';
import ProfileCard from '@/components/ProfileCard';
import { getGeneralSettings } from '@/app/actions/settings';

export default async function SettingsPage() {
    const session = await getSession();
    const isAdmin = session?.role === 'admin';

    const users = isAdmin ? db.prepare('SELECT id, name, email, role FROM users').all() : [];
    const settingsData = await getGeneralSettings();
    const settings = settingsData.settings || { garage_name: 'GaragePro', tax_rate: '18' };

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

            <div className="settings-grid mb-8">
                {/* 1. Profile Settings (Left) */}
                <ProfileCard user={session} />

                {/* 2. General App Settings (Right) */}
                {isAdmin && (
                    <GeneralSettingsForm initialSettings={settings} />
                )}
            </div>

            {/* Admin Only: User Management */}
            {isAdmin && (
                <UserManagement initialUsers={users} />
            )}

            {/* Interface Theme selector */}
            <ThemeSelector userId={session?.id} initialTheme={session?.theme || 'light'} />
        </div>
    );
}
