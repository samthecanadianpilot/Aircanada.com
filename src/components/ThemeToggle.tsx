'use client';

import { useEffect, useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const saved = localStorage.getItem('theme');
      const isDark = saved === 'dark';
      setDark(isDark);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
      {dark ? <FaSun /> : <FaMoon />}
    </button>
  );
}
