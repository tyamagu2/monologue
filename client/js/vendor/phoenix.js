// Phoenix Channels JavaScript client
//
// ## Socket Connection
//
// A single connection is established to the server and
// channels are mulitplexed over the connection.
// Connect to the server using the `Socket` class:
//
//     let socket = new Socket("/ws")
//     socket.connect()
//
// The `Socket` constructor takes the mount point of the socket
// as well as options that can be found in the Socket docs,
// such as configuring the `LongPoller` transport, and heartbeat.
// Socket params can also be passed as an option for default, but
// overridable channel params to apply to all channels.
//
//
// ## Channels
//
// Channels are isolated, concurrent processes on the server that
// subscribe to topics and broker events between the client and server.
// To join a channel, you must provide the topic, and channel params for
// authorization. Here's an example chat room example where `"new_msg"`
// events are listened for, messages are pushed to the server, and
// the channel is joined with ok/error matches, and `after` hook:
//
//     let chan = socket.chan("rooms:123", {token: roomToken})
//     chan.on("new_msg", msg => console.log("Got message", msg) )
//     $input.onEnter( e => {
//       chan.push("new_msg", {body: e.target.val})
//           .receive("ok", (message) => console.log("created message", message) )
//           .receive("error", (reasons) => console.log("create failed", reasons) )
//           .after(10000, () => console.log("Networking issue. Still waiting...") )
//     })
//     chan.join()
//         .receive("ok", ({messages}) => console.log("catching up", messages) )
//         .receive("error", ({reason}) => console.log("failed join", reason) )
//         .after(10000, () => console.log("Networking issue. Still waiting...") )
//
//
// ## Joining
//
// Joining a channel with `chan.join(topic, params)`, binds the params to
// `chan.params`. Subsequent rejoins will send up the modified params for
// updating authorization params, or passing up last_message_id information.
// Successful joins receive an "ok" status, while unsuccessful joins
// receive "error".
//
//
// ## Pushing Messages
//
// From the previous example, we can see that pushing messages to the server
// can be done with `chan.push(eventName, payload)` and we can optionally
// receive responses from the push. Additionally, we can use
// `after(millsec, callback)` to abort waiting for our `receive` hooks and
// take action after some period of waiting.
//
//
// ## Socket Hooks
//
// Lifecycle events of the multiplexed connection can be hooked into via
// `socket.onError()` and `socket.onClose()` events, ie:
//
//     socket.onError( () => console.log("there was an error with the connection!") )
//     socket.onClose( () => console.log("the connection dropped") )
//
//
// ## Channel Hooks
//
// For each joined channel, you can bind to `onError` and `onClose` events
// to monitor the channel lifecycle, ie:
//
//     chan.onError( () => console.log("there was an error!") )
//     chan.onClose( () => console.log("the channel has gone away gracefully") )
//
// ### onError hooks
//
// `onError` hooks are invoked if the socket connection drops, or the channel
// crashes on the server. In either case, a channel rejoin is attemtped
// automatically in an exponential backoff manner.
//
// ### onClose hooks
//
// `onClose` hooks are invoked only in two cases. 1) the channel explicitly
// closed on the server, or 2). The client explicitly closed, by calling
// `chan.leave()`
//

var SOCKET_STATES = { connecting: 0, open: 1, closing: 2, closed: 3 };
var CHAN_STATES = {
  closed: "closed",
  errored: "errored",
  joined: "joined",
  joining: "joining" };
var CHAN_EVENTS = {
  close: "phx_close",
  error: "phx_error",
  join: "phx_join",
  reply: "phx_reply",
  leave: "phx_leave"
};

class Push {
  // Initializes the Push
  //
  // chan - The Channel
  // event - The event, ie `"phx_join"`
  // payload - The payload, ie `{user_id: 123}`
  //

  constructor(chan, event, payload) {
    this.chan = chan;
    this.event = event;
    this.payload = payload || {};
    this.receivedResp = null;
    this.afterHook = null;
    this.recHooks = [];
    this.sent = false;
  }

  send() {
    var _this = this;

    var ref = this.chan.socket.makeRef();
    this.refEvent = this.chan.replyEventName(ref);
    this.receivedResp = null;
    this.sent = false;

    this.chan.on(this.refEvent, function (payload) {
      _this.receivedResp = payload;
      _this.matchReceive(payload);
      _this.cancelRefEvent();
      _this.cancelAfter();
    });

    this.startAfter();
    this.sent = true;
    this.chan.socket.push({
      topic: this.chan.topic,
      event: this.event,
      payload: this.payload,
      ref: ref
    });
  }

