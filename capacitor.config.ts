import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.astraverse.app',
  appName: 'AstraVerse AI',
  webDir: 'public',
  server: {
    // In development or when connecting to your live hosted web app URL,
    // Capacitor will load the full live Next.js application with all API routes and UI.
    // For local testing on your phone/emulator, you can set your machine's local IP (e.g., http://192.168.x.x:3000)
    // or when deployed, your production URL (e.g., https://your-domain.vercel.app).
    androidScheme: 'https',
    cleartext: true
  }
};

export default config;
