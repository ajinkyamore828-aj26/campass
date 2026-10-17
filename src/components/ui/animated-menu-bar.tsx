import React from 'react';
import {
  LayoutDashboard,
  Bell,
  Settings,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';

export type DefaultMenuItemKey = 'dashboard' | 'notifications' | 'settings' | 'help' | 'security';

export interface MenuBarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  showDividerAfter?: boolean;
}

export interface MenuBarProps {
  active?: string;
  onSelect?: (key: any) => void;
  items?: MenuBarItem[];
  className?: string;
}

const defaultIcons: Record<DefaultMenuItemKey, React.ReactNode> = {
  dashboard: <LayoutDashboard size={20} strokeWidth={1.75} />,
  notifications: <Bell size={20} strokeWidth={1.75} />,
  settings: <Settings size={20} strokeWidth={1.75} />,
  help: <HelpCircle size={20} strokeWidth={1.75} />,
  security: <ShieldCheck size={20} strokeWidth={1.75} />,
};

export interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, label, active, onClick }) => {
  const [hovered, setHovered] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const tooltipTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dynamic width based on label length (44px base for icon + text width + margins)
  const expandedWidth = Math.max(44 + label.length * 8 + 24, 116);
  const isExpanded = hovered || active;

  const handleMobileTooltip = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      e.preventDefault();
      setShowTooltip(true);
      if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
      tooltipTimeout.current = setTimeout(() => setShowTooltip(false), 1200);
    }
    if (onClick) onClick();
  };

  React.useEffect(() => {
    return () => {
      if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label={label}
      onClick={handleMobileTooltip}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative flex items-center justify-start rounded-xl border transition-all duration-300 focus:outline-none overflow-hidden select-none cursor-pointer ${
        active
          ? 'border-zinc-800 bg-zinc-900 text-white font-medium shadow-sm'
          : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 hover:border-zinc-200'
      }`}
      style={{
        height: 42,
        minHeight: 42,
        width: isExpanded ? expandedWidth : 42,
        minWidth: 42,
        padding: 0,
        transition: 'width 0.32s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Tooltip for small screen touch */}
      <span
        className={`sm:hidden absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-xs rounded-md px-2 py-1 shadow-md transition-opacity duration-200 pointer-events-none z-30 ${
          showTooltip ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {label}
      </span>

      {/* Centered Icon Box */}
      <span
        style={{
          width: 42,
          height: 42,
          minWidth: 42,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: active ? '#ffffff' : 'inherit',
        }}
      >
        {icon}
      </span>

      {/* Smoothly expanding label */}
      <span
        className="text-xs sm:text-[13px] font-medium whitespace-nowrap pointer-events-none pr-3"
        style={{
          opacity: isExpanded ? 1 : 0,
          transition: 'opacity 0.25s ease',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </span>
    </button>
  );
};

const DEFAULT_MENU_ITEMS: MenuBarItem[] = [
  { id: 'dashboard', icon: defaultIcons.dashboard, label: 'Dashboard', showDividerAfter: true },
  { id: 'notifications', icon: defaultIcons.notifications, label: 'Notifications' },
  { id: 'settings', icon: defaultIcons.settings, label: 'Settings' },
  { id: 'help', icon: defaultIcons.help, label: 'Help' },
  { id: 'security', icon: defaultIcons.security, label: 'Security' },
];

export const MenuBar: React.FC<MenuBarProps> = ({
  active = 'dashboard',
  onSelect,
  items,
  className = '',
}) => {
  const navItems = items || DEFAULT_MENU_ITEMS;

  return (
    <nav
      className={`flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-zinc-200 shadow-sm w-fit transition-all duration-300 ${className}`}
      style={{
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      {navItems.map((item, index) => {
        const isItemActive = active === item.id;
        return (
          <React.Fragment key={item.id}>
            <IconButton
              icon={item.icon}
              label={item.label}
              active={isItemActive}
              onClick={() => onSelect?.(item.id)}
            />
            {item.showDividerAfter && index < navItems.length - 1 && (
              <div
                className="w-px h-5 bg-zinc-200 mx-1 flex-shrink-0"
                style={{ backgroundColor: '#e4e4e7' }}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default MenuBar;
