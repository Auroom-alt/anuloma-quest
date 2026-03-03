'use client';

import { useState } from 'react';
import { useSettingsStore } from '@/store';
import {
  playBgSound, stopBgSound, setBgVolume,
  playBirds, stopBirds, setBirdsVolume,
  BIRDS_TRACKS,
} from '@/lib/audio';

interface AudioPanelProps {
  locationId: number;
}

export default function AudioPanel({ locationId }: AudioPanelProps) {
  const [open, setOpen] = useState(false);
  const [showTracks, setShowTracks] = useState(false);
  const { settings, updateMusic } = useSettingsStore();
  const { music } = settings;

  function handleToggleBg(enabled: boolean) {
    updateMusic({ musicEnabled: enabled });
    if (enabled) playBgSound(locationId, music.musicVolume / 100);
    else stopBgSound();
  }

  function handleBgVolume(v: number) {
    updateMusic({ musicVolume: v });
    setBgVolume(v / 100);
  }

  function handleToggleBirds(enabled: boolean) {
    updateMusic({ natureSoundsEnabled: enabled });
    if (enabled) playBirds(music.selectedBirdsTrack, music.natureSoundsVolume / 100);
    else stopBirds();
  }

  function handleBirdsVolume(v: number) {
    updateMusic({ natureSoundsVolume: v });
    setBirdsVolume(v / 100);
  }

  function handleSelectTrack(trackId: string) {
    updateMusic({ selectedBirdsTrack: trackId });
    if (music.natureSoundsEnabled) playBirds(trackId, music.natureSoundsVolume / 100);
    setShowTracks(false);
  }

  return (
    <div style={{ position: 'fixed', bottom: '5rem', right: '1rem', zIndex: 50 }}>

      {/* Кнопка открытия */}
      <button
        onClick={() => { setOpen(o => !o); setShowTracks(false); }}
        style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: open ? 'rgba(167,139,250,0.25)' : 'rgba(3,7,18,0.75)',
          border: `1px solid ${open ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.12)'}`,
          backdropFilter: 'blur(12px)',
          cursor: 'pointer', fontSize: '1.1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: open ? '0 0 16px rgba(167,139,250,0.3)' : 'none',
          transition: 'all 0.2s',
          marginLeft: 'auto',
        }}
        title="Звук"
      >
        🎵
      </button>

      {/* Панель */}
      {open && (
        <div style={{
          position: 'absolute', bottom: '52px', right: 0,
          width: '240px',
          background: 'rgba(3,7,18,0.92)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '1.25rem', padding: '1rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>

          <p style={{ color: '#64748B', fontSize: '0.68rem', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
            🎵 ЗВУК ПРАКТИКИ
          </p>

          {/* Музыка локации */}
          <div style={rowStyle}>
            <span style={labelStyle}>🌆 Музыка локации</span>
            <Toggle value={music.musicEnabled} onChange={handleToggleBg} />
          </div>
          {music.musicEnabled && (
            <div style={{ marginBottom: '0.75rem' }}>
              <input type="range" min={0} max={100} value={music.musicVolume}
                onChange={e => handleBgVolume(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#A78BFA', marginTop: '0.25rem' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{ color: '#475569', fontSize: '0.65rem' }}>{music.musicVolume}%</span>
              </div>
            </div>
          )}

          <div style={dividerStyle} />

          {/* Звуки природы */}
          <div style={rowStyle}>
            <span style={labelStyle}>🌿 Звуки природы</span>
            <Toggle value={music.natureSoundsEnabled} onChange={handleToggleBirds} />
          </div>
          {music.natureSoundsEnabled && (
            <>
              <div style={{ marginBottom: '0.5rem' }}>
                <input type="range" min={0} max={100} value={music.natureSoundsVolume}
                  onChange={e => handleBirdsVolume(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#34D399', marginTop: '0.25rem' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ color: '#475569', fontSize: '0.65rem' }}>{music.natureSoundsVolume}%</span>
                </div>
              </div>

              {/* Текущий трек + кнопка смены */}
              <button
                onClick={() => setShowTracks(t => !t)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.6rem', padding: '0.4rem 0.6rem',
                  color: '#64748B', fontSize: '0.72rem', cursor: 'pointer',
                  textAlign: 'left', marginBottom: '0.5rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <span style={{ color: '#94A3B8' }}>
                  {BIRDS_TRACKS.find(t => t.id === music.selectedBirdsTrack)?.label ?? '🐦 Трек'}
                </span>
                <span style={{ color: '#475569' }}>{showTracks ? '▲' : '▼'}</span>
              </button>

              {/* Список треков */}
              {showTracks && (
                <div style={{
                  maxHeight: '180px', overflowY: 'auto',
                  display: 'flex', flexDirection: 'column', gap: '2px',
                  marginBottom: '0.25rem',
                }}>
                  {BIRDS_TRACKS.map((track: any) => {
                    const active = music.selectedBirdsTrack === track.id;
                    return (
                      <div key={track.id} onClick={() => handleSelectTrack(track.id)}
                        style={{
                          padding: '0.4rem 0.6rem', borderRadius: '0.5rem', cursor: 'pointer',
                          background: active ? 'rgba(167,139,250,0.15)' : 'transparent',
                          border: active ? '1px solid rgba(167,139,250,0.3)' : '1px solid transparent',
                          color: active ? '#A78BFA' : '#64748B',
                          fontSize: '0.72rem', transition: 'all 0.15s',
                          display: 'flex', justifyContent: 'space-between',
                        }}
                      >
                        {track.label}
                        {active && <span style={{ fontSize: '0.6rem' }}>▶</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width: '36px', height: '20px', borderRadius: '10px', flexShrink: 0,
      background: value ? '#A78BFA' : 'rgba(255,255,255,0.1)',
      position: 'relative', cursor: 'pointer', transition: 'background 0.3s',
    }}>
      <div style={{
        position: 'absolute', top: '2px', left: value ? '18px' : '2px',
        width: '16px', height: '16px', borderRadius: '50%',
        background: '#fff', transition: 'left 0.3s',
      }} />
    </div>
  );
}

const rowStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between',
  alignItems: 'center', marginBottom: '0.5rem',
};
const labelStyle: React.CSSProperties = {
  color: '#94A3B8', fontSize: '0.78rem',
};
const dividerStyle: React.CSSProperties = {
  borderTop: '1px solid rgba(255,255,255,0.06)',
  margin: '0.6rem 0',
};