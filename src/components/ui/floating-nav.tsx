import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Search, Bell, User, Settings, Bookmark } from "lucide-react";

export interface FloatingNavItem {
  id: string | number;
  icon: React.ReactNode;
  label: string;
}

export interface FloatingNavProps {
  items?: FloatingNavItem[];
  activeId?: string | number;
  onSelect?: (id: string) => void;
  className?: string;
  isFloating?: boolean;
}

const DEFAULT_ITEMS: FloatingNavItem[] = [
  { id: "0", icon: <Home size={18} />, label: "Home" },
  { id: "1", icon: <Search size={18} />, label: "Search" },
  { id: "2", icon: <Bell size={18} />, label: "Alerts" },
  { id: "3", icon: <User size={18} />, label: "Profile" },
  { id: "4", icon: <Bookmark size={18} />, label: "Saved" },
  { id: "5", icon: <Settings size={18} />, label: "Settings" },
];

export const FloatingNav: React.FC<FloatingNavProps> = ({
  items = DEFAULT_ITEMS,
  activeId,
  onSelect,
  className = "",
  isFloating = false,
}) => {
  const [internalActive, setInternalActive] = useState<string | number>(
    activeId !== undefined ? activeId : items[0]?.id ?? 0
  );

  const currentActive = activeId !== undefined ? activeId : internalActive;

  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Map<string | number, HTMLButtonElement>>(new Map());

  // Update indicator position when active changes or on window resize
  useEffect(() => {
    const updateIndicator = () => {
      const btn = btnRefs.current.get(currentActive);
      const container = containerRef.current;
      if (!btn || !container) return;

      const btnRect = btn.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      setIndicatorStyle({
        width: btnRect.width,
        left: btnRect.left - containerRect.left,
      });
    };

    updateIndicator();
    // Allow slight DOM settle
    const t = setTimeout(updateIndicator, 50);
    window.addEventListener("resize", updateIndicator);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", updateIndicator);
    };
  }, [currentActive, items]);

  const handleItemClick = (id: string | number) => {
    setInternalActive(id);
    if (onSelect) {
      onSelect(String(id));
    }
  };

  const containerClasses = isFloating
    ? "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-2"
    : "relative flex items-center";

  return (
    <div className={containerClasses} style={{ display: 'flex', alignItems: 'center' }}>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '9999px',
          padding: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {items.map((item) => {
          const isActive = currentActive === item.id;
          return (
            <button
              key={item.id}
              ref={(el) => {
                if (el) btnRefs.current.set(item.id, el);
                else btnRefs.current.delete(item.id);
              }}
              onClick={() => handleItemClick(item.id)}
              style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingLeft: '14px',
                paddingRight: '14px',
                paddingTop: '6px',
                paddingBottom: '6px',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#14532d' : '#64748b',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                userSelect: 'none',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = '#0f172a';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = '#64748b';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', color: isActive ? '#166534' : '#94a3b8' }}>
                {item.icon}
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Sliding Active Indicator with Spring Motion */}
        <motion.div
          animate={indicatorStyle}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          style={{
            position: 'absolute',
            top: '3px',
            bottom: '3px',
            borderRadius: '9999px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            boxShadow: '0 1px 2px rgba(22, 101, 52, 0.08)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
};

export default FloatingNav;
