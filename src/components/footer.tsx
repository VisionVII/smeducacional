'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
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

export function Footer() {
  const { data: session } = useSession();
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

  // Links que requerem autenticação
  const requiresAuth = (path: string) => {
    const protectedPaths = ['/student', '/teacher', '/admin'];
    return protectedPaths.some((p) => path.startsWith(p));
  };

  // Retorna link apropriado
  const getLink = (path: string) => {
    if (requiresAuth(path) && !session) {
      return '/login';
    }
    return path;
  };

  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Grid Principal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Sobre */}
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">
              SM Educacional
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-4 leading-relaxed">
              Plataforma completa de ensino online com cursos de qualidade para
              seu desenvolvimento profissional.
            </p>
            <div className="flex gap-3 justify-center sm:justify-start">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-2 hover:bg-accent rounded-md"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4 md:h-5 md:w-5" />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-2 hover:bg-accent rounded-md"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4 md:h-5 md:w-5" />
              </Link>
              <Link
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-2 hover:bg-accent rounded-md"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4 md:h-5 md:w-5" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-2 hover:bg-accent rounded-md"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4 md:h-5 md:w-5" />
              </Link>
              <Link
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-2 hover:bg-accent rounded-md"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4 md:h-5 md:w-5" />
              </Link>
            </div>
          </div>

          {/* Links Rápidos */}
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">
              Links Rápidos
            </h3>
            <ul className="space-y-2 text-xs md:text-sm">
              <li>
                <Link
                  href="/courses"
                  className="text-muted-foreground hover:text-primary transition-colors inline-block py-1"
                >
                  Catálogo de Cursos
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-colors inline-block py-1"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  href="/become-instructor"
                  className="text-muted-foreground hover:text-primary transition-colors inline-block py-1"
                >
                  Seja um Instrutor
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-primary transition-colors inline-block py-1"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">
              Suporte
            </h3>
            <ul className="space-y-2 text-xs md:text-sm">
              <li>
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-primary transition-colors inline-block py-1"
                >
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors inline-block py-1"
                >
                  Contato
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary transition-colors inline-block py-1"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors inline-block py-1"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-muted-foreground hover:text-primary transition-colors inline-block py-1"
                >
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">
              Contato
            </h3>
            <ul className="space-y-3 text-xs md:text-sm">
              <li className="flex items-start gap-2 justify-center sm:justify-start">
                <Mail className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <a
                  href="mailto:contato@smeducacional.com.br"
                  className="text-muted-foreground hover:text-primary transition-colors break-all"
                >
                  contato@smeducacional.com.br
                </a>
              </li>
              <li className="flex items-start gap-2 justify-center sm:justify-start">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <a
                  href="tel:+5511999999999"
                  className="text-muted-foreground hover:text-primary transition-colors"
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
                  © {currentYear ?? ''} VisionVII. Todos os direitos reservados.
                </span>
                <br />
                <span suppressHydrationWarning>
                  {accessAt ? `Acesso em: ${accessAt}` : ''}
                </span>
              </p>
              <p className="mt-1 text-[11px] text-red-600 font-semibold">
                Atenção: Para sua segurança, filtros avançados de proteção,
                autenticação e monitoramento estão ativos neste sistema.
                Qualquer tentativa de acesso não autorizado será registrada.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              <Link
                href="/terms"
                className="hover:text-primary transition-colors"
              >
                Termos
              </Link>
              <Link
                href="/privacy"
                className="hover:text-primary transition-colors"
              >
                Privacidade
              </Link>
              <Link
                href="/lgpd"
                className="hover:text-primary transition-colors"
              >
                LGPD
              </Link>
              <Link
                href="/cookies"
                className="hover:text-primary transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>

        {/* Developer Signature */}
        <div className="border-t mt-6 pt-4 text-center text-[10px] text-muted-foreground/60">
          <p>
            Desenvolvido com excelência pela <strong>VisionVII</strong> —
            Transformando educação através da tecnologia.
          </p>
          <p className="mt-1">
            <strong>Desenvolvedor Principal:</strong> Victor Hugo |{' '}
            <a
              href="mailto:visionvidevgri@proton.me"
              className="hover:text-primary"
            >
              visionvidevgri@proton.me
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
