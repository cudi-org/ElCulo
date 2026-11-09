

class P2PNetwork {
    constructor() {
        this.socket = null;
        this.isHost = false;
        this.roomCode = null;
        this.peerId = null;
        this.clientIds = new Set(); 

        this.WS_URL = 'wss://TU-APP-SIGNALING.onrender.com';

        this.callbacks = {
            onStateSync: () => { },
            onPlayerJoined: () => { },
            onPlayerLeft: () => { },
            onActionReceived: () => { },
            onConnectedToHost: () => { },
            onError: () => { },
            onLog: () => { }
        };
        this.heartbeatTimer = null;
    }

    log(msg) {
        console.log(`[Network] ${msg}`);
        if (this.callbacks.onLog) this.callbacks.onLog(msg);
    }

    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 5; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        return code;
    }

    connectSocket() {
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(this.WS_URL);
            this.socket.onopen = () => {
                this.startHeartbeat();
                resolve();
            };
            this.socket.onerror = (err) => reject(err);
            this.socket.onclose = () => {
                this.log('Desconectado del servidor.');
                if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
            };
            this.socket.onmessage = (event) => this.handleServerMessage(event.data);
        });
    }

    async createRoom(customCode = null) {
        this.isHost = true;
        this.roomCode = customCode ? customCode.toUpperCase() : this.generateRoomCode();

        return new Promise(async (resolve, reject) => {
            try {
                await this.connectSocket();

                this._pendingResolve = resolve;
                this._pendingReject = reject;

                this.socket.send(JSON.stringify({
                    appType: 'cudi-sync',
                    type: 'join',
                    room: this.roomCode
                }));
            } catch (err) {
                reject(err);
            }
        });
    }

    async joinRoom(roomCode, playerName) {
        this.isHost = false;
        this.roomCode = roomCode.toUpperCase().trim();

        return new Promise(async (resolve, reject) => {
            try {
                await this.connectSocket();
                this._pendingResolve = resolve;
                this._pendingReject = reject;

                this.socket.send(JSON.stringify({
                    appType: 'cudi-sync',
                    type: 'join',
                    room: this.roomCode,
                    alias: playerName
                }));
            } catch (err) {
                reject(err);
            }
        });
    }

    handleServerMessage(dataString) {
        let msg;
        try { msg = JSON.parse(dataString); } catch (e) { return; }

        if (msg.type === 'room_created') {
            this.peerId = msg.peerId;
            this.log(`Sala creada: ${this.roomCode}`);
            if (this._pendingResolve) this._pendingResolve(this.roomCode);
        }
        else if (msg.type === 'joined') {
            this.peerId = msg.peerId;
            this.log('Unido a la sala con éxito.');
            if (this._pendingResolve) this._pendingResolve(true);
            this.callbacks.onConnectedToHost(this.roomCode);
        }
        else if (msg.type === 'player_joined') {
            this.clientIds.add(msg.peerId);
            this.callbacks.onPlayerJoined({ peerId: msg.peerId, name: msg.alias });
        }
        else if (msg.type === 'player_left') {
            this.clientIds.delete(msg.peerId);
            this.callbacks.onPlayerLeft(msg.peerId);
        }
        else if (msg.type === 'room_closed') {
            this.callbacks.onError('El anfitrión ha cerrado la sala.');
        }
        else if (msg.type === 'error') {
            if (this._pendingReject) this._pendingReject(new Error(msg.message));
            this.callbacks.onError(msg.message);
        }
        else if (msg.appType === 'cudi-sync' && msg.type === 'signal') {

            if (msg.actionType === 'SYNC_STATE') {
                this.callbacks.onStateSync(msg.data);
            } else {

                this.callbacks.onActionReceived(msg.actionType, msg.data, msg.senderId);
            }
        }
    }

    broadcastState(getStateSnapshotFn) {
        if (!this.isHost || !this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        this.clientIds.forEach(clientId => {
            const playerSnapshot = getStateSnapshotFn(clientId);
            this.socket.send(JSON.stringify({
                appType: 'cudi-sync',
                type: 'signal',
                targetId: clientId,
                actionType: 'SYNC_STATE',
                data: playerSnapshot
            }));
        });
    }

    sendActionToHost(actionType, data = {}) {
        if (this.isHost) {
            this.callbacks.onActionReceived(actionType, data, this.peerId);
        } else if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                appType: 'cudi-sync',
                type: 'signal',
                targetId: 'host', 
                senderId: this.peerId,
                actionType: actionType,
                data: data
            }));
        } else {
            this.callbacks.onError('No estás conectado al servidor.');
        }
    }

    startHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {

                this.socket.send(JSON.stringify({ type: 'ping' }));
            }
        }, 20000);
    }
}

window.P2PNetwork = P2PNetwork;