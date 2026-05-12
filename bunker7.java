import java.io.*;
import java.util.*;

/**
 * BUNKER-7 - Versione semplificata in Java
 *
 * Regole:
 *  - 6 statistiche: O2, FOOD, PWR, H2O, RAD, MORALE
 *  - Le crisi appaiono una alla volta, una per statistica, con 3 risposte (1 corretta)
 *  - Risposta corretta  -> +10 punti, la stat non peggiora
 *  - Risposta sbagliata -> la stat viene danneggiata
 *  - Timeout (30s)      -> la stat viene danneggiata
 *  - Ogni tick le stat si deteriorano lentamente
 *  - Game over se O2/FOOD/PWR/H2O/MORALE <= 0  oppure  RAD >= 100
 *  - Modalità infinita: il gioco non finisce mai finché non muori
 *  - Il miglior punteggio viene salvato in "highscore.txt"
 */
public class Bunker7 {

    // ─── COSTANTI ───────────────────────────────────────────────────────────────

    static final int TICK_MS       = 1000;   // durata di ogni tick (ms)
    static final int CRISIS_EVERY  = 8;      // un nuovo evento ogni N tick
    static final int CRISIS_TIMEOUT = 30;    // secondi per rispondere a una crisi
    static final String SAVE_FILE  = "highscore.txt";

    // ─── STATISTICHE ────────────────────────────────────────────────────────────

    // Indici delle statistiche
    static final int O2     = 0;
    static final int FOOD   = 1;
    static final int PWR    = 2;
    static final int H2O    = 3;
    static final int RAD    = 4;
    static final int MORALE = 5;

    static final String[] STAT_NAMES = { "O2", "FOOD", "PWR", "H2O", "RAD", "MORALE" };

    // Perdita per tick (RAD aumenta invece di diminuire)
    static final double[] DRAIN = { 0.3, 0.2, 0.2, 0.25, -0.15, 0.15 };

    static double[] stats = new double[6];

    // ─── CRISI ──────────────────────────────────────────────────────────────────

    // Ogni crisi: { titolo, descrizione, [opzione1, opzione2, opzione3], indice_risposta_corretta, stat_colpita, danno }
    static Object[][] CRISES = {
        // O2
        { "O2 PIPE BURST",   "Ossigeno che fuoriesce dal settore 3.",
          new String[]{"SIGILLA MORSETTO","APRI SFOGO","TAPPO SCHIUMA"}, 0, O2, 28 },
        { "FUMO NEI CORRIDOI","Fumo denso sta riempiendo i corridoi.",
          new String[]{"ALOGENO","APRI PRESE","VENTOLE AL CONTRARIO"}, 0, O2, 20 },
        // FOOD
        { "CIBO CONTAMINATO", "La contaminazione si sta diffondendo nelle riserve.",
          new String[]{"INCENERISCI","DISTRIBUISCI","IGNORA"}, 0, FOOD, 24 },
        { "INFESTAZIONE",     "Creature sconosciute consumano le razioni.",
          new String[]{"ULTRASUONI","APRI PORTELLO","TRAPPOLA ESCA"}, 0, FOOD, 16 },
        // PWR
        { "SOVRATENSIONE",   "Sovraccarico della rete, supporto vitale a rischio.",
          new String[]{"DIVERTICELLA","INTERROMPI QUADRO","BILANCIAMENTO"}, 1, PWR, 26 },
        { "GENERATORE KO",   "Il generatore di riserva si è rifiutato di avviarsi.",
          new String[]{"PREPARA CARBURANTE","RESET CTRL","MANOVELLA"}, 0, PWR, 30 },
        // H2O
        { "TOSSINE ACQUA",   "Tracce chimiche nel circuito di riciclo.",
          new String[]{"FILTRO POTENZIATO","SVUOTA CIRCUITO","DILUI"}, 0, H2O, 22 },
        { "POMPA BLOCCATA",  "Guasto al cuscinetto della pompa principale.",
          new String[]{"LUBRIFICA","SOSTITUISCI POMPA","BYPASS"}, 1, H2O, 20 },
        // RAD (RAD aumenta: la risposta corretta la fa scendere)
        { "PICCO RADIAZIONI","Letture del Geiger critiche. Settore esposto.",
          new String[]{"SPRAY DECON","SIGILLA PARETI","APRI SFIATI"}, 1, RAD, 30 },
        { "BRILLAMENTO SOLARE","Tempesta di radiazioni che colpisce la superficie.",
          new String[]{"CORRI IN SUPERFICIE","RIFUGIO PROFONDO","SIGILLO PARZIALE"}, 1, RAD, 34 },
        // MORALE
        { "PANICO DI MASSA", "I residenti stanno perdendo il controllo psicologico.",
          new String[]{"TRASMETTI CALMA","TEST SIRENA","SILENZIO"}, 0, MORALE, 18 },
        { "MINACCIA DI RIVOLTA","I residenti vogliono prendere il controllo del bunker.",
          new String[]{"NEGOZIA","MOSTRA DATI","BLOCCA TUTTO"}, 1, MORALE, 22 },
    };

