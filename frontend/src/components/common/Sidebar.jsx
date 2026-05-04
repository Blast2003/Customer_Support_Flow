import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `block rounded-lg px-4 py-2 ${isActive ? "bg-slate-900 text-white" : "hover:bg-slate-100"}`;

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r p-4 space-y-2">
      <div className="text-lg font-bold mb-4">CSF</div>
      <NavLink className={linkClass}  to="/dashboard">Dashboard</NavLink>
      <NavLink className={linkClass} to="/tickets">Tickets</NavLink>
      <NavLink className={linkClass} to="/customers">Customers</NavLink>
      <NavLink className={linkClass} to="/kanban">Kanban</NavLink>
      <NavLink className={linkClass} to="/complaints">Complaints</NavLink>
      <NavLink className={linkClass} to="/reports">Reports</NavLink>
    </aside>
  );
}
