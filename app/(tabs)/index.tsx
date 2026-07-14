import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/login/student');
    }, 10);

    return () => clearTimeout(timeout);
  }, [router]);

  return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
}
