// lib/i18n.js
//
// A small, dependency-free translation layer. No i18n library is installed
// in this project (and this environment can't safely test a fresh
// `npm install` + build cycle for one), so this implements just what the
// app actually needs: a language switch, localStorage persistence, and a
// `t(key)` lookup with an English fallback for any key a translation
// hasn't caught up to yet.
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ar', label: 'العربية' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'id', label: 'Bahasa Indonesia' }
];

export const RTL_LANGUAGES = ['ar'];

export const translations = {
  en: {
    nav: {
      discover: 'Discover', goLive: 'Go Live', studio: 'Studio', match: 'Match', events: 'Events',
      rewards: 'Rewards', missions: 'Missions', vip: 'VIP', chat: 'Chat', matches: 'Matches',
      safety: 'Safety', profile: 'Profile', admin: 'Admin', logout: 'Logout', store: 'Store',
      notifications: 'Notifications', wallet: 'Wallet'
    },
    footer: {
      terms: 'Terms', privacy: 'Privacy', guidelines: 'Guidelines', cookies: 'Cookies',
      tagline: 'Made for meaningful connections.'
    },
    common: {
      language: 'Language', save: 'Save', cancel: 'Cancel', loading: 'Loading…', continue: 'Continue',
      back: 'Back', or: 'OR'
    },
    auth: {
      login: {
        eyebrow: 'WELCOME BACK', title: 'Welcome back to', titleHighlight: 'Amora.',
        subtitle: 'Sign in to your matches, conversations and live moments.',
        footerText: 'New to Amora?', footerLabel: 'Create your account', backLink: '← Back to AmoraLive',
        errorGoogle: 'Google sign-in could not be completed. Please try again.',
        errorApple: 'Apple sign-in could not be completed. Please try again.',
        errorFacebook: 'Facebook sign-in could not be completed. Please try again.',
        errorSuspended: 'This account is currently suspended.',
        emailLabel: 'Email or username', emailPlaceholder: 'you@example.com or username',
        passwordLabel: 'Password', passwordPlaceholder: 'Your password',
        showPassword: 'Show', hidePassword: 'Hide',
        submit: 'Sign in', submitting: 'Signing you in…',
        continueApple: 'Continue with Apple', connectingApple: 'Connecting to Apple…',
        continueFacebook: 'Continue with Facebook', connectingFacebook: 'Connecting to Facebook…',
        continueGoogle: 'Continue with Google', connectingGoogle: 'Connecting to Google…',
        byContinuing: "By continuing, you agree to AmoraLive's", termsLink: 'Terms', andLink: 'and', privacyLink: 'Privacy Policy'
      },
      register: {
        eyebrow: 'JOIN AMORA', title: 'Create your Amora account.',
        subtitle: 'Meet people, build connections and share meaningful moments.',
        footerText: 'Already have an account?', footerLabel: 'Sign in', backLink: '← Back to AmoraLive',
        continueApple: 'Continue with Apple', connectingApple: 'Connecting to Apple…',
        continueFacebook: 'Continue with Facebook', connectingFacebook: 'Connecting to Facebook…',
        continueGoogle: 'Continue with Google', connectingGoogle: 'Connecting to Google…',
        emailLabel: 'Email address', emailPlaceholder: 'you@example.com',
        usernameLabel: 'Username', usernamePlaceholder: 'Choose a username',
        usernameHint: '3–20 characters: letters, numbers, dots, dashes or underscores.',
        passwordLabel: 'Password', passwordPlaceholder: 'At least 8 characters',
        showPassword: 'Show', hidePassword: 'Hide',
        dobLabel: 'Date of birth', dobHint: 'AmoraLive is an 18+ community.',
        submit: 'Create account', submitting: 'Creating account…',
        successTitle: 'Check your inbox.',
        successSubtitle: 'Your Amora account is ready. Verify your email address to continue.',
        successHeading: 'Registration successful',
        successBody: 'We sent a verification link to your email. Open it, then come back and sign in.',
        goToLogin: 'Go to Login',
        byCreating: 'By creating an account, you agree to our', termsLink: 'Terms', andLink: 'and', privacyLink: 'Privacy Policy'
      }
    },
    discover: {
      tabRecommended: 'Recommended', tabTrending: 'Trending', tabNew: 'New', tabFollowing: 'Following', tabCreators: 'Creators', tabCategories: 'Categories',
      typePopular: 'Popular', typeRising: 'Rising', typeNew: 'New',
      catChat: 'Chat', catMusic: 'Music', catEntertainment: 'Entertainment', catGaming: 'Gaming', catLifestyle: 'Lifestyle', catTravel: 'Travel', catQA: 'Q&A', catDating: 'Dating',
      searchPlaceholder: '🔍 Search creators and live streams…', searching: 'Searching…',
      creatorsHeader: 'Creators', liveNowHeader: 'Live now', noResultsFor: 'No results for',
      loadingCreators: 'Loading creators...', loadingLive: 'Loading live streams...',
      errorPrefix: 'Error:', retry: 'Retry',
      noCreatorsYet: 'No creators to show yet.', noLiveNow: 'No live streams right now', checkBackLater: 'Check back later or start your own!',
      following: 'Following', follow: 'Follow', message: 'Message',
      followersSuffix: 'followers', thisWeekSuffix: 'this week',
      live: 'LIVE', unknown: 'Unknown', untitled: 'Untitled', general: 'General'
    },
    matches: {
      title: '💕 Matches', preferencesBtn: '⚙️ Preferences', tabDiscover: 'Discover', tabMyMatches: 'My Matches',
      matchedWithPrefix: "🎉 It's a match with", matchedWithSuffix: '! Tap to dismiss.',
      noMoreProfiles: 'No more profiles right now', widenPreferences: 'Check back later, or widen your preferences.',
      matchPercentSuffix: '% match', noMatchesYet: 'No matches yet — keep discovering!', compatiblePercentSuffix: '% compatible',
      unmatchConfirm: 'Unmatch? This removes the connection and cannot be undone.',
      prefsTitle: 'Dating Preferences', yourGender: 'Your gender', preferNotToSay: 'Prefer not to say', showMe: 'Show me',
      ageRangeLabel: 'Age range:', savePreferences: 'Save Preferences'
    },
    wallet: {
      loadingWallet: 'Loading wallet...', errorPrefix: 'Error:', retry: 'Retry', title: 'My Wallet', profile: 'Profile',
      availableCoins: 'Available Coins', hidePackages: 'Hide Packages', buyCoins: 'Buy Coins', withdraw: 'Withdraw', buy: 'Buy',
      promotion: '🔥 Promotion', allTransactions: 'All Transactions', giftHistory: 'Gift History',
      noTransactionsYet: 'No transactions yet', transactionFallback: 'Transaction'
    },
    store: {
      kicker: 'AMORA • LUXURY VAULT', title: 'The Amora Boutique', subtitle: 'Collect luminous profile effects, royal identities and premium cosmetics.',
      catalogTab: 'Catalog', myItemsTab: 'My Items', equipOutfits: 'Equip Outfits →',
      loadingBoutique: 'Loading the boutique…', nothingInStore: 'Nothing in the store right now.',
      daysSuffix: 'days', permanent: 'Permanent', processing: 'Processing…', extend: 'Extend', owned: 'Owned', buy: 'Buy',
      noOwnedItems: "You don't own any items yet. Check the catalog!", expiresPrefix: 'Expires', equipped: 'Equipped ✓', equip: 'Equip',
      errorLoadStore: 'Unable to load the store right now.', notEnoughCoins: "You don't have enough coins for this item.",
      purchaseFailed: 'Purchase failed.', extendedPrefix: 'Extended', purchasedPrefix: 'Purchased', updateItemFailed: 'Unable to update this item.',
      typeAvatarFrame: 'Avatar Frames', typeEntranceEffect: 'Entrance Effects', typeBadge: 'Badges', typeChatBubble: 'Chat Bubbles', typeProfileCard: 'Profile Cards'
    },
    safety: {
      errorLoad: 'Unable to load Safety Center.',
      revokeOthersConfirm: "Log out every other device? You'll stay signed in here.",
      signedOutOf: 'Signed out of', otherDevice: 'other device.', otherDevices: 'other devices.',
      tabBlocked: 'Blocked', tabMuted: 'Muted', tabMyReports: 'My Reports', tabDevices: 'Devices',
      title: '🛡️ Safety Center', securityKicker: 'AMORA SECURITY',
      excellentProtection: 'Excellent protection', strongProtection: 'Strong protection', protectionNeedsAttention: 'Protection needs attention',
      emailVerified: '✓ Email', reviewEmail: 'Review email', device: 'device', devices: 'devices',
      privacyConfigured: '✓ Privacy', reviewPrivacy: 'Review privacy',
      changePassword: '🔑 Change Password', privacySettings: '🔒 Privacy Settings',
      noBlockedUsers: 'No blocked users.', unblock: 'Unblock',
      noMutedUsers: "No muted users. Muting hides someone's content from you without them knowing, and without blocking them.", unmute: 'Unmute',
      noReportsSubmitted: "You haven't submitted any reports.",
      logOutAllOtherDevices: 'Log out all other devices',
      unknownDevice: 'Unknown device', unknownLocation: 'Unknown location', signedInPrefix: 'signed in', revoke: 'Revoke'
    },
    chat: {
      failedLoadConversations: 'Failed to load conversations',
      unableToLoadMessages: 'Unable to load messages',
      openingMessages: 'Opening your private messages…',
      eyebrow: 'AMORA PRIVATE', title: 'Messages', subtitle: 'Private conversations, beautifully kept.',
      discoverLink: 'Discover', retry: 'Retry',
      noConversationsYet: 'No conversations yet', startMatchSayHello: 'Start a match and say hello.', discoverPeople: 'Discover people',
      sentPhotoOrVideo: 'Sent a photo or video', justNow: 'Just now'
    },
    notifications: {
      title: 'Notifications', markingEllipsis: 'Marking…', markAllRead: 'Mark all read',
      allCaughtUp: "You're all caught up. Nothing here yet.", dismiss: 'Dismiss',
      errorLoad: 'Unable to load notifications.', someoneFallback: 'Someone',
      newMatch: 'You have a new match!', superLikedYou: 'super liked you!',
      sentMessage: 'sent you a message:', youReceived: 'You received', giftFallback: 'a gift',
      levelUpTo: "Level up! You're now Level", earnedBadgePrefix: '— earned the', earnedBadgeSuffix: 'badge',
      dailyRewardClaimed: 'Daily reward claimed:', coinsWord: 'coins', dayStreak: 'day streak',
      yourWord: 'Your', monthlyBonusArrived: 'monthly bonus arrived:',
      missionComplete: 'Mission complete:', missionFallback: 'a mission', xpWord: 'XP',
      yourWithdrawalOf: 'Your withdrawal of', wasApproved: 'was approved.',
      wasRejected: 'was rejected — the coins were refunded.', hasBeenPaid: 'has been paid.',
      notificationFallback: 'Notification', justNow: 'just now', minAgo: 'm ago', hAgo: 'h ago', dAgo: 'd ago'
    },
    events: {
      ended: 'Ended', dayUnit: 'd', hourUnit: 'h', minuteUnit: 'm', left: 'left',
      errorLoad: 'Unable to load the current event.', errorJoinTeam: 'Unable to join this team.',
      noLiveEvent: 'No live event right now. Check back soon!',
      pickSide: 'Pick a side to join the battle:',
      youreOnTeamPrefix: "You're on Team", youreOnTeamSuffix: "— send gifts to boost your team's score!",
      topContributors: 'Top contributors', noOneScoredYet: 'No one has scored yet — be the first!', ptsSuffix: 'pts'
    },
    settings: {
      errorLoadUser: 'Failed to fetch user',
      passwordsDontMatch: 'Passwords do not match',
      passwordMinLength: 'New password must be at least 10 characters',
      errorChangePassword: 'Failed to change password',
      passwordUpdatedSuccess: 'Password updated successfully. Please sign in again.',
      errorUpdatePrivacy: 'Failed to update privacy',
      privacyUpdatedSuccess: 'Privacy settings updated',
      errorStartCheckout: 'Unable to start checkout.', checkoutUnavailable: 'Checkout is not available right now.',
      deleteConfirm: 'Are you sure? This action is permanent and cannot be undone.',
      loadingSettings: 'Loading settings...',
      sidebarAccount: 'Account', sidebarPrivacy: 'Privacy', sidebarMembership: 'Membership', sidebarSupport: 'Support & Legal',
      logout: 'Logout', deleteAccount: 'Delete Account', title: 'Settings',
      accountSettingsTitle: 'Account Settings',
      emailLabel: 'Email', usernameLabel: 'Username', displayNameLabel: 'Display Name',
      changePasswordTitle: 'Change Password',
      currentPasswordPlaceholder: 'Current password', newPasswordPlaceholder: 'New password (min 10 chars)', confirmPasswordPlaceholder: 'Confirm new password',
      updating: 'Updating...', updatePassword: 'Update Password',
      privacySettingsTitle: 'Privacy Settings',
      showOnlineStatus: 'Show online status', profileVisibleToOthers: 'Profile visible to others', showAgeOnProfile: 'Show age on profile', showLocationOnProfile: 'Show location on profile',
      manageBlockList: 'Manage Block List →',
      membershipTitle: 'Membership',
      premiumName: 'Premium', premiumDesc: 'Ad-free, exclusive gifts, priority support',
      vipName: 'VIP', vipDesc: 'All Premium benefits + extra coins, profile boost',
      svipName: 'SVIP', svipDesc: 'All VIP benefits + private shows, unlimited gifts',
      redirecting: 'Redirecting…', upgrade: 'Upgrade',
      currentPlan: 'Current Plan', freeWord: 'Free', expires: 'Expires',
      upgradeYourPlan: 'Upgrade Your Plan',
      supportLegalTitle: 'Support & Legal',
      termsOfService: 'Terms of Service', privacyPolicy: 'Privacy Policy', communityGuidelines: 'Community Guidelines', cookiePolicy: 'Cookie Policy', contactSupport: 'Contact Support'
    },
    profile: {
      errorLoad: 'Failed to fetch profile', fallbackErrorLoad: 'Unable to load profile',
      errorUpdate: 'Update failed', errorUpload: 'Upload failed',
      deleteConfirm: 'Are you sure? This action is permanent.',
      loadingProfile: 'Loading your Amora profile…',
      userNotFound: 'User not found', retry: 'Retry',
      locationNotSet: 'Location not set',
      changePhotoAria: 'Change profile photo',
      followers: 'Followers', following: 'Following', xpWord: 'XP', levelWord: 'Level',
      editProfile: 'Edit profile', settings: 'Settings', security: '🛡️ Security',
      profileStudio: 'PROFILE STUDIO', editYourProfile: 'Edit your profile',
      displayNameLabel: 'Display name', bioLabel: 'Bio', relationshipIntentLabel: 'Relationship intent', interestsLabel: 'Interests', languagesLabel: 'Languages',
      saveChanges: 'Save changes', cancel: 'Cancel',
      aboutKicker: 'ABOUT', personalSpace: 'Personal space',
      noBioYet: 'No bio yet. Add something that tells people what makes you, you.',
      locationDetail: 'Location', intentDetail: 'Intent', notSet: 'Not set', memberSinceDetail: 'Member since', membershipDetail: 'Membership',
      amoraStatusKicker: 'AMORA STATUS', levelProgress: 'Level progress',
      viewLevelRewards: 'View level rewards →',
      identityKicker: 'IDENTITY', interestsAndBadges: 'Interests & badges',
      blockListPrefix: '🚫 Block list',
      deleteAccount: 'Delete account',
      blockedUsersTitle: 'Blocked users', noBlockedUsers: 'No blocked users.', unknownUserFallback: 'user', unblock: 'Unblock'
    }
  },

  es: {
    nav: {
      discover: 'Descubrir', goLive: 'Transmitir', studio: 'Estudio', match: 'Emparejar', events: 'Eventos',
      rewards: 'Recompensas', missions: 'Misiones', vip: 'VIP', chat: 'Chat', matches: 'Coincidencias',
      safety: 'Seguridad', profile: 'Perfil', admin: 'Admin', logout: 'Cerrar sesión', store: 'Tienda',
      notifications: 'Notificaciones', wallet: 'Billetera'
    },
    footer: {
      terms: 'Términos', privacy: 'Privacidad', guidelines: 'Normas', cookies: 'Cookies',
      tagline: 'Hecho para conexiones con sentido.'
    },
    common: {
      language: 'Idioma', save: 'Guardar', cancel: 'Cancelar', loading: 'Cargando…', continue: 'Continuar',
      back: 'Atrás', or: 'O'
    },
    auth: {
      login: {
        eyebrow: 'BIENVENIDO DE NUEVO', title: 'Bienvenido de nuevo a', titleHighlight: 'Amora.',
        subtitle: 'Inicia sesión para ver tus coincidencias, conversaciones y momentos en vivo.',
        footerText: '¿Nuevo en Amora?', footerLabel: 'Crea tu cuenta', backLink: '← Volver a AmoraLive',
        errorGoogle: 'No se pudo completar el inicio de sesión con Google. Inténtalo de nuevo.',
        errorApple: 'No se pudo completar el inicio de sesión con Apple. Inténtalo de nuevo.',
        errorFacebook: 'No se pudo completar el inicio de sesión con Facebook. Inténtalo de nuevo.',
        errorSuspended: 'Esta cuenta está suspendida actualmente.',
        emailLabel: 'Correo o nombre de usuario', emailPlaceholder: 'tu@ejemplo.com o usuario',
        passwordLabel: 'Contraseña', passwordPlaceholder: 'Tu contraseña',
        showPassword: 'Mostrar', hidePassword: 'Ocultar',
        submit: 'Iniciar sesión', submitting: 'Iniciando sesión…',
        continueApple: 'Continuar con Apple', connectingApple: 'Conectando con Apple…',
        continueFacebook: 'Continuar con Facebook', connectingFacebook: 'Conectando con Facebook…',
        continueGoogle: 'Continuar con Google', connectingGoogle: 'Conectando con Google…',
        byContinuing: 'Al continuar, aceptas los', termsLink: 'Términos', andLink: 'y la', privacyLink: 'Política de Privacidad'
      },
      register: {
        eyebrow: 'ÚNETE A AMORA', title: 'Crea tu cuenta de Amora.',
        subtitle: 'Conoce gente, crea conexiones y comparte momentos con sentido.',
        footerText: '¿Ya tienes una cuenta?', footerLabel: 'Iniciar sesión', backLink: '← Volver a AmoraLive',
        continueApple: 'Continuar con Apple', connectingApple: 'Conectando con Apple…',
        continueFacebook: 'Continuar con Facebook', connectingFacebook: 'Conectando con Facebook…',
        continueGoogle: 'Continuar con Google', connectingGoogle: 'Conectando con Google…',
        emailLabel: 'Correo electrónico', emailPlaceholder: 'tu@ejemplo.com',
        usernameLabel: 'Nombre de usuario', usernamePlaceholder: 'Elige un nombre de usuario',
        usernameHint: '3–20 caracteres: letras, números, puntos, guiones o guiones bajos.',
        passwordLabel: 'Contraseña', passwordPlaceholder: 'Al menos 8 caracteres',
        showPassword: 'Mostrar', hidePassword: 'Ocultar',
        dobLabel: 'Fecha de nacimiento', dobHint: 'AmoraLive es una comunidad +18.',
        submit: 'Crear cuenta', submitting: 'Creando cuenta…',
        successTitle: 'Revisa tu correo.',
        successSubtitle: 'Tu cuenta de Amora está lista. Verifica tu correo para continuar.',
        successHeading: 'Registro exitoso',
        successBody: 'Enviamos un enlace de verificación a tu correo. Ábrelo y luego vuelve para iniciar sesión.',
        goToLogin: 'Ir a Iniciar sesión',
        byCreating: 'Al crear una cuenta, aceptas nuestros', termsLink: 'Términos', andLink: 'y', privacyLink: 'Política de Privacidad'
      }
    },
    discover: {
      tabRecommended: 'Recomendado', tabTrending: 'Tendencias', tabNew: 'Nuevo', tabFollowing: 'Siguiendo', tabCreators: 'Creadores', tabCategories: 'Categorías',
      typePopular: 'Popular', typeRising: 'En ascenso', typeNew: 'Nuevo',
      catChat: 'Chat', catMusic: 'Música', catEntertainment: 'Entretenimiento', catGaming: 'Videojuegos', catLifestyle: 'Estilo de vida', catTravel: 'Viajes', catQA: 'Preguntas', catDating: 'Citas',
      searchPlaceholder: '🔍 Buscar creadores y transmisiones en vivo…', searching: 'Buscando…',
      creatorsHeader: 'Creadores', liveNowHeader: 'En vivo ahora', noResultsFor: 'Sin resultados para',
      loadingCreators: 'Cargando creadores...', loadingLive: 'Cargando transmisiones en vivo...',
      errorPrefix: 'Error:', retry: 'Reintentar',
      noCreatorsYet: 'Aún no hay creadores para mostrar.', noLiveNow: 'No hay transmisiones en vivo ahora', checkBackLater: '¡Vuelve más tarde o comienza la tuya!',
      following: 'Siguiendo', follow: 'Seguir', message: 'Mensaje',
      followersSuffix: 'seguidores', thisWeekSuffix: 'esta semana',
      live: 'EN VIVO', unknown: 'Desconocido', untitled: 'Sin título', general: 'General'
    },
    matches: {
      title: '💕 Coincidencias', preferencesBtn: '⚙️ Preferencias', tabDiscover: 'Descubrir', tabMyMatches: 'Mis coincidencias',
      matchedWithPrefix: '🎉 ¡Hiciste match con', matchedWithSuffix: '! Toca para cerrar.',
      noMoreProfiles: 'No hay más perfiles por ahora', widenPreferences: 'Vuelve más tarde o amplía tus preferencias.',
      matchPercentSuffix: '% de compatibilidad', noMatchesYet: 'Aún no tienes coincidencias — ¡sigue descubriendo!', compatiblePercentSuffix: '% compatible',
      unmatchConfirm: '¿Deshacer match? Esto elimina la conexión y no se puede deshacer.',
      prefsTitle: 'Preferencias de citas', yourGender: 'Tu género', preferNotToSay: 'Prefiero no decirlo', showMe: 'Mostrarme',
      ageRangeLabel: 'Rango de edad:', savePreferences: 'Guardar preferencias'
    },
    wallet: {
      loadingWallet: 'Cargando billetera...', errorPrefix: 'Error:', retry: 'Reintentar', title: 'Mi billetera', profile: 'Perfil',
      availableCoins: 'Monedas disponibles', hidePackages: 'Ocultar paquetes', buyCoins: 'Comprar monedas', withdraw: 'Retirar', buy: 'Comprar',
      promotion: '🔥 Promoción', allTransactions: 'Todas las transacciones', giftHistory: 'Historial de regalos',
      noTransactionsYet: 'Aún no hay transacciones', transactionFallback: 'Transacción'
    },
    store: {
      kicker: 'AMORA • BÓVEDA DE LUJO', title: 'La Boutique Amora', subtitle: 'Colecciona efectos de perfil luminosos, identidades reales y cosméticos premium.',
      catalogTab: 'Catálogo', myItemsTab: 'Mis artículos', equipOutfits: 'Equipar atuendos →',
      loadingBoutique: 'Cargando la boutique…', nothingInStore: 'No hay nada en la tienda por ahora.',
      daysSuffix: 'días', permanent: 'Permanente', processing: 'Procesando…', extend: 'Extender', owned: 'Adquirido', buy: 'Comprar',
      noOwnedItems: 'Aún no tienes artículos. ¡Revisa el catálogo!', expiresPrefix: 'Expira', equipped: 'Equipado ✓', equip: 'Equipar',
      errorLoadStore: 'No se puede cargar la tienda en este momento.', notEnoughCoins: 'No tienes suficientes monedas para este artículo.',
      purchaseFailed: 'La compra falló.', extendedPrefix: 'Extendido', purchasedPrefix: 'Comprado', updateItemFailed: 'No se pudo actualizar este artículo.',
      typeAvatarFrame: 'Marcos de avatar', typeEntranceEffect: 'Efectos de entrada', typeBadge: 'Insignias', typeChatBubble: 'Burbujas de chat', typeProfileCard: 'Tarjetas de perfil'
    },
    safety: {
      errorLoad: 'No se pudo cargar el Centro de seguridad.',
      revokeOthersConfirm: '¿Cerrar sesión en todos los demás dispositivos? Seguirás con la sesión iniciada aquí.',
      signedOutOf: 'Se cerró sesión en', otherDevice: 'otro dispositivo.', otherDevices: 'otros dispositivos.',
      tabBlocked: 'Bloqueados', tabMuted: 'Silenciados', tabMyReports: 'Mis reportes', tabDevices: 'Dispositivos',
      title: '🛡️ Centro de seguridad', securityKicker: 'SEGURIDAD AMORA',
      excellentProtection: 'Protección excelente', strongProtection: 'Protección sólida', protectionNeedsAttention: 'La protección necesita atención',
      emailVerified: '✓ Correo', reviewEmail: 'Revisar correo', device: 'dispositivo', devices: 'dispositivos',
      privacyConfigured: '✓ Privacidad', reviewPrivacy: 'Revisar privacidad',
      changePassword: '🔑 Cambiar contraseña', privacySettings: '🔒 Ajustes de privacidad',
      noBlockedUsers: 'No hay usuarios bloqueados.', unblock: 'Desbloquear',
      noMutedUsers: 'No hay usuarios silenciados. Silenciar oculta el contenido de alguien sin que lo sepa y sin bloquearlo.', unmute: 'Quitar silencio',
      noReportsSubmitted: 'No has enviado ningún reporte.',
      logOutAllOtherDevices: 'Cerrar sesión en todos los demás dispositivos',
      unknownDevice: 'Dispositivo desconocido', unknownLocation: 'Ubicación desconocida', signedInPrefix: 'sesión iniciada', revoke: 'Revocar'
    },
    chat: {
      failedLoadConversations: 'Error al cargar las conversaciones',
      unableToLoadMessages: 'No se pudieron cargar los mensajes',
      openingMessages: 'Abriendo tus mensajes privados…',
      eyebrow: 'AMORA PRIVADO', title: 'Mensajes', subtitle: 'Conversaciones privadas, cuidadas con esmero.',
      discoverLink: 'Descubrir', retry: 'Reintentar',
      noConversationsYet: 'Aún no hay conversaciones', startMatchSayHello: 'Haz un match y saluda.', discoverPeople: 'Descubrir personas',
      sentPhotoOrVideo: 'Envió una foto o video', justNow: 'Justo ahora'
    },
    notifications: {
      title: 'Notificaciones', markingEllipsis: 'Marcando…', markAllRead: 'Marcar todo como leído',
      allCaughtUp: 'Estás al día. Nada nuevo por aquí.', dismiss: 'Descartar',
      errorLoad: 'No se pudieron cargar las notificaciones.', someoneFallback: 'Alguien',
      newMatch: '¡Tienes un nuevo match!', superLikedYou: '¡te dio súper like!',
      sentMessage: 'te envió un mensaje:', youReceived: 'Recibiste', giftFallback: 'un regalo',
      levelUpTo: '¡Subiste de nivel! Ahora eres nivel', earnedBadgePrefix: '— obtuviste la insignia', earnedBadgeSuffix: '',
      dailyRewardClaimed: 'Recompensa diaria reclamada:', coinsWord: 'monedas', dayStreak: 'días de racha',
      yourWord: 'Tu', monthlyBonusArrived: 'bono mensual llegó:',
      missionComplete: 'Misión completada:', missionFallback: 'una misión', xpWord: 'XP',
      yourWithdrawalOf: 'Tu retiro de', wasApproved: 'fue aprobado.',
      wasRejected: 'fue rechazado — las monedas fueron reembolsadas.', hasBeenPaid: 'ha sido pagado.',
      notificationFallback: 'Notificación', justNow: 'justo ahora', minAgo: 'm', hAgo: 'h', dAgo: 'd'
    },
    events: {
      ended: 'Finalizado', dayUnit: 'd', hourUnit: 'h', minuteUnit: 'm', left: 'restante',
      errorLoad: 'No se pudo cargar el evento actual.', errorJoinTeam: 'No se pudo unir a este equipo.',
      noLiveEvent: 'No hay eventos en vivo ahora. ¡Vuelve pronto!',
      pickSide: 'Elige un bando para unirte a la batalla:',
      youreOnTeamPrefix: 'Estás en el equipo', youreOnTeamSuffix: '— ¡envía regalos para impulsar la puntuación de tu equipo!',
      topContributors: 'Principales colaboradores', noOneScoredYet: 'Nadie ha puntuado todavía — ¡sé el primero!', ptsSuffix: 'pts'
    },
    settings: {
      errorLoadUser: 'Error al obtener el usuario',
      passwordsDontMatch: 'Las contraseñas no coinciden',
      passwordMinLength: 'La nueva contraseña debe tener al menos 10 caracteres',
      errorChangePassword: 'Error al cambiar la contraseña',
      passwordUpdatedSuccess: 'Contraseña actualizada correctamente. Inicia sesión de nuevo.',
      errorUpdatePrivacy: 'Error al actualizar la privacidad',
      privacyUpdatedSuccess: 'Configuración de privacidad actualizada',
      errorStartCheckout: 'No se pudo iniciar el pago.', checkoutUnavailable: 'El pago no está disponible en este momento.',
      deleteConfirm: '¿Estás seguro? Esta acción es permanente y no se puede deshacer.',
      loadingSettings: 'Cargando configuración...',
      sidebarAccount: 'Cuenta', sidebarPrivacy: 'Privacidad', sidebarMembership: 'Membresía', sidebarSupport: 'Soporte y legal',
      logout: 'Cerrar sesión', deleteAccount: 'Eliminar cuenta', title: 'Configuración',
      accountSettingsTitle: 'Configuración de la cuenta',
      emailLabel: 'Correo electrónico', usernameLabel: 'Nombre de usuario', displayNameLabel: 'Nombre visible',
      changePasswordTitle: 'Cambiar contraseña',
      currentPasswordPlaceholder: 'Contraseña actual', newPasswordPlaceholder: 'Nueva contraseña (mín. 10 caracteres)', confirmPasswordPlaceholder: 'Confirmar nueva contraseña',
      updating: 'Actualizando...', updatePassword: 'Actualizar contraseña',
      privacySettingsTitle: 'Configuración de privacidad',
      showOnlineStatus: 'Mostrar estado en línea', profileVisibleToOthers: 'Perfil visible para otros', showAgeOnProfile: 'Mostrar edad en el perfil', showLocationOnProfile: 'Mostrar ubicación en el perfil',
      manageBlockList: 'Gestionar lista de bloqueados →',
      membershipTitle: 'Membresía',
      premiumName: 'Premium', premiumDesc: 'Sin anuncios, regalos exclusivos, soporte prioritario',
      vipName: 'VIP', vipDesc: 'Todos los beneficios Premium + monedas extra, impulso de perfil',
      svipName: 'SVIP', svipDesc: 'Todos los beneficios VIP + shows privados, regalos ilimitados',
      redirecting: 'Redirigiendo…', upgrade: 'Mejorar',
      currentPlan: 'Plan actual', freeWord: 'Gratis', expires: 'Expira',
      upgradeYourPlan: 'Mejora tu plan',
      supportLegalTitle: 'Soporte y legal',
      termsOfService: 'Términos de servicio', privacyPolicy: 'Política de privacidad', communityGuidelines: 'Normas de la comunidad', cookiePolicy: 'Política de cookies', contactSupport: 'Contactar soporte'
    },
    profile: {
      errorLoad: 'Error al obtener el perfil', fallbackErrorLoad: 'No se pudo cargar el perfil',
      errorUpdate: 'Error al actualizar', errorUpload: 'Error al subir',
      deleteConfirm: '¿Estás seguro? Esta acción es permanente.',
      loadingProfile: 'Cargando tu perfil de Amora…',
      userNotFound: 'Usuario no encontrado', retry: 'Reintentar',
      locationNotSet: 'Ubicación no establecida',
      changePhotoAria: 'Cambiar foto de perfil',
      followers: 'Seguidores', following: 'Siguiendo', xpWord: 'XP', levelWord: 'Nivel',
      editProfile: 'Editar perfil', settings: 'Configuración', security: '🛡️ Seguridad',
      profileStudio: 'ESTUDIO DE PERFIL', editYourProfile: 'Edita tu perfil',
      displayNameLabel: 'Nombre visible', bioLabel: 'Biografía', relationshipIntentLabel: 'Intención de relación', interestsLabel: 'Intereses', languagesLabel: 'Idiomas',
      saveChanges: 'Guardar cambios', cancel: 'Cancelar',
      aboutKicker: 'SOBRE MÍ', personalSpace: 'Espacio personal',
      noBioYet: 'Aún no hay biografía. Añade algo que muestre quién eres.',
      locationDetail: 'Ubicación', intentDetail: 'Intención', notSet: 'No establecido', memberSinceDetail: 'Miembro desde', membershipDetail: 'Membresía',
      amoraStatusKicker: 'ESTADO AMORA', levelProgress: 'Progreso de nivel',
      viewLevelRewards: 'Ver recompensas de nivel →',
      identityKicker: 'IDENTIDAD', interestsAndBadges: 'Intereses e insignias',
      blockListPrefix: '🚫 Lista de bloqueados',
      deleteAccount: 'Eliminar cuenta',
      blockedUsersTitle: 'Usuarios bloqueados', noBlockedUsers: 'No hay usuarios bloqueados.', unknownUserFallback: 'usuario', unblock: 'Desbloquear'
    }
  },

  pt: {
    nav: {
      discover: 'Descobrir', goLive: 'Transmitir', studio: 'Estúdio', match: 'Combinar', events: 'Eventos',
      rewards: 'Recompensas', missions: 'Missões', vip: 'VIP', chat: 'Chat', matches: 'Combinações',
      safety: 'Segurança', profile: 'Perfil', admin: 'Admin', logout: 'Sair', store: 'Loja',
      notifications: 'Notificações', wallet: 'Carteira'
    },
    footer: {
      terms: 'Termos', privacy: 'Privacidade', guidelines: 'Diretrizes', cookies: 'Cookies',
      tagline: 'Feito para conexões verdadeiras.'
    },
    common: {
      language: 'Idioma', save: 'Salvar', cancel: 'Cancelar', loading: 'Carregando…', continue: 'Continuar',
      back: 'Voltar', or: 'OU'
    },
    auth: {
      login: {
        eyebrow: 'BEM-VINDO DE VOLTA', title: 'Bem-vindo de volta ao', titleHighlight: 'Amora.',
        subtitle: 'Entre para ver suas combinações, conversas e momentos ao vivo.',
        footerText: 'Novo no Amora?', footerLabel: 'Crie sua conta', backLink: '← Voltar ao AmoraLive',
        errorGoogle: 'Não foi possível entrar com o Google. Tente novamente.',
        errorApple: 'Não foi possível entrar com a Apple. Tente novamente.',
        errorFacebook: 'Não foi possível entrar com o Facebook. Tente novamente.',
        errorSuspended: 'Esta conta está suspensa no momento.',
        emailLabel: 'E-mail ou usuário', emailPlaceholder: 'voce@exemplo.com ou usuário',
        passwordLabel: 'Senha', passwordPlaceholder: 'Sua senha',
        showPassword: 'Mostrar', hidePassword: 'Ocultar',
        submit: 'Entrar', submitting: 'Entrando…',
        continueApple: 'Continuar com Apple', connectingApple: 'Conectando com Apple…',
        continueFacebook: 'Continuar com Facebook', connectingFacebook: 'Conectando com Facebook…',
        continueGoogle: 'Continuar com Google', connectingGoogle: 'Conectando com Google…',
        byContinuing: 'Ao continuar, você concorda com os', termsLink: 'Termos', andLink: 'e a', privacyLink: 'Política de Privacidade'
      },
      register: {
        eyebrow: 'JUNTE-SE AO AMORA', title: 'Crie sua conta Amora.',
        subtitle: 'Conheça pessoas, crie conexões e compartilhe momentos verdadeiros.',
        footerText: 'Já tem uma conta?', footerLabel: 'Entrar', backLink: '← Voltar ao AmoraLive',
        continueApple: 'Continuar com Apple', connectingApple: 'Conectando com Apple…',
        continueFacebook: 'Continuar com Facebook', connectingFacebook: 'Conectando com Facebook…',
        continueGoogle: 'Continuar com Google', connectingGoogle: 'Conectando com Google…',
        emailLabel: 'Endereço de e-mail', emailPlaceholder: 'voce@exemplo.com',
        usernameLabel: 'Nome de usuário', usernamePlaceholder: 'Escolha um nome de usuário',
        usernameHint: '3–20 caracteres: letras, números, pontos, traços ou sublinhados.',
        passwordLabel: 'Senha', passwordPlaceholder: 'Pelo menos 8 caracteres',
        showPassword: 'Mostrar', hidePassword: 'Ocultar',
        dobLabel: 'Data de nascimento', dobHint: 'AmoraLive é uma comunidade +18.',
        submit: 'Criar conta', submitting: 'Criando conta…',
        successTitle: 'Verifique seu e-mail.',
        successSubtitle: 'Sua conta Amora está pronta. Verifique seu e-mail para continuar.',
        successHeading: 'Cadastro concluído',
        successBody: 'Enviamos um link de verificação para o seu e-mail. Abra-o e depois volte para entrar.',
        goToLogin: 'Ir para Entrar',
        byCreating: 'Ao criar uma conta, você concorda com nossos', termsLink: 'Termos', andLink: 'e', privacyLink: 'Política de Privacidade'
      }
    },
    discover: {
      tabRecommended: 'Recomendado', tabTrending: 'Em alta', tabNew: 'Novo', tabFollowing: 'Seguindo', tabCreators: 'Criadores', tabCategories: 'Categorias',
      typePopular: 'Popular', typeRising: 'Em ascensão', typeNew: 'Novo',
      catChat: 'Chat', catMusic: 'Música', catEntertainment: 'Entretenimento', catGaming: 'Jogos', catLifestyle: 'Estilo de vida', catTravel: 'Viagens', catQA: 'Perguntas', catDating: 'Namoro',
      searchPlaceholder: '🔍 Buscar criadores e transmissões ao vivo…', searching: 'Buscando…',
      creatorsHeader: 'Criadores', liveNowHeader: 'Ao vivo agora', noResultsFor: 'Nenhum resultado para',
      loadingCreators: 'Carregando criadores...', loadingLive: 'Carregando transmissões ao vivo...',
      errorPrefix: 'Erro:', retry: 'Tentar novamente',
      noCreatorsYet: 'Ainda não há criadores para mostrar.', noLiveNow: 'Nenhuma transmissão ao vivo agora', checkBackLater: 'Volte mais tarde ou comece a sua!',
      following: 'Seguindo', follow: 'Seguir', message: 'Mensagem',
      followersSuffix: 'seguidores', thisWeekSuffix: 'esta semana',
      live: 'AO VIVO', unknown: 'Desconhecido', untitled: 'Sem título', general: 'Geral'
    },
    matches: {
      title: '💕 Combinações', preferencesBtn: '⚙️ Preferências', tabDiscover: 'Descobrir', tabMyMatches: 'Minhas combinações',
      matchedWithPrefix: '🎉 Você combinou com', matchedWithSuffix: '! Toque para dispensar.',
      noMoreProfiles: 'Sem mais perfis por enquanto', widenPreferences: 'Volte mais tarde ou amplie suas preferências.',
      matchPercentSuffix: '% de compatibilidade', noMatchesYet: 'Ainda sem combinações — continue descobrindo!', compatiblePercentSuffix: '% compatível',
      unmatchConfirm: 'Desfazer combinação? Isso remove a conexão e não pode ser desfeito.',
      prefsTitle: 'Preferências de namoro', yourGender: 'Seu gênero', preferNotToSay: 'Prefiro não dizer', showMe: 'Mostrar-me',
      ageRangeLabel: 'Faixa etária:', savePreferences: 'Salvar preferências'
    },
    wallet: {
      loadingWallet: 'Carregando carteira...', errorPrefix: 'Erro:', retry: 'Tentar novamente', title: 'Minha carteira', profile: 'Perfil',
      availableCoins: 'Moedas disponíveis', hidePackages: 'Ocultar pacotes', buyCoins: 'Comprar moedas', withdraw: 'Sacar', buy: 'Comprar',
      promotion: '🔥 Promoção', allTransactions: 'Todas as transações', giftHistory: 'Histórico de presentes',
      noTransactionsYet: 'Ainda sem transações', transactionFallback: 'Transação'
    },
    store: {
      kicker: 'AMORA • COFRE DE LUXO', title: 'A Boutique Amora', subtitle: 'Colecione efeitos de perfil luminosos, identidades reais e cosméticos premium.',
      catalogTab: 'Catálogo', myItemsTab: 'Meus itens', equipOutfits: 'Equipar trajes →',
      loadingBoutique: 'Carregando a boutique…', nothingInStore: 'Nada na loja no momento.',
      daysSuffix: 'dias', permanent: 'Permanente', processing: 'Processando…', extend: 'Estender', owned: 'Adquirido', buy: 'Comprar',
      noOwnedItems: 'Você ainda não possui itens. Confira o catálogo!', expiresPrefix: 'Expira', equipped: 'Equipado ✓', equip: 'Equipar',
      errorLoadStore: 'Não foi possível carregar a loja agora.', notEnoughCoins: 'Você não tem moedas suficientes para este item.',
      purchaseFailed: 'Falha na compra.', extendedPrefix: 'Estendido', purchasedPrefix: 'Comprado', updateItemFailed: 'Não foi possível atualizar este item.',
      typeAvatarFrame: 'Molduras de avatar', typeEntranceEffect: 'Efeitos de entrada', typeBadge: 'Emblemas', typeChatBubble: 'Balões de chat', typeProfileCard: 'Cartões de perfil'
    },
    safety: {
      errorLoad: 'Não foi possível carregar a Central de Segurança.',
      revokeOthersConfirm: 'Encerrar sessão em todos os outros dispositivos? Você continuará conectado aqui.',
      signedOutOf: 'Sessão encerrada em', otherDevice: 'outro dispositivo.', otherDevices: 'outros dispositivos.',
      tabBlocked: 'Bloqueados', tabMuted: 'Silenciados', tabMyReports: 'Meus relatórios', tabDevices: 'Dispositivos',
      title: '🛡️ Central de Segurança', securityKicker: 'SEGURANÇA AMORA',
      excellentProtection: 'Proteção excelente', strongProtection: 'Proteção forte', protectionNeedsAttention: 'A proteção precisa de atenção',
      emailVerified: '✓ E-mail', reviewEmail: 'Revisar e-mail', device: 'dispositivo', devices: 'dispositivos',
      privacyConfigured: '✓ Privacidade', reviewPrivacy: 'Revisar privacidade',
      changePassword: '🔑 Alterar senha', privacySettings: '🔒 Configurações de privacidade',
      noBlockedUsers: 'Nenhum usuário bloqueado.', unblock: 'Desbloquear',
      noMutedUsers: 'Nenhum usuário silenciado. Silenciar oculta o conteúdo de alguém sem que ele saiba e sem bloqueá-lo.', unmute: 'Remover silêncio',
      noReportsSubmitted: 'Você não enviou nenhum relatório.',
      logOutAllOtherDevices: 'Encerrar sessão em todos os outros dispositivos',
      unknownDevice: 'Dispositivo desconhecido', unknownLocation: 'Localização desconhecida', signedInPrefix: 'sessão iniciada em', revoke: 'Revogar'
    },
    chat: {
      failedLoadConversations: 'Falha ao carregar as conversas',
      unableToLoadMessages: 'Não foi possível carregar as mensagens',
      openingMessages: 'Abrindo suas mensagens privadas…',
      eyebrow: 'AMORA PRIVADO', title: 'Mensagens', subtitle: 'Conversas privadas, cuidadas com carinho.',
      discoverLink: 'Descobrir', retry: 'Tentar novamente',
      noConversationsYet: 'Ainda sem conversas', startMatchSayHello: 'Combine com alguém e diga olá.', discoverPeople: 'Descobrir pessoas',
      sentPhotoOrVideo: 'Enviou uma foto ou vídeo', justNow: 'Agora mesmo'
    },
    notifications: {
      title: 'Notificações', markingEllipsis: 'Marcando…', markAllRead: 'Marcar tudo como lido',
      allCaughtUp: 'Você está em dia. Nada novo por aqui.', dismiss: 'Dispensar',
      errorLoad: 'Não foi possível carregar as notificações.', someoneFallback: 'Alguém',
      newMatch: 'Você tem uma nova combinação!', superLikedYou: 'te deu super like!',
      sentMessage: 'te enviou uma mensagem:', youReceived: 'Você recebeu', giftFallback: 'um presente',
      levelUpTo: 'Subiu de nível! Agora você é nível', earnedBadgePrefix: '— conquistou o emblema', earnedBadgeSuffix: '',
      dailyRewardClaimed: 'Recompensa diária resgatada:', coinsWord: 'moedas', dayStreak: 'dias seguidos',
      yourWord: 'Seu', monthlyBonusArrived: 'bônus mensal chegou:',
      missionComplete: 'Missão concluída:', missionFallback: 'uma missão', xpWord: 'XP',
      yourWithdrawalOf: 'Seu saque de', wasApproved: 'foi aprovado.',
      wasRejected: 'foi rejeitado — as moedas foram reembolsadas.', hasBeenPaid: 'foi pago.',
      notificationFallback: 'Notificação', justNow: 'agora mesmo', minAgo: 'm atrás', hAgo: 'h atrás', dAgo: 'd atrás'
    },
    events: {
      ended: 'Encerrado', dayUnit: 'd', hourUnit: 'h', minuteUnit: 'm', left: 'restante',
      errorLoad: 'Não foi possível carregar o evento atual.', errorJoinTeam: 'Não foi possível entrar nesta equipe.',
      noLiveEvent: 'Nenhum evento ao vivo agora. Volte em breve!',
      pickSide: 'Escolha um lado para entrar na batalha:',
      youreOnTeamPrefix: 'Você está na equipe', youreOnTeamSuffix: '— envie presentes para aumentar a pontuação da sua equipe!',
      topContributors: 'Principais colaboradores', noOneScoredYet: 'Ninguém pontuou ainda — seja o primeiro!', ptsSuffix: 'pts'
    },
    settings: {
      errorLoadUser: 'Falha ao buscar usuário',
      passwordsDontMatch: 'As senhas não coincidem',
      passwordMinLength: 'A nova senha deve ter pelo menos 10 caracteres',
      errorChangePassword: 'Falha ao alterar a senha',
      passwordUpdatedSuccess: 'Senha atualizada com sucesso. Faça login novamente.',
      errorUpdatePrivacy: 'Falha ao atualizar a privacidade',
      privacyUpdatedSuccess: 'Configurações de privacidade atualizadas',
      errorStartCheckout: 'Não foi possível iniciar o checkout.', checkoutUnavailable: 'O checkout não está disponível no momento.',
      deleteConfirm: 'Tem certeza? Esta ação é permanente e não pode ser desfeita.',
      loadingSettings: 'Carregando configurações...',
      sidebarAccount: 'Conta', sidebarPrivacy: 'Privacidade', sidebarMembership: 'Assinatura', sidebarSupport: 'Suporte e legal',
      logout: 'Sair', deleteAccount: 'Excluir conta', title: 'Configurações',
      accountSettingsTitle: 'Configurações da conta',
      emailLabel: 'E-mail', usernameLabel: 'Nome de usuário', displayNameLabel: 'Nome de exibição',
      changePasswordTitle: 'Alterar senha',
      currentPasswordPlaceholder: 'Senha atual', newPasswordPlaceholder: 'Nova senha (mín. 10 caracteres)', confirmPasswordPlaceholder: 'Confirmar nova senha',
      updating: 'Atualizando...', updatePassword: 'Atualizar senha',
      privacySettingsTitle: 'Configurações de privacidade',
      showOnlineStatus: 'Mostrar status online', profileVisibleToOthers: 'Perfil visível para outros', showAgeOnProfile: 'Mostrar idade no perfil', showLocationOnProfile: 'Mostrar localização no perfil',
      manageBlockList: 'Gerenciar lista de bloqueados →',
      membershipTitle: 'Assinatura',
      premiumName: 'Premium', premiumDesc: 'Sem anúncios, presentes exclusivos, suporte prioritário',
      vipName: 'VIP', vipDesc: 'Todos os benefícios Premium + moedas extras, impulso de perfil',
      svipName: 'SVIP', svipDesc: 'Todos os benefícios VIP + shows privados, presentes ilimitados',
      redirecting: 'Redirecionando…', upgrade: 'Assinar',
      currentPlan: 'Plano atual', freeWord: 'Gratuito', expires: 'Expira',
      upgradeYourPlan: 'Melhore seu plano',
      supportLegalTitle: 'Suporte e legal',
      termsOfService: 'Termos de Serviço', privacyPolicy: 'Política de Privacidade', communityGuidelines: 'Diretrizes da Comunidade', cookiePolicy: 'Política de Cookies', contactSupport: 'Contatar suporte'
    },
    profile: {
      errorLoad: 'Falha ao buscar perfil', fallbackErrorLoad: 'Não foi possível carregar o perfil',
      errorUpdate: 'Falha na atualização', errorUpload: 'Falha no upload',
      deleteConfirm: 'Tem certeza? Esta ação é permanente.',
      loadingProfile: 'Carregando seu perfil Amora…',
      userNotFound: 'Usuário não encontrado', retry: 'Tentar novamente',
      locationNotSet: 'Localização não definida',
      changePhotoAria: 'Alterar foto de perfil',
      followers: 'Seguidores', following: 'Seguindo', xpWord: 'XP', levelWord: 'Nível',
      editProfile: 'Editar perfil', settings: 'Configurações', security: '🛡️ Segurança',
      profileStudio: 'ESTÚDIO DE PERFIL', editYourProfile: 'Edite seu perfil',
      displayNameLabel: 'Nome de exibição', bioLabel: 'Biografia', relationshipIntentLabel: 'Intenção de relacionamento', interestsLabel: 'Interesses', languagesLabel: 'Idiomas',
      saveChanges: 'Salvar alterações', cancel: 'Cancelar',
      aboutKicker: 'SOBRE', personalSpace: 'Espaço pessoal',
      noBioYet: 'Ainda sem biografia. Adicione algo que mostre quem você é.',
      locationDetail: 'Localização', intentDetail: 'Intenção', notSet: 'Não definido', memberSinceDetail: 'Membro desde', membershipDetail: 'Assinatura',
      amoraStatusKicker: 'STATUS AMORA', levelProgress: 'Progresso de nível',
      viewLevelRewards: 'Ver recompensas de nível →',
      identityKicker: 'IDENTIDADE', interestsAndBadges: 'Interesses e emblemas',
      blockListPrefix: '🚫 Lista de bloqueados',
      deleteAccount: 'Excluir conta',
      blockedUsersTitle: 'Usuários bloqueados', noBlockedUsers: 'Nenhum usuário bloqueado.', unknownUserFallback: 'usuário', unblock: 'Desbloquear'
    }
  },

  fr: {
    nav: {
      discover: 'Découvrir', goLive: 'Passer en direct', studio: 'Studio', match: 'Rencontre', events: 'Événements',
      rewards: 'Récompenses', missions: 'Missions', vip: 'VIP', chat: 'Chat', matches: 'Correspondances',
      safety: 'Sécurité', profile: 'Profil', admin: 'Admin', logout: 'Déconnexion', store: 'Boutique',
      notifications: 'Notifications', wallet: 'Portefeuille'
    },
    footer: {
      terms: 'Conditions', privacy: 'Confidentialité', guidelines: 'Règles', cookies: 'Cookies',
      tagline: 'Conçu pour des connexions sincères.'
    },
    common: {
      language: 'Langue', save: 'Enregistrer', cancel: 'Annuler', loading: 'Chargement…', continue: 'Continuer',
      back: 'Retour', or: 'OU'
    },
    auth: {
      login: {
        eyebrow: 'CONTENT DE VOUS REVOIR', title: 'Content de vous revoir sur', titleHighlight: 'Amora.',
        subtitle: 'Connectez-vous pour voir vos correspondances, conversations et moments en direct.',
        footerText: 'Nouveau sur Amora ?', footerLabel: 'Créer un compte', backLink: '← Retour à AmoraLive',
        errorGoogle: "La connexion avec Google a échoué. Réessayez.",
        errorApple: "La connexion avec Apple a échoué. Réessayez.",
        errorFacebook: "La connexion avec Facebook a échoué. Réessayez.",
        errorSuspended: 'Ce compte est actuellement suspendu.',
        emailLabel: "E-mail ou nom d'utilisateur", emailPlaceholder: 'vous@exemple.com ou nom d\'utilisateur',
        passwordLabel: 'Mot de passe', passwordPlaceholder: 'Votre mot de passe',
        showPassword: 'Afficher', hidePassword: 'Masquer',
        submit: 'Se connecter', submitting: 'Connexion en cours…',
        continueApple: 'Continuer avec Apple', connectingApple: 'Connexion à Apple…',
        continueFacebook: 'Continuer avec Facebook', connectingFacebook: 'Connexion à Facebook…',
        continueGoogle: 'Continuer avec Google', connectingGoogle: 'Connexion à Google…',
        byContinuing: "En continuant, vous acceptez les", termsLink: 'Conditions', andLink: 'et la', privacyLink: 'Politique de confidentialité'
      },
      register: {
        eyebrow: 'REJOIGNEZ AMORA', title: 'Créez votre compte Amora.',
        subtitle: 'Rencontrez des gens, créez des liens et partagez des moments sincères.',
        footerText: 'Déjà un compte ?', footerLabel: 'Se connecter', backLink: '← Retour à AmoraLive',
        continueApple: 'Continuer avec Apple', connectingApple: 'Connexion à Apple…',
        continueFacebook: 'Continuer avec Facebook', connectingFacebook: 'Connexion à Facebook…',
        continueGoogle: 'Continuer avec Google', connectingGoogle: 'Connexion à Google…',
        emailLabel: 'Adresse e-mail', emailPlaceholder: 'vous@exemple.com',
        usernameLabel: "Nom d'utilisateur", usernamePlaceholder: "Choisissez un nom d'utilisateur",
        usernameHint: '3 à 20 caractères : lettres, chiffres, points, tirets ou underscores.',
        passwordLabel: 'Mot de passe', passwordPlaceholder: 'Au moins 8 caractères',
        showPassword: 'Afficher', hidePassword: 'Masquer',
        dobLabel: 'Date de naissance', dobHint: 'AmoraLive est une communauté 18+.',
        submit: 'Créer un compte', submitting: 'Création du compte…',
        successTitle: 'Consultez votre boîte mail.',
        successSubtitle: 'Votre compte Amora est prêt. Vérifiez votre e-mail pour continuer.',
        successHeading: 'Inscription réussie',
        successBody: 'Nous avons envoyé un lien de vérification à votre e-mail. Ouvrez-le, puis revenez vous connecter.',
        goToLogin: 'Aller à la connexion',
        byCreating: 'En créant un compte, vous acceptez nos', termsLink: 'Conditions', andLink: 'et notre', privacyLink: 'Politique de confidentialité'
      }
    },
    discover: {
      tabRecommended: 'Recommandé', tabTrending: 'Tendances', tabNew: 'Nouveau', tabFollowing: 'Abonnements', tabCreators: 'Créateurs', tabCategories: 'Catégories',
      typePopular: 'Populaire', typeRising: 'En hausse', typeNew: 'Nouveau',
      catChat: 'Chat', catMusic: 'Musique', catEntertainment: 'Divertissement', catGaming: 'Jeux', catLifestyle: 'Style de vie', catTravel: 'Voyage', catQA: 'Q&R', catDating: 'Rencontres',
      searchPlaceholder: '🔍 Rechercher des créateurs et des lives…', searching: 'Recherche…',
      creatorsHeader: 'Créateurs', liveNowHeader: 'En direct', noResultsFor: 'Aucun résultat pour',
      loadingCreators: 'Chargement des créateurs...', loadingLive: 'Chargement des lives...',
      errorPrefix: 'Erreur :', retry: 'Réessayer',
      noCreatorsYet: 'Aucun créateur à afficher pour le moment.', noLiveNow: 'Aucun live en ce moment', checkBackLater: 'Revenez plus tard ou lancez le vôtre !',
      following: 'Abonné', follow: 'Suivre', message: 'Message',
      followersSuffix: 'abonnés', thisWeekSuffix: 'cette semaine',
      live: 'EN DIRECT', unknown: 'Inconnu', untitled: 'Sans titre', general: 'Général'
    },
    matches: {
      title: '💕 Matchs', preferencesBtn: '⚙️ Préférences', tabDiscover: 'Découvrir', tabMyMatches: 'Mes matchs',
      matchedWithPrefix: "🎉 C'est un match avec", matchedWithSuffix: ' ! Touchez pour fermer.',
      noMoreProfiles: 'Plus de profils pour le moment', widenPreferences: 'Revenez plus tard ou élargissez vos préférences.',
      matchPercentSuffix: '% de compatibilité', noMatchesYet: 'Pas encore de matchs — continuez à explorer !', compatiblePercentSuffix: '% compatible',
      unmatchConfirm: 'Annuler le match ? Cela supprime la connexion et ne peut pas être annulé.',
      prefsTitle: 'Préférences de rencontre', yourGender: 'Votre genre', preferNotToSay: 'Préfère ne pas dire', showMe: 'Me montrer',
      ageRangeLabel: "Tranche d'âge :", savePreferences: 'Enregistrer les préférences'
    },
    wallet: {
      loadingWallet: 'Chargement du portefeuille...', errorPrefix: 'Erreur :', retry: 'Réessayer', title: 'Mon portefeuille', profile: 'Profil',
      availableCoins: 'Pièces disponibles', hidePackages: 'Masquer les offres', buyCoins: 'Acheter des pièces', withdraw: 'Retirer', buy: 'Acheter',
      promotion: '🔥 Promotion', allTransactions: 'Toutes les transactions', giftHistory: 'Historique des cadeaux',
      noTransactionsYet: 'Aucune transaction pour le moment', transactionFallback: 'Transaction'
    },
    store: {
      kicker: 'AMORA • COFFRE DE LUXE', title: 'La Boutique Amora', subtitle: 'Collectionnez des effets de profil lumineux, des identités royales et des cosmétiques premium.',
      catalogTab: 'Catalogue', myItemsTab: 'Mes articles', equipOutfits: 'Équiper des tenues →',
      loadingBoutique: 'Chargement de la boutique…', nothingInStore: 'Rien dans la boutique pour le moment.',
      daysSuffix: 'jours', permanent: 'Permanent', processing: 'Traitement…', extend: 'Prolonger', owned: 'Possédé', buy: 'Acheter',
      noOwnedItems: 'Vous ne possédez encore aucun article. Consultez le catalogue !', expiresPrefix: 'Expire', equipped: 'Équipé ✓', equip: 'Équiper',
      errorLoadStore: 'Impossible de charger la boutique pour le moment.', notEnoughCoins: "Vous n'avez pas assez de pièces pour cet article.",
      purchaseFailed: "L'achat a échoué.", extendedPrefix: 'Prolongé', purchasedPrefix: 'Acheté', updateItemFailed: 'Impossible de mettre à jour cet article.',
      typeAvatarFrame: "Cadres d'avatar", typeEntranceEffect: "Effets d'entrée", typeBadge: 'Badges', typeChatBubble: 'Bulles de chat', typeProfileCard: 'Cartes de profil'
    },
    safety: {
      errorLoad: 'Impossible de charger le Centre de sécurité.',
      revokeOthersConfirm: 'Déconnecter tous les autres appareils ? Vous resterez connecté ici.',
      signedOutOf: 'Déconnecté de', otherDevice: 'autre appareil.', otherDevices: 'autres appareils.',
      tabBlocked: 'Bloqués', tabMuted: 'Masqués', tabMyReports: 'Mes signalements', tabDevices: 'Appareils',
      title: '🛡️ Centre de sécurité', securityKicker: 'SÉCURITÉ AMORA',
      excellentProtection: 'Protection excellente', strongProtection: 'Protection solide', protectionNeedsAttention: 'La protection nécessite votre attention',
      emailVerified: '✓ E-mail', reviewEmail: "Vérifier l'e-mail", device: 'appareil', devices: 'appareils',
      privacyConfigured: '✓ Confidentialité', reviewPrivacy: 'Vérifier la confidentialité',
      changePassword: '🔑 Changer le mot de passe', privacySettings: '🔒 Paramètres de confidentialité',
      noBlockedUsers: 'Aucun utilisateur bloqué.', unblock: 'Débloquer',
      noMutedUsers: "Aucun utilisateur masqué. Masquer cache le contenu de quelqu'un sans qu'il le sache, et sans le bloquer.", unmute: 'Réactiver',
      noReportsSubmitted: "Vous n'avez soumis aucun signalement.",
      logOutAllOtherDevices: 'Déconnecter tous les autres appareils',
      unknownDevice: 'Appareil inconnu', unknownLocation: 'Lieu inconnu', signedInPrefix: 'connecté le', revoke: 'Révoquer'
    },
    chat: {
      failedLoadConversations: 'Échec du chargement des conversations',
      unableToLoadMessages: 'Impossible de charger les messages',
      openingMessages: 'Ouverture de vos messages privés…',
      eyebrow: 'AMORA PRIVÉ', title: 'Messages', subtitle: 'Des conversations privées, joliment tenues.',
      discoverLink: 'Découvrir', retry: 'Réessayer',
      noConversationsYet: 'Aucune conversation pour le moment', startMatchSayHello: 'Faites un match et dites bonjour.', discoverPeople: 'Découvrir des personnes',
      sentPhotoOrVideo: 'A envoyé une photo ou une vidéo', justNow: "À l'instant"
    },
    notifications: {
      title: 'Notifications', markingEllipsis: 'Marquage…', markAllRead: 'Tout marquer comme lu',
      allCaughtUp: 'Vous êtes à jour. Rien de nouveau ici.', dismiss: 'Ignorer',
      errorLoad: 'Impossible de charger les notifications.', someoneFallback: "Quelqu'un",
      newMatch: 'Vous avez un nouveau match !', superLikedYou: 'vous a super liké !',
      sentMessage: 'vous a envoyé un message :', youReceived: 'Vous avez reçu', giftFallback: 'un cadeau',
      levelUpTo: 'Niveau supérieur ! Vous êtes maintenant niveau', earnedBadgePrefix: '— a obtenu le badge', earnedBadgeSuffix: '',
      dailyRewardClaimed: 'Récompense quotidienne récupérée :', coinsWord: 'pièces', dayStreak: 'jours de suite',
      yourWord: 'Votre', monthlyBonusArrived: 'bonus mensuel est arrivé :',
      missionComplete: 'Mission accomplie :', missionFallback: 'une mission', xpWord: 'XP',
      yourWithdrawalOf: 'Votre retrait de', wasApproved: 'a été approuvé.',
      wasRejected: 'a été rejeté — les pièces ont été remboursées.', hasBeenPaid: 'a été payé.',
      notificationFallback: 'Notification', justNow: "à l'instant", minAgo: 'min', hAgo: 'h', dAgo: 'j'
    },
    events: {
      ended: 'Terminé', dayUnit: 'j', hourUnit: 'h', minuteUnit: 'min', left: 'restant',
      errorLoad: "Impossible de charger l'événement actuel.", errorJoinTeam: 'Impossible de rejoindre cette équipe.',
      noLiveEvent: 'Aucun événement en direct pour le moment. Revenez bientôt !',
      pickSide: 'Choisissez un camp pour rejoindre la bataille :',
      youreOnTeamPrefix: "Vous êtes dans l'équipe", youreOnTeamSuffix: '— envoyez des cadeaux pour booster le score de votre équipe !',
      topContributors: 'Meilleurs contributeurs', noOneScoredYet: "Personne n'a encore marqué de points — soyez le premier !", ptsSuffix: 'pts'
    },
    settings: {
      errorLoadUser: "Échec de la récupération de l'utilisateur",
      passwordsDontMatch: 'Les mots de passe ne correspondent pas',
      passwordMinLength: 'Le nouveau mot de passe doit comporter au moins 10 caractères',
      errorChangePassword: 'Échec du changement de mot de passe',
      passwordUpdatedSuccess: 'Mot de passe mis à jour avec succès. Veuillez vous reconnecter.',
      errorUpdatePrivacy: 'Échec de la mise à jour de la confidentialité',
      privacyUpdatedSuccess: 'Paramètres de confidentialité mis à jour',
      errorStartCheckout: 'Impossible de démarrer le paiement.', checkoutUnavailable: "Le paiement n'est pas disponible pour le moment.",
      deleteConfirm: 'Êtes-vous sûr ? Cette action est définitive et irréversible.',
      loadingSettings: 'Chargement des paramètres...',
      sidebarAccount: 'Compte', sidebarPrivacy: 'Confidentialité', sidebarMembership: 'Abonnement', sidebarSupport: 'Assistance et mentions légales',
      logout: 'Déconnexion', deleteAccount: 'Supprimer le compte', title: 'Paramètres',
      accountSettingsTitle: 'Paramètres du compte',
      emailLabel: 'E-mail', usernameLabel: "Nom d'utilisateur", displayNameLabel: "Nom d'affichage",
      changePasswordTitle: 'Changer le mot de passe',
      currentPasswordPlaceholder: 'Mot de passe actuel', newPasswordPlaceholder: 'Nouveau mot de passe (min. 10 caractères)', confirmPasswordPlaceholder: 'Confirmer le nouveau mot de passe',
      updating: 'Mise à jour...', updatePassword: 'Mettre à jour le mot de passe',
      privacySettingsTitle: 'Paramètres de confidentialité',
      showOnlineStatus: 'Afficher le statut en ligne', profileVisibleToOthers: 'Profil visible par les autres', showAgeOnProfile: "Afficher l'âge sur le profil", showLocationOnProfile: 'Afficher la localisation sur le profil',
      manageBlockList: 'Gérer la liste de blocage →',
      membershipTitle: 'Abonnement',
      premiumName: 'Premium', premiumDesc: 'Sans publicité, cadeaux exclusifs, support prioritaire',
      vipName: 'VIP', vipDesc: 'Tous les avantages Premium + pièces supplémentaires, boost de profil',
      svipName: 'SVIP', svipDesc: 'Tous les avantages VIP + shows privés, cadeaux illimités',
      redirecting: 'Redirection…', upgrade: 'Passer au niveau supérieur',
      currentPlan: 'Forfait actuel', freeWord: 'Gratuit', expires: 'Expire',
      upgradeYourPlan: 'Améliorez votre forfait',
      supportLegalTitle: 'Assistance et mentions légales',
      termsOfService: "Conditions d'utilisation", privacyPolicy: 'Politique de confidentialité', communityGuidelines: 'Règles de la communauté', cookiePolicy: 'Politique de cookies', contactSupport: "Contacter l'assistance"
    },
    profile: {
      errorLoad: 'Échec de la récupération du profil', fallbackErrorLoad: 'Impossible de charger le profil',
      errorUpdate: 'Échec de la mise à jour', errorUpload: 'Échec du téléchargement',
      deleteConfirm: 'Êtes-vous sûr ? Cette action est définitive.',
      loadingProfile: 'Chargement de votre profil Amora…',
      userNotFound: 'Utilisateur introuvable', retry: 'Réessayer',
      locationNotSet: 'Localisation non définie',
      changePhotoAria: 'Changer la photo de profil',
      followers: 'Abonnés', following: 'Abonnements', xpWord: 'XP', levelWord: 'Niveau',
      editProfile: 'Modifier le profil', settings: 'Paramètres', security: '🛡️ Sécurité',
      profileStudio: 'STUDIO DE PROFIL', editYourProfile: 'Modifiez votre profil',
      displayNameLabel: "Nom d'affichage", bioLabel: 'Bio', relationshipIntentLabel: 'Intention relationnelle', interestsLabel: "Centres d'intérêt", languagesLabel: 'Langues',
      saveChanges: 'Enregistrer les modifications', cancel: 'Annuler',
      aboutKicker: 'À PROPOS', personalSpace: 'Espace personnel',
      noBioYet: 'Pas encore de bio. Ajoutez quelque chose qui montre qui vous êtes.',
      locationDetail: 'Localisation', intentDetail: 'Intention', notSet: 'Non défini', memberSinceDetail: 'Membre depuis', membershipDetail: 'Abonnement',
      amoraStatusKicker: 'STATUT AMORA', levelProgress: 'Progression du niveau',
      viewLevelRewards: 'Voir les récompenses de niveau →',
      identityKicker: 'IDENTITÉ', interestsAndBadges: "Centres d'intérêt et badges",
      blockListPrefix: '🚫 Liste de blocage',
      deleteAccount: 'Supprimer le compte',
      blockedUsersTitle: 'Utilisateurs bloqués', noBlockedUsers: 'Aucun utilisateur bloqué.', unknownUserFallback: 'utilisateur', unblock: 'Débloquer'
    }
  },

  de: {
    nav: {
      discover: 'Entdecken', goLive: 'Live gehen', studio: 'Studio', match: 'Match', events: 'Events',
      rewards: 'Belohnungen', missions: 'Missionen', vip: 'VIP', chat: 'Chat', matches: 'Matches',
      safety: 'Sicherheit', profile: 'Profil', admin: 'Admin', logout: 'Abmelden', store: 'Shop',
      notifications: 'Benachrichtigungen', wallet: 'Wallet'
    },
    footer: {
      terms: 'AGB', privacy: 'Datenschutz', guidelines: 'Richtlinien', cookies: 'Cookies',
      tagline: 'Für echte Verbindungen gemacht.'
    },
    common: {
      language: 'Sprache', save: 'Speichern', cancel: 'Abbrechen', loading: 'Wird geladen…', continue: 'Weiter',
      back: 'Zurück', or: 'ODER'
    },
    auth: {
      login: {
        eyebrow: 'WILLKOMMEN ZURÜCK', title: 'Willkommen zurück bei', titleHighlight: 'Amora.',
        subtitle: 'Melde dich an, um deine Matches, Chats und Live-Momente zu sehen.',
        footerText: 'Neu bei Amora?', footerLabel: 'Konto erstellen', backLink: '← Zurück zu AmoraLive',
        errorGoogle: 'Die Anmeldung mit Google ist fehlgeschlagen. Bitte versuche es erneut.',
        errorApple: 'Die Anmeldung mit Apple ist fehlgeschlagen. Bitte versuche es erneut.',
        errorFacebook: 'Die Anmeldung mit Facebook ist fehlgeschlagen. Bitte versuche es erneut.',
        errorSuspended: 'Dieses Konto ist derzeit gesperrt.',
        emailLabel: 'E-Mail oder Benutzername', emailPlaceholder: 'du@beispiel.com oder Benutzername',
        passwordLabel: 'Passwort', passwordPlaceholder: 'Dein Passwort',
        showPassword: 'Anzeigen', hidePassword: 'Verbergen',
        submit: 'Anmelden', submitting: 'Anmeldung läuft…',
        continueApple: 'Weiter mit Apple', connectingApple: 'Verbindung zu Apple…',
        continueFacebook: 'Weiter mit Facebook', connectingFacebook: 'Verbindung zu Facebook…',
        continueGoogle: 'Weiter mit Google', connectingGoogle: 'Verbindung zu Google…',
        byContinuing: 'Mit der Fortsetzung akzeptierst du die', termsLink: 'AGB', andLink: 'und die', privacyLink: 'Datenschutzerklärung'
      },
      register: {
        eyebrow: 'AMORA BEITRETEN', title: 'Erstelle dein Amora-Konto.',
        subtitle: 'Lerne Menschen kennen, knüpfe Verbindungen und teile echte Momente.',
        footerText: 'Schon ein Konto?', footerLabel: 'Anmelden', backLink: '← Zurück zu AmoraLive',
        continueApple: 'Weiter mit Apple', connectingApple: 'Verbindung zu Apple…',
        continueFacebook: 'Weiter mit Facebook', connectingFacebook: 'Verbindung zu Facebook…',
        continueGoogle: 'Weiter mit Google', connectingGoogle: 'Verbindung zu Google…',
        emailLabel: 'E-Mail-Adresse', emailPlaceholder: 'du@beispiel.com',
        usernameLabel: 'Benutzername', usernamePlaceholder: 'Wähle einen Benutzernamen',
        usernameHint: '3–20 Zeichen: Buchstaben, Zahlen, Punkte, Bindestriche oder Unterstriche.',
        passwordLabel: 'Passwort', passwordPlaceholder: 'Mindestens 8 Zeichen',
        showPassword: 'Anzeigen', hidePassword: 'Verbergen',
        dobLabel: 'Geburtsdatum', dobHint: 'AmoraLive ist eine 18+ Community.',
        submit: 'Konto erstellen', submitting: 'Konto wird erstellt…',
        successTitle: 'Schau in dein Postfach.',
        successSubtitle: 'Dein Amora-Konto ist bereit. Bestätige deine E-Mail, um fortzufahren.',
        successHeading: 'Registrierung erfolgreich',
        successBody: 'Wir haben dir einen Bestätigungslink geschickt. Öffne ihn und melde dich dann an.',
        goToLogin: 'Zur Anmeldung',
        byCreating: 'Mit der Kontoerstellung akzeptierst du unsere', termsLink: 'AGB', andLink: 'und unsere', privacyLink: 'Datenschutzerklärung'
      }
    },
    discover: {
      tabRecommended: 'Empfohlen', tabTrending: 'Beliebt', tabNew: 'Neu', tabFollowing: 'Folge ich', tabCreators: 'Creator', tabCategories: 'Kategorien',
      typePopular: 'Beliebt', typeRising: 'Aufsteigend', typeNew: 'Neu',
      catChat: 'Chat', catMusic: 'Musik', catEntertainment: 'Unterhaltung', catGaming: 'Gaming', catLifestyle: 'Lifestyle', catTravel: 'Reisen', catQA: 'Fragen', catDating: 'Dating',
      searchPlaceholder: '🔍 Creator und Livestreams suchen…', searching: 'Suche läuft…',
      creatorsHeader: 'Creator', liveNowHeader: 'Jetzt live', noResultsFor: 'Keine Ergebnisse für',
      loadingCreators: 'Creator werden geladen...', loadingLive: 'Livestreams werden geladen...',
      errorPrefix: 'Fehler:', retry: 'Erneut versuchen',
      noCreatorsYet: 'Noch keine Creator zum Anzeigen.', noLiveNow: 'Gerade kein Livestream', checkBackLater: 'Schau später noch mal vorbei oder starte deinen eigenen!',
      following: 'Gefolgt', follow: 'Folgen', message: 'Nachricht',
      followersSuffix: 'Follower', thisWeekSuffix: 'diese Woche',
      live: 'LIVE', unknown: 'Unbekannt', untitled: 'Ohne Titel', general: 'Allgemein'
    },
    matches: {
      title: '💕 Matches', preferencesBtn: '⚙️ Einstellungen', tabDiscover: 'Entdecken', tabMyMatches: 'Meine Matches',
      matchedWithPrefix: '🎉 Es ist ein Match mit', matchedWithSuffix: '! Zum Schließen tippen.',
      noMoreProfiles: 'Gerade keine weiteren Profile', widenPreferences: 'Schau später vorbei oder erweitere deine Einstellungen.',
      matchPercentSuffix: '% Übereinstimmung', noMatchesYet: 'Noch keine Matches — entdecke weiter!', compatiblePercentSuffix: '% kompatibel',
      unmatchConfirm: 'Match aufheben? Dies entfernt die Verbindung und kann nicht rückgängig gemacht werden.',
      prefsTitle: 'Dating-Einstellungen', yourGender: 'Dein Geschlecht', preferNotToSay: 'Keine Angabe', showMe: 'Zeig mir',
      ageRangeLabel: 'Altersspanne:', savePreferences: 'Einstellungen speichern'
    },
    wallet: {
      loadingWallet: 'Wallet wird geladen...', errorPrefix: 'Fehler:', retry: 'Erneut versuchen', title: 'Meine Wallet', profile: 'Profil',
      availableCoins: 'Verfügbare Coins', hidePackages: 'Pakete ausblenden', buyCoins: 'Coins kaufen', withdraw: 'Auszahlen', buy: 'Kaufen',
      promotion: '🔥 Aktion', allTransactions: 'Alle Transaktionen', giftHistory: 'Geschenkverlauf',
      noTransactionsYet: 'Noch keine Transaktionen', transactionFallback: 'Transaktion'
    },
    store: {
      kicker: 'AMORA • LUXUS-TRESOR', title: 'Die Amora Boutique', subtitle: 'Sammle leuchtende Profileffekte, königliche Identitäten und Premium-Kosmetik.',
      catalogTab: 'Katalog', myItemsTab: 'Meine Artikel', equipOutfits: 'Outfits ausrüsten →',
      loadingBoutique: 'Boutique wird geladen…', nothingInStore: 'Gerade nichts im Shop.',
      daysSuffix: 'Tage', permanent: 'Dauerhaft', processing: 'Wird verarbeitet…', extend: 'Verlängern', owned: 'Besitzt', buy: 'Kaufen',
      noOwnedItems: 'Du besitzt noch keine Artikel. Schau im Katalog vorbei!', expiresPrefix: 'Läuft ab', equipped: 'Ausgerüstet ✓', equip: 'Ausrüsten',
      errorLoadStore: 'Der Shop kann gerade nicht geladen werden.', notEnoughCoins: 'Du hast nicht genug Coins für diesen Artikel.',
      purchaseFailed: 'Kauf fehlgeschlagen.', extendedPrefix: 'Verlängert', purchasedPrefix: 'Gekauft', updateItemFailed: 'Dieser Artikel konnte nicht aktualisiert werden.',
      typeAvatarFrame: 'Avatar-Rahmen', typeEntranceEffect: 'Eintrittseffekte', typeBadge: 'Abzeichen', typeChatBubble: 'Chat-Sprechblasen', typeProfileCard: 'Profilkarten'
    },
    safety: {
      errorLoad: 'Sicherheitscenter konnte nicht geladen werden.',
      revokeOthersConfirm: 'Auf allen anderen Geräten abmelden? Hier bleibst du angemeldet.',
      signedOutOf: 'Abgemeldet von', otherDevice: 'anderem Gerät.', otherDevices: 'anderen Geräten.',
      tabBlocked: 'Blockiert', tabMuted: 'Stummgeschaltet', tabMyReports: 'Meine Meldungen', tabDevices: 'Geräte',
      title: '🛡️ Sicherheitscenter', securityKicker: 'AMORA SICHERHEIT',
      excellentProtection: 'Ausgezeichneter Schutz', strongProtection: 'Starker Schutz', protectionNeedsAttention: 'Schutz benötigt Aufmerksamkeit',
      emailVerified: '✓ E-Mail', reviewEmail: 'E-Mail überprüfen', device: 'Gerät', devices: 'Geräte',
      privacyConfigured: '✓ Datenschutz', reviewPrivacy: 'Datenschutz überprüfen',
      changePassword: '🔑 Passwort ändern', privacySettings: '🔒 Datenschutzeinstellungen',
      noBlockedUsers: 'Keine blockierten Nutzer.', unblock: 'Blockierung aufheben',
      noMutedUsers: 'Keine stummgeschalteten Nutzer. Stummschalten verbirgt die Inhalte einer Person vor dir, ohne sie zu blockieren und ohne dass sie es merkt.', unmute: 'Stummschaltung aufheben',
      noReportsSubmitted: 'Du hast noch keine Meldungen eingereicht.',
      logOutAllOtherDevices: 'Auf allen anderen Geräten abmelden',
      unknownDevice: 'Unbekanntes Gerät', unknownLocation: 'Unbekannter Standort', signedInPrefix: 'angemeldet am', revoke: 'Widerrufen'
    },
    chat: {
      failedLoadConversations: 'Unterhaltungen konnten nicht geladen werden',
      unableToLoadMessages: 'Nachrichten konnten nicht geladen werden',
      openingMessages: 'Deine privaten Nachrichten werden geöffnet…',
      eyebrow: 'AMORA PRIVAT', title: 'Nachrichten', subtitle: 'Private Unterhaltungen, liebevoll aufbewahrt.',
      discoverLink: 'Entdecken', retry: 'Erneut versuchen',
      noConversationsYet: 'Noch keine Unterhaltungen', startMatchSayHello: 'Finde ein Match und sag Hallo.', discoverPeople: 'Personen entdecken',
      sentPhotoOrVideo: 'Hat ein Foto oder Video gesendet', justNow: 'Gerade eben'
    },
    notifications: {
      title: 'Benachrichtigungen', markingEllipsis: 'Wird markiert…', markAllRead: 'Alle als gelesen markieren',
      allCaughtUp: 'Du bist auf dem neuesten Stand. Nichts Neues hier.', dismiss: 'Verwerfen',
      errorLoad: 'Benachrichtigungen konnten nicht geladen werden.', someoneFallback: 'Jemand',
      newMatch: 'Du hast ein neues Match!', superLikedYou: 'hat dir ein Super-Like gegeben!',
      sentMessage: 'hat dir eine Nachricht geschickt:', youReceived: 'Du hast erhalten', giftFallback: 'ein Geschenk',
      levelUpTo: 'Level aufgestiegen! Du bist jetzt Level', earnedBadgePrefix: '— hat das Abzeichen', earnedBadgeSuffix: 'verdient',
      dailyRewardClaimed: 'Tägliche Belohnung abgeholt:', coinsWord: 'Coins', dayStreak: 'Tage in Folge',
      yourWord: 'Dein', monthlyBonusArrived: 'monatlicher Bonus ist angekommen:',
      missionComplete: 'Mission abgeschlossen:', missionFallback: 'eine Mission', xpWord: 'XP',
      yourWithdrawalOf: 'Deine Auszahlung von', wasApproved: 'wurde genehmigt.',
      wasRejected: 'wurde abgelehnt — die Coins wurden zurückerstattet.', hasBeenPaid: 'wurde ausgezahlt.',
      notificationFallback: 'Benachrichtigung', justNow: 'gerade eben', minAgo: 'Min.', hAgo: 'Std.', dAgo: 'Tg.'
    },
    events: {
      ended: 'Beendet', dayUnit: 'T', hourUnit: 'Std', minuteUnit: 'Min', left: 'übrig',
      errorLoad: 'Das aktuelle Event konnte nicht geladen werden.', errorJoinTeam: 'Dieses Team konnte nicht beigetreten werden.',
      noLiveEvent: 'Gerade kein Live-Event. Schau bald wieder vorbei!',
      pickSide: 'Wähle eine Seite, um an der Schlacht teilzunehmen:',
      youreOnTeamPrefix: 'Du bist in Team', youreOnTeamSuffix: '— sende Geschenke, um den Punktestand deines Teams zu steigern!',
      topContributors: 'Top-Beitragende', noOneScoredYet: 'Noch niemand hat gepunktet — sei der Erste!', ptsSuffix: 'Pkt.'
    },
    settings: {
      errorLoadUser: 'Benutzer konnte nicht abgerufen werden',
      passwordsDontMatch: 'Die Passwörter stimmen nicht überein',
      passwordMinLength: 'Das neue Passwort muss mindestens 10 Zeichen lang sein',
      errorChangePassword: 'Passwort konnte nicht geändert werden',
      passwordUpdatedSuccess: 'Passwort erfolgreich aktualisiert. Bitte melde dich erneut an.',
      errorUpdatePrivacy: 'Datenschutz konnte nicht aktualisiert werden',
      privacyUpdatedSuccess: 'Datenschutzeinstellungen aktualisiert',
      errorStartCheckout: 'Checkout konnte nicht gestartet werden.', checkoutUnavailable: 'Der Checkout ist gerade nicht verfügbar.',
      deleteConfirm: 'Bist du sicher? Diese Aktion ist dauerhaft und kann nicht rückgängig gemacht werden.',
      loadingSettings: 'Einstellungen werden geladen...',
      sidebarAccount: 'Konto', sidebarPrivacy: 'Datenschutz', sidebarMembership: 'Mitgliedschaft', sidebarSupport: 'Support & Rechtliches',
      logout: 'Abmelden', deleteAccount: 'Konto löschen', title: 'Einstellungen',
      accountSettingsTitle: 'Kontoeinstellungen',
      emailLabel: 'E-Mail', usernameLabel: 'Benutzername', displayNameLabel: 'Anzeigename',
      changePasswordTitle: 'Passwort ändern',
      currentPasswordPlaceholder: 'Aktuelles Passwort', newPasswordPlaceholder: 'Neues Passwort (mind. 10 Zeichen)', confirmPasswordPlaceholder: 'Neues Passwort bestätigen',
      updating: 'Wird aktualisiert...', updatePassword: 'Passwort aktualisieren',
      privacySettingsTitle: 'Datenschutzeinstellungen',
      showOnlineStatus: 'Online-Status anzeigen', profileVisibleToOthers: 'Profil für andere sichtbar', showAgeOnProfile: 'Alter im Profil anzeigen', showLocationOnProfile: 'Standort im Profil anzeigen',
      manageBlockList: 'Blockliste verwalten →',
      membershipTitle: 'Mitgliedschaft',
      premiumName: 'Premium', premiumDesc: 'Werbefrei, exklusive Geschenke, priorisierter Support',
      vipName: 'VIP', vipDesc: 'Alle Premium-Vorteile + zusätzliche Coins, Profil-Boost',
      svipName: 'SVIP', svipDesc: 'Alle VIP-Vorteile + private Shows, unbegrenzte Geschenke',
      redirecting: 'Weiterleitung…', upgrade: 'Upgraden',
      currentPlan: 'Aktueller Plan', freeWord: 'Kostenlos', expires: 'Läuft ab',
      upgradeYourPlan: 'Upgrade deinen Plan',
      supportLegalTitle: 'Support & Rechtliches',
      termsOfService: 'Nutzungsbedingungen', privacyPolicy: 'Datenschutzerklärung', communityGuidelines: 'Community-Richtlinien', cookiePolicy: 'Cookie-Richtlinie', contactSupport: 'Support kontaktieren'
    },
    profile: {
      errorLoad: 'Profil konnte nicht abgerufen werden', fallbackErrorLoad: 'Profil konnte nicht geladen werden',
      errorUpdate: 'Aktualisierung fehlgeschlagen', errorUpload: 'Upload fehlgeschlagen',
      deleteConfirm: 'Bist du sicher? Diese Aktion ist dauerhaft.',
      loadingProfile: 'Dein Amora-Profil wird geladen…',
      userNotFound: 'Benutzer nicht gefunden', retry: 'Erneut versuchen',
      locationNotSet: 'Standort nicht festgelegt',
      changePhotoAria: 'Profilbild ändern',
      followers: 'Follower', following: 'Folge ich', xpWord: 'XP', levelWord: 'Level',
      editProfile: 'Profil bearbeiten', settings: 'Einstellungen', security: '🛡️ Sicherheit',
      profileStudio: 'PROFIL-STUDIO', editYourProfile: 'Bearbeite dein Profil',
      displayNameLabel: 'Anzeigename', bioLabel: 'Bio', relationshipIntentLabel: 'Beziehungsabsicht', interestsLabel: 'Interessen', languagesLabel: 'Sprachen',
      saveChanges: 'Änderungen speichern', cancel: 'Abbrechen',
      aboutKicker: 'ÜBER MICH', personalSpace: 'Persönlicher Bereich',
      noBioYet: 'Noch keine Bio. Füge etwas hinzu, das zeigt, wer du bist.',
      locationDetail: 'Standort', intentDetail: 'Absicht', notSet: 'Nicht festgelegt', memberSinceDetail: 'Mitglied seit', membershipDetail: 'Mitgliedschaft',
      amoraStatusKicker: 'AMORA STATUS', levelProgress: 'Levelfortschritt',
      viewLevelRewards: 'Level-Belohnungen ansehen →',
      identityKicker: 'IDENTITÄT', interestsAndBadges: 'Interessen & Abzeichen',
      blockListPrefix: '🚫 Blockliste',
      deleteAccount: 'Konto löschen',
      blockedUsersTitle: 'Blockierte Nutzer', noBlockedUsers: 'Keine blockierten Nutzer.', unknownUserFallback: 'Nutzer', unblock: 'Blockierung aufheben'
    }
  },

  ar: {
    nav: {
      discover: 'استكشف', goLive: 'بث مباشر', studio: 'الاستوديو', match: 'تطابق', events: 'الفعاليات',
      rewards: 'المكافآت', missions: 'المهام', vip: 'VIP', chat: 'الدردشة', matches: 'التطابقات',
      safety: 'الأمان', profile: 'الملف الشخصي', admin: 'الإدارة', logout: 'تسجيل الخروج', store: 'المتجر',
      notifications: 'الإشعارات', wallet: 'المحفظة'
    },
    footer: {
      terms: 'الشروط', privacy: 'الخصوصية', guidelines: 'الإرشادات', cookies: 'ملفات تعريف الارتباط',
      tagline: 'صُمم من أجل علاقات ذات معنى.'
    },
    common: {
      language: 'اللغة', save: 'حفظ', cancel: 'إلغاء', loading: 'جارٍ التحميل…', continue: 'متابعة',
      back: 'رجوع', or: 'أو'
    },
    auth: {
      login: {
        eyebrow: 'مرحبًا بعودتك', title: 'مرحبًا بعودتك إلى', titleHighlight: 'أمورا.',
        subtitle: 'سجّل الدخول لرؤية تطابقاتك ومحادثاتك ولحظاتك المباشرة.',
        footerText: 'جديد على أمورا؟', footerLabel: 'أنشئ حسابك', backLink: '← العودة إلى AmoraLive',
        errorGoogle: 'تعذّر تسجيل الدخول عبر Google. حاول مرة أخرى.',
        errorApple: 'تعذّر تسجيل الدخول عبر Apple. حاول مرة أخرى.',
        errorFacebook: 'تعذّر تسجيل الدخول عبر Facebook. حاول مرة أخرى.',
        errorSuspended: 'هذا الحساب موقوف حاليًا.',
        emailLabel: 'البريد الإلكتروني أو اسم المستخدم', emailPlaceholder: 'you@example.com أو اسم المستخدم',
        passwordLabel: 'كلمة المرور', passwordPlaceholder: 'كلمة المرور الخاصة بك',
        showPassword: 'إظهار', hidePassword: 'إخفاء',
        submit: 'تسجيل الدخول', submitting: 'جارٍ تسجيل الدخول…',
        continueApple: 'المتابعة عبر Apple', connectingApple: 'جارٍ الاتصال بـ Apple…',
        continueFacebook: 'المتابعة عبر Facebook', connectingFacebook: 'جارٍ الاتصال بـ Facebook…',
        continueGoogle: 'المتابعة عبر Google', connectingGoogle: 'جارٍ الاتصال بـ Google…',
        byContinuing: 'بالمتابعة، فإنك توافق على', termsLink: 'الشروط', andLink: 'و', privacyLink: 'سياسة الخصوصية'
      },
      register: {
        eyebrow: 'انضم إلى أمورا', title: 'أنشئ حساب أمورا الخاص بك.',
        subtitle: 'تعرّف على أشخاص، وابنِ علاقات، وشارك لحظات ذات معنى.',
        footerText: 'لديك حساب بالفعل؟', footerLabel: 'تسجيل الدخول', backLink: '← العودة إلى AmoraLive',
        continueApple: 'المتابعة عبر Apple', connectingApple: 'جارٍ الاتصال بـ Apple…',
        continueFacebook: 'المتابعة عبر Facebook', connectingFacebook: 'جارٍ الاتصال بـ Facebook…',
        continueGoogle: 'المتابعة عبر Google', connectingGoogle: 'جارٍ الاتصال بـ Google…',
        emailLabel: 'البريد الإلكتروني', emailPlaceholder: 'you@example.com',
        usernameLabel: 'اسم المستخدم', usernamePlaceholder: 'اختر اسم مستخدم',
        usernameHint: 'من 3 إلى 20 حرفًا: أحرف وأرقام ونقاط وشرطات أو شرطات سفلية.',
        passwordLabel: 'كلمة المرور', passwordPlaceholder: '8 أحرف على الأقل',
        showPassword: 'إظهار', hidePassword: 'إخفاء',
        dobLabel: 'تاريخ الميلاد', dobHint: 'AmoraLive مجتمع لمن هم فوق 18 عامًا.',
        submit: 'إنشاء حساب', submitting: 'جارٍ إنشاء الحساب…',
        successTitle: 'تحقّق من بريدك الوارد.',
        successSubtitle: 'حساب أمورا الخاص بك جاهز. تحقق من بريدك الإلكتروني للمتابعة.',
        successHeading: 'تم التسجيل بنجاح',
        successBody: 'أرسلنا رابط تحقق إلى بريدك الإلكتروني. افتحه، ثم عد لتسجيل الدخول.',
        goToLogin: 'الذهاب إلى تسجيل الدخول',
        byCreating: 'بإنشاء حساب، فإنك توافق على', termsLink: 'الشروط', andLink: 'و', privacyLink: 'سياسة الخصوصية'
      }
    },
    discover: {
      tabRecommended: 'موصى به', tabTrending: 'الأكثر رواجًا', tabNew: 'جديد', tabFollowing: 'المتابَعون', tabCreators: 'صناع المحتوى', tabCategories: 'الفئات',
      typePopular: 'شائع', typeRising: 'صاعد', typeNew: 'جديد',
      catChat: 'دردشة', catMusic: 'موسيقى', catEntertainment: 'ترفيه', catGaming: 'ألعاب', catLifestyle: 'أسلوب حياة', catTravel: 'سفر', catQA: 'أسئلة وأجوبة', catDating: 'مواعدة',
      searchPlaceholder: '🔍 ابحث عن صناع محتوى وبثوث مباشرة…', searching: 'جارٍ البحث…',
      creatorsHeader: 'صناع المحتوى', liveNowHeader: 'مباشر الآن', noResultsFor: 'لا نتائج لـ',
      loadingCreators: 'جارٍ تحميل صناع المحتوى...', loadingLive: 'جارٍ تحميل البثوث المباشرة...',
      errorPrefix: 'خطأ:', retry: 'إعادة المحاولة',
      noCreatorsYet: 'لا يوجد صناع محتوى لعرضهم بعد.', noLiveNow: 'لا يوجد بث مباشر الآن', checkBackLater: 'عد لاحقًا أو ابدأ بثك الخاص!',
      following: 'متابَع', follow: 'متابعة', message: 'رسالة',
      followersSuffix: 'متابع', thisWeekSuffix: 'هذا الأسبوع',
      live: 'مباشر', unknown: 'غير معروف', untitled: 'بدون عنوان', general: 'عام'
    },
    matches: {
      title: '💕 التطابقات', preferencesBtn: '⚙️ التفضيلات', tabDiscover: 'استكشاف', tabMyMatches: 'تطابقاتي',
      matchedWithPrefix: '🎉 لقد تطابقت مع', matchedWithSuffix: '! اضغط للإغلاق.',
      noMoreProfiles: 'لا مزيد من الملفات الشخصية الآن', widenPreferences: 'عد لاحقًا أو وسّع تفضيلاتك.',
      matchPercentSuffix: '% تطابق', noMatchesYet: 'لا توجد تطابقات بعد — استمر في الاستكشاف!', compatiblePercentSuffix: '% توافق',
      unmatchConfirm: 'إلغاء التطابق؟ سيؤدي هذا إلى إزالة الاتصال ولا يمكن التراجع عنه.',
      prefsTitle: 'تفضيلات المواعدة', yourGender: 'جنسك', preferNotToSay: 'أفضل عدم الإفصاح', showMe: 'أرني',
      ageRangeLabel: 'الفئة العمرية:', savePreferences: 'حفظ التفضيلات'
    },
    wallet: {
      loadingWallet: 'جارٍ تحميل المحفظة...', errorPrefix: 'خطأ:', retry: 'إعادة المحاولة', title: 'محفظتي', profile: 'الملف الشخصي',
      availableCoins: 'العملات المتاحة', hidePackages: 'إخفاء الباقات', buyCoins: 'شراء عملات', withdraw: 'سحب', buy: 'شراء',
      promotion: '🔥 عرض ترويجي', allTransactions: 'كل المعاملات', giftHistory: 'سجل الهدايا',
      noTransactionsYet: 'لا توجد معاملات بعد', transactionFallback: 'معاملة'
    },
    store: {
      kicker: 'أمورا • الخزنة الفاخرة', title: 'بوتيك أمورا', subtitle: 'اجمع تأثيرات ملف شخصي مضيئة وهويات ملكية ومستحضرات تجميل مميزة.',
      catalogTab: 'الكتالوج', myItemsTab: 'عناصري', equipOutfits: 'تجهيز الأزياء ←',
      loadingBoutique: 'جارٍ تحميل البوتيك…', nothingInStore: 'لا يوجد شيء في المتجر الآن.',
      daysSuffix: 'أيام', permanent: 'دائم', processing: 'جارٍ المعالجة…', extend: 'تمديد', owned: 'مملوك', buy: 'شراء',
      noOwnedItems: 'ليس لديك أي عناصر بعد. تصفح الكتالوج!', expiresPrefix: 'تنتهي في', equipped: 'مجهز ✓', equip: 'تجهيز',
      errorLoadStore: 'تعذر تحميل المتجر الآن.', notEnoughCoins: 'ليس لديك عملات كافية لهذا العنصر.',
      purchaseFailed: 'فشلت عملية الشراء.', extendedPrefix: 'تم التمديد', purchasedPrefix: 'تم الشراء', updateItemFailed: 'تعذر تحديث هذا العنصر.',
      typeAvatarFrame: 'إطارات الصورة الرمزية', typeEntranceEffect: 'تأثيرات الدخول', typeBadge: 'الشارات', typeChatBubble: 'فقاعات الدردشة', typeProfileCard: 'بطاقات الملف الشخصي'
    },
    safety: {
      errorLoad: 'تعذر تحميل مركز الأمان.',
      revokeOthersConfirm: 'تسجيل الخروج من جميع الأجهزة الأخرى؟ ستبقى مسجلاً هنا.',
      signedOutOf: 'تم تسجيل الخروج من', otherDevice: 'جهاز آخر.', otherDevices: 'أجهزة أخرى.',
      tabBlocked: 'المحظورون', tabMuted: 'المكتومون', tabMyReports: 'بلاغاتي', tabDevices: 'الأجهزة',
      title: '🛡️ مركز الأمان', securityKicker: 'أمان أمورا',
      excellentProtection: 'حماية ممتازة', strongProtection: 'حماية قوية', protectionNeedsAttention: 'الحماية تحتاج إلى انتباه',
      emailVerified: '✓ البريد الإلكتروني', reviewEmail: 'مراجعة البريد الإلكتروني', device: 'جهاز', devices: 'أجهزة',
      privacyConfigured: '✓ الخصوصية', reviewPrivacy: 'مراجعة الخصوصية',
      changePassword: '🔑 تغيير كلمة المرور', privacySettings: '🔒 إعدادات الخصوصية',
      noBlockedUsers: 'لا يوجد مستخدمون محظورون.', unblock: 'إلغاء الحظر',
      noMutedUsers: 'لا يوجد مستخدمون مكتومون. الكتم يخفي محتوى الشخص عنك دون علمه ودون حظره.', unmute: 'إلغاء الكتم',
      noReportsSubmitted: 'لم تقدم أي بلاغات.',
      logOutAllOtherDevices: 'تسجيل الخروج من جميع الأجهزة الأخرى',
      unknownDevice: 'جهاز غير معروف', unknownLocation: 'موقع غير معروف', signedInPrefix: 'تم تسجيل الدخول في', revoke: 'إلغاء'
    },
    chat: {
      failedLoadConversations: 'فشل تحميل المحادثات',
      unableToLoadMessages: 'تعذر تحميل الرسائل',
      openingMessages: 'جارٍ فتح رسائلك الخاصة…',
      eyebrow: 'أمورا الخاص', title: 'الرسائل', subtitle: 'محادثات خاصة، محفوظة بعناية.',
      discoverLink: 'استكشاف', retry: 'إعادة المحاولة',
      noConversationsYet: 'لا توجد محادثات بعد', startMatchSayHello: 'حقق تطابقًا وقل مرحبًا.', discoverPeople: 'استكشاف الأشخاص',
      sentPhotoOrVideo: 'أرسل صورة أو فيديو', justNow: 'الآن'
    },
    notifications: {
      title: 'الإشعارات', markingEllipsis: 'جارٍ التحديد…', markAllRead: 'تحديد الكل كمقروء',
      allCaughtUp: 'أنت على اطلاع كامل. لا جديد هنا.', dismiss: 'إغلاق',
      errorLoad: 'تعذر تحميل الإشعارات.', someoneFallback: 'شخص ما',
      newMatch: 'لديك تطابق جديد!', superLikedYou: 'أعجب بك إعجابًا فائقًا!',
      sentMessage: 'أرسل لك رسالة:', youReceived: 'لقد استلمت', giftFallback: 'هدية',
      levelUpTo: 'ارتقيت مستوى! أنت الآن في المستوى', earnedBadgePrefix: '— حصلت على شارة', earnedBadgeSuffix: '',
      dailyRewardClaimed: 'تم استلام المكافأة اليومية:', coinsWord: 'عملة', dayStreak: 'أيام متتالية',
      yourWord: 'مكافأتك', monthlyBonusArrived: 'الشهرية وصلت:',
      missionComplete: 'اكتملت المهمة:', missionFallback: 'مهمة', xpWord: 'نقطة خبرة',
      yourWithdrawalOf: 'طلب سحبك بقيمة', wasApproved: 'تمت الموافقة عليه.',
      wasRejected: 'تم رفضه — تم استرداد العملات.', hasBeenPaid: 'تم دفعه.',
      notificationFallback: 'إشعار', justNow: 'الآن', minAgo: 'د', hAgo: 'س', dAgo: 'ي'
    },
    events: {
      ended: 'انتهى', dayUnit: 'ي', hourUnit: 'س', minuteUnit: 'د', left: 'متبقٍ',
      errorLoad: 'تعذر تحميل الفعالية الحالية.', errorJoinTeam: 'تعذر الانضمام إلى هذا الفريق.',
      noLiveEvent: 'لا توجد فعالية مباشرة الآن. عد قريبًا!',
      pickSide: 'اختر جانبًا للانضمام إلى المعركة:',
      youreOnTeamPrefix: 'أنت في فريق', youreOnTeamSuffix: '— أرسل الهدايا لتعزيز نقاط فريقك!',
      topContributors: 'أفضل المساهمين', noOneScoredYet: 'لم يسجل أحد بعد — كن الأول!', ptsSuffix: 'نقطة'
    },
    settings: {
      errorLoadUser: 'فشل جلب بيانات المستخدم',
      passwordsDontMatch: 'كلمتا المرور غير متطابقتين',
      passwordMinLength: 'يجب أن تتكون كلمة المرور الجديدة من 10 أحرف على الأقل',
      errorChangePassword: 'فشل تغيير كلمة المرور',
      passwordUpdatedSuccess: 'تم تحديث كلمة المرور بنجاح. يرجى تسجيل الدخول مرة أخرى.',
      errorUpdatePrivacy: 'فشل تحديث الخصوصية',
      privacyUpdatedSuccess: 'تم تحديث إعدادات الخصوصية',
      errorStartCheckout: 'تعذر بدء عملية الدفع.', checkoutUnavailable: 'الدفع غير متاح الآن.',
      deleteConfirm: 'هل أنت متأكد؟ هذا الإجراء نهائي ولا يمكن التراجع عنه.',
      loadingSettings: 'جارٍ تحميل الإعدادات...',
      sidebarAccount: 'الحساب', sidebarPrivacy: 'الخصوصية', sidebarMembership: 'العضوية', sidebarSupport: 'الدعم والقوانين',
      logout: 'تسجيل الخروج', deleteAccount: 'حذف الحساب', title: 'الإعدادات',
      accountSettingsTitle: 'إعدادات الحساب',
      emailLabel: 'البريد الإلكتروني', usernameLabel: 'اسم المستخدم', displayNameLabel: 'اسم العرض',
      changePasswordTitle: 'تغيير كلمة المرور',
      currentPasswordPlaceholder: 'كلمة المرور الحالية', newPasswordPlaceholder: 'كلمة مرور جديدة (10 أحرف على الأقل)', confirmPasswordPlaceholder: 'تأكيد كلمة المرور الجديدة',
      updating: 'جارٍ التحديث...', updatePassword: 'تحديث كلمة المرور',
      privacySettingsTitle: 'إعدادات الخصوصية',
      showOnlineStatus: 'إظهار حالة الاتصال', profileVisibleToOthers: 'الملف الشخصي مرئي للآخرين', showAgeOnProfile: 'إظهار العمر في الملف الشخصي', showLocationOnProfile: 'إظهار الموقع في الملف الشخصي',
      manageBlockList: 'إدارة قائمة الحظر ←',
      membershipTitle: 'العضوية',
      premiumName: 'بريميوم', premiumDesc: 'بدون إعلانات، هدايا حصرية، دعم ذو أولوية',
      vipName: 'VIP', vipDesc: 'كل مزايا بريميوم + عملات إضافية، تعزيز الملف الشخصي',
      svipName: 'SVIP', svipDesc: 'كل مزايا VIP + عروض خاصة، هدايا غير محدودة',
      redirecting: 'جارٍ إعادة التوجيه…', upgrade: 'ترقية',
      currentPlan: 'الخطة الحالية', freeWord: 'مجاني', expires: 'تنتهي في',
      upgradeYourPlan: 'قم بترقية خطتك',
      supportLegalTitle: 'الدعم والقوانين',
      termsOfService: 'شروط الخدمة', privacyPolicy: 'سياسة الخصوصية', communityGuidelines: 'إرشادات المجتمع', cookiePolicy: 'سياسة ملفات تعريف الارتباط', contactSupport: 'التواصل مع الدعم'
    },
    profile: {
      errorLoad: 'فشل جلب الملف الشخصي', fallbackErrorLoad: 'تعذر تحميل الملف الشخصي',
      errorUpdate: 'فشل التحديث', errorUpload: 'فشل الرفع',
      deleteConfirm: 'هل أنت متأكد؟ هذا الإجراء نهائي.',
      loadingProfile: 'جارٍ تحميل ملفك الشخصي في أمورا…',
      userNotFound: 'المستخدم غير موجود', retry: 'إعادة المحاولة',
      locationNotSet: 'لم يتم تحديد الموقع',
      changePhotoAria: 'تغيير صورة الملف الشخصي',
      followers: 'المتابعون', following: 'يتابع', xpWord: 'نقاط خبرة', levelWord: 'المستوى',
      editProfile: 'تعديل الملف الشخصي', settings: 'الإعدادات', security: '🛡️ الأمان',
      profileStudio: 'استوديو الملف الشخصي', editYourProfile: 'عدّل ملفك الشخصي',
      displayNameLabel: 'اسم العرض', bioLabel: 'النبذة', relationshipIntentLabel: 'نية العلاقة', interestsLabel: 'الاهتمامات', languagesLabel: 'اللغات',
      saveChanges: 'حفظ التغييرات', cancel: 'إلغاء',
      aboutKicker: 'نبذة عني', personalSpace: 'مساحة شخصية',
      noBioYet: 'لا توجد نبذة بعد. أضف شيئًا يعبّر عنك.',
      locationDetail: 'الموقع', intentDetail: 'النية', notSet: 'غير محدد', memberSinceDetail: 'عضو منذ', membershipDetail: 'العضوية',
      amoraStatusKicker: 'حالة أمورا', levelProgress: 'تقدم المستوى',
      viewLevelRewards: 'عرض مكافآت المستوى ←',
      identityKicker: 'الهوية', interestsAndBadges: 'الاهتمامات والشارات',
      blockListPrefix: '🚫 قائمة الحظر',
      deleteAccount: 'حذف الحساب',
      blockedUsersTitle: 'المستخدمون المحظورون', noBlockedUsers: 'لا يوجد مستخدمون محظورون.', unknownUserFallback: 'مستخدم', unblock: 'إلغاء الحظر'
    }
  },

  hi: {
    nav: {
      discover: 'खोजें', goLive: 'लाइव जाएं', studio: 'स्टूडियो', match: 'मैच', events: 'इवेंट्स',
      rewards: 'रिवॉर्ड्स', missions: 'मिशन', vip: 'VIP', chat: 'चैट', matches: 'मैचेस',
      safety: 'सुरक्षा', profile: 'प्रोफ़ाइल', admin: 'एडमिन', logout: 'लॉग आउट', store: 'स्टोर',
      notifications: 'सूचनाएं', wallet: 'वॉलेट'
    },
    footer: {
      terms: 'शर्तें', privacy: 'गोपनीयता', guidelines: 'दिशानिर्देश', cookies: 'कुकीज़',
      tagline: 'सार्थक रिश्तों के लिए बनाया गया।'
    },
    common: {
      language: 'भाषा', save: 'सहेजें', cancel: 'रद्द करें', loading: 'लोड हो रहा है…', continue: 'जारी रखें',
      back: 'वापस', or: 'या'
    },
    auth: {
      login: {
        eyebrow: 'वापसी पर स्वागत है', title: 'वापसी पर स्वागत है', titleHighlight: 'Amora में।',
        subtitle: 'अपने मैच, बातचीत और लाइव पलों को देखने के लिए साइन इन करें।',
        footerText: 'Amora पर नए हैं?', footerLabel: 'अपना खाता बनाएं', backLink: '← AmoraLive पर वापस जाएं',
        errorGoogle: 'Google से साइन इन नहीं हो सका। कृपया फिर से प्रयास करें।',
        errorApple: 'Apple से साइन इन नहीं हो सका। कृपया फिर से प्रयास करें।',
        errorFacebook: 'Facebook से साइन इन नहीं हो सका। कृपया फिर से प्रयास करें।',
        errorSuspended: 'यह खाता फ़िलहाल निलंबित है।',
        emailLabel: 'ईमेल या यूज़रनेम', emailPlaceholder: 'you@example.com या यूज़रनेम',
        passwordLabel: 'पासवर्ड', passwordPlaceholder: 'आपका पासवर्ड',
        showPassword: 'दिखाएं', hidePassword: 'छिपाएं',
        submit: 'साइन इन करें', submitting: 'साइन इन हो रहा है…',
        continueApple: 'Apple से जारी रखें', connectingApple: 'Apple से जुड़ रहे हैं…',
        continueFacebook: 'Facebook से जारी रखें', connectingFacebook: 'Facebook से जुड़ रहे हैं…',
        continueGoogle: 'Google से जारी रखें', connectingGoogle: 'Google से जुड़ रहे हैं…',
        byContinuing: 'जारी रखकर, आप AmoraLive की', termsLink: 'शर्तों', andLink: 'और', privacyLink: 'गोपनीयता नीति से सहमत होते हैं'
      },
      register: {
        eyebrow: 'AMORA से जुड़ें', title: 'अपना Amora खाता बनाएं।',
        subtitle: 'लोगों से मिलें, रिश्ते बनाएं और सार्थक पल साझा करें।',
        footerText: 'पहले से खाता है?', footerLabel: 'साइन इन करें', backLink: '← AmoraLive पर वापस जाएं',
        continueApple: 'Apple से जारी रखें', connectingApple: 'Apple से जुड़ रहे हैं…',
        continueFacebook: 'Facebook से जारी रखें', connectingFacebook: 'Facebook से जुड़ रहे हैं…',
        continueGoogle: 'Google से जारी रखें', connectingGoogle: 'Google से जुड़ रहे हैं…',
        emailLabel: 'ईमेल पता', emailPlaceholder: 'you@example.com',
        usernameLabel: 'यूज़रनेम', usernamePlaceholder: 'एक यूज़रनेम चुनें',
        usernameHint: '3–20 अक्षर: अक्षर, अंक, बिंदु, डैश या अंडरस्कोर।',
        passwordLabel: 'पासवर्ड', passwordPlaceholder: 'कम से कम 8 अक्षर',
        showPassword: 'दिखाएं', hidePassword: 'छिपाएं',
        dobLabel: 'जन्म तिथि', dobHint: 'AmoraLive एक 18+ समुदाय है।',
        submit: 'खाता बनाएं', submitting: 'खाता बनाया जा रहा है…',
        successTitle: 'अपना इनबॉक्स देखें।',
        successSubtitle: 'आपका Amora खाता तैयार है। जारी रखने के लिए अपना ईमेल सत्यापित करें।',
        successHeading: 'पंजीकरण सफल',
        successBody: 'हमने आपके ईमेल पर एक सत्यापन लिंक भेजा है। उसे खोलें, फिर वापस आकर साइन इन करें।',
        goToLogin: 'साइन इन पर जाएं',
        byCreating: 'खाता बनाकर, आप हमारी', termsLink: 'शर्तों', andLink: 'और', privacyLink: 'गोपनीयता नीति से सहमत होते हैं'
      }
    },
    discover: {
      tabRecommended: 'अनुशंसित', tabTrending: 'ट्रेंडिंग', tabNew: 'नया', tabFollowing: 'फॉलोइंग', tabCreators: 'क्रिएटर्स', tabCategories: 'श्रेणियां',
      typePopular: 'लोकप्रिय', typeRising: 'उभरते हुए', typeNew: 'नया',
      catChat: 'चैट', catMusic: 'संगीत', catEntertainment: 'मनोरंजन', catGaming: 'गेमिंग', catLifestyle: 'लाइफस्टाइल', catTravel: 'यात्रा', catQA: 'प्रश्नोत्तर', catDating: 'डेटिंग',
      searchPlaceholder: '🔍 क्रिएटर्स और लाइव स्ट्रीम खोजें…', searching: 'खोजा जा रहा है…',
      creatorsHeader: 'क्रिएटर्स', liveNowHeader: 'अभी लाइव', noResultsFor: 'इसके लिए कोई परिणाम नहीं',
      loadingCreators: 'क्रिएटर्स लोड हो रहे हैं...', loadingLive: 'लाइव स्ट्रीम लोड हो रही हैं...',
      errorPrefix: 'त्रुटि:', retry: 'पुनः प्रयास करें',
      noCreatorsYet: 'दिखाने के लिए अभी कोई क्रिएटर नहीं है।', noLiveNow: 'अभी कोई लाइव स्ट्रीम नहीं', checkBackLater: 'बाद में देखें या अपनी खुद की शुरू करें!',
      following: 'फॉलो हो रहा है', follow: 'फॉलो करें', message: 'मैसेज',
      followersSuffix: 'फॉलोअर्स', thisWeekSuffix: 'इस सप्ताह',
      live: 'लाइव', unknown: 'अज्ञात', untitled: 'शीर्षकहीन', general: 'सामान्य'
    },
    matches: {
      title: '💕 मैच', preferencesBtn: '⚙️ प्राथमिकताएं', tabDiscover: 'खोजें', tabMyMatches: 'मेरे मैच',
      matchedWithPrefix: '🎉 आपका मैच हुआ', matchedWithSuffix: '! बंद करने के लिए टैप करें।',
      noMoreProfiles: 'अभी और प्रोफ़ाइल नहीं हैं', widenPreferences: 'बाद में देखें, या अपनी प्राथमिकताएं व्यापक करें।',
      matchPercentSuffix: '% मैच', noMatchesYet: 'अभी तक कोई मैच नहीं — खोजते रहें!', compatiblePercentSuffix: '% अनुकूल',
      unmatchConfirm: 'मैच हटाएं? इससे कनेक्शन हट जाएगा और इसे पूर्ववत नहीं किया जा सकता।',
      prefsTitle: 'डेटिंग प्राथमिकताएं', yourGender: 'आपका लिंग', preferNotToSay: 'बताना नहीं चाहते', showMe: 'मुझे दिखाएं',
      ageRangeLabel: 'आयु सीमा:', savePreferences: 'प्राथमिकताएं सहेजें'
    },
    wallet: {
      loadingWallet: 'वॉलेट लोड हो रहा है...', errorPrefix: 'त्रुटि:', retry: 'पुनः प्रयास करें', title: 'मेरा वॉलेट', profile: 'प्रोफ़ाइल',
      availableCoins: 'उपलब्ध कॉइन', hidePackages: 'पैकेज छिपाएं', buyCoins: 'कॉइन खरीदें', withdraw: 'निकासी', buy: 'खरीदें',
      promotion: '🔥 प्रचार', allTransactions: 'सभी लेनदेन', giftHistory: 'गिफ्ट इतिहास',
      noTransactionsYet: 'अभी तक कोई लेनदेन नहीं', transactionFallback: 'लेनदेन'
    },
    store: {
      kicker: 'अमोरा • लक्ज़री वॉल्ट', title: 'द अमोरा बुटीक', subtitle: 'चमकदार प्रोफ़ाइल इफ़ेक्ट, शाही पहचान और प्रीमियम कॉस्मेटिक्स इकट्ठा करें।',
      catalogTab: 'कैटलॉग', myItemsTab: 'मेरी वस्तुएं', equipOutfits: 'आउटफिट लगाएं →',
      loadingBoutique: 'बुटीक लोड हो रहा है…', nothingInStore: 'अभी स्टोर में कुछ नहीं है।',
      daysSuffix: 'दिन', permanent: 'स्थायी', processing: 'प्रोसेसिंग…', extend: 'बढ़ाएं', owned: 'स्वामित्व में', buy: 'खरीदें',
      noOwnedItems: 'आपके पास अभी कोई आइटम नहीं है। कैटलॉग देखें!', expiresPrefix: 'समाप्ति', equipped: 'लगाया गया ✓', equip: 'लगाएं',
      errorLoadStore: 'अभी स्टोर लोड नहीं हो पा रहा है।', notEnoughCoins: 'इस आइटम के लिए आपके पास पर्याप्त कॉइन नहीं हैं।',
      purchaseFailed: 'खरीद विफल रही।', extendedPrefix: 'बढ़ाया गया', purchasedPrefix: 'खरीदा गया', updateItemFailed: 'इस आइटम को अपडेट नहीं किया जा सका।',
      typeAvatarFrame: 'अवतार फ्रेम', typeEntranceEffect: 'एंट्री इफ़ेक्ट', typeBadge: 'बैज', typeChatBubble: 'चैट बबल', typeProfileCard: 'प्रोफ़ाइल कार्ड'
    },
    safety: {
      errorLoad: 'सुरक्षा केंद्र लोड नहीं हो सका।',
      revokeOthersConfirm: 'हर दूसरे डिवाइस से लॉग आउट करें? आप यहां साइन इन रहेंगे।',
      signedOutOf: 'इससे साइन आउट किया गया', otherDevice: 'अन्य डिवाइस।', otherDevices: 'अन्य डिवाइस।',
      tabBlocked: 'ब्लॉक किए गए', tabMuted: 'म्यूट किए गए', tabMyReports: 'मेरी रिपोर्ट्स', tabDevices: 'डिवाइस',
      title: '🛡️ सुरक्षा केंद्र', securityKicker: 'अमोरा सुरक्षा',
      excellentProtection: 'उत्कृष्ट सुरक्षा', strongProtection: 'मजबूत सुरक्षा', protectionNeedsAttention: 'सुरक्षा पर ध्यान देने की आवश्यकता है',
      emailVerified: '✓ ईमेल', reviewEmail: 'ईमेल जांचें', device: 'डिवाइस', devices: 'डिवाइस',
      privacyConfigured: '✓ गोपनीयता', reviewPrivacy: 'गोपनीयता जांचें',
      changePassword: '🔑 पासवर्ड बदलें', privacySettings: '🔒 गोपनीयता सेटिंग्स',
      noBlockedUsers: 'कोई ब्लॉक किया गया उपयोगकर्ता नहीं है।', unblock: 'अनब्लॉक करें',
      noMutedUsers: 'कोई म्यूट किया गया उपयोगकर्ता नहीं है। म्यूट करने से किसी की सामग्री उसे बताए बिना और उसे ब्लॉक किए बिना आपसे छिप जाती है।', unmute: 'अनम्यूट करें',
      noReportsSubmitted: 'आपने कोई रिपोर्ट सबमिट नहीं की है।',
      logOutAllOtherDevices: 'सभी अन्य डिवाइस से लॉग आउट करें',
      unknownDevice: 'अज्ञात डिवाइस', unknownLocation: 'अज्ञात स्थान', signedInPrefix: 'साइन इन किया गया', revoke: 'रद्द करें'
    },
    chat: {
      failedLoadConversations: 'बातचीत लोड करने में विफल',
      unableToLoadMessages: 'संदेश लोड नहीं हो सके',
      openingMessages: 'आपके निजी संदेश खोले जा रहे हैं…',
      eyebrow: 'अमोरा प्राइवेट', title: 'संदेश', subtitle: 'निजी बातचीत, खूबसूरती से संजोई गई।',
      discoverLink: 'खोजें', retry: 'पुनः प्रयास करें',
      noConversationsYet: 'अभी तक कोई बातचीत नहीं', startMatchSayHello: 'मैच करें और नमस्ते कहें।', discoverPeople: 'लोगों को खोजें',
      sentPhotoOrVideo: 'फोटो या वीडियो भेजा', justNow: 'अभी अभी'
    },
    notifications: {
      title: 'सूचनाएं', markingEllipsis: 'चिह्नित किया जा रहा है…', markAllRead: 'सभी को पढ़ा हुआ चिह्नित करें',
      allCaughtUp: 'आप पूरी तरह अपडेट हैं। यहां कुछ नया नहीं है।', dismiss: 'हटाएं',
      errorLoad: 'सूचनाएं लोड नहीं हो सकीं।', someoneFallback: 'किसी ने',
      newMatch: 'आपका एक नया मैच है!', superLikedYou: 'ने आपको सुपर लाइक किया!',
      sentMessage: 'ने आपको संदेश भेजा:', youReceived: 'आपको मिला', giftFallback: 'एक गिफ्ट',
      levelUpTo: 'लेवल अप! अब आप लेवल पर हैं', earnedBadgePrefix: '— आपको बैज मिला', earnedBadgeSuffix: '',
      dailyRewardClaimed: 'दैनिक पुरस्कार प्राप्त हुआ:', coinsWord: 'कॉइन', dayStreak: 'दिनों की स्ट्रीक',
      yourWord: 'आपका', monthlyBonusArrived: 'मासिक बोनस आ गया:',
      missionComplete: 'मिशन पूरा हुआ:', missionFallback: 'एक मिशन', xpWord: 'XP',
      yourWithdrawalOf: 'आपकी निकासी', wasApproved: 'स्वीकृत हो गई।',
      wasRejected: 'अस्वीकृत हो गई — कॉइन वापस कर दिए गए।', hasBeenPaid: 'का भुगतान हो गया।',
      notificationFallback: 'सूचना', justNow: 'अभी अभी', minAgo: 'मिनट पहले', hAgo: 'घंटे पहले', dAgo: 'दिन पहले'
    },
    events: {
      ended: 'समाप्त', dayUnit: 'दि', hourUnit: 'घं', minuteUnit: 'मि', left: 'शेष',
      errorLoad: 'वर्तमान इवेंट लोड नहीं हो सका।', errorJoinTeam: 'इस टीम में शामिल नहीं हो सके।',
      noLiveEvent: 'अभी कोई लाइव इवेंट नहीं है। जल्द ही वापस देखें!',
      pickSide: 'लड़ाई में शामिल होने के लिए एक पक्ष चुनें:',
      youreOnTeamPrefix: 'आप टीम में हैं', youreOnTeamSuffix: '— अपनी टीम का स्कोर बढ़ाने के लिए गिफ्ट भेजें!',
      topContributors: 'शीर्ष योगदानकर्ता', noOneScoredYet: 'अभी तक किसी ने स्कोर नहीं किया — पहले बनें!', ptsSuffix: 'अंक'
    },
    settings: {
      errorLoadUser: 'उपयोगकर्ता प्राप्त करने में विफल',
      passwordsDontMatch: 'पासवर्ड मेल नहीं खाते',
      passwordMinLength: 'नए पासवर्ड में कम से कम 10 अक्षर होने चाहिए',
      errorChangePassword: 'पासवर्ड बदलने में विफल',
      passwordUpdatedSuccess: 'पासवर्ड सफलतापूर्वक अपडेट हो गया। कृपया फिर से साइन इन करें।',
      errorUpdatePrivacy: 'गोपनीयता अपडेट करने में विफल',
      privacyUpdatedSuccess: 'गोपनीयता सेटिंग्स अपडेट कर दी गईं',
      errorStartCheckout: 'चेकआउट शुरू नहीं हो सका।', checkoutUnavailable: 'चेकआउट अभी उपलब्ध नहीं है।',
      deleteConfirm: 'क्या आप सुनिश्चित हैं? यह क्रिया स्थायी है और इसे पूर्ववत नहीं किया जा सकता।',
      loadingSettings: 'सेटिंग्स लोड हो रही हैं...',
      sidebarAccount: 'खाता', sidebarPrivacy: 'गोपनीयता', sidebarMembership: 'सदस्यता', sidebarSupport: 'सहायता और कानूनी',
      logout: 'लॉगआउट', deleteAccount: 'खाता हटाएं', title: 'सेटिंग्स',
      accountSettingsTitle: 'खाता सेटिंग्स',
      emailLabel: 'ईमेल', usernameLabel: 'यूज़रनेम', displayNameLabel: 'प्रदर्शित नाम',
      changePasswordTitle: 'पासवर्ड बदलें',
      currentPasswordPlaceholder: 'वर्तमान पासवर्ड', newPasswordPlaceholder: 'नया पासवर्ड (कम से कम 10 अक्षर)', confirmPasswordPlaceholder: 'नए पासवर्ड की पुष्टि करें',
      updating: 'अपडेट हो रहा है...', updatePassword: 'पासवर्ड अपडेट करें',
      privacySettingsTitle: 'गोपनीयता सेटिंग्स',
      showOnlineStatus: 'ऑनलाइन स्थिति दिखाएं', profileVisibleToOthers: 'प्रोफ़ाइल अन्य लोगों को दिखे', showAgeOnProfile: 'प्रोफ़ाइल पर आयु दिखाएं', showLocationOnProfile: 'प्रोफ़ाइल पर स्थान दिखाएं',
      manageBlockList: 'ब्लॉक सूची प्रबंधित करें →',
      membershipTitle: 'सदस्यता',
      premiumName: 'प्रीमियम', premiumDesc: 'बिना विज्ञापन, विशेष गिफ्ट, प्राथमिकता सहायता',
      vipName: 'VIP', vipDesc: 'सभी प्रीमियम लाभ + अतिरिक्त कॉइन, प्रोफ़ाइल बूस्ट',
      svipName: 'SVIP', svipDesc: 'सभी VIP लाभ + निजी शो, असीमित गिफ्ट',
      redirecting: 'रीडायरेक्ट हो रहा है…', upgrade: 'अपग्रेड करें',
      currentPlan: 'वर्तमान योजना', freeWord: 'मुफ्त', expires: 'समाप्ति',
      upgradeYourPlan: 'अपनी योजना अपग्रेड करें',
      supportLegalTitle: 'सहायता और कानूनी',
      termsOfService: 'सेवा की शर्तें', privacyPolicy: 'गोपनीयता नीति', communityGuidelines: 'सामुदायिक दिशानिर्देश', cookiePolicy: 'कुकी नीति', contactSupport: 'सहायता से संपर्क करें'
    },
    profile: {
      errorLoad: 'प्रोफ़ाइल प्राप्त करने में विफल', fallbackErrorLoad: 'प्रोफ़ाइल लोड नहीं हो सकी',
      errorUpdate: 'अपडेट विफल रहा', errorUpload: 'अपलोड विफल रहा',
      deleteConfirm: 'क्या आप सुनिश्चित हैं? यह क्रिया स्थायी है।',
      loadingProfile: 'आपकी अमोरा प्रोफ़ाइल लोड हो रही है…',
      userNotFound: 'उपयोगकर्ता नहीं मिला', retry: 'पुनः प्रयास करें',
      locationNotSet: 'स्थान सेट नहीं है',
      changePhotoAria: 'प्रोफ़ाइल फोटो बदलें',
      followers: 'फॉलोअर्स', following: 'फॉलोइंग', xpWord: 'XP', levelWord: 'लेवल',
      editProfile: 'प्रोफ़ाइल संपादित करें', settings: 'सेटिंग्स', security: '🛡️ सुरक्षा',
      profileStudio: 'प्रोफ़ाइल स्टूडियो', editYourProfile: 'अपनी प्रोफ़ाइल संपादित करें',
      displayNameLabel: 'प्रदर्शित नाम', bioLabel: 'बायो', relationshipIntentLabel: 'संबंध का इरादा', interestsLabel: 'रुचियां', languagesLabel: 'भाषाएं',
      saveChanges: 'बदलाव सहेजें', cancel: 'रद्द करें',
      aboutKicker: 'परिचय', personalSpace: 'निजी स्थान',
      noBioYet: 'अभी तक कोई बायो नहीं है। कुछ ऐसा जोड़ें जो आपको दर्शाए।',
      locationDetail: 'स्थान', intentDetail: 'इरादा', notSet: 'सेट नहीं है', memberSinceDetail: 'सदस्य बने', membershipDetail: 'सदस्यता',
      amoraStatusKicker: 'अमोरा स्थिति', levelProgress: 'लेवल प्रगति',
      viewLevelRewards: 'लेवल पुरस्कार देखें →',
      identityKicker: 'पहचान', interestsAndBadges: 'रुचियां और बैज',
      blockListPrefix: '🚫 ब्लॉक सूची',
      deleteAccount: 'खाता हटाएं',
      blockedUsersTitle: 'ब्लॉक किए गए उपयोगकर्ता', noBlockedUsers: 'कोई ब्लॉक किया गया उपयोगकर्ता नहीं है।', unknownUserFallback: 'उपयोगकर्ता', unblock: 'अनब्लॉक करें'
    }
  },

  id: {
    nav: {
      discover: 'Jelajahi', goLive: 'Mulai Live', studio: 'Studio', match: 'Cocokkan', events: 'Acara',
      rewards: 'Hadiah', missions: 'Misi', vip: 'VIP', chat: 'Obrolan', matches: 'Kecocokan',
      safety: 'Keamanan', profile: 'Profil', admin: 'Admin', logout: 'Keluar', store: 'Toko',
      notifications: 'Notifikasi', wallet: 'Dompet'
    },
    footer: {
      terms: 'Ketentuan', privacy: 'Privasi', guidelines: 'Pedoman', cookies: 'Cookie',
      tagline: 'Dibuat untuk hubungan yang bermakna.'
    },
    common: {
      language: 'Bahasa', save: 'Simpan', cancel: 'Batal', loading: 'Memuat…', continue: 'Lanjutkan',
      back: 'Kembali', or: 'ATAU'
    },
    auth: {
      login: {
        eyebrow: 'SELAMAT DATANG KEMBALI', title: 'Selamat datang kembali di', titleHighlight: 'Amora.',
        subtitle: 'Masuk untuk melihat kecocokan, percakapan, dan momen live Anda.',
        footerText: 'Baru di Amora?', footerLabel: 'Buat akun Anda', backLink: '← Kembali ke AmoraLive',
        errorGoogle: 'Masuk dengan Google gagal. Silakan coba lagi.',
        errorApple: 'Masuk dengan Apple gagal. Silakan coba lagi.',
        errorFacebook: 'Masuk dengan Facebook gagal. Silakan coba lagi.',
        errorSuspended: 'Akun ini saat ini ditangguhkan.',
        emailLabel: 'Email atau nama pengguna', emailPlaceholder: 'anda@contoh.com atau nama pengguna',
        passwordLabel: 'Kata sandi', passwordPlaceholder: 'Kata sandi Anda',
        showPassword: 'Tampilkan', hidePassword: 'Sembunyikan',
        submit: 'Masuk', submitting: 'Sedang masuk…',
        continueApple: 'Lanjutkan dengan Apple', connectingApple: 'Menghubungkan ke Apple…',
        continueFacebook: 'Lanjutkan dengan Facebook', connectingFacebook: 'Menghubungkan ke Facebook…',
        continueGoogle: 'Lanjutkan dengan Google', connectingGoogle: 'Menghubungkan ke Google…',
        byContinuing: 'Dengan melanjutkan, Anda menyetujui', termsLink: 'Ketentuan', andLink: 'dan', privacyLink: 'Kebijakan Privasi'
      },
      register: {
        eyebrow: 'GABUNG AMORA', title: 'Buat akun Amora Anda.',
        subtitle: 'Temui orang baru, bangun hubungan, dan bagikan momen bermakna.',
        footerText: 'Sudah punya akun?', footerLabel: 'Masuk', backLink: '← Kembali ke AmoraLive',
        continueApple: 'Lanjutkan dengan Apple', connectingApple: 'Menghubungkan ke Apple…',
        continueFacebook: 'Lanjutkan dengan Facebook', connectingFacebook: 'Menghubungkan ke Facebook…',
        continueGoogle: 'Lanjutkan dengan Google', connectingGoogle: 'Menghubungkan ke Google…',
        emailLabel: 'Alamat email', emailPlaceholder: 'anda@contoh.com',
        usernameLabel: 'Nama pengguna', usernamePlaceholder: 'Pilih nama pengguna',
        usernameHint: '3–20 karakter: huruf, angka, titik, tanda hubung, atau garis bawah.',
        passwordLabel: 'Kata sandi', passwordPlaceholder: 'Minimal 8 karakter',
        showPassword: 'Tampilkan', hidePassword: 'Sembunyikan',
        dobLabel: 'Tanggal lahir', dobHint: 'AmoraLive adalah komunitas 18+.',
        submit: 'Buat akun', submitting: 'Membuat akun…',
        successTitle: 'Cek email Anda.',
        successSubtitle: 'Akun Amora Anda sudah siap. Verifikasi email Anda untuk melanjutkan.',
        successHeading: 'Pendaftaran berhasil',
        successBody: 'Kami mengirim tautan verifikasi ke email Anda. Buka tautan itu, lalu kembali untuk masuk.',
        goToLogin: 'Ke halaman Masuk',
        byCreating: 'Dengan membuat akun, Anda menyetujui', termsLink: 'Ketentuan', andLink: 'dan', privacyLink: 'Kebijakan Privasi'
      }
    },
    discover: {
      tabRecommended: 'Direkomendasikan', tabTrending: 'Trending', tabNew: 'Baru', tabFollowing: 'Mengikuti', tabCreators: 'Kreator', tabCategories: 'Kategori',
      typePopular: 'Populer', typeRising: 'Naik daun', typeNew: 'Baru',
      catChat: 'Obrolan', catMusic: 'Musik', catEntertainment: 'Hiburan', catGaming: 'Gaming', catLifestyle: 'Gaya hidup', catTravel: 'Perjalanan', catQA: 'Tanya Jawab', catDating: 'Kencan',
      searchPlaceholder: '🔍 Cari kreator dan siaran langsung…', searching: 'Mencari…',
      creatorsHeader: 'Kreator', liveNowHeader: 'Sedang live', noResultsFor: 'Tidak ada hasil untuk',
      loadingCreators: 'Memuat kreator...', loadingLive: 'Memuat siaran langsung...',
      errorPrefix: 'Kesalahan:', retry: 'Coba lagi',
      noCreatorsYet: 'Belum ada kreator untuk ditampilkan.', noLiveNow: 'Tidak ada siaran langsung saat ini', checkBackLater: 'Coba lagi nanti atau mulai siaranmu sendiri!',
      following: 'Mengikuti', follow: 'Ikuti', message: 'Pesan',
      followersSuffix: 'pengikut', thisWeekSuffix: 'minggu ini',
      live: 'LIVE', unknown: 'Tidak diketahui', untitled: 'Tanpa judul', general: 'Umum'
    },
    matches: {
      title: '💕 Kecocokan', preferencesBtn: '⚙️ Preferensi', tabDiscover: 'Jelajahi', tabMyMatches: 'Kecocokan Saya',
      matchedWithPrefix: '🎉 Anda cocok dengan', matchedWithSuffix: '! Ketuk untuk menutup.',
      noMoreProfiles: 'Tidak ada profil lagi untuk saat ini', widenPreferences: 'Coba lagi nanti, atau perluas preferensi Anda.',
      matchPercentSuffix: '% cocok', noMatchesYet: 'Belum ada kecocokan — terus jelajahi!', compatiblePercentSuffix: '% cocok',
      unmatchConfirm: 'Batalkan kecocokan? Ini akan menghapus koneksi dan tidak dapat dibatalkan.',
      prefsTitle: 'Preferensi Kencan', yourGender: 'Jenis kelamin Anda', preferNotToSay: 'Tidak ingin memberi tahu', showMe: 'Tampilkan saya',
      ageRangeLabel: 'Rentang usia:', savePreferences: 'Simpan preferensi'
    },
    wallet: {
      loadingWallet: 'Memuat dompet...', errorPrefix: 'Kesalahan:', retry: 'Coba lagi', title: 'Dompet Saya', profile: 'Profil',
      availableCoins: 'Koin tersedia', hidePackages: 'Sembunyikan paket', buyCoins: 'Beli koin', withdraw: 'Tarik dana', buy: 'Beli',
      promotion: '🔥 Promosi', allTransactions: 'Semua transaksi', giftHistory: 'Riwayat hadiah',
      noTransactionsYet: 'Belum ada transaksi', transactionFallback: 'Transaksi'
    },
    store: {
      kicker: 'AMORA • BRANKAS MEWAH', title: 'Butik Amora', subtitle: 'Kumpulkan efek profil bercahaya, identitas kerajaan, dan kosmetik premium.',
      catalogTab: 'Katalog', myItemsTab: 'Item Saya', equipOutfits: 'Pakai Kostum →',
      loadingBoutique: 'Memuat butik…', nothingInStore: 'Tidak ada apa pun di toko saat ini.',
      daysSuffix: 'hari', permanent: 'Permanen', processing: 'Memproses…', extend: 'Perpanjang', owned: 'Dimiliki', buy: 'Beli',
      noOwnedItems: 'Anda belum memiliki item apa pun. Lihat katalog!', expiresPrefix: 'Kedaluwarsa', equipped: 'Terpasang ✓', equip: 'Pasang',
      errorLoadStore: 'Tidak dapat memuat toko saat ini.', notEnoughCoins: 'Koin Anda tidak cukup untuk item ini.',
      purchaseFailed: 'Pembelian gagal.', extendedPrefix: 'Diperpanjang', purchasedPrefix: 'Dibeli', updateItemFailed: 'Tidak dapat memperbarui item ini.',
      typeAvatarFrame: 'Bingkai Avatar', typeEntranceEffect: 'Efek Masuk', typeBadge: 'Lencana', typeChatBubble: 'Gelembung Obrolan', typeProfileCard: 'Kartu Profil'
    },
    safety: {
      errorLoad: 'Tidak dapat memuat Pusat Keamanan.',
      revokeOthersConfirm: 'Keluar dari semua perangkat lain? Anda akan tetap masuk di sini.',
      signedOutOf: 'Keluar dari', otherDevice: 'perangkat lain.', otherDevices: 'perangkat lain.',
      tabBlocked: 'Diblokir', tabMuted: 'Dibisukan', tabMyReports: 'Laporan Saya', tabDevices: 'Perangkat',
      title: '🛡️ Pusat Keamanan', securityKicker: 'KEAMANAN AMORA',
      excellentProtection: 'Perlindungan sangat baik', strongProtection: 'Perlindungan kuat', protectionNeedsAttention: 'Perlindungan perlu diperhatikan',
      emailVerified: '✓ Email', reviewEmail: 'Tinjau email', device: 'perangkat', devices: 'perangkat',
      privacyConfigured: '✓ Privasi', reviewPrivacy: 'Tinjau privasi',
      changePassword: '🔑 Ubah Kata Sandi', privacySettings: '🔒 Pengaturan Privasi',
      noBlockedUsers: 'Tidak ada pengguna yang diblokir.', unblock: 'Buka blokir',
      noMutedUsers: 'Tidak ada pengguna yang dibisukan. Membisukan menyembunyikan konten seseorang dari Anda tanpa sepengetahuan mereka, dan tanpa memblokirnya.', unmute: 'Batalkan bisukan',
      noReportsSubmitted: 'Anda belum mengirimkan laporan apa pun.',
      logOutAllOtherDevices: 'Keluar dari semua perangkat lain',
      unknownDevice: 'Perangkat tidak dikenal', unknownLocation: 'Lokasi tidak dikenal', signedInPrefix: 'masuk pada', revoke: 'Cabut'
    },
    chat: {
      failedLoadConversations: 'Gagal memuat percakapan',
      unableToLoadMessages: 'Tidak dapat memuat pesan',
      openingMessages: 'Membuka pesan pribadi Anda…',
      eyebrow: 'AMORA PRIBADI', title: 'Pesan', subtitle: 'Percakapan pribadi, tersimpan dengan indah.',
      discoverLink: 'Jelajahi', retry: 'Coba lagi',
      noConversationsYet: 'Belum ada percakapan', startMatchSayHello: 'Buat kecocokan dan sapa.', discoverPeople: 'Jelajahi orang',
      sentPhotoOrVideo: 'Mengirim foto atau video', justNow: 'Baru saja'
    },
    notifications: {
      title: 'Notifikasi', markingEllipsis: 'Menandai…', markAllRead: 'Tandai semua dibaca',
      allCaughtUp: 'Anda sudah update. Tidak ada yang baru di sini.', dismiss: 'Tutup',
      errorLoad: 'Tidak dapat memuat notifikasi.', someoneFallback: 'Seseorang',
      newMatch: 'Anda punya kecocokan baru!', superLikedYou: 'memberi Anda super like!',
      sentMessage: 'mengirimi Anda pesan:', youReceived: 'Anda menerima', giftFallback: 'hadiah',
      levelUpTo: 'Naik level! Sekarang Anda level', earnedBadgePrefix: '— mendapatkan lencana', earnedBadgeSuffix: '',
      dailyRewardClaimed: 'Hadiah harian diklaim:', coinsWord: 'koin', dayStreak: 'hari beruntun',
      yourWord: 'Bonus bulanan Anda', monthlyBonusArrived: 'telah tiba:',
      missionComplete: 'Misi selesai:', missionFallback: 'sebuah misi', xpWord: 'XP',
      yourWithdrawalOf: 'Penarikan Anda sebesar', wasApproved: 'telah disetujui.',
      wasRejected: 'ditolak — koin telah dikembalikan.', hasBeenPaid: 'telah dibayarkan.',
      notificationFallback: 'Notifikasi', justNow: 'baru saja', minAgo: 'm lalu', hAgo: 'j lalu', dAgo: 'h lalu'
    },
    events: {
      ended: 'Berakhir', dayUnit: 'h', hourUnit: 'j', minuteUnit: 'm', left: 'tersisa',
      errorLoad: 'Tidak dapat memuat acara saat ini.', errorJoinTeam: 'Tidak dapat bergabung dengan tim ini.',
      noLiveEvent: 'Tidak ada acara langsung saat ini. Kembali lagi nanti!',
      pickSide: 'Pilih sisi untuk bergabung dalam pertempuran:',
      youreOnTeamPrefix: 'Anda berada di Tim', youreOnTeamSuffix: '— kirim hadiah untuk meningkatkan skor tim Anda!',
      topContributors: 'Kontributor teratas', noOneScoredYet: 'Belum ada yang mencetak skor — jadilah yang pertama!', ptsSuffix: 'poin'
    },
    settings: {
      errorLoadUser: 'Gagal mengambil data pengguna',
      passwordsDontMatch: 'Kata sandi tidak cocok',
      passwordMinLength: 'Kata sandi baru harus minimal 10 karakter',
      errorChangePassword: 'Gagal mengubah kata sandi',
      passwordUpdatedSuccess: 'Kata sandi berhasil diperbarui. Silakan masuk lagi.',
      errorUpdatePrivacy: 'Gagal memperbarui privasi',
      privacyUpdatedSuccess: 'Pengaturan privasi diperbarui',
      errorStartCheckout: 'Tidak dapat memulai checkout.', checkoutUnavailable: 'Checkout tidak tersedia saat ini.',
      deleteConfirm: 'Apakah Anda yakin? Tindakan ini permanen dan tidak dapat dibatalkan.',
      loadingSettings: 'Memuat pengaturan...',
      sidebarAccount: 'Akun', sidebarPrivacy: 'Privasi', sidebarMembership: 'Keanggotaan', sidebarSupport: 'Dukungan & Legal',
      logout: 'Keluar', deleteAccount: 'Hapus Akun', title: 'Pengaturan',
      accountSettingsTitle: 'Pengaturan Akun',
      emailLabel: 'Email', usernameLabel: 'Nama pengguna', displayNameLabel: 'Nama tampilan',
      changePasswordTitle: 'Ubah Kata Sandi',
      currentPasswordPlaceholder: 'Kata sandi saat ini', newPasswordPlaceholder: 'Kata sandi baru (min. 10 karakter)', confirmPasswordPlaceholder: 'Konfirmasi kata sandi baru',
      updating: 'Memperbarui...', updatePassword: 'Perbarui Kata Sandi',
      privacySettingsTitle: 'Pengaturan Privasi',
      showOnlineStatus: 'Tampilkan status online', profileVisibleToOthers: 'Profil terlihat oleh orang lain', showAgeOnProfile: 'Tampilkan usia di profil', showLocationOnProfile: 'Tampilkan lokasi di profil',
      manageBlockList: 'Kelola daftar blokir →',
      membershipTitle: 'Keanggotaan',
      premiumName: 'Premium', premiumDesc: 'Bebas iklan, hadiah eksklusif, dukungan prioritas',
      vipName: 'VIP', vipDesc: 'Semua manfaat Premium + koin ekstra, dorongan profil',
      svipName: 'SVIP', svipDesc: 'Semua manfaat VIP + pertunjukan pribadi, hadiah tanpa batas',
      redirecting: 'Mengalihkan…', upgrade: 'Tingkatkan',
      currentPlan: 'Paket saat ini', freeWord: 'Gratis', expires: 'Berakhir',
      upgradeYourPlan: 'Tingkatkan paket Anda',
      supportLegalTitle: 'Dukungan & Legal',
      termsOfService: 'Ketentuan Layanan', privacyPolicy: 'Kebijakan Privasi', communityGuidelines: 'Pedoman Komunitas', cookiePolicy: 'Kebijakan Cookie', contactSupport: 'Hubungi Dukungan'
    },
    profile: {
      errorLoad: 'Gagal mengambil profil', fallbackErrorLoad: 'Tidak dapat memuat profil',
      errorUpdate: 'Pembaruan gagal', errorUpload: 'Unggahan gagal',
      deleteConfirm: 'Apakah Anda yakin? Tindakan ini permanen.',
      loadingProfile: 'Memuat profil Amora Anda…',
      userNotFound: 'Pengguna tidak ditemukan', retry: 'Coba lagi',
      locationNotSet: 'Lokasi belum diatur',
      changePhotoAria: 'Ubah foto profil',
      followers: 'Pengikut', following: 'Mengikuti', xpWord: 'XP', levelWord: 'Level',
      editProfile: 'Edit profil', settings: 'Pengaturan', security: '🛡️ Keamanan',
      profileStudio: 'STUDIO PROFIL', editYourProfile: 'Edit profil Anda',
      displayNameLabel: 'Nama tampilan', bioLabel: 'Bio', relationshipIntentLabel: 'Niat hubungan', interestsLabel: 'Minat', languagesLabel: 'Bahasa',
      saveChanges: 'Simpan perubahan', cancel: 'Batal',
      aboutKicker: 'TENTANG', personalSpace: 'Ruang pribadi',
      noBioYet: 'Belum ada bio. Tambahkan sesuatu yang menunjukkan siapa Anda.',
      locationDetail: 'Lokasi', intentDetail: 'Niat', notSet: 'Belum diatur', memberSinceDetail: 'Anggota sejak', membershipDetail: 'Keanggotaan',
      amoraStatusKicker: 'STATUS AMORA', levelProgress: 'Progres level',
      viewLevelRewards: 'Lihat hadiah level →',
      identityKicker: 'IDENTITAS', interestsAndBadges: 'Minat & lencana',
      blockListPrefix: '🚫 Daftar blokir',
      deleteAccount: 'Hapus akun',
      blockedUsersTitle: 'Pengguna yang diblokir', noBlockedUsers: 'Tidak ada pengguna yang diblokir.', unknownUserFallback: 'pengguna', unblock: 'Buka blokir'
    }
  }
};

function getByPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('amora_lang') : null;
    if (stored && translations[stored]) setLangState(stored);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
  }, [lang]);

  const setLang = (next) => {
    if (!translations[next]) return;
    setLangState(next);
    if (typeof window !== 'undefined') localStorage.setItem('amora_lang', next);
  };

  const t = useMemo(() => (key) => {
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
  if (!ctx) throw new Error('useTranslation must be used within a LanguageProvider');
  return ctx;
}
