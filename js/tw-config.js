// Tailwind CDN config — must be loaded right after the CDN script
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#182a1d",
        "on-primary-fixed-variant": "#384b3d",
        "surface-bright": "#fbf9f5",
        "inverse-surface": "#30312e",
        "outline-variant": "#c3c8c1",
        "on-primary": "#ffffff",
        "tertiary": "#28261f",
        "inverse-on-surface": "#f2f0ed",
        "surface-tint": "#4f6354",
        "inverse-primary": "#b6ccb9",
        "outline": "#737872",
        "surface-container-lowest": "#ffffff",
        "on-tertiary-container": "#aba69b",
        "tertiary-fixed-dim": "#cbc6ba",
        "on-primary-container": "#96ab99",
        "on-primary-fixed": "#0d1f13",
        "tertiary-container": "#3f3c33",
        "surface-container-highest": "#e4e2de",
        "primary-container": "#2d4032",
        "surface-container-high": "#eae8e4",
        "on-secondary-fixed": "#380d00",
        "on-error-container": "#93000a",
        "secondary-fixed": "#ffdbcf",
        "surface-dim": "#dbdad6",
        "secondary": "#94492d",
        "on-secondary-fixed-variant": "#763318",
        "secondary-container": "#fd9e7b",
        "surface-container-low": "#f5f3ef",
        "on-surface": "#1b1c1a",
        "surface-variant": "#e4e2de",
        "tertiary-fixed": "#e8e2d6",
        "on-tertiary-fixed": "#1e1c14",
        "on-error": "#ffffff",
        "secondary-fixed-dim": "#ffb59b",
        "error": "#ba1a1a",
        "on-surface-variant": "#434843",
        "on-tertiary-fixed-variant": "#4a473e",
        "on-secondary": "#ffffff",
        "surface": "#fbf9f5",
        "on-background": "#1b1c1a",
        "primary-fixed-dim": "#b6ccb9",
        "on-tertiary": "#ffffff",
        "background": "#fbf9f5",
        "on-secondary-container": "#773319",
        "primary-fixed": "#d2e8d4",
        "surface-container": "#efeeea",
        "error-container": "#ffdad6"
      },
      borderRadius: {
        "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"
      },
      spacing: {
        "base": "8px", "margin-desktop": "64px", "margin-mobile": "16px",
        "gutter": "24px", "xs": "4px", "xl": "80px", "md": "24px", "sm": "12px", "lg": "48px"
      },
      fontFamily: {
        "headline-lg-mobile": ["Hanken Grotesk"], "label-md": ["Inter"],
        "body-lg": ["Inter"], "headline-md": ["Hanken Grotesk"],
        "headline-lg": ["Hanken Grotesk"], "body-md": ["Inter"],
        "display-lg": ["Hanken Grotesk"], "label-sm": ["Inter"]
      },
      fontSize: {
        "headline-lg-mobile": ["24px", {"lineHeight":"32px","fontWeight":"500"}],
        "label-md": ["14px", {"lineHeight":"20px","letterSpacing":"0.02em","fontWeight":"500"}],
        "body-lg": ["18px", {"lineHeight":"28px","fontWeight":"400"}],
        "headline-md": ["24px", {"lineHeight":"32px","fontWeight":"500"}],
        "headline-lg": ["32px", {"lineHeight":"40px","letterSpacing":"-0.01em","fontWeight":"500"}],
        "body-md": ["16px", {"lineHeight":"24px","fontWeight":"400"}],
        "display-lg": ["48px", {"lineHeight":"56px","letterSpacing":"-0.02em","fontWeight":"600"}],
        "label-sm": ["12px", {"lineHeight":"16px","letterSpacing":"0.05em","fontWeight":"600"}]
      }
    }
  }
};