  receive(status, callback) {
    if (this.receivedResp && this.receivedResp.status === status) {
      callback(this.receivedResp.response);
    }

    this.recHooks.push({ status: status, callback: callback });
    return this;
  }

  after(ms, callback) {
    if (this.afterHook) {
      throw "only a single after hook can be applied to a push";
    }
    var timer = null;
    if (this.sent) {
      timer = setTimeout(callback, ms);
    }
    this.afterHook = { ms: ms, callback: callback, timer: timer };
    return this;
  }

  // private

  matchReceive(_ref) {
    var status = _ref.status;
    var response = _ref.response;
    var ref = _ref.ref;

    this.recHooks.filter(function (h) {
      return h.status === status;
    }).forEach(function (h) {
      return h.callback(response);
    });
  }

  cancelRefEvent() {
    this.chan.off(this.refEvent);
  }

  cancelAfter() {
    if (!this.afterHook) {
      return;
    }
    clearTimeout(this.afterHook.timer);
    this.afterHook.timer = null;
  }

  startAfter() {
    var _this = this;

    if (!this.afterHook) {
      return;
    }
    var callback = function () {
      _this.cancelRefEvent();
      _this.afterHook.callback();
    };
    this.afterHook.timer = setTimeout(callback, this.afterHook.ms);
  }
}

export class Channel {
  constructor(topic, params, socket) {
    var _this = this;

    this.state = CHAN_STATES.closed;
    this.topic = topic;
    this.params = params || {};
    this.socket = socket;
    this.bindings = [];
    this.joinedOnce = false;
    this.joinPush = new Push(this, CHAN_EVENTS.join, this.params);
    this.pushBuffer = [];
    this.rejoinTimer = new Timer(function () {
      return _this.rejoinUntilConnected();
    }, this.socket.reconnectAfterMs);
    this.joinPush.receive("ok", function () {
      _this.state = CHAN_STATES.joined;
      _this.rejoinTimer.reset();
    });
    this.onClose(function () {
      _this.socket.log("channel", "close " + _this.topic);
      _this.state = CHAN_STATES.closed;
      _this.socket.remove(_this);
    });
    this.onError(function (reason) {
      _this.socket.log("channel", "error " + _this.topic, reason);
      _this.state = CHAN_STATES.errored;
      _this.rejoinTimer.setTimeout();
    });
    this.on(CHAN_EVENTS.reply, function (payload, ref) {
      _this.trigger(_this.replyEventName(ref), payload);
    });
  }

  rejoinUntilConnected() {
    this.rejoinTimer.setTimeout();
    if (this.socket.isConnected()) {
      this.rejoin();
    }
  }

  join() {
    if (this.joinedOnce) {
      throw "tried to join multiple times. 'join' can only be called a single time per channel instance";
    } else {
      this.joinedOnce = true;
    }
    this.sendJoin();
    return this.joinPush;
  }

  onClose(callback) {
    this.on(CHAN_EVENTS.close, callback);
  }

  onError(callback) {
    this.on(CHAN_EVENTS.error, function (reason) {
      return callback(reason);
    });
  }

  on(event, callback) {
    this.bindings.push({ event: event, callback: callback });
  }

  off(event) {
    this.bindings = this.bindings.filter(function (bind) {
      return bind.event !== event;
    });
  }

  canPush() {
    return this.socket.isConnected() && this.state === CHAN_STATES.joined;
  }

  push(event, payload) {
    if (!this.joinedOnce) {
      throw "tried to push '" + event + "' to '" + this.topic + "' before joining. Use chan.join() before pushing events";
    }
    var pushEvent = new Push(this, event, payload);
    if (this.canPush()) {
      pushEvent.send();
    } else {
      this.pushBuffer.push(pushEvent);
    }

    return pushEvent;
  }

  // Leaves the channel
  //
  // Unsubscribes from server events, and
  // instructs channel to terminate on server
  //
  // Triggers onClose() hooks
  //
  // To receive leave acknowledgements, use the a `receive`
  // hook to bind to the server ack, ie:
  //
  //     chan.leave().receive("ok", () => alert("left!") )
  //

  leave() {
    var _this = this;

    return this.push(CHAN_EVENTS.leave).receive("ok", function () {
      _this.log("channel", "leave " + _this.topic);
      _this.trigger(CHAN_EVENTS.close, "leave");
    });
  }

  // Overridable message hook
  //
  // Receives all events for specialized message handling

  onMessage(event, payload, ref) {}

  // private

  isMember(topic) {
    return this.topic === topic;
  }

