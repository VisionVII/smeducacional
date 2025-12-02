import { Card } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Política de Privacidade
            </h1>
            <p className="text-xl opacity-90">
              Última atualização: 2 de dezembro de 2025
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        <Card className="max-w-4xl mx-auto p-8 md:p-12">
          <div className="prose max-w-none">
            <h2>1. Introdução</h2>
            <p>
              A SM Educacional ("nós", "nosso" ou "nos") está comprometida em
              proteger sua privacidade. Esta Política de Privacidade explica como
              coletamos, usamos, divulgamos e protegemos suas informações pessoais.
            </p>

            <h2>2. Informações que Coletamos</h2>
            <h3>2.1 Informações Fornecidas por Você</h3>
            <ul>
              <li>Nome completo e e-mail</li>
              <li>Senha (armazenada de forma criptografada)</li>
              <li>Foto de perfil (opcional)</li>
              <li>Informações de pagamento (processadas por terceiros)</li>
            </ul>

            <h3>2.2 Informações Coletadas Automaticamente</h3>
            <ul>
              <li>Endereço IP e localização aproximada</li>
              <li>Tipo de navegador e dispositivo</li>
              <li>Páginas visitadas e tempo de permanência</li>
              <li>Progresso nos cursos e atividades realizadas</li>
            </ul>

            <h2>3. Como Usamos suas Informações</h2>
            <p>Utilizamos suas informações para:</p>
            <ul>
              <li>Fornecer acesso à plataforma e aos cursos</li>
              <li>Processar pagamentos e emitir certificados</li>
              <li>Enviar comunicações importantes sobre sua conta</li>
              <li>Melhorar nossos serviços e desenvolver novos recursos</li>
              <li>Personalizar sua experiência de aprendizado</li>
              <li>Prevenir fraudes e garantir segurança</li>
            </ul>

            <h2>4. Compartilhamento de Informações</h2>
            <p>Podemos compartilhar suas informações com:</p>
            <ul>
              <li>
                <strong>Professores:</strong> Seu nome e progresso nos cursos que
                você está matriculado
              </li>
              <li>
                <strong>Processadores de Pagamento:</strong> Informações
                necessárias para processar transações
              </li>
              <li>
                <strong>Provedores de Serviços:</strong> Empresas que nos ajudam
                a operar a plataforma
              </li>
              <li>
                <strong>Autoridades Legais:</strong> Quando exigido por lei ou
                para proteger direitos
              </li>
            </ul>

            <h2>5. Cookies e Tecnologias Similares</h2>
            <p>
              Usamos cookies e tecnologias similares para melhorar sua
              experiência. Você pode controlar cookies através das configurações
              do seu navegador.
            </p>

            <h2>6. Segurança dos Dados</h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para
              proteger suas informações, incluindo:
            </p>
            <ul>
              <li>Criptografia de dados sensíveis</li>
              <li>Acesso restrito a informações pessoais</li>
              <li>Monitoramento regular de vulnerabilidades</li>
              <li>Backups regulares</li>
            </ul>

            <h2>7. Seus Direitos</h2>
            <p>
              Você tem direito a:
            </p>
            <ul>
              <li>Acessar suas informações pessoais</li>
              <li>Corrigir dados incorretos ou incompletos</li>
              <li>Solicitar exclusão de sua conta e dados</li>
              <li>Opor-se ao processamento de seus dados</li>
              <li>Exportar seus dados em formato legível</li>
            </ul>

            <h2>8. Retenção de Dados</h2>
            <p>
              Mantemos suas informações pelo tempo necessário para fornecer nossos
              serviços e cumprir obrigações legais. Após a exclusão da conta,
              alguns dados podem ser mantidos por até 5 anos para fins contábeis
              e legais.
            </p>

            <h2>9. Dados de Menores</h2>
            <p>
              Nossa plataforma não é direcionada a menores de 18 anos. Se você é
              responsável legal e acredita que seu filho nos forneceu informações,
              entre em contato conosco.
            </p>

            <h2>10. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente.
              Notificaremos você sobre mudanças significativas através do e-mail
              cadastrado.
            </p>

            <h2>11. Contato</h2>
            <p>
              Para questões sobre privacidade ou exercer seus direitos, entre em
              contato:
            </p>
            <ul>
              <li>E-mail: privacidade@smeducacional.com</li>
              <li>Telefone: (11) 1234-5678</li>
            </ul>

            <h2>12. LGPD - Lei Geral de Proteção de Dados</h2>
            <p>
              Esta Política está em conformidade com a Lei nº 13.709/2018 (LGPD).
              Nosso DPO (Encarregado de Proteção de Dados) pode ser contatado em:
              dpo@smeducacional.com
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
