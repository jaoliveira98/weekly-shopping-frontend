import { Link } from "react-router-dom";

export function Header({ title, description }) {
  return (
    <div className="flex">
      <Link to="/meals" className="mr-6">
        ←
      </Link>
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800">{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
}
