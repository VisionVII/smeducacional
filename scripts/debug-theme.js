// Script de Debug - Verificar se TeacherThemeProvider está funcionando
// Colocar isso no console do navegador enquanto está em /teacher/theme ou /teacher/dashboard

console.log('=== DEBUG THEME SYSTEM ===\n');

// 1. Verificar se CSS variables estão sendo injetadas
const root = document.documentElement;
const primaryColor = getComputedStyle(root).getPropertyValue('--primary').trim();
const transitionDuration = getComputedStyle(root).getPropertyValue('--transition-duration').trim();

console.log('📊 CSS Variables Injetadas:');
console.log(`   --primary: ${primaryColor || 'NÃO INJETADA'}`);
console.log(`   --transition-duration: ${transitionDuration || 'NÃO INJETADA'}`);

// 2. Verificar se classe animations-enabled está presente
const hasAnimationsEnabled = root.classList.contains('animations-enabled');
console.log(`\n🎬 Animações Habilitadas: ${hasAnimationsEnabled ? 'SIM' : 'NÃO'}`);

// 3. Tentar fazer uma requisição para a API de tema
console.log('\n🔗 Testando API /api/teacher/theme:');
fetch('/api/teacher/theme')
  .then(res => res.json())
  .then(data => {
    console.log('   Resposta da API:', data);
    console.log(`   Primary color: ${data.palette?.primary || 'UNDEFINED'}`);
  })
  .catch(err => console.log('   ERRO:', err.message));

// 4. Verificar elementos com transition-theme
const elementsWithTransition = document.querySelectorAll('.transition-theme');
console.log(`\n✨ Elementos com .transition-theme: ${elementsWithTransition.length}`);

// 5. Verificar Tailwind colors
console.log('\n🎨 Testando cores Tailwind:');
const testElement = document.createElement('div');
testElement.className = 'text-primary';
document.body.appendChild(testElement);
const textColor = getComputedStyle(testElement).color;
testElement.remove();
console.log(`   text-primary computa para: ${textColor}`);
