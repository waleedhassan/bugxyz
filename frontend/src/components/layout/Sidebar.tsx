import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Bug, BarChart3, Users, FileText, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/store/auth-context';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/bugs', label: 'Bugs', icon: Bug },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/users', label: 'Users', icon: Users, adminOnly: true },
  { to: '/release-notes', label: 'Release Notes', icon: FileText },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-md bg-background border" onClick={() => setOpen(!open)}>
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 bg-card border-r flex flex-col transition-transform duration-200 md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-6">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <Bug className="h-6 w-6" /> BugXYZ
          </h1>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            if (item.adminOnly && user?.role !== 'ADMIN') return null;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
              {user?.fullName?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full px-2 py-1.5 rounded-md hover:bg-muted">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}
