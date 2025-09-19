"use client";

import "./globals.css";
import ReduxProvider from '../ReduxProvider';
import MainLayout from "../Components/MainLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </ReduxProvider>
      </body>
    </html >
  );
}
