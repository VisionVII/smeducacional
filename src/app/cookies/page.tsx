import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Cookies | VisionVII',
  description: 'Como usamos cookies na nossa plataforma',
};

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Política de Cookies</h1>

      <div className="prose dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">O que são cookies?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Cookies são pequenos arquivos de texto que são armazenados no seu
            dispositivo quando você visita um site. Eles são amplamente
            utilizados para fazer os sites funcionarem de forma mais eficiente e
            fornecer informações aos proprietários do site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Como usamos cookies</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            A VisionVII utiliza cookies para diversos propósitos:
          </p>

          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg font-semibold mb-2">Cookies Essenciais</h3>
              <p className="text-muted-foreground">
                Necessários para o funcionamento básico da plataforma, incluindo
                autenticação de usuários e segurança. Estes cookies não podem
                ser desativados.
              </p>
              <ul className="list-disc list-inside mt-2 text-muted-foreground">
                <li>next-auth.session-token: Mantém você conectado</li>
                <li>
                  __Secure-next-auth.session-token: Versão segura do cookie de
                  sessão (HTTPS)
                </li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-semibold mb-2">
                Cookies de Funcionalidade
              </h3>
              <p className="text-muted-foreground">
                Permitem que a plataforma lembre de suas escolhas e
                preferências:
              </p>
              <ul className="list-disc list-inside mt-2 text-muted-foreground">
                <li>Preferências de tema (claro/escuro)</li>
                <li>Configurações de idioma</li>
                <li>Progresso em vídeos</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-lg font-semibold mb-2">
                Cookies de Desempenho
              </h3>
              <p className="text-muted-foreground">
                Coletam informações sobre como você usa a plataforma para nos
                ajudar a melhorá-la:
              </p>
              <ul className="list-disc list-inside mt-2 text-muted-foreground">
                <li>Páginas mais visitadas</li>
                <li>Tempo gasto em aulas</li>
                <li>Taxa de conclusão de cursos</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Cookies de terceiros</h2>
          <p className="text-muted-foreground leading-relaxed">
            Podemos usar serviços de terceiros que também definem cookies:
          </p>
          <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-2">
            <li>
              <strong>Google Analytics:</strong> Para análise de tráfego e
              comportamento
            </li>
            <li>
              <strong>YouTube/Vimeo:</strong> Para reprodução de vídeos
              incorporados
            </li>
            <li>
              <strong>Stripe:</strong> Para processamento seguro de pagamentos
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Gerenciar cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            Você pode controlar e gerenciar cookies através das configurações do
            seu navegador. No entanto, desativar cookies essenciais pode afetar
            a funcionalidade da plataforma e impedir que você acesse certas
            áreas.
          </p>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <h3 className="font-semibold mb-2">Como desativar cookies:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>
                <strong>Chrome:</strong> Configurações → Privacidade e segurança
                → Cookies
              </li>
              <li>
                <strong>Firefox:</strong> Opções → Privacidade e Segurança →
                Cookies
              </li>
              <li>
                <strong>Safari:</strong> Preferências → Privacidade → Cookies
              </li>
              <li>
                <strong>Edge:</strong> Configurações → Cookies e permissões de
                site
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Duração dos cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            Os cookies que usamos têm diferentes períodos de validade:
          </p>
          <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-2">
            <li>
              <strong>Cookies de sessão:</strong> Expiram quando você fecha o
              navegador
            </li>
            <li>
              <strong>Cookies persistentes:</strong> Permanecem por até 30 dias
              (autenticação)
            </li>
            <li>
              <strong>Cookies de preferência:</strong> Armazenados por até 1 ano
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Cookies de Publicidade e Anúncios
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Para oferecer cursos de qualidade com preços acessíveis, utilizamos
            anúncios estratégicos em contas de plano free. Estes cookies ajudam
            a personalizar sua experiência e medir a eficácia de campanhas.
          </p>
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="text-lg font-semibold mb-2">
              Cookies de Anúncios (Plano Free)
            </h3>
            <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-2">
              <li>
                <strong>ad_preference:</strong> Personaliza anúncios com base em
                seu comportamento
              </li>
              <li>
                <strong>ad_session:</strong> Acompanha sessão de visualização de
                anúncios
              </li>
              <li>
                <strong>ad_frequency:</strong> Controla frequência de exibição
                para evitar excesso
              </li>
              <li>
                <strong>ad_consent:</strong> Registra consentimento para
                publicidade personalizada
              </li>
            </ul>
            <p className="text-sm text-muted-foreground mt-3">
              <strong>Como desativar:</strong> Se você é professor com plano
              premium ou aluno premium, estes cookies não serão carregados.
              Alunos free podem desativar publicidade personalizada nas
              configurações da conta.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Sistema de Bloqueio de Anúncios para Premium
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Oferecemos a opção de plano premium para eliminar completamente os
            anúncios:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-950">
              <h4 className="font-semibold mb-2">📱 Plano Free</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Acesso a todos os cursos</li>
                <li>
                  ✗ <strong>Com anúncios</strong> antes/durante vídeos
                </li>
                <li>✗ Banners publicitários</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
              <h4 className="font-semibold mb-2">⭐ Plano Premium</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Acesso a todos os cursos</li>
                <li>
                  ✓ <strong>SEM anúncios</strong>
                </li>
                <li>✓ Certificados digitais</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Atualizações desta política
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Podemos atualizar esta Política de Cookies periodicamente.
            Recomendamos que você revise esta página regularmente para se manter
            informado sobre como usamos cookies.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Última atualização:{' '}
            {new Date().toLocaleDateString('pt-BR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </section>

        <section className="bg-primary/10 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Dúvidas?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Se você tiver alguma dúvida sobre como usamos cookies, entre em
            contato conosco:
          </p>
          <p className="mt-2">
            <a
              href="mailto:privacidade@visionvii.com"
              className="text-primary hover:underline"
            >
              privacidade@visionvii.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
