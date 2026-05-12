import java.io.*;
import java.util.*;

/**
 * BUNKER-7 - Versione compatta
 *
 * Regole:
 *  - 6 statistiche: O2, FOOD, PWR, H2O, RAD, MORALE
 *  - Crisi con 3 risposte (1 corretta), timeout 30s
 *  - Risposta corretta  -> +10 punti
 *  - Risposta sbagliata / timeout -> la stat viene danneggiata
 *  - Game over se O2/FOOD/PWR/H2O/MORALE <= 0  oppure  RAD >= 100
 */
public class Bunker7 {

    // ─── COSTANTI ───────────────────────────────────────────────────────────────

    static final int    TICK_MS       = 1000;
    static final int    CRISIS_EVERY  = 8;
    static final int    CRISIS_TIMEOUT = 30;
    static final String SAVE_FILE     = "highscore.txt";

    // ─── INDICI STATISTICHE ─────────────────────────────────────────────────────

    static final int O2 = 0, FOOD = 1, PWR = 2, H2O = 3, RAD = 4, MORALE = 5;

    static final String[] STAT_NAMES = { "O2", "FOOD", "PWR", "H2O", "RAD", "MORALE" };
    static final String[] DEATH_MSG  = {
        "OSSIGENO ESAURITO", "CIBO ESAURITO", "ENERGIA ESAURITA",
        "ACQUA ESAURITA", null, "MORALE A ZERO"
    };
    static final double[] DRAIN = { 0.3, 0.2, 0.2, 0.25, -0.15, 0.15 };

    static double[] stats = new double[6];

    // ─── CRISI ──────────────────────────────────────────────────────────────────

    // { titolo, descrizione, opzioni[], indice_corretto, stat_colpita, danno }
    static Object[][] CRISES = {
        { "O2 PIPE BURST",      "Ossigeno che fuoriesce dal settore 3.",
          new String[]{"SIGILLA MORSETTO","APRI SFOGO","TAPPO SCHIUMA"}, 0, O2, 28 },
        { "FUMO NEI CORRIDOI",  "Fumo denso sta riempiendo i corridoi.",
          new String[]{"ALOGENO","APRI PRESE","VENTOLE AL CONTRARIO"}, 0, O2, 20 },
        { "CIBO CONTAMINATO",   "La contaminazione si sta diffondendo nelle riserve.",
          new String[]{"INCENERISCI","DISTRIBUISCI","IGNORA"}, 0, FOOD, 24 },
        { "INFESTAZIONE",       "Creature sconosciute consumano le razioni.",
          new String[]{"ULTRASUONI","APRI PORTELLO","TRAPPOLA ESCA"}, 0, FOOD, 16 },
        { "SOVRATENSIONE",      "Sovraccarico della rete, supporto vitale a rischio.",
          new String[]{"DIVERTICELLA","INTERROMPI QUADRO","BILANCIAMENTO"}, 1, PWR, 26 },
        { "GENERATORE KO",      "Il generatore di riserva si è rifiutato di avviarsi.",
          new String[]{"PREPARA CARBURANTE","RESET CTRL","MANOVELLA"}, 0, PWR, 30 },
        { "TOSSINE ACQUA",      "Tracce chimiche nel circuito di riciclo.",
          new String[]{"FILTRO POTENZIATO","SVUOTA CIRCUITO","DILUI"}, 0, H2O, 22 },
        { "POMPA BLOCCATA",     "Guasto al cuscinetto della pompa principale.",
          new String[]{"LUBRIFICA","SOSTITUISCI POMPA","BYPASS"}, 1, H2O, 20 },
        { "PICCO RADIAZIONI",   "Letture del Geiger critiche. Settore esposto.",
          new String[]{"SPRAY DECON","SIGILLA PARETI","APRI SFIATI"}, 1, RAD, 30 },
        { "BRILLAMENTO SOLARE", "Tempesta di radiazioni che colpisce la superficie.",
          new String[]{"CORRI IN SUPERFICIE","RIFUGIO PROFONDO","SIGILLO PARZIALE"}, 1, RAD, 34 },
        { "PANICO DI MASSA",    "I residenti stanno perdendo il controllo psicologico.",
          new String[]{"TRASMETTI CALMA","TEST SIRENA","SILENZIO"}, 0, MORALE, 18 },
        { "MINACCIA DI RIVOLTA","I residenti vogliono prendere il controllo del bunker.",
          new String[]{"NEGOZIA","MOSTRA DATI","BLOCCA TUTTO"}, 1, MORALE, 22 },
    };

    // ─── STATO DI GIOCO ─────────────────────────────────────────────────────────

