import React from 'react';
import styled from 'styled-components';

// Memoized SVG Button Icon
const PlusIcon = React.memo(() => (
  <svg height={16} width={16} viewBox="0 0 24 24">
    <path strokeWidth={2} stroke="currentColor" d="M4 12H20M12 4V20" fill="currentColor" />
  </svg>
));

type CardProps = {
  badgeText?: string;
  title?: string;
  description?: string;
  price?: string;
  $accentColor?: string;
  $textColor?: string;
  $imageGradient?: string;
  image?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  style?: React.CSSProperties;
  width?: string | number;
};

// Custom props comparison for React.memo
function areEqual(prev: CardProps, next: CardProps) {
  return (
    prev.badgeText === next.badgeText &&
    prev.title === next.title &&
    prev.description === next.description &&
    prev.price === next.price &&
    prev.$accentColor === next.$accentColor &&
    prev.$textColor === next.$textColor &&
    prev.$imageGradient === next.$imageGradient &&
    prev.image === next.image &&
    prev.onClick === next.onClick &&
    prev.style === next.style &&
    prev.width === next.width
  );
}

const Card: React.FC<CardProps> = React.memo(({
  badgeText = 'NEW',
  title = 'Premium Design',
  description = 'Hover to reveal stunning effects',
  price = '$49.99',
  $accentColor = '#7c3aed',
  $textColor = '#1e293b',
  $imageGradient = 'linear-gradient(45deg, #a78bfa, #8b5cf6)',
  image,
  onClick,
  style,
  width,
}) => {
  // Memoize badge, image, and footer to avoid unnecessary rerenders
  const badge = React.useMemo(() => (
    <div className="card__badge">{badgeText}</div>
  ), [badgeText]);

  const cardImage = React.useMemo(() => (
    <div
      className="card__image"
      style={{
        backgroundImage: `url(${image})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    />
  ), [image]);

  const footer = React.useMemo(() => (
    <div className="card__footer">
      <div className="card__price">{price}</div>
      <div className="card__button">
        <PlusIcon />
      </div>
    </div>
  ), [price]);

  return (
    <StyledWrapper
      $accentColor={$accentColor}
      $textColor={$textColor}
      $imageGradient={$imageGradient}
      style={style}
      onClick={onClick}
      width={width}
    >
      <div className="card">
        <div className="card__shine" />
        <div className="card__glow" style={{ backgroundImage: `url(${image})` }} />
        <div className="card__content">
          {badge}
          {cardImage}
          <div className="card__text">
            <p className="card__title">{title}</p>
            <p className="card__description">{description}</p>
          </div>
          {footer}
        </div>
      </div>
    </StyledWrapper>
  );
}, areEqual);

type StyledProps = {
  $accentColor: string;
  $textColor: string;
  $imageGradient: string;
  width?: string | number;
  image?: string;
};

const StyledWrapper = styled.div<StyledProps>`
  .card {
    --card-accent: ${(props) => props.$accentColor};
    --card-shadow: 0 10px 15px -3px rgba(12, 84, 117, 0.12);

    width: ${(props) => props.width ? (typeof props.width === 'number' ? `${props.width}px` : props.width) : '190px'};
    height: 254px;
    border-radius: 20px;
    position: relative;
    overflow: hidden;
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: var(--card-shadow);
    border: 1px solid rgba(68, 186, 255, 0.2);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, sans-serif;
    
  } 

  .card__shine {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .card__glow {
    position: absolute;
    inset: -10px;
    -webkit-mask-position: center;
    mask-position: center;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    mask-image: linear-gradient(to top,transparent 50%,  rgb(0, 0, 0) );
    filter: blur(10px);
    opacity: 0;
    transition: opacity 0.5s ease;
  }

  .card__content {
    padding: 1.25em;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.75em;
    position: relative;
    z-index: 2;
  }

  .card__badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: #10b981;
    padding: 0.25em 0.5em;
    border-radius: 999px;
    font-size: 0.7em;
    font-weight: 600;
    transform: scale(0.8);
    opacity: 0;
    transition: all 0.4s ease 0.1s;
  }

  .card__image {
    width: 100%;
    height: 100px;
    background: ${(props) => props.$imageGradient};
    border-radius: 12px;
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
  }

  .card__image::after {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
        circle at 30% 30%,
        rgba(255, 255, 255, 0.1) 0%,
        transparent 30%
      ),
      repeating-linear-gradient(
        45deg,
        rgba(139, 92, 246, 0.1) 0px,
        rgba(139, 92, 246, 0.1) 2px,
        transparent 2px,
        transparent 4px
      );
    opacity: 0.5;
  }

  .card__text {
    display: flex;
    flex-direction: column;
    gap: 0.25em;
  }

  .card__title {
    font-size: 1.1em;
    margin: 0;
    font-weight: 700;
    transition: all 0.3s ease;
  }

  .card__description {
    font-size: 0.75em;
    margin: 0;
    opacity: 0.7;
    transition: all 0.3s ease;
  }

  .card__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
  }

  .card__price {
    font-weight: 700;
    font-size: 1em;
    transition: all 0.3s ease;
  }

  .card__button {
    width: 28px;
    height: 28px;
    background: var(--card-accent);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    transform: scale(0.9);
  }

  .card:hover {
    transform: translateY(-10px);
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: rgba(124, 58, 237, 0.2);
  }

  .card:hover .card__shine {
    opacity: 1;
    animation: shine 3s infinite;
  }

  .card:hover .card__glow {
    opacity: 1;
  }

  .card:hover .card__badge {
    transform: scale(1);
    opacity: 1;
    z-index: 1;
  }

  .card:hover .card__image {
    transform: translateY(-5px) scale(1.03);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  .card:hover .card__title {
    color: var(--card-accent);
    transform: translateX(2px);
  }

  .card:hover .card__description {
    opacity: 1;
    transform: translateX(2px);
  }

  .card:hover .card__price {
    color: var(--card-accent);
    transform: translateX(2px);
  }

  .card:hover .card__button {
    transform: scale(1);
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.2);
  }

  .card:hover .card__button svg {
    animation: pulse 1.5s infinite;
  }

  .card:active {
    transform: translateY(-5px) scale(0.98);
  }

  @keyframes shine {
    0% {
      background-position: -100% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }
`;

export default Card;
