    // ===================================
    // 1. IMPORT FIREBASE (EX-HEAD)
    // ===================================
    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
    import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";
    import { 
        getAuth, onAuthStateChanged, 
      createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signOut, sendEmailVerification, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { 
  getFirestore, doc, getDoc, setDoc, 
  updateDoc, Timestamp, runTransaction,
  writeBatch, serverTimestamp, collection, 
  query, orderBy, limit, getDocs
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// MODIFICA (Task 7): Importa dal nuovo file
import { translations, flagEmojis, genRanges, achievementDefinitions } from './translations.js';

    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyAW3-RXK_Sr3ZX9RzL_Tk9kyAU0XBqNz4Q",
      authDomain: "pokemon-8ce86.firebaseapp.com",
      projectId: "pokemon-8ce86",
      storageBucket: "pokemon-8ce86.firebasestorage.app",
      messagingSenderId: "827401493995",
      appId: "1:827401493995:web:52896d9886c0e83b9b0dae",
      measurementId: "G-122Q38G8J6"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    
    // FIX: Crea costanti locali invece di window.fb
    const fb_auth = getAuth(app);
    const fb_db = getFirestore(app);

    // ===================================
    // 2. LOGICA DEL GIOCO (EX-BODY)
    // ===================================

    // --- CHIAVI LOCALSTORAGE ---
    // --- CHIAVI LOCALSTORAGE ---
// MODIFICATE per la nuova struttura dati
const HIGHSCORES_KEY = "highScores"; // Era HIGHSCORE_KEY
const GAMES_PLAYED_KEY = "gamesPlayed"; // Rimane, ma la struttura dati cambia
const UNLOCKED_POKEMON_KEY = "unlockedPokemon";
const LANG_KEY = "lang";
const THEME_KEY = "theme";
const DIFFICULTY_KEY = "difficulty";
const COOKIE_KEY = "cookieConsent";
const UNLOCKED_SHINY_KEY = "unlockedShiny";
const ACHIEVEMENTS_KEY = "unlockedAchievements";

// --- VARIABILI GLOBALI ---
let pokemonList = [];
let unlockedPokemon = []; 
let unlockedShiny = [];
let unlockedAchievements = [];
let achievementPercentages = {}; // Verrà caricato da Firestore
let score = 0;
let gameOver = false;
let timer;
let timeLeft = 10;
let t = {}; 
let lang = "it";
let difficulty = "easy";
let currentComparison = null; 
// (sotto le altre variabili globali)
let selectedSortItem = null; // Per il click-to-swap
let currentSortChoices = []; // Per il modal di sblocco
let selectionsMade = 0;
let maxSelections = 1;

// NUOVE Variabili Globali
let currentGameMode = null; // 'classic' o 'sort'
let sortableStat = null; // Stat da ordinare
let correctSortOrder = []; // Lista ID ordinati
let highScores = { // NUOVA struttura per i punteggi
  classic: { easy: 0, medium: 0, hard: 0 },
  sort: { easy: 0, medium: 0, hard: 0 }
};
let gamesPlayed = { // NUOVA struttura per le partite
  classic: 0,
  sort: 0
};


// Variabili Firebase
let currentUser = null; 
let userData = null;


    // --- FUNZIONI DI NAVIGAZIONE ---
    function showPage(pageId) {
      document.getElementById("mainMenu").style.display = "none";
      document.querySelectorAll(".page-container").forEach(page => {
        page.style.display = "none";
      });
      const page = document.getElementById(pageId);
      if (page) {
        page.style.display = "block";
      }
    }

    // --- FUNZIONI DI IMPOSTAZIONE E CARICAMENTO ---
    document.addEventListener("DOMContentLoaded", () => {
      loadDeviceSettings();
      applyLanguage(lang); // Questo imposta "Caricamento..."
      setupCookieBanner(); // Imposta il banner cookie (e le sue traduzioni)
      applyTheme(localStorage.getItem(THEME_KEY) || 'system');
      loadGameData();
      setupNavigationListeners();
      setupSettingsListeners();
      setupAuthListeners();
      showPage("mainMenu");
      setupAuthObserver(); 
    });
    
    function loadDeviceSettings() {
      lang = localStorage.getItem(LANG_KEY) || navigator.language.slice(0, 2) || "en";
      if (!translations[lang]) lang = "en";
      difficulty = localStorage.getItem(DIFFICULTY_KEY) || "easy";
    }

    // RIGA 389 (circa)
function loadGuestData() {
  // MODIFICATO per la nuova struttura
  highScores = JSON.parse(localStorage.getItem(HIGHSCORES_KEY) || '{"classic": {"easy": 0, "medium": 0, "hard": 0}, "sort": {"easy": 0, "medium": 0, "hard": 0}}');
  gamesPlayed = JSON.parse(localStorage.getItem(GAMES_PLAYED_KEY) || '{"classic": 0, "sort": 0}');
  unlockedPokemon = JSON.parse(localStorage.getItem(UNLOCKED_POKEMON_KEY) || "[]");
  unlockedShiny = JSON.parse(localStorage.getItem(UNLOCKED_SHINY_KEY) || "[]");
  unlockedAchievements = JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY) || "[]");
  
  // Assicura che la struttura sia completa se il local storage è parziale
  const defaultScores = { classic: { easy: 0, medium: 0, hard: 0 }, sort: { easy: 0, medium: 0, hard: 0 } };
  const defaultGames = { classic: 0, sort: 0 };
  highScores = { ...defaultScores, ...highScores };
  highScores.classic = { ...defaultScores.classic, ...highScores.classic };
  highScores.sort = { ...defaultScores.sort, ...highScores.sort };
  gamesPlayed = { ...defaultGames, ...gamesPlayed };
}

    // RIGA 398 (circa)
async function loadUserData(uid) {
  try {
    const userRef = doc(fb_db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      userData = userSnap.data();
      
      // MODIFICATO per la nuova struttura
      const defaultScores = { classic: { easy: 0, medium: 0, hard: 0 }, sort: { easy: 0, medium: 0, hard: 0 } };
      const defaultGames = { classic: 0, sort: 0 };

      highScores = userData.highScores ? 
          { ...defaultScores, ...userData.highScores } : 
          defaultScores;
      // Assicura sub-oggetti
      highScores.classic = { ...defaultScores.classic, ...highScores.classic };
      highScores.sort = { ...defaultScores.sort, ...highScores.sort };

      gamesPlayed = userData.gamesPlayed ? 
          { ...defaultGames, ...userData.gamesPlayed } : 
          defaultGames;

      unlockedPokemon = userData.unlockedPokemon || [];
      unlockedShiny = userData.unlockedShiny || [];
      unlockedAchievements = userData.unlockedAchievements || [];

      loadAchievementStats();

    } else {
      console.warn("Dati utente non trovati, sto creando un profilo...");
      await createUserData(uid, currentUser.email, "Giocatore"); // Fallback
      loadGuestData(); 
    }
  } catch (error)
  {
    console.error("Errore nel caricare i dati utente:", error);
    loadGuestData();
  }
}

    // RIGA 421 (circa)
