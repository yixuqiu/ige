class IgeSocketIoServerComponent {
    constructor() {
        this._idCounter = 0;
        this._requests = {};
        this._onRequest = (data, clientId) => {
            // The message is a network request so fire
            // the command event with the request id and
            // the request data
            data.clientId = clientId;
            this._requests[data.id] = data;
            if (this.debug()) {
                console.log("onRequest", data);
                console.log("emitting", data.cmd, [data.id, data.data]);
                this._debugCounter++;
            }
            if (this._networkCommands[data.cmd]) {
                this._networkCommands[data.cmd](data.data, clientId, data.id);
            }
            this.emit(data.cmd, [data.id, data.data, clientId]);
        };
    }
    /**
     * Starts the network for the server.
     * @param port
     * @param {Function=} callback A callback method to call once the
     * network has started.
     */
    start(port, callback) {
        this._socketById = {};
        this._socketsByRoomId = {};
        if (typeof (port) !== "undefined") {
            this._port = port;
        }
        // Start socket.io
        this.log("Starting socket.io listener on port " + this._port);
        this._io = this._socketio.listen(this._port);
        // Set the logging level to errors only
        this._io.set("log level", 0);
        // Compress socket.io.js for faster serving
        this._io.enable("browser client minification");
        this._io.enable("gzip");
        // Setup listeners
        this._io.sockets.on("connection", function (socket) {
            this._onClientConnect(socket);
        });
        if (typeof (callback) === "function") {
            callback();
        }
        // Set some default commands
        this.define("_igeRequest", this._onRequest);
        this.define("_igeResponse", this._onResponse);
        this.define("_igeNetTimeSync", this._onTimeSync);
        // Start network sync
        this.timeSyncStart();
        return this._entity;
    }
    /**
     * Sets a network command and optional callback. When a network command
     * is received by the server, the callback set up for that command will
     * automatically be called and passed the data from the incoming network
     * packet.
     * @param {String} commandName The name of the command to define.
     * @param {Function=} callback A function to call when the defined network
     * command is received by the network.
     * @return {*}
     */
    define(commandName, callback) {
        if (commandName !== undefined) {
            this._networkCommands[commandName] = callback;
            // Record reverse lookups
            const index = this._networkCommandsIndex.length;
            this._networkCommandsIndex[index] = commandName;
            this._networkCommandsLookup[commandName] = index;
            return this._entity;
        }
        else {
            this.log("Cannot define a network command without a commandName parameter!", "error");
        }
    }
    /**
     * Adds a client to a room by id. All clients are added to room id
     * "ige" by default when they connect to the server.
     * @param {String} clientId The id of the client to add to the room.
     * @param {String} roomId The id of the room to add the client to.
     * @returns {*}
     */
    clientJoinRoom(clientId, roomId) {
        if (clientId !== undefined) {
            if (roomId !== undefined) {
                this._clientRooms[clientId] = this._clientRooms[clientId] || [];
                this._clientRooms[clientId].push(roomId);
                this._socketsByRoomId[roomId] = this._socketsByRoomId[roomId] || {};
                this._socketsByRoomId[roomId][clientId] = this._socketById[clientId];
                if (this.debug()) {
                    this.log("Client " + clientId + " joined room " + roomId);
                }
                return this._entity;
            }
            this.log("Cannot add client to room because no roomId was provided!", "warning");
            return this._entity;
        }
        this.log("Cannot add client to room because no clientId was provided!", "warning");
        return this._entity;
    }
    /**
     * Removes a client from a room by id. All clients are added to room id
     * "ige" by default when they connect to the server and you can remove
     * them from it if your game defines custom rooms etc.
     * @param {String} clientId The id of the client to remove from the room.
     * @param {String} roomId The id of the room to remove the client from.
     * @returns {*}
     */
    clientLeaveRoom(clientId, roomId) {
        if (clientId !== undefined) {
            if (roomId !== undefined) {
                if (this._clientRooms[clientId]) {
                    this._clientRooms[clientId].pull(roomId);
                    delete this._socketsByRoomId[roomId][clientId];
                }
                return this._entity;
            }
            this.log("Cannot remove client from room because no roomId was provided!", "warning");
            return this._entity;
        }
        this.log("Cannot remove client from room because no clientId was provided!", "warning");
        return this._entity;
    }
    /**
     * Removes a client from all rooms that it is a member of.
     * @param {String} clientId The client id to remove from all rooms.
     * @returns {*}
     */
    clientLeaveAllRooms(clientId) {
        if (clientId !== undefined) {
            let arr = this._clientRooms[clientId], arrCount = arr.length;
            while (arrCount--) {
                this.clientLeaveRoom(clientId, arr[arrCount]);
            }
            delete this._clientRooms[clientId];
            return this._entity;
        }
        this.log("Cannot remove client from room because no clientId was provided!", "warning");
        return this._entity;
    }
    /**
     * Gets the array of room ids that the client has joined.
     * @param clientId
     * @returns {Array} An array of string ids for each room the client has joined.
     */
    clientRooms(clientId) {
        if (clientId !== undefined) {
            return this._clientRooms[clientId] || [];
        }
        this.log("Cannot get/set the clientRoom id because no clientId was provided!", "warning");
        return [];
    }
    /**
     * Returns an associative array of all connected clients
     * by their ID.
     * @param {String=} roomId Optional, if provided will only return clients
     * that have joined room specified by the passed roomId.
     * @return {Array}
     */
    clients(roomId) {
        if (roomId !== undefined) {
            return this._socketsByRoomId[roomId];
        }
        return this._socketById;
    }
    /**
     * Returns the socket associated with the specified client id.
     * @param {String=} clientId
     * @return {*}
     */
    socket(clientId) {
        return this._socketById[clientId];
    }
    /**
     * Gets / sets the current flag that determines if client connections
     * should be allowed to connect (true) or dropped instantly (false).
     * @param {Boolean} val Set to true to allow connections or false
     * to drop any incoming connections.
     * @return {*}
     */
    acceptConnections(val) {
        if (typeof (val) !== "undefined") {
            this._acceptConnections = val;
            if (val) {
                this.log("Server now accepting connections!");
            }
            else {
                this.log("Server no longer accepting connections!");
            }
            return this._entity;
        }
        return this._acceptConnections;
    }
    send(commandName, data, clientId) {
        const commandIndex = this._networkCommandsLookup[commandName];
        if (commandIndex !== undefined) {
            if (clientId) {
                if (typeof (clientId) === "object") {
                    // The clientId is an array, loop it and send to each client
                    let arrCount = clientId.length;
                    while (arrCount--) {
                        const clientSocket = this._socketById[clientId[arrCount]];
                        if (clientSocket) {
                            clientSocket.json.send([commandIndex, data]);
                        }
                        else {
                            this.log("Warning, client with ID " + clientId[arrCount] + " not found in socket list!");
                        }
                    }
                }
                else {
                    // The clientId is a string, send to individual client
                    const clientSocket = this._socketById[clientId];
                    if (clientSocket) {
                        clientSocket.json.send([commandIndex, data]);
                    }
                    else {
                        this.log("Warning, client with ID " + clientId + " not found in socket list!");
                    }
                }
            }
            else {
                this._io.sockets.json.send([commandIndex, data]);
            }
        }
        else {
            this.log("Cannot send network packet with command \"" + commandName + "\" because the command has not been defined!", "error");
        }
    }
    /**
     * Sends a network request. This is different from a standard
     * call to send() because the recipient code will be able to
     * respond by calling ige.components.network.response(). When the response
     * is received, the callback method that was passed in the
     * callback parameter will be fired with the response data.
     * @param {String} commandName
     * @param {Object} data
     * @param {Function} callback
     */
    request(commandName, data, callback) {
        // Build the request object
        const req = {
            id: this.newIdHex(),
            cmd: commandName,
            data: data,
            callback: callback,
            timestamp: new Date().getTime()
        };
        // Store the request object
        this._requests[req.id] = req;
        // Send the network request packet
        this.send("_igeRequest", {
            id: req.id,
            cmd: commandName,
            data: req.data
        });
    }
    /**
     * Sends a response to a network request.
     * @param {String} requestId
     * @param {Object} data
     */
    response(requestId, data) {
        // Grab the original request object
        const req = this._requests[requestId];
        if (req) {
            // Send the network response packet
            this.send("_igeResponse", {
                id: requestId,
                cmd: req.commandName,
                data: data
            }, req.clientId);
            // Remove the request as we've now responded!
            delete this._requests[requestId];
        }
        else {
            this.log("Cannot send response to unidentified request ID: " + requestId, "warning");
        }
    }
    /**
     * Generates a new 16-character hexadecimal unique ID
     * @return {String}
     */
    newIdHex() {
        this._idCounter++;
        return (this._idCounter + (Math.random() * Math.pow(10, 17) + Math.random() * Math.pow(10, 17) + Math.random() * Math.pow(10, 17) + Math.random() * Math.pow(10, 17))).toString(16);
    }
    /**
     * Called when the server receives a client connection request. Sets
     * up event listeners on the socket and sends the client the initial
     * networking data required to allow network commands to operate
     * correctly over the connection.
     * @param {Object} socket The client socket object.
     * @private
     */
    _onClientConnect(socket) {
        if (this._acceptConnections) {
            if (!this.emit("connect", socket)) {
                this.log("Accepted connection with id " + socket.id);
                this._socketById[socket.id] = socket;
                // Store a rooms array for this client
                this._clientRooms[socket.id] = this._clientRooms[socket.id] || [];
                socket.on("message", (data) => {
                    this._onClientMessage(data, socket.id);
                });
                socket.on("disconnect", (data) => {
                    this._onClientDisconnect(data, socket);
                });
                // Send an init message to the client
                socket.json.send({
                    cmd: "init",
                    ncmds: this._networkCommandsLookup
                });
            }
            else {
                // Reject the connection
                socket.disconnect();
            }
        }
        else {
            this.log("Rejecting connection with id " + socket.id + " - we are not accepting connections at the moment!");
            socket.disconnect();
        }
    }
    /**
     * Called when the server receives a network message from a client.
     * @param {Object} data The data sent by the client.
     * @param {Object} clientId The client socket object.
     * @private
     */
    _onClientMessage(data, clientId) {
        const commandName = this._networkCommandsIndex[data[0]];
        if (this._networkCommands[commandName]) {
            this._networkCommands[commandName](data[1], clientId);
        }
        this.emit(commandName, [data[1], clientId]);
    }
    _onResponse(data, clientId) {
        // The message is a network response
        // to a request we sent earlier
        id = data.id;
        // Get the original request object from
        // the request id
        req = this._requests[id];
        if (this.debug()) {
            console.log("onResponse", data);
            this._debugCounter++;
        }
        if (req) {
            // Fire the request callback!
            req.callback(req.cmd, [data.data, clientId]);
            // Delete the request from memory
            delete this._requests[id];
        }
    }
    /**
     * Called when a client disconnects from the server.
     * @param {Object} data Any data sent along with the disconnect.
     * @param {Object} socket The client socket object.
     * @private
     */
    _onClientDisconnect(data, socket) {
        this.log("Client disconnected with id " + socket.id);
        this.emit("disconnect", socket.id);
        // Remove them from all rooms
        this.clientLeaveAllRooms(socket.id);
        delete this._socketById[socket.id];
    }
}
export default IgeSocketIoServerComponent;
