

class ReyOCuloHost {
    constructor() {
        this.resetGame();
    }

    resetGame() {
        this.phase = 'LOBBY';
        this.roundNumber = 0;
        this.deckOverride = 'AUTO';
        this.players = [];
        this.activePlayerId = null;
        this.table = {
            lastCombo: null,
            lastPlayerId: null,
            lastPlayerName: null,
            pileSize: 0,
            recentCards: [],
            consecutiveSameValueCount: 0,
            lastPowerPlayed: null,
            plinaSkippedPlayerId: null
        };
        this.pendingTributes = [];
        this.logs = [];
        this.finishedCounter = 1;
    }

    addLog(msg) {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        this.logs.unshift(`[${timestamp}] ${msg}`);
        if (this.logs.length > 50) this.logs.pop();
    }

    addPlayer(id, name, isHost = false, isBot = false) {
        let existing = this.players.find(p => p.id === id);
        if (existing) {
            existing.name = name;
            existing.isConnected = true;
            existing.isBot = isBot;
            this.addLog(`Jugador ${name} reconectado.`);
            return existing;
        }

        const player = {
            id,
            name: name || `Jugador ${this.players.length + 1}`,
            isHost,
            isConnected: true,
            isBot,
            hand: [],
            role: null,
            finishedRank: null,
            hasPassed: false
        };

        this.players.push(player);
        this.addLog(`${player.name} se ha unido a la sala.`);
        return player;
    }

    removePlayer(id) {
        const player = this.players.find(p => p.id === id);
        if (player) {
            player.isConnected = false;
            this.addLog(`${player.name} se ha desconectado.`);
        }
    }

    calculateDeckCount() {
        if (this.deckOverride !== 'AUTO') {
            return parseInt(this.deckOverride, 10) || 1;
        }
        const count = this.players.length;
        if (count <= 5) return 1;
        if (count <= 9) return 2;
        return 3;
    }

    calculateRolesForCount(totalPlayers) {
        if (totalPlayers === 3) {
            return ['PRESIDENTE', 'NEUTRO', 'CULO'];
        }
        if (totalPlayers === 4) {
            return ['PRESIDENTE', 'VICEPRESIDENTE', 'VICECULO', 'CULO'];
        }
        if (totalPlayers === 5 || totalPlayers === 6) {
            const neutroCount = totalPlayers - 4;
            const neutros = Array(neutroCount).fill('NEUTRO');
            return ['PRESIDENTE', 'VICEPRESIDENTE', ...neutros, 'VICECULO', 'CULO'];
        }

        const neutroCount = totalPlayers - 4;
        const neutros = Array(neutroCount).fill('NEUTRO');
        return ['GRAN_PRESIDENTE', 'PRESIDENTE', ...neutros, 'CULO', 'GRAN_CULO'];
    }

    startNewRound() {
        if (this.players.length < 3) {
            throw new Error('Se necesitan al menos 3 jugadores para empezar.');
        }

        this.roundNumber++;
        this.finishedCounter = 1;
        this.table = {
            lastCombo: null,
            lastPlayerId: null,
            lastPlayerName: null,
            pileSize: 0,
            recentCards: [],
            consecutiveSameValueCount: 0,
            lastPowerPlayed: null,
            plinaSkippedPlayerId: null
        };

        this.players.forEach(p => {
            p.finishedRank = null;
            p.hasPassed = false;
            p.hand = [];
        });

        const numDecks = this.calculateDeckCount();
        const fullDeck = SpanishDeck.createMultipleDecks(numDecks);
        const shuffled = SpanishDeck.shuffleCards(fullDeck);

        let playerIndex = 0;
        while (shuffled.length > 0) {
            const card = shuffled.pop();
            this.players[playerIndex].hand.push(card);
            playerIndex = (playerIndex + 1) % this.players.length;
        }

        this.players.forEach(p => {
            p.hand.sort((a, b) => a.power - b.power);
        });

        this.addLog(`--- Ronda ${this.roundNumber} iniciada con ${numDecks} baraja(s) ---`);

        if (this.roundNumber === 1) {

            let starter = this.players.find(p => p.hand.some(c => c.uid === 'd0_oros_3'));
            if (!starter) {

                starter = this.players.find(p => p.hand.some(c => c.suit === 'oros' && c.value === 3));
            }
            if (!starter) {
                starter = this.players[0];
            }

            this.activePlayerId = starter.id;
            this.phase = 'PLAYING';
            this.addLog(`Empieza la partida ${starter.name} por tener el 3 de Oros.`);
        } else {

            this.setupTributePhase();
        }
    }

