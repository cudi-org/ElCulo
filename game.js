

let socket = null; 
const CONFIG = {
    minPlayers: 3,
    maxPlayers: 20,
    defaultPlayers: 4
};

const DEFAULT_NAMES = ["Alex", "Sam", "Cris", "Dani", "Jo", "Max", "Leo", "Pau", "Kim", "Noa"];

const DATABASE = [
    {
        category: 'Comida y Bebida',
        items: [
            { word: 'Pizza', decoy: 'Lasaña', hint: 'Masa con cosas encima' },
            { word: 'Sushi', decoy: 'Sashimi', hint: 'Comida japonesa' },
            { word: 'Tacos', decoy: 'Burrito', hint: 'Comida mexicana' },
            { word: 'Paella', decoy: 'Risotto', hint: 'Lleva arroz' },
            { word: 'Hamburguesa', decoy: 'Sandwich', hint: 'Carne entre panes' },
            { word: 'Helado', decoy: 'Yogurt', hint: 'Es postre frío' },
            { word: 'Chocolate', decoy: 'Caramelo', hint: 'Dulce muy popular' },
            { word: 'Donut', decoy: 'Croissant', hint: 'Bollo de repostería' },
            { word: 'Tortilla', decoy: 'Revuelto', hint: 'Se hace con huevos' },
            { word: 'Cerveza', decoy: 'Vino', hint: 'Bebida con alcohol' },
            { word: 'Café', decoy: 'Té', hint: 'Bebida con cafeína' },
            { word: 'Palomitas', decoy: 'Patatas Fritas', hint: 'Snack de cine' },
            { word: 'Gazpacho', decoy: 'Salmorejo', hint: 'Sopa fría típica' },
            { word: 'Churros', decoy: 'Porras', hint: 'Se mojan en chocolate' },
            { word: 'Kebab', decoy: 'Falafel', hint: 'Comida rápida de Oriente Medio' },
            { word: 'Croquetas', decoy: 'Empanadillas', hint: 'Fritura casera deliciosa' }
        ]
    },
    {
        category: 'Galicia (Concellos, Montes e Cultura)',
        items: [
            { word: 'Vilagarcía de Arousa', decoy: 'Vilanova de Arousa', hint: 'Concello na ría de Arousa' },
            { word: 'Catoira', decoy: 'Padrón', hint: 'Relacionado co río Ulla ou as torres' },
            { word: 'Caldas de Reis', decoy: 'Cuntis', hint: 'Tradición de augas termais e balnearios' },
            { word: 'Ferrol', decoy: 'Narón', hint: 'Historia naval e ría propia' },
            { word: 'Vigo', decoy: 'A Coruña', hint: 'Gran cidade galega con moita costa' },
            { word: 'A Estrada', decoy: 'Lalín', hint: 'Concello grande do interior con moita feira' },
            { word: 'Ribeira', decoy: 'A Pobra do Caramiñal', hint: 'Concello mariñeiro no extremo da ría' },
            { word: 'Pontecesures', decoy: 'Valga', hint: 'Concello que limita coa provincia da Coruña' },
            { word: 'Armenteira', decoy: 'Meis', hint: 'Lugar famoso polo mosteiro e a ruta da auga' },
            { word: 'Xiabre', decoy: 'Lobeira', hint: 'Monte con antenas e vistas sobre Vilagarcía' },
            { word: 'Lobeira', decoy: 'Siradella', hint: 'Miradoiro natural con vistas espectaculares da ría' },
            { word: 'A Curota', decoy: 'A Curotiña', hint: 'Punto máis alto para ver toda a ría de Arousa' },
            { word: 'Manzaneda', decoy: 'Cabeza de Manzaneda', hint: 'Lugar de Galicia famoso pola neve e o esquí' },
            { word: 'Castroagudín', decoy: 'Carril', hint: 'Aldea elevada con vistas á ría' },
            { word: 'Santiago de Compostela', decoy: 'Lugo', hint: 'Cidade histórica con moito patrimonio' },
            { word: 'Sanxenxo', decoy: 'Portonovo', hint: 'Turismo de praia masivo e festa' },
            { word: 'Cambados', decoy: 'O Grove', hint: 'Famoso polo viño albariño ou marisco' },
            { word: 'Licor Café', decoy: 'Crema de Oruxo', hint: 'Bebida espirituosa galega típica' },
            { word: 'Gaita', decoy: 'Pandeireta', hint: 'Instrumento musical tradicional galego' },
            { word: 'Santa Compaña', decoy: 'Meiga', hint: 'Folclore e lendas galegas' },
            { word: 'Islas Cíes', decoy: 'Isla de Ons', hint: 'Paraíso natural protexido na costa' }
        ]
    },
    {
        category: 'Deportes',
        items: [
            { word: 'Fútbol', decoy: 'Fútbol Sala', hint: 'Deporte de 11 contra 11 con balón' },
            { word: 'Baloncesto', decoy: 'Balonmano', hint: 'Se juega con las manos y hay canastas o porterías' },
            { word: 'Tenis', decoy: 'Pádel', hint: 'Deporte de raqueta o pala' },
            { word: 'Fórmula 1', decoy: 'MotoGP', hint: 'Competición de velocidad con motor' },
            { word: 'Natación', decoy: 'Waterpolo', hint: 'Deporte que se practica en una piscina' },
            { word: 'Ciclismo', decoy: 'Triatlón', hint: 'Deporte que requiere una bicicleta' },
            { word: 'Boxeo', decoy: 'Karate', hint: 'Deporte de contacto y combate' },
            { word: 'Golf', decoy: 'Minigolf', hint: 'Se golpea una bola pequeña hacia un hoyo' },
            { word: 'Rugby', decoy: 'Fútbol Americano', hint: 'Deporte de contacto con balón ovalado' },
            { word: 'Voleibol', decoy: 'Vóley Playa', hint: 'Se golpea un balón por encima de una red' },
            { word: 'Surf', decoy: 'Windsurf', hint: 'Deporte sobre una tabla en el agua' },
            { word: 'Ajedrez', decoy: 'Damas', hint: 'Deporte mental sobre un tablero' },
            { word: 'Bádminton', decoy: 'Tenis de mesa', hint: 'Deporte de raqueta muy rápido' },
            { word: 'Esquí', decoy: 'Snowboard', hint: 'Deporte de invierno en la nieve' },
            { word: 'Patinaje sobre hielo', decoy: 'Hockey sobre hielo', hint: 'Se practica con cuchillas en los pies sobre pista fría' },
            { word: 'Atletismo', decoy: 'Running', hint: 'Consiste en correr, saltar o lanzar' },
            { word: 'Gimnasia Rítmica', decoy: 'Patinaje Artístico', hint: 'Deporte estético con música y coreografía' },
            { word: 'Escalada', decoy: 'Alpinismo', hint: 'Consiste en subir por paredes o montañas' },
            { word: 'Esgrima', decoy: 'Kendo', hint: 'Combate con armas blancas protegidas' },
            { word: 'Tiro con arco', decoy: 'Tiro olímpico', hint: 'Deporte de puntería con un objetivo' },
            { word: 'Billar', decoy: 'Bolos', hint: 'Juego de puntería con bolas' },
            { word: 'Skateboarding', decoy: 'BMX', hint: 'Deporte urbano de trucos y acrobacias' },
            { word: 'Piragüismo', decoy: 'Remo', hint: 'Deporte de navegación en embarcación ligera' },
            { word: 'Judo', decoy: 'Taekwondo', hint: 'Arte marcial olímpica de combate' },
            { word: 'Futbolín', decoy: 'Billar', hint: 'Juego de mesa de bar con barras y figuras' },
            { word: 'Rally', decoy: 'Fórmula 1', hint: 'Competición de automovilismo por tramos o circuitos' },
            { word: 'Motocross', decoy: 'Trial', hint: 'Deporte de motos por terreno de tierra o obstáculos' },
            { word: 'Dardos', decoy: 'Diana', hint: 'Juego de puntería lanzando proyectiles pequeños' },
            { word: 'Paintball', decoy: 'Airsoft', hint: 'Juego de estrategia con armas que disparan proyectiles' }
        ]
    },
    {
        category: 'Países y Destinos',
        items: [
            { word: 'España', decoy: 'Portugal', hint: 'País de la Península Ibérica' },
            { word: 'Francia', decoy: 'Italia', hint: 'País europeo muy turístico' },
            { word: 'Japón', decoy: 'China', hint: 'País asiático del sol naciente' },
            { word: 'Estados Unidos', decoy: 'Canadá', hint: 'Potencia de América del Norte' },
            { word: 'Brasil', decoy: 'Argentina', hint: 'País más grande de Sudamérica' },
            { word: 'Egipto', decoy: 'Marruecos', hint: 'Famoso por sus pirámides' },
            { word: 'Australia', decoy: 'Nueva Zelanda', hint: 'País y continente lejano en Oceanía' },
            { word: 'Alemania', decoy: 'Austria', hint: 'País centroeuropeo de habla germana' },
            { word: 'Reino Unido', decoy: 'Irlanda', hint: 'Estado insular del norte de Europa' },
            { word: 'India', decoy: 'Pakistán', hint: 'País con muchísima población' },
            { word: 'Tailandia', decoy: 'Vietnam', hint: 'Destino exótico del sudeste asiático' },
            { word: 'Noruega', decoy: 'Suecia', hint: 'País escandinavo con fiordos' },
            { word: 'México', decoy: 'Colombia', hint: 'País que habla español en América' },
            { word: 'Grecia', decoy: 'Turquía', hint: 'Cuna de la civilización con muchas islas' },
            { word: 'Suiza', decoy: 'Bélgica', hint: 'País europeo conocido por su chocolate o bancos' },
            { word: 'Cuba', decoy: 'Puerto Rico', hint: 'Isla del Caribe con mucha historia y música' },
            { word: 'Islandia', decoy: 'Groenlandia', hint: 'Lugar muy frío cerca del Ártico con paisajes naturales' },
            { word: 'Corea del Sur', decoy: 'Corea del Norte', hint: 'País situado en una península de Asia oriental' },
            { word: 'Arabia Saudí', decoy: 'Emiratos Árabes', hint: 'País de Oriente Medio con mucho desierto y petróleo' },
            { word: 'Perú', decoy: 'Bolivia', hint: 'País andino con herencia inca' },
            { word: 'Chile', decoy: 'Argentina', hint: 'País del cono sur con grandes montañas y glaciares' },
            { word: 'Países Bajos', decoy: 'Dinamarca', hint: 'País europeo famoso por las bicicletas y canales' },
            { word: 'Sudáfrica', decoy: 'Kenia', hint: 'País africano famoso por sus safaris y fauna' },
            { word: 'Jamaica', decoy: 'Bahamas', hint: 'País insular paradisíaco con playas famosas' },
            { word: 'Israel', decoy: 'Palestina', hint: 'Lugar de Oriente Próximo con gran importancia religiosa' },
            { word: 'Polonia', decoy: 'República Checa', hint: 'País del este de Europa con mucha historia medieval' },
            { word: 'Indonesia', decoy: 'Filipinas', hint: 'País asiático formado por miles de islas' }
        ]
    },
    {
        category: 'Verbos (Acciones)',
        items: [
            { word: 'Correr', decoy: 'Saltar', hint: 'Moverse rápido a pie' },
            { word: 'Dormir', decoy: 'Soñar', hint: 'Lo haces por la noche en la cama' },
            { word: 'Cocinar', decoy: 'Comer', hint: 'Preparar los alimentos' },
            { word: 'Cantar', decoy: 'Gritar', hint: 'Usar la voz con ritmo' },
            { word: 'Nadar', decoy: 'Bucear', hint: 'Moverse en el agua' },
            { word: 'Escribir', decoy: 'Dibujar', hint: 'Usar un bolígrafo sobre papel' },
            { word: 'Bailar', decoy: 'Girar', hint: 'Mover el cuerpo con la música' },
            { word: 'Conducir', decoy: 'Volar', hint: 'Manejar un vehículo' },
            { word: 'Estudiar', decoy: 'Leer', hint: 'Acción para aprender algo' },
            { word: 'Reír', decoy: 'Llorar', hint: 'Expresar una emoción con la cara' }
        ]
    },
    {
        category: 'Animales',
        items: [
            { word: 'León', decoy: 'Tigre', hint: 'Un gran felino salvaje' },
            { word: 'Elefante', decoy: 'Rinoceronte', hint: 'Animal grande, pesado y gris' },
            { word: 'Delfín', decoy: 'Ballena', hint: 'Mamífero acuático muy inteligente' },
            { word: 'Perro', decoy: 'Lobo', hint: 'Un animal cánido' },
            { word: 'Gato', decoy: 'Pantera', hint: 'Un felino ágil' },
            { word: 'Jirafa', decoy: 'Cebra', hint: 'Animal típico de la sabana con rasgos únicos' },
            { word: 'Pingüino', decoy: 'Pato', hint: 'Ave que sabe nadar' },
            { word: 'Serpiente', decoy: 'Lagarto', hint: 'Es un reptil' },
            { word: 'Tiburón', decoy: 'Orca', hint: 'Gran depredador del océano' }
        ]
    },
    {
        category: 'Marcas Globales',
        items: [
            { word: 'Nike', decoy: 'Adidas', hint: 'Marca de ropa y calzado deportivo' },
            { word: 'Coca-Cola', decoy: 'Pepsi', hint: 'Famoso refresco gaseoso' },
            { word: 'Zara', decoy: 'H&M', hint: 'Tienda de moda internacional' },
            { word: 'Mercadona', decoy: 'Lidl', hint: 'Cadena de supermercados' },
            { word: 'Ferrari', decoy: 'Lamborghini', hint: 'Marca italiana de coches de lujo' },
            { word: 'Apple', decoy: 'Samsung', hint: 'Gigante de la tecnología móvil' },
            { word: 'Amazon', decoy: 'Aliexpress', hint: 'Plataforma de comercio electrónico' },
            { word: 'Disney', decoy: 'Netflix', hint: 'Empresa de entretenimiento y contenido' }
        ]
    },
    {
        category: 'Tecnología',
        items: [
            { word: 'Smartphone', decoy: 'Tablet', hint: 'Dispositivo táctil portátil' },
            { word: 'WhatsApp', decoy: 'Telegram', hint: 'App para mensajería' },
            { word: 'Instagram', decoy: 'TikTok', hint: 'Red social de contenido visual' },
            { word: 'Netflix', decoy: 'YouTube', hint: 'Plataforma de vídeo' },
            { word: 'Bitcoin', decoy: 'Ethereum', hint: 'Es una criptomoneda' },
            { word: 'Spotify', decoy: 'Apple Music', hint: 'App para escuchar música' }
        ]
    },
    {
        category: 'Cine y Series',
        items: [
            { word: 'Batman', decoy: 'Iron Man', hint: 'Héroe millonario' },
            { word: 'Harry Potter', decoy: 'Merlín', hint: 'Mago muy famoso' },
            { word: 'Stranger Things', decoy: 'Dark', hint: 'Serie con niños y misterios' },
            { word: 'Juego de Tronos', decoy: 'The Witcher', hint: 'Fantasía medieval y espadas' },
            { word: 'Mario Bros', decoy: 'Sonic', hint: 'Personaje de videojuegos' },
            { word: 'Pikachu', decoy: 'Agumon', hint: 'Criatura que evoluciona' }
        ]
    },
    {
        category: 'Objetos y Casa',
        items: [
            { word: 'Llaves', decoy: 'Cartera', hint: 'Algo que llevas encima' },
            { word: 'Gafas', decoy: 'Lentillas', hint: 'Ayuda a la visión' },
            { word: 'Reloj', decoy: 'Pulsera', hint: 'Se pone en la muñeca' },
            { word: 'Nevera', decoy: 'Microondas', hint: 'Electrodoméstico común' },
            { word: 'Cama', decoy: 'Sofá', hint: 'Mueble para descansar' },
            { word: 'Coche', decoy: 'Moto', hint: 'Vehículo de transporte' }
        ]
    }
];

