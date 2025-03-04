import 'dotenv/config';

export default {
  name: "Purity",
  slug: "purity",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "purity",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: "your-project-id"
    }
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-sqlite"
  ],
  experiments: {
    typedRoutes: true
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    "**/*",
    "assets/db/KJV.db"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.kevinngo03.purity"
  },
  web: {
    bundler: "metro",
    output: "single",
    favicon: "./assets/images/favicon.png"
  },
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    }
  }
}; 