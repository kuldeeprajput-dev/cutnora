import React from 'react';

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#fcfbf9] text-[#1a1918]">
      {children}
    </div>
  );
}
