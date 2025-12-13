/**
 * Gera uma senha forte e aleatória
 * @param length Tamanho da senha (padrão: 16)
 * @returns Senha gerada
 */
export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = uppercase + lowercase + numbers + symbols;

  // Garantir que tenha pelo menos 1 de cada tipo
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Preencher o resto aleatoriamente
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Embaralhar a senha para não ter padrão previsível
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Calcula a força da senha
 * @param password Senha a ser avaliada
 * @returns Objeto com score (0-4) e feedback
 */
export function calculatePasswordStrength(password: string): {
  score: number;
  feedback: string;
  color: string;
} {
  let score = 0;

  if (!password) {
    return { score: 0, feedback: 'Digite uma senha', color: 'text-gray-400' };
  }

  // Critérios de força
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++; // Maiúsculas e minúsculas
  if (/\d/.test(password)) score++; // Números
  if (/[^a-zA-Z0-9]/.test(password)) score++; // Símbolos

  // Penalizar padrões comuns
  if (/^[a-z]+$/.test(password) || /^[A-Z]+$/.test(password)) score--;
  if (/^[0-9]+$/.test(password)) score--;

  const feedbackMap = {
    0: { feedback: 'Muito fraca', color: 'text-red-600' },
    1: { feedback: 'Fraca', color: 'text-orange-500' },
    2: { feedback: 'Regular', color: 'text-yellow-500' },
    3: { feedback: 'Boa', color: 'text-blue-500' },
    4: { feedback: 'Forte', color: 'text-green-600' },
    5: { feedback: 'Muito forte', color: 'text-green-700' },
  };

  const result = feedbackMap[Math.min(score, 5) as keyof typeof feedbackMap];

  return {
    score: Math.min(score, 5),
    feedback: result.feedback,
    color: result.color,
  };
}
