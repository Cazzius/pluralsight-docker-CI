import React from 'react';
import { SUIT_SYMBOLS, SUIT_COLORS } from './cardUtils';

export default function Card({
  card,
  style,
  onClick,
  onDragStart,
  onDoubleClick,
  draggable = true,
  isDragging = false,
}) {
  if (!card) return null;

  if (!card.faceUp) {
    return (
      <div
        className="card card-back"
        style={style}
        onClick={onClick}
      >
        <div className="card-back-pattern" />
      </div>
    );
  }

  const color = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];

  return (
    <div
      className={`card card-front ${isDragging ? 'dragging' : ''}`}
      style={{ ...style, color }}
      draggable={draggable}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onDragStart={(e) => {
        if (onDragStart) onDragStart(e);
      }}
    >
      <div className="card-corner top-left">
        <span className="card-rank">{card.rank}</span>
        <span className="card-suit-small">{symbol}</span>
      </div>
      <div className="card-center">{symbol}</div>
      <div className="card-corner bottom-right">
        <span className="card-rank">{card.rank}</span>
        <span className="card-suit-small">{symbol}</span>
      </div>
    </div>
  );
}
