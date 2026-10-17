import React, { useState } from 'react';
import { LayoutGrid, Check, RotateCcw, X, ArrowRight, Eye } from 'lucide-react';
import type { BentoCardConfig } from '../../types';

interface EditBentoCardsModalProps {
  bentoCards: BentoCardConfig[];
  onClose: () => void;
  onUpdateCard?: (id: string, updates: Partial<BentoCardConfig>) => void;
  onUpdateAllCards?: (cards: BentoCardConfig[]) => void;
  onResetCards: () => void;
  onSuccessNotice: (msg: string) => void;
  initialCardId?: string;
}

const CATEGORY_DESTINATIONS = [
  { value: 'PASSES', label: 'My Registrations / Passes (Opens Wallet)' },
  { value: 'ALL', label: 'Filter: All Events' },
  { value: 'HACKATHON', label: 'Filter: Hackathons' },
  { value: 'IDEATHON', label: 'Filter: Ideathons' },
  { value: 'CODING_COMPETITION', label: 'Filter: Coding Contests' },
  { value: 'APTITUDE', label: 'Filter: Aptitude Tests' },
  { value: 'CULTURAL', label: 'Filter: Cultural Events' },
  { value: 'FRESHER_PARTY', label: 'Filter: Fresher Parties' },
  { value: 'BOOTCAMP', label: 'Filter: Bootcamps' },
  { value: 'CAMPUS_DRIVE', label: 'Filter: Campus Drives' },
  { value: 'SEMINAR', label: 'Filter: Seminars' },
  { value: 'TECHNICAL', label: 'Filter: Technical' },
  { value: 'SPORTS', label: 'Filter: Sports' },
  { value: 'WORKSHOP', label: 'Filter: Workshops' },
];

