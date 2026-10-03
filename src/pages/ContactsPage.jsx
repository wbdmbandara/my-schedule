import MobileNavigation from "../components/MobileNavigation";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Users,
  Plus,
  Moon,
  Sun,
  Search,
  Star,
  Phone,
  Mail,
  Pencil,
  Trash2,
  Check,
  UserRound,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../components/ui";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "../components/ui";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui";
import { Toaster, toast } from "sonner";
const groups = {
  client: "Client",
  team: "Team",
  family: "Family",
  friend: "Friend",
  other: "Other",
};
const blank = { name: "", phone: "", email: "", group: "other", note: "" };
const samples = [
  {
    id: "demo-amaya",
    name: "Amaya Perera",
    phone: "+94 77 100 2001",
    email: "amaya@example.com",
    group: "client",
    note: "Weekly check-in on Mondays",
    fav: true,
  },
  {
    id: "demo-kasun",
    name: "Kasun Silva",
    phone: "+94 71 100 2002",
    email: "kasun@example.com",
    group: "team",
    note: "Handles the database side",
    fav: false,
  },
  {
    id: "demo-mum",
    name: "Mum",
    phone: "+94 76 100 2003",
    email: "",
    group: "family",
    note: "",
    fav: true,
  },
  {
    id: "demo-nimali",
    name: "Nimali Fernando",
    phone: "+94 70 100 2004",
    email: "nimali@example.com",
    group: "friend",
    note: "Chess and weekend catch-ups",
    fav: false,
  },
];
const key = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const mins = (s) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
const hhmm = (n) =>
  `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
function validContact(c) {
  if (!c || typeof c !== "object") return false;
  const v = c;
  return (
    typeof v.id === "string" &&
    ["name", "phone", "email", "note"].every((k) => typeof v[k] === "string") &&
    v.group in groups &&
    typeof v.fav === "boolean"
  );
}
export default function Contacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]),
    [ready, setReady] = useState(false),
    [dark, setDark] = useState(false),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false),
    [editId, setEditId] = useState(null),
    [form, setForm] = useState(blank),
    [error, setError] = useState(""),
    [remove, setRemove] = useState(null),
    [storageError, setStorageError] = useState("");
  const [call, setCall] = useState(null),
    [callForm, setCallForm] = useState({
      date: "",
      start: "09:00",
      end: "09:30",
    }),
    [callError, setCallError] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem("myshcedule-contacts");
      const parsed = raw ? JSON.parse(raw) : samples;
      if (!Array.isArray(parsed) || !parsed.every(validContact))
        throw Error("Invalid contact data");
      setContacts(parsed);
      setDark(localStorage.getItem("myshcedule-theme") === "dark");
    } catch {
      setStorageError(
        "Saved contacts could not be loaded. Existing browser data has been kept.",
      );
      return;
    }
    setReady(true);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    if (!ready) return;
    try {
      localStorage.setItem("myshcedule-contacts", JSON.stringify(contacts));
      localStorage.setItem("myshcedule-theme", dark ? "dark" : "light");
    } catch {
      setStorageError(
        "Browser storage is unavailable. Changes will last for this session.",
      );
    }
  }, [contacts, dark, ready]);
  useEffect(() => {
    const context = document.modelContext;
    if (!context) return;
    const lifecycle = new AbortController();
    try {
      context.registerTool(
        {
          name: "start_contact_creation",
          description: "Open the form to add a contact.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false },
          execute: (input) => {
            if (
              !input ||
              typeof input !== "object" ||
              Object.keys(input).length
            )
              throw Error("Expected an empty object");
            setEditId(null);
            setForm(blank);
            setError("");
            setOpen(true);
            return { status: "form_opened" };
          },
        },
        { signal: lifecycle.signal },
      );
    } catch {}
    return () => lifecycle.abort();
  }, []);
  function edit(c) {
    setEditId(c?.id || null);
    setForm(
      c
        ? {
            name: c.name,
            phone: c.phone,
            email: c.email,
            group: c.group,
            note: c.note,
          }
        : blank,
    );
    setError("");
    setOpen(true);
  }
  function save(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Enter a name for this contact.");
      return;
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError("Enter an email address like name@example.com.");
      return;
    }
    const data = {
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      note: form.note.trim(),
    };
    setContacts((cs) =>
      editId
        ? cs.map((c) => (c.id === editId ? { ...c, ...data } : c))
        : [...cs, { ...data, id: crypto.randomUUID(), fav: false }],
    );
    setOpen(false);
    toast.success(editId ? "Contact updated" : "Contact added");
  }
  function planCall(c) {
    const now = new Date();
    let start =
      Math.ceil((now.getHours() * 60 + now.getMinutes() + 1) / 30) * 30;
    if (start + 30 > 1439) {
      now.setDate(now.getDate() + 1);
      start = 540;
    }
    setCallForm({ date: key(now), start: hhmm(start), end: hhmm(start + 30) });
    setCallError("");
    setCall(c);
  }
  function schedule(e) {
    e.preventDefault();
    if (!call) return;
    const { date, start, end } = callForm;
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !start ||
      !end ||
      mins(end) <= mins(start)
    ) {
      setCallError("Choose a date and an end time after the start time.");
      return;
    }
    if (new Date(`${date}T${start}`) < new Date()) {
      setCallError("Choose a future time for your call.");
      return;
    }
    try {
      const data = JSON.parse(
        localStorage.getItem("myshcedule-blocks") || "{}",
      );
      if (
        !data ||
        Array.isArray(data) ||
        typeof data !== "object" ||
        (data[date] && !Array.isArray(data[date]))
      )
        throw Error("Invalid schedule");
      const rows = data[date] || [];
      if (
        rows.some((b) => mins(start) < mins(b.end) && mins(end) > mins(b.start))
      ) {
        setCallError(
          "This time overlaps another schedule block. Choose a free time.",
        );
        return;
      }
      data[date] = [
        ...rows,
        {
          id: crypto.randomUUID(),
          title: `Call ${call.name}`,
          start,
          end,
          type: "meet",
          note: [call.phone, call.note].filter(Boolean).join(" · "),
          done: false,
        },
      ];
      localStorage.setItem("myshcedule-blocks", JSON.stringify(data));
      setCall(null);
      toast.success(`Call with ${call.name} added to your schedule`, {
        action: {
          label: "View schedule",
          onClick: () => {
            navigate(`/?date=${date}`);
          },
        },
      });
    } catch {
      setCallError(
        "Could not save the call. Your browser storage may be unavailable.",
      );
    }
  }
  const rows = contacts
    .filter(
      (c) =>
        (filter === "all" || (filter === "fav" ? c.fav : c.group === filter)) &&
        [c.name, c.phone, c.email, c.note]
          .join(" ")
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const sections = Array.from(
    new Set(rows.map((c) => c.name.charAt(0).toUpperCase())),
  );
  return (
		<div className="app-shell">
			<Toaster
				position="top-center"
				theme={dark ? "dark" : "light"}
				richColors
			/>
			<header className="topbar">
				<Link className="brand" to="/">
					<span className="brand-mark">
						<CalendarDays size={21} />
					</span>
					MY SCHEDULE<span className="brand-dot">.</span>
				</Link>
				<nav className="page-links" aria-label="Main navigation">
					<Link to="/">Schedule</Link>
					<Link to="/contacts" aria-current="page">
						Contacts
					</Link>
					<Link to="/notes">Notes</Link>
				</nav>
				<div className="top-actions">
					<button
						className="icon-button"
						onClick={() => setDark(!dark)}
						aria-label={dark ? "Use light theme" : "Use dark theme"}
					>
						{dark ? <Sun size={20} /> : <Moon size={20} />}
					</button>
					<span className="avatar" aria-label="Dilshan">
						D
					</span>
				</div>
			</header>
			<main className="workspace contacts-workspace">
				<section className="contacts-intro">
					<div>
						<p className="eyebrow">THE PEOPLE IN YOUR EVERYDAY</p>
						<h1>
							Your contacts
							<span className="contact-heading-icon">
								<Users size={28} />
							</span>
						</h1>
						<p className="subtext">
							Keep your people close, and your plans connected.
						</p>
					</div>
					<button
						className="primary-button"
						disabled={!ready}
						onClick={() => edit()}
					>
						<Plus size={18} />
						Add contact
					</button>
				</section>
				<div className="contacts-toolbar">
					<div className="contact-search">
						<Search size={19} />
						<input
							type="search"
							aria-label="Search name, phone, email or note"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search name, phone, email or note"
						/>
					</div>
					<span className="contacts-count" aria-live="polite">
						{contacts.length} saved · {rows.length} shown
					</span>
				</div>
				<div
					className="contact-filters"
					role="group"
					aria-label="Filter contacts"
				>
					{[
						["all", "All contacts"],
						["fav", "Favourites"],
						...Object.entries(groups),
					].map(([k, label]) => (
						<button
							key={k}
							className={`contact-filter ${
								filter === k ? "active" : ""
							}`}
							onClick={() => setFilter(k)}
							aria-pressed={filter === k}
						>
							{k === "fav" && <Star size={14} />} {label}
							{k === "all" && <span>{contacts.length}</span>}
						</button>
					))}
				</div>
				{storageError && (
					<p className="storage-note" role="alert">
						{storageError}
					</p>
				)}
				<section className="contact-list" aria-label="Contacts">
					<div className="contact-list-header">
						<span>
							<Users size={17} />
							{filter === "all"
								? "All contacts"
								: filter === "fav"
								? "Your favourites"
								: `${groups[filter]} contacts`}
						</span>
						<span>NAME A–Z</span>
					</div>
					{rows.length ? (
						sections.map((letter) => (
							<div key={letter}>
								<div className="contact-letter">{letter}</div>
								{rows
									.filter(
										(c) =>
											c.name.charAt(0).toUpperCase() ===
											letter
									)
									.map((c) => (
										<article
											className={`contact-row group-${c.group}`}
											key={c.id}
										>
											<div
												className="contact-avatar"
												aria-hidden="true"
											>
												{c.name
													.split(/\s+/)
													.slice(0, 2)
													.map((n) => n[0])
													.join("")
													.toUpperCase()}
											</div>
											<div className="contact-info">
												<div className="contact-name">
													<h2>{c.name}</h2>
													<span className="contact-tag">
														{groups[c.group]}
													</span>
												</div>
												<div className="contact-details">
													{c.phone && (
														<a
															href={`tel:${c.phone.replace(
																/[^+\d]/g,
																""
															)}`}
														>
															{c.phone}
														</a>
													)}
													{c.email && (
														<a
															href={`mailto:${c.email}`}
														>
															{c.email}
														</a>
													)}
													{!c.phone && !c.email && (
														<span>
															No details yet
														</span>
													)}
												</div>
												{c.note && <p>{c.note}</p>}
											</div>
											<div className="contact-actions">
												{c.phone && (
													<a
														className="contact-action"
														href={`tel:${c.phone.replace(
															/[^+\d]/g,
															""
														)}`}
														aria-label={`Call ${c.name}`}
														title="Call"
													>
														<Phone size={17} />
													</a>
												)}
												{c.email && (
													<a
														className="contact-action"
														href={`mailto:${c.email}`}
														aria-label={`Email ${c.name}`}
														title="Email"
													>
														<Mail size={17} />
													</a>
												)}
												<button
													className="contact-action schedule-call"
													onClick={() => planCall(c)}
													aria-label={`Schedule a call with ${c.name}`}
													title="Schedule a call"
												>
													<CalendarDays size={17} />
													<span>Plan call</span>
												</button>
												<button
													className={`contact-action ${
														c.fav
															? "is-favourite"
															: ""
													}`}
													onClick={() =>
														setContacts((cs) =>
															cs.map((x) =>
																x.id === c.id
																	? {
																			...x,
																			fav: !x.fav,
																	  }
																	: x
															)
														)
													}
													aria-pressed={c.fav}
													aria-label={`${
														c.fav ? "Remove" : "Add"
													} ${c.name} ${
														c.fav ? "from" : "to"
													} favourites`}
													title="Favourite"
												>
													<Star
														size={17}
														fill={
															c.fav
																? "currentColor"
																: "none"
														}
													/>
												</button>
												<button
													className="contact-action"
													onClick={() => edit(c)}
													aria-label={`Edit ${c.name}`}
													title="Edit"
												>
													<Pencil size={17} />
												</button>
												<button
													className="contact-action delete-contact"
													onClick={() => setRemove(c)}
													aria-label={`Delete ${c.name}`}
													title="Delete"
												>
													<Trash2 size={17} />
												</button>
											</div>
										</article>
									))}
							</div>
						))
					) : (
						<div className="empty">
							<UserRound size={36} />
							<h3>
								{query || filter !== "all"
									? "No matching contacts"
									: "Your people belong here"}
							</h3>
							<p>
								{query || filter !== "all"
									? "Try another search or choose a different group."
									: "Add a contact to keep their details handy."}
							</p>
							{query || filter !== "all" ? (
								<button
									className="primary-button"
									onClick={() => {
										setQuery("");
										setFilter("all");
									}}
								>
									Clear filters
								</button>
							) : (
								<button
									className="primary-button"
									disabled={!ready}
									onClick={() => edit()}
								>
									<Plus size={17} />
									Add your first contact
								</button>
							)}
						</div>
					)}
				</section>
				<p className="contact-storage-note">
					{contacts.some((c) => c.id.startsWith("demo-"))
						? "Sample contacts to get you started. "
						: ""}
					Contacts are saved in this browser.
				</p>
				<footer className="desktop-footer">
					A little connection goes a long way.
					<span>MY SCHEDULE.</span>
				</footer>
			</main>
			<MobileNavigation
				onAdd={() => edit()}
				addLabel="Add contact"
				disabled={!ready}
			/>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="add-dialog">
					<DialogTitle>
						{editId ? "Edit contact" : "Add a contact"}
					</DialogTitle>
					<DialogDescription>
						Keep their details and a helpful reminder together.
					</DialogDescription>
					<form onSubmit={save}>
						<label htmlFor="contact-name">Name</label>
						<input
							id="contact-name"
							value={form.name}
							onChange={(e) =>
								setForm({ ...form, name: e.target.value })
							}
							placeholder="Full name"
							maxLength={60}
							autoComplete="name"
							required
						/>
						<div className="contact-form-details">
							<div>
								<label htmlFor="contact-phone">Phone</label>
								<input
									id="contact-phone"
									type="tel"
									value={form.phone}
									onChange={(e) =>
										setForm({
											...form,
											phone: e.target.value,
										})
									}
									placeholder="+94 77 123 4567"
									maxLength={40}
									autoComplete="tel"
								/>
							</div>
							<div>
								<label htmlFor="contact-email">Email</label>
								<input
									id="contact-email"
									type="email"
									value={form.email}
									onChange={(e) =>
										setForm({
											...form,
											email: e.target.value,
										})
									}
									placeholder="name@example.com"
									maxLength={254}
									autoComplete="email"
								/>
							</div>
						</div>
						<label>Group</label>
						<Select
							value={form.group}
							onValueChange={(v) =>
								setForm({ ...form, group: v })
							}
						>
							<SelectTrigger
								className="form-select"
								aria-label="Contact group"
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(groups).map(([k, v]) => (
									<SelectItem key={k} value={k}>
										{v}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<label htmlFor="contact-note">
							Note <span>(optional)</span>
						</label>
						<textarea
							id="contact-note"
							rows={3}
							maxLength={140}
							value={form.note}
							onChange={(e) =>
								setForm({ ...form, note: e.target.value })
							}
							placeholder="e.g. Prefers messages before 6 pm"
						/>
						{error && (
							<p role="alert" className="error">
								{error}
							</p>
						)}
						<div className="form-footer">
							<button
								type="button"
								className="text-button"
								onClick={() => setOpen(false)}
							>
								Cancel
							</button>
							<button type="submit" className="primary-button">
								<Check size={17} />
								Save contact
							</button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
			<AlertDialog
				open={!!remove}
				onOpenChange={(v) => {
					if (!v) setRemove(null);
				}}
			>
				<AlertDialogContent className="add-dialog">
					<AlertDialogTitle>Delete {remove?.name}?</AlertDialogTitle>
					<AlertDialogDescription>
						This contact will be removed from this browser. Existing
						scheduled calls will remain in your schedule.
					</AlertDialogDescription>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="danger-button"
							onClick={() => {
								setContacts((cs) =>
									cs.filter((c) => c.id !== remove?.id)
								);
								setRemove(null);
								toast.success("Contact deleted");
							}}
						>
							Delete contact
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<Dialog
				open={!!call}
				onOpenChange={(v) => {
					if (!v) setCall(null);
				}}
			>
				<DialogContent className="add-dialog">
					<DialogTitle>Plan a call with {call?.name}</DialogTitle>
					<DialogDescription>
						Choose a free time to add this call to your schedule.
					</DialogDescription>
					<form onSubmit={schedule}>
						<label htmlFor="call-date">Date</label>
						<input
							id="call-date"
							type="date"
							required
							min={key(new Date())}
							value={callForm.date}
							onChange={(e) =>
								setCallForm({
									...callForm,
									date: e.target.value,
								})
							}
						/>
						<div className="form-times">
							<div>
								<label htmlFor="call-start">Start time</label>
								<input
									id="call-start"
									type="time"
									required
									value={callForm.start}
									onChange={(e) =>
										setCallForm({
											...callForm,
											start: e.target.value,
										})
									}
								/>
							</div>
							<div>
								<label htmlFor="call-end">End time</label>
								<input
									id="call-end"
									type="time"
									required
									value={callForm.end}
									onChange={(e) =>
										setCallForm({
											...callForm,
											end: e.target.value,
										})
									}
								/>
							</div>
						</div>
						{callError && (
							<p role="alert" className="error">
								{callError}
							</p>
						)}
						<div className="form-footer">
							<button
								type="button"
								className="text-button"
								onClick={() => setCall(null)}
							>
								Cancel
							</button>
							<button type="submit" className="primary-button">
								<CalendarDays size={17} />
								Add to schedule
							</button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
  );
}