    // ─── STATO DI GIOCO ─────────────────────────────────────────────────────────

    static int  score         = 0;
    static int  tick          = 0;
    static int  highScore     = 0;
    static boolean running    = true;

    // Crisi corrente (null = nessuna crisi attiva)
    static Object[] activeCrisis  = null;
    static long     crisisStart   = 0;   // System.currentTimeMillis()

    static Scanner input = new Scanner(System.in);
    static Random  rng   = new Random();

    // ─── MAIN ───────────────────────────────────────────────────────────────────

    public static void main(String[] args) throws InterruptedException {
        highScore = loadHighScore();
        System.out.println("╔══════════════════════════════╗");
        System.out.println("║         BUNKER-7             ║");
        System.out.println("║  Modalità infinita           ║");
        System.out.println("╚══════════════════════════════╝");
        System.out.println("Miglior punteggio: " + highScore);
        System.out.println("\nPremi INVIO per iniziare...");
        input.nextLine();

        initStats();
        runGameLoop();
    }

    // ─── INIZIALIZZAZIONE ───────────────────────────────────────────────────────

    static void initStats() {
        stats[O2]     = 100;
        stats[FOOD]   = 100;
        stats[PWR]    = 100;
        stats[H2O]    = 100;
        stats[RAD]    = 0;
        stats[MORALE] = 100;
        score         = 0;
        tick          = 0;
        running       = true;
        activeCrisis  = null;
    }

    // ─── LOOP PRINCIPALE ────────────────────────────────────────────────────────

    static void runGameLoop() throws InterruptedException {
        long lastTick = System.currentTimeMillis();

        while (running) {
            long now = System.currentTimeMillis();

            // Aspetta il prossimo tick
            long elapsed = now - lastTick;
            if (elapsed < TICK_MS) {
                Thread.sleep(TICK_MS - elapsed);
            }
            lastTick = System.currentTimeMillis();

            // ─ Controlla timeout crisi ──────────────────────────────────────────
            if (activeCrisis != null) {
                int secondsLeft = timeLeft();
                if (secondsLeft <= 0) {
                    crisisTimeout();
                }
            }

            // ─ Tick delle statistiche ───────────────────────────────────────────
            applyDrain();
            tick++;
            score++;

            // ─ Genera nuova crisi ───────────────────────────────────────────────
            if (activeCrisis == null && tick % CRISIS_EVERY == 0) {
                spawnCrisis();
            }

            // ─ Controlla game over ──────────────────────────────────────────────
            if (isGameOver()) {
                running = false;
                break;
            }

            // ─ Stampa stato ─────────────────────────────────────────────────────
            printStatus();

            // ─ Leggi input se c'è una crisi ─────────────────────────────────────
            if (activeCrisis != null) {
                readCrisisInput();
            }
        }

        gameOver();
    }

    // ─── STATISTICHE ────────────────────────────────────────────────────────────

