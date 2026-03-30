import {
  createDeck, shuffle, rankValue,
  canPlaceOnTableau, canPlaceOnFoundation
} from './cardUtils';

export function createInitialState() {
  const deck = shuffle(createDeck());
  const tableau = [[], [], [], [], [], [], []];
  let idx = 0;

  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = { ...deck[idx] };
      card.faceUp = row === col;
      tableau[col].push(card);
      idx++;
    }
  }

  const stock = deck.slice(idx).map(c => ({ ...c, faceUp: false }));
  const waste = [];
  const foundations = [[], [], [], []];

  return {
    tableau,
    stock,
    waste,
    foundations,
    moves: 0,
    score: 0,
    gameWon: false,
  };
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'NEW_GAME':
      return createInitialState();

    case 'DRAW_FROM_STOCK': {
      const newState = cloneState(state);
      if (newState.stock.length === 0) {
        newState.stock = newState.waste.reverse().map(c => ({ ...c, faceUp: false }));
        newState.waste = [];
      } else {
        const card = newState.stock.pop();
        card.faceUp = true;
        newState.waste.push(card);
      }
      newState.moves++;
      return newState;
    }

    case 'MOVE_TO_TABLEAU': {
      const { cards, fromSource, fromIndex, toIndex } = action;
      const newState = cloneState(state);

      removeCards(newState, fromSource, fromIndex, cards.length);
      const targetPile = newState.tableau[toIndex];
      const topCard = targetPile.length > 0 ? targetPile[targetPile.length - 1] : null;

      if (!canPlaceOnTableau(cards[0], topCard)) {
        return state;
      }

      targetPile.push(...cards.map(c => ({ ...c, faceUp: true })));
      flipTopCard(newState, fromSource, fromIndex);
      newState.moves++;

      if (fromSource === 'waste') newState.score += 5;
      if (fromSource === 'foundation') newState.score = Math.max(0, newState.score - 15);

      return newState;
    }

    case 'MOVE_TO_FOUNDATION': {
      const { card, fromSource, fromIndex, foundationIndex } = action;
      const newState = cloneState(state);

      const foundation = newState.foundations[foundationIndex];
      const topCard = foundation.length > 0 ? foundation[foundation.length - 1] : null;

      if (!canPlaceOnFoundation(card, topCard)) {
        return state;
      }

      removeCards(newState, fromSource, fromIndex, 1);
      foundation.push({ ...card, faceUp: true });
      flipTopCard(newState, fromSource, fromIndex);
      newState.moves++;
      newState.score += 10;

      const allComplete = newState.foundations.every(f => f.length === 13);
      if (allComplete) {
        newState.gameWon = true;
      }

      return newState;
    }

    case 'AUTO_COMPLETE': {
      let newState = cloneState(state);
      let moved = true;
      while (moved) {
        moved = false;
        for (let ti = 0; ti < 7; ti++) {
          const pile = newState.tableau[ti];
          if (pile.length === 0) continue;
          const card = pile[pile.length - 1];
          if (!card.faceUp) continue;
          for (let fi = 0; fi < 4; fi++) {
            const fTop = newState.foundations[fi].length > 0
              ? newState.foundations[fi][newState.foundations[fi].length - 1]
              : null;
            if (canPlaceOnFoundation(card, fTop)) {
              pile.pop();
              newState.foundations[fi].push({ ...card, faceUp: true });
              if (pile.length > 0 && !pile[pile.length - 1].faceUp) {
                pile[pile.length - 1].faceUp = true;
              }
              newState.score += 10;
              newState.moves++;
              moved = true;
              break;
            }
          }
        }
        // Also check waste
        if (newState.waste.length > 0) {
          const card = newState.waste[newState.waste.length - 1];
          for (let fi = 0; fi < 4; fi++) {
            const fTop = newState.foundations[fi].length > 0
              ? newState.foundations[fi][newState.foundations[fi].length - 1]
              : null;
            if (canPlaceOnFoundation(card, fTop)) {
              newState.waste.pop();
              newState.foundations[fi].push({ ...card, faceUp: true });
              newState.score += 10;
              newState.moves++;
              moved = true;
              break;
            }
          }
        }
      }
      const allComplete = newState.foundations.every(f => f.length === 13);
      if (allComplete) newState.gameWon = true;
      return newState;
    }

    default:
      return state;
  }
}

function cloneState(state) {
  return {
    tableau: state.tableau.map(pile => pile.map(c => ({ ...c }))),
    stock: state.stock.map(c => ({ ...c })),
    waste: state.waste.map(c => ({ ...c })),
    foundations: state.foundations.map(pile => pile.map(c => ({ ...c }))),
    moves: state.moves,
    score: state.score,
    gameWon: state.gameWon,
  };
}

function removeCards(state, source, index, count) {
  if (source === 'waste') {
    state.waste.splice(state.waste.length - count, count);
  } else if (source === 'tableau') {
    state.tableau[index].splice(state.tableau[index].length - count, count);
  } else if (source === 'foundation') {
    state.foundations[index].splice(state.foundations[index].length - count, count);
  }
}

function flipTopCard(state, source, index) {
  if (source === 'tableau') {
    const pile = state.tableau[index];
    if (pile.length > 0 && !pile[pile.length - 1].faceUp) {
      pile[pile.length - 1].faceUp = true;
      state.score += 5;
    }
  }
}
