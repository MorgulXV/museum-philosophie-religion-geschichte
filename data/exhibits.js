/**
 * data/exhibits.js — vollständiges Museumsmodell
 *
 * 39 Exponate, 5 Räume, 3 Stränge: "philosophie" | "religion" | "geschichte"
 * Jedes Exponat hat:
 *   id          — eindeutiger Bezeichner (kebab-case, englisch)
 *   room        — Raum 1–5
 *   strand      — "philosophie" | "religion" | "geschichte"
 *   date        — Datum/Zeitraum (Anzeigestring)
 *   name        — Ausstellungsname
 *   artefact    — { description, assetHint }
 *   cardText    — Kurztext für die Exponatkarte (1–2 Sätze)
 *   panelText   — { story, keyIdea, quote: {text, source} | null, disputed: string | null }
 *   influences  — Liste von Exponat-IDs, die DIESES Exponat direkt beeinflusst hat
 */

export const STRANDS = {
  philosophie: { label: "Philosophie", color: "#4a6fa5" },
  religion:    { label: "Religion",    color: "#2d6a4f" },
  geschichte:  { label: "Geschichte",  color: "#8b5e3c" },
};

export const rooms = [
  {
    id: 1,
    title: "Die antike Verschmelzung",
    dates: "ca. 530 v. Chr. – 415 n. Chr.",
    accentColor: "#4a6fa5",
    throughlineRole: "Verschmelzung",
    thesis: "Philosophie zu betreiben war ein religiöser Akt.",
  },
  {
    id: 2,
    title: "Die Philosophie dient dem Glauben",
    dates: "ca. 476 – 1277",
    accentColor: "#2d6a4f",
    throughlineRole: "Magd",
    thesis: "Philosophie diente dem Glauben als Magd der Theologie.",
  },
  {
    id: 3,
    title: "Die Vernunft wird zur Richterin",
    dates: "1440 – 1804",
    accentColor: "#b5541a",
    throughlineRole: "Richterin",
    thesis: "Die Vernunft hört auf zu dienen und beginnt zu richten.",
  },
  {
    id: 4,
    title: "Die Vernunft klagt an",
    dates: "1841 – 1889",
    accentColor: "#8b2635",
    throughlineRole: "Anklägerin",
    thesis: "Die Frage wechselt von »Ist es wahr?« zu »Warum glauben wir?«",
  },
  {
    id: 5,
    title: "Das moderne Gespräch",
    dates: "1900 – 2009",
    accentColor: "#4a4a4a",
    throughlineRole: "Gespräch",
    thesis: "Anklage und Verteidigung sitzen am selben Tisch.",
  },
];

export const throughline = [
  { roomId: 1, label: "Verschmelzung" },
  { roomId: 2, label: "Magd" },
  { roomId: 3, label: "Richterin" },
  { roomId: 4, label: "Anklägerin" },
  { roomId: 5, label: "Gespräch" },
];

