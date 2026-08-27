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
