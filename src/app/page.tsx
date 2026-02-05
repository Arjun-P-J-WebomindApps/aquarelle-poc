"use client"
import dynamic from 'next/dynamic';

const VirtualView = dynamic(
  () => import('@/components/VirtualView'),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="h-dvh">
      <VirtualView />
    </main>
  );
}