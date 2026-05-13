import javax.swing.*;
import java.awt.*;
import java.io.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class Spesa {

    // Aggiungi prodotti (nome, prezzo)
    static String[][] PRODOTTI = {
        {"Acqua 0.5L",      "0.30"},
		{"Acqua 1.5L",      "0.60"},
		{"Acqua 2L",        "1.00"},
		{"Acqua Frizzante", "0.80"},
		{"Aglio",           "0.60"},
		{"Ananas",          "2.00"},
		{"Arancia",         "0.90"},
		{"Arachidi",        "1.50"},
		{"Asparagi",        "2.50"},
		{"Avocado",         "1.80"},
		{"Bacon",           "2.50"},
		{"Banana",          "0.80"},
		{"Basilico",        "0.90"},
		{"Birra",           "1.50"},
		{"Biscotti",        "1.80"},
		{"Broccoli",        "1.80"},
		{"Burro",           "2.00"},
		{"Caffè",           "3.00"},
		{"Calamari",        "4.50"},
		{"Carne",           "5.00"},
		{"Carote",          "1.50"},
		{"Castagne",        "2.00"},
		{"Cavolo",          "1.50"},
		{"Cetriolo",        "1.50"},
		{"Cheeseburger",    "3.00"},
		{"Ciliegie",        "3.00"},
		{"Cipolla",         "0.90"},
		{"Cocco",           "2.00"},
		{"Cocomero",        "2.50"},
		{"Cornetto",        "1.20"},
		{"Cracker",         "1.50"},
		{"Crostini",        "1.00"},
		{"Fagioli",         "1.20"},
		{"Fagiolini",       "1.80"},
		{"Farina",          "0.80"},
		{"Fico",            "1.50"},
		{"Finocchio",       "1.20"},
		{"Formaggio",       "3.50"},
		{"Fragole",         "2.50"},
		{"Gamberi",         "5.00"},
		{"Gelato",          "2.50"},
		{"Grissini",        "1.20"},
		{"Hamburger",       "2.80"},
		{"Hot Dog",         "2.00"},
		{"Insalata",        "1.00"},
		{"Kiwi",            "1.50"},
		{"Lamponi",         "2.80"},
		{"Latte",           "1.50"},
		{"Lattuga",         "1.00"},
		{"Lenticchie",      "1.20"},
		{"Lime",            "0.80"},
		{"Limone",          "1.50"},
        {"L'oggetto",       "1000"},
		{"Maionese",        "1.80"},
		{"Mandorle",        "3.00"},
		{"Mango",           "1.80"},
		{"Margarina",       "1.50"},
		{"Marmellata",      "2.00"},
		{"Mela",            "0.50"},
		{"Melanzane",       "2.00"},
		{"Melone",          "1.50"},
		{"Miele",           "3.50"},
		{"Mirtilli",        "2.80"},
		{"More",            "2.80"},
		{"Mortadella",      "2.00"},
		{"Mozzarella",      "2.50"},
		{"Nocciole",        "2.50"},
		{"Noci",            "3.00"},
		{"Olio",            "2.10"},
		{"Olive",           "2.00"},
		{"Origano",         "0.80"},
		{"Pane",            "1.20"},
		{"Pane a fette",    "1.80"},
		{"Papaya",          "1.20"},
		{"Parmigiano",      "4.00"},
		{"Pasta",           "0.90"},
		{"Patate",          "1.20"},
		{"Patatine",        "2.50"},
		{"Pepe",            "1.00"},
		{"Peperone",        "1.80"},
		{"Pera",            "1.20"},
		{"Pesca",           "1.50"},
		{"Piselli",         "1.20"},
		{"Pizza Margherita","4.00"},
		{"Polpo",           "5.50"},
		{"Pomodoro",        "2.00"},
		{"Prosciutto",      "1.50"},
		{"Riso",            "1.20"},
		{"Risotto",         "3.50"},
		{"Rucola",          "1.20"},
		{"Salame",          "2.00"},
		{"Sale",            "0.70"},
		{"Salmone",         "5.00"},
		{"Salsiccia",       "1.80"},
		{"Salsa di Pomodoro","1.50"},
		{"Sedano",          "1.00"},
		{"Senape",          "1.20"},
		{"Spaghetti",       "2.80"},
		{"Spinaci",         "1.80"},
		{"Succo d'Arancia", "1.50"},
        {"Succo di Fragola", "1.50"},
		{"Succo di Mela",   "1.50"},
		{"Tè",              "2.50"},
		{"Tiramisù",        "3.50"},
		{"Tonno",           "2.50"},
		{"Uovo",            "1.20"},
		{"Uva",             "2.00"},
		{"Vaniglia",        "1.50"},
		{"Vino Bianco",     "4.00"},
		{"Vino Rosso",      "4.00"},
		{"Yogurt",          "1.20"},
		{"Zucca",           "1.50"},
		{"Zucchero",        "0.80"},
		{"Zucchine",        "0.80"},
    };


    // Mappa prodotto -> quantità nel carrello
    static Map<String, Integer> carrello = new LinkedHashMap<>();
    // Mappa prodotto -> prezzo
    static Map<String, Double> prezzi    = new LinkedHashMap<>();

    // Etichetta che mostra il totale in basso
    static JLabel labelTotale = new JLabel("Totale: €0.00");

    public static void main(String[] args) {
        // Carica prezzi dalla lista PRODOTTI
        for (String[] p : PRODOTTI)
            prezzi.put(p[0], Double.parseDouble(p[1]));

        // Finestra principale
        JFrame frame = new JFrame("Supermercato");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(500, 420);
        frame.setLayout(new BorderLayout(8, 8));

        // --- Pannello prodotti (sinistra) ---
        JPanel panelProdotti = new JPanel(new GridLayout(0, 1, 4, 4));
        panelProdotti.setBorder(BorderFactory.createTitledBorder("Prodotti disponibili"));

        for (String[] p : PRODOTTI) {
            String nome = p[0];
            double prz  = Double.parseDouble(p[1]);
            JButton btn = new JButton(nome + "  €" + String.format("%.2f", prz));
            btn.addActionListener(e -> {
                // Aggiunge 1 unità al carrello
                carrello.merge(nome, 1, Integer::sum);
                aggiornaTotale();
            });
            panelProdotti.add(btn);
        }

        // --- Pannello carrello (destra) ---
        DefaultListModel<String> modelCarrello = new DefaultListModel<>();
        JList<String> listaCarrello = new JList<>(modelCarrello);
        JScrollPane scrollCarrello = new JScrollPane(listaCarrello);
        scrollCarrello.setBorder(BorderFactory.createTitledBorder("Carrello"));

        // Bottone rimuovi
        JButton btnRimuovi = new JButton("Rimuovi selezionato");
        btnRimuovi.addActionListener(e -> {
            String sel = listaCarrello.getSelectedValue();
            if (sel == null) return;
            // Estrae il nome dal testo "Nome x2 - €..."
            String nome = sel.split(" x")[0];
            int qty = carrello.getOrDefault(nome, 0);
            if (qty > 1) carrello.put(nome, qty - 1);
            else         carrello.remove(nome);
            aggiornaTotale();
        });

        // Bottone acquista
        JButton btnAcquista = new JButton(" Acquista");
        btnAcquista.addActionListener(e -> {
            if (carrello.isEmpty()) {
                JOptionPane.showMessageDialog(frame, "Il carrello è vuoto!");
                return;
            }
            salvaScontrino();
            JOptionPane.showMessageDialog(frame,
                "Grazie per aver comprato da noi!\nScontrino salvato in scontrino.csv");
            carrello.clear();
            aggiornaTotale();
        });

        // Aggiorna la lista ogni volta che cambia il carrello
        labelTotale.addPropertyChangeListener("text", e -> {
            modelCarrello.clear();
            for (Map.Entry<String, Integer> entry : carrello.entrySet()) {
                String nome = entry.getKey();
                int    qty  = entry.getValue();
                double tot  = prezzi.get(nome) * qty;
                modelCarrello.addElement(nome + " x" + qty + "  - €" + String.format("%.2f", tot));
            }
        });

        // --- Layout ---
        JPanel destra = new JPanel(new BorderLayout(4, 4));
        destra.add(scrollCarrello, BorderLayout.CENTER);

        JPanel bottoni = new JPanel(new GridLayout(1, 2, 4, 4));
        bottoni.add(btnRimuovi);
        bottoni.add(btnAcquista);
        destra.add(bottoni, BorderLayout.SOUTH);

        labelTotale.setFont(new Font("Arial", Font.BOLD, 14));
        labelTotale.setHorizontalAlignment(SwingConstants.CENTER);

        frame.add(new JScrollPane(panelProdotti), BorderLayout.WEST);
        frame.add(destra, BorderLayout.CENTER);
        frame.add(labelTotale, BorderLayout.SOUTH);
        frame.setVisible(true);
    }

    // Ricalcola e mostra il totale
    static void aggiornaTotale() {
        double tot = 0;
        for (Map.Entry<String, Integer> e : carrello.entrySet())
            tot += prezzi.get(e.getKey()) * e.getValue();
        labelTotale.setText("Totale: €" + String.format("%.2f", tot));
    }

    // Salva lo scontrino nel file CSV
    static void salvaScontrino() {
        String data = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        try (PrintWriter pw = new PrintWriter(new FileWriter("scontrino.csv", true))) {
            pw.println("--- SCONTRINO ---," + data);
            pw.println("Grazie per aver comprato da noi!,");
            pw.println("Prodotto,Quantità,Prezzo unitario,Totale riga");
            double totale = 0;
            for (Map.Entry<String, Integer> e : carrello.entrySet()) {
                String nome = e.getKey();
                int    qty  = e.getValue();
                double prz  = prezzi.get(nome);
                double riga = prz * qty;
                totale += riga;
                pw.printf("%s,%d,%.2f,%.2f%n", nome, qty, prz, riga);
            }
            pw.printf("TOTALE,,,%.2f%n", totale);
            pw.println(); // riga vuota tra uno scontrino e l'altro
        } catch (IOException ex) {
            JOptionPane.showMessageDialog(null, "Errore nel salvare il file: " + ex.getMessage());
        }
    }
}