async function createUserData(uid, email, displayName) {
  const newUserRef = doc(fb_db, "users", uid);
  const newDisplayNameRef = doc(fb_db, "displayNames", displayName.toLowerCase());

  const newUserData = {
    uid: uid,
    email: email,
    displayName: displayName,
    createdAt: serverTimestamp(), 
    highScores: {
      classic: { easy: 0, medium: 0, hard: 0 },
      sort: { easy: 0, medium: 0, hard: 0 }
    },
    gamesPlayed: {
      classic: 0,
      sort: 0
    },
    unlockedPokemon: [],
    unlockedShiny: [],
    unlockedAchievements: [],
    settings: {
        lang: localStorage.getItem(LANG_KEY) || 'it',
        theme: localStorage.getItem(THEME_KEY) || 'system',
        difficulty: localStorage.getItem(DIFFICULTY_KEY) || 'easy'
    }
  };
  
  try {
    // USA UNA TRANSAZIONE per aggiornare il conteggio utenti E creare l'utente
    await runTransaction(fb_db, async (transaction) => {
      const statsRef = doc(fb_db, "achievementStats", "global");
      const statsDoc = await transaction.get(statsRef);

      let currentTotal = 0;
      if (statsDoc.exists()) {
        currentTotal = statsDoc.data().totalUsers || 0;
      }
      
      // 1. Imposta i dati del nuovo utente
      transaction.set(newUserRef, newUserData);
      // 2. Imposta il nome visualizzato
      transaction.set(newDisplayNameRef, { uid: uid });
      
      // 3. Aggiorna il conteggio globale
      if (statsDoc.exists()) {
        transaction.update(statsRef, { totalUsers: currentTotal + 1 });
      } else {
        // Questo è il primo utente in assoluto
        transaction.set(statsRef, { totalUsers: 1 });
      }
    });

    // Carica i dati appena creati
    await loadUserData(uid); 

  } catch (error) {
    console.error("Errore creazione dati utente:", error);
  }
}
    async function loadGameData() {
      try {
        const response = await fetch("pokemonList.json");
        if (!response.ok) throw new Error("Errore nel caricare pokemonList.json");
        pokemonList = await response.json();
          populateRegionFilter();
        
        if (document.getElementById("accountContainer").style.display === "block") {
          applyPokedexFilters();
        }

      } catch (error) {
        console.error("Errore:", error);
        alert("Non è stato possibile caricare la lista dei Pokémon.");
      }
    }

    // RIGA 451 (circa)
