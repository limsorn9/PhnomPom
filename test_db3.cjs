const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
  projectId: "gen-lang-client-0078472495",
  appId: "1:899605050407:web:cff415020ba39ce7f0ca02",
  apiKey: "AIzaSyD57xG1u72iOt0i-oqIxgoyNObuF_jGVDk",
  authDomain: "gen-lang-client-0078472495.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-phnompomprimarys-a31b72e3-3939-4a54-bbde-2af4f010aac5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check() {
  try {
    const mainRef = doc(db, 'schools', 'test_doc');
    await setDoc(mainRef, { testField: "success" });
    console.log("Database connection successful!");
  } catch (e) {
    console.error("Database Error:", e);
  }
}
check();