  sendJoin() {
    this.state = CHAN_STATES.joining;
    this.joinPush.send();
  }

  rejoin() {
    this.sendJoin();
    this.pushBuffer.forEach(function (pushEvent) {
      return pushEvent.send();
    });
    this.pushBuffer = [];
  }

  trigger(triggerEvent, payload, ref) {
    this.onMessage(triggerEvent, payload, ref);
    this.bindings.filter(function (bind) {
      return bind.event === triggerEvent;
    }).map(function (bind) {
      return bind.callback(payload, ref);
    });
  }

  replyEventName(ref) {
    return "chan_reply_" + ref;
  }
}

export class Socket {

  // Initializes the Socket
  //
  // endPoint - The string WebSocket endpoint, ie, "ws://example.com/ws",
  //                                               "wss://example.com"
  //                                               "/ws" (inherited host & protocol)
  // opts - Optional configuration
  //   transport - The Websocket Transport, ie WebSocket, Phoenix.LongPoller.
  //               Defaults to WebSocket with automatic LongPoller fallback.
  //   params - The defaults for all channel params, ie `{user_id: userToken}`
  //   heartbeatIntervalMs - The millisec interval to send a heartbeat message
  //   reconnectAfterMs - The optional function that returns the millsec
  //                      reconnect interval. Defaults to stepped backoff of:
  //
  //     function(tries){
  //       return [1000, 5000, 10000][tries - 1] || 10000
  //     }
  //
  //   logger - The optional function for specialized logging, ie:
  //     `logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
  //
  //   longpollerTimeout - The maximum timeout of a long poll AJAX request.
  //                        Defaults to 20s (double the server long poll timer).
  //
  // For IE8 support use an ES5-shim (https://github.com/es-shims/es5-shim)
  //
  constructor(endPoint) {
    var _this = this;
    var opts = arguments[1] === undefined ? {} : arguments[1];

    this.stateChangeCallbacks = { open: [], close: [], error: [], message: [] };
    this.channels = [];
    this.sendBuffer = [];
    this.ref = 0;
    this.transport = opts.transport || window.WebSocket || LongPoller;
    this.heartbeatIntervalMs = opts.heartbeatIntervalMs || 30000;
    this.reconnectAfterMs = opts.reconnectAfterMs || function (tries) {
      return [1000, 5000, 10000][tries - 1] || 10000;
    };
    this.reconnectTimer = new Timer(function () {
      return _this.connect();
    }, this.reconnectAfterMs);
    this.logger = opts.logger || function () {}; // noop
    this.longpollerTimeout = opts.longpollerTimeout || 20000;
    this.endPoint = this.expandEndpoint(endPoint);
    this.params = opts.params || {};
  }

  protocol() {
    return location.protocol.match(/^https/) ? "wss" : "ws";
  }

  expandEndpoint(endPoint) {
    if (endPoint.charAt(0) !== "/") {
      return endPoint;
    }
    if (endPoint.charAt(1) === "/") {
      return "" + this.protocol() + ":" + endPoint;
    }

    return "" + this.protocol() + "://" + location.host + "" + endPoint;
  }

  disconnect(callback, code, reason) {
    if (this.conn) {
      this.conn.onclose = function () {}; // noop
      if (code) {
        this.conn.close(code, reason || "");
      } else {
        this.conn.close();
      }
      this.conn = null;
    }
    callback && callback();
  }

  connect() {
    var _this = this;

    this.disconnect(function () {
      _this.conn = new _this.transport(_this.endPoint);
      _this.conn.timeout = _this.longpollerTimeout;
      _this.conn.onopen = function () {
        return _this.onConnOpen();
      };
      _this.conn.onerror = function (error) {
        return _this.onConnError(error);
      };
      _this.conn.onmessage = function (event) {
        return _this.onConnMessage(event);
      };
      _this.conn.onclose = function (event) {
        return _this.onConnClose(event);
      };
    });
  }

  // Logs the message. Override `this.logger` for specialized logging. noops by default
  log(kind, msg, data) {
    this.logger(kind, msg, data);
  }

  // Registers callbacks for connection state change events
  //
  // Examples
  //
  //    socket.onError(function(error){ alert("An error occurred") })
  //

  onOpen(callback) {
    this.stateChangeCallbacks.open.push(callback);
  }

  onClose(callback) {
    this.stateChangeCallbacks.close.push(callback);
  }

  onError(callback) {
    this.stateChangeCallbacks.error.push(callback);
  }

  onMessage(callback) {
    this.stateChangeCallbacks.message.push(callback);
  }

