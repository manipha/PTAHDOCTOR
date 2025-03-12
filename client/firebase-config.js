import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCu96gqHc2DmCiyD4KmUjkcTZ2C77_91s0",
  authDomain: "ptahadmin.firebaseapp.com",
  projectId: "ptahadmin",
  storageBucket: "ptahadmin.appspot.com",
  messagingSenderId: "458775891559",
  appId: "1:458775891559:web:a54c228a5d09e0043f8ec2",
  measurementId: "G-CXRXLF5VN6",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
