// The Awesome Books Asia mark, drawn to the geometry the brand guide gives
// on its 100×100 grid: a 라피스 square with corner radius 23, two 페이퍼
// brackets of stroke 8.5 with round caps and joins — arms 27 long from the
// vertices at (28,28) and (72,72) — and a 커서 골드 cursor 7×26 with radius
// 3.5 centred on the canvas. The cursor is the only part that moves.
//
// This is a faithful rebuild from the specification, not the official file
// set the guide ships (logo.svg, reverse, stacked, mono, symbol …). When
// those land, swap this component's <svg> for them.

type Props = {
  /** Symbol height in px. Header uses 32 (guide: 28–36 on screen). */
  size?: number;
  /** Dark-background lockup: the wordmark switches to 페이퍼. */
  reverse?: boolean;
  /** Symbol alone, no wordmark — for favicons and tight spaces (min 16px). */
  symbolOnly?: boolean;
  className?: string;
};

export default function BrandLogo({
  size = 32,
  reverse = false,
  symbolOnly = false,
  className
}: Props) {
  // Guide lockup ratio, horizontal: symbol 1 : gap 0.24 : text height 0.42.
  // Righteous sits at roughly 0.72 cap height, so 0.42 of the symbol lands
  // at a font size of 0.58× — the two read as one block at any scale.
  const style = {
    '--bl-size': `${size}px`,
    '--bl-gap': `${size * 0.24}px`,
    '--bl-text': `${size * 0.58}px`
  } as React.CSSProperties;

  return (
    <span
      className={['bl', reverse ? 'bl-rev' : '', className].filter(Boolean).join(' ')}
      style={style}
    >
      <svg className="bl-sym" viewBox="0 0 100 100" role="img" aria-label="Awesome Books Asia">
        <rect width="100" height="100" rx="23" fill="var(--lapis)" />
        <g
          stroke="var(--paper)"
          strokeWidth="8.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <path d="M55 28H28v27" />
          <path d="M45 72h27V45" />
        </g>
        <rect
          className="bl-cursor"
          x="46.5"
          y="37"
          width="7"
          height="26"
          rx="3.5"
          fill="var(--cursor-gold)"
        />
      </svg>
      {!symbolOnly && <span className="bl-word">Awesome Books Asia</span>}
    </span>
  );
}
