import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { getSession } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="app-layout">
      {/* Sidebar - Pass user for info display */}
      <Sidebar user={session} />

      <main className="main-content">
        <TopBar user={session} />
        {children}
      </main>
    </div>
  );
}
