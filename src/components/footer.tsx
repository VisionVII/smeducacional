'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';

export function Footer() {
  const { t, mounted } = useTranslations();
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [accessAt, setAccessAt] = useState('');

  useEffect(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setAccessAt(
      now.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }, []);

  if (!mounted) return null;

  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Grid Principal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Sobre */}
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">
              {t.footer.aboutTitle}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-4 leading-relaxed">
              {t.footer.aboutText}
            </p>
            <div className="flex gap-3 justify-center sm:justify-start">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-2 hover:bg-accent rounded-md"
                aria-label="Facebook"
                suppressHydrationWarning
              >
                <Facebook className="h-4 w-4 md:h-5 md:w-5" />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-2 hover:bg-accent rounded-md"
                aria-label="Instagram"
                suppressHydrationWarning
              >
                <Instagram className="h-4 w-4 md:h-5 md:w-5" />
              </Link>
              <Link
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-2 hover:bg-accent rounded-md"
                aria-label="LinkedIn"
                suppressHydrationWarning
              >
                <Linkedin className="h-4 w-4 md:h-5 md:w-5" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-2 hover:bg-accent rounded-md"
                aria-label="Twitter"
                suppressHydrationWarning
              >
                <Twitter className="h-4 w-4 md:h-5 md:w-5" />
              </Link>
              <Link
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-2 hover:bg-accent rounded-md"
                aria-label="YouTube"
                suppressHydrationWarning
              >
                <Youtube className="h-4 w-4 md:h-5 md:w-5" />
              </Link>
            </div>
          </div>

          {/* Links Rápidos */}
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">
              {t.footer.quickLinks}
            </h3>
            <ul className="space-y-2 text-xs md:text-sm">
              <li>
                <Link
                  href="/courses"
                  className="text-muted-foreground hover:text-primary transition-colors inline-block py-1"
                  suppressHydrationWarning
                >
                  {t.footer.courseCatalog}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-colors inline-block py-1"
                  suppressHydrationWarning
                >
                  {t.footer.aboutUs}
                </Link>
              </li>
              <li>
                <Link
                  href="/become-instructor"
                  className="text-muted-foreground hover:text-primary transition-colors inline-block py-1"
                  suppressHydrationWarning
                >
                  {t.footer.becomeInstructor}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-primary transition-colors inline-block py-1"
                  suppressHydrationWarning
                >
                  {t.footer.faq}
                </Link>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">
              {t.footer.support}
            </h3>
            <ul className="space-y-2 text-xs md:text-sm">
              <li>
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-primary transition-colors inline-block py-1"
                  suppressHydrationWarning
                >
                  {t.footer.helpCenter}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors inline-block py-1"
                  suppressHydrationWarning
                >
                  {t.footer.contact}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary transition-colors inline-block py-1"
                  suppressHydrationWarning
                >
                  {t.footer.termsOfUse}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors inline-block py-1"
                  suppressHydrationWarning
                >
                  {t.footer.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-muted-foreground hover:text-primary transition-colors inline-block py-1"
                  suppressHydrationWarning
                >
                  {t.footer.cookiePolicy}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">
              {t.footer.contactTitle}
            </h3>
            <ul className="space-y-3 text-xs md:text-sm">
              <li className="flex items-start gap-2 justify-center sm:justify-start">
                <Mail className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <a
                  href="mailto:contato@smeducacional.com.br"
                  className="text-muted-foreground hover:text-primary transition-colors break-all"
                  suppressHydrationWarning
                >
                  contato@smeducacional.com.br
                </a>
              </li>
              <li className="flex items-start gap-2 justify-center sm:justify-start">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <a
                  href="tel:+5511999999999"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  suppressHydrationWarning
                >
                  (11) 99999-9999
                </a>
              </li>
              <li className="flex items-start gap-2 justify-center sm:justify-start">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">
                  São Paulo, SP
                  <br />
                  Brasil
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
            <div className="text-center md:text-left">
              <p>
                <span suppressHydrationWarning>
                  {t.footer.rights.replace('{year}', String(currentYear ?? ''))}
                </span>
                <br />
                <span suppressHydrationWarning>
                  {accessAt
                    ? t.footer.accessAt.replace('{datetime}', accessAt)
                    : ''}
                </span>
              </p>
              <p className="mt-1 text-[11px] text-red-600 font-semibold">
                {t.footer.securityWarning}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              <Link
                href="/terms"
                className="hover:text-primary transition-colors"
                suppressHydrationWarning
              >
                {t.footer.terms}
              </Link>
              <Link
                href="/privacy"
                className="hover:text-primary transition-colors"
                suppressHydrationWarning
              >
                {t.footer.privacy}
              </Link>
              <Link
                href="/lgpd"
                className="hover:text-primary transition-colors"
                suppressHydrationWarning
              >
                {t.footer.lgpd}
              </Link>
              <Link
                href="/cookies"
                className="hover:text-primary transition-colors"
                suppressHydrationWarning
              >
                {t.footer.cookies}
              </Link>
            </div>
          </div>
        </div>

        {/* Developer Signature */}
        <div className="border-t mt-6 pt-4 text-center text-[10px] text-muted-foreground/60">
          <p>{t.footer.developedBy}</p>
          <p className="mt-1">
            <strong>{t.footer.developerPrincipal}:</strong> Victor Hugo |{' '}
            <a
              href="mailto:visionvidevgri@proton.me"
              className="hover:text-primary"
              suppressHydrationWarning
            >
              visionvidevgri@proton.me
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
