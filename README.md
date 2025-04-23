# Introduzione

Abbiamo svolto il progetto Selfie con estensione 18-33 dell'a.a. 2023/2024.

# Membri del gruppo

| Matricola  | Nome         | Cognome  | Email                              |
| ---------- | ------------ | -------- | ---------------------------------- |
| 0001079345 | Daniele Vito | Ardito   | danielevito.ardito@studio.unibo.it |
| 0001100617 | Leonardo     | Berselli | leonardo.berselli@studio.unibo.it  |
| 0001079778 | Francesco    | Tomba    | francesco.tomba2@studio.unibo.it   |

# Dettagli del progetto

## Distribuzione del lavoro

Ciascun componente del gruppo ha lavorato a vari sottocomponenti di molte delle funzionalità. Ci siamo interscambiati nelle parti principali, in modo che ognuno avesse una maggior padronanza dell'intero progetto. Ciononostante ogni componente ha più familiarità con alcune parti. Nello specifico:

- Daniele Vito Ardito: Sviluppo backend di note, progetti, calendario, preview, impostazioni. Sviluppo frontend di note, hub note, hub progetti, impostazioni
- Leonardo Berselli: Sviluppo backend di progetti. Sviluppo frontend di progetti, pomodoro, chat, impostazioni, landing page, login/signup, modali, miglioramento ui/ux
- Francesco Tomba: Sviluppo backend di calendario, notifiche, chat, time machine, pomodoro, autenticazione, inviti, impostazioni. Sviluppo frontend di home, calendario, inbox, toast

## Uso di AI generativa

La abbiamo usata principalmente per completamento (attraverso GitHub Copilot e Codeium) e per generare piccoli componenti React poi corretti manualmente.

## Tecnologie e librerie usate

### Nel progetto

- **Next.js**: Scelto per le sue funzioni e perchè basato su React
- **Typescript**: Scelto per il tipaggio esplicito
- **MongoDB**: Database gerarchico
- **Bootstrap**: Scelto per la realizzazione di interfacce responsive

### Per lo sviluppo

- **VSCode**: Editor di testo utilizzato da tutti i membri
- **GitHub**: Piattaforma per il versioning del codice
- **Postman**: Software per testare API
- **MongoDB Atlas**: Piattaforma per la gestione di un DB remoto condiviso

## Funzionalità

### Home

Visualizzazione delle anteprime di:

- Calendario
- Chat
- Note
- Progetti
- Pomodoro

### Calendario

- Visualizzazione Giornaliero/Settimanale/Mensile di:
    - Eventi
    - Attività
    - Sessioni Pomodoro
    - Attività di Progetto
- Visualizzazione a lista delle attività
- Aggiunta/modifica/eliminazione di:
    - Eventi
    - Attività
    - Sessioni Pomodoro
- Visualizzazione risorse disponibili con relativo calendario
- Esportazione del calendario in formato iCal

### Note

- Visualizzazione delle note con relative icone esplicative
- Gestione della singola nota
    - Visualizzazione e modifica del testo
    - Gestione inviti e permessi

### Chat

- Invio messaggi in chat private e gruppi

### Progetti

- Visualizzazione progetti con relative icone e link alle note associate
- Gestione del singolo progetto
    - Visualizzazione a lista
    - Visualizzazione Gannt
    - Creazione/modifica/eliminazione di attività, fasi e sottofasi
    - Gestione stato di attività
    - Gestione link tra attività
    - Gestione ritardi

### Pomodoro

- Gestione di una sessione personalizzata
- Gestione di una sessione ripetuta da calendario

### Impostazioni

- Gestione informazioni utente
- Gestione preverenze per le preview
- Gestione preferenze per le notifiche
    - Invio di email
    - Invio notifiche push
- Modifica dell'immagine di profilo

### Inbox

- Visualizzazione inviti ricevuti da altri utenti per
    - Progetti
    - Note
    - Calendario
