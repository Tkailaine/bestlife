import { useEffect, useState } from 'react';

// Anima um número de 0 até o valor final (efeito de contagem nos indicadores)
export function useCountUp(valorFinal: number, duracaoMs = 900): number {
  const [valor, setValor] = useState(0);

  useEffect(() => {
    const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduzirMovimento) {
      setValor(valorFinal);
      return;
    }

    let frame = 0;
    const inicio = performance.now();

    const passo = (agora: number) => {
      const progresso = Math.min((agora - inicio) / duracaoMs, 1);
      const suavizado = 1 - Math.pow(1 - progresso, 3); // ease-out
      setValor(Math.round(valorFinal * suavizado));
      if (progresso < 1) frame = requestAnimationFrame(passo);
    };

    frame = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(frame);
  }, [valorFinal, duracaoMs]);

  return valor;
}