function setupNavigationListeners() {
  document.getElementById("playButton").addEventListener("click", () => {
    // MODIFICATO: Mostra il modal invece di iniziare il gioco
    document.getElementById("gameModeModal").style.display = "flex";
  });
  
  // NUOVI LISTENER PER IL MODAL
  document.getElementById("closeGameModeModal").addEventListener("click", () => {
    document.getElementById("gameModeModal").style.display = "none";
  });
  
  document.getElementById("classicModeButton").addEventListener("click", () => {
    currentGameMode = "classic";
    document.getElementById("gameModeModal").style.display = "none";
    showPage("gameContainer");
    startGame();
  });
  
  document.getElementById("sortModeButton").addEventListener("click", () => {
    currentGameMode = "sort";
    document.getElementById("gameModeModal").style.display = "none";
    showPage("gameContainer");
    startGame();
  });

  document.getElementById("leaderboardButton").addEventListener("click", () => {
    showPage("leaderboardContainer");
    loadLeaderboardPage(); // Carica i dati (ora ha i listener)
  });
  
  document.getElementById("accountButton").addEventListener("click", () => {
    clearInterval(timer); // BUG FIX: Ferma il timer
    loadAccountPage(); 
    showPage("accountContainer");
  });
  
  document.getElementById("settingsButton").addEventListener("click", () => {
    loadSettingsPage();
    showPage("settingsContainer");
  });

  document.querySelectorAll(".back-to-menu").forEach(button => {
    button.addEventListener("click", () => {
      clearInterval(timer); 
      showPage("mainMenu");
    });
  });

  document.getElementById("closePopup").onclick = () => {
    document.getElementById("gameOverPopup").style.display = "none";
    // MODIFICATO: Riavvia il gioco corretto
    startGame();
  };
  
  // NUOVI LISTENER PER I TAB DELLA CLASSIFICA
  document.getElementById("leaderboardTabClassic").addEventListener("click", () => {
    document.getElementById("leaderboardTabClassic").classList.add("active");
    document.getElementById("leaderboardTabSort").classList.remove("active");
    loadLeaderboardPage();
  });
  document.getElementById("leaderboardTabSort").addEventListener("click", () => {
    document.getElementById("leaderboardTabClassic").classList.remove("active");
    document.getElementById("leaderboardTabSort").classList.add("active");
    loadLeaderboardPage();
  });
  document.getElementById("leaderboardDifficultySelect").addEventListener("change", loadLeaderboardPage);
}
    
    function setupCookieBanner() {
      const banner = document.getElementById("cookieConsentBanner");
      const acceptBtn = document.getElementById("cookieAcceptButton");

      // Applica traduzioni iniziali (non può aspettare applyLanguage)
      document.getElementById("cookieMessage").innerText = t.cookieMessage;
      document.getElementById("cookieAcceptButton").innerText = t.cookieButton;

      if (!localStorage.getItem(COOKIE_KEY)) {
        banner.style.display = "block";
      }

      acceptBtn.addEventListener("click", () => {
        localStorage.setItem(COOKIE_KEY, "true");
        banner.style.display = "none";
      });
    }

    // --- FUNZIONI DI AUTENTICAZIONE ---

    // Funzione helper per mostrare/nascondere i moduli auth
    function showAuthForm(formToShow) { // 'loginForm', 'registerForm', 'resetForm'
        document.getElementById("loginForm").style.display = 'none';
        document.getElementById("registerForm").style.display = 'none';
        document.getElementById("resetForm").style.display = 'none';
        
        if (formToShow) {
            document.getElementById(formToShow).style.display = 'block';
        }
        
        // Pulisce tutti gli errori
        document.getElementById("authErrorLogin").innerText = "";
        document.getElementById("authErrorRegister").innerText = "";
        document.getElementById("authErrorReset").innerText = "";
        document.getElementById("authErrorReset").classList.remove("auth-success");
    }

    function setupAuthObserver() {
      const authStatus = document.getElementById("authStatus");

      onAuthStateChanged(fb_auth, async (user) => {
        currentUser = user; // Aggiorna lo stato globale
        
        if (user) {
          if (user.emailVerified) {
            // Utente loggato E verificato
            authStatus.innerHTML = (t.statusLoadingUser || "Loading data for {email}...").replace("{email}", user.email);
            await loadUserData(user.uid); 
            
            const name = userData?.displayName || user.email;
            const statusText = (t.statusLoggedInAs || "Logged in as <strong>{name}</strong>.").replace("{name}", name);
            authStatus.innerHTML = `${statusText} <button id="logoutButton">${t.statusBtnLogout || "Logout"}</button>`;
            document.getElementById("logoutButton").addEventListener("click", handleLogout);
          } else {
            // Utente loggato MA NON verificato
            const statusText = (t.statusNotVerified || "Email <strong>{email}</strong> not verified.").replace("{email}", user.email);
            authStatus.innerHTML = `${statusText} <button id="resendVerificationStatusButton">${t.statusNotVerifiedBtn || "Resend"}</button> <button id="logoutButton">${t.statusBtnLogout || "Logout"}</button>`;
            document.getElementById("logoutButton").addEventListener("click", handleLogout);
            document.getElementById("resendVerificationStatusButton").addEventListener("click", handleResendVerification);
          }

        } else {
          // Utente non loggato (Ospite)
          currentUser = null;
          userData = null;
          loadGuestData(); 
          authStatus.innerHTML = `${t.statusGuest || "..."} <button id="loginShowButton">${t.statusBtnLogin || "..."}</button>`;
          document.getElementById("loginShowButton").addEventListener("click", () => {
            clearInterval(timer); // BUG FIX: Ferma il timer
            loadAccountPage();
            showPage("accountContainer");
          });
        }
        updateAuthStatusText();
        
        // Aggiorna la pagina account SE è quella attiva
        if (document.getElementById("accountContainer").style.display === "block") {
          loadAccountPage();
        }
        // Aggiorna il record nel gioco SE è quello attivo
        if (document.getElementById("gameContainer").style.display === "block") {
        }
      });
    }

    function setupAuthListeners() {
      // Toggle tra i form
      document.getElementById("showRegister").addEventListener("click", () => showAuthForm("registerForm"));
      document.getElementById("showLogin").addEventListener("click", () => showAuthForm("loginForm"));
      document.getElementById("showReset").addEventListener("click", () => showAuthForm("resetForm"));
      document.getElementById("showLoginFromReset").addEventListener("click", () => showAuthForm("loginForm"));

      // Pulsanti di azione
      document.getElementById("loginButton").addEventListener("click", handleLogin);
      document.getElementById("registerButton").addEventListener("click", handleRegister);
      document.getElementById("resetButton").addEventListener("click", handlePasswordReset);
      document.getElementById("resendVerificationButton").addEventListener("click", handleResendVerification);
    }

    function updateAuthStatusText() {
  const authStatus = document.getElementById("authStatus");
  if (!authStatus || !t) return; // Controlla se 't' è definito

  if (currentUser) {
    if (currentUser.emailVerified) {
      const name = userData?.displayName || currentUser.email;
      const statusText = (t.statusLoggedInAs || "Logged in as <strong>{name}</strong>.").replace("{name}", name);
      authStatus.innerHTML = `${statusText} <button id="logoutButton">${t.statusBtnLogout || "Logout"}</button>`;
      if(document.getElementById("logoutButton")) document.getElementById("logoutButton").addEventListener("click", handleLogout);
    } else {
      const statusText = (t.statusNotVerified || "Email <strong>{email}</strong> not verified.").replace("{email}", currentUser.email);
      authStatus.innerHTML = `${statusText} <button id="resendVerificationStatusButton">${t.statusNotVerifiedBtn || "Resend"}</button> <button id="logoutButton">${t.statusBtnLogout || "Logout"}</button>`;
      if(document.getElementById("logoutButton")) document.getElementById("logoutButton").addEventListener("click", handleLogout);
      if(document.getElementById("resendVerificationStatusButton")) document.getElementById("resendVerificationStatusButton").addEventListener("click", handleResendVerification);
    }
  } else {
    authStatus.innerHTML = `${t.statusGuest || "..."} <button id="loginShowButton">${t.statusBtnLogin || "..."}</button>`;
    if(document.getElementById("loginShowButton")) document.getElementById("loginShowButton").addEventListener("click", () => {
      clearInterval(timer);
      loadAccountPage();
      showPage("accountContainer");
    });
  }
}

    async function handleLogin() {
      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;
      const errorEl = document.getElementById("authErrorLogin");
      
      if (!email || !password) {
        errorEl.innerText = t.errorLoginRequired;
        return;
      }
      
      try {
        errorEl.innerText = t.statusLoggingIn;
        await signInWithEmailAndPassword(fb_auth, email, password);
        errorEl.innerText = "";
      } catch (error) {
        console.error("Errore Login:", error.code);
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          errorEl.innerText = t.errorLoginInvalid;
        } else {
          errorEl.innerText = t.errorLoginGeneral;
        }
      }
    }

    async function handleRegister() {
      const email = document.getElementById("registerEmail").value;
      const password = document.getElementById("registerPassword").value;
      const displayName = document.getElementById("registerDisplayName").value.trim();
      const errorEl = document.getElementById("authErrorRegister");

      if (!email || !password || !displayName) {
        errorEl.innerText = t.errorFieldRequired;
        return;
      }
      if (displayName.length < 3 || displayName.length > 20) {
        errorEl.innerText = t.errorNameLength;
        return;
      }
      
      try {
        errorEl.innerText = t.statusRegistering;
        
        const nameRef = doc(fb_db, "displayNames", displayName.toLowerCase());
        const nameSnap = await getDoc(nameRef);
        
        if (nameSnap.exists()) {
          throw new Error(t.errorNameInUse);
        }

        const userCredential = await createUserWithEmailAndPassword(fb_auth, email, password);
        const user = userCredential.user;

        await createUserData(user.uid, user.email, displayName);
        
        await sendEmailVerification(user);
        
      } catch (error) {
        console.error("Errore Registrazione:", error);
        if (error.message === t.errorNameInUse) {
          errorEl.innerText = error.message;
        } else if (error.code === 'auth/email-already-in-use') {
          errorEl.innerText = t.errorEmailInUse;
        } else if (error.code === 'auth/weak-password') {
          errorEl.innerText = t.errorWeakPassword;
        } else {
          errorEl.innerText = t.errorRegisterGeneral;
        }
      }
    }

    async function handlePasswordReset() {
        const email = document.getElementById("resetEmail").value;
        const errorEl = document.getElementById("authErrorReset");
        
        if (!email) {
            errorEl.innerText = t.errorEmailInvalid;
            errorEl.classList.remove("auth-success");
            return;
        }
        
        try {
            await sendPasswordResetEmail(fb_auth, email);
            errorEl.innerText = t.resetSent;
            errorEl.classList.add("auth-success"); // Rendi il testo verde
        } catch (error) {
            console.error("Errore reset password:", error);
            errorEl.innerText = t.resetError;
            errorEl.classList.remove("auth-success");
        }
    }
    
    async function handleResendVerification() {
        if (!currentUser) return;
        const errorEl = document.getElementById("authErrorVerify");
        
        try {
            await sendEmailVerification(currentUser);
            errorEl.innerText = t.verifySent;
            errorEl.classList.add("auth-success");
        } catch (error) {
            console.error("Errore invio verifica:", error);
            errorEl.innerText = t.verifyError;
            errorEl.classList.remove("auth-success");
        }
    }

    function handleLogout() {
      signOut(fb_auth).catch(error => console.error("Errore Logout:", error));
    }

    // --- FUNZIONI DI IMPOSTAZIONE (LINGUA, TEMA, DIFFICOLTÀ) ---

    function applyLanguage(newLang) {
      lang = newLang;
      localStorage.setItem(LANG_KEY, lang);
      t = translations[lang] || translations.en;
      
      document.querySelectorAll("[data-translate]").forEach(el => {
        const key = el.dataset.translate;
        if (t[key]) el.innerText = t[key];
      });

      document.title = t.title || "Pokémon Game";
      
      // Aggiorna testi che non usano data-translate (se ce ne sono)
      document.getElementById("title").innerText = t.title || "Pokéstats";
      document.getElementById("greater").innerText = t.yes || "Yes";
      document.getElementById("not-greater").innerText = t.no || "No";
      document.getElementById("gameOverTitle").innerText = t.gameOver || "Game Over!";
      document.getElementById("closePopup").innerText = t.close || "Close";
      document.getElementById("score").innerText = `${t.score || "Score"}: ${score}`;
      document.getElementById("pokedexSearch").placeholder = t.search || "Search Pokémon...";

      // Aggiorna placeholder per Auth
      try {
        document.getElementById("loginEmail").placeholder = t.emailPlaceholder || "Email";
        document.getElementById("loginPassword").placeholder = t.passwordPlaceholder || "Password";
        document.getElementById("registerEmail").placeholder = t.emailPlaceholder || "Email";
        document.getElementById("registerPassword").placeholder = t.passwordPlaceholder || "Password";
        document.getElementById("registerDisplayName").placeholder = t.displayNamePlaceholder || "Display name (unique)";
        document.getElementById("resetEmail").placeholder = t.emailPlaceholder || "Email";
      } catch (e) {}
      
      loadSettingsPage();
      updateAuthStatusText(); // Aggiorna il testo dell'auth con la nuova lingua
        saveSettingsToFirebase();
    }
    
    function applyTheme(theme) {
      document.body.classList.remove('dark-mode', 'light-mode');
      if (theme === 'dark') {
        document.body.classList.add('dark-mode');
      } else if (theme === 'light') {
        document.body.classList.add('light-mode');
      } else { 
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.body.classList.add('dark-mode');
        }
      }
    }
    
    function setupSettingsListeners() {
      const difficultySelect = document.getElementById("difficultySetting");
      const themeSelect = document.getElementById("themeSetting");
      const langSelector = document.getElementById("languageSelector");

      difficultySelect.addEventListener("change", (e) => {
        difficulty = e.target.value;
        localStorage.setItem(DIFFICULTY_KEY, difficulty);
        saveSettingsToFirebase();
      });

      themeSelect.addEventListener("change", (e) => {
        const newTheme = e.target.value;
        localStorage.setItem(THEME_KEY, newTheme);
        applyTheme(newTheme);
          saveSettingsToFirebase();
      });
      
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const savedTheme = localStorage.getItem(THEME_KEY) || 'system';
        if (savedTheme === 'system') {
          applyTheme('system');
        }
      });

      langSelector.addEventListener("click", (e) => {
        const newLang = e.target.dataset.lang || e.target.parentElement.dataset.lang;
        if (newLang) {
          applyLanguage(newLang);
        }
      });
    }

    async function saveSettingsToFirebase() {
  // Salva solo se l'utente è loggato, verificato e i dati utente sono caricati
  if (!currentUser || !currentUser.emailVerified || !userData) return;

  const currentSettings = {
    lang: localStorage.getItem(LANG_KEY) || 'it',
    theme: localStorage.getItem(THEME_KEY) || 'system',
    difficulty: localStorage.getItem(DIFFICULTY_KEY) || 'easy'
  };
  
  // Evita scritture inutili se le impostazioni sono già sincronizzate
  if (JSON.stringify(userData.settings) === JSON.stringify(currentSettings)) {
      return;
  }

  try {
    const userRef = doc(fb_db, "users", currentUser.uid);
    await updateDoc(userRef, { settings: currentSettings });
    // Aggiorna anche i dati locali
    userData.settings = currentSettings;
  } catch (err) { 
    console.error("Failed to save settings to Firebase:", err); 
  }
}

    function loadSettingsPage() {
      document.getElementById("difficultySetting").value = difficulty;
      document.getElementById("themeSetting").value = localStorage.getItem(THEME_KEY) || 'system';
      const langSelector = document.getElementById("languageSelector");
      langSelector.innerHTML = "";
      Object.keys(flagEmojis).forEach(key => {
        const button = document.createElement("button");
        button.dataset.lang = key;
        button.title = key.toUpperCase();
        button.innerHTML = flagEmojis[key];
        if (key === lang) button.classList.add("active");
        langSelector.appendChild(button);
      });
    }

    // --- FUNZIONI DI GIOCO ---

    function getSpriteUrl(name, isShiny = false) {
  const normalized = name
    .toLowerCase()
    .replace(/-/g, "")
    .replace(/‎ /g, "")
    .replace(/♂/g, "m")
    .replace(/♀/g, "f")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/ /g, "-");
  const shinyPart = isShiny ? "-shiny" : "";
  return `https://play.pokemonshowdown.com/sprites/gen5${shinyPart}/${normalized}.png`;
}
    function getRandomPokemon() {
      return pokemonList[Math.floor(Math.random() * pokemonList.length)];
    }
    
    // MODIFICATO: per cercare differenze di statistiche in base alla difficoltà
