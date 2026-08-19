import { Link } from 'react-router-dom';

/**
 * A 5x5px nearly-invisible anchor pinned to the bottom-left corner of the
 * viewport. Routes curious explorers to the secret /secret-warning page,
 * which unlocks the hidden "Glitch Hunter" badge.
 */
export function HiddenCornerAnchor() {
  return (
    <Link
      to="/secret-warning"
      aria-hidden="true"
      tabIndex={-1}
      title=""
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '5px',
        height: '5px',
        cursor: 'default',
        zIndex: 60,
        opacity: 0.01,
      }}
    />
  );
}