const safeStorage = {
    get: (key, def) => {
        try {
            return localStorage.getItem(key) || def;
        } catch (e) {
            console.warn('LocalStorage access denied', e);
            return def;
        }
    },
    set: (key, val) => {
        try {
            localStorage.setItem(key, val);
        } catch (e) {
            console.warn('LocalStorage access denied', e);
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('LocalStorage access denied', e);
        }
    }
};

let gameState = {
    players: 4,
    impostors: 1,
    impostors: 1,
    mode: 'classic', 
    currentTurn: 0,
    roles: [],
    roles: [],
    playerNames: [], 
    currentRoundData: null, 
    timerInterval: null,
    timerSeconds: 0,
    expressActive: false,
    expressTurnIndex: 0, 
    alivePlayers: [], 
    usedItems: new Set(JSON.parse(safeStorage.get('impostor_used_items', '[]')))
};

const $ = (id) => document.getElementById(id);

window.forceResetView = function () {
    document.querySelectorAll('.view').forEach(v => {
        v.style.setProperty('display', 'none', 'important');
        v.classList.remove('active');
        v.classList.add('hidden');
    });
    const v = document.getElementById('online-role-view');
    if (v) {
        v.style.setProperty('display', 'flex', 'important');
        v.style.setProperty('opacity', '1', 'important');
        v.style.setProperty('z-index', '9999', 'important');
        v.classList.add('active');
        console.log("Forced Online Role View");
    }
};