  onConnOpen() {
    var _this = this;

    this.log("transport", "connected to " + this.endPoint, this.transport);
    this.flushSendBuffer();
    this.reconnectTimer.reset();
    if (!this.conn.skipHeartbeat) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = setInterval(function () {
        return _this.sendHeartbeat();
      }, this.heartbeatIntervalMs);
    }
    this.stateChangeCallbacks.open.forEach(function (callback) {
      return callback();
    });
  }

  onConnClose(event) {
    this.log("transport", "close", event);
    this.triggerChanError();
    clearInterval(this.heartbeatTimer);
    this.reconnectTimer.setTimeout();
    this.stateChangeCallbacks.close.forEach(function (callback) {
      return callback(event);
    });
  }

  onConnError(error) {
    this.log("transport", error);
    this.triggerChanError();
    this.stateChangeCallbacks.error.forEach(function (callback) {
      return callback(error);
    });
  }

  triggerChanError() {
    this.channels.forEach(function (chan) {
      return chan.trigger(CHAN_EVENTS.error);
    });
  }

  connectionState() {
    switch (this.conn && this.conn.readyState) {
    case SOCKET_STATES.connecting:
      return "connecting";
    case SOCKET_STATES.open:
      return "open";
    case SOCKET_STATES.closing:
      return "closing";
    default:
      return "closed";
    }
  }

  isConnected() {
    return this.connectionState() === "open";
  }

  remove(chan) {
    this.channels = this.channels.filter(function (c) {
      return !c.isMember(chan.topic);
    });
  }

  chan(topic) {
    var chanParams = arguments[1] === undefined ? {} : arguments[1];

    var mergedParams = {};
    for (var key in this.params) {
      mergedParams[key] = this.params[key];
    }
    for (var key in chanParams) {
      mergedParams[key] = chanParams[key];
    }

    var chan = new Channel(topic, mergedParams, this);
    this.channels.push(chan);
    return chan;
  }

  push(data) {
    var _this = this;

    var topic = data.topic;
    var event = data.event;
    var payload = data.payload;
    var ref = data.ref;

    var callback = function () {
      return _this.conn.send(JSON.stringify(data));
    };
    this.log("push", "" + topic + " " + event + " (" + ref + ")", payload);
    if (this.isConnected()) {
      callback();
    } else {
      this.sendBuffer.push(callback);
    }
  }

  // Return the next message ref, accounting for overflows

  makeRef() {
    var newRef = this.ref + 1;
    if (newRef === this.ref) {
      this.ref = 0;
    } else {
      this.ref = newRef;
    }

    return this.ref.toString();
  }

  sendHeartbeat() {
    this.push({ topic: "phoenix", event: "heartbeat", payload: {}, ref: this.makeRef() });
  }

  flushSendBuffer() {
    if (this.isConnected() && this.sendBuffer.length > 0) {
      this.sendBuffer.forEach(function (callback) {
        return callback();
      });
      this.sendBuffer = [];
    }
  }

  onConnMessage(rawMessage) {
    var msg = JSON.parse(rawMessage.data);
    var topic = msg.topic;
    var event = msg.event;
    var payload = msg.payload;
    var ref = msg.ref;

    this.log("receive", "" + (payload.status || "") + " " + topic + " " + event + " " + (ref && "(" + ref + ")" || ""), payload);
    this.channels.filter(function (chan) {
      return chan.isMember(topic);
    }).forEach(function (chan) {
      return chan.trigger(event, payload, ref);
    });
    this.stateChangeCallbacks.message.forEach(function (callback) {
      return callback(msg);
    });
  }
}

export class LongPoller {
  constructor(endPoint) {
    this.endPoint = null;
    this.token = null;
    this.sig = null;
    this.skipHeartbeat = true;
    this.onopen = function () {}; // noop
    this.onerror = function () {}; // noop
    this.onmessage = function () {}; // noop
    this.onclose = function () {}; // noop
    this.upgradeEndpoint = this.normalizeEndpoint(endPoint);
    this.pollEndpoint = this.upgradeEndpoint + (/\/$/.test(endPoint) ? "poll" : "/poll");
    this.readyState = SOCKET_STATES.connecting;

    this.poll();
  }

  normalizeEndpoint(endPoint) {
    return endPoint.replace("ws://", "http://").replace("wss://", "https://");
  }

  endpointURL() {
    return this.pollEndpoint + ("?token=" + encodeURIComponent(this.token) + "&sig=" + encodeURIComponent(this.sig) + "&format=json");
  }

  closeAndRetry() {
    this.close();
    this.readyState = SOCKET_STATES.connecting;
  }

