// StarBorder — animated travelling-highlight border from React Bits (JS variant).
// Vendored as-is (structure). On the cover sheet it wraps the primary CTA so a
// slow drafting-blue glimmer runs along the button's top/bottom edge — read as a
// faint current on the rails, not a neon glow. The button surface + colors come
// from the class passed in (styled in index.css); the CSS here is structural and
// recolored so nothing dark leaks through.
import './StarBorder.css';

const StarBorder = ({
  as: Component = 'button',
  className = '',
  color = 'var(--blue)',
  speed = '6s',
  thickness = 2,
  children,
  ...rest
}) => {
  return (
    <Component
      className={`star-border-container ${className}`}
      style={{
        padding: `${thickness}px 0`,
        ...rest.style,
      }}
      {...rest}
    >
      <div
        className="border-gradient-bottom"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      <div
        className="border-gradient-top"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      <div className="inner-content">{children}</div>
    </Component>
  );
};

export default StarBorder;