document.addEventListener('click', (e) => {

    const btnLocal = e.target.closest('#btn-mode-local');
    if (btnLocal) {
        e.preventDefault();
        console.log("Global Listener: Local Mode");
        switchView('players');
        setTimeout(generatePlayerInputs, 100);
    }

    const btnOnline = e.target.closest('#btn-mode-online');
    if (btnOnline) {
        e.preventDefault();
        console.log("Global Listener: Online Mode");
        switchView('onlineSetup');
    }
});

document.addEventListener('click', (e) => {
    const target = e.target;

    if (target.closest('#btn-mode-local')) {
        switchView('players');
        setTimeout(generatePlayerInputs, 100);
    }
    if (target.closest('#btn-mode-online')) {
        switchView('onlineSetup');
    }

    if (target.closest('#btn-back-home') || target.closest('#btn-back-home-online') || target.closest('#btn-home')) {
        switchView('home');
    }
    if (target.closest('#btn-back-players')) {
        switchView('players');
    }

    if (target.closest('#btn-dec-players')) updatePlayers(-1);
    if (target.closest('#btn-inc-players')) updatePlayers(1);
    if (target.closest('#btn-next-rules')) {

        for (let i = 0; i < gameState.players; i++) {
            const input = document.getElementById(`player-input-${i}`);
            if (input && input.value) safeStorage.set(`local_p_${i}`, input.value);
        }
        switchView('rules');
    }

    if (target.closest('.segment')) {
        setImpostors(target);
        setOnlineImpostors(target); 
    }
    if (target.closest('#btn-start')) startGame();

    if (target.closest('#btn-reveal')) showRole();

    if (target.closest('#btn-hide')) {
        if (socket && socket.readyState === WebSocket.OPEN) {
            switchView('onlineLobby');
        } else {
            nextTurn();
        }
    }

    if (target.closest('#btn-express-next')) nextExpressTurn();
    if (target.closest('#btn-express-vote') || target.closest('#btn-start-vote')) startVotingPhase();
    if (target.closest('#btn-new-game')) switchView('players');

    if (target.closest('#btn-join-room')) joinRoom();
    if (target.closest('#btn-leave-lobby')) leaveRoom();
    if (target.closest('#btn-distribute-roles')) {
        iniciarReparto($('online-game-mode').value, $('online-category').value);
    }
    if (target.closest('#btn-share-link')) shareLink();

    if (target.closest('#btn-goto-config')) switchView('onlineConfig');
    if (target.closest('#btn-back-lobby')) switchView('onlineLobby');
});

