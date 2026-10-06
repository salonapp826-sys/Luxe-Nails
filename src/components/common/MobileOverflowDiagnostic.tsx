import { useEffect } from 'react';

export function MobileOverflowDiagnostic() {
  useEffect(() => {
    const checkOverflow = () => {
      const docWidth = document.documentElement.clientWidth;
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.right > docWidth + 1) {
          const selector = el.tagName.toLowerCase() + 
            (el.id ? '#' + el.id : '') + 
            (el.className ? '.' + Array.from(el.classList).slice(0, 3).join('.') : '');
          console.warn(`⚠️ Mobile Overflow Detected on element: ${selector}, Right position: ${rect.right}, Viewport width: ${docWidth}`);
          if (el instanceof HTMLElement) {
            el.style.maxWidth = '100vw';
            el.style.overflowX = 'hidden';
            el.style.width = '100%';
          }
        }
      });
    };

    const timer = setTimeout(checkOverflow, 1500);
    window.addEventListener('resize', checkOverflow);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkOverflow);
    };
  }, []);

  return null;
}

export default MobileOverflowDiagnostic;
