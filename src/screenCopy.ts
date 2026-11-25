import type { Locale } from './i18n';

export type ScreenCopy = {
  catalog: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cardTitle: string;
    cardSubtitle: string;
    searchPlaceholder: string;
    countSuffix: string;
    sortAsc: string;
    sortDesc: string;
    helperTitle: string;
    helperBody: string;
    continue: string;
    signOut: string;
  };
  matches: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cardTitle: string;
    cardSubtitle: string;
    searchPlaceholder: string;
    countSuffix: string;
    sortAsc: string;
    sortDesc: string;
    openHub: string;
    backToEvents: string;
    back: string;
  };
  hub: {
    eyebrow: string;
    emptyTitle: string;
    emptySubtitle: string;
    alertTitle: string;
    alertSubtitle: string;
    highCongestion: string;
    retryCatalog: string;
    loadingTitle: string;
    loadingSubtitle: string;
    nextEvent: string;
    kickoff: string;
    countdown: string;
    weather: string;
    gate: string;
    sector: string;
    ticket: string;
    planJourney: string;
    buyTicket: string;
    changeMatch: string;
    ticketTitle: string;
    ticketSubtitle: string;
    readyToPayTitle: string;
    readyToPayBody: string;
    linesTitle: string;
    linesSubtitle: string;
    telemetryTitle: string;
    telemetrySubtitle: string;
    gatesTitle: string;
    gatesSubtitle: string;
    essentialsTitle: string;
    essentialsSubtitle: string;
    signalsTitle: string;
    signalsSubtitle: string;
    messagesTitle: string;
    messagesSubtitle: string;
    changeSelectionTitle: string;
    changeSelectionSubtitle: string;
  };
  journey: {
    eyebrow: string;
    title: string;
    subtitle: string;
    plannerTitle: string;
    plannerSubtitle: string;
    stepOneTitle: string;
    stepOneBody: string;
    stepTwoTitle: string;
    stepTwoBody: string;
    stepThreeTitle: string;
    stepThreeBody: string;
    checkoutTitle: string;
    checkoutSubtitle: string;
    loadingTitle: string;
    loadingBody: string;
    emptyTitle: string;
    emptyBody: string;
  };
  pass: {
    eyebrow: string;
    title: string;
    subtitle: string;
    accessTitle: string;
    accessSubtitle: string;
    cardTitle: string;
    cardBody: string;
    bulletOne: string;
    bulletTwo: string;
    emptyTitle: string;
    emptyBody: string;
  };
  profile: {
    eyebrow: string;
    title: string;
    subtitle: string;
    profileTitle: string;
    profileSubtitle: string;
    profileBody: string;
    preferencesLabel: string;
    preferencesValue: string;
    historyTitle: string;
    historySubtitle: string;
    loadingTitle: string;
    loadingBody: string;
    emptyTitle: string;
    emptyBody: string;
  };
  wayfinding: {
    eyebrow: string;
    title: string;
    subtitle: string;
    mapTitle: string;
    mapSubtitle: string;
    mapBody: string;
    openMaps: string;
    directions: string;
    filtersTitle: string;
    filtersSubtitle: string;
    allRoutes: string;
    fastest: string;
    freePass: string;
    stepFree: string;
    linesTitle: string;
    linesSubtitle: string;
    handoffTitle: string;
    handoffSubtitle: string;
    nativeMapBody: string;
    fallbackBody: string;
    searchVenue: string;
  };
};