export const EditBentoCardsModal: React.FC<EditBentoCardsModalProps> = ({
  bentoCards,
  onClose,
  onUpdateCard,
  onUpdateAllCards,
  onResetCards,
  onSuccessNotice,
  initialCardId,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string>(initialCardId || bentoCards[0]?.id || 'bento-1');
  const [localCards, setLocalCards] = useState<BentoCardConfig[]>(bentoCards);

  const currentCard = localCards.find(c => c.id === selectedCardId) || localCards[0];

  const handleFieldChange = (field: keyof BentoCardConfig, value: string) => {
    setLocalCards(prev =>
      prev.map(c => (c.id === selectedCardId ? { ...c, [field]: value } : c))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedCards = localCards.map(c => ({
      ...c,
      tag: c.tag.trim(),
      title: c.title.trim(),
      description: c.description.trim(),
      linkLabel: c.linkLabel.trim(),
      targetCategory: c.targetCategory,
    }));

    if (onUpdateAllCards) {
      onUpdateAllCards(cleanedCards);
    } else if (onUpdateCard) {
      cleanedCards.forEach(c => {
        onUpdateCard(c.id, c);
      });
    }
    onSuccessNotice('Highlight cards updated successfully');
    onClose();
  };

  const handleReset = () => {
    if (window.confirm('Reset all 4 highlight cards to original system defaults?')) {
      onResetCards();
      const defaults: BentoCardConfig[] = [
        {
          id: 'bento-1',
          tag: 'Active Passes',
          tagColor: '#ea580c',
          title: 'My Registrations',
          description: 'Track admissions, passes & verified QR delivery in real-time.',
          linkLabel: 'View passes',
          targetCategory: 'PASSES',
          bg: '#fff7ed',
          border: '#fed7aa',
        },
        {
          id: 'bento-2',
          tag: 'Code Sprints',
          tagColor: '#0284c7',
          title: 'Hackathons',
          description: 'National coding challenges, AI hackathons & live prototype sprints.',
          linkLabel: 'Explore sprints',
          targetCategory: 'HACKATHON',
          bg: '#f0f9ff',
          border: '#bae6fd',
        },
        {
          id: 'bento-3',
          tag: 'Recruitment',
          tagColor: '#9333ea',
          title: 'Campus Drives',
          description: 'Corporate recruitment, technical interviews & placement drives.',
          linkLabel: 'Browse drives',
          targetCategory: 'CAMPUS_DRIVE',
          bg: '#faf5ff',
          border: '#e9d5ff',
        },
        {
          id: 'bento-4',
          tag: 'Live Fests',
          tagColor: '#16a34a',
          title: 'Cultural & Fests',
          description: 'Gala nights, musical fests, dance showdowns & fresher carnivals.',
          linkLabel: 'Join events',
          targetCategory: 'CULTURAL',
          bg: '#f0fdf4',
          border: '#bbf7d0',
        },
      ];
      setLocalCards(defaults);
      onSuccessNotice('Highlight cards reset to defaults');
    }
  };

  return (
    <div className="cp-modal-overlay" onClick={onClose} style={{ zIndex: 120 }}>
      <div
        className="cp-modal"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '780px',
          width: '94%',
          maxHeight: 'min(90vh, 840px)',
          display: 'flex',
          flexDirection: 'column',
          background: '#09090b',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: '18px',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.75)',
          color: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}>
              <LayoutGrid size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                Edit Highlight Cards (4-Card Bento Showcase)
              </h3>
              <p style={{ fontSize: '12px', color: '#a1a1aa', margin: 0 }}>
                Configure title, description, badge tags and click destination for each card
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#a1a1aa',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Card Selector Pills */}
        <div style={{
          padding: '14px 24px',
          background: 'rgba(24, 24, 27, 0.5)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
        }}>
          {localCards.map((c, idx) => {
            const isSelected = c.id === selectedCardId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCardId(c.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: isSelected ? '1px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.12)',
                  background: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                  color: isSelected ? '#09090b' : '#a1a1aa',
                  fontSize: '12.5px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: c.tagColor || '#86efac',
                  }}
                />
                <span>Card {idx + 1}: {c.title}</span>
              </button>
            );
          })}
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
            {/* Live Card Preview (rendered in its original card theme) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#86efac', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <Eye size={13} />
                <span>Live Card Preview (Card {localCards.findIndex(c => c.id === selectedCardId) + 1})</span>
              </div>
              <div
                style={{
                  background: currentCard.bg,
                  border: `1px solid ${currentCard.border}`,
                  borderRadius: '16px',
                  padding: '20px',
                  position: 'relative',
                  overflow: 'hidden',
                  color: '#0f172a',
                  maxWidth: '380px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                }}
              >
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 8px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.85)', marginBottom: '10px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: currentCard.tagColor }} />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: currentCard.tagColor }}>{currentCard.tag || 'Badge'}</span>
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 6px 0', color: '#0f172a' }}>
                    {currentCard.title || 'Card Title'}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0, maxWidth: '240px' }}>
                    {currentCard.description || 'Description text...'}
                  </p>
                </div>
                <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: currentCard.tagColor }}>
                  <span>{currentCard.linkLabel || 'Explore'}</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>

            {/* Inputs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#e4e4e7', marginBottom: '6px' }}>
                  Badge Tag Label
                </label>
                <input
                  type="text"
                  value={currentCard.tag}
                  onChange={e => handleFieldChange('tag', e.target.value)}
                  placeholder="e.g. Active Passes"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: '#18181b',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    outline: 'none',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#e4e4e7', marginBottom: '6px' }}>
                  Card Title
                </label>
                <input
                  type="text"
                  value={currentCard.title}
                  onChange={e => handleFieldChange('title', e.target.value)}
                  placeholder="e.g. My Registrations"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: '#18181b',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    outline: 'none',
                  }}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#e4e4e7', marginBottom: '6px' }}>
                Card Description
              </label>
              <textarea
                value={currentCard.description}
                onChange={e => handleFieldChange('description', e.target.value)}
                placeholder="Brief summary of what this card represents..."
                rows={2}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: '#18181b',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'vertical',
                }}
                required
              />
            </div>

            {/* Link Label & Click Destination */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#e4e4e7', marginBottom: '6px' }}>
                  Bottom Link Text
                </label>
                <input
                  type="text"
                  value={currentCard.linkLabel}
                  onChange={e => handleFieldChange('linkLabel', e.target.value)}
                  placeholder="e.g. View passes"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: '#18181b',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    outline: 'none',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#e4e4e7', marginBottom: '6px' }}>
                  Click Destination Action
                </label>
                <select
                  value={currentCard.targetCategory}
                  onChange={e => handleFieldChange('targetCategory', e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: '#18181b',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  {CATEGORY_DESTINATIONS.map(d => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(18, 18, 22, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}>
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#a1a1aa',
                cursor: 'pointer',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
              }}
            >
              <RotateCcw size={13} />
              <span>Reset All to Defaults</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#e4e4e7',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: '#ffffff',
                  border: 'none',
                  color: '#09090b',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Check size={14} />
                <span>Save All Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
