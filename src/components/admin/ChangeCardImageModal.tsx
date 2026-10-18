import React, { useState } from 'react';
import type { CampusEvent } from '../../types';
import { useCampusPass } from '../../context/CampusPassContext';
import {
  X,
  Upload,
  Link as LinkIcon,
  Check,
  RotateCcw,
  Palette,
  Image as ImageIcon,
  Save,
  CheckCircle,
  AlertCircle,
  Laptop,
  Smartphone,
  FolderOpen
} from 'lucide-react';

interface ChangeCardImageModalProps {
  event: CampusEvent;
  onClose: () => void;
  onUpdateEvent: (id: string, data: Partial<CampusEvent>) => Promise<{ success: boolean; message?: string; data?: CampusEvent }>;
  onSuccessNotice: (msg: string) => void;
}

const PRESET_EVENT_COVERS = [
  {
    title: 'Concert & Freshers Gala',
    category: 'Cultural',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Live DJ & Music Festival',
    category: 'Cultural',
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Hackathon & Dev Sprint',
    category: 'Technical',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Open Source Workspace',
    category: 'Technical',
    url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Main Auditorium & Summit',
    category: 'Conference',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Keynote & Academic Lecture',
    category: 'Seminar',
    url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Robotics & Hardware Lab',
    category: 'Technical',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Esports & Gaming League',
    category: 'Gaming',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Athletic Meet & Sports',
    category: 'Sports',
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Campus Quad & Lawn Fest',
    category: 'Campus',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Team Pitch & Ideation',
    category: 'Ideathon',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Night Stage & Laser Show',
    category: 'Cultural',
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
  },
];

