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

    // --- OGGETTO TRADUZIONI (INTEGRATO) ---
    const translations = {
      // RIGA 109 (circa)
      "it": {
        "title": "Pokéstats - Confronto Statistiche", // MODIFICATO
        "score": "Punteggio", "record": "Record", "time": "Tempo", "yes": "Sì", "no": "No", "gameOver": "Game Over!", "newRecord": "🎉 Nuovo record!", "currentRecord": "Record attuale", "close": "Chiudi", "timeout": "Tempo scaduto!", "wrong": "Hai sbagliato!", "play": "Gioca", "account": "Account", "settings": "Impostazioni", "backToMenu": "Menu", "gamesPlayed": "Partite Giocate", "pokedex": "Pokédex", "difficulty": "Difficoltà", "easy": "Facile", "medium": "Medio", "hard": "Difficile", "theme": "Tema", "system": "Sistema", "light": "Chiaro", "dark": "Scuro", "language": "Lingua", "search": "Cerca Pokémon...", "wins": "vince",
        "question": "{pokemon1} ha più {stat} di {pokemon2}?",

        // NUOVE TRADUZIONI (AGGIUNTE)
        "chooseModeTitle": "Scegli la Modalità",
        "classicMode": "Chi è più forte?",
        "sortMode": "Metti in ordine!",
        "sortQuestion": "Ordina i Pokémon per {stat} (dal più alto al più basso)",
        "checkOrderButton": "Controlla",
        "sortWrongOrder": "Ordine errato!",
        "sortCorrectOrder": "Ordine Corretto:",
        "classic": "Classica",
        "sort": "Ordina",
        // FINE NUOVE TRADUZIONI

        "login": "Login", "register": "Registrati", "emailPlaceholder": "Email", "passwordPlaceholder": "Password", "displayNamePlaceholder": "Nome visualizzato (unico)", "loginButton": "Accedi", "registerButton": "Registrati", "authToggleToRegister": "Non hai un account?", "authToggleToRegisterBtn": "Registrati", "authToggleToLogin": "Hai già un account?", "authToggleToLoginBtn": "Accedi",
        "errorFieldRequired": "Compila tutti i campi.", "errorNameLength": "Il nome deve essere tra 3 e 20 caratteri.", "errorNameInUse": "Nome utente già utilizzato.", "errorEmailInUse": "Email già registrata.", "errorWeakPassword": "La password deve essere di almeno 6 caratteri.", "errorRegisterGeneral": "Errore durante la registrazione.", "errorLoginInvalid": "Email o password errati.", "errorLoginGeneral": "Errore during il login.", "errorLoginRequired": "Inserisci email e password.", "errorEmailInvalid": "Inserisci un'email valida.",
        "statusLoading": "Caricamento...", "statusRegistering": "Verifica e creazione account...", "statusLoggingIn": "Accesso in corso...", "statusLoadingUser": "Caricamento dati di {email}...", "statusLoggedInAs": "Loggato come <strong>{name}</strong>.", "statusGuest": "Stai giocando come <strong>Ospite</strong>.", "statusBtnLogout": "Logout", "statusBtnLogin": "Login/Registrati", "memberSince": "Membro dal", "statusNotVerified": "Email <strong>{email}</strong> non verificata.", "statusNotVerifiedBtn": "Invia di nuovo",
        "leaderboard": "Classifica", "leaderboardLoading": "Caricamento classifica...", "leaderboardEmpty": "Nessun dato ancora.", "leaderboardError": "Errore nel caricamento.",
        "verifyTitle": "Verifica la tua Email", "verifyMessage": "Ti abbiamo inviato un link di verifica. Controlla la tua casella di posta (e spam) e clicca sul link per attivare il tuo account.", "verifyResend": "Invia di nuovo", "verifySent": "Link di verifica inviato!", "verifyError": "Errore durante l'invio. Riprova più tardi.",
        "authToggleToResetBtn": "Password dimenticata?", "resetTitle": "Recupera Password", "resetMessage": "Inserisci la tua email e ti invieremo un link per resettare la password.", "resetButton": "Invia link", "resetSent": "Email inviata! Controlla la tua casella.", "resetError": "Errore. L'email è corretta?",
        "cookieMessage": "Questo sito usa cookie per salvare i tuoi record e preferenze. Accetti?", "cookieButton": "Accetta",
        "benefitsTitle": "Perché creare un account?", "benefitsItem1": "Salva i tuoi record e progressi sul cloud.", "benefitsItem2": "Competi nella classifica globale.", "benefitsItem3": "Sincronizza il tuo Pokédex sbloccato su tutti i dispositivi.",
        "privacyNotice": "Creando un account, accetti che la tua email, nome utente e punteggi vengano salvati. Non condividiamo i tuoi dati."

        // Filtri
        "filterStatus": "Stato",
        "filterRegion": "Regione",
        "filterAll": "Tutti",
        "filterUnlocked": "Sbloccati",
        "filterLocked": "Bloccati",
        "achievements": "Obiettivi",

        // Achievements
        "ach_kanto_master_title": "Maestro di Kanto",
        "ach_kanto_master_desc": "Ottieni tutti i Pokémon di Gen 1",
        "ach_johto_master_title": "Maestro di Johto",
        "ach_johto_master_desc": "Ottieni tutti i Pokémon di Gen 2",
        "ach_hoenn_master_title": "Maestro di Hoenn",
        "ach_hoenn_master_desc": "Ottieni tutti i Pokémon di Gen 3",
        "ach_sinnoh_master_title": "Maestro di Sinnoh",
        "ach_sinnoh_master_desc": "Ottieni tutti i Pokémon di Gen 4",
        "ach_unima_master_title": "Maestro di Unima",
        "ach_unima_master_desc": "Ottieni tutti i Pokémon di Gen 5",
        "ach_kalos_master_title": "Maestro di Kalos",
        "ach_kalos_master_desc": "Ottieni tutti i Pokémon di Gen 6",
        "ach_alola_master_title": "Maestro di Alola",
        "ach_alola_master_desc": "Ottieni tutti i Pokémon di Gen 7",
        "ach_galar_master_title": "Maestro di Galar",
        "ach_galar_master_desc": "Ottieni tutti i Pokémon di Gen 8",
        "ach_paldea_master_title": "Maestro di Paldea",
        "ach_paldea_master_desc": "Ottieni tutti i Pokémon di Gen 9",
        "ach_pokemon_master_title": "Maestro Pokémon",
        "ach_pokemon_master_desc": "Ottieni tutti i Pokémon",
        "ach_first_step_title": "Primo Passo",
        "ach_first_step_desc": "Vinci un round",
        "ach_newbie_title": "Principiante",
        "ach_newbie_desc": "Ottieni un record di almeno 5",
        "ach_good_enough_title": "Niente male",
        "ach_good_enough_desc": "Ottieni un record di almeno 10",
        "ach_impressive_title": "Notevole",
        "ach_impressive_desc": "Ottieni un record di almeno 30",
        "ach_mr_pokedex_title": "Mr. Pokédex",
        "ach_mr_pokedex_desc": "Ottieni un record di almeno 100",
        "ach_chromatic_title": "Cromatico",
        "ach_chromatic_desc": "Ottieni uno shiny",
        "ach_conga_title": "Conga!",
        "ach_conga_desc": "Ottieni un Ditto",
        "ach_missing_number_title": "Il Numero Mancante",
        "ach_missing_number_desc": "Ottieni MissingNo.",
        "ach_almighty_title": "L'Onnipotente",
        "ach_almighty_desc": "Ottieni Arceus"
      },
      // RIGA 136 (circa)
  "en": {
    "title": "Pokéstats - Stats Comparison",
    "score": "Score",
    "record": "Record",
    "time": "Time",
    "yes": "Yes",
    "no": "No",
    "gameOver": "Game Over!",
    "newRecord": "🎉 New Record!",
    "currentRecord": "Current Record",
    "close": "Close",
    "timeout": "Time out!",
    "wrong": "Wrong!",
    "play": "Play",
    "account": "Account",
    "settings": "Settings",
    "backToMenu": "Menu",
    "gamesPlayed": "Games Played",
    "pokedex": "Pokédex",
    "difficulty": "Difficulty",
    "easy": "Easy",
    "medium": "Medium",
    "hard": "Hard",
    "theme": "Theme",
    "system": "System",
    "light": "Light",
    "dark": "Dark",
    "language": "Language",
    "search": "Search Pokémon...",
    "wins": "wins",
    "question": "Does {pokemon1} have higher {stat} than {pokemon2}?",
    "chooseModeTitle": "Choose Mode",
    "classicMode": "Who is stronger?",
    "sortMode": "Sort them!",
    "sortQuestion": "Sort the Pokémon by {stat} (from highest to lowest)",
    "checkOrderButton": "Check",
    "sortWrongOrder": "Wrong order!",
    "sortCorrectOrder": "Correct Order:",
    "classic": "Classic",
    "sort": "Sort",
    "login": "Login",
    "register": "Register",
    "emailPlaceholder": "Email",
    "passwordPlaceholder": "Password",
    "displayNamePlaceholder": "Display Name (unique)",
    "loginButton": "Login",
    "registerButton": "Register",
    "authToggleToRegister": "Don't have an account?",
    "authToggleToRegisterBtn": "Register",
    "authToggleToLogin": "Already have an account?",
    "authToggleToLoginBtn": "Login",
    "errorFieldRequired": "Please fill all fields.",
    "errorNameLength": "Name must be between 3 and 20 characters.",
    "errorNameInUse": "Username already in use.",
    "errorEmailInUse": "Email already registered.",
    "errorWeakPassword": "Password must be at least 6 characters.",
    "errorRegisterGeneral": "Error during registration.",
    "errorLoginInvalid": "Incorrect email or password.",
    "errorLoginGeneral": "Error during login.",
    "errorLoginRequired": "Enter email and password.",
    "errorEmailInvalid": "Enter a valid email.",
    "statusLoading": "Loading...",
    "statusRegistering": "Verifying and creating account...",
    "statusLoggingIn": "Logging in...",
    "statusLoadingUser": "Loading data for {email}...",
    "statusLoggedInAs": "Logged in as <strong>{name}</strong>.",
    "statusGuest": "You are playing as <strong>Guest</strong>.",
    "statusBtnLogout": "Logout",
    "statusBtnLogin": "Login/Register",
    "memberSince": "Member since",
    "statusNotVerified": "Email <strong>{email}</strong> not verified.",
    "statusNotVerifiedBtn": "Resend",
    "leaderboard": "Leaderboard",
    "leaderboardLoading": "Loading leaderboard...",
    "leaderboardEmpty": "No data yet.",
    "leaderboardError": "Error loading leaderboard.",
    "verifyTitle": "Verify your Email",
    "verifyMessage": "We sent you a verification link. Check your inbox (and spam) and click the link to activate your account.",
    "verifyResend": "Resend",
    "verifySent": "Verification link sent!",
    "verifyError": "Error sending. Please try again later.",
    "authToggleToResetBtn": "Forgot password?",
    "resetTitle": "Reset Password",
    "resetMessage": "Enter your email and we'll send you a link to reset your password.",
    "resetButton": "Send link",
    "resetSent": "Email sent! Check your inbox.",
    "resetError": "Error. Is the email correct?",
    "cookieMessage": "This site uses cookies to save your records and preferences. Do you accept?",
    "cookieButton": "Accept",
    "benefitsTitle": "Why create an account?",
    "benefitsItem1": "Save your records and progress to the cloud.",
    "benefitsItem2": "Compete on the global leaderboard.",
    "benefitsItem3": "Sync your unlocked Pokédex across all devices.",
    "privacyNotice": "By creating an account, you agree that your email, username, and scores will be saved. We do not share your data."
  },
  "es": {
    "title": "Pokéstats - Comparación de Estadísticas",
    "score": "Puntuación",
    "record": "Récord",
    "time": "Tiempo",
    "yes": "Sí",
    "no": "No",
    "gameOver": "¡Fin del juego!",
    "newRecord": "🎉 ¡Nuevo récord!",
    "currentRecord": "Récord actual",
    "close": "Cerrar",
    "timeout": "¡Tiempo agotado!",
    "wrong": "¡Incorrecto!",
    "play": "Jugar",
    "account": "Cuenta",
    "settings": "Ajustes",
    "backToMenu": "Menú",
    "gamesPlayed": "Partidas Jugadas",
    "pokedex": "Pokédex",
    "difficulty": "Dificultad",
    "easy": "Fácil",
    "medium": "Medio",
    "hard": "Difícil",
    "theme": "Tema",
    "system": "Sistema",
    "light": "Claro",
    "dark": "Oscuro",
    "language": "Idioma",
    "search": "Buscar Pokémon...",
    "wins": "gana",
    "question": "¿{pokemon1} tiene más {stat} que {pokemon2}?",
    "chooseModeTitle": "Elige Modo",
    "classicMode": "¿Quién es más fuerte?",
    "sortMode": "¡Ordénalos!",
    "sortQuestion": "Ordena los Pokémon por {stat} (de mayor a menor)",
    "checkOrderButton": "Comprobar",
    "sortWrongOrder": "¡Orden incorrecto!",
    "sortCorrectOrder": "Orden Correcto:",
    "classic": "Clásico",
    "sort": "Ordenar",
    "login": "Iniciar sesión",
    "register": "Registrarse",
    "emailPlaceholder": "Email",
    "passwordPlaceholder": "Contraseña",
    "displayNamePlaceholder": "Nombre de usuario (único)",
    "loginButton": "Acceder",
    "registerButton": "Registrarse",
    "authToggleToRegister": "¿No tienes cuenta?",
    "authToggleToRegisterBtn": "Regístrate",
    "authToggleToLogin": "¿Ya tienes cuenta?",
    "authToggleToLoginBtn": "Acceder",
    "errorFieldRequired": "Por favor, rellena todos los campos.",
    "errorNameLength": "El nombre debe tener entre 3 y 20 caracteres.",
    "errorNameInUse": "Nombre de usuario ya en uso.",
    "errorEmailInUse": "Email ya registrado.",
    "errorWeakPassword": "La contraseña debe tener al menos 6 caracteres.",
    "errorRegisterGeneral": "Error durante el registro.",
    "errorLoginInvalid": "Email o contraseña incorrectos.",
    "errorLoginGeneral": "Error al iniciar sesión.",
    "errorLoginRequired": "Introduce email y contraseña.",
    "errorEmailInvalid": "Introduce un email válido.",
    "statusLoading": "Cargando...",
    "statusRegistering": "Verificando y creando cuenta...",
    "statusLoggingIn": "Iniciando sesión...",
    "statusLoadingUser": "Cargando datos de {email}...",
    "statusLoggedInAs": "Conectado como <strong>{name}</strong>.",
    "statusGuest": "Estás jugando como <strong>Invitado</strong>.",
    "statusBtnLogout": "Cerrar sesión",
    "statusBtnLogin": "Login/Registro",
    "memberSince": "Miembro desde",
    "statusNotVerified": "Email <strong>{email}</strong> no verificado.",
    "statusNotVerifiedBtn": "Reenviar",
    "leaderboard": "Clasificación",
    "leaderboardLoading": "Cargando clasificación...",
    "leaderboardEmpty": "Aún no hay datos.",
    "leaderboardError": "Error al cargar la clasificación.",
    "verifyTitle": "Verifica tu Email",
    "verifyMessage": "Te hemos enviado un enlace de verificación. Revisa tu bandeja de entrada (y spam) y haz clic para activar tu cuenta.",
    "verifyResend": "Reenviar",
    "verifySent": "¡Enlace de verificación enviado!",
    "verifyError": "Error al enviar. Inténtalo más tarde.",
    "authToggleToResetBtn": "¿Contraseña olvidada?",
    "resetTitle": "Restablecer Contraseña",
    "resetMessage": "Introduce tu email y te enviaremos un enlace para restablecer la contraseña.",
    "resetButton": "Enviar enlace",
    "resetSent": "¡Email enviado! Revisa tu bandeja.",
    "resetError": "Error. ¿El email es correcto?",
    "cookieMessage": "Este sitio usa cookies para guardar tus récords y preferencias. ¿Aceptas?",
    "cookieButton": "Aceptar",
    "benefitsTitle": "¿Por qué crear una cuenta?",
    "benefitsItem1": "Guarda tus récords y progreso en la nube.",
    "benefitsItem2": "Compite en la clasificación global.",
    "benefitsItem3": "Sincroniza tu Pokédex desbloqueada en todos los dispositivos.",
    "privacyNotice": "Al crear una cuenta, aceptas que tu email, nombre de usuario y puntuaciones se guarden. No compartimos tus datos."
  },
  "de": {
    "title": "Pokéstats - Statistik-Vergleich",
    "score": "Punktzahl",
    "record": "Rekord",
    "time": "Zeit",
    "yes": "Ja",
    "no": "Nein",
    "gameOver": "Spiel vorbei!",
    "newRecord": "🎉 Neuer Rekord!",
    "currentRecord": "Aktueller Rekord",
    "close": "Schließen",
    "timeout": "Zeit abgelaufen!",
    "wrong": "Falsch!",
    "play": "Spielen",
    "account": "Konto",
    "settings": "Einstellungen",
    "backToMenu": "Menü",
    "gamesPlayed": "Gespielte Spiele",
    "pokedex": "Pokédex",
    "difficulty": "Schwierigkeit",
    "easy": "Leicht",
    "medium": "Mittel",
    "hard": "Schwer",
    "theme": "Thema",
    "system": "System",
    "light": "Hell",
    "dark": "Dunkel",
    "language": "Sprache",
    "search": "Suche Pokémon...",
    "wins": "gewinnt",
    "question": "Hat {pokemon1} mehr {stat} als {pokemon2}?",
    "chooseModeTitle": "Modus wählen",
    "classicMode": "Wer ist stärker?",
    "sortMode": "Sortiere sie!",
    "sortQuestion": "Sortiere die Pokémon nach {stat} (von hoch nach niedrig)",
    "checkOrderButton": "Prüfen",
    "sortWrongOrder": "Falsche Reihenfolge!",
    "sortCorrectOrder": "Richtige Reihenfolge:",
    "classic": "Klassisch",
    "sort": "Sortieren",
    "login": "Anmelden",
    "register": "Registrieren",
    "emailPlaceholder": "E-Mail",
    "passwordPlaceholder": "Passwort",
    "displayNamePlaceholder": "Anzeigename (einzigartig)",
    "loginButton": "Anmelden",
    "registerButton": "Registrieren",
    "authToggleToRegister": "Noch kein Konto?",
    "authToggleToRegisterBtn": "Registrieren",
    "authToggleToLogin": "Bereits ein Konto?",
    "authToggleToLoginBtn": "Anmelden",
    "errorFieldRequired": "Bitte fülle alle Felder aus.",
    "errorNameLength": "Name muss zwischen 3 und 20 Zeichen lang sein.",
    "errorNameInUse": "Benutzername bereits vergeben.",
    "errorEmailInUse": "E-Mail bereits registriert.",
    "errorWeakPassword": "Passwort muss mindestens 6 Zeichen lang sein.",
    "errorRegisterGeneral": "Fehler bei der Registrierung.",
    "errorLoginInvalid": "Falsche E-Mail oder falsches Passwort.",
    "errorLoginGeneral": "Fehler bei der Anmeldung.",
    "errorLoginRequired": "E-Mail und Passwort eingeben.",
    "errorEmailInvalid": "Gültige E-Mail eingeben.",
    "statusLoading": "Wird geladen...",
    "statusRegistering": "Konto wird verifiziert und erstellt...",
    "statusLoggingIn": "Anmeldung läuft...",
    "statusLoadingUser": "Lade Daten für {email}...",
    "statusLoggedInAs": "Angemeldet als <strong>{name}</strong>.",
    "statusGuest": "Du spielst als <strong>Gast</strong>.",
    "statusBtnLogout": "Abmelden",
    "statusBtnLogin": "Anmelden/Registrieren",
    "memberSince": "Mitglied seit",
    "statusNotVerified": "E-Mail <strong>{email}</strong> nicht verifiziert.",
    "statusNotVerifiedBtn": "Erneut senden",
    "leaderboard": "Bestenliste",
    "leaderboardLoading": "Bestenliste wird geladen...",
    "leaderboardEmpty": "Noch keine Daten.",
    "leaderboardError": "Fehler beim Laden der Bestenliste.",
    "verifyTitle": "Bestätige deine E-Mail",
    "verifyMessage": "Wir haben dir einen Bestätigungslink gesendet. Prüfe dein Postfach (und Spam) und klicke auf den Link, um dein Konto zu aktivieren.",
    "verifyResend": "Erneut senden",
    "verifySent": "Bestätigungslink gesendet!",
    "verifyError": "Fehler beim Senden. Bitte später erneut versuchen.",
    "authToggleToResetBtn": "Passwort vergessen?",
    "resetTitle": "Passwort zurücksetzen",
    "resetMessage": "Gib deine E-Mail ein und wir senden dir einen Link zum Zurücksetzen des Passworts.",
    "resetButton": "Link senden",
    "resetSent": "E-Mail gesendet! Prüfe dein Postfach.",
    "resetError": "Fehler. Ist die E-Mail korrekt?",
    "cookieMessage": "Diese Seite verwendet Cookies, um deine Rekorde und Einstellungen zu speichern. Akzeptierst du?",
    "cookieButton": "Akzeptieren",
    "benefitsTitle": "Warum ein Konto erstellen?",
    "benefitsItem1": "Speichere deine Rekorde und Fortschritte in der Cloud.",
    "benefitsItem2": "Tritt in der globalen Bestenliste an.",
    "benefitsItem3": "Synchronisiere deinen freigeschalteten Pokédex auf allen Geräten.",
    "privacyNotice": "Indem du ein Konto erstellst, stimmst du zu, dass deine E-Mail, dein Benutzername und deine Punktzahlen gespeichert werden. Wir geben deine Daten nicht weiter."
  },
  "pt": {
    "title": "Pokéstats - Comparação de Stats",
    "score": "Pontuação",
    "record": "Recorde",
    "time": "Tempo",
    "yes": "Sim",
    "no": "Não",
    "gameOver": "Fim de Jogo!",
    "newRecord": "🎉 Novo Recorde!",
    "currentRecord": "Recorde Atual",
    "close": "Fechar",
    "timeout": "Tempo Esgotado!",
    "wrong": "Errado!",
    "play": "Jogar",
    "account": "Conta",
    "settings": "Configurações",
    "backToMenu": "Menu",
    "gamesPlayed": "Partidas Jogadas",
    "pokedex": "Pokédex",
    "difficulty": "Dificuldade",
    "easy": "Fácil",
    "medium": "Médio",
    "hard": "Difícil",
    "theme": "Tema",
    "system": "Sistema",
    "light": "Claro",
    "dark": "Escuro",
    "language": "Idioma",
    "search": "Procurar Pokémon...",
    "wins": "vence",
    "question": "{pokemon1} tem mais {stat} do que {pokemon2}?",
    "chooseModeTitle": "Escolha o Modo",
    "classicMode": "Quem é mais forte?",
    "sortMode": "Coloque em ordem!",
    "sortQuestion": "Ordene os Pokémon por {stat} (do maior para o menor)",
    "checkOrderButton": "Verificar",
    "sortWrongOrder": "Ordem errada!",
    "sortCorrectOrder": "Ordem Correta:",
    "classic": "Clássico",
    "sort": "Ordenar",
    "login": "Login",
    "register": "Registrar",
    "emailPlaceholder": "Email",
    "passwordPlaceholder": "Senha",
    "displayNamePlaceholder": "Nome de exibição (único)",
    "loginButton": "Entrar",
    "registerButton": "Registrar",
    "authToggleToRegister": "Não tem uma conta?",
    "authToggleToRegisterBtn": "Registre-se",
    "authToggleToLogin": "Já tem uma conta?",
    "authToggleToLoginBtn": "Entrar",
    "errorFieldRequired": "Por favor, preencha todos os campos.",
    "errorNameLength": "O nome deve ter entre 3 e 20 caracteres.",
    "errorNameInUse": "Nome de usuário já em uso.",
    "errorEmailInUse": "Email já registrado.",
    "errorWeakPassword": "A senha deve ter pelo menos 6 caracteres.",
    "errorRegisterGeneral": "Erro durante o registro.",
    "errorLoginInvalid": "Email ou senha incorretos.",
    "errorLoginGeneral": "Erro durante o login.",
    "errorLoginRequired": "Digite email e senha.",
    "errorEmailInvalid": "Digite um email válido.",
    "statusLoading": "Carregando...",
    "statusRegistering": "Verificando e criando conta...",
    "statusLoggingIn": "Entrando...",
    "statusLoadingUser": "Carregando dados de {email}...",
    "statusLoggedInAs": "Logado como <strong>{name}</strong>.",
    "statusGuest": "Você está jogando como <strong>Visitante</strong>.",
    "statusBtnLogout": "Sair",
    "statusBtnLogin": "Login/Registro",
    "memberSince": "Membro desde",
    "statusNotVerified": "Email <strong>{email}</strong> não verificado.",
    "statusNotVerifiedBtn": "Reenviar",
    "leaderboard": "Placar",
    "leaderboardLoading": "Carregando placar...",
    "leaderboardEmpty": "Nenhum dado ainda.",
    "leaderboardError": "Erro ao carregar o placar.",
    "verifyTitle": "Verifique seu Email",
    "verifyMessage": "Enviamos um link de verificação. Verifique sua caixa de entrada (e spam) e clique no link para ativar sua conta.",
    "verifyResend": "Reenviar",
    "verifySent": "Link de verificação enviado!",
    "verifyError": "Erro ao enviar. Tente novamente mais tarde.",
    "authToggleToResetBtn": "Esqueceu a senha?",
    "resetTitle": "Redefinir Senha",
    "resetMessage": "Digite seu email e enviaremos um link para redefinir sua senha.",
    "resetButton": "Enviar link",
    "resetSent": "Email enviado! Verifique sua caixa.",
    "resetError": "Erro. O email está correto?",
    "cookieMessage": "Este site usa cookies para salvar seus recordes e preferências. Você aceita?",
    "cookieButton": "Aceitar",
    "benefitsTitle": "Por que criar uma conta?",
    "benefitsItem1": "Salve seus recordes e progresso na nuvem.",
    "benefitsItem2": "Compita no placar global.",
    "benefitsItem3": "Sincronize sua Pokédex desbloqueada em todos os dispositivos.",
    "privacyNotice": "Ao criar uma conta, você concorda que seu email, nome de usuário e pontuações sejam salvos. Nós não compartilhamos seus dados."
  },
  "fr": {
    "title": "Pokéstats - Comparaison de Stats",
    "score": "Score",
    "record": "Record",
    "time": "Temps",
    "yes": "Oui",
    "no": "Non",
    "gameOver": "Partie terminée !",
    "newRecord": "🎉 Nouveau record !",
    "currentRecord": "Record actuel",
    "close": "Fermer",
    "timeout": "Temps écoulé !",
    "wrong": "Faux !",
    "play": "Jouer",
    "account": "Compte",
    "settings": "Paramètres",
    "backToMenu": "Menu",
    "gamesPlayed": "Parties Jouées",
    "pokedex": "Pokédex",
    "difficulty": "Difficulté",
    "easy": "Facile",
    "medium": "Moyen",
    "hard": "Difficile",
    "theme": "Thème",
    "system": "Système",
    "light": "Clair",
    "dark": "Sombre",
    "language": "Langue",
    "search": "Chercher Pokémon...",
    "wins": "gagne",
    "question": "{pokemon1} a-t-il plus de {stat} que {pokemon2} ?",
    "chooseModeTitle": "Choisir le Mode",
    "classicMode": "Qui est le plus fort ?",
    "sortMode": "Mettez en ordre !",
    "sortQuestion": "Triez les Pokémon par {stat} (du plus élevé au plus bas)",
    "checkOrderButton": "Vérifier",
    "sortWrongOrder": "Ordre incorrect !",
    "sortCorrectOrder": "Ordre Correct :",
    "classic": "Classique",
    "sort": "Trier",
    "login": "Connexion",
    "register": "S'inscrire",
    "emailPlaceholder": "Email",
    "passwordPlaceholder": "Mot de passe",
    "displayNamePlaceholder": "Nom affiché (unique)",
    "loginButton": "Connexion",
    "registerButton": "S'inscrire",
    "authToggleToRegister": "Pas de compte ?",
    "authToggleToRegisterBtn": "S'inscrire",
    "authToggleToLogin": "Déjà un compte ?",
    "authToggleToLoginBtn": "Connexion",
    "errorFieldRequired": "Veuillez remplir tous les champs.",
    "errorNameLength": "Le nom doit contenir entre 3 et 20 caractères.",
    "errorNameInUse": "Nom d'utilisateur déjà pris.",
    "errorEmailInUse": "Email déjà enregistré.",
    "errorWeakPassword": "Le mot de passe doit contenir au moins 6 caractères.",
    "errorRegisterGeneral": "Erreur lors de l'inscription.",
    "errorLoginInvalid": "Email ou mot de passe incorrect.",
    "errorLoginGeneral": "Erreur lors de la connexion.",
    "errorLoginRequired": "Entrez email et mot de passe.",
    "errorEmailInvalid": "Entrez un email valide.",
    "statusLoading": "Chargement...",
    "statusRegistering": "Vérification et création du compte...",
    "statusLoggingIn": "Connexion en cours...",
    "statusLoadingUser": "Chargement des données de {email}...",
    "statusLoggedInAs": "Connecté en tant que <strong>{name}</strong>.",
    "statusGuest": "Vous jouez en tant qu'<strong>Invité</strong>.",
    "statusBtnLogout": "Déconnexion",
    "statusBtnLogin": "Connexion/S'inscrire",
    "memberSince": "Membre depuis",
    "statusNotVerified": "Email <strong>{email}</strong> non vérifié.",
    "statusNotVerifiedBtn": "Renvoyer",
    "leaderboard": "Classement",
    "leaderboardLoading": "Chargement du classement...",
    "leaderboardEmpty": "Pas encore de données.",
    "leaderboardError": "Erreur de chargement du classement.",
    "verifyTitle": "Vérifiez votre Email",
    "verifyMessage": "Nous vous avons envoyé un lien de vérification. Vérifiez votre boîte de réception (et spam) et cliquez sur le lien pour activer votre compte.",
    "verifyResend": "Renvoyer",
    "verifySent": "Lien de vérification envoyé !",
    "verifyError": "Erreur d'envoi. Veuillez réessayer plus tard.",
    "authToggleToResetBtn": "Mot de passe oublié ?",
    "resetTitle": "Réinitialiser le Mot de Passe",
    "resetMessage": "Entrez votre email et nous enverrons un lien pour réinitialiser le mot de passe.",
    "resetButton": "Envoyer le lien",
    "resetSent": "Email envoyé ! Vérifiez votre boîte.",
    "resetError": "Erreur. L'email est-il correct ?",
    "cookieMessage": "Ce site utilise des cookies pour sauvegarder vos records et préférences. Acceptez-vous ?",
    "cookieButton": "Accepter",
    "benefitsTitle": "Pourquoi créer un compte ?",
    "benefitsItem1": "Sauvegardez vos records et progrès sur le cloud.",
    "benefitsItem2": "Participez au classement mondial.",
    "benefitsItem3": "Synchronisez votre Pokédex débloqué sur tous vos appareils.",
    "privacyNotice": "En créant un compte, vous acceptez que votre e-mail, nom d'utilisateur et scores soient enregistrés. Nous ne partageons pas vos données."
  },
  "ru": {
    "title": "Pokéstats - Сравнение Статистики",
    "score": "Счёт",
    "record": "Рекорд",
    "time": "Время",
    "yes": "Да",
    "no": "Нет",
    "gameOver": "Игра окончена!",
    "newRecord": "🎉 Новый рекорд!",
    "currentRecord": "Текущий рекорд",
    "close": "Закрыть",
    "timeout": "Время вышло!",
    "wrong": "Неверно!",
    "play": "Играть",
    "account": "Аккаунт",
    "settings": "Настройки",
    "backToMenu": "Меню",
    "gamesPlayed": "Сыграно игр",
    "pokedex": "Покедекс",
    "difficulty": "Сложность",
    "easy": "Легко",
    "medium": "Средне",
    "hard": "Сложно",
    "theme": "Тема",
    "system": "Система",
    "light": "Светлая",
    "dark": "Тёмная",
    "language": "Язык",
    "search": "Поиск покемона...",
    "wins": "побеждает",
    "question": "У {pokemon1} {stat} выше, чем у {pokemon2}?",
    "chooseModeTitle": "Выберите режим",
    "classicMode": "Кто сильнее?",
    "sortMode": "Отсортируй!",
    "sortQuestion": "Отсортируйте покемонов по {stat} (от высшего к низшему)",
    "checkOrderButton": "Проверить",
    "sortWrongOrder": "Неверный порядок!",
    "sortCorrectOrder": "Верный порядок:",
    "classic": "Классика",
    "sort": "Сортировка",
    "login": "Вход",
    "register": "Регистрация",
    "emailPlaceholder": "Email",
    "passwordPlaceholder": "Пароль",
    "displayNamePlaceholder": "Отображаемое имя (уникальное)",
    "loginButton": "Войти",
    "registerButton": "Зарегистрироваться",
    "authToggleToRegister": "Нет аккаунта?",
    "authToggleToRegisterBtn": "Регистрация",
    "authToggleToLogin": "Уже есть аккаунт?",
    "authToggleToLoginBtn": "Войти",
    "errorFieldRequired": "Пожалуйста, заполните все поля.",
    "errorNameLength": "Имя должно быть от 3 до 20 символов.",
    "errorNameInUse": "Имя пользователя уже занято.",
    "errorEmailInUse": "Email уже зарегистрирован.",
    "errorWeakPassword": "Пароль должен быть не менее 6 символов.",
    "errorRegisterGeneral": "Ошибка при регистрации.",
    "errorLoginInvalid": "Неверный email или пароль.",
    "errorLoginGeneral": "Ошибка при входе.",
    "errorLoginRequired": "Введите email и пароль.",
    "errorEmailInvalid": "Введите корректный email.",
    "statusLoading": "Загрузка...",
    "statusRegistering": "Проверка и создание аккаунта...",
    "statusLoggingIn": "Вход в систему...",
    "statusLoadingUser": "Загрузка данных для {email}...",
    "statusLoggedInAs": "Вы вошли как <strong>{name}</strong>.",
    "statusGuest": "Вы играете как <strong>Гость</strong>.",
    "statusBtnLogout": "Выйти",
    "statusBtnLogin": "Вход/Регистрация",
    "memberSince": "Участник с",
    "statusNotVerified": "Email <strong>{email}</strong> не подтверждён.",
    "statusNotVerifiedBtn": "Отправить снова",
    "leaderboard": "Таблица лидеров",
    "leaderboardLoading": "Загрузка таблицы...",
    "leaderboardEmpty": "Пока нет данных.",
    "leaderboardError": "Ошибка загрузки таблицы.",
    "verifyTitle": "Подтвердите ваш Email",
    "verifyMessage": "Мы отправили вам ссылку для подтверждения. Проверьте почту (и спам) и нажмите на ссылку для активации.",
    "verifyResend": "Отправить снова",
    "verifySent": "Ссылка отправлена!",
    "verifyError": "Ошибка отправки. Попробуйте позже.",
    "authToggleToResetBtn": "Забыли пароль?",
    "resetTitle": "Сброс пароля",
    "resetMessage": "Введите ваш email, и мы отправим ссылку для сброса пароля.",
    "resetButton": "Отправить ссылку",
    "resetSent": "Email отправлен! Проверьте почту.",
    "resetError": "Ошибка. Email корректен?",
    "cookieMessage": "Этот сайт использует cookies для сохранения рекордов и настроек. Вы согласны?",
    "cookieButton": "Принять",
    "benefitsTitle": "Зачем создавать аккаунт?",
    "benefitsItem1": "Сохраняйте рекорды и прогресс в облаке.",
    "benefitsItem2": "Соревнуйтесь в глобальной таблице лидеров.",
    "benefitsItem3": "Синхронизируйте открытый Покедекс на всех устройствах.",
    "privacyNotice": "Создавая аккаунт, вы соглашаетесь на сохранение вашей почты, имени пользователя и очков. Мы не передаём ваши данные."
  },
  "zh": {
    "title": "Pokéstats - 统计数据比较",
    "score": "分数",
    "record": "纪录",
    "time": "时间",
    "yes": "是",
    "no": "否",
    "gameOver": "游戏结束!",
    "newRecord": "🎉 新纪录!",
    "currentRecord": "当前纪录",
    "close": "关闭",
    "timeout": "时间到!",
    "wrong": "错了!",
    "play": "开始游戏",
    "account": "帐户",
    "settings": "设置",
    "backToMenu": "菜单",
    "gamesPlayed": "已玩游戏",
    "pokedex": "宝可梦图鉴",
    "difficulty": "难度",
    "easy": "简单",
    "medium": "中等",
    "hard": "困难",
    "theme": "主题",
    "system": "系统",
    "light": "浅色",
    "dark": "深色",
    "language": "语言",
    "search": "搜索宝可梦...",
    "wins": "获胜",
    "question": "{pokemon1} 的 {stat} 比 {pokemon2} 高吗？",
    "chooseModeTitle": "选择模式",
    "classicMode": "谁更强？",
    "sortMode": "排序！",
    "sortQuestion": "按 {stat} 排序宝可梦（从高到低）",
    "checkOrderButton": "检查",
    "sortWrongOrder": "顺序错误!",
    "sortCorrectOrder": "正确顺序:",
    "classic": "经典",
    "sort": "排序",
    "login": "登录",
    "register": "注册",
    "emailPlaceholder": "电子邮件",
    "passwordPlaceholder": "密码",
    "displayNamePlaceholder": "显示名称 (唯一)",
    "loginButton": "登录",
    "registerButton": "注册",
    "authToggleToRegister": "没有帐户？",
    "authToggleToRegisterBtn": "注册",
    "authToggleToLogin": "已有帐户？",
    "authToggleToLoginBtn": "登录",
    "errorFieldRequired": "请填写所有字段。",
    "errorNameLength": "名称必须在 3 到 20 个字符之间。",
    "errorNameInUse": "用户名已被使用。",
    "errorEmailInUse": "电子邮件已被注册。",
    "errorWeakPassword": "密码必须至少为 6 个字符。",
    "errorRegisterGeneral": "注册时出错。",
    "errorLoginInvalid": "电子邮件或密码不正确。",
    "errorLoginGeneral": "登录时出错。",
    "errorLoginRequired": "请输入电子邮件和密码。",
    "errorEmailInvalid": "请输入有效的电子邮件。",
    "statusLoading": "加载中...",
    "statusRegistering": "正在验证和创建帐户...",
    "statusLoggingIn": "登录中...",
    "statusLoadingUser": "正在加载 {email} 的数据...",
    "statusLoggedInAs": "已登录为 <strong>{name}</strong>。",
    "statusGuest": "您正以 <strong>访客</strong> 身份游玩。",
    "statusBtnLogout": "登出",
    "statusBtnLogin": "登录/注册",
    "memberSince": "会员始于",
    "statusNotVerified": "电子邮件 <strong>{email}</strong> 未验证。",
    "statusNotVerifiedBtn": "重新发送",
    "leaderboard": "排行榜",
    "leaderboardLoading": "正在加载排行榜...",
    "leaderboardEmpty": "暂无数据。",
    "leaderboardError": "加载排行榜时出错。",
    "verifyTitle": "验证您的电子邮件",
    "verifyMessage": "我们已向您发送了验证链接。请检查您的收件箱 (和垃圾邮件) 并单击链接以激活您的帐户。",
    "verifyResend": "重新发送",
    "verifySent": "验证链接已发送！",
    "verifyError": "发送时出错。请稍后再试。",
    "authToggleToResetBtn": "忘记密码？",
    "resetTitle": "重设密码",
    "resetMessage": "请输入您的电子邮件，我们将向您发送一个重设密码的链接。",
    "resetButton": "发送链接",
    "resetSent": "电子邮件已发送！请检查您的收件箱。",
    "resetError": "错误。电子邮件是否正确？",
    "cookieMessage": "本网站使用 cookie 来保存您的纪录和偏好。您接受吗？",
    "cookieButton": "接受",
    "benefitsTitle": "为什么要创建帐户？",
    "benefitsItem1": "将您的纪录和进度保存到云端。",
    "benefitsItem2": "在全球排行榜上竞争。",
    "benefitsItem3": "在所有设备上同步您解锁的宝可梦图鉴。",
    "privacyNotice": "创建帐户即表示您同意我们保存您的电子邮件、用户名和分数。我们不会分享您的数据。"
  },
  "ja": {
    "title": "ポケスタッツ - 統計比較",
    "score": "スコア",
    "record": "記録",
    "time": "時間",
    "yes": "はい",
    "no": "いいえ",
    "gameOver": "ゲームオーバー！",
    "newRecord": "🎉 新記録！",
    "currentRecord": "現在の記録",
    "close": "閉じる",
    "timeout": "時間切れ！",
    "wrong": "間違い！",
    "play": "プレイ",
    "account": "アカウント",
    "settings": "設定",
    "backToMenu": "メニュー",
    "gamesPlayed": "プレイ回数",
    "pokedex": "ポケモン図鑑",
    "difficulty": "難易度",
    "easy": "かんたん",
    "medium": "ふつう",
    "hard": "むずかしい",
    "theme": "テーマ",
    "system": "システム",
    "light": "ライト",
    "dark": "ダーク",
    "language": "言語",
    "search": "ポケモンを検索...",
    "wins": "の勝ち",
    "question": "{pokemon1} は {pokemon2} より {stat} が高いですか？",
    "chooseModeTitle": "モードを選択",
    "classicMode": "どっちが強い？",
    "sortMode": "並べ替え！",
    "sortQuestion": "ポケモンを {stat} 順に並べ替えてください（高い順）",
    "checkOrderButton": "確認",
    "sortWrongOrder": "順序が違います！",
    "sortCorrectOrder": "正しい順序:",
    "classic": "クラシック",
    "sort": "並べ替え",
    "login": "ログイン",
    "register": "登録",
    "emailPlaceholder": "メールアドレス",
    "passwordPlaceholder": "パスワード",
    "displayNamePlaceholder": "表示名 (ユニーク)",
    "loginButton": "ログイン",
    "registerButton": "登録",
    "authToggleToRegister": "アカウントをお持ちでないですか？",
    "authToggleToRegisterBtn": "登録",
    "authToggleToLogin": "すでにアカウントをお持ちですか？",
    "authToggleToLoginBtn": "ログイン",
    "errorFieldRequired": "すべてのフィールドを入力してください。",
    "errorNameLength": "名前は3文字から20文字の間である必要があります。",
    "errorNameInUse": "このユーザー名は既に使用されています。",
    "errorEmailInUse": "このメールアドレスは既に登録されています。",
    "errorWeakPassword": "パスワードは6文字以上である必要があります。",
    "errorRegisterGeneral": "登録中にエラーが発生しました。",
    "errorLoginInvalid": "メールアドレスまたはパスワードが間違っています。",
    "errorLoginGeneral": "ログイン中にエラーが発生しました。",
    "errorLoginRequired": "メールアドレスとパスワードを入力してください。",
    "errorEmailInvalid": "有効なメールアドレスを入力してください。",
    "statusLoading": "読み込み中...",
    "statusRegistering": "確認とアカウント作成中...",
    "statusLoggingIn": "ログイン中...",
    "statusLoadingUser": "{email} のデータを読み込み中...",
    "statusLoggedInAs": "<strong>{name}</strong> としてログイン中。",
    "statusGuest": "<strong>ゲスト</strong> としてプレイ中。",
    "statusBtnLogout": "ログアウト",
    "statusBtnLogin": "ログイン/登録",
    "memberSince": "登録日",
    "statusNotVerified": "メールアドレス <strong>{email}</strong> は未認証です。",
    "statusNotVerifiedBtn": "再送信",
    "leaderboard": "ランキング",
    "leaderboardLoading": "ランキングを読み込み中...",
    "leaderboardEmpty": "まだデータがありません。",
    "leaderboardError": "ランキングの読み込みエラー。",
    "verifyTitle": "メールアドレスの確認",
    "verifyMessage": "確認リンクを送信しました。受信トレイ（と迷惑メール）を確認し、リンクをクリックしてアカウントを有効化してください。",
    "verifyResend": "再送信",
    "verifySent": "確認リンクを送信しました！",
    "verifyError": "送信中にエラーが発生しました。後でもう一度お試しください。",
    "authToggleToResetBtn": "パスワードをお忘れですか？",
    "resetTitle": "パスワードのリセット",
    "resetMessage": "メールアドレスを入力してください。パスワードリセット用のリンクを送信します。",
    "resetButton": "リンクを送信",
    "resetSent": "メールを送信しました！受信トレイを確認してください。",
    "resetError": "エラー。メールアドレスは正しいですか？",
    "cookieMessage": "このサイトは、記録と設定を保存するためにCookieを使用します。同意しますか？",
    "cookieButton": "同意する",
    "benefitsTitle": "アカウントを作成する理由",
    "benefitsItem1": "記録と進捗をクラウドに保存します。",
    "benefitsItem2": "グローバルランキングで競います。",
    "benefitsItem3": "ロック解除したポケモン図鑑をすべてのデバイスで同期します。",
    "privacyNotice": "アカウントを作成することにより、あなたのメールアドレス、ユーザー名、スコアが保存されることに同意したことになります。あなたのデータを共有することはありません。"
  },
  "ko": {
    "title": "Pokéstats - 스탯 비교",
    "score": "점수",
    "record": "기록",
    "time": "시간",
    "yes": "예",
    "no": "아니오",
    "gameOver": "게임 종료!",
    "newRecord": "🎉 신기록!",
    "currentRecord": "현재 기록",
    "close": "닫기",
    "timeout": "시간 초과!",
    "wrong": "틀렸습니다!",
    "play": "플레이",
    "account": "계정",
    "settings": "설정",
    "backToMenu": "메뉴",
    "gamesPlayed": "플레이한 게임",
    "pokedex": "포켓몬 도감",
    "difficulty": "난이도",
    "easy": "쉬움",
    "medium": "보통",
    "hard": "어려움",
    "theme": "테마",
    "system": "시스템",
    "light": "라이트",
    "dark": "다크",
    "language": "언어",
    "search": "포켓몬 검색...",
    "wins": "승리",
    "question": "{pokemon1}의 {stat}이(가) {pokemon2}보다 높습니까?",
    "chooseModeTitle": "모드 선택",
    "classicMode": "누가 더 강할까요?",
    "sortMode": "정렬하세요!",
    "sortQuestion": "포켓몬을 {stat} 순서로 정렬하세요 (높은 순에서 낮은 순으로)",
    "checkOrderButton": "확인",
    "sortWrongOrder": "순서가 틀렸습니다!",
    "sortCorrectOrder": "올바른 순서:",
    "classic": "클래식",
    "sort": "정렬",
    "login": "로그인",
    "register": "회원가입",
    "emailPlaceholder": "이메일",
    "passwordPlaceholder": "비밀번호",
    "displayNamePlaceholder": "표시 이름 (고유)",
    "loginButton": "로그인",
    "registerButton": "회원가입",
    "authToggleToRegister": "계정이 없으신가요?",
    "authToggleToRegisterBtn": "회원가입",
    "authToggleToLogin": "이미 계정이 있으신가요?",
    "authToggleToLoginBtn": "로그인",
    "errorFieldRequired": "모든 칸을 채워주세요.",
    "errorNameLength": "이름은 3자에서 20자 사이여야 합니다.",
    "errorNameInUse": "이미 사용 중인 사용자 이름입니다.",
    "errorEmailInUse": "이미 등록된 이메일입니다.",
    "errorWeakPassword": "비밀번호는 6자 이상이어야 합니다.",
    "errorRegisterGeneral": "회원가입 중 오류가 발생했습니다.",
    "errorLoginInvalid": "이메일 또는 비밀번호가 잘못되었습니다.",
    "errorLoginGeneral": "로그인 중 오류가 발생했습니다.",
    "errorLoginRequired": "이메일과 비밀번호를 입력하세요.",
    "errorEmailInvalid": "유효한 이메일을 입력하세요.",
    "statusLoading": "로드 중...",
    "statusRegistering": "확인 및 계정 생성 중...",
    "statusLoggingIn": "로그인 중...",
    "statusLoadingUser": "{email}의 데이터를 불러오는 중...",
    "statusLoggedInAs": "<strong>{name}</strong>님으로 로그인되었습니다.",
    "statusGuest": "<strong>게스트</strong>로 플레이 중입니다.",
    "statusBtnLogout": "로그아웃",
    "statusBtnLogin": "로그인/회원가입",
    "memberSince": "가입일",
    "statusNotVerified": "이메일 <strong>{email}</strong>이(가) 확인되지 않았습니다.",
    "statusNotVerifiedBtn": "재전송",
    "leaderboard": "리더보드",
    "leaderboardLoading": "리더보드 로드 중...",
    "leaderboardEmpty": "아직 데이터가 없습니다.",
    "leaderboardError": "리더보드 로드 오류.",
    "verifyTitle": "이메일 인증",
    "verifyMessage": "인증 링크를 보냈습니다. 받은 편지함(및 스팸함)을 확인하고 링크를 클릭하여 계정을 활성화하세요.",
    "verifyResend": "재전송",
    "verifySent": "인증 링크가 전송되었습니다!",
    "verifyError": "전송 중 오류가 발생했습니다. 나중에 다시 시도하세요.",
    "authToggleToResetBtn": "비밀번호를 잊으셨나요?",
    "resetTitle": "비밀번호 재설정",
    "resetMessage": "이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.",
    "resetButton": "링크 전송",
    "resetSent": "이메일이 전송되었습니다! 받은 편지함을 확인하세요.",
    "resetError": "오류. 이메일이 정확한가요?",
    "cookieMessage": "이 사이트는 귀하의 기록과 환경 설정을 저장하기 위해 쿠키를 사용합니다. 동의하십니까?",
    "cookieButton": "동의",
    "benefitsTitle": "계정을 만드는 이유",
    "benefitsItem1": "기록과 진행 상황을 클라우드에 저장하세요.",
    "benefitsItem2": "글로벌 리더보드에서 경쟁하세요.",
    "benefitsItem3": "모든 기기에서 잠금 해제된 포켓몬 도감을 동기화하세요.",
    "privacyNotice": "계정을 생성함으로써 귀하의 이메일, 사용자 이름, 점수가 저장되는 데 동의하는 것입니다. 저희는 귀하의 데이터를 공유하지 않습니다."
  },
  "fi": {
    "title": "Pokéstats - Tilastojen Vertailu",
    "score": "Pisteet",
    "record": "Ennätys",
    "time": "Aika",
    "yes": "Kyllä",
    "no": "Ei",
    "gameOver": "Peli ohi!",
    "newRecord": "🎉 Uusi ennätys!",
    "currentRecord": "Nykyinen ennätys",
    "close": "Sulje",
    "timeout": "Aika loppui!",
    "wrong": "Väärin!",
    "play": "Pelaa",
    "account": "Tili",
    "settings": "Asetukset",
    "backToMenu": "Valikko",
    "gamesPlayed": "Pelatut pelit",
    "pokedex": "Pokédex",
    "difficulty": "Vaikeustaso",
    "easy": "Helppo",
    "medium": "Keskivaikea",
    "hard": "Vaikea",
    "theme": "Teema",
    "system": "Järjestelmä",
    "light": "Vaalea",
    "dark": "Tumma",
    "language": "Kieli",
    "search": "Etsi Pokémonia...",
    "wins": "voittaa",
    "question": "Onko {pokemon1}:lla korkeampi {stat} kuin {pokemon2}:lla?",
    "chooseModeTitle": "Valitse Tila",
    "classicMode": "Kuka on vahvempi?",
    "sortMode": "Järjestä!",
    "sortQuestion": "Järjestä Pokémonit {stat}-arvon mukaan (suurimmasta pienimpään)",
    "checkOrderButton": "Tarkista",
    "sortWrongOrder": "Väärä järjestys!",
    "sortCorrectOrder": "Oikea Järjestys:",
    "classic": "Klassinen",
    "sort": "Järjestä",
    "login": "Kirjaudu sisään",
    "register": "Rekisteröidy",
    "emailPlaceholder": "Sähköposti",
    "passwordPlaceholder": "Salasana",
    "displayNamePlaceholder": "Näyttönimi (ainutlaatuinen)",
    "loginButton": "Kirjaudu",
    "registerButton": "Rekisteröidy",
    "authToggleToRegister": "Eikö sinulla ole tiliä?",
    "authToggleToRegisterBtn": "Rekisteröidy",
    "authToggleToLogin": "Onko sinulla jo tili?",
    "authToggleToLoginBtn": "Kirjaudu",
    "errorFieldRequired": "Täytä kaikki kentät.",
    "errorNameLength": "Nimen on oltava 3-20 merkkiä pitkä.",
    "errorNameInUse": "Käyttäjänimi on jo käytössä.",
    "errorEmailInUse": "Sähköposti on jo rekisteröity.",
    "errorWeakPassword": "Salasanan on oltava vähintään 6 merkkiä pitkä.",
    "errorRegisterGeneral": "Virhe rekisteröinnissä.",
    "errorLoginInvalid": "Väärä sähköposti tai salasana.",
    "errorLoginGeneral": "Virhe kirjautumisessa.",
    "errorLoginRequired": "Anna sähköposti ja salasana.",
    "errorEmailInvalid": "Anna kelvollinen sähköpostiosoite.",
    "statusLoading": "Ladataan...",
    "statusRegistering": "Vahvistetaan ja luodaan tiliä...",
    "statusLoggingIn": "Kirjaudutaan sisään...",
    "statusLoadingUser": "Ladataan käyttäjän {email} tietoja...",
    "statusLoggedInAs": "Kirjautuneena käyttäjänä <strong>{name}</strong>.",
    "statusGuest": "Pelaat <strong>Vieraana</strong>.",
    "statusBtnLogout": "Kirjaudu ulos",
    "statusBtnLogin": "Kirjaudu/Rekisteröidy",
    "memberSince": "Jäsen",
    "statusNotVerified": "Sähköpostia <strong>{email}</strong> ei ole vahvistettu.",
    "statusNotVerifiedBtn": "Lähetä uudelleen",
    "leaderboard": "Tulostaulu",
    "leaderboardLoading": "Ladataan tulostaulua...",
    "leaderboardEmpty": "Ei vielä tietoja.",
    "leaderboardError": "Virhe ladattaessa tulostaulua.",
    "verifyTitle": "Vahvista sähköpostisi",
    "verifyMessage": "Lähetimme sinulle vahvistuslinkin. Tarkista sähköpostisi (ja roskaposti) ja napsauta linkkiä aktivoidaksesi tilisi.",
    "verifyResend": "Lähetä uudelleen",
    "verifySent": "Vahvistuslinkki lähetetty!",
    "verifyError": "Virhe lähetyksessä. Yritä myöhemmin uudelleen.",
    "authToggleToResetBtn": "Unohditko salasanan?",
    "resetTitle": "Nollaa salasana",
    "resetMessage": "Anna sähköpostisi, niin lähetämme linkin salasanan nollaamiseksi.",
    "resetButton": "Lähetä linkki",
    "resetSent": "Sähköposti lähetetty! Tarkista postilaatikkosi.",
    "resetError": "Virhe. Onko sähköposti oikein?",
    "cookieMessage": "Tämä sivusto käyttää evästeitä ennätystesi ja asetustesi tallentamiseen. Hyväksytkö?",
    "cookieButton": "Hyväksy",
    "benefitsTitle": "Miksi luoda tili?",
    "benefitsItem1": "Tallenna ennätyksesi ja edistymisesi pilveen.",
    "benefitsItem2": "Kilpaile maailmanlaajuisessa tulostaulussa.",
    "benefitsItem3": "Synkronoi avaamasi Pokédex kaikkiin laitteisiisi.",
    "privacyNotice": "Luomalla tilin hyväksyt, että sähköpostiosoitteesi, käyttäjänimesi ja pisteesi tallennetaan. Emme jaa tietojasi."
  },
    "ar": { "title": "Pokéstats - مقارنة الإحصائيات", "score": "النتيجة", "record": "الرقم القياسي", "time": "الوقت", "yes": "نعم", "no": "لا", "gameOver": "انتهت اللعبة!", "newRecord": "🎉 رقم قياسي جديد!", "currentRecord": "الرقم القياسي الحالي", "close": "إغلاق", "timeout": "انتهى الوقت!", "wrong": "خطأ!", "play": "العب", "account": "الحساب", "settings": "الإعدادات", "backToMenu": "القائمة", "gamesPlayed": "الألعاب الملعوبة", "pokedex": "بوكيدكس", "difficulty": "الصعوبة", "easy": "سهل", "medium": "متوسط", "hard": "صعب", "theme": "المظهر", "system": "النظام", "light": "فاتح", "dark": "داكن", "language": "اللغة", "search": "ابحث عن بوكيمون...", "wins": "يفوز", "question": "هل {pokemon1} لديه {stat} أعلى من {pokemon2}؟", "chooseModeTitle": "اختر الوضع", "classicMode": "من الأقوى؟", "sortMode": "رتبهم!", "sortQuestion": "رتب البوكيمون حسب {stat} (من الأعلى إلى الأدنى)", "checkOrderButton": "تحقق", "sortWrongOrder": "ترتيب خاطئ!", "sortCorrectOrder": "الترتيب الصحيح:", "classic": "كلاسيكي", "sort": "ترتيب", "login": "تسجيل الدخول", "register": "التسجيل", "emailPlaceholder": "البريد الإلكتروني", "passwordPlaceholder": "كلمة المرور", "displayNamePlaceholder": "اسم العرض (فريد)", "loginButton": "دخول", "registerButton": "تسجيل", "authToggleToRegister": "ليس لديك حساب؟", "authToggleToRegisterBtn": "سجل الآن", "authToggleToLogin": "هل لديك حساب بالفعل؟", "authToggleToLoginBtn": "تسجيل الدخول", "errorFieldRequired": "يرجى ملء جميع الحقول.", "errorNameLength": "يجب أن يكون الاسم بين 3 و 20 حرفًا.", "errorNameInUse": "اسم المستخدم مستخدم بالفعل.", "errorEmailInUse": "البريد الإلكتروني مسجل بالفعل.", "errorWeakPassword": "يجب أن تكون كلمة المرور 6 أحرف على الأقل.", "errorRegisterGeneral": "خطأ أثناء التسجيل.", "errorLoginInvalid": "بريد إلكتروني أو كلمة مرور غير صحيحة.", "errorLoginGeneral": "خطأ أثناء تسجيل الدخول.", "errorLoginRequired": "أدخل البريد الإلكتروني وكلمة المرور.", "errorEmailInvalid": "أدخل بريد إلكتروني صالح.", "statusLoading": "جاري التحميل...", "statusRegistering": "التحقق وإنشاء الحساب...", "statusLoggingIn": "جاري تسجيل الدخول...", "statusLoadingUser": "جاري تحميل بيانات {email}...", "statusLoggedInAs": "مسجل الدخول كـ <strong>{name}</strong>.", "statusGuest": "أنت تلعب كـ <strong>ضيف</strong>.", "statusBtnLogout": "تسجيل الخروج", "statusBtnLogin": "تسجيل الدخول/التسجيل", "memberSince": "عضو منذ", "statusNotVerified": "البريد الإلكتروني <strong>{email}</strong> غير مُحقق.", "statusNotVerifiedBtn": "إعادة الإرسال", "leaderboard": "لوحة الصدارة", "leaderboardLoading": "جاري تحميل لوحة الصدارة...", "leaderboardEmpty": "لا توجد بيانات بعد.", "leaderboardError": "خطأ في تحميل لوحة الصدارة.", "verifyTitle": "تحقق من بريدك الإلكتروني", "verifyMessage": "أرسلنا لك رابط تحقق. تحقق من بريدك الوارد (والبريد العشوائي) وانقر على الرابط لتفعيل حسابك.", "verifyResend": "إعادة الإرسال", "verifySent": "تم إرسال رابط التحقق!", "verifyError": "خطأ في الإرسال. يرجى المحاولة لاحقًا.", "authToggleToResetBtn": "هل نسيت كلمة المرور؟", "resetTitle": "إعادة تعيين كلمة المرور", "resetMessage": "أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.", "resetButton": "إرسال الرابط", "resetSent": "تم إرسال البريد الإلكتروني! تحقق من بريدك.", "resetError": "خطأ. هل البريد الإلكتروني صحيح؟", "cookieMessage": "يستخدم هذا الموقع ملفات تعريف الارتباط لحفظ سجلاتك وتفضيلاتك. هل تقبل؟", "cookieButton": "قبول", "benefitsTitle": "لماذا تنشئ حسابًا؟", "benefitsItem1": "احفظ سجلاتك وتقدمك على السحابة.", "benefitsItem2": "نافس في لوحة الصدارة العالمية.", "benefitsItem3": "زامن بوكيدكس المفتوح عبر جميع الأجهزة.", "privacyNotice": "بإنشاء حساب، فإنك توافق على حفظ بريدك الإلكتروني واسم المستخدم والنقاط. نحن لا نشارك بياناتك.", "achievements": "الإنجازات", "sortUnlockTitle": "اختر البوكيمون!", "sortUnlockMessage": "اختر {num} بوكيمون لإضافته إلى بوكيدكس:", "confirmButton": "تأكيد" },
    "hi": { "title": "पोकेस्टैट्स - स्टैट्स तुलना", "score": "स्कोर", "record": "रिकॉर्ड", "time": "समय", "yes": "हाँ", "no": "नहीं", "gameOver": "खेल समाप्त!", "newRecord": "🎉 नया रिकॉर्ड!", "currentRecord": "वर्तमान रिकॉर्ड", "close": "बंद करें", "timeout": "समय समाप्त!", "wrong": "गलत!", "play": "खेलें", "account": "खाता", "settings": "सेटिंग्स", "backToMenu": "मेनू", "gamesPlayed": "खेले गए खेल", "pokedex": "पोकेडेक्स", "difficulty": "कठिनाई", "easy": "सरल", "medium": "मध्यम", "hard": "कठिन", "theme": "थीम", "system": "सिस्टम", "light": "लाइट", "dark": "डार्क", "language": "भाषा", "search": "पोकेमोन खोजें...", "wins": "जीतता है", "question": "क्या {pokemon1} के पास {pokemon2} से ज़्यादा {stat} है?", "chooseModeTitle": "मोड चुनें", "classicMode": "कौन ज़्यादा ताकतवर है?", "sortMode": "उन्हें क्रम में लगाओ!", "sortQuestion": "{stat} के हिसाब से पोकेमोन को क्रमबद्ध करें (उच्च से निम्न)", "checkOrderButton": "जाँचें", "sortWrongOrder": "गलत क्रम!", "sortCorrectOrder": "सही क्रम:", "classic": "क्लासिक", "sort": "क्रमबद्ध करें", "login": "लॉग इन", "register": "रजिस्टर", "emailPlaceholder": "ईमेल", "passwordPlaceholder": "पासवर्ड", "displayNamePlaceholder": "प्रदर्शन नाम (अद्वितीय)", "loginButton": "लॉग इन", "registerButton": "रजिस्टर", "authToggleToRegister": "खाता नहीं है?", "authToggleToRegisterBtn": "रजिस्टर करें", "authToggleToLogin": "पहले से ही खाता है?", "authToggleToLoginBtn": "लॉग इन करें", "errorFieldRequired": "कृपया सभी फ़ील्ड भरें।", "errorNameLength": "नाम 3 से 20 अक्षरों के बीच होना चाहिए।", "errorNameInUse": "उपयोगकर्ता नाम पहले से ही उपयोग में है।", "errorEmailInUse": "ईमेल पहले से ही पंजीकृत है।", "errorWeakPassword": "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।", "errorRegisterGeneral": "पंजीकरण के दौरान त्रुटि।", "errorLoginInvalid": "गलत ईमेल या पासवर्ड।", "errorLoginGeneral": "लॉग इन के दौरान त्रुटि।", "errorLoginRequired": "ईमेल और पासवर्ड दर्ज करें।", "errorEmailInvalid": "मान्य ईमेल दर्ज करें।", "statusLoading": "लोड हो रहा है...", "statusRegistering": "सत्यापन और खाता बनाया जा रहा है...", "statusLoggingIn": "लॉग इन हो रहा है...", "statusLoadingUser": "{email} के लिए डेटा लोड हो रहा है...", "statusLoggedInAs": "<strong>{name}</strong> के रूप में लॉग इन हैं।", "statusGuest": "आप <strong>अतिथि</strong> के रूप में खेल रहे हैं।", "statusBtnLogout": "लॉग आउट", "statusBtnLogin": "लॉग इन/रजिस्टर", "memberSince": "से सदस्य", "statusNotVerified": "ईमेल <strong>{email}</strong> सत्यापित नहीं है।", "statusNotVerifiedBtn": "पुनः भेजें", "leaderboard": "लीडरबोर्ड", "leaderboardLoading": "लीडरबोर्ड लोड हो रहा है...", "leaderboardEmpty": "अभी तक कोई डेटा नहीं।", "leaderboardError": "लीडरबोर्ड लोड करने में त्रुटि।", "verifyTitle": "अपना ईमेल सत्यापित करें", "verifyMessage": "हमने आपको एक सत्यापन लिंक भेजा है। अपना इनबॉक्स (और स्पैम) जांचें और अपना खाता सक्रिय करने के लिए लिंक पर क्लिक करें।", "verifyResend": "पुनः भेजें", "verifySent": "सत्यापन लिंक भेजा गया!", "verifyError": "भेजने में त्रुटि। कृपया बाद में पुनः प्रयास करें।", "authToggleToResetBtn": "पासवर्ड भूल गए?", "resetTitle": "पासवर्ड रीसेट करें", "resetMessage": "अपना ईमेल दर्ज करें और हम आपको पासवर्ड रीसेट करने के लिए एक लिंक भेजेंगे।", "resetButton": "लिंक भेजें", "resetSent": "ईमेल भेजा गया! अपना इनबॉक्स जांचें।", "resetError": "त्रुटि। क्या ईमेल सही है?", "cookieMessage": "यह साइट आपके रिकॉर्ड और वरीयताओं को सहेजने के लिए कुकीज़ का उपयोग करती है। क्या आप स्वीकार करते हैं?", "cookieButton": "स्वीकार करें", "benefitsTitle": "खाता क्यों बनाएं?", "benefitsItem1": "अपने रिकॉर्ड और प्रगति को क्लाउड पर सहेजें।", "benefitsItem2": "वैश्विक लीडरबोर्ड पर प्रतिस्पर्धा करें।", "benefitsItem3": "अपने अनलॉक किए गए पोकेडेक्स को सभी डिवाइसों पर सिंक करें।", "privacyNotice": "खाता बनाकर, आप सहमत हैं कि आपका ईमेल, उपयोगकर्ता नाम और स्कोर सहेजे जाएंगे। हम आपका डेटा साझा नहीं करते हैं।", "achievements": "उपलब्धियां", "sortUnlockTitle": "पोकेमोन चुनें!", "sortUnlockMessage": "अपने पोकेडेक्स में जोड़ने के लिए {num} पोकेमोन चुनें:", "confirmButton": "पुष्टि करें" },
    "bn": { "title": "পোকেস্ট্যাটস - স্ট্যাট তুলনা", "score": "স্কোর", "record": "রেকর্ড", "time": "সময়", "yes": "হ্যাঁ", "no": "না", "gameOver": "খেলা শেষ!", "newRecord": "🎉 নতুন রেকর্ড!", "currentRecord": "বর্তমান রেকর্ড", "close": "বন্ধ করুন", "timeout": "সময় শেষ!", "wrong": "ভুল!", "play": "খেলুন", "account": "অ্যাকাউন্ট", "settings": "সেটিংস", "backToMenu": "মেনু", "gamesPlayed": "খেলানো হয়েছে", "pokedex": "পোকেডেক্স", "difficulty": "কঠিনতা", "easy": "সহজ", "medium": "মাঝারি", "hard": "কঠিন", "theme": "থিম", "system": "সিস্টেম", "light": "হালকা", "dark": "গাঢ়", "language": "ভাষা", "search": "পোকেমন খুঁজুন...", "wins": "জয়ী", "question": "{pokemon1}-এর কি {pokemon2}-এর চেয়ে বেশি {stat} আছে?", "chooseModeTitle": "মোড নির্বাচন করুন", "classicMode": "কে বেশি শক্তিশালী?", "sortMode": "সাজাও!", "sortQuestion": "{stat} অনুযায়ী পোকেমন সাজান (বেশি থেকে কম)", "checkOrderButton": "চেক করুন", "sortWrongOrder": "ভুল ক্রম!", "sortCorrectOrder": "সঠিক ক্রম:", "classic": "ক্লাসিক", "sort": "সাজান", "login": "লগইন", "register": "নিবন্ধন", "emailPlaceholder": "ইমেইল", "passwordPlaceholder": "পাসওয়ার্ড", "displayNamePlaceholder": "প্রদর্শিত নাম (অনন্য)", "loginButton": "লগইন", "registerButton": "নিবন্ধন", "authToggleToRegister": "অ্যাকাউন্ট নেই?", "authToggleToRegisterBtn": "নিবন্ধন করুন", "authToggleToLogin": "ইতিমধ্যে অ্যাকাউন্ট আছে?", "authToggleToLoginBtn": "লগইন করুন", "errorFieldRequired": "অনুগ্রহ করে সমস্ত ক্ষেত্র পূরণ করুন।", "errorNameLength": "নাম ৩ থেকে ২০ অক্ষরের মধ্যে হতে হবে।", "errorNameInUse": "ব্যবহারকারীর নাম ইতিমধ্যে ব্যবহৃত।", "errorEmailInUse": "ইমেইল ইতিমধ্যে নিবন্ধিত।", "errorWeakPassword": "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।", "errorRegisterGeneral": "নিবন্ধনের সময় ত্রুটি।", "errorLoginInvalid": "ভুল ইমেইল বা পাসওয়ার্ড।", "errorLoginGeneral": "লগইন করার সময় ত্রুটি।", "errorLoginRequired": "ইমেইল এবং পাসওয়ার্ড লিখুন।", "errorEmailInvalid": "একটি বৈধ ইমেইল লিখুন।", "statusLoading": "লোড হচ্ছে...", "statusRegistering": "যাচাই এবং অ্যাকাউন্ট তৈরি করা হচ্ছে...", "statusLoggingIn": "লগইন করা হচ্ছে...", "statusLoadingUser": "{email}-এর জন্য ডেটা লোড হচ্ছে...", "statusLoggedInAs": "<strong>{name}</strong> হিসাবে লগইন করা হয়েছে।", "statusGuest": "আপনি <strong>অতিথি</strong> হিসাবে খেলছেন।", "statusBtnLogout": "লগআউট", "statusBtnLogin": "লগইন/নিবন্ধন", "memberSince": "থেকে সদস্য", "statusNotVerified": "ইমেইল <strong>{email}</strong> যাচাই করা হয়নি।", "statusNotVerifiedBtn": "পুনরায় পাঠান", "leaderboard": "লিডারবোর্ড", "leaderboardLoading": "লিডারবোর্ড লোড হচ্ছে...", "leaderboardEmpty": "এখনও কোনও ডেটা নেই।", "leaderboardError": "লিডারবোর্ড লোড করতে ত্রুটি।", "verifyTitle": "আপনার ইমেইল যাচাই করুন", "verifyMessage": "আমরা আপনাকে একটি যাচাইকরণ লিঙ্ক পাঠিয়েছি। আপনার ইনবক্স (এবং স্প্যাম) পরীক্ষা করুন এবং আপনার অ্যাকাউন্ট সক্রিয় করতে লিঙ্কে ক্লিক করুন।", "verifyResend": "পুনরায় পাঠান", "verifySent": "যাচাইকরণ লিঙ্ক পাঠানো হয়েছে!", "verifyError": "পাঠাতে ত্রুটি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।", "authToggleToResetBtn": "পাসওয়ার্ড ভুলে গেছেন?", "resetTitle": "পাসওয়ার্ড রিসেট করুন", "resetMessage": "আপনার ইমেইল লিখুন এবং আমরা আপনাকে পাসওয়ার্ড রিসেট করার জন্য একটি লিঙ্ক পাঠাব।", "resetButton": "লিঙ্ক পাঠান", "resetSent": "ইমেইল পাঠানো হয়েছে! আপনার ইনবক্স পরীক্ষা করুন।", "resetError": "ত্রুটি। ইমেইলটি কি সঠিক?", "cookieMessage": "এই সাইটটি আপনার রেকর্ড এবং পছন্দগুলি সংরক্ষণ করতে কুকি ব্যবহার করে। আপনি কি গ্রহণ করেন?", "cookieButton": "গ্রহণ করুন", "benefitsTitle": "কেন একটি অ্যাকাউন্ট তৈরি করবেন?", "benefitsItem1": "আপনার রেকর্ড এবং অগ্রগতি ক্লাউডে সংরক্ষণ করুন।", "benefitsItem2": "বিশ্বব্যাপী লিডারবোর্ডে প্রতিযোগিতা করুন।", "benefitsItem3": "আপনার আনলক করা পোকেডেক্স সমস্ত ডিভাইসে সিঙ্ক করুন।", "privacyNotice": "একটি অ্যাকাউন্ট তৈরি করে, আপনি সম্মত হচ্ছেন যে আপনার ইমেইল, ব্যবহারকারীর নাম এবং স্কোর সংরক্ষিত হবে। আমরা আপনার ডেটা শেয়ার করি না।", "achievements": "অর্জন", "sortUnlockTitle": "পোকেমন নির্বাচন করুন!", "sortUnlockMessage": "আপনার পোকেডেক্সে যোগ করার জন্য {num} পোকেমন নির্বাচন করুন:", "confirmButton": "নিশ্চিত করুন" },
    "id": { "title": "Pokéstats - Perbandingan Statistik", "score": "Skor", "record": "Rekor", "time": "Waktu", "yes": "Ya", "no": "Tidak", "gameOver": "Permainan Selesai!", "newRecord": "🎉 Rekor Baru!", "currentRecord": "Rekor Saat Ini", "close": "Tutup", "timeout": "Waktu Habis!", "wrong": "Salah!", "play": "Main", "account": "Akun", "settings": "Pengaturan", "backToMenu": "Menu", "gamesPlayed": "Permainan Dimainkan", "pokedex": "Pokédex", "difficulty": "Kesulitan", "easy": "Mudah", "medium": "Sedang", "hard": "Sulit", "theme": "Tema", "system": "Sistem", "light": "Terang", "dark": "Gelap", "language": "Bahasa", "search": "Cari Pokémon...", "wins": "menang", "question": "Apakah {pokemon1} memiliki {stat} lebih tinggi dari {pokemon2}?", "chooseModeTitle": "Pilih Mode", "classicMode": "Siapa yang lebih kuat?", "sortMode": "Urutkan!", "sortQuestion": "Urutkan Pokémon berdasarkan {stat} (dari tertinggi ke terendah)", "checkOrderButton": "Periksa", "sortWrongOrder": "Urutan salah!", "sortCorrectOrder": "Urutan Benar:", "classic": "Klasik", "sort": "Urutkan", "login": "Masuk", "register": "Daftar", "emailPlaceholder": "Email", "passwordPlaceholder": "Kata Sandi", "displayNamePlaceholder": "Nama Tampilan (unik)", "loginButton": "Masuk", "registerButton": "Daftar", "authToggleToRegister": "Belum punya akun?", "authToggleToRegisterBtn": "Daftar", "authToggleToLogin": "Sudah punya akun?", "authToggleToLoginBtn": "Masuk", "errorFieldRequired": "Harap isi semua bidang.", "errorNameLength": "Nama harus antara 3 dan 20 karakter.", "errorNameInUse": "Nama pengguna sudah digunakan.", "errorEmailInUse": "Email sudah terdaftar.", "errorWeakPassword": "Kata sandi harus minimal 6 karakter.", "errorRegisterGeneral": "Error saat registrasi.", "errorLoginInvalid": "Email atau kata sandi salah.", "errorLoginGeneral": "Error saat masuk.", "errorLoginRequired": "Masukkan email dan kata sandi.", "errorEmailInvalid": "Masukkan email yang valid.", "statusLoading": "Memuat...", "statusRegistering": "Memverifikasi dan membuat akun...", "statusLoggingIn": "Masuk...", "statusLoadingUser": "Memuat data untuk {email}...", "statusLoggedInAs": "Masuk sebagai <strong>{name}</strong>.", "statusGuest": "Anda bermain sebagai <strong>Tamu</strong>.", "statusBtnLogout": "Keluar", "statusBtnLogin": "Masuk/Daftar", "memberSince": "Anggota sejak", "statusNotVerified": "Email <strong>{email}</strong> belum diverifikasi.", "statusNotVerifiedBtn": "Kirim Ulang", "leaderboard": "Papan Peringkat", "leaderboardLoading": "Memuat papan peringkat...", "leaderboardEmpty": "Belum ada data.", "leaderboardError": "Error memuat papan peringkat.", "verifyTitle": "Verifikasi Email Anda", "verifyMessage": "Kami telah mengirimkan link verifikasi. Periksa kotak masuk (dan spam) Anda dan klik link tersebut untuk mengaktifkan akun Anda.", "verifyResend": "Kirim Ulang", "verifySent": "Link verifikasi terkirim!", "verifyError": "Error mengirim. Silakan coba lagi nanti.", "authToggleToResetBtn": "Lupa kata sandi?", "resetTitle": "Atur Ulang Kata Sandi", "resetMessage": "Masukkan email Anda dan kami akan mengirimkan link untuk mengatur ulang kata sandi Anda.", "resetButton": "Kirim Link", "resetSent": "Email terkirim! Periksa kotak masuk Anda.", "resetError": "Error. Apakah emailnya benar?", "cookieMessage": "Situs ini menggunakan cookie untuk menyimpan rekor dan preferensi Anda. Apakah Anda setuju?", "cookieButton": "Setuju", "benefitsTitle": "Mengapa membuat akun?", "benefitsItem1": "Simpan rekor dan kemajuan Anda ke cloud.", "benefitsItem2": "Bersaing di papan peringkat global.", "benefitsItem3": "Sinkronkan Pokédex yang telah Anda buka di semua perangkat.", "privacyNotice": "Dengan membuat akun, Anda setuju bahwa email, nama pengguna, dan skor Anda akan disimpan. Kami tidak membagikan data Anda.", "achievements": "Pencapaian", "sortUnlockTitle": "Pilih Pokémon!", "sortUnlockMessage": "Pilih {num} Pokémon untuk ditambahkan ke Pokédex Anda:", "confirmButton": "Konfirmasi" },
    // ... (statNames)
      // Nomi delle Statistiche per tutte le lingue
      "statNames": {
        "it": { "hp": "HP", "attack": "Attacco", "defense": "Difesa", "spattack": "Attacco Speciale", "spdefense": "Difesa Speciale", "speed": "Velocità" },
        "en": { "hp": "HP", "attack": "Attack", "defense": "Defense", "spattack": "Sp. Attack", "spdefense": "Sp. Defense", "speed": "Speed" },
        "es": { "hp": "HP", "attack": "Ataque", "defense": "Defensa", "spattack": "Atq. Esp.", "spdefense": "Def. Esp.", "speed": "Velocidad" },
        "de": { "hp": "KP", "attack": "Angriff", "defense": "Verteidigung", "spattack": "Spezial-Angriff", "spdefense": "Spezial-Verteidigung", "speed": "Initiative" },
        "pt": { "hp": "HP", "attack": "Ataque", "defense": "Defesa", "spattack": "Ataque Esp.", "spdefense": "Defesa Esp.", "speed": "Velocidade" },
        "fr": { "hp": "PV", "attack": "Attaque", "defense": "Défense", "spattack": "Attaque Spé.", "spdefense": "Défense Spé.", "speed": "Vitesse" },
        "ru": { "hp": "ОЗ", "attack": "Атака", "defense": "Защита", "spattack": "Спец. Атака", "spdefense": "Спец. Защита", "speed": "Скорость" },
        "zh": { "hp": "HP", "attack": "攻击", "defense": "防御", "spattack": "特攻", "spdefense": "特防", "speed": "速度" },
        "ja": { "hp": "HP", "attack": "こうげき", "defense": "ぼうぎょ", "spattack": "とくこう", "spdefense": "とくぼう", "speed": "すばやさ" },
        "ko": { "hp": "HP", "attack": "공격", "defense": "방어", "spattack": "특수공격", "spdefense": "특수방어", "speed": "스피드" },
        "fi": { "hp": "HP", "attack": "Hyökkäys", "defense": "Puolustus", "spattack": "Erikoishyökkäys", "spdefense": "Erikoispuolustus", "speed": "Nopeus" },
        "ar": { "hp": "HP", "attack": "هجوم", "defense": "دفاع", "spattack": "هجوم خاص", "spdefense": "دفاع خاص", "speed": "سرعة" },
        "hi": { "hp": "HP", "attack": "हमला", "defense": "रक्षा", "spattack": "विशेष हमला", "spdefense": "विशेष रक्षा", "speed": "गति" },
        "bn": { "hp": "HP", "attack": "আক্রমণ", "defense": "প্রতিরক্ষা", "spattack": "বিশেষ আক্রমণ", "spdefense": "বিশেষ প্রতিরক্ষা", "speed": "গতি" },
        "id": { "hp": "HP", "attack": "Serangan", "defense": "Pertahanan", "spattack": "Serangan Khusus", "spdefense": "Pertahanan Khusus", "speed": "Kecepatan" }
          
      }
    };

    const genRanges = {
  1: { start: 1, end: 151 }, 2: { start: 152, end: 251 },
  3: { start: 252, end: 386 }, 4: { start: 387, end: 493 },
  5: { start: 494, end: 649 }, 
  6: { start: 650, end: 721 }, 7: { start: 722, end: 809 },
  8: { start: 810, end: 905 }, 9: { start: 906, end: 1025 }
};

