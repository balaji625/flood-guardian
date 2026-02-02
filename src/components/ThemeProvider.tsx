import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="official"
      enableSystem={false}
      storageKey="floodguard-theme"
      // Ensure custom theme names reliably round-trip through next-themes
      // (otherwise it may fall back to its default theme list).
      themes={["official", "vibrant", "night"]}
      // Prevent the "stuck" feel caused by CSS transitions during class swaps.
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
