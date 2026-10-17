"use client";

import { ChevronDown, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

const PANEL_EASE = [0.16, 1, 0.3, 1] as const;
const EXPAND_SPRING = {
  type: "spring" as const,
  stiffness: 150,
  damping: 26,
  mass: 1.05,
};
const COLLAPSE_SPRING = {
  type: "spring" as const,
  stiffness: 190,
  damping: 30,
  mass: 1.1,
};

export type FaqProItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqProProps = {
  className?: string;
  defaultOpenFirst?: boolean;
  items: FaqProItem[];
  searchPlaceholder?: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, query: string) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return text;
  }

  const parts = text.split(
    new RegExp(`(${escapeRegExp(normalizedQuery)})`, "gi")
  );

  return parts.map((part, index) => {
    if (part.toLowerCase() === normalizedQuery.toLowerCase()) {
      return (
        <mark
          style={{
            backgroundColor: '#fef08a',
            color: '#713f12',
            padding: '1px 4px',
            borderRadius: '4px',
            fontWeight: 600,
          }}
          key={index}
        >
          {part}
        </mark>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function itemMatchesQuery(item: FaqProItem, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return (
    item.question.toLowerCase().includes(normalizedQuery) ||
    item.answer.toLowerCase().includes(normalizedQuery)
  );
}

function getDefaultOpenId(items: FaqProItem[], defaultOpenFirst: boolean) {
  if (defaultOpenFirst && items[0]) {
    return items[0].id;
  }

  return null;
}

type FaqProRowProps = {
  isOpen: boolean;
  item: FaqProItem;
  onToggle: () => void;
  panelId: string;
  query: string;
  triggerId: string;
};

function FaqProRow({
  isOpen,
  item,
  onToggle,
  panelId,
  query,
  triggerId,
}: FaqProRowProps) {
  return (
    <div
      style={{
        overflow: 'hidden',
        borderRadius: '16px',
        backgroundColor: '#ffffff',
        border: isOpen ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        transition: 'border-color 0.2s, background-color 0.2s',
      }}
    >
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        id={triggerId}
        onClick={onToggle}
        type="button"
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '16px 20px',
          textAlign: 'left',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          outline: 'none',
          backgroundColor: isOpen ? '#f0fdf4' : '#ffffff',
          transition: 'background-color 0.15s ease',
        }}
      >
        <span
          style={{
            fontFamily: 'inherit',
            fontSize: '14.5px',
            fontWeight: 600,
            color: isOpen ? '#14532d' : '#0f172a',
            lineHeight: 1.45,
            letterSpacing: '-0.01em',
          }}
        >
          {highlightText(item.question, query)}
        </span>
        <ChevronDown
          aria-hidden
          size={17}
          style={{
            flexShrink: 0,
            color: isOpen ? '#166534' : '#94a3b8',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), color 0.15s',
          }}
        />
      </button>

      <motion.div
        animate={{ height: isOpen ? "auto" : 0 }}
        aria-labelledby={triggerId}
        id={panelId}
        initial={false}
        role="region"
        style={{ overflow: 'hidden' }}
        transition={{
          height: isOpen ? EXPAND_SPRING : COLLAPSE_SPRING,
        }}
      >
        <motion.div
          animate={{
            opacity: isOpen ? 1 : 0,
            y: isOpen ? 0 : -4,
          }}
          aria-hidden={!isOpen}
          initial={false}
          style={{
            padding: '12px 20px 18px 20px',
            fontSize: '13.5px',
            color: '#475569',
            lineHeight: 1.6,
            borderTop: '1px solid #f1f5f9',
            backgroundColor: '#ffffff',
          }}
          transition={{
            opacity: {
              duration: isOpen ? 0.3 : 0.15,
              ease: PANEL_EASE,
              delay: isOpen ? 0.05 : 0,
            },
            y: isOpen ? EXPAND_SPRING : COLLAPSE_SPRING,
          }}
        >
          {highlightText(item.answer, query)}
        </motion.div>
      </motion.div>
    </div>
  );
}

function FaqPro({
  className,
  defaultOpenFirst = false,
  items,
  searchPlaceholder = "Search FAQs...",
}: FaqProProps) {
  const listId = React.useId();
  const wasSearchingRef = React.useRef(false);

  const [query, setQuery] = React.useState("");
  const [openId, setOpenId] = React.useState<string | null>(() =>
    getDefaultOpenId(items, defaultOpenFirst)
  );

  const normalizedQuery = query.trim();
  const isSearching = normalizedQuery.length > 0;

  const visibleItems = React.useMemo(
    () => items.filter((item) => itemMatchesQuery(item, query)),
    [items, query]
  );

  React.useEffect(() => {
    if (isSearching) {
      wasSearchingRef.current = true;
      setOpenId((current) => {
        if (current && visibleItems.some((item) => item.id === current)) {
          return current;
        }

        return visibleItems[0]?.id ?? null;
      });
      return;
    }

    if (wasSearchingRef.current) {
      wasSearchingRef.current = false;
      setOpenId(getDefaultOpenId(items, defaultOpenFirst));
      return;
    }
  }, [defaultOpenFirst, isSearching, items, visibleItems]);

  React.useEffect(() => {
    setOpenId((current) => {
      if (!current) {
        return current;
      }

      return items.some((item) => item.id === current) ? current : null;
    });
  }, [items]);

  const toggleItem = React.useCallback((id: string) => {
    setOpenId((current) => (current === id ? null : id));
  }, []);

  return (
    <div
      className={cn("mx-auto flex w-full flex-col gap-3.5", className)}
      style={{ maxWidth: '100%' }}
    >
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          aria-label={searchPlaceholder}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          type="search"
          value={query}
          style={{
            height: '46px',
            width: '100%',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            paddingLeft: '16px',
            paddingRight: '42px',
            fontSize: '14px',
            color: '#0f172a',
            outline: 'none',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#166534';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22, 101, 52, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
          }}
        />
        {query ? (
          <button
            aria-label="Clear search"
            onClick={() => setQuery("")}
            type="button"
            style={{
              position: 'absolute',
              top: '50%',
              right: '10px',
              transform: 'translateY(-50%)',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              backgroundColor: '#f1f5f9',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <AnimatePresence initial={false} mode="popLayout">
          {visibleItems.length > 0 ? (
            visibleItems.map((item) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                initial={{ opacity: 0, y: 4 }}
                key={item.id}
                layout="position"
                transition={{ duration: 0.2, ease: PANEL_EASE }}
              >
                <FaqProRow
                  isOpen={openId === item.id}
                  item={item}
                  onToggle={() => toggleItem(item.id)}
                  panelId={`${listId}-${item.id}-panel`}
                  query={query}
                  triggerId={`${listId}-${item.id}-trigger`}
                />
              </motion.div>
            ))
          ) : (
            <motion.p
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              key="empty"
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                fontSize: '13.5px',
                color: '#94a3b8',
              }}
            >
              No FAQs match your search.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

FaqPro.displayName = "FaqPro";

export { FaqPro };
export default FaqPro;
