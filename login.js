const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");
const loginBtn = document.getElementById("loginBtn");

// Login session browser band/restart hone ke baad bhi yaad rahe
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// Agar already logged in hai, seedha update page pe bhej do
auth.onAuthStateChanged(async (user) => {
  if (!user) return;

  const userDoc = await db.collection("merchantUsers").doc(user.uid).get();
  if (userDoc.exists && userDoc.data().merchantId) {
    window.location.href = "update.html";
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";
  loginBtn.disabled = true;
  loginBtn.textContent = "Logging in...";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    const uid = cred.user.uid;

    const userDoc = await db.collection("merchantUsers").doc(uid).get();
    if (!userDoc.exists) {
      errorMsg.textContent = "Is account se koi merchant linked nahi hai.";
      await auth.signOut();
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
      return;
    }

    const merchantId = userDoc.data().merchantId;
    if (!merchantId) {
      errorMsg.textContent = "Merchant ID missing hai is account mein.";
      await auth.signOut();
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
      return;
    }

    window.location.href = "update.html";
  } catch (err) {
    let msg = "Login fail ho gaya, dobara koshish karein.";
    if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
      msg = "Email ya password ghalat hai.";
    } else if (err.code === "auth/invalid-email") {
      msg = "Email format ghalat hai.";
    } else if (err.code === "auth/too-many-requests") {
      msg = "Bohat zyada attempts ho gaye, thori dair baad try karein.";
    }
    errorMsg.textContent = msg;
    loginBtn.disabled = false;
    loginBtn.textContent = "Login";
  }
});