    setupTributePhase() {
        this.pendingTributes = [];
        const total = this.players.length;
        const roleAssignment = this.calculateRolesForCount(total);

        const roleByPlayerId = {};
        this.players.forEach(p => {
            roleByPlayerId[p.id] = p.role;
        });

        const granCulo = this.players.find(p => p.role === 'GRAN_CULO');
        const granPresi = this.players.find(p => p.role === 'GRAN_PRESIDENTE');
        if (granCulo && granPresi) {
            this.createTributePair(granCulo, granPresi, 3);
        }

        const culo = this.players.find(p => p.role === 'CULO');
        const presi = this.players.find(p => p.role === 'PRESIDENTE');
        if (culo && presi) {
            this.createTributePair(culo, presi, 2);
        }

        const viceCulo = this.players.find(p => p.role === 'VICECULO');
        const vicePresi = this.players.find(p => p.role === 'VICEPRESIDENTE');
        if (viceCulo && vicePresi) {
            this.createTributePair(viceCulo, vicePresi, 1);
        }

        if (this.pendingTributes.length > 0) {
            this.phase = 'TRIBUTE';
            this.addLog(`Fase de tributos iniciada.`);
            this.autoProcessBotTributes();
        } else {

            this.phase = 'PLAYING';
            const lowestRolePlayer = this.players.find(p => p.role === 'GRAN_CULO') ||
                this.players.find(p => p.role === 'CULO') ||
                this.players[0];
            this.activePlayerId = lowestRolePlayer.id;
            this.addLog(`Sale ${lowestRolePlayer.name} abriendo la mano.`);
        }
    }

    autoProcessBotTributes() {
        if (this.phase !== 'TRIBUTE') return;

        let pendingBotTribute = this.pendingTributes.find(t => {
            if (t.status !== 'PENDING') return false;
            const giver = this.players.find(p => p.id === t.giverId);
            return giver && giver.isBot;
        });

        while (pendingBotTribute) {
            const giver = this.players.find(p => p.id === pendingBotTribute.giverId);
            giver.hand.sort((a, b) => a.power - b.power);
            const cardUids = giver.hand.slice(0, pendingBotTribute.count).map(c => c.uid);

            this.submitTributeReturn(giver.id, cardUids);

            pendingBotTribute = this.pendingTributes.find(t => {
                if (t.status !== 'PENDING') return false;
                const g = this.players.find(p => p.id === t.giverId);
                return g && g.isBot;
            });
        }
    }

    createTributePair(lowPlayer, highPlayer, count) {

        lowPlayer.hand.sort((a, b) => b.power - a.power);
        const highestCards = lowPlayer.hand.splice(0, count);

        highPlayer.hand.push(...highestCards);
        highPlayer.hand.sort((a, b) => a.power - b.power);

        this.addLog(`🧹 ${lowPlayer.name} (${lowPlayer.role}) entrega sus ${count} mejores cartas a 👑 ${highPlayer.name} (${highPlayer.role}).`);

        this.pendingTributes.push({
            giverId: highPlayer.id,
            receiverId: lowPlayer.id,
            count: count,
            giverName: highPlayer.name,
            receiverName: lowPlayer.name,
            receivedCards: highestCards,
            status: 'PENDING'
        });
    }

