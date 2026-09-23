import {useEffect} from 'react';

// Motion is feedback for pointer interactions. Keyboard actions stay immediate.
export function useInputMethod() {
  useEffect(() => {
    const root = document.documentElement;
    const pointer = () => {root.dataset.inputMethod = 'pointer';};
    const keyboard = () => {root.dataset.inputMethod = 'keyboard';};
    keyboard();
    document.addEventListener('pointerdown', pointer, true);
    document.addEventListener('keydown', keyboard, true);
    return () => {
      document.removeEventListener('pointerdown', pointer, true);
      document.removeEventListener('keydown', keyboard, true);
      delete root.dataset.inputMethod;
    };
  }, []);
}
