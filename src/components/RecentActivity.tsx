import { getRecentActivity } from '@/app/actions/search';
import DashboardSearch from '@/components/DashboardSearch';

export default async function RecentActivity() {
    const recentActivity = await getRecentActivity();

    return (
        <div className="mb-10 text-[var(--text-main)]">
            <DashboardSearch initialActivity={recentActivity} />
        </div>
    );
}