    static int     score = 0, tick = 0, highScore = 0;
    static boolean running = true;
    static Object[] activeCrisis = null;
    static long     crisisStart  = 0;

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
        Arrays.fill(stats, 100);
        stats[RAD] = 0;
        score = tick = 0;
        running = true;
        activeCrisis = null;
    }

    // ─── LOOP PRINCIPALE ────────────────────────────────────────────────────────

    static void runGameLoop() throws InterruptedException {
        long lastTick = System.currentTimeMillis();
        while (running) {
            long elapsed = System.currentTimeMillis() - lastTick;
            if (elapsed < TICK_MS) Thread.sleep(TICK_MS - elapsed);
            lastTick = System.currentTimeMillis();

            if (activeCrisis != null && timeLeft() <= 0) crisisTimeout();

            applyDrain();
            tick++;
            score++;

            if (activeCrisis == null && tick % CRISIS_EVERY == 0) spawnCrisis();
            if (isGameOver()) { running = false; break; }

            printStatus();
        }
        gameOver();
    }

    // ─── STATISTICHE ────────────────────────────────────────────────────────────

    static void applyDrain() {
        for (int i = 0; i < 6; i++)
            stats[i] = clamp(stats[i] - DRAIN[i], 0, 100);
    }

    static boolean isGameOver() {
        for (int i = 0; i < 6; i++) {
            if (i != RAD && stats[i] <= 0) {
                System.out.println("\n>>> " + DEATH_MSG[i] + ". Fine.");
                return true;
            }
        }
        if (stats[RAD] >= 100) { System.out.println("\n>>> RADIAZIONI LETALI. Fine."); return true; }
        return false;
    }

    // ─── CRISI ──────────────────────────────────────────────────────────────────

    static void spawnCrisis() {
        activeCrisis = CRISES[rng.nextInt(CRISES.length)];
        crisisStart  = System.currentTimeMillis();
        System.out.println("\n!!! CRISI: " + activeCrisis[0] + " !!!");
    }

    static void crisisTimeout() {
        applyStatDamage((int) activeCrisis[4], (int) activeCrisis[5], "TIMEOUT");
        activeCrisis = null;
    }

    static void answerCrisis(int choice) {
        if (choice == (int) activeCrisis[3]) {
            System.out.println(">>> CORRETTO! +10 punti.");
            score += 10;
        } else {
            applyStatDamage((int) activeCrisis[4], (int) activeCrisis[5], "RISPOSTA SBAGLIATA");
        }
        activeCrisis = null;
    }

    static void applyStatDamage(int stat, int dmg, String reason) {
        int dir = (stat == RAD) ? 1 : -1;
        stats[stat] = clamp(stats[stat] + dir * dmg, 0, 100);
        System.out.printf(">>> %s: %s %+d%% (ora %d%%)%n", reason, STAT_NAMES[stat], dir * dmg, (int) stats[stat]);
    }

    static int timeLeft() {
        return (int) (CRISIS_TIMEOUT - (System.currentTimeMillis() - crisisStart) / 1000);
    }

    // ─── OUTPUT + INPUT ─────────────────────────────────────────────────────────

    static void printStatus() {
        System.out.println("\n──────────── TICK " + tick + " │ PUNTEGGIO " + score
            + " │ RECORD " + highScore + " ────────────");
        for (int i = 0; i < 6; i++) {
            System.out.printf("  %-7s %3d%%", STAT_NAMES[i], (int) stats[i]);
            if (i % 3 == 2) System.out.println();
        }
        if (activeCrisis == null) return;

        String[] opts = (String[]) activeCrisis[2];
        System.out.println("\n  [CRISI] " + activeCrisis[0]);
        System.out.println("  " + activeCrisis[1]);
        System.out.println("  Tempo rimasto: " + timeLeft() + "s");
        for (int i = 0; i < opts.length; i++)
            System.out.println("    " + (i + 1) + ". " + opts[i]);
        System.out.print("  Risposta [1-" + opts.length + "]: ");

        try {
            String line = input.nextLine().trim();
            if (activeCrisis == null) return;
            if (line.isEmpty()) { crisisTimeout(); return; }
            int n = Integer.parseInt(line) - 1;
            if (n >= 0 && n < opts.length) answerCrisis(n); else crisisTimeout();
        } catch (Exception e) { crisisTimeout(); }
    }

    // ─── GAME OVER ──────────────────────────────────────────────────────────────

    static void gameOver() {
        System.out.println("\n╔══════════════════════════════╗\n║         GAME OVER            ║\n╚══════════════════════════════╝");
        System.out.println("Punteggio finale: " + score);
        if (score > highScore) {
            saveHighScore(highScore = score);
            System.out.println("NUOVO RECORD: " + highScore + " salvato in " + SAVE_FILE);
        } else {
            System.out.println("Record attuale: " + highScore);
        }
        System.out.print("\nRigioca? (s/n): ");
        try {
            if (input.nextLine().trim().equalsIgnoreCase("s")) {
                initStats();
                runGameLoop();
                return;
            }
        } catch (Exception e) {}
        System.out.println("Arrivederci.");
    }

    // ─── SALVATAGGIO RECORD ─────────────────────────────────────────────────────

    static int loadHighScore() {
        try (BufferedReader br = new BufferedReader(new FileReader(SAVE_FILE))) {
            return Integer.parseInt(br.readLine().trim());
        } catch (Exception e) { return 0; }
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