function getComparison(player, opponent) {
  const stats = ["hp", "attack", "defense", "spattack", "spdefense", "speed"];
  let stat, playerStat, opponentStat;
  let attempts = 0;

  // Cerca uno stat con una differenza appropriata
  do {
    stat = stats[Math.floor(Math.random() * stats.length)];
    playerStat = player.stats[stat];
    opponentStat = opponent.stats[stat];
    
    if (playerStat === opponentStat && pokemonList.length > 1) continue;

    const diff = Math.abs(playerStat - opponentStat);

    if (difficulty === "hard" && diff > 25) continue;
    if (difficulty === "medium" && diff > 50) continue;
    
    // Se 'easy', qualsiasi differenza (non zero) va bene
    // Se 'medium' o 'hard', e la differenza è accettabile, esci
    break;

  } while (++attempts < 50); // Safety break

  return {
    stat,
    playerStat: playerStat,
    opponentStat: opponentStat,
    isGreater: playerStat > opponentStat,
    player: player,
    opponent: opponent
  };
}

    // MODIFICATO: per gestire tempi diversi per modalità
function startTimer() {
  clearInterval(timer);

  if (currentGameMode === "classic") {
    if (difficulty === "hard") timeLeft = 5;
    else if (difficulty === "medium") timeLeft = 7;
    else timeLeft = 10;
  } else {
    // Modalità Sort!
    timeLeft = 20; // Tempo fisso
  }
  
  document.getElementById("timer").innerText = `${t.time}: ${timeLeft}s`;
  
  timer = setInterval(() => {
    if (gameOver) {
      clearInterval(timer);
      return;
    }
    timeLeft--;
    document.getElementById("timer").innerText = `${t.time}: ${timeLeft}s`;
    
    if (timeLeft <= 0) {
      clearInterval(timer);
      // MODIFICATO: Dettagli per il timeout
      let details = currentGameMode === 'classic' ? currentComparison : { stat: sortableStat, correctOrder: correctSortOrder };
      triggerGameOver(t.timeout, details);
    }
  }, 1000);
}
    
    function handleAnswer(isGreater) {
      if (gameOver) return;
      const comparison = currentComparison;
      const isCorrect = (isGreater && comparison.isGreater) || (!isGreater && !comparison.isGreater);
      
      if (isCorrect) {
        score++;
        document.getElementById("score").innerText = `${t.score}: ${score}`;
        unlockPokemon(comparison.player.id);
        checkAndUnlockAchievement("first_step");
        checkShinyUnlock(comparison.player); // Controlla lo shiny
        startRound();
      } else {
        triggerGameOver(t.wrong, comparison);
      }
    }

    function unlockPokemon(pokemonId) {
      if (!unlockedPokemon.includes(pokemonId)) {
        unlockedPokemon.push(pokemonId);

        // Controlla achievement specifici
        if (pokemonId === 132) checkAndUnlockAchievement("conga");
        if (pokemonId === 493) checkAndUnlockAchievement("almighty");
        if (pokemonId === 0) checkAndUnlockAchievement("missing_number");

        // Controlla gli achievement di completamento Pokedex
        checkPokedexAchievements();
        // Salva solo se l'utente è loggato E VERIFICATO
        if (currentUser && currentUser.emailVerified) {
          const userRef = doc(fb_db, "users", currentUser.uid);
          updateDoc(userRef, { unlockedPokemon: unlockedPokemon })
            .catch(err => console.error("Errore salvataggio pokémon sbloccati:", err));
        } else if (!currentUser) {
          // Salva in local storage solo se è un ospite
          localStorage.setItem(UNLOCKED_POKEMON_KEY, JSON.stringify(unlockedPokemon));
        }
      }
    }
    
    // MODIFICATO: Logica di salvataggio e visualizzazione high score
