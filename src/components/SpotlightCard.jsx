// SpotlightCard — cursor-follow spotlight card from React Bits (JS variant).
// Vendored as-is. On the cover sheet it wraps each "how it works" step so a faint
// drafting-blue wash tracks the pointer, like a light table under the sheet. The
// box styling itself comes from the .cover__step class passed alongside; the CSS
// here only owns the spotlight mechanic (recolored to the Blueprint palette).
import { useRef } from 'react';
import './SpotlightCard.css';

const SpotlightCard = ({
  children,
  className = '',
  spotlightColor = 'rgba(37, 99, 176, 0.10)',
}) => {
  const divRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    divRef.current.style.setProperty('--mouse-x', `${x}px`);
    divRef.current.style.setProperty('--mouse-y', `${y}px`);
    divRef.current.style.setProperty('--spotlight-color', spotlightColor);
  };

  return (
    <div ref={divRef} onMouseMove={handleMouseMove} className={`card-spotlight ${className}`}>
      {children}
    </div>
  );
};

export default SpotlightCard;