  ontimeout() {
    this.onerror("timeout");
    this.closeAndRetry();
  }

  poll() {
    var _this = this;

    if (!(this.readyState === SOCKET_STATES.open || this.readyState === SOCKET_STATES.connecting)) {
      return;
    }

    Ajax.request("GET", this.endpointURL(), "application/json", null, this.timeout, this.ontimeout.bind(this), function (resp) {
      if (resp) {
        var status = resp.status;
        var token = resp.token;
        var sig = resp.sig;
        var messages = resp.messages;

        _this.token = token;
        _this.sig = sig;
      } else {
        var status = 0;
      }

      switch (status) {
      case 200:
        messages.forEach(function (msg) {
          return _this.onmessage({ data: JSON.stringify(msg) });
        });
        _this.poll();
        break;
      case 204:
        _this.poll();
        break;
      case 410:
        _this.readyState = SOCKET_STATES.open;
        _this.onopen();
        _this.poll();
        break;
      case 0:
      case 500:
        _this.onerror();
        _this.closeAndRetry();
        break;
      default:
        throw "unhandled poll status " + status;
      }
    });
  }

  send(body) {
    var _this = this;

    Ajax.request("POST", this.endpointURL(), "application/json", body, this.timeout, this.onerror.bind(this, "timeout"), function (resp) {
      if (!resp || resp.status !== 200) {
        _this.onerror(status);
        _this.closeAndRetry();
      }
    });
  }

  close(code, reason) {
    this.readyState = SOCKET_STATES.closed;
    this.onclose();
  }
}

export class Ajax {
  constructor() {
  }

  request(method, endPoint, accept, body, timeout, ontimeout, callback) {
    if (window.XDomainRequest) {
      var req = new XDomainRequest(); // IE8, IE9
      this.xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback);
    } else {
      var req = window.XMLHttpRequest ? new XMLHttpRequest() : // IE7+, Firefox, Chrome, Opera, Safari
            new ActiveXObject("Microsoft.XMLHTTP"); // IE6, IE5
      this.xhrRequest(req, method, endPoint, accept, body, timeout, ontimeout, callback);
    }
  }

  xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback) {
    var _this = this;

    req.timeout = timeout;
    req.open(method, endPoint);
    req.onload = function () {
      var response = _this.parseJSON(req.responseText);
      callback && callback(response);
    };
    if (ontimeout) {
      req.ontimeout = ontimeout;
    }

    // Work around bug in IE9 that requires an attached onprogress handler
    req.onprogress = function () {};

    req.send(body);
  }

  xhrRequest(req, method, endPoint, accept, body, timeout, ontimeout, callback) {
    var _this = this;

    req.timeout = timeout;
    req.open(method, endPoint, true);
    req.setRequestHeader("Content-Type", accept);
    req.onerror = function () {
      callback && callback(null);
    };
    req.onreadystatechange = function () {
      if (req.readyState === _this.states.complete && callback) {
        var response = _this.parseJSON(req.responseText);
        callback(response);
      }
    };
    if (ontimeout) {
      req.ontimeout = ontimeout;
    }

    req.send(body);
  }

  parseJSON(resp) {
    return resp && resp !== "" ? JSON.parse(resp) : null;
  }
}

Ajax.states = { complete: 4 };

// Creates a timer that accepts a `timerCalc` function to perform
// calculated timeout retries, such as exponential backoff.
//
// ## Examples
//
//    let reconnectTimer = new Timer(() => this.connect(), function(tries){
//      return [1000, 5000, 10000][tries - 1] || 10000
//    })
//    reconnectTimer.setTimeout() // fires after 1000
//    reconnectTimer.setTimeout() // fires after 5000
//    reconnectTimer.reset()
//    reconnectTimer.setTimeout() // fires after 1000
//

class Timer {
  constructor(callback, timerCalc) {
    this.callback = callback;
    this.timerCalc = timerCalc;
    this.timer = null;
    this.tries = 0;

    // Cancels any previous setTimeout and schedules callback
    this.setTimeout = (function (_setTimeout) {
      var _setTimeoutWrapper = function setTimeout() {
        return _setTimeout.apply(this, arguments);
      };

      _setTimeoutWrapper.toString = function () {
        return _setTimeout.toString();
      };

      return _setTimeoutWrapper;
    })(function () {
      var _this = this;

      clearTimeout(this.timer);

      this.timer = setTimeout(function () {
        _this.tries = _this.tries + 1;
        _this.callback();
      }, this.timerCalc(this.tries + 1));
    });
  }

  reset() {
    this.tries = 0;
    clearTimeout(this.timer);
  }
}
