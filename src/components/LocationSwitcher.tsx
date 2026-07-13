import { Link } from 'react-router-dom';
import '../styles/LocationSwitcher.css';

interface Props {
  currentLocation: string;
}

export default function LocationSwitcher({ currentLocation }: Props) {
  return (
    <div className="location-switcher">
      <Link
        to="/santo-domingo"
        className={`location-link ${currentLocation === 'santo-domingo' ? 'active' : ''}`}
      >
        Santo Domingo
      </Link>
      <Link
        to="/puerto-plata"
        className={`location-link ${currentLocation === 'puerto-plata' ? 'active' : ''}`}
      >
        Puerto Plata
      </Link>
    </div>
  );
}