document.addEventListener('change', (e) => {
    if (e.target.id === 'game-mode') updateModeDescription();
});

function updatePlayers(change) {
    let newVal = gameState.players + change;
    if (newVal >= CONFIG.minPlayers && newVal <= CONFIG.maxPlayers) {
        gameState.players = newVal;
        const countEl = $('player-count');
        if (countEl) countEl.textContent = gameState.players;
        generatePlayerInputs();
        updateImpostorOptions();
    }
}

function generatePlayerInputs() {

    const list = document.getElementById('players-list');
    if (!list) return;

    list.innerHTML = '';

    for (let i = 0; i < gameState.players; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Jugador ${i + 1}`;
        input.id = `player-input-${i}`;

        const savedName = safeStorage.get(`local_p_${i}`, '');
        if (savedName) input.value = savedName;

        list.appendChild(input);
    }
}

function updateImpostorOptions() {
    const container = document.querySelector('.segmented-control');
    const currentSelection = gameState.impostors;

    let html = `
        <button class="segment ${currentSelection === 1 ? 'active' : ''}" data-impostors="1">1</button>
        <button class="segment ${currentSelection === 2 ? 'active' : ''}" data-impostors="2">2</button>
    `;

    if (gameState.players >= 6) {
        html += `<button class="segment ${currentSelection === 3 ? 'active' : ''}" data-impostors="3">3</button>`;
    }

    html += `<button class="segment ${currentSelection === 'random' ? 'active' : ''}" data-impostors="random"><i class="fa-solid fa-shuffle"></i></button>`;

    container.innerHTML = html;

    container.querySelectorAll('.segment').forEach(seg => {
        seg.addEventListener('click', (e) => setImpostors(e.target));
    });
}

function setImpostors(target) {

    const btn = target.closest('.segment');
    if (!btn) return;

    const allSegments = btn.parentElement.querySelectorAll('.segment');
    allSegments.forEach(s => s.classList.remove('active'));

    btn.classList.add('active');

    const val = btn.dataset.impostors;
    gameState.impostors = val === 'random' ? 'random' : parseInt(val);
}

function updateModeDescription() {
    gameState.mode = $('game-mode').value;
    const descriptions = {
        classic: 'Clásico: Impostor tiene una pista genérica para ayudarse.',
        confusion: 'Confusión: Impostor tiene una palabra falsa muy parecida.',
        spy: 'Espía: Impostor NO tiene ayudas. Dificultad Máxima.',
        unconscious: 'Inconsciente: Impostor cree que es Aliado (palabra falsa).'
    };
    const descEl = $('mode-description');
    if (descEl) descEl.querySelector('span').textContent = descriptions[gameState.mode];
}

function startGame() {

    try {

        gameState.timerSetting = $('timer-setting').value;
        const expressCheck = $('express-mode');
        gameState.expressActive = expressCheck ? expressCheck.checked : false;

        gameState.playerNames = [];
        gameState.alivePlayers = []; 
        for (let i = 0; i < gameState.players; i++) {
            const val = document.getElementById(`player-input-${i}`).value.trim();
            gameState.playerNames.push(val || `Jugador ${i + 1}`);
            gameState.alivePlayers.push(i); 
        }

        let catIdx, itemIdx, key;
        let attempts = 0;
        const maxAttempts = 200; 

        if (!gameState.usedItems) gameState.usedItems = new Set();

        do {
            catIdx = Math.floor(Math.random() * DATABASE.length);
            itemIdx = Math.floor(Math.random() * DATABASE[catIdx].items.length);
            key = `${catIdx}-${itemIdx}`;
            attempts++;
        } while (gameState.usedItems.has(key) && attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            gameState.usedItems.clear();
            console.log("Todas las palabras usadas. Reiniciando historial.");
            safeStorage.remove('impostor_used_items');
        }

        gameState.usedItems.add(key);
        safeStorage.set('impostor_used_items', JSON.stringify([...gameState.usedItems]));

        const catData = DATABASE[catIdx];
        const itemData = catData.items[itemIdx];

        gameState.currentRoundData = {
            category: catData.category,
            word: itemData.word,
            decoy: itemData.decoy,
            hint: itemData.hint
        };

        let numImpostors;
        if (gameState.impostors === 'random') {

            let maxPossible = gameState.players - 1;
            let maxLimit = gameState.players >= 6 ? 5 : Math.floor((gameState.players - 1) / 2); 

            let effectiveMax = Math.min(maxPossible, (gameState.players >= 6 ? 5 : Math.max(1, Math.floor((gameState.players - 1) / 2))));

            numImpostors = Math.floor(Math.random() * effectiveMax) + 1;
        } else {
            numImpostors = gameState.impostors;
        }

        if (numImpostors >= gameState.players) numImpostors = gameState.players - 1;

        let roles = Array(gameState.players).fill('ally');
        let assigned = 0;

        gameState.playerNames.forEach((name, index) => {
            if (assigned < numImpostors) {
                const lowerName = name.toLowerCase().trim();
                if (lowerName === 'martin' || lowerName === 'martín') {
                    roles[index] = 'impostor';
                    assigned++;
                }
            }
        });

        while (assigned < numImpostors) {
            let idx = Math.floor(Math.random() * gameState.players);
            if (roles[idx] === 'ally') {
                roles[idx] = 'impostor';
                assigned++;
            }
        }

        gameState.roles = roles;
        gameState.currentTurn = 0;

        gameState.currentTurn = 0;

        switchView('pass');
        updatePassView();
    } catch (e) {
        console.error("Error in startGame:", e);
        alert("Error al iniciar juego: " + e.message);
    }
}

function updatePassView() {
    const name = gameState.playerNames[gameState.currentTurn];
    const numEl = $('current-player-num');
    if (numEl) numEl.textContent = name;
}

function showRole() {
    try {
        const role = gameState.roles[gameState.currentTurn];
        let isImpostor = role === 'impostor'; 
        const data = gameState.currentRoundData;

        let impostorContent = '';
        let roleTitle = 'ALIADO';
        let roleIcon = 'fa-mask';
        let themeClass = '';

        const cardEl = $('role-card-content');
        if (!cardEl) return;
        cardEl.className = 'role-card';

        if (gameState.mode === 'unconscious' && isImpostor) {

            roleTitle = 'ALIADO';
            roleIcon = 'fa-mask';

            const allyInstruction = 'Di una palabra relacionada.';
            const allyContent = `
             <p class="role-subtitle">Tema: ${data.category}</p>
             <div class="secret-word-box">${data.decoy}</div>
             <p class="instruction">${allyInstruction}</p>
        `;

            cardEl.innerHTML = `
            <div class="${themeClass}">
                <i class="fa-solid ${roleIcon} role-icon"></i>
                <h2>${roleTitle}</h2>
                ${allyContent}
            </div>
        `;
            switchView('reveal');
            return; 
        }

        if (isImpostor) {
            cardEl.classList.add('impostor-theme');
            themeClass = 'impostor-theme';
            roleIcon = 'fa-user-secret';
            roleTitle = 'ERES EL IMPOSTOR';

            if (navigator.vibrate) navigator.vibrate(200);

            if (gameState.mode === 'spy') {
                impostorContent = `
                <div class="secret-word-box">???</div>
                <p class="instruction">No sabes la palabra. ¡Miente!</p>
            `;
            }
            else if (gameState.mode === 'classic') {
                impostorContent = `
                <p class="role-subtitle">Pista:</p>
                <div class="secret-word-box" style="font-size: 1.5rem">${data.hint}</div>
                <p class="instruction">Úsala para guiarte.</p>
            `;
            }
            else if (gameState.mode === 'confusion') {
                impostorContent = `
                <p class="role-subtitle">Palabra Señuelo:</p>
                <div class="secret-word-box">${data.decoy}</div>
                <p class="instruction">¡Es falsa! Úsala para confundir.</p>
            `;
            }
        }

        const allyInstruction = 'Di una palabra relacionada.';
        const allyContent = `
         <p class="role-subtitle">Tema: ${data.category}</p>
         <div class="secret-word-box">${data.word}</div>
         <p class="instruction">${allyInstruction}</p>
    `;

        cardEl.innerHTML = `
            <div class="${themeClass}">
                <i class="fa-solid ${roleIcon} role-icon"></i>
                <h2>${roleTitle}</h2>
                ${isImpostor ? impostorContent : allyContent}
            </div>
        `;

        switchView('reveal');

    } catch (e) {
        console.error("Error in showRole:", e);
        alert("Error al mostrar rol: " + e.message);
    }
}

function nextTurn() {
    gameState.currentTurn++;
    if (gameState.currentTurn < gameState.players) {
        updatePassView();
        switchView('pass');
    } else {
        startMainGame();
    }
}

function startMainGame() {
    switchView('game');

    if (gameState.expressActive) {
        startExpressPhase();
    } else {
        startDebatePhase();
    }
}

function startExpressPhase() {

    gameState.alivePlayers = [];
    for (let i = 0; i < gameState.players; i++) {
        gameState.alivePlayers.push(i);
    }

    dom.game.statusText.style.display = 'none';
    dom.game.expressUI.classList.remove('hidden');
    dom.game.expressSelection.classList.remove('hidden');
    dom.game.expressActiveGame.classList.add('hidden');

    const list = dom.game.expressStartList;
    list.innerHTML = '';

    gameState.alivePlayers.forEach((playerIdx) => {
        const name = gameState.playerNames[playerIdx];
        const btn = document.createElement('button');
        btn.className = 'btn-secondary';
        btn.style.marginTop = '0';
        btn.textContent = name;
        btn.onclick = () => selectExpressStarter(playerIdx);
        list.appendChild(btn);
    });
}

function selectExpressStarter(realIndex) {

    gameState.expressTurnIndex = gameState.alivePlayers.indexOf(realIndex);

    dom.game.expressSelection.classList.add('hidden');
    dom.game.expressActiveGame.classList.remove('hidden');

    runExpressTurn();
}

function runExpressTurn() {

    if (gameState.alivePlayers.length <= 2) {

        const impostorAlive = gameState.alivePlayers.some(idx => gameState.roles[idx] === 'impostor');
        if (impostorAlive) {
            endGame("IMPOSTORES GANAN", "Quedaron solo 2 jugadores.", 'impostors');
            return;
        }
    }

    const realPlayerIdx = gameState.alivePlayers[gameState.expressTurnIndex];
    const name = gameState.playerNames[realPlayerIdx];

    dom.game.expressName.textContent = name;

    clearInterval(gameState.timerInterval);
    gameState.timerSeconds = 10;
    updateTimerDisplay();

    dom.game.timer.style.color = 'var(--accent-green)';

    gameState.timerInterval = setInterval(() => {
        gameState.timerSeconds--;
        updateTimerDisplay();

        if (gameState.timerSeconds <= 0) {

            clearInterval(gameState.timerInterval);
            eliminateCurrentPlayer();
        }
    }, 1000);
}

function nextExpressTurn() {

    clearInterval(gameState.timerInterval);

    gameState.expressTurnIndex++;
    if (gameState.expressTurnIndex >= gameState.alivePlayers.length) {
        gameState.expressTurnIndex = 0;
    }

    runExpressTurn();
}

function eliminateCurrentPlayer() {
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500]);

    const realIdx = gameState.alivePlayers[gameState.expressTurnIndex];
    const name = gameState.playerNames[realIdx];

    dom.game.expressName.innerHTML = `<span style="color:red">¡ELIMINADO!</span><br>${name}`;

    gameState.alivePlayers.splice(gameState.expressTurnIndex, 1);

    if (gameState.expressTurnIndex >= gameState.alivePlayers.length) {
        gameState.expressTurnIndex = 0;
    }

    const remainingImpostors = gameState.alivePlayers.filter(idx => gameState.roles[idx] === 'impostor').length;

    if (remainingImpostors === 0) {

        endGame("ALIADOS GANAN", "¡Todos los impostores han sido eliminados!", 'allies');
        return;
    }

    if (gameState.alivePlayers.length <= 2) {

        endGame("IMPOSTORES GANAN", "Quedan demasiados pocos jugadores.", 'impostors');
        return;
    }

    setTimeout(() => {
        runExpressTurn();
    }, 2000);
}

function endGame(title, message, winner) {
    switchView('game'); 
    dom.game.expressUI.classList.add('hidden');
    dom.game.statusText.style.display = 'block';
    dom.game.btnVote.style.display = 'none'; 

    dom.game.timer.textContent = "";

    const titleColor = winner === 'allies' ? 'var(--accent-blue)' : 'var(--primary)';

    dom.game.statusText.innerHTML = `
        <strong style="font-size:2.5rem; color:${titleColor}; text-transform:uppercase; display:block; margin-bottom:10px;">${title}</strong>
        <p style="font-size:1.1rem; color:var(--text-muted); margin-bottom:30px;">${message}</p>
    `;

    let revealHtml = '<div style="background:rgba(255,255,255,0.05); border-radius:16px; padding:20px; text-align:left;">';

    gameState.playerNames.forEach((n, i) => {
        const r = gameState.roles[i];
        const isImp = r === 'impostor';

        revealHtml += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.1);">
                <span style="font-weight:600; font-size:1.1rem;">${n}</span>
                <span style="color:${isImp ? 'var(--primary)' : 'var(--accent-blue)'}; font-weight:700; letter-spacing:1px;">
                    ${isImp ? 'IMPOSTOR' : 'ALIADO'}
                </span>
            </div>
        `;
    });
    revealHtml += '</div>';

    dom.game.statusText.innerHTML += revealHtml;
}

