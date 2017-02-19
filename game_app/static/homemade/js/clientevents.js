/**
 * This file sends updates to the server when 
 * the player makes a move, and receives new states from the server.
 */


var key_to_event_handler_dict = {};

/**
 * This is called when the page is displayed. It connects the Socket.IO 
 * client to the Socket.IO server
 */
function init_ws_connection() {
    socket = new WebSocket("ws://" + window.location.host);
    bindevents();
}

function handle_event(message) {
    console.log(message.data);
    var json_msg = JSON.parse(message.data);

    // TODO: Iterating over pairs, not keys would be faster. I 
    // didn't find how to do this in javascript...
    for (key in json_msg) {
        console.log("found key " + key);
        console.log("key is in dict: " + key_to_event_handler_dict.hasOwnProperty(key));
        if (key_to_event_handler_dict.hasOwnProperty(key)) {
            handler = key_to_event_handler_dict[key];
            console.log("using handler " + handler);
            handler(json_msg[key]);
        }
    }
}

function bindevents() {
    socket.onmessage = handle_event;
}

function register_event_handler(key, event_handler) {
    key_to_event_handler_dict[key] = event_handler;
}

init_ws_connection();
createGame();
