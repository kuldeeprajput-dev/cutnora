import React from 'react';

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-mkt-bg text-mkt-fg">
      {children}
    </div>
  );
}
