import React from 'react';

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#F6F4EF] text-[#151619]">
      {children}
    </div>
  );
}
