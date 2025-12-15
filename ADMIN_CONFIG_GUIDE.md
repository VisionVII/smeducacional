# 🎯 Guia Rápido: Configurar Logo e Identidade Visual

## Para o Administrador

### 1. Acessar Configurações

1. Faça login como **ADMIN**
2. No menu lateral, clique em **"Configurações"** (ícone de engrenagem)
3. Você verá 5 abas: **Empresa | Marca | Cores | SEO & Social | Sistema**

---

## 2. Configurar Logo da Empresa

### Tab "Marca"

#### Logo Principal:

- Campo: **"Logo Principal (URL)"**
- Cole a URL pública da sua logo (ex: `https://seusite.com/logo.png`)
- **Preview**: A logo aparecerá imediatamente abaixo do campo
- **Onde aparece**:
  - Menu do admin
  - Menu do professor
  - Menu do aluno
  - Menu das páginas públicas (landing, cursos, etc.)

#### Favicon:

- Campo: **"Favicon (URL)"**
- Cole a URL do ícone que aparece na aba do navegador
- Formato recomendado: `.ico`, `.png` (32x32 ou 16x16)

#### Background do Login:

- Campo: **"Imagem de Fundo do Login (URL)"**
- Cole a URL da imagem de fundo da tela de login
- Formato recomendado: JPG, PNG (1920x1080 ou maior)

> 💡 **Dica**: Use serviços como Supabase Storage, Cloudinary, ou ImgBB para hospedar suas imagens

---

## 3. Configurar Informações da Empresa

### Tab "Empresa"

Preencha os campos:

- ✅ **Nome da Empresa\*** (obrigatório): Ex: "SM Educacional"
- ✅ **Nome do Sistema\*** (obrigatório): Ex: "Plataforma SM"
- 📧 **E-mail**: Ex: "contato@smeducacional.com"
- 📞 **Telefone**: Ex: "(11) 1234-5678"
- 📍 **Endereço**: Endereço completo da instituição

---

## 4. Configurar Cores do Sistema

### Tab "Cores"

#### Cor Primária:

- Clique no **quadrado colorido** para abrir o seletor de cores
- OU digite o código hexadecimal (ex: `#3b82f6`)
- **Onde é usada**: Botões principais, links, destaques

#### Cor Secundária:

- Clique no **quadrado colorido** para abrir o seletor de cores
- OU digite o código hexadecimal (ex: `#8b5cf6`)
- **Onde é usada**: Elementos secundários, badges, ícones

> 📊 **Preview**: As cores aparecem em preview na parte inferior

---

## 5. Configurar SEO (Otimização para Busca)

### Tab "SEO & Social"

#### Meta Tags:

- **Meta Título**: Título que aparece no Google (máx. 60 caracteres)
- **Meta Descrição**: Descrição nos resultados de busca (máx. 160 caracteres)
- **Palavras-chave**: Palavras separadas por vírgula

#### Redes Sociais:

- Cole as URLs dos perfis oficiais da empresa:
  - 📘 Facebook
  - 📸 Instagram
  - 💼 LinkedIn
  - 🐦 Twitter/X
  - 🎥 YouTube

---

## 6. Configurações do Sistema

### Tab "Sistema"

#### Modo Manutenção:

- **Ativado**: Bloqueia acesso público ao site (apenas admin acessa)
- **Desativado**: Site funciona normalmente
- **Uso**: Manutenções programadas, atualizações críticas

#### Permitir Cadastro:

- **Ativado**: Novos usuários podem se cadastrar
- **Desativado**: Bloqueia registro de novos usuários
- **Uso**: Controlar crescimento da base de usuários

---

## 7. Salvar Alterações

1. Após preencher os campos desejados, clique em **"Salvar Alterações"** (canto superior direito ou inferior)
2. Aguarde a confirmação: ✅ **"Configurações atualizadas com sucesso"**
3. As mudanças são aplicadas **imediatamente** em todo o sistema

---

## 🎨 Onde as Configurações Aparecem?

### Logo do Sistema:

- ✅ Menu do Admin (canto superior esquerdo)
- ✅ Menu do Professor (canto superior esquerdo)
- ✅ Menu do Aluno (canto superior esquerdo)
- ✅ Landing page pública
- ✅ Página de cursos
- ✅ Todas as páginas públicas

### Cores do Sistema:

- ⚠️ **Apenas em páginas públicas** (landing, cursos, FAQ, etc.)
- ❌ **NÃO afetam** cores dos dashboards (cada usuário tem tema próprio)

### Nome da Empresa:

- ✅ Título da página (tab do navegador)
- ✅ Rodapé das páginas
- ✅ Emails transacionais
- ✅ Certificados (futuro)

---

## 📸 Como Fazer Upload de Logos?

### Opção 1: Supabase Storage (Recomendado)

1. Acesse o painel do Supabase
2. Vá em **Storage** → Bucket `images`
3. Faça upload da logo
4. Clique na imagem → **Get URL**
5. Cole a URL no campo de configuração

### Opção 2: Serviços Externos

- **ImgBB**: https://imgbb.com (grátis, sem cadastro)
- **Cloudinary**: https://cloudinary.com (grátis até 25GB)
- **Google Drive**: Gere link público da imagem

> ⚠️ **Importante**: A URL deve ser pública e acessível

---

## 🚨 Problemas Comuns

### Logo não aparece:

1. Verifique se a URL está correta
2. Teste a URL no navegador (deve abrir a imagem)
3. Certifique-se de que a URL é **HTTPS**
4. Limpe o cache do navegador (Ctrl + Shift + R)

### Cores não mudaram:

- Cores afetam apenas **páginas públicas**
- Dashboards usam **temas personalizados** de cada usuário
- Professor define seu próprio tema em "Tema do Professor"

### Não consigo salvar:

- Verifique se está logado como **ADMIN**
- Confira se os campos obrigatórios (\*) estão preenchidos
- Verifique se as URLs são válidas (começam com http:// ou https://)

---

## 🎯 Fluxo Recomendado (Primeira Configuração)

1. ✅ **Empresa**: Preencha nome e contato
2. ✅ **Marca**: Configure a logo principal
3. ✅ **Cores**: Ajuste as cores do site público
4. ✅ **SEO**: Configure meta tags para Google
5. ✅ **Social**: Adicione redes sociais
6. ✅ **Sistema**: Defina se permite cadastro

**Total**: ⏱️ ~10 minutos

---

## 📞 Suporte

Dúvidas sobre configuração? Entre em contato com a equipe **VisionVII**.

---

**Desenvolvido com excelência pela VisionVII** 🚀
