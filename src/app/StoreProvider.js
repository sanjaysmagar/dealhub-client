'use client';

import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { getMe } from '@/store/slices/authSlice';

export default function StoreProvider({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      store.dispatch(getMe());
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  return <Provider store={store}>{children}</Provider>;
}