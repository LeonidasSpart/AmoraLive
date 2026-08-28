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
    },
    levelsScreen: {
      kicker: "AMORA ROYAL CLUB", title: "Your level. Your aura.", xpWord: "XP", xpUntilNext: "XP until your next unlock",
      privileges: "Privileges", unlocked: "UNLOCKED", locked: "LOCKED",
      perk1Title: "Medal of Honor", perk1Desc: "A signature badge beside your profile",
      perk2Title: "Glow Entrance", perk2Desc: "A premium entrance effect in live rooms",
      perk3Title: "Creator Chat", perk3Desc: "Enhanced chat styling",
      perk4Title: "VIP Gift Set", perk4Desc: "Special gifts reserved for rising stars",
      perk5Title: "Profile Spotlight", perk5Desc: "A premium profile highlight",
      perk6Title: "Elite Effects", perk6Desc: "Exclusive live-room effects",
      perk7Title: "Golden Aura", perk7Desc: "A royal profile aura and badge",
      perk8Title: "Hidden Status", perk8Desc: "Optional discreet online visibility",
      perk9Title: "Royal Creator", perk9Desc: "A signature creator identity and premium frame"
    },
    membershipScreen: {
      kicker: "AMORA PRIVILEGE", title: "VIP Membership", sub: "A more beautiful way to enjoy AmoraLive.",
      errorLoad: "Unable to load membership.", checkoutUnavailable: "Checkout is not available right now.",
      noReceiptIOS: "No receipt returned from the App Store.", noTokenAndroid: "No purchase token returned from Google Play.",
      errorStart: "Unable to start membership.",
      chooseVipTitle: "Choose VIP", subscribeQuestionPrefix: "Subscribe to", thisPlanFallback: "this plan",
      subscribe: "Subscribe",
      notAvailableTitle: "Not available", notAvailableBody: "Restore Purchases needs the native app build — it isn't available in this preview.",
      nothingToRestoreTitle: "Nothing to restore", nothingToRestoreBody: "No active subscription was found for this account.",
      restoredTitle: "Restored", restoredBody: "Your membership has been restored.",
      errorRestore: "Unable to restore purchases.",
      yourMembership: "YOUR MEMBERSHIP", freeWord: "Free",
      restoring: "Restoring…", restorePurchases: "Restore Purchases",
      nativeStoreHint: "Native store purchases aren't available in this build — using secure web checkout instead.",
      defaultPerk1: "VIP badge & profile frame", defaultPerk2: "Exclusive gifts", defaultPerk3: "VIP rooms", defaultPerk4: "Monthly perks",
      chooseVip: "Choose VIP"
    },
    missionsScreen: {
      kicker: "AMORA PROGRESSION", title: "Missions & Achievements",
      errorLoad: "Unable to load missions.", errorClaim: "Unable to claim reward.",
      typeDaily: "📅 Daily", typeWeekly: "🗓️ Weekly", typeLifetime: "🏆 Achievements",
      claimed: "✓ Claimed", claiming: "Claiming…", claimReward: "Claim reward", inProgress: "In progress"
    },
    outfitsScreen: {
      kicker: "AMORA COLLECTION", title: "Dress your aura.",
      subtitle: "Frames, effects, badges and profile styles that make your Amora identity yours.",
      errorLoad: "Unable to load your collection.", errorUpdate: "Unable to update your look.",
      equipped: "Equipped", equip: "Equip", notOwned: "Not owned", coinsWord: "coins"
    },
    rewardsScreen: {
      kicker: "AMORA REWARDS", title: "Come back. Get rewarded.",
      errorLoad: "Unable to load rewards.", errorClaimNotAvailable: "Reward is not available yet.",
      dayStreakSuffix: "day streak", coinsAvailableTodaySuffix: "coins available today",
      claimedToday: "✓ Claimed today", claiming: "Claiming…", claimDailyReward: "Claim daily reward",
      historyTitle: "Reward history",
      rewardFallback: "Reward", dayOfCyclePrefix: "Day", ofCycle: "of cycle", milestoneSuffix: "milestone"
    },
    storeScreen: {
      kicker: "AMORA LUXURY VAULT", title: "Boutique",
      errorLoad: "Unable to load the store.", errorBuy: "Purchase failed.", errorUpdate: "Unable to update item.",
      permanent: "Permanent", equippedCheck: "Equipped ✓", equip: "Equip", buying: "Buying…", notEnoughCoins: "Not enough coins", buy: "Buy"
    },
    studioScreen: {
      kicker: "AMORA CREATOR", title: "Creator Studio", errorLoad: "Unable to load Creator Studio.",
      followers: "Followers", newThisWeek: "New this week", streams: "Streams", liveTime: "Live time",
      peakViewers: "Peak viewers", giftsReceived: "Gifts received", earnings: "Earnings", level: "Level",
      quickTools: "Quick tools", goLive: "🔴 Go Live", missionsLink: "🎯 Missions", walletLink: "🎁 Wallet",
      last30Days: "Last 30 days", followersSuffix: "followers"
    },
    withdrawScreen: {
      kicker: "AMORA CREATOR PAYOUTS", title: "Withdraw",
      errorLoad: "Unable to load withdrawal information.",
      minWithdrawalError: "Minimum withdrawal is", coinsWord: "coins",
      maxBalanceError: "You cannot withdraw more than your balance.",
      enterPayoutDetails: "Enter your payout details.",
      requestSubmittedPrefix: "Withdrawal submitted for", errorSubmit: "Unable to submit withdrawal.",
      minimumPrefix: "Minimum:", ratePrefix: "Rate:", perCoinSuffix: "¢ / coin",
      coinsAmountLabel: "Coins amount", payoutMethodLabel: "Payout method", payoutDetailsLabel: "Payout details",
      detailsPlaceholder: "Email or bank details",
      submitting: "Submitting…", requestWithdrawal: "Request withdrawal", historyTitle: "History",
      methodPaypal: "PAYPAL", methodBank: "BANK", methodOther: "OTHER"
    },
    discoverScreen: {
      kicker: "AMORA", title: "Discover", subtitle: "Find people, creators and live rooms worth your time.",
      searchPlaceholder: "Search creators, rooms…",
      catForYou: "For You", catLive: "Live", catCreators: "Creators", catDating: "Dating", catNew: "New",
      errorLoad: "Unable to load Discover.", memberFallback: "Amora member", liveTag: "🔴 LIVE",
      nothingHere: "Nothing here yet. Try another category.",
      verifiedCreator: "Verified creator", creatorWord: "Creator"
    },
    datingScreen: {
      kicker: "AMORA", title: "Discover Love", matchesLink: "Matches ♡",
      errorLoad: "Unable to load dating.", memberFallback: "Amora member", compatibleSuffix: "% compatible",
      allCaughtUp: "You're all caught up", comeBackLater: "Come back later for new connections."
    },
    liveScreen: {
      kicker: "AMORA LIVE", title: "Live now", goLive: "● Go Live",
      heroKicker: "REAL-TIME CONNECTIONS", heroTitle: "Find a room that feels alive.",
      heroSub: "Join conversations, meet new people and send premium 3D gifts.",
      errorLoad: "Unable to load live rooms.",
      noOneLive: "No one is live right now", beFirst: "Be the first — tap Go Live above.",
      generalFallback: "General"
    },
    storiesScreen: {
      kicker: "AMORA", title: "Stories", errorLoad: "Unable to load stories.",
      amoraFallback: "Amora", noStoriesYet: "No stories yet. Be the first to share a moment."
    },
    deleteAccountScreen: {
      kicker: "ACCOUNT PRIVACY", title: "Delete your Amora account.",
      subtitle: "Enter the email associated with your account. We will send a secure confirmation link.",
      defaultDoneMessage: "If an Amora account exists for that email, a confirmation link has been sent.",
      errorGeneric: "Unable to process your request.", checkInbox: "Check your inbox.",
      emailLabel: "Email address", requestButton: "Request account deletion",
      note: "Some records may be retained or anonymized where required for security, fraud prevention, financial records or legal obligations."
    },
    socialCompleteScreen: {
      missingSession: "This sign-in session is missing or invalid.",
      errorContinue: "Unable to continue social registration.",
      invalidEmail: "Enter a valid email address.",
      invalidUsername: "Choose a username with 3–20 letters, numbers, dots, dashes or underscores.",
      invalidDob: "Enter your date of birth as YYYY-MM-DD.",
      errorFinishPrefix: "Unable to finish", errorFinishSuffix: "registration.",
      securelyConnectingPrefix: "Securely connecting to",
      brand: "AMORA", title: "Finish your account.",
      subtitle: "One last step — choose your Amora username and confirm that you are 18+.",
      emailPlaceholder: "Email address", usernamePlaceholder: "Username (3-20 characters)", dobPlaceholder: "Date of birth (YYYY-MM-DD)",
      continueToAmora: "Continue to Amora"
    },
    videoMatchScreen: {
      kicker: "AMORA · VIDEO MATCH", title: "Meet face-to-face.",
      introTitle: "Quick Video Match", introText: "A short first impression. If you both like each other, Amora creates a match.",
      startButton: "Start Video Match", findingSomeone: "Finding someone…", connecting: "Connecting…",
      stayHere: "Stay here while Amora finds a compatible person.",
      someoneWord: "Someone", isHereSuffix: "is here", readyToMeet: "Ready to meet",
      waitingForVideo: "Waiting for video…", howDidItFeel: "How did it feel?",
      pass: "Pass", like: "♥ Like",
      matchExclaim: "It's a match!", noMatchThisTime: "No match this time",
      matchedBody: "You both liked each other. Your new connection is ready.",
      keepExploring: "Keep exploring — there are more people to meet.",
      openMatches: "Open Matches", tryAgain: "Try Again",
      errorAuth: "Unable to authenticate. Please sign in again.", errorConnect: "Unable to connect.",
      errorVideoConnect: "Unable to connect video.", errorMatchFailed: "Video match failed."
    },
    videoScreen: {
      title: "Video call", memberFallback: "Amora member",
      readyLine: "LiveKit call screen ready.",
      connectHint: "Connect the existing native LiveKit Room here for the production media session.",
      endCall: "End call"
    },
    chatScreen: {
      chatFallback: "Chat", privateConversation: "Private conversation",
      startConversation: "Start the conversation. Keep it kind. 💗", messagePlaceholder: "Write a message…"
    },
    creatorProfileScreen: {
      errorLoad: "Unable to load profile.", errorUpdateFollow: "Unable to update follow.", notFound: "Creator not found.",
      followersSuffix: "followers", levelWord: "level", following: "Following", follow: "Follow", message: "Message"
    },
    liveRoomScreen: {
      errorRealtimeAuth: "Realtime connection failed to authenticate.", inviteDeclined: "Your battle invite was declined.",
      battleDraw: "🤝 It's a draw!", battleWon: "🏆 You won the battle!", battleLost: "😢 You lost the battle.",
      errorConnect: "Unable to connect to the live stream.", liveWord: "LIVE",
      videoUnavailable: "Video unavailable", connectingVideo: "Connecting video…",
      roomTitleFallback: "Live room", creatorFallback: "Creator", wantsToBattleSuffix: "wants to battle!",
      streamerFallback: "A streamer", accept: "Accept", decline: "Decline", endBattle: "End Battle",
      gift: "Gift", message: "Message", aboutThisLive: "About this live", generalFallback: "General", watchingSuffix: "watching"
    },
    videoDateScreen: {
      errorStart: "Unable to start this video date.", backToMatches: "Back to Matches",
      waitingOtherPerson: "Waiting for the other person…", connecting: "Connecting…"
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
    },
    levelsScreen: {
      kicker: "CLUB REAL AMORA", title: "Tu nivel. Tu aura.", xpWord: "XP", xpUntilNext: "XP para tu próximo desbloqueo",
      privileges: "Privilegios", unlocked: "DESBLOQUEADO", locked: "BLOQUEADO",
      perk1Title: "Medalla de Honor", perk1Desc: "Una insignia distintiva junto a tu perfil",
      perk2Title: "Entrada Resplandeciente", perk2Desc: "Un efecto de entrada premium en salas en vivo",
      perk3Title: "Chat de Creador", perk3Desc: "Estilo de chat mejorado",
      perk4Title: "Set de Regalos VIP", perk4Desc: "Regalos especiales reservados para estrellas en ascenso",
      perk5Title: "Reflector de Perfil", perk5Desc: "Un destaque premium para tu perfil",
      perk6Title: "Efectos de Élite", perk6Desc: "Efectos exclusivos en salas en vivo",
      perk7Title: "Aura Dorada", perk7Desc: "Un aura de perfil real y una insignia",
      perk8Title: "Estado Oculto", perk8Desc: "Visibilidad en línea discreta opcional",
      perk9Title: "Creador Real", perk9Desc: "Una identidad de creador distintiva y un marco premium"
    },
    membershipScreen: {
      kicker: "PRIVILEGIO AMORA", title: "Membresía VIP", sub: "Una forma más hermosa de disfrutar AmoraLive.",
      errorLoad: "No se pudo cargar la membresía.", checkoutUnavailable: "El pago no está disponible en este momento.",
      noReceiptIOS: "No se recibió el recibo de la App Store.", noTokenAndroid: "No se recibió el token de compra de Google Play.",
      errorStart: "No se pudo iniciar la membresía.",
      chooseVipTitle: "Elegir VIP", subscribeQuestionPrefix: "¿Suscribirse a", thisPlanFallback: "este plan",
      subscribe: "Suscribirse",
      notAvailableTitle: "No disponible", notAvailableBody: "Restaurar compras necesita la app nativa — no está disponible en esta vista previa.",
      nothingToRestoreTitle: "Nada que restaurar", nothingToRestoreBody: "No se encontró ninguna suscripción activa para esta cuenta.",
      restoredTitle: "Restaurado", restoredBody: "Tu membresía ha sido restaurada.",
      errorRestore: "No se pudieron restaurar las compras.",
      yourMembership: "TU MEMBRESÍA", freeWord: "Gratis",
      restoring: "Restaurando…", restorePurchases: "Restaurar compras",
      nativeStoreHint: "Las compras nativas no están disponibles en esta versión; se usará el pago web seguro.",
      defaultPerk1: "Insignia VIP y marco de perfil", defaultPerk2: "Regalos exclusivos", defaultPerk3: "Salas VIP", defaultPerk4: "Beneficios mensuales",
      chooseVip: "Elegir VIP"
    },
    missionsScreen: {
      kicker: "PROGRESIÓN AMORA", title: "Misiones y logros",
      errorLoad: "No se pudieron cargar las misiones.", errorClaim: "No se pudo reclamar la recompensa.",
      typeDaily: "📅 Diarias", typeWeekly: "🗓️ Semanales", typeLifetime: "🏆 Logros",
      claimed: "✓ Reclamado", claiming: "Reclamando…", claimReward: "Reclamar recompensa", inProgress: "En progreso"
    },
    outfitsScreen: {
      kicker: "COLECCIÓN AMORA", title: "Viste tu aura.",
      subtitle: "Marcos, efectos, insignias y estilos de perfil que hacen tu identidad Amora tuya.",
      errorLoad: "No se pudo cargar tu colección.", errorUpdate: "No se pudo actualizar tu look.",
      equipped: "Equipado", equip: "Equipar", notOwned: "No adquirido", coinsWord: "monedas"
    },
    rewardsScreen: {
      kicker: "RECOMPENSAS AMORA", title: "Vuelve. Sé recompensado.",
      errorLoad: "No se pudieron cargar las recompensas.", errorClaimNotAvailable: "La recompensa aún no está disponible.",
      dayStreakSuffix: "días de racha", coinsAvailableTodaySuffix: "monedas disponibles hoy",
      claimedToday: "✓ Reclamado hoy", claiming: "Reclamando…", claimDailyReward: "Reclamar recompensa diaria",
      historyTitle: "Historial de recompensas",
      rewardFallback: "Recompensa", dayOfCyclePrefix: "Día", ofCycle: "del ciclo", milestoneSuffix: "hito"
    },
    storeScreen: {
      kicker: "BÓVEDA DE LUJO AMORA", title: "Boutique",
      errorLoad: "No se pudo cargar la tienda.", errorBuy: "Compra fallida.", errorUpdate: "No se pudo actualizar el artículo.",
      permanent: "Permanente", equippedCheck: "Equipado ✓", equip: "Equipar", buying: "Comprando…", notEnoughCoins: "Monedas insuficientes", buy: "Comprar"
    },
    studioScreen: {
      kicker: "CREADOR AMORA", title: "Estudio de Creador", errorLoad: "No se pudo cargar el Estudio de Creador.",
      followers: "Seguidores", newThisWeek: "Nuevos esta semana", streams: "Transmisiones", liveTime: "Tiempo en vivo",
      peakViewers: "Pico de espectadores", giftsReceived: "Regalos recibidos", earnings: "Ganancias", level: "Nivel",
      quickTools: "Herramientas rápidas", goLive: "🔴 Ir en vivo", missionsLink: "🎯 Misiones", walletLink: "🎁 Billetera",
      last30Days: "Últimos 30 días", followersSuffix: "seguidores"
    },
    withdrawScreen: {
      kicker: "PAGOS A CREADORES AMORA", title: "Retirar",
      errorLoad: "No se pudo cargar la información de retiro.",
      minWithdrawalError: "El retiro mínimo es", coinsWord: "monedas",
      maxBalanceError: "No puedes retirar más de tu saldo.",
      enterPayoutDetails: "Ingresa los detalles de tu pago.",
      requestSubmittedPrefix: "Retiro enviado por", errorSubmit: "No se pudo enviar el retiro.",
      minimumPrefix: "Mínimo:", ratePrefix: "Tasa:", perCoinSuffix: "¢ / moneda",
      coinsAmountLabel: "Cantidad de monedas", payoutMethodLabel: "Método de pago", payoutDetailsLabel: "Detalles de pago",
      detailsPlaceholder: "Correo o datos bancarios",
      submitting: "Enviando…", requestWithdrawal: "Solicitar retiro", historyTitle: "Historial",
      methodPaypal: "PAYPAL", methodBank: "BANCO", methodOther: "OTRO"
    },
    discoverScreen: {
      kicker: "AMORA", title: "Descubrir", subtitle: "Encuentra personas, creadores y salas en vivo que valgan tu tiempo.",
      searchPlaceholder: "Buscar creadores, salas…",
      catForYou: "Para ti", catLive: "En vivo", catCreators: "Creadores", catDating: "Citas", catNew: "Nuevo",
      errorLoad: "No se pudo cargar Descubrir.", memberFallback: "Miembro de Amora", liveTag: "🔴 EN VIVO",
      nothingHere: "Nada por aquí todavía. Prueba otra categoría.",
      verifiedCreator: "Creador verificado", creatorWord: "Creador"
    },
    datingScreen: {
      kicker: "AMORA", title: "Descubre el amor", matchesLink: "Matches ♡",
      errorLoad: "No se pudo cargar las citas.", memberFallback: "Miembro de Amora", compatibleSuffix: "% compatible",
      allCaughtUp: "Estás al día", comeBackLater: "Vuelve más tarde para nuevas conexiones."
    },
    liveScreen: {
      kicker: "AMORA EN VIVO", title: "En vivo ahora", goLive: "● Ir en vivo",
      heroKicker: "CONEXIONES EN TIEMPO REAL", heroTitle: "Encuentra una sala que se sienta viva.",
      heroSub: "Únete a conversaciones, conoce gente nueva y envía regalos 3D premium.",
      errorLoad: "No se pudieron cargar las salas en vivo.",
      noOneLive: "Nadie está en vivo ahora", beFirst: "Sé el primero — toca Ir en vivo arriba.",
      generalFallback: "General"
    },
    storiesScreen: {
      kicker: "AMORA", title: "Historias", errorLoad: "No se pudieron cargar las historias.",
      amoraFallback: "Amora", noStoriesYet: "Aún no hay historias. Sé el primero en compartir un momento."
    },
    deleteAccountScreen: {
      kicker: "PRIVACIDAD DE CUENTA", title: "Elimina tu cuenta de Amora.",
      subtitle: "Introduce el correo asociado a tu cuenta. Te enviaremos un enlace de confirmación seguro.",
      defaultDoneMessage: "Si existe una cuenta de Amora con ese correo, se ha enviado un enlace de confirmación.",
      errorGeneric: "No se pudo procesar tu solicitud.", checkInbox: "Revisa tu bandeja de entrada.",
      emailLabel: "Correo electrónico", requestButton: "Solicitar eliminación de cuenta",
      note: "Algunos registros pueden conservarse o anonimizarse cuando lo exijan la seguridad, la prevención de fraude, registros financieros u obligaciones legales."
    },
    socialCompleteScreen: {
      missingSession: "Esta sesión de inicio de sesión falta o no es válida.",
      errorContinue: "No se pudo continuar con el registro social.",
      invalidEmail: "Introduce un correo electrónico válido.",
      invalidUsername: "Elige un usuario con 3–20 letras, números, puntos, guiones o guiones bajos.",
      invalidDob: "Introduce tu fecha de nacimiento como AAAA-MM-DD.",
      errorFinishPrefix: "No se pudo finalizar el registro de", errorFinishSuffix: ".",
      securelyConnectingPrefix: "Conectando de forma segura con",
      brand: "AMORA", title: "Finaliza tu cuenta.",
      subtitle: "Un último paso — elige tu nombre de usuario de Amora y confirma que tienes 18+.",
      emailPlaceholder: "Correo electrónico", usernamePlaceholder: "Usuario (3-20 caracteres)", dobPlaceholder: "Fecha de nacimiento (AAAA-MM-DD)",
      continueToAmora: "Continuar a Amora"
    },
    videoMatchScreen: {
      kicker: "AMORA · VIDEO MATCH", title: "Conócete cara a cara.",
      introTitle: "Video Match rápido", introText: "Una breve primera impresión. Si ambos se gustan, Amora crea un match.",
      startButton: "Iniciar Video Match", findingSomeone: "Buscando a alguien…", connecting: "Conectando…",
      stayHere: "Quédate aquí mientras Amora encuentra a alguien compatible.",
      someoneWord: "Alguien", isHereSuffix: "está aquí", readyToMeet: "Listo para conocerte",
      waitingForVideo: "Esperando video…", howDidItFeel: "¿Cómo se sintió?",
      pass: "Pasar", like: "♥ Me gusta",
      matchExclaim: "¡Es un match!", noMatchThisTime: "Esta vez no hubo match",
      matchedBody: "Ambos se gustaron. Tu nueva conexión está lista.",
      keepExploring: "Sigue explorando — hay más personas por conocer.",
      openMatches: "Abrir Matches", tryAgain: "Intentar de nuevo",
      errorAuth: "No se pudo autenticar. Inicia sesión de nuevo.", errorConnect: "No se pudo conectar.",
      errorVideoConnect: "No se pudo conectar el video.", errorMatchFailed: "El video match falló."
    },
    videoScreen: {
      title: "Videollamada", memberFallback: "Miembro de Amora",
      readyLine: "Pantalla de llamada LiveKit lista.",
      connectHint: "Conecta la Sala LiveKit nativa existente aquí para la sesión de medios de producción.",
      endCall: "Finalizar llamada"
    },
    chatScreen: {
      chatFallback: "Chat", privateConversation: "Conversación privada",
      startConversation: "Comienza la conversación. Sé amable. 💗", messagePlaceholder: "Escribe un mensaje…"
    },
    creatorProfileScreen: {
      errorLoad: "No se pudo cargar el perfil.", errorUpdateFollow: "No se pudo actualizar el seguimiento.", notFound: "Creador no encontrado.",
      followersSuffix: "seguidores", levelWord: "nivel", following: "Siguiendo", follow: "Seguir", message: "Mensaje"
    },
    liveRoomScreen: {
      errorRealtimeAuth: "La conexión en tiempo real no pudo autenticarse.", inviteDeclined: "Tu invitación a la batalla fue rechazada.",
      battleDraw: "🤝 ¡Es un empate!", battleWon: "🏆 ¡Ganaste la batalla!", battleLost: "😢 Perdiste la batalla.",
      errorConnect: "No se pudo conectar a la transmisión en vivo.", liveWord: "EN VIVO",
      videoUnavailable: "Video no disponible", connectingVideo: "Conectando video…",
      roomTitleFallback: "Sala en vivo", creatorFallback: "Creador", wantsToBattleSuffix: "¡quiere batallar!",
      streamerFallback: "Un streamer", accept: "Aceptar", decline: "Rechazar", endBattle: "Terminar batalla",
      gift: "Regalo", message: "Mensaje", aboutThisLive: "Acerca de este directo", generalFallback: "General", watchingSuffix: "viendo"
    },
    videoDateScreen: {
      errorStart: "No se pudo iniciar esta videocita.", backToMatches: "Volver a Matches",
      waitingOtherPerson: "Esperando a la otra persona…", connecting: "Conectando…"
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
    },
    levelsScreen: {
      kicker: "CLUBE REAL AMORA", title: "Seu nível. Sua aura.", xpWord: "XP", xpUntilNext: "XP até seu próximo desbloqueio",
      privileges: "Privilégios", unlocked: "DESBLOQUEADO", locked: "BLOQUEADO",
      perk1Title: "Medalha de Honra", perk1Desc: "Um emblema exclusivo ao lado do seu perfil",
      perk2Title: "Entrada Radiante", perk2Desc: "Um efeito de entrada premium em salas ao vivo",
      perk3Title: "Chat de Criador", perk3Desc: "Estilo de chat aprimorado",
      perk4Title: "Kit de Presentes VIP", perk4Desc: "Presentes especiais reservados para estrelas em ascensão",
      perk5Title: "Destaque de Perfil", perk5Desc: "Um destaque premium para o seu perfil",
      perk6Title: "Efeitos de Elite", perk6Desc: "Efeitos exclusivos em salas ao vivo",
      perk7Title: "Aura Dourada", perk7Desc: "Uma aura de perfil real e um emblema",
      perk8Title: "Status Oculto", perk8Desc: "Visibilidade online discreta opcional",
      perk9Title: "Criador Real", perk9Desc: "Uma identidade de criador exclusiva e uma moldura premium"
    },
    membershipScreen: {
      kicker: "PRIVILÉGIO AMORA", title: "Assinatura VIP", sub: "Uma forma mais bonita de aproveitar a AmoraLive.",
      errorLoad: "Não foi possível carregar a assinatura.", checkoutUnavailable: "O checkout não está disponível no momento.",
      noReceiptIOS: "Nenhum recibo retornado pela App Store.", noTokenAndroid: "Nenhum token de compra retornado pelo Google Play.",
      errorStart: "Não foi possível iniciar a assinatura.",
      chooseVipTitle: "Escolher VIP", subscribeQuestionPrefix: "Assinar", thisPlanFallback: "este plano",
      subscribe: "Assinar",
      notAvailableTitle: "Não disponível", notAvailableBody: "Restaurar compras precisa do app nativo — não está disponível nesta prévia.",
      nothingToRestoreTitle: "Nada para restaurar", nothingToRestoreBody: "Nenhuma assinatura ativa foi encontrada para esta conta.",
      restoredTitle: "Restaurado", restoredBody: "Sua assinatura foi restaurada.",
      errorRestore: "Não foi possível restaurar as compras.",
      yourMembership: "SUA ASSINATURA", freeWord: "Gratuito",
      restoring: "Restaurando…", restorePurchases: "Restaurar compras",
      nativeStoreHint: "Compras nativas não estão disponíveis nesta versão — usando checkout web seguro.",
      defaultPerk1: "Emblema VIP e moldura de perfil", defaultPerk2: "Presentes exclusivos", defaultPerk3: "Salas VIP", defaultPerk4: "Benefícios mensais",
      chooseVip: "Escolher VIP"
    },
    missionsScreen: {
      kicker: "PROGRESSÃO AMORA", title: "Missões e Conquistas",
      errorLoad: "Não foi possível carregar as missões.", errorClaim: "Não foi possível resgatar a recompensa.",
      typeDaily: "📅 Diárias", typeWeekly: "🗓️ Semanais", typeLifetime: "🏆 Conquistas",
      claimed: "✓ Resgatado", claiming: "Resgatando…", claimReward: "Resgatar recompensa", inProgress: "Em andamento"
    },
    outfitsScreen: {
      kicker: "COLEÇÃO AMORA", title: "Vista sua aura.",
      subtitle: "Molduras, efeitos, emblemas e estilos de perfil que tornam sua identidade Amora sua.",
      errorLoad: "Não foi possível carregar sua coleção.", errorUpdate: "Não foi possível atualizar seu visual.",
      equipped: "Equipado", equip: "Equipar", notOwned: "Não adquirido", coinsWord: "moedas"
    },
    rewardsScreen: {
      kicker: "RECOMPENSAS AMORA", title: "Volte sempre. Seja recompensado.",
      errorLoad: "Não foi possível carregar as recompensas.", errorClaimNotAvailable: "A recompensa ainda não está disponível.",
      dayStreakSuffix: "dias seguidos", coinsAvailableTodaySuffix: "moedas disponíveis hoje",
      claimedToday: "✓ Resgatado hoje", claiming: "Resgatando…", claimDailyReward: "Resgatar recompensa diária",
      historyTitle: "Histórico de recompensas",
      rewardFallback: "Recompensa", dayOfCyclePrefix: "Dia", ofCycle: "do ciclo", milestoneSuffix: "marco"
    },
    storeScreen: {
      kicker: "COFRE DE LUXO AMORA", title: "Boutique",
      errorLoad: "Não foi possível carregar a loja.", errorBuy: "Falha na compra.", errorUpdate: "Não foi possível atualizar o item.",
      permanent: "Permanente", equippedCheck: "Equipado ✓", equip: "Equipar", buying: "Comprando…", notEnoughCoins: "Moedas insuficientes", buy: "Comprar"
    },
    studioScreen: {
      kicker: "CRIADOR AMORA", title: "Estúdio do Criador", errorLoad: "Não foi possível carregar o Estúdio do Criador.",
      followers: "Seguidores", newThisWeek: "Novos esta semana", streams: "Transmissões", liveTime: "Tempo ao vivo",
      peakViewers: "Pico de espectadores", giftsReceived: "Presentes recebidos", earnings: "Ganhos", level: "Nível",
      quickTools: "Ferramentas rápidas", goLive: "🔴 Ir ao vivo", missionsLink: "🎯 Missões", walletLink: "🎁 Carteira",
      last30Days: "Últimos 30 dias", followersSuffix: "seguidores"
    },
    withdrawScreen: {
      kicker: "PAGAMENTOS DE CRIADORES AMORA", title: "Sacar",
      errorLoad: "Não foi possível carregar as informações de saque.",
      minWithdrawalError: "O saque mínimo é", coinsWord: "moedas",
      maxBalanceError: "Você não pode sacar mais do que seu saldo.",
      enterPayoutDetails: "Insira os detalhes do seu pagamento.",
      requestSubmittedPrefix: "Saque enviado por", errorSubmit: "Não foi possível enviar o saque.",
      minimumPrefix: "Mínimo:", ratePrefix: "Taxa:", perCoinSuffix: "¢ / moeda",
      coinsAmountLabel: "Quantidade de moedas", payoutMethodLabel: "Método de pagamento", payoutDetailsLabel: "Detalhes do pagamento",
      detailsPlaceholder: "E-mail ou dados bancários",
      submitting: "Enviando…", requestWithdrawal: "Solicitar saque", historyTitle: "Histórico",
      methodPaypal: "PAYPAL", methodBank: "BANCO", methodOther: "OUTRO"
    },
    discoverScreen: {
      kicker: "AMORA", title: "Descobrir", subtitle: "Encontre pessoas, criadores e salas ao vivo que valham seu tempo.",
      searchPlaceholder: "Buscar criadores, salas…",
      catForYou: "Para você", catLive: "Ao vivo", catCreators: "Criadores", catDating: "Namoro", catNew: "Novo",
      errorLoad: "Não foi possível carregar o Descobrir.", memberFallback: "Membro Amora", liveTag: "🔴 AO VIVO",
      nothingHere: "Nada por aqui ainda. Tente outra categoria.",
      verifiedCreator: "Criador verificado", creatorWord: "Criador"
    },
    datingScreen: {
      kicker: "AMORA", title: "Descubra o Amor", matchesLink: "Combinações ♡",
      errorLoad: "Não foi possível carregar o namoro.", memberFallback: "Membro Amora", compatibleSuffix: "% compatível",
      allCaughtUp: "Você está em dia", comeBackLater: "Volte mais tarde para novas conexões."
    },
    liveScreen: {
      kicker: "AMORA AO VIVO", title: "Ao vivo agora", goLive: "● Ir ao vivo",
      heroKicker: "CONEXÕES EM TEMPO REAL", heroTitle: "Encontre uma sala que pareça viva.",
      heroSub: "Participe de conversas, conheça novas pessoas e envie presentes 3D premium.",
      errorLoad: "Não foi possível carregar as salas ao vivo.",
      noOneLive: "Ninguém está ao vivo agora", beFirst: "Seja o primeiro — toque em Ir ao vivo acima.",
      generalFallback: "Geral"
    },
    storiesScreen: {
      kicker: "AMORA", title: "Stories", errorLoad: "Não foi possível carregar os stories.",
      amoraFallback: "Amora", noStoriesYet: "Ainda não há stories. Seja o primeiro a compartilhar um momento."
    },
    deleteAccountScreen: {
      kicker: "PRIVACIDADE DA CONTA", title: "Exclua sua conta Amora.",
      subtitle: "Digite o e-mail associado à sua conta. Enviaremos um link de confirmação seguro.",
      defaultDoneMessage: "Se existir uma conta Amora com esse e-mail, um link de confirmação foi enviado.",
      errorGeneric: "Não foi possível processar sua solicitação.", checkInbox: "Verifique sua caixa de entrada.",
      emailLabel: "Endereço de e-mail", requestButton: "Solicitar exclusão de conta",
      note: "Alguns registros podem ser mantidos ou anonimizados quando exigidos por segurança, prevenção de fraude, registros financeiros ou obrigações legais."
    },
    socialCompleteScreen: {
      missingSession: "Esta sessão de login está ausente ou inválida.",
      errorContinue: "Não foi possível continuar o registro social.",
      invalidEmail: "Digite um e-mail válido.",
      invalidUsername: "Escolha um nome de usuário com 3–20 letras, números, pontos, traços ou sublinhados.",
      invalidDob: "Digite sua data de nascimento como AAAA-MM-DD.",
      errorFinishPrefix: "Não foi possível concluir o registro do", errorFinishSuffix: ".",
      securelyConnectingPrefix: "Conectando com segurança ao",
      brand: "AMORA", title: "Finalize sua conta.",
      subtitle: "Uma última etapa — escolha seu nome de usuário Amora e confirme que você tem mais de 18 anos.",
      emailPlaceholder: "Endereço de e-mail", usernamePlaceholder: "Nome de usuário (3-20 caracteres)", dobPlaceholder: "Data de nascimento (AAAA-MM-DD)",
      continueToAmora: "Continuar para a Amora"
    },
    videoMatchScreen: {
      kicker: "AMORA · VIDEO MATCH", title: "Conheça-se cara a cara.",
      introTitle: "Video Match rápido", introText: "Uma breve primeira impressão. Se ambos gostarem um do outro, a Amora cria um match.",
      startButton: "Iniciar Video Match", findingSomeone: "Procurando alguém…", connecting: "Conectando…",
      stayHere: "Fique aqui enquanto a Amora encontra alguém compatível.",
      someoneWord: "Alguém", isHereSuffix: "está aqui", readyToMeet: "Pronto para conhecer",
      waitingForVideo: "Aguardando vídeo…", howDidItFeel: "Como foi?",
      pass: "Passar", like: "♥ Curtir",
      matchExclaim: "É um match!", noMatchThisTime: "Nenhum match desta vez",
      matchedBody: "Vocês dois se curtiram. Sua nova conexão está pronta.",
      keepExploring: "Continue explorando — há mais pessoas para conhecer.",
      openMatches: "Abrir Combinações", tryAgain: "Tentar novamente",
      errorAuth: "Não foi possível autenticar. Faça login novamente.", errorConnect: "Não foi possível conectar.",
      errorVideoConnect: "Não foi possível conectar o vídeo.", errorMatchFailed: "O video match falhou."
    },
    videoScreen: {
      title: "Chamada de vídeo", memberFallback: "Membro Amora",
      readyLine: "Tela de chamada LiveKit pronta.",
      connectHint: "Conecte a Sala LiveKit nativa existente aqui para a sessão de mídia de produção.",
      endCall: "Encerrar chamada"
    },
    chatScreen: {
      chatFallback: "Chat", privateConversation: "Conversa privada",
      startConversation: "Comece a conversa. Seja gentil. 💗", messagePlaceholder: "Escreva uma mensagem…"
    },
    creatorProfileScreen: {
      errorLoad: "Não foi possível carregar o perfil.", errorUpdateFollow: "Não foi possível atualizar o seguir.", notFound: "Criador não encontrado.",
      followersSuffix: "seguidores", levelWord: "nível", following: "Seguindo", follow: "Seguir", message: "Mensagem"
    },
    liveRoomScreen: {
      errorRealtimeAuth: "A conexão em tempo real falhou ao autenticar.", inviteDeclined: "Seu convite de batalha foi recusado.",
      battleDraw: "🤝 Empate!", battleWon: "🏆 Você venceu a batalha!", battleLost: "😢 Você perdeu a batalha.",
      errorConnect: "Não foi possível conectar à transmissão ao vivo.", liveWord: "AO VIVO",
      videoUnavailable: "Vídeo indisponível", connectingVideo: "Conectando vídeo…",
      roomTitleFallback: "Sala ao vivo", creatorFallback: "Criador", wantsToBattleSuffix: "quer batalhar!",
      streamerFallback: "Um streamer", accept: "Aceitar", decline: "Recusar", endBattle: "Encerrar batalha",
      gift: "Presente", message: "Mensagem", aboutThisLive: "Sobre esta transmissão", generalFallback: "Geral", watchingSuffix: "assistindo"
    },
    videoDateScreen: {
      errorStart: "Não foi possível iniciar este encontro por vídeo.", backToMatches: "Voltar para Matches",
      waitingOtherPerson: "Aguardando a outra pessoa…", connecting: "Conectando…"
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
    },
    levelsScreen: {
      kicker: "CLUB ROYAL AMORA", title: "Votre niveau. Votre aura.", xpWord: "XP", xpUntilNext: "XP avant votre prochain déblocage",
      privileges: "Privilèges", unlocked: "DÉBLOQUÉ", locked: "VERROUILLÉ",
      perk1Title: "Médaille d'honneur", perk1Desc: "Un badge distinctif à côté de votre profil",
      perk2Title: "Entrée lumineuse", perk2Desc: "Un effet d'entrée premium dans les salons en direct",
      perk3Title: "Chat créateur", perk3Desc: "Style de chat amélioré",
      perk4Title: "Set de cadeaux VIP", perk4Desc: "Des cadeaux spéciaux réservés aux étoiles montantes",
      perk5Title: "Coup de projecteur", perk5Desc: "Une mise en avant premium pour votre profil",
      perk6Title: "Effets d'élite", perk6Desc: "Effets exclusifs dans les salons en direct",
      perk7Title: "Aura dorée", perk7Desc: "Une aura de profil royale et un badge",
      perk8Title: "Statut caché", perk8Desc: "Visibilité en ligne discrète en option",
      perk9Title: "Créateur royal", perk9Desc: "Une identité de créateur distinctive et un cadre premium"
    },
    membershipScreen: {
      kicker: "PRIVILÈGE AMORA", title: "Abonnement VIP", sub: "Une plus belle façon de profiter d'AmoraLive.",
      errorLoad: "Impossible de charger l'abonnement.", checkoutUnavailable: "Le paiement n'est pas disponible pour le moment.",
      noReceiptIOS: "Aucun reçu renvoyé par l'App Store.", noTokenAndroid: "Aucun jeton d'achat renvoyé par Google Play.",
      errorStart: "Impossible de démarrer l'abonnement.",
      chooseVipTitle: "Choisir VIP", subscribeQuestionPrefix: "S'abonner à", thisPlanFallback: "ce forfait",
      subscribe: "S'abonner",
      notAvailableTitle: "Non disponible", notAvailableBody: "La restauration des achats nécessite l'application native — non disponible dans cet aperçu.",
      nothingToRestoreTitle: "Rien à restaurer", nothingToRestoreBody: "Aucun abonnement actif trouvé pour ce compte.",
      restoredTitle: "Restauré", restoredBody: "Votre abonnement a été restauré.",
      errorRestore: "Impossible de restaurer les achats.",
      yourMembership: "VOTRE ABONNEMENT", freeWord: "Gratuit",
      restoring: "Restauration…", restorePurchases: "Restaurer les achats",
      nativeStoreHint: "Les achats natifs ne sont pas disponibles dans cette version — utilisation du paiement web sécurisé.",
      defaultPerk1: "Badge VIP et cadre de profil", defaultPerk2: "Cadeaux exclusifs", defaultPerk3: "Salons VIP", defaultPerk4: "Avantages mensuels",
      chooseVip: "Choisir VIP"
    },
    missionsScreen: {
      kicker: "PROGRESSION AMORA", title: "Missions et succès",
      errorLoad: "Impossible de charger les missions.", errorClaim: "Impossible de réclamer la récompense.",
      typeDaily: "📅 Quotidiennes", typeWeekly: "🗓️ Hebdomadaires", typeLifetime: "🏆 Succès",
      claimed: "✓ Réclamé", claiming: "Réclamation…", claimReward: "Réclamer la récompense", inProgress: "En cours"
    },
    outfitsScreen: {
      kicker: "COLLECTION AMORA", title: "Habillez votre aura.",
      subtitle: "Cadres, effets, badges et styles de profil qui rendent votre identité Amora vôtre.",
      errorLoad: "Impossible de charger votre collection.", errorUpdate: "Impossible de mettre à jour votre look.",
      equipped: "Équipé", equip: "Équiper", notOwned: "Non possédé", coinsWord: "pièces"
    },
    rewardsScreen: {
      kicker: "RÉCOMPENSES AMORA", title: "Revenez. Soyez récompensé.",
      errorLoad: "Impossible de charger les récompenses.", errorClaimNotAvailable: "La récompense n'est pas encore disponible.",
      dayStreakSuffix: "jours de série", coinsAvailableTodaySuffix: "pièces disponibles aujourd'hui",
      claimedToday: "✓ Réclamé aujourd'hui", claiming: "Réclamation…", claimDailyReward: "Réclamer la récompense quotidienne",
      historyTitle: "Historique des récompenses",
      rewardFallback: "Récompense", dayOfCyclePrefix: "Jour", ofCycle: "du cycle", milestoneSuffix: "étape"
    },
    storeScreen: {
      kicker: "COFFRE DE LUXE AMORA", title: "Boutique",
      errorLoad: "Impossible de charger la boutique.", errorBuy: "Échec de l'achat.", errorUpdate: "Impossible de mettre à jour l'article.",
      permanent: "Permanent", equippedCheck: "Équipé ✓", equip: "Équiper", buying: "Achat…", notEnoughCoins: "Pièces insuffisantes", buy: "Acheter"
    },
    studioScreen: {
      kicker: "CRÉATEUR AMORA", title: "Studio Créateur", errorLoad: "Impossible de charger le Studio Créateur.",
      followers: "Abonnés", newThisWeek: "Nouveaux cette semaine", streams: "Diffusions", liveTime: "Temps en direct",
      peakViewers: "Pic de spectateurs", giftsReceived: "Cadeaux reçus", earnings: "Revenus", level: "Niveau",
      quickTools: "Outils rapides", goLive: "🔴 Passer en direct", missionsLink: "🎯 Missions", walletLink: "🎁 Portefeuille",
      last30Days: "30 derniers jours", followersSuffix: "abonnés"
    },
    withdrawScreen: {
      kicker: "PAIEMENTS CRÉATEURS AMORA", title: "Retirer",
      errorLoad: "Impossible de charger les informations de retrait.",
      minWithdrawalError: "Le retrait minimum est de", coinsWord: "pièces",
      maxBalanceError: "Vous ne pouvez pas retirer plus que votre solde.",
      enterPayoutDetails: "Entrez vos coordonnées de paiement.",
      requestSubmittedPrefix: "Retrait soumis pour", errorSubmit: "Impossible de soumettre le retrait.",
      minimumPrefix: "Minimum :", ratePrefix: "Taux :", perCoinSuffix: "¢ / pièce",
      coinsAmountLabel: "Montant en pièces", payoutMethodLabel: "Méthode de paiement", payoutDetailsLabel: "Détails du paiement",
      detailsPlaceholder: "E-mail ou coordonnées bancaires",
      submitting: "Envoi…", requestWithdrawal: "Demander un retrait", historyTitle: "Historique",
      methodPaypal: "PAYPAL", methodBank: "BANQUE", methodOther: "AUTRE"
    },
    discoverScreen: {
      kicker: "AMORA", title: "Découvrir", subtitle: "Trouvez des personnes, créateurs et salons en direct qui valent votre temps.",
      searchPlaceholder: "Rechercher créateurs, salons…",
      catForYou: "Pour vous", catLive: "En direct", catCreators: "Créateurs", catDating: "Rencontres", catNew: "Nouveau",
      errorLoad: "Impossible de charger Découvrir.", memberFallback: "Membre Amora", liveTag: "🔴 EN DIRECT",
      nothingHere: "Rien ici pour le moment. Essayez une autre catégorie.",
      verifiedCreator: "Créateur vérifié", creatorWord: "Créateur"
    },
    datingScreen: {
      kicker: "AMORA", title: "Découvrez l'amour", matchesLink: "Matchs ♡",
      errorLoad: "Impossible de charger les rencontres.", memberFallback: "Membre Amora", compatibleSuffix: "% compatible",
      allCaughtUp: "Vous êtes à jour", comeBackLater: "Revenez plus tard pour de nouvelles connexions."
    },
    liveScreen: {
      kicker: "AMORA EN DIRECT", title: "En direct maintenant", goLive: "● Passer en direct",
      heroKicker: "CONNEXIONS EN TEMPS RÉEL", heroTitle: "Trouvez un salon qui semble vivant.",
      heroSub: "Rejoignez des conversations, rencontrez de nouvelles personnes et envoyez des cadeaux 3D premium.",
      errorLoad: "Impossible de charger les salons en direct.",
      noOneLive: "Personne n'est en direct pour le moment", beFirst: "Soyez le premier — appuyez sur Passer en direct ci-dessus.",
      generalFallback: "Général"
    },
    storiesScreen: {
      kicker: "AMORA", title: "Stories", errorLoad: "Impossible de charger les stories.",
      amoraFallback: "Amora", noStoriesYet: "Pas encore de stories. Soyez le premier à partager un moment."
    },
    deleteAccountScreen: {
      kicker: "CONFIDENTIALITÉ DU COMPTE", title: "Supprimez votre compte Amora.",
      subtitle: "Entrez l'e-mail associé à votre compte. Nous vous enverrons un lien de confirmation sécurisé.",
      defaultDoneMessage: "Si un compte Amora existe pour cet e-mail, un lien de confirmation a été envoyé.",
      errorGeneric: "Impossible de traiter votre demande.", checkInbox: "Vérifiez votre boîte de réception.",
      emailLabel: "Adresse e-mail", requestButton: "Demander la suppression du compte",
      note: "Certains enregistrements peuvent être conservés ou anonymisés si la sécurité, la prévention de la fraude, les registres financiers ou des obligations légales l'exigent."
    },
    socialCompleteScreen: {
      missingSession: "Cette session de connexion est manquante ou invalide.",
      errorContinue: "Impossible de continuer l'inscription sociale.",
      invalidEmail: "Entrez une adresse e-mail valide.",
      invalidUsername: "Choisissez un nom d'utilisateur avec 3–20 lettres, chiffres, points, tirets ou underscores.",
      invalidDob: "Entrez votre date de naissance au format AAAA-MM-JJ.",
      errorFinishPrefix: "Impossible de terminer l'inscription", errorFinishSuffix: ".",
      securelyConnectingPrefix: "Connexion sécurisée à",
      brand: "AMORA", title: "Finalisez votre compte.",
      subtitle: "Une dernière étape — choisissez votre nom d'utilisateur Amora et confirmez que vous avez 18 ans ou plus.",
      emailPlaceholder: "Adresse e-mail", usernamePlaceholder: "Nom d'utilisateur (3-20 caractères)", dobPlaceholder: "Date de naissance (AAAA-MM-JJ)",
      continueToAmora: "Continuer vers Amora"
    },
    videoMatchScreen: {
      kicker: "AMORA · VIDEO MATCH", title: "Rencontrez-vous en face à face.",
      introTitle: "Video Match rapide", introText: "Une brève première impression. Si vous vous plaisez tous les deux, Amora crée un match.",
      startButton: "Démarrer Video Match", findingSomeone: "Recherche de quelqu'un…", connecting: "Connexion…",
      stayHere: "Restez ici pendant qu'Amora trouve une personne compatible.",
      someoneWord: "Quelqu'un", isHereSuffix: "est ici", readyToMeet: "Prêt à se rencontrer",
      waitingForVideo: "En attente de la vidéo…", howDidItFeel: "Comment était-ce ?",
      pass: "Passer", like: "♥ J'aime",
      matchExclaim: "C'est un match !", noMatchThisTime: "Pas de match cette fois",
      matchedBody: "Vous vous êtes tous les deux plu. Votre nouvelle connexion est prête.",
      keepExploring: "Continuez à explorer — il y a plus de personnes à rencontrer.",
      openMatches: "Ouvrir les matchs", tryAgain: "Réessayer",
      errorAuth: "Impossible de s'authentifier. Reconnectez-vous.", errorConnect: "Impossible de se connecter.",
      errorVideoConnect: "Impossible de connecter la vidéo.", errorMatchFailed: "Le video match a échoué."
    },
    videoScreen: {
      title: "Appel vidéo", memberFallback: "Membre Amora",
      readyLine: "Écran d'appel LiveKit prêt.",
      connectHint: "Connectez ici la salle LiveKit native existante pour la session média de production.",
      endCall: "Terminer l'appel"
    },
    chatScreen: {
      chatFallback: "Chat", privateConversation: "Conversation privée",
      startConversation: "Commencez la conversation. Restez bienveillant. 💗", messagePlaceholder: "Écrivez un message…"
    },
    creatorProfileScreen: {
      errorLoad: "Impossible de charger le profil.", errorUpdateFollow: "Impossible de mettre à jour le suivi.", notFound: "Créateur introuvable.",
      followersSuffix: "abonnés", levelWord: "niveau", following: "Abonné(e)", follow: "Suivre", message: "Message"
    },
    liveRoomScreen: {
      errorRealtimeAuth: "L'authentification de la connexion en temps réel a échoué.", inviteDeclined: "Votre invitation au battle a été refusée.",
      battleDraw: "🤝 Égalité !", battleWon: "🏆 Vous avez gagné le battle !", battleLost: "😢 Vous avez perdu le battle.",
      errorConnect: "Impossible de se connecter au direct.", liveWord: "EN DIRECT",
      videoUnavailable: "Vidéo indisponible", connectingVideo: "Connexion de la vidéo…",
      roomTitleFallback: "Salon en direct", creatorFallback: "Créateur", wantsToBattleSuffix: "veut vous défier !",
      streamerFallback: "Un streamer", accept: "Accepter", decline: "Refuser", endBattle: "Terminer le battle",
      gift: "Cadeau", message: "Message", aboutThisLive: "À propos de ce direct", generalFallback: "Général", watchingSuffix: "en train de regarder"
    },
    videoDateScreen: {
      errorStart: "Impossible de démarrer ce rendez-vous vidéo.", backToMatches: "Retour aux Matchs",
      waitingOtherPerson: "En attente de l'autre personne…", connecting: "Connexion…"
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
    },
    levelsScreen: {
      kicker: "AMORA ROYAL CLUB", title: "Dein Level. Deine Aura.", xpWord: "XP", xpUntilNext: "XP bis zur nächsten Freischaltung",
      privileges: "Privilegien", unlocked: "FREIGESCHALTET", locked: "GESPERRT",
      perk1Title: "Ehrenmedaille", perk1Desc: "Ein Erkennungsabzeichen neben deinem Profil",
      perk2Title: "Lichtvoller Einzug", perk2Desc: "Ein Premium-Eintrittseffekt in Live-Räumen",
      perk3Title: "Creator-Chat", perk3Desc: "Verbessertes Chat-Styling",
      perk4Title: "VIP-Geschenkset", perk4Desc: "Spezielle Geschenke nur für aufsteigende Stars",
      perk5Title: "Spotlight-Hervorhebung", perk5Desc: "Premium-Hervorhebung für dein Profil",
      perk6Title: "Elite-Effekte", perk6Desc: "Exklusive Effekte in Live-Räumen",
      perk7Title: "Goldene Aura", perk7Desc: "Eine königliche Profilaura und ein Abzeichen",
      perk8Title: "Verborgener Status", perk8Desc: "Optionale diskrete Online-Sichtbarkeit",
      perk9Title: "Royaler Creator", perk9Desc: "Eine unverwechselbare Creator-Identität und ein Premium-Rahmen"
    },
    membershipScreen: {
      kicker: "AMORA PRIVILEG", title: "VIP-Mitgliedschaft", sub: "Ein schönerer Weg, AmoraLive zu genießen.",
      errorLoad: "Mitgliedschaft konnte nicht geladen werden.", checkoutUnavailable: "Checkout ist derzeit nicht verfügbar.",
      noReceiptIOS: "Kein Beleg vom App Store erhalten.", noTokenAndroid: "Kein Kauf-Token von Google Play erhalten.",
      errorStart: "Mitgliedschaft konnte nicht gestartet werden.",
      chooseVipTitle: "VIP wählen", subscribeQuestionPrefix: "Abonnieren:", thisPlanFallback: "diesen Plan",
      subscribe: "Abonnieren",
      notAvailableTitle: "Nicht verfügbar", notAvailableBody: "Käufe wiederherstellen erfordert die native App — in dieser Vorschau nicht verfügbar.",
      nothingToRestoreTitle: "Nichts wiederherzustellen", nothingToRestoreBody: "Für dieses Konto wurde kein aktives Abonnement gefunden.",
      restoredTitle: "Wiederhergestellt", restoredBody: "Deine Mitgliedschaft wurde wiederhergestellt.",
      errorRestore: "Käufe konnten nicht wiederhergestellt werden.",
      yourMembership: "DEINE MITGLIEDSCHAFT", freeWord: "Kostenlos",
      restoring: "Wiederherstellen…", restorePurchases: "Käufe wiederherstellen",
      nativeStoreHint: "Native Store-Käufe sind in diesem Build nicht verfügbar — es wird stattdessen der sichere Web-Checkout verwendet.",
      defaultPerk1: "VIP-Abzeichen & Profilrahmen", defaultPerk2: "Exklusive Geschenke", defaultPerk3: "VIP-Räume", defaultPerk4: "Monatliche Vorteile",
      chooseVip: "VIP wählen"
    },
    missionsScreen: {
      kicker: "AMORA PROGRESSION", title: "Missionen & Erfolge",
      errorLoad: "Missionen konnten nicht geladen werden.", errorClaim: "Belohnung konnte nicht eingelöst werden.",
      typeDaily: "📅 Täglich", typeWeekly: "🗓️ Wöchentlich", typeLifetime: "🏆 Erfolge",
      claimed: "✓ Eingelöst", claiming: "Einlösen…", claimReward: "Belohnung einlösen", inProgress: "In Bearbeitung"
    },
    outfitsScreen: {
      kicker: "AMORA KOLLEKTION", title: "Kleide deine Aura.",
      subtitle: "Rahmen, Effekte, Abzeichen und Profilstile, die deine Amora-Identität ausmachen.",
      errorLoad: "Deine Sammlung konnte nicht geladen werden.", errorUpdate: "Dein Look konnte nicht aktualisiert werden.",
      equipped: "Ausgerüstet", equip: "Ausrüsten", notOwned: "Nicht im Besitz", coinsWord: "Münzen"
    },
    rewardsScreen: {
      kicker: "AMORA BELOHNUNGEN", title: "Komm zurück. Werde belohnt.",
      errorLoad: "Belohnungen konnten nicht geladen werden.", errorClaimNotAvailable: "Belohnung ist noch nicht verfügbar.",
      dayStreakSuffix: "Tage in Folge", coinsAvailableTodaySuffix: "Münzen heute verfügbar",
      claimedToday: "✓ Heute eingelöst", claiming: "Einlösen…", claimDailyReward: "Tägliche Belohnung einlösen",
      historyTitle: "Belohnungsverlauf",
      rewardFallback: "Belohnung", dayOfCyclePrefix: "Tag", ofCycle: "des Zyklus", milestoneSuffix: "Meilenstein"
    },
    storeScreen: {
      kicker: "AMORA LUXUSGEWÖLBE", title: "Boutique",
      errorLoad: "Shop konnte nicht geladen werden.", errorBuy: "Kauf fehlgeschlagen.", errorUpdate: "Artikel konnte nicht aktualisiert werden.",
      permanent: "Dauerhaft", equippedCheck: "Ausgerüstet ✓", equip: "Ausrüsten", buying: "Kaufen…", notEnoughCoins: "Nicht genügend Münzen", buy: "Kaufen"
    },
    studioScreen: {
      kicker: "AMORA CREATOR", title: "Creator Studio", errorLoad: "Creator Studio konnte nicht geladen werden.",
      followers: "Follower", newThisWeek: "Neu diese Woche", streams: "Streams", liveTime: "Live-Zeit",
      peakViewers: "Spitzenzuschauer", giftsReceived: "Erhaltene Geschenke", earnings: "Einnahmen", level: "Level",
      quickTools: "Schnellwerkzeuge", goLive: "🔴 Live gehen", missionsLink: "🎯 Missionen", walletLink: "🎁 Wallet",
      last30Days: "Letzte 30 Tage", followersSuffix: "Follower"
    },
    withdrawScreen: {
      kicker: "AMORA CREATOR-AUSZAHLUNGEN", title: "Auszahlen",
      errorLoad: "Auszahlungsinformationen konnten nicht geladen werden.",
      minWithdrawalError: "Mindestauszahlung ist", coinsWord: "Münzen",
      maxBalanceError: "Du kannst nicht mehr als dein Guthaben auszahlen.",
      enterPayoutDetails: "Gib deine Auszahlungsdaten ein.",
      requestSubmittedPrefix: "Auszahlung eingereicht für", errorSubmit: "Auszahlung konnte nicht eingereicht werden.",
      minimumPrefix: "Minimum:", ratePrefix: "Rate:", perCoinSuffix: "¢ / Münze",
      coinsAmountLabel: "Münzenanzahl", payoutMethodLabel: "Auszahlungsmethode", payoutDetailsLabel: "Auszahlungsdetails",
      detailsPlaceholder: "E-Mail oder Bankdaten",
      submitting: "Wird gesendet…", requestWithdrawal: "Auszahlung anfordern", historyTitle: "Verlauf",
      methodPaypal: "PAYPAL", methodBank: "BANK", methodOther: "ANDERE"
    },
    discoverScreen: {
      kicker: "AMORA", title: "Entdecken", subtitle: "Finde Menschen, Creator und Live-Räume, die deine Zeit wert sind.",
      searchPlaceholder: "Creator, Räume suchen…",
      catForYou: "Für dich", catLive: "Live", catCreators: "Creator", catDating: "Dating", catNew: "Neu",
      errorLoad: "Entdecken konnte nicht geladen werden.", memberFallback: "Amora-Mitglied", liveTag: "🔴 LIVE",
      nothingHere: "Hier ist noch nichts. Versuche eine andere Kategorie.",
      verifiedCreator: "Verifizierter Creator", creatorWord: "Creator"
    },
    datingScreen: {
      kicker: "AMORA", title: "Liebe entdecken", matchesLink: "Matches ♡",
      errorLoad: "Dating konnte nicht geladen werden.", memberFallback: "Amora-Mitglied", compatibleSuffix: "% kompatibel",
      allCaughtUp: "Du bist auf dem neuesten Stand", comeBackLater: "Komm später wieder für neue Verbindungen."
    },
    liveScreen: {
      kicker: "AMORA LIVE", title: "Jetzt live", goLive: "● Live gehen",
      heroKicker: "ECHTZEIT-VERBINDUNGEN", heroTitle: "Finde einen Raum, der lebendig wirkt.",
      heroSub: "Nimm an Gesprächen teil, lerne neue Menschen kennen und sende Premium-3D-Geschenke.",
      errorLoad: "Live-Räume konnten nicht geladen werden.",
      noOneLive: "Gerade ist niemand live", beFirst: "Sei der Erste — tippe oben auf Live gehen.",
      generalFallback: "Allgemein"
    },
    storiesScreen: {
      kicker: "AMORA", title: "Stories", errorLoad: "Stories konnten nicht geladen werden.",
      amoraFallback: "Amora", noStoriesYet: "Noch keine Stories. Sei der Erste, der einen Moment teilt."
    },
    deleteAccountScreen: {
      kicker: "KONTO-PRIVATSPHÄRE", title: "Lösche dein Amora-Konto.",
      subtitle: "Gib die mit deinem Konto verknüpfte E-Mail-Adresse ein. Wir senden dir einen sicheren Bestätigungslink.",
      defaultDoneMessage: "Falls ein Amora-Konto für diese E-Mail existiert, wurde ein Bestätigungslink gesendet.",
      errorGeneric: "Deine Anfrage konnte nicht bearbeitet werden.", checkInbox: "Überprüfe deinen Posteingang.",
      emailLabel: "E-Mail-Adresse", requestButton: "Kontolöschung beantragen",
      note: "Einige Daten können aus Sicherheits-, Betrugspräventions-, Finanz- oder rechtlichen Gründen aufbewahrt oder anonymisiert werden."
    },
    socialCompleteScreen: {
      missingSession: "Diese Anmeldesitzung fehlt oder ist ungültig.",
      errorContinue: "Soziale Registrierung konnte nicht fortgesetzt werden.",
      invalidEmail: "Gib eine gültige E-Mail-Adresse ein.",
      invalidUsername: "Wähle einen Benutzernamen mit 3–20 Buchstaben, Zahlen, Punkten, Bindestrichen oder Unterstrichen.",
      invalidDob: "Gib dein Geburtsdatum im Format JJJJ-MM-TT ein.",
      errorFinishPrefix: "Registrierung konnte nicht abgeschlossen werden", errorFinishSuffix: ".",
      securelyConnectingPrefix: "Sichere Verbindung zu",
      brand: "AMORA", title: "Schließe dein Konto ab.",
      subtitle: "Ein letzter Schritt — wähle deinen Amora-Benutzernamen und bestätige, dass du 18+ bist.",
      emailPlaceholder: "E-Mail-Adresse", usernamePlaceholder: "Benutzername (3-20 Zeichen)", dobPlaceholder: "Geburtsdatum (JJJJ-MM-TT)",
      continueToAmora: "Weiter zu Amora"
    },
    videoMatchScreen: {
      kicker: "AMORA · VIDEO MATCH", title: "Trefft euch von Angesicht zu Angesicht.",
      introTitle: "Schneller Video Match", introText: "Ein kurzer erster Eindruck. Wenn ihr euch beide mögt, erstellt Amora ein Match.",
      startButton: "Video Match starten", findingSomeone: "Jemand wird gesucht…", connecting: "Verbindung wird hergestellt…",
      stayHere: "Bleib hier, während Amora eine passende Person findet.",
      someoneWord: "Jemand", isHereSuffix: "ist hier", readyToMeet: "Bereit sich zu treffen",
      waitingForVideo: "Warten auf Video…", howDidItFeel: "Wie hat es sich angefühlt?",
      pass: "Überspringen", like: "♥ Gefällt mir",
      matchExclaim: "Es ist ein Match!", noMatchThisTime: "Diesmal kein Match",
      matchedBody: "Ihr habt euch beide gemocht. Eure neue Verbindung ist bereit.",
      keepExploring: "Erkunde weiter — es gibt noch mehr Menschen zu treffen.",
      openMatches: "Matches öffnen", tryAgain: "Erneut versuchen",
      errorAuth: "Authentifizierung fehlgeschlagen. Bitte melde dich erneut an.", errorConnect: "Verbindung fehlgeschlagen.",
      errorVideoConnect: "Video konnte nicht verbunden werden.", errorMatchFailed: "Video Match ist fehlgeschlagen."
    },
    videoScreen: {
      title: "Videoanruf", memberFallback: "Amora-Mitglied",
      readyLine: "LiveKit-Anrufbildschirm bereit.",
      connectHint: "Verbinde hier den vorhandenen nativen LiveKit-Room für die produktive Mediensitzung.",
      endCall: "Anruf beenden"
    },
    chatScreen: {
      chatFallback: "Chat", privateConversation: "Privates Gespräch",
      startConversation: "Beginne das Gespräch. Bleib freundlich. 💗", messagePlaceholder: "Schreibe eine Nachricht…"
    },
    creatorProfileScreen: {
      errorLoad: "Profil konnte nicht geladen werden.", errorUpdateFollow: "Folgen konnte nicht aktualisiert werden.", notFound: "Creator nicht gefunden.",
      followersSuffix: "Follower", levelWord: "Level", following: "Gefolgt", follow: "Folgen", message: "Nachricht"
    },
    liveRoomScreen: {
      errorRealtimeAuth: "Die Echtzeitverbindung konnte sich nicht authentifizieren.", inviteDeclined: "Deine Battle-Einladung wurde abgelehnt.",
      battleDraw: "🤝 Unentschieden!", battleWon: "🏆 Du hast das Battle gewonnen!", battleLost: "😢 Du hast das Battle verloren.",
      errorConnect: "Verbindung zum Livestream fehlgeschlagen.", liveWord: "LIVE",
      videoUnavailable: "Video nicht verfügbar", connectingVideo: "Video wird verbunden…",
      roomTitleFallback: "Live-Raum", creatorFallback: "Creator", wantsToBattleSuffix: "möchte kämpfen!",
      streamerFallback: "Ein Streamer", accept: "Annehmen", decline: "Ablehnen", endBattle: "Battle beenden",
      gift: "Geschenk", message: "Nachricht", aboutThisLive: "Über diesen Livestream", generalFallback: "Allgemein", watchingSuffix: "schauen zu"
    },
    videoDateScreen: {
      errorStart: "Dieses Video-Date konnte nicht gestartet werden.", backToMatches: "Zurück zu Matches",
      waitingOtherPerson: "Warten auf die andere Person…", connecting: "Verbindung wird hergestellt…"
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
    },
    levelsScreen: {
      kicker: "نادي أمورا الملكي", title: "مستواك. هالتك.", xpWord: "نقاط الخبرة", xpUntilNext: "نقاط الخبرة حتى فتح المستوى التالي",
      privileges: "الامتيازات", unlocked: "مفتوح", locked: "مقفل",
      perk1Title: "وسام الشرف", perk1Desc: "شارة مميزة بجانب ملفك الشخصي",
      perk2Title: "دخول مضيء", perk2Desc: "تأثير دخول مميز في الغرف المباشرة",
      perk3Title: "دردشة المبدع", perk3Desc: "تنسيق دردشة محسّن",
      perk4Title: "مجموعة هدايا VIP", perk4Desc: "هدايا خاصة للنجوم الصاعدة فقط",
      perk5Title: "تسليط الضوء", perk5Desc: "إبراز مميز لملفك الشخصي",
      perk6Title: "تأثيرات النخبة", perk6Desc: "تأثيرات حصرية في الغرف المباشرة",
      perk7Title: "الهالة الذهبية", perk7Desc: "هالة ملفك الشخصي الملكية وشارة",
      perk8Title: "الحالة الخفية", perk8Desc: "ظهور اتصال اختياري وخفي",
      perk9Title: "مبدع ملكي", perk9Desc: "هوية مبدع مميزة وإطار فاخر"
    },
    membershipScreen: {
      kicker: "امتياز أمورا", title: "عضوية VIP", sub: "طريقة أجمل للاستمتاع بـ AmoraLive.",
      errorLoad: "تعذّر تحميل العضوية.", checkoutUnavailable: "الدفع غير متاح حاليًا.",
      noReceiptIOS: "لم يتم إرجاع إيصال من App Store.", noTokenAndroid: "لم يتم إرجاع رمز شراء من Google Play.",
      errorStart: "تعذّر بدء العضوية.",
      chooseVipTitle: "اختر VIP", subscribeQuestionPrefix: "الاشتراك في", thisPlanFallback: "هذه الخطة",
      subscribe: "اشترك",
      notAvailableTitle: "غير متاح", notAvailableBody: "استعادة المشتريات يتطلب التطبيق الأصلي — غير متاح في هذه المعاينة.",
      nothingToRestoreTitle: "لا يوجد ما يُستعاد", nothingToRestoreBody: "لم يتم العثور على اشتراك نشط لهذا الحساب.",
      restoredTitle: "تمت الاستعادة", restoredBody: "تمت استعادة عضويتك.",
      errorRestore: "تعذّر استعادة المشتريات.",
      yourMembership: "عضويتك", freeWord: "مجاني",
      restoring: "جارٍ الاستعادة…", restorePurchases: "استعادة المشتريات",
      nativeStoreHint: "مشتريات المتجر الأصلي غير متاحة في هذا الإصدار — سيُستخدم الدفع الآمن عبر الويب بدلاً من ذلك.",
      defaultPerk1: "شارة VIP وإطار الملف الشخصي", defaultPerk2: "هدايا حصرية", defaultPerk3: "غرف VIP", defaultPerk4: "امتيازات شهرية",
      chooseVip: "اختر VIP"
    },
    missionsScreen: {
      kicker: "تقدّم أمورا", title: "المهام والإنجازات",
      errorLoad: "تعذّر تحميل المهام.", errorClaim: "تعذّر استلام المكافأة.",
      typeDaily: "📅 يومي", typeWeekly: "🗓️ أسبوعي", typeLifetime: "🏆 الإنجازات",
      claimed: "✓ تم الاستلام", claiming: "جارٍ الاستلام…", claimReward: "استلام المكافأة", inProgress: "قيد التقدم"
    },
    outfitsScreen: {
      kicker: "مجموعة أمورا", title: "زيّن هالتك.",
      subtitle: "إطارات وتأثيرات وشارات وأنماط ملف شخصي تجعل هوية أمورا خاصة بك.",
      errorLoad: "تعذّر تحميل مجموعتك.", errorUpdate: "تعذّر تحديث مظهرك.",
      equipped: "مُجهّز", equip: "تجهيز", notOwned: "غير مملوك", coinsWord: "عملات"
    },
    rewardsScreen: {
      kicker: "مكافآت أمورا", title: "عد. احصل على مكافأة.",
      errorLoad: "تعذّر تحميل المكافآت.", errorClaimNotAvailable: "المكافأة غير متاحة بعد.",
      dayStreakSuffix: "أيام متتالية", coinsAvailableTodaySuffix: "عملات متاحة اليوم",
      claimedToday: "✓ تم الاستلام اليوم", claiming: "جارٍ الاستلام…", claimDailyReward: "استلام المكافأة اليومية",
      historyTitle: "سجل المكافآت",
      rewardFallback: "مكافأة", dayOfCyclePrefix: "اليوم", ofCycle: "من الدورة", milestoneSuffix: "إنجاز مرحلي"
    },
    storeScreen: {
      kicker: "خزنة أمورا الفاخرة", title: "المتجر",
      errorLoad: "تعذّر تحميل المتجر.", errorBuy: "فشل الشراء.", errorUpdate: "تعذّر تحديث العنصر.",
      permanent: "دائم", equippedCheck: "مُجهّز ✓", equip: "تجهيز", buying: "جارٍ الشراء…", notEnoughCoins: "عملات غير كافية", buy: "شراء"
    },
    studioScreen: {
      kicker: "مبدع أمورا", title: "استوديو المبدعين", errorLoad: "تعذّر تحميل استوديو المبدعين.",
      followers: "المتابعون", newThisWeek: "جديد هذا الأسبوع", streams: "البثوث", liveTime: "وقت البث المباشر",
      peakViewers: "ذروة المشاهدين", giftsReceived: "الهدايا المستلمة", earnings: "الأرباح", level: "المستوى",
      quickTools: "أدوات سريعة", goLive: "🔴 بدء البث المباشر", missionsLink: "🎯 المهام", walletLink: "🎁 المحفظة",
      last30Days: "آخر 30 يومًا", followersSuffix: "متابع"
    },
    withdrawScreen: {
      kicker: "مدفوعات مبدعي أمورا", title: "سحب",
      errorLoad: "تعذّر تحميل معلومات السحب.",
      minWithdrawalError: "الحد الأدنى للسحب هو", coinsWord: "عملات",
      maxBalanceError: "لا يمكنك سحب أكثر من رصيدك.",
      enterPayoutDetails: "أدخل تفاصيل الدفع.",
      requestSubmittedPrefix: "تم تقديم طلب سحب بقيمة", errorSubmit: "تعذّر تقديم طلب السحب.",
      minimumPrefix: "الحد الأدنى:", ratePrefix: "المعدل:", perCoinSuffix: "¢ / عملة",
      coinsAmountLabel: "عدد العملات", payoutMethodLabel: "طريقة الدفع", payoutDetailsLabel: "تفاصيل الدفع",
      detailsPlaceholder: "البريد الإلكتروني أو تفاصيل البنك",
      submitting: "جارٍ الإرسال…", requestWithdrawal: "طلب سحب", historyTitle: "السجل",
      methodPaypal: "PAYPAL", methodBank: "بنك", methodOther: "أخرى"
    },
    discoverScreen: {
      kicker: "أمورا", title: "استكشف", subtitle: "اعثر على أشخاص ومبدعين وغرف مباشرة تستحق وقتك.",
      searchPlaceholder: "ابحث عن مبدعين، غرف…",
      catForYou: "لك", catLive: "مباشر", catCreators: "مبدعون", catDating: "مواعدة", catNew: "جديد",
      errorLoad: "تعذّر تحميل الاستكشاف.", memberFallback: "عضو أمورا", liveTag: "🔴 مباشر",
      nothingHere: "لا يوجد شيء هنا بعد. جرّب فئة أخرى.",
      verifiedCreator: "مبدع موثّق", creatorWord: "مبدع"
    },
    datingScreen: {
      kicker: "أمورا", title: "اكتشف الحب", matchesLink: "التوافقات ♡",
      errorLoad: "تعذّر تحميل المواعدة.", memberFallback: "عضو أمورا", compatibleSuffix: "% توافق",
      allCaughtUp: "لقد اطلعت على كل شيء", comeBackLater: "عد لاحقًا لاتصالات جديدة."
    },
    liveScreen: {
      kicker: "أمورا مباشر", title: "مباشر الآن", goLive: "● بدء البث المباشر",
      heroKicker: "اتصالات لحظية", heroTitle: "اعثر على غرفة تشعر بالحيوية.",
      heroSub: "انضم إلى المحادثات، وتعرف على أشخاص جدد، وأرسل هدايا ثلاثية الأبعاد مميزة.",
      errorLoad: "تعذّر تحميل الغرف المباشرة.",
      noOneLive: "لا أحد مباشر الآن", beFirst: "كن الأول — اضغط على بدء البث المباشر أعلاه.",
      generalFallback: "عام"
    },
    storiesScreen: {
      kicker: "أمورا", title: "القصص", errorLoad: "تعذّر تحميل القصص.",
      amoraFallback: "أمورا", noStoriesYet: "لا توجد قصص بعد. كن أول من يشارك لحظة."
    },
    deleteAccountScreen: {
      kicker: "خصوصية الحساب", title: "احذف حساب أمورا الخاص بك.",
      subtitle: "أدخل البريد الإلكتروني المرتبط بحسابك. سنرسل لك رابط تأكيد آمن.",
      defaultDoneMessage: "إذا كان هناك حساب أمورا لهذا البريد الإلكتروني، فقد تم إرسال رابط تأكيد.",
      errorGeneric: "تعذّر معالجة طلبك.", checkInbox: "تحقق من بريدك الوارد.",
      emailLabel: "البريد الإلكتروني", requestButton: "طلب حذف الحساب",
      note: "قد يتم الاحتفاظ ببعض السجلات أو إخفاء هويتها عند الحاجة لأغراض الأمان أو منع الاحتيال أو السجلات المالية أو الالتزامات القانونية."
    },
    socialCompleteScreen: {
      missingSession: "جلسة تسجيل الدخول هذه مفقودة أو غير صالحة.",
      errorContinue: "تعذّر متابعة التسجيل الاجتماعي.",
      invalidEmail: "أدخل عنوان بريد إلكتروني صالحًا.",
      invalidUsername: "اختر اسم مستخدم مكوّنًا من 3–20 حرفًا أو رقمًا أو نقطة أو شرطة أو شرطة سفلية.",
      invalidDob: "أدخل تاريخ ميلادك بصيغة YYYY-MM-DD.",
      errorFinishPrefix: "تعذّر إنهاء التسجيل", errorFinishSuffix: ".",
      securelyConnectingPrefix: "جارٍ الاتصال الآمن بـ",
      brand: "أمورا", title: "أكمل حسابك.",
      subtitle: "خطوة أخيرة — اختر اسم مستخدم أمورا الخاص بك وأكّد أن عمرك 18 عامًا أو أكثر.",
      emailPlaceholder: "البريد الإلكتروني", usernamePlaceholder: "اسم المستخدم (3-20 حرفًا)", dobPlaceholder: "تاريخ الميلاد (YYYY-MM-DD)",
      continueToAmora: "المتابعة إلى أمورا"
    },
    videoMatchScreen: {
      kicker: "أمورا · فيديو ماتش", title: "التقيا وجهًا لوجه.",
      introTitle: "فيديو ماتش سريع", introText: "انطباع أول سريع. إذا أعجب كل منكما بالآخر، ينشئ أمورا تطابقًا.",
      startButton: "ابدأ فيديو ماتش", findingSomeone: "جارٍ البحث عن شخص…", connecting: "جارٍ الاتصال…",
      stayHere: "ابقَ هنا بينما يجد أمورا شخصًا متوافقًا.",
      someoneWord: "شخص ما", isHereSuffix: "هنا", readyToMeet: "جاهز للقاء",
      waitingForVideo: "بانتظار الفيديو…", howDidItFeel: "كيف شعرت بذلك؟",
      pass: "تخطّي", like: "♥ إعجاب",
      matchExclaim: "إنها مطابقة!", noMatchThisTime: "لا مطابقة هذه المرة",
      matchedBody: "أعجب كل منكما بالآخر. اتصالكما الجديد جاهز.",
      keepExploring: "واصل الاستكشاف — هناك المزيد من الأشخاص لتقابلهم.",
      openMatches: "فتح التطابقات", tryAgain: "حاول مرة أخرى",
      errorAuth: "تعذّرت المصادقة. يرجى تسجيل الدخول مرة أخرى.", errorConnect: "تعذّر الاتصال.",
      errorVideoConnect: "تعذّر الاتصال بالفيديو.", errorMatchFailed: "فشل فيديو ماتش."
    },
    videoScreen: {
      title: "مكالمة فيديو", memberFallback: "عضو أمورا",
      readyLine: "شاشة مكالمة LiveKit جاهزة.",
      connectHint: "قم بتوصيل غرفة LiveKit الأصلية الحالية هنا لجلسة الوسائط الإنتاجية.",
      endCall: "إنهاء المكالمة"
    },
    chatScreen: {
      chatFallback: "دردشة", privateConversation: "محادثة خاصة",
      startConversation: "ابدأ المحادثة. كن لطيفًا. 💗", messagePlaceholder: "اكتب رسالة…"
    },
    creatorProfileScreen: {
      errorLoad: "تعذّر تحميل الملف الشخصي.", errorUpdateFollow: "تعذّر تحديث المتابعة.", notFound: "المبدع غير موجود.",
      followersSuffix: "متابع", levelWord: "المستوى", following: "متابَع", follow: "متابعة", message: "رسالة"
    },
    liveRoomScreen: {
      errorRealtimeAuth: "فشلت مصادقة الاتصال اللحظي.", inviteDeclined: "تم رفض دعوة المعركة الخاصة بك.",
      battleDraw: "🤝 إنه تعادل!", battleWon: "🏆 لقد فزت بالمعركة!", battleLost: "😢 لقد خسرت المعركة.",
      errorConnect: "تعذّر الاتصال بالبث المباشر.", liveWord: "مباشر",
      videoUnavailable: "الفيديو غير متاح", connectingVideo: "جارٍ توصيل الفيديو…",
      roomTitleFallback: "غرفة مباشرة", creatorFallback: "مبدع", wantsToBattleSuffix: "يريد المعركة!",
      streamerFallback: "أحد المذيعين", accept: "قبول", decline: "رفض", endBattle: "إنهاء المعركة",
      gift: "هدية", message: "رسالة", aboutThisLive: "حول هذا البث المباشر", generalFallback: "عام", watchingSuffix: "يشاهدون"
    },
    videoDateScreen: {
      errorStart: "تعذّر بدء هذا الموعد بالفيديو.", backToMatches: "العودة إلى التطابقات",
      waitingOtherPerson: "في انتظار الشخص الآخر…", connecting: "جارٍ الاتصال…"
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
    },
    levelsScreen: {
      kicker: "अमोरा रॉयल क्लब", title: "आपका स्तर। आपकी आभा।", xpWord: "XP", xpUntilNext: "अगले अनलॉक तक XP",
      privileges: "विशेषाधिकार", unlocked: "अनलॉक किया गया", locked: "लॉक्ड",
      perk1Title: "सम्मान पदक", perk1Desc: "आपकी प्रोफ़ाइल के बगल में एक विशिष्ट बैज",
      perk2Title: "चमकदार प्रवेश", perk2Desc: "लाइव रूम में एक प्रीमियम एंट्री इफेक्ट",
      perk3Title: "क्रिएटर चैट", perk3Desc: "बेहतर चैट स्टाइलिंग",
      perk4Title: "VIP गिफ्ट सेट", perk4Desc: "उभरते सितारों के लिए विशेष उपहार",
      perk5Title: "स्पॉटलाइट हाइलाइट", perk5Desc: "आपकी प्रोफ़ाइल के लिए प्रीमियम हाइलाइट",
      perk6Title: "एलीट इफेक्ट्स", perk6Desc: "लाइव रूम में विशेष प्रभाव",
      perk7Title: "गोल्डन आभा", perk7Desc: "एक शाही प्रोफ़ाइल आभा और बैज",
      perk8Title: "छिपी हुई स्थिति", perk8Desc: "वैकल्पिक विवेकपूर्ण ऑनलाइन दृश्यता",
      perk9Title: "रॉयल क्रिएटर", perk9Desc: "एक विशिष्ट क्रिएटर पहचान और प्रीमियम फ्रेम"
    },
    membershipScreen: {
      kicker: "अमोरा प्रिविलेज", title: "VIP सदस्यता", sub: "AmoraLive का आनंद लेने का एक बेहतर तरीका।",
      errorLoad: "सदस्यता लोड करने में असमर्थ।", checkoutUnavailable: "चेकआउट अभी उपलब्ध नहीं है।",
      noReceiptIOS: "App Store से कोई रसीद नहीं मिली।", noTokenAndroid: "Google Play से कोई खरीद टोकन नहीं मिला।",
      errorStart: "सदस्यता शुरू करने में असमर्थ।",
      chooseVipTitle: "VIP चुनें", subscribeQuestionPrefix: "सदस्यता लें", thisPlanFallback: "इस योजना की",
      subscribe: "सदस्यता लें",
      notAvailableTitle: "उपलब्ध नहीं", notAvailableBody: "खरीदारी पुनर्स्थापित करने के लिए नेटिव ऐप की आवश्यकता है — यह प्रीव्यू में उपलब्ध नहीं है।",
      nothingToRestoreTitle: "पुनर्स्थापित करने के लिए कुछ नहीं", nothingToRestoreBody: "इस खाते के लिए कोई सक्रिय सदस्यता नहीं मिली।",
      restoredTitle: "पुनर्स्थापित", restoredBody: "आपकी सदस्यता पुनर्स्थापित कर दी गई है।",
      errorRestore: "खरीदारी पुनर्स्थापित करने में असमर्थ।",
      yourMembership: "आपकी सदस्यता", freeWord: "मुफ़्त",
      restoring: "पुनर्स्थापित हो रहा है…", restorePurchases: "खरीदारी पुनर्स्थापित करें",
      nativeStoreHint: "इस बिल्ड में नेटिव स्टोर खरीदारी उपलब्ध नहीं है — इसके बजाय सुरक्षित वेब चेकआउट का उपयोग किया जा रहा है।",
      defaultPerk1: "VIP बैज और प्रोफ़ाइल फ्रेम", defaultPerk2: "विशेष उपहार", defaultPerk3: "VIP रूम", defaultPerk4: "मासिक लाभ",
      chooseVip: "VIP चुनें"
    },
    missionsScreen: {
      kicker: "अमोरा प्रोग्रेशन", title: "मिशन और उपलब्धियां",
      errorLoad: "मिशन लोड करने में असमर्थ।", errorClaim: "पुरस्कार का दावा करने में असमर्थ।",
      typeDaily: "📅 दैनिक", typeWeekly: "🗓️ साप्ताहिक", typeLifetime: "🏆 उपलब्धियां",
      claimed: "✓ दावा किया गया", claiming: "दावा किया जा रहा है…", claimReward: "पुरस्कार का दावा करें", inProgress: "प्रगति पर"
    },
    outfitsScreen: {
      kicker: "अमोरा कलेक्शन", title: "अपनी आभा को सजाएं।",
      subtitle: "फ्रेम, प्रभाव, बैज और प्रोफ़ाइल शैलियां जो आपकी अमोरा पहचान बनाती हैं।",
      errorLoad: "आपका संग्रह लोड करने में असमर्थ।", errorUpdate: "आपका लुक अपडेट करने में असमर्थ।",
      equipped: "इक्विप्ड", equip: "इक्विप करें", notOwned: "स्वामित्व में नहीं", coinsWord: "कॉइन"
    },
    rewardsScreen: {
      kicker: "अमोरा रिवॉर्ड्स", title: "वापस आएं। पुरस्कृत हों।",
      errorLoad: "पुरस्कार लोड करने में असमर्थ।", errorClaimNotAvailable: "पुरस्कार अभी उपलब्ध नहीं है।",
      dayStreakSuffix: "दिन की स्ट्रीक", coinsAvailableTodaySuffix: "आज उपलब्ध कॉइन",
      claimedToday: "✓ आज दावा किया गया", claiming: "दावा किया जा रहा है…", claimDailyReward: "दैनिक पुरस्कार का दावा करें",
      historyTitle: "पुरस्कार इतिहास",
      rewardFallback: "पुरस्कार", dayOfCyclePrefix: "दिन", ofCycle: "चक्र का", milestoneSuffix: "मील का पत्थर"
    },
    storeScreen: {
      kicker: "अमोरा लक्जरी वॉल्ट", title: "बुटीक",
      errorLoad: "स्टोर लोड करने में असमर्थ।", errorBuy: "खरीदारी विफल।", errorUpdate: "आइटम अपडेट करने में असमर्थ।",
      permanent: "स्थायी", equippedCheck: "इक्विप्ड ✓", equip: "इक्विप करें", buying: "खरीदा जा रहा है…", notEnoughCoins: "पर्याप्त कॉइन नहीं", buy: "खरीदें"
    },
    studioScreen: {
      kicker: "अमोरा क्रिएटर", title: "क्रिएटर स्टूडियो", errorLoad: "क्रिएटर स्टूडियो लोड करने में असमर्थ।",
      followers: "फॉलोअर्स", newThisWeek: "इस सप्ताह नए", streams: "स्ट्रीम्स", liveTime: "लाइव समय",
      peakViewers: "पीक व्यूअर्स", giftsReceived: "प्राप्त उपहार", earnings: "कमाई", level: "स्तर",
      quickTools: "त्वरित उपकरण", goLive: "🔴 लाइव जाएं", missionsLink: "🎯 मिशन", walletLink: "🎁 वॉलेट",
      last30Days: "पिछले 30 दिन", followersSuffix: "फॉलोअर्स"
    },
    withdrawScreen: {
      kicker: "अमोरा क्रिएटर पेआउट", title: "निकासी",
      errorLoad: "निकासी जानकारी लोड करने में असमर्थ।",
      minWithdrawalError: "न्यूनतम निकासी है", coinsWord: "कॉइन",
      maxBalanceError: "आप अपने बैलेंस से अधिक निकासी नहीं कर सकते।",
      enterPayoutDetails: "अपना भुगतान विवरण दर्ज करें।",
      requestSubmittedPrefix: "निकासी सबमिट की गई", errorSubmit: "निकासी सबमिट करने में असमर्थ।",
      minimumPrefix: "न्यूनतम:", ratePrefix: "दर:", perCoinSuffix: "¢ / कॉइन",
      coinsAmountLabel: "कॉइन राशि", payoutMethodLabel: "भुगतान विधि", payoutDetailsLabel: "भुगतान विवरण",
      detailsPlaceholder: "ईमेल या बैंक विवरण",
      submitting: "सबमिट किया जा रहा है…", requestWithdrawal: "निकासी का अनुरोध करें", historyTitle: "इतिहास",
      methodPaypal: "PAYPAL", methodBank: "बैंक", methodOther: "अन्य"
    },
    discoverScreen: {
      kicker: "अमोरा", title: "खोजें", subtitle: "ऐसे लोग, क्रिएटर्स और लाइव रूम खोजें जो आपके समय के लायक हों।",
      searchPlaceholder: "क्रिएटर्स, रूम खोजें…",
      catForYou: "आपके लिए", catLive: "लाइव", catCreators: "क्रिएटर्स", catDating: "डेटिंग", catNew: "नया",
      errorLoad: "खोज लोड करने में असमर्थ।", memberFallback: "अमोरा सदस्य", liveTag: "🔴 लाइव",
      nothingHere: "यहां अभी तक कुछ भी नहीं है। कोई अन्य श्रेणी आज़माएं।",
      verifiedCreator: "सत्यापित क्रिएटर", creatorWord: "क्रिएटर"
    },
    datingScreen: {
      kicker: "अमोरा", title: "प्यार खोजें", matchesLink: "मैच ♡",
      errorLoad: "डेटिंग लोड करने में असमर्थ।", memberFallback: "अमोरा सदस्य", compatibleSuffix: "% संगत",
      allCaughtUp: "आप पूरी तरह अपडेट हैं", comeBackLater: "नए कनेक्शन के लिए बाद में वापस आएं।"
    },
    liveScreen: {
      kicker: "अमोरा लाइव", title: "अभी लाइव", goLive: "● लाइव जाएं",
      heroKicker: "रीयल-टाइम कनेक्शन", heroTitle: "एक ऐसा रूम खोजें जो जीवंत लगे।",
      heroSub: "बातचीत में शामिल हों, नए लोगों से मिलें और प्रीमियम 3D उपहार भेजें।",
      errorLoad: "लाइव रूम लोड करने में असमर्थ।",
      noOneLive: "अभी कोई लाइव नहीं है", beFirst: "पहले बनें — ऊपर लाइव जाएं पर टैप करें।",
      generalFallback: "सामान्य"
    },
    storiesScreen: {
      kicker: "अमोरा", title: "स्टोरीज़", errorLoad: "स्टोरीज़ लोड करने में असमर्थ।",
      amoraFallback: "अमोरा", noStoriesYet: "अभी तक कोई स्टोरी नहीं है। एक पल साझा करने वाले पहले व्यक्ति बनें।"
    },
    deleteAccountScreen: {
      kicker: "खाता गोपनीयता", title: "अपना अमोरा खाता हटाएं।",
      subtitle: "अपने खाते से जुड़ा ईमेल दर्ज करें। हम आपको एक सुरक्षित पुष्टिकरण लिंक भेजेंगे।",
      defaultDoneMessage: "यदि उस ईमेल के लिए कोई अमोरा खाता मौजूद है, तो एक पुष्टिकरण लिंक भेजा गया है।",
      errorGeneric: "आपके अनुरोध को संसाधित करने में असमर्थ।", checkInbox: "अपना इनबॉक्स जांचें।",
      emailLabel: "ईमेल पता", requestButton: "खाता हटाने का अनुरोध करें",
      note: "सुरक्षा, धोखाधड़ी रोकथाम, वित्तीय रिकॉर्ड या कानूनी दायित्वों के लिए आवश्यक होने पर कुछ रिकॉर्ड बनाए रखे जा सकते हैं या गुमनाम किए जा सकते हैं।"
    },
    socialCompleteScreen: {
      missingSession: "यह साइन-इन सत्र गुम या अमान्य है।",
      errorContinue: "सामाजिक पंजीकरण जारी रखने में असमर्थ।",
      invalidEmail: "एक वैध ईमेल पता दर्ज करें।",
      invalidUsername: "3–20 अक्षरों, संख्याओं, बिंदुओं, डैश या अंडरस्कोर वाला उपयोगकर्ता नाम चुनें।",
      invalidDob: "अपनी जन्मतिथि YYYY-MM-DD के रूप में दर्ज करें।",
      errorFinishPrefix: "पंजीकरण समाप्त करने में असमर्थ", errorFinishSuffix: "।",
      securelyConnectingPrefix: "सुरक्षित रूप से कनेक्ट हो रहा है",
      brand: "अमोरा", title: "अपना खाता पूरा करें।",
      subtitle: "एक आखिरी कदम — अपना अमोरा उपयोगकर्ता नाम चुनें और पुष्टि करें कि आप 18+ हैं।",
      emailPlaceholder: "ईमेल पता", usernamePlaceholder: "उपयोगकर्ता नाम (3-20 अक्षर)", dobPlaceholder: "जन्मतिथि (YYYY-MM-DD)",
      continueToAmora: "अमोरा जारी रखें"
    },
    videoMatchScreen: {
      kicker: "अमोरा · वीडियो मैच", title: "आमने-सामने मिलें।",
      introTitle: "क्विक वीडियो मैच", introText: "एक संक्षिप्त पहली छाप। यदि आप दोनों एक-दूसरे को पसंद करते हैं, तो अमोरा एक मैच बनाता है।",
      startButton: "वीडियो मैच शुरू करें", findingSomeone: "किसी को ढूंढा जा रहा है…", connecting: "कनेक्ट हो रहा है…",
      stayHere: "यहीं रहें जब तक अमोरा एक संगत व्यक्ति खोजता है।",
      someoneWord: "कोई व्यक्ति", isHereSuffix: "यहां है", readyToMeet: "मिलने के लिए तैयार",
      waitingForVideo: "वीडियो का इंतज़ार…", howDidItFeel: "कैसा महसूस हुआ?",
      pass: "छोड़ें", like: "♥ पसंद है",
      matchExclaim: "यह एक मैच है!", noMatchThisTime: "इस बार कोई मैच नहीं",
      matchedBody: "आप दोनों को एक-दूसरे पसंद आए। आपका नया कनेक्शन तैयार है।",
      keepExploring: "खोजते रहें — मिलने के लिए और भी लोग हैं।",
      openMatches: "मैच खोलें", tryAgain: "पुनः प्रयास करें",
      errorAuth: "प्रमाणित करने में असमर्थ। कृपया फिर से साइन इन करें।", errorConnect: "कनेक्ट करने में असमर्थ।",
      errorVideoConnect: "वीडियो कनेक्ट करने में असमर्थ।", errorMatchFailed: "वीडियो मैच विफल रहा।"
    },
    videoScreen: {
      title: "वीडियो कॉल", memberFallback: "अमोरा सदस्य",
      readyLine: "LiveKit कॉल स्क्रीन तैयार है।",
      connectHint: "प्रोडक्शन मीडिया सत्र के लिए यहां मौजूदा नेटिव LiveKit रूम कनेक्ट करें।",
      endCall: "कॉल समाप्त करें"
    },
    chatScreen: {
      chatFallback: "चैट", privateConversation: "निजी बातचीत",
      startConversation: "बातचीत शुरू करें। दयालु रहें। 💗", messagePlaceholder: "एक संदेश लिखें…"
    },
    creatorProfileScreen: {
      errorLoad: "प्रोफ़ाइल लोड करने में असमर्थ।", errorUpdateFollow: "फॉलो अपडेट करने में असमर्थ।", notFound: "क्रिएटर नहीं मिला।",
      followersSuffix: "फॉलोअर्स", levelWord: "स्तर", following: "फॉलो कर रहे हैं", follow: "फॉलो करें", message: "संदेश"
    },
    liveRoomScreen: {
      errorRealtimeAuth: "रीयल-टाइम कनेक्शन प्रमाणित करने में विफल रहा।", inviteDeclined: "आपका बैटल आमंत्रण अस्वीकार कर दिया गया।",
      battleDraw: "🤝 यह बराबरी है!", battleWon: "🏆 आपने बैटल जीत ली!", battleLost: "😢 आप बैटल हार गए।",
      errorConnect: "लाइव स्ट्रीम से कनेक्ट करने में असमर्थ।", liveWord: "लाइव",
      videoUnavailable: "वीडियो उपलब्ध नहीं है", connectingVideo: "वीडियो कनेक्ट हो रहा है…",
      roomTitleFallback: "लाइव रूम", creatorFallback: "क्रिएटर", wantsToBattleSuffix: "बैटल करना चाहता है!",
      streamerFallback: "एक स्ट्रीमर", accept: "स्वीकार करें", decline: "अस्वीकार करें", endBattle: "बैटल समाप्त करें",
      gift: "उपहार", message: "संदेश", aboutThisLive: "इस लाइव के बारे में", generalFallback: "सामान्य", watchingSuffix: "देख रहे हैं"
    },
    videoDateScreen: {
      errorStart: "यह वीडियो डेट शुरू करने में असमर्थ।", backToMatches: "मैचों पर वापस जाएं",
      waitingOtherPerson: "दूसरे व्यक्ति का इंतज़ार…", connecting: "कनेक्ट हो रहा है…"
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
    },
    levelsScreen: {
      kicker: "AMORA ROYAL CLUB", title: "Level Anda. Aura Anda.", xpWord: "XP", xpUntilNext: "XP hingga pembukaan berikutnya",
      privileges: "Hak istimewa", unlocked: "TERBUKA", locked: "TERKUNCI",
      perk1Title: "Medali Kehormatan", perk1Desc: "Lencana khas di samping profil Anda",
      perk2Title: "Masuk Bercahaya", perk2Desc: "Efek masuk premium di ruang langsung",
      perk3Title: "Chat Kreator", perk3Desc: "Gaya chat yang ditingkatkan",
      perk4Title: "Set Hadiah VIP", perk4Desc: "Hadiah khusus hanya untuk bintang yang sedang naik daun",
      perk5Title: "Sorotan Spotlight", perk5Desc: "Sorotan premium untuk profil Anda",
      perk6Title: "Efek Elit", perk6Desc: "Efek eksklusif di ruang langsung",
      perk7Title: "Aura Emas", perk7Desc: "Aura profil kerajaan dan lencana",
      perk8Title: "Status Tersembunyi", perk8Desc: "Visibilitas online yang diam-diam opsional",
      perk9Title: "Kreator Kerajaan", perk9Desc: "Identitas kreator yang khas dan bingkai premium"
    },
    membershipScreen: {
      kicker: "HAK ISTIMEWA AMORA", title: "Keanggotaan VIP", sub: "Cara yang lebih indah untuk menikmati AmoraLive.",
      errorLoad: "Tidak dapat memuat keanggotaan.", checkoutUnavailable: "Checkout tidak tersedia saat ini.",
      noReceiptIOS: "Tidak ada tanda terima yang dikembalikan dari App Store.", noTokenAndroid: "Tidak ada token pembelian yang dikembalikan dari Google Play.",
      errorStart: "Tidak dapat memulai keanggotaan.",
      chooseVipTitle: "Pilih VIP", subscribeQuestionPrefix: "Berlangganan", thisPlanFallback: "paket ini",
      subscribe: "Berlangganan",
      notAvailableTitle: "Tidak tersedia", notAvailableBody: "Memulihkan Pembelian memerlukan build aplikasi native — tidak tersedia dalam pratinjau ini.",
      nothingToRestoreTitle: "Tidak ada yang dipulihkan", nothingToRestoreBody: "Tidak ditemukan langganan aktif untuk akun ini.",
      restoredTitle: "Dipulihkan", restoredBody: "Keanggotaan Anda telah dipulihkan.",
      errorRestore: "Tidak dapat memulihkan pembelian.",
      yourMembership: "KEANGGOTAAN ANDA", freeWord: "Gratis",
      restoring: "Memulihkan…", restorePurchases: "Pulihkan Pembelian",
      nativeStoreHint: "Pembelian toko native tidak tersedia di build ini — menggunakan checkout web aman sebagai gantinya.",
      defaultPerk1: "Lencana VIP & bingkai profil", defaultPerk2: "Hadiah eksklusif", defaultPerk3: "Ruang VIP", defaultPerk4: "Keuntungan bulanan",
      chooseVip: "Pilih VIP"
    },
    missionsScreen: {
      kicker: "PROGRESI AMORA", title: "Misi & Pencapaian",
      errorLoad: "Tidak dapat memuat misi.", errorClaim: "Tidak dapat mengklaim hadiah.",
      typeDaily: "📅 Harian", typeWeekly: "🗓️ Mingguan", typeLifetime: "🏆 Pencapaian",
      claimed: "✓ Diklaim", claiming: "Mengklaim…", claimReward: "Klaim hadiah", inProgress: "Sedang berlangsung"
    },
    outfitsScreen: {
      kicker: "KOLEKSI AMORA", title: "Dandani aura Anda.",
      subtitle: "Bingkai, efek, lencana, dan gaya profil yang membuat identitas Amora Anda menjadi milik Anda.",
      errorLoad: "Tidak dapat memuat koleksi Anda.", errorUpdate: "Tidak dapat memperbarui tampilan Anda.",
      equipped: "Terpasang", equip: "Pasang", notOwned: "Tidak dimiliki", coinsWord: "koin"
    },
    rewardsScreen: {
      kicker: "HADIAH AMORA", title: "Kembali. Dapatkan hadiah.",
      errorLoad: "Tidak dapat memuat hadiah.", errorClaimNotAvailable: "Hadiah belum tersedia.",
      dayStreakSuffix: "hari beruntun", coinsAvailableTodaySuffix: "koin tersedia hari ini",
      claimedToday: "✓ Diklaim hari ini", claiming: "Mengklaim…", claimDailyReward: "Klaim hadiah harian",
      historyTitle: "Riwayat hadiah",
      rewardFallback: "Hadiah", dayOfCyclePrefix: "Hari", ofCycle: "dari siklus", milestoneSuffix: "tonggak"
    },
    storeScreen: {
      kicker: "BRANKAS MEWAH AMORA", title: "Butik",
      errorLoad: "Tidak dapat memuat toko.", errorBuy: "Pembelian gagal.", errorUpdate: "Tidak dapat memperbarui item.",
      permanent: "Permanen", equippedCheck: "Terpasang ✓", equip: "Pasang", buying: "Membeli…", notEnoughCoins: "Koin tidak cukup", buy: "Beli"
    },
    studioScreen: {
      kicker: "KREATOR AMORA", title: "Studio Kreator", errorLoad: "Tidak dapat memuat Studio Kreator.",
      followers: "Pengikut", newThisWeek: "Baru minggu ini", streams: "Siaran", liveTime: "Waktu siaran langsung",
      peakViewers: "Puncak penonton", giftsReceived: "Hadiah diterima", earnings: "Pendapatan", level: "Level",
      quickTools: "Alat cepat", goLive: "🔴 Mulai Siaran Langsung", missionsLink: "🎯 Misi", walletLink: "🎁 Dompet",
      last30Days: "30 hari terakhir", followersSuffix: "pengikut"
    },
    withdrawScreen: {
      kicker: "PEMBAYARAN KREATOR AMORA", title: "Tarik",
      errorLoad: "Tidak dapat memuat informasi penarikan.",
      minWithdrawalError: "Penarikan minimum adalah", coinsWord: "koin",
      maxBalanceError: "Anda tidak dapat menarik lebih dari saldo Anda.",
      enterPayoutDetails: "Masukkan detail pembayaran Anda.",
      requestSubmittedPrefix: "Penarikan diajukan untuk", errorSubmit: "Tidak dapat mengajukan penarikan.",
      minimumPrefix: "Minimum:", ratePrefix: "Tarif:", perCoinSuffix: "¢ / koin",
      coinsAmountLabel: "Jumlah koin", payoutMethodLabel: "Metode pembayaran", payoutDetailsLabel: "Detail pembayaran",
      detailsPlaceholder: "Email atau detail bank",
      submitting: "Mengirim…", requestWithdrawal: "Ajukan penarikan", historyTitle: "Riwayat",
      methodPaypal: "PAYPAL", methodBank: "BANK", methodOther: "LAINNYA"
    },
    discoverScreen: {
      kicker: "AMORA", title: "Jelajahi", subtitle: "Temukan orang, kreator, dan ruang langsung yang layak untuk waktu Anda.",
      searchPlaceholder: "Cari kreator, ruang…",
      catForYou: "Untuk Anda", catLive: "Langsung", catCreators: "Kreator", catDating: "Kencan", catNew: "Baru",
      errorLoad: "Tidak dapat memuat Jelajahi.", memberFallback: "Anggota Amora", liveTag: "🔴 LANGSUNG",
      nothingHere: "Belum ada apa-apa di sini. Coba kategori lain.",
      verifiedCreator: "Kreator terverifikasi", creatorWord: "Kreator"
    },
    datingScreen: {
      kicker: "AMORA", title: "Temukan Cinta", matchesLink: "Kecocokan ♡",
      errorLoad: "Tidak dapat memuat kencan.", memberFallback: "Anggota Amora", compatibleSuffix: "% cocok",
      allCaughtUp: "Anda sudah update", comeBackLater: "Kembali lagi nanti untuk koneksi baru."
    },
    liveScreen: {
      kicker: "AMORA LANGSUNG", title: "Langsung sekarang", goLive: "● Mulai Siaran Langsung",
      heroKicker: "KONEKSI WAKTU NYATA", heroTitle: "Temukan ruang yang terasa hidup.",
      heroSub: "Bergabung dalam percakapan, temui orang baru, dan kirim hadiah 3D premium.",
      errorLoad: "Tidak dapat memuat ruang langsung.",
      noOneLive: "Tidak ada yang siaran langsung sekarang", beFirst: "Jadilah yang pertama — ketuk Mulai Siaran Langsung di atas.",
      generalFallback: "Umum"
    },
    storiesScreen: {
      kicker: "AMORA", title: "Cerita", errorLoad: "Tidak dapat memuat cerita.",
      amoraFallback: "Amora", noStoriesYet: "Belum ada cerita. Jadilah yang pertama membagikan momen."
    },
    deleteAccountScreen: {
      kicker: "PRIVASI AKUN", title: "Hapus akun Amora Anda.",
      subtitle: "Masukkan email yang terkait dengan akun Anda. Kami akan mengirimkan tautan konfirmasi yang aman.",
      defaultDoneMessage: "Jika akun Amora ada untuk email tersebut, tautan konfirmasi telah dikirim.",
      errorGeneric: "Tidak dapat memproses permintaan Anda.", checkInbox: "Periksa kotak masuk Anda.",
      emailLabel: "Alamat email", requestButton: "Ajukan penghapusan akun",
      note: "Beberapa catatan dapat disimpan atau dianonimkan jika diperlukan untuk keamanan, pencegahan penipuan, catatan keuangan, atau kewajiban hukum."
    },
    socialCompleteScreen: {
      missingSession: "Sesi masuk ini hilang atau tidak valid.",
      errorContinue: "Tidak dapat melanjutkan pendaftaran sosial.",
      invalidEmail: "Masukkan alamat email yang valid.",
      invalidUsername: "Pilih nama pengguna dengan 3–20 huruf, angka, titik, tanda hubung, atau garis bawah.",
      invalidDob: "Masukkan tanggal lahir Anda sebagai YYYY-MM-DD.",
      errorFinishPrefix: "Tidak dapat menyelesaikan pendaftaran", errorFinishSuffix: ".",
      securelyConnectingPrefix: "Terhubung dengan aman ke",
      brand: "AMORA", title: "Selesaikan akun Anda.",
      subtitle: "Satu langkah terakhir — pilih nama pengguna Amora Anda dan konfirmasi bahwa Anda berusia 18+.",
      emailPlaceholder: "Alamat email", usernamePlaceholder: "Nama pengguna (3-20 karakter)", dobPlaceholder: "Tanggal lahir (YYYY-MM-DD)",
      continueToAmora: "Lanjutkan ke Amora"
    },
    videoMatchScreen: {
      kicker: "AMORA · VIDEO MATCH", title: "Bertemu langsung.",
      introTitle: "Video Match Cepat", introText: "Kesan pertama yang singkat. Jika kalian berdua saling menyukai, Amora akan membuat kecocokan.",
      startButton: "Mulai Video Match", findingSomeone: "Mencari seseorang…", connecting: "Menghubungkan…",
      stayHere: "Tetap di sini sementara Amora mencari orang yang cocok.",
      someoneWord: "Seseorang", isHereSuffix: "ada di sini", readyToMeet: "Siap bertemu",
      waitingForVideo: "Menunggu video…", howDidItFeel: "Bagaimana rasanya?",
      pass: "Lewati", like: "♥ Suka",
      matchExclaim: "Ini cocok!", noMatchThisTime: "Tidak cocok kali ini",
      matchedBody: "Kalian berdua saling menyukai. Koneksi baru Anda sudah siap.",
      keepExploring: "Terus jelajahi — masih ada lebih banyak orang untuk ditemui.",
      openMatches: "Buka Kecocokan", tryAgain: "Coba Lagi",
      errorAuth: "Tidak dapat mengautentikasi. Silakan masuk lagi.", errorConnect: "Tidak dapat terhubung.",
      errorVideoConnect: "Tidak dapat menghubungkan video.", errorMatchFailed: "Video match gagal."
    },
    videoScreen: {
      title: "Panggilan video", memberFallback: "Anggota Amora",
      readyLine: "Layar panggilan LiveKit siap.",
      connectHint: "Hubungkan Room LiveKit native yang ada di sini untuk sesi media produksi.",
      endCall: "Akhiri panggilan"
    },
    chatScreen: {
      chatFallback: "Chat", privateConversation: "Percakapan pribadi",
      startConversation: "Mulai percakapan. Bersikaplah baik. 💗", messagePlaceholder: "Tulis pesan…"
    },
    creatorProfileScreen: {
      errorLoad: "Tidak dapat memuat profil.", errorUpdateFollow: "Tidak dapat memperbarui status ikuti.", notFound: "Kreator tidak ditemukan.",
      followersSuffix: "pengikut", levelWord: "level", following: "Mengikuti", follow: "Ikuti", message: "Pesan"
    },
    liveRoomScreen: {
      errorRealtimeAuth: "Koneksi real-time gagal melakukan autentikasi.", inviteDeclined: "Undangan battle Anda ditolak.",
      battleDraw: "🤝 Seri!", battleWon: "🏆 Anda memenangkan battle!", battleLost: "😢 Anda kalah dalam battle.",
      errorConnect: "Tidak dapat terhubung ke siaran langsung.", liveWord: "LANGSUNG",
      videoUnavailable: "Video tidak tersedia", connectingVideo: "Menghubungkan video…",
      roomTitleFallback: "Ruang live", creatorFallback: "Kreator", wantsToBattleSuffix: "ingin battle!",
      streamerFallback: "Seorang streamer", accept: "Terima", decline: "Tolak", endBattle: "Akhiri Battle",
      gift: "Hadiah", message: "Pesan", aboutThisLive: "Tentang siaran ini", generalFallback: "Umum", watchingSuffix: "menonton"
    },
    videoDateScreen: {
      errorStart: "Tidak dapat memulai video date ini.", backToMatches: "Kembali ke Kecocokan",
      waitingOtherPerson: "Menunggu orang lain…", connecting: "Menghubungkan…"
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
