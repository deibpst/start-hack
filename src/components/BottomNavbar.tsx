import { Scan, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function BottomNavbar() {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        {
            icon: Scan,
            label: 'Escáner',
            path: '/',
        },
        {
            icon: User,
            label: 'Perfil',
            path: '/profile',
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-around h-16">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={cn(
                                    'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                                    isActive
                                        ? 'text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <Icon className={cn('h-6 w-6', isActive && 'animate-pulse')} />
                                <span className="text-xs font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
