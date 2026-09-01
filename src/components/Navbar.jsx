import { NavLink } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/events', label: 'Events' },
  { to: '/team', label: 'Our Team' },
  { to: '/blogs', label: 'Blogs' },
];

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full bg-black/60 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo / Brand */}
        <NavLink
          to="/"
          className="text-xl font-bold text-white tracking-tight hover:text-blue-400 transition-colors duration-200"
        >
          MechE<span className="text-blue-400">-SA</span>
        </NavLink>

        {/* Nav Links */}
        <ul className="flex items-center gap-8">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-blue-400 border-b-2 border-blue-400 pb-0.5'
                      : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
