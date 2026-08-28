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
    },
    notificationsScreen: {
      title: "Notifications", markAllRead: "Mark all read",
      errorLoad: "Unable to load notifications.", allCaughtUp: "You're all caught up.",
      someoneFallback: "Someone", newMatch: "You have a new match!", superLikedYou: "super liked you!",
      sentMessage: "sent you a message", youReceived: "You received", giftFallback: "a gift",
      levelUpTo: "Level up! You're now Level", dailyRewardClaimed: "Daily reward claimed: +", coinsWord: "coins",
      yourWord: "Your", monthlyBonusArrived: "monthly bonus arrived: +",
      missionComplete: "Mission complete:", missionFallback: "a mission", notificationFallback: "Notification",
      justNow: "just now", minAgo: "m ago", hAgo: "h ago", dAgo: "d ago"
    },
    eventsScreen: {
      openingEvent: "Opening the event…", kicker: "AMORA EVENTS", headerTitle: "Team Battle",
      noLiveEvent: "No live event right now", checkBackSoon: "Check back soon for the next Amora battle.",
      liveEventKicker: "LIVE EVENT",
      errorLoad: "Unable to load the current event.", errorJoinTeam: "Unable to join this team.",
      pickYourSide: "Pick your side", sendGiftsHelp: "Send gifts to help your team win.",
      yourTeamKicker: "YOUR TEAM", giftsCountToward: "Your gifts now count toward this team's score.",
      battleScore: "Battle score", live: "LIVE",
      topContributors: "Top contributors", noOneScoredYet: "No one has scored yet — be the first!", ptsSuffix: "pts",
      ended: "Ended", dayUnit: "d", hourUnit: "h", minuteUnit: "m", left: "left"
    },
    securityScreen: {
      alertTitle: "Security Center", errorLoad: "Unable to load your security settings.",
      privacyAlertTitle: "Privacy", errorUpdatePrivacy: "Unable to update privacy.",
      passwordAlertTitle: "Password", useAtLeast10: "Use at least 10 characters.", passwordsDontMatch: "The new passwords do not match.",
      passwordChangedTitle: "Password changed", passwordChangedBody: "For your protection, all existing sessions were revoked. Please sign in again.", signIn: "Sign in",
      errorChangePassword: "Unable to change password.",
      deviceAlertTitle: "Device", errorRevokeSession: "Unable to revoke this session.",
      devicesSecuredTitle: "Devices secured", otherSessionRevoked: "other session revoked.", otherSessionsRevoked: "other sessions revoked.",
      devicesAlertTitle: "Devices", errorRevokeOthers: "Unable to revoke other sessions.",
      kicker: "AMORA SECURITY", title: "Security Center", subtitle: "Protect your identity, devices and private moments.",
      excellentProtection: "Excellent protection", strongProtection: "Strong protection", goodProtection: "Good protection", protectionNeedsAttention: "Protection needs attention",
      defaultRecommendation: "Your Amora account is being protected.",
      emailVerified: "Email verified", ageVerified: "Age verified", privacyConfigured: "Privacy configured", devicesMonitored: "Devices monitored",
      protectedWord: "Protected", review: "Review",
      privacyShield: "Privacy shield",
      showOnlineStatus: "Show online status", showOnlineStatusHint: "Let people see when you're online.",
      discoverableProfile: "Discoverable profile", discoverableProfileHint: "Allow your profile to appear in discovery.",
      showAge: "Show age", showAgeHint: "Display your age on your public profile.",
      showLocation: "Show location", showLocationHint: "Display your selected city/country.",
      yourDevices: "Your devices",
      unknownDevice: "Unknown device", protectedConnection: "Protected connection", mostRecent: "Most recent",
      revoke: "Revoke", securingEllipsis: "Securing…", logOutAllOtherDevices: "Log out all other devices",
      changePasswordSection: "Change password",
      currentPasswordPlaceholder: "Current password", newPasswordPlaceholder: "New password (10+ characters)", confirmPasswordPlaceholder: "Confirm new password",
      changePasswordSecurely: "Change password securely",
      securityNote: "Amora never displays or stores your plaintext password. A successful password change revokes existing sessions.",
      footerTitle: "AMORA TRUST", footerText: "Report, block and mute tools remain available throughout the app. Suspicious activity is rate-limited and security events are recorded for protection and support."
    },
    messagesScreen: {
      errorLoad: "Unable to load your messages.", kicker: "AMORA PRIVATE", title: "Messages",
      somethingWrong: "Something went wrong", tryAgain: "Try again",
      yourPrivateSpace: "Your private space", matchesWillAppear: "Your matches and conversations will appear here.", startMatchingArrow: "Start matching →",
      startConversation: "Start a conversation…", now: "now"
    },
    profileScreen: {
      errorLoad: "Unable to load your profile.",
      permissionNeededTitle: "Permission needed", permissionNeededBody: "Amora needs access to your photos to set a profile picture.",
      photoUploadFailed: "Photo upload failed.",
      deleteAccountTitle: "Delete your Amora account?", deleteAccountBody: "This permanently removes your account and cannot be undone.", deleteWord: "Delete",
      errorDeleteAccount: "Unable to delete your account.",
      rowSettings: "Settings", rowMembership: "Membership & VIP", rowLevel: "My level & badges", rowRewards: "Daily rewards",
      rowOutfits: "My outfits & profile effects", rowStudio: "Creator Studio", rowSecurity: "Security Center",
      rowDeleteAccount: "Delete my account", rowTerms: "Terms & policies", rowLogout: "Log out",
      yourAmoraProfile: "Your Amora Profile", levelPrefix: "Level", freeMember: "Free member"
    },
    settingsScreen: {
      errorLoad: "Unable to load settings.",
      savedTitle: "Saved", savedBody: "Your settings have been updated.",
      errorSave: "Unable to save settings.",
      deleteAccountTitle: "Delete your Amora account?", deleteAccountBody: "This permanently removes your account and cannot be undone.", deleteWord: "Delete",
      errorDeleteAccount: "Unable to delete account.",
      kicker: "AMORA ACCOUNT", title: "Settings",
      profileSection: "Profile", displayNameLabel: "Display name", bioLabel: "Bio",
      privacySection: "Privacy", safetySecurityRow: "🛡️ Safety & Security",
      savingEllipsis: "Saving…", saveChanges: "Save changes",
      membershipRow: "Membership & VIP", walletRow: "Wallet & Coins", notificationsRow: "Notifications",
      logout: "Log out", deleteMyAccount: "Delete my account"
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
    },
    notificationsScreen: {
      title: "Notificaciones", markAllRead: "Marcar todo como leído",
      errorLoad: "No se pudieron cargar las notificaciones.", allCaughtUp: "Estás al día.",
      someoneFallback: "Alguien", newMatch: "¡Tienes un nuevo match!", superLikedYou: "¡te dio súper like!",
      sentMessage: "te envió un mensaje", youReceived: "Recibiste", giftFallback: "un regalo",
      levelUpTo: "¡Subiste de nivel! Ahora eres nivel", dailyRewardClaimed: "Recompensa diaria reclamada: +", coinsWord: "monedas",
      yourWord: "Tu", monthlyBonusArrived: "bono mensual llegó: +",
      missionComplete: "Misión completada:", missionFallback: "una misión", notificationFallback: "Notificación",
      justNow: "justo ahora", minAgo: "m", hAgo: "h", dAgo: "d"
    },
    eventsScreen: {
      openingEvent: "Abriendo el evento…", kicker: "EVENTOS AMORA", headerTitle: "Batalla de equipos",
      noLiveEvent: "No hay eventos en vivo ahora", checkBackSoon: "Vuelve pronto para la próxima batalla de Amora.",
      liveEventKicker: "EVENTO EN VIVO",
      errorLoad: "No se pudo cargar el evento actual.", errorJoinTeam: "No se pudo unir a este equipo.",
      pickYourSide: "Elige tu bando", sendGiftsHelp: "Envía regalos para ayudar a tu equipo a ganar.",
      yourTeamKicker: "TU EQUIPO", giftsCountToward: "Tus regalos ahora cuentan para la puntuación de este equipo.",
      battleScore: "Puntuación de la batalla", live: "EN VIVO",
      topContributors: "Principales colaboradores", noOneScoredYet: "Nadie ha puntuado todavía — ¡sé el primero!", ptsSuffix: "pts",
      ended: "Finalizado", dayUnit: "d", hourUnit: "h", minuteUnit: "m", left: "restante"
    },
    securityScreen: {
      alertTitle: "Centro de seguridad", errorLoad: "No se pudieron cargar tus ajustes de seguridad.",
      privacyAlertTitle: "Privacidad", errorUpdatePrivacy: "No se pudo actualizar la privacidad.",
      passwordAlertTitle: "Contraseña", useAtLeast10: "Usa al menos 10 caracteres.", passwordsDontMatch: "Las nuevas contraseñas no coinciden.",
      passwordChangedTitle: "Contraseña cambiada", passwordChangedBody: "Por tu protección, se revocaron todas las sesiones existentes. Inicia sesión de nuevo.", signIn: "Iniciar sesión",
      errorChangePassword: "No se pudo cambiar la contraseña.",
      deviceAlertTitle: "Dispositivo", errorRevokeSession: "No se pudo revocar esta sesión.",
      devicesSecuredTitle: "Dispositivos protegidos", otherSessionRevoked: "otra sesión revocada.", otherSessionsRevoked: "otras sesiones revocadas.",
      devicesAlertTitle: "Dispositivos", errorRevokeOthers: "No se pudieron revocar las otras sesiones.",
      kicker: "SEGURIDAD AMORA", title: "Centro de seguridad", subtitle: "Protege tu identidad, dispositivos y momentos privados.",
      excellentProtection: "Protección excelente", strongProtection: "Protección sólida", goodProtection: "Buena protección", protectionNeedsAttention: "La protección necesita atención",
      defaultRecommendation: "Tu cuenta de Amora está protegida.",
      emailVerified: "Correo verificado", ageVerified: "Edad verificada", privacyConfigured: "Privacidad configurada", devicesMonitored: "Dispositivos monitoreados",
      protectedWord: "Protegido", review: "Revisar",
      privacyShield: "Escudo de privacidad",
      showOnlineStatus: "Mostrar estado en línea", showOnlineStatusHint: "Deja que la gente vea cuándo estás en línea.",
      discoverableProfile: "Perfil visible en descubrimiento", discoverableProfileHint: "Permite que tu perfil aparezca en descubrir.",
      showAge: "Mostrar edad", showAgeHint: "Muestra tu edad en tu perfil público.",
      showLocation: "Mostrar ubicación", showLocationHint: "Muestra tu ciudad/país seleccionados.",
      yourDevices: "Tus dispositivos",
      unknownDevice: "Dispositivo desconocido", protectedConnection: "Conexión protegida", mostRecent: "Más reciente",
      revoke: "Revocar", securingEllipsis: "Protegiendo…", logOutAllOtherDevices: "Cerrar sesión en todos los demás dispositivos",
      changePasswordSection: "Cambiar contraseña",
      currentPasswordPlaceholder: "Contraseña actual", newPasswordPlaceholder: "Nueva contraseña (10+ caracteres)", confirmPasswordPlaceholder: "Confirmar nueva contraseña",
      changePasswordSecurely: "Cambiar contraseña de forma segura",
      securityNote: "Amora nunca muestra ni almacena tu contraseña en texto plano. Un cambio de contraseña exitoso revoca las sesiones existentes.",
      footerTitle: "CONFIANZA AMORA", footerText: "Las herramientas de reportar, bloquear y silenciar siguen disponibles en toda la app. La actividad sospechosa tiene límite de velocidad y los eventos de seguridad se registran para protección y soporte."
    },
    messagesScreen: {
      errorLoad: "No se pudieron cargar tus mensajes.", kicker: "AMORA PRIVADO", title: "Mensajes",
      somethingWrong: "Algo salió mal", tryAgain: "Intentar de nuevo",
      yourPrivateSpace: "Tu espacio privado", matchesWillAppear: "Tus matches y conversaciones aparecerán aquí.", startMatchingArrow: "Empezar a hacer match →",
      startConversation: "Iniciar una conversación…", now: "ahora"
    },
    profileScreen: {
      errorLoad: "No se pudo cargar tu perfil.",
      permissionNeededTitle: "Permiso necesario", permissionNeededBody: "Amora necesita acceso a tus fotos para establecer una foto de perfil.",
      photoUploadFailed: "Error al subir la foto.",
      deleteAccountTitle: "¿Eliminar tu cuenta de Amora?", deleteAccountBody: "Esto elimina tu cuenta de forma permanente y no se puede deshacer.", deleteWord: "Eliminar",
      errorDeleteAccount: "No se pudo eliminar tu cuenta.",
      rowSettings: "Ajustes", rowMembership: "Membresía y VIP", rowLevel: "Mi nivel e insignias", rowRewards: "Recompensas diarias",
      rowOutfits: "Mis atuendos y efectos de perfil", rowStudio: "Estudio de creador", rowSecurity: "Centro de seguridad",
      rowDeleteAccount: "Eliminar mi cuenta", rowTerms: "Términos y políticas", rowLogout: "Cerrar sesión",
      yourAmoraProfile: "Tu perfil de Amora", levelPrefix: "Nivel", freeMember: "Miembro gratuito"
    },
    settingsScreen: {
      errorLoad: "No se pudo cargar la configuración.",
      savedTitle: "Guardado", savedBody: "Tu configuración se ha actualizado.",
      errorSave: "No se pudo guardar la configuración.",
      deleteAccountTitle: "¿Eliminar tu cuenta de Amora?", deleteAccountBody: "Esto elimina tu cuenta de forma permanente y no se puede deshacer.", deleteWord: "Eliminar",
      errorDeleteAccount: "No se pudo eliminar la cuenta.",
      kicker: "CUENTA AMORA", title: "Configuración",
      profileSection: "Perfil", displayNameLabel: "Nombre visible", bioLabel: "Biografía",
      privacySection: "Privacidad", safetySecurityRow: "🛡️ Seguridad y protección",
      savingEllipsis: "Guardando…", saveChanges: "Guardar cambios",
      membershipRow: "Membresía y VIP", walletRow: "Billetera y monedas", notificationsRow: "Notificaciones",
      logout: "Cerrar sesión", deleteMyAccount: "Eliminar mi cuenta"
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
    },
    notificationsScreen: {
      title: "Notificações", markAllRead: "Marcar tudo como lido",
      errorLoad: "Não foi possível carregar as notificações.", allCaughtUp: "Você está em dia.",
      someoneFallback: "Alguém", newMatch: "Você tem uma nova combinação!", superLikedYou: "te deu super like!",
      sentMessage: "te enviou uma mensagem", youReceived: "Você recebeu", giftFallback: "um presente",
      levelUpTo: "Subiu de nível! Agora você é nível", dailyRewardClaimed: "Recompensa diária resgatada: +", coinsWord: "moedas",
      yourWord: "Seu", monthlyBonusArrived: "bônus mensal chegou: +",
      missionComplete: "Missão concluída:", missionFallback: "uma missão", notificationFallback: "Notificação",
      justNow: "agora mesmo", minAgo: "m atrás", hAgo: "h atrás", dAgo: "d atrás"
    },
    eventsScreen: {
      openingEvent: "Abrindo o evento…", kicker: "EVENTOS AMORA", headerTitle: "Batalha de equipes",
      noLiveEvent: "Nenhum evento ao vivo agora", checkBackSoon: "Volte em breve para a próxima batalha da Amora.",
      liveEventKicker: "EVENTO AO VIVO",
      errorLoad: "Não foi possível carregar o evento atual.", errorJoinTeam: "Não foi possível entrar nesta equipe.",
      pickYourSide: "Escolha seu lado", sendGiftsHelp: "Envie presentes para ajudar sua equipe a vencer.",
      yourTeamKicker: "SUA EQUIPE", giftsCountToward: "Seus presentes agora contam para a pontuação desta equipe.",
      battleScore: "Pontuação da batalha", live: "AO VIVO",
      topContributors: "Principais colaboradores", noOneScoredYet: "Ninguém pontuou ainda — seja o primeiro!", ptsSuffix: "pts",
      ended: "Encerrado", dayUnit: "d", hourUnit: "h", minuteUnit: "m", left: "restante"
    },
    securityScreen: {
      alertTitle: "Central de Segurança", errorLoad: "Não foi possível carregar suas configurações de segurança.",
      privacyAlertTitle: "Privacidade", errorUpdatePrivacy: "Não foi possível atualizar a privacidade.",
      passwordAlertTitle: "Senha", useAtLeast10: "Use pelo menos 10 caracteres.", passwordsDontMatch: "As novas senhas não coincidem.",
      passwordChangedTitle: "Senha alterada", passwordChangedBody: "Para sua proteção, todas as sessões existentes foram revogadas. Faça login novamente.", signIn: "Entrar",
      errorChangePassword: "Não foi possível alterar a senha.",
      deviceAlertTitle: "Dispositivo", errorRevokeSession: "Não foi possível revogar esta sessão.",
      devicesSecuredTitle: "Dispositivos protegidos", otherSessionRevoked: "outra sessão revogada.", otherSessionsRevoked: "outras sessões revogadas.",
      devicesAlertTitle: "Dispositivos", errorRevokeOthers: "Não foi possível revogar as outras sessões.",
      kicker: "SEGURANÇA AMORA", title: "Central de Segurança", subtitle: "Proteja sua identidade, dispositivos e momentos privados.",
      excellentProtection: "Proteção excelente", strongProtection: "Proteção forte", goodProtection: "Boa proteção", protectionNeedsAttention: "A proteção precisa de atenção",
      defaultRecommendation: "Sua conta Amora está sendo protegida.",
      emailVerified: "E-mail verificado", ageVerified: "Idade verificada", privacyConfigured: "Privacidade configurada", devicesMonitored: "Dispositivos monitorados",
      protectedWord: "Protegido", review: "Revisar",
      privacyShield: "Escudo de privacidade",
      showOnlineStatus: "Mostrar status online", showOnlineStatusHint: "Deixe as pessoas verem quando você está online.",
      discoverableProfile: "Perfil detectável", discoverableProfileHint: "Permita que seu perfil apareça na descoberta.",
      showAge: "Mostrar idade", showAgeHint: "Exiba sua idade no seu perfil público.",
      showLocation: "Mostrar localização", showLocationHint: "Exiba sua cidade/país selecionados.",
      yourDevices: "Seus dispositivos",
      unknownDevice: "Dispositivo desconhecido", protectedConnection: "Conexão protegida", mostRecent: "Mais recente",
      revoke: "Revogar", securingEllipsis: "Protegendo…", logOutAllOtherDevices: "Encerrar sessão em todos os outros dispositivos",
      changePasswordSection: "Alterar senha",
      currentPasswordPlaceholder: "Senha atual", newPasswordPlaceholder: "Nova senha (10+ caracteres)", confirmPasswordPlaceholder: "Confirmar nova senha",
      changePasswordSecurely: "Alterar senha com segurança",
      securityNote: "A Amora nunca exibe ou armazena sua senha em texto simples. Uma alteração de senha bem-sucedida revoga as sessões existentes.",
      footerTitle: "CONFIANÇA AMORA", footerText: "As ferramentas de denúncia, bloqueio e silenciamento permanecem disponíveis em todo o app. Atividades suspeitas têm limite de taxa e eventos de segurança são registrados para proteção e suporte."
    },
    messagesScreen: {
      errorLoad: "Não foi possível carregar suas mensagens.", kicker: "AMORA PRIVADO", title: "Mensagens",
      somethingWrong: "Algo deu errado", tryAgain: "Tentar novamente",
      yourPrivateSpace: "Seu espaço privado", matchesWillAppear: "Suas combinações e conversas aparecerão aqui.", startMatchingArrow: "Começar a combinar →",
      startConversation: "Iniciar uma conversa…", now: "agora"
    },
    profileScreen: {
      errorLoad: "Não foi possível carregar seu perfil.",
      permissionNeededTitle: "Permissão necessária", permissionNeededBody: "A Amora precisa de acesso às suas fotos para definir uma foto de perfil.",
      photoUploadFailed: "Falha no upload da foto.",
      deleteAccountTitle: "Excluir sua conta Amora?", deleteAccountBody: "Isso remove permanentemente sua conta e não pode ser desfeito.", deleteWord: "Excluir",
      errorDeleteAccount: "Não foi possível excluir sua conta.",
      rowSettings: "Configurações", rowMembership: "Membresia e VIP", rowLevel: "Meu nível e emblemas", rowRewards: "Recompensas diárias",
      rowOutfits: "Meus trajes e efeitos de perfil", rowStudio: "Estúdio do Criador", rowSecurity: "Central de Segurança",
      rowDeleteAccount: "Excluir minha conta", rowTerms: "Termos e políticas", rowLogout: "Sair",
      yourAmoraProfile: "Seu Perfil Amora", levelPrefix: "Nível", freeMember: "Membro gratuito"
    },
    settingsScreen: {
      errorLoad: "Não foi possível carregar as configurações.",
      savedTitle: "Salvo", savedBody: "Suas configurações foram atualizadas.",
      errorSave: "Não foi possível salvar as configurações.",
      deleteAccountTitle: "Excluir sua conta Amora?", deleteAccountBody: "Isso remove permanentemente sua conta e não pode ser desfeito.", deleteWord: "Excluir",
      errorDeleteAccount: "Não foi possível excluir a conta.",
      kicker: "CONTA AMORA", title: "Configurações",
      profileSection: "Perfil", displayNameLabel: "Nome de exibição", bioLabel: "Biografia",
      privacySection: "Privacidade", safetySecurityRow: "🛡️ Segurança e Proteção",
      savingEllipsis: "Salvando…", saveChanges: "Salvar alterações",
      membershipRow: "Membresia e VIP", walletRow: "Carteira e moedas", notificationsRow: "Notificações",
      logout: "Sair", deleteMyAccount: "Excluir minha conta"
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
    },
    notificationsScreen: {
      title: "Notifications", markAllRead: "Tout marquer comme lu",
      errorLoad: "Impossible de charger les notifications.", allCaughtUp: "Vous êtes à jour.",
      someoneFallback: "Quelqu'un", newMatch: "Vous avez un nouveau match !", superLikedYou: "vous a super liké !",
      sentMessage: "vous a envoyé un message", youReceived: "Vous avez reçu", giftFallback: "un cadeau",
      levelUpTo: "Niveau supérieur ! Vous êtes maintenant niveau", dailyRewardClaimed: "Récompense quotidienne récupérée : +", coinsWord: "pièces",
      yourWord: "Votre", monthlyBonusArrived: "bonus mensuel est arrivé : +",
      missionComplete: "Mission accomplie :", missionFallback: "une mission", notificationFallback: "Notification",
      justNow: "à l'instant", minAgo: "min", hAgo: "h", dAgo: "j"
    },
    eventsScreen: {
      openingEvent: "Ouverture de l'événement…", kicker: "ÉVÉNEMENTS AMORA", headerTitle: "Bataille d'équipes",
      noLiveEvent: "Aucun événement en direct pour le moment", checkBackSoon: "Revenez bientôt pour la prochaine bataille Amora.",
      liveEventKicker: "ÉVÉNEMENT EN DIRECT",
      errorLoad: "Impossible de charger l'événement actuel.", errorJoinTeam: "Impossible de rejoindre cette équipe.",
      pickYourSide: "Choisissez votre camp", sendGiftsHelp: "Envoyez des cadeaux pour aider votre équipe à gagner.",
      yourTeamKicker: "VOTRE ÉQUIPE", giftsCountToward: "Vos cadeaux comptent maintenant pour le score de cette équipe.",
      battleScore: "Score de la bataille", live: "EN DIRECT",
      topContributors: "Meilleurs contributeurs", noOneScoredYet: "Personne n'a encore marqué de points — soyez le premier !", ptsSuffix: "pts",
      ended: "Terminé", dayUnit: "j", hourUnit: "h", minuteUnit: "min", left: "restant"
    },
    securityScreen: {
      alertTitle: "Centre de sécurité", errorLoad: "Impossible de charger vos paramètres de sécurité.",
      privacyAlertTitle: "Confidentialité", errorUpdatePrivacy: "Impossible de mettre à jour la confidentialité.",
      passwordAlertTitle: "Mot de passe", useAtLeast10: "Utilisez au moins 10 caractères.", passwordsDontMatch: "Les nouveaux mots de passe ne correspondent pas.",
      passwordChangedTitle: "Mot de passe modifié", passwordChangedBody: "Pour votre protection, toutes les sessions existantes ont été révoquées. Veuillez vous reconnecter.", signIn: "Se connecter",
      errorChangePassword: "Impossible de changer le mot de passe.",
      deviceAlertTitle: "Appareil", errorRevokeSession: "Impossible de révoquer cette session.",
      devicesSecuredTitle: "Appareils sécurisés", otherSessionRevoked: "autre session révoquée.", otherSessionsRevoked: "autres sessions révoquées.",
      devicesAlertTitle: "Appareils", errorRevokeOthers: "Impossible de révoquer les autres sessions.",
      kicker: "SÉCURITÉ AMORA", title: "Centre de sécurité", subtitle: "Protégez votre identité, vos appareils et vos moments privés.",
      excellentProtection: "Protection excellente", strongProtection: "Protection solide", goodProtection: "Bonne protection", protectionNeedsAttention: "La protection nécessite votre attention",
      defaultRecommendation: "Votre compte Amora est protégé.",
      emailVerified: "E-mail vérifié", ageVerified: "Âge vérifié", privacyConfigured: "Confidentialité configurée", devicesMonitored: "Appareils surveillés",
      protectedWord: "Protégé", review: "Vérifier",
      privacyShield: "Bouclier de confidentialité",
      showOnlineStatus: "Afficher le statut en ligne", showOnlineStatusHint: "Laissez les autres voir quand vous êtes en ligne.",
      discoverableProfile: "Profil visible en découverte", discoverableProfileHint: "Autorisez votre profil à apparaître dans la découverte.",
      showAge: "Afficher l'âge", showAgeHint: "Affichez votre âge sur votre profil public.",
      showLocation: "Afficher la localisation", showLocationHint: "Affichez votre ville/pays sélectionnés.",
      yourDevices: "Vos appareils",
      unknownDevice: "Appareil inconnu", protectedConnection: "Connexion protégée", mostRecent: "Le plus récent",
      revoke: "Révoquer", securingEllipsis: "Sécurisation…", logOutAllOtherDevices: "Déconnecter tous les autres appareils",
      changePasswordSection: "Changer le mot de passe",
      currentPasswordPlaceholder: "Mot de passe actuel", newPasswordPlaceholder: "Nouveau mot de passe (10+ caractères)", confirmPasswordPlaceholder: "Confirmer le nouveau mot de passe",
      changePasswordSecurely: "Changer le mot de passe en toute sécurité",
      securityNote: "Amora n'affiche ni ne stocke jamais votre mot de passe en clair. Un changement de mot de passe réussi révoque les sessions existantes.",
      footerTitle: "CONFIANCE AMORA", footerText: "Les outils de signalement, de blocage et de masquage restent disponibles dans toute l'application. L'activité suspecte est limitée en fréquence et les événements de sécurité sont enregistrés pour la protection et le support."
    },
    messagesScreen: {
      errorLoad: "Impossible de charger vos messages.", kicker: "AMORA PRIVÉ", title: "Messages",
      somethingWrong: "Un problème est survenu", tryAgain: "Réessayer",
      yourPrivateSpace: "Votre espace privé", matchesWillAppear: "Vos matchs et conversations apparaîtront ici.", startMatchingArrow: "Commencer à matcher →",
      startConversation: "Démarrer une conversation…", now: "maintenant"
    },
    profileScreen: {
      errorLoad: "Impossible de charger votre profil.",
      permissionNeededTitle: "Autorisation requise", permissionNeededBody: "Amora a besoin d'accéder à vos photos pour définir une photo de profil.",
      photoUploadFailed: "Échec du téléchargement de la photo.",
      deleteAccountTitle: "Supprimer votre compte Amora ?", deleteAccountBody: "Cela supprime définitivement votre compte et ne peut pas être annulé.", deleteWord: "Supprimer",
      errorDeleteAccount: "Impossible de supprimer votre compte.",
      rowSettings: "Paramètres", rowMembership: "Abonnement et VIP", rowLevel: "Mon niveau et mes badges", rowRewards: "Récompenses quotidiennes",
      rowOutfits: "Mes tenues et effets de profil", rowStudio: "Studio créateur", rowSecurity: "Centre de sécurité",
      rowDeleteAccount: "Supprimer mon compte", rowTerms: "Conditions et politiques", rowLogout: "Se déconnecter",
      yourAmoraProfile: "Votre profil Amora", levelPrefix: "Niveau", freeMember: "Membre gratuit"
    },
    settingsScreen: {
      errorLoad: "Impossible de charger les paramètres.",
      savedTitle: "Enregistré", savedBody: "Vos paramètres ont été mis à jour.",
      errorSave: "Impossible d'enregistrer les paramètres.",
      deleteAccountTitle: "Supprimer votre compte Amora ?", deleteAccountBody: "Cela supprime définitivement votre compte et ne peut pas être annulé.", deleteWord: "Supprimer",
      errorDeleteAccount: "Impossible de supprimer le compte.",
      kicker: "COMPTE AMORA", title: "Paramètres",
      profileSection: "Profil", displayNameLabel: "Nom d'affichage", bioLabel: "Bio",
      privacySection: "Confidentialité", safetySecurityRow: "🛡️ Sécurité et protection",
      savingEllipsis: "Enregistrement…", saveChanges: "Enregistrer les modifications",
      membershipRow: "Abonnement et VIP", walletRow: "Portefeuille et pièces", notificationsRow: "Notifications",
      logout: "Se déconnecter", deleteMyAccount: "Supprimer mon compte"
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
    },
    notificationsScreen: {
      title: "Benachrichtigungen", markAllRead: "Alle als gelesen markieren",
      errorLoad: "Benachrichtigungen konnten nicht geladen werden.", allCaughtUp: "Du bist auf dem neuesten Stand.",
      someoneFallback: "Jemand", newMatch: "Du hast ein neues Match!", superLikedYou: "hat dir ein Super-Like gegeben!",
      sentMessage: "hat dir eine Nachricht geschickt", youReceived: "Du hast erhalten", giftFallback: "ein Geschenk",
      levelUpTo: "Level aufgestiegen! Du bist jetzt Level", dailyRewardClaimed: "Tägliche Belohnung abgeholt: +", coinsWord: "Coins",
      yourWord: "Dein", monthlyBonusArrived: "monatlicher Bonus ist angekommen: +",
      missionComplete: "Mission abgeschlossen:", missionFallback: "eine Mission", notificationFallback: "Benachrichtigung",
      justNow: "gerade eben", minAgo: "Min.", hAgo: "Std.", dAgo: "Tg."
    },
    eventsScreen: {
      openingEvent: "Event wird geöffnet…", kicker: "AMORA EVENTS", headerTitle: "Team-Kampf",
      noLiveEvent: "Gerade kein Live-Event", checkBackSoon: "Schau bald wieder vorbei für den nächsten Amora-Kampf.",
      liveEventKicker: "LIVE-EVENT",
      errorLoad: "Das aktuelle Event konnte nicht geladen werden.", errorJoinTeam: "Dieses Team konnte nicht beigetreten werden.",
      pickYourSide: "Wähle deine Seite", sendGiftsHelp: "Sende Geschenke, um deinem Team zum Sieg zu verhelfen.",
      yourTeamKicker: "DEIN TEAM", giftsCountToward: "Deine Geschenke zählen jetzt zum Punktestand dieses Teams.",
      battleScore: "Kampfpunktzahl", live: "LIVE",
      topContributors: "Top-Beitragende", noOneScoredYet: "Noch niemand hat gepunktet — sei der Erste!", ptsSuffix: "Pkt.",
      ended: "Beendet", dayUnit: "T", hourUnit: "Std", minuteUnit: "Min", left: "übrig"
    },
    securityScreen: {
      alertTitle: "Sicherheitscenter", errorLoad: "Deine Sicherheitseinstellungen konnten nicht geladen werden.",
      privacyAlertTitle: "Datenschutz", errorUpdatePrivacy: "Datenschutz konnte nicht aktualisiert werden.",
      passwordAlertTitle: "Passwort", useAtLeast10: "Verwende mindestens 10 Zeichen.", passwordsDontMatch: "Die neuen Passwörter stimmen nicht überein.",
      passwordChangedTitle: "Passwort geändert", passwordChangedBody: "Zu deinem Schutz wurden alle bestehenden Sitzungen widerrufen. Bitte melde dich erneut an.", signIn: "Anmelden",
      errorChangePassword: "Passwort konnte nicht geändert werden.",
      deviceAlertTitle: "Gerät", errorRevokeSession: "Diese Sitzung konnte nicht widerrufen werden.",
      devicesSecuredTitle: "Geräte gesichert", otherSessionRevoked: "andere Sitzung widerrufen.", otherSessionsRevoked: "andere Sitzungen widerrufen.",
      devicesAlertTitle: "Geräte", errorRevokeOthers: "Andere Sitzungen konnten nicht widerrufen werden.",
      kicker: "AMORA SICHERHEIT", title: "Sicherheitscenter", subtitle: "Schütze deine Identität, Geräte und privaten Momente.",
      excellentProtection: "Ausgezeichneter Schutz", strongProtection: "Starker Schutz", goodProtection: "Guter Schutz", protectionNeedsAttention: "Schutz benötigt Aufmerksamkeit",
      defaultRecommendation: "Dein Amora-Konto wird geschützt.",
      emailVerified: "E-Mail verifiziert", ageVerified: "Alter verifiziert", privacyConfigured: "Datenschutz konfiguriert", devicesMonitored: "Geräte überwacht",
      protectedWord: "Geschützt", review: "Überprüfen",
      privacyShield: "Datenschutzschild",
      showOnlineStatus: "Online-Status anzeigen", showOnlineStatusHint: "Lass andere sehen, wann du online bist.",
      discoverableProfile: "Auffindbares Profil", discoverableProfileHint: "Erlaube, dass dein Profil in der Entdeckung erscheint.",
      showAge: "Alter anzeigen", showAgeHint: "Zeige dein Alter in deinem öffentlichen Profil an.",
      showLocation: "Standort anzeigen", showLocationHint: "Zeige deine ausgewählte Stadt/Land an.",
      yourDevices: "Deine Geräte",
      unknownDevice: "Unbekanntes Gerät", protectedConnection: "Geschützte Verbindung", mostRecent: "Zuletzt verwendet",
      revoke: "Widerrufen", securingEllipsis: "Wird gesichert…", logOutAllOtherDevices: "Auf allen anderen Geräten abmelden",
      changePasswordSection: "Passwort ändern",
      currentPasswordPlaceholder: "Aktuelles Passwort", newPasswordPlaceholder: "Neues Passwort (10+ Zeichen)", confirmPasswordPlaceholder: "Neues Passwort bestätigen",
      changePasswordSecurely: "Passwort sicher ändern",
      securityNote: "Amora zeigt oder speichert dein Passwort niemals im Klartext. Eine erfolgreiche Passwortänderung widerruft bestehende Sitzungen.",
      footerTitle: "AMORA VERTRAUEN", footerText: "Melde-, Blockier- und Stummschalt-Tools bleiben in der gesamten App verfügbar. Verdächtige Aktivitäten werden ratenbegrenzt und Sicherheitsereignisse werden zum Schutz und Support aufgezeichnet."
    },
    messagesScreen: {
      errorLoad: "Deine Nachrichten konnten nicht geladen werden.", kicker: "AMORA PRIVAT", title: "Nachrichten",
      somethingWrong: "Etwas ist schiefgelaufen", tryAgain: "Erneut versuchen",
      yourPrivateSpace: "Dein privater Bereich", matchesWillAppear: "Deine Matches und Unterhaltungen erscheinen hier.", startMatchingArrow: "Matching starten →",
      startConversation: "Unterhaltung starten…", now: "jetzt"
    },
    profileScreen: {
      errorLoad: "Dein Profil konnte nicht geladen werden.",
      permissionNeededTitle: "Berechtigung erforderlich", permissionNeededBody: "Amora benötigt Zugriff auf deine Fotos, um ein Profilbild festzulegen.",
      photoUploadFailed: "Foto-Upload fehlgeschlagen.",
      deleteAccountTitle: "Dein Amora-Konto löschen?", deleteAccountBody: "Dies entfernt dein Konto dauerhaft und kann nicht rückgängig gemacht werden.", deleteWord: "Löschen",
      errorDeleteAccount: "Dein Konto konnte nicht gelöscht werden.",
      rowSettings: "Einstellungen", rowMembership: "Mitgliedschaft & VIP", rowLevel: "Mein Level & Abzeichen", rowRewards: "Tägliche Belohnungen",
      rowOutfits: "Meine Outfits & Profileffekte", rowStudio: "Creator-Studio", rowSecurity: "Sicherheitscenter",
      rowDeleteAccount: "Mein Konto löschen", rowTerms: "AGB & Richtlinien", rowLogout: "Abmelden",
      yourAmoraProfile: "Dein Amora-Profil", levelPrefix: "Level", freeMember: "Kostenloses Mitglied"
    },
    settingsScreen: {
      errorLoad: "Einstellungen konnten nicht geladen werden.",
      savedTitle: "Gespeichert", savedBody: "Deine Einstellungen wurden aktualisiert.",
      errorSave: "Einstellungen konnten nicht gespeichert werden.",
      deleteAccountTitle: "Dein Amora-Konto löschen?", deleteAccountBody: "Dies entfernt dein Konto dauerhaft und kann nicht rückgängig gemacht werden.", deleteWord: "Löschen",
      errorDeleteAccount: "Konto konnte nicht gelöscht werden.",
      kicker: "AMORA KONTO", title: "Einstellungen",
      profileSection: "Profil", displayNameLabel: "Anzeigename", bioLabel: "Bio",
      privacySection: "Datenschutz", safetySecurityRow: "🛡️ Sicherheit & Schutz",
      savingEllipsis: "Wird gespeichert…", saveChanges: "Änderungen speichern",
      membershipRow: "Mitgliedschaft & VIP", walletRow: "Wallet & Coins", notificationsRow: "Benachrichtigungen",
      logout: "Abmelden", deleteMyAccount: "Mein Konto löschen"
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
    },
    notificationsScreen: {
      title: "الإشعارات", markAllRead: "تحديد الكل كمقروء",
      errorLoad: "تعذر تحميل الإشعارات.", allCaughtUp: "أنت على اطلاع كامل.",
      someoneFallback: "شخص ما", newMatch: "لديك تطابق جديد!", superLikedYou: "أعجب بك إعجابًا فائقًا!",
      sentMessage: "أرسل لك رسالة", youReceived: "لقد استلمت", giftFallback: "هدية",
      levelUpTo: "ارتقيت مستوى! أنت الآن في المستوى", dailyRewardClaimed: "تم استلام المكافأة اليومية: +", coinsWord: "عملة",
      yourWord: "مكافأتك", monthlyBonusArrived: "الشهرية وصلت: +",
      missionComplete: "اكتملت المهمة:", missionFallback: "مهمة", notificationFallback: "إشعار",
      justNow: "الآن", minAgo: "د", hAgo: "س", dAgo: "ي"
    },
    eventsScreen: {
      openingEvent: "جارٍ فتح الفعالية…", kicker: "فعاليات أمورا", headerTitle: "معركة الفرق",
      noLiveEvent: "لا توجد فعالية مباشرة الآن", checkBackSoon: "عد قريبًا لمعركة أمورا القادمة.",
      liveEventKicker: "فعالية مباشرة",
      errorLoad: "تعذر تحميل الفعالية الحالية.", errorJoinTeam: "تعذر الانضمام إلى هذا الفريق.",
      pickYourSide: "اختر جانبك", sendGiftsHelp: "أرسل الهدايا لمساعدة فريقك على الفوز.",
      yourTeamKicker: "فريقك", giftsCountToward: "هداياك الآن تُحتسب لنقاط هذا الفريق.",
      battleScore: "نقاط المعركة", live: "مباشر",
      topContributors: "أفضل المساهمين", noOneScoredYet: "لم يسجل أحد بعد — كن الأول!", ptsSuffix: "نقطة",
      ended: "انتهى", dayUnit: "ي", hourUnit: "س", minuteUnit: "د", left: "متبقٍ"
    },
    securityScreen: {
      alertTitle: "مركز الأمان", errorLoad: "تعذر تحميل إعدادات الأمان الخاصة بك.",
      privacyAlertTitle: "الخصوصية", errorUpdatePrivacy: "تعذر تحديث الخصوصية.",
      passwordAlertTitle: "كلمة المرور", useAtLeast10: "استخدم 10 أحرف على الأقل.", passwordsDontMatch: "كلمتا المرور الجديدتان غير متطابقتين.",
      passwordChangedTitle: "تم تغيير كلمة المرور", passwordChangedBody: "لحمايتك، تم إلغاء جميع الجلسات الحالية. يرجى تسجيل الدخول مرة أخرى.", signIn: "تسجيل الدخول",
      errorChangePassword: "تعذر تغيير كلمة المرور.",
      deviceAlertTitle: "الجهاز", errorRevokeSession: "تعذر إلغاء هذه الجلسة.",
      devicesSecuredTitle: "تم تأمين الأجهزة", otherSessionRevoked: "جلسة أخرى تم إلغاؤها.", otherSessionsRevoked: "جلسات أخرى تم إلغاؤها.",
      devicesAlertTitle: "الأجهزة", errorRevokeOthers: "تعذر إلغاء الجلسات الأخرى.",
      kicker: "أمان أمورا", title: "مركز الأمان", subtitle: "احمِ هويتك وأجهزتك ولحظاتك الخاصة.",
      excellentProtection: "حماية ممتازة", strongProtection: "حماية قوية", goodProtection: "حماية جيدة", protectionNeedsAttention: "الحماية تحتاج إلى انتباه",
      defaultRecommendation: "حسابك في أمورا محمي.",
      emailVerified: "البريد الإلكتروني موثّق", ageVerified: "العمر موثّق", privacyConfigured: "الخصوصية مُهيأة", devicesMonitored: "الأجهزة مراقَبة",
      protectedWord: "محمي", review: "مراجعة",
      privacyShield: "درع الخصوصية",
      showOnlineStatus: "إظهار حالة الاتصال", showOnlineStatusHint: "دع الآخرين يرون متى تكون متصلاً.",
      discoverableProfile: "ملف شخصي قابل للاكتشاف", discoverableProfileHint: "اسمح لملفك الشخصي بالظهور في الاستكشاف.",
      showAge: "إظهار العمر", showAgeHint: "اعرض عمرك في ملفك الشخصي العام.",
      showLocation: "إظهار الموقع", showLocationHint: "اعرض مدينتك/بلدك المحدد.",
      yourDevices: "أجهزتك",
      unknownDevice: "جهاز غير معروف", protectedConnection: "اتصال محمي", mostRecent: "الأحدث",
      revoke: "إلغاء", securingEllipsis: "جارٍ التأمين…", logOutAllOtherDevices: "تسجيل الخروج من جميع الأجهزة الأخرى",
      changePasswordSection: "تغيير كلمة المرور",
      currentPasswordPlaceholder: "كلمة المرور الحالية", newPasswordPlaceholder: "كلمة مرور جديدة (10+ أحرف)", confirmPasswordPlaceholder: "تأكيد كلمة المرور الجديدة",
      changePasswordSecurely: "تغيير كلمة المرور بأمان",
      securityNote: "لا تعرض أمورا أو تخزن كلمة مرورك كنص عادي أبدًا. يؤدي تغيير كلمة المرور بنجاح إلى إلغاء الجلسات الحالية.",
      footerTitle: "ثقة أمورا", footerText: "تظل أدوات الإبلاغ والحظر والكتم متاحة في جميع أنحاء التطبيق. يتم تقييد معدل النشاط المشبوه وتسجيل أحداث الأمان للحماية والدعم."
    },
    messagesScreen: {
      errorLoad: "تعذر تحميل رسائلك.", kicker: "أمورا الخاص", title: "الرسائل",
      somethingWrong: "حدث خطأ ما", tryAgain: "إعادة المحاولة",
      yourPrivateSpace: "مساحتك الخاصة", matchesWillAppear: "ستظهر تطابقاتك ومحادثاتك هنا.", startMatchingArrow: "ابدأ التطابق ←",
      startConversation: "ابدأ محادثة…", now: "الآن"
    },
    profileScreen: {
      errorLoad: "تعذر تحميل ملفك الشخصي.",
      permissionNeededTitle: "إذن مطلوب", permissionNeededBody: "تحتاج أمورا إلى الوصول إلى صورك لتعيين صورة ملف شخصي.",
      photoUploadFailed: "فشل رفع الصورة.",
      deleteAccountTitle: "حذف حساب أمورا الخاص بك؟", deleteAccountBody: "هذا يزيل حسابك نهائيًا ولا يمكن التراجع عنه.", deleteWord: "حذف",
      errorDeleteAccount: "تعذر حذف حسابك.",
      rowSettings: "الإعدادات", rowMembership: "العضوية وVIP", rowLevel: "مستواي وشاراتي", rowRewards: "المكافآت اليومية",
      rowOutfits: "أزيائي وتأثيرات ملفي الشخصي", rowStudio: "استوديو صانع المحتوى", rowSecurity: "مركز الأمان",
      rowDeleteAccount: "حذف حسابي", rowTerms: "الشروط والسياسات", rowLogout: "تسجيل الخروج",
      yourAmoraProfile: "ملفك الشخصي في أمورا", levelPrefix: "المستوى", freeMember: "عضو مجاني"
    },
    settingsScreen: {
      errorLoad: "تعذر تحميل الإعدادات.",
      savedTitle: "تم الحفظ", savedBody: "تم تحديث إعداداتك.",
      errorSave: "تعذر حفظ الإعدادات.",
      deleteAccountTitle: "حذف حساب أمورا الخاص بك؟", deleteAccountBody: "هذا يزيل حسابك نهائيًا ولا يمكن التراجع عنه.", deleteWord: "حذف",
      errorDeleteAccount: "تعذر حذف الحساب.",
      kicker: "حساب أمورا", title: "الإعدادات",
      profileSection: "الملف الشخصي", displayNameLabel: "اسم العرض", bioLabel: "النبذة",
      privacySection: "الخصوصية", safetySecurityRow: "🛡️ السلامة والأمان",
      savingEllipsis: "جارٍ الحفظ…", saveChanges: "حفظ التغييرات",
      membershipRow: "العضوية وVIP", walletRow: "المحفظة والعملات", notificationsRow: "الإشعارات",
      logout: "تسجيل الخروج", deleteMyAccount: "حذف حسابي"
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
    },
    notificationsScreen: {
      title: "सूचनाएं", markAllRead: "सभी को पढ़ा हुआ चिह्नित करें",
      errorLoad: "सूचनाएं लोड नहीं हो सकीं।", allCaughtUp: "आप पूरी तरह अपडेट हैं।",
      someoneFallback: "किसी ने", newMatch: "आपका एक नया मैच है!", superLikedYou: "ने आपको सुपर लाइक किया!",
      sentMessage: "ने आपको संदेश भेजा", youReceived: "आपको मिला", giftFallback: "एक गिफ्ट",
      levelUpTo: "लेवल अप! अब आप लेवल पर हैं", dailyRewardClaimed: "दैनिक पुरस्कार प्राप्त हुआ: +", coinsWord: "कॉइन",
      yourWord: "आपका", monthlyBonusArrived: "मासिक बोनस आ गया: +",
      missionComplete: "मिशन पूरा हुआ:", missionFallback: "एक मिशन", notificationFallback: "सूचना",
      justNow: "अभी अभी", minAgo: "मिनट पहले", hAgo: "घंटे पहले", dAgo: "दिन पहले"
    },
    eventsScreen: {
      openingEvent: "इवेंट खोला जा रहा है…", kicker: "अमोरा इवेंट्स", headerTitle: "टीम बैटल",
      noLiveEvent: "अभी कोई लाइव इवेंट नहीं है", checkBackSoon: "अगली अमोरा बैटल के लिए जल्द ही वापस देखें।",
      liveEventKicker: "लाइव इवेंट",
      errorLoad: "वर्तमान इवेंट लोड नहीं हो सका।", errorJoinTeam: "इस टीम में शामिल नहीं हो सके।",
      pickYourSide: "अपना पक्ष चुनें", sendGiftsHelp: "अपनी टीम को जीतने में मदद के लिए गिफ्ट भेजें।",
      yourTeamKicker: "आपकी टीम", giftsCountToward: "आपके गिफ्ट अब इस टीम के स्कोर में गिने जाते हैं।",
      battleScore: "बैटल स्कोर", live: "लाइव",
      topContributors: "शीर्ष योगदानकर्ता", noOneScoredYet: "अभी तक किसी ने स्कोर नहीं किया — पहले बनें!", ptsSuffix: "अंक",
      ended: "समाप्त", dayUnit: "दि", hourUnit: "घं", minuteUnit: "मि", left: "शेष"
    },
    securityScreen: {
      alertTitle: "सुरक्षा केंद्र", errorLoad: "आपकी सुरक्षा सेटिंग्स लोड नहीं हो सकीं।",
      privacyAlertTitle: "गोपनीयता", errorUpdatePrivacy: "गोपनीयता अपडेट नहीं हो सकी।",
      passwordAlertTitle: "पासवर्ड", useAtLeast10: "कम से कम 10 अक्षरों का उपयोग करें।", passwordsDontMatch: "नए पासवर्ड मेल नहीं खाते।",
      passwordChangedTitle: "पासवर्ड बदला गया", passwordChangedBody: "आपकी सुरक्षा के लिए, सभी मौजूदा सत्र रद्द कर दिए गए हैं। कृपया फिर से साइन इन करें।", signIn: "साइन इन करें",
      errorChangePassword: "पासवर्ड नहीं बदला जा सका।",
      deviceAlertTitle: "डिवाइस", errorRevokeSession: "यह सत्र रद्द नहीं किया जा सका।",
      devicesSecuredTitle: "डिवाइस सुरक्षित किए गए", otherSessionRevoked: "अन्य सत्र रद्द किया गया।", otherSessionsRevoked: "अन्य सत्र रद्द किए गए।",
      devicesAlertTitle: "डिवाइस", errorRevokeOthers: "अन्य सत्र रद्द नहीं किए जा सके।",
      kicker: "अमोरा सुरक्षा", title: "सुरक्षा केंद्र", subtitle: "अपनी पहचान, डिवाइस और निजी पलों की सुरक्षा करें।",
      excellentProtection: "उत्कृष्ट सुरक्षा", strongProtection: "मजबूत सुरक्षा", goodProtection: "अच्छी सुरक्षा", protectionNeedsAttention: "सुरक्षा पर ध्यान देने की आवश्यकता है",
      defaultRecommendation: "आपका अमोरा खाता सुरक्षित किया जा रहा है।",
      emailVerified: "ईमेल सत्यापित", ageVerified: "आयु सत्यापित", privacyConfigured: "गोपनीयता कॉन्फ़िगर की गई", devicesMonitored: "डिवाइस मॉनिटर किए गए",
      protectedWord: "सुरक्षित", review: "जांचें",
      privacyShield: "गोपनीयता शील्ड",
      showOnlineStatus: "ऑनलाइन स्थिति दिखाएं", showOnlineStatusHint: "लोगों को यह देखने दें कि आप कब ऑनलाइन हैं।",
      discoverableProfile: "खोजने योग्य प्रोफ़ाइल", discoverableProfileHint: "अपनी प्रोफ़ाइल को डिस्कवरी में दिखने की अनुमति दें।",
      showAge: "आयु दिखाएं", showAgeHint: "अपनी सार्वजनिक प्रोफ़ाइल पर अपनी आयु प्रदर्शित करें।",
      showLocation: "स्थान दिखाएं", showLocationHint: "अपना चयनित शहर/देश प्रदर्शित करें।",
      yourDevices: "आपके डिवाइस",
      unknownDevice: "अज्ञात डिवाइस", protectedConnection: "सुरक्षित कनेक्शन", mostRecent: "सबसे हालिया",
      revoke: "रद्द करें", securingEllipsis: "सुरक्षित किया जा रहा है…", logOutAllOtherDevices: "सभी अन्य डिवाइस से लॉग आउट करें",
      changePasswordSection: "पासवर्ड बदलें",
      currentPasswordPlaceholder: "वर्तमान पासवर्ड", newPasswordPlaceholder: "नया पासवर्ड (10+ अक्षर)", confirmPasswordPlaceholder: "नए पासवर्ड की पुष्टि करें",
      changePasswordSecurely: "सुरक्षित रूप से पासवर्ड बदलें",
      securityNote: "अमोरा कभी भी आपका सादा-टेक्स्ट पासवर्ड नहीं दिखाता या संग्रहीत नहीं करता। सफल पासवर्ड परिवर्तन मौजूदा सत्रों को रद्द कर देता है।",
      footerTitle: "अमोरा भरोसा", footerText: "रिपोर्ट, ब्लॉक और म्यूट टूल पूरे ऐप में उपलब्ध रहते हैं। संदिग्ध गतिविधि दर-सीमित है और सुरक्षा घटनाओं को सुरक्षा और सहायता के लिए दर्ज किया जाता है।"
    },
    messagesScreen: {
      errorLoad: "आपके संदेश लोड नहीं हो सके।", kicker: "अमोरा प्राइवेट", title: "संदेश",
      somethingWrong: "कुछ गलत हो गया", tryAgain: "फिर से कोशिश करें",
      yourPrivateSpace: "आपकी निजी जगह", matchesWillAppear: "आपके मैच और बातचीत यहां दिखाई देंगे।", startMatchingArrow: "मैचिंग शुरू करें →",
      startConversation: "बातचीत शुरू करें…", now: "अभी"
    },
    profileScreen: {
      errorLoad: "आपकी प्रोफ़ाइल लोड नहीं हो सकी।",
      permissionNeededTitle: "अनुमति आवश्यक", permissionNeededBody: "प्रोफ़ाइल फ़ोटो सेट करने के लिए अमोरा को आपकी फ़ोटो तक पहुंच चाहिए।",
      photoUploadFailed: "फोटो अपलोड विफल रहा।",
      deleteAccountTitle: "अपना अमोरा खाता हटाएं?", deleteAccountBody: "यह आपके खाते को स्थायी रूप से हटा देता है और इसे पूर्ववत नहीं किया जा सकता।", deleteWord: "हटाएं",
      errorDeleteAccount: "आपका खाता हटाया नहीं जा सका।",
      rowSettings: "सेटिंग्स", rowMembership: "सदस्यता और VIP", rowLevel: "मेरा लेवल और बैज", rowRewards: "दैनिक पुरस्कार",
      rowOutfits: "मेरे आउटफिट और प्रोफ़ाइल इफ़ेक्ट", rowStudio: "क्रिएटर स्टूडियो", rowSecurity: "सुरक्षा केंद्र",
      rowDeleteAccount: "मेरा खाता हटाएं", rowTerms: "शर्तें और नीतियां", rowLogout: "लॉग आउट करें",
      yourAmoraProfile: "आपकी अमोरा प्रोफ़ाइल", levelPrefix: "लेवल", freeMember: "मुफ्त सदस्य"
    },
    settingsScreen: {
      errorLoad: "सेटिंग्स लोड नहीं हो सकीं।",
      savedTitle: "सहेजा गया", savedBody: "आपकी सेटिंग्स अपडेट कर दी गई हैं।",
      errorSave: "सेटिंग्स सहेजी नहीं जा सकीं।",
      deleteAccountTitle: "अपना अमोरा खाता हटाएं?", deleteAccountBody: "यह आपके खाते को स्थायी रूप से हटा देता है और इसे पूर्ववत नहीं किया जा सकता।", deleteWord: "हटाएं",
      errorDeleteAccount: "खाता हटाया नहीं जा सका।",
      kicker: "अमोरा खाता", title: "सेटिंग्स",
      profileSection: "प्रोफ़ाइल", displayNameLabel: "प्रदर्शित नाम", bioLabel: "बायो",
      privacySection: "गोपनीयता", safetySecurityRow: "🛡️ सुरक्षा और संरक्षण",
      savingEllipsis: "सहेजा जा रहा है…", saveChanges: "बदलाव सहेजें",
      membershipRow: "सदस्यता और VIP", walletRow: "वॉलेट और कॉइन", notificationsRow: "सूचनाएं",
      logout: "लॉग आउट करें", deleteMyAccount: "मेरा खाता हटाएं"
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
    },
    notificationsScreen: {
      title: "Notifikasi", markAllRead: "Tandai semua dibaca",
      errorLoad: "Tidak dapat memuat notifikasi.", allCaughtUp: "Anda sudah update.",
      someoneFallback: "Seseorang", newMatch: "Anda punya kecocokan baru!", superLikedYou: "memberi Anda super like!",
      sentMessage: "mengirimi Anda pesan", youReceived: "Anda menerima", giftFallback: "hadiah",
      levelUpTo: "Naik level! Sekarang Anda level", dailyRewardClaimed: "Hadiah harian diklaim: +", coinsWord: "koin",
      yourWord: "Bonus bulanan Anda", monthlyBonusArrived: "telah tiba: +",
      missionComplete: "Misi selesai:", missionFallback: "sebuah misi", notificationFallback: "Notifikasi",
      justNow: "baru saja", minAgo: "m lalu", hAgo: "j lalu", dAgo: "h lalu"
    },
    eventsScreen: {
      openingEvent: "Membuka acara…", kicker: "ACARA AMORA", headerTitle: "Pertempuran Tim",
      noLiveEvent: "Tidak ada acara langsung saat ini", checkBackSoon: "Kembali lagi nanti untuk pertempuran Amora berikutnya.",
      liveEventKicker: "ACARA LANGSUNG",
      errorLoad: "Tidak dapat memuat acara saat ini.", errorJoinTeam: "Tidak dapat bergabung dengan tim ini.",
      pickYourSide: "Pilih sisi Anda", sendGiftsHelp: "Kirim hadiah untuk membantu tim Anda menang.",
      yourTeamKicker: "TIM ANDA", giftsCountToward: "Hadiah Anda sekarang terhitung untuk skor tim ini.",
      battleScore: "Skor pertempuran", live: "LANGSUNG",
      topContributors: "Kontributor teratas", noOneScoredYet: "Belum ada yang mencetak skor — jadilah yang pertama!", ptsSuffix: "poin",
      ended: "Berakhir", dayUnit: "h", hourUnit: "j", minuteUnit: "m", left: "tersisa"
    },
    securityScreen: {
      alertTitle: "Pusat Keamanan", errorLoad: "Tidak dapat memuat pengaturan keamanan Anda.",
      privacyAlertTitle: "Privasi", errorUpdatePrivacy: "Tidak dapat memperbarui privasi.",
      passwordAlertTitle: "Kata sandi", useAtLeast10: "Gunakan minimal 10 karakter.", passwordsDontMatch: "Kata sandi baru tidak cocok.",
      passwordChangedTitle: "Kata sandi diubah", passwordChangedBody: "Untuk perlindungan Anda, semua sesi yang ada telah dicabut. Silakan masuk lagi.", signIn: "Masuk",
      errorChangePassword: "Tidak dapat mengubah kata sandi.",
      deviceAlertTitle: "Perangkat", errorRevokeSession: "Tidak dapat mencabut sesi ini.",
      devicesSecuredTitle: "Perangkat diamankan", otherSessionRevoked: "sesi lain dicabut.", otherSessionsRevoked: "sesi lain dicabut.",
      devicesAlertTitle: "Perangkat", errorRevokeOthers: "Tidak dapat mencabut sesi lain.",
      kicker: "KEAMANAN AMORA", title: "Pusat Keamanan", subtitle: "Lindungi identitas, perangkat, dan momen pribadi Anda.",
      excellentProtection: "Perlindungan sangat baik", strongProtection: "Perlindungan kuat", goodProtection: "Perlindungan baik", protectionNeedsAttention: "Perlindungan perlu diperhatikan",
      defaultRecommendation: "Akun Amora Anda sedang dilindungi.",
      emailVerified: "Email terverifikasi", ageVerified: "Usia terverifikasi", privacyConfigured: "Privasi terkonfigurasi", devicesMonitored: "Perangkat dipantau",
      protectedWord: "Terlindungi", review: "Tinjau",
      privacyShield: "Perisai privasi",
      showOnlineStatus: "Tampilkan status online", showOnlineStatusHint: "Biarkan orang lain melihat kapan Anda online.",
      discoverableProfile: "Profil dapat ditemukan", discoverableProfileHint: "Izinkan profil Anda muncul di penemuan.",
      showAge: "Tampilkan usia", showAgeHint: "Tampilkan usia Anda di profil publik Anda.",
      showLocation: "Tampilkan lokasi", showLocationHint: "Tampilkan kota/negara pilihan Anda.",
      yourDevices: "Perangkat Anda",
      unknownDevice: "Perangkat tidak dikenal", protectedConnection: "Koneksi terlindungi", mostRecent: "Terbaru",
      revoke: "Cabut", securingEllipsis: "Mengamankan…", logOutAllOtherDevices: "Keluar dari semua perangkat lain",
      changePasswordSection: "Ubah kata sandi",
      currentPasswordPlaceholder: "Kata sandi saat ini", newPasswordPlaceholder: "Kata sandi baru (10+ karakter)", confirmPasswordPlaceholder: "Konfirmasi kata sandi baru",
      changePasswordSecurely: "Ubah kata sandi dengan aman",
      securityNote: "Amora tidak pernah menampilkan atau menyimpan kata sandi teks biasa Anda. Perubahan kata sandi yang berhasil mencabut sesi yang ada.",
      footerTitle: "KEPERCAYAAN AMORA", footerText: "Alat lapor, blokir, dan bisukan tetap tersedia di seluruh aplikasi. Aktivitas mencurigakan dibatasi lajunya dan peristiwa keamanan dicatat untuk perlindungan dan dukungan."
    },
    messagesScreen: {
      errorLoad: "Tidak dapat memuat pesan Anda.", kicker: "AMORA PRIBADI", title: "Pesan",
      somethingWrong: "Terjadi kesalahan", tryAgain: "Coba lagi",
      yourPrivateSpace: "Ruang pribadi Anda", matchesWillAppear: "Kecocokan dan percakapan Anda akan muncul di sini.", startMatchingArrow: "Mulai mencocokkan →",
      startConversation: "Mulai percakapan…", now: "sekarang"
    },
    profileScreen: {
      errorLoad: "Tidak dapat memuat profil Anda.",
      permissionNeededTitle: "Izin diperlukan", permissionNeededBody: "Amora memerlukan akses ke foto Anda untuk mengatur foto profil.",
      photoUploadFailed: "Unggah foto gagal.",
      deleteAccountTitle: "Hapus akun Amora Anda?", deleteAccountBody: "Ini akan menghapus akun Anda secara permanen dan tidak dapat dibatalkan.", deleteWord: "Hapus",
      errorDeleteAccount: "Tidak dapat menghapus akun Anda.",
      rowSettings: "Pengaturan", rowMembership: "Keanggotaan & VIP", rowLevel: "Level & lencana saya", rowRewards: "Hadiah harian",
      rowOutfits: "Kostum & efek profil saya", rowStudio: "Studio Kreator", rowSecurity: "Pusat Keamanan",
      rowDeleteAccount: "Hapus akun saya", rowTerms: "Ketentuan & kebijakan", rowLogout: "Keluar",
      yourAmoraProfile: "Profil Amora Anda", levelPrefix: "Level", freeMember: "Anggota gratis"
    },
    settingsScreen: {
      errorLoad: "Tidak dapat memuat pengaturan.",
      savedTitle: "Disimpan", savedBody: "Pengaturan Anda telah diperbarui.",
      errorSave: "Tidak dapat menyimpan pengaturan.",
      deleteAccountTitle: "Hapus akun Amora Anda?", deleteAccountBody: "Ini akan menghapus akun Anda secara permanen dan tidak dapat dibatalkan.", deleteWord: "Hapus",
      errorDeleteAccount: "Tidak dapat menghapus akun.",
      kicker: "AKUN AMORA", title: "Pengaturan",
      profileSection: "Profil", displayNameLabel: "Nama tampilan", bioLabel: "Bio",
      privacySection: "Privasi", safetySecurityRow: "🛡️ Keamanan & Perlindungan",
      savingEllipsis: "Menyimpan…", saveChanges: "Simpan perubahan",
      membershipRow: "Keanggotaan & VIP", walletRow: "Dompet & Koin", notificationsRow: "Notifikasi",
      logout: "Keluar", deleteMyAccount: "Hapus akun saya"
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