function startDebatePhase() {
    clearInterval(gameState.timerInterval);
    dom.game.expressUI.classList.add('hidden');
    dom.game.statusText.style.display = 'block';
    dom.game.statusText.textContent = '¡Votación / Debate Libre!';
    dom.game.btnVote.style.display = ''; 

    dom.game.timer.style.color = ''; 

    if (gameState.timerSetting !== 'infinite') {
        gameState.timerSeconds = parseInt(gameState.timerSetting);
        startTimer();
    } else {
        dom.game.timer.textContent = '∞';
    }
}

function startVotingPhase() {
    clearInterval(gameState.timerInterval); 
    switchView('voting');
    renderVotingGrid();
}

function renderVotingGrid() {
    const grid = dom.voting.grid;
    grid.innerHTML = '';

    gameState.alivePlayers.forEach(playerIdx => {
        const name = gameState.playerNames[playerIdx];

        const card = document.createElement('div');
        card.className = 'voting-card';
        card.style.background = 'rgba(255,255,255,0.1)';
        card.style.padding = '20px';
        card.style.borderRadius = '16px';
        card.style.textAlign = 'center';
        card.style.cursor = 'pointer';
        card.style.border = '2px solid rgba(255,255,255,0.2)';

        card.innerHTML = `<h3 style="font-size:1.2rem; pointer-events:none;">${name}</h3>`;

        card.onclick = () => handleVote(playerIdx, card);
        grid.appendChild(card);
    });
}

