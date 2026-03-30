import React from 'react';
import Card from './Card';

export default function Pile({
  cards,
  spread = false,
  onCardClick,
  onCardDoubleClick,
  onCardDragStart,
  onDrop,
  onDragOver,
  emptyContent,
  pileType,
  pileIndex,
}) {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (onDragOver) onDragOver(e);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (onDrop) onDrop(e);
  };

  return (
    <div
      className={`pile ${pileType}-pile ${spread ? 'spread' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {cards.length === 0 && (
        <div className="empty-pile" onClick={() => onCardClick && onCardClick(null, -1)}>
          {emptyContent || null}
        </div>
      )}
      {cards.map((card, i) => {
        const canDrag = card.faceUp;
        const offset = spread ? i * 28 : 0;
        const faceDownOffset = spread && !card.faceUp ? i * 14 : offset;
        const actualOffset = spread ? (card.faceUp ? offset : faceDownOffset) : 0;

        return (
          <Card
            key={card.id}
            card={card}
            style={spread ? {
              position: 'absolute',
              top: `${actualOffset}px`,
              zIndex: i,
            } : {
              position: i > 0 ? 'absolute' : 'relative',
              top: 0,
              left: 0,
              zIndex: i,
            }}
            draggable={canDrag}
            onClick={(e) => {
              e.stopPropagation();
              if (onCardClick) onCardClick(card, i);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (onCardDoubleClick) onCardDoubleClick(card, i);
            }}
            onDragStart={(e) => {
              if (canDrag && onCardDragStart) {
                onCardDragStart(e, card, i);
              }
            }}
          />
        );
      })}
    </div>
  );
}
