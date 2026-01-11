/**
 * DEBUG: Unblock página que está travada
 *
 * Se a página está com z-index ou pointer-events bloqueado:
 * 1. Cole isso no console do navegador:
 *
 *   document.querySelectorAll('[style*="z-index"]').forEach(el => {
 *     el.style.display = 'none';
 *     console.log('Hidden:', el);
 *   });
 *   document.body.style.overflow = 'auto';
 *   document.body.style.pointerEvents = 'auto';
 *
 * 2. Se ainda tiver problema com Sheet, execute:
 *
 *   document.querySelectorAll('[data-state="open"]').forEach(el => {
 *     el.parentElement?.removeChild(el);
 *   });
 *
 * 3. Limpe localStorage e cookies:
 *   localStorage.clear();
 *   sessionStorage.clear();
 */

export async function GET() {
  return Response.json(
    {
      message:
        'Paste the console commands above in your browser DevTools Console',
      instructions: {
        step1: 'Open DevTools (F12 or Ctrl+Shift+I)',
        step2: 'Go to Console tab',
        step3: 'Paste the blocking element removal code',
        step4: 'Press Enter',
      },
    },
    { status: 200 }
  );
}