const achievementDefinitions = {
  "kanto_master": { gen: 1, titleKey: "ach_kanto_master_title", descKey: "ach_kanto_master_desc", hidden: true, icon: "🏆" },
  "johto_master": { gen: 2, titleKey: "ach_johto_master_title", descKey: "ach_johto_master_desc", hidden: true, icon: "🏆" },
  "hoenn_master": { gen: 3, titleKey: "ach_hoenn_master_title", descKey: "ach_hoenn_master_desc", hidden: true, icon: "🏆" },
  "sinnoh_master": { gen: 4, titleKey: "ach_sinnoh_master_title", descKey: "ach_sinnoh_master_desc", hidden: true, icon: "🏆" },
  "unima_master": { gen: 5, titleKey: "ach_unima_master_title", descKey: "ach_unima_master_desc", hidden: true, icon: "🏆" },
  "kalos_master": { gen: 6, titleKey: "ach_kalos_master_title", descKey: "ach_kalos_master_desc", hidden: true, icon: "🏆" },
  "alola_master": { gen: 7, titleKey: "ach_alola_master_title", descKey: "ach_alola_master_desc", hidden: true, icon: "🏆" },
  "galar_master": { gen: 8, titleKey: "ach_galar_master_title", descKey: "ach_galar_master_desc", hidden: true, icon: "🏆" },
  "paldea_master": { gen: 9, titleKey: "ach_paldea_master_title", descKey: "ach_paldea_master_desc", hidden: true, icon: "🏆" },
  "pokemon_master": { titleKey: "ach_pokemon_master_title", descKey: "ach_pokemon_master_desc", hidden: true, icon: "👑" },
  "first_step": { titleKey: "ach_first_step_title", descKey: "ach_first_step_desc", hidden: false, icon: "👟" },
  "newbie": { score: 5, titleKey: "ach_newbie_title", descKey: "ach_newbie_desc", hidden: false, icon: "🥉" },
  "good_enough": { score: 10, titleKey: "ach_good_enough_title", descKey: "ach_good_enough_desc", hidden: false, icon: "🥈" },
  "impressive": { score: 30, titleKey: "ach_impressive_title", descKey: "ach_impressive_desc", hidden: false, icon: "🥇" },
  "mr_pokedex": { score: 100, titleKey: "ach_mr_pokedex_title", descKey: "ach_mr_pokedex_desc", hidden: false, icon: "🌟" },
  "chromatic": { id: "chromatic", titleKey: "ach_chromatic_title", descKey: "ach_chromatic_desc", hidden: true, icon: "✨" },
  "conga": { id: "conga", pokemonId: 132, titleKey: "ach_conga_title", descKey: "ach_conga_desc", hidden: true, icon: "🧬" },
  "missing_number": { id: "missing_number", pokemonId: 0, titleKey: "ach_missing_number_title", descKey: "ach_missing_number_desc", hidden: true, icon: "#️" },
  "almighty": { id: "almighty", pokemonId: 493, titleKey: "ach_almighty_title", descKey: "ach_almighty_desc", hidden: true, icon: "⚖️" }
};

    const flagEmojis = {
      "it": "🇮🇹", "en": "🇬🇧", "es": "🇪🇸", "de": "🇩🇪", "pt": "🇵🇹", "fr": "🇫🇷", "ru": "🇷🇺", "zh": "🇨🇳", "ja": "🇯🇵", "ko": "🇰🇷", "fi": "🇫🇮", "ar": "🇦🇪", "hi": "🇮🇳", "bn": "🇧🇩", "id": "🇮🇩"
    };

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
    unlockedAchievements: []
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
        
        if (document.getElementById("accountContainer").style.display === "block") {
          displayPokedex(pokemonList);
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
      });

      themeSelect.addEventListener("change", (e) => {
        const newTheme = e.target.value;
        localStorage.setItem(THEME_KEY, newTheme);
        applyTheme(newTheme);
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

    // USA LE CHIAVI DI TRADUZIONE
    const title = t[def.titleKey] || def.titleKey || "???";
    const desc = (isUnlocked || !def.hidden) ? (t[def.descKey] || def.descKey || "...") : "???";

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
        // MODIFICATO: Mostra un riepilogo (o il punteggio più alto)
        // Calcola il punteggio più alto in assoluto per semplicità
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
        
        if(document.getElementById('pokedexSearch')) {
            document.getElementById('pokedexSearch').value = "";
            document.getElementById('pokedexFilterStatus').value = "all";
            document.getElementById('pokedexFilterRegion').value = "all";
        }
        updatePokedexView(); // Chiama la nuova funzione
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

    // Listener Ricerca Pokédex (e filtri)
searchInput.addEventListener('input', updatePokedexView);
document.getElementById('pokedexFilterStatus').addEventListener('change', updatePokedexView);
document.getElementById('pokedexFilterRegion').addEventListener('change', updatePokedexView);

// Funzione unica per aggiornare la vista del Pokédex
function updatePokedexView() {
  if (!pokedexGrid) return; // Non aggiornare se non siamo nella pagina
  const term = searchInput.value.toLowerCase();
  const status = document.getElementById('pokedexFilterStatus').value;
  const region = document.getElementById('pokedexFilterRegion').value;

  // 1. Filter by Search Term
  let filtered = pokemonList.filter(p => p.name.toLowerCase().includes(term));

  // 2. Filter by Status
  if (status === 'unlocked') {
    filtered = filtered.filter(p => unlockedPokemon.includes(p.id));
  } else if (status === 'locked') {
    filtered = filtered.filter(p => !unlockedPokemon.includes(p.id));
  }
  // 'all' does nothing

  // 3. Filter by Region
  if (region !== 'all') {
    const gen = parseInt(region);
    if (genRanges[gen]) {
      const { start, end } = genRanges[gen];
      filtered = filtered.filter(p => p.id >= start && p.id <= end);
    }
  }

  // 4. Display the result
  displayPokedex(filtered);
}

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






