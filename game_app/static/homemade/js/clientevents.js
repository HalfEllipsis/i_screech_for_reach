/**
 * This file sends updates to the server when 
 * the player makes a move, and receives new states from the server.
 */


var key_to_event_handler_dict = {};

/**
 * This is called when the page is displayed. It connects the Socket.IO 
 * client to the Socket.IO server
 */

function handle_event(json_msg) {
    //var json_msg = JSON.parse(message.data);

    // TODO: Iterating over pairs, not keys would be faster. I 
    // didn't find how to do this in javascript...
    for (key in json_msg) {
        if (key_to_event_handler_dict.hasOwnProperty(key)) {
            handler = key_to_event_handler_dict[key];
            handler(json_msg[key]);
        }
    }
}

function register_event_handler(key, event_handler) {
    key_to_event_handler_dict[key] = event_handler;
}

bind_to_stream("game", handle_event)
init_ws_connection();
init_game();