async function triggerGameOver(reason, details) {
  clearInterval(timer);
  gameOver = true;
  let newRecord = false;

  // Aggiorna la partita giocata per la modalità corrente
  if (currentGameMode) {
      gamesPlayed[currentGameMode]++;
  }

  // Controlla e aggiorna l'high score per la modalità e difficoltà correnti
  let currentHighScore = 0;
  if (currentGameMode && difficulty) {
      currentHighScore = highScores[currentGameMode][difficulty] || 0;
      if (score > currentHighScore) {
          highScores[currentGameMode][difficulty] = score;
          currentHighScore = score;
          newRecord = true;
      }
  }

  // Salva i dati
  if (currentUser && currentUser.emailVerified && userData) {
    userData.gamesPlayed = gamesPlayed;
    userData.highScores = highScores;
    
    try {
      const userRef = doc(fb_db, "users", currentUser.uid);
      await updateDoc(userRef, {
        gamesPlayed: gamesPlayed,
        highScores: highScores // Salva l'intero oggetto aggiornato
      });
    } catch (err) {
      console.error("Errore aggiornamento dati fine partita:", err);
    }
  } else if (!currentUser) {
    // Salva in local storage solo se è un ospite
    localStorage.setItem(GAMES_PLAYED_KEY, JSON.stringify(gamesPlayed));
    if (newRecord) {
      localStorage.setItem(HIGHSCORES_KEY, JSON.stringify(highScores));
    }
  }

  // Controlla gli achievement basati sul punteggio
for (const key in achievementDefinitions) {
  const def = achievementDefinitions[key];
  if (def.score && score >= def.score) {
    checkAndUnlockAchievement(key);
  }
}

  // Mostra i messaggi nel popup
  document.getElementById("finalScore").innerText = `${t.score}: ${score}`;
  document.getElementById("highScoreMessage").innerText = newRecord ? t.newRecord : `${t.currentRecord}: ${currentHighScore}`;

  const wrongEl = document.getElementById("wrongDetails");
  wrongEl.innerHTML = ""; // Pulisci
  wrongEl.innerText = reason; // Mostra il motivo (es. "Tempo scaduto!")

  // Dettagli specifici per la modalità
  const statLabel = (translations.statNames[lang] && translations.statNames[lang][details?.stat]) || translations.statNames.en[details?.stat] || details?.stat;

  if (currentGameMode === 'classic' && details) {
    const playerVal = details.playerStat;
    const oppVal = details.opponentStat;
    const diff = Math.abs(playerVal - oppVal);
    const winner = playerVal === oppVal ? "Tie" : (playerVal > oppVal ? details.player.name : details.opponent.name);
    
    wrongEl.innerText += `\n${details.player.name}: ${playerVal} ${statLabel}`
                      + `\n${details.opponent.name}: ${oppVal} ${statLabel}`
                      + `\nΔ ${diff} — ${winner} ${t.wins || 'wins'}`;
                      
  } else if (currentGameMode === 'sort' && details && details.correctOrder) {
    // Mostra l'ordine corretto
    wrongEl.innerText += `\n\n${t.sortCorrectOrder || 'Correct Order:'}`;
    const ol = document.createElement('ol');
    ol.style.textAlign = 'left';
    ol.style.paddingLeft = '30px';
    details.correctOrder.forEach((p, index) => {
        const li = document.createElement('li');
        li.innerText = `${p.name} (${p.stats[details.stat]} ${statLabel})`;
        ol.appendChild(li);
    });
    wrongEl.appendChild(ol);
  }

  document.getElementById("gameOverPopup").style.display = "flex";
}

    // MODIFICATO: per la nuova logica di difficoltà
function startRound() {
  if (pokemonList.length === 0) return;
  
  // Mostra gli elementi giusti
  document.getElementById("classicGameContainer").style.display = "block";
  document.getElementById("sortGameContainer").style.display = "none";
  
  gameOver = false;
  
  // Aggiorna l'high score per la modalità/difficoltà correnti
  document.getElementById("highscore").innerText = `${t.record}: ${highScores.classic[difficulty]}`; 
  document.getElementById("score").innerText = `${t.score}: ${score}`;

  const player = getRandomPokemon();
  let opponent, comparison;
  let attempts = 0;

  // Cerca un avversario che soddisfi i criteri di difficoltà
  do {
      opponent = getRandomPokemon();
      if (pokemonList.length > 1) {
          while (opponent.id === player.id) {
              opponent = getRandomPokemon();
          }
      }
      
      // getComparison ora gestisce la logica della difficoltà internamente
      comparison = getComparison(player, opponent); 
      
      if (pokemonList.length <= 1) break; // Evita loop
      
      // Se getComparison ha fallito (es.
      if (comparison.playerStat === comparison.opponentStat) continue;

      // Criterio trovato, esci
      break;
      
  } while (++attempts < 50); // Safety break

  currentComparison = comparison;

  document.getElementById("player-sprite").src = getSpriteUrl(player.name);
  document.getElementById("opponent-sprite").src = getSpriteUrl(opponent.name);
  document.getElementById("player-name").innerText = player.name;
  document.getElementById("opponent-name").innerText = opponent.name;

  const statLabel = (translations.statNames[lang] && translations.statNames[lang][currentComparison.stat]) || translations.statNames.en[currentComparison.stat] || currentComparison.stat;
  
  const questionFormat = t.question || "Does {pokemon1} have more {stat} than {pokemon2}?";
  const question = questionFormat
    .replace("{pokemon1}", player.name)
    .replace("{stat}", statLabel)
    .replace("{pokemon2}", opponent.name);
    
  document.getElementById("comparison").innerText = question;

  document.getElementById("greater").onclick = () => handleAnswer(true);
  document.getElementById("not-greater").onclick = () => handleAnswer(false);
  startTimer();
}


    // ===================================
// NUOVE FUNZIONI DI GIOCO (Aggiunte)
// ===================================

function startGame() {
  // MODIFICA (Task 4): Logica Anti-Cheat
  const now = Date.now();
  const timeSinceLast = now - lastRoundStartTime;
  lastRoundStartTime = now;

  // Se l'ultimo round è stato avviato meno di 1.5s fa
  if (timeSinceLast < 1500) { 
    rapidRoundCount++;
  } else {
    rapidRoundCount = 0; // Resetta se il tempo è normale
  }

  // Se l'utente ha avviato 5 round troppo velocemente
  if (rapidRoundCount > 5) {
    clearInterval(timer); 
    gameOver = true;
    alert(t.antiCheatWarning || "Stai giocando troppo velocemente! Ritorno al menu.");
    showPage("mainMenu");
    rapidRoundCount = 0;
    return; // Interrompi l'avvio del gioco
  }
    
    score = 0;
  gameOver = false;
  document.getElementById("score").innerText = `${t.score}: ${score}`;
  
  if (currentGameMode === "classic") {
    startRound();
  } else if (currentGameMode === "sort") {
    startSortRound();
  }
}

async function saveShinyData() {
  if (currentUser && currentUser.emailVerified) {
    const userRef = doc(fb_db, "users", currentUser.uid);
    await updateDoc(userRef, { unlockedShiny: unlockedShiny });
  } else if (!currentUser) {
    localStorage.setItem(UNLOCKED_SHINY_KEY, JSON.stringify(unlockedShiny));
  }
}

async function saveAchievements() {
  if (currentUser && currentUser.emailVerified) {
    const userRef = doc(fb_db, "users", currentUser.uid);
    await updateDoc(userRef, { unlockedAchievements: unlockedAchievements });
  } else if (!currentUser) {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlockedAchievements));
  }
}

async function checkAndUnlockAchievement(key) {
  if (unlockedAchievements.includes(key)) return;
  if (!achievementDefinitions[key]) return; // Definizione non trovata

  console.log("Achievement Unlocked:", key);
  unlockedAchievements.push(key);
  await saveAchievements();

  // Aggiorna le statistiche globali (senza bloccare)
  if (currentUser) {
    const statsRef = doc(fb_db, "achievementStats", "global");
    runTransaction(fb_db, async (transaction) => {
      const statsDoc = await transaction.get(statsRef);
      if (!statsDoc.exists()) {
        transaction.set(statsRef, { [key]: 1});
      } else {
        const newCount = (statsDoc.data()[key] || 0) + 1;
        transaction.update(statsRef, { [key]: newCount });
      }
    }).catch(err => console.error("Errore aggiornamento statistiche achievement:", err));
  }

  // TODO: Mostra una notifica all'utente
}

function checkPokedexAchievements() {
  // Controlla gli achievement generazionali
  for (const key in achievementDefinitions) {
    const def = achievementDefinitions[key];
    if (def.gen && genRanges[def.gen]) {
      const { start, end } = genRanges[def.gen];
      const genPokemon = pokemonList.filter(p => p.id >= start && p.id <= end);
      const unlockedGen = genPokemon.filter(p => unlockedPokemon.includes(p.id));

      if (unlockedGen.length === genPokemon.length) {
        checkAndUnlockAchievement(key);
      }
    }
  }

  // Controlla il "Pokemon Master" (fino a Gen 5)
  const totalInList = pokemonList.length; // La lista si ferma a Gen 5
  if (unlockedPokemon.length === totalInList) {
    checkAndUnlockAchievement("pokemon_master");
  }
}

