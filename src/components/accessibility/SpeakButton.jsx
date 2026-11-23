import { Headphones, Square } from 'lucide-react';
import { useA11y } from '../../context/AccessibilityContext';
import { cn } from '../../utils/helpers';

export default function SpeakButton({ text, label = 'Listen to this section', className, variant = 'ghost', compact }) {
  const { speak, stop, speaking, speechSupported } = useA11y();
  if (!speechSupported) return null;

  const handle = (e) => {
    e?.stopPropagation?.();
    if (speaking) stop();
    else speak(text);
  };

  return (
    <button
      type="button" onClick={handle}
      aria-pressed={speaking}
      className={cn(
        variant === 'solid' ? 'btn-secondary text-xs px-3 py-1.5' : 'btn-ghost text-xs px-2.5 py-1.5',
        'gap-1.5 text-navy-700 dark:text-brand-300 border border-transparent hover:border-navy-200 dark:hover:border-white/15',
        className
      )}
      title={speaking ? 'Stop reading' : label}
    >
      {speaking ? <Square className="h-3.5 w-3.5" aria-hidden="true" /> : <Headphones className="h-3.5 w-3.5" aria-hidden="true" />}
      <span>{speaking ? 'Stop' : compact ? 'Listen' : 'Read aloud'}</span>
      <span className="sr-only">{speaking ? 'Stop reading aloud' : label}</span>
    </button>
  );
}
