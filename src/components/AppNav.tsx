import { NavLink } from 'react-router-dom';
import { Grid3X3, CheckSquare, Settings, HelpCircle } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: Grid3X3, label: 'Mandala' },
  { to: '/daily', icon: CheckSquare, label: 'Daily' },
  { to: '/how-to', icon: HelpCircle, label: 'How To' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto h-14">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
