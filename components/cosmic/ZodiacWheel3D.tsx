import dynamic from 'next/dynamic';

const ZodiacWheel3DClient = dynamic(
  () => import('./ZodiacWheel3DClient').then((mod) => mod.ZodiacWheel3D),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto h-72 w-full max-w-md md:h-96">
        <div className="h-full w-full rounded-3xl bg-secondary/15" aria-hidden="true" />
      </div>
    ),
  }
);

type ZodiacWheel3DProps = {
  interactive?: boolean;
  onSelectSign?: (sign: string) => void;
  selectedSign?: string | null;
  className?: string;
};

export function ZodiacWheel3D({
  interactive,
  onSelectSign,
  selectedSign,
  className,
}: ZodiacWheel3DProps) {
  return (
    <div className={className || "mx-auto h-72 w-full max-w-md md:h-96"} role="img" aria-label="3D zodiac wheel">
      <ZodiacWheel3DClient
        interactive={interactive}
        onSelectSign={onSelectSign}
        selectedSign={selectedSign}
      />
    </div>
  );
}
