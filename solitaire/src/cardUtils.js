export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const SUIT_SYMBOLS = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660',
};

export const SUIT_COLORS = {
  hearts: '#dc2626',
  diamonds: '#dc2626',
  clubs: '#1a1a2e',
  spades: '#1a1a2e',
};

export function isRed(suit) {
  return suit === 'hearts' || suit === 'diamonds';
}

export function isBlack(suit) {
  return suit === 'clubs' || suit === 'spades';
}

export function oppositeColor(suit1, suit2) {
  return isRed(suit1) !== isRed(suit2);
}

export function rankValue(rank) {
  return RANKS.indexOf(rank);
}

export function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, faceUp: false, id: `${rank}-${suit}` });
    }
  }
  return deck;
}

export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function canPlaceOnTableau(card, targetCard) {
  if (!targetCard) {
    return card.rank === 'K';
  }
  return oppositeColor(card.suit, targetCard.suit) &&
    rankValue(card.rank) === rankValue(targetCard.rank) - 1;
}

export function canPlaceOnFoundation(card, foundationTop) {
  if (!foundationTop) {
    return card.rank === 'A';
  }
  return card.suit === foundationTop.suit &&
    rankValue(card.rank) === rankValue(foundationTop.rank) + 1;
}
