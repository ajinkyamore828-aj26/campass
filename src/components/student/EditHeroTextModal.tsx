import React, { useState } from 'react';
import { Type, Check, RotateCcw, X, ArrowUpRight, Ticket, Eye } from 'lucide-react';
import type { HeroContentConfig } from '../../types';

interface EditHeroTextModalProps {
  heroConfig: HeroContentConfig;
  onClose: () => void;
  onUpdateHero: (updates: Partial<HeroContentConfig>) => void;
  onResetHero: () => void;
  onSuccessNotice: (msg: string) => void;
}

export const EditHeroTextModal: React.FC<EditHeroTextModalProps> = ({
  heroConfig,
  onClose,
  onUpdateHero,
  onResetHero,
  onSuccessNotice,
}) => {
  const [headline, setHeadline] = useState(heroConfig.headline);
  const [subtitle, setSubtitle] = useState(heroConfig.subtitle);
  const [primaryCtaText, setPrimaryCtaText] = useState(heroConfig.primaryCtaText);
  const [secondaryCtaText, setSecondaryCtaText] = useState(heroConfig.secondaryCtaText);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim()) {
      alert('Headline cannot be empty');
      return;
    }
    onUpdateHero({
      headline: headline.trim(),
      subtitle: subtitle.trim(),
      primaryCtaText: primaryCtaText.trim() || 'My Registrations',
      secondaryCtaText: secondaryCtaText.trim() || 'Pass Wallet',
    });
    onSuccessNotice('Hero headline and description updated successfully');
    onClose();
  };

  const handleReset = () => {
    if (window.confirm('Reset hero text to original defaults?')) {
      onResetHero();
      setHeadline('Experience the difference');
      setSubtitle('Join thousands of students registering for hackathons, cultural fests, workshops, and sports. Get your digital gate pass instantly after confirmation.');
      setPrimaryCtaText('My Registrations');
      setSecondaryCtaText('Pass Wallet');
      onSuccessNotice('Hero text reset to system defaults');
    }
  };

  return (
    <div className="cp-modal-overlay" onClick={onClose} style={{ zIndex: 120 }}>
      <div
        className="cp-modal"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          width: '94%',
          maxHeight: 'min(90vh, 800px)',
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
              <Type size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                Edit Homepage Hero Text
              </h3>
              <p style={{ fontSize: '12px', color: '#a1a1aa', margin: 0 }}>
                Customize the headline, descriptive subtitle &amp; CTA button labels for all students
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

        {/* Form Body */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto' }}>
            {/* Live Preview Box */}
            <div style={{
              background: 'rgba(24, 24, 27, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '18px 20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', color: '#86efac', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <Eye size={13} />
                <span>Live Hero Preview</span>
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 10px 0', lineHeight: 1.2 }}>
                {headline || 'Experience the difference'}
              </h2>
              <p style={{ fontSize: '13.5px', color: '#a1a1aa', lineHeight: 1.55, margin: '0 0 16px 0', maxWidth: '520px' }}>
                {subtitle || 'Join thousands of students registering for hackathons, cultural fests, workshops, and sports...'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: '#f4f4f5',
                  color: '#09090b',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <span>{primaryCtaText || 'My Registrations'}</span>
                  <ArrowUpRight size={14} />
                </div>
                <div style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'rgba(24, 24, 27, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#f4f4f5',
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <Ticket size={14} />
                  <span>{secondaryCtaText || 'Pass Wallet'}</span>
                </div>
              </div>
            </div>

            {/* Headline Input */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#e4e4e7', marginBottom: '6px' }}>
                Hero Main Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                placeholder="e.g. Experience the difference"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#18181b',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                }}
                required
              />
            </div>

            {/* Subtitle Input */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#e4e4e7', marginBottom: '6px' }}>
                Hero Descriptive Subtitle
              </label>
              <textarea
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder="e.g. Join thousands of students registering for hackathons, cultural fests, workshops, and sports..."
                rows={3}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#18181b',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  lineHeight: 1.5,
                  outline: 'none',
                  resize: 'vertical',
                }}
                required
              />
            </div>

            {/* CTA Button Labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#e4e4e7', marginBottom: '6px' }}>
                  Primary CTA Label
                </label>
                <input
                  type="text"
                  value={primaryCtaText}
                  onChange={e => setPrimaryCtaText(e.target.value)}
                  placeholder="My Registrations"
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
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#e4e4e7', marginBottom: '6px' }}>
                  Secondary CTA Label
                </label>
                <input
                  type="text"
                  value={secondaryCtaText}
                  onChange={e => setSecondaryCtaText(e.target.value)}
                  placeholder="Pass Wallet"
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
                />
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
              <span>Reset Defaults</span>
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
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
