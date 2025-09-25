"use client";

import "./globals.css";
import ReduxProvider from '../ReduxProvider';
import MainLayout from "../Components/MainLayout";
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const user = useSelector((state: any) => state.auth.user);
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return <MainLayout>{children}</MainLayout>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <LayoutContent>{children}</LayoutContent>
        </ReduxProvider>
      </body>
    </html >
  );
}
