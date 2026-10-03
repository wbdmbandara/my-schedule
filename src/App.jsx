import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import SchedulePage from "./pages/SchedulePage";
import ContactsPage from "./pages/ContactsPage";
import "./App.css";

function RouteEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    document.title = pathname === "/contacts" ? "Contacts · myshcedule" : "myshcedule · Your daily rhythm";
    const frame = requestAnimationFrame(() => {
      if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
      else window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteEffects />
      <Routes>
        <Route path="/" element={<SchedulePage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="*" element={<SchedulePage />} />
      </Routes>
    </BrowserRouter>
  );
}
