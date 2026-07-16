import { Link } from 'react-router-dom';
import { LOCATIONS } from '../data/locations';
import '../styles/LocationSwitcher.css';

interface Props {
  currentLocation: string;
}

export default function LocationSwitcher({ currentLocation }: Props) {
  return (
    <div className="location-switcher">
      {Object.values(LOCATIONS).map((loc) => (
        <Link
          key={loc.id}
          to={`/${loc.id}`}
          className={`location-link ${currentLocation === loc.id ? 'active' : ''}`}
        >
          {loc.label}
        </Link>
      ))}
    </div>
  );
}