function handleVote(playerIdx, cardElement) {
    if (navigator.vibrate) navigator.vibrate(50);

    const role = gameState.roles[playerIdx];
    const isImpostor = role === 'impostor';

    cardElement.style.transition = 'all 0.5s';
    cardElement.style.transform = 'rotateY(180deg)';
    cardElement.style.background = isImpostor ? 'var(--primary)' : 'var(--accent-green)';
    cardElement.style.borderColor = isImpostor ? 'var(--primary)' : 'var(--accent-green)';

    cardElement.innerHTML = `
        <i class="fa-solid ${isImpostor ? 'fa-user-secret' : 'fa-check'}" style="font-size:2rem; color:white; transform:rotateY(180deg);"></i>
        <p style="transform:rotateY(180deg); font-weight:bold; margin-top:5px; color:white;">${isImpostor ? 'IMPOSTOR' : 'ALIADO'}</p>
    `;

    setTimeout(() => {
        cardElement.style.opacity = '0';
        cardElement.style.transform = 'scale(0)';

        setTimeout(() => {
            eliminatePlayerById(playerIdx);
        }, 500);
    }, 1500);
}

function eliminatePlayerById(playerIdx) {

    const indexInAlive = gameState.alivePlayers.indexOf(playerIdx);
    if (indexInAlive > -1) {
        gameState.alivePlayers.splice(indexInAlive, 1);
    }

    const remainingImpostors = gameState.alivePlayers.filter(idx => gameState.roles[idx] === 'impostor').length;

    if (remainingImpostors === 0) {
        endGame("ALIADOS GANAN", "¡Todos los impostores han sido eliminados!", 'allies');
        return;
    }

    if (gameState.alivePlayers.length <= 2) {
        endGame("IMPOSTORES GANAN", "Quedan demasiados pocos jugadores.", 'impostors');
        return;
    }

    renderVotingGrid();
}

