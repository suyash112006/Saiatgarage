import db from '@/lib/db';
import { getGeneralSettings } from '@/app/actions/settings';
import ProfileCard from '@/components/ProfileCard';
import GeneralSettingsForm from '@/components/GeneralSettingsForm';
import UserManagement from '@/components/UserManagement';

interface SettingsWrapperProps {
    session: any;
    isAdmin: boolean;
}

export default async function SettingsWrapper({ session, isAdmin }: SettingsWrapperProps) {
    const usersRes = isAdmin ? await db.query('SELECT id, name, email, role FROM users') : { rows: [] };
    const users = usersRes.rows as { id: number, name: string, email: string, role: string }[];
    const settingsData = await getGeneralSettings();
    const settings = settingsData.settings || { garage_name: 'GaragePro', tax_rate: '18' };

    return (
        <>
            <div className="settings-grid items-stretch mb-8">
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
        </>
    );
}
