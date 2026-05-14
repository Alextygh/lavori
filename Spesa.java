import javax.swing.*;
import java.awt.*;
import java.io.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class Spesa {

    // Aggiungi prodotti (nome, prezzo)
    static String[][] PRODOTTI = {
	    {"Acqua 0.5L",           "0.30"},
		{"Acqua 1.5L",           "0.60"},
		{"Acqua 2L",             "1.00"},
		{"Acqua Frizzante",      "0.80"},
		{"Acqua Tonica",         "1.20"},
		{"Aglio",                "0.60"},
		{"Agnello",              "6.00"},
		{"Albicocca",            "1.50"},
		{"Ananas",               "2.00"},
		{"Anacardi",             "3.00"},
		{"Anatra",               "5.50"},
		{"Arancia",              "0.90"},
		{"Arachidi",             "1.50"},
		{"Aringa",               "3.50"},
		{"Asparagi",             "2.50"},
		{"Avocado",              "1.80"},
		{"Bacon",                "2.50"},
		{"Baguette",             "2.00"},
		{"Banana",               "0.80"},
		{"Basilico",             "0.90"},
		{"Birra",                "1.50"},
		{"Birra Artigianale",    "3.00"},
		{"Biscotti",             "1.80"},
		{"Bistecca",             "7.00"},
		{"Broccoli",             "1.80"},
		{"Bruschetta",           "1.50"},
		{"Budino",               "1.80"},
		{"Burro",                "2.00"},
		{"Caffè",                "3.00"},
		{"Caffè Macchiato",      "3.50"},
		{"Calamari",             "4.50"},
		{"Carciofi",             "2.00"},
		{"Carne",                "5.00"},
		{"Carote",               "1.50"},
		{"Castagne",             "2.00"},
		{"Caviale",              "15.00"},
		{"Cavolo",               "1.50"},
		{"Cavolo Nero",          "2.00"},
		{"Cavolo Rosso",         "1.80"},
		{"Cetriolo",             "1.50"},
		{"Cheeseburger",         "3.00"},
		{"Ciliegie",             "3.00"},
		{"Cinghiale",            "6.50"},
		{"Cipolla",              "0.90"},
		{"Cipollotto",           "1.00"},
		{"Cocco",                "2.00"},
		{"Cocomero",             "2.50"},
		{"Coniglio",             "5.00"},
		{"Cornetto",             "1.20"},
		{"Cornetto Integrale",   "1.40"},
		{"Cotoletta",            "4.50"},
		{"Cracker",              "1.50"},
		{"Crema Pasticcera",     "2.00"},
		{"Crostata",             "3.00"},
		{"Crostini",             "1.00"},
		{"Curry",                "1.80"},
		{"Datteri",              "2.50"},
		{"Fagioli",              "1.20"},
		{"Fagiolini",            "1.80"},
		{"Farina",               "0.80"},
		{"Farina Integrale",     "1.00"},
		{"Farro",                "1.50"},
		{"Fico",                 "1.50"},
		{"Finocchio",            "1.20"},
		{"Fiocchi di Avena",     "1.20"},
		{"Focaccia",             "2.00"},
		{"Formaggio",            "3.50"},
		{"Formaggio Spalmabile", "2.50"},
		{"Fragole",              "2.50"},
		{"Frutti di Bosco",      "3.00"},
		{"Funghi",               "2.50"},
		{"Gallette di Riso",     "1.50"},
		{"Gamberi",              "5.00"},
		{"Gelato",               "2.50"},
		{"Ghiaccio",             "0.01"},
		{"Ghiacciolo",           "1.50"},
		{"Gorgonzola",           "4.00"},
		{"Grana",                "1.50"},
		{"Grissini",             "1.20"},
		{"Guacamole",            "2.50"},
		{"Hamburger",            "2.80"},
		{"Hot Dog",              "2.00"},
		{"Hummus",               "2.00"},
		{"Insalata",             "1.00"},
		{"Insalata Mista",       "1.50"},
		{"Ketchup",              "1.20"},
		{"Kiwi",                 "1.50"},
		{"Lamponi",              "2.80"},
		{"Lasagne",              "4.00"},
		{"Latte",                "1.50"},
		{"Latte di Cocco",       "1.80"},
		{"Latte di Mandorla",    "2.00"},
		{"Latte di Soia",        "1.80"},
		{"Lattuga",              "1.00"},
		{"Lenticchie",           "1.20"},
		{"Lime",                 "0.80"},
		{"Limone",               "1.50"},
		{"Maionese",             "1.80"},
		{"Mais",                 "1.00"},
		{"Mandorle",             "3.00"},
		{"Mango",                "1.80"},
		{"Margarina",            "1.50"},
		{"Marmellata",           "2.00"},
		{"Marshmallow",          "1.50"},
		{"Mela",                 "0.50"},
		{"Mela Verde",           "0.60"},
		{"Melanzane",            "2.00"},
		{"Melone",               "1.50"},
		{"Melograno",            "2.50"},
		{"Menta",                "0.90"},
		{"Miele",                "3.50"},
		{"Mirtilli",             "2.80"},
		{"More",                 "2.80"},
		{"Mortadella",           "2.00"},
		{"Mozzarella",           "2.50"},
		{"Mozzarella di Bufala", "3.50"},
		{"Noce Moscata",         "1.80"},
		{"Nocciole",             "2.50"},
		{"Noci",                 "3.00"},
		{"Noci Pecan",           "3.50"},
		{"Olio",                 "2.10"},
		{"Olio di Cocco",        "3.00"},
		{"Olive",                "2.00"},
		{"Origano",              "0.80"},
		{"Pancake",              "2.00"},
		{"Pane",                 "1.20"},
		{"Pane a fette",         "1.80"},
		{"Pane Integrale",       "1.50"},
		{"Pane di Segale",       "1.80"},
		{"Panino",               "2.00"},
		{"Papaya",               "1.20"},
		{"Paprika",              "1.00"},
		{"Parmigiano",           "4.00"},
		{"Pasta",                "0.90"},
		{"Pasta Integrale",      "1.20"},
		{"Patate",               "1.20"},
		{"Patate Dolci",         "1.80"},
		{"Patatine",             "2.50"},
		{"Pecorino",             "3.50"},
		{"Pepe",                 "1.00"},
		{"Pepe Rosa",            "1.50"},
		{"Peperone",             "1.80"},
		{"Peperone Rosso",       "2.00"},
		{"Pera",                 "1.20"},
		{"Pesca",                "1.50"},
		{"Pesto",                "2.50"},
		{"Piadina",              "2.50"},
		{"Piselli",              "1.20"},
		{"Pizza Margherita",     "4.00"},
		{"Pizza Diavola",        "5.00"},
		{"Pizza Prosciutto",     "5.00"},
		{"Pizza Randomica",      "5.00"},
		{"Pizza Vegana",         "4.50"},
		{"Platano",              "1.20"},
		{"Polpo",                "5.50"},
		{"Pollo",                "4.00"},
		{"Pomodoro",             "2.00"},
		{"Pomodori Secchi",      "2.50"},
		{"Pompelmo",             "1.20"},
		{"Prosciutto",           "1.50"},
		{"Prosciutto Cotto",     "2.00"},
		{"Prugne",               "1.50"},
		{"Quinoa",               "2.50"},
		{"Radicchio",            "1.50"},
		{"Ragù",                 "1.50"},
		{"Rape",                 "1.20"},
		{"Ricotta",              "2.50"},
		{"Ribes",                "2.80"},
		{"Riso",                 "1.20"},
		{"Riso Integrale",       "1.50"},
		{"Risotto",              "3.50"},
		{"Rosmarino",            "0.80"},
		{"Rucola",               "1.20"},
		{"Salame",               "2.00"},
		{"Sale",                 "0.70"},
		{"Sale Marino",          "0.90"},
		{"Salmone",              "5.00"},
		{"Salmone Affumicato",   "6.00"},
		{"Salsiccia",            "1.80"},
		{"Salsa Barbecue",       "1.50"},
		{"Salsa di Pomodoro",    "1.50"},
		{"Salsa Piccante",       "1.50"},
		{"Salvia",               "0.90"},
		{"Sardine",              "2.50"},
		{"Sedano",               "1.00"},
		{"Sedano Rapa",          "1.50"},
		{"Senape",               "1.20"},
		{"Sesamo",               "1.50"},
		{"Sgombro",              "3.00"},
		{"Soda 1.5L",            "1.00"},
		{"Sottilette",           "3.00"},
		{"Spaghetti",            "2.80"},
		{"Speck",                "3.00"},
		{"Spinaci",              "1.80"},
		{"Succo d'Arancia",      "1.50"},
		{"Succo di Ananas",      "1.50"},
		{"Succo di Fragola",     "1.50"},
		{"Succo di Limone",      "1.50"},
		{"Succo di Mango",       "1.50"},
		{"Succo di Mela",        "1.50"},
		{"Succo di Pera",        "1.50"},
		{"Succo di Pesca",       "1.50"},
		{"Succo di Pomodoro",    "1.50"},
		{"Succo di Uva",         "1.50"},
		{"Tacchino",             "4.50"},
		{"Tagliatelle",          "2.80"},
		{"Tè",                   "2.50"},
		{"Tè Verde",             "2.50"},
		{"Timo",                 "0.80"},
		{"Tiramisù",             "3.50"},
		{"Tofu",                 "2.50"},
		{"Tonno",                "2.50"},
		{"Torta al Cioccolato",  "4.00"},
		{"Torta di Mele",        "3.50"},
		{"Tortellini",           "3.50"},
		{"Tramezzini",           "1.50"},
		{"Uovo",                 "1.20"},
		{"Uva",                  "2.00"},
		{"Uva Passa",            "1.80"},
		{"Vaniglia",             "1.50"},
		{"Verdure Miste",        "2.00"},
		{"Vino Bianco",          "4.00"},
		{"Vino Rosato",          "4.00"},
		{"Vino Rosso",           "4.00"},
		{"Vitello",              "6.00"},
		{"Vongole",              "2.00"},
		{"Wafer",                "2.00"},
		{"Wurstel",              "1.80"},
		{"Yogurt",               "1.20"},
		{"Yogurt Greco",         "1.80"},
		{"Zafferano",            "5.00"},
		{"Zenzero",              "1.50"},
		{"Zucca",                "1.50"},
		{"Zucchero",             "0.80"},
		{"Zucchero di Canna",    "1.00"},
		{"Zucchine",             "0.80"},
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
