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

// --- VARIABILI GLOBALI ---
let pokemonList = [];
let unlockedPokemon = []; 
let score = 0;
let gameOver = false;
let timer;
let timeLeft = 10;
let t = {}; 
let lang = "it";
let difficulty = "easy";
let currentComparison = null; 

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
      "it": {
        "title": "Gioco Pokémon - Confronto Statistiche", "score": "Punteggio", "record": "Record", "time": "Tempo", "yes": "Sì", "no": "No", "gameOver": "Game Over!", "newRecord": "🎉 Nuovo record!", "currentRecord": "Record attuale", "close": "Chiudi", "timeout": "Tempo scaduto!", "wrong": "Hai sbagliato!", "play": "Gioca", "account": "Account", "settings": "Impostazioni", "backToMenu": "Menu", "gamesPlayed": "Partite Giocate", "pokedex": "Pokédex", "difficulty": "Difficoltà", "easy": "Facile", "medium": "Medio", "hard": "Difficile", "theme": "Tema", "system": "Sistema", "light": "Chiaro", "dark": "Scuro", "language": "Lingua", "search": "Cerca Pokémon...", "wins": "vince",
        "question": "{pokemon1} ha più {stat} di {pokemon2}?",
        "login": "Login", "register": "Registrati", "emailPlaceholder": "Email", "passwordPlaceholder": "Password", "displayNamePlaceholder": "Nome visualizzato (unico)", "loginButton": "Accedi", "registerButton": "Registrati", "authToggleToRegister": "Non hai un account?", "authToggleToRegisterBtn": "Registrati", "authToggleToLogin": "Hai già un account?", "authToggleToLoginBtn": "Accedi",
        "errorFieldRequired": "Compila tutti i campi.", "errorNameLength": "Il nome deve essere tra 3 e 20 caratteri.", "errorNameInUse": "Nome utente già utilizzato.", "errorEmailInUse": "Email già registrata.", "errorWeakPassword": "La password deve essere di almeno 6 caratteri.", "errorRegisterGeneral": "Errore durante la registrazione.", "errorLoginInvalid": "Email o password errati.", "errorLoginGeneral": "Errore during il login.", "errorLoginRequired": "Inserisci email e password.", "errorEmailInvalid": "Inserisci un'email valida.",
        "statusLoading": "Caricamento...", "statusRegistering": "Verifica e creazione account...", "statusLoggingIn": "Accesso in corso...", "statusLoadingUser": "Caricamento dati di {email}...", "statusLoggedInAs": "Loggato come <strong>{name}</strong>.", "statusGuest": "Stai giocando come <strong>Ospite</strong>.", "statusBtnLogout": "Logout", "statusBtnLogin": "Login/Registrati", "memberSince": "Membro dal", "statusNotVerified": "Email <strong>{email}</strong> non verificata.", "statusNotVerifiedBtn": "Invia di nuovo",
        "leaderboard": "Classifica", "leaderboardLoading": "Caricamento classifica...", "leaderboardEmpty": "Nessun dato ancora.", "leaderboardError": "Errore nel caricamento.",
        "verifyTitle": "Verifica la tua Email", "verifyMessage": "Ti abbiamo inviato un link di verifica. Controlla la tua casella di posta (e spam) e clicca sul link per attivare il tuo account.", "verifyResend": "Invia di nuovo", "verifySent": "Link di verifica inviato!", "verifyError": "Errore durante l'invio. Riprova più tardi.",
        "authToggleToResetBtn": "Password dimenticata?", "resetTitle": "Recupera Password", "resetMessage": "Inserisci la tua email e ti invieremo un link per resettare la password.", "resetButton": "Invia link", "resetSent": "Email inviata! Controlla la tua casella.", "resetError": "Errore. L'email è corretta?",
        "cookieMessage": "Questo sito usa cookie per salvare i tuoi record e preferenze. Accetti?", "cookieButton": "Accetta",
        "benefitsTitle": "Perché creare un account?", "benefitsItem1": "Salva i tuoi record e progressi sul cloud.", "benefitsItem2": "Competi nella classifica globale.", "benefitsItem3": "Sincronizza il tuo Pokédex sbloccato su tutti i dispositivi.",
        "privacyNotice": "Creando un account, accetti che la tua email, nome utente e punteggi vengano salvati. Non condividiamo i tuoi dati."
      },
      "en": {
        "title": "Pokémon Game - Stat Comparison", "score": "Score", "record": "High Score", "time": "Time", "yes": "Yes", "no": "No", "gameOver": "Game Over!", "newRecord": "🎉 New Record!", "currentRecord": "Current record", "close": "Close", "timeout": "Time’s up!", "wrong": "Wrong!", "play": "Play", "account": "Account", "settings": "Settings", "backToMenu": "Menu", "gamesPlayed": "Games Played", "pokedex": "Pokédex", "difficulty": "Difficulty", "easy": "Easy", "medium": "Medium", "hard": "Hard", "theme": "Theme", "system": "System", "light": "Light", "dark": "Dark", "language": "Language", "search": "Search Pokémon...", "wins": "wins",
        "question": "Does {pokemon1} have more {stat} than {pokemon2}?",
        "login": "Login", "register": "Register", "emailPlaceholder": "Email", "passwordPlaceholder": "Password", "displayNamePlaceholder": "Display name (unique)", "loginButton": "Login", "registerButton": "Register", "authToggleToRegister": "Don't have an account?", "authToggleToRegisterBtn": "Register", "authToggleToLogin": "Already have an account?", "authToggleToLoginBtn": "Login",
        "errorFieldRequired": "Please fill all fields.", "errorNameLength": "Name must be between 3 and 20 characters.", "errorNameInUse": "Username already taken.", "errorEmailInUse": "Email already in use.", "errorWeakPassword": "Password must be at least 6 characters.", "errorRegisterGeneral": "Error during registration.", "errorLoginInvalid": "Incorrect email or password.", "errorLoginGeneral": "Error during login.", "errorLoginRequired": "Please enter email and password.", "errorEmailInvalid": "Please enter a valid email.",
        "statusLoading": "Loading...", "statusRegistering": "Checking name and creating account...", "statusLoggingIn": "Logging in...", "statusLoadingUser": "Loading data for {email}...", "statusLoggedInAs": "Logged in as <strong>{name}</strong>.", "statusGuest": "You are playing as <strong>Guest</strong>.", "statusBtnLogout": "Logout", "statusBtnLogin": "Login/Register", "memberSince": "Member since", "statusNotVerified": "Email <strong>{email}</strong> not verified.", "statusNotVerifiedBtn": "Resend",
        "leaderboard": "Leaderboard", "leaderboardLoading": "Loading leaderboard...", "leaderboardEmpty": "No data yet.", "leaderboardError": "Error loading leaderboard.",
        "verifyTitle": "Verify Your Email", "verifyMessage": "We sent you a verification link. Check your inbox (and spam) and click the link to activate your account.", "verifyResend": "Resend", "verifySent": "Verification link sent!", "verifyError": "Error sending link. Please try again later.",
        "authToggleToResetBtn": "Forgot password?", "resetTitle": "Recover Password", "resetMessage": "Enter your email and we'll send a link to reset your password.", "resetButton": "Send link", "resetSent": "Email sent! Check your inbox.", "resetError": "Error. Is the email correct?",
        "cookieMessage": "This site uses cookies to save your scores and preferences. Do you accept?", "cookieButton": "Accept",
        "benefitsTitle": "Why create an account?", "benefitsItem1": "Save your high scores and progress to the cloud.", "benefitsItem2": "Compete on the global leaderboard.", "benefitsItem3": "Sync your unlocked Pokédex across all devices.",
        "privacyNotice": "By creating an account, you agree to have your email, username, and scores stored. We do not share your data."
      },
      "es": {
        "title": "Juego Pokémon - Comparar Stats", "score": "Puntuación", "record": "Récord", "time": "Tiempo", "yes": "Sí", "no": "No", "gameOver": "¡Fin del juego!", "newRecord": "🎉 ¡Nuevo récord!", "currentRecord": "Récord actual", "close": "Cerrar", "timeout": "¡Se acabó el tiempo!", "wrong": "¡Incorrecto!", "play": "Jugar", "account": "Cuenta", "settings": "Ajustes", "backToMenu": "Menú", "gamesPlayed": "Partidas Jugadas", "pokedex": "Pokédex", "difficulty": "Dificultad", "easy": "Fácil", "medium": "Medio", "hard": "Difícil", "theme": "Tema", "system": "Sistema", "light": "Claro", "dark": "Oscuro", "language": "Idioma", "search": "Buscar Pokémon...", "wins": "gana",
        "question": "¿{pokemon1} tiene más {stat} que {pokemon2}?",
        "login": "Iniciar Sesión", "register": "Registrarse", "emailPlaceholder": "Correo", "passwordPlaceholder": "Contraseña", "displayNamePlaceholder": "Nombre de usuario (único)", "loginButton": "Iniciar Sesión", "registerButton": "Registrarse", "authToggleToRegister": "¿No tienes una cuenta?", "authToggleToRegisterBtn": "Registrarse", "authToggleToLogin": "¿Ya tienes una cuenta?", "authToggleToLoginBtn": "Iniciar Sesión",
        "errorFieldRequired": "Por favor, rellena todos los campos.", "errorNameLength": "El nombre debe tener entre 3 y 20 caracteres.", "errorNameInUse": "Nombre de usuario ya existe.", "errorEmailInUse": "Correo ya en uso.", "errorWeakPassword": "La contraseña debe tener al menos 6 caracteres.", "errorRegisterGeneral": "Error during el registro.", "errorLoginInvalid": "Correo o contraseña incorrectos.", "errorLoginGeneral": "Error al iniciar sesión.", "errorLoginRequired": "Por favor, introduce correo y contraseña.", "errorEmailInvalid": "Introduce un correo válido.",
        "statusLoading": "Cargando...", "statusRegistering": "Verificando nombre y creando cuenta...", "statusLoggingIn": "Iniciando sesión...", "statusLoadingUser": "Cargando datos de {email}...", "statusLoggedInAs": "Sesión iniciada como <strong>{name}</strong>.", "statusGuest": "Estás jugando como <strong>Invitado</strong>.", "statusBtnLogout": "Cerrar Sesión", "statusBtnLogin": "Login/Registrar", "memberSince": "Miembro desde", "statusNotVerified": "Email <strong>{email}</strong> no verificado.", "statusNotVerifiedBtn": "Reenviar",
        "leaderboard": "Clasificación", "leaderboardLoading": "Cargando clasificación...", "leaderboardEmpty": "No hay datos.", "leaderboardError": "Error al cargar.",
        "verifyTitle": "Verifica tu Correo", "verifyMessage": "Te enviamos un enlace de verificación. Revisa tu bandeja de entrada (y spam) y haz clic para activar tu cuenta.", "verifyResend": "Reenviar", "verifySent": "¡Enlace de verificación enviado!", "verifyError": "Error al enviar. Inténtalo más tarde.",
        "authToggleToResetBtn": "¿Contraseña olvidada?", "resetTitle": "Recuperar Contraseña", "resetMessage": "Introduce tu correo y te enviaremos un enlace para resetear tu contraseña.", "resetButton": "Enviar enlace", "resetSent": "¡Correo enviado! Revisa tu bandeja.", "resetError": "Error. ¿El correo es correcto?",
        "cookieMessage": "Este sitio usa cookies para guardar tus récords y preferencias. ¿Aceptas?", "cookieButton": "Aceptar",
        "benefitsTitle": "¿Por qué crear una cuenta?", "benefitsItem1": "Guarda tus récords y progreso en la nube.", "benefitsItem2": "Compite en la clasificación global.", "benefitsItem3": "Sincroniza tu Pokédex en todos tus dispositivos.",
        "privacyNotice": "Al crear una cuenta, aceptas que tu correo, nombre y puntuaciones se guarden. No compartimos tus datos."
      },
      "de": {
        "title": "Pokémon-Spiel - Statistikvergleich", "score": "Punkte", "record": "Rekord", "time": "Zeit", "yes": "Ja", "no": "Nein", "gameOver": "Spiel vorbei!", "newRecord": "🎉 Neuer Rekord!", "currentRecord": "Aktueller Rekord", "close": "Schließen", "timeout": "Zeit ist um!", "wrong": "Falsch!", "play": "Spielen", "account": "Konto", "settings": "Einstellungen", "backToMenu": "Menü", "gamesPlayed": "Gespielte Spiele", "pokedex": "Pokédex", "difficulty": "Schwierigkeit", "easy": "Einfach", "medium": "Mittel", "hard": "Schwer", "theme": "Thema", "system": "System", "light": "Hell", "dark": "Dunkel", "language": "Sprache", "search": "Pokémon suchen...", "wins": "gewinnt",
        "question": "Hat {pokemon1} mehr {stat} als {pokemon2}?",
        "login": "Anmelden", "register": "Registrieren", "emailPlaceholder": "E-Mail", "passwordPlaceholder": "Passwort", "displayNamePlaceholder": "Anzeigename (einzigartig)", "loginButton": "Anmelden", "registerButton": "Registrieren", "authToggleToRegister": "Kein Konto?", "authToggleToRegisterBtn": "Registrieren", "authToggleToLogin": "Bereits ein Konto?", "authToggleToLoginBtn": "Anmelden",
        "errorFieldRequired": "Bitte alle Felder ausfüllen.", "errorNameLength": "Name muss zwischen 3 und 20 Zeichen lang sein.", "errorNameInUse": "Benutzername bereits vergeben.", "errorEmailInUse": "E-Mail wird bereits verwendet.", "errorWeakPassword": "Passwort muss mindestens 6 Zeichen lang sein.", "errorRegisterGeneral": "Fehler bei der Registrierung.", "errorLoginInvalid": "Falsche E-Mail oder falsches Passwort.", "errorLoginGeneral": "Fehler beim Anmelden.", "errorLoginRequired": "Bitte E-Mail und Passwort eingeben.", "errorEmailInvalid": "Bitte gib eine gültige E-Mail ein.",
        "statusLoading": "Laden...", "statusRegistering": "Prüfe Namen und erstelle Konto...", "statusLoggingIn": "Anmelden...", "statusLoadingUser": "Lade Daten für {email}...", "statusLoggedInAs": "Angemeldet als <strong>{name}</strong>.", "statusGuest": "Du spielst als <strong>Gast</strong>.", "statusBtnLogout": "Abmelden", "statusBtnLogin": "Anmelden/Registrieren", "memberSince": "Mitglied seit", "statusNotVerified": "E-Mail <strong>{email}</strong> nicht verifiziert.", "statusNotVerifiedBtn": "Erneut senden",
        "leaderboard": "Bestenliste", "leaderboardLoading": "Bestenliste wird geladen...", "leaderboardEmpty": "Noch keine Daten.", "leaderboardError": "Fehler beim Laden.",
        "verifyTitle": "E-Mail bestätigen", "verifyMessage": "Wir haben dir einen Link gesendet. Prüfe dein Postfach (und Spam) und klicke auf den Link, um dein Konto zu aktivieren.", "verifyResend": "Erneut senden", "verifySent": "Bestätigungslink gesendet!", "verifyError": "Fehler beim Senden. Bitte später erneut versuchen.",
        "authToggleToResetBtn": "Passwort vergessen?", "resetTitle": "Passwort wiederherstellen", "resetMessage": "Gib deine E-Mail ein und wir senden dir einen Link zum Zurücksetzen.", "resetButton": "Link senden", "resetSent": "E-Mail gesendet! Prüfe dein Postfach.", "resetError": "Fehler. Ist die E-Mail korrekt?",
        "cookieMessage": "Diese Seite verwendet Cookies, um deine Rekorde und Einstellungen zu speichern. Akzeptieren?", "cookieButton": "Akzeptieren",
        "benefitsTitle": "Warum ein Konto erstellen?", "benefitsItem1": "Speichere deine Rekorde und Fortschritte in der Cloud.", "benefitsItem2": "Nimm an der globalen Bestenliste teil.", "benefitsItem3": "Synchronisiere deinen Pokédex auf allen Geräten.",
        "privacyNotice": "Mit der Erstellung eines Kontos erklärst du dich damit einverstanden, dass deine E-Mail, dein Name und deine Punktzahlen gespeichert werden. Wir geben deine Daten nicht weiter."
      },
      "pt": {
        "title": "Jogo Pokémon - Comparação de Estatísticas", "score": "Pontuação", "record": "Recorde", "time": "Tempo", "yes": "Sim", "no": "Não", "gameOver": "Fim de jogo!", "newRecord": "🎉 Novo recorde!", "currentRecord": "Recorde atual", "close": "Fechar", "timeout": "Tempo esgotado!", "wrong": "Errado!", "play": "Jogar", "account": "Conta", "settings": "Configurações", "backToMenu": "Menu", "gamesPlayed": "Jogos Jogados", "pokedex": "Pokédex", "difficulty": "Dificuldade", "easy": "Fácil", "medium": "Médio", "hard": "Difícil", "theme": "Tema", "system": "Sistema", "light": "Claro", "dark": "Escuro", "language": "Idioma", "search": "Pesquisar Pokémon...", "wins": "vence",
        "question": "{pokemon1} tem mais {stat} do que {pokemon2}?",
        "login": "Login", "register": "Registrar", "emailPlaceholder": "Email", "passwordPlaceholder": "Senha", "displayNamePlaceholder": "Nome de usuário (único)", "loginButton": "Login", "registerButton": "Registrar", "authToggleToRegister": "Não tem uma conta?", "authToggleToRegisterBtn": "Registrar", "authToggleToLogin": "Já tem uma conta?", "authToggleToLoginBtn": "Login",
        "errorFieldRequired": "Por favor, preencha todos os campos.", "errorNameLength": "O nome deve ter entre 3 e 20 caracteres.", "errorNameInUse": "Nome de usuário já existe.", "errorEmailInUse": "Email já em uso.", "errorWeakPassword": "A senha deve ter pelo menos 6 caracteres.", "errorRegisterGeneral": "Erro during o registro.", "errorLoginInvalid": "Email ou senha incorretos.", "errorLoginGeneral": "Erro during o login.", "errorLoginRequired": "Por favor, insira email e senha.", "errorEmailInvalid": "Insira um email válido.",
        "statusLoading": "Carregando...", "statusRegistering": "Verificando nome e criando conta...", "statusLoggingIn": "Entrando...", "statusLoadingUser": "Carregando dados de {email}...", "statusLoggedInAs": "Logado como <strong>{name}</strong>.", "statusGuest": "Você está jogando como <strong>Convidado</strong>.", "statusBtnLogout": "Sair", "statusBtnLogin": "Login/Registrar", "memberSince": "Membro desde", "statusNotVerified": "Email <strong>{email}</strong> não verificado.", "statusNotVerifiedBtn": "Reenviar",
        "leaderboard": "Classificação", "leaderboardLoading": "Carregando classificação...", "leaderboardEmpty": "Sem dados ainda.", "leaderboardError": "Erro ao carregar.",
        "verifyTitle": "Verifique seu Email", "verifyMessage": "Enviamos um link de verificação. Verifique sua caixa de entrada (e spam) e clique no link para ativar sua conta.", "verifyResend": "Reenviar", "verifySent": "Link de verificação enviado!", "verifyError": "Erro ao enviar. Tente novamente mais tarde.",
        "authToggleToResetBtn": "Esqueceu a senha?", "resetTitle": "Recuperar Senha", "resetMessage": "Digite seu email e enviaremos um link para redefinir sua senha.", "resetButton": "Enviar link", "resetSent": "Email enviado! Verifique sua caixa de entrada.", "resetError": "Erro. O email está correto?",
        "cookieMessage": "Este site usa cookies para salvar suas pontuações e preferências. Você aceita?", "cookieButton": "Aceitar",
        "benefitsTitle": "Por que criar uma conta?", "benefitsItem1": "Salve seus recordes e progresso na nuvem.", "benefitsItem2": "Compita no ranking global.", "benefitsItem3": "Sincronize seu Pokédex em todos os dispositivos.",
        "privacyNotice": "Ao criar uma conta, você concorda que seu email, nome de usuário e pontuações sejam armazenados. Não compartilhamos seus dados."
      },
      "fr": {
        "title": "Jeu Pokémon - Comparaison de Statistiques", "score": "Score", "record": "Record", "time": "Temps", "yes": "Oui", "no": "Non", "gameOver": "Partie terminée !", "newRecord": "🎉 Nouveau record !", "currentRecord": "Record actuel", "close": "Fermer", "timeout": "Temps écoulé !", "wrong": "Faux !", "play": "Jouer", "account": "Compte", "settings": "Paramètres", "backToMenu": "Menu", "gamesPlayed": "Parties jouées", "pokedex": "Pokédex", "difficulty": "Difficulté", "easy": "Facile", "medium": "Moyen", "hard": "Difficile", "theme": "Thème", "system": "Système", "light": "Clair", "dark": "Sombre", "language": "Langue", "search": "Chercher Pokémon...", "wins": "gagne",
        "question": "{pokemon1} a-t-il plus de {stat} que {pokemon2} ?",
        "login": "Connexion", "register": "S'inscrire", "emailPlaceholder": "Email", "passwordPlaceholder": "Mot de passe", "displayNamePlaceholder": "Nom d'utilisateur (unique)", "loginButton": "Connexion", "registerButton": "S'inscrire", "authToggleToRegister": "Pas de compte ?", "authToggleToRegisterBtn": "S'inscrire", "authToggleToLogin": "Déjà un compte ?", "authToggleToLoginBtn": "Connexion",
        "errorFieldRequired": "Veuillez remplir tous les champs.", "errorNameLength": "Le nom doit comporter entre 3 et 20 caractères.", "errorNameInUse": "Nom d'utilisateur déjà pris.", "errorEmailInUse": "Email déjà utilisé.", "errorWeakPassword": "Le mot de passe doit comporter au moins 6 caractères.", "errorRegisterGeneral": "Erreur lors de l'inscription.", "errorLoginInvalid": "Email ou mot de passe incorrect.", "errorLoginGeneral": "Erreur lors de la connexion.", "errorLoginRequired": "Veuillez saisir l'email et le mot de passe.", "errorEmailInvalid": "Veuillez saisir un email valide.",
        "statusLoading": "Chargement...", "statusRegistering": "Vérification du nom et création du compte...", "statusLoggingIn": "Connexion...", "statusLoadingUser": "Chargement des données pour {email}...", "statusLoggedInAs": "Connecté en tant que <strong>{name}</strong>.", "statusGuest": "Vous jouez en tant qu'<strong>Invité</strong>.", "statusBtnLogout": "Déconnexion", "statusBtnLogin": "Connexion/S'inscrire", "memberSince": "Membre depuis", "statusNotVerified": "Email <strong>{email}</strong> non vérifié.", "statusNotVerifiedBtn": "Renvoyer",
        "leaderboard": "Classement", "leaderboardLoading": "Chargement du classement...", "leaderboardEmpty": "Pas de données.", "leaderboardError": "Erreur de chargement.",
        "verifyTitle": "Vérifiez votre Email", "verifyMessage": "Nous vous avons envoyé un lien. Vérifiez votre boîte de réception (et spam) et cliquez sur le lien pour activer votre compte.", "verifyResend": "Renvoyer", "verifySent": "Lien de vérification envoyé !", "verifyError": "Erreur lors de l'envoi. Réessayez plus tard.",
        "authToggleToResetBtn": "Mot de passe oublié ?", "resetTitle": "Récupérer Mot de passe", "resetMessage": "Entrez votre email et nous enverrons un lien pour réinitialiser votre mot de passe.", "resetButton": "Envoyer lien", "resetSent": "Email envoyé ! Vérifiez votre boîte.", "resetError": "Erreur. L'email est-il correct ?",
        "cookieMessage": "Ce site utilise des cookies pour enregistrer vos scores et préférences. Acceptez-vous?", "cookieButton": "Accepter",
        "benefitsTitle": "Pourquoi créer un compte ?", "benefitsItem1": "Sauvegardez vos records et progrès sur le cloud.", "benefitsItem2": "Participez au classement mondial.", "benefitsItem3": "Synchronisez votre Pokédex sur tous les appareils.",
        "privacyNotice": "En créant un compte, vous acceptez que votre e-mail, votre nom d'utilisateur et vos scores soient stockés. Nous ne partageons pas vos données."
      },
      "ru": {
        "title": "Игра Покемон - Сравнение Статистик", "score": "Счёт", "record": "Рекорд", "time": "Время", "yes": "Да", "no": "Нет", "gameOver": "Игра окончена!", "newRecord": "🎉 Новый рекорд!", "currentRecord": "Текущий рекорд", "close": "Закрыть", "timeout": "Время вышло!", "wrong": "Неправильно!", "play": "Играть", "account": "Аккаунт", "settings": "Настройки", "backToMenu": "Меню", "gamesPlayed": "Сыграно игр", "pokedex": "Покедекс", "difficulty": "Сложность", "easy": "Легко", "medium": "Средне", "hard": "Сложно", "theme": "Тема", "system": "Система", "light": "Светлая", "dark": "Тёмная", "language": "Язык", "search": "Найти покемона...", "wins": "побеждает",
        "question": "У {pokemon1} больше {stat}, чем у {pokemon2}?",
        "login": "Вход", "register": "Регистрация", "emailPlaceholder": "Эл. почта", "passwordPlaceholder": "Пароль", "displayNamePlaceholder": "Отображаемое имя (уникальное)", "loginButton": "Войти", "registerButton": "Зарегистрироваться", "authToggleToRegister": "Нет аккаунта?", "authToggleToRegisterBtn": "Регистрация", "authToggleToLogin": "Уже есть аккаунт?", "authToggleToLoginBtn": "Войти",
        "errorFieldRequired": "Пожалуйста, заполните все поля.", "errorNameLength": "Имя должно быть от 3 до 20 символов.", "errorNameInUse": "Имя пользователя уже занято.", "errorEmailInUse": "Эл. почта уже используется.", "errorWeakPassword": "Пароль должен содержать не менее 6 символов.", "errorRegisterGeneral": "Ошибка при регистрации.", "errorLoginInvalid": "Неверная эл. почта или пароль.", "errorLoginGeneral": "Ошибка при входе.", "errorLoginRequired": "Пожалуйста, введите эл. почту и пароль.", "errorEmailInvalid": "Введите действующий email.",
        "statusLoading": "Загрузка...", "statusRegistering": "Проверка имени и создание аккаунта...", "statusLoggingIn": "Вход в систему...", "statusLoadingUser": "Загрузка данных для {email}...", "statusLoggedInAs": "Вы вошли как <strong>{name}</strong>.", "statusGuest": "Вы играете как <strong>Гость</strong>.", "statusBtnLogout": "Выйти", "statusBtnLogin": "Войти/Регистрация", "memberSince": "Участник с", "statusNotVerified": "Email <strong>{email}</strong> не подтвержден.", "statusNotVerifiedBtn": "Отправить снова",
        "leaderboard": "Рейтинг", "leaderboardLoading": "Загрузка рейтинга...", "leaderboardEmpty": "Данных пока нет.", "leaderboardError": "Ошибка загрузки.",
        "verifyTitle": "Подтвердите Email", "verifyMessage": "Мы отправили вам ссылку. Проверьте почту (и спам) и нажмите на ссылку, чтобы активировать аккаунт.", "verifyResend": "Отправить снова", "verifySent": "Ссылка отправлена!", "verifyError": "Ошибка отправки. Попробуйте позже.",
        "authToggleToResetBtn": "Забыли пароль?", "resetTitle": "Восстановить пароль", "resetMessage": "Введите ваш email, и мы отправим ссылку для сброса пароля.", "resetButton": "Отправить", "resetSent": "Письмо отправлено! Проверьте почту.", "resetError": "Ошибка. Email верный?",
        "cookieMessage": "Этот сайт использует файлы cookie для сохранения ваших рекордов и настроек. Принимаете?", "cookieButton": "Принять",
        "benefitsTitle": "Зачем создавать аккаунт?", "benefitsItem1": "Сохраняйте рекорды и прогресс в облаке.", "benefitsItem2": "Участвуйте в мировом рейтинге.", "benefitsItem3": "Синхронизируйте Покедекс на всех устройствах.",
        "privacyNotice": "Создавая аккаунт, вы соглашаетесь на хранение вашей эл. почты, имени и очков. Мы не делимся вашими данными."
      },
      "zh": {
        "title": "宝可梦游戏 - 属性对比", "score": "分数", "record": "最高分", "time": "时间", "yes": "是", "no": "否", "gameOver": "游戏结束！", "newRecord": "🎉 新纪录！", "currentRecord": "当前纪录", "close": "关闭", "timeout": "时间到！", "wrong": "错误！", "play": "玩", "account": "帐户", "settings": "设置", "backToMenu": "菜单", "gamesPlayed": "玩过的游戏", "pokedex": "宝可梦图鉴", "difficulty": "难度", "easy": "简单", "medium": "中等", "hard": "困难", "theme": "主题", "system": "系统", "light": "浅色", "dark": "深色", "language": "语言", "search": "搜索宝可梦...", "wins": "获胜",
        "question": "{pokemon1}的{stat}比{pokemon2}高吗？",
        "login": "登录", "register": "注册", "emailPlaceholder": "电子邮件", "passwordPlaceholder": "密码", "displayNamePlaceholder": "显示名称 (唯一的)", "loginButton": "登录", "registerButton": "注册", "authToggleToRegister": "没有帐户？", "authToggleToRegisterBtn": "注册", "authToggleToLogin": "已有帐户？", "authToggleToLoginBtn": "登录",
        "errorFieldRequired": "请填写所有字段。", "errorNameLength": "名称必须在 3 到 20 个字符之间。", "errorNameInUse": "用户名已被占用。", "errorEmailInUse": "电子邮件已被使用。", "errorWeakPassword": "密码必须至少 6 个字符。", "errorRegisterGeneral": "注册时出错。", "errorLoginInvalid": "电子邮件或密码不正确。", "errorLoginGeneral": "登录时出错。", "errorLoginRequired": "请输入电子邮件和密码。", "errorEmailInvalid": "请输入有效的电子邮件。",
        "statusLoading": "加载中...", "statusRegistering": "检查名称并创建帐户...", "statusLoggingIn": "登录中...", "statusLoadingUser": "正在加载 {email} 的数据...", "statusLoggedInAs": "已登录为 <strong>{name}</strong>。", "statusGuest": "您正在以<strong>访客</strong>身份玩游戏。", "statusBtnLogout": "登出", "statusBtnLogin": "登录/注册", "memberSince": "始于", "statusNotVerified": "电子邮件 <strong>{email}</strong> 未验证。", "statusNotVerifiedBtn": "重新发送",
        "leaderboard": "排行榜", "leaderboardLoading": "正在加载排行榜...", "leaderboardEmpty": "暂无数据。", "leaderboardError": "加载出错。",
        "verifyTitle": "验证您的电子邮件", "verifyMessage": "我们已向您发送了验证链接。请检查您的收件箱（和垃圾邮件）并单击链接以激活您的帐户。", "verifyResend": "重新发送", "verifySent": "验证链接已发送！", "verifyError": "发送时出错。请稍后再试。",
        "authToggleToResetBtn": "忘记密码？", "resetTitle": "恢复密码", "resetMessage": "输入您的电子邮件，我们将发送链接以重置您的密码。", "resetButton": "发送链接", "resetSent": "邮件已发送！请检查您的收件箱。", "resetError": "错误。电子邮件是否正确？",
        "cookieMessage": "本网站使用 cookie 来保存您的分数和偏好。您接受吗？", "cookieButton": "接受",
        "benefitsTitle": "为什么要创建帐户？", "benefitsItem1": "将您的记录和进度保存到云端。", "benefitsItem2": "参与全球排行榜竞争。", "benefitsItem3": "在所有设备上同步您解锁的图鉴。",
        "privacyNotice": "创建帐户即表示您同意存储您的电子邮件、用户名和分数。我们不会分享您的数据。"
      },
      "ja": {
        "title": "ポケモンゲーム - ステータス比較", "score": "スコア", "record": "ハイスコア", "time": "時間", "yes": "はい", "no": "いいえ", "gameOver": "ゲームオーバー！", "newRecord": "🎉 新記録！", "currentRecord": "現在の記録", "close": "閉じる", "timeout": "時間切れ！", "wrong": "間違い！", "play": "プレー", "account": "アカウント", "settings": "設定", "backToMenu": "メニュー", "gamesPlayed": "プレイしたゲーム", "pokedex": "ポケモン図鑑", "difficulty": "難易度", "easy": "簡単", "medium": "普通", "hard": "難しい", "theme": "テーマ", "system": "システム", "light": "ライト", "dark": "ダーク", "language": "言語", "search": "ポケモンを検索...", "wins": "の勝ち",
        "question": "{pokemon1}は{pokemon2}より{stat}が高いですか？",
        "login": "ログイン", "register": "登録", "emailPlaceholder": "メールアドレス", "passwordPlaceholder": "パスワード", "displayNamePlaceholder": "表示名 (ユニーク)", "loginButton": "ログイン", "registerButton": "登録", "authToggleToRegister": "アカウントをお持ちでないですか？", "authToggleToRegisterBtn": "登録", "authToggleToLogin": "すでにアカウントをお持ちですか？", "authToggleToLoginBtn": "ログイン",
        "errorFieldRequired": "すべてのフィールドに入力してください。", "errorNameLength": "名前は3文字から20文字の間である必要があります。", "errorNameInUse": "このユーザー名はすでに使用されています。", "errorEmailInUse": "このメールアドレスは既に使用されています。", "errorWeakPassword": "パスワードは6文字以上である必要があります。", "errorRegisterGeneral": "登録中にエラーが発生しました。", "errorLoginInvalid": "メールアドレスまたはパスワードが正しくありません。", "errorLoginGeneral": "ログイン中にエラーが発生しました。", "errorLoginRequired": "メールアドレスとパスワードを入力してください。", "errorEmailInvalid": "有効なメールアドレスを入力してください。",
        "statusLoading": "読み込み中...", "statusRegistering": "名前の確認とアカウント作成中...", "statusLoggingIn": "ログイン中...", "statusLoadingUser": "{email} のデータを読み込み中...", "statusLoggedInAs": "<strong>{name}</strong>としてログイン中。", "statusGuest": "<strong>ゲスト</strong>としてプレイ中。", "statusBtnLogout": "ログアウト", "statusBtnLogin": "ログイン/登録", "memberSince": "登録日", "statusNotVerified": "メール <strong>{email}</strong> は未認証です。", "statusNotVerifiedBtn": "再送信",
        "leaderboard": "ランキング", "leaderboardLoading": "ランキングを読み込み中...", "leaderboardEmpty": "データがありません。", "leaderboardError": "読み込みエラー。",
        "verifyTitle": "メール認証", "verifyMessage": "認証リンクを送信しました。受信トレイ（と迷惑メール）を確認し、リンクをクリックしてアカウントを有効にしてください。", "verifyResend": "再送信", "verifySent": "認証リンクを送信しました！", "verifyError": "送信エラー。後でもう一度お試しください。",
        "authToggleToResetBtn": "パスワードをお忘れですか？", "resetTitle": "パスワードをリセット", "resetMessage": "メールアドレスを入力してください。パスワードリセット用のリンクを送信します。", "resetButton": "リンクを送信", "resetSent": "メールを送信しました！受信トレイをご確認ください。", "resetError": "エラー。メールアドレスは正しいですか？",
        "cookieMessage": "このサイトはスコアと設定を保存するためにCookieを使用します。同意しますか？", "cookieButton": "同意する",
        "benefitsTitle": "アカウントを作成する理由", "benefitsItem1": "スコアと進行状況をクラウドに保存します。", "benefitsItem2": "グローバルランキングで競います。", "benefitsItem3": "ロック解除された図鑑をすべてのデバイスで同期します。",
        "privacyNotice": "アカウントを作成することにより、メール、ユーザー名、スコアが保存されることに同意したことになります。データを共有することはありません。"
      },
      "ko": {
        "title": "포켓몬 게임 - 스탯 비교", "score": "점수", "record": "최고 점수", "time": "시간", "yes": "예", "no": "아니오", "gameOver": "게임 오버!", "newRecord": "🎉 신기록!", "currentRecord": "현재 기록", "close": "닫기", "timeout": "시간 종료!", "wrong": "틀렸습니다!", "play": "플레이", "account": "계정", "settings": "설정", "backToMenu": "메뉴", "gamesPlayed": "플레이한 게임", "pokedex": "포켓몬 도감", "difficulty": "난이도", "easy": "쉬움", "medium": "중간", "hard": "어려움", "theme": "테마", "system": "시스템", "light": "라이트", "dark": "다크", "language": "언어", "search": "포켓몬 검색...", "wins": "승리",
        "question": "{pokemon1}의 {stat}이(가) {pokemon2}보다 높습니까?",
        "login": "로그인", "register": "회원가입", "emailPlaceholder": "이메일", "passwordPlaceholder": "비밀번호", "displayNamePlaceholder": "표시 이름 (고유)", "loginButton": "로그인", "registerButton": "회원가입", "authToggleToRegister": "계정이 없으신가요?", "authToggleToRegisterBtn": "회원가입", "authToggleToLogin": "이미 계정이 있으신가요?", "authToggleToLoginBtn": "로그인",
        "errorFieldRequired": "모든 필드를 입력해주세요.", "errorNameLength": "이름은 3자에서 20자 사이여야 합니다.", "errorNameInUse": "이미 사용 중인 사용자 이름입니다.", "errorEmailInUse": "이미 사용 중인 이메일입니다.", "errorWeakPassword": "비밀번호는 6자 이상이어야 합니다.", "errorRegisterGeneral": "회원가입 중 오류가 발생했습니다.", "errorLoginInvalid": "이메일 또는 비밀번호가 잘못되었습니다.", "errorLoginGeneral": "로그인 중 오류가 발생했습니다.", "errorLoginRequired": "이메일과 비밀번호를 입력해주세요。", "errorEmailInvalid": "유효한 이메일을 입력하세요.",
        "statusLoading": "로딩 중...", "statusRegistering": "이름 확인 및 계정 생성 중...", "statusLoggingIn": "로그인 중...", "statusLoadingUser": "{email}의 데이터를 불러오는 중...", "statusLoggedInAs": "<strong>{name}</strong>(으)로 로그인되었습니다.", "statusGuest": "<strong>게스트</strong>로 플레이 중입니다.", "statusBtnLogout": "로그아웃", "statusBtnLogin": "로그인/회원가입", "memberSince": "가입일", "statusNotVerified": "이메일 <strong>{email}</strong>이(가) 확인되지 않았습니다.", "statusNotVerifiedBtn": "재전송",
        "leaderboard": "순위표", "leaderboardLoading": "순위표 로딩 중...", "leaderboardEmpty": "데이터 없음.", "leaderboardError": "로딩 오류.",
        "verifyTitle": "이메일 인증", "verifyMessage": "인증 링크를 보냈습니다. 받은 편지함(및 스팸)을 확인하고 링크를 클릭하여 계정을 활성화하세요.", "verifyResend": "재전송", "verifySent": "인증 링크 전송됨!", "verifyError": "전송 중 오류가 발생했습니다. 나중에 다시 시도하세요.",
        "authToggleToResetBtn": "비밀번호를 잊으셨나요?", "resetTitle": "비밀번호 재설정", "resetMessage": "이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.", "resetButton": "링크 전송", "resetSent": "이메일 전송됨! 받은 편지함을 확인하세요.", "resetError": "오류. 이메일이 정확한가요?",
        "cookieMessage": "이 사이트는 점수와 설정을 저장하기 위해 쿠키를 사용합니다. 동의하십니까?", "cookieButton": "동의",
        "benefitsTitle": "계정을 생성하는 이유", "benefitsItem1": "기록과 진행 상황을 클라우드에 저장하세요.", "benefitsItem2": "글로벌 순위표에서 경쟁하세요.", "benefitsItem3": "모든 기기에서 잠금 해제된 도감을 동기화하세요.",
        "privacyNotice": "계정을 생성하면 이메일, 사용자 이름, 점수가 저장되는 데 동의하는 것입니다. 데이터를 공유하지 않습니다."
      },
      "fi": {
        "title": "Pokémon-peli - Tilastojen Vertailu", "score": "Pisteet", "record": "Ennätys", "time": "Aika", "yes": "Kyllä", "no": "Ei", "gameOver": "Peli ohi!", "newRecord": "🎉 Uusi ennätys!", "currentRecord": "Nykyinen ennätys", "close": "Sulje", "timeout": "Aika loppui!", "wrong": "Väärin!", "play": "Pelaa", "account": "Tili", "settings": "Asetukset", "backToMenu": "Valikko", "gamesPlayed": "Pelatut pelit", "pokedex": "Pokédex", "difficulty": "Vaikeustaso", "easy": "Helppo", "medium": "Normaali", "hard": "Vaikea", "theme": "Teema", "system": "Järjestelmä", "light": "Vaalea", "dark": "Tumma", "language": "Kieli", "search": "Etsi Pokémon...", "wins": "voittaa",
        "question": "Onko {pokemon1}n {stat} korkeampi kuin {pokemon2}n?",
        "login": "Kirjaudu sisään", "register": "Rekisteröidy", "emailPlaceholder": "Sähköposti", "passwordPlaceholder": "Salasana", "displayNamePlaceholder": "Näyttönimi (yksilöllinen)", "loginButton": "Kirjaudu", "registerButton": "Rekisteröidy", "authToggleToRegister": "Eikö sinulla ole tiliä?", "authToggleToRegisterBtn": "Rekisteröidy", "authToggleToLogin": "Onko sinulla jo tili?", "authToggleToLoginBtn": "Kirjaudu",
        "errorFieldRequired": "Täytä kaikki kentät.", "errorNameLength": "Nimen on oltava 3–20 merkkiä pitkä.", "errorNameInUse": "Käyttäjänimi on jo varattu.", "errorEmailInUse": "Sähköposti on jo käytössä.", "errorWeakPassword": "Salasanan on oltava vähintään 6 merkkiä pitkä.", "errorRegisterGeneral": "Virhe rekisteröinnissä.", "errorLoginInvalid": "Virheellinen sähköposti tai salasana.", "errorLoginGeneral": "Virhe kirjautumisessa.", "errorLoginRequired": "Anna sähköposti ja salasana.", "errorEmailInvalid": "Anna kelvollinen sähköpostiosoite.",
        "statusLoading": "Ladataan...", "statusRegistering": "Tarkistetaan nimeä ja luodaan tiliä...", "statusLoggingIn": "Kirjaudutaan sisään...", "statusLoadingUser": "Ladataan käyttäjän {email} tietoja...", "statusLoggedInAs": "Kirjautuneena nimellä <strong>{name}</strong>.", "statusGuest": "Pelaat <strong>Vieraana</strong>.", "statusBtnLogout": "Kirjaudu ulos", "statusBtnLogin": "Kirjaudu/Rekisteröidy", "memberSince": "Jäsen", "statusNotVerified": "Sähköpostia <strong>{email}</strong> ei ole vahvistettu.", "statusNotVerifiedBtn": "Lähetä uudelleen",
        "leaderboard": "Tulostaulu", "leaderboardLoading": "Ladataan tulostaulua...", "leaderboardEmpty": "Ei tietoja.", "leaderboardError": "Latausvirhe.",
        "verifyTitle": "Vahvista sähköpostisi", "verifyMessage": "Lähetimme sinulle vahvistuslinkin. Tarkista sähköpostisi (ja roskaposti) ja aktivoi tilisi napsauttamalla linkkiä.", "verifyResend": "Lähetä uudelleen", "verifySent": "Vahvistuslinkki lähetetty!", "verifyError": "Virhe lähetyksessä. Yritä myöhemmin uudelleen.",
        "authToggleToResetBtn": "Salasana unohtunut?", "resetTitle": "Palauta salasana", "resetMessage": "Anna sähköpostisi, niin lähetämme linkin salasanan palauttamista varten.", "resetButton": "Lähetä linkki", "resetSent": "Sähköposti lähetetty! Tarkista postilaatikkosi.", "resetError": "Virhe. Onko sähköposti oikein?",
        "cookieMessage": "Tämä sivusto käyttää evästeitä tallentaakseen pisteesi ja asetuksesi. Hyväksytkö?", "cookieButton": "Hyväksy",
        "benefitsTitle": "Miksi luoda tili?", "benefitsItem1": "Tallenna ennätyksesi ja edistymisesi pilveen.", "benefitsItem2": "Kilpaile maailmanlaajuisessa tulostaulussa.", "benefitsItem3": "Synkronoi avaamasi Pokédex kaikkiin laitteisiin.",
        "privacyNotice": "Luomalla tilin hyväksyt, että sähköpostisi, käyttäjänimesi ja pisteesi tallennetaan. Emme jaa tietojasi."
      },
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
        "fi": { "hp": "HP", "attack": "Hyökkäys", "defense": "Puolustus", "spattack": "Erikoishyökkäys", "spdefense": "Erikoispuolustus", "speed": "Nopeus" }
      }
    };
    const flagEmojis = {
      "it": "🇮🇹", "en": "🇬🇧", "es": "🇪🇸", "de": "🇩🇪", "pt": "🇵🇹", "fr": "🇫🇷", "ru": "🇷🇺", "zh": "🇨🇳", "ja": "🇯🇵", "ko": "🇰🇷", "fi": "🇫🇮"
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
    // MODIFICATO per la nuova struttura
    highScores: {
      classic: { easy: 0, medium: 0, hard: 0 },
      sort: { easy: 0, medium: 0, hard: 0 }
    },
    gamesPlayed: {
      classic: 0,
      sort: 0
    },
    unlockedPokemon: []
  };
  
  try {
    const batch = writeBatch(fb_db); 
    batch.set(newUserRef, newUserData);
    batch.set(newDisplayNameRef, { uid: uid });
    
    await batch.commit();
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

    function getSpriteUrl(name) {
      const normalized = name
        .toLowerCase()
        .replace(/-/g, "")
        .replace(/‎ /g, "")
        .replace(/♂/g, "m")
        .replace(/♀/g, "f")
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/ /g, "-");
      return `https://play.pokemonshowdown.com/sprites/gen5/${normalized}.png`;
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
        startRound();
      } else {
        triggerGameOver(t.wrong, comparison);
      }
    }

    function unlockPokemon(pokemonId) {
      if (!unlockedPokemon.includes(pokemonId)) {
        unlockedPokemon.push(pokemonId);

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
    li.draggable = true;
    li.dataset.id = p.id; // Salva l'ID per il controllo
    li.innerHTML = `<img src="${getSpriteUrl(p.name)}" alt="${p.name}"> ${p.name}`;
    listEl.appendChild(li);
  });

  // Aggiungi listener per il drag-and-drop
  addDragDropListeners();
}

