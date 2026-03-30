import React, { useReducer, useCallback, useState } from 'react';
import { gameReducer, createInitialState } from './gameReducer';
import { canPlaceOnFoundation } from './cardUtils';
import Pile from './Pile';
import './App.css';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);
  const [dragData, setDragData] = useState(null);

  const handleStockClick = useCallback(() => {
    dispatch({ type: 'DRAW_FROM_STOCK' });
  }, []);

  const handleCardDragStart = useCallback((source, sourceIndex) => (e, card, cardIndex) => {
    let cards;
    if (source === 'tableau') {
      cards = state.tableau[sourceIndex].slice(cardIndex);
    } else {
      cards = [card];
    }
    setDragData({ cards, fromSource: source, fromIndex: sourceIndex });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  }, [state.tableau]);

  const handleTableauDrop = useCallback((toIndex) => (e) => {
    if (!dragData) return;
    dispatch({
      type: 'MOVE_TO_TABLEAU',
      cards: dragData.cards,
      fromSource: dragData.fromSource,
      fromIndex: dragData.fromIndex,
      toIndex,
    });
    setDragData(null);
  }, [dragData]);

  const handleFoundationDrop = useCallback((foundationIndex) => (e) => {
    if (!dragData || dragData.cards.length !== 1) return;
    dispatch({
      type: 'MOVE_TO_FOUNDATION',
      card: dragData.cards[0],
      fromSource: dragData.fromSource,
      fromIndex: dragData.fromIndex,
      foundationIndex,
    });
    setDragData(null);
  }, [dragData]);

  const handleDoubleClick = useCallback((source, sourceIndex) => (card, cardIndex) => {
    if (!card || !card.faceUp) return;
    // Only allow double-click on the top card of a pile
    if (source === 'tableau') {
      const pile = state.tableau[sourceIndex];
      if (cardIndex !== pile.length - 1) return;
    }
    for (let fi = 0; fi < 4; fi++) {
      const fTop = state.foundations[fi].length > 0
        ? state.foundations[fi][state.foundations[fi].length - 1]
        : null;
      if (canPlaceOnFoundation(card, fTop)) {
        dispatch({
          type: 'MOVE_TO_FOUNDATION',
          card,
          fromSource: source,
          fromIndex: sourceIndex,
          foundationIndex: fi,
        });
        return;
      }
    }
  }, [state.foundations, state.tableau]);

  const canAutoComplete = state.stock.length === 0 && state.waste.length === 0 &&
    state.tableau.every(pile => pile.every(card => card.faceUp));

  return (
    <div className="solitaire-app">
      <header className="game-header">
        <h1>Solitaire</h1>
        <div className="game-info">
          <span>Score: {state.score}</span>
          <span>Moves: {state.moves}</span>
          <button className="btn" onClick={() => dispatch({ type: 'NEW_GAME' })}>New Game</button>
          {canAutoComplete && (
            <button className="btn btn-accent" onClick={() => dispatch({ type: 'AUTO_COMPLETE' })}>
              Auto Complete
            </button>
          )}
        </div>
      </header>

      {state.gameWon && (
        <div className="win-overlay">
          <div className="win-message">
            <h2>You Win!</h2>
            <p>Score: {state.score} | Moves: {state.moves}</p>
            <button className="btn btn-large" onClick={() => dispatch({ type: 'NEW_GAME' })}>
              Play Again
            </button>
          </div>
        </div>
      )}

      <div className="game-board">
        <div className="top-row">
          <div className="stock-waste">
            <Pile
              cards={state.stock.length > 0 ? [{ id: 'stock-top', faceUp: false }] : []}
              pileType="stock"
              onCardClick={handleStockClick}
              emptyContent={<span className="recycle-icon">&#8635;</span>}
            />
            <Pile
              cards={state.waste.length > 0 ? [state.waste[state.waste.length - 1]] : []}
              pileType="waste"
              onCardDragStart={handleCardDragStart('waste', 0)}
              onCardDoubleClick={handleDoubleClick('waste', 0)}
            />
          </div>
          <div className="foundations">
            {state.foundations.map((foundation, fi) => (
              <Pile
                key={fi}
                cards={foundation.length > 0 ? [foundation[foundation.length - 1]] : []}
                pileType="foundation"
                pileIndex={fi}
                onDrop={handleFoundationDrop(fi)}
                onCardDragStart={handleCardDragStart('foundation', fi)}
                emptyContent={<span className="foundation-symbol">A</span>}
              />
            ))}
          </div>
        </div>

        <div className="tableau">
          {state.tableau.map((pile, ti) => (
            <Pile
              key={ti}
              cards={pile}
              spread
              pileType="tableau"
              pileIndex={ti}
              onCardDragStart={handleCardDragStart('tableau', ti)}
              onCardDoubleClick={handleDoubleClick('tableau', ti)}
              onDrop={handleTableauDrop(ti)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
