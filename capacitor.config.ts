import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ezobilling.clientadmin',
  appName: 'EZO Client Admin',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
