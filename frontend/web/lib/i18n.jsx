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
