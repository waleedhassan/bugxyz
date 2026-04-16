import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const routeNames: Record<string, string> = {
  '/': 'Dashboard', '/projects': 'Projects', '/bugs': 'Bugs', '/bugs/new': 'New Bug',
  '/analytics': 'Analytics', '/users': 'Users', '/release-notes': 'Release Notes',
};

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');

  const pageName = routeNames[location.pathname] || location.pathname.split('/').filter(Boolean).pop() || 'Page';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/bugs?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-6">
        <h2 className="text-lg font-semibold md:ml-0 ml-12">{pageName}</h2>
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="hidden sm:block">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bugs..."
                className="pl-8 w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>
          <button onClick={toggleTheme} className="p-2 rounded-md hover:bg-muted transition-colors">
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
