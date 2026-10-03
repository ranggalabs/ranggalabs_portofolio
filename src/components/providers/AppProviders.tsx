"use client";

import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { PortfolioProvider, PortfolioInitialData } from "@/context/PortfolioContext";

export function AppProviders({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: PortfolioInitialData;
}) {
  return (
    <ThemeProvider>
      <PortfolioProvider initialData={initialData}>{children}</PortfolioProvider>
    </ThemeProvider>
  );
}