function startTimer() {
    clearInterval(gameState.timerInterval);

    if (gameState.timerSetting === 'infinite') {
        dom.game.timer.textContent = '∞';

        return;
    }

    gameState.timerSeconds = parseInt(gameState.timerSetting);
    updateTimerDisplay();

    gameState.timerInterval = setInterval(() => {
        gameState.timerSeconds--;
        updateTimerDisplay();

        if (gameState.timerSeconds <= 0) {
            clearInterval(gameState.timerInterval);
            dom.game.timer.textContent = "00:00";

            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(gameState.timerSeconds / 60).toString().padStart(2, '0');
    const secs = (gameState.timerSeconds % 60).toString().padStart(2, '0');
    dom.game.timer.textContent = `${mins}:${secs}`;
}

function switchView(viewName) {

    const map = {
        'home': 'home-view',
        'players': 'players-view',
        'rules': 'rules-view',
        'pass': 'pass-view',
        'reveal': 'reveal-view',
        'game': 'game-view',
        'voting': 'voting-view',
        'onlineSetup': 'online-setup-view',
        'onlineLobby': 'online-lobby-view',
        'onlineConfig': 'online-config-view',
        'onlineRole': 'online-role-view'
    };

    const targetId = map[viewName];
    if (!targetId) return;

    document.querySelectorAll('.view').forEach(el => {
        el.classList.remove('active');
        el.classList.add('hidden');
        el.style.setProperty('display', 'none', 'important');
    });

    const targetEl = document.getElementById(targetId);
    if (targetEl) {
        targetEl.classList.remove('hidden');
        targetEl.classList.add('active');

        targetEl.style.setProperty('display', 'flex', 'important');
        targetEl.style.setProperty('opacity', '1', 'important');
        targetEl.style.setProperty('z-index', '100', 'important');
    } else {
        alert("ERROR: No se encuentra la vista " + targetId);
    }
}

let onlinePlayers = [];
let isHost = false;
let myPeerId = '';
let currentRoom = '';
let onlineImpostorsSetting = 1;
const WS_URL = 'wss://impostor-signaling.onrender.com';

function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) {
        const roomInp = $('inp-room-name');
        const aliasInp = $('inp-alias');
        if (roomInp) {
            roomInp.value = room;
            roomInp.disabled = true;
        }

        switchView('onlineSetup');
        if (aliasInp) aliasInp.focus();
    }
}

function joinRoom() {
    const roomInp = $('inp-room-name');
    const aliasInp = $('inp-alias');

    if (!roomInp || !aliasInp) return;

    const roomName = roomInp.value.trim();
    const alias = aliasInp.value.trim();

    if (!roomName || !alias) {
        alert("Introduce sala y nombre");
        return;
    }

    const btnJoin = $('btn-join-room');
    const originalText = btnJoin.innerText;
    btnJoin.disabled = true;
    btnJoin.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Conectando...';

    currentRoom = roomName;

    socket = new WebSocket(WS_URL);

    socket.onopen = () => {

        socket.send(JSON.stringify({
            appType: 'cudi-sync',
            type: 'join',
            room: roomName,
            alias: alias
        }));
    };

    socket.onmessage = (event) => {

        btnJoin.disabled = false;
        btnJoin.innerText = originalText;

        let data;
        try { data = JSON.parse(event.data); } catch (e) { return; }

        console.log("Recibido:", data);

        if (data.type === 'room_created') {
            isHost = true;
            myPeerId = data.peerId;
            enterLobby();
        }
        else if (data.type === 'joined') {

            isHost = false;
            myPeerId = data.peerId;
            enterLobby();
        }
        else if (data.type === 'player_joined') {

            onlinePlayers.push({ id: data.peerId, alias: data.alias });
            actualizarListaUI();
        }
        else if (data.type === 'player_left') {
            onlinePlayers = onlinePlayers.filter(p => p.id !== data.peerId);
            actualizarListaUI();
        }
        else if (data.type === 'room_closed') {
            alert("La sala ha sido cerrada por el anfitrión.");
            leaveRoom();
        }
        else if (data.type === 'error') {
            alert(data.message);
            socket.close();
        }
        else if (data.type === 'signal') {

            if (data.role) {
                mostrarPantallaRol(data.role, data.word, data.hint);
            }
        }
    };

    socket.onclose = () => {
        console.log("Desconectado");
    };

    socket.onerror = (e) => {
        console.error("Error WS", e);
        alert("Error de conexión");

        const btnJoin = $('btn-join-room');
        if (btnJoin) {
            btnJoin.disabled = false;
            btnJoin.innerText = "ENTRAR";
        }
    };
}

function leaveRoom() {
    if (socket) socket.close();
    socket = null;
    onlinePlayers = [];
    isHost = false;
    switchView('home');
}

function enterLobby() {
    console.log("--> ENTER LOBBY. isHost:", isHost);
    switchView('onlineLobby');
    onlinePlayers = [];

    generateLobbyQR();

    const btnConfig = document.getElementById('btn-goto-config');
    const lobbyStatus = document.getElementById('lobby-status');

    if (isHost) {
        if (btnConfig) {
            btnConfig.classList.remove('hidden');

            const totalPlayers = onlinePlayers.length + 1;
            if (totalPlayers < 3) {
                btnConfig.disabled = true;
                btnConfig.style.opacity = '0.5';
                btnConfig.innerHTML = `MÍNIMO 3 JUGADORES (${totalPlayers}/3) <i class="fa-solid fa-user-clock"></i>`;
            } else {
                btnConfig.disabled = false;
                btnConfig.style.opacity = '1';
                btnConfig.innerHTML = `CONFIGURAR PARTIDA <i class="fa-solid fa-gear"></i>`;
            }
        }
        if (lobbyStatus) lobbyStatus.textContent = "Eres el Anfitrión. Cuando estén todos, configura la partida.";
        populateOnlineCategories();
    } else {
        if (btnConfig) btnConfig.classList.add('hidden');
        if (lobbyStatus) lobbyStatus.textContent = "Esperando al anfitrión...";
    }

    actualizarListaUI();
}

function generateLobbyQR() {
    const link = `${window.location.origin}${window.location.pathname}?room=${currentRoom}`;
    const qrContainer = $('qrcode');
    const roomDisplay = $('room-display-code');

    if (qrContainer) {
        qrContainer.innerHTML = ''; 
        if (typeof QRCode !== 'undefined') {
            new QRCode(qrContainer, {
                text: link,
                width: 128,
                height: 128,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    }
    if (roomDisplay) roomDisplay.textContent = `SALA: ${currentRoom}`;
}

function shareLink() {
    const link = `${window.location.origin}${window.location.pathname}?room=${currentRoom}`;
    if (navigator.share) {
        navigator.share({
            title: 'Únete a El Impostor',
            text: `Entra a mi sala ${currentRoom} para jugar.`,
            url: link
        }).catch(err => console.log('Error sharing', err));
    } else {
        const tempInput = document.createElement("input");
        tempInput.value = link;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        alert('Enlace copiado al portapapeles');
    }
}

function setOnlineImpostors(target) {
    const btn = target.closest('.segment');
    if (!btn) return;

    document.querySelectorAll('#online-impostors-control .segment').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');

    const val = btn.dataset.impostors;
    onlineImpostorsSetting = val === 'random' ? 'random' : parseInt(val);
}

function populateOnlineCategories() {
    const sel = $('online-category');
    if (!sel) return;
    sel.innerHTML = '';

    const optAll = document.createElement('option');
    optAll.value = 'all';
    optAll.textContent = 'Todas (Aleatorio)';
    sel.appendChild(optAll);

    DATABASE.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.category;
        opt.textContent = cat.category;
        sel.appendChild(opt);
    });
}

function actualizarListaUI() {
    const list = $('online-players-list');
    if (!list) return;
    list.innerHTML = '';

    if (onlinePlayers.length === 0 && isHost) {
        list.innerHTML = '<li>Esperando jugadores...</li>';
        return;
    }

    onlinePlayers.forEach(p => {
        const li = document.createElement('li');
        li.textContent = p.alias;
        li.style.padding = '5px';
        li.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        list.appendChild(li);
    });

    if (isHost) {
        const totalPlayers = onlinePlayers.length + 1; 
        const btnConfig = document.getElementById('btn-goto-config');
        const lobbyStatus = document.getElementById('lobby-status');

        if (totalPlayers < 3) {
            if (btnConfig) {
                btnConfig.disabled = true;
                btnConfig.style.opacity = '0.5';
                btnConfig.innerHTML = `MÍNIMO 3 JUGADORES (${totalPlayers}/3) <i class="fa-solid fa-user-clock"></i>`;
            }
            if (lobbyStatus) lobbyStatus.textContent = "Esperando a más jugadores...";
        } else {
            if (btnConfig) {
                btnConfig.disabled = false;
                btnConfig.style.opacity = '1';
                btnConfig.innerHTML = `CONFIGURAR PARTIDA <i class="fa-solid fa-gear"></i>`;
            }
            if (lobbyStatus) lobbyStatus.textContent = "¡Listos para jugar!";
        }
    }
}

function iniciarReparto(modoJuego, categoriaSeleccionada) {
    if (!isHost) return;

    try {

        let categoria;

        if (categoriaSeleccionada === 'all') {
            categoria = DATABASE[Math.floor(Math.random() * DATABASE.length)];
        } else {
            categoria = DATABASE.find(c => c.category === categoriaSeleccionada);
        }

        if (!categoria) {
            throw new Error("Categoría no encontrada: " + categoriaSeleccionada);
        }

        const item = categoria.items[Math.floor(Math.random() * categoria.items.length)];

        const allPlayers = [{ id: myPeerId, alias: 'Tu (Host)' }, ...onlinePlayers];
        const totalPlayers = allPlayers.length;

        let numImpostors = 1;
        if (onlineImpostorsSetting === 'random') {
            let maxPossible = totalPlayers - 1;
            let effectiveMax = Math.min(maxPossible, (totalPlayers >= 6 ? 5 : Math.max(1, Math.floor((totalPlayers - 1) / 2))));
            numImpostors = Math.floor(Math.random() * effectiveMax) + 1;
        } else {
            numImpostors = onlineImpostorsSetting;
        }

        if (numImpostors >= totalPlayers) numImpostors = totalPlayers - 1;

        let rolesMap = new Array(totalPlayers).fill('ALIADO');
        let assigned = 0;
        while (assigned < numImpostors) {
            let idx = Math.floor(Math.random() * totalPlayers);
            if (rolesMap[idx] === 'ALIADO') {
                rolesMap[idx] = 'IMPOSTOR';
                assigned++;
            }
        }

        allPlayers.forEach((jugador, index) => {
            const soyElImpostor = (rolesMap[index] === 'IMPOSTOR');

            let msg = {
                appType: 'cudi-sync',
                type: 'signal',
                role: '',
                word: '',
                hint: ''
            };

            if (jugador.id !== myPeerId) {
                msg.targetId = jugador.id;
            }

            switch (modoJuego) {
                case 'Clásico':
                    msg.role = soyElImpostor ? 'IMPOSTOR' : 'ALIADO';
                    msg.word = soyElImpostor ? '???' : item.word;
                    msg.hint = soyElImpostor ? item.hint : '';
                    break;
                case 'Confusión':
                    msg.role = soyElImpostor ? 'IMPOSTOR' : 'ALIADO';
                    msg.word = soyElImpostor ? item.decoy : item.word;
                    break;
                case 'Inconsciente':
                    msg.role = 'ALIADO';
                    msg.word = soyElImpostor ? item.decoy : item.word;
                    break;
                case 'Espía':
                    msg.role = soyElImpostor ? 'IMPOSTOR' : 'ALIADO';
                    msg.word = soyElImpostor ? '???' : item.word;
                    break;
            }

            if (jugador.id === myPeerId) {
                mostrarPantallaRol(msg.role, msg.word, msg.hint);
            } else {
                socket.send(JSON.stringify(msg));
            }
        });

    } catch (err) {
        console.error("Error en iniciarReparto:", err);
        alert("Error al repartir roles: " + err.message);
    }
}

function mostrarPantallaRol(role, word, hint) {
    const cardEl = document.getElementById('online-role-card');
    const roleNameEl = document.getElementById('online-role-name');
    const wordDisplayEl = document.getElementById('online-word-display');
    const iconEl = document.getElementById('online-icon');
    const hintTextEl = document.getElementById('online-hint-text');

    if (!cardEl) return;

    roleNameEl.innerText = (role === 'IMPOSTOR') ? 'ERES EL IMPOSTOR' : 'ALIADO';
    wordDisplayEl.innerText = word;
    hintTextEl.innerText = hint || "";

    if (role === 'IMPOSTOR') {
        cardEl.classList.add('impostor-theme');
        iconEl.className = "fa-solid fa-user-secret";
    } else {
        cardEl.classList.remove('impostor-theme');
        iconEl.className = "fa-solid fa-mask";
    }

    switchView('onlineRole');
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof generatePlayerInputs === 'function') generatePlayerInputs();
    if (typeof checkUrlParams === 'function') checkUrlParams();
});