export const ChangeCardImageModal: React.FC<ChangeCardImageModalProps> = ({
  event,
  onClose,
  onUpdateEvent,
  onSuccessNotice,
}) => {
  const { theme } = useCampusPass();
  const isDark = theme === 'dark';
  const [selectedUrl, setSelectedUrl] = useState<string>(
    event.bannerUrl || PRESET_EVENT_COVERS[0].url
  );
  const [customInputUrl, setCustomInputUrl] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // File Upload Handler (converts to data URL so any local image works immediately)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Image size exceeds 8MB. Please select a smaller photo.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new window.Image();
      img.onload = () => {
        const maxDim = 1400;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.86);
          setSelectedUrl(compressed);
          setCustomInputUrl('');
        } else {
          setSelectedUrl(readerEvent.target?.result as string);
          setCustomInputUrl('');
        }
      };
      img.onerror = () => {
        setSelectedUrl(readerEvent.target?.result as string);
        setCustomInputUrl('');
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file from device.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    const trimmed = customInputUrl.trim();
    if (!trimmed) return;
    setSelectedUrl(trimmed);
  };

  const handleSave = async () => {
    if (!selectedUrl) return;
    setSaving(true);
    try {
      const res = await onUpdateEvent(event.id, { bannerUrl: selectedUrl });
      if (res.success) {
        onSuccessNotice(`Card image updated for "${event.title}"!`);
        onClose();
      } else {
        alert(res.message || 'Failed to update event card image.');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating card image.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <div
        className="cp-modal"
        style={{
          maxWidth: '780px',
          maxHeight: '90vh',
          background: isDark ? '#141416' : '#ffffff',
          color: isDark ? '#f4f4f5' : '#0f172a',
          borderRadius: '24px',
          border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
          boxShadow: isDark ? '0 25px 60px -15px rgba(0, 0, 0, 0.7)' : '0 25px 60px -15px rgba(0, 0, 0, 0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="cp-modal-header"
          style={{
            background: isDark ? '#141416' : '#ffffff',
            borderBottom: isDark ? '1px solid #27272a' : '1px solid #f1f5f9',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: isDark ? 'rgba(22, 101, 52, 0.25)' : '#f0fdf4',
                border: isDark ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDark ? '#86efac' : '#166534',
              }}
            >
              <ImageIcon size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#f4f4f5' : '#09090b', margin: 0 }}>
                Change Event Card Image
              </h3>
              <p style={{ fontSize: '12px', color: isDark ? '#a1a1aa' : '#64748b', margin: '2px 0 0 0' }}>
                Updating cover for: <strong style={{ color: isDark ? '#f4f4f5' : '#0f172a' }}>{event.title}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: isDark ? '#18181b' : '#f8fafc',
              border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
              color: isDark ? '#a1a1aa' : '#64748b',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="cp-modal-body" style={{ background: isDark ? '#141416' : '#ffffff', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Split: Live Card Preview & Custom Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'start' }}>
            {/* Live Slim Card Preview */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#475569', marginBottom: '8px', display: 'block' }}>
                Live Card Preview
              </label>
              <div
                style={{
                  maxWidth: '310px',
                  margin: '0 auto',
                  background: isDark ? '#18181b' : '#ffffff',
                  border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: isDark ? '0 4px 16px -2px rgba(0,0,0,0.5)' : '0 4px 16px -2px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ position: 'relative', height: '180px', background: isDark ? '#141416' : '#f1f5f9', overflow: 'hidden' }}>
                  <img
                    src={selectedUrl}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: '#ffffff', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
                    Preview
                  </div>
                </div>
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: isDark ? '#f4f4f5' : '#09090b', lineHeight: 1.35 }} className="line-clamp-2">
                    {event.title}
                  </h4>
                  <div style={{ background: isDark ? '#141416' : '#f8fafc', border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 10px', fontSize: '11px', color: isDark ? '#a1a1aa' : '#64748b' }}>
                    <div style={{ fontWeight: 600, color: isDark ? '#f4f4f5' : '#0f172a' }}>{event.date || '2026-11-20'} • {event.startTime || '10:00 AM'}</div>
                    <div style={{ marginTop: '2px' }}>{event.venue || 'Campus Auditorium'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inputs: Upload Local File & Paste URL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Option A: Upload from computer or phone */}
              <div style={{ background: isDark ? '#18181b' : '#f8fafc', border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0', borderRadius: '16px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <FolderOpen size={15} style={{ color: '#166534' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#f4f4f5' : '#0f172a' }}>Locate Image on Device (Desktop or Mobile Phone)</span>
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '11.5px', color: isDark ? '#a1a1aa' : '#64748b' }}>
                  Select any photo from your computer hard drive, desktop, or mobile gallery / camera roll.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      background: isDark ? '#141416' : '#ffffff',
                      border: isDark ? '1.5px dashed #38bdf8' : '1.5px dashed #0284c7',
                      color: isDark ? '#38bdf8' : '#0369a1',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}
                  >
                    <Upload size={14} />
                    <span>Browse Device Files / Camera</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <div style={{ fontSize: '11px', color: isDark ? '#a1a1aa' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Laptop size={12} /> Desktop</span>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Smartphone size={12} /> Phone</span>
                  </div>
                </div>
                {uploadError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#ef4444', marginTop: '10px' }}>
                    <AlertCircle size={13} />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              {/* Option B: Direct Image URL */}
              <div style={{ background: isDark ? '#18181b' : '#f8fafc', border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0', borderRadius: '16px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <LinkIcon size={14} style={{ color: '#0284c7' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#f4f4f5' : '#0f172a' }}>Paste Web Image URL</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={customInputUrl}
                    onChange={(e) => setCustomInputUrl(e.target.value)}
                    style={{
                      flex: 1,
                      height: '36px',
                      padding: '0 12px',
                      borderRadius: '10px',
                      border: isDark ? '1px solid #27272a' : '1px solid #cbd5e1',
                      fontSize: '12px',
                      background: isDark ? '#141416' : '#ffffff',
                      color: isDark ? '#f4f4f5' : '#0f172a',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    disabled={!customInputUrl.trim()}
                    style={{
                      padding: '0 14px',
                      height: '36px',
                      borderRadius: '10px',
                      background: isDark ? '#166534' : '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: customInputUrl.trim() ? 'pointer' : 'not-allowed',
                      opacity: customInputUrl.trim() ? 1 : 0.5,
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preset Gallery */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Palette size={14} style={{ color: '#d97706' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#f4f4f5' : '#0f172a' }}>
                  Select from High-Impact Event Presets
                </span>
              </div>
              <span style={{ fontSize: '11.5px', color: isDark ? '#a1a1aa' : '#64748b' }}>
                Click any cover to select
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: '10px',
                maxHeight: '220px',
                overflowY: 'auto',
                padding: '4px',
              }}
            >
              {PRESET_EVENT_COVERS.map((preset, idx) => {
                const isSelected = selectedUrl === preset.url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedUrl(preset.url);
                      setCustomInputUrl('');
                    }}
                    style={{
                      position: 'relative',
                      height: '80px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: isSelected ? '2.5px solid #166534' : (isDark ? '1px solid #27272a' : '1px solid #e2e8f0'),
                      cursor: 'pointer',
                      padding: 0,
                      background: isDark ? '#18181b' : '#f1f5f9',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 0 0 2px rgba(22, 101, 52, 0.4)' : 'none',
                    }}
                    title={preset.title}
                  >
                    <img
                      src={preset.url}
                      alt={preset.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '6px',
                        right: '6px',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        color: '#ffffff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'left',
                      }}
                    >
                      {preset.title}
                    </span>
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#166534',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={11} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className="cp-modal-footer"
          style={{
            background: isDark ? '#141416' : '#ffffff',
            borderTop: isDark ? '1px solid #27272a' : '1px solid #f1f5f9',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedUrl(event.bannerUrl || PRESET_EVENT_COVERS[0].url)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
              background: isDark ? '#18181b' : '#f8fafc',
              color: isDark ? '#a1a1aa' : '#64748b',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={13} />
            <span>Reset to Original</span>
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
                background: isDark ? '#18181b' : '#ffffff',
                color: isDark ? '#d4d4d8' : '#475569',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 20px',
                borderRadius: '10px',
                background: '#166534',
                color: '#ffffff',
                border: '1px solid #15803d',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(22, 101, 52, 0.25)',
              }}
            >
              <Save size={14} />
              <span>{saving ? 'Saving...' : 'Save Card Image'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