    submitTributeReturn(giverId, cardUids) {
        const tributeIndex = this.pendingTributes.findIndex(t => t.giverId === giverId && t.status === 'PENDING');
        if (tributeIndex === -1) {
            throw new Error('No tienes tributo pendiente de entrega.');
        }

        const tribute = this.pendingTributes[tributeIndex];
        if (cardUids.length !== tribute.count) {
            throw new Error(`Debes seleccionar exactamente ${tribute.count} carta(s).`);
        }

        const giver = this.players.find(p => p.id === giverId);
        const receiver = this.players.find(p => p.id === tribute.receiverId);

        const cardsToReturn = [];
        for (const uid of cardUids) {
            const idx = giver.hand.findIndex(c => c.uid === uid);
            if (idx === -1) throw new Error('Carta no encontrada en tu mano.');
            cardsToReturn.push(giver.hand[idx]);
        }

        cardUids.forEach(uid => {
            const idx = giver.hand.findIndex(c => c.uid === uid);
            if (idx !== -1) giver.hand.splice(idx, 1);
        });
        receiver.hand.push(...cardsToReturn);

        giver.hand.sort((a, b) => a.power - b.power);
        receiver.hand.sort((a, b) => a.power - b.power);

        tribute.status = 'COMPLETED';
        this.addLog(`👑 ${giver.name} ha devuelto ${tribute.count} carta(s) a ${receiver.name}.`);

        const remaining = this.pendingTributes.filter(t => t.status === 'PENDING');
        if (remaining.length === 0) {
            this.phase = 'PLAYING';

            const lowestRolePlayer = this.players.find(p => p.role === 'GRAN_CULO') ||
                this.players.find(p => p.role === 'CULO') ||
                this.players[0];
            this.activePlayerId = lowestRolePlayer.id;
            this.addLog(`Tributos completados. Comienza la ronda con el turno de ${lowestRolePlayer.name}.`);
        }
    }

    validateMove(playerId, cardUids) {
        if (this.phase !== 'PLAYING') {
            return { valid: false, reason: 'No se están aceptando jugadas.' };
        }
        if (this.activePlayerId !== playerId) {
            return { valid: false, reason: 'No es tu turno.' };
        }
        if (!Array.isArray(cardUids) || cardUids.length === 0) {
            return { valid: false, reason: 'Debes seleccionar al menos 1 carta.' };
        }

        const player = this.players.find(p => p.id === playerId);
        if (!player) return { valid: false, reason: 'Jugador no encontrado.' };

        const cardsToPlay = [];
        for (const uid of cardUids) {
            const card = player.hand.find(c => c.uid === uid);
            if (!card) return { valid: false, reason: 'No posees una de las cartas seleccionadas.' };
            cardsToPlay.push(card);
        }

        const firstPower = cardsToPlay[0].power;
        const allSamePower = cardsToPlay.every(c => c.power === firstPower);
        if (!allSamePower) {
            return { valid: false, reason: 'Todas las cartas jugadas deben tener el mismo valor.' };
        }

        const isDosDeOros = cardsToPlay.some(c => c.suit === 'oros' && c.value === 2);

        if (!this.table.lastCombo || this.table.lastCombo.length === 0) {
            return { valid: true, isCut: isDosDeOros };
        }

        if (!isDosDeOros && cardsToPlay.length !== this.table.lastCombo.length) {
            return { valid: false, reason: `Debes tirar exactamente ${this.table.lastCombo.length} carta(s).` };
        }

        if (isDosDeOros) {
            return { valid: true, isCut: true };
        }

        const tablePower = this.table.lastCombo[0].power;
        if (firstPower < tablePower) {
            return { valid: false, reason: 'El valor de tus cartas debe ser igual o superior.' };
        }

        const isPlina = (firstPower === tablePower);

        return { valid: true, isCut: false, isPlina };
    }