function checkSortOrder() {
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
    startSortRound(); // Prossimo round
  } else {
    // Game Over
    triggerGameOver(t.sortWrongOrder, { stat: sortableStat, correctOrder: correctSortOrder });
  }
}


// --- Funzioni Helper per Drag-and-Drop ---
let draggingElement = null;

function addDragDropListeners() {
  const items = document.querySelectorAll(".sortable-item");
  const list = document.getElementById("sortableList");

  items.forEach(item => {
    item.addEventListener("dragstart", (e) => {
      draggingElement = e.target;
      e.target.classList.add("dragging");
      e.dataTransfer.effectAllowed = 'move';
    });
    
    item.addEventListener("dragend", (e) => {
      e.target.classList.remove("dragging");
      draggingElement = null;
    });

    item.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      
      const afterElement = getDragAfterElement(list, e.clientY);
      // Rimuovi 'over' da tutti
      items.forEach(i => i.classList.remove('over'));
      
      if (afterElement == null) {
          if (list.lastChild !== item) item.classList.add('over'); // Evidenzia se è l'ultimo
      } else {
          if (afterElement !== item) item.classList.add('over'); // Evidenzia quello sopra
      }
    });
    
    item.addEventListener("dragleave", (e) => {
        item.classList.remove('over');
    });

    item.addEventListener("drop", (e) => {
      e.preventDefault();
      item.classList.remove('over');
      if (draggingElement && draggingElement !== e.target) {
        const afterElement = getDragAfterElement(list, e.clientY);
        if (afterElement == null) {
          list.appendChild(draggingElement);
        } else {
          list.insertBefore(draggingElement, afterElement);
        }
      }
    });
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.sortable-item:not(.dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
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
        // ... (logica della data di creazione)
        document.getElementById("accountCreatedAt").innerText = creationDate;
        
        displayPokedex(pokemonList);
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
        
        const div = document.createElement('div');
        div.className = 'pokedex-pokemon';
        
        const img = document.createElement('img');
        img.src = getSpriteUrl(pokemon.name);
        img.alt = pokemon.name;

        const name = document.createElement('div');
        name.className = 'pokedex-pokemon-name';

        if (isUnlocked) {
          name.textContent = pokemon.name;
          div.addEventListener('click', () => showPokemonModal(pokemon, true));
        } else {
          div.classList.add('locked');
          name.textContent = "???";
          div.addEventListener('click', () => showPokemonModal(pokemon, false));
        }

        div.appendChild(img);
        div.appendChild(name);
        pokedexGrid.appendChild(div);
      });
    }

    function showPokemonModal(pokemon, isUnlocked) {
      const statLabels = (translations.statNames[lang] || translations.statNames.en);

      if (isUnlocked) {
        modalName.textContent = `#${pokemon.id} ${pokemon.name}`;
        modalImage.src = getSpriteUrl(pokemon.name);
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
        }
      } else {
        modalName.textContent = `???`;
        modalImage.src = getSpriteUrl(pokemon.name);
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
      }
      modal.style.display = 'flex';
    }

    // Listener Modal Pokédex
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });

    // Listener Ricerca Pokédex
    searchInput.addEventListener('input', () => {
      const term = searchInput.value.toLowerCase();
      const filtered = pokemonList.filter(p => p.name.toLowerCase().includes(term));
      displayPokedex(filtered);

    });

