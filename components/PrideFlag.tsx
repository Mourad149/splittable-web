import Image from "next/image";

interface Props {
  size?: number;       // height in px; width follows the 3:2 aspect
  rounded?: number;    // corner radius
  className?: string;
}

/*
 * Inline Pride flag badge. Mirrors the SwiftUI Image("PrideFlag") —
 * fixed aspect ratio, subtle rounded corners so it reads as a chip
 * rather than a bare flag at small sizes.
 */
export default function PrideFlag({ size = 14, rounded = 3, className = "" }: Props) {
  const w = Math.round((size * 1248) / 832);
  return (
    <Image
      src="/prideflag.svg"
      alt="Pride flag"
      width={w}
      height={size}
      className={className}
      style={{ borderRadius: rounded, height: size, width: w }}
      priority={false}
    />
  );
}
