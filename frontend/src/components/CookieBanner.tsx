'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cookie } from 'lucide-react';
import Link from 'next/link';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-4xl mx-auto bg-midnight-900 border border-midnight-700 rounded-2xl shadow-2xl p-4 md:p-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 bg-amora-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-amora-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">We use cookies</h4>
                <p className="text-xs text-midnight-400 mt-1 max-w-xl">
                  We use cookies to enhance your experience, personalise content, and analyse traffic. 
                  By clicking "Accept", you consent to our use of cookies. 
                  <Link href="/privacy" className="text-amora-400 hover:underline ml-1">
                    Read our Privacy Policy
                  </Link>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={declineCookies}
                className="px-4 py-2 text-sm text-midnight-300 hover:text-white transition-colors"
              >
                Decline
              </button>
              <button
                onClick={acceptCookies}
                className="amora-button text-sm py-2 px-4"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
