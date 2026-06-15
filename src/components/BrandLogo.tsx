import Image from "next/image";

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export function BrandLogo({ size = 28, className = "" }: BrandLogoProps) {
  return (
    <Image
      src="/enotools.png"
      alt="EnoTools logo"
      width={961}
      height={961}
      sizes={`${size}px`}
      className={`shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
      priority
    />
  );
}
