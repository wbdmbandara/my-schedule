import MobileNavigation from "../components/MobileNavigation";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Plus,
  Moon,
  Sun,
  Check,
  Coffee,
  Code2,
  Video,
  ListChecks,
  Sparkles,
  RotateCcw,
  Play,
  Pause,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Target,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../components/ui";
import { Checkbox } from "../components/ui";
import { Switch } from "../components/ui";
import { Progress } from "../components/ui";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui";
const types = {
  focus: { label: "Focus work", icon: Code2 },
  meet: { label: "Meeting", icon: Video },
  break: { label: "Break", icon: Coffee },
  admin: { label: "Admin", icon: ListChecks },
  me: { label: "Personal", icon: Sparkles },
};
const dateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const minutes = (s) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
const time = (s) => {
  const h = Number(s.slice(0, 2));
  return `${h % 12 || 12}:${s.slice(3)} ${h < 12 ? "AM" : "PM"}`;
};
const duration = (m) =>
  m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}` : `${m}m`;
const seed = () =>
  [
    [
      "Plan the day",
      "08:30",
      "08:45",
      "admin",
      "Set priorities and clear your inbox",
    ],
    [
      "Build a new feature",
      "09:00",
      "11:00",
      "focus",
      "myshcedule · Home page UI",
    ],
    [
      "A little screen break",
      "11:00",
      "11:20",
      "break",
      "Stretch, walk, and drink some water",
    ],
    [
      "Project catch-up",
      "11:30",
      "12:15",
      "meet",
      "Discuss progress and next steps",
    ],
    [
      "Lunch & recharge",
      "12:30",
      "13:15",
      "break",
      "Make some time away from your desk",
    ],
    [
      "Debug and test",
      "14:00",
      "16:00",
      "focus",
      "Review the code and test on mobile",
    ],
    [
      "Wrap up the day",
      "16:15",
      "17:00",
      "admin",
      "Commit your changes and plan tomorrow",
    ],
    [
      "Chess & personal time",
      "18:00",
      "19:00",
      "me",
      "A little time for yourself",
    ],
  ].map(([title, start, end, type, note], i) => ({
    id: `sample-${i}`,
    title,
    start,
    end,
    type: type,
    note,
    done: false,
  }));
export default function Home() {
  const [now, setNow] = useState(null),
    [selected, setSelected] = useState(""),
    [weekOffset, setWeekOffset] = useState(0);
  const [store, setStore] = useState({}),
    [ready, setReady] = useState(false),
    [dark, setDark] = useState(false),
    [focus, setFocus] = useState(false),
    [open, setOpen] = useState(false);
  const [length, setLength] = useState("25"),
    [left, setLeft] = useState(1500),
    [deadline, setDeadline] = useState(null),
    [timerMessage, setTimerMessage] = useState("");
  const [form, setForm] = useState({
      title: "",
      start: "09:00",
      end: "10:00",
      type: "focus",
      note: "",
    }),
    [error, setError] = useState(""),
    [storageMessage, setStorageMessage] = useState("");
  useEffect(() => {
    const d = new Date();
    setNow(d);
    const requested = new URLSearchParams(window.location.search).get("date");
    const chosen =
      requested &&
      /^\d{4}-\d{2}-\d{2}$/.test(requested) &&
      !isNaN(new Date(requested + "T00:00:00").getTime())
        ? requested
        : dateKey(d);
    setSelected(chosen);
    const mon = new Date(d);
    mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    mon.setHours(0, 0, 0, 0);
    const target = new Date(chosen + "T00:00:00");
    setWeekOffset(
      Math.floor((target.getTime() - mon.getTime()) / (7 * 86400000)),
    );
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem("myshcedule-blocks") || "{}");
      if (!saved || Array.isArray(saved) || typeof saved !== "object")
        saved = {};
      setDark(localStorage.getItem("myshcedule-theme") === "dark");
    } catch {}
    if (!saved[dateKey(d)]) saved[dateKey(d)] = seed();
    setStore(saved);
    setReady(true);
    const id = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("myshcedule-blocks", JSON.stringify(store));
      localStorage.setItem("myshcedule-theme", dark ? "dark" : "light");
    } catch {
      setStorageMessage(
        "Browser storage is unavailable. Changes will last for this session.",
      );
    }
    document.documentElement.classList.toggle("dark", dark);
  }, [store, dark, ready]);
  useEffect(() => {
    if (!deadline) return;
    const tick = () => {
      const n = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setLeft(n);
      if (n === 0) {
        setDeadline(null);
        setTimerMessage(
          length === "5"
            ? "Break finished. Ready for your next block?"
            : "Focus session complete. Take a little break.",
        );
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [deadline, length]);
  useEffect(() => {
    const context = document.modelContext;
    if (!context) return;
    const controller = new AbortController();
    try {
      context.registerTool(
        {
          name: "start_block_creation",
          description: "Open the add schedule block form for the selected day.",
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
            setOpen(true);
            return { status: "form_opened" };
          },
        },
        { signal: controller.signal },
      );
    } catch {}
    return () => controller.abort();
  }, []);
  const today = now ? dateKey(now) : "",
    isToday = selected === today;
  const base = now ? new Date(now) : null;
  if (base) {
    base.setDate(base.getDate() - ((base.getDay() + 6) % 7) + weekOffset * 7);
  }
  const days = base
    ? Array.from({ length: 7 }, (_, i) => {
        const d = new Date(base);
        d.setDate(d.getDate() + i);
        return d;
      })
    : [];
  const blocks = (store[selected] || [])
    .slice()
    .sort((a, b) => minutes(a.start) - minutes(b.start));
  const nm = now ? now.getHours() * 60 + now.getMinutes() : 0;
  const current = isToday
    ? blocks.find(
        (b) => !b.done && minutes(b.start) <= nm && minutes(b.end) > nm,
      )
    : undefined;
  const next = isToday
    ? blocks.find((b) => !b.done && minutes(b.start) > nm)
    : blocks.find((b) => !b.done);
  const featured = current || next,
    done = blocks.filter((b) => b.done).length,
    focusMinutes = blocks
      .filter((b) => b.type === "focus")
      .reduce((sum, b) => sum + minutes(b.end) - minutes(b.start), 0);
  const selectedDate = selected ? new Date(selected + "T00:00:00") : null;
  function update(id, complete) {
    setStore((s) => ({
      ...s,
      [selected]: (s[selected] || []).map((b) =>
        b.id === id ? { ...b, done: complete } : b,
      ),
    }));
  }
  function add(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Give your block a title.");
      return;
    }
    if (!form.start || !form.end || minutes(form.end) <= minutes(form.start)) {
      setError("Choose an end time after the start time.");
      return;
    }
    if (
      blocks.some(
        (b) =>
          minutes(form.start) < minutes(b.end) &&
          minutes(form.end) > minutes(b.start),
      )
    ) {
      setError("This overlaps another block. Please choose a free time.");
      return;
    }
    setStore((s) => ({
      ...s,
      [selected]: [
        ...(s[selected] || []),
        {
          ...form,
          title: form.title.trim(),
          id: crypto.randomUUID(),
          done: false,
        },
      ],
    }));
    setOpen(false);
    setForm({
      title: "",
      start: "09:00",
      end: "10:00",
      type: "focus",
      note: "",
    });
    setError("");
  }
  function reset() {
    setDeadline(null);
    setLeft(Number(length) * 60);
    setTimerMessage("");
  }
  function exportSchedule() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(store, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "myshcedule.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-mark">
            <CalendarDays size={21} />
          </span>
          MY SCHEDULE<span className="brand-dot">.</span>
        </a>
        <nav className="page-links" aria-label="Main navigation">
          <Link to="/" aria-current="page">
            Schedule
          </Link>
          <Link to="/contacts">Contacts</Link>
          <Link to="/notes">Notes</Link>
        </nav>
        <div className="top-actions">
          <button
            className="icon-button"
            onClick={exportSchedule}
            aria-label="Download schedule"
          >
            <Download size={20} />
          </button>
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
      <main className="workspace">
        <section className="intro">
          <div>
            <p className="eyebrow">LET’S MAKE ROOM FOR WHAT MATTERS</p>
            <h1>
              Good{" "}
              {now
                ? now.getHours() < 12
                  ? "morning"
                  : now.getHours() < 18
                    ? "afternoon"
                    : "evening"
                : "day"}
              , Dilshan{" "}
              <span className="greeting-sun">
                <Sun />
              </span>
            </h1>
            <p className="subtext">
              A fresh day. A clear plan. One block at a time.
            </p>
          </div>
          <span className="date-label">
            <CalendarDays size={17} />
            {now?.toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            }) || "Your daily schedule"}
          </span>
        </section>
        <section className="week-strip" aria-label="Choose a day">
          <div className="week-heading">
            <span>
              {base?.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              }) || "This week"}
            </span>
            <div>
              <button
                className="text-button"
                onClick={() => {
                  setWeekOffset(0);
                  setSelected(today);
                }}
              >
                Today
              </button>
              <button
                className="icon-button"
                aria-label="Previous week"
                onClick={() => setWeekOffset((n) => n - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="icon-button"
                aria-label="Next week"
                onClick={() => setWeekOffset((n) => n + 1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="days">
            {days.map((d) => (
              <button
                key={dateKey(d)}
                className={`day ${selected === dateKey(d) ? "selected" : ""}`}
                onClick={() => setSelected(dateKey(d))}
                aria-pressed={selected === dateKey(d)}
              >
                <span>
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <strong>{d.getDate()}</strong>
                <i className={dateKey(d) === today ? "today-dot" : ""} />
              </button>
            ))}
          </div>
        </section>
        {storageMessage && (
          <p role="status" className="storage-note">
            {storageMessage}
          </p>
        )}
        <div className="dashboard">
          <aside className="overview">
            <section className="next-card">
              <div className="next-label">
                <span className="light-icon">
                  <Clock3 size={17} />
                </span>
                {current
                  ? "HAPPENING NOW"
                  : isToday
                    ? "UP NEXT"
                    : "ON YOUR SCHEDULE"}
                <span className="mini-label">
                  {featured ? types[featured.type].label : "All clear"}
                </span>
              </div>
              <h2>
                {featured?.title ||
                  (blocks.length
                    ? "You’re all done!"
                    : "A little room to breathe")}
              </h2>
              <p>
                {featured
                  ? `${time(featured.start)} – ${time(featured.end)}`
                  : "Add a block and make a plan for your day."}
              </p>
              {featured ? (
                <div className="next-footer">
                  <span>
                    {current
                      ? `${duration(minutes(current.end) - nm)} remaining`
                      : isToday
                        ? `Starts in ${duration(Math.max(0, minutes(featured.start) - nm))}`
                        : `${duration(minutes(featured.end) - minutes(featured.start))} planned`}
                  </span>
                  <span className="next-symbol">
                    <Code2 size={24} />
                  </span>
                </div>
              ) : (
                <button className="light-button" onClick={() => setOpen(true)}>
                  Plan a block <Plus size={17} />
                </button>
              )}
              {current && (
                <Progress
                  className="current-progress"
                  value={
                    ((nm - minutes(current.start)) /
                      (minutes(current.end) - minutes(current.start))) *
                    100
                  }
                />
              )}
            </section>
            <section id="focus" className="panel timer-card">
              <div className="section-label">
                <span className="icon-title">
                  <Target size={18} />
                  Focus timer
                </span>
                <Select
                  value={length}
                  onValueChange={(v) => {
                    setLength(v);
                    setDeadline(null);
                    setLeft(Number(v) * 60);
                    setTimerMessage("");
                  }}
                >
                  <SelectTrigger
                    className="timer-select"
                    aria-label="Timer duration"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 min</SelectItem>
                    <SelectItem value="50">50 min</SelectItem>
                    <SelectItem value="5">5 min break</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className={`timer-face ${deadline ? "running" : ""}`}>
                <div>
                  <span className="timer-digits" role="timer">
                    {String(Math.floor(left / 60)).padStart(2, "0")}
                    <span>:</span>
                    {String(left % 60).padStart(2, "0")}
                  </span>
                  <p>
                    {length === "5"
                      ? "TIME TO RECHARGE"
                      : deadline
                        ? "YOU’VE GOT THIS"
                        : "TIME TO FOCUS"}
                  </p>
                </div>
              </div>
              <div className="timer-controls">
                <button
                  className="primary-button"
                  onClick={() => {
                    setTimerMessage("");
                    if (deadline) setDeadline(null);
                    else {
                      const seconds = left || Number(length) * 60;
                      setLeft(seconds);
                      setDeadline(Date.now() + seconds * 1000);
                    }
                  }}
                >
                  {deadline ? <Pause size={16} /> : <Play size={16} />}{" "}
                  {deadline
                    ? "Pause session"
                    : left === Number(length) * 60 || left === 0
                      ? "Start session"
                      : "Resume session"}
                </button>
                <button
                  className="reset-button"
                  onClick={reset}
                  aria-label="Reset timer"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
              <p className="timer-note" role="status">
                {timerMessage ||
                  "One task. No distractions. You’re in control."}
              </p>
            </section>
            <section id="progress" className="panel stats-card">
              <div className="section-label">
                <span className="icon-title">
                  <ListChecks size={18} />
                  Your daily progress
                </span>
              </div>
              <div className="stats">
                <div>
                  <strong>{duration(focusMinutes)}</strong>
                  <span>Focus planned</span>
                </div>
                <div>
                  <strong>
                    {done}
                    <small> / {blocks.length}</small>
                  </strong>
                  <span>Blocks completed</span>
                </div>
              </div>
              <Progress
                aria-label="Completed schedule blocks"
                value={blocks.length ? (done / blocks.length) * 100 : 0}
              />
              <p>
                {done === blocks.length && blocks.length
                  ? "All done. Enjoy some time for yourself."
                  : done
                    ? "Keep going, one small win at a time."
                    : "Every small step counts."}
              </p>
            </section>
            <section className="focus-setting">
              <div>
                <span className="icon-title">
                  <Sparkles size={17} />
                  Focus view
                </span>
                <p>Keep your focus blocks in the spotlight.</p>
              </div>
              <Switch
                checked={focus}
                onCheckedChange={setFocus}
                aria-label="Enable focus view"
              />
            </section>
          </aside>
          <section id="schedule" className="schedule">
            <div className="schedule-heading">
              <div>
                <h2>
                  {isToday
                    ? "Today’s schedule"
                    : `${selectedDate?.toLocaleDateString("en-US", { weekday: "long" }) || "Your"}’s schedule`}
                </h2>
                <p>
                  {blocks.length} blocks ·{" "}
                  {duration(
                    blocks.reduce(
                      (s, b) => s + minutes(b.end) - minutes(b.start),
                      0,
                    ),
                  )}{" "}
                  planned
                </p>
              </div>
              <button
                className="primary-button add-button"
                onClick={() => {
                  setError("");
                  setOpen(true);
                }}
              >
                <Plus size={19} />
                <span>Add block</span>
              </button>
            </div>
            <div className="timeline">
              {!blocks.length ? (
                <div className="empty">
                  <CalendarDays size={36} />
                  <h3>Your day is a blank canvas</h3>
                  <p>Add your first block to get started.</p>
                  <button
                    className="primary-button"
                    onClick={() => setOpen(true)}
                  >
                    <Plus size={17} />
                    Add a block
                  </button>
                </div>
              ) : (
                blocks.map((b) => {
                  const Icon = types[b.type].icon;
                  return (
                    <article
                      key={b.id}
                      className={`block ${b.type} ${b.done ? "done" : ""} ${current?.id === b.id ? "happening" : ""} ${focus && b.type !== "focus" && current?.id !== b.id ? "faded" : ""}`}
                    >
                      <div className="block-time">
                        <strong>{time(b.start).split(" ")[0]}</strong>
                        <span>{time(b.start).split(" ")[1]}</span>
                      </div>
                      <div className="timeline-track">
                        <span className="timeline-dot" />
                      </div>
                      <div className="block-card">
                        <div className="block-top">
                          <span className="block-category">
                            <Icon size={14} />
                            {types[b.type].label}
                          </span>
                          <span className="block-duration">
                            {duration(minutes(b.end) - minutes(b.start))}
                          </span>
                        </div>
                        <div className="block-title-row">
                          <h3>{b.title}</h3>
                          <Checkbox
                            className="block-checkbox"
                            checked={b.done}
                            onCheckedChange={(v) => update(b.id, v === true)}
                            aria-label={`Mark ${b.title} complete`}
                          />
                        </div>
                        <p className="block-note">{b.note}</p>
                        <div className="block-bottom">
                          <span>
                            {time(b.start)} – {time(b.end)}
                            {current?.id === b.id && (
                              <b className="now-badge">Now</b>
                            )}
                            {b.done && (
                              <b className="done-badge">
                                <Check size={12} />
                                Done
                              </b>
                            )}
                          </span>
                          <button
                            className="delete-button"
                            onClick={() =>
                              setStore((s) => ({
                                ...s,
                                [selected]: (s[selected] || []).filter(
                                  (x) => x.id !== b.id,
                                ),
                              }))
                            }
                            aria-label={`Delete ${b.title}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
            <p className="end-note">
              <span /> A little structure. A lot of possibility. <span />
            </p>
          </section>
        </div>
        <footer className="desktop-footer">
          Made for your everyday rhythm.<span>MY SCHEDULE.</span>
        </footer>
      </main>
      <MobileNavigation onAdd={() => setOpen(true)} addLabel="Add block" />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="add-dialog">
          <DialogTitle>Add a schedule block</DialogTitle>
          <DialogDescription>
            Make time for what matters on{" "}
            {selectedDate?.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
            .
          </DialogDescription>
          <form onSubmit={add}>
            <label htmlFor="title">What are you planning?</label>
            <input
              id="title"
              maxLength={60}
              placeholder="e.g. Build my React home page"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <div className="form-times">
              <div>
                <label htmlFor="start">Start time</label>
                <input
                  id="start"
                  type="time"
                  value={form.start}
                  onChange={(e) => setForm({ ...form, start: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="end">End time</label>
                <input
                  id="end"
                  type="time"
                  value={form.end}
                  onChange={(e) => setForm({ ...form, end: e.target.value })}
                  required
                />
              </div>
            </div>
            <label>Block type</label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm({ ...form, type: v })}
            >
              <SelectTrigger className="form-select" aria-label="Block type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(types).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label htmlFor="note">
              Note <span>(optional)</span>
            </label>
            <input
              id="note"
              maxLength={120}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="A reminder, project, or detail"
            />
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
              <button className="primary-button" type="submit">
                <Plus size={17} />
                Save block
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
