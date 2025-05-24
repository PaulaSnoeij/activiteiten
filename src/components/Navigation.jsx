import { Link } from 'react-router-dom';

export const Navigation = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Alle evenementen</Link>
        </li>
      </ul>
    </nav>
  );
};
