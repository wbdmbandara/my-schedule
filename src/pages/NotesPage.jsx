import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  NotebookPen,
  Plus,
  Search,
  Pin,
  Pencil,
  Trash2,
  Moon,
  Sun,
  Check,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  Switch,
} from "../components/ui";
import MobileNavigation from "../components/MobileNavigation";

const STORAGE_KEY = "myshcedule-notes";
const emptyForm = { title: "", body: "", pinned: false };
function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const notes = raw === null ? [] : JSON.parse(raw);
    if (
      !Array.isArray(notes) ||
      !notes.every(
        (n) =>
          n &&
          typeof n.id === "string" &&
          typeof n.title === "string" &&
          typeof n.body === "string" &&
          typeof n.pinned === "boolean" &&
          Number.isFinite(Date.parse(n.createdAt)) &&
          Number.isFinite(Date.parse(n.updatedAt)),
      ) ||
      new Set(notes.map((n) => n.id)).size !== notes.length
    )
      throw Error("Invalid notes");
    return { notes, error: "" };
  } catch {
    return {
      notes: [],
      error:
        "Saved notes could not be loaded. Existing browser data has been kept. Editing is disabled to protect it.",
    };
  }
}
function loadTheme() {
  try {
    return localStorage.getItem("myshcedule-theme") === "dark";
  } catch {
    return false;
  }
}
const formatDate = (date) =>
  new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function NotesPage() {
  const [initial] = useState(loadNotes);
  const [notes, setNotes] = useState(initial.notes);
  const [storageError, setStorageError] = useState(initial.error);
  const [dark, setDark] = useState(loadTheme);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [remove, setRemove] = useState(null);
  const writable = !initial.error;
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  function changeTheme() {
    const next = !dark;
    setDark(next);
    try {
      localStorage.setItem("myshcedule-theme", next ? "dark" : "light");
    } catch {
      toast.error("Theme preference could not be saved.");
    }
  }
  function persist(next) {
    if (!writable) return false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setNotes(next);
      setStorageError("");
      return true;
    } catch {
      setStorageError(
        "Notes could not be saved. Browser storage may be full or unavailable. Your previous notes are unchanged.",
      );
      return false;
    }
  }
  function edit(note) {
    setEditId(note?.id ?? null);
    setForm(
      note
        ? { title: note.title, body: note.body, pinned: note.pinned }
        : emptyForm,
    );
    setError("");
    setOpen(true);
  }
  function save(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Give your note a title.");
      return;
    }
    const timestamp = new Date().toISOString();
    const data = {
      title: form.title.trim(),
      body: form.body,
      pinned: form.pinned,
      updatedAt: timestamp,
    };
    const next = editId
      ? notes.map((note) => (note.id === editId ? { ...note, ...data } : note))
      : [...notes, { ...data, id: crypto.randomUUID(), createdAt: timestamp }];
    if (!persist(next)) {
      setError("Could not save your note. Keep the editor open and try again.");
      return;
    }
    setOpen(false);
    toast.success(editId ? "Note updated" : "Note added");
  }
  function togglePin(note) {
    if (
      persist(
        notes.map((n) => (n.id === note.id ? { ...n, pinned: !n.pinned } : n)),
      )
    )
      toast.success(note.pinned ? "Note unpinned" : "Note pinned");
  }
  function deleteNote() {
    if (!remove) return;
    if (persist(notes.filter((note) => note.id !== remove.id)))
      toast.success("Note deleted");
    setRemove(null);
  }
  const search = query.trim().toLowerCase();
  const visible = notes
    .filter(
      (note) =>
        (filter === "all" || note.pinned) &&
        `${note.title}\n${note.body}`.toLowerCase().includes(search),
    )
    .sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) ||
        Date.parse(b.updatedAt) - Date.parse(a.updatedAt) ||
        a.id.localeCompare(b.id),
    );
  const pinnedCount = notes.filter((note) => note.pinned).length;

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
          myshcedule<span className="brand-dot">.</span>
        </Link>
        <nav className="page-links" aria-label="Main navigation">
          <Link to="/">Schedule</Link>
          <Link to="/contacts">Contacts</Link>
          <Link to="/notes" aria-current="page">
            Notes
          </Link>
        </nav>
        <div className="top-actions">
          <button
            className="icon-button"
            onClick={changeTheme}
            aria-label={dark ? "Use light theme" : "Use dark theme"}
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <span className="avatar" aria-label="Dilshan">
            D
          </span>
        </div>
      </header>
      <main className="workspace notes-workspace">
        <section className="contacts-intro">
          <div>
            <p className="eyebrow">A PLACE FOR YOUR THOUGHTS</p>
            <h1>
              Your notes
              <span className="contact-heading-icon">
                <NotebookPen size={28} />
              </span>
            </h1>
            <p className="subtext">
              Keep an idea, a reminder, or a little inspiration.
            </p>
          </div>
          <button
            className="primary-button"
            disabled={!writable}
            onClick={() => edit()}
          >
            <Plus size={18} />
            Add note
          </button>
        </section>
        <div className="contacts-toolbar">
          <div className="contact-search">
            <Search size={19} />
            <input
              type="search"
              aria-label="Search note titles and content"
              placeholder="Search your notes"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <span className="contacts-count" aria-live="polite">
            {notes.length} saved · {visible.length} shown
          </span>
        </div>
        <div className="contact-filters" role="group" aria-label="Filter notes">
          <button
            className={`contact-filter ${filter === "all" ? "active" : ""}`}
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All notes <span>{notes.length}</span>
          </button>
          <button
            className={`contact-filter ${filter === "pinned" ? "active" : ""}`}
            aria-pressed={filter === "pinned"}
            onClick={() => setFilter("pinned")}
          >
            <Pin size={14} />
            Pinned <span>{pinnedCount}</span>
          </button>
        </div>
        {storageError && (
          <p className="notes-storage-error" role="alert">
            {storageError}
          </p>
        )}
        {visible.length ? (
          <section className="notes-grid" aria-label="Saved notes">
            {visible.map((note) => (
              <article
                key={note.id}
                className={`note-card ${note.pinned ? "note-pinned" : ""}`}
              >
                <div className="note-card-top">
                  <span className="note-status">
                    {note.pinned ? (
                      <>
                        <Pin size={13} />
                        Pinned
                      </>
                    ) : (
                      <>
                        <NotebookPen size={14} />
                        Note
                      </>
                    )}
                  </span>
                  <button
                    className={`icon-button note-pin ${note.pinned ? "is-pinned" : ""}`}
                    onClick={() => togglePin(note)}
                    disabled={!writable}
                    aria-pressed={note.pinned}
                    aria-label={`${note.pinned ? "Unpin" : "Pin"} ${note.title}`}
                  >
                    <Pin
                      size={17}
                      fill={note.pinned ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                <h2>
                  <button
                    className="note-title-button"
                    onClick={() => edit(note)}
                    disabled={!writable}
                    aria-label={`Open ${note.title}`}
                  >
                    {note.title}
                  </button>
                </h2>
                <p
                  className={`note-preview ${!note.body.trim() ? "note-empty-body" : ""}`}
                >
                  {note.body.trim() ? note.body : "No additional details."}
                </p>
                <div className="note-card-bottom">
                  <time
                    dateTime={note.updatedAt}
                    title={`Updated ${new Date(note.updatedAt).toLocaleString()}`}
                  >
                    Updated {formatDate(note.updatedAt)}
                  </time>
                  <div>
                    <button
                      className="contact-action"
                      onClick={() => edit(note)}
                      disabled={!writable}
                      aria-label={`Edit ${note.title}`}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="contact-action delete-contact"
                      onClick={() => setRemove(note)}
                      disabled={!writable}
                      aria-label={`Delete ${note.title}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="empty notes-empty">
            <NotebookPen size={38} />
            <h2>
              {query || filter !== "all"
                ? "No matching notes"
                : "Start with a thought"}
            </h2>
            <p>
              {query || filter !== "all"
                ? "Try another search, or view all your notes."
                : "Save your ideas, study notes, and project reminders here."}
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
                disabled={!writable}
                onClick={() => edit()}
              >
                <Plus size={17} />
                Write your first note
              </button>
            )}
          </section>
        )}
        <p className="contact-storage-note">Notes are saved in this browser.</p>
        <footer className="desktop-footer">
          Make room for your next idea.<span>myshcedule.</span>
        </footer>
      </main>
      <MobileNavigation
        onAdd={() => edit()}
        addLabel="Add note"
        disabled={!writable}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="add-dialog note-editor">
          <DialogTitle>{editId ? "Edit note" : "Write a note"}</DialogTitle>
          <DialogDescription>
            Save your thoughts so you can come back to them.
          </DialogDescription>
          <form onSubmit={save}>
            <label htmlFor="note-title">Title</label>
            <input
              id="note-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={100}
              placeholder="e.g. Ideas for my next project"
              required
            />
            <label htmlFor="note-body">Your note</label>
            <textarea
              id="note-body"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              maxLength={20000}
              rows={9}
              placeholder="Write anything you want to remember…"
            />
            <div className="note-editor-options">
              <label htmlFor="note-pinned">
                <Pin size={16} />
                Pin this note
              </label>
              <Switch
                id="note-pinned"
                checked={form.pinned}
                onCheckedChange={(pinned) => setForm({ ...form, pinned })}
              />
            </div>
            <p className="note-character-count">
              {form.body.length.toLocaleString()} / 20,000 characters
            </p>
            {error && (
              <p className="error" role="alert">
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
                Save note
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!remove}
        onOpenChange={(value) => {
          if (!value) setRemove(null);
        }}
      >
        <AlertDialogContent className="add-dialog">
          <AlertDialogTitle>Delete “{remove?.title}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This note will be removed from this browser. This action cannot be
            undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="danger-button" onClick={deleteNote}>
              Delete note
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
