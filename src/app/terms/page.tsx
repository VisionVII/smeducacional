import { Card } from "@/components/ui/card";
import { PublicNavbar } from "@/components/public-navbar";
import { Footer } from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1">
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Termos de Uso
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
            <h2>1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar a plataforma SM Educacional, você concorda em
              cumprir e estar vinculado aos seguintes termos e condições de uso.
            </p>

            <h2>2. Descrição do Serviço</h2>
            <p>
              A SM Educacional oferece uma plataforma de ensino online onde
              usuários podem:
            </p>
            <ul>
              <li>Matricular-se em cursos online</li>
              <li>Acessar conteúdo educacional</li>
              <li>Interagir com professores e outros alunos</li>
              <li>Obter certificados de conclusão</li>
            </ul>

            <h2>3. Cadastro e Conta</h2>
            <p>
              Para acessar determinados recursos, você deve criar uma conta. Você
              concorda em:
            </p>
            <ul>
              <li>Fornecer informações precisas e completas</li>
              <li>Manter suas credenciais de login seguras</li>
              <li>Notificar imediatamente sobre uso não autorizado</li>
              <li>Ser responsável por todas as atividades em sua conta</li>
            </ul>

            <h2>4. Uso Aceitável</h2>
            <p>Você concorda em NÃO:</p>
            <ul>
              <li>Compartilhar sua conta com terceiros</li>
              <li>Distribuir ou revender o conteúdo dos cursos</li>
              <li>Usar a plataforma para fins ilegais</li>
              <li>Fazer engenharia reversa ou copiar a plataforma</li>
              <li>Enviar spam ou conteúdo malicioso</li>
            </ul>

            <h2>5. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo da plataforma, incluindo textos, vídeos, imagens e
              materiais didáticos, é protegido por direitos autorais e pertence à
              SM Educacional ou seus licenciadores.
            </p>

            <h2>6. Pagamentos e Reembolsos</h2>
            <p>
              Os cursos pagos são cobrados conforme descrito no momento da
              compra. Nossa política de reembolso permite:
            </p>
            <ul>
              <li>Cancelamento em até 7 dias após a compra</li>
              <li>Reembolso integral se menos de 20% do curso foi acessado</li>
              <li>Análise caso a caso para situações especiais</li>
            </ul>

            <h2>7. Certificados</h2>
            <p>
              Certificados são emitidos mediante conclusão de 100% do curso e
              aprovação nas atividades avaliativas, quando aplicável.
            </p>

            <h2>8. Modificações</h2>
            <p>
              Reservamo-nos o direito de modificar ou descontinuar a plataforma
              ou qualquer curso a qualquer momento, com ou sem aviso prévio.
            </p>

            <h2>9. Limitação de Responsabilidade</h2>
            <p>
              A SM Educacional não será responsável por quaisquer danos diretos,
              indiretos, incidentais ou consequenciais resultantes do uso ou
              incapacidade de usar a plataforma.
            </p>

            <h2>10. Lei Aplicável</h2>
            <p>
              Estes termos são regidos pelas leis da República Federativa do
              Brasil. Quaisquer disputas serão resolvidas nos tribunais de São
              Paulo, SP.
            </p>

            <h2>11. Contato</h2>
            <p>
              Para questões sobre estes termos, entre em contato através de:
              <br />
              E-mail: juridico@smeducacional.com
            </p>
          </div>
        </Card>
      </section>
      </main>
      
      <Footer />
    </div>
  );
}