function checkShinyUnlock(pokemon) {
  if (!pokemon) return;
  const roll = Math.floor(Math.random() * 250); // 0-249
  if (roll === 0) { // 1/250 di probabilità
    if (!unlockedShiny.includes(pokemon.id)) {
      console.log("SHINY UNLOCKED:", pokemon.name);
      unlockedShiny.push(pokemon.id);
      saveShinyData();
      checkAndUnlockAchievement("chromatic");
      // TODO: Mostra notifica "Shiny sbloccato!"
    }
  }
}

// --- Funzioni per la modalità "Metti in Ordine" ---

function startSortRound() {
  if (pokemonList.length === 0) return;

  // Mostra gli elementi giusti
  document.getElementById("classicGameContainer").style.display = "none";
  document.getElementById("sortGameContainer").style.display = "block";

  gameOver = false;

  // Aggiorna l'high score per la modalità/difficoltà correnti
  document.getElementById("highscore").innerText = `${t.record}: ${highScores.sort[difficulty]}`;
  document.getElementById("score").innerText = `${t.score}: ${score}`;

  const numPokemon = difficulty === 'easy' ? 3 : (difficulty === 'medium' ? 5 : 7);
  
  // Ottieni i Pokémon da ordinare
  const [pokemonToSort, stat] = getPokemonForSorting(numPokemon);
  sortableStat = stat; // Salva lo stat per il game over
  
  // Salva l'ordine corretto (decrescente)
  correctSortOrder = [...pokemonToSort].sort((a, b) => b.stats[stat] - a.stats[stat]);

  // Mostra la domanda
  const statLabel = (translations.statNames[lang] && translations.statNames[lang][stat]) || translations.statNames.en[stat] || stat;
  const question = (t.sortQuestion || "Sort by {stat}").replace("{stat}", statLabel);
  document.getElementById("sortQuestion").innerText = question;

  // Mostra la lista (mescolata)
  displaySortableList(pokemonToSort);

  // Imposta il bottone di controllo
  document.getElementById("checkSortButton").onclick = checkSortOrder;

  startTimer();
}

function getPokemonForSorting(num) {
  const stats = ["hp", "attack", "defense", "spattack", "spdefense", "speed"];
  let chosenPokemon = [];
  let statToCompare;
  let attempts = 0;

  do {
    chosenPokemon = [];
    let statValues = new Set();
    statToCompare = stats[Math.floor(Math.random() * stats.length)];
    let innerAttempts = 0;

    // 1. Trova 'num' Pokémon con valori DIVERSI per quello stat
    while (chosenPokemon.length < num && innerAttempts < 100) {
      const p = getRandomPokemon();
      const pStat = p.stats[statToCompare];
      
      if (!statValues.has(pStat)) {
        statValues.add(pStat);
        chosenPokemon.push(p);
      }
      innerAttempts++;
    }
    
    if (chosenPokemon.length < num) continue; // Non abbastanza Pokémon unici trovati

    // 2. Controlla se la difficoltà (differenza minima) è rispettata
    const statList = [...statValues].sort((a, b) => a - b);
    let minDiff = Infinity;
    for (let i = 1; i < statList.length; i++) {
      minDiff = Math.min(minDiff, statList[i] - statList[i-1]);
    }

    if (difficulty === "hard" && minDiff > 15) continue;
    if (difficulty === "medium" && minDiff > 30) continue;

    // Se 'easy' o la differenza è ok, esci
    break;

  } while (++attempts < 50); // Safety break
  
  // Se non troviamo un set perfetto, restituiamo comunque qualcosa
  if (chosenPokemon.length < num) {
      // Fallback: riempi con Pokémon a caso (potrebbero avere stats uguali)
      while(chosenPokemon.length < num) { chosenPokemon.push(getRandomPokemon()); }
  }

  return [chosenPokemon, statToCompare];
}

function displaySortableList(pokemonList) {
  const listEl = document.getElementById("sortableList");
  listEl.innerHTML = "";

  // Mescola la lista per visualizzarla
  const shuffledList = [...pokemonList].sort(() => Math.random() - 0.5);

  shuffledList.forEach(p => {
    const li = document.createElement("li");
    li.className = "sortable-item";
    li.dataset.id = p.id; // Salva l'ID per il controllo
    li.innerHTML = `<img src="${getSpriteUrl(p.name)}" alt="${p.name}"> ${p.name}`;
    listEl.appendChild(li);
  });

  // Aggiungi listener per il drag-and-drop
  addClickSwapListeners();
}

function checkSortOrder() {
  if (selectedSortItem) {
  selectedSortItem.classList.remove("selected");
  selectedSortItem = null;
}

  clearInterval(timer); // Ferma il timer

  const listEl = document.getElementById("sortableList");
  
  // Ottieni l'ordine corrente dal DOM
  const currentOrderIds = [...listEl.querySelectorAll("li")].map(li => li.dataset.id);
  
  // Ottieni l'ordine corretto (salvato)
  const correctOrderIds = correctSortOrder.map(p => p.id.toString());

  // Confronta
  const isCorrect = JSON.stringify(currentOrderIds) === JSON.stringify(correctOrderIds);

  if (isCorrect) {
    score++;
    checkAndUnlockAchievement("first_step");

    // NUOVO CONTROLLO (LA TUA CORREZIONE):
    // Se l'utente è un ospite (non loggato), non mostrare il modal
    // e passa direttamente al round successivo.
    if (!currentUser) {
      startSortRound();
      return; // Esci dalla funzione
    }

    // CONTROLLO ESISTENTE: Verifica se c'è qualcosa da sbloccare
    const allUnlocked = correctSortOrder.every(p => unlockedPokemon.includes(p.id));

    if (allUnlocked) {
      // Se sono tutti sbloccati, salta il modal e vai al prossimo round
      startSortRound();
    } else {
      // Altrimenti, mostra il modal come al solito
      showSortUnlockModal(correctSortOrder);
    }

  } else {
    // Game Over
    triggerGameOver(t.sortWrongOrder, { stat: sortableStat, correctOrder: correctSortOrder });
  }
}

function showSortUnlockModal(pokemonList) {
  currentSortChoices = pokemonList;
  selectionsMade = 0;

  if (difficulty === 'easy') maxSelections = 1;
  else if (difficulty === 'medium') maxSelections = 2;
  else maxSelections = 3;

  const modal = document.getElementById("sortUnlockModal");
  const grid = document.getElementById("sortUnlockGrid");
  const confirmBtn = document.getElementById("confirmSortUnlock");
  const messageEl = document.getElementById("sortUnlockMessage");

  grid.innerHTML = "";
  messageEl.innerText = (t.sortUnlockMessage || "Scegli {num} Pokémon:").replace("{num}", maxSelections);

  pokemonList.forEach(p => {
    const item = document.createElement("div");
    item.className = "sort-unlock-item";
    item.dataset.pokemonId = p.id;
    item.innerHTML = `<img src="${getSpriteUrl(p.name)}" alt="${p.name}"> ${p.name}`;

    if (unlockedPokemon.includes(p.id)) {
      item.classList.add("disabled");
    } else {
      item.addEventListener('click', handleSortUnlockClick);
    }
    grid.appendChild(item);
  });

  confirmBtn.disabled = true;
  confirmBtn.onclick = confirmSortUnlock;
  modal.style.display = "flex";
}

