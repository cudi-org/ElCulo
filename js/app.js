

document.addEventListener('DOMContentLoaded', () => {

    const network = new P2PNetwork();
    let hostEngine = null; 
    let currentState = null;
    const selectedCardUids = new Set();
    const selectedTributeUids = new Set();
    let isSetupHostMode = true;
    let myPeerId = null;

    const views = {
        home: document.getElementById('home-view'),
        setup: document.getElementById('setup-view'),
        lobby: document.getElementById('lobby-view'),
        game: document.getElementById('game-view'),
        roundOver: document.getElementById('round-over-view')
    };

    const statusPill = document.getElementById('connection-status-pill');
    const statusText = document.getElementById('status-text');

    const ROLE_INFO = {
        GRAN_PRESIDENTE: { name: 'Gran Presidente', icon: '👑👑', class: 'role-GRAN_PRESIDENTE' },
        PRESIDENTE: { name: 'Presidente', icon: '👑', class: 'role-PRESIDENTE' },
        VICEPRESIDENTE: { name: 'Vicepresidente', icon: '🎖️', class: 'role-VICEPRESIDENTE' },
        NEUTRO: { name: 'Neutro', icon: '⚖️', class: 'role-NEUTRO' },
        VICECULO: { name: 'Viceculo', icon: '🧹', class: 'role-VICECULO' },
        CULO: { name: 'Culo', icon: '💩', class: 'role-CULO' },
        GRAN_CULO: { name: 'Gran Culo', icon: '💩💩', class: 'role-GRAN_CULO' }
    };

    function hideOverlays() {
        const cutOverlay = document.getElementById('cut-overlay');
        if (cutOverlay) cutOverlay.classList.add('hidden');
        if (cutOverlayTimeout) {
            clearTimeout(cutOverlayTimeout);
            cutOverlayTimeout = null;
        }

        const plinaOverlay = document.getElementById('plina-overlay');
        if (plinaOverlay) plinaOverlay.classList.add('hidden');
        if (plinaOverlayTimeout) {
            clearTimeout(plinaOverlayTimeout);
            plinaOverlayTimeout = null;
        }
    }

    function showView(viewName) {
        if (viewName !== 'game') {
            hideOverlays();
        }
        const headerRound = document.getElementById('header-round-pill');
        if (headerRound) {
            if (viewName === 'game') {
                headerRound.classList.remove('hidden');
            } else {
                headerRound.classList.add('hidden');
            }
        }
        Object.keys(views).forEach(k => {
            if (k === viewName) {
                views[k].classList.remove('hidden');
                views[k].classList.add('active');
            } else {
                views[k].classList.add('hidden');
                views[k].classList.remove('active');
            }
        });
    }

    const btnSound = document.getElementById('btn-toggle-sound');
    btnSound.addEventListener('click', () => {
        soundEngine.enabled = !soundEngine.enabled;
        btnSound.innerHTML = soundEngine.enabled ?
            '<i class="fa-solid fa-volume-high"></i>' :
            '<i class="fa-solid fa-volume-xmark"></i>';
        soundEngine.playClick();
    });

    const rulesModal = document.getElementById('rules-modal');
    document.getElementById('btn-rules-modal').addEventListener('click', () => {
        rulesModal.classList.remove('hidden');
        soundEngine.playClick();
    });
    document.getElementById('btn-close-rules').addEventListener('click', () => {
        rulesModal.classList.add('hidden');
        soundEngine.playClick();
    });

    let setupMode = 'HOST'; 
    let botTurnTimeout = null;
    let cutOverlayTimeout = null;
    let plinaOverlayTimeout = null;

    const cutOverlayEl = document.getElementById('cut-overlay');
    if (cutOverlayEl) {
        cutOverlayEl.addEventListener('click', hideOverlays);
    }
    const plinaOverlayEl = document.getElementById('plina-overlay');
    if (plinaOverlayEl) {
        plinaOverlayEl.addEventListener('click', hideOverlays);
    }

    document.getElementById('btn-open-create').addEventListener('click', () => {
        setupMode = 'HOST';
        document.getElementById('setup-title').innerText = 'Crear Nueva Sala (Host P2P)';
        document.getElementById('group-room-code').classList.add('hidden');
        showView('setup');
        soundEngine.playClick();
    });

    document.getElementById('btn-open-bots').addEventListener('click', () => {
        soundEngine.playClick();
        startBotGame();
    });

    function startBotGame() {
        setupMode = 'BOTS';
        if (botTurnTimeout) {
            clearTimeout(botTurnTimeout);
            botTurnTimeout = null;
        }

        const playerName = document.getElementById('inp-player-name')?.value.trim() || 'Tú';

        hostEngine = new ReyOCuloHost();
        myPeerId = 'human_local';

        hostEngine.addPlayer(myPeerId, playerName, false, false);

        hostEngine.addPlayer('bot_1', 'Bot Alex', false, true);
        hostEngine.addPlayer('bot_2', 'Bot Sam', false, true);
        hostEngine.addPlayer('bot_3', 'Bot Dani', false, true);

        statusPill.className = 'status-pill online';
        statusText.innerText = 'Solitario';

        document.getElementById('host-controls').classList.add('hidden');
        document.getElementById('client-lobby-msg').classList.add('hidden');

        hostEngine.startNewRound();
        broadcastHostState();
    }

    document.getElementById('btn-open-join').addEventListener('click', () => {
        setupMode = 'JOIN';
        document.getElementById('setup-title').innerText = 'Unirse a una Sala';
        document.getElementById('group-room-code').classList.remove('hidden');
        showView('setup');
        soundEngine.playClick();
    });

    document.querySelectorAll('.btn-back-home').forEach(btn => {
        btn.addEventListener('click', () => {
            if (botTurnTimeout) {
                clearTimeout(botTurnTimeout);
                botTurnTimeout = null;
            }
            showView('home');
            soundEngine.playClick();
        });
    });

    document.getElementById('btn-submit-setup').addEventListener('click', async () => {
        const playerName = document.getElementById('inp-player-name').value.trim() || 'Jugador';
        soundEngine.playClick();

        if (botTurnTimeout) {
            clearTimeout(botTurnTimeout);
            botTurnTimeout = null;
        }

        try {
            if (setupMode === 'BOTS') {

                hostEngine = new ReyOCuloHost();
                myPeerId = 'human_local';

                hostEngine.addPlayer(myPeerId, playerName, true, false);

                hostEngine.addPlayer('bot_1', 'Bot Alex', false, true);
                hostEngine.addPlayer('bot_2', 'Bot Sam', false, true);
                hostEngine.addPlayer('bot_3', 'Bot Dani', false, true);

                statusPill.className = 'status-pill host';
                statusText.innerText = '🤖 vs Bots';

                document.getElementById('host-controls').classList.add('hidden');
                document.getElementById('client-lobby-msg').classList.add('hidden');

                hostEngine.startNewRound();
                broadcastHostState();
            } else if (setupMode === 'HOST') {

                hostEngine = new ReyOCuloHost();
                const roomCode = await network.createRoom();
                myPeerId = network.peerId;

                hostEngine.addPlayer(myPeerId, playerName, true, false);

                statusPill.className = 'status-pill host';
                statusText.innerText = 'Host';

                document.getElementById('host-controls').classList.remove('hidden');
                document.getElementById('client-lobby-msg').classList.add('hidden');

                initLobbyView(roomCode);
            } else {

                const roomCode = document.getElementById('inp-room-code').value.trim().toUpperCase();
                if (!roomCode) {
                    alert('Por favor introduce el código de la sala.');
                    return;
                }

                await network.joinRoom(roomCode, playerName);
                myPeerId = network.peerId;

                statusPill.className = 'status-pill online';
                statusText.innerText = 'Conectado';

                document.getElementById('host-controls').classList.add('hidden');
                document.getElementById('client-lobby-msg').classList.remove('hidden');

                initLobbyView(roomCode);
            }
        } catch (err) {
            alert(`Error: ${err.message || err}`);
        }
    });

    function initLobbyView(roomCode) {
        document.getElementById('display-room-code').innerText = roomCode;

        const qrContainer = document.getElementById('qrcode');
        qrContainer.innerHTML = '';
        const roomUrl = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
        new QRCode(qrContainer, {
            text: roomUrl,
            width: 140,
            height: 140
        });

        document.getElementById('btn-copy-code').onclick = () => {
            navigator.clipboard.writeText(roomUrl);
            alert('¡Enlace de la sala copiado al portapapeles!');
            soundEngine.playClick();
        };

        showView('lobby');
        updateLobbyUI();
    }

    document.querySelectorAll('#deck-selector .seg-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#deck-selector .seg-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (hostEngine) {
                hostEngine.deckOverride = btn.dataset.decks;
            }
            soundEngine.playClick();
        });
    });

    document.getElementById('btn-start-game').addEventListener('click', () => {
        if (!hostEngine) return;
        soundEngine.playClick();
        try {
            hostEngine.startNewRound();
            broadcastHostState();
        } catch (err) {
            alert(err.message);
        }
    });

    network.callbacks.onPlayerJoined = (playerData) => {
        if (hostEngine) {
            hostEngine.addPlayer(playerData.peerId, playerData.name, false);
            broadcastHostState();
        }
        soundEngine.playClick();
    };

    network.callbacks.onPlayerLeft = (peerId) => {
        if (hostEngine) {
            hostEngine.removePlayer(peerId);
            broadcastHostState();
        }
    };

    network.callbacks.onActionReceived = (actionType, data, senderPeerId) => {
        if (!hostEngine) return;

        try {
            if (actionType === 'ACTION_PLAY') {
                hostEngine.playMove(senderPeerId, data.cardUids);
                soundEngine.playCard();
            } else if (actionType === 'ACTION_PASS') {
                hostEngine.passTurn(senderPeerId);
                soundEngine.playPass();
            } else if (actionType === 'ACTION_GIVE_TRIBUTE') {
                hostEngine.submitTributeReturn(senderPeerId, data.cardUids);
                soundEngine.playCard();
            }
            broadcastHostState();
        } catch (err) {
            console.error('Action error:', err);

            broadcastHostState();
        }
    };

    network.callbacks.onStateSync = (snapshot) => {
        currentState = snapshot;
        renderState(snapshot);
    };

    network.callbacks.onError = (msg) => {
        alert(msg);
    };

    function broadcastHostState() {
        if (!hostEngine) return;
        network.broadcastState((peerId) => hostEngine.createSnapshotForPlayer(peerId));

        currentState = hostEngine.createSnapshotForPlayer(myPeerId);

        if (hostEngine.clearTransientEvents) {
            hostEngine.clearTransientEvents();
        }
        renderState(currentState);
    }

    function updateLobbyUI() {
        if (!currentState && hostEngine) {
            currentState = hostEngine.createSnapshotForPlayer(myPeerId);
        }
        if (!currentState) return;

        const playersList = document.getElementById('lobby-players-list');
        playersList.innerHTML = '';

        currentState.players.forEach(p => {
            const li = document.createElement('li');
            li.className = 'player-item';
            li.innerHTML = `
                <div class="player-name-badge">
                    <div class="avatar-circle">${p.name.charAt(0).toUpperCase()}</div>
                    <span>${p.name}</span>
                </div>
                ${p.isHost ? '<span class="host-tag">HOST</span>' : ''}
            `;
            playersList.appendChild(li);
        });

        document.getElementById('connected-count').innerText = currentState.players.length;

        const btnStart = document.getElementById('btn-start-game');
        if (btnStart) {
            btnStart.disabled = currentState.players.length < 3;
        }
    }

    function triggerBotTurnIfNeeded() {
        if (!hostEngine || hostEngine.phase !== 'PLAYING') return;

        const activePlayer = hostEngine.players.find(p => p.id === hostEngine.activePlayerId);
        if (activePlayer && activePlayer.isBot && activePlayer.finishedRank === null) {
            if (botTurnTimeout) clearTimeout(botTurnTimeout);

            botTurnTimeout = setTimeout(() => {
                botTurnTimeout = null;
                if (!hostEngine || hostEngine.phase !== 'PLAYING') return;
                if (hostEngine.activePlayerId !== activePlayer.id) return;

                executeBotTurn(activePlayer.id);
            }, 850);
        }
    }

    function computeBotMove(bot, table) {
        const groups = {};
        bot.hand.forEach(card => {
            if (!groups[card.power]) groups[card.power] = [];
            groups[card.power].push(card);
        });

        const powers = Object.keys(groups).map(Number).sort((a, b) => a - b);
        const dosDeOrosCard = bot.hand.find(c => c.suit === 'oros' && c.value === 2);

        if (!table.lastCombo || table.lastCombo.length === 0) {

            let bestPowerToLead = powers.find(p => p < 10 && groups[p].length === 1);
            if (bestPowerToLead === undefined) bestPowerToLead = powers[0]; 

            if (dosDeOrosCard && bot.hand.length <= 3) return [dosDeOrosCard.uid];

            return groups[bestPowerToLead].map(c => c.uid);
        }

        const requiredCount = table.lastCombo.length;
        const tablePower = table.lastCombo[0].power;

        if (dosDeOrosCard && (bot.hand.length <= 3 || tablePower >= 7)) {
            return [dosDeOrosCard.uid];
        }

        if (tablePower < 10 && groups[tablePower] && groups[tablePower].length >= requiredCount) {
            return groups[tablePower].slice(0, requiredCount).map(c => c.uid);
        }

        let chosenPower = null;

        for (const p of powers) {
            if (p < 10 && p > tablePower && groups[p].length === requiredCount) {
                chosenPower = p; break;
            }
        }

        if (!chosenPower) {
            for (const p of powers) {
                if (p < 10 && p > tablePower && groups[p].length > requiredCount) {

                    if (requiredCount === 1 && p >= 7 && Math.random() > 0.5) {
                        continue; 
                    }
                    chosenPower = p; break;
                }
            }
        }

        if (chosenPower) {
            return groups[chosenPower].slice(0, requiredCount).map(c => c.uid);
        }

        if (groups[10] && groups[10].length >= requiredCount) {
            if (tablePower >= 6 || bot.hand.length <= 4) {

                if (bot.hand.length === requiredCount) {
                    return null; 
                }
                return groups[10].slice(0, requiredCount).map(c => c.uid);
            }
        }

        return null;
    }

    function executeBotTurn(botId) {
        if (!hostEngine) return;
        const bot = hostEngine.players.find(p => p.id === botId);
        if (!bot || bot.hand.length === 0) return;

        const moveUids = computeBotMove(bot, hostEngine.table);
        if (moveUids && moveUids.length > 0) {
            try {
                hostEngine.playMove(botId, moveUids);
                soundEngine.playCard();
            } catch (err) {
                console.error('Error en turno de bot, pasando turno:', err);
                try {
                    hostEngine.passTurn(botId);
                    soundEngine.playPass();
                } catch (e) { }
            }
        } else {
            try {
                hostEngine.passTurn(botId);
                soundEngine.playPass();
            } catch (err) {
                console.error('Error al pasar turno de bot:', err);
            }
        }

        broadcastHostState();
    }

    function renderState(snapshot) {
        if (!snapshot) return;

        if (snapshot.phase === 'LOBBY') {
            updateLobbyUI();
            showView('lobby');
            return;
        }

        if (snapshot.phase === 'ROUND_OVER') {
            renderRoundOverView(snapshot);
            showView('roundOver');
            return;
        }

        showView('game');

        const roundNumEl = document.getElementById('game-round-num');
        if (roundNumEl) roundNumEl.innerText = snapshot.roundNumber;

        const phaseBadge = document.getElementById('phase-badge');
        if (phaseBadge) {
            phaseBadge.innerText = snapshot.phase === 'TRIBUTE' ? 'FASE DE TRIBUTO' : 'FASE DE JUEGO';
            phaseBadge.style.borderColor = snapshot.phase === 'TRIBUTE' ? 'var(--primary)' : 'var(--accent-blue)';
        }

        if (snapshot.logs && snapshot.logs.length > 0) {
            const logEl = document.getElementById('log-latest');
            if (logEl) logEl.innerText = snapshot.logs[0];
        }

        renderPlayersStrip(snapshot);

        renderFeltTable(snapshot);

        renderTributeModal(snapshot);

        renderPlayerHand(snapshot);

        updateActionButtons(snapshot);

        if (snapshot.phase === 'PLAYING') {
            triggerBotTurnIfNeeded();
        }
    }

    function renderPlayersStrip(snapshot) {
        const strip = document.getElementById('players-strip');
        strip.innerHTML = '';

        snapshot.players.forEach(p => {
            const isTurn = snapshot.activePlayerId === p.id;
            const roleData = ROLE_INFO[p.role] || { icon: '', name: 'Jugador' };

            const item = document.createElement('div');
            item.className = `player-avatar-item ${isTurn ? 'active-turn' : ''} ${p.hasPassed ? 'passed' : ''} ${p.finishedRank !== null ? 'finished' : ''}`;
            item.innerHTML = `
                <div class="player-avatar-wrapper">
                    <div class="avatar-circle">${p.isBot ? '🤖' : p.name.charAt(0).toUpperCase()}</div>
                    ${roleData.icon ? `<span class="role-icon-badge" title="${roleData.name}">${roleData.icon}</span>` : ''}
                    ${p.finishedRank !== null ? `<span class="rank-badge">#${p.finishedRank}</span>` : ''}
                </div>
                <div class="player-caption">
                    <span class="p-name">${p.name}</span>
                    <span class="p-count">(${p.cardCount})</span>
                </div>
            `;
            strip.appendChild(item);
        });
    }

    function renderFeltTable(snapshot) {
        const stack = document.getElementById('played-cards-stack');
        stack.innerHTML = '';

        if (snapshot.table.lastCombo && snapshot.table.lastCombo.length > 0) {
            snapshot.table.lastCombo.forEach(card => {
                const cardHTML = SpanishDeck.renderCardHTML(card, { small: false });
                const wrapper = document.createElement('div');
                wrapper.innerHTML = cardHTML;
                stack.appendChild(wrapper.firstElementChild);
            });

            document.getElementById('last-move-info').classList.remove('hidden');
            document.getElementById('last-player-name').innerText = snapshot.table.lastPlayerName || '';
            document.getElementById('last-combo-desc').innerText = `${snapshot.table.lastCombo.length}x ${SpanishDeck.CARD_NAMES[snapshot.table.lastCombo[0].value]}`;
        } else {
            document.getElementById('last-move-info').classList.add('hidden');
        }

        document.getElementById('pile-size').innerText = snapshot.table.pileSize;

        if (snapshot.table.wasCut && typeof soundEngine !== 'undefined' && soundEngine.playCut) {
            soundEngine.playCut();
        }

        const plinaOverlay = document.getElementById('plina-overlay');
        if (plinaOverlay) {
            if (snapshot.table.wasPlina) {
                document.getElementById('plina-desc').innerText = snapshot.table.plinaSkippedName ?
                    `¡Se le salta el turno a ${snapshot.table.plinaSkippedName}!` : '¡Turno saltado!';
                plinaOverlay.classList.remove('hidden');
                if (plinaOverlayTimeout) clearTimeout(plinaOverlayTimeout);
                plinaOverlayTimeout = setTimeout(() => {
                    plinaOverlay.classList.add('hidden');
                    plinaOverlayTimeout = null;
                }, 1300);
            } else {
                plinaOverlay.classList.add('hidden');
                if (plinaOverlayTimeout) {
                    clearTimeout(plinaOverlayTimeout);
                    plinaOverlayTimeout = null;
                }
            }
        }
    }

    function renderPlayerHand(snapshot) {
        const fan = document.getElementById('cards-fan');
        fan.innerHTML = '';

        const hand = snapshot.myHand || [];
        document.getElementById('my-card-count').innerText = hand.length;

        const currentHandUids = new Set(hand.map(c => c.uid));
        for (const uid of selectedCardUids) {
            if (!currentHandUids.has(uid)) selectedCardUids.delete(uid);
        }

        hand.forEach((card) => {
            const isSelected = selectedCardUids.has(card.uid);

            let isDisabled = false;
            if (selectedCardUids.size > 0 && !isSelected) {
                const firstSelectedUid = Array.from(selectedCardUids)[0];
                const firstSelectedCard = hand.find(c => c.uid === firstSelectedUid);
                if (firstSelectedCard && firstSelectedCard.power !== card.power) {
                    isDisabled = true;
                }
            }

            const cardHTML = SpanishDeck.renderCardHTML(card, { selected: isSelected, disabled: isDisabled });
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = cardHTML;
            const cardElem = tempDiv.firstElementChild;

            cardElem.addEventListener('click', () => {
                if (isDisabled) return;
                soundEngine.playClick();

                if (selectedCardUids.has(card.uid)) {
                    selectedCardUids.delete(card.uid);
                } else {
                    selectedCardUids.add(card.uid);
                }

                renderPlayerHand(snapshot);
                updateActionButtons(snapshot);
            });

            fan.appendChild(cardElem);
        });

        const statusEl = document.getElementById('selection-text');
        if (selectedCardUids.size === 0) {
            statusEl.innerText = 'Selecciona tus cartas';
        } else {
            const firstUid = Array.from(selectedCardUids)[0];
            const firstCard = hand.find(c => c.uid === firstUid);
            const valName = firstCard ? SpanishDeck.CARD_NAMES[firstCard.value] : '';
            statusEl.innerText = `${selectedCardUids.size}x ${valName} seleccionado(s)`;
        }
    }

    function updateActionButtons(snapshot) {
        const btnPlay = document.getElementById('btn-play-cards');
        const btnPass = document.getElementById('btn-pass-turn');
        const playBtnCount = document.getElementById('play-btn-count');

        const isMyTurn = snapshot.activePlayerId === myPeerId;
        const isPlayingPhase = snapshot.phase === 'PLAYING';

        playBtnCount.innerText = selectedCardUids.size > 0 ? `(${selectedCardUids.size})` : '';

        if (!isMyTurn || !isPlayingPhase) {
            btnPlay.disabled = true;
            btnPass.disabled = true;
            return;
        }

        btnPass.disabled = !snapshot.table.lastCombo || snapshot.table.lastCombo.length === 0;

        if (selectedCardUids.size === 0) {
            btnPlay.disabled = true;
        } else {

            const selectedUidsArray = Array.from(selectedCardUids);
            if (hostEngine) {
                const val = hostEngine.validateMove(myPeerId, selectedUidsArray);
                btnPlay.disabled = !val.valid;
            } else {
                btnPlay.disabled = false; 
            }
        }
    }

    function sendGameAction(actionType, data = {}) {
        if (setupMode === 'BOTS' || network.isHost) {
            try {
                if (actionType === 'ACTION_PLAY') {
                    hostEngine.playMove(myPeerId, data.cardUids);
                    soundEngine.playCard();
                } else if (actionType === 'ACTION_PASS') {
                    hostEngine.passTurn(myPeerId);
                    soundEngine.playPass();
                } else if (actionType === 'ACTION_GIVE_TRIBUTE') {
                    hostEngine.submitTributeReturn(myPeerId, data.cardUids);
                    soundEngine.playCard();
                }
                broadcastHostState();
            } catch (err) {
                alert(err.message);
            }
        } else {
            network.sendActionToHost(actionType, data);
        }
    }

    document.getElementById('btn-play-cards').addEventListener('click', () => {
        if (selectedCardUids.size === 0) return;
        const cardUids = Array.from(selectedCardUids);
        selectedCardUids.clear();
        sendGameAction('ACTION_PLAY', { cardUids });
    });

    document.getElementById('btn-pass-turn').addEventListener('click', () => {
        selectedCardUids.clear();
        sendGameAction('ACTION_PASS', {});
    });

    function renderTributeModal(snapshot) {
        const modal = document.getElementById('tribute-modal');
        if (snapshot.phase !== 'TRIBUTE' || !snapshot.pendingTributes) {
            modal.classList.add('hidden');
            return;
        }

        const myTribute = snapshot.pendingTributes.find(t => t.giverId === myPeerId);
        if (!myTribute) {
            modal.classList.add('hidden');
            return;
        }

        modal.classList.remove('hidden');
        document.getElementById('tribute-instructions').innerText =
            `Has recibido las cartas de ${myTribute.receiverName}. Selecciona ${myTribute.count} carta(s) de tu mano para devolverle:`;
        document.getElementById('tribute-count-needed').innerText = myTribute.count;

        const selectorContainer = document.getElementById('tribute-hand-selector');
        selectorContainer.innerHTML = '';

        const hand = snapshot.myHand || [];
        hand.forEach(card => {
            const isSelected = selectedTributeUids.has(card.uid);
            const cardHTML = SpanishDeck.renderCardHTML(card, { selected: isSelected, small: true });
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = cardHTML;
            const cardElem = tempDiv.firstElementChild;

            cardElem.addEventListener('click', () => {
                soundEngine.playClick();
                if (selectedTributeUids.has(card.uid)) {
                    selectedTributeUids.delete(card.uid);
                } else {
                    if (selectedTributeUids.size < myTribute.count) {
                        selectedTributeUids.add(card.uid);
                    }
                }
                renderTributeModal(snapshot);
            });

            selectorContainer.appendChild(cardElem);
        });

        const btnSubmit = document.getElementById('btn-submit-tribute');
        btnSubmit.disabled = selectedTributeUids.size !== myTribute.count;
        btnSubmit.onclick = () => {
            const cardUids = Array.from(selectedTributeUids);
            selectedTributeUids.clear();
            sendGameAction('ACTION_GIVE_TRIBUTE', { cardUids });
            modal.classList.add('hidden');
        };
    }

    function renderRoundOverView(snapshot) {
        document.getElementById('finished-round-num').innerText = snapshot.roundNumber;
        const podiumList = document.getElementById('podium-list');
        podiumList.innerHTML = '';

        const sorted = [...snapshot.players].sort((a, b) => (a.finishedRank || 99) - (b.finishedRank || 99));

        sorted.forEach(p => {
            const roleData = ROLE_INFO[p.role] || { icon: '', name: p.role || 'Neutro' };
            const div = document.createElement('div');
            div.className = `podium-item ${roleData.class || ''}`;
            div.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    <span class="rank-num">#${p.finishedRank || '-'}</span>
                    <strong>${p.name}</strong>
                </div>
                <div class="podium-role-badge">
                    ${roleData.icon} ${roleData.name}
                </div>
            `;
            podiumList.appendChild(div);
        });

        const btnNext = document.getElementById('btn-next-round');
        const waitingMsg = document.getElementById('podium-waiting-msg');

        if (network.isHost || setupMode === 'BOTS') {
            btnNext.classList.remove('hidden');
            waitingMsg.classList.add('hidden');
            btnNext.onclick = () => {
                if (hostEngine) {
                    hostEngine.startNewRound();
                    broadcastHostState();
                }
            };
        } else {
            btnNext.classList.add('hidden');
            waitingMsg.classList.remove('hidden');
        }

        soundEngine.playVictory();
    }

    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
        document.getElementById('inp-room-code').value = roomParam.toUpperCase();
        isSetupHostMode = false;
        document.getElementById('setup-title').innerText = `Unirse a Sala (${roomParam.toUpperCase()})`;
        document.getElementById('group-room-code').classList.remove('hidden');
        showView('setup');
    }
});