const COPY: Record<Locale, ScreenCopy> = {
  en: {
    catalog: {
      eyebrow: 'EVENTS',
      title: 'Choose an event',
      subtitle: 'Pick a catalogue first, then open the live match hub for that event.',
      cardTitle: 'Event catalog',
      cardSubtitle: 'Search and sort',
      searchPlaceholder: 'Search events',
      countSuffix: 'catalogues available',
      sortAsc: 'A → Z',
      sortDesc: 'Z → A',
      helperTitle: 'Need a different language?',
      helperBody: 'The app starts in the phone language if supported, otherwise English. You can keep the language in the account profile later.',
      continue: 'Continue',
      signOut: 'Sign out',
    },
    matches: {
      eyebrow: 'MATCHES',
      title: 'Selected event',
      subtitle: 'Choose the exact match to open the hub with the live travel and gate data.',
      cardTitle: 'Match catalogue',
      cardSubtitle: 'Search and sort',
      searchPlaceholder: 'Search matches',
      countSuffix: 'matches available',
      sortAsc: 'A → Z',
      sortDesc: 'Z → A',
      openHub: 'Open hub',
      backToEvents: 'Back to events',
      back: 'Back',
    },
    hub: {
      eyebrow: 'MATCHDAY HUB',
      emptyTitle: 'Matchday mobility hub',
      emptySubtitle: 'Select a match to load the live journey, operations and gate data.',
      alertTitle: 'Live service alert',
      alertSubtitle: 'Traffic',
      highCongestion: 'High congestion detected',
      retryCatalog: 'Retry catalog',
      loadingTitle: 'Loading live catalog',
      loadingSubtitle: 'Backend sync',
      nextEvent: 'Next sporting event',
      kickoff: 'Kickoff',
      countdown: 'Countdown',
      weather: 'Weather',
      gate: 'Gate',
      sector: 'Sector',
      ticket: 'Ticket',
      planJourney: 'Plan my journey',
      buyTicket: 'Buy ticket',
      changeMatch: 'Change match',
      ticketTitle: 'Ticket purchase',
      ticketSubtitle: 'Payments',
      readyToPayTitle: 'Ready to pay',
      readyToPayBody: 'A backend checkout session will appear here once the ticket endpoint is connected to a payment provider.',
      linesTitle: 'Transit direct lines',
      linesSubtitle: 'Matchday routing',
      telemetryTitle: 'Live operations',
      telemetrySubtitle: 'Service feed',
      gatesTitle: 'Stadium perimeter gates',
      gatesSubtitle: 'Wayfinding',
      essentialsTitle: 'Matchday essentials',
      essentialsSubtitle: 'Quick access',
      signalsTitle: 'Operational signals',
      signalsSubtitle: 'Live recommendations',
      messagesTitle: 'Contextual messages',
      messagesSubtitle: 'Adaptive comms',
      changeSelectionTitle: 'Change selection',
      changeSelectionSubtitle: 'Navigation',
    },
    journey: {
      eyebrow: 'JOURNEY',
      title: 'Plan, book and depart',
      subtitle: 'Reservation flow, step-by-step trip guidance and backend-driven booking history.',
      plannerTitle: 'Journey planner',
      plannerSubtitle: 'Trip setup',
      stepOneTitle: 'Plan your route',
      stepOneBody: 'Pick the fastest path from the live catalog.',
      stepTwoTitle: 'Choose a departure window',
      stepTwoBody: 'Match your trip to the matchday schedule.',
      stepThreeTitle: 'Confirm once',
      stepThreeBody: 'Use the backend account to keep the journey synced.',
      checkoutTitle: 'Booking checkout',
      checkoutSubtitle: 'Reservation flow',
      loadingTitle: 'Loading bookings',
      loadingBody: 'Booking rows are fetched from the backend catalog.',
      emptyTitle: 'No booking data',
      emptyBody: 'Sign in to load live booking history from the backend.',
    },
    pass: {
      eyebrow: 'PASS',
      title: 'Digital transit pass',
      subtitle: 'Backend-issued pass details and transit eligibility live here.',
      accessTitle: 'Matchday access',
      accessSubtitle: 'Confirmation',
      cardTitle: 'Transit access from the backend',
      cardBody: 'The pass screen now waits for live backend data instead of a local QR mock.',
      bulletOne: 'Secure account required',
      bulletTwo: 'Routes and eligibility reflect live backend state',
      emptyTitle: 'Backend only',
      emptyBody: 'This screen no longer renders a placeholder QR or demo pass data.',
    },
    profile: {
      eyebrow: 'PROFILE',
      title: 'Fan and admin identity',
      subtitle: 'Account preferences, travel history and backend-driven admin visibility.',
      profileTitle: 'Fan profile',
      profileSubtitle: 'Account',
      profileBody: 'Account profile loads from the signed-in backend user',
      preferencesLabel: 'Preferences',
      preferencesValue: 'Step-free routes · Notifications on',
      historyTitle: 'Travel history',
      historySubtitle: 'Recent trips',
      loadingTitle: 'Loading profile',
      loadingBody: 'Travel history comes from the backend catalog.',
      emptyTitle: 'No profile data',
      emptyBody: 'Sign in to render the live travel history feed.',
    },
    wayfinding: {
      eyebrow: 'WAYFINDING',
      title: 'Interactive mobility map',
      subtitle: 'Native map surface with backend-backed links to Google Maps for routing.',
      mapTitle: 'Route map',
      mapSubtitle: 'Live routing',
      mapBody: 'The app renders a native map here and uses Google Maps links for route handoff.',
      openMaps: 'Open in Google Maps',
      directions: 'View directions',
      filtersTitle: 'Route filters',
      filtersSubtitle: 'Search',
      allRoutes: 'All routes',
      fastest: 'Fastest',
      freePass: 'Free with pass',
      stepFree: 'Step-free',
      handoffTitle: 'App-shell handoff',
      handoffSubtitle: 'Transport',
      nativeMapBody: 'Native map is embedded in the shell; no local demo route data is rendered.',
      fallbackBody: 'If the map tiles are unavailable on Android, the external Google Maps links still work.',
      searchVenue: 'Search venue',
    },
  },
  es: {
    catalog: { eyebrow: 'EVENTOS', title: 'Elige un evento', subtitle: 'Primero elige un catálogo y luego abre el hub en vivo de ese evento.', cardTitle: 'Catálogo de eventos', cardSubtitle: 'Buscar y ordenar', searchPlaceholder: 'Buscar eventos', countSuffix: 'catálogos disponibles', sortAsc: 'A → Z', sortDesc: 'Z → A', helperTitle: '¿Necesitas otro idioma?', helperBody: 'La app inicia en el idioma del teléfono si está soportado; si no, en inglés. Luego puedes guardarlo en el perfil.', continue: 'Continuar', signOut: 'Cerrar sesión' },
    matches: { eyebrow: 'PARTIDOS', title: 'Evento seleccionado', subtitle: 'Elige el partido exacto para abrir el hub con datos en vivo de viaje y accesos.', cardTitle: 'Catálogo de partidos', cardSubtitle: 'Buscar y ordenar', searchPlaceholder: 'Buscar partidos', countSuffix: 'partidos disponibles', sortAsc: 'A → Z', sortDesc: 'Z → A', openHub: 'Abrir hub', backToEvents: 'Volver a eventos', back: 'Atrás' },
    hub: { eyebrow: 'HUB DE PARTIDO', emptyTitle: 'Hub de movilidad del partido', emptySubtitle: 'Selecciona un partido para cargar viaje, operaciones y accesos en vivo.', alertTitle: 'Alerta de servicio en vivo', alertSubtitle: 'Tráfico', highCongestion: 'Congestión alta detectada', retryCatalog: 'Reintentar catálogo', loadingTitle: 'Cargando catálogo en vivo', loadingSubtitle: 'Sincronización backend', nextEvent: 'Próximo evento deportivo', kickoff: 'Inicio', countdown: 'Cuenta atrás', weather: 'Clima', gate: 'Puerta', sector: 'Sector', ticket: 'Entrada', planJourney: 'Planificar mi viaje', buyTicket: 'Comprar entrada', changeMatch: 'Cambiar partido', ticketTitle: 'Compra de entrada', ticketSubtitle: 'Pagos', readyToPayTitle: 'Listo para pagar', readyToPayBody: 'Aquí aparecerá una sesión de pago cuando el endpoint de entradas esté conectado a un proveedor.', linesTitle: 'Líneas directas de transporte', linesSubtitle: 'Ruta del partido', telemetryTitle: 'Telemetría perimetral en vivo', telemetrySubtitle: 'Operaciones', gatesTitle: 'Accesos del estadio', gatesSubtitle: 'Orientación', essentialsTitle: 'Elementos esenciales', essentialsSubtitle: 'Acceso rápido', signalsTitle: 'Señales operativas', signalsSubtitle: 'Recomendaciones en vivo', messagesTitle: 'Mensajes contextuales', messagesSubtitle: 'Comunicación adaptativa', changeSelectionTitle: 'Cambiar selección', changeSelectionSubtitle: 'Navegación' },
    journey: { eyebrow: 'VIAJE', title: 'Planifica, reserva y sal', subtitle: 'Flujo de reserva, guía paso a paso y historial desde el backend.', plannerTitle: 'Planificador', plannerSubtitle: 'Preparación', stepOneTitle: 'Planifica tu ruta', stepOneBody: 'Elige la ruta más rápida del catálogo en vivo.', stepTwoTitle: 'Elige una salida', stepTwoBody: 'Ajusta el viaje al horario del partido.', stepThreeTitle: 'Confirma una vez', stepThreeBody: 'Usa tu cuenta backend para mantener todo sincronizado.', checkoutTitle: 'Pago de reserva', checkoutSubtitle: 'Reserva', loadingTitle: 'Cargando reservas', loadingBody: 'Las reservas llegan desde el catálogo backend.', emptyTitle: 'Sin datos de reservas', emptyBody: 'Inicia sesión para cargar el historial en vivo.' },
    pass: { eyebrow: 'PASE', title: 'Pase digital de transporte', subtitle: 'Aquí viven los detalles del pase emitido por el backend.', accessTitle: 'Acceso al partido', accessSubtitle: 'Confirmación', cardTitle: 'Acceso al transporte desde el backend', cardBody: 'La pantalla de pase espera datos reales del backend y no un QR local.', bulletOne: 'Se requiere cuenta segura', bulletTwo: 'Rutas y elegibilidad reflejan el estado en vivo', emptyTitle: 'Solo backend', emptyBody: 'Esta pantalla ya no muestra un QR ficticio ni datos demo.' },
    profile: { eyebrow: 'PERFIL', title: 'Identidad del fan y admin', subtitle: 'Preferencias, historial y visibilidad de admin desde backend.', profileTitle: 'Perfil del fan', profileSubtitle: 'Cuenta', profileBody: 'El perfil se carga desde el usuario backend autenticado', preferencesLabel: 'Preferencias', preferencesValue: 'Rutas sin barreras · Notificaciones activas', historyTitle: 'Historial de viaje', historySubtitle: 'Viajes recientes', loadingTitle: 'Cargando perfil', loadingBody: 'El historial sale del catálogo backend.', emptyTitle: 'Sin datos de perfil', emptyBody: 'Inicia sesión para ver el historial en vivo.' },
    wayfinding: { eyebrow: 'ORIENTACIÓN', title: 'Mapa de movilidad interactivo', subtitle: 'Mapa nativo con enlaces a Google Maps para navegación.', mapTitle: 'Mapa de ruta', mapSubtitle: 'Navegación en vivo', mapBody: 'La app renderiza un mapa nativo y usa Google Maps como handoff.', openMaps: 'Abrir en Google Maps', directions: 'Ver indicaciones', filtersTitle: 'Filtros de ruta', filtersSubtitle: 'Buscar', allRoutes: 'Todas', fastest: 'Más rápida', freePass: 'Gratis con pase', stepFree: 'Sin escalones', handoffTitle: 'Handoff de la app', handoffSubtitle: 'Transporte', nativeMapBody: 'El mapa nativo está embebido; no se usa demo local.', fallbackBody: 'Si faltan teselas en Android, los enlaces externos siguen funcionando.', searchVenue: 'Buscar recinto' },
  },
  fr: {
    catalog: { eyebrow: 'ÉVÉNEMENTS', title: 'Choisissez un événement', subtitle: 'Sélectionnez d’abord un catalogue, puis ouvrez le hub en direct.', cardTitle: 'Catalogue d’événements', cardSubtitle: 'Recherche et tri', searchPlaceholder: 'Rechercher des événements', countSuffix: 'catalogues disponibles', sortAsc: 'A → Z', sortDesc: 'Z → A', helperTitle: 'Besoin d’une autre langue ?', helperBody: 'L’application démarre dans la langue du téléphone si elle est prise en charge, sinon en anglais. Vous pourrez la conserver dans le profil.', continue: 'Continuer', signOut: 'Se déconnecter' },
    matches: { eyebrow: 'MATCHS', title: 'Événement sélectionné', subtitle: 'Choisissez le match exact pour ouvrir le hub avec les données de trajet et d’accès en direct.', cardTitle: 'Catalogue de matchs', cardSubtitle: 'Recherche et tri', searchPlaceholder: 'Rechercher des matchs', countSuffix: 'matchs disponibles', sortAsc: 'A → Z', sortDesc: 'Z → A', openHub: 'Ouvrir le hub', backToEvents: 'Retour aux événements', back: 'Retour' },
    hub: { eyebrow: 'HUB DU MATCH', emptyTitle: 'Hub de mobilité du match', emptySubtitle: 'Sélectionnez un match pour charger trajet, opérations et accès en direct.', alertTitle: 'Alerte de service en direct', alertSubtitle: 'Trafic', highCongestion: 'Congestion élevée détectée', retryCatalog: 'Réessayer le catalogue', loadingTitle: 'Chargement du catalogue en direct', loadingSubtitle: 'Synchronisation backend', nextEvent: 'Prochain événement sportif', kickoff: 'Coup d’envoi', countdown: 'Compte à rebours', weather: 'Météo', gate: 'Porte', sector: 'Secteur', ticket: 'Billet', planJourney: 'Planifier mon trajet', buyTicket: 'Acheter le billet', changeMatch: 'Changer de match', ticketTitle: 'Achat de billet', ticketSubtitle: 'Paiements', readyToPayTitle: 'Prêt à payer', readyToPayBody: 'Une session de paiement apparaîtra ici quand le backend sera branché à un fournisseur.', linesTitle: 'Lignes directes de transport', linesSubtitle: 'Itinéraire du match', telemetryTitle: 'Télémétrie périmétrique en direct', telemetrySubtitle: 'Opérations', gatesTitle: 'Accès du stade', gatesSubtitle: 'Navigation', essentialsTitle: 'Essentiels du match', essentialsSubtitle: 'Accès rapide', signalsTitle: 'Signaux opérationnels', signalsSubtitle: 'Recommandations en direct', messagesTitle: 'Messages contextuels', messagesSubtitle: 'Communication adaptative', changeSelectionTitle: 'Changer la sélection', changeSelectionSubtitle: 'Navigation' },
    journey: { eyebrow: 'TRAJET', title: 'Planifiez, réservez et partez', subtitle: 'Flux de réservation, guide pas à pas et historique piloté par le backend.', plannerTitle: 'Planificateur', plannerSubtitle: 'Préparation', stepOneTitle: 'Planifiez votre trajet', stepOneBody: 'Choisissez l’itinéraire le plus rapide du catalogue en direct.', stepTwoTitle: 'Choisissez une plage de départ', stepTwoBody: 'Alignez votre trajet sur le programme du match.', stepThreeTitle: 'Confirmez une fois', stepThreeBody: 'Utilisez votre compte backend pour garder le trajet synchronisé.', checkoutTitle: 'Paiement de réservation', checkoutSubtitle: 'Réservation', loadingTitle: 'Chargement des réservations', loadingBody: 'Les réservations proviennent du catalogue backend.', emptyTitle: 'Aucune donnée de réservation', emptyBody: 'Connectez-vous pour charger l’historique en direct.' },
    pass: { eyebrow: 'PASS', title: 'Pass de transport numérique', subtitle: 'Les détails du pass émis par le backend vivent ici.', accessTitle: 'Accès au match', accessSubtitle: 'Confirmation', cardTitle: 'Accès transport depuis le backend', cardBody: 'L’écran de pass attend des données backend réelles, pas un faux QR.', bulletOne: 'Compte sécurisé requis', bulletTwo: 'Les trajets et l’éligibilité reflètent l’état en direct', emptyTitle: 'Backend uniquement', emptyBody: 'Cet écran n’affiche plus de QR fictif ni de données démo.' },
    profile: { eyebrow: 'PROFIL', title: 'Identité fan et admin', subtitle: 'Préférences, historique et visibilité admin depuis le backend.', profileTitle: 'Profil fan', profileSubtitle: 'Compte', profileBody: 'Le profil se charge depuis l’utilisateur backend authentifié', preferencesLabel: 'Préférences', preferencesValue: 'Trajets sans marche · Notifications actives', historyTitle: 'Historique de trajet', historySubtitle: 'Trajets récents', loadingTitle: 'Chargement du profil', loadingBody: 'L’historique vient du catalogue backend.', emptyTitle: 'Aucune donnée de profil', emptyBody: 'Connectez-vous pour voir l’historique en direct.' },
    wayfinding: { eyebrow: 'ORIENTATION', title: 'Carte de mobilité interactive', subtitle: 'Carte native avec liens Google Maps pour le routage.', mapTitle: 'Carte d’itinéraire', mapSubtitle: 'Navigation en direct', mapBody: 'L’app rend une carte native et utilise Google Maps comme relais.', openMaps: 'Ouvrir dans Google Maps', directions: 'Voir l’itinéraire', filtersTitle: 'Filtres d’itinéraire', filtersSubtitle: 'Recherche', allRoutes: 'Tous', fastest: 'Le plus rapide', freePass: 'Gratuit avec pass', stepFree: 'Sans marche', handoffTitle: 'Relais de l’app', handoffSubtitle: 'Transport', nativeMapBody: 'La carte native est intégrée ; aucune démo locale n’est rendue.', fallbackBody: 'Si les tuiles manquent sur Android, les liens externes fonctionnent toujours.', searchVenue: 'Rechercher le lieu' },
  },
  de: {
    catalog: { eyebrow: 'VERANSTALTUNGEN', title: 'Wähle ein Event', subtitle: 'Wähle zuerst einen Katalog und öffne dann den Live-Hub.', cardTitle: 'Eventkatalog', cardSubtitle: 'Suchen und sortieren', searchPlaceholder: 'Events suchen', countSuffix: 'Kataloge verfügbar', sortAsc: 'A → Z', sortDesc: 'Z → A', helperTitle: 'Andere Sprache nötig?', helperBody: 'Die App startet in der Telefonsprache, wenn unterstützt, sonst auf Englisch. Du kannst sie später im Profil speichern.', continue: 'Weiter', signOut: 'Abmelden' },
    matches: { eyebrow: 'SPIELE', title: 'Ausgewähltes Event', subtitle: 'Wähle das genaue Spiel, um den Hub mit Live-Reise- und Zugangsdaten zu öffnen.', cardTitle: 'Spielkatalog', cardSubtitle: 'Suchen und sortieren', searchPlaceholder: 'Spiele suchen', countSuffix: 'Spiele verfügbar', sortAsc: 'A → Z', sortDesc: 'Z → A', openHub: 'Hub öffnen', backToEvents: 'Zurück zu Events', back: 'Zurück' },
    hub: { eyebrow: 'SPIELTAG-HUB', emptyTitle: 'Mobilitäts-Hub für den Spieltag', emptySubtitle: 'Wähle ein Spiel, um Reise, Betrieb und Zugangsdaten zu laden.', alertTitle: 'Live-Service-Warnung', alertSubtitle: 'Verkehr', highCongestion: 'Starke Auslastung erkannt', retryCatalog: 'Katalog erneut laden', loadingTitle: 'Live-Katalog wird geladen', loadingSubtitle: 'Backend-Synchronisierung', nextEvent: 'Nächstes Sportevent', kickoff: 'Anpfiff', countdown: 'Countdown', weather: 'Wetter', gate: 'Tor', sector: 'Sektor', ticket: 'Ticket', planJourney: 'Meine Reise planen', buyTicket: 'Ticket kaufen', changeMatch: 'Spiel wechseln', ticketTitle: 'Ticketkauf', ticketSubtitle: 'Zahlung', readyToPayTitle: 'Bereit zum Bezahlen', readyToPayBody: 'Hier erscheint eine Checkout-Session, sobald das Ticket-Endpoint an einen Anbieter angebunden ist.', linesTitle: 'Direkte Verkehrslinien', linesSubtitle: 'Spieltag-Route', telemetryTitle: 'Perimeter-Telemetrie live', telemetrySubtitle: 'Betrieb', gatesTitle: 'Stadionzugänge', gatesSubtitle: 'Navigation', essentialsTitle: 'Spieltag-Extras', essentialsSubtitle: 'Schnellzugriff', signalsTitle: 'Betriebssignale', signalsSubtitle: 'Live-Empfehlungen', messagesTitle: 'Kontextnachrichten', messagesSubtitle: 'Adaptive Kommunikation', changeSelectionTitle: 'Auswahl ändern', changeSelectionSubtitle: 'Navigation' },
    journey: { eyebrow: 'REISE', title: 'Planen, buchen und losfahren', subtitle: 'Buchungsfluss, Schritt-für-Schritt-Hilfe und Backend-Verlauf.', plannerTitle: 'Reiseplaner', plannerSubtitle: 'Planung', stepOneTitle: 'Route planen', stepOneBody: 'Wähle den schnellsten Weg aus dem Live-Katalog.', stepTwoTitle: 'Abfahrtsfenster wählen', stepTwoBody: 'Passe die Reise an den Spielplan an.', stepThreeTitle: 'Einmal bestätigen', stepThreeBody: 'Nutze dein Backend-Konto für die Synchronisierung.', checkoutTitle: 'Buchungs-Checkout', checkoutSubtitle: 'Reservierung', loadingTitle: 'Buchungen werden geladen', loadingBody: 'Die Buchungen kommen aus dem Backend-Katalog.', emptyTitle: 'Keine Buchungsdaten', emptyBody: 'Melde dich an, um den Live-Verlauf zu laden.' },
    pass: { eyebrow: 'PASS', title: 'Digitaler Verkehrspass', subtitle: 'Hier stehen die vom Backend ausgegebenen Passdaten.', accessTitle: 'Zugang zum Spieltag', accessSubtitle: 'Bestätigung', cardTitle: 'Transit-Zugang vom Backend', cardBody: 'Der Pass-Bildschirm wartet auf echte Backend-Daten statt auf einen lokalen QR-Mock.', bulletOne: 'Sicheres Konto erforderlich', bulletTwo: 'Routen und Berechtigung spiegeln den Live-Status', emptyTitle: 'Nur Backend', emptyBody: 'Dieser Bildschirm zeigt keinen Platzhalter-QR oder Demo-Daten mehr.' },
    profile: { eyebrow: 'PROFIL', title: 'Fan- und Admin-Identität', subtitle: 'Präferenzen, Verlauf und Admin-Sichtbarkeit aus dem Backend.', profileTitle: 'Fan-Profil', profileSubtitle: 'Konto', profileBody: 'Das Profil lädt aus dem angemeldeten Backend-Benutzer', preferencesLabel: 'Einstellungen', preferencesValue: 'Stufenfreie Routen · Benachrichtigungen an', historyTitle: 'Reiseverlauf', historySubtitle: 'Letzte Fahrten', loadingTitle: 'Profil wird geladen', loadingBody: 'Der Verlauf stammt aus dem Backend-Katalog.', emptyTitle: 'Keine Profildaten', emptyBody: 'Melde dich an, um den Live-Verlauf anzuzeigen.' },
    wayfinding: { eyebrow: 'NAVIGATION', title: 'Interaktive Mobilitätskarte', subtitle: 'Native Karte mit Google-Maps-Links für das Routing.', mapTitle: 'Routenkarte', mapSubtitle: 'Live-Navigation', mapBody: 'Die App rendert hier eine native Karte und nutzt Google Maps als Übergabe.', openMaps: 'In Google Maps öffnen', directions: 'Wegbeschreibung', filtersTitle: 'Routenfilter', filtersSubtitle: 'Suche', allRoutes: 'Alle', fastest: 'Am schnellsten', freePass: 'Gratis mit Pass', stepFree: 'Barrierefrei', handoffTitle: 'App-Handoff', handoffSubtitle: 'Transport', nativeMapBody: 'Die native Karte ist eingebettet; keine lokale Demo-Daten werden gerendert.', fallbackBody: 'Wenn Kartenkacheln auf Android fehlen, funktionieren die externen Google-Maps-Links trotzdem.', searchVenue: 'Ort suchen' },
  },
  pt: {
    catalog: { eyebrow: 'EVENTOS', title: 'Escolha um evento', subtitle: 'Escolha primeiro um catálogo e depois abra o hub ao vivo.', cardTitle: 'Catálogo de eventos', cardSubtitle: 'Buscar e ordenar', searchPlaceholder: 'Buscar eventos', countSuffix: 'catálogos disponíveis', sortAsc: 'A → Z', sortDesc: 'Z → A', helperTitle: 'Precisa de outro idioma?', helperBody: 'O app começa no idioma do telefone se for suportado; caso contrário, inglês. Depois você pode salvar isso no perfil.', continue: 'Continuar', signOut: 'Sair' },
    matches: { eyebrow: 'PARTIDAS', title: 'Evento selecionado', subtitle: 'Escolha a partida exata para abrir o hub com dados ao vivo de viagem e acesso.', cardTitle: 'Catálogo de partidas', cardSubtitle: 'Buscar e ordenar', searchPlaceholder: 'Buscar partidas', countSuffix: 'partidas disponíveis', sortAsc: 'A → Z', sortDesc: 'Z → A', openHub: 'Abrir hub', backToEvents: 'Voltar aos eventos', back: 'Voltar' },
    hub: { eyebrow: 'HUB DA PARTIDA', emptyTitle: 'Hub de mobilidade do jogo', emptySubtitle: 'Selecione uma partida para carregar viagem, operações e acessos ao vivo.', alertTitle: 'Alerta de serviço ao vivo', alertSubtitle: 'Trânsito', highCongestion: 'Congestionamento alto detectado', retryCatalog: 'Tentar catálogo novamente', loadingTitle: 'Carregando catálogo ao vivo', loadingSubtitle: 'Sincronização backend', nextEvent: 'Próximo evento esportivo', kickoff: 'Início', countdown: 'Contagem regressiva', weather: 'Clima', gate: 'Portão', sector: 'Setor', ticket: 'Ingresso', planJourney: 'Planejar minha viagem', buyTicket: 'Comprar ingresso', changeMatch: 'Trocar partida', ticketTitle: 'Compra de ingresso', ticketSubtitle: 'Pagamentos', readyToPayTitle: 'Pronto para pagar', readyToPayBody: 'Uma sessão de checkout aparecerá aqui quando o endpoint de ingressos estiver ligado a um provedor.', linesTitle: 'Linhas diretas de transporte', linesSubtitle: 'Rota do jogo', telemetryTitle: 'Telemetria do perímetro ao vivo', telemetrySubtitle: 'Operações', gatesTitle: 'Acessos do estádio', gatesSubtitle: 'Orientação', essentialsTitle: 'Essenciais do jogo', essentialsSubtitle: 'Acesso rápido', signalsTitle: 'Sinais operacionais', signalsSubtitle: 'Recomendações ao vivo', messagesTitle: 'Mensagens contextuais', messagesSubtitle: 'Comunicação adaptativa', changeSelectionTitle: 'Mudar seleção', changeSelectionSubtitle: 'Navegação' },
    journey: { eyebrow: 'VIAGEM', title: 'Planeje, reserve e saia', subtitle: 'Fluxo de reserva, guia passo a passo e histórico do backend.', plannerTitle: 'Planejador', plannerSubtitle: 'Configuração', stepOneTitle: 'Planeje sua rota', stepOneBody: 'Escolha o caminho mais rápido do catálogo ao vivo.', stepTwoTitle: 'Escolha a saída', stepTwoBody: 'Combine a viagem com a programação do jogo.', stepThreeTitle: 'Confirme uma vez', stepThreeBody: 'Use sua conta backend para manter tudo sincronizado.', checkoutTitle: 'Checkout da reserva', checkoutSubtitle: 'Reserva', loadingTitle: 'Carregando reservas', loadingBody: 'As reservas vêm do catálogo backend.', emptyTitle: 'Sem dados de reserva', emptyBody: 'Faça login para carregar o histórico ao vivo.' },
    pass: { eyebrow: 'PASSE', title: 'Passe digital de transporte', subtitle: 'Os detalhes do passe emitido pelo backend vivem aqui.', accessTitle: 'Acesso do jogo', accessSubtitle: 'Confirmação', cardTitle: 'Acesso ao transporte via backend', cardBody: 'A tela de passe espera dados reais do backend, não um QR local.', bulletOne: 'Conta segura necessária', bulletTwo: 'Rotas e elegibilidade refletem o estado ao vivo', emptyTitle: 'Apenas backend', emptyBody: 'Esta tela não mostra mais QR fictício nem dados demo.' },
    profile: { eyebrow: 'PERFIL', title: 'Identidade do fã e admin', subtitle: 'Preferências, histórico e visibilidade do admin do backend.', profileTitle: 'Perfil do fã', profileSubtitle: 'Conta', profileBody: 'O perfil carrega do usuário backend autenticado', preferencesLabel: 'Preferências', preferencesValue: 'Rotas sem barreiras · Notificações ativas', historyTitle: 'Histórico de viagem', historySubtitle: 'Viagens recentes', loadingTitle: 'Carregando perfil', loadingBody: 'O histórico vem do catálogo backend.', emptyTitle: 'Sem dados de perfil', emptyBody: 'Faça login para ver o histórico ao vivo.' },
    wayfinding: { eyebrow: 'MAPA', title: 'Mapa interativo de mobilidade', subtitle: 'Mapa nativo com links do Google Maps para navegação.', mapTitle: 'Mapa da rota', mapSubtitle: 'Navegação ao vivo', mapBody: 'O app renderiza um mapa nativo e usa Google Maps como handoff.', openMaps: 'Abrir no Google Maps', directions: 'Ver rotas', filtersTitle: 'Filtros de rota', filtersSubtitle: 'Buscar', allRoutes: 'Todas', fastest: 'Mais rápida', freePass: 'Grátis com passe', stepFree: 'Sem degraus', handoffTitle: 'Handoff do app', handoffSubtitle: 'Transporte', nativeMapBody: 'O mapa nativo está embutido; nenhum dado demo local é renderizado.', fallbackBody: 'Se os tiles falharem no Android, os links externos ainda funcionam.', searchVenue: 'Buscar local' },
  },
  ar: {
    catalog: { eyebrow: 'الفعاليات', title: 'اختر فعالية', subtitle: 'اختر كتالوجًا أولًا ثم افتح المركز المباشر للمباراة.', cardTitle: 'كتالوج الفعاليات', cardSubtitle: 'بحث وترتيب', searchPlaceholder: 'ابحث عن الفعاليات', countSuffix: 'كتالوجات متاحة', sortAsc: 'أ → ي', sortDesc: 'ي → أ', helperTitle: 'هل تحتاج لغة أخرى؟', helperBody: 'يبدأ التطبيق بلغة الهاتف إذا كانت مدعومة، وإلا فالإنجليزية. يمكنك حفظها لاحقًا في الملف.', continue: 'متابعة', signOut: 'تسجيل الخروج' },
    matches: { eyebrow: 'المباريات', title: 'الفعالية المختارة', subtitle: 'اختر المباراة الدقيقة لفتح المركز مع بيانات السفر والأبواب المباشرة.', cardTitle: 'كتالوج المباريات', cardSubtitle: 'بحث وترتيب', searchPlaceholder: 'ابحث عن المباريات', countSuffix: 'مباريات متاحة', sortAsc: 'أ → ي', sortDesc: 'ي → أ', openHub: 'فتح المركز', backToEvents: 'العودة إلى الفعاليات', back: 'رجوع' },
    hub: { eyebrow: 'مركز المباراة', emptyTitle: 'مركز تنقل يوم المباراة', emptySubtitle: 'اختر مباراة لتحميل بيانات السفر والعمليات والأبواب المباشرة.', alertTitle: 'تنبيه خدمة مباشر', alertSubtitle: 'الازدحام', highCongestion: 'تم رصد ازدحام شديد', retryCatalog: 'إعادة المحاولة', loadingTitle: 'جارٍ تحميل الكتالوج المباشر', loadingSubtitle: 'مزامنة الخلفية', nextEvent: 'الحدث الرياضي القادم', kickoff: 'بداية المباراة', countdown: 'العد التنازلي', weather: 'الطقس', gate: 'البوابة', sector: 'القطاع', ticket: 'التذكرة', planJourney: 'خطط رحلتي', buyTicket: 'شراء التذكرة', changeMatch: 'تغيير المباراة', ticketTitle: 'شراء التذكرة', ticketSubtitle: 'المدفوعات', readyToPayTitle: 'جاهز للدفع', readyToPayBody: 'ستظهر هنا جلسة دفع عندما يتصل endpoint التذاكر بمزوّد دفع.', linesTitle: 'خطوط النقل المباشرة', linesSubtitle: 'مسار يوم المباراة', telemetryTitle: 'القياسات المحيطية المباشرة', telemetrySubtitle: 'العمليات', gatesTitle: 'مداخل الملعب', gatesSubtitle: 'الإرشاد', essentialsTitle: 'أساسيات المباراة', essentialsSubtitle: 'وصول سريع', signalsTitle: 'الإشارات التشغيلية', signalsSubtitle: 'التوصيات المباشرة', messagesTitle: 'الرسائل السياقية', messagesSubtitle: 'التواصل التكيفي', changeSelectionTitle: 'تغيير الاختيار', changeSelectionSubtitle: 'التنقل' },
    journey: { eyebrow: 'الرحلة', title: 'خطط واحجز وانطلق', subtitle: 'تدفق الحجز والإرشاد خطوة بخطوة وسجل من الخلفية.', plannerTitle: 'مخطط الرحلة', plannerSubtitle: 'الإعداد', stepOneTitle: 'خطط مسارك', stepOneBody: 'اختر أسرع طريق من الكتالوج المباشر.', stepTwoTitle: 'اختر وقت الانطلاق', stepTwoBody: 'طابق رحلتك مع جدول المباراة.', stepThreeTitle: 'أكد مرة واحدة', stepThreeBody: 'استخدم حساب الخلفية لإبقاء الرحلة متزامنة.', checkoutTitle: 'دفع الحجز', checkoutSubtitle: 'الحجز', loadingTitle: 'جارٍ تحميل الحجوزات', loadingBody: 'تأتي الحجوزات من كتالوج الخلفية.', emptyTitle: 'لا توجد بيانات حجز', emptyBody: 'سجّل الدخول لتحميل السجل المباشر.' },
    pass: { eyebrow: 'المرور', title: 'تصريح نقل رقمي', subtitle: 'تفاصيل التصريح الصادر من الخلفية موجودة هنا.', accessTitle: 'دخول يوم المباراة', accessSubtitle: 'تأكيد', cardTitle: 'وصول النقل من الخلفية', cardBody: 'تنتظر شاشة التصريح بيانات حقيقية من الخلفية وليس QR محليًا.', bulletOne: 'يتطلب حسابًا آمنًا', bulletTwo: 'المسارات والأهلية تعكس الحالة المباشرة', emptyTitle: 'الخلفية فقط', emptyBody: 'هذه الشاشة لم تعد تعرض QR تجريبيًا أو بيانات demo.' },
    profile: { eyebrow: 'الملف', title: 'هوية المشجع والمشرف', subtitle: 'التفضيلات والسجل ورؤية الإدارة من الخلفية.', profileTitle: 'ملف المشجع', profileSubtitle: 'الحساب', profileBody: 'يتم تحميل الملف من المستخدم المسجّل في الخلفية', preferencesLabel: 'التفضيلات', preferencesValue: 'مسارات بدون درجات · الإشعارات مفعلة', historyTitle: 'سجل الرحلات', historySubtitle: 'الرحلات الأخيرة', loadingTitle: 'جارٍ تحميل الملف', loadingBody: 'يأتي السجل من كتالوج الخلفية.', emptyTitle: 'لا توجد بيانات ملف', emptyBody: 'سجّل الدخول لعرض السجل المباشر.' },
    wayfinding: { eyebrow: 'الإرشاد', title: 'خريطة تنقل تفاعلية', subtitle: 'خريطة أصلية مع روابط Google Maps للتوجيه.', mapTitle: 'خريطة المسار', mapSubtitle: 'تنقل مباشر', mapBody: 'يعرض التطبيق خريطة أصلية ويستخدم Google Maps كتحويل.', openMaps: 'افتح في Google Maps', directions: 'عرض الاتجاهات', filtersTitle: 'فلاتر المسار', filtersSubtitle: 'بحث', allRoutes: 'الكل', fastest: 'الأسرع', freePass: 'مجاني مع التصريح', stepFree: 'بدون درجات', handoffTitle: 'تحويل التطبيق', handoffSubtitle: 'النقل', nativeMapBody: 'الخريطة الأصلية مدمجة؛ لا توجد بيانات demo محلية.', fallbackBody: 'إذا فشلت خرائط Android، تعمل روابط Google Maps الخارجية دائمًا.', searchVenue: 'ابحث عن المكان' },
  },
  zh: {
    catalog: { eyebrow: '赛事', title: '选择一个赛事', subtitle: '先选择一个目录，再打开该赛事的实时中心。', cardTitle: '赛事目录', cardSubtitle: '搜索与排序', searchPlaceholder: '搜索赛事', countSuffix: '个目录可用', sortAsc: 'A → Z', sortDesc: 'Z → A', helperTitle: '需要其他语言？', helperBody: '如果手机支持，应用会先使用手机语言；否则使用英语。之后你也可以在资料中保存。', continue: '继续', signOut: '退出登录' },
    matches: { eyebrow: '比赛', title: '已选赛事', subtitle: '选择具体比赛以打开包含实时交通和入口数据的中心。', cardTitle: '比赛目录', cardSubtitle: '搜索与排序', searchPlaceholder: '搜索比赛', countSuffix: '场比赛可用', sortAsc: 'A → Z', sortDesc: 'Z → A', openHub: '打开中心', backToEvents: '返回赛事', back: '返回' },
    hub: { eyebrow: '比赛中心', emptyTitle: '比赛日出行中心', emptySubtitle: '选择一场比赛以加载实时行程、运营和入口数据。', alertTitle: '实时服务提醒', alertSubtitle: '交通', highCongestion: '检测到高拥堵', retryCatalog: '重试目录', loadingTitle: '正在加载实时目录', loadingSubtitle: '后端同步', nextEvent: '下一个体育赛事', kickoff: '开赛', countdown: '倒计时', weather: '天气', gate: '闸口', sector: '区域', ticket: '门票', planJourney: '规划行程', buyTicket: '购买门票', changeMatch: '切换比赛', ticketTitle: '门票购买', ticketSubtitle: '支付', readyToPayTitle: '准备支付', readyToPayBody: '当门票接口连接到支付服务时，这里会显示结账会话。', linesTitle: '直达交通线路', linesSubtitle: '比赛日路线', telemetryTitle: '周边实时遥测', telemetrySubtitle: '运营数据', gatesTitle: '球场周边入口', gatesSubtitle: '导航', essentialsTitle: '比赛日必需', essentialsSubtitle: '快速入口', signalsTitle: '运营信号', signalsSubtitle: '实时建议', messagesTitle: '上下文消息', messagesSubtitle: '自适应沟通', changeSelectionTitle: '更改选择', changeSelectionSubtitle: '导航' },
    journey: { eyebrow: '行程', title: '规划、预订并出发', subtitle: '预订流程、逐步出行引导和后端驱动的历史记录。', plannerTitle: '行程规划器', plannerSubtitle: '行程设置', stepOneTitle: '规划路线', stepOneBody: '从实时目录中选择最快路径。', stepTwoTitle: '选择出发时间', stepTwoBody: '让行程与比赛时间表匹配。', stepThreeTitle: '一次确认', stepThreeBody: '使用后端账号保持行程同步。', checkoutTitle: '预订结账', checkoutSubtitle: '预约', loadingTitle: '正在加载预订', loadingBody: '预订数据来自后端目录。', emptyTitle: '暂无预订数据', emptyBody: '登录后即可加载实时预订历史。' },
    pass: { eyebrow: '通行证', title: '数字交通通行证', subtitle: '后端签发的通行证详情与交通资格在这里显示。', accessTitle: '比赛日通行', accessSubtitle: '确认', cardTitle: '来自后端的交通权限', cardBody: '通行证页面现在等待真实后端数据，而不是本地 QR 模拟。', bulletOne: '需要安全账号', bulletTwo: '路线与资格反映实时状态', emptyTitle: '仅后端', emptyBody: '此页面不再显示占位 QR 或 demo 数据。' },
    profile: { eyebrow: '资料', title: '球迷与管理员身份', subtitle: '偏好、出行历史和后端可见的管理员信息。', profileTitle: '球迷资料', profileSubtitle: '账号', profileBody: '资料从登录的后端用户加载', preferencesLabel: '偏好', preferencesValue: '无障碍路线 · 通知开启', historyTitle: '出行历史', historySubtitle: '最近行程', loadingTitle: '正在加载资料', loadingBody: '出行历史来自后端目录。', emptyTitle: '暂无资料', emptyBody: '登录后即可显示实时出行历史。' },
    wayfinding: { eyebrow: '导航', title: '交互式出行地图', subtitle: '原生地图并通过 Google Maps 链接进行路线跳转。', mapTitle: '路线地图', mapSubtitle: '实时导航', mapBody: '应用在这里渲染原生地图，并使用 Google Maps 进行跳转。', openMaps: '在 Google Maps 打开', directions: '查看路线', filtersTitle: '路线筛选', filtersSubtitle: '搜索', allRoutes: '全部', fastest: '最快', freePass: '凭通行证免费', stepFree: '无障碍', handoffTitle: '应用切换', handoffSubtitle: '交通', nativeMapBody: '原生地图已嵌入；不会渲染本地 demo 路线数据。', fallbackBody: '如果 Android 地图瓦片不可用，外部 Google Maps 链接仍可使用。', searchVenue: '搜索场馆' },
  },
  ru: {
    catalog: { eyebrow: 'СОБЫТИЯ', title: 'Выберите событие', subtitle: 'Сначала выберите каталог, затем откройте живой хаб матча.', cardTitle: 'Каталог событий', cardSubtitle: 'Поиск и сортировка', searchPlaceholder: 'Поиск событий', countSuffix: 'каталогов доступно', sortAsc: 'A → Z', sortDesc: 'Z → A', helperTitle: 'Нужен другой язык?', helperBody: 'Приложение стартует на языке телефона, если он поддерживается; иначе — на английском. Позже язык можно сохранить в профиле.', continue: 'Продолжить', signOut: 'Выйти' },
    matches: { eyebrow: 'МАТЧИ', title: 'Выбранное событие', subtitle: 'Выберите точный матч, чтобы открыть хаб с данными о маршруте и входах.', cardTitle: 'Каталог матчей', cardSubtitle: 'Поиск и сортировка', searchPlaceholder: 'Поиск матчей', countSuffix: 'матчей доступно', sortAsc: 'A → Z', sortDesc: 'Z → A', openHub: 'Открыть хаб', backToEvents: 'Назад к событиям', back: 'Назад' },
    hub: { eyebrow: 'ХАБ МАТЧА', emptyTitle: 'Хаб мобильности матча', emptySubtitle: 'Выберите матч, чтобы загрузить маршрут, операции и входы в реальном времени.', alertTitle: 'Живое предупреждение', alertSubtitle: 'Трафик', highCongestion: 'Обнаружена высокая загрузка', retryCatalog: 'Повторить каталог', loadingTitle: 'Загрузка живого каталога', loadingSubtitle: 'Синхронизация backend', nextEvent: 'Следующее спортивное событие', kickoff: 'Старт', countdown: 'Обратный отсчёт', weather: 'Погода', gate: 'Вход', sector: 'Сектор', ticket: 'Билет', planJourney: 'Планировать маршрут', buyTicket: 'Купить билет', changeMatch: 'Сменить матч', ticketTitle: 'Покупка билета', ticketSubtitle: 'Платежи', readyToPayTitle: 'Готово к оплате', readyToPayBody: 'Здесь появится сессия оплаты, когда endpoint билетов подключится к провайдеру.', linesTitle: 'Прямые линии транспорта', linesSubtitle: 'Маршрут матча', telemetryTitle: 'Периферийная телеметрия', telemetrySubtitle: 'Операции', gatesTitle: 'Входы стадиона', gatesSubtitle: 'Навигация', essentialsTitle: 'Необходимое', essentialsSubtitle: 'Быстрый доступ', signalsTitle: 'Операционные сигналы', signalsSubtitle: 'Живые рекомендации', messagesTitle: 'Контекстные сообщения', messagesSubtitle: 'Адаптивная коммуникация', changeSelectionTitle: 'Изменить выбор', changeSelectionSubtitle: 'Навигация' },
    journey: { eyebrow: 'ПОЕЗДКА', title: 'Планируйте, бронируйте и выезжайте', subtitle: 'Флоу бронирования, пошаговая подсказка и история из backend.', plannerTitle: 'Планировщик', plannerSubtitle: 'Подготовка', stepOneTitle: 'Спланируйте маршрут', stepOneBody: 'Выберите самый быстрый путь из живого каталога.', stepTwoTitle: 'Выберите время выезда', stepTwoBody: 'Сопоставьте поездку с расписанием матча.', stepThreeTitle: 'Подтвердите один раз', stepThreeBody: 'Используйте backend-аккаунт, чтобы синхронизировать поездку.', checkoutTitle: 'Оплата брони', checkoutSubtitle: 'Бронирование', loadingTitle: 'Загрузка бронирований', loadingBody: 'Бронирования приходят из backend-каталога.', emptyTitle: 'Нет данных бронирования', emptyBody: 'Войдите, чтобы загрузить историю в реальном времени.' },
    pass: { eyebrow: 'ПРОПУСК', title: 'Цифровой транспортный пропуск', subtitle: 'Здесь отображаются данные пропуска, выданного backend.', accessTitle: 'Доступ на матч', accessSubtitle: 'Подтверждение', cardTitle: 'Доступ к транспорту из backend', cardBody: 'Экран пропуска теперь ждёт реальные данные backend, а не локальный QR-мок.', bulletOne: 'Нужен безопасный аккаунт', bulletTwo: 'Маршруты и права отражают живое состояние', emptyTitle: 'Только backend', emptyBody: 'Этот экран больше не показывает placeholder QR или demo данные.' },
    profile: { eyebrow: 'ПРОФИЛЬ', title: 'Идентичность фаната и администратора', subtitle: 'Предпочтения, история поездок и админ-доступ из backend.', profileTitle: 'Профиль фаната', profileSubtitle: 'Аккаунт', profileBody: 'Профиль загружается из авторизованного backend-пользователя', preferencesLabel: 'Настройки', preferencesValue: 'Безбарьерные маршруты · Уведомления включены', historyTitle: 'История поездок', historySubtitle: 'Недавние поездки', loadingTitle: 'Загрузка профиля', loadingBody: 'История приходит из backend-каталога.', emptyTitle: 'Нет данных профиля', emptyBody: 'Войдите, чтобы увидеть живую историю поездок.' },
    wayfinding: { eyebrow: 'НАВИГАЦИЯ', title: 'Интерактивная карта мобильности', subtitle: 'Нативная карта с ссылками Google Maps для маршрутизации.', mapTitle: 'Карта маршрута', mapSubtitle: 'Живая навигация', mapBody: 'Приложение рендерит нативную карту и использует Google Maps как handoff.', openMaps: 'Открыть в Google Maps', directions: 'Показать маршрут', filtersTitle: 'Фильтры маршрута', filtersSubtitle: 'Поиск', allRoutes: 'Все', fastest: 'Самый быстрый', freePass: 'Бесплатно с пропуском', stepFree: 'Без ступеней', handoffTitle: 'Переход приложения', handoffSubtitle: 'Транспорт', nativeMapBody: 'Нативная карта встроена; локальные demo-данные не отображаются.', fallbackBody: 'Если тайлы карты недоступны на Android, внешние ссылки Google Maps всё равно работают.', searchVenue: 'Найти место' },
  },
};

export function getScreenCopy(locale: Locale): ScreenCopy {
  return COPY[locale] ?? COPY.en;
}