function handleSortUnlockClick(event) {
  const item = event.currentTarget;
  const grid = document.getElementById("sortUnlockGrid");
  if (item.classList.contains("disabled")) return;

  if (item.classList.contains("selected")) {
    item.classList.remove("selected");
    selectionsMade--;
  } else {
    if (selectionsMade < maxSelections) {
      item.classList.add("selected");
      selectionsMade++;
    }
  }

  // Disabilita altri se il max è raggiunto
  if (selectionsMade >= maxSelections) {
      grid.querySelectorAll(".sort-unlock-item:not(.selected):not(.disabled)").forEach(i => i.classList.add("disabled"));
  } else {
      grid.querySelectorAll(".sort-unlock-item.disabled").forEach(i => {
          // Ri-abilita solo se non è già sbloccato
          if (!unlockedPokemon.includes(parseInt(i.dataset.pokemonId))) {
              i.classList.remove("disabled");
          }
      });
  }

  document.getElementById("confirmSortUnlock").disabled = (selectionsMade === 0);
}

function confirmSortUnlock() {
  const selectedItems = document.getElementById("sortUnlockGrid").querySelectorAll(".selected");

  selectedItems.forEach(item => {
    const id = parseInt(item.dataset.pokemonId);
    if (!isNaN(id)) {
      unlockPokemon(id); // Sblocca il Pokémon

      // Controlla anche lo shiny per questo Pokémon
      const pokemon = pokemonList.find(p => p.id === id);
      checkShinyUnlock(pokemon);
    }
  });

  document.getElementById("sortUnlockModal").style.display = "none";
  startSortRound(); // Ora avvia il prossimo round
}
// --- Funzioni Helper per Drag-and-Drop ---
// RIMUOVI addDragDropListeners e getDragAfterElement

// NUOVA FUNZIONE per il click-to-swap
function addClickSwapListeners() {
  const items = document.querySelectorAll(".sortable-item");

  // Rimuovi vecchi listener per sicurezza
  items.forEach(item => {
    const newItem = item.cloneNode(true);
    item.parentNode.replaceChild(newItem, item);
  });

  // Aggiungi nuovi listener
  document.querySelectorAll(".sortable-item").forEach(item => {
    item.addEventListener("click", () => {
      if (gameOver) return;

      if (!selectedSortItem) {
        // Primo click: seleziona
        selectedSortItem = item;
        item.classList.add("selected");
      } else if (selectedSortItem === item) {
        // Secondo click sullo stesso: deseleziona
        selectedSortItem = null;
        item.classList.remove("selected");
      } else {
        // Secondo click su un altro: scambia
        const list = document.getElementById("sortableList");

        // Scambia nel DOM
        const parent = selectedSortItem.parentNode;
        const nextOfSelected = selectedSortItem.nextSibling;
        const nextOfTarget = item.nextSibling;

        if (nextOfSelected === item) {
            parent.insertBefore(selectedSortItem, nextOfTarget);
        } else if (nextOfTarget === selectedSortItem) {
            parent.insertBefore(item, nextOfSelected);
        } else {
            parent.insertBefore(selectedSortItem, nextOfTarget);
            parent.insertBefore(item, nextOfSelected);
        }

        // Resetta la selezione
        selectedSortItem.classList.remove("selected");
        item.classList.remove("selected");
        selectedSortItem = null;
      }
    });
  });
}
    // --- FUNZIONI ACCOUNT & POKÉDEX & CLASSIFICA ---
    
    const pokedexGrid = document.getElementById('pokedexGrid');
    const searchInput = document.getElementById('pokedexSearch');
    const filterUnlocked = document.getElementById('filterUnlocked');
    const filterLocked = document.getElementById('filterLocked');
    const filterShiny = document.getElementById('filterShiny');
    const filterRegion = document.getElementById('filterRegion');
    const modal = document.getElementById('pokemonModal');
    const modalName = document.getElementById('modalName');
    const modalImage = document.getElementById('modalImage');
    const modalStats = document.getElementById('modalStats');
    const closeBtn = document.querySelector('#pokemonModal .close-btn');

    // MODIFICATO: per gestire tab e difficoltà
async function loadLeaderboardPage() {
  const listEl = document.getElementById("leaderboardList");
  listEl.innerHTML = `<li class="loading-msg" data-translate="leaderboardLoading">${t.leaderboardLoading || "Caricamento classifica..."}</li>`;

  // Leggi i controlli
  const mode = document.getElementById("leaderboardTabSort").classList.contains("active") ? "sort" : "classic";
  const difficulty = document.getElementById("leaderboardDifficultySelect").value;
  
  // Crea il percorso per il campo Firestore
  const orderByField = `highScores.${mode}.${difficulty}`;

  try {
    const usersRef = collection(fb_db, "users");
    // Ordina in base al campo nidificato
    const q = query(usersRef, orderBy(orderByField, "desc"), limit(10));
    
    const querySnapshot = await getDocs(q);
    
    listEl.innerHTML = ""; // Clear loading
    
    if (querySnapshot.empty) {
      listEl.innerHTML = `<li class="loading-msg" data-translate="leaderboardEmpty">${t.leaderboardEmpty || "Nessun dato ancora."}</li>`;
      return;
    }
    
    let rank = 1;
    querySnapshot.forEach((doc) => {
      const user = doc.data();
      
      // Accedi al punteggio corretto
      const userScore = user.highScores?.[mode]?.[difficulty] || 0;

      if (userScore > 0) { 
        const li = document.createElement("li");
        li.innerHTML = `
          <span class="rank">#${rank}</span>
          <span class="name">${user.displayName}</span>
          <span class="score">${userScore}</span>
        `;
        listEl.appendChild(li);
        rank++;
      }
    });

    if (rank === 1) { // Se i top 10 hanno tutti 0
        listEl.innerHTML = `<li class="loading-msg" data-translate="leaderboardEmpty">${t.leaderboardEmpty || "Nessun dato ancora."}</li>`;
    }

  } catch (error) {
    console.error("Errore caricamento classifica:", error);
    listEl.innerHTML = `<li class="loading-msg" data-translate="leaderboardError">${t.leaderboardError || "Errore nel caricamento."}</li>`;
  }
}

async function loadAchievementStats() {
  try {
    const statsRef = doc(fb_db, "achievementStats", "global");
    const statsDoc = await getDoc(statsRef);
    if (statsDoc.exists()) {
      achievementPercentages = statsDoc.data();
    }
  } catch (err) {
    console.error("Errore caricamento statistiche achievement:", err);
  }
}

