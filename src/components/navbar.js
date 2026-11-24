import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md font-bold ${isActive ? 'bg-slate-800 text-white' : 'text-slate-800 hover:bg-slate-200'}`;

function Navbar() {
    return (
        <nav className="flex gap-2 px-6 py-4 bg-slate-100">
            <NavLink to="/" end className={linkClass}>
                Home
            </NavLink>
            <NavLink to="/meals" end className={linkClass}>
                Meals
            </NavLink>
            <NavLink to="/meals/new" className={linkClass}>
                New meal
            </NavLink>
        </nav>
    );
}

export default Navbar;
