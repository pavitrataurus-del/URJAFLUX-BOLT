import appletConfig from "./firebase-applet-config.json" with { type: "json" };
console.log(process.env.VITE_FIREBASE_DATABASE_ID);
console.log(appletConfig.databaseId);
console.log(appletConfig.firestoreDatabaseId);