    static void applyDrain() {
        for (int i = 0; i < 6; i++) {
            stats[i] -= DRAIN[i];
            stats[i] = clamp(stats[i], 0, 100);
        }
    }

    static boolean isGameOver() {
        // Le statistiche normali non devono andare a zero
        if (stats[O2]     <= 0) { System.out.println("\n>>> OSSIGENO ESAURITO. Fine."); return true; }
        if (stats[FOOD]   <= 0) { System.out.println("\n>>> CIBO ESAURITO. Fine."); return true; }
        if (stats[PWR]    <= 0) { System.out.println("\n>>> ENERGIA ESAURITA. Fine."); return true; }
        if (stats[H2O]    <= 0) { System.out.println("\n>>> ACQUA ESAURITA. Fine."); return true; }
        if (stats[MORALE] <= 0) { System.out.println("\n>>> MORALE A ZERO. Fine."); return true; }
        // RAD non deve salire a 100
        if (stats[RAD]    >= 100) { System.out.println("\n>>> RADIAZIONI LETALI. Fine."); return true; }
        return false;
    }

    // ─── CRISI ──────────────────────────────────────────────────────────────────

    static void spawnCrisis() {
        int idx = rng.nextInt(CRISES.length);
        activeCrisis = CRISES[idx];
        crisisStart  = System.currentTimeMillis();
        System.out.println("\n!!! CRISI: " + activeCrisis[0] + " !!!");
    }

    static void crisisTimeout() {
        int stat  = (int) activeCrisis[4];
        int dmg   = (int) activeCrisis[5];
        applyStatDamage(stat, dmg, "TIMEOUT");
        activeCrisis = null;
    }

    static void answerCrisis(int choice) {
        int correctIdx = (int) activeCrisis[3];
        int stat       = (int) activeCrisis[4];
        int dmg        = (int) activeCrisis[5];

        if (choice == correctIdx) {
            System.out.println(">>> CORRETTO! +" + 10 + " punti.");
            score += 10;
        } else {
            applyStatDamage(stat, dmg, "RISPOSTA SBAGLIATA");
        }
        activeCrisis = null;
    }

    // Applica danno a una statistica (RAD va in direzione opposta)
    static void applyStatDamage(int stat, int dmg, String reason) {
        String statName = STAT_NAMES[stat];
        if (stat == RAD) {
            // Per RAD il danno aumenta il valore
            stats[RAD] = clamp(stats[RAD] + dmg, 0, 100);
            System.out.println(">>> " + reason + ": " + statName + " +" + dmg
                + " (ora " + (int) stats[RAD] + "%)");
        } else {
            stats[stat] = clamp(stats[stat] - dmg, 0, 100);
            System.out.println(">>> " + reason + ": " + statName + " -" + dmg
                + " (ora " + (int) stats[stat] + "%)");
        }
    }

    static int timeLeft() {
        long elapsedSec = (System.currentTimeMillis() - crisisStart) / 1000;
        return (int) (CRISIS_TIMEOUT - elapsedSec);
    }

    // ─── INPUT ──────────────────────────────────────────────────────────────────

    static void readCrisisInput() {
        if (System.console() == null) {
            // In ambiente senza console interattiva salta la lettura
            return;
        }
        System.out.print("La tua scelta (o INVIO per ignorare): ");
        try {
            // Lettura non bloccante: usa available() per controllare
            if (System.in.available() > 0) {
                String line = input.nextLine().trim();
                if (!line.isEmpty()) {
                    try {
                        int n = Integer.parseInt(line) - 1;
                        String[] opts = (String[]) activeCrisis[2];
                        if (n >= 0 && n < opts.length) {
                            answerCrisis(n);
                        } else {
                            System.out.println("Opzione non valida (1-" + opts.length + ")");
                        }
                    } catch (NumberFormatException e) {
                        System.out.println("Inserisci un numero.");
                    }
                }
            }
        } catch (IOException e) {
            // ignora
        }
    }

