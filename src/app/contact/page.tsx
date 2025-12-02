import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Entre em Contato
            </h1>
            <p className="text-xl opacity-90">
              Estamos aqui para ajudar. Envie sua mensagem e retornaremos em breve.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Envie sua Mensagem</h2>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Assunto</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Como podemos ajudar?"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Mensagem</Label>
                  <textarea
                    id="message"
                    className="w-full min-h-[150px] px-3 py-2 border rounded-md"
                    placeholder="Descreva sua dúvida ou sugestão..."
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Enviar Mensagem
                </Button>
              </form>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-bold mb-1">E-mail</h3>
                    <p className="text-gray-600">contato@smeducacional.com</p>
                    <p className="text-gray-600">suporte@smeducacional.com</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-bold mb-1">Telefone</h3>
                    <p className="text-gray-600">(11) 1234-5678</p>
                    <p className="text-gray-600">Seg-Sex: 9h às 18h</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-bold mb-1">Endereço</h3>
                    <p className="text-gray-600">
                      Rua Exemplo, 123 - Sala 45
                      <br />
                      São Paulo - SP
                      <br />
                      CEP: 01234-567
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-blue-50">
                <h3 className="font-bold mb-2">Perguntas Frequentes</h3>
                <p className="text-gray-600 mb-4">
                  Antes de entrar em contato, confira nossa página de FAQ. Muitas
                  dúvidas já estão respondidas lá!
                </p>
                <Button variant="outline" className="w-full">
                  Ver FAQ
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
