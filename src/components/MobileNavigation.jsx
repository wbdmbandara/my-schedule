import { NavLink } from "react-router-dom";
import { CalendarDays, Users, NotebookPen, Plus } from "lucide-react";

export default function MobileNavigation({
  onAdd,
  addLabel,
  disabled = false,
}) {
  return (
    <nav className="mobile-nav app-navigation" aria-label="Main navigation">
      <NavLink to="/" end>
        <CalendarDays size={21} />
        <span>Schedule</span>
      </NavLink>
      <NavLink to="/contacts">
        <Users size={21} />
        <span>Contacts</span>
      </NavLink>
      <NavLink to="/notes">
        <NotebookPen size={21} />
        <span>Notes</span>
      </NavLink>
      <button onClick={onAdd} disabled={disabled}>
        <Plus size={23} />
        <span>{addLabel}</span>
      </button>
    </nav>
  );
}