export const exhibits = [

  // ══════════════════════════════════════════════════════════════
  // RAUM I — Die antike Verschmelzung (ca. 530 v. Chr. – 415 n. Chr.)
  // ══════════════════════════════════════════════════════════════

  {
    id: "pythagoras",
    room: 1,
    strand: "philosophie",
    date: "ca. 530 v. Chr.",
    name: "Pythagoras — Die heilige Bruderschaft",
    artefact: {
      description: "Ein kleines, dunkel patiniertes Bronzedreieck mit zehn eingravierten Punkten in vier Reihen — die Tetraktys, das heiligste Symbol der Pythagoreer. Daneben liegt eine vertrocknete Bohnenhülse und eine winzige Lyra aus hellem Holz mit gespannten Metallsaiten.",
      assetHint: "ancient lyre lowpoly",
    },
    cardText: "Eine geheime Bruderschaft, in der Mathematik Gottesdienst war.",
    panelText: {
      story:
        "Pythagoras gründete um 530 v. Chr. in Kroton (Magna Graecia) eine religiös-philosophische Gemeinschaft mit strengen Regeln: Schweigegebot, Askese, Glaube an Seelenwanderung (Metempsychose). Die Mitglieder teilten sich in akousmatikoi (religiöse Praxis) und mathematikoi (Wissenschaft). Aber beide Gruppen verfolgten denselben Heilsweg. Für Pythagoras war Mathematik kein weltliches Werkzeug, sondern eine Form der Gottesverehrung: Wer die Zahl versteht, versteht die Struktur des Göttlichen.",
      keyIdea:
        "Philosophie und Religion waren eine Tätigkeit. Das ist der Ausgangspunkt des gesamten Museums: Nicht Entgegensetzung, sondern völlige Verschmelzung.",
      quote: {
        text: "Halt ein! Schlage es nicht! Denn es ist die Seele eines Freundes, die ich erkannte, als ich sie schreien hörte.",
        source: "Xenophanes über Pythagoras (DK 21 B 7) — zur Seelenwanderungslehre",
      },
      disputed:
        "Pythagoras hinterließ keine Schriften. Fast alles stammt aus Quellen 200–700 Jahre nach seinem Tod. Das Bohnentabu und die Geschichte seines Todes auf einem Bohnenfeld gelten als legendenhaft.",
    },
    influences: ["platon", "stoiker_logos"],
  },

  {
    id: "platon",
    room: 1,
    strand: "philosophie",
    date: "ca. 375–360 v. Chr.",
    name: "Platon — Die Ideen und der göttliche Handwerker",
    artefact: {
      description: "Eine kleine Armillarsphäre aus gebürstetem Messing schwebt auf dünnen Drähten über dem Sockel. Um sie herum kreisen die fünf Platonischen Körper in mattem Weiß, leicht von innen erleuchtet.",
      assetHint: "armillary sphere lowpoly",
    },
    cardText: "Hinter der sichtbaren Welt liegt ein Reich vollkommener, ewiger Ideen.",
    panelText: {
      story:
        "In der Politeia (ca. 375 v. Chr.) lehrt Platon: Die sichtbaren Dinge sind unvollkommene Abbilder ewiger Ideen. Das Höhlengleichnis zeigt Menschen, die Schatten für die Wirklichkeit halten. Im Timaios (ca. 360 v. Chr.) schafft der Demiurg, ein göttlicher Handwerker, den Kosmos: Er schaut auf die ewigen Ideen und erlegt einer vorhandenen Unordnung mathematische Ordnung auf. An der Spitze aller Ideen steht das Gute, das alles erkennbar macht wie die Sonne alles sichtbar macht.",
      keyIdea:
        "Platon gibt der westlichen Welt die Grundstruktur, die alle späteren monotheistischen Religionen erben werden: ein ewiges, vollkommenes Reich jenseits der Sinne, ein schöpferischer Geist, der nach vollkommenem Vorbild handelt. Das ist Philosophie, die wie Theologie klingt.",
      quote: {
        text: "Den Schöpfer und Vater dieses Alls zu finden, ist schwierig; und wenn man ihn gefunden hat, ist es unmöglich, ihn der Menge mitzuteilen.",
        source: "Platon, Timaios 28c",
      },
      disputed:
        "Der Demiurg erschafft NICHT aus dem Nichts — er formt vorhandene Materie. Das ist ein häufiger Irrtum beim Vergleich mit der späteren christlichen creatio ex nihilo.",
    },
    influences: ["plotin", "augustinus", "aquin"],
  },

  {
    id: "stoiker_logos",
    room: 1,
    strand: "philosophie",
    date: "ca. 300 v. Chr. – 100 n. Chr.",
    name: "Die Stoa — Gott ist der Logos",
    artefact: {
      description: "Eine glatte, goldene Kugel aus poliertem Messing steht auf dem Sockel — vollkommen und ohne Naht. Um sie zieht sich eine eingravierte Linie, die den Logos, den alles durchdringenden Vernunftfaden, symbolisiert.",
      assetHint: "gold sphere metallic procedural",
    },
    cardText: "Die rationale Ordnung des Kosmos: das ist Gott.",
    panelText: {
      story:
        "Zenon von Kition (ca. 334–262 v. Chr.) lehrte: Gott ist nicht ein Wesen außerhalb der Welt. Gott ist der Logos, das vernünftige, feurige Prinzip, das die ganze Natur durchdringt und belebt. Jeder Mensch trägt einen Funken des göttlichen Logos in sich (logos spermatikos). Philon von Alexandria (ca. 25 v. Chr. – 50 n. Chr.) verband diesen Logos mit dem hebräischen Schöpfergott. Das Ergebnis steht im Prolog des Johannesevangeliums: »Im Anfang war der Logos.«",
      keyIdea:
        "Der stoische Logos ist Pantheismus in seiner frühesten Form und gleichzeitig die philosophische Brücke, über die griechisches Denken unmittelbar ins Christentum einzieht, noch vor dem Mittelalter.",
      quote: {
        text: "Im Anfang war der Logos, und der Logos war bei Gott, und Gott war der Logos.",
        source: "Johannesevangelium 1:1 — direkte Übernahme stoischer Sprache in die christliche Theologie",
      },
      disputed: null,
    },
    influences: ["augustinus", "aquin"],
  },

  {
    id: "plotin",
    room: 1,
    strand: "philosophie",
    date: "204–270 n. Chr.",
    name: "Plotin — Das Eine und die Emanation",
    artefact: {
      description: "Eine Kerzenflamme in einem geschlossenen Glasgefäß wirft konzentrisches Licht auf drei ineinandergeschachtelte Ringe aus dunkelblauem Glas — das Eine, der Nous, die Seele.",
      assetHint: "candle glass jar",
    },
    cardText: "Alles fließt aus dem Einen, und die Seele kann zurückfließen.",
    panelText: {
      story:
        "Plotin (204–270 n. Chr.), der größte Systematiker der Spätantike, lehrte: Aus dem Einen (dem unaussprechlichen Urgrund) emaniert der Nous (der göttliche Geist), aus dem Nous die Seele, aus der Seele die Materie: wie Licht von der Sonne, ohne dass die Quelle abnimmt. Die menschliche Seele kann durch Kontemplation zur mystischen Vereinigung (Henosis) mit dem Einen aufsteigen. Plotin berichtete, diese Erfahrung selbst mehrfach gemacht zu haben.",
      keyIdea:
        "Das gesamte Gerüst der christlichen Mystik (transzendenter Gott, Abstufungen der Wirklichkeit, die Seele die zu Gott zurückkehrt, das Böse als Mangel) stammt fast vollständig von Plotin. Augustinus las ihn auf Latein, bevor er Christ wurde.",
      quote: {
        text: "Das Eine ist vollkommen, weil es nichts sucht, nichts hat und nichts braucht.",
        source: "Plotin, Enneaden V.1.6",
      },
      disputed:
        "Eine arabische Teilübersetzung der Enneaden kursierte im Mittelalter unter dem Titel »Theologie des Aristoteles« — ein folgenreicher Irrtum, der die islamische Philosophie unter falscher Zuschreibung prägte.",
    },
    influences: ["augustinus", "aquin"],
  },

  {
    id: "hypatia",
    room: 1,
    strand: "religion",
    date: "März 415 n. Chr.",
    name: "Hypatia — Das Ende der Verschmelzung",
    artefact: {
      description: "Ein angeschlagenes, leicht zerkratztes Bronze-Astrolabium liegt auf einem bewusst unvollständigen, an einer Ecke abgebrochenen Marmorsockel-Fragment — als sei der Sockel selbst beschädigt worden.",
      assetHint: "astrolabe brass antique",
    },
    cardText: "Die letzte große heidnische Philosophin Alexandrias. Ermordet im März 415.",
    panelText: {
      story:
        "Hypatia, Tochter des Mathematikers Theon von Alexandria, war Neoplatonikerin, Mathematikerin und Astronomin. Heiden und Christen hörten gleichermaßen ihre Vorlesungen. Im März 415 zerrte ein von einem Kirchenlektor angeführter Mob sie vom Wagen, schleppte sie in die Kirche Caesareum und ermordete sie. Ihr Tod markiert symbolisch das Ende der antiken Koexistenz von heidnischer Philosophie und aufsteigendem Christentum in Alexandria.",
      keyIdea:
        "Ihr Tod ist kein Beweis eines »Kriegs zwischen Wissenschaft und Glaube«. Er zeigt, dass die antike Verschmelzung politisch endlich war: Zwei überschneidende Institutionen kollidierten, und die Philosophie verlor.",
      quote: {
        text: "Es gab eine Frau in Alexandria namens Hypatia, Tochter des Philosophen Theon. Sie hatte eine solche Bildung erlangt, dass sie alle Philosophen ihrer Zeit übertraf.",
        source: "Sokrates Scholastikos, Historia Ecclesiastica 7.15 (ca. 439 n. Chr.)",
      },
      disputed:
        "Sokrates Scholastikos deutet die Tat als politische Eifersucht zwischen Präfekt Orestes und Bischof Kyrill — nicht als Konflikt »Wissenschaft gegen Glaube«. Die Vereinfachung sollte vermieden werden.",
    },
    influences: [],
  },

  {
    id: "fall_roms",
    room: 1,
    strand: "geschichte",
    date: "476 n. Chr. ff.",
    name: "Der Fall Roms — Die Kirche als Bewahrerin",
    artefact: {
      description: "Ein umgestürzter, verwitterter Säulenschaft aus weißem Marmor liegt schräg auf dem Sockel; über ihm liegt sorgfältig eine aufgerollte Handschrift — gerettet aus den Trümmern.",
      assetHint: "broken column marble",
    },
    cardText: "Das politische Vakuum nach Rom machte die Kirche zur einzigen Bewahrerin des Wissens.",
    panelText: {
      story:
        "476 n. Chr., das traditionelle Datum des Endes des Weströmischen Reiches, hinterließ ein Machtvakuum. Die Kirche war die einzige flächendeckend organisierte Institution und übernahm Verwaltung, Bildung und Recht. Die Klöster wurden zu den Orten, an denen klassische Texte abgeschrieben und bewahrt wurden. Boethius' Hinrichtung (524) geschah in diesem Kontext: Als Beamter geriet er zwischen die Fronten im Machtspiel zwischen Ostgoten und Byzanz.",
      keyIdea:
        "Geschichte bestimmte die Philosophie: Die politische Katastrophe erzwang die »Magd«-Stellung des nächsten Akts. Nicht freie Entscheidung, sondern strukturelle Not machte die Philosophie zur Dienerin der Religion.",
      quote: null,
      disputed: null,
    },
    influences: ["boethius"],
  },

  // ══════════════════════════════════════════════════════════════
  // RAUM II — Die mittelalterliche Synthese (ca. 476 – 1277)
  // ══════════════════════════════════════════════════════════════

  {
    id: "augustinus",
    room: 2,
    strand: "religion",
    date: "354–430 n. Chr.",
    name: "Augustinus — Der getaufte Platon",
    artefact: {
      description: "Eine aufgeschlagene Handschrift liegt zwischen einem heidnischen Öllämpchen und einem christlichen Kreuz auf demselben Sockel — beide brennend.",
      assetHint: "oil lamp ancient clay",
    },
    cardText: "Augustinus taufte den Neuplatonismus und gab ihm christlichen Namen.",
    panelText: {
      story:
        "Augustinus von Hippo (354–430) las Plotins Enneaden auf Latein, bevor er zum Christentum konvertierte. In den Confessiones (397–400) schildert er, wie die neuplatonische Idee des Aufstiegs der Seele zu Gott ihn auf das Christentum vorbereitete. Er übernahm fast das gesamte neuplatonische Gerüst: transzendenter Gott, die Ideen als Gedanken Gottes, das Böse als privatio boni (Mangel am Guten), die Seele die zu Gott zurückstrebt.",
      keyIdea:
        "Augustinus ist die lebendige Brücke zwischen Antike und Mittelalter: Platon und Plotin überleben im Christentum, weil Augustinus sie dort einbaut. Griechische Philosophie im Herzen der christlichen Dogmatik.",
      quote: {
        text: "Du hast uns auf Dich hin geschaffen, und unruhig ist unser Herz, bis es Ruhe findet in Dir.",
        source: "Augustinus, Confessiones I.1",
      },
      disputed: null,
    },
    influences: ["anselm", "aquin"],
  },

  {
    id: "boethius",
    room: 2,
    strand: "philosophie",
    date: "524 n. Chr.",
    name: "Boethius — Philosophie im Kerker",
    artefact: {
      description: "Eine halb aufgerollte Pergamentrolle mit sichtbarer lateinischer Schrift liegt neben einer rostigen, geöffneten eisernen Fußfessel auf einem schlichten, kühlen Steinsockel.",
      assetHint: "manuscript scroll parchment",
    },
    cardText: "Der letzte Römer, hingerichtet für Verrat. Er schrieb die Philosophie ins Mittelalter.",
    panelText: {
      story:
        "Boethius, Senator und Konsul unter dem Ostgoten-König Theoderich, wurde 524 wegen angeblichen Landesverrats hingerichtet. Im Gefängnis schrieb er Der Trost der Philosophie: einen Dialog mit Frau Philosophia über Glück, Schicksal und Vorsehung. Bemerkenswert: Das Werk zitiert kein einziges christliches Argument. Außerdem übersetzte Boethius Aristoteles ins Lateinische; seine Übersetzungen waren bis zum 12. Jahrhundert die einzige Quelle für Aristoteles im lateinischen Westen.",
      keyIdea:
        "Zwei Leistungen, eine Person: Die Rettung von Aristoteles' Logik für Europa und das Modell, dass Vernunft auch ohne Offenbarung Trost geben kann: ein subversives Modell.",
      quote: {
        text: "Was ist es, das die Menschen auf Abwege führt und vom Guten entfernt? Nichts anderes als das Streben nach falschen Gütern.",
        source: "Boethius, De consolatione philosophiae III.3",
      },
      disputed: null,
    },
    influences: ["aquin"],
  },

  {
    id: "islam_entstehung",
    room: 2,
    strand: "geschichte",
    date: "622–750 n. Chr.",
    name: "Die Entstehung des Islam — Ein Imperium, das Wissen zur Pflicht macht",
    artefact: {
      description: "Eine goldene Kalligraphieschriftrolle liegt auf dem Sockel; daneben zwei Münzen, eine mit arabischer, eine mit griechischer Inschrift — die zwei Welten, die aufeinandertreffen.",
      assetHint: "arabic calligraphy scroll gold",
    },
    cardText: "Ein Kaiserreich, das Wissen als religiöse Pflicht betrachtete.",
    panelText: {
      story:
        "Die Hidschra (622 n. Chr.) und die rasanten arabischen Eroberungen schufen ein riesiges, multikulturelles Reich. Nach dem Sturz der Umayyaden 750 verlegten die Abbasiden die Hauptstadt nach Bagdad (gegründet 762). Unter Harun ar-Raschid und al-Ma'mun (reg. 813–833) wurde Bagdad zum intellektuellen Zentrum der Welt. Die Abbasiden sahen die Aneignung des Wissens aller Kulturen als islamische Pflicht: Der Hadith »Die Tinte eines Gelehrten ist heiliger als das Blut eines Märtyrers« war ihre Losung.",
      keyIdea:
        "Ohne dieses historisch-politische Ereignis (Entstehung des Islam, arabische Eroberungen, abbasidisches Mäzenatentum) gäbe es keine islamische Philosophie und kein Haus der Weisheit. Ein politisches Ereignis verursachte direkt eine philosophische Blüte.",
      quote: {
        text: "Die Abbasiden richteten das Haus der Weisheit ein, wo muslimische und nicht-muslimische Gelehrte das Wissen der Welt ins Arabische übersetzten.",
        source: "Wikipedia, Abbasid Caliphate",
      },
      disputed: null,
    },
    influences: ["haus_weisheit"],
  },

  {
    id: "haus_weisheit",
    room: 2,
    strand: "geschichte",
    date: "8.–13. Jahrhundert",
    name: "Das Haus der Weisheit — Griechisch → Arabisch → Latein",
    artefact: {
      description: "Drei übereinandergestapelte Schriftrollen liegen leicht gefächert: griechische Majuskeln, arabische Kalligrafie, lateinische Minuskel. Ein goldenes Band hält alle drei zusammen.",
      assetHint: "ancient scrolls set three",
    },
    cardText: "Wie das Wissen der Antike die Welt zweimal durchquerte und dabei wuchs.",
    panelText: {
      story:
        "Im Haus der Weisheit in Bagdad übersetzte Hunayn ibn Ishāq (809–873) und sein Team griechische Werke ins Arabische; sein Gehalt soll dem eines heutigen Profisportlers entsprochen haben. Christliche, muslimische und jüdische Gelehrte arbeiteten nebeneinander. Nach der Rückeroberung Toledos (1085) übertrug die dortige Übersetzerschule diese Texte ins Lateinische. Maimonides (ein Jude, der auf Arabisch schreibt und sich auf muslimische Lesarten eines griechischen Heiden stützt) wird ins Lateinische übersetzt und beeinflusst Aquin.",
      keyIdea:
        "Wissen hat keine Religion. Die philosophische Tradition überlebte nur, weil sie immer wieder Grenzen überschritt: sprachliche, kulturelle, religiöse. Der gerade Weg von Athen nach Paris verlief über Bagdad und Toledo.",
      quote: {
        text: "Viele klassische Werke aus der Antike wären verloren gegangen, wenn sie nicht ins Arabische übersetzt worden wären.",
        source: "Wikipedia, Islamic Golden Age",
      },
      disputed:
        "Das Haus der Weisheit wird populär oft zu einer magischen Akademie romantisiert. Historiker betonen: Es war nicht das einzige Übersetzungszentrum, und die islamische Goldene Ära war keine gleichmäßig offene Epoche.",
    },
    influences: ["al_ghazali_averroes", "aquin", "maimonides"],
  },

  {
    id: "maimonides",
    room: 2,
    strand: "religion",
    date: "1138–1204",
    name: "Maimonides — Der Führer der Unschlüssigen",
    artefact: {
      description: "Ein aufgeschlagenes Buch mit hebräischen Lettern liegt zwischen einem arabischen Schriftstück und einem lateinischen Kommentar — drei Sprachen, eine Frage.",
      assetHint: "open book medieval",
    },
    cardText: "Ein Jude schreibt auf Arabisch, liest griechische Heiden und beeinflusst christliche Theologen.",
    panelText: {
      story:
        "Maimonides (Moses ben Maimon, 1138–1204) schrieb den Führer der Unschlüssigen auf Arabisch, um jüdischen Gelehrten zu helfen, die zwischen aristotelischer Philosophie und der Tora hin- und hergerissen waren. Seine Lösung: negative Theologie (wir können nur sagen, was Gott nicht ist), allegorische Schriftauslegung, und die Überzeugung, dass echte Vernunft niemals wahren Glauben widerlegen kann. Er zitiert al-Fārābī, Avicenna und Averroes als Autoritäten: Muslime, die über Aristoteles schrieben.",
      keyIdea:
        "Das stärkste historische Argument dafür, dass Wissen keine Religion hat: ein Jude, der auf Arabisch über griechische Philosophie schreibt, damit er Muslimen und Christen helfen kann, denselben Gott zu verstehen. Aquin nannte ihn »Rabbi Moses«.",
      quote: {
        text: "Wenn jemand durch Schwierigkeiten in religiösen Fragen in Verwirrung geraten ist, haben wir dieses Werk geschrieben.",
        source: "Maimonides, Führer der Unschlüssigen, Widmungsvorwort",
      },
      disputed: null,
    },
    influences: ["aquin"],
  },

  {
    id: "kreuzzuege",
    room: 2,
    strand: "geschichte",
    date: "1095–1291",
    name: "Die Kreuzzüge — Konflikt als Kontakt",
    artefact: {
      description: "Ein Kreuzritter-Schild aus verwittertem Leder mit aufgemaltem Kreuz steht dem Halbmond eines arabischen Helms gegenüber — beide leicht aufeinander zu geneigt.",
      assetHint: "crusader shield medieval",
    },
    cardText: "Militärischer Konflikt wurde unfreiwillig zum Transmissionsriemen für Ideen.",
    panelText: {
      story:
        "Die Kreuzzüge (ab 1095) waren religiös motivierte Feldzüge, aber ihr Nebenprodukt war intensiver kultureller Kontakt. Gemeinsam mit der Reconquista und der Übersetzerschule von Toledo verstärkten sie den Informationsfluss zwischen islamischer und lateinisch-christlicher Gelehrtenwelt. Bücher, Kommentare, Instrumente, Begriffe wanderten mit den Truppen und veränderten Europa.",
      keyIdea:
        "Geschichte macht Philosophie: Ein religiös-militärisches Ereignis war unfreiwillig ein Kanal für intellektuelle Übertragung. Die Scholastik war ohne diesen erzwungenen Kontakt nicht möglich.",
      quote: null,
      disputed:
        "Die direkte Kausalität »Kreuzzüge → Übersetzungsbewegung« wird von Historikern als vereinfachend kritisiert. Toledo-Übersetzungen liefen parallel, nicht als Folge der Kreuzzüge. Der Kontakt war ein Faktor unter mehreren.",
    },
    influences: ["haus_weisheit"],
  },

  {
    id: "schwarzer_tod",
    room: 2,
    strand: "geschichte",
    date: "1347–1351",
    name: "Der Schwarze Tod — Erster Riss in der Autorität",
    artefact: {
      description: "Eine schwarze Glasscheibe mit einem eingravierten Kreuz liegt gebrochen auf dem Sockel — ein Bruch, der sichtbar ist, aber das Kreuz noch erkennbar lässt.",
      assetHint: "broken glass dark procedural",
    },
    cardText: "Die Pest tötete Menschen und erschütterte das Vertrauen in die Kirche.",
    panelText: {
      story:
        "Die Pest von 1347–1351 tötete schätzungsweise 30–60 % der europäischen Bevölkerung. Die religiöse Reaktion war zweigeteilt: einerseits gesteigerte Frömmigkeit und Bußbewegungen (Flagellanten), andererseits ein erster schwacher Riss im Vertrauen in die Kirche. Der Klerus konnte die Seuche weder verhindern noch theologisch befriedigend erklären. Der massive Bevölkerungsverlust schwächte feudale und klerikale Strukturen und machte Platz für Fragen, die vorher undenkbar waren.",
      keyIdea:
        "Geschichte formt Religion neu: Die Pest lockerte den Boden, in den Luther 170 Jahre später die 95 Thesen pflanzte. Als Beitrag, nicht als alleinige Ursache.",
      quote: null,
      disputed:
        "Die direkte Linie »Pest → Reformation« gilt als teleologisch vereinfacht. Viele Gesellschaften erlitten ähnliche Seuchen ohne Reformation. Hier als Faktor, nicht als Alleinursache darstellen.",
    },
    influences: ["reformation_buchdruck"],
  },

  {
    id: "anselm",
    room: 2,
    strand: "philosophie",
    date: "1078",
    name: "Anselm — Das Argument, das stirbt und nicht stirbt",
    artefact: {
      description: "Eine kleine, perfekte Glaskugel liegt neben einem zerbrochenen Duplikat. Auf dem Sockel steht eingraviert: »Dasjenige, über das Größeres nicht gedacht werden kann.«",
      assetHint: "glass sphere crystal transparent",
    },
    cardText: "Gottes Existenz aus einem einzigen Begriff beweisen, ohne die Welt anzusehen.",
    panelText: {
      story:
        "Anselm von Canterbury formulierte im Proslogion (1078) das ontologische Argument: Gott ist definiert als »das, über das Größeres nicht gedacht werden kann«. In der Realität zu existieren ist größer als nur im Verstand zu existieren. Wenn Gott also nur im Verstand existierte, könnte man sich etwas Größeres denken: Widerspruch. Also muss Gott existieren. Gaunilo antwortete sofort mit der »vollkommenen Insel«: Dieselbe Logik würde erzwingen, dass auch sie existiert.",
      keyIdea:
        "Das ontologische Argument ist das langlebigste der Philosophiegeschichte. Descartes formuliert es neu (1641). Kant widerlegt es (1781): Existenz ist kein reales Prädikat. Plantinga belebt es modal (1974). Das Argument stirbt und wird immer wieder aufgeweckt.",
      quote: {
        text: "Etwas, über das Größeres nicht gedacht werden kann.",
        source: "Anselm, Proslogion II (1078) — die Definition, auf der das ganze Argument ruht",
      },
      disputed: null,
    },
    influences: ["descartes", "kant", "plantinga_swinburne"],
  },

  {
    id: "aquin",
    room: 2,
    strand: "philosophie",
    date: "ca. 1265–1274",
    name: "Thomas von Aquin — Die fünf Wege und das Stroh",
    artefact: {
      description: "Eine aufgeschlagene, kunstvoll gebundene Handschrift liegt auf dem Sockel; über ihre Seiten sind einzelne, lose Strohhalme verstreut.",
      assetHint: "open book medieval illuminated",
    },
    cardText: "Fünf Beweise für Gott. Und dann, am Ende: »Alles ist Stroh.«",
    panelText: {
      story:
        "In der Summa Theologica (begonnen 1265, unvollendet) entwickelte Thomas von Aquin die fünf Wege zum Beweis der Existenz Gottes: aus der Bewegung (Erster Beweger), aus der Ursache (Erste Ursache), aus der Zufälligkeit (Notwendiges Wesen), aus den Vollkommenheitsgraden (Größtes Wesen) und aus der Zweckmäßigkeit der Natur (vernünftiger Ordner). Im Dezember 1273 hörte er nach einem mystischen Erlebnis auf zu schreiben und sagte zu seinem Sekretär Reginald: »Alles, was ich geschrieben habe, kommt mir wie Stroh vor.«",
      keyIdea:
        "Das logische Skelett aller fünf Wege ist identisch: Beobachte ein Merkmal der Welt, zeige, dass es sich nicht selbst erklärt, erschließe eine andersartige Ursache. Genau dieses Skelett greift Hume an. Genau dieses Skelett nutzen moderne Feinabstimmungs-Argumente heute noch.",
      quote: {
        text: "Alles, was ich geschrieben habe, kommt mir wie Stroh vor.",
        source: "Thomas von Aquin zu Reginald von Piperno, Dezember 1273 (Überlieferung vierter Hand)",
      },
      disputed:
        "Die Stroh-Anekdote stammt aus indirekter Überlieferung. Thomas' mystische Erfahrung ist historisch plausibel — ob genau diese Worte fielen, ist nicht direkt belegt.",
    },
    influences: ["galileo", "hume", "kant"],
  },

  {
    id: "al_ghazali_averroes",
    room: 2,
    strand: "religion",
    date: "1095 / ca. 1180",
    name: "al-Ghazālī gegen Averroes — Verbrennt das Feuer oder Gott?",
    artefact: {
      description: "Eine schlichte Balkenwaage steht im Zentrum des Sockels, perfekt im Gleichgewicht: Auf der einen Schale eine kleine Wachskerze, auf der anderen ein Büschel rohe Baumwolle.",
      assetHint: "balance scale brass antique",
    },
    cardText: "Die größte Debatte der islamischen Philosophie: ein Argument, das Hume vorwegnimmt.",
    panelText: {
      story:
        "Al-Ghazālī (1058–1111) schrieb Die Inkohärenz der Philosophen (1095) und verteidigte den Okkasionalismus: Feuer verbrennt Baumwolle nicht aus eigener Kraft: Gott bewirkt das Verbrennen jedes Mal neu. Al-Ghazālī durchlitt um 1095 eine spirituelle Krise, brach zusammen, gab seinen Posten in Bagdad auf und wurde Sufi. Averroes (Ibn Ruschd, 1126–1198) antwortete in der Inkohärenz der Inkohärenz: Feuer hat echte Brennkraft als Teil seiner Natur.",
      keyIdea:
        "Al-Ghazālīs Argument: Wir beobachten nur, dass Feuer von Verbrennung gefolgt wird, nicht, dass das Feuer die Ursache ist. Hume sagt 650 Jahre später fast dasselbe. Zwei Traditionen, unabhängig voneinander, ein Gedanke.",
      quote: {
        text: "Was die Baumwolle entzündet, ist nicht das Feuer, sondern Gott, durch seine Gewohnheit.",
        source: "al-Ghazālī, Die Inkohärenz der Philosophen (ca. 1095)",
      },
      disputed: null,
    },
    influences: ["aquin", "hume"],
  },

  // ══════════════════════════════════════════════════════════════
  // RAUM III — Der Bruch (1440 – 1804)
  // ══════════════════════════════════════════════════════════════

  {
    id: "reformation_buchdruck",
    room: 3,
    strand: "geschichte",
    date: "1440 / 31. Oktober 1517",
    name: "Gutenberg & Luther — Die erste Idee, die viral ging",
    artefact: {
      description: "Eine Druckerpresse aus dunklem Holz mit einem eingelegten Schriftblatt steht auf dem Sockel; darüber hängt ein einzelnes gedrucktes Blatt mit dem Anfang der 95 Thesen.",
      assetHint: "printing press wooden historical",
    },
    cardText: "Der Buchdruck gab Luther Flügel. Sein Gewissen erschütterte eine Welt.",
    panelText: {
      story:
        "Johannes Gutenberg erfand um 1440 den Buchdruck mit beweglichen Lettern. Als Martin Luther am 31. Oktober 1517 seine 95 Thesen gegen den Ablasshandel veröffentlichte, wurden sie binnen Wochen nachgedruckt und in ganz Europa gelesen; er wurde damit der erste europäische Intellektuelle, der »viral ging«. Auf dem Reichstag zu Worms (1521) formulierte er das Prinzip des individuellen Gewissens: »Mein Gewissen ist gefangen in Gottes Wort. Ich kann und will nichts widerrufen.« Der Westfälische Frieden (1648) beendete 130 Jahre Religionskriege.",
      keyIdea:
        "Luther meinte mit »Gewissen« den direkten Zugang zu Gott, nicht Descartes' rationales Ich. Aber die Struktur ist dieselbe: Eine Einzelperson, nicht eine Institution, ist die letzte Instanz der Wahrheit. Das ist die Brücke vom religiösen Bruch zum philosophischen.",
      quote: {
        text: "Mein Gewissen ist gefangen in Gottes Wort. Ich kann und will nichts widerrufen, denn gegen das Gewissen zu handeln ist weder sicher noch ehrlich.",
        source: "Martin Luther, Reichstag zu Worms, 18. April 1521",
      },
      disputed:
        "Die direkte Kausalität »Reformation → Aufklärung« gilt Historikern als teleologisch. Als eine Vorbedingung unter mehreren ist der Zusammenhang aber gut belegt.",
    },
    influences: ["descartes", "spinoza"],
  },

  {
    id: "wissenschaftliche_revolution",
    room: 3,
    strand: "geschichte",
    date: "1543–1687",
    name: "Die Wissenschaftliche Revolution — Neue Werkzeuge ändern die Welt",
    artefact: {
      description: "Ein Fernrohr, ein Kompass und eine Weltkarte aus dem 16. Jahrhundert liegen nebeneinander auf dem Sockel — die drei Instrumente, die den Horizont erweiterten.",
      assetHint: "brass compass navigation antique",
    },
    cardText: "Neue Instrumente, neue Handelswege, neue Universitäten: ein neues Weltbild.",
    panelText: {
      story:
        "Kopernikus (1543, De revolutionibus) konnte nur rechnen, weil genaue Himmelstabellen existierten. Galileo (1609) beobachtete Jupiters Monde mit einem Fernrohr aus dem Handwerk. Die Entdeckung Amerikas (1492) erschütterte das antike Weltbild: Die Alten hatten nicht alles gewusst. Ohne diese konkreten historisch-technischen Vorbedingungen kein Kopernikus, kein Galileo, kein Newton; und ohne die drei kein Descartes, der das Fundament des Wissens neu legen musste.",
      keyIdea:
        "Geschichte geht der Philosophie voraus: Technische und soziale Entwicklungen lösten den philosophischen Bruch aus. Descartes war keine reine Vernunft im Vakuum, sondern er antwortete auf eine konkrete Krise des Weltbilds.",
      quote: null,
      disputed: null,
    },
    influences: ["galileo", "descartes"],
  },

  {
    id: "galileo",
    room: 3,
    strand: "geschichte",
    date: "22. Juni 1633",
    name: "Galileo — Wer entscheidet, was wahr ist?",
    artefact: {
      description: "Ein langes Messingteleskop mit Lederbezug liegt diagonal über dem Sockel; daneben eine zusammengerollte Akte mit rotem, gebrochenem Wachssiegel.",
      assetHint: "brass telescope antique leather",
    },
    cardText: "Verurteilt für das, was er durch ein Rohr aus Glas sah.",
    panelText: {
      story:
        "Am 22. Juni 1633 befand die Römische Inquisition Galileo Galilei der Ketzerei »dringend verdächtig« und verurteilte ihn zu Hausarrest auf Lebenszeit, weil er die Bewegung der Erde verteidigte. Unter Hausarrest und erblindend vollendete er sein wissenschaftlich bedeutendstes Werk Discorsi (1638) und ließ es nach Holland schmuggeln. 1992 erkannte Johannes Paul II. den Irrtum der Kirche offiziell an.",
      keyIdea:
        "Die eigentliche Frage war nicht Kopernikus gegen Ptolemäus, sondern: Wer hat die Autorität, über Naturwahrheiten zu urteilen: die Kirche oder die Empirie? Diese Frage, nicht die Astronomie, ist der philosophische Bruch.",
      quote: {
        text: "Und sie bewegt sich doch. — LEGENDE",
        source: "Erst 1757 schriftlich belegt, 124 Jahre nach dem Prozess. Galileo sagte das mit an Sicherheit grenzender Wahrscheinlichkeit nie.",
      },
      disputed:
        "»Eppur si muove« ist eine der hartnäckigsten Legenden der Wissenschaftsgeschichte. Der früheste Beleg ist Giuseppe Barettis The Italian Library (London, 1757). Galileo-Biograf J. L. Heilbron urteilt klar: Er sagte es nicht.",
    },
    influences: ["descartes", "hume"],
  },

  {
    id: "descartes",
    room: 3,
    strand: "philosophie",
    date: "1637–1641",
    name: "Descartes — Der Grund, dem keiner zweifeln kann",
    artefact: {
      description: "Ein eleganter Schulzirkel aus dunklem Metall liegt aufgeklappt auf dem Sockel, eine präzise geometrische Figur beschreibend.",
      assetHint: "compass geometry mathematical brass",
    },
    cardText: "Zweifel an allem, bis auf eine Sache: dass du zweifelst.",
    panelText: {
      story:
        "Descartes beschloss, alles zu bezweifeln, bis er einen Punkt fand, dem der Zweifel nichts anhaben konnte. Er fand ihn: Die Tatsache des Zweifelns selbst beweist, dass jemand zweifelt: Ich denke, also bin ich. Von diesem Punkt aus baute er alles neu auf, einschließlich zweier Gottesbeweise in den Meditationen (1641). Der Startpunkt ist nicht die Kirche, nicht die Bibel, nicht Aristoteles, sondern der einzelne denkende Verstand.",
      keyIdea:
        "Descartes revolutionierte nicht die Theologie, sondern die Methode. Die Einzelperson mit ihrem Verstand wird zur letzten epistemischen Instanz. Gott wird jetzt bewiesen, nicht vorausgesetzt. Diese Verschiebung ist der eigentliche philosophische Bruch.",
      quote: {
        text: "Ich denke, also bin ich.",
        source: "René Descartes, Discours de la méthode (1637); Meditationes de prima philosophia (1641)",
      },
      disputed: null,
    },
    influences: ["spinoza", "hume", "kant"],
  },

  {
    id: "spinoza",
    room: 3,
    strand: "philosophie",
    date: "27. Juli 1656 / 1677",
    name: "Spinoza — Der exkommunizierte Linsenschleifer",
    artefact: {
      description: "Eine halb fertig geschliffene Glaslinse liegt auf einer kleinen hölzernen Handdrehbank; daneben eine erloschene, schwarz verkohlte Kerze mit erstarrtem Wachslauf.",
      assetHint: "lens optical glass grinding",
    },
    cardText: "Gott ist nicht getrennt von der Natur. Er IST die Natur.",
    panelText: {
      story:
        "Am 27. Juli 1656 sprach die jüdische Gemeinde Amsterdams den Bann über den 23-jährigen Baruch Spinoza aus: »Verflucht sei er bei Tag und verflucht bei Nacht.« Er lebte danach als Linsenschleifer, lehnte einen Lehrstuhl in Heidelberg ab, um frei zu bleiben, und schrieb die Ethik (1677, postum). Seine Kernthese: Gott und Natur sind dasselbe (Deus sive Natura). Gott ist keine Person, die die Welt erschaffen hat. Gott ist die Gesamtheit der Natur, die nach notwendigen Gesetzen operiert.",
      keyIdea:
        "Spinoza leugnet nicht Gott, er macht Gott zu allem. Damit werden Wunder, Gebet, persönliche Vorsehung und ein außerweltlicher Schöpfer unmöglich. Keine Polemik, sondern strenge Logik.",
      quote: {
        text: "Verflucht sei er bei Tag und verflucht bei Nacht.",
        source: "Cherem-Dokument der Sephardischen Gemeinde Amsterdam, 27. Juli 1656",
      },
      disputed:
        "Das theatralische Detail einzeln ausgelöschter Kerzen während der Zeremonie ist eine spätere Ausschmückung (popularisiert durch Will Durant). Das Cherem-Dokument selbst ist erhalten und belegt.",
    },
    influences: ["hume", "feuerbach", "marx"],
  },

  {
    id: "pascal",
    room: 3,
    strand: "religion",
    date: "1670 (postum)",
    name: "Pascal — Die Wette und die Gegenströmung",
    artefact: {
      description: "Zwei elfenbeinfarbene Würfel und eine altmodische Goldmünze liegen auf einer aufgeschlagenen, handschriftlich bedeckten Buchseite.",
      assetHint: "dice ivory pair",
    },
    cardText: "Mitten in der Wissenschaftlichen Revolution: ein Mathematiker, der den Glauben verteidigt.",
    panelText: {
      story:
        "Blaise Pascal war ein erstklassiger Mathematiker (Rechenmaschine, Pascal-Prinzip) und Physiker. Sein nachgelassenes Werk Pensées (1670) enthält die »Wette«: Da man Gottes Existenz nicht beweisen kann, behandle man den Glauben wie eine Entscheidung unter Unsicherheit. Wenn Gott existiert und du glaubst: unendlicher Gewinn. Wenn er nicht existiert und du glaubst: geringer Verlust. Die Erwartungsrechnung spricht für den Glauben.",
      keyIdea:
        "Pascal ist die wichtigste Gegenströmung mitten im Bruch. Nicht alle Intellektuellen liefen von der Religion weg. Wer das Museum als Geschichte der Progression sieht, braucht Pascal als Korrektiv.",
      quote: {
        text: "Das Herz hat seine Gründe, die die Vernunft nicht kennt.",
        source: "Blaise Pascal, Pensées (postum 1670), Nr. 277",
      },
      disputed: null,
    },
    influences: ["kierkegaard"],
  },

  {
    id: "hume",
    room: 3,
    strand: "philosophie",
    date: "1748–1779",
    name: "Hume — Die Beweise werden gewogen und zu leicht befunden",
    artefact: {
      description: "Eine zerlegte Taschenuhr liegt geöffnet auf dem Sockel, ihre feinen Zahnräder über die Fläche verstreut — das teleologische Argument in Einzelteilen.",
      assetHint: "broken pocket watch open gears",
    },
    cardText: "Der freundlichste Skeptiker der Geschichte und einer der schärfsten.",
    panelText: {
      story:
        "David Hume schrieb Über Wunder (1748): Es ist nie vernünftig, einem Wunderbericht zu glauben, weil die Beweislast für ein Naturgesetz immer die Beweislast einer Zeugenaussage überwiegt. In den Dialogues Concerning Natural Religion (1779, postum) zerlegte er das Designargument: Wir schließen auf einen Uhrmacher, weil wir wissen, wie Uhren entstehen. Wir wissen nicht, wie Universen entstehen. Als Boswell den sterbenden Hume besuchte, fand er ihn »gelassen und sogar heiter«: keine Bekehrung, kein Zittern.",
      keyIdea:
        "Hume greift nicht den Glauben an. Er stellt die epistemische Frage: Was rechtfertigt diesen Glauben? Und seine Antwort lautet: weniger, als wir dachten. Das ist keine Polemik, das ist Philosophie.",
      quote: {
        text: "Es ist höchst unvernünftig zu glauben, wir sollten für immer existieren.",
        source: "Hume zu Boswell auf dem Sterbebett, 7. Juli 1776 (nach Boswells Aufzeichnung)",
      },
      disputed: null,
    },
    influences: ["kant", "darwin", "log_positivismus"],
  },

  {
    id: "kant",
    room: 3,
    strand: "philosophie",
    date: "1781–1788",
    name: "Kant — Das Wissen aufheben, um für den Glauben Platz zu machen",
    artefact: {
      description: "Zwei schwere Bände liegen geöffnet übereinander auf dem Sockel; zwischen ihren Seiten ein einzelnes Blatt mit dem einzigen Satz: »Ich musste das Wissen aufheben, um für den Glauben Platz zu machen.«",
      assetHint: "heavy books antique leather",
    },
    cardText: "Kant demontiert alle Gottesbeweise und rettet Gott als moralische Notwendigkeit.",
    panelText: {
      story:
        "In der Kritik der reinen Vernunft (1781) zeigte Kant: Menschliche Erkenntnis ist auf mögliche Erfahrung begrenzt. Gott ist kein möglicher Erfahrungsgegenstand; alle traditionellen Beweise scheitern. Besonders präzise: Existenz ist kein reales Prädikat (gegen Anselm). Aber in der Kritik der praktischen Vernunft (1788) kehrt Gott zurück: Die Moral verlangt, dass Tugend und Glück irgendwann übereinstimmen. Das kann nur Gott garantieren, also muss man ihn postulieren.",
      keyIdea:
        "Kants Zug ist ein Meisterstück der Diplomatie: Die reine Vernunft kann Gott nicht beweisen und nicht widerlegen. Aber die praktische Vernunft (die Moral) braucht ihn. Philosophie richtet nun, aber verurteilt nicht.",
      quote: {
        text: "Ich musste das Wissen aufheben, um für den Glauben Platz zu machen.",
        source: "Immanuel Kant, Kritik der reinen Vernunft (1781), Vorrede zur zweiten Auflage",
      },
      disputed: null,
    },
    influences: ["feuerbach", "kierkegaard", "nietzsche", "log_positivismus"],
  },

  {
    id: "franzoesische_revolution",
    room: 3,
    strand: "geschichte",
    date: "1789–1801",
    name: "Die Französische Revolution — Philosophie macht Geschichte",
    artefact: {
      description: "Eine Jakobinermütze und eine umgestürzte Kirchen-Miniatur stehen nebeneinander auf dem Sockel; zwischen ihnen eine Waage — Vernunft gegen Glaube.",
      assetHint: "liberty hat revolutionary",
    },
    cardText: "Aufklärungsphilosophie verwandelt sich in reale Politik und bringt Religion vor Gericht.",
    panelText: {
      story:
        "Die Französische Revolution (1789) wurde als »Tochter der Aufklärung« bezeichnet. Rousseau, Voltaire und Montesquieu bereiteten sie philosophisch vor. Als sie radikalisierte, folgte die Entchristianisierung: Kirchen wurden enteignet, der Kult der Vernunft (Culte de la Raison) eingeführt und am 10. November 1793 in Notre-Dame de Paris gefeiert. Robespierre ersetzte ihn mit dem Kult des Höchsten Wesens. Napoleon beendete den Konflikt mit dem Konkordat von 1801: einem Deal, kein Frieden.",
      keyIdea:
        "Philosophie machte Geschichte, und Geschichte formte dann die Philosophie neu: Hegels gesamtes Denken ist eine Antwort auf die Revolution. Marx sah in ihr die bürgerliche Vorstufe. Die religiöse Gegenreaktion des 19. Jahrhunderts entstand direkt aus dem Schock.",
      quote: {
        text: "Jeder vernünftige und ehrenwerte Mann muss die christliche Religion verabscheuen.",
        source: "Voltaire — das Zitat, das die Entchristianisierungs-Bewegung inspirierte",
      },
      disputed:
        "Ob die Revolution die Aufklärung »umsetzte« oder verriet (durch Terror, Fanatismus), ist unter Historikern umstritten.",
    },
    influences: ["feuerbach", "marx", "kierkegaard"],
  },

  // ══════════════════════════════════════════════════════════════
  // RAUM IV — Die Herausforderung (1841 – 1889)
  // ══════════════════════════════════════════════════════════════

  {
    id: "industrielle_revolution",
    room: 4,
    strand: "geschichte",
    date: "ca. 1760–1840",
    name: "Die Industrielle Revolution — Das Elend, das Marx sah",
    artefact: {
      description: "Ein kleines Modell eines Webstuhls aus Gusseisen steht auf dem Sockel; daneben liegt ein zerrissener Arbeitskittel — das Symbol der Fabrikhände, die Engels in Manchester beobachtete.",
      assetHint: "industrial machine factory",
    },
    cardText: "Marx' Religionskritik war keine Bibliotheksphilosophie, sie antwortete auf echtes Leid.",
    panelText: {
      story:
        "Friedrich Engels, aus einer Industriellenfamilie stammend, sah in Manchester aus erster Hand die Bedingungen der Fabrikarbeiter und legte die Armut des industriellen Kapitalismus offen (Die Lage der arbeitenden Klasse in England, 1844). Vor diesem Hintergrund schrieb Marx 1844 den berühmten Satz: keine distanzierte akademische Beobachtung, sondern eine Reaktion auf gelebtes Elend.",
      keyIdea:
        "Geschichte erzeugt Philosophie. Und umgekehrt: Diese Idee mündete in reale Revolutionen, ganze Staatsformen, 100 Jahre Weltgeschichte. Das ist das klarste Beispiel im ganzen Museum für den vollständigen Kreislauf.",
      quote: null,
      disputed: null,
    },
    influences: ["marx"],
  },

  {
    id: "feuerbach",
    room: 4,
    strand: "philosophie",
    date: "1841",
    name: "Feuerbach — Gott als Spiegelbild des Menschen",
    artefact: {
      description: "Ein angeschlagener, leicht getrübter ovaler Spiegel mit verziertem Holzrahmen lehnt schräg auf dem Sockel; in seiner Reflexion erkennt man — den Betrachter selbst.",
      assetHint: "antique mirror oval wood",
    },
    cardText: "Theologie ist heimlich Anthropologie.",
    panelText: {
      story:
        "Ludwig Feuerbach veröffentlichte Das Wesen des Christentums 1841. Das Buch wurde von Marian Evans (George Eliot) ins Englische übersetzt. Feuerbachs These: Menschen nehmen ihre eigenen besten Eigenschaften (Liebe, Weisheit, Macht, Güte) und projizieren sie nach außen auf ein vorgestelltes Wesen. Dann vergessen sie, dass es ihre eigene Projektion war, und verehren es als etwas Überlegenes.",
      keyIdea:
        "Feuerbach verschiebt die Frage endgültig: Nicht »Existiert Gott?« sondern »Warum erschaffen Menschen Götter?« Religion erklärt nicht die Welt, sie erklärt den Menschen. Das ist die Geburtsstunde der Religionspsychologie.",
      quote: {
        text: "Das Bewusstsein Gottes ist das Selbstbewusstsein des Menschen.",
        source: "Ludwig Feuerbach, Das Wesen des Christentums (1841)",
      },
      disputed: null,
    },
    influences: ["marx", "nietzsche", "vier_reiter"],
  },

  {
    id: "marx",
    room: 4,
    strand: "philosophie",
    date: "Februar 1844",
    name: "Marx — Das Opium des Volkes",
    artefact: {
      description: "Eine kleine Opiumschale aus dunkel patinierter Bronze steht neben einer Fabriksilhouette aus schwarzem Blech — Linderung und Ursache auf demselben Sockel.",
      assetHint: "opium pipe antique bronze",
    },
    cardText: "Religion lindert echtes Leid und verhindert damit, es zu bekämpfen.",
    panelText: {
      story:
        "Marx baute auf Feuerbach auf: Im Februar 1844 schrieb er: »Die Religion ist der Seufzer der bedrängten Kreatur, das Gemüt einer herzlosen Welt... Sie ist das Opium des Volkes.« Der vollständige Kontext ist mitfühlender als das verkürzte Zitat nahelegt: Marx verstand Religion als echte, verständliche Reaktion auf echtes Leid. Aber ein Schmerzmittel, das die Ursache des Schmerzes unberührt lässt.",
      keyIdea:
        "Marx verurteilt nicht die Gläubigen, er verurteilt die Verhältnisse, die den Glauben notwendig machen. Aber das Ergebnis ist dasselbe: Religion ist eine Illusion, die echte Veränderung verhindert.",
      quote: {
        text: "Die Religion ist der Seufzer der bedrängten Kreatur, das Gemüt einer herzlosen Welt, wie sie der Geist geistloser Zustände ist. Sie ist das Opium des Volkes.",
        source: "Karl Marx, Zur Kritik der Hegelschen Rechtsphilosophie: Einleitung (1844)",
      },
      disputed:
        "Das Opium-Bild ist älter als Marx (es findet sich auch bei Heine und Novalis). Marx' Punkt ist außerdem mitfühlender als die Kurzversion vermuten lässt.",
    },
    influences: ["nietzsche", "vier_reiter"],
  },

  {
    id: "kierkegaard",
    room: 4,
    strand: "religion",
    date: "1843",
    name: "Kierkegaard — Der Sprung des Glaubens",
    artefact: {
      description: "Eine kleine Bronzestatuette eines Mannes, der mit weit ausgebreiteten Armen an einem Abgrund steht, den Blick nach oben — kurz vor dem Sprung.",
      assetHint: "human figure standing lowpoly",
    },
    cardText: "Glaube ist kein Wissen. Er ist ein Sprung, den Vernunft nicht erzwingen kann.",
    panelText: {
      story:
        "Søren Kierkegaard schrieb Furcht und Zittern (1843) unter dem Pseudonym Johannes de silentio. Er analysiert Abrahams Bereitschaft, Isaak zu opfern: Das ist kein vernünftiger Akt. Abraham kann seinen Gehorsam nicht begründen, nicht kommunizieren, nicht rechtfertigen; er springt in die Unbegreiflichkeit des Glaubens. Kierkegaard ist die große Gegenstimme einer Epoche, die Religion wegerklärt.",
      keyIdea:
        "Kierkegaard ist die Gegenströmung in Raum IV, wie Pascal die Gegenströmung in Raum III ist. Er macht keine rationalen Zugeständnisse, sondern besteht darauf, dass der Glaube gerade dann am echtesten ist, wenn er absurd erscheint.",
      quote: {
        text: "Der Glaube beginnt genau dort, wo das Denken aufhört.",
        source: "Søren Kierkegaard, Furcht und Zittern (1843, sinngemäß)",
      },
      disputed:
        "Kierkegaard verwendete »qualitativer Sprung«, nicht »Glaubenssprung« (leap of faith) — das ist eine spätere Vereinfachung, die ihm oft fälschlich zugeschrieben wird.",
    },
    influences: ["existentialismus"],
  },

  {
    id: "darwin",
    room: 4,
    strand: "geschichte",
    date: "24. November 1859",
    name: "Darwin — Der Uhrmacher stirbt",
    artefact: {
      description: "Ein versteinerter Ammonit liegt neben den fein verstreuten Zahnrädern einer zerlegten Uhr — eine gewachsene Ordnung neben einer gebauten.",
      assetHint: "ammonite fossil stone",
    },
    cardText: "Natürliche Selektion erklärt den Anschein von Zweckmäßigkeit, ohne einen Zweck.",
    panelText: {
      story:
        "Am 24. November 1859 erschien On the Origin of Species. Darwin lieferte einen Mechanismus: zufällige Variation plus unterschiedliches Überleben, über immense Zeit akkumuliert, der komplexe, zweckmäßig wirkende Strukturen erzeugt, ohne dass ein planender Geist sie entwirft. Paleys Watchmaker-Argument (Natural Theology, 1802) hatte argumentiert: Der Anblick einer Uhr lässt auf einen Uhrmacher schließen; der Anblick eines Auges lässt auf einen Schöpfer schließen. Darwin zeigte: Das Auge kann auch ohne Schöpfer entstehen. Thomas Huxley prägte 1869 das Wort »Agnostiker«.",
      keyIdea:
        "Das Designargument (Aquins fünfter Weg) bezog seine Kraft aus der Prämisse: Es gibt keine andere Erklärung für scheinbare Zweckmäßigkeit. Darwin entfernte diese Prämisse. Der überzeugendste Gottesbeweis des Mittelalters verlor seine wissenschaftliche Grundlage.",
      quote: {
        text: "Ich erfand das treffende Wort »Agnostiker« als Gegenstück zum »Gnostiker«.",
        source: "Thomas H. Huxley (1869), über die Schöpfung des Begriffs",
      },
      disputed: null,
    },
    influences: ["nietzsche", "log_positivismus", "neuer_atheismus_kontext"],
  },

  {
    id: "nietzsche",
    room: 4,
    strand: "philosophie",
    date: "1882 / 3. Januar 1889",
    name: "Nietzsche — Gott ist tot, und wir haben ihn getötet",
    artefact: {
      description: "Eine zersplitterte Steintafel mit eingeritzten, an den Bruchkanten unleserlich gewordenen Wörtern; daneben eine kleine Tonfigur eines Pferdes.",
      assetHint: "broken stone tablet ancient",
    },
    cardText: "Keine Behauptung, kein Atheismus-Beweis: eine kulturelle Diagnose.",
    panelText: {
      story:
        "In Die fröhliche Wissenschaft (1882, §125) lässt Nietzsche einen »tollen Menschen« in den hellen Mittag rufen: »Gott ist tot. Gott bleibt tot. Und wir haben ihn getötet. Wie trösten wir uns, die Mörder aller Mörder?« Niemand auf dem Marktplatz versteht ihn. Am 3. Januar 1889 brach Nietzsche in Turin zusammen und verlor dauerhaft den Verstand.",
      keyIdea:
        "»Gott ist tot« ist keine metaphysische Behauptung, dass Gott nicht existiert. Es ist eine kulturelle Diagnose: Der christliche Gott als Fundament westlicher Moral ist unhaltbar geworden, und die meisten Menschen haben es noch nicht gemerkt. Das ist das Erschreckende.",
      quote: {
        text: "Gott ist tot. Gott bleibt tot. Und wir haben ihn getötet.",
        source: "Friedrich Nietzsche, Die fröhliche Wissenschaft (1882), §125",
      },
      disputed:
        "Das berühmte Pferd in Turin: Forscher nennen die Episode apokryph. Der eigentliche Zusammenbruch im Januar 1889 ist historisch belegt, die Pferdegeschichte nicht. Früheste Quelle: ca. 1900–1910.",
    },
    influences: ["existentialismus", "vier_reiter"],
  },

  // ══════════════════════════════════════════════════════════════
  // RAUM V — Das moderne Gespräch (1900 – 2009)
  // ══════════════════════════════════════════════════════════════

  {
    id: "log_positivismus",
    room: 5,
    strand: "philosophie",
    date: "1920er–1936",
    name: "Der logische Positivismus — Nicht falsch, sinnlos",
    artefact: {
      description: "Eine schlichte, leere Schreibtafel in einem schmalen Holzrahmen steht auf dem Sockel — vollkommen unbeschrieben, mit einer kleinen Metallplakette: »weder wahr noch falsch«.",
      assetHint: "blackboard empty frame wood",
    },
    cardText: "Der radikalste Angriff: »Gott existiert« ist nicht falsch, sondern bedeutungslos.",
    panelText: {
      story:
        "Der Wiener Kreis (Schlick, Carnap, Neurath) und A. J. Ayer (Sprache, Wahrheit und Logik, 1936) vertraten das Verifikationsprinzip: Ein Satz ist sinnvoll nur, wenn er entweder analytisch wahr oder empirisch überprüfbar ist. »Gott existiert« ist keins von beidem, also nicht falsch, sondern buchstäblich bedeutungslos. Das ist aggressiver als Atheismus: Atheisten behandeln die Frage als legitim; die Positivisten sagen: Es gibt keine Frage.",
      keyIdea:
        "Das Verifikationsprinzip war der härteste Angriff auf religiöse Sprache im 20. Jahrhundert, und er kollabierte selbst. Der Satz »Nur verifizierbare Aussagen sind sinnvoll« ist selbst weder analytisch wahr noch empirisch überprüfbar.",
      quote: {
        text: "Religiöse Sätze sind buchstäblich bedeutungslos.",
        source: "A. J. Ayer, Language, Truth and Logic (1936), Paraphrase",
      },
      disputed:
        "Das Verifikationsprinzip wurde von seinen eigenen Verfechtern später weitgehend aufgegeben. Karl Popper schlug als Alternative das Falsifikationsprinzip vor.",
    },
    influences: ["plantinga_swinburne", "vier_reiter"],
  },

  {
    id: "existentialismus",
    room: 5,
    strand: "philosophie",
    date: "1923–1946",
    name: "Existenzialismus — Die Gottesfrage nach dem Krieg",
    artefact: {
      description: "Zwei Stühle an einem kleinen Tisch — einer besetzt, einer leer. Auf dem besetzten Stuhl liegt ein Buch; der leere Stuhl wirft die Frage auf: Wer fehlt?",
      assetHint: "wooden chair simple",
    },
    cardText: "Mit Gott oder ohne: Der Existenzialismus antwortet auf denselben Abgrund.",
    panelText: {
      story:
        "Der Existenzialismus spaltete sich an der Gottesfrage. Sartre (atheistisch): »Die Existenz geht dem Wesen voraus«; ohne Gott gibt es keine vorgegebene menschliche Natur; wir sind verurteilt, frei zu sein. Tillich (religiös): Gott ist nicht »ein Wesen« sondern »der Grund des Seins«. Buber (religiös): In Ich und Du (1923) definierte er Gott als das ewige Du, das man nicht objektivieren kann.",
      keyIdea:
        "Das 20. Jahrhundert bestätigt Raum V's These: Das Gespräch ist offen. Nicht alle intelligenten Denker laufen zur Anklage; manche verteidigen, aber mit völlig neuer Sprache.",
      quote: {
        text: "Alles wirkliche Leben ist Begegnung.",
        source: "Martin Buber, Ich und Du (1923)",
      },
      disputed: null,
    },
    influences: ["plantinga_swinburne", "vier_reiter"],
  },

  {
    id: "tillich",
    room: 5,
    strand: "religion",
    date: "1952–1957",
    name: "Tillich — Gott als Grund des Seins",
    artefact: {
      description: "Ein schlichter, leerer Holzrahmen steht auf dem Sockel — kein Bild darin, kein Spiegel, nur Tiefe. Darunter eine kleine Plakette: »Der Mut zu sein.«",
      assetHint: "empty frame wood simple",
    },
    cardText: "Wer »Gott existiert nicht« sagt, hat Gott noch nicht verstanden. Er hat nur einen Götzen abgelehnt.",
    panelText: {
      story:
        "Paul Tillich (1886–1965), deutsch-amerikanischer Theologe, antwortete auf den Neuen Atheismus seiner Zeit mit einer radikalen Neudefinition: Gott ist kein Wesen neben anderen Wesen, das »existiert« oder »nicht existiert«. Gott ist der Grund des Seins selbst: das, was macht, dass überhaupt etwas ist statt nichts. In Der Mut zu sein (The Courage to Be, 1952) argumentiert er: Der Mensch, der angesichts der Angst des Nichts trotzdem bejahend lebt, partizipiert am Sein-selbst. In der Systematischen Theologie (1951–1957) entwickelt er die »Methode der Korrelation«: Jede menschliche existenzielle Frage hat eine theologische Antwort.",
      keyIdea:
        "Tillich ist der wirksamste Verteidiger des Glaubens im Angesicht des Existenzialismus, weil er das Terrain des Atheisten akzeptiert (die Angst, die Endlichkeit, die Sinnlosigkeit) und zeigt, dass der Glaube gerade dort anfängt, nicht trotz alledem, sondern mitten darin.",
      quote: {
        text: "Gott ist kein Wesen neben anderen Wesen. Er ist das Sein-Selbst, die Macht des Seins in allem, was ist.",
        source: "Paul Tillich, Systematische Theologie Bd. I (1951)",
      },
      disputed:
        "Kritiker wie Antony Flew warfen Tillich vor, seinen Gottesbegriff so weit ausgedehnt zu haben, dass er bedeutungslos wurde: »Sein-Selbst« sei nicht weniger vage als »Gott ist alles«. Tillich antwortete, der Begriff sei nicht vage, sondern vor-begrifflich.",
    },
    influences: ["plantinga_swinburne", "vier_reiter"],
  },

  {
    id: "scopes_kontext",
    room: 5,
    strand: "geschichte",
    date: "1910–1925",
    name: "Amerikanischer Fundamentalismus — Der Kontext des Affen-Prozesses",
    artefact: {
      description: "Eine amerikanische Bibel mit Goldschnitt liegt neben einem Schulbuch über Biologie — beide aufgeschlagen auf widersprüchlichen Passagen.",
      assetHint: "bible leather bound gold",
    },
    cardText: "Bevor es den Prozess gab, gab es eine Bewegung.",
    panelText: {
      story:
        "Der christliche Fundamentalismus war keine alte Tradition, sondern eine konkrete historische Reaktion auf Modernismus und Darwinismus im frühen 20. Jahrhundert Amerika. Die Publikationsserie The Fundamentals (1910–1915) benannte die Bewegung. Sie entsprang dem Stadt-Land-Graben, dem Misstrauen gegenüber Eliteuniversitäten und dem anti-deutschen Sentiment nach dem Ersten Weltkrieg. Der Butler Act (Tennessee, 1925), der Evolution-Unterricht verbot, war das politische Ergebnis.",
      keyIdea:
        "Der Scopes-Prozess war kein Ursprung des Konflikts, sondern ein Symptom. Geschichte (Krieg, Urbanisierung, Bildungsrevolution) schuf religiöse Gegenreaktionen. Religiöse Bewegungen entstehen nicht im Vakuum.",
      quote: null,
      disputed: null,
    },
    influences: ["scopes_prozess"],
  },

  {
    id: "scopes_prozess",
    room: 5,
    strand: "geschichte",
    date: "10.–21. Juli 1925",
    name: "Der Scopes-Prozess — Religion vor Gericht",
    artefact: {
      description: "Ein kleiner Holzhammer (Richterhammer) liegt zwischen einer aufgeschlagenen Bibel und einem gebundenen Exemplar von Darwins Origin of Species auf dem Sockel.",
      assetHint: "wooden gavel judge court",
    },
    cardText: "Acht Tage Verhandlung. Neun Minuten Beratung. Fünf Tage später war Bryan tot.",
    panelText: {
      story:
        "Lehrer John Scopes wurde in Dayton, Tennessee, wegen des Lehrens der Evolution angeklagt. Clarence Darrow für die Verteidigung, William Jennings Bryan (dreimaliger Präsidentschaftskandidat) für die Anklage. Im Höhepunkt wurde Bryan selbst als Bibelexperte unter Kreuzverhör genommen und öffentlich blamiert. Die Jury brauchte neun Minuten. Scopes wurde zu einer Geldstrafe von 100 Dollar verurteilt (später aufgehoben). Bryan starb fünf Tage nach Prozessende in Dayton.",
      keyIdea:
        "Der Prozess machte Religion und Wissenschaft zu öffentlichem Spektakel. Er hatte keine philosophische Tiefe, aber enorme gesellschaftliche Wirkung. Bis heute prägt er die US-amerikanische Debatte über Evolution und Schulunterricht.",
      quote: {
        text: "Sie kamen hierher, um die geoffenbarte Religion vor Gericht zu stellen. Ich bin hier, um sie zu verteidigen.",
        source: "William Jennings Bryan, Scopes-Prozess, Juli 1925",
      },
      disputed: null,
    },
    influences: ["neuer_atheismus_kontext"],
  },

  {
    id: "plantinga_swinburne",
    room: 5,
    strand: "philosophie",
    date: "1974–1979",
    name: "Plantinga & Swinburne — Der Gegenangriff der Analytischen Philosophie",
    artefact: {
      description: "Ein facettierter, von innen sanft leuchtender Glaskristall (Ikosaeder) schwebt auf fast unsichtbaren Drähten und dreht sich langsam über dem Sockel.",
      assetHint: "crystal gem transparent icosahedron",
    },
    cardText: "Wenn es möglich ist, dass Gott existiert, dann existiert er notwendig.",
    panelText: {
      story:
        "Alvin Plantinga (geb. 1932) entwickelte das modale ontologische Argument (The Nature of Necessity, 1974): Wenn ein maximal großartiges Wesen möglich ist (eines, das notwendig existiert), dann existiert es auch in der wirklichen Welt, weil notwendige Existenz zur maximalen Größe gehört. Außerdem begründete er die Reformierte Erkenntnistheorie: Glaube an Gott braucht kein Argument, er kann »basal« sein. Richard Swinburne nutzte Bayessche Wahrscheinlichkeit (The Existence of God, 1979): Theismus ist die einfachste Erklärung für das Universum.",
      keyIdea:
        "Das Gespräch des 20. Jahrhunderts war keine Einbahnstraße. Zur selben Zeit, als Dawkins und Hitchens Bestseller schrieben, veröffentlichten akademische Philosophen technisch anspruchsvolle Gottesbeweise. Raum V ist ein echter Dialog.",
      quote: {
        text: "Richard Swinburne ist zweifellos der herausragende natürliche Theologe unserer Zeit.",
        source: "Alvin Plantinga, Würdigung Swinburnes",
      },
      disputed:
        "Plantingas modales Argument ruht auf einer einzigen umstrittenen Prämisse: dass ein maximal großartiges Wesen möglich ist. Wer das bestreitet, bricht das Argument ab. Die akademische Debatte ist offen.",
    },
    influences: ["vier_reiter"],
  },

  {
    id: "neuer_atheismus_kontext",
    room: 5,
    strand: "geschichte",
    date: "11. September 2001",
    name: "9/11 — Ein Anschlag löst eine philosophische Bewegung aus",
    artefact: {
      description: "Eine Ascheschicht bedeckt den Sockel fast vollständig; aus ihr ragen vier Bücher hervor — aufrecht stehend, als hätten sie die Staubwolke überlebt.",
      assetHint: "ash dust particles grey",
    },
    cardText: "Sam Harris begann »The End of Faith« unmittelbar nach dem 11. September.",
    panelText: {
      story:
        "Im September 2001 war Sam Harris ein unbekannter Doktorand der Neurowissenschaften an der UCLA. Unmittelbar nach den Anschlägen legte er sein Studium beiseite, um ein Buch zu schreiben. The End of Faith (2004) startete die Neue-Atheismus-Bewegung. Innerhalb von drei Jahren folgten Dawkins (Der Gotteswahn, 2006), Dennett (Den Bann brechen, 2006) und Hitchens (Der Herr ist kein Hirte, 2007). Das Etikett »Neuer Atheismus« stammt von Journalist Gary Wolf (Wired, November 2006).",
      keyIdea:
        "Dies ist das stärkste Beispiel im Museum für »Geschichte erzeugt Philosophie«: Ein einziges historisch-politisches Ereignis löste unmittelbar eine philosophische Bewegung aus, die Millionen von Büchern verkaufte.",
      quote: {
        text: "Harris begann sein erstes Buch, The End of Faith, unmittelbar nach den Anschlägen des 11. September zu schreiben.",
        source: "Wikipedia, Sam Harris (belegt)",
      },
      disputed:
        "Harris' Fokus auf den Islam als besondere Bedrohung wurde vielfach als pauschal kritisiert. »Neuer Atheismus« ist ein Medienbegriff, keine Selbstbezeichnung.",
    },
    influences: ["vier_reiter"],
  },

  {
    id: "vier_reiter",
    room: 5,
    strand: "philosophie",
    date: "30. September 2007",
    name: "Die vier Reiter — Das Gespräch, das viral ging",
    artefact: {
      description: "Vier unterschiedlich gebundene Bücher liegen fächerförmig um ein altmodisches Tischmikrofon in der Mitte des Sockels angeordnet.",
      assetHint: "vintage microphone table",
    },
    cardText: "Vier Bestseller. Ein Tisch. Zwei Stunden. Der symbolische Abschluss des Bogens.",
    panelText: {
      story:
        "Am 30. September 2007 trafen sich Richard Dawkins, Daniel Dennett, Sam Harris und Christopher Hitchens in Hitchens' Wohnung in Washington, D.C. zu einem zweistündigen, unmoderierten Gespräch, das gefilmt und online gestellt wurde. Im Gespräch sagte Hitchens, er würde die Religion selbst dann nicht abschaffen wollen, wenn er könnte; er würde seinen Sparringspartner verlieren.",
      keyIdea:
        "Dies ist der symbolische Endpunkt des gesamten Bogens, der mit Pythagoras begann: Philosophie, einst ein heiliger Weg zum Göttlichen, sitzt nun am Tisch und führt die öffentliche Anklage. Der Bogen ist vollständig. Aber: Plantinga und Swinburne existieren gleichzeitig: Das Gespräch geht weiter.",
      quote: {
        text: "Ich würde die Religion nicht abschaffen wollen, selbst wenn ich könnte. Ich würde meinen Sparringspartner verlieren.",
        source: "Christopher Hitchens, »Die vier Reiter«-Gespräch, 30. September 2007",
      },
      disputed: null,
    },
    influences: [],
  },
];

/**
 * Liefert alle Exponate eines bestimmten Raums, sortiert nach strand
 */
export function getExhibitsByRoom(roomId) {
  return exhibits.filter((e) => e.room === roomId);
}

/**
 * Liefert ein Exponat anhand seiner ID
 */
export function getExhibitById(id) {
  return exhibits.find((e) => e.id === id) ?? null;
}

/**
 * Liefert alle Exponate, die ein gegebenes Exponat beeinflusst hat (Ziel-IDs)
 */
export function getInfluencedBy(targetId) {
  return exhibits.filter((e) => e.influences.includes(targetId));
}

/**
 * Liefert alle Knoten und Kanten des Einflussgraphen
 */
export function buildInfluenceGraph() {
  const nodes = exhibits.map((e) => ({
    id: e.id,
    label: e.name.split(" — ")[0],
    room: e.room,
    strand: e.strand,
  }));
  const edges = [];
  for (const e of exhibits) {
    for (const target of e.influences) {
      edges.push({ source: e.id, target });
    }
  }
  return { nodes, edges };
}
