/**
 * Templates pré-definidos para páginas públicas
 * Cada template tem uma estrutura inicial pronta para edição
 */

import { Block } from '@/components/ui/BlockEditor';

export interface PageTemplate {
  slug: string;
  title: string;
  description: string;
  blocks: Block[];
  meta: {
    category: 'institutional' | 'marketing' | 'custom';
    icon: string;
    previewDescription: string;
  };
}

/**
 * Template para Home Page
 * Banner hero + seções de benefícios + CTA
 */
export const homeTemplate: PageTemplate = {
  slug: 'home',
  title: 'Bem-vindo ao SM Educa',
  description: 'Aprenda no seu ritmo, conquiste seus objetivos',
  meta: {
    category: 'marketing',
    icon: '🏠',
    previewDescription: 'Página inicial com hero banner e seções de destaque',
  },
  blocks: [
    {
      id: 'hero-section',
      type: 'section',
      title: 'Hero Banner',
      blocks: [
        {
          id: 'hero-image',
          type: 'image',
          src: '',
          alt: 'Banner principal',
        },
        {
          id: 'hero-title',
          type: 'text',
          value:
            '# Aprenda no seu ritmo, conquiste seus objetivos\n\nPlataforma completa de ensino com cursos, certificados e acompanhamento personalizado.',
        },
        {
          id: 'hero-cta',
          type: 'button',
          label: 'Explorar Cursos',
          url: '/courses',
          variant: 'default',
        },
      ],
    },
    {
      id: 'benefits-section',
      type: 'section',
      title: 'Benefícios',
      blocks: [
        {
          id: 'benefits-title',
          type: 'text',
          value: '## Por que escolher o SM Educa?',
        },
        {
          id: 'benefits-list',
          type: 'list',
          items: [
            '📚 Cursos certificados',
            '⏰ Aprenda no seu ritmo',
            '👨‍🏫 Professores qualificados',
            '📱 Acesse de qualquer dispositivo',
          ],
          ordered: false,
        },
      ],
    },
    {
      id: 'cta-section',
      type: 'section',
      title: 'Chamada para Ação',
      blocks: [
        {
          id: 'cta-text',
          type: 'text',
          value:
            '## Comece agora mesmo\n\nJunte-se a milhares de alunos que já transformaram suas carreiras.',
        },
        {
          id: 'cta-button',
          type: 'button',
          label: 'Criar Conta Gratuita',
          url: '/register',
          variant: 'default',
        },
      ],
    },
  ],
};

/**
 * Template para About Page
 * Sobre a empresa/escola
 */
export const aboutTemplate: PageTemplate = {
  slug: 'about',
  title: 'Sobre Nós',
  description: 'Conheça nossa história e missão',
  meta: {
    category: 'institutional',
    icon: '👥',
    previewDescription: 'Página institucional sobre a empresa',
  },
  blocks: [
    {
      id: 'about-hero',
      type: 'section',
      title: 'Apresentação',
      blocks: [
        {
          id: 'about-image',
          type: 'image',
          src: '',
          alt: 'Sobre nós',
        },
        {
          id: 'about-intro',
          type: 'text',
          value:
            '# Sobre o SM Educa\n\nSomos uma plataforma educacional comprometida com a transformação através do conhecimento.',
        },
      ],
    },
    {
      id: 'mission-section',
      type: 'section',
      title: 'Missão e Valores',
      blocks: [
        {
          id: 'mission-title',
          type: 'text',
          value: '## Nossa Missão',
        },
        {
          id: 'mission-text',
          type: 'text',
          value:
            'Democratizar o acesso à educação de qualidade através da tecnologia.',
        },
        {
          id: 'values-title',
          type: 'text',
          value: '## Nossos Valores',
        },
        {
          id: 'values-list',
          type: 'list',
          items: [
            'Excelência no ensino',
            'Inovação constante',
            'Inclusão e acessibilidade',
            'Compromisso com resultados',
          ],
          ordered: false,
        },
      ],
    },
  ],
};

/**
 * Template para Contact Page
 * Formulário e informações de contato
 */
export const contactTemplate: PageTemplate = {
  slug: 'contact',
  title: 'Contato',
  description: 'Entre em contato conosco',
  meta: {
    category: 'institutional',
    icon: '📧',
    previewDescription: 'Página de contato com informações',
  },
  blocks: [
    {
      id: 'contact-intro',
      type: 'text',
      value:
        '# Entre em Contato\n\nEstamos prontos para ajudar você. Escolha o canal de sua preferência.',
    },
    {
      id: 'contact-info',
      type: 'section',
      title: 'Informações de Contato',
      blocks: [
        {
          id: 'contact-list',
          type: 'list',
          items: [
            '📧 Email: contato@smeducacional.com',
            '📱 WhatsApp: (11) 99999-9999',
            '🕐 Horário: Segunda a Sexta, 8h às 18h',
          ],
          ordered: false,
        },
        {
          id: 'contact-cta',
          type: 'button',
          label: 'Enviar Mensagem',
          url: '/contact',
          variant: 'default',
        },
      ],
    },
  ],
};

/**
 * Template para FAQ Page
 * Perguntas frequentes
 */
export const faqTemplate: PageTemplate = {
  slug: 'faq',
  title: 'Perguntas Frequentes',
  description: 'Tire suas dúvidas',
  meta: {
    category: 'institutional',
    icon: '❓',
    previewDescription: 'Página de perguntas e respostas',
  },
  blocks: [
    {
      id: 'faq-intro',
      type: 'text',
      value:
        '# Perguntas Frequentes\n\nEncontre respostas para as dúvidas mais comuns.',
    },
    {
      id: 'faq-section-1',
      type: 'section',
      title: 'Sobre os Cursos',
      blocks: [
        {
          id: 'faq-q1',
          type: 'text',
          value:
            '### Como me inscrever em um curso?\n\nClique no curso desejado e depois em "Matricular-se".',
        },
        {
          id: 'faq-q2',
          type: 'text',
          value:
            '### Os certificados são reconhecidos?\n\nSim, todos os nossos certificados são válidos e reconhecidos.',
        },
      ],
    },
  ],
};

/**
 * Template em branco
 * Página vazia para personalização total
 */
export const blankTemplate: PageTemplate = {
  slug: 'new-page',
  title: 'Nova Página',
  description: 'Descrição da página',
  meta: {
    category: 'custom',
    icon: '📄',
    previewDescription: 'Página em branco para personalização',
  },
  blocks: [
    {
      id: 'default-text',
      type: 'text',
      value: '# Título da Página\n\nComece a criar seu conteúdo aqui.',
    },
  ],
};

/**
 * Todos os templates disponíveis
 */
export const PAGE_TEMPLATES: Record<string, PageTemplate> = {
  home: homeTemplate,
  about: aboutTemplate,
  contact: contactTemplate,
  faq: faqTemplate,
  blank: blankTemplate,
};

/**
 * Obter template por slug
 */
export function getTemplateBySlug(slug: string): PageTemplate {
  return PAGE_TEMPLATES[slug] || blankTemplate;
}

/**
 * Lista de templates para seleção
 */
export const TEMPLATE_LIST = [
  homeTemplate,
  aboutTemplate,
  contactTemplate,
  faqTemplate,
  blankTemplate,
];
