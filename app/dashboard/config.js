// This file ensures that Next.js knows this page should be rendered dynamically
// It prevents Vercel build errors when pages use client-side APIs like useSearchParams

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Skip static generation
export const generateStaticParams = () => {
  return [];
}; 