    playMove(playerId, cardUids) {
        const validation = this.validateMove(playerId, cardUids);
        if (!validation.valid) {
            throw new Error(validation.reason);
        }

        const player = this.players.find(p => p.id === playerId);
        const cardsPlayed = cardUids.map(uid => player.hand.find(c => c.uid === uid));

        player.hand = player.hand.filter(c => !cardUids.includes(c.uid));

        const playedPower = cardsPlayed[0].power;
        const playedValueName = SpanishDeck.CARD_NAMES[cardsPlayed[0].value];
        const isDosDeOros = cardsPlayed.some(c => c.suit === 'oros' && c.value === 2);

        this.addLog(`🃏 ${player.name} ha jugado ${cardsPlayed.length}x ${playedValueName}`);

        this.table.wasCut = false;
        this.table.wasPlina = false;
        this.table.plinaSkippedName = '';
        this.table.plinaSkippedPlayerId = null;

        this.table.pileSize += cardsPlayed.length;
        this.table.recentCards = cardsPlayed;
        this.table.lastCombo = cardsPlayed;
        this.table.lastPlayerId = playerId;
        this.table.lastPlayerName = player.name;

        if (this.table.lastPowerPlayed === playedPower) {
            this.table.consecutiveSameValueCount += cardsPlayed.length;
        } else {
            this.table.consecutiveSameValueCount = cardsPlayed.length;
            this.table.lastPowerPlayed = playedPower;
        }

        let isCut = validation.isCut || (this.table.consecutiveSameValueCount >= 4) || isDosDeOros;
        let isPlina = validation.isPlina && !isCut;

        let playerFinished = false;
        if (player.hand.length === 0) {
            player.finishedRank = this.finishedCounter++;
            playerFinished = true;
            this.addLog(`🎉 ¡${player.name} se ha quedado sin cartas! Clasificación: #${player.finishedRank}`);
        }

        if (isCut) {

            if (isDosDeOros) {
                this.addLog(`🌟 ¡2 DE OROS! ${player.name} ha tirado el 2 de Oros y gana la baza (limpia la mano).`);
            } else {
                this.addLog(`💥 ¡MESA CORTADA! ${this.table.consecutiveSameValueCount >= 4 ? '(4 cartas iguales acumuladas)' : '(Por un 2)'}`);
            }
            this.clearTable(true);

            if (!playerFinished) {
                this.activePlayerId = playerId;
            } else {
                this.activePlayerId = this.getNextActivePlayerId(playerId);
            }
        } else if (isPlina) {

            const nextActiveId = this.getNextActivePlayerId(playerId);
            const skippedPlayer = this.players.find(p => p.id === nextActiveId);

            this.table.wasPlina = true;
            this.table.plinaSkippedName = skippedPlayer ? skippedPlayer.name : '';
            this.table.plinaSkippedPlayerId = skippedPlayer ? skippedPlayer.id : null;

            if (skippedPlayer) {
                this.addLog(`⚡ ¡PLINA! ${player.name} ha hecho Plina con ${cardsPlayed.length}x ${playedValueName}. ¡Se le salta el turno a ${skippedPlayer.name}!`);
            } else {
                this.addLog(`⚡ ¡PLINA! ${player.name} ha hecho Plina con ${cardsPlayed.length}x ${playedValueName}.`);
            }

            this.activePlayerId = this.getNextActivePlayerId(nextActiveId);
            this.checkTableClearStatus();
        } else {

            this.activePlayerId = this.getNextActivePlayerId(playerId);
            this.checkTableClearStatus();
        }

        this.checkRoundOver();
    }

    passTurn(playerId) {
        if (this.phase !== 'PLAYING') throw new Error('No estás en fase de juego.');
        if (this.activePlayerId !== playerId) throw new Error('No es tu turno.');

        const player = this.players.find(p => p.id === playerId);
        player.hasPassed = true;
        this.addLog(`🚪 ${player.name} ha pasado turno.`);

        this.table.wasCut = false;
        this.table.wasPlina = false;
        this.table.plinaSkippedName = '';
        this.table.plinaSkippedPlayerId = null;

        this.activePlayerId = this.getNextActivePlayerId(playerId);
        this.checkTableClearStatus();
        this.checkRoundOver();
    }

    clearTable(isCut = false) {
        this.table.lastCombo = null;
        this.table.pileSize = 0;
        this.table.consecutiveSameValueCount = 0;
        this.table.lastPowerPlayed = null;
        this.table.wasCut = isCut;
        this.table.plinaSkippedPlayerId = null;

        this.players.forEach(p => {
            if (p.finishedRank === null) {
                p.hasPassed = false;
            }
        });
    }

    checkTableClearStatus() {
        if (!this.table.lastCombo) return;

        const activePlayers = this.players.filter(p => p.finishedRank === null);
        const otherActivePlayers = activePlayers.filter(p => p.id !== this.table.lastPlayerId);

        const allOthersPassed = otherActivePlayers.length > 0 && otherActivePlayers.every(p => p.hasPassed || p.id === this.table.plinaSkippedPlayerId);

        if (allOthersPassed) {
            this.addLog(`✨ Todos han pasado. Limpieza de mesa para ${this.table.lastPlayerName}.`);
            const lastPlayer = this.players.find(p => p.id === this.table.lastPlayerId);
            this.clearTable();

            if (lastPlayer && lastPlayer.finishedRank === null) {
                this.activePlayerId = lastPlayer.id;
            } else {

                this.activePlayerId = this.getNextActivePlayerId(this.table.lastPlayerId);
            }
        }
    }