    // ─── OUTPUT ─────────────────────────────────────────────────────────────────

    static void printStatus() {
        System.out.println("\n──────────── TICK " + tick + " │ PUNTEGGIO " + score
            + " │ RECORD " + highScore + " ────────────");

        // Stampa le statistiche su una riga sola
        for (int i = 0; i < 6; i++) {
            String arrow = (i == RAD) ? "↑" : "↓";  // RAD sale, le altre scendono
            System.out.printf("  %-7s %3d%%", STAT_NAMES[i], (int) stats[i]);
            if (i % 3 == 2) System.out.println();
        }

        // Stampa la crisi attiva
        if (activeCrisis != null) {
            String[] opts = (String[]) activeCrisis[2];
            System.out.println("\n  [CRISI] " + activeCrisis[0]);
            System.out.println("  " + activeCrisis[1]);
            System.out.println("  Tempo rimasto: " + timeLeft() + "s");
            for (int i = 0; i < opts.length; i++) {
                System.out.println("    " + (i + 1) + ". " + opts[i]);
            }
            System.out.print("  Risposta [1-" + opts.length + "]: ");
            // Leggi la risposta (bloccante semplice)
            readCrisisInputBlocking();
        }
    }

    // Versione bloccante semplice: legge la risposta e aspetta
    static void readCrisisInputBlocking() {
        try {
            String line = input.nextLine().trim();
            if (activeCrisis == null) return; // già risolta da timeout
            if (!line.isEmpty()) {
                try {
                    int n = Integer.parseInt(line) - 1;
                    String[] opts = (String[]) activeCrisis[2];
                    if (n >= 0 && n < opts.length) {
                        answerCrisis(n);
                    } else {
                        System.out.println("  Opzione non valida (1-" + opts.length + ").");
                        // Se non risponde correttamente, considera come timeout
                        crisisTimeout();
                    }
                } catch (NumberFormatException e) {
                    System.out.println("  Inserisci un numero. Crisi ignorata.");
                    crisisTimeout();
                }
            } else {
                // INVIO senza numero = ignora la crisi (penalità timeout)
                crisisTimeout();
            }
        } catch (Exception e) {
            crisisTimeout();
        }
    }

    // ─── GAME OVER ──────────────────────────────────────────────────────────────

    static void gameOver() {
        System.out.println("\n╔══════════════════════════════╗");
        System.out.println("║         GAME OVER            ║");
        System.out.println("╚══════════════════════════════╝");
        System.out.println("Punteggio finale: " + score);

        if (score > highScore) {
            highScore = score;
            saveHighScore(highScore);
            System.out.println("NUOVO RECORD: " + highScore + " salvato in " + SAVE_FILE);
        } else {
            System.out.println("Record attuale: " + highScore);
        }

        System.out.print("\nRigioca? (s/n): ");
        try {
            String ans = input.nextLine().trim().toLowerCase();
            if (ans.equals("s")) {
                initStats();
                try { runGameLoop(); } catch (InterruptedException e) {}
            } else {
                System.out.println("Arrivederci.");
            }
        } catch (Exception e) {
            System.out.println("Arrivederci.");
        }
    }

    // ─── SALVATAGGIO RECORD ─────────────────────────────────────────────────────

    static int loadHighScore() {
        try (BufferedReader br = new BufferedReader(new FileReader(SAVE_FILE))) {
            return Integer.parseInt(br.readLine().trim());
        } catch (Exception e) {
            return 0; // file non esiste o errore: record è 0
        }
    }

    static void saveHighScore(int hs) {
        try (PrintWriter pw = new PrintWriter(new FileWriter(SAVE_FILE))) {
            pw.println(hs);
        } catch (IOException e) {
            System.out.println("Attenzione: impossibile salvare il record (" + e.getMessage() + ")");
        }
    }

    // ─── UTILITY ────────────────────────────────────────────────────────────────

    static double clamp(double v, double min, double max) {
        return Math.max(min, Math.min(max, v));
    }
}
