import React, { useEffect } from 'react';
import { ReceptionistSettings } from '../types';

interface ThemeProviderProps {
  settings: ReceptionistSettings;
  children: React.ReactNode;
}

/**
 * ThemeProvider injects CSS custom properties based on branding settings.
 * Updates the existing CSS variables defined in index.html:
 * --primary-accent: Primary brand color (default: #00FFC8)
 * --primary-accent-rgb: RGB values for opacity variants
 */
const ThemeProvider: React.FC<ThemeProviderProps> = ({ settings, children }) => {
  useEffect(() => {
    const root = document.documentElement;

    // Get colors from settings or use defaults
    const primaryColor = settings.brandPrimaryColor || '#00FFC8';
    const secondaryColor = settings.brandSecondaryColor || '#1A1D24';

    // Convert hex to RGB for opacity variants
    const hexToRgb = (hex: string): string => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (result) {
        return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
      }
      return '0, 255, 200'; // fallback
    };

    // Inject CSS custom properties - use existing variable names from index.html
    root.style.setProperty('--primary-accent', primaryColor);
    root.style.setProperty('--primary-accent-rgb', hexToRgb(primaryColor));
    root.style.setProperty('--secondary-color', secondaryColor);

    // Update neon effects to use dynamic color
    // Create a style element for dynamic keyframes
    const existingStyle = document.getElementById('dynamic-theme-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    const styleEl = document.createElement('style');
    styleEl.id = 'dynamic-theme-styles';
    styleEl.textContent = `
      /* Dynamic orb animation */
      @keyframes orb-pulse {
        0% { transform: scale(1); opacity: 0.85; box-shadow: 0 0 40px ${primaryColor}59; }
        50% { transform: scale(1.03); opacity: 1; box-shadow: 0 0 60px ${primaryColor}99; }
        100% { transform: scale(1); opacity: 0.85; box-shadow: 0 0 40px ${primaryColor}59; }
      }

      /* Override hardcoded teal colors */
      .neon-text { text-shadow: 0 0 20px ${primaryColor}66 !important; }
      .neon-border { box-shadow: 0 0 20px ${primaryColor}26, inset 0 0 20px ${primaryColor}0d !important; }
      .neon-glow-strong { box-shadow: 0 0 40px ${primaryColor}80 !important; }

      /* Toggle switch active state */
      .toggle-switch.active {
        background: ${primaryColor} !important;
        box-shadow: 0 0 12px ${primaryColor}66 !important;
      }

      /* Settings nav active */
      .settings-nav-item.active {
        background: ${primaryColor}14 !important;
        border-left-color: ${primaryColor} !important;
        color: ${primaryColor} !important;
      }
      .settings-nav-item:hover {
        background: ${primaryColor}0d !important;
      }

      /* Tab button active */
      .tab-button.active {
        background: ${primaryColor}1a !important;
        border-color: ${primaryColor}33 !important;
      }

      /* Form focus */
      .form-input:focus {
        border-color: ${primaryColor} !important;
        box-shadow: 0 0 0 3px ${primaryColor}1a !important;
      }

      /* Stat card gradient */
      .stat-card::before {
        background: radial-gradient(circle, ${primaryColor}14 0%, transparent 70%) !important;
      }

      /* Workflow icon container info */
      .workflow-card .icon-container.info {
        background: ${primaryColor}1a !important;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      const el = document.getElementById('dynamic-theme-styles');
      if (el) el.remove();
    };
  }, [settings.brandPrimaryColor, settings.brandSecondaryColor]);

  return <>{children}</>;
};

export default ThemeProvider;
