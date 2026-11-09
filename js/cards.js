

const SUITS = {
    oros: {
        name: 'Oros',
        color: '#f59e0b',
        secondaryColor: '#d97706',
        symbol: '🟡'
    },
    copas: {
        name: 'Copas',
        color: '#ef4444',
        secondaryColor: '#dc2626',
        symbol: '🏆'
    },
    espadas: {
        name: 'Espadas',
        color: '#3b82f6',
        secondaryColor: '#2563eb',
        symbol: '⚔️'
    },
    bastos: {
        name: 'Bastos',
        color: '#10b981',
        secondaryColor: '#059669',
        symbol: '🪵'
    }
};

const CARD_POWER_MAP = {
    3: 1,
    4: 2,
    5: 3,
    6: 4,
    7: 5,
    10: 6, 
    11: 7, 
    12: 8, 
    1: 9,  
    2: 10  
};

const CARD_NAMES = {
    1: 'As',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    10: 'Sota',
    11: 'Caballo',
    12: 'Rey'
};

const CARD_VALUES = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
const SUIT_KEYS = ['oros', 'copas', 'espadas', 'bastos'];

const CARD_IMAGE_SUFFIX = {
    1: '01_as',
    2: '02',
    3: '03',
    4: '04',
    5: '05',
    6: '06',
    7: '07',
    10: '10_sota',
    11: '11_caballo',
    12: '12_rey'
};

const CARD_BACK_IMAGE = 'assets/cartas/reverso.png';

function getCardImagePath(suit, value) {
    const suffix = CARD_IMAGE_SUFFIX[value];
    if (!suffix || !suit) return CARD_BACK_IMAGE;
    return `assets/cartas/${suit}_${suffix}.png`;
}

function createSpanishDeck(deckIndex = 0) {
    const deck = [];
    for (const suit of SUIT_KEYS) {
        for (const value of CARD_VALUES) {
            deck.push({
                uid: `d${deckIndex}_${suit}_${value}`,
                deckIndex,
                suit,
                value,
                power: CARD_POWER_MAP[value],
                image: getCardImagePath(suit, value)
            });
        }
    }
    return deck;
}

function createMultipleDecks(count = 1) {
    let combined = [];
    for (let i = 0; i < count; i++) {
        combined = combined.concat(createSpanishDeck(i));
    }
    return combined;
}

function shuffleCards(cards) {
    const deck = [...cards];
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function renderCardHTML(card, options = {}) {
    const { selected = false, disabled = false, small = false, faceDown = false } = options;

    if (faceDown || !card) {
        const uid = card ? card.uid : '';
        return `
        <div class="spanish-card face-down ${small ? 'small' : ''}" data-uid="${uid}">
            <img class="card-img" src="${CARD_BACK_IMAGE}" alt="Reverso" draggable="false" />
        </div>`;
    }

    const isDos = card.value === 2;
    const isAs = card.value === 1;
    const imgSrc = card.image || getCardImagePath(card.suit, card.value);
    const valueStr = CARD_NAMES[card.value] || card.value;
    const suitName = SUITS[card.suit]?.name || card.suit;
    const cardTitle = `${valueStr} de ${suitName}`;

    let badgeHTML = '';
    if (card.suit === 'oros' && card.value === 2) {
        badgeHTML = `<div class="badge-cut-power badge-oros-2">🌟 FIN RONDA</div>`;
    } else if (isDos) {
        badgeHTML = `<div class="badge-cut-power">⚡ CORTE</div>`;
    } else if (isAs) {
        badgeHTML = `<div class="badge-as-power">⭐ AS</div>`;
    }

    return `
    <div class="spanish-card suit-${card.suit} ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''} ${small ? 'small' : ''} ${isDos ? 'power-dos' : ''}" 
         data-uid="${card.uid}" 
         data-power="${card.power}"
         data-value="${card.value}"
         title="${cardTitle}">
        <img class="card-img" src="${imgSrc}" alt="${cardTitle}" draggable="false" />
        ${badgeHTML}
    </div>`;
}

window.SpanishDeck = {
    SUITS,
    CARD_POWER_MAP,
    CARD_NAMES,
    CARD_VALUES,
    SUIT_KEYS,
    CARD_IMAGE_SUFFIX,
    CARD_BACK_IMAGE,
    getCardImagePath,
    createSpanishDeck,
    createMultipleDecks,
    shuffleCards,
    renderCardHTML
};
