import { useEffect, useRef, useState } from 'react';

export function useWebSocket(url: () => string) {
  const ref = useRef<WebSocket>(null);
  const target = useRef(url);
  const [, update] = useState(0);

  useEffect(() => {
    if (ref.current) return;
    const socket = new WebSocket(target.current());
    ref.current = socket;
    update((p: number) => p + 1);

    return () => socket.close();
  }, []);

  return ref.current;
}
