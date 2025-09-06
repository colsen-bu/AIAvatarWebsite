'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');

  // Once mounted on client, we can show the UI
  useEffect(() => {
    setMounted(true);
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const systemTheme = mediaQuery.matches ? 'dark' : 'light';
    
    // Get stored theme or use system preference
    const storedTheme = localStorage.getItem('theme') as Theme;
    const initialTheme = storedTheme || systemTheme;
    
    setTheme(initialTheme);
    
    // Apply theme immediately without triggering re-render
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');

    // Listen for system theme changes
    const listener = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        // Use requestIdleCallback for non-critical localStorage write
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            localStorage.setItem('theme', newTheme);
          });
        } else {
          setTimeout(() => {
            localStorage.setItem('theme', newTheme);
          }, 0);
        }
      }
    };
    mediaQuery.addEventListener('change', listener);
    
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // Temporarily disable transitions for instant theme change
    document.documentElement.classList.add('theme-transitioning');
    
    // Update DOM immediately for instant visual feedback
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    // Re-enable transitions after a brief delay
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 50);
    });
    
    // Update state
    setTheme(newTheme);
    
    // Defer localStorage write to avoid blocking the transition
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        localStorage.setItem('theme', newTheme);
      });
    } else {
      setTimeout(() => {
        localStorage.setItem('theme', newTheme);
      }, 0);
    }
  };

  // Prevent flash of incorrect theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
} 