function displayAchievements() {
  const grid = document.getElementById("achievementsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const totalUsers = achievementPercentages.totalUsers || 1; // Evita divisione per zero

  for (const key in achievementDefinitions) {
    const def = achievementDefinitions[key];

    const isUnlocked = unlockedAchievements.includes(key);

    const card = document.createElement("div");
    card.className = "achievement-card";
    if (!isUnlocked) card.classList.add("locked");

    const unlockCount = achievementPercentages[key] || 0;
    const percent = (unlockCount / totalUsers * 100).toFixed(1);
    const title = t[def.titleKey] || (def.title || key); // Fallback
    const desc = (isUnlocked || !def.hidden) ? (t[def.descKey] || (def.desc || "???")) : "???";

    card.innerHTML = `
      <div class="achievement-icon">${def.icon}</div>
      <div class="achievement-title">${title}</div> 
      <div class="achievement-desc">${desc}</div>
      <div class="achievement-percent">${percent}%</div>
    `;
    grid.appendChild(card);
  }
}

    function loadAccountPage() {
      const authCont = document.getElementById("authContainer");
      const dataCont = document.getElementById("userDataContainer");
      const verifyCont = document.getElementById("verificationContainer");
      const benefitsCont = document.getElementById("authBenefitsContainer");
      
      if (currentUser) {
        benefitsCont.style.display = "none"; // Nascondi i benefici se loggato
        if (currentUser.emailVerified) {
          // UTENTE LOGGATO E VERIFICATO
          authCont.style.display = "none";
          verifyCont.style.display = "none";
          dataCont.style.display = "block";

          if (userData) {
       // Mostra gli achievement
            displayAchievements();
            
            // MODIFICA (Task 1): Aggiungi listener e applica filtri
            // Rimuovi vecchi listener se esistono (buona pratica)
            searchInput.removeEventListener('input', applyPokedexFilters);
            filterUnlocked.removeEventListener('change', applyPokedexFilters);
            filterLocked.removeEventListener('change', applyPokedexFilters);
            filterShiny.removeEventListener('change', applyPokedexFilters);
            filterRegion.removeEventListener('change', applyPokedexFilters);
            
            // Aggiungi nuovi listener
            searchInput.addEventListener('input', applyPokedexFilters);
            filterUnlocked.addEventListener('change', applyPokedexFilters);
            filterLocked.addEventListener('change', applyPokedexFilters);
            filterShiny.addEventListener('change', applyPokedexFilters);
            filterRegion.addEventListener('change', applyPokedexFilters);
            
            // Carica la griglia
            applyPokedexFilters();
        const allScores = [
            ...Object.values(highScores.classic),
            ...Object.values(highScores.sort)
        ];
        const bestScore = Math.max(0, ...allScores);
        const totalGames = (gamesPlayed.classic || 0) + (gamesPlayed.sort || 0);

        document.getElementById("accountHighScore").innerText = bestScore; // Mostra il record assoluto
        document.getElementById("accountGamesPlayed").innerText = totalGames; // Mostra partite totali
        
        let creationDate = "...";
        if (userData.createdAt && typeof userData.createdAt.toDate === 'function') {
        creationDate = userData.createdAt.toDate().toLocaleDateString(lang, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
        });
        }
document.getElementById("accountCreatedAt").innerText = creationDate;

// Mostra gli achievement
displayAchievements();
        
      }
        } else {
          // UTENTE LOGGATO MA NON VERIFICATO
          authCont.style.display = "none";
          dataCont.style.display = "none";
          verifyCont.style.display = "block";
          document.getElementById("authErrorVerify").innerText = "";
          document.getElementById("authErrorVerify").classList.remove("auth-success");
        }
      } else {
        // UTENTE NON LOGGATO (OSPITE)
        dataCont.style.display = "none";
        verifyCont.style.display = "none";
        authCont.style.display = "block";
        benefitsCont.style.display = "block"; // Mostra i benefici all'ospite
        
        showAuthForm("loginForm");
      }
    }
    
    function displayPokedex(list) {
      pokedexGrid.innerHTML = '';
      if (!list) return;

      list.forEach(pokemon => {
        const isUnlocked = unlockedPokemon.includes(pokemon.id);
        const isShinyUnlocked = unlockedShiny.includes(pokemon.id);
        
        const div = document.createElement('div');
        div.className = 'pokedex-pokemon';
        
        const img = document.createElement('img');
        img.src = getSpriteUrl(pokemon.name);
        img.alt = pokemon.name;

        const name = document.createElement('div');
        name.className = 'pokedex-pokemon-name';

        if (isUnlocked) {
          name.textContent = pokemon.name;
          div.addEventListener('click', () => showPokemonModal(pokemon, true, isShinyUnlocked));
        } else {
          div.classList.add('locked');
          name.textContent = "???";
          div.addEventListener('click', () => showPokemonModal(pokemon, false, false));
        }

        div.appendChild(img);
        div.appendChild(name);
        pokedexGrid.appendChild(div);
      });
    }

    function showPokemonModal(pokemon, isUnlocked, isShinyUnlocked) {
      const shinyToggle = document.getElementById("modalShinyToggle");
shinyToggle.dataset.pokemonName = pokemon.name;
shinyToggle.dataset.isShiny = "false"; // Resetta sempre
shinyToggle.classList.remove("active");
      const statLabels = (translations.statNames[lang] || translations.statNames.en);

      if (isUnlocked) {
        modalName.textContent = `#${pokemon.id} ${pokemon.name}`;
        modalImage.src = getSpriteUrl(pokemon.name, false); // Mostra sempre il normale all'inizio
        modalImage.classList.remove('locked');
        modalStats.innerHTML = '';

        for (let stat in pokemon.stats) {
          const statDiv = document.createElement('div');
          statDiv.className = 'stat';
          const statLabel = statLabels[stat] || stat.toUpperCase();
          statDiv.innerHTML = `
            <div class="stat-name">${statLabel}: ${pokemon.stats[stat]}</div>
            <div class="stat-bar">
              <div class="stat-bar-inner" style="width: ${(pokemon.stats[stat] / 255) * 100}%"></div>
            </div>
          `;
          modalStats.appendChild(statDiv);

        if (isShinyUnlocked) {
  shinyToggle.classList.add("unlocked");
  shinyToggle.onclick = toggleShinySprite;
} else {
  shinyToggle.classList.remove("unlocked");
  shinyToggle.onclick = null;
}
        }
      } else {
        modalName.textContent = `???`;
        modalImage.src = getSpriteUrl(pokemon.name, false);
        modalImage.classList.add('locked');
        modalStats.innerHTML = '';
        ['hp', 'attack', 'defense', 'spattack', 'spdefense', 'speed'].forEach(stat => {
          const statDiv = document.createElement('div');
          statDiv.className = 'stat';
          const statLabel = statLabels[stat] || stat.toUpperCase();
          statDiv.innerHTML = `
            <div class="stat-name">${statLabel}: ???</div>
            <div class="stat-bar">
              <div class="stat-bar-inner" style="width: 0%"></div>
            </div>
          `;
          modalStats.appendChild(statDiv);
        });
          shinyToggle.classList.remove("unlocked", "active");
          shinyToggle.onclick = null;
      }
      modal.style.display = 'flex';
    }

    // Listener Modal Pokédex
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });


    function toggleShinySprite(event) {
  const btn = event.currentTarget;
  const name = btn.dataset.pokemonName;
  if (!name) return;

  const isCurrentlyShiny = btn.dataset.isShiny === "true";
  const newIsShiny = !isCurrentlyShiny;

  document.getElementById("modalImage").src = getSpriteUrl(name, newIsShiny);
  btn.dataset.isShiny = newIsShiny;

  if (newIsShiny) {
    btn.classList.add("active");
  } else {
    btn.classList.remove("active");
  }
}

function populateRegionFilter() {
  const select = document.getElementById("filterRegion");
  if (!select) return;
  
  // Pulisci (tranne "Tutte le Regioni")
  while (select.options.length > 1) {
    select.remove(1);
  }
  
  for (const gen in genRanges) {
    const option = document.createElement("option");
    option.value = gen;
    option.text = genRanges[gen].name;
    select.appendChild(option);
  }
}

function applyPokedexFilters() {
  if (pokemonList.length === 0) return; // Dati non ancora caricati

  const searchTerm = searchInput.value.toLowerCase();
  const showUnlocked = filterUnlocked.checked;
  const showLocked = filterLocked.checked;
  const showShiny = filterShiny.checked;
  const region = filterRegion.value;

  // 1. Filtra per regione
  let regionFiltered = [];
  if (region === "all") {
    regionFiltered = [...pokemonList];
  } else {
    const { start, end } = genRanges[region];
    regionFiltered = pokemonList.filter(p => p.id >= start && p.id <= end);
  }

  // 2. Applica gli altri filtri
  const filtered = regionFiltered.filter(p => {
    const nameMatch = p.name.toLowerCase().includes(searchTerm);
    const isUnlocked = unlockedPokemon.includes(p.id);
    const isShinyUnlocked = unlockedShiny.includes(p.id);

    if (!nameMatch) return false;

    // Logica filtri
    if (showShiny) {
      // Se "Shiny" è spuntato, mostra SOLO gli shiny sbloccati
      return isShinyUnlocked;
    } else {
      // Altrimenti, usa i filtri "Sbloccati" / "Non Sbloccati"
      if (showUnlocked && showLocked) return true; // Mostra entrambi
      if (showUnlocked) return isUnlocked;
      if (showLocked) return !isUnlocked;
      return false; // Non mostra nulla se entrambi deselezionati
    }
  });

  displayPokedex(filtered); // Chiama la funzione di rendering con la lista filtrata
}





