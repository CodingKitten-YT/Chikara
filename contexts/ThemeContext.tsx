import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

// Define theme colors
interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  tabIconDefault: string;
  searchBackground: string;
  cardBackground: string;
  exerciseOverlay: string;
  levelBadgeBackground: string;
  levelBadgeText: string;
}

// Theme context type
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  colors: ThemeColors;
}

// Light theme colors
const lightColors: ThemeColors = {
  primary: '#769267',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  tabIconDefault: '#718096',
  searchBackground: '#F7FAFC',
  cardBackground: '#F7FAFC',
  exerciseOverlay: 'rgba(0, 0, 0, 0.4)',
  levelBadgeBackground: 'rgba(255, 255, 255, 0.2)',
  levelBadgeText: '#FFFFFF',
};

// Dark theme colors
const darkColors: ThemeColors = {
  primary: '#86A677',
  background: '#1A1A1A',
  surface: '#2D2D2D',
  text: '#FFFFFF',
  textSecondary: '#A1A1A1',
  border: '#404040',
  tabIconDefault: '#888888',
  searchBackground: '#363636',
  cardBackground: '#2D2D2D',
  exerciseOverlay: 'rgba(0, 0, 0, 0.6)',
  levelBadgeBackground: 'rgba(255, 255, 255, 0.15)',
  levelBadgeText: '#FFFFFF',
};

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark'>(systemColorScheme || 'light');

  // Update theme when system theme changes
  useEffect(() => {
    if (systemColorScheme) {
      setTheme(systemColorScheme);
    }
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}