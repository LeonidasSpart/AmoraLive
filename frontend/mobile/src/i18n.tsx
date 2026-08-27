// src/i18n.tsx
//
// A small, dependency-free translation layer, matching the same approach
// used on the web app (frontend/web/lib/i18n.jsx) — same languages, same
// key structure, so a string translated once is easy to keep in sync
// across both clients. No i18n library is installed here; adding one is a
// reasonable follow-up once this is proven out, not a prerequisite for it.
//
// Known limitation: this switches displayed text only. Full RTL layout
// mirroring for Arabic (flex-direction, text alignment reversed
// app-wide) needs React Native's I18nManager.forceRTL, which requires an
// app restart to take effect and touches every screen's layout — out of
// scope for this pass. Arabic text itself still renders correctly
// right-to-left within its own text nodes.
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getItem, setItem } from "./storage";

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
  { code: "id", label: "Bahasa Indonesia" }
];

type Translations = Record<string, any>;

export const translations: Record<string, Translations> = {
  en: {
    nav: {
      home: "Home", match: "Match", live: "Live", chat: "Chat", profile: "Profile",
      discover: "Discover", safety: "Safety", studio: "Studio", withdraw: "Withdraw",
      store: "Store", wallet: "Wallet", settings: "Settings", levels: "Levels", rewards: "Rewards"
    },
    common: {
      language: "Language", save: "Save", cancel: "Cancel", loading: "Loading…", continue: "Continue",
      back: "Back", or: "OR", signIn: "Sign in", createAccount: "Create account"
    },
    auth: {
      welcomeBack: "Welcome back.", findConnection: "Find your meaningful connection.",
      emailOrUsername: "Email or username", email: "Email", password: "Password",
      username: "Username (3-20 characters)", dob: "Date of birth (YYYY-MM-DD)",
      signingIn: "Signing you in…", creatingAccount: "Creating account…",
      continueApple: "Continue with Apple", continueFacebook: "Continue with Facebook", continueGoogle: "Continue with Google",
      newToAmora: "New to Amora? Create an account", alreadyHaveAccount: "Already have an account? Sign in",
      deleteInstead: "Want to delete your account instead?",
      terms: "By continuing you accept the Terms and Privacy Policy."
    },
    home: {
      eyebrow: "MEANINGFUL CONNECTIONS",
      heroTitleLine1: "Meet someone.", heroTitleLine2: "Feel something real.",
      heroSub: "Discover live people, video matches and moments worth remembering.",
      startMatching: "Start matching", exploreLive: "Explore Live",
      yourAmoraWorld: "Your Amora world", everythingInOnePlace: "Everything in one place",
      messages: "Messages", coinsAndGifts: "Coins & Gifts", events: "Events",
      watchAndJoin: "Watch & join", premiumMoments: "Premium moments", open: "Open",
      amoraLuxury: "Amora Luxury", threeDCollection: "3D collection",
      privateCollection: "PRIVATE COLLECTION", giftsThatFeelAlive: "Gifts that feel alive.",
      luxuryText: "3D luxury gifts, live animations and premium moments."
    },
    matchesScreen: {
      errorLoadMatches: "Unable to load matches.",
      kicker: "AMORA CONNECTIONS", title: "Your Matches",
      memberFallback: "Amora member", youMatched: "You matched!", chatArrow: "Chat ›"
    },
    walletScreen: {
      errorLoadWallet: "Unable to load wallet.",
      checkoutUnavailable: "Checkout is not available right now.",
      errorStartCheckout: "Unable to start checkout.",
      noReceiptIOS: "No receipt returned from the App Store.",
      noTokenAndroid: "No purchase token returned from Google Play.",
      errorCompletePurchase: "Unable to complete purchase.",
      buyCoinsTitle: "Buy coins", purchasePrefix: "Purchase", bonusSuffix: "bonus", coinsQuestionSuffix: "coins?",
      buy: "Buy",
      kicker: "AMORA ECONOMY", title: "My Wallet",
      coinBalance: "COIN BALANCE", amoraCoins: "AMORA COINS",
      withdrawEarnings: "Withdraw earnings →",
      nativeStoreHint: "Native store purchases aren't available in this build — using secure web checkout instead.",
      coinPackages: "Coin Packages", coinsLabel: "coins", recentTransactions: "Recent Transactions",
      transactionFallback: "Transaction"
    },
    safetyScreen: {
      errorLoad: "Unable to load Safety Center.",
      kicker: "AMORA PROTECTION", title: "Safety Center",
      excellentProtection: "Excellent protection", strongProtection: "Strong protection", protectionNeedsAttention: "Protection needs attention",
      reviewSecurityDefault: "Review your account security regularly.",
      tabSecurity: "Security", tabSessions: "Sessions", tabBlocked: "Blocked", tabMuted: "Muted", tabReports: "Reports",
      securityOverview: "Security overview", emailVerifiedLabel: "Email verified:", yes: "Yes", review: "Review",
      activeSessionsLabel: "Active sessions:", privacyConfiguredLabel: "Privacy configured:",
      logOutOtherDevicesTitle: "Log out other devices?", staySignedInHere: "You will stay signed in here.",
      logOutAllOtherDevices: "Log out all other devices",
      unknownDevice: "Unknown device", unknownLocation: "Unknown location", revoke: "Revoke",
      noBlockedUsers: "No blocked users.", unblock: "Unblock",
      noMutedUsers: "No muted users.", unmute: "Unmute",
      noReportsSubmitted: "You haven't submitted any reports.",
      userFallback: "User"
    }
  },
  es: {
    nav: {
      home: "Inicio", match: "Match", live: "En vivo", chat: "Chat", profile: "Perfil",
      discover: "Descubrir", safety: "Seguridad", studio: "Estudio", withdraw: "Retirar",
      store: "Tienda", wallet: "Billetera", settings: "Ajustes", levels: "Niveles", rewards: "Recompensas"
    },
    common: {
      language: "Idioma", save: "Guardar", cancel: "Cancelar", loading: "Cargando…", continue: "Continuar",
      back: "Atrás", or: "O", signIn: "Iniciar sesión", createAccount: "Crear cuenta"
    },
    auth: {
      welcomeBack: "Bienvenido de nuevo.", findConnection: "Encuentra tu conexión especial.",
      emailOrUsername: "Correo o usuario", email: "Correo electrónico", password: "Contraseña",
      username: "Usuario (3-20 caracteres)", dob: "Fecha de nacimiento (AAAA-MM-DD)",
      signingIn: "Iniciando sesión…", creatingAccount: "Creando cuenta…",
      continueApple: "Continuar con Apple", continueFacebook: "Continuar con Facebook", continueGoogle: "Continuar con Google",
      newToAmora: "¿Nuevo en Amora? Crea una cuenta", alreadyHaveAccount: "¿Ya tienes cuenta? Inicia sesión",
      deleteInstead: "¿Prefieres eliminar tu cuenta?",
      terms: "Al continuar aceptas los Términos y la Política de Privacidad."
    },
    home: {
      eyebrow: "CONEXIONES CON SIGNIFICADO",
      heroTitleLine1: "Conoce a alguien.", heroTitleLine2: "Siente algo real.",
      heroSub: "Descubre personas en vivo, videollamadas de match y momentos para recordar.",
      startMatching: "Empezar a hacer match", exploreLive: "Explorar en vivo",
      yourAmoraWorld: "Tu mundo Amora", everythingInOnePlace: "Todo en un solo lugar",
      messages: "Mensajes", coinsAndGifts: "Monedas y regalos", events: "Eventos",
      watchAndJoin: "Mira y únete", premiumMoments: "Momentos premium", open: "Abrir",
      amoraLuxury: "Amora Lujo", threeDCollection: "Colección 3D",
      privateCollection: "COLECCIÓN PRIVADA", giftsThatFeelAlive: "Regalos que cobran vida.",
      luxuryText: "Regalos de lujo en 3D, animaciones en vivo y momentos premium."
    },
    matchesScreen: {
      errorLoadMatches: "No se pudieron cargar las coincidencias.",
      kicker: "CONEXIONES AMORA", title: "Tus coincidencias",
      memberFallback: "Miembro de Amora", youMatched: "¡Hiciste match!", chatArrow: "Chat ›"
    },
    walletScreen: {
      errorLoadWallet: "No se pudo cargar la billetera.",
      checkoutUnavailable: "El pago no está disponible en este momento.",
      errorStartCheckout: "No se pudo iniciar el pago.",
      noReceiptIOS: "No se recibió el recibo de la App Store.",
      noTokenAndroid: "No se recibió el token de compra de Google Play.",
      errorCompletePurchase: "No se pudo completar la compra.",
      buyCoinsTitle: "Comprar monedas", purchasePrefix: "¿Comprar", bonusSuffix: "de bono", coinsQuestionSuffix: "monedas?",
      buy: "Comprar",
      kicker: "ECONOMÍA AMORA", title: "Mi billetera",
      coinBalance: "SALDO DE MONEDAS", amoraCoins: "MONEDAS AMORA",
      withdrawEarnings: "Retirar ganancias →",
      nativeStoreHint: "Las compras nativas no están disponibles en esta versión; se usará el pago web seguro en su lugar.",
      coinPackages: "Paquetes de monedas", coinsLabel: "monedas", recentTransactions: "Transacciones recientes",
      transactionFallback: "Transacción"
    },
    safetyScreen: {
      errorLoad: "No se pudo cargar el Centro de seguridad.",
      kicker: "PROTECCIÓN AMORA", title: "Centro de seguridad",
      excellentProtection: "Protección excelente", strongProtection: "Protección sólida", protectionNeedsAttention: "La protección necesita atención",
      reviewSecurityDefault: "Revisa la seguridad de tu cuenta con regularidad.",
      tabSecurity: "Seguridad", tabSessions: "Sesiones", tabBlocked: "Bloqueados", tabMuted: "Silenciados", tabReports: "Reportes",
      securityOverview: "Resumen de seguridad", emailVerifiedLabel: "Correo verificado:", yes: "Sí", review: "Revisar",
      activeSessionsLabel: "Sesiones activas:", privacyConfiguredLabel: "Privacidad configurada:",
      logOutOtherDevicesTitle: "¿Cerrar sesión en otros dispositivos?", staySignedInHere: "Seguirás con la sesión iniciada aquí.",
      logOutAllOtherDevices: "Cerrar sesión en todos los demás dispositivos",
      unknownDevice: "Dispositivo desconocido", unknownLocation: "Ubicación desconocida", revoke: "Revocar",
      noBlockedUsers: "No hay usuarios bloqueados.", unblock: "Desbloquear",
      noMutedUsers: "No hay usuarios silenciados.", unmute: "Quitar silencio",
      noReportsSubmitted: "No has enviado ningún reporte.",
      userFallback: "Usuario"
    }
  },
  pt: {
    nav: {
      home: "Início", match: "Match", live: "Ao vivo", chat: "Chat", profile: "Perfil",
      discover: "Descobrir", safety: "Segurança", studio: "Estúdio", withdraw: "Sacar",
      store: "Loja", wallet: "Carteira", settings: "Configurações", levels: "Níveis", rewards: "Recompensas"
    },
    common: {
      language: "Idioma", save: "Salvar", cancel: "Cancelar", loading: "Carregando…", continue: "Continuar",
      back: "Voltar", or: "OU", signIn: "Entrar", createAccount: "Criar conta"
    },
    auth: {
      welcomeBack: "Bem-vindo de volta.", findConnection: "Encontre sua conexão verdadeira.",
      emailOrUsername: "E-mail ou usuário", email: "E-mail", password: "Senha",
      username: "Usuário (3-20 caracteres)", dob: "Data de nascimento (AAAA-MM-DD)",
      signingIn: "Entrando…", creatingAccount: "Criando conta…",
      continueApple: "Continuar com Apple", continueFacebook: "Continuar com Facebook", continueGoogle: "Continuar com Google",
      newToAmora: "Novo no Amora? Crie uma conta", alreadyHaveAccount: "Já tem conta? Entrar",
      deleteInstead: "Prefere excluir sua conta?",
      terms: "Ao continuar você aceita os Termos e a Política de Privacidade."
    },
    home: {
      eyebrow: "CONEXÕES VERDADEIRAS",
      heroTitleLine1: "Conheça alguém.", heroTitleLine2: "Sinta algo real.",
      heroSub: "Descubra pessoas ao vivo, matches em vídeo e momentos para lembrar.",
      startMatching: "Começar a combinar", exploreLive: "Explorar ao vivo",
      yourAmoraWorld: "Seu mundo Amora", everythingInOnePlace: "Tudo em um só lugar",
      messages: "Mensagens", coinsAndGifts: "Moedas e presentes", events: "Eventos",
      watchAndJoin: "Assista e participe", premiumMoments: "Momentos premium", open: "Abrir",
      amoraLuxury: "Amora Luxo", threeDCollection: "Coleção 3D",
      privateCollection: "COLEÇÃO PRIVADA", giftsThatFeelAlive: "Presentes que ganham vida.",
      luxuryText: "Presentes de luxo em 3D, animações ao vivo e momentos premium."
    },
    matchesScreen: {
      errorLoadMatches: "Não foi possível carregar as combinações.",
      kicker: "CONEXÕES AMORA", title: "Suas combinações",
      memberFallback: "Membro Amora", youMatched: "Vocês combinaram!", chatArrow: "Chat ›"
    },
    walletScreen: {
      errorLoadWallet: "Não foi possível carregar a carteira.",
      checkoutUnavailable: "O checkout não está disponível no momento.",
      errorStartCheckout: "Não foi possível iniciar o checkout.",
      noReceiptIOS: "Nenhum recibo retornado pela App Store.",
      noTokenAndroid: "Nenhum token de compra retornado pelo Google Play.",
      errorCompletePurchase: "Não foi possível concluir a compra.",
      buyCoinsTitle: "Comprar moedas", purchasePrefix: "Comprar", bonusSuffix: "de bônus", coinsQuestionSuffix: "moedas?",
      buy: "Comprar",
      kicker: "ECONOMIA AMORA", title: "Minha carteira",
      coinBalance: "SALDO DE MOEDAS", amoraCoins: "MOEDAS AMORA",
      withdrawEarnings: "Sacar ganhos →",
      nativeStoreHint: "Compras nativas não estão disponíveis nesta versão — usando checkout web seguro no lugar.",
      coinPackages: "Pacotes de moedas", coinsLabel: "moedas", recentTransactions: "Transações recentes",
      transactionFallback: "Transação"
    },
    safetyScreen: {
      errorLoad: "Não foi possível carregar a Central de Segurança.",
      kicker: "PROTEÇÃO AMORA", title: "Central de Segurança",
      excellentProtection: "Proteção excelente", strongProtection: "Proteção forte", protectionNeedsAttention: "A proteção precisa de atenção",
      reviewSecurityDefault: "Revise a segurança da sua conta regularmente.",
      tabSecurity: "Segurança", tabSessions: "Sessões", tabBlocked: "Bloqueados", tabMuted: "Silenciados", tabReports: "Relatórios",
      securityOverview: "Visão geral de segurança", emailVerifiedLabel: "E-mail verificado:", yes: "Sim", review: "Revisar",
      activeSessionsLabel: "Sessões ativas:", privacyConfiguredLabel: "Privacidade configurada:",
      logOutOtherDevicesTitle: "Encerrar sessão em outros dispositivos?", staySignedInHere: "Você continuará conectado aqui.",
      logOutAllOtherDevices: "Encerrar sessão em todos os outros dispositivos",
      unknownDevice: "Dispositivo desconhecido", unknownLocation: "Localização desconhecida", revoke: "Revogar",
      noBlockedUsers: "Nenhum usuário bloqueado.", unblock: "Desbloquear",
      noMutedUsers: "Nenhum usuário silenciado.", unmute: "Remover silêncio",
      noReportsSubmitted: "Você não enviou nenhum relatório.",
      userFallback: "Usuário"
    }
  },
  fr: {
    nav: {
      home: "Accueil", match: "Match", live: "Direct", chat: "Chat", profile: "Profil",
      discover: "Découvrir", safety: "Sécurité", studio: "Studio", withdraw: "Retirer",
      store: "Boutique", wallet: "Portefeuille", settings: "Réglages", levels: "Niveaux", rewards: "Récompenses"
    },
    common: {
      language: "Langue", save: "Enregistrer", cancel: "Annuler", loading: "Chargement…", continue: "Continuer",
      back: "Retour", or: "OU", signIn: "Se connecter", createAccount: "Créer un compte"
    },
    auth: {
      welcomeBack: "Content de vous revoir.", findConnection: "Trouvez votre connexion sincère.",
      emailOrUsername: "E-mail ou nom d'utilisateur", email: "E-mail", password: "Mot de passe",
      username: "Nom d'utilisateur (3-20 caractères)", dob: "Date de naissance (AAAA-MM-JJ)",
      signingIn: "Connexion en cours…", creatingAccount: "Création du compte…",
      continueApple: "Continuer avec Apple", continueFacebook: "Continuer avec Facebook", continueGoogle: "Continuer avec Google",
      newToAmora: "Nouveau sur Amora ? Créer un compte", alreadyHaveAccount: "Déjà un compte ? Se connecter",
      deleteInstead: "Vous préférez supprimer votre compte ?",
      terms: "En continuant, vous acceptez les Conditions et la Politique de confidentialité."
    },
    home: {
      eyebrow: "CONNEXIONS SINCÈRES",
      heroTitleLine1: "Rencontrez quelqu'un.", heroTitleLine2: "Ressentez quelque chose de vrai.",
      heroSub: "Découvrez des personnes en direct, des matchs vidéo et des moments à retenir.",
      startMatching: "Commencer à matcher", exploreLive: "Explorer le direct",
      yourAmoraWorld: "Votre monde Amora", everythingInOnePlace: "Tout au même endroit",
      messages: "Messages", coinsAndGifts: "Pièces et cadeaux", events: "Événements",
      watchAndJoin: "Regarder et rejoindre", premiumMoments: "Moments premium", open: "Ouvrir",
      amoraLuxury: "Amora Luxe", threeDCollection: "Collection 3D",
      privateCollection: "COLLECTION PRIVÉE", giftsThatFeelAlive: "Des cadeaux qui prennent vie.",
      luxuryText: "Cadeaux de luxe en 3D, animations en direct et moments premium."
    },
    matchesScreen: {
      errorLoadMatches: "Impossible de charger les matchs.",
      kicker: "CONNEXIONS AMORA", title: "Vos matchs",
      memberFallback: "Membre Amora", youMatched: "C'est un match !", chatArrow: "Chat ›"
    },
    walletScreen: {
      errorLoadWallet: "Impossible de charger le portefeuille.",
      checkoutUnavailable: "Le paiement n'est pas disponible pour le moment.",
      errorStartCheckout: "Impossible de démarrer le paiement.",
      noReceiptIOS: "Aucun reçu renvoyé par l'App Store.",
      noTokenAndroid: "Aucun jeton d'achat renvoyé par Google Play.",
      errorCompletePurchase: "Impossible de finaliser l'achat.",
      buyCoinsTitle: "Acheter des pièces", purchasePrefix: "Acheter", bonusSuffix: "bonus", coinsQuestionSuffix: "pièces ?",
      buy: "Acheter",
      kicker: "ÉCONOMIE AMORA", title: "Mon portefeuille",
      coinBalance: "SOLDE DE PIÈCES", amoraCoins: "PIÈCES AMORA",
      withdrawEarnings: "Retirer les gains →",
      nativeStoreHint: "Les achats natifs ne sont pas disponibles dans cette version — utilisation du paiement web sécurisé à la place.",
      coinPackages: "Offres de pièces", coinsLabel: "pièces", recentTransactions: "Transactions récentes",
      transactionFallback: "Transaction"
    },
    safetyScreen: {
      errorLoad: "Impossible de charger le Centre de sécurité.",
      kicker: "PROTECTION AMORA", title: "Centre de sécurité",
      excellentProtection: "Protection excellente", strongProtection: "Protection solide", protectionNeedsAttention: "La protection nécessite votre attention",
      reviewSecurityDefault: "Vérifiez régulièrement la sécurité de votre compte.",
      tabSecurity: "Sécurité", tabSessions: "Sessions", tabBlocked: "Bloqués", tabMuted: "Masqués", tabReports: "Signalements",
      securityOverview: "Aperçu de la sécurité", emailVerifiedLabel: "E-mail vérifié :", yes: "Oui", review: "Vérifier",
      activeSessionsLabel: "Sessions actives :", privacyConfiguredLabel: "Confidentialité configurée :",
      logOutOtherDevicesTitle: "Déconnecter les autres appareils ?", staySignedInHere: "Vous resterez connecté ici.",
      logOutAllOtherDevices: "Déconnecter tous les autres appareils",
      unknownDevice: "Appareil inconnu", unknownLocation: "Lieu inconnu", revoke: "Révoquer",
      noBlockedUsers: "Aucun utilisateur bloqué.", unblock: "Débloquer",
      noMutedUsers: "Aucun utilisateur masqué.", unmute: "Réactiver",
      noReportsSubmitted: "Vous n'avez soumis aucun signalement.",
      userFallback: "Utilisateur"
    }
  },
  de: {
    nav: {
      home: "Start", match: "Match", live: "Live", chat: "Chat", profile: "Profil",
      discover: "Entdecken", safety: "Sicherheit", studio: "Studio", withdraw: "Auszahlen",
      store: "Shop", wallet: "Wallet", settings: "Einstellungen", levels: "Level", rewards: "Belohnungen"
    },
    common: {
      language: "Sprache", save: "Speichern", cancel: "Abbrechen", loading: "Wird geladen…", continue: "Weiter",
      back: "Zurück", or: "ODER", signIn: "Anmelden", createAccount: "Konto erstellen"
    },
    auth: {
      welcomeBack: "Willkommen zurück.", findConnection: "Finde deine echte Verbindung.",
      emailOrUsername: "E-Mail oder Benutzername", email: "E-Mail", password: "Passwort",
      username: "Benutzername (3-20 Zeichen)", dob: "Geburtsdatum (JJJJ-MM-TT)",
      signingIn: "Anmeldung läuft…", creatingAccount: "Konto wird erstellt…",
      continueApple: "Weiter mit Apple", continueFacebook: "Weiter mit Facebook", continueGoogle: "Weiter mit Google",
      newToAmora: "Neu bei Amora? Konto erstellen", alreadyHaveAccount: "Schon ein Konto? Anmelden",
      deleteInstead: "Möchtest du dein Konto stattdessen löschen?",
      terms: "Mit der Fortsetzung akzeptierst du die AGB und die Datenschutzerklärung."
    },
    home: {
      eyebrow: "ECHTE VERBINDUNGEN",
      heroTitleLine1: "Lerne jemanden kennen.", heroTitleLine2: "Fühle etwas Echtes.",
      heroSub: "Entdecke Live-Menschen, Video-Matches und unvergessliche Momente.",
      startMatching: "Matching starten", exploreLive: "Live entdecken",
      yourAmoraWorld: "Deine Amora-Welt", everythingInOnePlace: "Alles an einem Ort",
      messages: "Nachrichten", coinsAndGifts: "Coins & Geschenke", events: "Events",
      watchAndJoin: "Ansehen & mitmachen", premiumMoments: "Premium-Momente", open: "Öffnen",
      amoraLuxury: "Amora Luxus", threeDCollection: "3D-Kollektion",
      privateCollection: "PRIVATE KOLLEKTION", giftsThatFeelAlive: "Geschenke, die lebendig wirken.",
      luxuryText: "3D-Luxusgeschenke, Live-Animationen und Premium-Momente."
    },
    matchesScreen: {
      errorLoadMatches: "Matches konnten nicht geladen werden.",
      kicker: "AMORA VERBINDUNGEN", title: "Deine Matches",
      memberFallback: "Amora-Mitglied", youMatched: "Ihr habt ein Match!", chatArrow: "Chat ›"
    },
    walletScreen: {
      errorLoadWallet: "Wallet konnte nicht geladen werden.",
      checkoutUnavailable: "Der Checkout ist gerade nicht verfügbar.",
      errorStartCheckout: "Checkout konnte nicht gestartet werden.",
      noReceiptIOS: "Kein Beleg vom App Store erhalten.",
      noTokenAndroid: "Kein Kauf-Token von Google Play erhalten.",
      errorCompletePurchase: "Kauf konnte nicht abgeschlossen werden.",
      buyCoinsTitle: "Coins kaufen", purchasePrefix: "Kaufen", bonusSuffix: "Bonus", coinsQuestionSuffix: "Coins?",
      buy: "Kaufen",
      kicker: "AMORA WIRTSCHAFT", title: "Meine Wallet",
      coinBalance: "COIN-GUTHABEN", amoraCoins: "AMORA COINS",
      withdrawEarnings: "Einnahmen auszahlen →",
      nativeStoreHint: "Native In-App-Käufe sind in diesem Build nicht verfügbar — es wird stattdessen der sichere Web-Checkout verwendet.",
      coinPackages: "Coin-Pakete", coinsLabel: "Coins", recentTransactions: "Letzte Transaktionen",
      transactionFallback: "Transaktion"
    },
    safetyScreen: {
      errorLoad: "Sicherheitscenter konnte nicht geladen werden.",
      kicker: "AMORA SCHUTZ", title: "Sicherheitscenter",
      excellentProtection: "Ausgezeichneter Schutz", strongProtection: "Starker Schutz", protectionNeedsAttention: "Schutz benötigt Aufmerksamkeit",
      reviewSecurityDefault: "Überprüfe die Sicherheit deines Kontos regelmäßig.",
      tabSecurity: "Sicherheit", tabSessions: "Sitzungen", tabBlocked: "Blockiert", tabMuted: "Stummgeschaltet", tabReports: "Meldungen",
      securityOverview: "Sicherheitsübersicht", emailVerifiedLabel: "E-Mail verifiziert:", yes: "Ja", review: "Überprüfen",
      activeSessionsLabel: "Aktive Sitzungen:", privacyConfiguredLabel: "Datenschutz konfiguriert:",
      logOutOtherDevicesTitle: "Andere Geräte abmelden?", staySignedInHere: "Du bleibst hier angemeldet.",
      logOutAllOtherDevices: "Auf allen anderen Geräten abmelden",
      unknownDevice: "Unbekanntes Gerät", unknownLocation: "Unbekannter Standort", revoke: "Widerrufen",
      noBlockedUsers: "Keine blockierten Nutzer.", unblock: "Blockierung aufheben",
      noMutedUsers: "Keine stummgeschalteten Nutzer.", unmute: "Stummschaltung aufheben",
      noReportsSubmitted: "Du hast noch keine Meldungen eingereicht.",
      userFallback: "Nutzer"
    }
  },
  ar: {
    nav: {
      home: "الرئيسية", match: "تطابق", live: "مباشر", chat: "الدردشة", profile: "الملف الشخصي",
      discover: "استكشف", safety: "الأمان", studio: "الاستوديو", withdraw: "سحب",
      store: "المتجر", wallet: "المحفظة", settings: "الإعدادات", levels: "المستويات", rewards: "المكافآت"
    },
    common: {
      language: "اللغة", save: "حفظ", cancel: "إلغاء", loading: "جارٍ التحميل…", continue: "متابعة",
      back: "رجوع", or: "أو", signIn: "تسجيل الدخول", createAccount: "إنشاء حساب"
    },
    auth: {
      welcomeBack: "مرحبًا بعودتك.", findConnection: "ابحث عن علاقتك الحقيقية.",
      emailOrUsername: "البريد الإلكتروني أو اسم المستخدم", email: "البريد الإلكتروني", password: "كلمة المرور",
      username: "اسم المستخدم (3-20 حرفًا)", dob: "تاريخ الميلاد (YYYY-MM-DD)",
      signingIn: "جارٍ تسجيل الدخول…", creatingAccount: "جارٍ إنشاء الحساب…",
      continueApple: "المتابعة عبر Apple", continueFacebook: "المتابعة عبر Facebook", continueGoogle: "المتابعة عبر Google",
      newToAmora: "جديد على أمورا؟ أنشئ حسابًا", alreadyHaveAccount: "لديك حساب بالفعل؟ سجّل الدخول",
      deleteInstead: "هل تفضل حذف حسابك؟",
      terms: "بالمتابعة، فإنك توافق على الشروط وسياسة الخصوصية."
    },
    home: {
      eyebrow: "علاقات ذات معنى",
      heroTitleLine1: "قابل شخصًا ما.", heroTitleLine2: "اشعر بشيء حقيقي.",
      heroSub: "اكتشف أشخاصًا مباشرين، وتطابقات فيديو، ولحظات تستحق التذكر.",
      startMatching: "ابدأ التطابق", exploreLive: "استكشف المباشر",
      yourAmoraWorld: "عالمك في أمورا", everythingInOnePlace: "كل شيء في مكان واحد",
      messages: "الرسائل", coinsAndGifts: "العملات والهدايا", events: "الفعاليات",
      watchAndJoin: "شاهد وانضم", premiumMoments: "لحظات مميزة", open: "فتح",
      amoraLuxury: "أمورا الفاخرة", threeDCollection: "مجموعة ثلاثية الأبعاد",
      privateCollection: "مجموعة خاصة", giftsThatFeelAlive: "هدايا تنبض بالحياة.",
      luxuryText: "هدايا فاخرة ثلاثية الأبعاد، ورسوم متحركة مباشرة، ولحظات مميزة."
    },
    matchesScreen: {
      errorLoadMatches: "تعذر تحميل التطابقات.",
      kicker: "تواصل أمورا", title: "تطابقاتك",
      memberFallback: "عضو أمورا", youMatched: "لقد تطابقتما!", chatArrow: "دردشة ›"
    },
    walletScreen: {
      errorLoadWallet: "تعذر تحميل المحفظة.",
      checkoutUnavailable: "الدفع غير متاح الآن.",
      errorStartCheckout: "تعذر بدء عملية الدفع.",
      noReceiptIOS: "لم يتم إرجاع إيصال من متجر آبل.",
      noTokenAndroid: "لم يتم إرجاع رمز الشراء من متجر جوجل.",
      errorCompletePurchase: "تعذر إتمام عملية الشراء.",
      buyCoinsTitle: "شراء عملات", purchasePrefix: "شراء", bonusSuffix: "إضافية", coinsQuestionSuffix: "عملة؟",
      buy: "شراء",
      kicker: "اقتصاد أمورا", title: "محفظتي",
      coinBalance: "رصيد العملات", amoraCoins: "عملات أمورا",
      withdrawEarnings: "سحب الأرباح ←",
      nativeStoreHint: "عمليات الشراء داخل التطبيق غير متاحة في هذا الإصدار — سيتم استخدام الدفع عبر الويب الآمن بدلاً من ذلك.",
      coinPackages: "باقات العملات", coinsLabel: "عملة", recentTransactions: "المعاملات الأخيرة",
      transactionFallback: "معاملة"
    },
    safetyScreen: {
      errorLoad: "تعذر تحميل مركز الأمان.",
      kicker: "حماية أمورا", title: "مركز الأمان",
      excellentProtection: "حماية ممتازة", strongProtection: "حماية قوية", protectionNeedsAttention: "الحماية تحتاج إلى انتباه",
      reviewSecurityDefault: "راجع أمان حسابك بانتظام.",
      tabSecurity: "الأمان", tabSessions: "الجلسات", tabBlocked: "المحظورون", tabMuted: "المكتومون", tabReports: "البلاغات",
      securityOverview: "نظرة عامة على الأمان", emailVerifiedLabel: "البريد الإلكتروني موثّق:", yes: "نعم", review: "مراجعة",
      activeSessionsLabel: "الجلسات النشطة:", privacyConfiguredLabel: "الخصوصية مُهيأة:",
      logOutOtherDevicesTitle: "تسجيل الخروج من الأجهزة الأخرى؟", staySignedInHere: "ستبقى مسجلاً هنا.",
      logOutAllOtherDevices: "تسجيل الخروج من جميع الأجهزة الأخرى",
      unknownDevice: "جهاز غير معروف", unknownLocation: "موقع غير معروف", revoke: "إلغاء",
      noBlockedUsers: "لا يوجد مستخدمون محظورون.", unblock: "إلغاء الحظر",
      noMutedUsers: "لا يوجد مستخدمون مكتومون.", unmute: "إلغاء الكتم",
      noReportsSubmitted: "لم تقدم أي بلاغات.",
      userFallback: "مستخدم"
    }
  },
  hi: {
    nav: {
      home: "होम", match: "मैच", live: "लाइव", chat: "चैट", profile: "प्रोफ़ाइल",
      discover: "खोजें", safety: "सुरक्षा", studio: "स्टूडियो", withdraw: "निकासी",
      store: "स्टोर", wallet: "वॉलेट", settings: "सेटिंग्स", levels: "लेवल", rewards: "रिवॉर्ड्स"
    },
    common: {
      language: "भाषा", save: "सहेजें", cancel: "रद्द करें", loading: "लोड हो रहा है…", continue: "जारी रखें",
      back: "वापस", or: "या", signIn: "साइन इन करें", createAccount: "खाता बनाएं"
    },
    auth: {
      welcomeBack: "वापसी पर स्वागत है।", findConnection: "अपना सच्चा रिश्ता खोजें।",
      emailOrUsername: "ईमेल या यूज़रनेम", email: "ईमेल", password: "पासवर्ड",
      username: "यूज़रनेम (3-20 अक्षर)", dob: "जन्म तिथि (YYYY-MM-DD)",
      signingIn: "साइन इन हो रहा है…", creatingAccount: "खाता बनाया जा रहा है…",
      continueApple: "Apple से जारी रखें", continueFacebook: "Facebook से जारी रखें", continueGoogle: "Google से जारी रखें",
      newToAmora: "Amora पर नए हैं? खाता बनाएं", alreadyHaveAccount: "पहले से खाता है? साइन इन करें",
      deleteInstead: "क्या आप इसके बजाय अपना खाता हटाना चाहते हैं?",
      terms: "जारी रखकर, आप शर्तों और गोपनीयता नीति से सहमत होते हैं।"
    },
    home: {
      eyebrow: "सार्थक रिश्ते",
      heroTitleLine1: "किसी से मिलें।", heroTitleLine2: "कुछ असली महसूस करें।",
      heroSub: "लाइव लोगों, वीडियो मैच और यादगार पलों को खोजें।",
      startMatching: "मैचिंग शुरू करें", exploreLive: "लाइव देखें",
      yourAmoraWorld: "आपकी अमोरा दुनिया", everythingInOnePlace: "सब कुछ एक ही जगह",
      messages: "संदेश", coinsAndGifts: "कॉइन और गिफ्ट", events: "इवेंट्स",
      watchAndJoin: "देखें और जुड़ें", premiumMoments: "प्रीमियम पल", open: "खोलें",
      amoraLuxury: "अमोरा लक्ज़री", threeDCollection: "3D संग्रह",
      privateCollection: "प्राइवेट कलेक्शन", giftsThatFeelAlive: "गिफ्ट जो जीवंत लगें।",
      luxuryText: "3D लक्ज़री गिफ्ट, लाइव एनिमेशन और प्रीमियम पल।"
    },
    matchesScreen: {
      errorLoadMatches: "मैच लोड नहीं हो सके।",
      kicker: "अमोरा कनेक्शन्स", title: "आपके मैच",
      memberFallback: "अमोरा सदस्य", youMatched: "आपका मैच हो गया!", chatArrow: "चैट ›"
    },
    walletScreen: {
      errorLoadWallet: "वॉलेट लोड नहीं हो सका।",
      checkoutUnavailable: "चेकआउट अभी उपलब्ध नहीं है।",
      errorStartCheckout: "चेकआउट शुरू नहीं हो सका।",
      noReceiptIOS: "ऐप स्टोर से कोई रसीद नहीं मिली।",
      noTokenAndroid: "गूगल प्ले से कोई खरीद टोकन नहीं मिला।",
      errorCompletePurchase: "खरीद पूरी नहीं हो सकी।",
      buyCoinsTitle: "कॉइन खरीदें", purchasePrefix: "खरीदें", bonusSuffix: "बोनस", coinsQuestionSuffix: "कॉइन?",
      buy: "खरीदें",
      kicker: "अमोरा इकॉनमी", title: "मेरा वॉलेट",
      coinBalance: "कॉइन बैलेंस", amoraCoins: "अमोरा कॉइन",
      withdrawEarnings: "कमाई निकालें →",
      nativeStoreHint: "इस बिल्ड में नेटिव स्टोर खरीद उपलब्ध नहीं है — इसके बजाय सुरक्षित वेब चेकआउट का उपयोग किया जा रहा है।",
      coinPackages: "कॉइन पैकेज", coinsLabel: "कॉइन", recentTransactions: "हाल के लेनदेन",
      transactionFallback: "लेनदेन"
    },
    safetyScreen: {
      errorLoad: "सुरक्षा केंद्र लोड नहीं हो सका।",
      kicker: "अमोरा सुरक्षा", title: "सुरक्षा केंद्र",
      excellentProtection: "उत्कृष्ट सुरक्षा", strongProtection: "मजबूत सुरक्षा", protectionNeedsAttention: "सुरक्षा पर ध्यान देने की आवश्यकता है",
      reviewSecurityDefault: "अपने खाते की सुरक्षा नियमित रूप से जांचें।",
      tabSecurity: "सुरक्षा", tabSessions: "सत्र", tabBlocked: "ब्लॉक किए गए", tabMuted: "म्यूट किए गए", tabReports: "रिपोर्ट्स",
      securityOverview: "सुरक्षा अवलोकन", emailVerifiedLabel: "ईमेल सत्यापित:", yes: "हां", review: "जांचें",
      activeSessionsLabel: "सक्रिय सत्र:", privacyConfiguredLabel: "गोपनीयता कॉन्फ़िगर की गई:",
      logOutOtherDevicesTitle: "अन्य डिवाइस से लॉग आउट करें?", staySignedInHere: "आप यहां साइन इन रहेंगे।",
      logOutAllOtherDevices: "सभी अन्य डिवाइस से लॉग आउट करें",
      unknownDevice: "अज्ञात डिवाइस", unknownLocation: "अज्ञात स्थान", revoke: "रद्द करें",
      noBlockedUsers: "कोई ब्लॉक किया गया उपयोगकर्ता नहीं है।", unblock: "अनब्लॉक करें",
      noMutedUsers: "कोई म्यूट किया गया उपयोगकर्ता नहीं है।", unmute: "अनम्यूट करें",
      noReportsSubmitted: "आपने कोई रिपोर्ट सबमिट नहीं की है।",
      userFallback: "उपयोगकर्ता"
    }
  },
  id: {
    nav: {
      home: "Beranda", match: "Cocokkan", live: "Live", chat: "Obrolan", profile: "Profil",
      discover: "Jelajahi", safety: "Keamanan", studio: "Studio", withdraw: "Tarik Dana",
      store: "Toko", wallet: "Dompet", settings: "Pengaturan", levels: "Level", rewards: "Hadiah"
    },
    common: {
      language: "Bahasa", save: "Simpan", cancel: "Batal", loading: "Memuat…", continue: "Lanjutkan",
      back: "Kembali", or: "ATAU", signIn: "Masuk", createAccount: "Buat akun"
    },
    auth: {
      welcomeBack: "Selamat datang kembali.", findConnection: "Temukan koneksi bermakna Anda.",
      emailOrUsername: "Email atau nama pengguna", email: "Email", password: "Kata sandi",
      username: "Nama pengguna (3-20 karakter)", dob: "Tanggal lahir (YYYY-MM-DD)",
      signingIn: "Sedang masuk…", creatingAccount: "Membuat akun…",
      continueApple: "Lanjutkan dengan Apple", continueFacebook: "Lanjutkan dengan Facebook", continueGoogle: "Lanjutkan dengan Google",
      newToAmora: "Baru di Amora? Buat akun", alreadyHaveAccount: "Sudah punya akun? Masuk",
      deleteInstead: "Ingin menghapus akun Anda sebagai gantinya?",
      terms: "Dengan melanjutkan Anda menyetujui Ketentuan dan Kebijakan Privasi."
    },
    home: {
      eyebrow: "KONEKSI BERMAKNA",
      heroTitleLine1: "Temui seseorang.", heroTitleLine2: "Rasakan sesuatu yang nyata.",
      heroSub: "Temukan orang secara langsung, video match, dan momen yang layak dikenang.",
      startMatching: "Mulai mencocokkan", exploreLive: "Jelajahi Live",
      yourAmoraWorld: "Dunia Amora Anda", everythingInOnePlace: "Semua di satu tempat",
      messages: "Pesan", coinsAndGifts: "Koin & Hadiah", events: "Acara",
      watchAndJoin: "Tonton & gabung", premiumMoments: "Momen premium", open: "Buka",
      amoraLuxury: "Amora Mewah", threeDCollection: "Koleksi 3D",
      privateCollection: "KOLEKSI PRIBADI", giftsThatFeelAlive: "Hadiah yang terasa hidup.",
      luxuryText: "Hadiah mewah 3D, animasi langsung, dan momen premium."
    },
    matchesScreen: {
      errorLoadMatches: "Tidak dapat memuat kecocokan.",
      kicker: "KONEKSI AMORA", title: "Kecocokan Anda",
      memberFallback: "Anggota Amora", youMatched: "Anda cocok!", chatArrow: "Obrolan ›"
    },
    walletScreen: {
      errorLoadWallet: "Tidak dapat memuat dompet.",
      checkoutUnavailable: "Checkout tidak tersedia saat ini.",
      errorStartCheckout: "Tidak dapat memulai checkout.",
      noReceiptIOS: "Tidak ada struk yang dikembalikan dari App Store.",
      noTokenAndroid: "Tidak ada token pembelian yang dikembalikan dari Google Play.",
      errorCompletePurchase: "Tidak dapat menyelesaikan pembelian.",
      buyCoinsTitle: "Beli koin", purchasePrefix: "Beli", bonusSuffix: "bonus", coinsQuestionSuffix: "koin?",
      buy: "Beli",
      kicker: "EKONOMI AMORA", title: "Dompet Saya",
      coinBalance: "SALDO KOIN", amoraCoins: "KOIN AMORA",
      withdrawEarnings: "Tarik penghasilan →",
      nativeStoreHint: "Pembelian toko native tidak tersedia di build ini — menggunakan checkout web yang aman sebagai gantinya.",
      coinPackages: "Paket Koin", coinsLabel: "koin", recentTransactions: "Transaksi Terbaru",
      transactionFallback: "Transaksi"
    },
    safetyScreen: {
      errorLoad: "Tidak dapat memuat Pusat Keamanan.",
      kicker: "PERLINDUNGAN AMORA", title: "Pusat Keamanan",
      excellentProtection: "Perlindungan sangat baik", strongProtection: "Perlindungan kuat", protectionNeedsAttention: "Perlindungan perlu diperhatikan",
      reviewSecurityDefault: "Tinjau keamanan akun Anda secara berkala.",
      tabSecurity: "Keamanan", tabSessions: "Sesi", tabBlocked: "Diblokir", tabMuted: "Dibisukan", tabReports: "Laporan",
      securityOverview: "Ringkasan keamanan", emailVerifiedLabel: "Email terverifikasi:", yes: "Ya", review: "Tinjau",
      activeSessionsLabel: "Sesi aktif:", privacyConfiguredLabel: "Privasi terkonfigurasi:",
      logOutOtherDevicesTitle: "Keluar dari perangkat lain?", staySignedInHere: "Anda akan tetap masuk di sini.",
      logOutAllOtherDevices: "Keluar dari semua perangkat lain",
      unknownDevice: "Perangkat tidak dikenal", unknownLocation: "Lokasi tidak dikenal", revoke: "Cabut",
      noBlockedUsers: "Tidak ada pengguna yang diblokir.", unblock: "Buka blokir",
      noMutedUsers: "Tidak ada pengguna yang dibisukan.", unmute: "Batalkan bisukan",
      noReportsSubmitted: "Anda belum mengirimkan laporan apa pun.",
      userFallback: "Pengguna"
    }
  }
};

function getByPath(obj: any, path: string) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

type LanguageContextValue = {
  lang: string;
  setLang: (next: string) => void;
  t: (key: string) => string;
  languages: typeof LANGUAGES;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const LANG_STORAGE_KEY = "amora_lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    getItem(LANG_STORAGE_KEY).then((stored) => {
      if (stored && translations[stored]) setLangState(stored);
    }).catch(() => {});
  }, []);

  const setLang = (next: string) => {
    if (!translations[next]) return;
    setLangState(next);
    setItem(LANG_STORAGE_KEY, next).catch(() => {});
  };

  const t = useMemo(() => (key: string) => {
    const value = getByPath(translations[lang], key);
    if (value !== undefined) return value;
    const fallback = getByPath(translations.en, key);
    return fallback !== undefined ? fallback : key;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t, languages: LANGUAGES }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslation must be used within a LanguageProvider");
  return ctx;
}
