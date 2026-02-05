'use client';

import { createVirtualView } from '@/three';
import { useEffect, useRef } from 'react';

export default function VirtualView() {
  const container = useRef<HTMLDivElement>(null);
  const api = useRef<ReturnType<typeof createVirtualView> | null>(null);

  useEffect(() => {
    const el = container.current;
    if (!el) return;

    api.current = createVirtualView(el);

    return () => {
      api.current?.destroy();
      api.current = null;
    };
  }, []);

  return (
    <div
      ref={container}
      className="w-full h-screen overflow-hidden bg-black"
    />
  );
}