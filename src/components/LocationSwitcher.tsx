import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LOCATIONS, getLocation } from '../data/locations';
import '../styles/LocationSwitcher.css';

interface Props {
  currentLocation: string;
}

export default function LocationSwitcher({ currentLocation }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = getLocation(currentLocation);

  // Cierra el menú al hacer clic fuera o al presionar Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="location-switcher" ref={containerRef}>
      <button
        className="location-current"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="location-pin">📍</span>
        <span className="location-name">{current.label}</span>
        <span className={`location-caret ${open ? 'open' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="location-menu" role="listbox">
          {Object.values(LOCATIONS).map((loc) => (
            <Link
              key={loc.id}
              to={`/${loc.id}`}
              role="option"
              aria-selected={currentLocation === loc.id}
              className={`location-item ${currentLocation === loc.id ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {loc.label}
              {currentLocation === loc.id && <span className="location-check">✓</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