    getNextActivePlayerId(currentId) {
        const activeCount = this.players.filter(p => p.finishedRank === null).length;
        if (activeCount <= 1) return currentId;

        const currentIndex = this.players.findIndex(p => p.id === currentId);
        let nextIndex = (currentIndex + 1) % this.players.length;
        let attempts = 0;

        while (attempts < this.players.length) {
            const p = this.players[nextIndex];

            if (p.finishedRank === null && !p.hasPassed && p.id !== this.table.plinaSkippedPlayerId) {
                return p.id;
            }
            nextIndex = (nextIndex + 1) % this.players.length;
            attempts++;
        }

        return this.table.lastPlayerId || currentId;
    }

    checkRoundOver() {
        const remainingActive = this.players.filter(p => p.finishedRank === null);

        if (remainingActive.length === 1) {
            const lastPlayer = remainingActive[0];
            lastPlayer.finishedRank = this.finishedCounter++;
            this.addLog(`🏁 Ronda finalizada. Último lugar (#${lastPlayer.finishedRank}): ${lastPlayer.name}`);
            this.finishRound();
        } else if (remainingActive.length === 0) {
            this.finishRound();
        }
    }

    finishRound() {
        this.phase = 'ROUND_OVER';

        const penaltyPlayerIds = new Set();
        this.players.forEach(p => {
            if (p.hand && p.hand.some(c => c.suit === 'oros' && c.value === 2)) {
                penaltyPlayerIds.add(p.id);
                this.addLog(`💩 ¡${p.name} no usó el 2 de Oros antes de terminar la ronda! Es castigado a ser Culo en la siguiente ronda.`);
            }
        });

        const nonPenaltyPlayers = [...this.players]
            .filter(p => !penaltyPlayerIds.has(p.id))
            .sort((a, b) => (a.finishedRank || 999) - (b.finishedRank || 999));

        const penaltyPlayers = [...this.players]
            .filter(p => penaltyPlayerIds.has(p.id))
            .sort((a, b) => (a.finishedRank || 999) - (b.finishedRank || 999));

        const sorted = [...nonPenaltyPlayers, ...penaltyPlayers];
        const roles = this.calculateRolesForCount(this.players.length);

        sorted.forEach((p, idx) => {
            p.role = roles[idx] || 'NEUTRO';
        });

        this.addLog(`👑 Nuevos rangos asignados para la siguiente ronda.`);
    }

    createSnapshotForPlayer(peerId) {
        const player = this.players.find(p => p.id === peerId);

        return {
            phase: this.phase,
            roundNumber: this.roundNumber,
            activePlayerId: this.activePlayerId,
            table: {
                lastCombo: this.table.lastCombo,
                lastPlayerId: this.table.lastPlayerId,
                lastPlayerName: this.table.lastPlayerName,
                pileSize: this.table.pileSize,
                recentCards: this.table.recentCards,
                wasCut: this.table.wasCut || false,
                wasPlina: this.table.wasPlina || false,
                plinaSkippedName: this.table.plinaSkippedName || '',
                plinaSkippedPlayerId: this.table.plinaSkippedPlayerId || null
            },
            players: this.players.map(p => ({
                id: p.id,
                name: p.name,
                cardCount: p.hand.length,
                role: p.role,
                hasPassed: p.hasPassed,
                finishedRank: p.finishedRank,
                isHost: p.isHost,
                isConnected: p.isConnected,
                isBot: p.isBot || false
            })),
            myHand: player ? [...player.hand] : [],
            pendingTributes: this.pendingTributes
                .filter(t => t.status === 'PENDING')
                .map(t => ({
                    giverId: t.giverId,
                    receiverId: t.receiverId,
                    giverName: t.giverName,
                    receiverName: t.receiverName,
                    count: t.count
                })),
            logs: this.logs.slice(0, 15)
        };
    }

    clearTransientEvents() {
        this.table.wasCut = false;
        this.table.wasPlina = false;
        this.table.plinaSkippedName = '';
        this.table.plinaSkippedPlayerId = null;
    }
}

window.ReyOCuloHost = ReyOCuloHost;
