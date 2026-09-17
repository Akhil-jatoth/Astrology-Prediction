import { AI_DISCLAIMER } from '@/lib/constants';

export function AiDisclaimer({ className = '' }: { className?: string }) {
  return (
    <p className={`ai-disclaimer ${className}`} role="note">
      {AI_DISCLAIMER}
    </p>
  );
}
