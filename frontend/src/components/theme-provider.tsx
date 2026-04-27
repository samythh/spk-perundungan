// File: frontend/src/components/theme-provider.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes"; // Perbaikan impor tipe

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
   // Membungkus seluruh aplikasi agar state tema (dark/light) bisa diakses di komponen mana pun
   return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}