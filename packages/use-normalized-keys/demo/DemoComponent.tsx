import React, { useState } from 'react';
import { useNormalizedKeys } from '../src';

export default function DemoComponent() {
  const keys = useNormalizedKeys();
  const [log, setLog] = useState<string[]>([]);

  React.useEffect(() => {
    if (keys?.lastKey) {
      setLog((prev) => [keys.lastKey, ...prev].slice(0, 10));
    }
  }, [keys.lastKey]);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <h2>useNormalizedKeys Demo</h2>
      <p>Press any key to see the normalized output:</p>
      <div style={{ background: '#f4f4f4', padding: 12, borderRadius: 4, minHeight: 50 }}>
        <pre>{JSON.stringify(keys, null, 2)}</pre>
      </div>
      <h3>Recent Keys:</h3>
      <ul>
        {log.map((k, idx) => (
          <li key={idx}>{k}</li>
        ))}
      </ul>
    </div>
  );
}