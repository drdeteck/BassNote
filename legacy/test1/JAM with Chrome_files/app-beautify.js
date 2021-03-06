JAM.namespace("controller").accept = function($) {
    "use strict";
    var _$main, _$startButton, _$window, _$body, _$welcome, _currentNum, _sessionId, _invitedBy, _invitedClient, _onDisconnected, _onUpdated;

    function accept(session, invitedby) {
        var $enter = $("#enter"),
            $own = $("#own"),
            $message = $("#messages");
        _$main = $("#main");
        _$welcome = $("#welcome");
        _$body = $("body");
        _sessionId = session;
        $enter.on("mouseup", function() {
            $message.fadeOut(100);
            $own.fadeOut(120);
            if (invitedby) {
                if (_onDisconnected) _onDisconnected.detach();
                if (_onUpdated) _onUpdated.detach()
            }
        });
        $own.on("click", function(e) {
            if (invitedby) {
                if (_onDisconnected) _onDisconnected.detach();
                if (_onUpdated) _onUpdated.detach()
            }
        });
        if (invitedby) {
            _invitedBy = invitedby;
            inviteMessage();
            _invitedClient = JAM.manager.broadcaster.onClient(invitedby);
            if (_invitedClient) {
                _onDisconnected = _invitedClient.disconnected.addOnce(inviteMessage);
                _onUpdated = _invitedClient.updated.addOnce(inviteMessage)
            }
        } else {
            $(".message_default").show();
            setTimeout(function() {
                $message.fadeIn(150)
            }, 1600);
            setTimeout(function() {
                $own.fadeIn(150)
            }, 1800)
        }
        BASE.listen("languageSwitched.accept", function() {
            inviteMessage()
        })
    }

    function inviteMessage() {
        var inviter = _invitedBy,
            $message = $("#messages"),
            $left = $message.find("#message_left"),
            $left_noname = $message.find("#message_left_noname"),
            $invited = $message.find("#message_invited"),
            $playing = $message.find("#message_playing"),
            $noname = $message.find("#message_noname"),
            $full = $message.find("#message_full"),
            $full_noname = $message.find("#message_full_noname"),
            $ended = $message.find("#message_ended"),
            $enter = $("#enter"),
            $own = $("#own"),
            client = JAM.controller.session.getClient(inviter),
            empty = JAM.controller.session.is_empty(),
            full = JAM.controller.session.is_full(),
            nickname, instrument, Instrument, fullInstrument, leftClient, tmplNickname = "[nickname]",
            tmplInstrument = "[instrument]";
        $message.find(".invite-message").hide();
        setTimeout(function() {
            $message.fadeIn(150)
        }, 1100);
        setTimeout(function() {
            $own.fadeIn(150)
        }, 1400);
        if (client) {
            nickname = client.player_nickname.titleCase();
            if (nickname && JAM.controller.session.isDefault(nickname)) {
                nickname = false
            }
            instrument = client.player_instrument;
            if (full) {
                if (!nickname) {
                    $full_noname.show();
                    $enter.hide()
                } else {
                    $full.text($full.text().replace(tmplNickname, nickname)).show();
                    $enter.hide()
                }
                return
            }
            if (!nickname) {
                $noname.show();
                return
            }
            if (!instrument) {
                $invited.text($invited.text().replace(tmplNickname, nickname)).show();
                return
            }
            Instrument = JAM.instrumentsConfig[instrument];
            fullInstrument = BASE.render.t(Instrument.type).titleCase() + " " + BASE.render.t(Instrument.name).titleCase();
            $playing.text($playing.text().replace(tmplNickname, nickname).replace(tmplInstrument, fullInstrument)).show()
        } else {
            if (full) {
                $full_noname.show();
                $enter.hide()
            } else if (empty) {
                $ended.show();
                gaq.push(["_trackPageview", "/join/error/empty-session"])
            } else if (inviter) {
                leftClient = JAM.controller.session.getDisconnectedClient(inviter);
                if (!leftClient || !leftClient.player_nickname) {
                    $left_noname.show()
                } else {
                    $left.text($left.text().replace(tmplNickname, leftClient.player_nickname)).show()
                }
            } else {
                $noname.show()
            }
        }
    }
    return accept
}(jQuery);
JAM.namespace("model").AudioPlayer = function($) {
    "use strict";

    function AudioPlayer(file, callback) {
        this._file = file;
        this.player = {};
        this.callback = callback || function() {};
        this.load(this._file)
    }
    AudioPlayer.prototype = {
        load: function() {
            this.player = new Audio(this._file);
            this.player.onreadystatechange = this.callback(this.player)
        },
        listeners: function() {
            var _me = this
        },
        stop: function() {
            this.player.pause()
        },
        play: function() {
            this.player.play()
        },
        remove: function() {
            this.stop()
        }
    };
    return AudioPlayer
}(jQuery);
JAM.namespace("instruments").bass = function($) {
    "use strict";

    function Bass(inst) {
        var _instrument = new JAM.model.StringInstrument({
            config: inst,
            getBindings: function() {
                var _local = BASE._language.bindings.strings,
                    _me = this,
                    count = 0,
                    string = 1;
                if (this.bindings) return this.bindings;
                this.bindings = {};
                _local.forEach(function(key, index) {
                    _me.bindings[key] = {
                        string: string,
                        pos: count
                    };
                    count++;
                    if (count > 9) {
                        count = 0;
                        string++
                    }
                })
            },
            getNotes: function() {
                return [{
                    string: "4",
                    held: 0,
                    notes: ["G", "G", "A", "A♯", "B", "C", "C♯", "D", "D♯", "E", "F", "F♯"]
                }, {
                    string: "3",
                    held: 0,
                    notes: ["D", "D", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B", "C", "C♯"]
                }, {
                    string: "2",
                    held: 0,
                    notes: ["A", "A♯", "B", "C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯"]
                }, {
                    string: "1",
                    held: 0,
                    notes: ["E", "F", "F♯", "G", "G♯", "A", "A♯", "B", "C", "C♯", "D", "D♯"]
                }]
            },
            fret_hints: function() {
                var _fret_hints = [],
                    _local = BASE._language.bindings.strings;
                for (var string_i = 1; string_i <= 4; string_i++) {
                    var count = 0,
                        keys = [];
                    for (var key_i = 1; key_i < 10; key_i++) {
                        var pos = (string_i - 1) * 10;
                        keys.push({
                            n: _local[pos + key_i],
                            v: string_i + "-" + key_i
                        })
                    }
                    _fret_hints.push({
                        string: string_i,
                        keys: keys
                    })
                }
                return _fret_hints
            },
            string_hints: function() {
                var _local = BASE._language.bindings.strings,
                    _string_hints = [{
                        string: "1",
                        keys: [{
                            n: _local[0],
                            v: "1-0"
                        }]
                    }, {
                        string: "2",
                        keys: [{
                            n: _local[10],
                            v: "2-0"
                        }]
                    }, {
                        string: "3",
                        keys: [{
                            n: _local[20],
                            v: "3-0"
                        }]
                    }, {
                        string: "4",
                        keys: [{
                            n: _local[30],
                            v: "4-0"
                        }]
                    }];
                return _string_hints
            },
            controls: JAM.controller.basses
        });
        _instrument.load();
        return _instrument
    }
    return Bass
}(jQuery);
JAM.namespace("controller").basses = function($) {
    "use strict";
    var _instrument;

    function init(bass) {
        _instrument = bass;
        var _$local = $("#instrument_local"),
            $slider = _$local.find("#style-slider"),
            $style = _$local.find("#style"),
            $pos = _$local.find("#bass-position"),
            $posLeft = $pos.find("#bass-pos-left"),
            $posRight = $pos.find("#bass-pos-right"),
            $bass_controls = _$local.find("#bass-controls"),
            dmaf, $hints = $("#hints"),
            _$document = $(document);
        BASE.listen("advanced_mode.bass", function(event) {
            $bass_controls.show();
            keyMatrix()
        });
        BASE.listen("easy_mode.bass", function(event) {
            $bass_controls.hide();
            _$document.off("keyup.instrument");
            _$document.off("keydown.instrument")
        });
        dmaf = JAM.dmaf;
        dmaf.dispatch("switchMode", {
            mode: "easy"
        });
        BASE.tell("easy_mode");
        $style.html("normal");
        $slider.on("change", function() {
            var val = $slider.val(),
                style;
            switch (parseInt(val)) {
                case 1:
                    style = "normal";
                    break;
                case 2:
                    style = "muted";
                    break;
                case 3:
                    style = "damped";
                    break
            }
            dmaf.dispatch("switchStyle", {
                style: style
            });
            $style.html(style)
        });
        BASE.listen("startTour.instrument_tip", function(event) {
            var $ks = $("#keys_strings").find(".tt_text"),
                $tk = $("#frets_strings").find(".tt_text"),
                ks_text = $ks.text(),
                tk_text = $tk.text();
            $ks.html("<div class='tour_keyboard bass'></div><br>" + ks_text + "<div class='clear'></div>");
            $tk.html("<div class='tour_keys'><br/><span class='arrow left'>left</span><span class='arrow right'>right</span></div>" + tk_text);
            BASE.off("startTour.instrument_tip")
        })
    }

    function keyMatrix() {
        var $note = $(".string_note").first(),
            noteWidth = $note.outerWidth(true),
            $hints_strings = $("#hints-strings"),
            $hints_frets = $("#hints-frets"),
            $hints = $("#hints"),
            _$document = $(document),
            _posX = 0,
            _posY = 0,
            adjustMatrix = function(offX) {
                _instrument.posX = offX;
                $hints_frets.animate({
                    "margin-left": _instrument.posX * noteWidth
                }, 150)
            };
        _$document.on("keyup.instrument", function(e) {
            var code = BASE.utils.keyToString(e.keyCode);
            switch (code) {
                case "right":
                    if (_posX < 3) {
                        _posX++;
                        adjustMatrix(_posX)
                    }
                    e.preventDefault();
                    break;
                case "left":
                    if (_posX > 0) {
                        _posX--;
                        adjustMatrix(_posX)
                    }
                    e.preventDefault();
                    break
            }
        });
        _$document.on("keydown.instrument", function(e) {
            var code = BASE.utils.keyToString(e.keyCode);
            switch (code) {
                case "right":
                    e.preventDefault();
                    break;
                case "left":
                    e.preventDefault();
                    break
            }
        })
    }
    return init
}(jQuery);
JAM.namespace("manager").broadcaster = function($) {
    "use strict";
    var _socket, _dmaf, resync = true,
        syncing = false,
        clients = {},
        _players = 0,
        _ping, _latency;

    function check() {
        var supported_websocket = false,
            supported_audio = false;
        if (typeof window.WebSocket != "undefined") supported_websocket = true;
        if (typeof window.webkitAudioContext != "undefined") supported_audio = true;
        if (!supported_websocket || !supported_audio) {
            BASE.render.from_template("unsupported");
            return false
        }
        return true
    }

    function init(callback) {
        _dmaf = JAM.dmaf;
        _dmaf.dispatch("startClock");
        JAM.namespace("broadcaster").dispatch = dispatch;
        JAM.namespace("broadcaster").sendEvent = sendEvent;
        JAM.namespace("broadcaster").clients = clients;
        clients = {};
        DMAF.getController().registerBroadcaster(function(trigger, eventTime, parameters) {
            if (_players > 1) {
                dispatch({
                    trigger: trigger,
                    eventTime: eventTime + DMAF.serverOffset,
                    params: parameters
                }, false)
            }
        }, this);
        DMAF.getController().registerSyncBroadcaster(function(trigger, parameters) {
            if (trigger == "latency") {
                syncing = false
            }
            sendEvent(trigger, parameters)
        }, this);
        DMAF.getController().registerAliveBroadcaster(function() {
            _socket.alive()
        }, this);
        DMAF.getController().registerLatencyCallback(function(latency) {
            _latency = latency;
            JAM.controller.session.checkLatency(true, latency);
            if (latency <= 100) {
                DMAF.goOn = true
            } else if (latency > 100 && latency <= 300) {
                DMAF.goOn = true
            } else if (latency > 300 && latency <= 500) {
                DMAF.goOn = true
            } else if (latency > 500) {
                DMAF.goOn = false
            }
        }, this);
        DMAF.event = function(message, params, eventTime) {
            if (message == "sync") {
                if (syncing == true) return false;
                syncing = true
            }
            DMAF.getController().onServerEvent(message, eventTime, params)
        };
        if (typeof callback != "undefined") callback()
    }

    function open(_sessionId, _clientId, callback) {
        _socket = new JAM.model.Socket(socketActions);
        _socket.connect(_sessionId, _clientId, function() {
            if (callback) callback()
        })
    }

    function getLatency() {
        return _latency
    }

    function reportDelta() {
        _ping = _socket.getDelta();
        if (_ping) {
            sendEvent("latency", {
                delta: _ping
            })
        }
    }

    function close() {
        if (_socket) _socket.disconnect()
    }

    function sync() {
        _socket.sync()
    }

    function dispatch(data, selfIncluded) {
        _socket.sendEvent("broadcast", {
            data: data,
            selfIncluded: selfIncluded
        })
    }

    function sendEvent(message, data) {
        _socket.sendEvent(message, data)
    }

    function socketActions(type, data) {
        switch (type) {
            case "clientConnect":
                _players++;
                clients[data.client] = {
                    instrumentChanged: new signals.Signal,
                    nicknameChanged: new signals.Signal,
                    roleChanged: new signals.Signal,
                    disconnected: new signals.Signal,
                    noteOn: new signals.Signal,
                    noteOff: new signals.Signal,
                    patternOn: new signals.Signal,
                    patternOff: new signals.Signal,
                    updated: new signals.Signal
                };
                BASE.tell({
                    type: "clientConnect",
                    player_id: data.client,
                    player_instrument: data.instrument,
                    player_nickname: data.name,
                    is_leader: data.leader
                });
                break;
            case "clientUpdate":
                var theClient = clients[data.client];
                BASE.tell({
                    type: "clientUpdate",
                    player_id: data.client,
                    player_instrument: data.instrument,
                    player_nickname: data.name,
                    is_leader: data.leader
                });
                if (typeof data.instrument != "undefined") {
                    theClient.instrumentChanged.dispatch(data.instrument)
                }
                if (typeof data.name != "undefined") {
                    theClient.nicknameChanged.dispatch(data.name)
                }
                if (typeof data.is_leader != "undefined") {
                    theClient.roleChanged.dispatch(data.is_leader)
                }
                theClient.updated.dispatch(data);
                break;
            case "clientDisconnect":
                BASE.tell({
                    type: "clientDisconnect",
                    player_id: data.client,
                    player_instrument: data.instrument
                });
                clients[data.client].disconnected.dispatch(data.instrument);
                clients[data.client] = null;
                _players--;
                break;
            case "broadcast":
                var broadcastData = data.data,
                    client = clients[data.client];
                DMAF.event(broadcastData.trigger, broadcastData.params, broadcastData.eventTime);
                if (broadcastData.params && broadcastData.params.type || broadcastData.trigger === "stopPattern" || broadcastData.trigger === "switchPattern") {
                    if (broadcastData.trigger === "switchPattern") {
                        client.patternOn.dispatch(broadcastData.params)
                    }
                    if (broadcastData.trigger === "stopPattern") {
                        client.patternOff.dispatch(broadcastData.params)
                    }
                    if (broadcastData.params.type) {
                        if (broadcastData.params.type === "noteOn") {
                            client.noteOn.dispatch(broadcastData.params)
                        }
                        if (broadcastData.params.type === "noteOff") {
                            client.noteOff.dispatch(broadcastData.params)
                        }
                    }
                } else {
                    BASE.tell({
                        type: broadcastData.trigger || broadcastData || "broadcast",
                        passed: broadcastData
                    })
                }
                break;
            case "latency":
                _latency = data.delta;
                BASE.tell(data);
                DMAF.event(type, data);
                break;
            case "tempo":
                JAM._tempo = data.tempo;
                BASE.tell(data);
                break;
            case "key":
                JAM._key = parseInt(data.key) - 1;
                BASE.tell(data);
                break;
            case "scale":
                var scaleStr;
                if (data.scale == 1) {
                    scaleStr = "major"
                } else {
                    scaleStr = "minor"
                }
                JAM._scale = scaleStr;
                BASE.tell(data);
                break;
            case "chord":
                JAM._chord = parseInt(data.chord);
                BASE.tell(data);
                break;
            case "error":
                console.log("ERROR", data.error);
                BASE.tell(data.error);
                break;
            case "clientTimeout":
                console.log("clientTimeout");
                BASE.router.path("/timeout/");
                break;
            default:
                DMAF.event(type, data);
                BASE.tell(data)
        }
    }

    function onClient(id) {
        return clients[id]
    }
    return {
        init: init,
        dispatch: dispatch,
        sendEvent: sendEvent,
        open: open,
        close: close,
        check: check,
        sync: sync,
        onClient: onClient,
        reportDelta: reportDelta,
        getLatency: getLatency
    }
}(jQuery);
JAM.namespace("model").Chat = function($) {
    "use strict";

    function Chat(jam_session, myId) {
        this.myId = myId;
        this.jam_session = jam_session;
        this.is_open = false;
        this.$notification = $("#chat-notification");
        this.$counter = this.$notification.find("#count");
        this.counter = 0;
        this.openPosition = 300;
        this.ignoreNextSysMsg = false;
        this.create()
    }
    Chat.prototype = {
        create: function() {
            var _me = this;
            this._modal = new JAM.model.Modal("chat", 240, 364, function($modal, _modal) {
                _me.$chatbox = $("#chat");
                _me.$chatarea = _me.$chatbox.find(".overview");
                _me.$chatinput = $("#chat-input");
                _modal.persistent = true;
                _me.openPosition = window.innerHeight / 2 - $("#modal-chat").height() / 2;
                $("#modal-chat").draggable({
                    containment: "document"
                });
                $("#modal-chat").draggable("disable");
                $("#modal-chat").css("margin-top", "0");
                $("#modal-chat").css("margin-left", "0");
                _me.listen();
                _me.actions()
            })
        },
        listen: function() {
            var _me = this,
                _scale = "major";
            BASE.listen("chatted.chat", function(event) {
                var message = event.passed.chatMessage,
                    id = event.passed.client;
                _me.format(message, id)
            });
            BASE.listen("clientUpdate.chat", function(event) {
                var instrument = event.player_instrument,
                    nickname = event.player_nickname,
                    leader = event.is_leader,
                    lastMsg = "",
                    msg = " ";
                if (!nickname) return;
                if (_me.ignoreNextSysMsg && instrument) {
                    _me.ignoreNextSysMsg = false;
                    return
                }
                if (instrument) {
                    msg = BASE.render.t("is_playing").replace("[nickname]", nickname).replace("[instrument]", BASE.render.t(JAM.instrumentsConfig[instrument].fullname))
                } else {
                    msg = BASE.render.t("has_joined").replace("[nickname]", nickname)
                }
                _me.systemMsg(msg);
                BASE.off("tempo.chat");
                BASE.listen("tempo.chat", function(event) {
                    var msg = BASE.render.t("changed_tempo") + " ",
                        val = event.tempo;
                    if (msg + val != lastMsg) {
                        lastMsg = msg + val;
                        _me.systemMsg(msg + val)
                    }
                });
                BASE.off("scale.chat");
                BASE.listen("scale.chat", function(event) {
                    var msg = BASE.render.t("changed_key") + " ",
                        row = ["E", "F", "F♯", "G", "G♯", "A", "A♯", "B", "C", "C♯", "D", "D♯"],
                        val = JAM.controller.session.getKey();
                    _scale = event.scale == 1 ? "major" : "minor";
                    var scaleMsg = " " + BASE.render.t(_scale);
                    _me.systemMsg(msg + row[val - 1] + scaleMsg)
                });
                BASE.off("key.chat");
                BASE.listen("key.chat", function(event) {
                    var msg = BASE.render.t("changed_key") + " ",
                        val = parseInt(event.key) - 1,
                        row = ["E", "F", "F♯", "G", "G♯", "A", "A♯", "B", "C", "C♯", "D", "D♯"],
                        scale = " " + BASE.render.t(_scale);
                    _me.systemMsg(msg + row[val] + scale)
                })
            });
            BASE.listen("clientRemove.chat", function(event) {
                var nickname = event.player_nickname,
                    msg;
                if (nickname) {
                    msg = BASE.render.t("has_left").replace("[nickname]", nickname);
                    _me.systemMsg(msg)
                }
            });
            BASE.listen("clientDisconnect.chat", function(event) {
                _me.ignoreNextSysMsg = true
            });
            BASE.listen("newLeader.chat", function(event) {
                var nickname = event.player_nickname,
                    msg;
                if (nickname) {
                    msg = BASE.render.t("became_leader").replace("[nickname]", nickname);
                    _me.systemMsg(msg)
                }
            })
        },
        actions: function() {
            var _me = this;
            this.$opener = $("#chat-btn");
            $("#dragger").on("mousedown", function(e) {
                $("#modal-chat").draggable("enable")
            });
            $("#dragger").on("mouseup", function(e) {
                $("#modal-chat").draggable("disable")
            });
            this.$chatinput.on("keydown.chat", function(e) {
                var code = BASE.utils.keyToString(e.keyCode);
                e.stopPropagation();
                var message = _me.$chatinput.val();
                if (code === "enter" && message.match(/\S/) != null) {
                    _me.send(message.trim());
                    gaq.push(["_trackEvent", "Session", "Chat", "Message"]);
                    _me.$chatinput.val("");
                    return false
                } else if (code === "enter" && message.match(/\S/) == null) {
                    _me.$chatinput.val("")
                }
            });
            this.$chatinput.on("keyup.chat", function(e) {
                e.stopPropagation()
            });
            this.$opener.on("click.chat", function() {
                gaq.push(["_trackEvent", "Session", "Chat", "Open"]);
                _me.open();
                _me.$opener.addClass("before_load");
                $("#modal-chat").tween({
                    top: _me.openPosition
                }, 600, TWEEN.Easing.Cubic.Out, function() {})
            });
            this.$notification.on("click.chat", function() {
                _me.open()
            });
            $("#close-chat").on("click.chat", function() {
                gaq.push(["_trackEvent", "Session", "Chat", "Close"]);
                _me.is_open = false;
                _me.$opener.removeClass("before_load");
                $("#modal-chat").css({
                    top: function(index, value) {
                        _me.openPosition = parseInt(value)
                    }
                });
                $("#modal-chat").tween({
                    top: 3e3
                }, 300, TWEEN.Easing.Cubic.In, function() {})
            })
        },
        notifications: function(val) {
            if (val > 0) {
                if (this.counter == 0) this.$notification.fadeIn();
                this.counter += val
            } else {
                this.counter = 0;
                this.$notification.fadeOut()
            }
            this.$counter.html(this.counter)
        },
        getPlayerInstrument: function(player_id) {
            return this.jam_session.getPlayer(player_id).getInstrument()
        },
        getPlayerNickname: function(player_id) {
            return this.jam_session.getPlayer(player_id).getNickname()
        },
        getPlayerColor: function(player_id) {
            return this.jam_session.getPlayer(player_id).getColor()
        },
        systemMsg: function(msg) {
            var msg = BASE.render.t(msg);
            var $sys_msg = $("<li class='sys_msg'>");
            $sys_msg.append(msg);
            this.$chatarea.append($sys_msg);
            this.$chatbox.tinyscrollbar_update("bottom")
        },
        send: function(message) {
            JAM.broadcaster.dispatch({
                trigger: "chatted",
                chatMessage: message,
                client: this.myId
            }, true)
        },
        format: function(message, id) {
            var nickname = this.getPlayerNickname(id) + ": ",
                color = this.getPlayerColor(id),
                $nickname = $("<span class='chat_nickname'>").addClass(color).html(nickname),
                $chat_message = $("<span>").text(message),
                $chat_message_elem = $("<li class='chat_message'>").append($nickname).append($chat_message);
            this.$chatarea.append($chat_message_elem);
            this.$chatbox.tinyscrollbar_update("bottom");
            if (!this.is_open) {
                this.notifications(1)
            }
        },
        open: function() {
            this.is_open = true;
            this.notifications(0);
            this._modal.open();
            this.$chatinput.focus()
        },
        destroy: function() {
            this._modal.destroy();
            BASE.off(".chat")
        }
    };
    return Chat
}(jQuery);
JAM.namespace("model").Chevron = function($) {
    "use strict";
    var $window = $(window),
        baseWidth = 245,
        baseHeight = 145,
        bottomBar = 30,
        cutoff = 450,
        minHeight = 700;

    function Chevron($el, tall, crop, pac) {
        var that = this;
        if ($el.length == 0) return false;
        this.$el = $el;
        this.ident = "test";
        this.tall = tall || 0;
        this.crop = crop || false;
        this.parse();
        if (pac) {
            this.create(this.Height)
        } else {
            this.create()
        }
        this.build();
        this.add();
        if (pac) {
            this.pacman(false, pac)
        }
        $window.on("resize", function() {
            that.parse();
            that.update();
            that.$svg.width(Math.max(that.windowWidth, 1100)).height(that.fullHeight);
            that.$chevron.attr("points", that.points)
        })
    }
    Chevron.prototype = {
        parse: function() {
            this.windowHeight = $window.height();
            this.windowWidth = Math.max($window.width(), 1100);
            this.Width = this.windowWidth / 2;
            this.Height = this.Width / 245 * baseHeight
        },
        create: function(set_height) {
            var ratio = this.Width / 245,
                height = this.Height = ratio * baseHeight,
                set_height = set_height || 0;
            this.bottomHeight = this.Height + this.tall;
            if (this.crop) {
                this.fullHeight = this.bottomHeight
            } else {
                this.fullHeight = this.Height * 2 + this.tall
            }
            this.points = [
                [0, set_height].join(","), [this.Width, height].join(","), [this.windowWidth, set_height].join(","), [this.windowWidth, this.bottomHeight].join(","), [this.Width, this.fullHeight].join(","), [0, this.bottomHeight].join(",")
            ].join(" ")
        },
        update: function(height) {
            this.create(height);
            this.$chevron.attr("points", this.points)
        },
        build: function() {
            this.template = '<svg class="chevron_holder" xmlns="http://www.w3.org/2000/svg" width="' + this.windowWidth + '" height="' + this.fullHeight + '">';
            this.template += '<polygon class="chevron" ' + this.ident + ' points="' + this.points + '" />';
            this.template += "</svg>"
        },
        add: function() {
            this.$svg = $(this.template);
            this.$chevron = this.$svg.find(".chevron");
            this.$el.prepend(this.$svg)
        },
        pacman: function(reverse, speed) {
            var _me = this,
                start = reverse ? 0 : this.Height,
                end = reverse ? this.Height : 0,
                speed = speed || 800,
                tweened = new TWEEN.Tween({
                    base: start
                }).to({
                    base: end
                }, speed).onUpdate(function() {
                    _me.update(this.base)
                }).start()
        }
    };
    return Chevron
}(jQuery);
JAM.namespace("model").Composition = function($) {
    function Composition($el, width, height) {
        this.$el = $el;
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d")
    }
    Composition.prototype = {
        build: function() {
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.canvas.id = this.$el.attr("id") + "-stage";
            return this.$el.append(this.canvas)
        },
        addToQueue: function(item) {
            this.queue.push(item)
        },
        removeFromQueue: function(item) {
            this.queue.remove(this.queue.length - 1)
        },
        startAnimation: function() {
            window.clearTimeout(this.stopTimeout);
            this.pause = false;
            this.animateFrame()
        },
        stopAnimation: function() {
            var me = this;
            window.clearTimeout(this.stopTimeout);
            this.stopTimeout = window.setTimeout(function() {
                me.pause = true
            }, 1e3)
        },
        animateFrame: function() {
            var me = this;
            if (me.hidden || me.pause) return false;
            this.context.clearRect(0, 0, this.width, this.height);
            this.onAnimateFrame();
            this.queue.forEach(function(item) {
                item.draw()
            });
            requestAnimFrame(function() {
                me.animateFrame()
            })
        },
        onAnimateFrame: function() {},
        setHidden: function() {
            this.hidden = true;
            this.clear()
        },
        setVisible: function() {
            this.hidden = false
        }
    };

    function Rect(point, width, height, stage) {
        this.x = point.x;
        this.y = point.y;
        this.width = width;
        this.height = height;
        this.stroke = 1;
        this.strokeColor;
        this.fill = "#000";
        this.hit = false;
        this.stage = stage;
        this.context = _context;
        return this
    }
    Rect.prototype = {
        setFillColor: function(color) {
            this.fill = color;
            this.context.fillStyle = color
        },
        setStrokeColor: function(color) {
            this.strokeColor = color;
            this.context.strokeStyle = color
        },
        draw: function() {
            var ctx = this.context;
            ctx.fillStyle = this.fill;
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.stroke;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            if (this.stroke) {
                ctx.strokeRect(this.x, this.y, this.width, this.height)
            }
        }
    };

    function Circle(point, radius, stage) {
        this.x = point.x;
        this.y = point.y;
        this.radius = radius;
        this.stroke = 1;
        this.strokeColor = "#777";
        this.fill = "#000";
        this.stage = stage;
        this.context = _context;
        return this
    }
    Circle.prototype = {
        draw: function() {
            var ctx = this.context;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = this.fill;
            ctx.fill();
            if (this.stroke) {
                ctx.lineWidth = this.stroke;
                ctx.strokeStyle = this.strokeColor;
                ctx.stroke()
            }
        }
    };

    function Line(a, b, stage) {
        this.segments = [];
        this.points = [];
        this.context = _context;
        this.color = "#000";
        this.stroke = 3;
        this.opacity = 1;
        this.rgb = 255;
        this.cap = "round";
        this.stage = stage;
        return this
    }
    Line.prototype = {
        draw: function(ctx) {
            var drawCtx, controls;
            if (typeof ctx != "undefined") {
                drawCtx = this.context = ctx
            } else {
                drawCtx = this.context
            } if (this.points.length <= 0) return false;
            drawCtx.beginPath();
            drawCtx.moveTo(this.points[0].x, this.points[0].y);
            for (var i = 0; i < this.points.length - 2; i++) {
                var point = this.points[i];
                if (!point.control) {
                    point.control = {
                        x: (this.points[i].x + this.points[i + 1].x) / 2,
                        y: (this.points[i].y + this.points[i + 1].y) / 2
                    }
                }
                drawCtx.quadraticCurveTo(point.x, point.y, point.control.x, point.control.y)
            }
            if (this.points.length > 2) {
                drawCtx.quadraticCurveTo(this.points[this.points.length - 2].x, this.points[this.points.length - 2].y, this.points[this.points.length - 1].x, this.points[this.points.length - 1].y)
            }
            drawCtx.strokeStyle = this.color;
            drawCtx.lineCap = this.cap;
            drawCtx.lineWidth = this.stroke;
            drawCtx.stroke()
        }
    };

    function Segment(point1, point2, parent) {
        this.start = point1;
        this.end = point2;
        this.context;
        if (typeof parent != "undefined") {
            this.parent = parent
        }
        return this
    }
    Segment.prototype = {
        draw: function(ctx) {
            if (typeof ctx != "undefined") {
                this.context = ctx
            }
            this.context.beginPath();
            this.context.moveTo(this.start.x, this.start.y);
            this.context.lineTo(this.end.x, this.end.y);
            this.context.closePath();
            if (this.parent) {
                this.context.strokeStyle = this.parent.color;
                this.context.lineWidth = this.parent.stroke
            }
            this.context.stroke()
        }
    };
    window.requestAnimFrame = function(callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
            window.setTimeout(callback, 1e3 / 60)
        }
    }();
    return Composition
}(jQuery);
JAM.namespace("instruments").drums = function($) {
    "use strict";

    function Drum(inst) {
        var _instrument = new JAM.model.Instrument({
            config: inst,
            default_pattern_note: 5,
            getNotes: function() {
                return [{
                    drum: "tom_1",
                    pos: [253, 106],
                    rad: 45,
                    layer: 2
                }, {
                    drum: "tom_2",
                    pos: [455, 102],
                    rad: 50,
                    layer: 2
                }, {
                    drum: "tom_3",
                    pos: [520, 236],
                    rad: 65,
                    layer: 2
                }, {
                    drum: "snare",
                    pos: [198, 232],
                    rad: 55,
                    layer: 2
                }, {
                    drum: "snare_rim",
                    pos: [198, 232],
                    rad: 65,
                    layer: 1
                }, {
                    drum: "kick",
                    pos: [360, 200],
                    width: 200,
                    height: 200,
                    layer: 0
                }, {
                    drum: "pedal",
                    pos: [360, 200],
                    width: 50,
                    height: 200,
                    layer: 0
                }, {
                    drum: "hihat_closed",
                    pos: [148, 64],
                    rad: 40,
                    layer: 3
                }, {
                    drum: "hihat_half_open",
                    pos: [148, 64],
                    rad: 30,
                    layer: 4
                }, {
                    drum: "hihat_open",
                    pos: [148, 64],
                    rad: 20,
                    layer: 5
                }, {
                    drum: "crash",
                    pos: [271, 44],
                    rad: 45,
                    layer: 6
                }, {
                    drum: "ride_bell",
                    pos: [515, 44],
                    rad: 30,
                    layer: 4
                }, {
                    drum: "ride_edge",
                    pos: [515, 44],
                    rad: 50,
                    layer: 3
                }]
            },
            createZones: function(_me, _stage, _zones) {
                _me.notes.forEach(function(note) {
                    var $drum = $(".drum-" + note.drum),
                        left = $drum.position().left,
                        top = $drum.position().top,
                        width = $drum.width(),
                        height = $drum.height(),
                        rad = width >= height ? width * .99 / 2 : height * .99 / 2,
                        circle;
                    if (note.width) {
                        circle = _stage.addRect(left, top, width, height, false)
                    } else {
                        circle = _stage.addCircle(left + width / 2, top + height / 2, rad * .95, false)
                    }
                    circle.layer = note.layer;
                    _zones.push(circle)
                });
                var speed = 400,
                    delay = 200,
                    next = 50;
                $(".drum").each(function() {
                    var $this = $(this);
                    $this.move().set("background-size", "90%").duration(speed).delay(delay).end();
                    delay += next
                });
                setTimeout(function() {
                    $(".drum").attr("style", "background-size: 95%")
                }, delay + speed)
            },
            getBindings: function() {
                var _local = BASE._language.bindings[this.config.type],
                    _me = this;
                if (this.bindings) return this.bindings;
                this.bindings = {};
                _me.bindings[_local[0]] = 0;
                _me.bindings[_local[1]] = 0;
                _me.bindings[_local[2]] = 1;
                _me.bindings[_local[3]] = 1;
                _me.bindings[_local[4]] = 2;
                _me.bindings[_local[5]] = 2;
                _me.bindings[_local[6]] = 3;
                _me.bindings[_local[7]] = 3;
                _me.bindings[_local[8]] = 4;
                _me.bindings[_local[9]] = 5;
                _me.bindings[_local[10]] = 5;
                _me.bindings[_local[11]] = 7;
                _me.bindings[_local[12]] = 8;
                _me.bindings[_local[13]] = 9;
                _me.bindings[_local[14]] = 10;
                _me.bindings[_local[15]] = 10;
                _me.bindings[_local[16]] = 11;
                _me.bindings[_local[17]] = 12;
                _me.bindings[_local[18]] = 12
            },
            dispatchObject: function(item) {
                if (item.drum == "pedal") item.drum = "kick";
                return {
                    drum: item.drum
                }
            },
            findItem: function(item) {
                var find = "#";
                find += "_drum_" + item.drum;
                switch (find) {
                    case "#_drum_hihat_half_open":
                        find = "#_drum_hihat_closed";
                    case "#_drum_hihat_open":
                        find = "#_drum_hihat_closed";
                        break;
                    case "#_drum_ride_bell":
                        find = "#_drum_ride_edge";
                        break;
                    case "#_drum_snare":
                        find = "#_drum_snare_rim";
                        break;
                    case "#_drum_kick":
                        find = "#_drum_kick, #_drum_pedal";
                        break
                }
                return $(find)
            },
            hitTest: function(point, off) {
                var _me = this,
                    insides = [],
                    layer = 0;
                _me.zones.forEach(function(key, index) {
                    var inside = key.pointInside(point);
                    if (inside) {
                        if (key.layer > layer) layer = key.layer;
                        if (index == 6) index = 5;
                        insides.push({
                            key: key,
                            num: index
                        })
                    }
                });
                insides.forEach(function(item) {
                    var key = item.key;
                    if (item.key.layer === layer) {
                        if (off === true) {
                            _me.hitOff(item);
                            if (_me.lastHit && _me.lastHit.num != item.num) _me.hitOff(_me.lastHit);
                            _me.lastHit = false
                        } else {
                            if (_me.lastHit && _me.lastHit.num != item.num) _me.hitOff(_me.lastHit);
                            if (!_me.lastHit || _me.lastHit.num != item.num) _me.hitOn(item);
                            _me.lastHit = item
                        }
                    }
                });
                if (insides.length == 0) {
                    if (_me.lastHit) _me.hitOff(_me.lastHit);
                    _me.lastHit = false
                }
            },
            controls: function() {
                JAM.dmaf.dispatch("switchMode", {
                    mode: "easy"
                });
                BASE.tell("easy_mode");
                BASE.listen("startTour.instrument_tip", function(event) {
                    var $ks = $("#keys_drums").find(".tt_text"),
                        ks_text = $ks.text();
                    $ks.html("<div class='tour_keyboard drums'></div><br>" + ks_text + "<div class='clear'></div>");
                    BASE.off("startTour.instrument_tip")
                })
            },
            unload: function() {
                var speed = 200,
                    delay = 0,
                    next = 20;
                $(".lock").fadeOut(100);
                $("#knobs").fadeOut(100);
                $(".drum").each(function() {
                    var $this = $(this);
                    $this.move().set("background-size", "0%").duration(speed).delay(delay).end();
                    delay += next
                });
                return delay
            }
        });
        _instrument.load();
        return _instrument
    }
    return Drum
}(jQuery);
JAM.namespace("controller").ended = function($) {
    "use strict";
    var _social;

    function init() {
        var $twitter = $("#ended #twitter"),
            $facebook = $("#ended #facebook"),
            $gplus = $("#ended #gplus"),
            $start = $("#start-new"),
            $thanks = $("#thanks"),
            link = $start.attr("href");
        if (JAM._password) {
            link += JAM._password;
            $start.attr("href", link)
        }
        $start.on("click", function(e) {
            BASE.router.path("/select/");
            e.preventDefault()
        });
        $thanks.text($thanks.text().replace("[nickname]", JAM.controller.session.myPlayer().player_nickname));
        _social = new JAM.model.Social($twitter, $facebook, $gplus, JAM._baseUrl, "leave_session")
    }
    return init
}(jQuery);
var BASE = BASE || {};
BASE.events = function($) {
    "use strict";
    var EventManager = {},
        _$manager = $(EventManager);

    function tell(event) {
        _$manager.trigger(event)
    }

    function listen(event, fn) {
        _$manager.on(event, fn)
    }

    function off(event, fn) {
        _$manager.off(event, fn)
    }
    BASE.tell = tell;
    BASE.listen = listen;
    BASE.off = off;
    return {
        tell: tell,
        listen: listen,
        off: off
    }
}(jQuery);
BASE.view = function($) {
    "use strict";
    var ViewManager = {};

    function tell(id, args) {
        var sig = ViewManager[id];
        if (!sig) return;
        if (args) {
            sig.dispatch.apply(sig, args)
        } else {
            sig.dispatch()
        }
    }

    function listen(id, handler, scope, priority) {
        if (!ViewManager[id]) {
            ViewManager[id] = new signals.Signal
        }
        return ViewManager[id].add(handler, scope, priority)
    }

    function off(id) {
        var sig = ViewManager[id];
        if (!sig) return;
        sig.remove(handler)
    }
    return {
        tell: tell,
        listen: listen,
        off: off
    }
}(jQuery);
JAM.namespace("controller").footer = function($) {
    "use strict";
    var _social;

    function init() {
        var $twitter = $("#footer #twitter"),
            $facebook = $("#footer #facebook"),
            $gplus = $("#footer #gplus"),
            $technology_link = $("#footer #technology").find("a"),
            $langSelector = $("#footer #language-selector"),
            $switchTo = $langSelector.find("a"),
            tech_link = $technology_link.attr("href"),
            lang = BASE.render.getLanguageCode();
        _social = new JAM.model.Social($twitter, $facebook, $gplus, JAM._baseUrl, "footer");
        if (lang == "en") {
            $langSelector.hide()
        } else {
            $technology_link.attr("href", tech_link + "?lang=" + lang)
        }
        $switchTo.on("click", function(e) {
            var $this = $(this),
                lang = $this.data("lang");
            $switchTo.removeClass("selected");
            $this.addClass("selected");
            BASE.render.switchLanguage(lang);
            $technology_link.attr("href", tech_link + "?lang=" + lang);
            e.preventDefault()
        })
    }
    var zoomWarned = false;
    $(window).resize(function() {
        var documentWidthCss = Math.max(document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth);
        var isResized = document.width / documentWidthCss != 1;
        if (isResized && !zoomWarned) zoomWarning()
    });

    function zoomWarning() {
        zoomWarned = true;
        setTimeout(function() {
            zoomWarned = false
        }, 1e4);
        var modal = new JAM.model.Modal("modal", 400, 0, function($modal, modal) {
            modal.persistent = true;
            $modal.css("z-index", 1001);
            var $content = $($modal.find(".content"));
            var $title = $($modal.find("#title h3"));
            $title.append(BASE.render.t("zoom_warn")).data("t", "zoom_warn");
            $content.append(BASE.render.t("zoom_msg")).data("t", "zoom_msg");
            this.open();
            modal.$closeBtn.click(function() {
                setTimeout(function() {
                    modal.destroy()
                }, 2e3)
            })
        })
    }
    return init
}(jQuery);
JAM.namespace("instruments").guitar = function($) {
    "use strict";

    function Guitar(inst) {
        var _instrument = new JAM.model.StringInstrument({
            config: inst,
            getBindings: function() {
                var _local = BASE._language.bindings.strings,
                    _me = this,
                    count = 0,
                    string = 1;
                if (this.bindings) return this.bindings;
                this.bindings = {};
                _local.forEach(function(key, index) {
                    _me.bindings[key] = {
                        string: string,
                        pos: count
                    };
                    count++;
                    if (count > 9) {
                        count = 0;
                        string++
                    }
                })
            },
            getNotes: function() {
                return [{
                    string: "6",
                    held: 0,
                    notes: ["E", "F", "F♯", "G", "G♯", "A", "A♯", "B", "C", "C♯", "D", "D♯"]
                }, {
                    string: "5",
                    held: 0,
                    notes: ["B", "C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯"]
                }, {
                    string: "4",
                    held: 0,
                    notes: ["G", "G♯", "A", "A♯", "B", "C", "C♯", "D", "D♯", "E", "F", "F♯"]
                }, {
                    string: "3",
                    held: 0,
                    notes: ["D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B", "C", "C♯"]
                }, {
                    string: "2",
                    held: 0,
                    notes: ["A", "A♯", "B", "C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯"]
                }, {
                    string: "1",
                    held: 0,
                    notes: ["E", "F", "F♯", "G", "G♯", "A", "A♯", "B", "C", "C♯", "D", "D♯"]
                }]
            },
            fret_hints: function() {
                var _fret_hints = [],
                    _local = BASE._language.bindings.strings;
                for (var string_i = 1; string_i <= 4; string_i++) {
                    var count = 0,
                        keys = [];
                    for (var key_i = 1; key_i < 10; key_i++) {
                        var pos = (string_i - 1) * 10;
                        keys.push({
                            n: _local[pos + key_i],
                            v: string_i + "-" + key_i
                        })
                    }
                    _fret_hints.push({
                        string: string_i,
                        keys: keys
                    })
                }
                return _fret_hints
            },
            string_hints: function() {
                var _local = BASE._language.bindings.strings,
                    _string_hints = [{
                        string: "1",
                        keys: [{
                            n: _local[0],
                            v: "1-0"
                        }]
                    }, {
                        string: "2",
                        keys: [{
                            n: _local[10],
                            v: "2-0"
                        }]
                    }, {
                        string: "3",
                        keys: [{
                            n: _local[20],
                            v: "3-0"
                        }]
                    }, {
                        string: "4",
                        keys: [{
                            n: _local[30],
                            v: "4-0"
                        }]
                    }];
                return _string_hints
            },
            controls: JAM.controller.guitars
        });
        _instrument.load();
        return _instrument
    }
    return Guitar
}(jQuery);
JAM.namespace("model").GuitarStrings = function() {
    "use strict";

    function GuitarStrings(canvas, params) {
        if (!canvas) throw "Please provide a canvas element!";
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        params = params || {};
        var p = {};
        p.stringSize = params.stringSize || 2;
        p.stringSpacing = params.stringSpacing || 20;
        p.shadowDistance = params.shadowDistance || 6;
        p.shadowAnimFactor = typeof params.shadowAnimFactor == "undefined" ? .5 : params.shadowAnimFactor;
        p.locolor = params.locolor || "#000000";
        p.hicolor = params.hicolor || "#aaaaaa";
        p.shcolor = params.shcolor || "rgba(0, 0, 0, 0.1)";
        p.speed = params.speed || 1;
        p.maxOscillation = params.maxOscillation || 3;
        p.minOscillation = params.minOscillation || .01;
        p.damp = typeof params.damp == "undefined" ? .98 : params.damp;
        p.slideTime = params.slideTime || 1;
        p.debugDraw = params.debugDraw || false;
        this.strings = [];
        this.oscf = .4;
        this.redrawFlag = false
    }
    GuitarStrings.prototype = {
        createString: function(bx, by, w, t) {
            t = t || 1;
            var ax = bx - w;
            var ay = by;
            this.strings.push({
                ax: ax,
                ay: ay,
                bx: bx,
                by: by,
                t: t,
                tx: bx,
                ty: by,
                cx: ax + (bx - ax) * this.oscf,
                cy: ay + (by - ay) * this.oscf,
                an: Math.random() * Math.PI,
                r: 0,
                vn: 0,
                d: p.damp
            })
        },
        setSlideTime: function(t) {
            p.slideTime = t
        },
        setT: function(id, t) {
            if (!this.strings[id]) return;
            t = Math.min(t, 1);
            t = Math.max(t, 0);
            var s = this.strings[id];
            s.t = t;
            s.tx = s.ax + (s.bx - s.ax) * t;
            s.ty = s.ay + (s.by - s.ay) * t;
            this.strings[id] = s;
            s.cx = s.tx + (s.bx - s.tx) * this.oscf;
            s.cy = s.ty + (s.by - s.ty) * this.oscf;
            this.strings[id] = s
        },
        getT: function(id) {
            if (!this.strings[id]) return;
            else return this.strings[id].t
        },
        strum: function(id, damp) {
            if (!this.strings[id]) return;
            this.strings[id].r = p.maxOscillation;
            this.strings[id].d = damp || p.damp;
            var r = this.redrawFlag;
            this.redrawFlag = true;
            if (!r) this.render()
        },
        dampAll: function(damp) {
            var i = 0,
                l = this.strings.length;
            for (; i < l; i++) {
                if (this.strings[i].r > 0) {
                    this.strings[i].d = damp || p.damp
                }
            }
            this.redrawFlag = true
        },
        isStrumming: function(id) {
            return this.strings[id] && this.strings[id].r > 0
        },
        stop: function(id) {
            if (!id) {
                var i = 0,
                    l = this.strings.length;
                for (; i < l; i++) {
                    this.strings[i].r = 0
                }
            } else {
                this.strings[id].r = 0
            }
        },
        slideIn: function(id, callback, time, ease) {
            this.animate(id, callback, 1, time, ease)
        },
        slideOut: function(id, callback, time, ease) {
            this.stop(id);
            redrawFlag = false;
            this.animate(id, callback, -1, time, ease)
        },
        quadraticEaseOut: function(t) {
            return t * (2 - t)
        },
        quadraticEaseIn: function(t) {
            return t * t
        },
        linear: function(t) {
            return t
        },
        animate: function(id, callback, direction, time, ease) {
            var that = this;
            time = time || p.slideTime;
            direction = direction || 1;
            ease = this.linear;
            clearInterval(animid);
            var at = direction == -1 ? 1 : 0;
            var step = 1 / time / (1e3 / 60) * direction;
            var animid = setInterval(function() {
                var i = 0,
                    l = that.strings.length;
                at += step;
                at = Math.min(at, 1);
                at = Math.max(at, 0);
                var k = ease(at);
                var s;
                if (id != null) {
                    s = that.strings[id];
                    that.ctx.clearRect(s.ax, s.ay - 3, s.bx - s.ax, p.shadowDistance + 6);
                    that.drawSimple(s, p.locolor, 0, k);
                    that.drawSimple(s, p.hicolor, p.stringSize, k);
                    that.drawSimple(s, p.shcolor, p.shadowDistance, k)
                } else {
                    for (; i < l; i++) {
                        s = that.strings[i];
                        that.ctx.clearRect(s.ax, s.ay - 3, s.bx - s.ax, p.shadowDistance + 6);
                        that.drawSimple(s, p.locolor, 0, k);
                        that.drawSimple(s, p.hicolor, p.stringSize, k);
                        that.drawSimple(s, p.shcolor, p.shadowDistance, k)
                    }
                } if (at == 1 && direction == 1 || at == 0 && direction == -1) {
                    clearInterval(animid);
                    if (callback) callback.apply()
                }
            }, 1e3 / 60)
        },
        render: function() {
            if (this.redrawFlag) {
                this.redrawFlag = false;
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                var i = 0,
                    l = this.strings.length;
                for (; i < l; i++) {
                    var s = this.strings[i];
                    s.vn = Math.sin(s.an) * s.r;
                    s.r *= s.d;
                    if (s.r < p.minOscillation) s.r = 0;
                    s.an += p.speed;
                    if (s.r > 0) {
                        this.redrawFlag = true
                    }
                    this.drawFull(s, p.locolor, 0, 1);
                    this.drawFull(s, p.hicolor, p.stringSize, 1);
                    this.drawFull(s, p.shcolor, p.shadowDistance, p.shadowAnimFactor);
                    if (p.debugDraw) {
                        this.ctx.strokeStyle = "#ff0000";
                        this.ctx.beginPath();
                        this.ctx.moveTo(s.tx + .5, s.ty - 4);
                        this.ctx.lineTo(s.tx + .5, s.ty + 4);
                        this.ctx.stroke()
                    }
                }
            }
            var that = this;
            webkitRequestAnimationFrame(that.render)
        },
        drawSimple: function(s, c, offset, t) {
            offset = offset || 0;
            this.ctx.lineWidth = p.stringSize;
            this.ctx.strokeStyle = c;
            this.ctx.beginPath();
            this.ctx.moveTo(s.bx + (s.ax - s.bx) * (1 - t), s.by + offset);
            this.ctx.lineTo(s.ax, s.ay + offset);
            this.ctx.stroke()
        },
        drawFull: function(s, c, offset, i) {
            offset = offset || 0;
            this.ctx.lineWidth = p.stringSize;
            this.ctx.strokeStyle = c;
            this.ctx.beginPath();
            this.ctx.moveTo(s.ax, s.ay + offset);
            this.ctx.lineTo(s.tx, s.ty + offset);
            this.ctx.quadraticCurveTo(s.cx, s.cy + s.vn * i + offset, s.bx, s.by + offset);
            this.ctx.stroke();
            if (p.debugDraw) {
                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = "rgba(255,0,0,0.2)";
                this.ctx.beginPath();
                this.ctx.moveTo(s.tx, s.ty);
                this.ctx.lineTo(s.cx, s.cy + s.vn);
                this.ctx.lineTo(s.bx, s.by);
                this.ctx.stroke()
            }
        }
    };
    return GuitarStrings
}();
JAM.namespace("controller").guitars = function($) {
    "use strict";

    function init(_instrument) {
        var _$local = $("#instrument_local"),
            $slider = _$local.find("#style-slider"),
            $style = _$local.find("#style"),
            $pos = _$local.find("#guitar-position"),
            $posDown = $pos.find("#guitar-pos-down"),
            $posUp = $pos.find("#guitar-pos-up"),
            $posLeft = $pos.find("#guitar-pos-left"),
            $posRight = $pos.find("#guitar-pos-right"),
            $guitar_controls = _$local.find("#guitar-controls"),
            $hints = $("#hints"),
            dmaf = JAM.dmaf,
            _$document = $(document);
        BASE.listen("advanced_mode.guitar", function(event) {
            $guitar_controls.show();
            keyMatrix(_instrument)
        });
        BASE.listen("easy_mode.guitar", function(event) {
            $guitar_controls.hide();
            _$document.off("keyup.instrument");
            _$document.off("keydown.instrument")
        });
        dmaf.dispatch("switchMode", {
            mode: "easy"
        });
        BASE.tell("easy_mode");
        $style.html("normal");
        $slider.on("change", function() {
            var val = $slider.val(),
                style;
            switch (parseInt(val)) {
                case 1:
                    style = "normal";
                    break;
                case 2:
                    style = "muted";
                    break;
                case 3:
                    style = "damped";
                    break
            }
            dmaf.dispatch("switchStyle", {
                style: style
            });
            $style.html(style)
        });
        BASE.listen("startTour.instrument_tip", function(event) {
            var $ks = $("#keys_strings").find(".tt_text"),
                $tk = $("#frets_strings").find(".tt_text"),
                ks_text = $ks.text(),
                tk_text = $tk.text();
            $ks.html("<div class='tour_keyboard guitar'></div><br>" + ks_text + "<div class='clear'></div>");
            $tk.html("<div class='tour_keys'><span class='arrow up'>up</span><br/><span class='arrow left'>left</span><span class='arrow down'>down</span><span class='arrow right'>right</span></div>" + tk_text);
            BASE.off("startTour.instrument_tip")
        })
    }

    function keyMatrix(_instrument) {
        var $keyString = $(".key_string").first();
        var $note = $(".string_note").first(),
            noteHeight = $note.height(),
            noteWidth = $note.outerWidth(true),
            stringHeight = $keyString.height() + parseFloat($keyString.css("margin-bottom")),
            $hints_strings = $("#hints-strings"),
            $hints_frets = $("#hints-frets"),
            $hints = $("#hints"),
            _posX = 0,
            _posY = 0,
            _$document = $(document),
            adjustMatrix = function(offX, offY) {
                _instrument.posX = offX;
                _instrument.posY = offY;
                $hints.animate({
                    "margin-top": _instrument.posY * stringHeight
                }, 150);
                $hints_frets.animate({
                    "margin-left": _instrument.posX * noteWidth
                }, 150)
            };
        _$document.on("keyup.instrument", function(e) {
            var code = BASE.utils.keyToString(e.keyCode);
            switch (code) {
                case "right":
                    if (_posX < 3) {
                        _posX++;
                        adjustMatrix(_posX, _posY)
                    }
                    e.preventDefault();
                    break;
                case "left":
                    if (_posX > 0) {
                        _posX--;
                        adjustMatrix(_posX, _posY)
                    }
                    e.preventDefault();
                    break;
                case "up":
                    if (_posY > 0) {
                        _posY--;
                        adjustMatrix(_posX, _posY)
                    }
                    e.preventDefault();
                    break;
                case "down":
                    if (_posY < 2) {
                        _posY++;
                        adjustMatrix(_posX, _posY)
                    }
                    e.preventDefault();
                    break
            }
        });
        _$document.on("keydown.instrument", function(e) {
            var code = BASE.utils.keyToString(e.keyCode);
            switch (code) {
                case "right":
                    e.preventDefault();
                    break;
                case "left":
                    e.preventDefault();
                    break;
                case "up":
                    e.preventDefault();
                    break;
                case "down":
                    e.preventDefault();
                    break
            }
        })
    }
    return init
}(jQuery);
GuitarStrings = function(canvas, params) {
    if (!canvas) throw "Please provide a canvas element!";
    var ctx = canvas.getContext("2d");
    params = params || {};
    var p = {};
    p.stringSize = params.stringSize || 2;
    p.stringSpacing = params.stringSpacing || 20;
    p.shadowDistance = params.shadowDistance || 6;
    p.shadowAnimFactor = typeof params.shadowAnimFactor == "undefined" ? .5 : params.shadowAnimFactor;
    p.locolor = params.locolor || "#000000";
    p.hicolor = params.hicolor || "#aaaaaa";
    p.shcolor = params.shcolor || "rgba(0, 0, 0, 0.1)";
    p.speed = params.speed || 1;
    p.maxOscillation = params.maxOscillation || 3;
    p.minOscillation = params.minOscillation || .01;
    p.damp = typeof params.damp == "undefined" ? .98 : params.damp;
    p.slideTime = params.slideTime || 1;
    p.debugDraw = params.debugDraw || false;
    var strings = [];
    var oscf = .4;
    var redrawFlag = false;
    var animationLock = true;
    var destroyed = false;
    this.createString = function(bx, by, w, t) {
        t = t || 1;
        ax = bx - w;
        ay = by;
        strings.push({
            ax: ax,
            ay: ay,
            bx: bx,
            by: by,
            t: t,
            tx: bx,
            ty: by,
            cx: ax + (bx - ax) * oscf,
            cy: ay + (by - ay) * oscf,
            an: Math.random() * Math.PI,
            r: 0,
            vn: 0,
            d: p.damp
        })
    };
    this.setSlideTime = function(t) {
        p.slideTime = t
    };
    this.setT = function(id, t) {
        if (!strings[id]) return;
        t = Math.min(t, 1);
        t = Math.max(t, 0);
        var s = strings[id];
        s.t = t;
        s.tx = s.ax + (s.bx - s.ax) * t;
        s.ty = s.ay + (s.by - s.ay) * t;
        strings[id] = s;
        s.cx = s.tx + (s.bx - s.tx) * oscf;
        s.cy = s.ty + (s.by - s.ty) * oscf;
        strings[id] = s
    };
    this.getT = function(id) {
        if (!strings[id]) return;
        else return strings[id].t
    };
    this.strum = function(id, damp) {
        if (!strings[id] || animationLock) return;
        strings[id].r = p.maxOscillation;
        strings[id].d = damp || p.damp;
        var r = redrawFlag;
        redrawFlag = true
    };
    this.dampAll = function(damp) {
        var i = 0,
            l = strings.length;
        for (; i < l; i++) {
            if (strings[i].r > 0) {
                strings[i].d = damp || p.damp
            }
        }
        redrawFlag = true
    };
    this.isStrumming = function(id) {
        return strings[id] && strings[id].r > 0
    };
    this.stop = function(id) {
        if (!id) {
            var i = 0,
                l = strings.length;
            for (; i < l; i++) {
                strings[i].r = 0
            }
        } else {
            strings[id].r = 0
        }
    };
    this.slideIn = function(id, callback, time, ease) {
        animate(id, callback, 1, time, ease)
    };
    this.slideOut = function(id, callback, time, ease) {
        this.stop(id);
        redrawFlag = false;
        animate(id, callback, -1, time, ease)
    };
    this.destroy = function() {
        destroyed = true
    };
    var quadraticEaseOut = function(t) {
        return t * (2 - t)
    };
    var quadraticEaseIn = function(t) {
        return t * t
    };
    var linear = function(t) {
        return t
    };
    var animate = function(id, callback, direction, time, ease) {
        animationLock = true;
        time = time || p.slideTime;
        direction = direction || 1;
        ease = direction == 1 ? quadraticEaseIn : quadraticEaseOut;
        clearInterval(animid);
        var at = direction == -1 ? 1 : 0;
        var step = 1 / time / (1e3 / 60) * direction;
        var animid = setInterval(function() {
            var i = 0,
                l = strings.length;
            at += step;
            at = Math.min(at, 1);
            at = Math.max(at, 0);
            var k = ease(at);
            var s;
            if (id != null) {
                s = strings[id];
                ctx.clearRect(s.ax, s.ay - 3, s.bx - s.ax, p.shadowDistance + 6);
                drawSimple(s, p.locolor, 0, k);
                drawSimple(s, p.hicolor, p.stringSize, k);
                drawSimple(s, p.shcolor, p.shadowDistance, k)
            } else {
                for (; i < l; i++) {
                    s = strings[i];
                    ctx.clearRect(s.ax, s.ay - 3, s.bx - s.ax, p.shadowDistance + 6);
                    drawSimple(s, p.locolor, 0, k);
                    drawSimple(s, p.hicolor, p.stringSize, k);
                    drawSimple(s, p.shcolor, p.shadowDistance, k)
                }
            } if (at == 1 && direction == 1 || at == 0 && direction == -1) {
                clearInterval(animid);
                if (at == 1 && direction == 1) animationLock = false;
                if (callback) callback.apply()
            }
        }, 1e3 / 60)
    };
    var render = function() {
        if (redrawFlag) {
            redrawFlag = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            var i = 0,
                l = strings.length;
            for (; i < l; i++) {
                var s = strings[i];
                s.vn = Math.sin(s.an) * s.r;
                s.r *= s.d;
                if (s.r < p.minOscillation) s.r = 0;
                s.an += p.speed;
                if (s.r > 0) {
                    redrawFlag = true
                }
                drawFull(s, p.locolor, 0, 1);
                drawFull(s, p.hicolor, p.stringSize, 1);
                drawFull(s, p.shcolor, p.shadowDistance, p.shadowAnimFactor);
                if (p.debugDraw) {
                    ctx.strokeStyle = "#ff0000";
                    ctx.beginPath();
                    ctx.moveTo(s.tx + .5, s.ty - 4);
                    ctx.lineTo(s.tx + .5, s.ty + 4);
                    ctx.stroke()
                }
            }
        }
        if (!destroyed) webkitRequestAnimationFrame(render)
    };
    var drawSimple = function(s, c, offset, t) {
        offset = offset || 0;
        ctx.lineWidth = p.stringSize;
        ctx.strokeStyle = c;
        ctx.beginPath();
        ctx.moveTo(s.bx + (s.ax - s.bx) * (1 - t), s.by + offset);
        ctx.lineTo(s.ax, s.ay + offset);
        ctx.stroke()
    };
    var drawFull = function(s, c, offset, i) {
        offset = offset || 0;
        ctx.lineWidth = p.stringSize;
        ctx.strokeStyle = c;
        ctx.beginPath();
        ctx.moveTo(s.ax, s.ay + offset);
        ctx.lineTo(s.tx, s.ty + offset);
        ctx.quadraticCurveTo(s.cx, s.cy + s.vn * i + offset, s.bx, s.by + offset);
        ctx.stroke();
        if (p.debugDraw) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = "rgba(255,0,0,0.2)";
            ctx.beginPath();
            ctx.moveTo(s.tx, s.ty);
            ctx.lineTo(s.cx, s.cy + s.vn);
            ctx.lineTo(s.bx, s.by);
            ctx.stroke()
        }
    };
    render()
};
JAM.namespace("controller").header = function($) {
    "use strict";
    var _$header = $("#header"),
        _$main = $("#main"),
        _$window = $(window),
        _$document = $(document),
        _$currentInstrument, _$currentInstrumentHolder, _$arm, _controlsHeight = 140,
        _disabled = [],
        _warn, _artTime, _oldBpm = 120,
        _bpmChanged = false,
        lastInstrument, trackKeyClose = false;

    function init() {
        var $metronome = _$header.find("#metronome"),
            $tempo = _$header.find("#tempo"),
            $key = _$header.find("#key"),
            $help = _$header.find("#help"),
            $controls = $("#header-controls"),
            $tempoControls = $("#tempo-controls"),
            $tempoInner = $("#tempo-controls-inner"),
            $metronomeBox = $("#metronome_li"),
            metronomeOn = false,
            hintsOn = false,
            helpOn = false,
            tempoOpen = false,
            keyOpen = false;
        JAM.startTime = (new Date).getTime();
        _$header = $("#header");
        _$main = $("#main");
        _$window = $(window);
        _$arm = $("#metronome-arm");
        _disabled = [];
        triangles();
        hitareas();
        _$currentInstrument = $("#current-instrument");
        _$currentInstrumentHolder = $("#current-instrument-holder");
        _$currentInstrumentHolder.attr("class", JAM.controller.session.getInstrument());
        lastInstrument = JAM.controller.session.getInstrument();
        _warn = new JAM.model.Modal("warn", 400, 133, function($modal, _modal) {
            $modal.find("#confirm-end").on("click", function(e) {
                gaq.push(["_trackEvent", "Session", "End", "End"]);
                gaq.push(["_trackEvent", "Session", "End", "Total JAMMING duration", (new Date).getTime() - JAM.startTime]);
                JAM.startTime = undefined;
                _modal.close();
                BASE.router.path("/ended/");
                e.preventDefault()
            });
            $modal.find("#keep-jamming").on("click", function(e) {
                gaq.push(["_trackEvent", "Session", "End", "Cancel"]);
                _modal.close();
                e.preventDefault()
            });
            _modal.$closeBtn.click(function() {
                gaq.push(["_trackEvent", "Session", "End", "Close"])
            })
        });
        _$header.on("click", "#end", function() {
            _warn.open();
            gaq.push(["_trackEvent", "Session", "End", "Open"])
        });
        $metronome.find(".slider-on").on("click", function() {
            if (!metronomeOn) {
                $metronome.find(".slider").translateSVG(-36, 0, 100);
                $metronome.find(".active").removeClass("active");
                $(this).addClass("active");
                JAM.dmaf.dispatch("metronomeOn");
                _$arm.addClass("on");
                metronomeOn = true;
                gaq.push(["_trackEvent", "Session", "Metronome", "On"]);
                $metronomeBox.fadeIn();
                BASE.listen("view_changed.metronome", function() {
                    JAM.dmaf.dispatch("metronomeOff")
                })
            }
        });
        $metronome.find(".slider-off").on("click", function() {
            if (metronomeOn) {
                $metronome.find(".slider").translateSVG(36, 0, 100);
                $metronome.find(".active").removeClass("active");
                $(this).addClass("active");
                JAM.dmaf.dispatch("metronomeOff");
                _$arm.removeClass("on");
                metronomeOn = false;
                gaq.push(["_trackEvent", "Session", "Metronome", "Off"]);
                $metronomeBox.fadeOut();
                BASE.off("view_changed.metronome")
            }
        });
        $help.find(".slider-on").on("click", function() {
            if (!helpOn) {
                BASE.tell("showHelp")
            }
        });
        $help.find(".slider-off").on("click", function() {
            hintOff()
        });
        BASE.listen("loadInstrument.header", function() {
            hintOff()
        });
        BASE.listen("startTour.header", function() {
            hintOn()
        });
        BASE.listen("endTour.header", function() {
            hintOff()
        });

        function hintOn() {
            if (!helpOn) {
                helpOn = true;
                $help.find(".slider").translateSVG(-36, 0, 100);
                $help.find(".active").removeClass("active");
                $help.find(".slider-on").addClass("active")
            }
        }

        function hintOff() {
            if (helpOn) {
                helpOn = false;
                $help.find(".slider").translateSVG(36, 0, 100);
                $help.find(".active").removeClass("active");
                $help.find(".slider-off").addClass("active");
                BASE.tell("hideHelp")
            }
        }
        $tempo.on("click", function(e) {
            if (keyOpen) return;
            gaq.push(["_trackEvent", "Session", "Tempo", "Open"]);
            if (!tempoOpen) {
                tempoOpen = true;
                $("#tempo-slide").translateSVG(233, 0, 150);
                _$currentInstrument.translateSVG(200, 0, 150);
                $key.translateSVG(200, 0, 150);
                $help.translateSVG(200, 0, 150);
                $controls.tween({
                    "padding-left": 147
                }, 150, TWEEN.Easing.Sinusoidal.Out).start();
                $tempoControls.show();
                $tempoInner.tween({
                    left: 0
                }, 150, TWEEN.Easing.Sinusoidal.Out, function() {
                    $("#tempo-controls").clickOutside(function() {
                        closeTempo()
                    })
                }, 0, true)
            }
        });

        function closeTempo() {
            if (!tempoOpen) return false;
            var newBpm = parseInt($("#tempo-slider-control").val());
            if (_bpmChanged || _oldBpm != newBpm) {
                applyTempo(newBpm);
                _bpmChanged = false;
                gaq.push(["_trackEvent", "Session", "Tempo", "Value", newBpm])
            } else gaq.push(["_trackEvent", "Session", "Tempo", "Close"]);
            $("#tempo-slide").translateSVG(-233, 0, 150);
            _$currentInstrument.translateSVG(-200, 0, 150);
            $key.translateSVG(-200, 0, 150);
            $help.translateSVG(-200, 0, 150);
            $controls.tween({
                "padding-left": 347
            }, 150, TWEEN.Easing.Sinusoidal.Out).start();
            $tempoInner.tween({
                left: -200
            }, 150, TWEEN.Easing.Sinusoidal.Out, function() {
                tempoOpen = false;
                $tempoControls.hide()
            }, 0, true)
        }
        $("#tempo-controls .closer").on("click", function() {
            $tempo.trigger("click")
        });
        $key.on("click", function(e) {
            if (tempoOpen) return;
            if (!keyOpen) {
                keyOpen = true;
                trackKeyClose = true;
                gaq.push(["_trackEvent", "Session", "Key", "Open"]);
                $("#key-slide").translateSVG(380, 0, 150);
                $help.translateSVG(347, 0, 150);
                $controls.tween({
                    "padding-left": 0
                }, 150, TWEEN.Easing.Sinusoidal.Out, function() {
                    $("#key-slide").clickOutside(function(e) {
                        closeKey()
                    })
                }).start()
            }
        });

        function closeKey() {
            if (!keyOpen) return false;
            if (trackKeyClose) gaq.push(["_trackEvent", "Session", "Key", "Close"]);
            trackKeyClose = false;
            $("#key-slide").translateSVG(-380, 0, 150);
            $help.translateSVG(-347, 0, 150);
            $controls.tween({
                "padding-left": 347
            }, 150, TWEEN.Easing.Sinusoidal.Out, function() {
                keyOpen = false
            }).start()
        }
        $("#key-slide .closer").on("click", function() {
            $key.trigger("click")
        });
        switcher();
        slideoutsTempo();
        slideoutsKey();
        BASE.tell({
            type: "tempo",
            tempo: JAM.controller.session.getTempo()
        });
        BASE.tell({
            type: "scale",
            scale: JAM.controller.session.getScale()
        });
        BASE.tell({
            type: "key",
            key: JAM.controller.session.getKey()
        })
    }

    function switcher() {
        var $change = _$header.find("#change-instruments"),
            $thumbs = $change.find(".instrument_thumb"),
            $switcher = $change.find("#instrumentSwitcher"),
            $controls = $("#header-controls"),
            count = $thumbs.length,
            itemWidth = $thumbs.first().outerWidth(true),
            dockWidth = count * itemWidth,
            dockHeight = 95,
            dockCenter, prevX, marginLeft = 0,
            isScrolling = false,
            windowWidth = Math.max(_$window.width(), 1100),
            drag = false,
            startDrag = false,
            dragTimeout, sideMargin = 45,
            min = 80,
            leftScroll = false,
            rightScroll = false,
            delay = 10,
            animateSpeed = 200;
        $switcher.width(dockWidth);

        function centerDock() {
            dockCenter = (dockWidth - windowWidth) / 2 + itemWidth / 2;
            marginLeft = -1 * dockCenter;
            $switcher.css("left", marginLeft)
        }
        centerDock();
        _$window.on("resize", function() {
            windowWidth = Math.max(_$window.width(), 1100);
            centerDock()
        });
        $change.on("mousedown", function() {
            startDrag = true
        });
        _$window.on("mouseup", function() {
            startDrag = false;
            dragTimeout = setTimeout(function() {
                drag = false
            }, 100)
        });
        $change.on("mousemove", function(event) {
            var x = event.pageX,
                delta = prevX - x || 0;
            prevX = x;
            if (startDrag) {
                clearTimeout(dragTimeout);
                drag = true;
                slide(delta);
                return false
            }
            if (x < min) {
                if (!rightScroll) scrollRight();
                return false
            }
            if (x > windowWidth - min) {
                if (!leftScroll) scrollLeft();
                return false
            }
            stopScroll()
        });

        function scrollLeft() {
            leftScroll = setInterval(function() {
                slide(3)
            }, delay)
        }

        function scrollRight() {
            rightScroll = setInterval(function() {
                slide(-3)
            }, delay)
        }

        function stopScroll() {
            clearInterval(leftScroll);
            clearInterval(rightScroll);
            leftScroll = false;
            rightScroll = false
        }

        function slide(delta) {
            if (marginLeft - delta < 0 && marginLeft - delta > windowWidth - dockWidth - sideMargin) {
                marginLeft -= delta;
                if (!isScrolling) {
                    isScrolling = true;
                    $switcher.tween({
                        left: marginLeft
                    }, delay, TWEEN.Easing.Linear.None, function() {
                        isScrolling = false
                    })
                }
            }
        }
        $thumbs.on("mouseup", function() {
            var $this = $($(this).find(".menu_tip")),
                _instrument = $this.data("ident");
            if (_disabled.indexOf(_instrument) != -1) return;
            if (!drag) {
                var time = (new Date).getTime() - JAM.startTime;
                gaq.push(["_trackEvent", "Session", "Instrument", BASE.utils.prettyName(lastInstrument), time]);
                lastInstrument = _instrument;
                JAM.startTime = (new Date).getTime();
                JAM.controller.session.setInstrument(_instrument);
                if ($change.css("top") == 0) return false;
                $controls.addClass("up");
                $change.tween({
                    top: -dockHeight
                }, animateSpeed, TWEEN.Easing.Cubic.Out, function() {
                    $controls.tween({
                        top: 0
                    }, animateSpeed, TWEEN.Easing.Cubic.Out);
                    $("#end").fadeIn(animateSpeed)
                });
                _$main.off("mouseenter.change_instrument")
            }
        });
        $controls.on("click", "#current-instrument", function(event) {
            var $this = $(this);
            gaq.push(["_trackEvent", "Session", "Instrument", "Open"]);
            $("#end").fadeOut(200);
            $controls.tween({
                top: -_controlsHeight
            }, animateSpeed / 2, TWEEN.Easing.Cubic.Out, function() {
                $change.tween({
                    top: 0
                }, animateSpeed, TWEEN.Easing.Cubic.Out);
                var isOverSwitcher = false;
                var timeout;
                _$main.on("mouseenter.change_instrument", function() {
                    timeout = setTimeout(function() {
                        isOverSwitcher = false;
                        _$main.off("mouseenter.change_instrument");
                        if (!isOverSwitcher) {
                            gaq.push(["_trackEvent", "Session", "Instrument", "Close"]);
                            $change.tween({
                                top: -dockHeight
                            }, animateSpeed, TWEEN.Easing.Cubic.Out, function() {
                                $controls.tween({
                                    top: 0
                                }, animateSpeed / 2, TWEEN.Easing.Cubic.Out, function() {
                                    $controls.attr("style", "");
                                    $("#end").fadeIn(500)
                                })
                            })
                        }
                    }, 1200)
                });
                $switcher.on("mouseenter", function() {
                    isOverSwitcher = true;
                    clearTimeout(timeout)
                })
            })
        });
        clientListeners()
    }

    function clientListeners() {
        var _myID = JAM.controller.session.myId();
        JAM.controller.session.getClients().forEach(function(client) {
            var instrument = client.player_instrument,
                id = event.player_id,
                $el;
            if (instrument) {
                $el = $(".instrument_thumb." + instrument);
                if (_myID == id) {
                    $el.addClass("selected")
                } else {
                    $el.addClass("disabled")
                }
                _disabled.push(instrument)
            }
        });
        BASE.listen("clientChange.change", function(event) {
            var instrument = event.player_instrument,
                $el;
            if (instrument) {
                $el = $(".instrument_thumb." + instrument);
                $el.removeClass("disabled selected");
                BASE.utils.removeItem(_disabled, instrument)
            }
        });
        BASE.listen("clientUpdate.change, clientConnect.change", function(event) {
            var instrument = event.player_instrument,
                id = event.player_id,
                $el;
            if (instrument) {
                $el = $(".instrument_thumb." + instrument);
                if (_myID == id) {
                    $el.addClass("selected")
                } else {
                    $el.addClass("disabled")
                }
                _disabled.push(instrument)
            }
        });
        BASE.listen("clientRemove.change", function(event) {
            var instrument = event.player_instrument,
                $el, index;
            if (instrument) {
                $el = $(".instrument_thumb." + instrument);
                $el.removeClass("disabled selected");
                BASE.utils.removeItem(_disabled, instrument)
            }
        })
    }

    function slideoutsTempo() {
        var $bpm = $("#bpm"),
            $bpmSlider = $("#tempo-slider-control"),
            $tempo = $("#tempo .read-out"),
            from_server = false;
        $bpm.on("keydown.header, keypress.header", function(e) {
            e.stopPropagation()
        });
        $bpm.on("keyup.header", function(e) {
            var key = BASE.utils.keyToString(e.keyCode);
            if ($bpm.val().length > 3) e.preventDefault();
            if (key == "enter" || $bpm.val().length == 3) {
                applyTempo(parseInt($bpm.val()))
            }
            e.stopPropagation()
        });
        $bpm.limitToNum();
        $bpm.on("click", function() {
            $bpm.val("")
        });
        $bpm.on("blur", function() {
            var val = parseInt($bpm.val());
            $bpmSlider.val(val).change();
            $bpm.val($bpm.data("replace"))
        });
        $bpmSlider.on("change", function() {
            var val = parseInt($bpmSlider.val());
            $tempo.html(val);
            if (!from_server) {} else {
                from_server = false
            }
        });
        $bpmSlider.on("mousedown", function() {
            _$document.one("mouseup", function() {
                var val = parseInt($bpmSlider.val());
                JAM.dmaf.dispatch("switchTempo", {
                    tempo: val
                });
                JAM.broadcaster.sendEvent("changeTempo", {
                    tempo: val
                })
            })
        });
        BASE.listen("tempo.header", function(event) {
            from_server = true;
            $bpmSlider.val(event.tempo).change();
            tempoSpeed(event.tempo)
        })
    }

    function applyTempo(val) {
        if (val > 200) val = 200;
        if (val < 40) val = 40;
        if (_oldBpm != val) _bpmChanged = true;
        _oldBpm = val;
        $("#bpmSlider").val(val).change();
        var $bpm = $("#bpm");
        $bpm.blur();
        $bpm.val($bpm.data("replace"));
        JAM.dmaf.dispatch("switchTempo", {
            tempo: val
        });
        JAM.broadcaster.sendEvent("changeTempo", {
            tempo: val
        })
    }

    function tempoSpeed(bpm) {
        var speed = 2 / (bpm / 60);
        _$arm.removeClass("on");
        _$arm.attr("style", "-webkit-animation-duration: " + speed + "s");
        clearTimeout(_artTime);
        _artTime = setTimeout(function() {
            _$arm.addClass("on")
        }, 50)
    }

    function slideoutsKey() {
        var $keys = $(".key_selector_group"),
            $key = $("#key"),
            $off = $(":not(#key-slide)"),
            $slider = $("#key-slider"),
            $holder = $("#key-slide"),
            major = true;
        var keys = ["E", "F", "F♯", "G", "G♯", "A", "A♯", "B", "C", "C♯", "D", "D♯"];
        $keys.on("click", function() {
            var $this = $(this),
                key = $this.data("key");
            gaq.push(["_trackEvent", "Session", "Key", keys[key - 1]]);
            trackKeyClose = false;
            JAM.dmaf.dispatch("switchKey", {
                key: parseInt(key) - 1
            });
            JAM.broadcaster.sendEvent("changeKey", {
                key: key
            });
            updateKeyReadout(key)
        });

        function updateKeyReadout(key) {
            var k = key || JAM.controller.session.getKey();
            $("#key-selector_" + key).attr("class", "key_selector_group current");
            var m = major ? "" : "<span>m</span>";
            $("#key .read-out").html(keys[k - 1] + m)
        }
        BASE.listen("key.header", function(event) {
            var selector = $("#key-text-selector_" + event.key).html();
            updateChordButtons();
            $(".key_selector_group.current").attr("class", "key_selector_group");
            $("#key-selector_" + event.key).attr("class", "key_selector_group current")
        });
        $("#key-maj").on("click", function() {
            if (major) return false;
            trackKeyClose = false;
            gaq.push(["_trackEvent", "Session", "Key", "MAJ"]);
            JAM.dmaf.dispatch("switchScale", {
                scale: "major"
            });
            JAM.broadcaster.sendEvent("changeScale", {
                scale: 1
            });
            updateChordButtons()
        });
        $("#key-min").on("click", function() {
            if (!major) return false;
            trackKeyClose = false;
            gaq.push(["_trackEvent", "Session", "Key", "MIN"]);
            JAM.dmaf.dispatch("switchScale", {
                scale: "minor"
            });
            JAM.broadcaster.sendEvent("changeScale", {
                scale: 2
            });
            updateChordButtons()
        });
        BASE.listen("easy_mode.header", function(event) {
            updateChordButtons()
        });
        BASE.listen("instrumentReady", function() {
            setTimeout(updateChordButtons, 2e3)
        });

        function updateChordButtons() {
            updateKeyReadout();
            var chords = JAM.dmaf.getCurrentChords();
            for (var i = 0; i < 6; i++) {
                var element = "#chords .radio:nth-child(" + (i + 1) + ")";
                var chord = chords[i];
                var sharp = "";
                chord.replace("#", "&#x266F;");
                chord.replace("b", "&#9837;");
                if (chord.length == 3) sharp = "<span class='sharp-text'>" + chord.charAt(1) + "<br>" + chord.charAt(2) + "</span>";
                else if (chord.length == 2) sharp = "<span class='sharp-text'>" + chord.charAt(1) + "</span>";
                $(element).html("<div>" + chord.charAt(0) + sharp + "</div>")
            }
        }
        BASE.listen("scale.header", function(event) {
            if (event.scale == 2) {
                if (major) {
                    major = false;
                    $slider.translateSVG(34, 0, 100);
                    $holder.find(".active").removeClass("active");
                    $("#key-min").addClass("active")
                }
            } else {
                if (!major) {
                    major = true;
                    $slider.translateSVG(-34, 0, 100);
                    $holder.find(".active").removeClass("active");
                    $("#key-maj").addClass("active")
                }
            }
            updateChordButtons()
        })
    }

    function triangles() {
        $(".triangle").each(function() {
            var $this = $(this),
                tri = new JAM.model.Triangle($this)
        })
    }

    function hitareas(callback) {
        var $controls = $("#header-navs"),
            $hits = _$header.find("#nav-hit-areas"),
            hit;
        hit = new JAM.model.HitTest($controls);
        $hits.html(hit.getSvg())
    }
    return init
}(jQuery);
JAM.namespace("model").HitTest = function($) {
    "use strict";

    function HitTest($el) {
        if ($el.length == 0) return false;
        this.$el = $el;
        this.svg = "";
        this.areas = [];
        this.parse();
        this.create();
        this.build()
    }
    HitTest.prototype = {
        parse: function() {
            this.elHeight = this.$el.height();
            this.elWidth = this.$el.width();
            this.elSvgs = this.$el.find("svg");
            this.elPolygons = this.elSvgs.find("polygon")
        },
        create: function() {
            var that = this;
            this.svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + this.elWidth + '" height="' + this.elHeight + '">';
            this.elSvgs.each(function() {
                var $svg = $(this),
                    noHit = $svg.data("hit") || false,
                    offL = parseFloat($svg.offset().left) - that.$el.offset().left,
                    offT = parseFloat($svg.offset().top) - that.$el.offset().top,
                    $polygons = $svg.find("polygon");
                if (!noHit) {
                    $polygons.each(function() {
                        var $s = $(this),
                            points = $s.attr("points"),
                            id = $s.data("ident") || "",
                            path = points.split(" ");
                        path.forEach(function(p, index) {
                            var sp = p.split(","),
                                pos = [];
                            pos[0] = parseFloat(sp[0]) + offL;
                            pos[1] = parseFloat(sp[1]) + offT;
                            path[index] = pos
                        });
                        path.forEach(function(p, index) {
                            path[index] = path[index].join(",")
                        });
                        if (id.length > 0) {
                            id = "id='" + id + "'"
                        }
                        that.svg += "<polygon " + id + " points='" + path.join(" ") + "' />"
                    })
                }
            });
            this.svg += "</svg>"
        },
        build: function(path) {},
        getSvg: function() {
            return this.svg
        }
    };
    return HitTest
}(jQuery);
JAM.namespace("model").Instrument = function($) {
    "use strict";
    var _$instrument_local;
    var is_mac = navigator.platform === "MacIntel";

    function Instrument(options, el) {
        this.default_pattern_note = 0;
        for (member in options) {
            if (options.hasOwnProperty(member)) {
                this[member] = options[member]
            }
        }
        this.getBindings();
        this.getKeycodes();
        this.localizedKeys = BASE._language.bindings[this.config.type];
        this.notes = this.getNotes() || [];
        this.spacer = 150;
        this.dmaf = JAM.dmaf;
        this.name = this.config.name;
        this.type = this.config.type;
        this.zones = [];
        this.stage;
        this.easyMode = true;
        this._events = {};
        this.$events = $(this._events);
        this.afterUpSpeed = 600;
        this.dragDelay = 15;
        this.draging = false;
        this.patternsOn = false;
        this.disabledNotes = [];
        this.myClient = JAM.controller.session.myClient();
        this.header_delay = 600;
        this.mouseActive = false;
        this.keyActive = false;
        _$instrument_local = $("#instrument_local")
    }
    Instrument.prototype = {
        load: function(el) {
            _$instrument_local = $("#instrument_local");
            var me = this;
            BASE.render.view(this.config.template, function(tmp) {
                _$instrument_local.html(tmp);
                me.$el = el ? $(el) : $(".canvas_holder");
                if (!_$instrument_local.length || !me.$el.length) {
                    console.log("Error: ", "No Canvas Area");
                    BASE.tell("loadingFailed");
                    return
                }
                me.parts(function() {
                    JAM.manager.interface.scan(_$instrument_local);
                    me.fadeControls(1);
                    if (me.config.fx_defaults) {
                        var fx1 = me.config.fx_defaults.fx1,
                            fx2 = me.config.fx_defaults.fx2;
                        if (fx1) {
                            BASE.tell({
                                type: "set_fx1",
                                value: fx1
                            })
                        }
                        if (fx2) {
                            BASE.tell({
                                type: "set_fx2",
                                value: fx2
                            })
                        }
                    }
                    BASE.tell({
                        type: "chord",
                        chord: JAM.controller.session.getChord()
                    });
                    setTimeout(function() {
                        $("#header-controls").removeClass("up");
                        me.listeners()
                    }, me.header_delay)
                });
                me.controls(me);
                me.center();
                me.hints();
                me.createStage(me.$el);
                BASE.view.tell("view_instrument")
            }, {
                instrument_name: this.config.name,
                instrument_ident: this.config.ident,
                instrument_type: this.config.type,
                instrument_config: this.config,
                collection: this.notes,
                fx1: this.config.fx1,
                fx2: this.config.fx2
            })
        },
        getBindings: function() {
            var _local = BASE._language.bindings[this.config.type],
                _me = this;
            if (this.bindings) return this.bindings;
            this.bindings = {};
            _local.forEach(function(key, index) {
                _me.bindings[key] = index
            })
        },
        getKeycodes: function() {
            this.keyCodes = BASE._language.keyCodes[this.config.type]
        },
        destroy: function(callback, force) {
            var pause = this.easyMode ? 0 : 800,
                wait = pause + 2e3,
                global_delay = pause,
                duration = 200,
                next = 25;
            this.unlisten();
            if (this.stage) this.stage.destroy();
            this.stage = null;
            BASE.off("." + this.type);
            if (force) {
                callback();
                return false
            }
            this.hideHints(50);
            if (this.unload) {
                global_delay += this.unload()
            }
            if (!this.config.parts) {
                callback();
                return false
            }
            $("#instrument_local").removeClass("pro_mode");
            BASE.utils.fastReverse(this.config.parts).forEach(function(part) {
                var $part = $("#" + part.id),
                    speed = part.speed / 2 || duration,
                    delay = part.delay / 2 || next;
                $part.move().set("background-size", "0%").duration(speed).delay(global_delay).end();
                global_delay += delay
            });
            if (this.strings) {
                var capDelay, strings = this.strings;
                $(".cap").each(function() {
                    $(this).move().set("background-size", "0%").duration(200).delay(capDelay).end();
                    capDelay + 50
                });
                for (var i = 0; i < this.stringCount; i++) {
                    this.strings.slideOut(i, null, .5)
                }
            }
            this.fadeControls(0);
            setTimeout(callback, wait)
        },
        fadeControls: function(to) {
            var from = to > 0 ? 0 : 1,
                startDelay = to > 0 ? 800 : 0,
                speed = to > 0 ? 600 : 50,
                delay = to > 0 ? 300 : 10,
                delayChord = to > 0 ? 100 : 20,
                delayPattern = delayChord + 100,
                delayMode = to > 0 ? 2e3 : 10,
                bgsize = to > 0 ? "100%" : "0%";
            var $chords = $("#chords"),
                $patterns = $("#patterns"),
                $hints = $("#key-hints"),
                $knobs = $(".knob"),
                $dots = $(".dot"),
                $knobToggle = $(".knob_toggle"),
                $labels = $(".knob_label"),
                $mode = $("#mode"),
                $radios = $(".radios"),
                $knob = $("#knobs");
            $knobs.css("opacity", from);
            $knobToggle.css("opacity", from);
            $chords.css("opacity", 1);
            $patterns.css("opacity", 1);
            $dots.css("opacity", from);
            $mode.css("opacity", from);
            $radios.css("opacity", from);
            $knob.css("opacity", from);
            $(".radio").each(function() {
                var $this = $(this),
                    opacity = $this.css("opacity"),
                    set = from == 0 ? 0 : opacity;
                $this.data("opacity", opacity);
                $this.css("opacity", set)
            });
            $labels.each(function() {
                var $this = $(this),
                    oldO = parseInt($this.css("opacity")),
                    opacity = oldO > 0 ? oldO : 1,
                    set = from == 0 ? 0 : opacity;
                $this.data("opacity", opacity);
                $this.css("opacity", set)
            });
            $knob.tween({
                opacity: to
            }, speed, TWEEN.Easing.Cubic.Out, false, startDelay);
            $knobs.each(function() {
                var $knob = $(this);
                $knob.tween({
                    opacity: to
                }, speed, TWEEN.Easing.Cubic.Out, function() {
                    var dotDelay = to > 0 ? 100 : 50,
                        knobTo = to > 0 ? .5 : 0,
                        labelDelay = to > 0 ? 400 : 0,
                        $label = $knob.parent().find(".knob_label"),
                        labelOpacity = to > 0 ? $label.data("opacity") || 1 : 0;
                    $knob.find(".dot").each(function() {
                        var $dot = $(this);
                        $dot.tween({
                            opacity: knobTo
                        }, speed, TWEEN.Easing.Cubic.Out, false, dotDelay);
                        dotDelay += dotDelay / 4
                    });
                    $label.show().tween({
                        opacity: labelOpacity
                    }, speed, TWEEN.Easing.Cubic.Out, false, labelDelay)
                }, startDelay + delay);
                $(this).parent().find(".knob_toggle").tween({
                    opacity: to
                }, speed, TWEEN.Easing.Cubic.Out, false, startDelay + delay);
                delay += delay / 2
            });
            $hints.find(".radios").each(function() {
                var $radios = $(this);
                $radios.tween({
                    opacity: to
                }, speed, TWEEN.Easing.Cubic.Out, false, startDelay + delayChord)
            });
            $hints.find(".radio").each(function() {
                var $radio = $(this);
                $radio.tween({
                    opacity: to
                }, speed, TWEEN.Easing.Cubic.Out, false, startDelay + delayChord);
                delayChord += delayChord / 2
            });
            $chords.find(".radios").each(function() {
                var $radios = $(this);
                $radios.tween({
                    opacity: to
                }, speed, TWEEN.Easing.Cubic.Out, false, startDelay + delayChord)
            });
            $chords.animate({
                "background-size": bgsize
            }, speed).delay(startDelay + delayChord);
            $chords.find(".radio").each(function() {
                var $radio = $(this);
                $radio.tween({
                    opacity: to
                }, speed, TWEEN.Easing.Cubic.Out, false, startDelay + delayChord);
                delayChord += delayChord / 2
            });
            $patterns.animate({
                "background-size": bgsize
            }, speed).delay(startDelay + delayPattern);
            $patterns.find(".radios").each(function() {
                var $radios = $(this);
                $radios.tween({
                    opacity: to
                }, speed, TWEEN.Easing.Cubic.Out, false, startDelay + delayPattern)
            });
            $patterns.find(".radio").each(function() {
                var $radio = $(this);
                $radio.tween({
                    opacity: to
                }, speed, TWEEN.Easing.Cubic.Out, false, startDelay + delayPattern);
                delayPattern += delayPattern / 2
            });
            $(".chord_label").each(function() {
                var $label = $(this),
                    opacity = $label.data("opacity"),
                    set = to > 0 ? opacity : 0;
                if (set > 0) {
                    $label.tween({
                        opacity: set
                    }, speed, TWEEN.Easing.Cubic.Out, false, startDelay + delayChord)
                } else {
                    $label.tween({
                        opacity: 0
                    }, speed, TWEEN.Easing.Cubic.Out, false, startDelay)
                }
            });
            $(".lock").find(".dot").animate({
                opacity: to
            }, speed);
            $mode.tween({
                opacity: to
            }, speed, TWEEN.Easing.Cubic.Out, false, delayMode)
        },
        unlisten: function() {
            var $document = $(document),
                $main = $("#main");
            BASE.off("easy_mode.instrument");
            BASE.off("advanced_mode.instrument");
            $document.off("mouseup.instrument");
            if (this.$el) {
                this.$el.off(".instrument")
            }
            $main.off("mouseover.instrument");
            $main.off("mouseleave.instrument");
            document.removeEventListener("keydown", this.keyDown, false);
            document.removeEventListener("keyup", this.keyUp, false);
            BASE.off("easy_mode.instrument");
            BASE.off("advanced_mode.instrument");
            BASE.off(".instrument")
        },
        controls: function() {},
        parts: function(callback) {
            var global_delay = 0,
                next = 50,
                duration = 400,
                $holder = $(".instrument_holder");
            if (!this.config.parts) {
                callback();
                return false
            }
            this.config.parts.forEach(function(part) {
                var speed = part.speed || duration,
                    delay = part.delay || next,
                    $part = $("<div id='" + part.id + "'>").addClass("part").css("background-size", "0%");
                if (part.class) $part.addClass(part.class);
                $holder.append($part);
                global_delay += delay;
                setTimeout(function() {
                    $part.move().set("background-size", "100%").duration(speed).end()
                }, global_delay)
            });
            if (callback) {
                setTimeout(callback, global_delay)
            }
        },
        checkHints: function() {
            if (this.hintsOn) this.showHints();
            else this.hideHints()
        },
        listeners: function() {
            var _me = this;
            BASE.listen("easy_mode.instrument", function(event) {
                var note, code;
                if (_me.easyMode === true) return false;
                _me.easyMode = true;
                _me.removeKeyListeners();
                if (_me.strings) {
                    _me.strings.stop();
                    _me.easyZones()
                }
                if (_me.lastKey) {
                    if (_me.strings) {
                        code = _me.lastKeyCode;
                        note = _me.fromMapped(_me.lastKey)
                    } else {
                        code = _me.lastKey;
                        note = _me.interpretNote(_me.getNote(code, event.keyCode))
                    }
                    _me.keyOff(note);
                    _me.hintOff(code, e.keyCode);
                    _me.keyActive = false;
                    _me.lastKey = false
                }
                _me.hideHints();
                BASE.tell("instrument_easy");
                if (_me.enabledNotes && _me.patternsOff) _me.disableAll()
            });
            BASE.listen("advanced_mode.instrument", function(event) {
                if (_me.easyMode === false) return false;
                _me.easyMode = false;
                _me.patternsOn = false;
                if (_me.strings) {
                    _me.strings.stop();
                    _me.proZones()
                }
                _me.addKeyListeners();
                _me.showHints();
                BASE.tell("instrument_pro")
            });
            BASE.off("show_hints.instrument");
            BASE.listen("show_hints.instrument", function(event) {
                var val = event.value;
                switch (val) {
                    case 0:
                        _me.hideHints();
                        _me.hintsOn = false;
                        break;
                    case 1:
                        _me.showHints()
                }
            });
            BASE.listen("patternsOn.instrument", function(event) {
                _me.patternsOn = true
            });
            BASE.listen("patternsOff.instrument", function(event) {
                _me.patternsOn = false;
                _me.playOff();
                $(".patternOn").removeClass("patternOn");
                if (_me.enabledNotes) _me.disableAll()
            });
            BASE.listen("playOn.instrument", function(e) {
                if (_me.lastHit && !_me.autoplaying) {
                    _me.hitOff(_me.lastHit);
                    setTimeout(function() {
                        _me.lastHit = false;
                        _me.playOn(e.note)
                    }, 20)
                } else {
                    _me.playOn(e.note)
                }
            });
            BASE.listen("playOff.instrument", function(e) {
                _me.playOff(e.note)
            });
            BASE.listen("changePattern.instrument, set_changePattern.instrument", function(event) {
                var val = event.value - 1,
                    msg_type, tipped;
                if (JAM.manager.tips.isTouring() || val == 0) return;
                msg_type = "autoplay_tip_" + JAM.instruments.switcher.currentInstrument();
                tipped = window.localStorage.getItem(msg_type + "_tipped");
                if (msg_type && tipped != "true") {
                    BASE.off("changePattern.instrument, set_changePattern.instrument");
                    window.localStorage.setItem(msg_type + "_tipped", "true");
                    JAM.manager.tips.autoplay_tour()
                }
            })
        },
        createStage: function($el) {
            var path, timeout = [],
                _me = this,
                _stage = this.stage,
                _zones = this.zones,
                $document = $(document),
                $local = $("#instrument_local"),
                $playarea = $local.find(".playarea"),
                $main = $("#main");
            this.lastHit = false;
            this.stage = _stage = new JAM.model.Stage($el);
            _stage.setSpacer(this.spacer);
            this.createZones(_me, _stage, _zones);
            $document.on("mouseup.instrument", function() {
                _me.dmaf.dispatch("mouseUp")
            });
            $main.on("mouseover.instrument", function() {
                _me.dmaf.dispatch("instrumentMouseOver")
            });
            $main.on("mouseleave.instrument", function() {
                _me.dmaf.dispatch("instrumentMouseOut")
            });
            _stage.onMouseDown = function(point) {
                if (_me.keyActive) return;
                _me.dmaf.dispatch("mouseDown");
                if (typeof path != "undefined") path = false;
                if (_me.strings) {
                    path = _stage.startPath(point)
                } else {
                    path = false
                }
                _me.hitTest(point);
                if (_me.lastKey) _me.keyOff(_me.lastKey);
                _me.mouseActive = true
            };
            _stage.onMouseDrag = function(point) {
                if (_me.keyActive) return;
                if (!_me.draging) _me.draging = true;
                _me.drag(path, point)
            };
            _stage.onMouseUp = function(point) {
                if (_me.keyActive || _me.patternsOn) return;
                if (_me.draging && path) {
                    _me.drag(path, point, true);
                    _me.draging = false
                } else {
                    _me.hitTest(point, true)
                } if (typeof path != "undefined") path = null;
                _me.mouseActive = false
            }
        },
        drag: function(path, point, up) {
            var last, newSeg;
            if (path) {
                last = path.lastSegment(), newSeg = path.addSegment(point, true)
            }
            this.hitTest(point, up)
        },
        createZones: function(_me, _stage, _zones) {
            _me.notes.forEach(function(note) {})
        },
        hitTest: function(point, off) {
            var _me = this,
                insides = [],
                layer = 0;
            _me.zones.forEach(function(key, index) {
                var inside = key.pointInside(point);
                if (inside) {
                    if (key.layer > layer) layer = key.layer;
                    insides.push({
                        key: key,
                        num: index
                    })
                }
            });
            insides.forEach(function(item) {
                var key = item.key;
                if (item.key.layer === layer) {
                    if (off === true) {
                        _me.hitOff(item);
                        if (_me.lastHit && _me.lastHit.num != item.num) _me.hitOff(_me.lastHit);
                        _me.lastHit = false
                    } else {
                        if (_me.lastHit && _me.lastHit.num != item.num) _me.hitOff(_me.lastHit);
                        if (!_me.lastHit || _me.lastHit.num != item.num) _me.hitOn(item);
                        _me.lastHit = item
                    }
                }
            });
            if (insides.length == 0) {
                if (_me.lastHit) _me.hitOff(_me.lastHit);
                _me.lastHit = false
            }
        },
        interpretNote: function(index) {
            return this.notes[index]
        },
        hitOn: function(item) {
            var played = this.interpretNote(item.num),
                note = this.dispatchObject(played);
            if (item.key) item.key.hit = true;
            this.dispatch("noteOn", played, "mouse");
            this.noteOn(note);
            if (this.patternsOn) {
                this.playingNote = note
            } else {
                this.myClient.noteOn.dispatch()
            }
        },
        hitOff: function(item) {
            var played = this.interpretNote(item.num),
                note = this.dispatchObject(played),
                _self = this;
            if (item.key) item.key.hit = false;
            setTimeout(function() {
                _self.dispatch("noteOff", played, "mouse")
            }, 10);
            this.noteOff(note);
            if (!this.patternsOn) {
                this.myClient.noteOff.dispatch()
            }
        },
        keyOn: function(note) {
            this.dispatch("noteOn", note, "keyboard");
            this.noteOn(note);
            this.myClient.noteOn.dispatch()
        },
        keyOff: function(note) {
            this.dispatch("noteOff", note, "keyboard");
            this.noteOff(note);
            this.myClient.noteOff.dispatch()
        },
        addKeyListeners: function() {
            var _me = this,
                $document = $(document),
                ctrlDown = false;
            this.keyDown = function(e) {
                var code = e.keyIdentifier,
                    note = _me.getNote(code, e.keyCode);
                if (_me.mouseActive) return;
                if (note !== false) {
                    note = _me.interpretNote(note);
                    if (_me.lastKey === code) return false;
                    _me.lastKey = code;
                    _me.keyOn(note);
                    _me.hintOn(code, e.keyCode);
                    _me.keyActive = true
                }
            };
            this.keyUp = function(e) {
                var code = e.keyIdentifier,
                    note = _me.getNote(code, e.keyCode);
                if (_me.mouseActive) return;
                if (note !== false) {
                    if (_me.lastKey === code) _me.lastKey = false;
                    note = _me.interpretNote(note);
                    _me.keyOff(note);
                    _me.hintOff(code, e.keyCode);
                    _me.keyActive = false
                }
            };
            document.addEventListener("keydown", this.keyDown, false);
            document.addEventListener("keyup", this.keyUp, false)
        },
        removeKeyListeners: function() {
            document.removeEventListener("keydown", this.keyDown, false);
            document.removeEventListener("keyup", this.keyUp, false)
        },
        dispatch: function(message, note, type) {
            var dp = this.dispatchObject(note);
            dp.type = type;
            if (type) {
                this.dmaf.dispatch(message, dp)
            }
            this.tell(message, dp)
        },
        dispatchObject: function(item) {
            return {
                note: item
            }
        },
        getNote: function(n, code) {
            var key = this.bound(n, code),
                mapped = this.bindings[key];
            if (typeof mapped != "undefined") {
                return mapped
            } else {
                return false
            }
        },
        noteOn: function(item) {
            this.onAnimation(this.findItem(item))
        },
        noteOff: function(item) {
            this.offAnimation(this.findItem(item))
        },
        animations: function() {},
        findItem: function(item) {
            var find = "#";
            for (member in item) {
                if (member != "type") {
                    find += "_" + member + "_" + item[member]
                }
            }
            return $(find)
        },
        onAnimation: function($el) {
            $el.addClass("active");
            if (this.patternsOn) {
                $el.addClass("patternOn")
            }
        },
        offAnimation: function($el) {
            $el.removeClass("active");
            if (this.patternsOn) {
                $el.removeClass("patternOn")
            }
        },
        disable: function(note) {
            var $el = this.findItem(this.interpretNote(note));
            $el.addClass("disable");
            this.disabledNotes.push(note)
        },
        enable: function(note) {
            var $el = this.findItem(this.interpretNote(note));
            $el.removeClass("disable");
            BASE.utils.removeItem(this.disabledNotes, note)
        },
        disableAll: function(array) {
            var _me = this;
            if (this.patternsOn) return false;
            if (array) this.enabledNotes = array;
            $(".disable").removeClass("disable");
            this.notes.forEach(function(key, index) {
                _me.disable(index)
            });
            if (this.enabledNotes) {
                this.enabledNotes.forEach(function(key) {
                    _me.enable(key - 1)
                })
            }
        },
        enableAll: function() {
            $(".disable").removeClass("disable");
            this.disabledNotes = []
        },
        tell: function(event, data) {
            this.$events.trigger(event, data)
        },
        listen: function(event, fn) {
            this.$events.on(event, fn)
        },
        removeEvents: function(event) {
            this.$events.off(event)
        },
        center: function(easy) {
            var $local = $("#instrument_local"),
                $holder = $(".instrument_holder"),
                $window = $(window),
                topHeight = 65,
                bottomHeight = 60,
                vertCenter = function() {
                    var windowHeight = $window.height(),
                        calc = windowHeight / 2 - $holder.height() / 2 - bottomHeight,
                        top = calc > topHeight ? calc : topHeight,
                        left = $window.width() / 2 - $holder.width() * .5,
                        combined = $holder.outerHeight(true) + top;
                    if (combined < windowHeight) {
                        $local.css("height", combined)
                    } else {
                        $local.css("height", windowHeight + top)
                    }
                    $holder.css({
                        left: Math.max(-250, left),
                        top: top
                    })
                };
            $window.on("resize", function() {
                vertCenter()
            });
            vertCenter()
        },
        buildhints: function(key, mapped, index, ident) {
            var hint = $("<div>").attr("id", "hint-" + index).addClass("note-" + mapped).addClass("bound-" + key.charCodeAt()).addClass("hint").data("note", mapped).html(key);
            return hint
        },
        hints: function() {
            var _me = this,
                $document = $(document),
                $hints = $("#hints");
            var indexer = 0;
            $.each(this.bindings, function(key, val) {
                var $item = _me.buildhints(key, val, indexer);
                $hints.append($item);
                indexer++
            });
            this.$hints = $hints.find(".hint")
        },
        hintOn: function(ident, code) {
            var key = this.bound(ident, code),
                $hint = $("#hints .bound-" + key.charCodeAt());
            $hint.addClass("active")
        },
        hintOff: function(ident, code) {
            var key = this.bound(ident, code),
                $hint = $("#hints .bound-" + key.charCodeAt());
            $hint.removeClass("active")
        },
        showHints: function(speed) {
            var $hints = this.$hints,
                duration = speed || 150;
            if (this.easyMode) {
                $(".key-hints-easy").fadeIn(duration);
                $hints.fadeOut(duration)
            } else {
                $("#patterns .key-hints-easy").fadeOut(duration);
                $("#chords .key-hints-easy").fadeOut(duration);
                $hints.fadeIn(duration)
            }
            this.hintsOn = true
        },
        hideHints: function(speed) {
            var $hints = this.$hints,
                duration = speed || 150;
            $hints.stop(true);
            if ($hints.css("display") != "none") $hints.fadeOut(duration);
            if ($(".key-hints-easy").css("display") != "none") $(".key-hints-easy").fadeOut(duration)
        },
        playOn: function() {
            var defaultNote = JAM.dmaf.getAnimationBase(),
                number = this.lastHit.num || defaultNote,
                note = this.interpretNote(number);
            this.autoplaying = true;
            if (this.lastHit.num && this.lastHit.num == number) return;
            this.noteOn(note);
            this.dispatch("noteOn", note);
            this.myClient.patternOn.dispatch();
            if (!this.lastHit) this.lastHit = {
                num: defaultNote
            }
        },
        playOff: function() {
            var note;
            if (this.lastHit) {
                note = this.interpretNote(this.lastHit.num);
                this.noteOff(note);
                this.dispatch("noteOff", note);
                this.myClient.patternOff.dispatch();
                this.lastHit = false
            }
            this.autoplaying = false
        },
        bound: function(ident, code) {
            var index, character;
            if (is_mac) {
                return BASE.utils.getKey(ident)
            } else {
                index = this.keyCodes.indexOf(code);
                if (index == -1) {
                    return ""
                } else {
                    return this.localizedKeys[index]
                }
            }
        }
    };
    return Instrument
}(jQuery);
JAM.namespace("model").StringInstrument = function($) {
    "use strict";
    var _$instrument_local;

    function StringInstrument(options, el) {
        var _me = this;
        for (member in options) {
            if (options.hasOwnProperty(member)) {
                this[member] = options[member]
            }
        }
        this.getBindings();
        this.getKeycodes();
        this.localizedKeys = BASE._language.bindings.strings;
        this.notes = this.getNotes() || [];
        this.spacer = 50;
        this.dmaf = JAM.dmaf;
        this.name = this.config.name;
        this.type = this.config.type;
        this.zones = [];
        this.stage;
        this.easyMode = true;
        this._events = {};
        this.$events = $(this._events);
        this.afterUpSpeed = 600;
        this.dragDelay = 60;
        this.draging = false;
        this.strummingDirection = false;
        this.patternsOn = false;
        this.myClient = JAM.controller.session.myClient();
        this.posX = 0;
        this.posY = 0;
        this.header_delay = 1600;
        this.default_pattern_note = 0;
        _$instrument_local = $("#instrument_local")
    }
    StringInstrument.prototype = Object.create(JAM.model.Instrument.prototype);
    StringInstrument.prototype.getKeycodes = function() {
        this.keyCodes = BASE._language.keyCodes.strings
    };
    StringInstrument.prototype.createZones = function(_me, _stage, _zones) {
        var _width = this._width = this.$el.width(),
            strumWidth = this.strumWidth = this.config.strum_width ? this.config.strum_width : 415,
            offsets = this.config.strings_offsets || false,
            fretsWidth = this.fretsWidth = _width - strumWidth,
            fretWidth = this.fretWidth = Math.ceil(fretsWidth / 12),
            lineSpacing = this.config.string_spacing ? this.config.string_spacing : this.notes.length > 4 ? 26 : 32,
            drawn = false,
            $holder = $(".instrument_holder"),
            capHeight = this.config.cap_height || $holder.find(".cap").first().height(),
            that = this,
            stringInSpeed = 2,
            stringOutSpeed = .5;
        this.canvas = this.stage.buildCanvas();
        this.stringsConfig = {
            debugDraw: false,
            speed: 2,
            locolor: this.config.string_colors ? this.config.string_colors.top : "#777",
            hicolor: this.config.string_colors ? this.config.string_colors.bottom : "#fff",
            shcolor: this.config.string_colors ? this.config.string_colors.shadow || "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.1)",
            shadowAnimFactor: .5,
            maxOscillation: 4,
            damp: .96
        };
        this.stringCount = this.notes.length;
        _me.easyZones = function() {
            var delay = 75;
            if (_me.strings) {
                for (var i = 0; i < _me.stringCount; i++) {
                    _me.strings.slideOut(i, null, stringOutSpeed)
                }
            }
            _me.zones = [];
            _me.strings = new GuitarStrings(_me.canvas[0], _me.stringsConfig);
            $holder.on("webkitTransitionEnd", function() {
                _stage.checkOffset()
            });
            for (var i = 1; i <= _me.stringCount; i++) {
                var pos = i * lineSpacing,
                    indexed = i - 1,
                    offsetEnd = offsets ? offsets[indexed][0] : 0,
                    offsetStart = offsets ? offsets[indexed][1] : 0,
                    line = _stage.addLine(_width - offsetEnd, pos, offsetStart, pos),
                    fretPos = fretsWidth - fretWidth;
                that.strings.createString(_width - offsetEnd, pos, _width - offsetEnd - offsetStart, .05);
                if (!drawn) {
                    var $cap = $("<div id='cap-" + i + "' class='cap strings_part'>");
                    $cap.css({
                        top: parseInt($("#strumboard").css("top")) + pos - capHeight / 2,
                        right: _width - offsetStart + parseInt($("#strumboard").css("right")),
                        "background-size": "0%"
                    });
                    $holder.append($cap);
                    setTimeout(function(cap, strings, indexed) {
                        cap.move().set("background-size", "100%").duration(400).end();
                        strings.slideIn(indexed, null, stringInSpeed)
                    }, delay, $cap, that.strings, indexed);
                    delay += delay / 2
                } else {
                    that.strings.slideIn(indexed, null, stringInSpeed)
                }
                _me.zones.push(line)
            }
            drawn = true
        };
        _me.proZones = function() {
            _me.zones = [];
            _me.strings = new GuitarStrings(_me.canvas[0], _me.stringsConfig);
            $holder.on("webkitTransitionEnd", function() {
                _stage.checkOffset()
            });
            for (var i = 1; i <= _me.stringCount; i++) {
                var pos = i * lineSpacing,
                    indexed = i - 1,
                    offsetEnd = offsets ? offsets[indexed][0] : 0,
                    offsetStart = offsets ? offsets[indexed][1] : 0,
                    line = _stage.addLine(_width - offsetEnd, pos, fretsWidth, pos),
                    fretPos = fretsWidth - fretWidth;
                that.strings.createString(_width - offsetEnd, pos, _width, .05);
                for (var j = 1; j <= 12; j++) {
                    line.addSegment([fretPos, pos]);
                    fretPos -= fretWidth;
                    if (fretPos < 0) {
                        fretPos = 0
                    }
                }
                that.strings.slideIn(indexed, null, stringInSpeed);
                _me.zones.push(line)
            }
        };
        $(document).on("mouseup.instrument", function() {
            if (_me.strings && !_me.patternsOn) _me.strings.dampAll()
        })
    };
    StringInstrument.prototype.load = function(el) {
        var me = this,
            width;
        _$instrument_local = $("#instrument_local");
        BASE.render.view(this.config.template, function(tmp) {
            _$instrument_local.html(tmp);
            me.$el = el ? $(el) : $(".canvas_holder");
            if (!_$instrument_local.length || !me.$el.length) {
                BASE.tell("loadingFailed");
                return
            }
            me.parts(function() {
                JAM.manager.interface.scan();
                me.fadeControls(1);
                if (me.config.fx_defaults) {
                    var fx1 = me.config.fx_defaults.fx1,
                        fx2 = me.config.fx_defaults.fx2;
                    if (fx1) {
                        BASE.tell({
                            type: "set_fx1",
                            value: fx1
                        })
                    }
                    if (fx2) {
                        BASE.tell({
                            type: "set_fx2",
                            value: fx2
                        })
                    }
                }
                BASE.tell({
                    type: "chord",
                    chord: JAM.controller.session.getChord()
                });
                setTimeout(function() {
                    $("#header-controls").removeClass("up");
                    me.listeners()
                }, me.header_delay)
            });
            me.controls(me);
            me.center();
            me.hints();
            me.createStage(me.$el);
            me.$strumboard = $("#strumboard");
            BASE.view.tell("view_instrument");
            _$instrument_local.on("mousemove.instrument", function(event) {
                var left = event.clientX,
                    offset = me.$strumboard.offset().left + me.$strumboard.width() - me.config.strum_width || 0,
                    strum = left > offset;
                if (strum) {
                    me.dmaf.dispatch("strummingMouseOver")
                } else {
                    me.dmaf.dispatch("strummingMouseOut")
                }
            });
            _$instrument_local.on("mouseup.instrument", function(event) {
                me.strummingDirection = false
            });
            setTimeout(function() {
                me.easyZones()
            }, 2200)
        }, {
            instrument_name: this.config.name,
            instrument_ident: this.config.ident,
            instrument_type: this.config.type,
            string_hints: this.string_hints(),
            fret_hints: this.fret_hints(),
            fx1: this.config.fx1,
            fx2: this.config.fx2
        })
    };
    StringInstrument.prototype.drag = function(path, point) {
        var _me = this,
            last = path.lastSegment(),
            newSeg = path.addSegment(point, true),
            intersections = [],
            strings = _me.zones,
            currentStrum;
        if (point.y < last.getEnd().y) {
            currentStrum = "up";
            for (var i = strings.length - 1; i >= 0; i--) {
                var intersect = newSeg.intersectLine(strings[i]),
                    fret_index;
                if (intersect) {
                    fret_index = intersect.index - 1;
                    intersections.push({
                        key: strings[i],
                        fret: fret_index > 12 ? 0 : fret_index,
                        num: i
                    })
                }
            }
        } else {
            currentStrum = "down";
            for (var i = 0; i < strings.length; i++) {
                var intersect = newSeg.intersectLine(strings[i]),
                    fret_index;
                if (intersect) {
                    fret_index = intersect.index - 1;
                    intersections.push({
                        key: strings[i],
                        fret: fret_index > 12 ? 0 : fret_index,
                        num: i
                    })
                }
            }
        } if (intersections.length > 0) {
            intersections.forEach(function(item) {
                if (_me.strummingDirection && currentStrum == _me.strummingDirection) {
                    if (_me.lastHit && _me.lastHit.num == item.num) return false
                }
                _me.hitOn(item);
                if (_me.lastHit) _me.hitOff(_me.lastHit);
                _me.lastHit = item;
                _me.strummingDirection = currentStrum
            })
        } else {
            _me.hitTest(point)
        }
    };
    StringInstrument.prototype.hitTest = function(point, off) {
        var _me = this,
            insides = [],
            layer = 0;
        _me.zones.forEach(function(key, index) {
            var inside = key.pointInside(point),
                fret_index;
            if (inside) {
                fret_index = inside.index - 1;
                insides.push({
                    key: key,
                    fret: fret_index > 12 ? 0 : fret_index,
                    num: index
                })
            }
        });
        insides.forEach(function(item) {
            var key = item.key,
                equal;
            if (off === true) {
                _me.hitOff(item, true)
            } else {
                equal = _me.equals(_me.lastHit, item);
                if (!_me.lastHit || !equal) _me.hitOn(item, true);
                if (_me.lastHit && !equal) _me.hitOff(_me.lastHit, true);
                _me.lastHit = item
            }
        });
        if (insides.length == 0) {}
    };
    StringInstrument.prototype.equals = function(note1, note2) {
        if (!note1 || !note2) return false;
        if (note1.num != note2.num) return false;
        if (note1.fret != note2.fret) return false;
        return true
    };
    StringInstrument.prototype.visualString = function(str, on) {
        this.strings.strum(str, 1);
        setTimeout(function(that) {
            that.strings.strum(str, .99)
        }, 400, this)
    };
    StringInstrument.prototype.visualPattern = function(str, patternStart) {
        var damp = .96,
            that = this;
        if (patternStart) {
            this.strings.strum(str, 1);
            if (this.patternsOn) return;
            $(window).on("mouseup.strumming" + str, function() {
                if (that.patternsOn) return;
                if (that.strings.isStrumming(str)) {
                    that.strings.strum(str, damp);
                    $(window).off("mouseup.strumming" + str)
                }
            })
        } else {
            if (that.strings.isStrumming(str)) {
                that.strings.strum(str, damp)
            }
            $(window).off("mouseup.strumming" + str)
        }
    };
    StringInstrument.prototype.visualNote = function(str, fret, stop) {
        var fromLeft = this.fretWidth * fret,
            normalized = fromLeft / this._width;
        if (stop) {
            this.strings.setT(str, .05)
        } else if (fret > 0) {
            this.strings.setT(str, normalized)
        }
    };
    StringInstrument.prototype.interpretNote = function(item) {
        var string = this.notes.length - item.num;
        return {
            string: string,
            fret: this.notes[item.num] && this.notes[item.num].held != 0 ? this.notes[item.num].held : item.fret ? 13 - item.fret : 0
        }
    };
    StringInstrument.prototype.dispatchObject = function(item) {
        return {
            string: item.string,
            fret: item.fret
        }
    };
    StringInstrument.prototype.redrawZones = function() {
        this.zones.forEach(function(line) {
            line.draw()
        })
    };
    StringInstrument.prototype.hitOn = function(item, click) {
        var played = this.interpretNote(item),
            str = this.stringCount - played.string;
        if (item.key) item.key.hit = true;
        if (!this.easyMode && played.fret > 0) {
            this.visualNote(str, played.fret, false);
            this.visualString(str, true)
        } else if (this.patternsOn) {
            this.visualNote(str, played.fret, true);
            this.visualPattern(str, true)
        } else {
            this.strings.setT(str, .05);
            this.visualString(str, true);
            this.myClient.noteOn.dispatch()
        }
        this.dispatch("noteOn", played, "mouse")
    };
    StringInstrument.prototype.hitOff = function(item, click) {
        var played = this.interpretNote(item),
            str = this.stringCount - played.string;
        if (item.key) item.key.hit = false;
        if (this.patternsOn) {
            this.visualPattern(str, false)
        } else {
            this.myClient.noteOff.dispatch()
        }
        this.lastHit = false;
        this.dispatch("noteOff", played, "mouse")
    };
    StringInstrument.prototype.keyOn = function(note) {
        var str = this.stringCount - note.string;
        this.dispatch("noteOn", note, "keyboard");
        this.lastKey = note;
        this.notes[this.notes.length - note.string].held = note.fret;
        this.visualNote(str, note.fret, false);
        this.visualPattern(str, note.string, true);
        this.myClient.noteOn.dispatch()
    };
    StringInstrument.prototype.keyOff = function(note) {
        var str = this.stringCount - note.string;
        this.dispatch("noteOff", note, "keyboard");
        if (BASE.utils.equals(note, this.lastKey)) this.lastKey = false;
        this.notes[this.notes.length - note.string].held = 0;
        this.visualPattern(str, false);
        this.visualNote(str, note.fret, true);
        this.myClient.noteOff.dispatch()
    };
    StringInstrument.prototype.getNote = function(n, code) {
        var key = this.bound(n, code),
            mapped = this.bindings[key];
        return this.fromMapped(mapped)
    };
    StringInstrument.prototype.fromMapped = function(mapped) {
        var note;
        if (typeof mapped != "undefined") {
            note = {
                fret: mapped.pos > 0 ? mapped.pos + this.posX : 0,
                string: this.notes.length + 1 - (mapped.string + this.posY)
            };
            return note
        } else {
            return false
        }
    };
    StringInstrument.prototype.addKeyListeners = function() {
        var _me = this,
            $document = $(document),
            ctrlDown = false;
        this.keyDown = function(e) {
            var code = e.keyIdentifier,
                note = _me.getNote(code, e.keyCode);
            if (_me.mouseActive) return;
            if (note !== false) {
                if (BASE.utils.equals(note, _me.lastKey)) return false;
                _me.keyOn(note);
                _me.hintOn(code, e.keyCode);
                _me.lastKeyCode = code
            }
        };
        this.keyUp = function(e) {
            var code = e.keyIdentifier,
                note = _me.getNote(code, e.keyCode);
            if (_me.mouseActive) return;
            if (note !== false) {
                _me.keyOff(note);
                _me.hintOff(code, e.keyCode);
                _me.lastKeyCode = false
            }
        };
        document.addEventListener("keydown", this.keyDown, false);
        document.addEventListener("keyup", this.keyUp, false)
    };
    StringInstrument.prototype.setNote = function(num) {
        return this.notes[index]
    };
    StringInstrument.prototype.hints = function() {
        var _me = this,
            $document = $(document),
            $hints = $("#hints");
        this.$hints = $hints.find(".hint");
        this.$hints.each(function() {
            var $hint = $(this);
            $hint.on("mousedown.instrument", function() {
                var mapped = _me.bindings[$hint.data("note")],
                    note = _me.fromMapped(mapped);
                _me.keyOn(note);
                $hint.addClass("active");
                $document.on("mouseup.instrument", function() {
                    var mapped = _me.bindings[$hint.data("note")],
                        note = _me.fromMapped(mapped);
                    _me.keyOff(note);
                    $hint.removeClass("active")
                })
            })
        })
    };
    StringInstrument.prototype.hintOn = function(ident, code) {
        var key = this.bound(ident, code),
            mapped = this.bindings[key],
            str = mapped.string + "-" + mapped.pos;
        $("#hint-" + str).addClass("active")
    };
    StringInstrument.prototype.hintOff = function(ident, code) {
        var key = this.bound(ident, code),
            mapped = this.bindings[key],
            str = mapped.string + "-" + mapped.pos;
        $("#hint-" + str).removeClass("active")
    };
    StringInstrument.prototype.playOn = function() {
        var note, str, key, strs = this.notes.length - 1,
            defaultNote = strs - JAM.dmaf.getAnimationBase(),
            last = this.lastHit || {
                num: defaultNote
            };
        if (this.playingNote) {
            this.myClient.patternOff.dispatch()
        }
        this.autoplaying = true;
        note = this.interpretNote(last);
        str = this.stringCount - note.string;
        this.strings.dampAll();
        this.lastHit = last;
        this.visualNote(str, note.fret, true);
        this.visualPattern(str, note.string, true);
        this.myClient.patternOn.dispatch();
        this.playingNote = note
    };
    StringInstrument.prototype.playOff = function() {
        if (this.lastHit) {
            this.myClient.patternOff.dispatch();
            this.lastHit = false
        }
        this.autoplaying = true;
        this.strings.stop()
    };
    return StringInstrument
}(jQuery);
JAM.instrumentsConfig = {
    bass_pick: {
        type: "bass",
        name: "plectrum",
        subheader: "bass_guitar",
        fullname: "bass_pick_fullname",
        preview: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/preview/bass_pick.json",
        player: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/player/bass_pick.json",
        template: "bass.tmpl",
        css: "/css/instrument/bass_pick.css",
        string_colors: {
            top: "#8e8a8d",
            bottom: "#ffffff"
        },
        fx1: "distortion",
        fx2: "chorus",
        strum_width: 430,
        cap_height: 30,
        strings_offsets: [
            [0, 45],
            [0, 90],
            [0, 135],
            [0, 180]
        ],
        images: ["http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_pick/frets.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_pick/head.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_pick/base.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_pick/cap01.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_pick/cap02.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_pick/cap03.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_pick/cap04.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_pick/bridge.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_pick/knob.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_pick/pickup.png"],
        parts: [{
            id: "base",
            speed: 500
        }, {
            id: "bridge"
        }, {
            id: "pickup"
        }]
    },
    bass_finger: {
        type: "bass",
        name: "fingers",
        subheader: "bass_guitar",
        fullname: "bass_finger_fullname",
        preview: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/preview/bass_finger.json",
        player: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/player/bass_finger.json",
        template: "bass.tmpl",
        css: "/css/instrument/bass_finger.css",
        fx1: "distortion",
        fx2: "chorus",
        string_colors: {
            top: "#8e8a8d",
            bottom: "#ffffff"
        },
        strum_width: 430,
        cap_height: 30,
        strings_offsets: [
            [0, 45],
            [0, 90],
            [0, 135],
            [0, 180]
        ],
        images: ["http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_finger/frets.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_finger/head.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_finger/base.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_finger/cap01.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_finger/cap02.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_finger/cap03.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_finger/cap04.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_finger/bridge.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_finger/knob.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_finger/pickup_01.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_finger/pickup_02.png"],
        parts: [{
            id: "base",
            speed: 500
        }, {
            id: "bridge"
        }, {
            id: "pickup01"
        }, {
            id: "pickup02"
        }]
    },
    bass_ac: {
        type: "bass",
        name: "acoustic",
        subheader: "bass_guitar",
        fullname: "bass_ac_fullname",
        preview: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/preview/bass_ac.json",
        player: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/player/bass_ac.json",
        template: "bass.tmpl",
        css: "/css/instrument/bass_ac.css",
        fx1: "distortion",
        fx2: "slapback",
        string_colors: {
            top: "#ffffff",
            bottom: "#A98C6A"
        },
        strum_width: 420,
        cap_height: 30,
        strings_offsets: [
            [0, 135],
            [0, 90],
            [0, 135],
            [0, 180]
        ],
        images: ["http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_ac/frets.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_ac/head.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_ac/base.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_ac/cap01.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_ac/cap02.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_ac/cap03.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_ac/cap04.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_ac/bridge.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_ac/knob.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_ac/soundhole.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/bass_ac/fret-base.png"],
        parts: [{
            id: "base",
            speed: 500
        }, {
            id: "bridge"
        }, {
            id: "soundhole"
        }, {
            id: "fret-base"
        }]
    },
    guitar_crunch: {
        type: "guitar",
        name: "crunch",
        subheader: "electric_guitar",
        fullname: "guitar_crunch_fullname",
        preview: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/preview/guitar_crunch.json",
        player: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/player/guitar_crunch.json",
        template: "guitar.tmpl",
        css: "/css/instrument/guitar_crunch.css",
        fx1: "distortion",
        fx2: "slapback",
        fx_defaults: {
            fx1: 7
        },
        string_colors: {
            top: "#8C888C",
            bottom: "#ffffff",
            shadow: "rgba(0, 0, 0, 0.35)"
        },
        cap_height: 34,
        strum_width: 390,
        string_spacing: 26,
        strings_offsets: [
            [19, 146],
            [16, 73],
            [12, 0],
            [8, 0],
            [4, 73],
            [0, 146]
        ],
        images: ["http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_crunch/frets.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_crunch/head.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_crunch/base.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_crunch/bridge.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_crunch/pickup.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_crunch/button-normal.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_crunch/button-pressed.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_crunch/knob.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_crunch/knob-tick.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_crunch/cap_01.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_crunch/cap_02.png"],
        parts: [{
            id: "base",
            delay: 50,
            speed: 500
        }, {
            id: "bridge",
            delay: 100
        }, {
            id: "pickup01",
            delay: 150
        }, {
            id: "pickup02",
            delay: 250
        }]
    },
    guitar_clean: {
        type: "guitar",
        name: "classic_clean",
        subheader: "electric_guitar",
        fullname: "guitar_clean_fullname",
        preview: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/preview/guitar_clean.json",
        player: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/player/guitar_clean.json",
        template: "guitar.tmpl",
        css: "/css/instrument/guitar_clean.css",
        fx1: "chorus",
        fx2: "delay",
        fx_defaults: {
            fx1: 7
        },
        string_colors: {
            top: "#8C888C",
            bottom: "#ffffff",
            shadow: "rgba(0, 0, 0, 0.25)"
        },
        strum_width: 386,
        string_spacing: 26,
        cap_height: 30,
        strings_offsets: [
            [0, 45],
            [0, 90],
            [0, 135],
            [0, 180],
            [0, 225],
            [0, 270]
        ],
        images: ["http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_clean/frets.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_clean/head.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_clean/base.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_clean/button-normal.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_clean/button-pressed.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_clean/cap.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_clean/hints-plate.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_clean/knob-bottom.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_clean/knob-top.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_clean/pickup01.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_clean/pickup03.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_clean/end.png"],
        parts: [{
            id: "base",
            delay: 50,
            speed: 500
        }, {
            id: "endcap",
            "class": "strings_part",
            delay: 50
        }, {
            id: "pickup01",
            delay: 10
        }, {
            id: "pickup02",
            delay: 10
        }, {
            id: "pickup03",
            delay: 10
        }, {
            id: "hints-plate",
            delay: 40
        }]
    },
    guitar_dist: {
        type: "guitar",
        name: "distorted",
        subheader: "electric_guitar",
        fullname: "guitar_dist_fullname",
        preview: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/preview/guitar_dist.json",
        player: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/player/guitar_dist.json",
        template: "guitar.tmpl",
        css: "/css/instrument/guitar_dist.css",
        fx1: "distortion",
        fx2: "flanger",
        fx_defaults: {
            fx1: 7
        },
        string_colors: {
            top: "#8C888C",
            bottom: "#ffffff",
            shadow: "rgba(0, 0, 0, 0.35)"
        },
        cap_height: 42,
        strum_width: 306,
        strings_offsets: [
            [0, 146],
            [20, 73],
            [40, 0],
            [40, 0],
            [20, 73],
            [0, 146]
        ],
        images: ["http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_dist/frets.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_dist/head.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_dist/knob.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_dist/knob-pick.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_dist/cap_01.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_dist/cap_02.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_dist/bridge-02.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_dist/bridge-01.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_dist/pickup-01.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_dist/pickup-02.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_dist/base-grey.png"],
        parts: [{
            id: "base"
        }, {
            id: "bridge-02"
        }, {
            id: "bridge-01"
        }, {
            id: "pickup-02"
        }, {
            id: "bridge"
        }]
    },
    guitar_funky: {
        type: "guitar",
        name: "funky",
        subheader: "electric_guitar",
        fullname: "guitar_funky_fullname",
        preview: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/preview/guitar_funky.json",
        player: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/player/guitar_funky.json",
        template: "guitar.tmpl",
        css: "/css/instrument/guitar_funky.css",
        fx1: "auto-wah",
        fx2: "slapback",
        fx_defaults: {
            fx1: 7
        },
        string_colors: {
            top: "#8C888C",
            bottom: "#ffffff"
        },
        strum_width: 453,
        string_spacing: 26,
        cap_height: 30,
        strings_offsets: [
            [0, 146],
            [0, 73],
            [0, 0],
            [0, 0],
            [0, 73],
            [0, 146]
        ],
        images: ["http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_funky/frets.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_funky/head.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_funky/base.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_funky/bridge_01.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_funky/bridge_02.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_funky/pickup_01.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_funky/pickup_02.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_funky/cap_01.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_funky/cap_02.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_funky/knob.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_funky/knob-pick.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_funky/button-normal.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_funky/button-pressed.png"],
        parts: [{
            id: "base",
            delay: 50,
            speed: 500
        }, {
            id: "bridge_01"
        }, {
            id: "bridge_02"
        }, {
            id: "pickup_01"
        }, {
            id: "pickup_02"
        }]
    },
    guitar_steel: {
        type: "guitar",
        name: "steel_string",
        subheader: "acoustic_guitar",
        fullname: "guitar_steel_fullname",
        preview: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/preview/guitar_steel.json",
        player: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/player/guitar_steel.json",
        template: "guitar.tmpl",
        css: "/css/instrument/guitar_steel.css",
        fx1: "chorus",
        fx2: "delay",
        string_colors: {
            top: "#ffffff",
            bottom: "#A16733",
            shadow: "rgba(0, 0, 0, 0.20)"
        },
        cap_height: 30,
        strum_width: 416,
        string_spacing: 26,
        strings_offsets: [
            [0, 146],
            [0, 73],
            [0, 0],
            [0, 0],
            [0, 73],
            [0, 146]
        ],
        images: ["http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_steel/frets.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_steel/head.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_steel/base.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_steel/soundhole.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_steel/fret-base.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_steel/cap_01.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_steel/cap_02.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_steel/bridge.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_steel/knob.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_funky/knob-pick.png"],
        parts: [{
            id: "base"
        }, {
            id: "soundhole"
        }, {
            id: "fret-base"
        }, {
            id: "bridge"
        }]
    },
    guitar_nylon: {
        type: "guitar",
        name: "nylon_string",
        subheader: "acoustic_guitar",
        fullname: "guitar_nylon_fullname",
        preview: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/preview/guitar_nylon.json",
        player: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/player/guitar_nylon.json",
        template: "guitar.tmpl",
        css: "/css/instrument/guitar_nylon.css",
        fx1: "chorus",
        fx2: "delay",
        string_colors: {
            top: "#ffffff",
            bottom: "#F7B158"
        },
        strum_width: 473,
        cap_height: 30,
        images: ["http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_nylon/frets.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_nylon/head.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_nylon/base.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_nylon/soundhole.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_nylon/fret-base.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_nylon/cap1.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_nylon/cap2.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_nylon/bridge.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/guitar_nylon/knob.png"],
        parts: [{
            id: "base"
        }, {
            id: "soundhole"
        }, {
            id: "fret-base"
        }, {
            id: "bridge"
        }]
    },
    drums_standard: {
        type: "drums",
        name: "standard",
        subheader: "drums",
        fullname: "drums_standard_fullname",
        preview: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/preview/drums_standard.json",
        player: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/player/drums_standard.json",
        template: "drums.tmpl",
        css: "/css/instrument/drums_standard.css",
        fx1: "flanger",
        fx2: "delay",
        images: ["http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_standard/crash.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_standard/hihat-open.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_standard/kick.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_standard/knob-pick.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_standard/knob.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_standard/pedal-normal.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_standard/pedal-pressed.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_standard/ride.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_standard/snare.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_standard/tom_1.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_standard/tom_2.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_standard/tom_3.png"],
        parts: []
    },
    drums_brushes: {
        type: "drums",
        name: "brushes",
        subheader: "drums",
        fullname: "drums_brushes_fullname",
        preview: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/preview/drums_brushes.json",
        player: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/player/drums_brushes.json",
        template: "drums.tmpl",
        css: "/css/instrument/drums_brushes.css",
        fx1: "distortion",
        fx2: "slapback",
        images: ["http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_brushes/crash.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_brushes/hihat-open.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_brushes/kick.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_brushes/knob-pick.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_brushes/knob.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_brushes/pedal-normal.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_brushes/pedal-pressed.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_brushes/ride.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_brushes/snare.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_brushes/tom_1.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_brushes/tom_2.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/drums_brushes/tom_3.png"],
        parts: []
    },
    dm_hiphop: {
        type: "machine",
        name: "hip_hop",
        subheader: "drum_machine",
        fullname: "dm_hiphop_fullname",
        preview: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/preview/dm_hiphop.json",
        player: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/player/dm_hiphop.json",
        template: "machine.tmpl",
        css: "/css/instrument/dm_hiphop.css",
        fx1: "bitcrusher",
        fx2: "delay",
        images: ["http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/dm_hiphop/knob.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/dm_hiphop/pad_orange-click.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/dm_hiphop/pad_orange-normal.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/dm_hiphop/pad_red-click.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/dm_hiphop/pad_red-normal.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/dm_hiphop/pad_white-click.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/dm_hiphop/pad_white-normal.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/dm_hiphop/pad_yellow-click.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/dm_hiphop/pad_yellow-normal.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/dm_hiphop/synth-background.png"],
        parts: [{
            id: "base",
            delay: 50,
            speed: 500
        }]
    },
    dm_techno: {
        type: "machine",
        name: "techno",
        subheader: "drum_machine",
        fullname: "dm_techno_fullname",
        preview: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/preview/dm_techno.json",
        player: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/player/dm_techno.json",
        template: "machine.tmpl",
        css: "/css/instrument/dm_techno.css",
        fx1: "bitcrusher",
        fx2: "delay",
        images: ["http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/dm_techno/dm-background.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/dm_techno/knob-pick.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/dm_techno/knob.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/dm_techno/pad-click.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/dm_techno/pad-normal.png"],
        parts: [{
            id: "base",
            delay: 50,
            speed: 500
        }]
    },
    dm_analogue: {
        type: "machine",
        name: "analogue",
        subheader: "drum_machine",
        fullname: "dm_analogue_fullname",
        preview: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/preview/dm_analogue.json",
        player: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/player/dm_analogue.json",
        template: "machine.tmpl",
        css: "/css/instrument/dm_analogue.css",
        fx1: "bitcrusher",
        fx2: "delay",
        images: ["http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/dm_analogue/dm-background.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/dm_analogue/knob.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/dm_analogue/pad-click.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/dm_analogue/pad-normal.png"],
        parts: [{
            id: "base",
            delay: 50,
            speed: 500
        }]
    },
    key_brass: {
        type: "keyboard",
        name: "brass",
        subheader: "keyboard",
        fullname: "key_brass_fullname",
        preview: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/preview/key_brass.json",
        player: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/player/key_brass.json",
        template: "keyboard.tmpl",
        css: "/css/instrument/key_brass.css",
        fx1: "chorus",
        fx2: "envelope",
        fx_defaults: {
            fx1: 7
        },
        images: ["http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_brass/keyboard-background.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_brass/small_key-normal.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_brass/small_key-pressed.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_brass/knob.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_brass/button-normal.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_brass/button-pressed.png"],
        parts: [{
            id: "base",
            "class": "base"
        }]
    },
    key_strings: {
        type: "keyboard",
        name: "strings",
        subheader: "keyboard",
        fullname: "key_strings_fullname",
        preview: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/preview/key_strings.json",
        player: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/player/key_strings.json",
        template: "keyboard.tmpl",
        css: "/css/instrument/key_strings.css",
        fx1: "chorus",
        fx2: "filter",
        fx_defaults: {
            fx1: 7,
            fx2: 9
        },
        images: ["http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_strings/keyboard-background.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_strings/small_key-normal.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_strings/small_key-pressed.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_strings/knob_01.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_strings/knob_02.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_strings/knob_03.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_strings/blue_button-normal.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_strings/blue_button-pressed.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_strings/red_button-normal.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_strings/red_button-pressed.png"],
        parts: [{
            id: "base",
            "class": "base"
        }]
    },
    key_seq: {
        type: "keyboard",
        name: "arpeggio",
        subheader: "keyboard",
        fullname: "key_seq_fullname",
        preview: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/preview/key_seq.json",
        player: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/player/key_seq.json",
        template: "keyboard.tmpl",
        css: "/css/instrument/key_seq.css",
        fx1: "delay",
        fx2: "filter",
        fx_defaults: {
            fx2: 13
        },
        images: ["http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_seq/key_seq_bg.jpg", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_seq/small_key-normal.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_seq/small_key-pressed.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_seq/knob-base.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_seq/knob-dot.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_seq/button-normal.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_seq/button-pressed.png"],
        parts: [{
            id: "base",
            "class": "base"
        }]
    },
    key_piano: {
        type: "keyboard",
        name: "piano",
        subheader: "keyboard",
        fullname: "key_piano_fullname",
        preview: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/preview/key_piano.json",
        player: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/player/key_piano.json",
        template: "keyboard.tmpl",
        css: "/css/instrument/key_piano.css",
        fx1: "chorus",
        fx2: "delay",
        images: ["http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_piano/keyboard-background.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_piano/black_key-normal.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_piano/black_key-pressed.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_piano/knob.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_piano/knob-pick.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_piano/piano-chord_click.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_piano/piano-chord_normal.png"],
        parts: [{
            id: "base",
            "class": "base"
        }]
    },
    key_epiano: {
        type: "keyboard",
        name: "electric_piano",
        subheader: "keyboard",
        fullname: "key_epiano_fullname",
        preview: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/preview/key_epiano.json",
        player: "http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/player/key_epiano.json",
        template: "keyboard.tmpl",
        css: "/css/instrument/key_epiano.css",
        fx1: "distortion",
        fx2: "tremolo",
        fx_defaults: {
            fx2: 7
        },
        images: ["http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_epiano/keyboard-background.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_epiano/small_key-normal.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_epiano/small_key-pressed.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_epiano/knob-dot.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/instruments/key_epiano/knob-base.png"],
        parts: [{
            id: "base",
            "class": "base"
        }]
    }
};
JAM.namespace("controller").instrument = function($) {
    "use strict";
    var _$main, _$header, _$window, _$document, _wHeight, _wWidth, _$local, _$remotes, _$nav, _modeSwitchDelay = 800,
        _leader = false,
        _modeTime, _patternTime, proMode = false,
        prevPattern = false,
        _currentChord = 0,
        _chordMap, _patternMap;

    function init() {
        var $easyControls, _fx = false,
            _effects = [0, 0],
            _autoplaying = 0,
            dmaf = JAM.dmaf,
            patternOff = true,
            mode_disable = false;
        _$main = $("#main");
        _$header = $("#header");
        _$window = $(window);
        _$document = $(document);
        _$local = _$main.find("#instrument_local");
        _$remotes = $("#remotes-holder");
        _$nav = _$header.find("#header-navs");
        resetTimeTrackers();
        _chordMap = BASE._language.bindings_qwerty.split(" ");
        _patternMap = BASE._language.bindings_numbers.split(" ");
        BASE.listen("languageSwitched.instrument_controller", function(lang) {
            _chordMap = BASE._language.bindings_qwerty.split(" ");
            _patternMap = BASE._language.bindings_numbers.split(" ")
        });
        _$window.on("resize", function() {
            _wWidth = _$window.width();
            _wHeight = _$window.height();
            if (_wHeight < 870) {
                _$remotes.addClass("hide");
                _$header.addClass("hide")
            } else {
                _$remotes.removeClass("hide");
                _$header.removeClass("hide")
            }
        });
        _$window.trigger("resize");
        _$remotes.on("mouseenter", ".bottom_bar", function() {
            _$remotes.addClass("open");
            $(document).on("mousemove.remotes", function(event) {
                var y = event.pageY;
                if (_wHeight - y > 150) {
                    _$remotes.removeClass("open");
                    $(document).off("mousemove.remotes")
                }
            })
        });
        BASE.listen("changeChords.instrument_controller", function(event) {
            _currentChord = event.value;
            JAM.dmaf.dispatch("switchChord", {
                chord: parseInt(_currentChord)
            });
            JAM.broadcaster.sendEvent("changeChord", {
                chord: _currentChord
            });
            gaq.push(["_trackEvent", "Session", "Chord", JAM.dmaf.getCurrentChords()[_currentChord - 1]])
        });
        BASE.listen("changePattern.instrument_controller", function(event) {
            trackPatternTime();
            var val = event.value - 1;
            autoplay(val);
            _autoplaying = val;
            switch (val) {
                case 0:
                    val = "off";
                    BASE.tell("patternsOff");
                    patternOff = true;
                    if (prevPattern) gaq.push(["_trackEvent", "Session", "Autoplay", "Off"]);
                    prevPattern = false;
                    break;
                default:
                    if (patternOff) {
                        BASE.tell("patternsOn");
                        patternOff = false
                    }
                    prevPattern = val
            }
            dmaf.dispatch("switchPattern", {
                pattern: val
            })
        });
        BASE.listen("switchingInstrument.instrument_controller", function(event) {
            trackHintsFlag = false;
            lastHintVal = "Off";
            trackModeTime();
            trackPatternTime();
            resetTimeTrackers();
            var $body = $("body");
            if ($body.hasClass("high-latency") && JAM.controller.session.checkLatency(false) == false) {
                $body.removeClass("high-latency")
            }
            BASE.tell("patternsOff");
            patternOff = true;
            prevPattern = false;
            dmaf.dispatch("switchPattern", {
                pattern: "off"
            });
            dmaf.dispatch("lockHihatOff")
        });
        BASE.listen("changeLock.instrument_controller", function(event) {
            var val = event.value * 10;
            switch (val) {
                case 0:
                    dmaf.dispatch("lockHihatOff");
                    break;
                case 3:
                    dmaf.dispatch("lockHihatOn", {
                        beatsPerBar: 4
                    });
                    break;
                case 7:
                    dmaf.dispatch("lockHihatOn", {
                        beatsPerBar: 8
                    });
                    break;
                case 10:
                    dmaf.dispatch("lockHihatOn", {
                        beatsPerBar: 16
                    });
                    break
            }
        });
        BASE.listen("high_latency.instrument_controller", function(e) {
            var $body = $("body");
            if (e.value == true) {
                $body.addClass("high-latency");
                _$local.removeClass("pro_mode").addClass("easy_mode");
                setTimeout(function() {
                    BASE.tell("easy_mode");
                    JAM.dmaf.dispatch("switchMode", {
                        mode: "easy"
                    })
                }, 1e3)
            } else {
                $body.removeClass("high-latency")
            }
        });
        BASE.listen("advanced_mode.instrument_controller", function(event) {
            lastHintVal = "On";
            trackPatternTime();
            _$local.removeClass("easy_mode").addClass("pro_mode");
            if (JAM.controller.session.checkLatency()) return;
            proMode = true;
            JAM.instruments.switcher.setMode("pro");
            BASE.tell("lock_off");
            if (patternOff == false) {
                dmaf.dispatch("switchPattern", {
                    pattern: "off"
                });
                prevPattern = false;
                BASE.tell("patternsOff");
                BASE.tell({
                    type: "set_changePattern",
                    value: -4
                });
                patternOff = true
            }
            _$local.find("#patterns").addClass("hidden");
            _$document.off("keypress.easycontrols")
        });
        BASE.listen("easy_mode.instrument_controller", function(event) {
            lastHintVal = "Off";
            _$document.off("keypress.easycontrols");
            proMode = false;
            JAM.instruments.switcher.setMode("easy");
            dmaf.dispatch("lockHihatOff");
            _$local.removeClass("pro_mode").addClass("easy_mode");
            _$local.find("#patterns").removeClass("hidden");
            if (prevPattern) {
                dmaf.dispatch("switchPattern", {
                    pattern: prevPattern
                });
                BASE.tell({
                    type: "set_changePattern",
                    value: prevPattern
                })
            }
            _$document.on("keypress.easycontrols", function(e) {
                var key = String.fromCharCode(e.which).toLowerCase(),
                    chord = _chordMap.indexOf(key),
                    pattern = _patternMap.indexOf(key);
                if (chord >= 0 && chord < 6) {
                    chord += 1;
                    JAM.broadcaster.sendEvent("changeChord", {
                        chord: chord
                    });
                    JAM.dmaf.dispatch("switchChord", {
                        chord: chord
                    })
                }
                if (pattern != -1 && !proMode) {
                    BASE.tell({
                        type: "set_changePattern",
                        value: pattern + 1
                    });
                    autoplay(pattern);
                    _autoplaying = pattern;
                    if (pattern > 0) {
                        if (patternOff) {
                            BASE.tell("patternsOn");
                            prevPattern = pattern;
                            patternOff = false
                        }
                    } else {
                        pattern = "off";
                        patternOff = true;
                        BASE.tell("patternsOff");
                        prevPattern = false
                    }
                    dmaf.dispatch("switchPattern", {
                        pattern: pattern
                    })
                }
            })
        });
        BASE.listen("chord.instrument_controller", function(event) {
            BASE.tell({
                type: "set_changeChords",
                value: event.chord
            })
        });
        BASE.listen("fx1.instrument_controller", function(event) {
            var val = event.value,
                fx = 1;
            fxr(fx, val)
        });
        BASE.listen("fx2.instrument_controller", function(event) {
            var val = event.value,
                fx = 2;
            fxr(fx, val)
        });

        function fxr(fx, val) {
            var state;
            val > 0 ? state = "_on" : state = "_off";
            gaq.push(["_trackEvent", "Session", "Effect " + fx, "Value", val]);
            _effects[fx - 1] = val;
            if (val > 0) {
                dmaf.dispatch("effectOn", {
                    fxnr: fx
                });
                dmaf.dispatch("effectAmountChange", {
                    fxnr: fx,
                    value: val
                });
                return val
            } else {
                dmaf.dispatch("effectOff", {
                    fxnr: fx
                })
            }
        }

        function autoplay(val) {
            if (val > 0) {
                BASE.tell({
                    type: "playOn"
                })
            } else {
                BASE.tell({
                    type: "playOff"
                })
            }
        }
        BASE.listen("addedClient.instrument_controller", function() {
            _effects.forEach(function(fx, index) {
                var fxItem = index + 1;
                if (fx > 0) {
                    dmaf.dispatch("effectOn", {
                        fxnr: fxItem
                    });
                    dmaf.dispatch("effectAmountChange", {
                        fxnr: fxItem,
                        value: fx
                    })
                }
            });
            if (_autoplaying > 0) {
                dmaf.dispatch("switchPattern", {
                    pattern: _autoplaying
                })
            }
        });
        var trackHintsFlag = false;
        var lastHintVal = 0;
        BASE.listen("toggleHints.instrument_controller", function(event) {
            var val = event.value;
            BASE.tell({
                type: "show_hints",
                value: val - 1
            });
            var status = val - 1 == 0 ? "Off" : "On";
            var valChanged = lastHintVal != val;
            if (trackHintsFlag && valChanged) trackHints(status);
            trackHintsFlag = true;
            lastHintVal = val
        });
        BASE.listen("toggleMode.instrument_controller", function(event) {
            if (mode_disable) return false;
            mode_disable = true;
            setTimeout(function() {
                mode_disable = false
            }, _modeSwitchDelay);
            trackModeTime();
            if (proMode) {
                proMode = false;
                BASE.tell("easy_mode");
                JAM.dmaf.dispatch("switchMode", {
                    mode: "easy"
                });
                BASE.tell({
                    type: "set_toggleHints",
                    value: 1,
                    fromClick: false
                })
            } else {
                proMode = true;
                BASE.tell("advanced_mode");
                JAM.dmaf.dispatch("switchMode", {
                    mode: "advanced"
                });
                BASE.tell({
                    type: "set_toggleHints",
                    value: 2,
                    fromClick: false
                })
            }
        });
        BASE.listen("view_change.instrument_controller", function() {
            JAM.dmaf.dispatch("switchPattern", {
                pattern: "off"
            });
            JAM.dmaf.dispatch("lockHihatOff")
        })
    }

    function trackHints(status) {
        gaq.push(["_trackEvent", "Session", "Hints", status])
    }

    function trackModeTime() {
        var time = now() - _modeTime;
        var modeName = proMode ? "Pro" : "Easy";
        gaq.push(["_trackEvent", "Session", "Mode", modeName, time]);
        _modeTime = now()
    }

    function trackPatternTime() {
        if (_patternTime != undefined) {
            var time = now() - _patternTime;
            if (prevPattern && time > 300) gaq.push(["_trackEvent", "Session", "Autoplay", prevPattern, time])
        }
        _patternTime = now()
    }

    function resetTimeTrackers() {
        _modeTime = now();
        _patternTime = undefined
    }

    function now() {
        return (new Date).getTime()
    }
    return init
}(jQuery);
JAM.namespace("instruments").switcher = function($) {
    "use strict";
    var _instrument, _instrumentIdent, _type, _instruments, _$local, prevLoaded = false,
        _mode;

    function init() {
        _instrument = null;
        _instrumentIdent = null;
        _type = null;
        _instruments = null;
        prevLoaded = false;
        _instruments = BASE.utils.toArray(JAM.instrumentsConfig);
        updateBindings();
        BASE.listen("languageSwitched.instrument_controller", function(lang) {
            updateBindings()
        });
        return _instruments
    }

    function load(req) {
        var inst = JAM.instrumentsConfig[req],
            speed = 1e3;
        _$local = $("#instrument_local");
        _mode = "easy";
        if (typeof inst != "undefined") {
            if (prevLoaded) {
                unload(function() {
                    loadin(inst)
                })
            } else {
                loadin(inst)
            }
            prevLoaded = inst.type;
            BASE.utils.loadCss(inst.css);
            _type = inst.type;
            _instrumentIdent = inst.ident = req
        } else {
            console.warn("Not a valid Instrument: " + req);
            BASE.router.path("/select/")
        }
    }

    function loadin(inst) {
        BASE.utils.preload(inst.images, function() {
            _instrument = JAM.instruments[inst.type](inst);
            BASE.tell("instrumentReady")
        })
    }

    function unload(callback, force) {
        _$local.removeClass("pro_mode");
        BASE.tell("unloadInstrument");
        if (_instrument) {
            _instrument.destroy(callback, force)
        } else {
            callback()
        }
        prevLoaded = false
    }

    function getInstruments() {
        if (typeof _instruments === "undefined") init();
        return _instruments
    }

    function setInstrument(instrument) {
        _instrumentIdent = instrument
    }

    function currentInstrument() {
        return _instrumentIdent
    }

    function mode() {
        return _mode
    }

    function setMode(mode) {
        _mode = mode
    }

    function updateBindings() {
        BASE._language.bindings = {
            strings: BASE._language.bindings_strings.split(" "),
            keyboard: BASE._language.bindings_keyboard.split(" "),
            drums: BASE._language.bindings_drums.split(" "),
            machine: BASE._language.bindings_machine.split(" ")
        };
        BASE._language.keyCodes = {
            strings: BASE._language.keycode_strings.split(",").map(Number),
            keyboard: BASE._language.keycode_keyboard.split(",").map(Number),
            drums: BASE._language.keycode_drums.split(",").map(Number),
            machine: BASE._language.keycode_machine.split(",").map(Number)
        }
    }
    return {
        load: load,
        unload: unload,
        init: init,
        getInstruments: getInstruments,
        setInstrument: setInstrument,
        currentInstrument: currentInstrument,
        mode: mode,
        setMode: setMode,
        updateBindings: updateBindings
    }
}(jQuery);
JAM.namespace("manager").interface = function($) {
    "use strict";
    var _$window;

    function helpers() {
        Handlebars.registerHelper("interface", function(interfaceName, options) {
            var ui = '<div class="interface" data-uitype=' + interfaceName + " ";
            for (member in options.hash) {
                if (options.hash.hasOwnProperty(member)) {
                    ui += "data-" + member + "='" + options.hash[member] + "' "
                }
            }
            ui += "></div>";
            return new Handlebars.SafeString(ui)
        });
        Handlebars.registerHelper("selectInstruments", function() {
            var instruments = JAM.instruments.switcher.getInstruments(),
                selected = JAM.instruments.switcher.currentInstrument(),
                output = '<select id="instrumentSwitcher">';
            instruments.forEach(function(item) {
                var is_selected = item.ident === selected ? "selected='selected'" : "";
                output += "<option " + is_selected + 'value="' + item.ident + '">' + BASE.render.t(item.name || "MISSING") + "</option>"
            });
            output += "</select>";
            return new Handlebars.SafeString(output)
        });
        Handlebars.registerHelper("key-triangles", function() {
            var row = [{
                    key: "C",
                    val: 9
                }, {
                    key: "C♯",
                    val: 10
                }, {
                    key: "D",
                    val: 11
                }, {
                    key: "D♯",
                    val: 12
                }, {
                    key: "E",
                    val: 1
                }, {
                    key: "F",
                    val: 2
                }, {
                    key: "F♯",
                    val: 3
                }, {
                    key: "G",
                    val: 4
                }, {
                    key: "G♯",
                    val: 5
                }, {
                    key: "A",
                    val: 6
                }, {
                    key: "A♯",
                    val: 7
                }, {
                    key: "B",
                    val: 8
                }],
                row1_x = -20,
                row1_y = 1,
                row2_x = 0,
                row2_y = 33,
                textDiff_x = -7,
                textDiff_y = 8,
                width = 45,
                halfw = width / 2,
                height = 38,
                current = "current",
                output = '<g id="key-picker">';
            row.forEach(function(item, index) {
                var i = index + 1,
                    sx = row1_x + halfw * i,
                    sy = row1_y,
                    even = i % 2,
                    first, subitem;
                if (item.key.length > 1) {
                    subitem = item.key.substring(0, 1) + "<b>" + item.key.substring(1) + "</b>"
                } else {
                    subitem = item.key
                } if (item.val == 1) {
                    first = current
                } else {
                    first = ""
                } if (even) {
                    polyUp(sx, sy, item.val, subitem, first)
                } else {
                    polyDown(sx, sy, item.val, subitem, first)
                }
            });
            output += "</g>";

            function polyUp(sx, sy, val, cleanItem, current) {
                output += '<g class="key_selector_group ' + current + '" id="key-selector_' + val + '" data-key="' + val + '">';
                output += '<polygon points="' + sx + "," + (sy + height) + " " + (sx + width) + "," + (sy + height) + " " + (sx + halfw) + "," + sy + '" class="key_selector"/>';
                output += '<foreignobject x="' + (sx + 10) + '" y="' + (sy + 10) + '" width="25" height="25">';
                output += '<span class="key_selector_text" id="key-text-selector_' + val + '">' + cleanItem + "</span>";
                output += "</foreignobject>";
                output += "</g>"
            }

            function polyDown(sx, sy, val, cleanItem) {
                output += '<g class="key_selector_group" id="key-selector_' + val + '" data-key="' + val + '">';
                output += '<polygon points="' + sx + "," + sy + " " + (sx + width) + "," + sy + " " + (sx + halfw) + "," + (sy + height) + '" class="key_selector down"/>';
                output += '<foreignobject x="' + (sx + 10) + '" y="' + sy + '" width="25" height="25">';
                output += '<span class="key_selector_text" id="key-text-selector_' + val + '">' + cleanItem + "</span>";
                output += "</foreignobject>";
                output += "</g>"
            }
            return new Handlebars.SafeString(output)
        })
    }

    function scan($area) {
        var $interfaces = $area ? $area.find(".interface") : $(".interface");
        $interfaces.each(function() {
            new Interface($(this))
        })
    }

    function Interface($el) {
        this.$el = $el;
        this.parseElement($el);
        this.init()
    }
    Interface.prototype = {
        init: function() {
            this.switchType();
            this.listeners();
            if (this.val) this.actions()
        },
        build: function() {
            var _me = this,
                check;
            check = setInterval(function() {
                var $el = $("#" + _me.elId);
                if ($el.length) {
                    $el.replaceWith(_me.$ui);
                    clearInterval(check)
                }
            }, 1);
            return "<div id='" + this.elId + "'></div>"
        },
        parseElement: function($e) {
            var $el = $e || this.$el,
                data = $el.data();
            for (var attr in data) {
                this[attr] = data[attr]
            }
        },
        switchType: function() {
            switch (this.uitype) {
                case "button":
                    this.buildButton();
                    break;
                case "toggle":
                    this.buildToggle();
                    break;
                case "radio":
                    this.buildRadio();
                    break;
                case "knob":
                    this.buildKnob();
                    break;
                case "slider":
                    this.buildSlider();
                    break;
                case "lock":
                    this.buildLock();
                    break;
                case "mode":
                    this.buildMode();
                    break;
                case "hint":
                    this.buildHints();
                    break;
                default:
                    throw new Error("Not a Ui type")
            }
        },
        buildButton: function() {
            var _me = this,
                text = this.hash.type;
            this.$ui = $("<button>" + text + "</button>");
            this.$ui.on("click", function(e) {
                _me.val = this.val === true ? false : true;
                _me.actions();
                _me.update();
                e.preventDefault()
            });
            if (this.title) this.$ui.attr("title", BASE.render.t(this.title));
            this.insert();
            this.update = function() {
                if (this.val) {
                    this.$ui.css("opacity", .5)
                } else {
                    this.$ui.css("opacity", 1)
                }
            }
        },
        buildToggle: function() {
            var _me = this;
            this.$ui = $('<div class="toggler"></div>');
            this.$first = $('<div class="toggle">' + this.hash.first_text + "</div>").appendTo(this.$ui);
            this.$second = $('<div class="toggle">' + this.hash.second_text + "</div>").appendTo(this.$ui);
            this.$first.on("click", function(e) {
                _me.val = 1;
                _me.actions();
                _me.update();
                e.preventDefault()
            });
            this.$second.on("click", function(e) {
                _me.val = 2;
                _me.actions();
                _me.update();
                e.preventDefault()
            });
            if (this.title) this.$ui.attr("title", BASE.render.t(this.title));
            this.insert();
            this.update = function() {
                if (this.val == 1) {
                    this.$second.removeClass("active");
                    this.$first.addClass("active")
                } else {
                    this.$first.removeClass("active");
                    this.$second.addClass("active")
                }
            };
            this.update()
        },
        buildSlider: function() {
            var _me = this,
                on = false,
                val = 0,
                offWidth;
            this.$ui = $('<div class="slider">');
            this.$inner = $('<div class="slider_inner">');
            this.$ui.append(this.$inner);
            this.$ui.on("click", function() {
                _me.update();
                _me.val = val;
                _me.actions()
            });
            this.insert();
            this.update = function(forceOff) {
                if (!offWidth) offWidth = _me.$ui.width();
                if (forceOff) on = true;
                if (on) {
                    _me.$inner.animate({
                        "margin-left": 0
                    }, 100);
                    val = 0;
                    on = false
                } else {
                    _me.$inner.animate({
                        "margin-left": -offWidth
                    }, 100);
                    val = 1;
                    on = true
                }
            }
        },
        buildRadio: function() {
            var _me = this,
                str = "off",
                chords;
            this.$ui = $('<div class="radios"></div>');
            this.$items = [];
            if (JAM.dmaf) {
                chords = JAM.dmaf.getCurrentChords()
            }
            for (var i = 0; i < this.count; i++) {
                var is_off = "";
                if (this.qwerty) {
                    if (i > 0) {
                        str = i
                    } else {
                        is_off = 'class="off_item"'
                    }
                } else if (this.count == 2) {
                    if (i > 0) {
                        str = "<span title='" + BASE.render.t("on") + "'>on</span>"
                    } else {
                        str = "<span title='" + BASE.render.t("off") + "'>off</span>"
                    }
                } else if (chords) {
                    var chord = chords[i];
                    var sharp;
                    chord.length > 2 ? sharp = "<span class='sharp-text'>&#x266F;<br>m</span>" : sharp = "";
                    str = chord.charAt(0) + sharp
                } else {
                    str = i + 1
                }
                var item = $('<button class="radio" data-count="' + (i + 1) + '"><div ' + is_off + ">" + str + "</div></button>").appendTo(this.$ui);
                this.$items.push(item)
            }
            this.$ui.children().on("click", function(e) {
                var $this = $(this),
                    val = parseInt($this.data("count"));
                _me.val = val;
                _me.actions();
                _me.update();
                e.preventDefault()
            });
            this.update = function() {
                if (this.$current) this.$current.removeClass("active");
                this.$current = this.$ui.children().eq(this.val - 1);
                this.$current.addClass("active")
            };
            if (this.title) this.$ui.attr("title", BASE.render.t(this.title));
            this.insert();
            if (this.val > 0) {
                this.update()
            }
        },
        buildHints: function() {
            var _me = this,
                str = "off",
                chords, _chordMap = BASE._language.bindings_qwerty.split(" "),
                _patternMap = BASE._language.bindings_numbers.split(" ");
            this.$ui = $('<ul class="key-hints-easy"></ul>');
            this.$items = [];
            for (var i = 0; i < this.count; i++) {
                var is_off = "";
                if (this.qwerty != undefined) {
                    str = _chordMap[i];
                    if (i == 0) is_off = 'class="off_item"'
                } else {
                    str = _patternMap[i]
                }
                var item = $('<li class="hint" data-count="' + (i + 1) + '"><div ' + is_off + ">" + str + "</div></button>").appendTo(this.$ui);
                this.$items.push(item)
            }
            BASE.listen(_me.action, function(event) {
                _me.val = event.value;
                _me.update()
            });
            this.$ui.children().on("click", function(e) {
                var $this = $(this),
                    val = parseInt($this.data("count"));
                _me.val = val;
                BASE.tell({
                    type: "set_" + _me.action,
                    value: val || this.val
                });
                _me.actions();
                e.preventDefault()
            });
            this.update = function() {
                if (this.$current) {
                    this.$current.removeClass("active")
                }
                this.$current = this.$ui.children().eq(this.val - 1);
                this.$current.addClass("active")
            };
            if (this.title) this.$ui.attr("title", BASE.render.t(this.title));
            this.insert();
            if (this.val > 0) {
                this.update()
            }
        },
        buildKnob: function() {
            var _me = this,
                options, tpl;
            this.$ui = $('<div class="knob_holder"></div>');
            tpl = '<div class="knob">';
            tpl += ' <div class="knob_top"></div>';
            tpl += ' <div class="knob_base"></div>';
            tpl += "</div>";
            this.$ui.append(tpl);
            if (_me.max) {
                _me.min = parseInt(_me.min) || 0;
                _me.max = parseInt(_me.max);
                options = {
                    min: _me.min,
                    max: _me.max
                }
            } else {
                options = false
            }
            this.insert();
            this.knob = new JAM.model.Knob(this.$ui, _me.diameter || false, options, function(value) {
                var tick = _me.max ? Math.floor(value * _me.max) - _me.min : value;
                if (_me.val != tick) {
                    _me.val = tick;
                    _me.actions();
                    if (_me.val > 0) {
                        _me.$toggle.addClass("on")
                    } else {
                        _me.$toggle.removeClass("on")
                    }
                }
            });
            this.$knob = this.$ui.find(".knob");
            if (typeof _me.max === "undefined") {
                this.$toggle = $("<div class='knob_toggle'>&bull;</div>");
                this.$ui.append(this.$toggle);
                this.on = false
            }
            if (this.label && this.label.length) {
                this.$ui.append('<span class="knob_label" data-t="' + this.label + '">' + BASE.render.t(this.label) + "</span>")
            }
            this.update = function() {
                this.knob.update(this.val);
                if (this.$toggle && this.val > 0) {
                    this.on = true;
                    this.$toggle.addClass("on")
                }
            };
            if (_me.val > 0) {
                _me.update()
            }
        },
        buildLock: function() {
            var _me = this,
                options, tpl;
            this.$ui = $('<div class="lock_holder"></div>');
            this.$ui.append(tpl);
            _me.max = 3;
            _me.min = 0;
            if (_me.max) {
                _me.max = parseInt(_me.max);
                options = {
                    max: _me.max
                }
            } else {
                options = false
            } if (this.title) this.$ui.attr("title", BASE.render.t(this.title));
            this.insert();
            this.lock = new JAM.model.Lock(this.$ui, 142, options, function(value) {
                _me.val = value;
                _me.actions()
            });
            this.update = function() {
                this.lock.update(this.val)
            };
            if (_me.val > 0) {
                _me.update()
            }
        },
        buildMode: function() {
            var _me = this;
            this.$ui = $('<div id="mode">' + '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="easy">' + '<polygon class="bg" points=" 0,2 79,2 79,27 0,27"/>' + '<polygon class="on" points="42,5 76,5 76,24 42,24 "/>' + '<polygon class="off-dark" points="9,18 3,24 42,24"/>' + '<polygon class="off-mid" points="42,5 42,24, 9,20 9,0"/>' + '<polygon class="off-light" points="9,20 9,0 3,5 3,24"/>' + '<text class="on-txt" x="47" y="18">EASY</text>' + '<text class="off-txt" x="15" y="14" transform="rotate(7 14,15)">PRO</text>' + "</svg>" + '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="pro">' + '<polygon class="bg" points=" 0,2 79,2 79,27 0,27"/>' + '<polygon class="on" points=" 3,5 36,5 36,24 3,24 "/>' + '<polygon class="off-dark" points=" 69,18 76,24 36,24 "/>' + '<polygon class="off-mid" points=" 36,5 69,0 69,20 36,24 "/>' + '<polygon class="off-light" points=" 69,20 69,0 76,5 76,24 "/>' + '<text class="off-txt" x="42" y="17" transform="rotate(-7 41,20)">EASY</text>' + '<text class="on-txt" x="10" y="18">PRO</text>' + "</svg>" + "</div>");
            if (this.title) this.$ui.attr("title", BASE.render.t(this.title));
            this.insert();
            setTimeout(function() {
                _me.$ui.on("click", function(e) {
                    _me.val = this.val === true ? false : true;
                    _me.actions();
                    e.preventDefault()
                })
            }, 5e3);
            this.update = function() {
                return false
            }
        },
        insert: function($e) {
            var $el = $e || this.$el;
            $el.replaceWith(this.$ui)
        },
        listeners: function() {
            var _me = this;
            BASE.listen("set_" + _me.action, function(event) {
                _me.val = event.value;
                _me.update()
            })
        },
        actions: function(val) {
            var _me = this;
            BASE.tell({
                type: _me.action,
                value: val || this.val
            })
        }
    };
    return {
        helpers: helpers,
        scan: scan
    }
}(jQuery);
JAM.namespace("model").JamSession = function($) {
    "use strict";
    var colors = ["red", "blue", "green", "yellow"];

    function JamSession(instrument, id, clients) {
        this._id = id;
        this.players = {};
        this.playerIDs = [];
        this.clients = clients;
        this.loaded = false;
        this.init();
        this.assign_instrument(instrument);
        if (!instrument) {
            if (JAM.controller.getSession()) {
                BASE.router.path("/select/" + JAM.controller.getSession() + "/")
            } else {
                BASE.router.path("/select/")
            }
        }
    }
    JamSession.prototype = {
        init: function() {
            this.listen4players()
        },
        assign_instrument: function(instrument) {
            this.instrument = instrument;
            JAM.dmaf.dispatch("switchInstrument", {
                instrument: instrument
            });
            JAM.broadcaster.sendEvent("changeInstrument", {
                instrument: instrument
            })
        },
        switch_instrument: function(instrument) {
            BASE.tell("switchingInstrument");
            this.assign_instrument(instrument);
            this.load_instrument(instrument)
        },
        load_instrument: function() {
            JAM.instruments.switcher.load(this.instrument);
            BASE.tell("loadInstrument", {
                instrument: this.instrument
            })
        },
        listen4players: function() {
            var _me = this;
            this.clients.forEach(function(client) {
                _me.addPlayer(client.player_id, client.player_nickname, client.player_instrument, client.is_leader)
            });
            BASE.listen("addedClient.jam_session", function(event) {
                var client = JAM.controller.session.getClient(event.player_id);
                _me.addPlayer(event.player_id, client.player_nickname, client.player_instrument, client.is_leader)
            });
            BASE.listen("clientDisconnect.jam_session", function(event) {
                _me.removePlayer(event.player_id)
            })
        },
        setLoaded: function(loaded) {
            var delay = 150,
                wait = 500,
                _me = this;
            this.loaded = loaded || true;
            if (this.loaded) {
                this.playerIDs.forEach(function(playerID) {
                    _me.players[playerID].slidein(delay);
                    delay += wait
                })
            }
        },
        addPlayer: function(player_id, player_nickname, player_instrument, is_leader) {
            var player = new JAM.model.Player(player_id, player_nickname, player_instrument, is_leader, player_id == this._id, this.loaded ? true : false);
            this.players[player_id] = player;
            this.playerIDs.push(player_id)
        },
        removePlayer: function(player_id) {
            BASE.utils.removeItem(this.playerIDs, player_id);
            this.players[player_id].remove();
            delete this.players[player_id]
        },
        getPlayer: function(player_id) {
            return this.players[player_id]
        },
        controls: function() {},
        chat: function() {
            var $remotes = $("#remotes"),
                message = "",
                _myId = this._id,
                _smc = this._scm;
            var tmpl = '<div class="tool_tip">';
            tmpl += '<div class="tt_text"></div>';
            tmpl += '<div class="tt_arrow_bottom tt_arrow left"></div>';
            tmpl += "</div>";
            BASE.listen("chatted", function(event) {
                var message = event.passed.chatMessage,
                    id = event.passed.client,
                    $chatter = $remotes.find("#player_" + id),
                    $bubble = $(tmpl),
                    $message = $bubble.find(".tt_text"),
                    timer;
                if ($("#modal-chat").hasClass("open")) return;
                if ($chatter.find(".tool_tip").length) {
                    $bubble = $chatter.find(".tool_tip");
                    clearTimeout($bubble.data("timeout"));
                    $message = $bubble.find(".tt_text");
                    $message.html($message.html() + "\n\n" + message)
                } else {
                    $message.html(message);
                    $bubble.show()
                }
                timer = setTimeout(function() {
                    $bubble.remove()
                }, 2e3);
                $bubble.data("timeout", timer);
                $chatter.find(".chat").append($bubble)
            })
        },
        am_leader: function() {
            return this.leader
        },
        myId: function() {
            return this._id
        },
        close: function() {
            BASE.off(".jam_session");
            JAM.instruments.switcher.unload(function() {
                JAM.manager.broadcaster.close()
            }, true)
        }
    };
    return JamSession
}(jQuery);
JAM.namespace("controller").join = function($) {
    "use strict";
    var _$main, _$startButton, _$window, _$body, _$welcome, _currentNum, _sessionId, _invitedBy, _invitedClient, _onDisconnected, _onUpdated;

    function join() {
        var $enter = $("#enter"),
            $own = $("#own"),
            $message = $("#messages"),
            $nicknameBox = $("#nickname-box"),
            $pasted = $("#nickname"),
            $tagline = $("#tagline"),
            $chrome = $("#chrome-experiment"),
            pastedTime, pastedVal;
        _$main = $("#main");
        _$welcome = $("#welcome");
        _$body = $("body");
        $own.show();
        $enter.hide();
        $enter.on("mouseup", function() {
            $message.fadeOut(100);
            $nicknameBox.tween({
                opacity: 0
            }, 120, TWEEN.Easing.Linear.None, false, 10).start()
        });
        $(".message_default").show();
        setTimeout(function() {
            $message.fadeIn(150)
        }, 1800);
        $nicknameBox.tween({
            opacity: 1
        }, 200, TWEEN.Easing.Linear.None, false, 2350).start();
        $pasted.focus(function() {
            $pasted.data("placeholder", $pasted.attr("placeholder"));
            $pasted.attr("placeholder", "")
        }).blur(function() {
            var place = $pasted.data("placeholder");
            $pasted.attr("placeholder", place)
        });
        $pasted.on("keyup", function(e) {
            clearTimeout(pastedTime);
            pastedTime = setTimeout(function() {
                var val = $pasted.val();
                if (pastedVal == val) return false;
                parseUrl(val);
                pastedVal = val
            }, 100);
            e.stopPropagation()
        });
        $own.on("click", function(e) {
            $message.fadeOut(60);
            $tagline.fadeOut(80);
            $nicknameBox.tween({
                opacity: 0
            }, 120, TWEEN.Easing.Linear.None, false, 10).start()
        });
        $(document).off("keydown.welcome")
    }

    function parseUrl(url) {
        var $enter = $("#enter"),
            $pasted = $("#nickname"),
            $shareTip = $("#paste-tip .share-tip"),
            shorty = url.search("goo.gl"),
            link = /\/join\/((\w|-)+)\//.exec(url);
        if (shorty != -1) {
            $pasted.addClass("disabled");
            BASE.utils.expand(url, function(link) {
                parseUrl(link)
            });
            return
        }
        if (link) {
            $pasted.addClass("disabled");
            _sessionId = link[1];
            BASE.tell({
                type: "updateSessionId",
                sessionId: _sessionId
            });
            $shareTip.fadeOut(100);
            start(_sessionId, function() {
                $enter.fadeIn(200);
                $(document).on("keydown.welcome", function(e) {
                    var code = BASE.utils.keyToString(e.keyCode);
                    if (code === "enter") {
                        $enter.trigger("mouseup");
                        $(document).off(".welcome")
                    }
                })
            })
        }
    }

    function start(id, callback) {
        JAM.loader.dmaf.load(function() {
            JAM.controller.session.clients();
            JAM.controller.session.start(id, function(newID) {
                JAM.dmaf.dispatch("sessionEnded");
                callback(newID)
            }, function() {
                var $pasted = $("#nickname"),
                    place = $pasted.data("placeholder");
                console.log("bad - link");
                $pasted.removeClass("disabled");
                $pasted.attr("placeholder", place);
                $pasted.val("")
            })
        })
    }
    return join
}(jQuery);
(function(a, b) {
    function c(b, c) {
        var e = b.nodeName.toLowerCase();
        if ("area" === e) {
            var f = b.parentNode,
                g = f.name,
                h;
            return !b.href || !g || f.nodeName.toLowerCase() !== "map" ? !1 : (h = a("img[usemap=#" + g + "]")[0], !!h && d(h))
        }
        return (/input|select|textarea|button|object/.test(e) ? !b.disabled : "a" == e ? b.href || c : c) && d(b)
    }

    function d(b) {
        return !a(b).parents().andSelf().filter(function() {
            return a.curCSS(this, "visibility") === "hidden" || a.expr.filters.hidden(this)
        }).length
    }
    a.ui = a.ui || {};
    if (a.ui.version) return;
    a.extend(a.ui, {
        version: "1.8.23",
        keyCode: {
            ALT: 18,
            BACKSPACE: 8,
            CAPS_LOCK: 20,
            COMMA: 188,
            COMMAND: 91,
            COMMAND_LEFT: 91,
            COMMAND_RIGHT: 93,
            CONTROL: 17,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            INSERT: 45,
            LEFT: 37,
            MENU: 93,
            NUMPAD_ADD: 107,
            NUMPAD_DECIMAL: 110,
            NUMPAD_DIVIDE: 111,
            NUMPAD_ENTER: 108,
            NUMPAD_MULTIPLY: 106,
            NUMPAD_SUBTRACT: 109,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SHIFT: 16,
            SPACE: 32,
            TAB: 9,
            UP: 38,
            WINDOWS: 91
        }
    }), a.fn.extend({
        propAttr: a.fn.prop || a.fn.attr,
        _focus: a.fn.focus,
        focus: function(b, c) {
            return typeof b == "number" ? this.each(function() {
                var d = this;
                setTimeout(function() {
                    a(d).focus(), c && c.call(d)
                }, b)
            }) : this._focus.apply(this, arguments)
        },
        scrollParent: function() {
            var b;
            return a.browser.msie && /(static|relative)/.test(this.css("position")) || /absolute/.test(this.css("position")) ? b = this.parents().filter(function() {
                return /(relative|absolute|fixed)/.test(a.curCSS(this, "position", 1)) && /(auto|scroll)/.test(a.curCSS(this, "overflow", 1) + a.curCSS(this, "overflow-y", 1) + a.curCSS(this, "overflow-x", 1))
            }).eq(0) : b = this.parents().filter(function() {
                return /(auto|scroll)/.test(a.curCSS(this, "overflow", 1) + a.curCSS(this, "overflow-y", 1) + a.curCSS(this, "overflow-x", 1))
            }).eq(0), /fixed/.test(this.css("position")) || !b.length ? a(document) : b
        },
        zIndex: function(c) {
            if (c !== b) return this.css("zIndex", c);
            if (this.length) {
                var d = a(this[0]),
                    e, f;
                while (d.length && d[0] !== document) {
                    e = d.css("position");
                    if (e === "absolute" || e === "relative" || e === "fixed") {
                        f = parseInt(d.css("zIndex"), 10);
                        if (!isNaN(f) && f !== 0) return f
                    }
                    d = d.parent()
                }
            }
            return 0
        },
        disableSelection: function() {
            return this.bind((a.support.selectstart ? "selectstart" : "mousedown") + ".ui-disableSelection", function(a) {
                a.preventDefault()
            })
        },
        enableSelection: function() {
            return this.unbind(".ui-disableSelection")
        }
    }), a("<a>").outerWidth(1).jquery || a.each(["Width", "Height"], function(c, d) {
        function h(b, c, d, f) {
            return a.each(e, function() {
                c -= parseFloat(a.curCSS(b, "padding" + this, !0)) || 0, d && (c -= parseFloat(a.curCSS(b, "border" + this + "Width", !0)) || 0), f && (c -= parseFloat(a.curCSS(b, "margin" + this, !0)) || 0)
            }), c
        }
        var e = d === "Width" ? ["Left", "Right"] : ["Top", "Bottom"],
            f = d.toLowerCase(),
            g = {
                innerWidth: a.fn.innerWidth,
                innerHeight: a.fn.innerHeight,
                outerWidth: a.fn.outerWidth,
                outerHeight: a.fn.outerHeight
            };
        a.fn["inner" + d] = function(c) {
            return c === b ? g["inner" + d].call(this) : this.each(function() {
                a(this).css(f, h(this, c) + "px")
            })
        }, a.fn["outer" + d] = function(b, c) {
            return typeof b != "number" ? g["outer" + d].call(this, b) : this.each(function() {
                a(this).css(f, h(this, b, !0, c) + "px")
            })
        }
    }), a.extend(a.expr[":"], {
        data: a.expr.createPseudo ? a.expr.createPseudo(function(b) {
            return function(c) {
                return !!a.data(c, b)
            }
        }) : function(b, c, d) {
            return !!a.data(b, d[3])
        },
        focusable: function(b) {
            return c(b, !isNaN(a.attr(b, "tabindex")))
        },
        tabbable: function(b) {
            var d = a.attr(b, "tabindex"),
                e = isNaN(d);
            return (e || d >= 0) && c(b, !e)
        }
    }), a(function() {
        var b = document.body,
            c = b.appendChild(c = document.createElement("div"));
        c.offsetHeight, a.extend(c.style, {
            minHeight: "100px",
            height: "auto",
            padding: 0,
            borderWidth: 0
        }), a.support.minHeight = c.offsetHeight === 100, a.support.selectstart = "onselectstart" in c, b.removeChild(c).style.display = "none"
    }), a.curCSS || (a.curCSS = a.css), a.extend(a.ui, {
        plugin: {
            add: function(b, c, d) {
                var e = a.ui[b].prototype;
                for (var f in d) e.plugins[f] = e.plugins[f] || [], e.plugins[f].push([c, d[f]])
            },
            call: function(a, b, c) {
                var d = a.plugins[b];
                if (!d || !a.element[0].parentNode) return;
                for (var e = 0; e < d.length; e++) a.options[d[e][0]] && d[e][1].apply(a.element, c)
            }
        },
        contains: function(a, b) {
            return document.compareDocumentPosition ? a.compareDocumentPosition(b) & 16 : a !== b && a.contains(b)
        },
        hasScroll: function(b, c) {
            if (a(b).css("overflow") === "hidden") return !1;
            var d = c && c === "left" ? "scrollLeft" : "scrollTop",
                e = !1;
            return b[d] > 0 ? !0 : (b[d] = 1, e = b[d] > 0, b[d] = 0, e)
        },
        isOverAxis: function(a, b, c) {
            return a > b && a < b + c
        },
        isOver: function(b, c, d, e, f, g) {
            return a.ui.isOverAxis(b, d, f) && a.ui.isOverAxis(c, e, g)
        }
    })
})(jQuery);
(function(a, b) {
    if (a.cleanData) {
        var c = a.cleanData;
        a.cleanData = function(b) {
            for (var d = 0, e;
                (e = b[d]) != null; d++) try {
                a(e).triggerHandler("remove")
            } catch (f) {}
            c(b)
        }
    } else {
        var d = a.fn.remove;
        a.fn.remove = function(b, c) {
            return this.each(function() {
                return c || (!b || a.filter(b, [this]).length) && a("*", this).add([this]).each(function() {
                    try {
                        a(this).triggerHandler("remove")
                    } catch (b) {}
                }), d.call(a(this), b, c)
            })
        }
    }
    a.widget = function(b, c, d) {
        var e = b.split(".")[0],
            f;
        b = b.split(".")[1], f = e + "-" + b, d || (d = c, c = a.Widget), a.expr[":"][f] = function(c) {
            return !!a.data(c, b)
        }, a[e] = a[e] || {}, a[e][b] = function(a, b) {
            arguments.length && this._createWidget(a, b)
        };
        var g = new c;
        g.options = a.extend(!0, {}, g.options), a[e][b].prototype = a.extend(!0, g, {
            namespace: e,
            widgetName: b,
            widgetEventPrefix: a[e][b].prototype.widgetEventPrefix || b,
            widgetBaseClass: f
        }, d), a.widget.bridge(b, a[e][b])
    }, a.widget.bridge = function(c, d) {
        a.fn[c] = function(e) {
            var f = typeof e == "string",
                g = Array.prototype.slice.call(arguments, 1),
                h = this;
            return e = !f && g.length ? a.extend.apply(null, [!0, e].concat(g)) : e, f && e.charAt(0) === "_" ? h : (f ? this.each(function() {
                var d = a.data(this, c),
                    f = d && a.isFunction(d[e]) ? d[e].apply(d, g) : d;
                if (f !== d && f !== b) return h = f, !1
            }) : this.each(function() {
                var b = a.data(this, c);
                b ? b.option(e || {})._init() : a.data(this, c, new d(e, this))
            }), h)
        }
    }, a.Widget = function(a, b) {
        arguments.length && this._createWidget(a, b)
    }, a.Widget.prototype = {
        widgetName: "widget",
        widgetEventPrefix: "",
        options: {
            disabled: !1
        },
        _createWidget: function(b, c) {
            a.data(c, this.widgetName, this), this.element = a(c), this.options = a.extend(!0, {}, this.options, this._getCreateOptions(), b);
            var d = this;
            this.element.bind("remove." + this.widgetName, function() {
                d.destroy()
            }), this._create(), this._trigger("create"), this._init()
        },
        _getCreateOptions: function() {
            return a.metadata && a.metadata.get(this.element[0])[this.widgetName]
        },
        _create: function() {},
        _init: function() {},
        destroy: function() {
            this.element.unbind("." + this.widgetName).removeData(this.widgetName), this.widget().unbind("." + this.widgetName).removeAttr("aria-disabled").removeClass(this.widgetBaseClass + "-disabled " + "ui-state-disabled")
        },
        widget: function() {
            return this.element
        },
        option: function(c, d) {
            var e = c;
            if (arguments.length === 0) return a.extend({}, this.options);
            if (typeof c == "string") {
                if (d === b) return this.options[c];
                e = {}, e[c] = d
            }
            return this._setOptions(e), this
        },
        _setOptions: function(b) {
            var c = this;
            return a.each(b, function(a, b) {
                c._setOption(a, b)
            }), this
        },
        _setOption: function(a, b) {
            return this.options[a] = b, a === "disabled" && this.widget()[b ? "addClass" : "removeClass"](this.widgetBaseClass + "-disabled" + " " + "ui-state-disabled").attr("aria-disabled", b), this
        },
        enable: function() {
            return this._setOption("disabled", !1)
        },
        disable: function() {
            return this._setOption("disabled", !0)
        },
        _trigger: function(b, c, d) {
            var e, f, g = this.options[b];
            d = d || {}, c = a.Event(c), c.type = (b === this.widgetEventPrefix ? b : this.widgetEventPrefix + b).toLowerCase(), c.target = this.element[0], f = c.originalEvent;
            if (f)
                for (e in f) e in c || (c[e] = f[e]);
            return this.element.trigger(c, d), !(a.isFunction(g) && g.call(this.element[0], c, d) === !1 || c.isDefaultPrevented())
        }
    }
})(jQuery);
(function(a, b) {
    var c = !1;
    a(document).mouseup(function(a) {
        c = !1
    }), a.widget("ui.mouse", {
        options: {
            cancel: ":input,option",
            distance: 1,
            delay: 0
        },
        _mouseInit: function() {
            var b = this;
            this.element.bind("mousedown." + this.widgetName, function(a) {
                return b._mouseDown(a)
            }).bind("click." + this.widgetName, function(c) {
                if (!0 === a.data(c.target, b.widgetName + ".preventClickEvent")) return a.removeData(c.target, b.widgetName + ".preventClickEvent"), c.stopImmediatePropagation(), !1
            }), this.started = !1
        },
        _mouseDestroy: function() {
            this.element.unbind("." + this.widgetName), this._mouseMoveDelegate && a(document).unbind("mousemove." + this.widgetName, this._mouseMoveDelegate).unbind("mouseup." + this.widgetName, this._mouseUpDelegate)
        },
        _mouseDown: function(b) {
            if (c) return;
            this._mouseStarted && this._mouseUp(b), this._mouseDownEvent = b;
            var d = this,
                e = b.which == 1,
                f = typeof this.options.cancel == "string" && b.target.nodeName ? a(b.target).closest(this.options.cancel).length : !1;
            if (!e || f || !this._mouseCapture(b)) return !0;
            this.mouseDelayMet = !this.options.delay, this.mouseDelayMet || (this._mouseDelayTimer = setTimeout(function() {
                d.mouseDelayMet = !0
            }, this.options.delay));
            if (this._mouseDistanceMet(b) && this._mouseDelayMet(b)) {
                this._mouseStarted = this._mouseStart(b) !== !1;
                if (!this._mouseStarted) return b.preventDefault(), !0
            }
            return !0 === a.data(b.target, this.widgetName + ".preventClickEvent") && a.removeData(b.target, this.widgetName + ".preventClickEvent"), this._mouseMoveDelegate = function(a) {
                return d._mouseMove(a)
            }, this._mouseUpDelegate = function(a) {
                return d._mouseUp(a)
            }, a(document).bind("mousemove." + this.widgetName, this._mouseMoveDelegate).bind("mouseup." + this.widgetName, this._mouseUpDelegate), b.preventDefault(), c = !0, !0
        },
        _mouseMove: function(b) {
            return !a.browser.msie || document.documentMode >= 9 || !!b.button ? this._mouseStarted ? (this._mouseDrag(b), b.preventDefault()) : (this._mouseDistanceMet(b) && this._mouseDelayMet(b) && (this._mouseStarted = this._mouseStart(this._mouseDownEvent, b) !== !1, this._mouseStarted ? this._mouseDrag(b) : this._mouseUp(b)), !this._mouseStarted) : this._mouseUp(b)
        },
        _mouseUp: function(b) {
            return a(document).unbind("mousemove." + this.widgetName, this._mouseMoveDelegate).unbind("mouseup." + this.widgetName, this._mouseUpDelegate), this._mouseStarted && (this._mouseStarted = !1, b.target == this._mouseDownEvent.target && a.data(b.target, this.widgetName + ".preventClickEvent", !0), this._mouseStop(b)), !1
        },
        _mouseDistanceMet: function(a) {
            return Math.max(Math.abs(this._mouseDownEvent.pageX - a.pageX), Math.abs(this._mouseDownEvent.pageY - a.pageY)) >= this.options.distance
        },
        _mouseDelayMet: function(a) {
            return this.mouseDelayMet
        },
        _mouseStart: function(a) {},
        _mouseDrag: function(a) {},
        _mouseStop: function(a) {},
        _mouseCapture: function(a) {
            return !0
        }
    })
})(jQuery);
(function(a, b) {
    a.widget("ui.draggable", a.ui.mouse, {
        widgetEventPrefix: "drag",
        options: {
            addClasses: !0,
            appendTo: "parent",
            axis: !1,
            connectToSortable: !1,
            containment: !1,
            cursor: "auto",
            cursorAt: !1,
            grid: !1,
            handle: !1,
            helper: "original",
            iframeFix: !1,
            opacity: !1,
            refreshPositions: !1,
            revert: !1,
            revertDuration: 500,
            scope: "default",
            scroll: !0,
            scrollSensitivity: 20,
            scrollSpeed: 20,
            snap: !1,
            snapMode: "both",
            snapTolerance: 20,
            stack: !1,
            zIndex: !1
        },
        _create: function() {
            this.options.helper == "original" && !/^(?:r|a|f)/.test(this.element.css("position")) && (this.element[0].style.position = "relative"), this.options.addClasses && this.element.addClass("ui-draggable"), this.options.disabled && this.element.addClass("ui-draggable-disabled"), this._mouseInit()
        },
        destroy: function() {
            if (!this.element.data("draggable")) return;
            return this.element.removeData("draggable").unbind(".draggable").removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled"), this._mouseDestroy(), this
        },
        _mouseCapture: function(b) {
            var c = this.options;
            return this.helper || c.disabled || a(b.target).is(".ui-resizable-handle") ? !1 : (this.handle = this._getHandle(b), this.handle ? (c.iframeFix && a(c.iframeFix === !0 ? "iframe" : c.iframeFix).each(function() {
                a('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>').css({
                    width: this.offsetWidth + "px",
                    height: this.offsetHeight + "px",
                    position: "absolute",
                    opacity: "0.001",
                    zIndex: 1e3
                }).css(a(this).offset()).appendTo("body")
            }), !0) : !1)
        },
        _mouseStart: function(b) {
            var c = this.options;
            return this.helper = this._createHelper(b), this.helper.addClass("ui-draggable-dragging"), this._cacheHelperProportions(), a.ui.ddmanager && (a.ui.ddmanager.current = this), this._cacheMargins(), this.cssPosition = this.helper.css("position"), this.scrollParent = this.helper.scrollParent(), this.offset = this.positionAbs = this.element.offset(), this.offset = {
                top: this.offset.top - this.margins.top,
                left: this.offset.left - this.margins.left
            }, a.extend(this.offset, {
                click: {
                    left: b.pageX - this.offset.left,
                    top: b.pageY - this.offset.top
                },
                parent: this._getParentOffset(),
                relative: this._getRelativeOffset()
            }), this.originalPosition = this.position = this._generatePosition(b), this.originalPageX = b.pageX, this.originalPageY = b.pageY, c.cursorAt && this._adjustOffsetFromHelper(c.cursorAt), c.containment && this._setContainment(), this._trigger("start", b) === !1 ? (this._clear(), !1) : (this._cacheHelperProportions(), a.ui.ddmanager && !c.dropBehaviour && a.ui.ddmanager.prepareOffsets(this, b), this._mouseDrag(b, !0), a.ui.ddmanager && a.ui.ddmanager.dragStart(this, b), !0)
        },
        _mouseDrag: function(b, c) {
            this.position = this._generatePosition(b), this.positionAbs = this._convertPositionTo("absolute");
            if (!c) {
                var d = this._uiHash();
                if (this._trigger("drag", b, d) === !1) return this._mouseUp({}), !1;
                this.position = d.position
            }
            if (!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left + "px";
            if (!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top + "px";
            return a.ui.ddmanager && a.ui.ddmanager.drag(this, b), !1
        },
        _mouseStop: function(b) {
            var c = !1;
            a.ui.ddmanager && !this.options.dropBehaviour && (c = a.ui.ddmanager.drop(this, b)), this.dropped && (c = this.dropped, this.dropped = !1);
            var d = this.element[0],
                e = !1;
            while (d && (d = d.parentNode)) d == document && (e = !0);
            if (!e && this.options.helper === "original") return !1;
            if (this.options.revert == "invalid" && !c || this.options.revert == "valid" && c || this.options.revert === !0 || a.isFunction(this.options.revert) && this.options.revert.call(this.element, c)) {
                var f = this;
                a(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function() {
                    f._trigger("stop", b) !== !1 && f._clear()
                })
            } else this._trigger("stop", b) !== !1 && this._clear();
            return !1
        },
        _mouseUp: function(b) {
            return this.options.iframeFix === !0 && a("div.ui-draggable-iframeFix").each(function() {
                this.parentNode.removeChild(this)
            }), a.ui.ddmanager && a.ui.ddmanager.dragStop(this, b), a.ui.mouse.prototype._mouseUp.call(this, b)
        },
        cancel: function() {
            return this.helper.is(".ui-draggable-dragging") ? this._mouseUp({}) : this._clear(), this
        },
        _getHandle: function(b) {
            var c = !this.options.handle || !a(this.options.handle, this.element).length ? !0 : !1;
            return a(this.options.handle, this.element).find("*").andSelf().each(function() {
                this == b.target && (c = !0)
            }), c
        },
        _createHelper: function(b) {
            var c = this.options,
                d = a.isFunction(c.helper) ? a(c.helper.apply(this.element[0], [b])) : c.helper == "clone" ? this.element.clone().removeAttr("id") : this.element;
            return d.parents("body").length || d.appendTo(c.appendTo == "parent" ? this.element[0].parentNode : c.appendTo), d[0] != this.element[0] && !/(fixed|absolute)/.test(d.css("position")) && d.css("position", "absolute"), d
        },
        _adjustOffsetFromHelper: function(b) {
            typeof b == "string" && (b = b.split(" ")), a.isArray(b) && (b = {
                left: +b[0],
                top: +b[1] || 0
            }), "left" in b && (this.offset.click.left = b.left + this.margins.left), "right" in b && (this.offset.click.left = this.helperProportions.width - b.right + this.margins.left), "top" in b && (this.offset.click.top = b.top + this.margins.top), "bottom" in b && (this.offset.click.top = this.helperProportions.height - b.bottom + this.margins.top)
        },
        _getParentOffset: function() {
            this.offsetParent = this.helper.offsetParent();
            var b = this.offsetParent.offset();
            this.cssPosition == "absolute" && this.scrollParent[0] != document && a.ui.contains(this.scrollParent[0], this.offsetParent[0]) && (b.left += this.scrollParent.scrollLeft(), b.top += this.scrollParent.scrollTop());
            if (this.offsetParent[0] == document.body || this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == "html" && a.browser.msie) b = {
                top: 0,
                left: 0
            };
            return {
                top: b.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
                left: b.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0)
            }
        },
        _getRelativeOffset: function() {
            if (this.cssPosition == "relative") {
                var a = this.element.position();
                return {
                    top: a.top - (parseInt(this.helper.css("top"), 10) || 0) + this.scrollParent.scrollTop(),
                    left: a.left - (parseInt(this.helper.css("left"), 10) || 0) + this.scrollParent.scrollLeft()
                }
            }
            return {
                top: 0,
                left: 0
            }
        },
        _cacheMargins: function() {
            this.margins = {
                left: parseInt(this.element.css("marginLeft"), 10) || 0,
                top: parseInt(this.element.css("marginTop"), 10) || 0,
                right: parseInt(this.element.css("marginRight"), 10) || 0,
                bottom: parseInt(this.element.css("marginBottom"), 10) || 0
            }
        },
        _cacheHelperProportions: function() {
            this.helperProportions = {
                width: this.helper.outerWidth(),
                height: this.helper.outerHeight()
            }
        },
        _setContainment: function() {
            var b = this.options;
            b.containment == "parent" && (b.containment = this.helper[0].parentNode);
            if (b.containment == "document" || b.containment == "window") this.containment = [b.containment == "document" ? 0 : a(window).scrollLeft() - this.offset.relative.left - this.offset.parent.left, b.containment == "document" ? 0 : a(window).scrollTop() - this.offset.relative.top - this.offset.parent.top, (b.containment == "document" ? 0 : a(window).scrollLeft()) + a(b.containment == "document" ? document : window).width() - this.helperProportions.width - this.margins.left, (b.containment == "document" ? 0 : a(window).scrollTop()) + (a(b.containment == "document" ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top];
            if (!/^(document|window|parent)$/.test(b.containment) && b.containment.constructor != Array) {
                var c = a(b.containment),
                    d = c[0];
                if (!d) return;
                var e = c.offset(),
                    f = a(d).css("overflow") != "hidden";
                this.containment = [(parseInt(a(d).css("borderLeftWidth"), 10) || 0) + (parseInt(a(d).css("paddingLeft"), 10) || 0), (parseInt(a(d).css("borderTopWidth"), 10) || 0) + (parseInt(a(d).css("paddingTop"), 10) || 0), (f ? Math.max(d.scrollWidth, d.offsetWidth) : d.offsetWidth) - (parseInt(a(d).css("borderLeftWidth"), 10) || 0) - (parseInt(a(d).css("paddingRight"), 10) || 0) - this.helperProportions.width - this.margins.left - this.margins.right, (f ? Math.max(d.scrollHeight, d.offsetHeight) : d.offsetHeight) - (parseInt(a(d).css("borderTopWidth"), 10) || 0) - (parseInt(a(d).css("paddingBottom"), 10) || 0) - this.helperProportions.height - this.margins.top - this.margins.bottom], this.relative_container = c
            } else b.containment.constructor == Array && (this.containment = b.containment)
        },
        _convertPositionTo: function(b, c) {
            c || (c = this.position);
            var d = b == "absolute" ? 1 : -1,
                e = this.options,
                f = this.cssPosition == "absolute" && (this.scrollParent[0] == document || !a.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent,
                g = /(html|body)/i.test(f[0].tagName);
            return {
                top: c.top + this.offset.relative.top * d + this.offset.parent.top * d - (a.browser.safari && a.browser.version < 526 && this.cssPosition == "fixed" ? 0 : (this.cssPosition == "fixed" ? -this.scrollParent.scrollTop() : g ? 0 : f.scrollTop()) * d),
                left: c.left + this.offset.relative.left * d + this.offset.parent.left * d - (a.browser.safari && a.browser.version < 526 && this.cssPosition == "fixed" ? 0 : (this.cssPosition == "fixed" ? -this.scrollParent.scrollLeft() : g ? 0 : f.scrollLeft()) * d)
            }
        },
        _generatePosition: function(b) {
            var c = this.options,
                d = this.cssPosition == "absolute" && (this.scrollParent[0] == document || !a.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent,
                e = /(html|body)/i.test(d[0].tagName),
                f = b.pageX,
                g = b.pageY;
            if (this.originalPosition) {
                var h;
                if (this.containment) {
                    if (this.relative_container) {
                        var i = this.relative_container.offset();
                        h = [this.containment[0] + i.left, this.containment[1] + i.top, this.containment[2] + i.left, this.containment[3] + i.top]
                    } else h = this.containment;
                    b.pageX - this.offset.click.left < h[0] && (f = h[0] + this.offset.click.left), b.pageY - this.offset.click.top < h[1] && (g = h[1] + this.offset.click.top), b.pageX - this.offset.click.left > h[2] && (f = h[2] + this.offset.click.left), b.pageY - this.offset.click.top > h[3] && (g = h[3] + this.offset.click.top)
                }
                if (c.grid) {
                    var j = c.grid[1] ? this.originalPageY + Math.round((g - this.originalPageY) / c.grid[1]) * c.grid[1] : this.originalPageY;
                    g = h ? j - this.offset.click.top < h[1] || j - this.offset.click.top > h[3] ? j - this.offset.click.top < h[1] ? j + c.grid[1] : j - c.grid[1] : j : j;
                    var k = c.grid[0] ? this.originalPageX + Math.round((f - this.originalPageX) / c.grid[0]) * c.grid[0] : this.originalPageX;
                    f = h ? k - this.offset.click.left < h[0] || k - this.offset.click.left > h[2] ? k - this.offset.click.left < h[0] ? k + c.grid[0] : k - c.grid[0] : k : k
                }
            }
            return {
                top: g - this.offset.click.top - this.offset.relative.top - this.offset.parent.top + (a.browser.safari && a.browser.version < 526 && this.cssPosition == "fixed" ? 0 : this.cssPosition == "fixed" ? -this.scrollParent.scrollTop() : e ? 0 : d.scrollTop()),
                left: f - this.offset.click.left - this.offset.relative.left - this.offset.parent.left + (a.browser.safari && a.browser.version < 526 && this.cssPosition == "fixed" ? 0 : this.cssPosition == "fixed" ? -this.scrollParent.scrollLeft() : e ? 0 : d.scrollLeft())
            }
        },
        _clear: function() {
            this.helper.removeClass("ui-draggable-dragging"), this.helper[0] != this.element[0] && !this.cancelHelperRemoval && this.helper.remove(), this.helper = null, this.cancelHelperRemoval = !1
        },
        _trigger: function(b, c, d) {
            return d = d || this._uiHash(), a.ui.plugin.call(this, b, [c, d]), b == "drag" && (this.positionAbs = this._convertPositionTo("absolute")), a.Widget.prototype._trigger.call(this, b, c, d)
        },
        plugins: {},
        _uiHash: function(a) {
            return {
                helper: this.helper,
                position: this.position,
                originalPosition: this.originalPosition,
                offset: this.positionAbs
            }
        }
    }), a.extend(a.ui.draggable, {
        version: "1.8.23"
    }), a.ui.plugin.add("draggable", "connectToSortable", {
        start: function(b, c) {
            var d = a(this).data("draggable"),
                e = d.options,
                f = a.extend({}, c, {
                    item: d.element
                });
            d.sortables = [], a(e.connectToSortable).each(function() {
                var c = a.data(this, "sortable");
                c && !c.options.disabled && (d.sortables.push({
                    instance: c,
                    shouldRevert: c.options.revert
                }), c.refreshPositions(), c._trigger("activate", b, f))
            })
        },
        stop: function(b, c) {
            var d = a(this).data("draggable"),
                e = a.extend({}, c, {
                    item: d.element
                });
            a.each(d.sortables, function() {
                this.instance.isOver ? (this.instance.isOver = 0, d.cancelHelperRemoval = !0, this.instance.cancelHelperRemoval = !1, this.shouldRevert && (this.instance.options.revert = !0), this.instance._mouseStop(b), this.instance.options.helper = this.instance.options._helper, d.options.helper == "original" && this.instance.currentItem.css({
                    top: "auto",
                    left: "auto"
                })) : (this.instance.cancelHelperRemoval = !1, this.instance._trigger("deactivate", b, e))
            })
        },
        drag: function(b, c) {
            var d = a(this).data("draggable"),
                e = this,
                f = function(b) {
                    var c = this.offset.click.top,
                        d = this.offset.click.left,
                        e = this.positionAbs.top,
                        f = this.positionAbs.left,
                        g = b.height,
                        h = b.width,
                        i = b.top,
                        j = b.left;
                    return a.ui.isOver(e + c, f + d, i, j, g, h)
                };
            a.each(d.sortables, function(f) {
                this.instance.positionAbs = d.positionAbs, this.instance.helperProportions = d.helperProportions, this.instance.offset.click = d.offset.click, this.instance._intersectsWith(this.instance.containerCache) ? (this.instance.isOver || (this.instance.isOver = 1, this.instance.currentItem = a(e).clone().removeAttr("id").appendTo(this.instance.element).data("sortable-item", !0), this.instance.options._helper = this.instance.options.helper, this.instance.options.helper = function() {
                    return c.helper[0]
                }, b.target = this.instance.currentItem[0], this.instance._mouseCapture(b, !0), this.instance._mouseStart(b, !0, !0), this.instance.offset.click.top = d.offset.click.top, this.instance.offset.click.left = d.offset.click.left, this.instance.offset.parent.left -= d.offset.parent.left - this.instance.offset.parent.left, this.instance.offset.parent.top -= d.offset.parent.top - this.instance.offset.parent.top, d._trigger("toSortable", b), d.dropped = this.instance.element, d.currentItem = d.element, this.instance.fromOutside = d), this.instance.currentItem && this.instance._mouseDrag(b)) : this.instance.isOver && (this.instance.isOver = 0, this.instance.cancelHelperRemoval = !0, this.instance.options.revert = !1, this.instance._trigger("out", b, this.instance._uiHash(this.instance)), this.instance._mouseStop(b, !0), this.instance.options.helper = this.instance.options._helper, this.instance.currentItem.remove(), this.instance.placeholder && this.instance.placeholder.remove(), d._trigger("fromSortable", b), d.dropped = !1)
            })
        }
    }), a.ui.plugin.add("draggable", "cursor", {
        start: function(b, c) {
            var d = a("body"),
                e = a(this).data("draggable").options;
            d.css("cursor") && (e._cursor = d.css("cursor")), d.css("cursor", e.cursor)
        },
        stop: function(b, c) {
            var d = a(this).data("draggable").options;
            d._cursor && a("body").css("cursor", d._cursor)
        }
    }), a.ui.plugin.add("draggable", "opacity", {
        start: function(b, c) {
            var d = a(c.helper),
                e = a(this).data("draggable").options;
            d.css("opacity") && (e._opacity = d.css("opacity")), d.css("opacity", e.opacity)
        },
        stop: function(b, c) {
            var d = a(this).data("draggable").options;
            d._opacity && a(c.helper).css("opacity", d._opacity)
        }
    }), a.ui.plugin.add("draggable", "scroll", {
        start: function(b, c) {
            var d = a(this).data("draggable");
            d.scrollParent[0] != document && d.scrollParent[0].tagName != "HTML" && (d.overflowOffset = d.scrollParent.offset())
        },
        drag: function(b, c) {
            var d = a(this).data("draggable"),
                e = d.options,
                f = !1;
            if (d.scrollParent[0] != document && d.scrollParent[0].tagName != "HTML") {
                if (!e.axis || e.axis != "x") d.overflowOffset.top + d.scrollParent[0].offsetHeight - b.pageY < e.scrollSensitivity ? d.scrollParent[0].scrollTop = f = d.scrollParent[0].scrollTop + e.scrollSpeed : b.pageY - d.overflowOffset.top < e.scrollSensitivity && (d.scrollParent[0].scrollTop = f = d.scrollParent[0].scrollTop - e.scrollSpeed);
                if (!e.axis || e.axis != "y") d.overflowOffset.left + d.scrollParent[0].offsetWidth - b.pageX < e.scrollSensitivity ? d.scrollParent[0].scrollLeft = f = d.scrollParent[0].scrollLeft + e.scrollSpeed : b.pageX - d.overflowOffset.left < e.scrollSensitivity && (d.scrollParent[0].scrollLeft = f = d.scrollParent[0].scrollLeft - e.scrollSpeed)
            } else {
                if (!e.axis || e.axis != "x") b.pageY - a(document).scrollTop() < e.scrollSensitivity ? f = a(document).scrollTop(a(document).scrollTop() - e.scrollSpeed) : a(window).height() - (b.pageY - a(document).scrollTop()) < e.scrollSensitivity && (f = a(document).scrollTop(a(document).scrollTop() + e.scrollSpeed));
                if (!e.axis || e.axis != "y") b.pageX - a(document).scrollLeft() < e.scrollSensitivity ? f = a(document).scrollLeft(a(document).scrollLeft() - e.scrollSpeed) : a(window).width() - (b.pageX - a(document).scrollLeft()) < e.scrollSensitivity && (f = a(document).scrollLeft(a(document).scrollLeft() + e.scrollSpeed))
            }
            f !== !1 && a.ui.ddmanager && !e.dropBehaviour && a.ui.ddmanager.prepareOffsets(d, b)
        }
    }), a.ui.plugin.add("draggable", "snap", {
        start: function(b, c) {
            var d = a(this).data("draggable"),
                e = d.options;
            d.snapElements = [], a(e.snap.constructor != String ? e.snap.items || ":data(draggable)" : e.snap).each(function() {
                var b = a(this),
                    c = b.offset();
                this != d.element[0] && d.snapElements.push({
                    item: this,
                    width: b.outerWidth(),
                    height: b.outerHeight(),
                    top: c.top,
                    left: c.left
                })
            })
        },
        drag: function(b, c) {
            var d = a(this).data("draggable"),
                e = d.options,
                f = e.snapTolerance,
                g = c.offset.left,
                h = g + d.helperProportions.width,
                i = c.offset.top,
                j = i + d.helperProportions.height;
            for (var k = d.snapElements.length - 1; k >= 0; k--) {
                var l = d.snapElements[k].left,
                    m = l + d.snapElements[k].width,
                    n = d.snapElements[k].top,
                    o = n + d.snapElements[k].height;
                if (!(l - f < g && g < m + f && n - f < i && i < o + f || l - f < g && g < m + f && n - f < j && j < o + f || l - f < h && h < m + f && n - f < i && i < o + f || l - f < h && h < m + f && n - f < j && j < o + f)) {
                    d.snapElements[k].snapping && d.options.snap.release && d.options.snap.release.call(d.element, b, a.extend(d._uiHash(), {
                        snapItem: d.snapElements[k].item
                    })), d.snapElements[k].snapping = !1;
                    continue
                }
                if (e.snapMode != "inner") {
                    var p = Math.abs(n - j) <= f,
                        q = Math.abs(o - i) <= f,
                        r = Math.abs(l - h) <= f,
                        s = Math.abs(m - g) <= f;
                    p && (c.position.top = d._convertPositionTo("relative", {
                        top: n - d.helperProportions.height,
                        left: 0
                    }).top - d.margins.top), q && (c.position.top = d._convertPositionTo("relative", {
                        top: o,
                        left: 0
                    }).top - d.margins.top), r && (c.position.left = d._convertPositionTo("relative", {
                        top: 0,
                        left: l - d.helperProportions.width
                    }).left - d.margins.left), s && (c.position.left = d._convertPositionTo("relative", {
                        top: 0,
                        left: m
                    }).left - d.margins.left)
                }
                var t = p || q || r || s;
                if (e.snapMode != "outer") {
                    var p = Math.abs(n - i) <= f,
                        q = Math.abs(o - j) <= f,
                        r = Math.abs(l - g) <= f,
                        s = Math.abs(m - h) <= f;
                    p && (c.position.top = d._convertPositionTo("relative", {
                        top: n,
                        left: 0
                    }).top - d.margins.top), q && (c.position.top = d._convertPositionTo("relative", {
                        top: o - d.helperProportions.height,
                        left: 0
                    }).top - d.margins.top), r && (c.position.left = d._convertPositionTo("relative", {
                        top: 0,
                        left: l
                    }).left - d.margins.left), s && (c.position.left = d._convertPositionTo("relative", {
                        top: 0,
                        left: m - d.helperProportions.width
                    }).left - d.margins.left)
                }!d.snapElements[k].snapping && (p || q || r || s || t) && d.options.snap.snap && d.options.snap.snap.call(d.element, b, a.extend(d._uiHash(), {
                    snapItem: d.snapElements[k].item
                })), d.snapElements[k].snapping = p || q || r || s || t
            }
        }
    }), a.ui.plugin.add("draggable", "stack", {
        start: function(b, c) {
            var d = a(this).data("draggable").options,
                e = a.makeArray(a(d.stack)).sort(function(b, c) {
                    return (parseInt(a(b).css("zIndex"), 10) || 0) - (parseInt(a(c).css("zIndex"), 10) || 0)
                });
            if (!e.length) return;
            var f = parseInt(e[0].style.zIndex) || 0;
            a(e).each(function(a) {
                this.style.zIndex = f + a
            }), this[0].style.zIndex = f + e.length
        }
    }), a.ui.plugin.add("draggable", "zIndex", {
        start: function(b, c) {
            var d = a(c.helper),
                e = a(this).data("draggable").options;
            d.css("zIndex") && (e._zIndex = d.css("zIndex")), d.css("zIndex", e.zIndex)
        },
        stop: function(b, c) {
            var d = a(this).data("draggable").options;
            d._zIndex && a(c.helper).css("zIndex", d._zIndex)
        }
    })
})(jQuery);
(function(a) {
    a.tiny = a.tiny || {};
    a.tiny.scrollbar = {
        options: {
            axis: "y",
            wheel: 40,
            scroll: true,
            lockscroll: true,
            size: "auto",
            sizethumb: "auto"
        }
    };
    a.fn.tinyscrollbar = function(d) {
        var c = a.extend({}, a.tiny.scrollbar.options, d);
        this.each(function() {
            a(this).data("tsb", new b(a(this), c))
        });
        return this
    };
    a.fn.tinyscrollbar_update = function(c) {
        if (a(this).data("tsb") == undefined) return;
        return a(this).data("tsb").update(c)
    };

    function b(q, g) {
        var k = this,
            t = q,
            j = {
                obj: a(".viewport", q)
            },
            h = {
                obj: a(".overview", q)
            },
            d = {
                obj: a(".scrollbar", q)
            },
            m = {
                obj: a(".track", d.obj)
            },
            p = {
                obj: a(".thumb", d.obj)
            },
            l = g.axis === "x",
            n = l ? "left" : "top",
            v = l ? "Width" : "Height",
            r = 0,
            y = {
                start: 0,
                now: 0
            },
            o = {},
            e = "ontouchstart" in document.documentElement ? true : false;

        function c() {
            k.update();
            s();
            return k
        }
        this.update = function(z) {
            j[g.axis] = j.obj[0]["offset" + v];
            h[g.axis] = h.obj[0]["scroll" + v];
            h.ratio = j[g.axis] / h[g.axis];
            d.obj.toggleClass("disable", h.ratio >= 1);
            m[g.axis] = g.size === "auto" ? j[g.axis] : g.size;
            p[g.axis] = Math.min(m[g.axis], Math.max(0, g.sizethumb === "auto" ? m[g.axis] * h.ratio : g.sizethumb));
            d.ratio = g.sizethumb === "auto" ? h[g.axis] / m[g.axis] : (h[g.axis] - j[g.axis]) / (m[g.axis] - p[g.axis]);
            r = z === "relative" && h.ratio <= 1 ? Math.min(h[g.axis] - j[g.axis], Math.max(0, r)) : 0;
            r = z === "bottom" && h.ratio <= 1 ? h[g.axis] - j[g.axis] : isNaN(parseInt(z, 10)) ? r : parseInt(z, 10);
            w()
        };

        function w() {
            var z = v.toLowerCase();
            p.obj.css(n, r / d.ratio);
            h.obj.css(n, -r);
            o.start = p.obj.offset()[n];
            d.obj.css(z, m[g.axis]);
            m.obj.css(z, m[g.axis]);
            p.obj.css(z, p[g.axis])
        }

        function s() {
            if (!e) {
                p.obj.bind("mousedown", i);
                m.obj.bind("mouseup", u)
            } else {
                j.obj[0].ontouchstart = function(z) {
                    if (1 === z.touches.length) {
                        i(z.touches[0]);
                        z.stopPropagation()
                    }
                }
            } if (g.scroll && window.addEventListener) {
                t[0].addEventListener("DOMMouseScroll", x, false);
                t[0].addEventListener("mousewheel", x, false)
            } else {
                if (g.scroll) {
                    t[0].onmousewheel = x
                }
            }
        }

        function i(A) {
            var z = parseInt(p.obj.css(n), 10);
            o.start = l ? A.pageX : A.pageY;
            y.start = z == "auto" ? 0 : z;
            if (!e) {
                a(document).bind("mousemove", u);
                a(document).bind("mouseup", f);
                p.obj.bind("mouseup", f)
            } else {
                document.ontouchmove = function(B) {
                    B.preventDefault();
                    u(B.touches[0])
                };
                document.ontouchend = f
            }
        }

        function x(B) {
            if (h.ratio < 1) {
                var A = B || window.event,
                    z = A.wheelDelta ? A.wheelDelta / 120 : -A.detail / 3;
                r -= z * g.wheel;
                r = Math.min(h[g.axis] - j[g.axis], Math.max(0, r));
                p.obj.css(n, r / d.ratio);
                h.obj.css(n, -r);
                if (g.lockscroll || r !== h[g.axis] - j[g.axis] && r !== 0) {
                    A = a.event.fix(A);
                    A.preventDefault()
                }
            }
        }

        function u(z) {
            if (h.ratio < 1) {
                if (!e) {
                    y.now = Math.min(m[g.axis] - p[g.axis], Math.max(0, y.start + ((l ? z.pageX : z.pageY) - o.start)))
                } else {
                    y.now = Math.min(m[g.axis] - p[g.axis], Math.max(0, y.start + (o.start - (l ? z.pageX : z.pageY))))
                }
                r = y.now * d.ratio;
                h.obj.css(n, -r);
                p.obj.css(n, y.now)
            }
        }

        function f() {
            a(document).unbind("mousemove", u);
            a(document).unbind("mouseup", f);
            p.obj.unbind("mouseup", f);
            document.ontouchmove = document.ontouchend = null
        }
        return c()
    }
})(jQuery);
JAM.namespace("instruments").keyboard = function($) {
    "use strict";

    function Keyboard(inst) {
        var _instrument = new JAM.model.Instrument({
            config: inst,
            getNotes: function() {
                var startMidi = 24,
                    count, octave = 1,
                    octaves = this._octaves,
                    _notes = [];
                for (var i = 1; i <= octaves; i++) {
                    count = 1;
                    _notes.push({
                        note: "C" + i + "",
                        octave: octave,
                        pos: count++
                    });
                    _notes.push({
                        note: "C" + i + "#",
                        octave: octave,
                        pos: count++,
                        sharp: true,
                        layer: 1
                    });
                    _notes.push({
                        note: "D" + i + "",
                        octave: octave,
                        pos: count++
                    });
                    _notes.push({
                        note: "D" + i + "#",
                        octave: octave,
                        pos: count++,
                        sharp: true,
                        layer: 1
                    });
                    _notes.push({
                        note: "E" + i + "",
                        octave: octave,
                        pos: count++
                    });
                    _notes.push({
                        note: "F" + i + "",
                        octave: octave,
                        pos: count++
                    });
                    _notes.push({
                        note: "F" + i + "#",
                        octave: octave,
                        pos: count++,
                        sharp: true,
                        layer: 1
                    });
                    _notes.push({
                        note: "G" + i + "",
                        octave: octave,
                        pos: count++
                    });
                    _notes.push({
                        note: "G" + i + "#",
                        octave: octave,
                        pos: count++,
                        sharp: true,
                        layer: 1
                    });
                    _notes.push({
                        note: "A" + i + "",
                        octave: octave,
                        pos: count++
                    });
                    _notes.push({
                        note: "A" + i + "#",
                        octave: octave,
                        pos: count++,
                        sharp: true,
                        layer: 1
                    });
                    _notes.push({
                        note: "B" + i + "",
                        octave: octave,
                        pos: count++
                    });
                    octave++
                }
                return _notes
            },
            createZones: function(_me, _stage, _zones) {
                var keyWidth = 43,
                    keyHeight = 263,
                    sharpWidth = 26,
                    sharpHeight = 189,
                    keyGap = 3,
                    top = 0,
                    pos = 0,
                    maxNotes = 36;
                for (var i = 0; i < maxNotes; i++) {
                    var note = _me.notes[i],
                        width = note.sharp ? sharpWidth : keyWidth,
                        height = note.sharp ? sharpHeight : keyHeight,
                        pad = note.sharp ? (width + keyGap) / 2 : 0,
                        place = note.sharp ? pos - pad : pos,
                        color = note.sharp ? "#ff00ff" : "#ff0000",
                        rect = _stage.addRect(place, top, width, height, false),
                        $hint = $(".note-" + i);
                    note.sharp ? $hint.addClass("black-key") : $hint.addClass("white-key");
                    rect.layer = note.sharp ? 2 : 1;
                    $hint.css({
                        left: place + width / 2 + $hint.width() / 2 + keyGap,
                        top: note.sharp ? "378px" : "445px"
                    });
                    pos = place + width - pad + keyGap;
                    _zones.push(rect)
                }
                var note = 0,
                    $keys = $(".keyboard_key"),
                    keyHeight = $keys.eq(0).height(),
                    sharpHeight = $keys.eq(1).height(),
                    speed = 200,
                    delay = 500,
                    next = 50,
                    cutoff = 36,
                    _keyWidth = $keys.eq(0).outerWidth(true),
                    _octaveWidth = _keyWidth * 7,
                    $keyboard = $("#keyboard-inview"),
                    currentNote;
                $("#keyboard-octave").hide();
                $(".keyboard_key").each(function() {
                    var $this = $(this),
                        white = $this.hasClass("white");
                    if (white) {
                        _me.notes[note].shadow = new JAM.model.PressedKey($this);
                        _me.notes[note].pressed = false
                    }
                    if (note < 36) {
                        $this.css("margin-top", white ? -keyHeight : -sharpHeight).tween({
                            "margin-top": 0
                        }, speed, TWEEN.Easing.Cubic.Out, false, false).delay(delay).start();
                        delay += next
                    }
                    note++
                });
                setTimeout(function() {
                    $(".keyboard_key").css("margin-top", 0);
                    $("#keyboard-octave").show();
                    $keyboard.animate({
                        scrollLeft: _octaveWidth * (_me._octave - 1) + "px"
                    }, 1200)
                }, delay + 20);
                _me.listen("noteOn.keyboard", function(event, item) {
                    var index = (item.octave - 1) * 12 + (item.key - 1),
                        key = _me.notes[index];
                    if (key.shadow && currentNote != index) key.shadow.animateIn();
                    currentNote = index
                });
                _me.listen("noteOff.keyboard", function(event, item) {
                    var index = (item.octave - 1) * 12 + (item.key - 1),
                        key = _me.notes[index];
                    if (key.shadow) key.shadow.animateOut();
                    currentNote = false
                })
            },
            interpretNote: function(index) {
                var octave = this._octave + Math.floor(index / 12),
                    note = index % 12 + 1;
                return {
                    octave: octave,
                    key: note
                }
            },
            dispatchObject: function(item) {
                return {
                    octave: item.octave,
                    key: item.key
                }
            },
            controls: JAM.namespace("controller").keyboards,
            onLoad: function() {
                _instrument = this
            },
            unload: function() {
                BASE.off(".keyboard");
                $("#keyboard-octave").fadeOut(400);
                $(".keyboard_key").tween({
                    "margin-top": -300
                }, 400, TWEEN.Easing.Cubic.Out, function() {
                    $(".keyboard_key").hide()
                });
                return 400
            },
            _octave: 2,
            _octaves: 7
        });
        _instrument.load();
        return _instrument
    }
    return Keyboard
}(jQuery);
JAM.namespace("controller").keyboards = function($) {
    "use strict";

    function init(_instrument) {
        var _$local = $("#instrument_local"),
            _$keyboard = _$local.find("#keyboard-inview"),
            _$keys = _$keyboard.find(".keyboard_key"),
            $controls = _$local.find("#keyboard-controls"),
            _$sustain = _$local.find("#keyboard-sustain"),
            _$damper = _$local.find("#keyboard-damper"),
            $leftArrow = $("#keyboard-octave #leftArrow"),
            $rightArrow = $("#keyboard-octave #rightArrow"),
            $key = _$keys.first(),
            $controls, dmaf, proMode = false,
            _keyWidth = $key.outerWidth(true),
            _octaveWidth = _keyWidth * 7 * 3;
        setTimeout(function() {
            $(window).trigger("resize")
        }, 1400);
        _$sustain.on("mousedown", function() {
            JAM.dmaf.dispatch("sustainPressed")
        });
        _$sustain.on("mouseup", function() {
            JAM.dmaf.dispatch("sustainReleased")
        });
        _$damper.on("mousedown", function() {
            JAM.dmaf.dispatch("damperPressed")
        });
        _$damper.on("mouseup", function() {
            JAM.dmaf.dispatch("damperReleased")
        });
        BASE.listen("instrument_pro.keyboard", function(event) {
            proMode = true;
            $controls.show();
            _instrument._octave = 2;
            animateOctave();
            dragger(_instrument._octave);
            _$keyboard.removeClass("easy").addClass("advanced");
            setTimeout(function() {
                $(window).trigger("resize")
            }, 1400)
        });
        BASE.listen("instrument_easy.keyboard", function(event) {
            proMode = false;
            $controls.hide();
            _instrument._octave = 2;
            animateOctave();
            removeDragger();
            _$keyboard.removeClass("advanced").addClass("easy");
            setTimeout(function() {
                $(window).trigger("resize")
            }, 1400)
        });
        BASE.listen("unloadInstrument.keyboard", function(event) {
            removeDragger()
        });
        dmaf = JAM.dmaf;
        dmaf.dispatch("switchMode", {
            mode: "easy"
        });
        BASE.tell("easy_mode");

        function changeOctave(up) {
            if (up) {
                if (_instrument._octave <= _instrument._octaves - 3) _instrument._octave++;
                _$keyboard.animate({
                    scrollLeft: "+=" + _octaveWidth / 3 + "px"
                }, 300)
            } else {
                if (_instrument._octave > 1) _instrument._octave--;
                _$keyboard.animate({
                    scrollLeft: "-=" + _octaveWidth / 3 + "px"
                }, 300)
            }
        }

        function animateOctave() {
            _$keyboard.animate({
                scrollLeft: _octaveWidth / 3 * (_instrument._octave - 1) + "px"
            }, 1200)
        }

        function removeDragger() {
            var $dragger = $("#octave-dragger");
            $dragger.off("mousedown.dragger");
            $dragger.off("mouseup.dragger");
            $dragger.off("mousemov.dragger");
            $(document).off("keyup.dragger")
        }

        function dragger(oct) {
            var $dragger = $("#octave-dragger"),
                $area = $("#octave-full"),
                $keys = $(".octave_key"),
                areaWidth = $area.width(),
                draggerWidth = $dragger.width(),
                moveWidth = areaWidth - draggerWidth,
                octave = oct ? oct - 1 : 0,
                drag = false,
                keyCount = 12,
                keyWidth = 7,
                snap = keyWidth * keyCount,
                left = octave * snap,
                highlight = octave * keyCount,
                count = 35,
                slow = true,
                speed = 250,
                prevX, _$document = $(document),
                _$window = $(window);
            if (oct) {
                $dragger.animate({
                    "margin-left": left
                }, speed)
            }
            $dragger.on("mousedown.dragger", function(event) {
                drag = true
            });
            _$window.on("mouseup.dragger", function(event) {
                drag = false
            });
            $dragger.on("mousemove.dragger", function(event) {
                var x = event.pageX,
                    delta = x - prevX || 0,
                    direction = delta > 0 ? 1 : -1;
                prevX = x;
                if (drag && slow) {
                    slow = false;
                    setTimeout(function() {
                        slow = true
                    }, 300);
                    moveTopBar(direction);
                    return false
                }
            });

            function moveTopBar(direction) {
                var jump = snap * direction;
                left = left + jump;
                highlight += direction * keyCount;
                if (highlight - keyCount < 0) {
                    left = 0;
                    highlight = 0
                }
                if (highlight + keyCount > 88 - count) {
                    left = moveWidth;
                    highlight = 49
                }
                $dragger.animate({
                    "margin-left": left
                }, speed);
                high();
                if (direction > 0) {
                    changeOctave(true)
                } else {
                    changeOctave()
                }
            }

            function high() {
                $area.find(".highlight").removeClass("highlight");
                $keys.slice(highlight, highlight + count).addClass("highlight")
            }
            high();
            $leftArrow.click(function() {
                moveTopBar(-1)
            });
            $rightArrow.click(function() {
                moveTopBar(1)
            });
            _$document.on("keyup.dragger", function(e) {
                var code = BASE.utils.keyToString(e.keyCode);
                switch (code) {
                    case "right":
                        moveTopBar(1);
                        break;
                    case "left":
                        moveTopBar(-1);
                        break
                }
                return false
            })
        }
        BASE.listen("startTour.instrument_tip", function(event) {
            var $ks = $("#keys_keyboard").find(".tt_text"),
                $tk = $("#octave_keyboard").find(".tt_text"),
                ks_text = $ks.text(),
                tk_text = $tk.text();
            $ks.html("<div class='tour_keyboard keyboard'></div><br>" + ks_text + "<div class='clear'></div>");
            $tk.html("<div class='tour_keys'><br/><span class='arrow left'>left</span><span class='arrow right'>right</span></div>" + tk_text);
            BASE.off("startTour.instrument_tip")
        })
    }
    return init
}(jQuery);
JAM.namespace("model").Knob = function($) {
    "use strict";
    var $document = $(document);
    var rad2deg = 180 / Math.PI;
    var tpl = '<div class="knob">';
    tpl += ' <div class="knob_top"></div>';
    tpl += ' <div class="knob_base"></div>';
    tpl += "</div>";

    function Knob($el, diameter, options, turn) {
        if ($el.length == 0) return false;
        this.$el = $el;
        if (this.$el.find(".knob").length) {
            this.$knob = this.$el.find(".knob")
        } else {
            this.$knob = $(tpl);
            this.$el.append(this.$knob)
        }
        this.$knobTop = this.$knob.find(".knob_top");
        if (diameter) {
            this.rad = diameter / 2
        } else {
            this.rad = this.$knobTop.width() / 2
        }
        this.turn = turn;
        this.font = 10;
        this.ticks = 0;
        this.speed = 0;
        this.minDeg = 50;
        this.maxDeg = 300;
        if (options) {
            this.min = options.min;
            this.max = options.max;
            this.ticks = options.max;
            this.minDeg = 55;
            this.maxDeg = 300;
            this.speed = .2;
            this.font = 16
        }
        this.range = this.maxDeg - this.minDeg;
        this.startDeg = -1;
        this.normal = 0;
        this.currentDeg = 0;
        this.startY = 0;
        this.build();
        this.listeners();
        this.dots()
    }
    Knob.prototype = {
        build: function() {
            var knob = this.$knob;
            if (this.ticks > 0) {
                this.tocks = this.range / this.ticks
            }
            this.$knobTop.css("-webkit-transform", "rotate(" + (this.minDeg - 90) + "deg)")
        },
        listeners: function() {
            var that = this;
            this.$knobTop.on("mousedown.rotate", function(e) {
                that.startY = e.pageY;
                that.startDeg = that.currentDeg;
                if (e.button == 2) return;
                $("body").css("cursor", "ns-resize");
                $(".knob_holder").css("pointer-events", "none");
                $("#controls").css("pointer-events", "none");
                $(".radios").css("pointer-events", "none");
                $document.on("mousemove.rotate", function(e) {
                    var deg = that.startDeg + (that.startY - e.pageY) * 2;
                    deg = Math.min(deg, that.maxDeg);
                    deg = Math.max(deg, that.minDeg);
                    that.rotate(deg)
                });
                $document.on("mouseup.rotate", function() {
                    $("body").css("cursor", "auto");
                    $(".knob_holder").css("pointer-events", "visible");
                    $(".radios").css("pointer-events", "visible");
                    $("#controls").css("pointer-events", "visible");
                    var segment = that.range / 10;
                    var deg = Math.round((that.currentDeg - that.minDeg) / segment) * segment + that.minDeg;
                    var normal = (deg - that.minDeg) / that.range,
                        val = Math.round(normal * 10) / 10;
                    $document.off("mousemove.rotate");
                    $document.off("mouseup.rotate");
                    that.rotate(deg);
                    that.turn(val);
                    that.rotation = that.currentDeg
                })
            })
        },
        update: function(val) {
            var ticks = this.ticks || 11,
                setto = this.range / ticks * val;
            this.rotate(setto)
        },
        rotate: function(deg) {
            this.currentDeg = deg;
            this.$knobTop.css("-webkit-transform", "rotate(" + (this.currentDeg - 90) + "deg)");
            this.normal = (this.currentDeg - this.minDeg) / this.range;
            this.currentDot = Math.round(this.dotLength * this.normal);
            if (this.tocks > 0) {
                this.$dots.removeClass("active").eq(this.currentDot).addClass("active")
            } else {
                if (this.currentDot == 0) {
                    this.$dots.removeClass("active").eq(0).addClass("active")
                } else {
                    this.$dots.removeClass("active").slice(0, this.currentDot + 1).addClass("active")
                }
            }
        },
        dots: function() {
            var deg = 0,
                paddingOffset = 5,
                dots = this.ticks ? this.ticks : 10,
                rad = this.rad + 6,
                tick = this.range / dots,
                font = this.font,
                x = this.rad - paddingOffset,
                y = this.rad + 2 - paddingOffset,
                $bottom = this.$knob.find(".knob_base"),
                that = this;
            for (var i = 0; i <= dots; i++) {
                var $dot, adjustedFont, normal, val;
                deg = i * tick - 90 + that.minDeg;
                if (i == 0) {
                    $dot = $('<div class="dot off active">&deg;</div>');
                    adjustedFont = font + 2
                } else {
                    $dot = $('<div class="dot">&bull;</div>');
                    adjustedFont = font
                }
                $dot.css({
                    top: -Math.sin(deg / rad2deg) * rad + y,
                    left: Math.cos((180 - deg) / rad2deg) * rad + x,
                    "font-size": adjustedFont + "px"
                }).data("val", i / 10).data("deg", deg + 90).appendTo($bottom);
                if (that.ticks == 0) {
                    font += 1
                }
                $dot.on("click", function() {
                    var $this = $(this),
                        val = $this.data("val"),
                        deg = $this.data("deg");
                    that.rotate(deg);
                    that.turn(val)
                })
            }
            this.$dots = this.$knob.find(".dot");
            this.dotLength = dots
        }
    };
    return Knob
}(jQuery);
JAM.namespace("model").Lock = function($) {
    "use strict";
    var $document = $(document);
    var rad2deg = 180 / Math.PI;
    var tpl = '<div class="lock">';
    tpl += ' <div class="lock_arrow"></div>';
    tpl += ' <div class="lock_base"></div>';
    tpl += "</div>";
    var _labels = ["off", "4", "8", "16"];

    function Lock($el, diameter, options, turn) {
        if ($el.length == 0) return false;
        this.$el = $el;
        if (this.$el.find(".lock").length) {
            this.$knob = this.$el.find(".lock")
        } else {
            this.$knob = $(tpl);
            this.$el.append(this.$knob)
        }
        this.$knobTop = this.$knob.find(".lock_arrow");
        if (diameter) {
            this.rad = diameter / 2
        } else {
            this.rad = this.$knobTop.width() / 2
        }
        this.turn = turn;
        this.font = 10;
        this.ticks = options.max || 3;
        this.minDeg = 60;
        this.maxDeg = 120;
        this.range = this.maxDeg - this.minDeg;
        this.startDeg = -1;
        this.normal = 0;
        this.currentDeg = 0;
        this.rotation = 0;
        this.lastDeg = 0;
        this.build();
        this.listeners();
        this.dots()
    }
    Lock.prototype = {
        build: function() {
            var knob = this.$knob;
            this.tocks = this.range / this.ticks;
            this.$knobTop.css("-webkit-transform", "rotate(" + (this.minDeg - 90) + "deg)")
        },
        listeners: function() {
            var that = this;
            BASE.listen("lock_off", function() {
                that.rotate(that.minDeg)
            });
            this.$knob.on("mousedown touchstart", function(e) {
                e.preventDefault();
                var offset = that.$knob.offset();
                var center = {
                    y: offset.top + that.$knob.height() / 2 + 27,
                    x: offset.left + that.$knob.width() / 2
                };
                var a, b, deg, tmp, currentDot;
                that.$knob.on("mousemove.rotate touchmove.rotate mousedown touchstart", function(e) {
                    e = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
                    a = center.y - e.pageY;
                    b = center.x - e.pageX;
                    deg = (Math.atan2(a, b) + 1) * rad2deg;
                    if (deg < 0) {
                        deg = 360 + deg
                    }
                    tmp = deg;
                    if (that.tocks > 0) {
                        tmp = that.tocks * Math.ceil(tmp / that.tocks)
                    }
                    if (tmp < that.minDeg) {
                        tmp = that.minDeg
                    }
                    if (tmp > that.maxDeg) {
                        tmp = that.maxDeg
                    }
                    that.rotate(tmp)
                });
                $document.on("mouseup.rotate  touchend.rotate", function() {
                    var normal = (that.currentDeg - that.minDeg) / that.range,
                        val = Math.round(normal * 10) / 10;
                    that.$knob.off("mousemove.rotate");
                    $document.off("mouseup.rotate");
                    that.turn(val);
                    that.rotation = that.currentDeg;
                    that.startDeg = -1
                })
            })
        },
        update: function(val) {
            var ticks = this.ticks || 11,
                setto = this.range / ticks * (val + 1),
                normal = (setto - this.minDeg) / this.range,
                currentDot = Math.round(ticks * normal);
            this.rotate(setto)
        },
        rotate: function(deg) {
            this.currentDeg = deg;
            this.$knobTop.css("-webkit-transform", "rotate(" + (this.currentDeg - 90) + "deg)");
            this.normal = (this.currentDeg - this.minDeg) / this.range;
            this.currentDot = Math.round(this.dotLength * this.normal);
            this.$dots.removeClass("active").eq(this.currentDot).addClass("active")
        },
        dots: function() {
            var deg = 0,
                dots = this.ticks,
                rad = this.rad + 40,
                tick = this.range / dots,
                font = this.font,
                x = this.rad,
                y = this.rad / 2 + 10,
                $bottom = this.$knob.find(".lock_base"),
                that = this;
            for (var i = 0; i <= dots; i++) {
                var $dot, adjustedFont, normal, val;
                deg = i * tick - 90 + that.minDeg;
                if (i == 0) {
                    $dot = $('<div class="dot off active">' + _labels[0] + "</div>");
                    adjustedFont = font - 1
                } else {
                    $dot = $('<div class="dot">' + _labels[i] + "</div>");
                    adjustedFont = font
                }
                var v = i * 3;
                if (i > 1) v++;
                v /= 10;
                $dot.css({
                    top: -Math.sin(deg / rad2deg) * rad + y,
                    left: Math.cos((180 - deg) / rad2deg) * rad + x,
                    "font-size": adjustedFont + "px"
                }).data("val", v).data("deg", deg + 90).appendTo($bottom);
                if (that.ticks == 0) {
                    font += 1
                }
                $dot.on("click", function() {
                    var $this = $(this),
                        val = $this.data("val"),
                        deg = $this.data("deg");
                    that.rotate(deg);
                    that.turn(val)
                })
            }
            this.$dots = this.$knob.find(".dot");
            this.dotLength = dots
        }
    };
    return Lock
}(jQuery);
JAM.namespace("instruments").machine = function($) {
    "use strict";

    function Machine(inst) {
        var _instrument = new JAM.model.Instrument({
            config: inst,
            getNotes: function() {
                return [{
                    pad: 1,
                    pos: [0, 236],
                    layer: 1
                }, {
                    pad: 2,
                    pos: [144, 236],
                    layer: 1
                }, {
                    pad: 3,
                    pos: [288, 236],
                    layer: 1
                }, {
                    pad: 4,
                    pos: [0, 118],
                    layer: 1
                }, {
                    pad: 5,
                    pos: [144, 118],
                    layer: 1
                }, {
                    pad: 6,
                    pos: [288, 118],
                    layer: 1
                }, {
                    pad: 7,
                    pos: [0, 0],
                    layer: 1
                }, {
                    pad: 8,
                    pos: [144, 0],
                    layer: 1
                }, {
                    pad: 9,
                    pos: [288, 0],
                    layer: 1
                }]
            },
            createZones: function(_me, _stage, _zones) {
                var _width = 134,
                    _height = 108,
                    speed = 250,
                    delay = 500,
                    next = 150;
                _me.notes.forEach(function(note) {
                    var rect = _stage.addRect(note.pos[0], note.pos[1], _width, _height, false);
                    rect.layer = note.layer;
                    _zones.push(rect)
                });
                $(".pad").each(function() {
                    var $this = $(this);
                    $this.tween({
                        opacity: 1
                    }, speed, TWEEN.Easing.Cubic.Out, false, false).delay(delay).start();
                    delay += next
                })
            },
            getBindings: function() {
                var _local = BASE._language.bindings[this.config.type],
                    _me = this;
                if (this.bindings) return this.bindings;
                this.bindings = {};
                _me.bindings[_local[0]] = 6;
                _me.bindings[_local[1]] = 7;
                _me.bindings[_local[2]] = 8;
                _me.bindings[_local[3]] = 3;
                _me.bindings[_local[4]] = 4;
                _me.bindings[_local[5]] = 5;
                _me.bindings[_local[6]] = 0;
                _me.bindings[_local[7]] = 1;
                _me.bindings[_local[8]] = 2
            },
            buildhints: function(key, mapped, index) {
                var hint = $("<div>").attr("id", "hint-" + index).addClass("note-" + mapped).addClass("hintcol" + index % 3).addClass("hintrow" + Math.floor(index / 3)).addClass("hint").data("note", mapped).addClass("bound-" + key).html(key);
                return hint
            },
            dispatchObject: function(item) {
                return {
                    pad: item.pad
                }
            },
            interpretNote: function(index) {
                var pad = _instrument.notes[index].pad;
                return {
                    pad: pad
                }
            },
            controls: function() {
                JAM.dmaf.dispatch("switchMode", {
                    mode: "easy"
                });
                BASE.tell("easy_mode");
                BASE.listen("startTour.instrument_tip", function(event) {
                    var $ks = $("#keys_machine").find(".tt_text"),
                        ks_text = $ks.text();
                    $ks.html("<div class='tour_keyboard machine'></div><br>" + ks_text + "<div class='clear'></div>");
                    BASE.off("startTour.instrument_tip")
                })
            },
            unload: function() {
                $(".pad").fadeOut(15)
            }
        });
        _instrument.load();
        return _instrument
    }
    return Machine
}(jQuery);
JAM.namespace("app").init = function($) {
    var _availableLanguages = ["en", "it", "de", "nl", "fr", "es", "tr", "ru", "cs"];
    JAM._baseUrl = window.location.origin + "/";
    JAM._password = "";
    if (window.location.search) {
        var pass = /(password=(.+))$/.exec(window.location.search);
        if (pass) JAM._password = "?" + pass[1]
    }
    JAM._shareLink;

    function init() {
        BASE.errors = 0;
        window.addEventListener("offline", function() {
            BASE.tell("loadingFailed.main")
        });
        BASE.render.setAvailableLanguages(_availableLanguages);
        BASE.render.begin(function() {
            var Router = BASE.router,
                chromeVersion = 21,
                ischrome;
            JAM.manager.views();
            ischrome = BASE.utils.chromeVersion();
            if (ischrome && ischrome < chromeVersion) {
                BASE.render.from_template("upgrade");
                return false
            }
            JAM.manager.interface.helpers();
            BASE.listen("loadingFailed.main", function() {
                BASE.router.path("/error/")
            });
            Router.add("/select/:id:", function(id) {
                var myID = id || false;
                if (!JAM.entered) {
                    BASE.router.path("/");
                    return false
                }
                if (JAM.selected || !myID) {
                    start(myID, function(newID) {
                        BASE.render.from_template("select", {
                            id: newID
                        })
                    })
                } else {
                    BASE.render.from_template("select", {
                        id: myID
                    })
                }
                JAM.selected = true
            });
            Router.add("/session/{id}", function(id) {
                if (!id) {
                    Router.path("/");
                    return false
                }
                if (!JAM.started) {
                    BASE.router.path("/rejoin/" + id + "/");
                    return false
                }
                JAM._shareLink = JAM._baseUrl + "join/" + id + "/" + JAM.controller.session.myId() + "/";
                if (JAM._password != "") {
                    JAM._shareLink += JAM._password
                }
                BASE.listen("latency.start", function(event) {
                    BASE.render.from_template("session", {
                        id: id,
                        remotes: ["1", "2", "3", "4"]
                    });
                    BASE.off("latency.start")
                });
                JAM.dmaf.dispatch("sessionStarted");
                JAM.manager.broadcaster.sync()
            });
            Router.add("/join/{id}/:by:/:params:", function(id, by) {
                var accept_timeout;
                if (!id) {
                    Router.path("/");
                    return false
                }
                BASE.render.from_template("accept", {
                    id: id,
                    by: by
                });
                start(id, function(newID) {
                    accept_timeout = setTimeout(function() {
                        JAM.controller.accept(newID, by)
                    }, 1e3);
                    BASE.listen("addedClient.accept", function(event) {
                        clearTimeout(accept_timeout);
                        accept_timeout = setTimeout(function() {
                            JAM.controller.accept(newID, by)
                        }, 100);
                        BASE.off("addedClient.accept")
                    })
                })
            });
            Router.add("/join/", function() {
                BASE.render.from_template("join")
            });
            Router.add("/rejoin/{id}/", function(id) {
                BASE.render.from_template("rejoin", {
                    id: id
                });
                JAM.selected = true
            });
            Router.add("/upgrade/", function() {
                BASE.render.from_template("upgrade")
            });
            Router.add("/error/:id:", function(id) {
                JAM.manager.broadcaster.close();
                BASE.render.from_template("error", {
                    id: id
                });
                JAM.selected = true
            });
            Router.add("/timeout/", function() {
                BASE.render.from_template("timeout")
            });
            Router.add("/latency/", function() {
                BASE.render.from_template("latency_error")
            });
            Router.add("/ended/", function(id) {
                if (!JAM.entered) {
                    BASE.router.path("/");
                    return false
                }
                JAM.dmaf.dispatch("sessionEnded");
                BASE.render.from_template("ended")
            });
            Router.add("/webapp", function() {
                gaq.push(["_trackPageview", "/webapp"]);
                BASE.render.from_template("welcome");
                floodlight("937");
                $("#messages").addClass("webapp")
            });
            Router.root(function() {
                BASE.render.from_template("welcome")
            })
        });
        BASE.utils.disableTabFocus();
        tick()
    }

    function tick() {
        if (!TWEEN) return false;
        window.webkitRequestAnimationFrame(function() {
            tick()
        });
        TWEEN.update()
    }

    function start(id, callback) {
        JAM.loader.dmaf.load(function() {
            JAM.controller.session.clients();
            JAM.controller.session.start(id, function(newID) {
                JAM.dmaf.dispatch("sessionEnded");
                callback(newID);
                BASE.off("loadingFailed.main");
                BASE.listen("loadingFailed.main", function() {
                    if (newID) {
                        BASE.router.path("/error/" + newID + "/")
                    } else {
                        BASE.router.path("/error/")
                    }
                })
            })
        });
        BASE.listen("sessionFull.start", function(event) {
            BASE.off("sessionFull.start");
            callback(false)
        })
    }

    function baseUrl() {
        return _baseUrl
    }
    return init
}(jQuery);
JAM.namespace("loader").dmaf = function($) {
    "use strict";
    var _dmaf, _loaded;

    function load(callback) {
        if (typeof DMAF != "undefined") {
            JAM.dmaf = _dmaf = DMAF.Framework();
            JAM.dmaf.addEventListener("dmafReady", function() {});
            _loaded = true;
            callback()
        } else {
            BASE.utils.loadScripts(["/js/dmaf/DMAFSettings", "/js/dmaf/DMAF-min", "/js/dmaf/DMAFMainController", "/js/dmaf/SampleMap", "/js/dmaf/ProjectData", "/js/dmaf/InstrumentMeta", "/js/dmaf/DMAFMusicController"], function() {
                console.log("Loaded DMAF");
                JAM.dmaf = _dmaf = DMAF.Framework();
                _loaded = true;
                if (typeof callback != "undefined") {
                    callback()
                }
            })
        }
    }
    return {
        load: load
    }
}(jQuery);
JAM.namespace("model").Modal = function($) {
    "use strict";
    var $window = $(window),
        $body = $("body"),
        bottomHeight = 30;

    function Modal(view, width, height, callback, collection) {
        var that = this;
        this.view = view;
        this.width = width || 500;
        this.height = height || 500;
        this.callback = callback || function() {};
        this.collection = collection || {};
        this.persistent = false;
        this.onClosed = function() {};
        this.create();
        this.add();
        this.load_view()
    }
    Modal.prototype = {
        create: function() {
            var _me = this;
            this.$modal = $("<div>");
            this.$modal.addClass("modal");
            this.$modal.width(this.width);
            this.$modal.css({
                "margin-left": this.width / -2,
                "margin-top": this.height / -2 - bottomHeight
            });
            this.opened = false;
            BASE.listen("openingModal." + this.view, function() {
                if (_me.opened && !_me.persistent) {
                    _me.close()
                }
            });
            BASE.listen("closeAllModals." + this.view, function() {
                if (_me.opened && !_me.persistent) {
                    _me.close()
                }
            })
        },
        load_view: function() {
            var _me = this;
            _me.$modal.attr("id", "modal-" + _me.view);
            BASE.render.view(this.view, function($tmpl) {
                _me.$modal.append($tmpl);
                var scrollbar = _me.$modal.find(".scrollbar");
                if (scrollbar.length > 0) {
                    _me.$modal.find(".scrollbar-container").tinyscrollbar()
                }
                _me.$closeBtn = _me.$modal.find(".close_btn");
                _me.callback(_me.$modal, _me)
            }, this.collection)
        },
        open: function(closeOtherModals) {
            var _me = this;
            var close;
            closeOtherModals == undefined ? close = true : close = false;
            if (close) BASE.tell("openingModal");
            this.opened = true;
            this.$modal.addClass("open");
            this.$closeBtn.on("click", function(event) {
                _me.close()
            })
        },
        close: function() {
            this.opened = false;
            this.$modal.removeClass("open");
            if (this.onClosed) this.onClosed()
        },
        add: function() {
            $body.append(this.$modal)
        },
        destroy: function() {
            this.$modal.remove();
            BASE.off("." + this.view)
        }
    };
    return Modal
}(jQuery);
(function(exports) {
    var current = window.getComputedStyle || window.currentStyle;
    var map = {
        top: "px",
        bottom: "px",
        left: "px",
        right: "px",
        width: "px",
        height: "px",
        "font-size": "px",
        margin: "px",
        "margin-top": "px",
        "margin-bottom": "px",
        "margin-left": "px",
        "margin-right": "px",
        padding: "px",
        "padding-top": "px",
        "padding-bottom": "px",
        "padding-left": "px",
        "padding-right": "px"
    };
    exports.move = function(selector) {
        return new Move(move.select(selector))
    };
    exports.move.version = "0.0.3";
    move.defaults = {
        duration: 500
    };
    move.ease = {
        "in": "ease-in",
        out: "ease-out",
        "in-out": "ease-in-out",
        snap: "cubic-bezier(0,1,.5,1)",
        linear: "cubic-bezier(0.250, 0.250, 0.750, 0.750)",
        "ease-in-quad": "cubic-bezier(0.550, 0.085, 0.680, 0.530)",
        "ease-in-cubic": "cubic-bezier(0.550, 0.055, 0.675, 0.190)",
        "ease-in-quart": "cubic-bezier(0.895, 0.030, 0.685, 0.220)",
        "ease-in-quint": "cubic-bezier(0.755, 0.050, 0.855, 0.060)",
        "ease-in-sine": "cubic-bezier(0.470, 0.000, 0.745, 0.715)",
        "ease-in-expo": "cubic-bezier(0.950, 0.050, 0.795, 0.035)",
        "ease-in-circ": "cubic-bezier(0.600, 0.040, 0.980, 0.335)",
        "ease-in-back": "cubic-bezier(0.600, -0.280, 0.735, 0.045)",
        "ease-out-quad": "cubic-bezier(0.250, 0.460, 0.450, 0.940)",
        "ease-out-cubic": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
        "ease-out-quart": "cubic-bezier(0.165, 0.840, 0.440, 1.000)",
        "ease-out-quint": "cubic-bezier(0.230, 1.000, 0.320, 1.000)",
        "ease-out-sine": "cubic-bezier(0.390, 0.575, 0.565, 1.000)",
        "ease-out-expo": "cubic-bezier(0.190, 1.000, 0.220, 1.000)",
        "ease-out-circ": "cubic-bezier(0.075, 0.820, 0.165, 1.000)",
        "ease-out-back": "cubic-bezier(0.175, 0.885, 0.320, 1.275)",
        "ease-out-quad": "cubic-bezier(0.455, 0.030, 0.515, 0.955)",
        "ease-out-cubic": "cubic-bezier(0.645, 0.045, 0.355, 1.000)",
        "ease-in-out-quart": "cubic-bezier(0.770, 0.000, 0.175, 1.000)",
        "ease-in-out-quint": "cubic-bezier(0.860, 0.000, 0.070, 1.000)",
        "ease-in-out-sine": "cubic-bezier(0.445, 0.050, 0.550, 0.950)",
        "ease-in-out-expo": "cubic-bezier(1.000, 0.000, 0.000, 1.000)",
        "ease-in-out-circ": "cubic-bezier(0.785, 0.135, 0.150, 0.860)",
        "ease-in-out-back": "cubic-bezier(0.680, -0.550, 0.265, 1.550)"
    };
    move.select = function(selector) {
        if ("string" != typeof selector) return selector;
        return document.getElementById(selector) || document.querySelectorAll(selector)[0]
    };

    function EventEmitter() {
        this.callbacks = {}
    }
    EventEmitter.prototype.on = function(event, fn) {
        (this.callbacks[event] = this.callbacks[event] || []).push(fn);
        return this
    };
    EventEmitter.prototype.emit = function(event) {
        var args = Array.prototype.slice.call(arguments, 1),
            callbacks = this.callbacks[event],
            len;
        if (callbacks) {
            len = callbacks.length;
            for (var i = 0; i < len; ++i) {
                callbacks[i].apply(this, args)
            }
        }
        return this
    };
    exports.Move = function Move(el) {
        if (!(this instanceof Move)) return new Move(el);
        EventEmitter.call(this);
        this.el = el;
        this._props = {};
        this._rotate = 0;
        this._transitionProps = [];
        this._transforms = [];
        this.duration(move.defaults.duration)
    };
    Move.prototype = new EventEmitter;
    Move.prototype.constructor = Move;
    Move.prototype.transform = function(transform) {
        this._transforms.push(transform);
        return this
    };
    Move.prototype.skew = function(x, y) {
        y = y || 0;
        return this.transform("skew(" + x + "deg, " + y + "deg)")
    };
    Move.prototype.skewX = function(n) {
        return this.transform("skewX(" + n + "deg)")
    };
    Move.prototype.skewY = function(n) {
        return this.transform("skewY(" + n + "deg)")
    };
    Move.prototype.translate = Move.prototype.to = function(x, y) {
        y = y || 0;
        return this.transform("translate(" + x + "px, " + y + "px)")
    };
    Move.prototype.translateX = Move.prototype.x = function(n) {
        return this.transform("translateX(" + n + "px)")
    };
    Move.prototype.translateY = Move.prototype.y = function(n) {
        return this.transform("translateY(" + n + "px)")
    };
    Move.prototype.scale = function(x, y) {
        y = null == y ? x : y;
        return this.transform("scale(" + x + ", " + y + ")")
    };
    Move.prototype.scaleX = function(n) {
        return this.transform("scaleX(" + n + ")")
    };
    Move.prototype.scaleY = function(n) {
        return this.transform("scaleY(" + n + ")")
    };
    Move.prototype.rotate = function(n) {
        return this.transform("rotate(" + n + "deg)")
    };
    Move.prototype.ease = function(fn) {
        fn = move.ease[fn] || fn || "ease";
        return this.setVendorProperty("transition-timing-function", fn)
    };
    Move.prototype.animate = function(name, props) {
        for (var i in props) {
            if (props.hasOwnProperty(i)) {
                this.setVendorProperty("animation-" + i, props[i])
            }
        }
        return this.setVendorProperty("animation-name", name)
    };
    Move.prototype.duration = function(n) {
        n = this._duration = "string" == typeof n ? parseFloat(n) * 1e3 : n;
        return this.setVendorProperty("transition-duration", n + "ms")
    };
    Move.prototype.delay = function(n) {
        n = "string" == typeof n ? parseFloat(n) * 1e3 : n;
        return this.setVendorProperty("transition-delay", n + "ms")
    };
    Move.prototype.setProperty = function(prop, val) {
        this._props[prop] = val;
        return this
    };
    Move.prototype.setVendorProperty = function(prop, val) {
        this.setProperty("-webkit-" + prop, val);
        this.setProperty("-moz-" + prop, val);
        this.setProperty("-ms-" + prop, val);
        this.setProperty("-o-" + prop, val);
        return this
    };
    Move.prototype.set = function(prop, val) {
        this.transition(prop);
        if ("number" == typeof val && map[prop]) val += map[prop];
        this._props[prop] = val;
        return this
    };
    Move.prototype.add = function(prop, val) {
        if (!current) return;
        var self = this;
        return this.on("start", function() {
            var curr = parseInt(self.current(prop), 10);
            self.set(prop, curr + val + "px")
        })
    };
    Move.prototype.sub = function(prop, val) {
        if (!current) return;
        var self = this;
        return this.on("start", function() {
            var curr = parseInt(self.current(prop), 10);
            self.set(prop, curr - val + "px")
        })
    };
    Move.prototype.current = function(prop) {
        return current(this.el).getPropertyValue(prop)
    };
    Move.prototype.transition = function(prop) {
        if (!this._transitionProps.indexOf(prop)) return this;
        this._transitionProps.push(prop);
        return this
    };
    Move.prototype.applyProperties = function() {
        var props = this._props,
            el = this.el;
        for (var prop in props) {
            if (props.hasOwnProperty(prop)) {
                el.style.setProperty(prop, props[prop], "")
            }
        }
        return this
    };
    Move.prototype.move = Move.prototype.select = function(selector) {
        this.el = move.select(selector);
        return this
    };
    Move.prototype.then = function(fn) {
        if (fn instanceof Move) {
            this.on("end", function() {
                fn.end()
            })
        } else if ("function" == typeof fn) {
            this.on("end", fn)
        } else {
            var clone = new Move(this.el);
            clone._transforms = this._transforms.slice(0);
            this.then(clone);
            clone.parent = this;
            return clone
        }
        return this
    };
    Move.prototype.pop = function() {
        return this.parent
    };
    Move.prototype.end = function(fn) {
        var self = this;
        this.emit("start");
        if (this._transforms.length) {
            this.setVendorProperty("transform", this._transforms.join(" "))
        }
        this.setVendorProperty("transition-properties", this._transitionProps.join(", "));
        this.applyProperties();
        if (fn) this.then(fn);
        setTimeout(function() {
            self.emit("end")
        }, this._duration);
        return this
    }
})(this);
window.pickRelay = function() {
    function pickRelay(relays, callback) {
        var done = false;
        var timeout = setTimeout(end, 2100);
        var deltas = [];
        var n = 0;

        function end() {
            if (done) {
                return
            }
            done = true;
            if (deltas.length == 0) {
                callback(null, null);
                return
            }
            deltas.sort(function(a, b) {
                if (a.delta < b.delta) {
                    return -1
                }
                if (a.delta > b.delta) {
                    return 1
                }
                return 0
            });
            var d = deltas[0];
            callback(d.relay, d.delta)
        }
        for (var i = 0; i < relays.length; i++) {
            pollRelay(relays[i], function(relay, delta) {
                console.log("pollRelay:", relay, delta);
                if (delta !== null) {
                    deltas.push({
                        relay: relay,
                        delta: delta
                    })
                }
                n++;
                if (n == relays.length) end()
            })
        }
    }

    function pollRelay(relay, callback) {
        var sock = new WebSocket(relay);
        var timeout = setTimeout(end, 2e3);
        var nextPing;
        var done = false;
        var deltas = [];
        var numDeltas = 5;

        function end() {
            if (done) {
                return
            }
            done = true;
            if (sock) {
                sock.close()
            }
            clearTimeout(timeout);
            clearTimeout(nextPing);
            if (deltas.length == 0) {
                callback(relay, null);
                return
            }
            for (var i = 0, len = numDeltas; i < len; i++) {
                if (typeof deltas[i] === "undefined") {
                    deltas.push(1e3)
                }
            }
            deltas.sort();
            callback(relay, deltas[Math.floor(numDeltas / 2)])
        }

        function ping() {
            if (done) {
                return
            }
            var now = (new Date).getTime();
            var msg = {
                type: "ping",
                clientTime: now
            };
            sock.send(JSON.stringify(msg))
        }
        sock.onopen = ping;
        sock.onmessage = function(e) {
            if (done) {
                return
            }
            var msg = JSON.parse(e.data);
            if (msg.type != "ping") {
                return
            }
            var now = (new Date).getTime();
            var delta = now - msg.clientTime;
            deltas.push(delta);
            if (deltas.length == numDeltas) {
                end();
                return
            }
            nextPing = setTimeout(ping, 100)
        };
        sock.onclose = end
    }
    return pickRelay
}();
JAM.namespace("model").Player = function($) {
    "use strict";
    var _$players, _$slots;
    var colors = ["yellow", "green", "blue", "red"];

    function Player(id, nickname, instrument, is_leader, is_me, noshow) {
        this._id = id;
        this.instrument = instrument;
        this.nickname = nickname;
        this.is_me = is_me;
        this.color = colors.pop();
        this.noshow = noshow || false;
        this.delay = 150;
        this.is_leader = is_leader;
        this.is_loaded = false;
        this.eventCache = [];
        this.build();
        this.listeners();
        this.jamming()
    }
    Player.prototype = {
        build: function() {
            var _me = this;
            var collection = {
                player_id: this._id,
                instrument: this.instrument,
                player_nickname: this.nickname || BASE.render.t("loading"),
                is_leader: this.is_leader ? "leader" : "",
                local_player: this.is_me ? "me" : ""
            };
            BASE.render.view("player", function(tmpHtml) {
                _$players = $("#remotes");
                _$slots = _$players.find(".invite").first();
                $(tmpHtml).insertBefore(_$slots);
                _me.$el = $("#player_" + _me._id);
                if (_me.is_leader) {
                    BASE.events.tell("is_leader")
                }
                if (_me.instrument) {
                    _me.load_swiffy()
                }
                _me.is_loaded = true;
                _me.eventCache.forEach(function(event) {
                    _me.parseEvent(event)
                });
                _me.eventCache = [];
                if (_me.noshow) {
                    _me.slidein(_me.delay)
                }
            }, collection)
        },
        slidein: function(delay) {
            var _me = this;
            setTimeout(function() {
                _me.$el.find(".background_triangle_holder").removeClass("before_load");
                _me.$el.find(".bottom_bar").removeClass("before_load");
                setTimeout(function() {
                    _me.$el.find(".instrument_icon").removeClass("before_load")
                }, 800)
            }, delay)
        },
        listeners: function() {
            var _me = this;
            BASE.listen("clientUpdate", function(event) {
                if (_me.is_loaded == false) {
                    _me.eventCache.push(event)
                } else {
                    _me.parseEvent(event)
                }
            })
        },
        remove: function() {
            var delay = 400,
                pause = delay + 600,
                _me = this;
            colors.push(_me.color);
            _me.$el.find(".instrument_icon").addClass("before_load");
            setTimeout(function() {
                _me.$el.find(".background_triangle_holder").addClass("before_load");
                _me.$el.find(".bottom_bar").addClass("before_load")
            }, delay);
            setTimeout(function() {
                _me.$el.remove()
            }, pause)
        },
        parseEvent: function(event) {
            if (event.player_id != this._id) return false;
            if (event.player_nickname != this.nickname) {
                this.update_nickname(event.player_nickname)
            }
            if (event.player_instrument != this.instrument) {
                this.update_instrument(event.player_instrument)
            }
            if (event.is_leader != this.is_leader) {
                this.update_leader(event.is_leader)
            }
        },
        update_nickname: function(nickname) {
            this.nickname = nickname;
            this.$nickname = this.$el.find(".nickname");
            this.$nickname.html(this.nickname)
        },
        update_instrument: function(instrument) {
            this.instrument = instrument;
            if (this.$el && this.$el.length > 0) {
                this.$el.attr("class", "instrument_remote " + this.instrument)
            }
            this.load_swiffy()
        },
        load_swiffy: function() {
            if (this.jammer) {
                this.jammer.stop()
            } else {
                this.$icon = this.$el.find(".instrument_icon")
            }
            this.jammer = new JAM.model.Swiffy(JAM.instrumentsConfig[this.instrument].player, this.$icon, function(swiffy) {
                swiffy.start()
            })
        },
        jamming: function() {
            var _me = this;
            this.events = JAM.manager.broadcaster.onClient(this._id);
            if (!this.events) return false;
            this.events.patternOn.add(function() {
                _me.playPattern()
            });
            this.events.patternOff.add(function() {
                _me.stopPattern()
            });
            this.events.noteOn.add(function() {
                _me.playPattern()
            });
            this.events.noteOff.add(function() {
                _me.stopPattern()
            })
        },
        playNote: function() {
            if (!this.jammer) return false;
            this.jammer.once()
        },
        playPattern: function() {
            if (!this.jammer) return false;
            this.jammer.looping(true)
        },
        stopPattern: function() {
            if (!this.jammer) return false;
            this.jammer.looping(false)
        },
        update_leader: function(is_leader) {
            this.is_leader = is_leader;
            if (typeof this.$crown === "undefined") {
                this.$crown = this.$el.find(".crown")
            }
            if (is_leader) {
                this.$crown.addClass("leader");
                BASE.events.tell("is_leader")
            } else {
                this.$crown.removeClass("leader");
                BASE.events.tell("not_leader")
            }
        },
        getInstrument: function() {
            return this.instrument
        },
        getColor: function() {
            return this.color
        },
        getNickname: function() {
            return this.nickname
        }
    };
    return Player
}(jQuery);
JAM.namespace("controller").player = function($) {
    "use strict";

    function init() {}
    return init
}(jQuery);
JAM.namespace("model").PressedKey = function($) {
    "use strict";

    function PressedKey($el, speed) {
        if ($el.length == 0) return false;
        this.$el = $el;
        this.inSpeed = speed - 50 || 50;
        this.outSpeed = speed || 100;
        this.parse();
        this.build();
        this.update();
        this.tweens();
        this.add();
        this.halt = true
    }
    PressedKey.prototype = {
        parse: function() {
            this.elHeight = this.$el.height();
            this.elWidth = this.$el.width();
            this.maxWidth = this.elWidth / 3;
            this.Width = 0
        },
        update: function(x) {
            var w = x || this.Width;
            this.points = this.triangle(w, this.elHeight);
            this.$polygon.attr("points", this.points)
        },
        build: function() {
            this.template = '<svg xmlns="http://www.w3.org/2000/svg" width="' + this.elWidth + '" height="' + this.elHeight + '">';
            this.template += '<polygon class="keypress" points="" />';
            this.template += "</svg>";
            this.$svg = $(this.template);
            this.$polygon = this.$svg.find("polygon")
        },
        listeners: function() {
            _me = this;
            this.$el.on("click", function() {
                _me.animate()
            })
        },
        triangle: function(width, height) {
            return [
                [0, 0].join(","), [0, height].join(","), [width, height].join(",")
            ].join(" ")
        },
        tweens: function() {
            var that = this;
            this.tweenPressed = new TWEEN.Tween({
                x: 0
            }).to({
                x: that.maxWidth
            }, that.inSpeed).onUpdate(function() {
                that.update(this.x)
            }).onComplete(function() {});
            this.tweenBack = new TWEEN.Tween({
                x: that.maxWidth
            }).to({
                x: 0
            }, that.outSpeed).onUpdate(function() {
                that.update(this.x)
            }).onComplete(function() {})
        },
        step: function() {
            var that = this;
            if (this.halt) return false;
            window.webkitRequestAnimationFrame(function() {
                that.step()
            });
            TWEEN.update()
        },
        animateIn: function() {
            this.tweens();
            this.tweenPressed.start()
        },
        animateOut: function() {
            this.tweens();
            this.tweenBack.start()
        },
        add: function() {
            this.$el.append(this.$svg)
        }
    };
    return PressedKey
}(jQuery);
var BASE = BASE || {};
BASE.render = function($) {
    "use strict";
    var _$main, _$header, _$players, _availableLanguages = ["en"],
        _language, _languageCode, _timeoutCount = 0,
        _timeoutLimit = 4,
        _errors = 0;

    function load_language(lang, callback) {
        _languageCode = lang;
        $.ajax({
            url: "/languages/" + _languageCode + ".json",
            dataType: "json",
            cache: true,
            success: function(langData) {
                _language = BASE._language = langData;
                _language._baseUrl = window.location.origin;
                callback()
            },
            error: function() {
                console.log("Unable to load language file");
                BASE.tell("loadingFailed")
            }
        })
    }

    function setAvailableLanguages(langs) {
        _availableLanguages = langs
    }

    function begin(callback) {
        _languageCode = determineLanguage();
        load_language(_languageCode, callback);
        if (typeof Handlebars.templates === "undefined") Handlebars.templates = {};
        if (typeof Handlebars.compile === "undefined") Handlebars.compile = function() {
            return false
        };
        Handlebars.registerHelper("I18n", function(str) {
            return t(str)
        });
        Handlebars.registerHelper("select", function(array, selected) {
            var output = "<select>";
            array.forEach(function(item) {
                var is_selected = item === selected ? "selected='selected'" : "";
                output += "<option " + is_selected + 'value="' + item + '">' + t(item) + "</option>"
            });
            output += "</select>";
            return new Handlebars.SafeString(output)
        });
        Handlebars.registerHelper("link", function(text, url) {
            text = Handlebars.Utils.escapeExpression(text);
            url = Handlebars.Utils.escapeExpression(url);
            var result = '<a href="' + url + '">' + text + "</a>";
            return new Handlebars.SafeString(result)
        })
    }

    function hasLang(language) {
        return -1 !== $.inArray(language, _availableLanguages)
    }

    function determineLanguage() {
        var search = window.location.search.match(/lang=(\w*)/);
        var opts = [search ? search[1] : "", document.documentElement.lang || "", navigator.language || "", navigator.language ? navigator.language.substring(0, 2) : "en", "en"],
            i;
        for (i = 0; i < opts.length; i++) {
            if (hasLang(opts[i])) {
                return opts[i]
            }
        }
    }

    function getLanguageCode() {
        return _languageCode
    }

    function switchLanguage(lang) {
        if (!hasLang(lang)) return false;
        load_language(lang, function() {
            var $t = $("[data-t]"),
                $title = $("[data-title]"),
                $placeholder = $("[placeholder]");
            $t.each(function() {
                var $this = $(this),
                    trans = $this.data("t"),
                    replacement = trans ? t(trans) : false;
                if (replacement) {
                    $this.html(replacement)
                }
            });
            $title.each(function() {
                var $this = $(this),
                    trans = $this.data("t"),
                    replacement = trans ? t(trans) : false;
                if (replacement) {
                    $this.attr("title", replacement)
                }
            });
            $placeholder.each(function() {
                var $this = $(this),
                    trans = $this.data("t"),
                    replacement = trans ? t(trans) : false;
                if (!replacement) return;
                if ($this.attr("placeholder").length == 0) {
                    $this.data("placeholder", replacement)
                } else {
                    $this.attr("placeholder", replacement)
                }
            });
            document.title = t("title");
            BASE.tell("languageSwitched")
        })
    }

    function t(str) {
        if (typeof str === "undefined") return "";
        return _language[str] ? _language[str] : str
    }

    function from_template(tmp, collections, after_render) {
        grab(tmp + ".tmpl", collections, function(tmpHtml) {
            BASE.view.tell("view_" + tmp, [tmpHtml, collections]);
            if (after_render) after_render();
            BASE.events.tell("view_changed")
        })
    }

    function partial(tmpl, after_render, collections) {
        var underscore = tmpl.indexOf("_"),
            $area = underscore > -1 ? $("#" + tmpl.slice(0, underscore)) : $("#" + tmpl);
        if ($area.length < 1) throw new Error("Missing area to load into");
        grab(tmpl + ".tmpl", collections, function(tmpHtml) {
            $area.html(tmpHtml);
            BASE.view.tell("partial_" + tmpl, [tmpHtml, collections]);
            if (after_render) after_render($area)
        })
    }

    function view(tmpl, after_render, collections) {
        var template = tmpl.search(".tmpl") > 0 ? tmpl : tmpl + ".tmpl";
        grab(template, collections, function(tmpHtml) {
            if (after_render) after_render(tmpHtml)
        })
    }

    function grab(tmpl, replacements, callback) {
        var template = Handlebars.templates[tmpl],
            replaced, tmpHtml;
        if (!template) {
            ajaxLoad(tmpl, function() {
                console.log("Loaded Template -- ", tmpl);
                grab(tmpl, replacements, callback)
            })
        } else {
            replaced = $.extend({}, _language, replacements), tmpHtml = template(replaced);
            callback(tmpHtml)
        }
    }

    function ajaxLoad(tmpl, grab) {
        var url = "/templates/" + tmpl,
            template;
        $.ajax({
            url: url
        }).success(function(source, textStatus) {
            template = Handlebars.compile(source);
            Handlebars.templates[tmpl] = template;
            if (Handlebars.templates[tmpl]) {
                grab()
            }
        }).fail(function(x, t, message) {
            if (t === "timeout") {
                throw new Error("Load Error (" + url + "): Timed out")
            } else {
                throw new Error("Load Error (" + url + "): " + message);
                BASE.tell("loadingFailed")
            }
        })
    }
    return {
        begin: begin,
        from_template: from_template,
        partial: partial,
        view: view,
        t: t,
        getLanguageCode: getLanguageCode,
        determineLanguage: determineLanguage,
        switchLanguage: switchLanguage,
        load_language: load_language,
        setAvailableLanguages: setAvailableLanguages
    }
}(jQuery);
var BASE = BASE || {};
BASE.router = function($) {
    "use strict";
    var _$window, _path, _view, _id, _silence = false,
        _useHash = false;
    $(window).on("popstate", function() {
        if (_useHash) return;
        if (!_silence) route();
        if (_silence) _silence = false
    });
    $(window).on("hashchange", function() {
        if (!_useHash) return;
        if (!_silence) hashRoute();
        if (_silence) _silence = false
    });

    function add(route, callback) {
        crossroads.addRoute(route, callback)
    }

    function root(callback) {
        crossroads.addRoute("/", callback);
        crossroads.bypassed.add(noMatch);
        route()
    }

    function noMatch() {
        path("/")
    }

    function route(force) {
        _path = window.location.pathname;
        _silence = false;
        BASE.events.tell("view_change");
        crossroads.parse(_path)
    }

    function hashRoute() {
        _path = window.location.hash.slice(1);
        _silence = false;
        BASE.events.tell("view_change");
        crossroads.parse(_path)
    }

    function updateHash(newHash, silence) {
        newHash = "#" + newHash;
        if (window.location.hash != newHash) {
            window.location.hash = newHash;
            if (silence) _silence = true
        }
    }

    function path(newPath, silence) {
        if (_useHash) {
            updateHash(newPath, silence);
            return false
        }
        if (JAM._password) newPath += JAM._password;
        if (window.location.pathname != newPath) {
            window.history.pushState(null, null, newPath);
            if (silence) _silence = true;
            route()
        }
    }
    return {
        add: add,
        root: root,
        updateHash: updateHash,
        path: path
    }
}(jQuery);
JAM.namespace("controller").select = function($) {
    "use strict";
    var _$main, _$startButton, _$window, _instruments, _instrument, _currentNum, _currentInst, _sessionId, _previousNum, _loadedLength = 0,
        _previewSwiffys = {},
        _swfIsPlaying = false,
        _disabled = {},
        _actionLock = false,
        _enterLock = false,
        _chev;

    function init(session) {
        var $prev = $("#carousel-prev"),
            $next = $("#carousel-next"),
            $current = $("#carousel-current"),
            $swiffyHolder = $("#carousel-swiffy"),
            $dock = $("#carousel-list"),
            $dockItem, $dockItems, $nickname = $("#nickname"),
            $nicknameBox = $("#nickname-box"),
            $taken_nickname = $("#taken-nickname"),
            $bad_nickname = $("#bad-nickname"),
            $chevron = $("#chevron-select"),
            $label = $("#nickname-label"),
            $window = $(window),
            _count, last, mid, dockWidth = 0,
            dockCenter = 0,
            itemWidth = 0,
            speed = 700,
            disabled = false,
            minHeight = 650,
            windowHeight = $window.height() > 660 ? $window.height() : minHeight,
            swiffyHeight = windowHeight * .4,
            swiffyWidth = swiffyHeight / 550 * 800,
            cssFiles = [],
            beingPlayed = false,
            previewTimeout = 10,
            playSampleTimeout = 20,
            playingOutro = false,
            middle = 9,
            delay = 1100,
            next = 150,
            dockSpeed = 550,
            _loadedSamples = [],
            nicknameSignal = false,
            _first = true,
            viewTime = Date.now();
        _enterLock = false;
        _instruments = JAM.instruments.switcher.getInstruments();
        _sessionId = session;
        _instrument = null;
        _currentNum = null;
        _currentInst = null;
        _previousNum = null;
        _loadedLength = 0;
        _previewSwiffys = {};
        _disabled = {};
        _actionLock = true;
        JAM.dmaf.dispatch("preload");
        _$startButton = $("#submit-instrument");
        _count = _instruments.length;
        last = _instruments.length - 1;
        mid = Math.floor(_count / 2);
        _currentNum = mid;
        _currentInst = _instruments[_currentNum];
        _$window = $(window);
        JAM.started = true;
        JAM.dmaf.dispatch("loadSample", {
            instrument: _currentInst.ident
        });
        _loadedSamples.push(_currentInst.ident);
        $swiffyHolder.css({
            width: swiffyWidth,
            height: swiffyHeight,
            left: 0,
            top: 0
        });
        _$window.on("resize.select", function() {
            windowHeight = $window.height() > 660 ? $window.height() : minHeight;
            swiffyHeight = windowHeight * .4;
            swiffyWidth = swiffyHeight / 550 * 800;
            $swiffyHolder.css({
                width: swiffyWidth,
                height: swiffyHeight,
                left: 0,
                top: 0
            })
        });
        $swiffyHolder.on("click", function() {
            selectInstrument()
        });
        $nickname.focus(function() {
            $nickname.val("");
            $nickname.data("placeholder", $nickname.attr("placeholder"));
            $nickname.attr("placeholder", "");
            $bad_nickname.hide();
            $taken_nickname.hide()
        }).blur(function() {
            var place = $nickname.data("placeholder");
            $nickname.attr("placeholder", place)
        });
        _chev = new JAM.model.Chevron($chevron, 30, true);
        $nicknameBox.tween({
            opacity: 1
        }, 200, TWEEN.Easing.Linear.None, false, 1800).start();
        $label.tween({
            opacity: 1
        }, 200, TWEEN.Easing.Linear.None, false, 1500).start();
        switchTo(_currentNum);
        $current.tween({
            opacity: 1
        }, 200, TWEEN.Easing.Linear.None, false, 1e3).start();

        function playSample(instrument) {
            if (_swfIsPlaying) return false;
            _swfIsPlaying = true;
            var swf = _previewSwiffys[_currentNum];
            previewTimeout = setTimeout(function() {
                _swfIsPlaying = false
            }, 5500);
            if (playingOutro) return false;
            if (typeof swf != "undefined") {
                swf.loop()
            }
            JAM.dmaf.dispatch("stopPreview");
            JAM.dmaf.dispatch("startPreview", {
                instrument: instrument
            })
        }

        function switchTo(current) {
            scaleOut(function() {
                _currentInst = _instruments[current || _currentNum];
                startSwiffy()
            })
        }

        function is_loaded(num) {
            if (typeof _previewSwiffys[num] === "undefined") {
                return false
            }
            return true
        }

        function findUnloaded(num, direction) {
            var next = num + direction,
                ident;
            if (_loadedLength >= _instruments.length) {
                return false
            }
            if (next >= _instruments.length) {
                next = 0
            }
            if (next < 0) {
                next = _instruments.length - 1
            }
            if (!is_loaded(next)) {
                ident = _instruments[next].ident;
                _previewSwiffys[next] = new JAM.model.Swiffy(_instruments[next].preview, $swiffyHolder);
                if (_loadedSamples.indexOf(ident) == -1) {
                    JAM.dmaf.dispatch("loadSample", {
                        instrument: ident
                    });
                    _loadedSamples.push(ident)
                }
                _loadedLength++;
                return num
            } else {
                findUnloaded(next, direction)
            }
        }

        function startSwiffy() {
            _swfIsPlaying = true;
            clearTimeout(previewTimeout);
            clearTimeout(playSampleTimeout);
            if (is_loaded(_currentNum)) {
                _previewSwiffys[_currentNum].start();
                afterLoaded();
                findUnloaded(_currentNum, -1);
                findUnloaded(_currentNum, 1)
            } else {
                _previewSwiffys[_currentNum] = new JAM.model.Swiffy(_currentInst.preview, $swiffyHolder, function(swiffy) {
                    swiffy.start();
                    if (_loadedSamples.indexOf(_currentInst.ident) == -1) {
                        JAM.dmaf.dispatch("loadSample", {
                            instrument: _currentInst.ident
                        });
                        _loadedSamples.push(_currentInst.ident)
                    }
                    afterLoaded();
                    findUnloaded(_currentNum, -1);
                    findUnloaded(_currentNum, 1)
                });
                _loadedLength++
            }
            _previousNum = _currentNum
        }

        function afterLoaded() {
            var isDisabled = typeof _disabled[_currentInst.ident] !== "undefined";
            $("#select-" + _currentNum).addClass("active");
            if (isDisabled) {
                currentName(_currentInst, true);
                _$startButton.addClass("disabled");
                if (_first) {
                    _first = false;
                    var moveBy = findNextAvailable();
                    _currentNum += moveBy;
                    setTimeout(function() {
                        jumpRight(moveBy)
                    }, 500 * moveBy + 1500)
                }
            } else {
                _first = false;
                JAM.controller.session.updateInstrument(_currentInst.ident);
                currentName(_currentInst);
                _$startButton.removeClass("disabled");
                beingPlayed = false
            }
            playSampleTimeout = setTimeout(function() {
                _swfIsPlaying = false;
                _actionLock = false;
                playSample(_currentInst.ident)
            }, 1400)
        }

        function findNextAvailable() {
            var _moveBy = 1;
            for (var i = 0; i < 3; i++) {
                var inst = _instruments[_currentNum + _moveBy].ident;
                if (typeof _disabled[inst] !== "undefined") _moveBy++;
                else i = 10
            }
            return _moveBy
        }

        function cycleRight() {
            if (_currentNum < last) {
                _currentNum++
            } else {
                _currentNum = 0
            }
            jumpRight(1)
        }

        function cycleLeft() {
            if (_currentNum > 0) {
                _currentNum--
            } else {
                _currentNum = last
            }
            jumpLeft(-1)
        }

        function goRight() {
            if (!disabled && !_actionLock) {
                disabled = true;
                _actionLock = true;
                cycleRight();
                setTimeout(function() {
                    disabled = false
                }, speed + 100)
            }
        }

        function goLeft() {
            if (!disabled && !_actionLock) {
                disabled = true;
                _actionLock = true;
                cycleLeft();
                setTimeout(function() {
                    disabled = false
                }, speed + 100)
            }
        }
        $next.on("click", function(e) {
            goRight();
            trackViewTime()
        });
        $prev.on("click", function(e) {
            goLeft();
            trackViewTime()
        });
        $(document).on("keydown.select", function(e) {
            var code = BASE.utils.keyToString(e.keyCode);
            if (_actionLock) return;
            switch (code) {
                case "right":
                    goRight();
                    $("#carousel-next").addClass("active");
                    setTimeout(function() {
                        $("#carousel-next").removeClass("active")
                    }, 45);
                    break;
                case "left":
                    goLeft();
                    $("#carousel-prev").addClass("active");
                    setTimeout(function() {
                        $("#carousel-prev").removeClass("active")
                    }, 45);
                    break
            }
        });

        function scaleOut(callback, time) {
            var time = time || 1e3;
            if (typeof _previousNum != "undefined" && _previewSwiffys[_previousNum]) {
                playingOutro = true;
                JAM.dmaf.dispatch("stopPreview");
                _previewSwiffys[_previousNum].outro();
                $(".active").removeClass("active");
                setTimeout(function() {
                    playingOutro = false;
                    if (callback) callback()
                }, time)
            } else {
                $swiffyHolder.empty();
                if (callback) callback()
            }
        }

        function jumpRight(dist) {
            var slice = $dock.find("li").slice(0, dist);
            slice.each(function() {
                var $item = $(this),
                    $newItem = $item.clone(),
                    index = $item.data("indexer");
                $newItem.data("indexer", index);
                $item.animate({
                    width: 0
                }, speed);
                setTimeout(function() {
                    $item.remove()
                }, speed);
                $newItem.css("width", 0);
                $newItem.appendTo($dock);
                $newItem.animate({
                    width: 175
                }, speed)
            });
            setTimeout(function() {
                switchTo(_currentNum)
            }, speed)
        }

        function jumpLeft(dist) {
            var slice = $dock.find("li").slice(dist),
                newItems = [];
            $(slice.get().reverse()).each(function() {
                var $item = $(this),
                    $newItem = $item.clone(),
                    index = $item.data("indexer");
                $newItem.data("indexer", index);
                $newItem.css("width", 0);
                $newItem.prependTo($dock);
                $newItem.animate({
                    width: 175
                }, speed);
                setTimeout(function() {
                    $item.remove()
                }, speed)
            });
            setTimeout(function() {
                switchTo(_currentNum)
            }, speed)
        }
        $dock.on("click", ".dock_item", function() {
            var $this = $(this),
                index = $this.data("indexer"),
                dist = index - _currentNum,
                active = $this.hasClass("active");
            if (drag || _actionLock || active) return;
            _actionLock = true;
            stopScroll();
            trackViewTime();
            timeout = setTimeout(function() {
                reCenter(1200, true)
            }, snapBackdelay);
            if (dist <= -10) {
                dist = index + _count - _currentNum
            }
            if (dist >= 10) {
                dist = index - _count - _currentNum
            }
            _currentNum = _currentNum + dist;
            if (_currentNum >= _count) {
                _currentNum = _currentNum - _count
            }
            if (_currentNum < 0) {
                _currentNum = _count + dist
            }
            if (dist > 0) {
                jumpRight(dist)
            } else if (dist < 0) {
                jumpLeft(dist)
            }
        });
        var min = 275,
            prevX, leftScroll, rightScroll, delay = 5,
            move = 2;
        var windowWidth = _$window.width(),
            $list = $("carousel-list"),
            startDrag = false,
            drag = false,
            dragTimeout, marginLeft = 0,
            scrolledDist = 0,
            timeout, snapBackdelay = 600,
            isTweening, isScrolling = false;
        $dock.on("mousedown", function(event) {
            startDrag = true
        });
        _$window.on("mouseup", function(event) {
            startDrag = false;
            dragTimeout = setTimeout(function() {
                drag = false
            }, 100)
        });
        $dock.on("mouseenter", function(event) {
            startEnterFrame();
            clearTimeout(timeout)
        });
        $dock.on("mousemove", function(event) {
            var x = event.pageX,
                delta = prevX - x || 0;
            mouseX = x;
            prevX = x;
            if (startDrag) {
                clearTimeout(dragTimeout);
                drag = true;
                slide(delta);
                return false
            }
            stopScroll()
        });
        var enterFrameTicker;
        var moveBy;
        var mouseX = 0;
        var dur = 500;
        var factor = dur / 1e3;

        function startEnterFrame() {
            clearTimeout(enterFrameTicker);
            enterFrameTicker = setInterval(function() {
                if (drag || _actionLock) return;
                if (mouseX < min && !rightScroll) {
                    moveBy = (mouseX - min) * factor;
                    slide(moveBy, dur);
                    return false
                } else if (mouseX > windowWidth - min && !leftScroll) {
                    moveBy = -(windowWidth - mouseX - min) * factor;
                    slide(moveBy, dur);
                    return false
                }
            }, dur)
        }
        $dock.on("mouseleave", function(event) {
            clearInterval(enterFrameTicker);
            timeout = setTimeout(function() {
                reCenter(1200, true)
            }, snapBackdelay)
        });

        function reCenter(time, tween, callback) {
            stopScroll();
            scrolledDist = 0;
            if (tween) {
                if (isTweening) return;
                isTweening = true;
                $dock.tween({
                    left: scrolledDist
                }, time, TWEEN.Easing.Quadratic.Out, function() {
                    isTweening = false;
                    if (callback) callback()
                })
            } else {
                $dock.animate({
                    left: scrolledDist
                }, time, callback)
            }
        }

        function scrollLeft() {
            leftScroll = setInterval(function() {
                slide(move)
            }, delay)
        }

        function scrollRight() {
            rightScroll = setInterval(function() {
                slide(-move)
            }, delay)
        }

        function stopScroll() {
            clearInterval(leftScroll);
            clearInterval(rightScroll);
            leftScroll = false;
            rightScroll = false
        }

        function slide(delta, _delay) {
            if (isTweening) return;
            var hBounds = -marginLeft;
            if (scrolledDist <= hBounds && scrolledDist >= -hBounds) {
                scrolledDist = scrolledDist - delta;
                scrolledDist = scrolledDist < 0 ? Math.max(-hBounds, scrolledDist) : Math.min(hBounds, scrolledDist);
                var dlay = _delay || delay;
                var override = _delay != undefined ? true : false;
                if (!isScrolling || override) {
                    isScrolling = true;
                    $dock.tween({
                        left: scrolledDist
                    }, dlay, TWEEN.Easing.Linear.None, function() {
                        isScrolling = false
                    })
                }
            }
        }
        BASE.render.view("instrument_select", function(output) {
            $dock.append(output);
            $dockItems = $dock.find(".dock_item");
            $dockItem = $dockItems.first();
            itemWidth = $dockItem.outerWidth(true);
            dockWidth = _count * itemWidth;
            $dock.width(dockWidth);
            centerDock();
            $dockItems.each(function(index) {
                var $this = $(this);
                $this.attr("id", "select-" + index);
                $this.data("indexer", index);
                if (index == mid) {
                    $this.addClass("active")
                }
            });
            listenClients();
            middle = Math.floor($dockItems.length / 2);
            $($dockItems[middle]).tween({
                top: 0
            }, dockSpeed, TWEEN.Easing.Cubic.Out, false, delay).start();
            setTimeout(function() {
                dockIn(middle, 1);
                dockIn(middle, -1)
            }, delay + next)
        }, {
            instruments: _instruments
        });

        function dockIn(index, dir, reverse) {
            var el = index + dir,
                to = reverse ? 200 : 0,
                $this = $($dockItems[el]);
            if (!$this.length) return false;
            $this.tween({
                top: to
            }, dockSpeed, TWEEN.Easing.Cubic.Out, false, false).start();
            setTimeout(function() {
                dockIn(el, dir, reverse)
            }, next)
        }

        function centerDock() {
            dockCenter = (dockWidth - _$window.width()) / 2;
            marginLeft = -1 * dockCenter;
            $dock.css("margin-left", Math.max(-1100, -1 * dockCenter))
        }
        _$window.on("resize", function() {
            windowWidth = _$window.width();
            centerDock()
        });

        function getDefaultNickname() {
            return JAM.controller.session.unusedDefault()
        }

        function selectInstrument(noroute) {
            trackViewTime();
            clearInterval(enterFrameTicker);
            var instrument = _instruments[_currentNum].ident,
                nickname = $nickname.val();
            if (beingPlayed || _enterLock) return false;
            if (_$startButton.hasClass("disabled")) return false;
            _enterLock = true;
            _$startButton.addClass("disabled");
            if (nickname.length && JAM.controller.session.checkNickname(nickname)) {
                $taken_nickname.show();
                $nickname.one("click", function() {
                    $taken_nickname.hide();
                    _$startButton.removeClass("disabled");
                    $nickname.val("")
                });
                _enterLock = false;
                return false
            }
            if (!nickname.length) {
                nickname = getDefaultNickname()
            }
            JAM.broadcaster.sendEvent("changeName", {
                name: nickname
            }, true);
            if (noroute) {
                JAM.dmaf.dispatch("stopPreview");
                $(document).off(".select");
                BASE.off(".select");
                BASE.listen("badName.select_noroute", function() {
                    JAM.broadcaster.sendEvent("changeName", {
                        name: getDefaultNickname()
                    }, true);
                    BASE.off("badName.select_noroute")
                });
                return
            }
            BASE.listen("badName.select", function() {
                $bad_nickname.show();
                $nickname.blur();
                $nickname.one("click", function() {
                    $bad_nickname.hide();
                    _$startButton.removeClass("disabled");
                    $nickname.val("")
                });
                _enterLock = false
            });
            if (nicknameSignal) nicknameSignal.detach();
            nicknameSignal = JAM.controller.session.myClient().nicknameChanged.addOnce(function() {
                scaleOut();
                $next.tween({
                    opacity: 0
                }, 50, TWEEN.Easing.Cubic.Out).start();
                $prev.tween({
                    opacity: 0
                }, 50, TWEEN.Easing.Cubic.Out).start();
                $nicknameBox.tween({
                    opacity: 0
                }, 50, TWEEN.Easing.Cubic.Out).start();
                $current.find("h3").tween({
                    opacity: 0
                }, 100, TWEEN.Easing.Cubic.Out).start();
                $current.find("h2").tween({
                    opacity: 0
                }, 150, TWEEN.Easing.Cubic.Out).start();
                $label.tween({
                    opacity: 0
                }, 150, TWEEN.Easing.Cubic.Out).start();
                if (_chev) _chev.pacman(true, 300);
                dockSpeed = dockSpeed / 2;
                $dockItems = $dock.find(".dock_item");
                $($dockItems[middle]).tween({
                    top: 200
                }, dockSpeed, TWEEN.Easing.Cubic.Out).start();
                setTimeout(function() {
                    dockIn(middle, 1, 200);
                    dockIn(middle, -1, 200)
                }, next);
                setTimeout(function() {
                    if (typeof _previousNum != "undefined") {
                        _previewSwiffys[_previousNum].stop()
                    }
                    if (_previewSwiffys[_currentNum]) {
                        _previewSwiffys[_currentNum].stop()
                    }
                    BASE.view.tell("spinner");
                    BASE.router.path("/session/" + _sessionId + "/");
                    $(document).off(".select");
                    BASE.off(".select")
                }, 800)
            })
        }
        $(document).on("keydown.select", function(e) {
            var code = BASE.utils.keyToString(e.keyCode);
            if (code === "enter") {
                selectInstrument()
            }
        });
        _$startButton.on("mousedown", function(event) {
            selectInstrument();
            clearTimeout(playSampleTimeout);
            JAM.dmaf.dispatch("stopPreview");
            event.preventDefault()
        });
        center();
        BASE.utils.preload(["http://chrome-jam-static.commondatastorage.googleapis.com/img/interface/session_header.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/interface/all_change.png", "http://chrome-jam-static.commondatastorage.googleapis.com/img/interface/all_triangle.png"]);

        function center() {
            var $holder = $("#carousel-holder"),
                $window = $(window),
                topHeight = 0,
                bottomHeight = 30,
                vertCenter = function() {
                    var calc = $window.height() / 2 - $holder.height() / 2 - bottomHeight,
                        top = calc >= topHeight ? calc : topHeight;
                    $holder.css({
                        "margin-top": top
                    })
                };
            $window.on("resize", function() {
                vertCenter()
            });
            vertCenter()
        }

        function currentName(currentInst, taken) {
            var $current = $("#carousel-current"),
                inst = currentInst || _currentInst;
            $current.html("");
            $current.append("<h3 data-t='" + inst.subheader + "'>" + BASE.render.t(inst.subheader) + "</h3>").append("<h2 data-t='" + inst.name + "' class='" + inst.ident + " lockup'>" + BASE.render.t(inst.name) + "</h2>");
            var $notification = $("#being-played");
            var $nickname_field = $("#nickname-box");
            if (taken) {
                $nickname_field.hide();
                var tmplNickname = "[nickname]",
                    tmplInstrument = "[instrument]",
                    instrument = BASE.render.t(inst.fullname),
                    clientID = _disabled[inst.ident].ID,
                    player = JAM.controller.session.getClient(clientID),
                    nickname;
                if (!player) {
                    return
                }
                nickname = player.player_nickname;
                $notification.html("<h3>" + BASE.render.t("being_played") + "</h3>");
                $notification.text($notification.text().replace(tmplNickname, BASE.utils.titleCase(nickname)));
                $notification.text($notification.text().replace(tmplInstrument, BASE.utils.titleCase(instrument)));
                $notification.show()
            } else {
                $nickname_field.show();
                $notification.hide()
            }
        }

        function listenClients() {
            JAM.controller.session.getClients().forEach(function(client) {
                var instrument = client ? client.player_instrument : false,
                    $el;
                if (instrument) {
                    $el = $(".dock_item." + instrument);
                    $el.addClass("disabled");
                    if (client.player_id != JAM.controller.session.myId()) {
                        _disabled[instrument] = {
                            ID: client.player_id
                        }
                    }
                    if (typeof _disabled[_currentInst.ident] !== "undefined") {
                        currentName(_currentInst, true);
                        _$startButton.addClass("disabled")
                    }
                }
            });
            BASE.listen("clientChange.select", function(event) {
                var instrument = event.player_instrument,
                    $el;
                if (instrument) {
                    $el = $(".dock_item." + instrument);
                    $el.removeClass("disabled");
                    if (typeof _disabled[_currentInst.ident] !== "undefined") {
                        JAM.controller.session.updateInstrument(_currentInst.ident);
                        currentName(_currentInst);
                        _$startButton.removeClass("disabled")
                    }
                    _disabled[instrument] = undefined
                }
            });
            BASE.listen("clientUpdate.select, clientConnect.select", function(event) {
                var instrument = event.player_instrument,
                    player_id = event.player_id,
                    $el;
                if (instrument) {
                    $el = $(".dock_item." + instrument);
                    $el.addClass("disabled");
                    _disabled[instrument] = {
                        ID: player_id
                    };
                    if (typeof _disabled[_currentInst.ident] !== "undefined") {
                        currentName(_currentInst, true);
                        _$startButton.addClass("disabled")
                    }
                }
            });
            BASE.listen("clientRemove.select", function(event) {
                var instrument = event.player_instrument,
                    $el, index;
                if (instrument) {
                    $el = $(".dock_item." + instrument);
                    $el.removeClass("disabled");
                    if (typeof _disabled[_currentInst.ident] !== "undefined") {
                        currentName(_currentInst);
                        _$startButton.removeClass("disabled")
                    }
                    _disabled[instrument] = undefined
                }
            })
        }

        function trackViewTime() {
            var time = Date.now() - viewTime;
            gaq.push(["_trackEvent", "Instrument", "Select", BASE.utils.prettyName(_currentInst.ident), time]);
            viewTime = Date.now()
        }

        function loadPreview(count) {
            var inst = _instruments[_currentNum];
            if (typeof _previewSwiffys[_currentNum] === "undefinded") {
                _previewSwiffys[_currentNum] = new JAM.model.Swiffy(inst.preview)
            }
        }
    }
    return init
}(jQuery);
JAM.namespace("controller").session = function($) {
    "use strict";
    var _instrument, _nickname, _session, _sessionId, _clientId, _clients = {},
        _clientsIDs = [],
        _disconnectedClients = {},
        _full = false,
        _tempo, _key, _scale, _loaded = false,
        _$local, _chord, _social, _sessionTimeout, _chat, _share, _default_nicknames, _effects = [0, 0],
        _warnLatency = 100,
        _warned = false,
        _startedAt, _amLeader = false,
        _inviteTimeout, _debugLatency, _latencyMid = false,
        _latencyHigh = false,
        _latencyExtreme = false;

    function start(sessionId, callback, errorCallback) {
        var data = {};
        _instrument = null;
        _nickname = null;
        _sessionId = null;
        _warned = false;
        _amLeader = false;
        _latencyMid = false;
        _latencyHigh = false;
        _latencyExtreme = false;
        _startedAt = Date.now();
        _default_nicknames = [BASE.render.t("default_nickname_1"), BASE.render.t("default_nickname_2"), BASE.render.t("default_nickname_3"), BASE.render.t("default_nickname_4")];
        _default_nicknames.sort(function() {
            return .5 - Math.random()
        });
        clearTimeout(_sessionTimeout);
        if (sessionId) {
            data.session = sessionId
        }
        _instrument = JAM.instruments.switcher.currentInstrument() || "Not Picked";
        _nickname = "Not Set";
        BASE.tell("connecting");
        $.ajax("/start", {
            data: data,
            dataType: "json",
            success: function(data) {
                _sessionId = data.session;
                _clientId = data.client;
                JAM.manager.broadcaster.init();
                JAM.manager.broadcaster.open(_sessionId, _clientId, function() {
                    callback(_sessionId)
                })
            },
            error: function(error) {
                console.log("Start error:", error.statusText);
                if (_sessionId || sessionId) {
                    BASE.router.path("/error/" + (_sessionId || sessionId) + "/")
                } else {
                    BASE.router.path("/error/")
                } if (errorCallback) {
                    errorCallback(error);
                    return
                }
            }
        });
        BASE.listen("closed.session", function() {
            if (_session) {
                BASE.router.path("/rejoin/" + _sessionId + "/")
            } else {}
        })
    }

    function clients() {
        _clientId = null;
        _clients = {};
        _clientsIDs = [];
        _disconnectedClients = {};
        _full = false;
        _tempo = null;
        _key = null;
        _scale = null;
        _loaded = false;
        _chord = null;
        _social = null;
        BASE.off("sessionFull.session clientConnect.session clientUpdate.session clientDisconnect.session");
        BASE.listen("sessionFull.session", function() {
            _full = true
        });
        BASE.listen("clientConnect.session", function(event) {
            _clients[event.player_id] = {
                player_id: event.player_id,
                player_nickname: event.player_nickname,
                player_instrument: event.player_instrument,
                is_leader: event.is_leader
            };
            _clientsIDs.push(event.player_id);
            if (event.player_id == _clientId) {
                if (event.is_leader) {
                    JAM.dmaf.dispatch("bandLeader");
                    _amLeader = true
                } else {
                    JAM.dmaf.dispatch("notBandLeader");
                    _amLeader = false
                }
            }
            BASE.tell({
                type: "addedClient",
                player_id: event.player_id
            });
            JAM.dmaf.dispatch("players", _clientsIDs.length);
            if (_amLeader && _clientsIDs.length > 1) {
                JAM.dmaf.dispatch("switchTempo", {
                    tempo: JAM._tempo
                });
                JAM.dmaf.dispatch("switchKey", {
                    key: JAM._key
                });
                JAM.dmaf.dispatch("switchScale", {
                    scale: JAM._scale
                });
                JAM.dmaf.dispatch("switchChord", {
                    chord: JAM._chord
                });
                JAM.manager.broadcaster.sync()
            }
        });
        BASE.listen("clientUpdate.session", function(event) {
            BASE.tell({
                type: "clientChange",
                player_id: event.player_id,
                player_instrument: _clients[event.player_id].player_instrument,
                player_nickname: _clients[event.player_id].player_nickname
            });
            if (_clients[event.player_id].is_leader != event.is_leader) {
                BASE.tell({
                    type: "newLeader",
                    player_id: event.player_id,
                    player_instrument: _clients[event.player_id].player_instrument,
                    player_nickname: _clients[event.player_id].player_nickname
                })
            }
            _clients[event.player_id] = {
                player_id: event.player_id,
                player_nickname: event.player_nickname,
                player_instrument: event.player_instrument,
                is_leader: event.is_leader
            };
            if (event.player_id == _clientId) {
                if (event.is_leader) {
                    JAM.dmaf.dispatch("bandLeader");
                    _amLeader = true
                } else {
                    JAM.dmaf.dispatch("notBandLeader");
                    _amLeader = false
                }
            }
        });
        BASE.listen("clientDisconnect.session", function(event) {
            var client = _clients[event.player_id],
                instrument = client.player_instrument,
                nickname = client.player_nickname;
            BASE.tell({
                type: "clientRemove",
                player_id: event.player_id,
                player_instrument: instrument,
                player_nickname: nickname
            });
            if (instrument) JAM.dmaf.dispatch("disconnected", {
                instrument: instrument
            });
            _disconnectedClients[event.player_id] = _clients[event.player_id];
            delete _clients[event.player_id];
            BASE.utils.removeItem(_clientsIDs, event.player_id);
            JAM.dmaf.dispatch("players", _clientsIDs.length);
            if (_amLeader) {
                JAM.manager.broadcaster.sync()
            }
        });
        BASE.listen("tempo.session", function(event) {
            _tempo = event.tempo
        });
        BASE.listen("key.session", function(event) {
            _key = event.key
        });
        BASE.listen("scale.session", function(event) {
            _scale = event.scale
        });
        BASE.listen("chord.session", function(event) {
            _chord = event.chord
        });
        BASE.listen("joinedSession.session", function(event) {
            if (_amLeader && _clientsIDs.length > 1) {
                JAM.dmaf.dispatch("switchTempo", {
                    tempo: JAM._tempo
                });
                JAM.dmaf.dispatch("switchKey", {
                    key: JAM._key
                });
                JAM.dmaf.dispatch("switchScale", {
                    scale: JAM._scale
                });
                JAM.dmaf.dispatch("switchChord", {
                    chord: JAM._chord
                })
            }
        })
    }

    function init(id) {
        _session = new JAM.model.JamSession(_instrument, _clientId, getClients());
        _$local = $("#instrument_local");
        var $remotes = $("#remotes .instrument_remote.invite"),
            $header = $("#header"),
            pause = 4e3,
            secondary = 800,
            delay = 1e3,
            wait = 500;
        _session.load_instrument();
        _loaded = true;
        _sessionTimeout = setTimeout(function() {
            $header.addClass("full");
            if (_session) _session.setLoaded();
            $remotes.each(function() {
                var $el = $(this);
                setTimeout(function() {
                    $el.find(".background_triangle_holder").removeClass("before_load");
                    $el.find(".bottom_bar").removeClass("before_load");
                    setTimeout(function() {
                        $el.find(".plusInvite").removeClass("before_load");
                        $("#chat-btn").removeClass("before_load");
                        setTimeout(function() {
                            $header.find("#header-controls").removeClass("down")
                        }, 1200)
                    }, secondary)
                }, delay);
                delay += wait
            });
            _inviteTimeout = setTimeout(function() {
                var $holder = $("#remotes-holder"),
                    hidden = $holder.hasClass("hide");
                if (_clientsIDs.length >= 4) return;
                if (hidden) {
                    $holder.removeClass("hide")
                }
                $remotes.first().addClass("hovered");
                setTimeout(function() {
                    $remotes.first().removeClass("hovered");
                    if (hidden) {
                        $holder.addClass("hide")
                    }
                }, 3e3)
            }, 12e4)
        }, pause);
        JAM.broadcaster.dispatch("joinedSession");
        BASE.off("latency.session adjustLatency.session");
        BASE.listen("latency.session adjustLatency.session", function() {
            checkLatency()
        })
    }

    function myId() {
        return _clientId
    }

    function getSession() {
        return _session
    }

    function getClientIDs() {
        return _clientsIDs
    }

    function getClient(id) {
        return _clients[id]
    }

    function getClients() {
        var arr = [];
        _clientsIDs.forEach(function(clientID) {
            arr.push(_clients[clientID])
        });
        return arr
    }

    function is_full() {
        return _full || _clients.length >= 4
    }

    function is_empty() {
        return _clientsIDs.length < 2
    }

    function getDisconnectedClient(id) {
        return _disconnectedClients[id]
    }

    function checkNickname(name) {
        var clients = getClients(),
            result = false,
            nickname = name.toLowerCase();
        clients.forEach(function(client) {
            if (client.player_nickname && client.player_nickname.toLowerCase() === nickname) {
                result = true
            }
        });
        return result
    }
    window.onbeforeunload = function() {
        var time = JAM.startTime ? (new Date).getTime() - JAM.startTime : 0;
        gaq.push(["_trackEvent", "Session", "Closed Window", "Total JAMMING duration", time]);
        if (JAM.dmaf) {
            JAM.dmaf.dispatch("switchPattern", {
                pattern: "off"
            });
            JAM.dmaf.dispatch("lockHihatOff")
        }
    };

    function close() {
        if (_session) {
            BASE.off(".session");
            _session.close();
            _chat.destroy();
            _share.destroy();
            _session = null;
            _chat = null;
            clearTimeout(_inviteTimeout)
        }
    }

    function setInstrument(inst) {
        _instrument = inst;
        if (_session) {
            _session.switch_instrument(_instrument);
            $("#current-instrument-holder").attr("class", _instrument)
        }
    }

    function updateInstrument(inst) {
        _instrument = inst
    }

    function releaseInstrument() {
        JAM.broadcaster.dispatch("releaseInstrument", {
            instrument: _instrument,
            id: _clientId
        }, true);
        _instrument = null
    }

    function getInstrument(inst) {
        return _instrument
    }

    function share() {
        _share = new JAM.model.Modal("share", 386, 321, function($modal, _modal) {
            var $link = $modal.find(".long_link"),
                $invites = $("#remotes .background_triangle, #remotes .plusInvite, #remotes .bottom_invite");
            $link.attr("value", JAM._shareLink);
            BASE.utils.shorten(JAM._shareLink, function(link) {
                $link.attr("value", link);
                $link.on("click", function() {
                    var $this = $(this);
                    $this.select()
                });
                $("#share_link").bind("copy", function() {
                    gaq.push(["_trackEvent", "Session", "Invite a Friend", "URL Copied"])
                });
                $("#share_link").on("keydown", function(event) {
                    event.stopPropagation()
                });
                var $twitter = $(".modal #twitter"),
                    $facebook = $(".modal #facebook"),
                    $gplus = $(".modal #gplus");
                _social = new JAM.model.Social($twitter, $facebook, $gplus, JAM._shareLink, "jamming")
            }, {
                linked: JAM._shareLink
            });
            $invites.on("click", function(event) {
                _share.open();
                gaq.push(["_trackEvent", "Session", "Invite a Friend", "Open"]);
                clearInterval(_inviteTimeout);
                var $shareLink = $("#share_link");
                $shareLink[0].focus();
                $shareLink.select();
                event.stopPropagation()
            })
        });
        _share.onClosed = function() {
            gaq.push(["_trackEvent", "Session", "Invite a Friend", "Close"]);
            $("#share_link").blur();
            document.getSelection().removeAllRanges()
        }
    }

    function checkLatency(showWarning, latency) {
        var warn, proMode = JAM.namespace("instruments").switcher.mode() == "pro",
            latency = latency || JAM.manager.broadcaster.getLatency();
        if (!_session || JAM.manager.tips.isTouring()) return;
        showWarning == undefined ? warn = true : warn = showWarning;
        if (latency > 100 && latency <= 300 && proMode) {
            if (warn && !_latencyMid) {
                JAM.controller.session.latencyError("latency_error_title", "stay_in_easy_top", "stay_in_easy_bottom");
                _latencyMid = true
            }
            BASE.tell({
                type: "high_latency",
                value: false
            });
            return true
        } else if (latency > 300 && latency <= 500) {
            if (warn && !_latencyHigh) {
                JAM.controller.session.latencyError("latency_error_title", "stay_in_easy_top", "stay_in_easy_bottom");
                _latencyHigh = true
            }
            BASE.tell({
                type: "high_latency",
                value: true
            });
            return true
        } else if (latency > 500) {
            if (warn && !_latencyExtreme) {
                JAM.controller.session.latencyError("latency_error_title_extreme", "latency_extreme_top", "latency_extreme_bottom", true);
                _latencyExtreme = true
            }
            BASE.tell({
                type: "high_latency",
                value: true
            });
            return true
        }
        BASE.tell({
            type: "high_latency",
            value: false
        });
        return false
    }

    function latencyError(title, msg1, msg2, own) {
        var _$msg1, _$msg2, _$title, _$own;
        if (_warned) {
            _$title = $("#latency-title");
            _$msg1 = $("#latency-msg-t");
            _$msg2 = $("#latency-msg-b");
            _$own = $("#own");
            _$title.html(BASE.render.t(title));
            _$title.data("t", title);
            _$msg1.html("<p data-t='" + msg1 + "'>" + BASE.render.t(msg1) + "</p>");
            _$msg2.html("<p data-t='" + msg2 + "'>" + BASE.render.t(msg2) + "</p>");
            if (own) {
                _$own.show()
            } else {
                _$own.hide()
            }
            _warned.open(false);
            return
        }
        _warned = new JAM.model.Modal("high_latency", 386, 150, function($modal, _modal) {
            _$title = $("#latency-title");
            _$msg1 = $("#latency-msg-t");
            _$msg2 = $("#latency-msg-b");
            _$title.html(BASE.render.t(title));
            _$title.data("t", title);
            _$msg1.html("<p data-t='" + msg1 + "'>" + BASE.render.t(msg1) + "</p>");
            _$msg2.html("<p data-t='" + msg2 + "'>" + BASE.render.t(msg2) + "</p>");
            _$own = $("#own");
            _$own.on("click", function(e) {
                JAM.entered = true;
                JAM.manager.broadcaster.close();
                BASE.router.path("/select/");
                e.preventDefault()
            });
            if (own) {
                _$own.show()
            }
            _modal.open()
        })
    }

    function chat() {
        _chat = new JAM.model.Chat(_session, _clientId)
    }

    function getScale() {
        return _scale
    }

    function getTempo() {
        return _tempo
    }

    function getKey() {
        return _key
    }

    function getChord() {
        return _chord
    }

    function myClient() {
        return JAM.manager.broadcaster.onClient(_clientId)
    }

    function unusedDefault() {
        var nick = "";
        _default_nicknames.forEach(function(nickname) {
            if (!checkNickname(nickname)) {
                nick = nickname;
                return
            }
        });
        return nick
    }

    function isDefault(name) {
        var result = false;
        _default_nicknames.forEach(function(nickname) {
            if (nickname === name) {
                result = true
            }
        });
        return result
    }

    function myPlayer() {
        return getClient(_clientId)
    }

    function setLatency(val) {
        _debugLatency = val;
        DMAF.getCore().setLatency(_debugLatency);
        checkLatency();
        return _debugLatency
    }
    return {
        start: start,
        init: init,
        myId: myId,
        getSession: getSession,
        close: close,
        setInstrument: setInstrument,
        getInstrument: getInstrument,
        updateInstrument: updateInstrument,
        getClient: getClient,
        getClients: getClients,
        getClientIDs: getClientIDs,
        clients: clients,
        share: share,
        chat: chat,
        is_full: is_full,
        is_empty: is_empty,
        getDisconnectedClient: getDisconnectedClient,
        getChord: getChord,
        getTempo: getTempo,
        getScale: getScale,
        getKey: getKey,
        myClient: myClient,
        releaseInstrument: releaseInstrument,
        checkNickname: checkNickname,
        unusedDefault: unusedDefault,
        isDefault: isDefault,
        checkLatency: checkLatency,
        latencyError: latencyError,
        setLatency: setLatency,
        myPlayer: myPlayer
    }
}(jQuery);
(function(global) {
    var signals = {
        VERSION: "0.7.4"
    };

    function SignalBinding(signal, listener, isOnce, listenerContext, priority) {
        this._listener = listener;
        this._isOnce = isOnce;
        this.context = listenerContext;
        this._signal = signal;
        this._priority = priority || 0
    }
    SignalBinding.prototype = {
        active: true,
        params: null,
        execute: function(paramsArr) {
            var handlerReturn, params;
            if (this.active && !!this._listener) {
                params = this.params ? this.params.concat(paramsArr) : paramsArr;
                handlerReturn = this._listener.apply(this.context, params);
                if (this._isOnce) {
                    this.detach()
                }
            }
            return handlerReturn
        },
        detach: function() {
            return this.isBound() ? this._signal.remove(this._listener, this.context) : null
        },
        isBound: function() {
            return !!this._signal && !!this._listener
        },
        getListener: function() {
            return this._listener
        },
        _destroy: function() {
            delete this._signal;
            delete this._listener;
            delete this.context
        },
        isOnce: function() {
            return this._isOnce
        },
        toString: function() {
            return "[SignalBinding isOnce:" + this._isOnce + ", isBound:" + this.isBound() + ", active:" + this.active + "]"
        }
    };

    function validateListener(listener, fnName) {
        if (typeof listener !== "function") {
            throw new Error("listener is a required param of {fn}() and should be a Function.".replace("{fn}", fnName))
        }
    }
    signals.Signal = function() {
        this._bindings = [];
        this._prevParams = null
    };
    signals.Signal.prototype = {
        memorize: false,
        _shouldPropagate: true,
        active: true,
        _registerListener: function(listener, isOnce, listenerContext, priority) {
            var prevIndex = this._indexOfListener(listener, listenerContext),
                binding;
            if (prevIndex !== -1) {
                binding = this._bindings[prevIndex];
                if (binding.isOnce() !== isOnce) {
                    throw new Error("You cannot add" + (isOnce ? "" : "Once") + "() then add" + (!isOnce ? "" : "Once") + "() the same listener without removing the relationship first.")
                }
            } else {
                binding = new SignalBinding(this, listener, isOnce, listenerContext, priority);
                this._addBinding(binding)
            } if (this.memorize && this._prevParams) {
                binding.execute(this._prevParams)
            }
            return binding
        },
        _addBinding: function(binding) {
            var n = this._bindings.length;
            do {
                --n
            } while (this._bindings[n] && binding._priority <= this._bindings[n]._priority);
            this._bindings.splice(n + 1, 0, binding)
        },
        _indexOfListener: function(listener, context) {
            var n = this._bindings.length,
                cur;
            while (n--) {
                cur = this._bindings[n];
                if (cur._listener === listener && cur.context === context) {
                    return n
                }
            }
            return -1
        },
        has: function(listener, context) {
            return this._indexOfListener(listener, context) !== -1
        },
        add: function(listener, listenerContext, priority) {
            validateListener(listener, "add");
            return this._registerListener(listener, false, listenerContext, priority)
        },
        addOnce: function(listener, listenerContext, priority) {
            validateListener(listener, "addOnce");
            return this._registerListener(listener, true, listenerContext, priority)
        },
        remove: function(listener, context) {
            validateListener(listener, "remove");
            var i = this._indexOfListener(listener, context);
            if (i !== -1) {
                this._bindings[i]._destroy();
                this._bindings.splice(i, 1)
            }
            return listener
        },
        removeAll: function() {
            var n = this._bindings.length;
            while (n--) {
                this._bindings[n]._destroy()
            }
            this._bindings.length = 0
        },
        getNumListeners: function() {
            return this._bindings.length
        },
        halt: function() {
            this._shouldPropagate = false
        },
        dispatch: function(params) {
            if (!this.active) {
                return
            }
            var paramsArr = Array.prototype.slice.call(arguments),
                n = this._bindings.length,
                bindings;
            if (this.memorize) {
                this._prevParams = paramsArr
            }
            if (!n) {
                return
            }
            bindings = this._bindings.slice();
            this._shouldPropagate = true;
            do {
                n--
            } while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false)
        },
        forget: function() {
            this._prevParams = null
        },
        dispose: function() {
            this.removeAll();
            delete this._bindings;
            delete this._prevParams
        },
        toString: function() {
            return "[Signal active:" + this.active + " numListeners:" + this.getNumListeners() + "]"
        }
    };
    if (typeof define === "function" && define.amd) {
        define(signals)
    } else if (typeof module !== "undefined" && module.exports) {
        module.exports = signals
    } else {
        global["signals"] = signals
    }
})(this);
(function(define) {
    define(["signals"], function(signals) {
        var crossroads, UNDEF;

        function arrayIndexOf(arr, val) {
            if (arr.indexOf) {
                return arr.indexOf(val)
            } else {
                var n = arr.length;
                while (n--) {
                    if (arr[n] === val) {
                        return n
                    }
                }
                return -1
            }
        }

        function isKind(val, kind) {
            return "[object " + kind + "]" === Object.prototype.toString.call(val)
        }

        function isRegExp(val) {
            return isKind(val, "RegExp")
        }

        function isArray(val) {
            return isKind(val, "Array")
        }

        function isFunction(val) {
            return typeof val === "function"
        }

        function typecastValue(val) {
            var r;
            if (val === null || val === "null") {
                r = null
            } else if (val === "true") {
                r = true
            } else if (val === "false") {
                r = false
            } else if (val === UNDEF || val === "undefined") {
                r = UNDEF
            } else if (val === "" || isNaN(val)) {
                r = val
            } else {
                r = parseFloat(val)
            }
            return r
        }

        function typecastArrayValues(values) {
            var n = values.length,
                result = [];
            while (n--) {
                result[n] = typecastValue(values[n])
            }
            return result
        }

        function decodeQueryString(str) {
            var queryArr = (str || "").replace("?", "").split("&"),
                n = queryArr.length,
                obj = {},
                item, val;
            while (n--) {
                item = queryArr[n].split("=");
                val = typecastValue(item[1]);
                obj[item[0]] = typeof val === "string" ? decodeURIComponent(val) : val
            }
            return obj
        }

        function Crossroads() {
            this._routes = [];
            this._prevRoutes = [];
            this.bypassed = new signals.Signal;
            this.routed = new signals.Signal
        }
        Crossroads.prototype = {
            greedy: false,
            greedyEnabled: true,
            normalizeFn: null,
            create: function() {
                return new Crossroads
            },
            shouldTypecast: false,
            addRoute: function(pattern, callback, priority) {
                var route = new Route(pattern, callback, priority, this);
                this._sortedInsert(route);
                return route
            },
            removeRoute: function(route) {
                var i = arrayIndexOf(this._routes, route);
                if (i !== -1) {
                    this._routes.splice(i, 1)
                }
                route._destroy()
            },
            removeAllRoutes: function() {
                var n = this.getNumRoutes();
                while (n--) {
                    this._routes[n]._destroy()
                }
                this._routes.length = 0
            },
            parse: function(request, defaultArgs) {
                request = request || "";
                defaultArgs = defaultArgs || [];
                var routes = this._getMatchedRoutes(request),
                    i = 0,
                    n = routes.length,
                    cur;
                if (n) {
                    this._notifyPrevRoutes(routes, request);
                    this._prevRoutes = routes;
                    while (i < n) {
                        cur = routes[i];
                        cur.route.matched.dispatch.apply(cur.route.matched, defaultArgs.concat(cur.params));
                        cur.isFirst = !i;
                        this.routed.dispatch.apply(this.routed, defaultArgs.concat([request, cur]));
                        i += 1
                    }
                } else {
                    this.bypassed.dispatch.apply(this.bypassed, defaultArgs.concat([request]))
                }
            },
            _notifyPrevRoutes: function(matchedRoutes, request) {
                var i = 0,
                    prev;
                while (prev = this._prevRoutes[i++]) {
                    if (prev.route.switched && this._didSwitch(prev.route, matchedRoutes)) {
                        prev.route.switched.dispatch(request)
                    }
                }
            },
            _didSwitch: function(route, matchedRoutes) {
                var matched, i = 0;
                while (matched = matchedRoutes[i++]) {
                    if (matched.route === route) {
                        return false
                    }
                }
                return true
            },
            getNumRoutes: function() {
                return this._routes.length
            },
            _sortedInsert: function(route) {
                var routes = this._routes,
                    n = routes.length;
                do {
                    --n
                } while (routes[n] && route._priority <= routes[n]._priority);
                routes.splice(n + 1, 0, route)
            },
            _getMatchedRoutes: function(request) {
                var res = [],
                    routes = this._routes,
                    n = routes.length,
                    route;
                while (route = routes[--n]) {
                    if ((!res.length || this.greedy || route.greedy) && route.match(request)) {
                        res.push({
                            route: route,
                            params: route._getParamsArray(request)
                        })
                    }
                    if (!this.greedyEnabled && res.length) {
                        break
                    }
                }
                return res
            },
            toString: function() {
                return "[crossroads numRoutes:" + this.getNumRoutes() + "]"
            }
        };
        crossroads = new Crossroads;
        crossroads.VERSION = "0.9.0";
        crossroads.NORM_AS_ARRAY = function(req, vals) {
            return [vals.vals_]
        };
        crossroads.NORM_AS_OBJECT = function(req, vals) {
            return [vals]
        };

        function Route(pattern, callback, priority, router) {
            var isRegexPattern = isRegExp(pattern),
                patternLexer = crossroads.patternLexer;
            this._router = router;
            this._pattern = pattern;
            this._paramsIds = isRegexPattern ? null : patternLexer.getParamIds(this._pattern);
            this._optionalParamsIds = isRegexPattern ? null : patternLexer.getOptionalParamsIds(this._pattern);
            this._matchRegexp = isRegexPattern ? pattern : patternLexer.compilePattern(pattern);
            this.matched = new signals.Signal;
            this.switched = new signals.Signal;
            if (callback) {
                this.matched.add(callback)
            }
            this._priority = priority || 0
        }
        Route.prototype = {
            greedy: false,
            rules: void 0,
            match: function(request) {
                request = request || "";
                return this._matchRegexp.test(request) && this._validateParams(request)
            },
            _validateParams: function(request) {
                var rules = this.rules,
                    values = this._getParamsObject(request),
                    key;
                for (key in rules) {
                    if (key !== "normalize_" && rules.hasOwnProperty(key) && !this._isValidParam(request, key, values)) {
                        return false
                    }
                }
                return true
            },
            _isValidParam: function(request, prop, values) {
                var validationRule = this.rules[prop],
                    val = values[prop],
                    isValid = false,
                    isQuery = prop.indexOf("?") === 0;
                if (val == null && this._optionalParamsIds && arrayIndexOf(this._optionalParamsIds, prop) !== -1) {
                    isValid = true
                } else if (isRegExp(validationRule)) {
                    if (isQuery) {
                        val = values[prop + "_"]
                    }
                    isValid = validationRule.test(val)
                } else if (isArray(validationRule)) {
                    if (isQuery) {
                        val = values[prop + "_"]
                    }
                    isValid = arrayIndexOf(validationRule, val) !== -1
                } else if (isFunction(validationRule)) {
                    isValid = validationRule(val, request, values)
                }
                return isValid
            },
            _getParamsObject: function(request) {
                var shouldTypecast = this._router.shouldTypecast,
                    values = crossroads.patternLexer.getParamValues(request, this._matchRegexp, shouldTypecast),
                    o = {},
                    n = values.length,
                    param, val;
                while (n--) {
                    val = values[n];
                    if (this._paramsIds) {
                        param = this._paramsIds[n];
                        if (param.indexOf("?") === 0 && val) {
                            o[param + "_"] = val;
                            val = decodeQueryString(val);
                            values[n] = val
                        }
                        o[param] = val
                    }
                    o[n] = val
                }
                o.request_ = shouldTypecast ? typecastValue(request) : request;
                o.vals_ = values;
                return o
            },
            _getParamsArray: function(request) {
                var norm = this.rules ? this.rules.normalize_ : null,
                    params;
                norm = norm || this._router.normalizeFn;
                if (norm && isFunction(norm)) {
                    params = norm(request, this._getParamsObject(request))
                } else {
                    params = this._getParamsObject(request).vals_
                }
                return params
            },
            interpolate: function(replacements) {
                var str = crossroads.patternLexer.interpolate(this._pattern, replacements);
                if (!this._validateParams(str)) {
                    throw new Error("Generated string doesn't validate against `Route.rules`.")
                }
                return str
            },
            dispose: function() {
                this._router.removeRoute(this)
            },
            _destroy: function() {
                this.matched.dispose();
                this.switched.dispose();
                this.matched = this.switched = this._pattern = this._matchRegexp = null
            },
            toString: function() {
                return '[Route pattern:"' + this._pattern + '", numListeners:' + this.matched.getNumListeners() + "]"
            }
        };
        crossroads.patternLexer = function() {
            var ESCAPE_CHARS_REGEXP = /[\\.+*?\^$\[\](){}\/'#]/g,
                LOOSE_SLASHES_REGEXP = /^\/|\/$/g,
                LEGACY_SLASHES_REGEXP = /\/$/g,
                PARAMS_REGEXP = /(?:\{|:)([^}:]+)(?:\}|:)/g,
                TOKENS = {
                    OS: {
                        rgx: /([:}]|\w(?=\/))\/?(:|(?:\{\?))/g,
                        save: "$1{{id}}$2",
                        res: "\\/?"
                    },
                    RS: {
                        rgx: /([:}])\/?(\{)/g,
                        save: "$1{{id}}$2",
                        res: "\\/"
                    },
                    RQ: {
                        rgx: /\{\?([^}]+)\}/g,
                        res: "\\?([^#]+)"
                    },
                    OQ: {
                        rgx: /:\?([^:]+):/g,
                        res: "(?:\\?([^#]*))?"
                    },
                    OR: {
                        rgx: /:([^:]+)\*:/g,
                        res: "(.*)?"
                    },
                    RR: {
                        rgx: /\{([^}]+)\*\}/g,
                        res: "(.+)"
                    },
                    RP: {
                        rgx: /\{([^}]+)\}/g,
                        res: "([^\\/?]+)"
                    },
                    OP: {
                        rgx: /:([^:]+):/g,
                        res: "([^\\/?]+)?/?"
                    }
                },
                LOOSE_SLASH = 1,
                STRICT_SLASH = 2,
                LEGACY_SLASH = 3,
                _slashMode = LOOSE_SLASH;

            function precompileTokens() {
                var key, cur;
                for (key in TOKENS) {
                    if (TOKENS.hasOwnProperty(key)) {
                        cur = TOKENS[key];
                        cur.id = "__CR_" + key + "__";
                        cur.save = "save" in cur ? cur.save.replace("{{id}}", cur.id) : cur.id;
                        cur.rRestore = new RegExp(cur.id, "g")
                    }
                }
            }
            precompileTokens();

            function captureVals(regex, pattern) {
                var vals = [],
                    match;
                while (match = regex.exec(pattern)) {
                    vals.push(match[1])
                }
                return vals
            }

            function getParamIds(pattern) {
                return captureVals(PARAMS_REGEXP, pattern)
            }

            function getOptionalParamsIds(pattern) {
                return captureVals(TOKENS.OP.rgx, pattern)
            }

            function compilePattern(pattern) {
                pattern = pattern || "";
                if (pattern) {
                    if (_slashMode === LOOSE_SLASH) {
                        pattern = pattern.replace(LOOSE_SLASHES_REGEXP, "")
                    } else if (_slashMode === LEGACY_SLASH) {
                        pattern = pattern.replace(LEGACY_SLASHES_REGEXP, "")
                    }
                    pattern = replaceTokens(pattern, "rgx", "save");
                    pattern = pattern.replace(ESCAPE_CHARS_REGEXP, "\\$&");
                    pattern = replaceTokens(pattern, "rRestore", "res");
                    if (_slashMode === LOOSE_SLASH) {
                        pattern = "\\/?" + pattern
                    }
                }
                if (_slashMode !== STRICT_SLASH) {
                    pattern += "\\/?"
                }
                return new RegExp("^" + pattern + "$")
            }

            function replaceTokens(pattern, regexpName, replaceName) {
                var cur, key;
                for (key in TOKENS) {
                    if (TOKENS.hasOwnProperty(key)) {
                        cur = TOKENS[key];
                        pattern = pattern.replace(cur[regexpName], cur[replaceName])
                    }
                }
                return pattern
            }

            function getParamValues(request, regexp, shouldTypecast) {
                var vals = regexp.exec(request);
                if (vals) {
                    vals.shift();
                    if (shouldTypecast) {
                        vals = typecastArrayValues(vals)
                    }
                }
                return vals
            }

            function interpolate(pattern, replacements) {
                if (typeof pattern !== "string") {
                    throw new Error("Route pattern should be a string.")
                }
                var replaceFn = function(match, prop) {
                    var val;
                    if (prop in replacements) {
                        val = replacements[prop];
                        if (match.indexOf("*") === -1 && val.indexOf("/") !== -1) {
                            throw new Error('Invalid value "' + val + '" for segment "' + match + '".')
                        }
                    } else if (match.indexOf("{") !== -1) {
                        throw new Error("The segment " + match + " is required.")
                    } else {
                        val = ""
                    }
                    return val
                };
                if (!TOKENS.OS.trail) {
                    TOKENS.OS.trail = new RegExp("(?:" + TOKENS.OS.id + ")+$")
                }
                return pattern.replace(TOKENS.OS.rgx, TOKENS.OS.save).replace(PARAMS_REGEXP, replaceFn).replace(TOKENS.OS.trail, "").replace(TOKENS.OS.rRestore, "/")
            }
            return {
                strict: function() {
                    _slashMode = STRICT_SLASH
                },
                loose: function() {
                    _slashMode = LOOSE_SLASH
                },
                legacy: function() {
                    _slashMode = LEGACY_SLASH
                },
                getParamIds: getParamIds,
                getOptionalParamsIds: getOptionalParamsIds,
                getParamValues: getParamValues,
                compilePattern: compilePattern,
                interpolate: interpolate
            }
        }();
        return crossroads
    })
})(typeof define === "function" && define.amd ? define : function(deps, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory(require(deps[0]))
    } else {
        window["crossroads"] = factory(window[deps[0]])
    }
});
JAM.namespace("model").Social = function($) {
    "use strict";

    function Social($_twitter, $_fb, $_gplus, linkURL, shareFrom) {
        var _this = this;
        var trackBase;
        this.from = shareFrom;
        var $twitter, $facebook, $gplus;
        var _link, _shortlink;
        var _picture = "http://chrome-jam-static.commondatastorage.googleapis.com/img/interface/social_thumb.jpg";
        _link = linkURL;
        BASE.utils.shorten(_link, function(shortLink) {
            _shortlink = shortLink
        });
        this.translateText(shareFrom);
        BASE.listen("languageSwitched", function() {
            _this.translateText(shareFrom)
        });
        if (shareFrom == "jamming") {
            trackBase = ["_trackSocial", "network", "usrAction", "Invite"]
        } else if (shareFrom == "leave_session") {
            trackBase = ["_trackSocial", "network", "usrAction", "Ended"]
        } else if (shareFrom == "footer") {
            trackBase = ["_trackSocial", "network", "usrAction", "Footer"]
        }
        $twitter = $_twitter;
        $facebook = $_fb;
        $gplus = $_gplus;
        $twitter.on("mousedown", function() {
            _this.shareTwitter(_shortlink || _link, _this._tweet);
            var clickTrack = trackBase.slice(0, trackBase.length);
            clickTrack[1] = "twitter";
            clickTrack[2] = "click";
            gaq.push(clickTrack)
        });
        $facebook.on("mousedown", function() {
            var clickTrack = trackBase.slice(0, trackBase.length);
            clickTrack[1] = "facebook";
            clickTrack[2] = "click";
            gaq.push(clickTrack);
            _this.shareFB(_picture, _link, _this._title, _this._description, trackBase)
        });
        $gplus.on("mousedown", function() {
            var clickTrack = trackBase.slice(0, trackBase.length);
            clickTrack[1] = "G+";
            clickTrack[2] = "click";
            gaq.push(clickTrack);
            _this.shareGPlus(_link)
        })
    }
    Social.prototype = {
        translateText: function(shareFrom) {
            this.from = shareFrom;
            if (shareFrom == "jamming") {
                this._title = BASE.render.t("join_title");
                this._description = BASE.render.t("join_description");
                this._tweet = BASE.render.t("join_tweet");
                this.trackBase = ["_trackSocial", "network", "usrAction", "Invite", "/invite"]
            } else if (shareFrom == "leave_session") {
                this._title = BASE.render.t("end_title");
                this._description = BASE.render.t("end_description");
                this._tweet = BASE.render.t("end_tweet");
                this.trackBase = ["_trackSocial", "network", "usrAction", "Ended", "/end"]
            } else if (shareFrom == "footer") {
                this._title = BASE.render.t("tagline");
                this._description = BASE.render.t("share_tweet");
                this._tweet = BASE.render.t("t_post");
                this.trackBase = ["_trackSocial", "network", "usrAction", "Footer", "/footer"]
            }
        },
        shareTwitter: function(url, text) {
            var share = "https://twitter.com/share?";
            if (this.from == "jamming") {
                share += "&url=" + url
            } else {
                share += "url=null"
            }
            share += "&hashtags=JAMwithChrome&text=" + text;
            window.open(share, "Share", "toolbar=0,status=0,width=626,height=480")
        },
        shareGPlus: function(url) {
            var language = BASE.render.getLanguageCode();
            var share = "https://plus.google.com/share?url=" + url + "?lang=" + language + "&hl=" + language;
            window.open(share, "Share", "toolbar=0,status=0,width=626,height=480")
        },
        shareFB: function(picture, link, name, description, trackBase) {
            FB.ui({
                method: "feed",
                name: name,
                description: description,
                link: link,
                picture: picture
            }, function(response) {
                if (response && response.post_id) {
                    trackBase[1] = "facebook";
                    trackBase[2] = "published";
                    gaq.push(trackBase)
                } else {}
            })
        }
    };
    return Social
}(jQuery);
JAM.namespace("model").Socket = function($) {
    "use strict";
    var maxDelta = 500;

    function Socket(socketActions) {
        this.socketActions = socketActions
    }
    Socket.prototype = {
        connect: function(sessionId, clientId, connectCallback) {
            var that = this;
            this.connectCallback = connectCallback;
            var connect = function(url) {
                $.ajax("/relay", {
                    data: {
                        session: sessionId,
                        url: url
                    },
                    type: "POST",
                    success: function() {
                        that.openSocket(url, sessionId, clientId)
                    },
                    error: function(error) {
                        console.log("choosing relay:", error)
                    }
                })
            };
            $.ajax("/relay", {
                data: {
                    session: sessionId
                },
                dataType: "json",
                success: function(relays) {
                    if (!relays) {
                        console.log("relayPicker error: no data in relay response");
                        BASE.router.path("/error/");
                        return
                    }
                    pickRelay(relays, function(relay, delta) {
                        if (delta === null) {
                            console.log("couldn't find a suitable relay");
                            if (sessionId) {
                                BASE.router.path("/error/" + sessionId + "/")
                            } else {
                                BASE.router.path("/error/")
                            }
                            return
                        } else if (delta > maxDelta) {
                            BASE.router.path("/latency/");
                            console.log("Latency is too great to connect");
                            gaq.push(["_trackEvent", "error", "global_alert_latency"]);
                            return
                        }
                        that.delta = delta > 0 ? delta : 1;
                        connect(relay)
                    })
                },
                error: function(error) {
                    console.log("relayPicker error:", error);
                    BASE.router.path("/error/")
                }
            })
        },
        openSocket: function(url, sessionId, clientId) {
            var that = this,
                connected = false;
            this.socket = new WebSocket(url);
            this.socket.onopen = function() {
                that.sendEvent("hello", {
                    session: sessionId,
                    client: clientId
                });
                connected = true;
                that.heartbeat(2e3, true);
                if (typeof that.connectCallback == "function") {
                    that.connectCallback()
                }
            };
            this.socket.onmessage = function(message) {
                var data = JSON.parse(message.data);
                var type = data.type;
                that.socketActions(type, data)
            };
            this.socket.onclose = function(msg) {
                that.stopbeat();
                if (connected) {
                    BASE.tell("closed")
                } else {
                    BASE.router.path("/error/");
                    gaq.push(["_trackEvent", "error", "global_alert_communication_lost"])
                }
            }
        },
        socketActions: function() {},
        sync: function() {
            this.sendEvent("sync", {})
        },
        disconnect: function() {
            try {
                this.socket.close()
            } catch (err) {}
        },
        sendEvent: function(eventName, data) {
            try {
                data.type = eventName;
                var json = JSON.stringify(data);
                this.socket.send(json)
            } catch (err) {}
        },
        getDelta: function() {
            return this.delta || false
        },
        alive: function() {
            if (this._stopBeat) return;
            this.sendEvent("keepAlive", {})
        },
        heartbeat: function(speed, start) {
            var _me = this,
                time = speed || 2e3;
            if (start) {
                this._stopBeat = false
            }
            if (this._stopBeat) {
                clearTimeout(this._beat);
                return
            }
            this.alive();
            this._beat = setTimeout(function() {
                _me.heartbeat(speed)
            }, time)
        },
        stopbeat: function() {
            this._stopBeat = true;
            clearTimeout(this._beat)
        }
    };
    return Socket
}(jQuery);
JAM.namespace("model").Stage = function($) {
    "use strict";
    var _$window, _$document, _context, _drag = false,
        _interval, _lastPoint;

    function Stage($el, needs_canvas, width, height) {
        var me = this;
        this.$el = $el;
        this.hidden = false;
        this.pause = false;
        if (typeof _$window === "undefined") {
            _$window = $(window)
        }
        if (typeof _$document === "undefined") {
            _$document = $(document)
        }
        if (typeof width === "undefined") {
            this.width = this.$el.width();
            this.height = this.$el.height()
        } else {
            this.width = width;
            this.height = height
        } if (this.$el.length) {
            this.checkOffset()
        } else {
            console.log("Error: ", "No Element");
            BASE.tell("loadingFailed");
            return
        }
        this.queue = [];
        _$window.on("scroll.stage", function() {
            me.checkOffset()
        });
        _$window.on("resize.stage", function() {
            me.checkOffset()
        });
        this.mouseSpeed = 0;
        this.spacer = 200;
        this.$el.on("mousedown.stage", function(event) {
            var a = event.clientX - me.offsetX,
                b = event.clientY - me.offsetY,
                point = new Point(a, b);
            if (event.button == 2) return;
            _drag = true;
            me.onMouseDown(point);
            _lastPoint = point
        });
        _$document.on("mouseup.stage", function(event) {
            var a = event.clientX - me.offsetX,
                b = event.clientY - me.offsetY,
                point = new Point(a, b);
            _drag = false;
            me.onMouseUp(point)
        });
        _$document.on("mousemove.stage", function(event) {
            if (_drag) {
                var a = event.clientX - me.offsetX,
                    b = event.clientY - me.offsetY,
                    point = new Point(a, b),
                    dist = point.distanceSqr(_lastPoint);
                if (dist > me.spacer) {
                    point.distanceBetween = dist;
                    me.onMouseDrag(point);
                    _lastPoint = point
                }
            }
        });
        return this
    }
    Stage.prototype = {
        buildCanvas: function() {
            this.$canvas = $("<canvas>");
            this.$canvas.attr("width", this.width);
            this.$canvas.attr("height", this.height);
            this.$el.append(this.$canvas);
            return this.$canvas
        },
        checkOffset: function() {
            this.offsetX = this.$el.offset().left - _$window.scrollLeft();
            this.offsetY = this.$el.offset().top - _$window.scrollTop()
        },
        unlisten: function() {
            _$window.off("scroll.stage");
            _$window.off("resize.stage");
            this.$el.off("mousedown.stage");
            _$document.off("mouseup.stage");
            _$document.off("mousemove.stage")
        },
        setSpacer: function(space) {
            this.spacer = space
        },
        destroy: function() {
            this.unlisten()
        },
        clear: function() {
            this.context.clearRect(0, 0, this.width, this.height)
        },
        addLine: function(a, b, c, d, draw) {
            var line;
            if (typeof c === "undefined") {
                line = new Line(a, b, this)
            } else {
                line = new Line(new Point(a, b), new Point(c, d), this)
            } if (draw) this.addToQueue(line);
            return line
        },
        startPath: function(a, draw) {
            var line;
            line = new Line(a, a, this);
            if (draw) this.addToQueue(line);
            return line
        },
        addRect: function(a, b, width, height, draw) {
            var rect = new Rect(new Point(a, b), width, height, this);
            if (draw) this.addToQueue(rect);
            return rect
        },
        addCircle: function(a, b, radius, draw) {
            var circle = new Circle(new Point(a, b), radius, this);
            if (draw) this.addToQueue(circle);
            return circle
        },
        onMouseDown: function() {},
        onMouseUp: function() {},
        onMouseDrag: function() {}
    };

    function Rect(point, width, height, stage) {
        this.x = point.x;
        this.y = point.y;
        this.width = width;
        this.height = height;
        this.hit = false;
        this.segments = [new Segment(new Point(this.x, this.y), new Point(this.x, this.y + this.height)), new Segment(new Point(this.x + this.width, this.y), new Point(this.x + this.width, this.y + this.height)), new Segment(new Point(this.x, this.y), new Point(this.x + this.width, this.y)), new Segment(new Point(this.x, this.y + this.height), new Point(this.x + this.width, this.y + this.height))];
        return this
    }
    Rect.prototype = {
        pointInside: function(point) {
            var x = point.x,
                y = point.y;
            return x >= this.x && y >= this.y && x <= this.x + this.width && y <= this.y + this.height
        },
        crosses: function(segment) {
            var that = this,
                resultsArray = [],
                result = false;
            this.segments.forEach(function(seg) {
                var check = seg.intersect(segment);
                if (check) {
                    resultsArray.push(check);
                    result = resultsArray;
                    return true
                }
            });
            return result
        },
        draw: function() {}
    };

    function Circle(point, radius, stage) {
        this.x = point.x;
        this.y = point.y;
        this.radius = radius;
        this.hit = false;
        this.layer = 0;
        return this
    }
    Circle.prototype = {
        pointInside: function(point) {
            var x = point.x,
                y = point.y,
                dx = x - this.x,
                dy = y - this.y,
                r = this.radius;
            return dx * dx + dy * dy <= r * r
        },
        draw: function() {}
    };

    function Line(a, b, stage) {
        this.segments = [];
        this.points = [];
        this.startPoints(a, b);
        return this
    }
    Line.prototype = {
        getSegments: function() {
            return this.segments
        },
        eachSegment: function(todo) {
            this.segments.forEach(todo)
        },
        firstSegment: function() {
            return this.segments[0]
        },
        lastSegment: function() {
            return this.segments[this.segments.length - 1]
        },
        start: function() {
            return this.firstSegment().getStart()
        },
        end: function() {
            return this.lastSegment().getEnd()
        },
        pointInside: function(point) {
            var x = point.x,
                y = point.y,
                spread = 10,
                result = false;
            this.segments.forEach(function(seg, index) {
                var test = x <= seg.getStart().x && x >= seg.getEnd().x && y >= seg.getStart().y - spread && y <= seg.getStart().y + spread;
                if (test) result = {
                    index: index
                }
            });
            return result
        },
        firstPoint: function() {
            return this.points[0]
        },
        lastPoint: function() {
            return this.points[this.points.length - 1]
        },
        startPoints: function(a, b) {
            this.points = [a, b];
            this.pushSegment(new Segment(a, b, this))
        },
        addSegment: function(endPoint, draw) {
            var seg = new Segment(this.end(), Array.isArray(endPoint) ? endPoint = new Point(endPoint[0], endPoint[1]) : endPoint, this);
            if (this.points.length < 3) {
                this.startPoints(this.points[0], endPoint)
            }
            this.points.push(endPoint);
            this.segments.push(seg);
            return seg
        },
        pushSegment: function(seg) {
            this.segments.push(seg)
        },
        popSegment: function(draw) {},
        removeSegments: function() {
            this.segments = [];
            this.points = []
        },
        setWidth: function(width) {
            this.stroke = width
        },
        setColor: function(color) {
            this.color = color;
            this.context.strokeStyle = this.color
        },
        prevSeg: function(index, dist) {
            if (index - dist > 0) {
                return this.segements[index - dist]
            } else {
                return false
            }
        },
        draw: function(ctx) {}
    };

    function Segment(point1, point2, parent) {
        this.start = point1;
        this.end = point2;
        this.context;
        if (typeof parent != "undefined") {
            this.parent = parent
        }
        return this
    }
    Segment.prototype = {
        draw: function(ctx) {
            if (typeof ctx != "undefined") {
                this.context = ctx
            }
            this.context.beginPath();
            this.context.moveTo(this.start.x, this.start.y);
            this.context.lineTo(this.end.x, this.end.y);
            this.context.closePath();
            if (this.parent) {
                this.context.strokeStyle = this.parent.color;
                this.context.lineWidth = this.parent.stroke
            }
            this.context.stroke()
        },
        getStart: function() {
            return this.start
        },
        getEnd: function() {
            return this.end
        },
        intersect: function(otherSeg) {
            var result, a1 = this.start,
                a2 = this.end,
                b1 = otherSeg.getStart(),
                b2 = otherSeg.getEnd(),
                ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x),
                ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x),
                u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
            if (u_b != 0) {
                var ua = ua_t / u_b;
                var ub = ub_t / u_b;
                if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
                    result = new Point(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y))
                } else {
                    result = false
                }
            } else {
                if (ua_t == 0 || ub_t == 0) {
                    result = false
                } else {
                    result = false
                }
            }
            return result
        },
        intersectLine: function(line) {
            var that = this,
                result = false;
            line.segments.forEach(function(seg, index) {
                var check = that.intersect(seg);
                if (check) {
                    result = {
                        index: index
                    };
                    return true
                }
            });
            return result
        },
        intersectFirstSegment: function(line) {
            var that = this;
            var check = that.intersect(line.segments[0]);
            if (check) {
                return true
            }
            return false
        }
    };

    function Point(x, y) {
        this.x = x;
        this.y = y;
        return this
    }
    Point.prototype = {
        distance: function(point) {
            var x = point.x - this.x,
                y = point.y - this.y,
                d = x * x + y * y;
            return Math.sqrt(d)
        },
        distanceSqr: function(point) {
            var x = point.x - this.x,
                y = point.y - this.y,
                d = x * x + y * y;
            return d
        }
    };
    return Stage
}(jQuery);
JAM.namespace("model").Swiffy = function($) {
    "use strict";
    var swiffyCache = {},
        _errors = 0;

    function Swiffy(url, $el, callback) {
        this.url = url;
        if ($el) this.setElement($el);
        if (callback) this.callback = callback;
        this.load(this.url)
    }
    Swiffy.prototype = {
        load: function(url) {
            var swiffyobject, that = this;
            if (typeof swiffyCache[url] == "undefined") {
                $.ajax({
                    url: url,
                    dataType: "json",
                    cache: true,
                    success: function(data) {
                        that.swiffyobject = data;
                        swiffyCache[url] = {
                            swiffyobject: data
                        };
                        if (typeof that.callback != "undefined") {
                            that.callback(that)
                        }
                    },
                    error: function() {
                        _errors.errors++;
                        if (_errors.errors > 1) {
                            BASE.tell("loadingFailed")
                        }
                    }
                })
            } else {
                this.swiffyobject = swiffyCache[url].swiffyobject;
                if (typeof that.callback != "undefined") {
                    that.callback(that)
                }
            }
        },
        setElement: function($el) {
            this.$el = $el;
            this.el = $el[0]
        },
        start: function($el) {
            if ($el) this.setElement($el);
            this.stage = new swiffy.Stage(this.el, this.swiffyobject);
            this.stage.start()
        },
        ready: function() {
            if (this.el.hasOwnProperty("SetVariable")) {
                return true
            } else {
                return false
            }
        },
        outro: function() {
            var that = this;
            setTimeout(function() {
                that.stop()
            }, 800);
            if (!this.ready()) return;
            this.el.SetVariable("goplay", "outro")
        },
        loop: function() {
            if (!this.ready()) return;
            this.el.SetVariable("goplay", "loop")
        },
        stop: function() {
            if (this.stage) this.stage.destroy()
        },
        once: function(time) {
            var that = this;
            if (!time) time = 100;
            if (!this.ready()) return;
            this.el.SetVariable("looping", true);
            setTimeout(function() {
                that.el.SetVariable("looping", false)
            }, time, that)
        },
        looping: function(loop) {
            if (!this.ready()) return;
            this.el.SetVariable("looping", loop)
        }
    };
    return Swiffy
}(jQuery);
JAM.namespace("model").Tip = function($) {
    "use strict";
    var tipTemplate, _$body, _$window = $(window);
    tipTemplate = '<div class="tool_tip hoverer">';
    tipTemplate += '<div class="tt_arrow_top tt_arrow"></div>';
    tipTemplate += '<div class="tt_content"><div class="tt_text"></div></div>';
    tipTemplate += '<div class="tt_arrow_bottom tt_arrow"></div>';
    tipTemplate += "</div>";

    function Tip($el) {
        if ($el.length == 0) return false;
        this.$el = $el;
        this.$trigger = $el.data("ident") ? $("#" + $el.data("ident")) : $el;
        this.$tip = $(tipTemplate);
        this.$tipText = this.$tip.find(".tt_text");
        this.$arrow = this.$tip.find(".tt_arrow");
        this.onTip = false;
        this.parse();
        this.build();
        this.add();
        this.screen_position()
    }
    Tip.prototype = {
        parse: function() {
            this.$el.removeClass("tool_tip").addClass("tipped");
            this.text = this.$el.data("tip") || this.$el.html();
            this.horz_position = this.$el.data("horz") || false;
            this.vert_position = this.$el.data("vert") || false;
            this.edge = this.$el.data("edge") || false;
            this.topOffset = parseInt(this.$el.data("top-offset")) || 0;
            this.leftOffset = parseInt(this.$el.data("left-offset")) || 0;
            this.withClass = this.$el.data("class") || false
        },
        build: function() {
            var _me = this,
                showTimeout, hideTimeout, offTipTimeout;
            this.$tipText.html(this.text);
            if (this.withClass) {
                this.$tip.addClass(this.withClass)
            }
            _$window.on("resize", function() {
                _me.screen_position()
            });
            this.$trigger.on("mousedown", function() {
                _me.hide()
            });
            this.$tip.on("mousedown", function() {
                _me.hide()
            });
            this.$tip.on("mouseenter", function() {
                _me.onTip = true
            });
            this.$tip.on("mouseleave", function() {
                clearTimeout(offTipTimeout);
                clearTimeout(showTimeout);
                offTipTimeout = setTimeout(function() {
                    _me.hide();
                    _me.onTip = false
                }, 10)
            });
            this.$trigger.on("mouseenter", function() {
                clearTimeout(showTimeout);
                showTimeout = setTimeout(function() {
                    if (!_me.onTip) _me.show()
                }, 500)
            });
            this.$trigger.on("mouseout", function() {
                clearTimeout(hideTimeout);
                clearTimeout(showTimeout);
                hideTimeout = setTimeout(function() {
                    if (!_me.onTip) _me.hide()
                }, 10)
            })
        },
        screen_position: function() {
            var tipWidth = this.$tip.width(),
                tipHeight = this.$tip.height(),
                elWidth = this.$el.width(),
                elHeight = this.$el.height(),
                offsetLeft = this.$el.offset().left,
                offsetTop = this.$el.offset().top,
                arrowLeft = this.edge == "right" ? elWidth : 0;
            if (this.vert_position == "below") {
                this.$tip.addClass("bottom");
                this.$tip.css({
                    top: offsetTop + this.topOffset + elHeight
                })
            } else {
                this.$tip.css({
                    top: offsetTop - tipHeight + this.topOffset + elHeight / 2
                })
            } if (this.horz_position == "right") {
                this.$tip.css({
                    left: offsetLeft - tipWidth + this.leftOffset + elWidth / 2
                });
                this.$arrow.addClass("right")
            } else {
                this.$tip.css({
                    left: offsetLeft + this.leftOffset + elWidth / 2
                });
                this.$arrow.addClass("left")
            }
        },
        add: function() {
            if (typeof $body === "undefined") {
                _$body = $(document).find("body")
            }
            _$body.append(this.$tip)
        },
        destroy: function() {
            this.$tip.remove()
        },
        show: function() {
            this.screen_position();
            this.$tip.fadeIn(100)
        },
        hide: function() {
            this.$tip.fadeOut(50)
        }
    };
    return Tip
}(jQuery);
JAM.namespace("manager").tips = function($) {
    "use strict";
    var _tours = [],
        _other_tours = [],
        _pro_tours = [],
        _easy_tours = [],
        _timeouts = [],
        _tips = [],
        touring = false,
        currentTip;
    var touredDrums = storage("touredDrums") || {
            easyMode: false,
            proMode: false,
            key: "touredDrums"
        },
        touredStrings = storage("touredStrings") || {
            easyMode: false,
            proMode: false,
            key: "touredStrings"
        },
        touredKeyboards = storage("touredKeyboards") || {
            easyMode: false,
            proMode: false,
            key: "touredKeyboards"
        },
        touredMachines = storage("touredMachines") || {
            easyMode: false,
            proMode: false,
            key: "touredMachines"
        };

    function tour() {
        destroy();
        var $easy = $(".easy_tour"),
            $pro = $(".pro_tour"),
            $menu = $(".header_tour"),
            menu_total = $menu.length,
            easy_total = $easy.length,
            combined_total = menu_total + easy_total,
            pro_total = $pro.length,
            $mask = $("#mask"),
            $main = $("#main");
        _tours = [];
        _easy_tours = [];
        _pro_tours = [];
        if ($mask.length < 1) {
            $main.append("<div id='mask'>");
            $mask = $("#mask")
        }
        $easy.each(function(index) {
            var $this = $(this),
                tip;
            $this.data("class", "tour_item");
            tip = new JAM.model.Tour($this, [index + 1, combined_total]);
            tip.$tip.attr("id", tip.$tipText.attr("data-t"));
            _tours.push(tip);
            _easy_tours.push(tip)
        });
        $menu.each(function(index) {
            var $this = $(this),
                tip;
            $this.data("class", "tour_item");
            tip = new JAM.model.Tour($this, [easy_total + index + 1, combined_total]);
            _tours.push(tip);
            _easy_tours.push(tip)
        });
        $pro.each(function(index) {
            var $this = $(this),
                tip;
            $this.data("class", "tour_item");
            tip = new JAM.model.Tour($this, [index + 1, pro_total]);
            tip.$tip.attr("id", tip.$tipText.attr("data-t"));
            _tours.push(tip);
            _pro_tours.push(tip)
        });
        $(".tt_last").click(function() {
            var mode = pro_mode() == true ? "Pro" : "Easy";
            gaq.push(["trackEvent", "Session", "Help", "Complete " + mode + " Tips "])
        });
        $(".tt_close").click(function() {
            var mode = pro_mode() == true ? "Pro" : "Easy";
            gaq.push(["_trackEvent", "Session", "Help", "Exit on " + mode + " Tip " + currentTip])
        });
        checkToured({
            type: "Tips.tour()"
        });
        BASE.listen("showHelp.help", function() {
            gaq.push(["_trackEvent", "Session", "Help", "On"]);
            if (pro_mode()) {
                progressTour(_pro_tours, 1)
            } else {
                progressTour(_easy_tours, 1)
            }
        });
        BASE.listen("hideHelp.help", function() {
            BASE.tell("close_tour")
        });
        BASE.listen("switchingInstrument.tour", function(event) {
            clearTimeouts();
            destroy()
        })
    }

    function clearTimeouts() {
        _timeouts.forEach(function(timeout) {
            clearTimeout(timeout)
        })
    }

    function destroy() {
        touring = false;
        $(".tt_last").click(undefined);
        $(".tt_close").click(undefined);
        if (_tips.length > 0) {
            _tips.forEach(function(tip) {
                tip.destroy()
            });
            _tips = []
        }
        BASE.off(".help");
        if (_tours.length > 0) {
            _tours.forEach(function(tip) {
                tip.destroy()
            });
            _tours = []
        }
    }

    function checkToured(event) {
        if (!touring) {
            if (pro_mode() && !currentTour().proMode) startTour();
            else if (!pro_mode() && !currentTour().easyMode) startTour()
        }
    }

    function progressTour(tips, delay) {
        var delay = delay || 4800,
            wait = 500,
            $mask = $("#mask"),
            masked = false;
        currentTip = 0;
        if (!tips.length > 0) {
            $mask.hide();
            return false
        }
        BASE.tell("closeAllModals");
        BASE.listen("advance_tour.current_tour", function() {
            clearTimeouts();
            var timeout = setTimeout(function() {
                if (!masked) {
                    $mask.fadeIn(400, function() {
                        masked = true;
                        delay = wait;
                        BASE.tell("startTour");
                        $(document).on("keyup.current_tour", function(e) {
                            var code = BASE.utils.keyToString(e.keyCode);
                            if (code === "escape") {
                                BASE.tell("close_tour")
                            }
                        })
                    })
                }
                tips[currentTip].show();
                currentTip++
            }, delay);
            _timeouts.push(timeout)
        });
        BASE.listen("close_tour.current_tour", function() {
            touring = false;
            BASE.off(".current_tour");
            $mask.fadeOut(400, function() {
                masked = false
            });
            BASE.tell("endTour");
            _tours.forEach(function(tip) {
                tip.hide()
            });
            JAM.controller.session.checkLatency();
            $("header").css("z-index", 50)
        });
        BASE.tell("advance_tour")
    }

    function startTour() {
        clearTimeouts();
        var _currentTour = currentTour();
        if (pro_mode() && !_currentTour.proMode) {
            touring = true;
            currentTour().proMode = true;
            storage(_currentTour.key, _currentTour);
            progressTour(_pro_tours, 1600)
        } else if (!pro_mode() && !_currentTour.easyMode) {
            touring = true;
            currentTour().easyMode = true;
            storage(_currentTour.key, _currentTour);
            progressTour(_easy_tours, 2400)
        }
        BASE.listen("advanced_mode.tour", function(event) {
            touring = false;
            clearTimeouts();
            checkToured({
                type: "advanced_mode.tour"
            });
            BASE.off("advanced_mode.tour");
            BASE.listen("easy_mode.tour", function(event) {
                clearTimeouts();
                BASE.off("easy_mode.tour")
            })
        });
        BASE.events.listen("view_changed.tour loadInstrument.tour", function() {
            clearTimeouts();
            BASE.off(".tour");
            destroy();
            _tours = []
        })
    }

    function currentTour() {
        var ident = JAM.instruments.switcher.currentInstrument(),
            instrument = JAM.instrumentsConfig[ident].type;
        if (instrument == "guitar" || instrument == "bass") return touredStrings;
        else if (instrument == "keyboard") return touredKeyboards;
        else if (instrument == "drums") return touredDrums;
        else if (instrument == "machine") return touredMachines
    }

    function storage(key, value) {
        var value;
        if (typeof value === "undefined") {
            value = window.localStorage.getItem(key);
            try {
                return JSON.parse(value)
            } catch (e) {
                return false
            }
        } else {
            value = JSON.stringify(value);
            window.localStorage.setItem(key, value)
        }
    }

    function pro_mode() {
        return JAM.instruments.switcher.mode() == "pro"
    }

    function autoplay_tour() {
        var $auto_play = $(".autoplay_tour"),
            $mask = $("#mask"),
            $main = $("#main"),
            _autoplay_tour = [];
        $auto_play.each(function(index) {
            var $this = $(this),
                tip;
            $this.data("class", "tour_item");
            tip = new JAM.model.Tour($this, [1, 1]);
            tip.$tip.attr("id", tip.$tipText.attr("data-t"));
            _autoplay_tour.push(tip);
            _tours.push(tip)
        });
        if (_autoplay_tour.length > 0) {
            touring = true;
            progressTour(_autoplay_tour, 100)
        }
    }

    function isTouring() {
        return touring
    }
    return {
        tour: tour,
        startTour: startTour,
        destroy: destroy,
        autoplay_tour: autoplay_tour,
        isTouring: isTouring
    }
}(jQuery);
JAM.namespace("model").Tour = function($) {
    "use strict";
    var tipTemplate, _$body, _$window = $(window);
    tipTemplate = '<div class="tool_tip">';
    tipTemplate += '<div class="tt_arrow_top tt_arrow"></div>';
    tipTemplate += '<div class="tt_content"><div class="tt_text"></div></div>';
    tipTemplate += '<div class="tt_arrow_bottom tt_arrow"></div>';
    tipTemplate += "</div>";

    function Tour($el, indexArray) {
        if ($el.length == 0) return false;
        this.$el = $el;
        this.$tip = $(tipTemplate);
        this.$content = this.$tip.find(".tt_content");
        this.$tipText = this.$tip.find(".tt_text");
        this.$arrow = this.$tip.find(".tt_arrow");
        this.indexArray = indexArray;
        this.onTip = false;
        this.screen_position_retry = 0;
        this.parse();
        this.build();
        this.add();
        if (!this.$el.length) {
            return false
        }
    }
    Tour.prototype = {
        parse: function() {
            this.dtip = this.$el.data("tip");
            this.$el.removeClass("tool_tip").addClass("tipped");
            if (this.dtip) {
                this.text = BASE.render.t(this.dtip)
            } else {
                this.text = this.$el.html()
            }
            this.horz_position = this.$el.data("horz") || false;
            this.vert_position = this.$el.data("vert") || false;
            this.edge = this.$el.data("edge") || false;
            this.topOffset = parseInt(this.$el.data("top-offset")) || 0;
            this.leftOffset = parseInt(this.$el.data("left-offset")) || 0;
            this.withClass = this.$el.data("class") || false;
            this.related = this.$el.data("related");
            this.elzindex = parseInt(this.$el.css("z-index")) || 0;
            this.content_width = this.$el.data("width") || false;
            if (this.text.length) {
                this.text = this.text.replace(/\[(.)\]/g, "<span>$1</span>")
            }
        },
        build: function() {
            var _me = this;
            this.$tipText.attr("data-t", this.dtip).html(this.text);
            this.$advance = $("<div class='tt_next'>").appendTo(this.$content);
            this.$position = $("<div class='tt_position'>").appendTo(this.$content);
            if (this.indexArray && this.indexArray[0] === this.indexArray[1]) {
                this.last = true;
                this.$advance.addClass("tt_last").attr("data-t", "get_started").html(BASE.render.t("get_started"))
            } else {
                this.$advance.attr("data-t", "next").html(BASE.render.t("next"))
            }
            this.$position.html(BASE.render.t("tip") + " " + this.indexArray[0] + "/" + this.indexArray[1]);
            this.$close = $("<div class='tt_close'>").appendTo(this.$content);
            if (this.withClass) {
                this.$tip.addClass(this.withClass)
            }
            if (this.content_width) {
                this.$content.css("width", this.content_width)
            }
            _$window.on("resize", function() {
                _me.screen_position()
            });
            this.$advance.on("click", function() {
                _me.hide();
                if (_me.last) {
                    BASE.tell("close_tour");
                    _me.hide()
                } else {
                    BASE.tell("advance_tour")
                }
            });
            this.$close.on("click", function() {
                _me.hide();
                BASE.tell("close_tour")
            })
        },
        screen_position: function() {
            var tipWidth = this.$tip.width(),
                tipHeight = this.$tip.height(),
                elWidth = this.$el.width(),
                elHeight = this.$el.height(),
                offsetLeft = this.$el.offset().left,
                offsetTop = this.$el.offset().top,
                arrowLeft = this.edge == "right" ? elWidth : 0,
                wHeight = _$window.height(),
                wWidth = _$window.width(),
                trueTop = offsetTop + this.topOffset,
                trueLeft = offsetLeft + this.leftOffset + elWidth / 2,
                padding = 20;
            if (offsetLeft == 0 && offsetTop == 0) {
                var _me = this;
                if (this.screen_position_retry > 3) $("#mask").hide();
                return;
                this.screen_position_retry++;
                setTimeout(function() {
                    _me.screen_position()
                }, 1e3);
                return
            }
            if (trueLeft - tipWidth < padding && this.horz_position != "left") {
                this.horz_position = "left"
            }
            if (trueTop - tipHeight < padding && this.vert_position != "below") {
                this.vert_position = "below"
            }
            if (trueLeft + tipWidth > wWidth + padding && this.horz_position != "right") {
                this.horz_position = "right"
            }
            if (trueTop + tipHeight > wHeight + padding && this.vert_position != "top") {
                this.vert_position = "top"
            }
            if (this.vert_position == "below") {
                this.$tip.addClass("bottom");
                this.$tip.css({
                    top: trueTop + elHeight
                })
            } else {
                this.$tip.removeClass("bottom");
                this.$tip.css({
                    top: trueTop - tipHeight
                })
            } if (this.horz_position == "right") {
                this.$tip.css({
                    left: trueLeft - tipWidth
                });
                this.$arrow.removeClass("left");
                this.$arrow.addClass("right")
            } else {
                this.$tip.css({
                    left: trueLeft
                });
                this.$arrow.removeClass("right");
                this.$arrow.addClass("left")
            }
        },
        add: function() {
            if (typeof $body === "undefined") {
                _$body = $(document).find("body")
            }
            _$body.append(this.$tip)
        },
        destroy: function() {
            this.$tip.remove()
        },
        show: function() {
            this.screen_position();
            this.focusOn();
            this.$tip.fadeIn()
        },
        hide: function() {
            var _me = this;
            this.$tip.fadeOut(100, function() {
                _me.focusOff()
            })
        },
        focusOn: function() {
            this.$related = $("." + this.related);
            this.$el.css("z-index", 100 + this.elzindex);
            this.$tip.css("z-index", 1e3);
            this.$related.each(function() {
                var $this = $(this),
                    zindex = parseInt($this.css("z-index"));
                if (zindex) {
                    $this.css("z-index", 100 + zindex)
                } else {
                    $this.css("z-index", 101)
                }
            });
            if (this.related === "help_tour") {
                $(".menu_item").css("opacity", .2)
            }
        },
        focusOff: function() {
            if (!this.$related) {
                this.$related = $("." + this.related)
            }
            this.$el.css("z-index", "");
            this.$related.css("z-index", "");
            if (this.related === "help_tour") {
                $(".menu_item").css("opacity", 1)
            }
        },
        actions: function() {
            var _me = this,
                showTimeout, hideTimeout, offTipTimeout;
            this.$el.on("mousedown.tip_action", function() {
                _me.show()
            });
            this.$tip.on("mousedown.tip_action", function() {
                _me.hide()
            });
            this.$tip.on("mouseenter.tip_action", function() {
                _me.onTip = true
            });
            this.$el.on("mouseleave.tip_action", function() {
                clearTimeout(offTipTimeout);
                clearTimeout(showTimeout);
                offTipTimeout = setTimeout(function() {
                    _me.hide();
                    _me.onTip = false
                }, 10)
            });
            this.$el.on("mouseenter.tip_action", function() {
                clearTimeout(showTimeout);
                showTimeout = setTimeout(function() {
                    if (!_me.onTip) _me.show()
                }, 500)
            });
            this.$el.on("mouseout.tip_action", function() {
                clearTimeout(hideTimeout);
                clearTimeout(showTimeout);
                hideTimeout = setTimeout(function() {
                    if (!_me.onTip) _me.hide()
                }, 10)
            })
        },
        hotspot: function(show) {
            var _me = this;
            if (show) {
                this.$el.css("visibility", "visible");
                this.actions()
            } else {
                this.$el.css("hidden", "visible");
                this.$el.off(".tip_action")
            }
        }
    };
    return Tour
}(jQuery);
var webPropID = "UA-36031586-1";
var _gaq = [
    ["_setAccount", webPropID]
];

function GAQ() {
    (function(d, t) {
        var g = d.createElement(t),
            s = d.getElementsByTagName(t)[0];
        g.src = ("https:" == location.protocol ? "//ssl" : "//www") + ".google-analytics.com/ga.js";
        s.parentNode.insertBefore(g, s)
    })(document, "script")
}
GAQ.prototype = {
    push: function(array) {
        _gaq.push(array)
    }
};
var gaq = new GAQ;

function floodlight(activity) {
    var axel = Math.random() + "";
    var a = axel * 1e13;
    $("body").prepend('<iframe src="https://2542116.fls.doubleclick.net/activityi;src=2542116;type=chrom322;cat=chrom' + activity + ";ord=" + a + '?" width="1" height="1" frameborder="0" style="display:none">' + "</iframe>")
}
var FBtryCounter = 0;

function face() {
    if (typeof FB !== "undefined") {
        FB.init({
            appId: "350223088404914",
            xfbml: false,
            cookie: true
        })
    } else {
        if (FBtryCounter > 3) return;
        FBtryCounter++;
        setTimeout(function() {
            face()
        }, 1e3)
    }
}
face();
JAM.namespace("model").Triangle = function($) {
    "use strict";

    function Triangle($el) {
        if ($el.length == 0) return false;
        this.$el = $el;
        this.parse();
        this.create();
        this.build();
        this.add()
    }
    Triangle.prototype = {
        parse: function() {
            this.elHeight = this.$el.height();
            this.elWidth = this.$el.width();
            this.reverse = this.$el.data("reverse") || false;
            this.ident = this.$el.data("ident") ? 'data-ident="' + this.$el.data("ident") + '"' : "";
            this.$el.removeClass("triangle")
        },
        create: function() {
            if (this.reverse) {
                this.points = this.up(this.elWidth, this.elHeight)
            } else {
                this.points = this.down(this.elWidth, this.elHeight)
            }
        },
        build: function() {
            this.template = '<svg xmlns="http://www.w3.org/2000/svg" width="' + this.elWidth + '" height="' + this.elHeight + '">';
            this.template += '<polygon class="triangle" ' + this.ident + ' points="' + this.points + '" />';
            this.template += "</svg>"
        },
        up: function(width, height) {
            return [
                [0, height].join(","), [width / 2, 0].join(","), [width, height].join(",")
            ].join(" ")
        },
        down: function(width, height) {
            return [
                [0, 0].join(","), [width / 2, height].join(","), [width, 0].join(",")
            ].join(" ")
        },
        add: function() {
            this.$el.prepend(this.template)
        }
    };
    return Triangle
}(jQuery);
var TWEEN = TWEEN || function() {
    var _tweens = [];
    return {
        REVISION: "6",
        getAll: function() {
            return _tweens
        },
        removeAll: function() {
            _tweens = []
        },
        add: function(tween) {
            _tweens.push(tween)
        },
        remove: function(tween) {
            var i = _tweens.indexOf(tween);
            if (i !== -1) {
                _tweens.splice(i, 1)
            }
        },
        update: function(time) {
            var i = 0;
            var num_tweens = _tweens.length;
            var time = time !== undefined ? time : Date.now();
            while (i < num_tweens) {
                if (_tweens[i].update(time)) {
                    i++
                } else {
                    _tweens.splice(i, 1);
                    num_tweens--
                }
            }
        }
    }
}();
TWEEN.Tween = function(object) {
    var _object = object;
    var _valuesStart = {};
    var _valuesEnd = {};
    var _duration = 1e3;
    var _delayTime = 0;
    var _startTime = null;
    var _easingFunction = TWEEN.Easing.Linear.None;
    var _interpolationFunction = TWEEN.Interpolation.Linear;
    var _chainedTween = null;
    var _onUpdateCallback = null;
    var _onCompleteCallback = null;
    this.to = function(properties, duration) {
        if (duration !== null) {
            _duration = duration
        }
        _valuesEnd = properties;
        return this
    };
    this.start = function(time) {
        TWEEN.add(this);
        _startTime = time !== undefined ? time : Date.now();
        _startTime += _delayTime;
        for (var property in _valuesEnd) {
            if (_object[property] === null) {
                continue
            }
            if (_valuesEnd[property] instanceof Array) {
                if (_valuesEnd[property].length === 0) {
                    continue
                }
                _valuesEnd[property] = [_object[property]].concat(_valuesEnd[property])
            }
            _valuesStart[property] = _object[property]
        }
        return this
    };
    this.stop = function() {
        TWEEN.remove(this);
        return this
    };
    this.delay = function(amount) {
        _delayTime = amount;
        return this
    };
    this.easing = function(easing) {
        _easingFunction = easing;
        return this
    };
    this.interpolation = function(interpolation) {
        _interpolationFunction = interpolation;
        return this
    };
    this.chain = function(chainedTween) {
        _chainedTween = chainedTween;
        return this
    };
    this.onUpdate = function(onUpdateCallback) {
        _onUpdateCallback = onUpdateCallback;
        return this
    };
    this.onComplete = function(onCompleteCallback) {
        _onCompleteCallback = onCompleteCallback;
        return this
    };
    this.update = function(time) {
        if (time < _startTime) {
            return true
        }
        var elapsed = (time - _startTime) / _duration;
        elapsed = elapsed > 1 ? 1 : elapsed;
        var value = _easingFunction(elapsed);
        for (var property in _valuesStart) {
            var start = _valuesStart[property];
            var end = _valuesEnd[property];
            if (end instanceof Array) {
                _object[property] = _interpolationFunction(end, value)
            } else {
                _object[property] = start + (end - start) * value
            }
        }
        if (_onUpdateCallback !== null) {
            _onUpdateCallback.call(_object, value)
        }
        if (elapsed == 1) {
            if (_onCompleteCallback !== null) {
                _onCompleteCallback.call(_object)
            }
            if (_chainedTween !== null) {
                _chainedTween.start()
            }
            return false
        }
        return true
    }
};
TWEEN.Easing = {
    Linear: {
        None: function(k) {
            return k
        }
    },
    Quadratic: {
        In: function(k) {
            return k * k
        },
        Out: function(k) {
            return k * (2 - k)
        },
        InOut: function(k) {
            if ((k *= 2) < 1) return .5 * k * k;
            return -.5 * (--k * (k - 2) - 1)
        }
    },
    Cubic: {
        In: function(k) {
            return k * k * k
        },
        Out: function(k) {
            return --k * k * k + 1
        },
        InOut: function(k) {
            if ((k *= 2) < 1) return .5 * k * k * k;
            return .5 * ((k -= 2) * k * k + 2)
        }
    },
    Quartic: {
        In: function(k) {
            return k * k * k * k
        },
        Out: function(k) {
            return 1 - --k * k * k * k
        },
        InOut: function(k) {
            if ((k *= 2) < 1) return .5 * k * k * k * k;
            return -.5 * ((k -= 2) * k * k * k - 2)
        }
    },
    Quintic: {
        In: function(k) {
            return k * k * k * k * k
        },
        Out: function(k) {
            return --k * k * k * k * k + 1
        },
        InOut: function(k) {
            if ((k *= 2) < 1) return .5 * k * k * k * k * k;
            return .5 * ((k -= 2) * k * k * k * k + 2)
        }
    },
    Sinusoidal: {
        In: function(k) {
            return 1 - Math.cos(k * Math.PI / 2)
        },
        Out: function(k) {
            return Math.sin(k * Math.PI / 2)
        },
        InOut: function(k) {
            return .5 * (1 - Math.cos(Math.PI * k))
        }
    },
    Exponential: {
        In: function(k) {
            return k === 0 ? 0 : Math.pow(1024, k - 1)
        },
        Out: function(k) {
            return k === 1 ? 1 : 1 - Math.pow(2, -10 * k)
        },
        InOut: function(k) {
            if (k === 0) return 0;
            if (k === 1) return 1;
            if ((k *= 2) < 1) return .5 * Math.pow(1024, k - 1);
            return .5 * (-Math.pow(2, -10 * (k - 1)) + 2)
        }
    },
    Circular: {
        In: function(k) {
            return 1 - Math.sqrt(1 - k * k)
        },
        Out: function(k) {
            return Math.sqrt(1 - --k * k)
        },
        InOut: function(k) {
            if ((k *= 2) < 1) return -.5 * (Math.sqrt(1 - k * k) - 1);
            return .5 * (Math.sqrt(1 - (k -= 2) * k) + 1)
        }
    },
    Elastic: {
        In: function(k) {
            var s, a = .1,
                p = .4;
            if (k === 0) return 0;
            if (k === 1) return 1;
            if (!a || a < 1) {
                a = 1;
                s = p / 4
            } else s = p * Math.asin(1 / a) / (2 * Math.PI);
            return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p))
        },
        Out: function(k) {
            var s, a = .1,
                p = .4;
            if (k === 0) return 0;
            if (k === 1) return 1;
            if (!a || a < 1) {
                a = 1;
                s = p / 4
            } else s = p * Math.asin(1 / a) / (2 * Math.PI);
            return a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1
        },
        InOut: function(k) {
            var s, a = .1,
                p = .4;
            if (k === 0) return 0;
            if (k === 1) return 1;
            if (!a || a < 1) {
                a = 1;
                s = p / 4
            } else s = p * Math.asin(1 / a) / (2 * Math.PI); if ((k *= 2) < 1) return -.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
            return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * .5 + 1
        }
    },
    Back: {
        In: function(k) {
            var s = 1.70158;
            return k * k * ((s + 1) * k - s)
        },
        Out: function(k) {
            var s = 1.70158;
            return --k * k * ((s + 1) * k + s) + 1
        },
        InOut: function(k) {
            var s = 1.70158 * 1.525;
            if ((k *= 2) < 1) return .5 * (k * k * ((s + 1) * k - s));
            return .5 * ((k -= 2) * k * ((s + 1) * k + s) + 2)
        }
    },
    Bounce: {
        In: function(k) {
            return 1 - TWEEN.Easing.Bounce.Out(1 - k)
        },
        Out: function(k) {
            if (k < 1 / 2.75) {
                return 7.5625 * k * k
            } else if (k < 2 / 2.75) {
                return 7.5625 * (k -= 1.5 / 2.75) * k + .75
            } else if (k < 2.5 / 2.75) {
                return 7.5625 * (k -= 2.25 / 2.75) * k + .9375
            } else {
                return 7.5625 * (k -= 2.625 / 2.75) * k + .984375
            }
        },
        InOut: function(k) {
            if (k < .5) return TWEEN.Easing.Bounce.In(k * 2) * .5;
            return TWEEN.Easing.Bounce.Out(k * 2 - 1) * .5 + .5
        }
    }
};
TWEEN.Interpolation = {
    Linear: function(v, k) {
        var m = v.length - 1,
            f = m * k,
            i = Math.floor(f),
            fn = TWEEN.Interpolation.Utils.Linear;
        if (k < 0) return fn(v[0], v[1], f);
        if (k > 1) return fn(v[m], v[m - 1], m - f);
        return fn(v[i], v[i + 1 > m ? m : i + 1], f - i)
    },
    Bezier: function(v, k) {
        var b = 0,
            n = v.length - 1,
            pw = Math.pow,
            bn = TWEEN.Interpolation.Utils.Bernstein,
            i;
        for (i = 0; i <= n; i++) {
            b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i)
        }
        return b
    },
    CatmullRom: function(v, k) {
        var m = v.length - 1,
            f = m * k,
            i = Math.floor(f),
            fn = TWEEN.Interpolation.Utils.CatmullRom;
        if (v[0] === v[m]) {
            if (k < 0) i = Math.floor(f = m * (1 + k));
            return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i)
        } else {
            if (k < 0) return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
            if (k > 1) return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
            return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i)
        }
    },
    Utils: {
        Linear: function(p0, p1, t) {
            return (p1 - p0) * t + p0
        },
        Bernstein: function(n, i) {
            var fc = TWEEN.Interpolation.Utils.Factorial;
            return fc(n) / fc(i) / fc(n - i)
        },
        Factorial: function() {
            var a = [1];
            return function(n) {
                var s = 1,
                    i;
                if (a[n]) return a[n];
                for (i = n; i > 1; i--) s *= i;
                return a[n] = s
            }
        }(),
        CatmullRom: function(p0, p1, p2, p3, t) {
            var v0 = (p2 - p0) * .5,
                v1 = (p3 - p1) * .5,
                t2 = t * t,
                t3 = t * t2;
            return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1
        }
    }
};
var BASE = BASE || {};
BASE.utils = BASE.utils || {};
BASE.gapiKey = "AIzaSyBs2P_LYvT8JFM7Ssz41j4jnsuaxEqkuZ8";
BASE.utils.keyToString = function(code) {
    "use strict";
    var keyCodeMap = {
        8: "backspace",
        9: "tab",
        13: "enter",
        16: "shift",
        17: "ctrl",
        18: "alt",
        19: "pausebreak",
        20: "capslock",
        27: "escape",
        32: " ",
        33: "pageup",
        34: "pagedown",
        35: "end",
        36: "home",
        37: "left",
        38: "up",
        39: "right",
        40: "down",
        43: "+",
        44: "printscreen",
        45: "insert",
        46: "delete",
        48: "0",
        49: "1",
        50: "2",
        51: "3",
        52: "4",
        53: "5",
        54: "6",
        55: "7",
        56: "8",
        57: "9",
        59: ";",
        61: "=",
        65: "a",
        66: "b",
        67: "c",
        68: "d",
        69: "e",
        70: "f",
        71: "g",
        72: "h",
        73: "i",
        74: "j",
        75: "k",
        76: "l",
        77: "m",
        78: "n",
        79: "o",
        80: "p",
        81: "q",
        82: "r",
        83: "s",
        84: "t",
        85: "u",
        86: "v",
        87: "w",
        88: "x",
        89: "y",
        90: "z",
        91: "cmd",
        96: "0",
        97: "1",
        98: "2",
        99: "3",
        100: "4",
        101: "5",
        102: "6",
        103: "7",
        104: "8",
        105: "9",
        106: "*",
        107: "+",
        109: "-",
        110: ".",
        111: "/",
        112: "f1",
        113: "f2",
        114: "f3",
        115: "f4",
        116: "f5",
        117: "f6",
        118: "f7",
        119: "f8",
        120: "f9",
        121: "f10",
        122: "f11",
        123: "f12",
        144: "numlock",
        145: "scrolllock",
        186: ";",
        187: "=",
        188: ",",
        189: "-",
        190: ".",
        191: "/",
        192: "`",
        219: "[",
        220: "\\",
        221: "]",
        222: "'"
    };
    return keyCodeMap[code]
};
BASE.utils.pcMap = function(ident, keycode) {
    "use strict";
    var code = parseInt(ident, 16) || keycode,
        keyCodeMap = {
            192: 96,
            189: 45,
            187: 61,
            219: 91,
            221: 93,
            220: 92,
            186: 59,
            222: 39,
            188: 44,
            190: 46,
            191: 47
        };
    return keyCodeMap[code] || code
};
BASE.utils.unicodeToKey = {};
BASE.utils.getKey = function(keyIdentifier) {
    var ident, code, key;
    if (typeof BASE.utils.unicodeToKey[keyIdentifier] != "undefined") {
        return BASE.utils.unicodeToKey[keyIdentifier]
    } else {
        ident = keyIdentifier.slice(2), code = parseInt(ident, 16), key = String.fromCharCode(code).toLowerCase();
        BASE.utils.unicodeToKey[keyIdentifier] = key;
        return key
    }
};
BASE.utils.keyToUnicode = {};
BASE.utils.getIdentifier = function(str) {
    var hex, code;
    if (typeof BASE.utils.keyToUnicode[str] != "undefined") {
        return BASE.utils.keyToUnicode[str]
    } else {
        code = str.toUpperCase().charCodeAt(0), hex = code.toString(16).toUpperCase();
        hex = "U+" + BASE.utils.zeroFill(hex, 4);
        BASE.utils.unicodeToKey[str] = hex;
        return hex
    }
};
BASE.utils.zeroFill = function(numberStr, width) {
    var fillZeroes = "0000";
    return fillZeroes.slice(0, width - numberStr.length) + numberStr
};
BASE.utils.keyNameToCode = function(char) {
    "use strict";
    var nameMap = {
        backspace: "8",
        tab: "9",
        enter: "13",
        shift: "16",
        ctrl: "17",
        alt: "18",
        pausebreak: "19",
        capslock: "20",
        escape: "27",
        " ": "32",
        pageup: "33",
        pagedown: "34",
        end: "35",
        home: "36",
        left: "37",
        up: "38",
        right: "39",
        down: "40",
        "+": "43",
        printscreen: "44",
        insert: "45",
        "delete": "46",
        0: "48",
        1: "49",
        2: "50",
        3: "51",
        4: "52",
        5: "53",
        6: "54",
        7: "55",
        8: "56",
        9: "57",
        ";": "59",
        "=": "61",
        a: "65",
        b: "66",
        c: "67",
        d: "68",
        e: "69",
        f: "70",
        g: "71",
        h: "72",
        i: "73",
        j: "74",
        k: "75",
        l: "76",
        m: "77",
        n: "78",
        o: "79",
        p: "80",
        q: "81",
        r: "82",
        s: "83",
        t: "84",
        u: "85",
        v: "86",
        w: "87",
        x: "88",
        y: "89",
        z: "90",
        cmd: "91",
        "*": "106",
        f1: "112",
        f2: "113",
        f3: "114",
        f4: "115",
        f5: "116",
        f6: "117",
        f7: "118",
        f8: "119",
        f9: "120",
        f10: "121",
        f11: "122",
        f12: "123",
        numlock: "144",
        scrolllock: "145",
        ",": "188",
        "-": "189",
        ".": "190",
        "/": "191",
        "`": "192",
        "[": "219",
        "\\": "220",
        "]": "221",
        "'": "222"
    };
    return parseInt(nameMap[char])
};
BASE.utils.equals = function(obj1, obj2) {
    var eq = true;
    if (typeof obj1 == "undefined" || typeof obj2 == "undefined") return false;
    for (member in obj1) {
        if (obj1.hasOwnProperty(member) && obj2.hasOwnProperty(member)) {
            if (obj1[member] != obj2[member]) eq = false
        } else {
            eq = false
        }
    }
    return eq
};
BASE.utils.toArray = function(obj) {
    var arr = [];
    for (member in obj) {
        var newitm;
        if (obj.hasOwnProperty(member)) {
            newitm = obj[member];
            newitm.ident = member;
            arr.push(newitm)
        }
    }
    return arr
};
BASE.utils.loadCss = function(arr, callback) {
    var is_array = typeof arr === "object" && arr.length ? true : false,
        needToLoad = is_array ? arr : [arr],
        count = needToLoad.length,
        loadedCss = [],
        head = document.getElementsByTagName("head")[0],
        that = this,
        has_callback = typeof callback != "undefined" ? true : false;
    if (typeof this.url_cache === "undefined") this.url_cache = [];

    function check_finished() {
        if (loadedCss.length === count && has_callback) {
            callback()
        }
    }
    needToLoad.forEach(function(url) {
        var node = document.createElement("link");
        node.addEventListener("load", onLoaded, false);
        node.addEventListener("error", onErrors, false);
        node.type = "text/css";
        node.rel = "stylesheet";
        node.href = url;
        if (that.url_cache.indexOf(url) == -1) {
            head.appendChild(node);
            that.url_cache.push(url)
        } else {
            loadedCss.push(node.href);
            check_finished()
        }

        function onLoaded(evt) {
            if (evt.type === "load") {
                node.removeEventListener("load", onLoaded, false);
                node.removeEventListener("error", onErrors, false);
                loadedCss.push(node.href);
                check_finished()
            }
        }

        function onErrors(evt) {
            BASE.errors++;
            if (BASE.errors > 1) {
                BASE.tell("loadingFailed")
            }
        }
    })
};
BASE.utils.loadScripts = function(arr, callback) {
    var count = arr.length,
        Events, loadedScripts = [],
        head = document.getElementsByTagName("head")[0];

    function check_finished() {
        if (loadedScripts.length === count) {
            callback()
        }
    }
    arr.forEach(function(url) {
        var node = document.createElement("script");
        node.type = "text/javascript";
        node.charset = "utf-8";
        node.setAttribute("async", "async");
        node.addEventListener("load", onLoaded, false);
        node.addEventListener("error", onErrors, false);
        node.src = url + ".js";
        head.appendChild(node);

        function onLoaded(evt) {
            if (evt.type === "load") {
                node.removeEventListener("load", onLoaded, false);
                node.removeEventListener("error", onErrors, false);
                loadedScripts.push(node.src);
                check_finished()
            }
        }

        function onErrors(evt) {
            BASE.errors++;
            if (BASE.errors > 1) {
                BASE.tell("loadingFailed")
            }
        }
    })
};
BASE.utils.preload = function(arr, callback) {
    var is_array = typeof arr === "object" && arr.length ? true : false,
        needToLoad = is_array ? arr : [arr],
        count = needToLoad.length,
        loadedImages = [],
        callback = callback || function() {};

    function check_finished() {
        if (loadedImages.length === count) {
            callback()
        }
    }
    needToLoad.forEach(function(url) {
        var img = new Image;
        img.addEventListener("load", onLoaded, false);
        img.addEventListener("error", onErrors, false);
        img.src = url;

        function onLoaded(evt) {
            if (evt.type === "load") {
                img.removeEventListener("load", onLoaded, false);
                img.removeEventListener("error", onErrors, false);
                loadedImages.push(img.src);
                check_finished();
                BASE.errors = 0
            }
        }

        function onErrors(evt) {
            BASE.errors++;
            if (BASE.errors > 1) {
                BASE.tell("loadingFailed")
            }
        }
    })
};
BASE.utils.shorten = function(longurl, callback) {
    if (typeof gapi === "undefined") return false;
    gapi.client.setApiKey(BASE.gapiKey);
    gapi.client.load("urlshortener", "v1", function() {
        var request = gapi.client.urlshortener.url.insert({
            resource: {
                longUrl: longurl
            }
        });
        var resp = request.execute(function(resp) {
            if (resp.error) {
                console.log("Shorten Error:", resp.error.message);
                callback(longurl)
            } else {
                callback(resp.id)
            }
        })
    })
};
BASE.utils.expand = function(shorturl, callback) {
    if (typeof gapi === "undefined") return false;
    gapi.client.setApiKey(BASE.gapiKey);
    gapi.client.load("urlshortener", "v1", function() {
        var request = gapi.client.urlshortener.url.get({
            shortUrl: shorturl
        });
        var resp = request.execute(function(resp) {
            if (resp.error) {} else {
                callback(resp.longUrl)
            }
        })
    })
};
BASE.utils.fastReverse = function(array) {
    var left = null,
        right = null,
        length = array.length,
        tmpArray = array.slice(0);
    for (left = 0; left < length / 2; left += 1) {
        right = length - 1 - left;
        var temporary = tmpArray[left];
        tmpArray[left] = tmpArray[right];
        tmpArray[right] = temporary
    }
    return tmpArray
};
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
};
String.prototype.titleCase = function() {
    return this.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
};
BASE.utils.remove = function(array, from, to) {
    var rest = array.slice((to || from) + 1 || array.length);
    array.length = from < 0 ? array.length + from : from;
    return array.push.apply(array, rest)
};
BASE.utils.removeItem = function(array, item) {
    var index = array.indexOf(item),
        rest;
    if (index != -1) {
        rest = array.slice(index + 1 || array.length);
        array.length = index < 0 ? array.length + index : index;
        return array.push.apply(array, rest)
    }
};
BASE.utils.getQueryParams = function() {
    var urlParams = {};
    var match, pl = /\+/g,
        search = /([^&=]+)=?([^&]*)/g,
        decode = function(s) {
            return decodeURIComponent(s.replace(pl, " "))
        },
        query = window.location.search.substring(1);
    while (match = search.exec(query)) urlParams[decode(match[1])] = decode(match[2]);
    return urlParams
};
BASE.utils.titleCase = function(str) {
    if (!str) return false;
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
};
BASE.utils.chromeVersion = function() {
    var version = false,
        agent = navigator.userAgent,
        regexd = /Chrome\/([\d]+)/.exec(agent);
    if (regexd && regexd[1]) {
        version = parseInt(regexd[1])
    }
    return version
};
BASE.utils.disableTabFocus = function() {
    $(document).keydown(function(e) {
        if (e.keyCode == 9) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation()
        }
    })
};
BASE.utils.getBase64Image = function(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png")
};
BASE.utils.prettyName = function(instrument) {
    var obj = {
        bass_pick: "Plectrum Bass Guitar",
        bass_finger: "Fingers Bass Guitar",
        bass_ac: "Acoustic Bass Guitar",
        guitar_crunch: "Crunch Electric Guitar",
        guitar_clean: "Classic Clean Electric Guitar",
        guitar_dist: "Distorted Electric Guitar",
        guitar_funky: "Funky Electric Guitar",
        guitar_steel: "Steel String Acoustic Guitar",
        guitar_nylon: "Nylon String Acoustic Guitar",
        drums_standard: "Standard Drums",
        drums_brushes: "Brushes Drums",
        dm_hiphop: "Hip-Hop Drum Machine",
        dm_techno: "Techno Drum Machine",
        dm_analogue: "Analogue Drum Machine",
        key_brass: "Keyboard Synth Brass",
        key_strings: "Keyboard Synth Strings",
        key_seq: "Arpeggio Synth Keyboard",
        key_piano: "Piano Keyboard",
        key_epiano: "Electric Piano Keyboard"
    };
    return obj[instrument]
};
jQuery.fn.extend({
    clickOutside: function(handler, exceptions) {
        var $this = this;
        jQuery("body").on("click.offer", function(event) {
            if (exceptions && jQuery.inArray(event.target, exceptions) > -1) {
                return
            } else if (jQuery.contains($this[0], event.target)) {
                return
            } else {
                jQuery("body").off("click.offer");
                handler(event, $this)
            }
        });
        return this
    }
});
jQuery.fn.extend({
    tween: function(toObject, speed, easeing, callback, delay, start) {
        var $this = this,
            fromObject = {},
            ease = easeing || TWEEN.Easing.Linear.None,
            speed = speed || 300,
            start = start || true,
            tweened;
        for (member in toObject) {
            if (toObject.hasOwnProperty(member)) {
                fromObject[member] = parseInt($this.css(member))
            }
        }
        tweened = new TWEEN.Tween(fromObject).to(toObject, speed).easing(ease).onUpdate(function() {
            $this.css(this)
        }).onComplete(function() {
            if (typeof callback === "function") {
                callback()
            }
        });
        if (delay) {
            tweened.delay(delay)
        }
        if (start) {
            tweened.start()
        }
        return tweened
    }
});
jQuery.fn.extend({
    translateSVG: function(x, y, speed, callback, noadd) {
        var $this = this,
            current = $this.attr("transform"),
            parseCurrent = /translate\((-?\d+),(-?\d+)\)/,
            parsed = current ? parseCurrent.exec(current) : false,
            fromObject = {
                x: 0,
                y: 0
            },
            toObject = {
                x: x,
                y: y
            },
            oldX, oldY, ease = TWEEN.Easing.Sinusoidal.Out,
            speed = speed || 300,
            start = true,
            tweened;
        if (parsed) {
            oldX = parseInt(parsed[1]);
            oldY = parseInt(parsed[2]);
            fromObject = {
                x: oldX,
                y: oldY
            };
            if (!noadd) {
                toObject = {
                    x: x + oldX,
                    y: y + oldY
                }
            }
        }
        tweened = new TWEEN.Tween(fromObject).to(toObject, speed).easing(ease).onUpdate(function() {
            $this.attr("transform", "translate(" + this.x + "," + this.y + ")")
        }).onComplete(function() {
            if (typeof callback === "function") {
                callback()
            }
        }).start();
        return tweened
    }
});
jQuery.fn.extend({
    move: function() {
        var $this = this.get(0);
        if ($this) {
            return move($this)
        }
        return
    }
});
jQuery.fn.extend({
    limitToNum: function() {
        this.keydown(function(event) {
            if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || event.keyCode == 65 && event.ctrlKey === true || event.keyCode >= 35 && event.keyCode <= 39) {
                return
            } else {
                if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                    event.preventDefault()
                }
            }
        })
    }
});
var consoleHolder = console;

function debug(bool) {
    if (!bool) {
        consoleHolder = console;
        console = {};
        console.log = function() {}
    } else console = consoleHolder
}
JAM.namespace("manager").views = function($) {
    "use strict";
    var hasFooter = false;

    function init() {
        var _$main = $("#main"),
            _$header = $("#header"),
            _$footer = $("#footer"),
            _tour;
        BASE.view.listen("view_welcome", function(viewHtml) {
            floodlight("817");
            gaq.push(["_trackPageview", "/homepage"]);
            _$main.html(viewHtml);
            BASE.render.partial("footer");
            JAM.controller.welcome();
            hasFooter = true
        });
        BASE.view.listen("view_accept", function(viewHtml, passed) {
            var accept_timeout;
            _$main.html(viewHtml);
            _$header.removeClass("full");
            _$footer.removeClass("double");
            BASE.render.partial("footer");
            JAM.controller.welcome(passed.id, passed.by);
            hasFooter = true
        });
        BASE.view.listen("view_join", function(viewHtml) {
            _$main.html(viewHtml);
            BASE.render.partial("footer");
            JAM.controller.welcome();
            JAM.controller.join();
            hasFooter = true
        });
        BASE.view.listen("view_select", function(viewHtml, passed) {
            floodlight("555");
            gaq.push(["_trackPageview", "/select"]);
            _$header.removeClass("full");
            _$footer.removeClass("double");
            _$main.html(viewHtml);
            JAM.controller.select(passed.id);
            if (!hasFooter) {
                BASE.render.partial("footer");
                hasFooter = true
            }
        });
        BASE.view.listen("spinner", function() {
            var connecting = BASE.render.t("connecting");
            _$main.html('<div id="metronome-loader"><div id="metronome-box"><div id="metronome-arm" class="on"></div></div><div id="loading">' + connecting + "</div></div>")
        });
        BASE.view.listen("view_session", function(viewHtml) {
            floodlight("618");
            gaq.push(["_trackPageview", "/session"]);
            var instruments, selected;
            JAM.instruments.switcher.init();
            instruments = JAM.instruments.switcher.getInstruments();
            selected = JAM.instruments.switcher.currentInstrument();
            _$main.html(viewHtml);
            _$footer.addClass("double");
            JAM.controller.session.init();
            JAM.controller.instrument();
            JAM.controller.session.share();
            JAM.controller.session.chat();
            BASE.render.partial("header", function() {
                $(".instrument_thumb " + selected).addClass("selected");
                JAM.manager.interface.scan(_$header);
                JAM.controller.header()
            }, {
                instruments: instruments
            });
            BASE.listen("view_change.session", function() {
                _$header.empty();
                JAM.manager.tips.destroy();
                JAM.controller.session.close();
                BASE.off("view_change.session");
                BASE.off(".header");
                BASE.off(".instrument_controller");
                $(document).off("keyup.easycontrols")
            })
        });
        BASE.view.listen("view_instrument", function(viewHtml) {
            var $holder = $(".instrument_holder");
            clearTimeout(_tour);
            _tour = setTimeout(function() {
                JAM.manager.tips.tour()
            }, 1e3)
        });
        BASE.view.listen("view_rejoin", function(viewHtml, passed) {
            gaq.push(["_trackPageview", "/rejoin"]);
            _$main.html(viewHtml);
            _$main.html(viewHtml);
            if (!hasFooter) {
                BASE.render.partial("footer");
                hasFooter = true
            }
            JAM.controller.welcome(passed.id);
            JAM.controller.accept(passed.id)
        });
        BASE.view.listen("view_error", function(viewHtml, passed) {
            floodlight("748");
            gaq.push(["_trackPageview", "/error/network-connection"]);
            _$main.html(viewHtml);
            if (!hasFooter) {
                BASE.render.partial("footer");
                hasFooter = true
            }
            JAM.controller.welcome(passed.id);
            JAM.controller.accept(passed.id)
        });
        BASE.view.listen("view_timeout", function(viewHtml) {
            _$main.html(viewHtml);
            if (!hasFooter) {
                BASE.render.partial("footer");
                hasFooter = true
            }
            JAM.controller.welcome();
            JAM.controller.accept()
        });
        BASE.view.listen("view_latency_error", function(viewHtml) {
            floodlight("748");
            gaq.push(["_trackPageview", "/join/error/high-latency"]);
            _$main.html(viewHtml);
            if (!hasFooter) {
                BASE.render.partial("footer");
                hasFooter = true
            }
            JAM.controller.welcome();
            JAM.controller.accept()
        });
        BASE.view.listen("view_upgrade", function(viewHtml) {
            _$main.html(viewHtml);
            BASE.render.partial("footer");
            hasFooter = true;
            _$footer.css("bottom", 0)
        });
        BASE.view.listen("view_ended", function(viewHtml) {
            floodlight("030");
            gaq.push(["_trackPageview", "/ended"]);
            BASE.off(".easycontrols");
            _$main.html(viewHtml);
            BASE.off(".easycontrols");
            JAM.controller.ended();
            if (!hasFooter) {
                BASE.render.partial("footer");
                hasFooter = true
            }
        });
        BASE.view.listen("partial_footer", function(viewHtml) {
            JAM.controller.footer()
        })
    }
    return init
}(jQuery);
(function(global, exports, perf) {
    "use strict";

    function fixSetTarget(param) {
        if (!param) return;
        if (!param.setTargetValueAtTime) param.setTargetValueAtTime = param.setTargetAtTime
    }
    if (window.hasOwnProperty("AudioContext")) {
        window.webkitAudioContext = AudioContext;
        AudioContext.prototype.internal_createGain = AudioContext.prototype.createGain;
        AudioContext.prototype.createGain = function() {
            var node = this.internal_createGain();
            fixSetTarget(node.gain);
            return node
        };
        AudioContext.prototype.internal_createDelay = AudioContext.prototype.createDelay;
        AudioContext.prototype.createDelay = function() {
            var node = this.internal_createDelay();
            fixSetTarget(node.delayTime);
            return node
        };
        AudioContext.prototype.internal_createBufferSource = AudioContext.prototype.createBufferSource;
        AudioContext.prototype.createBufferSource = function() {
            var node = this.internal_createBufferSource();
            if (!node.noteOn) node.noteOn = node.start;
            if (!node.noteGrainOn) node.noteGrainOn = node.start;
            if (!node.noteOff) node.noteOff = node.stop;
            fixSetTarget(node.playbackRate);
            return node
        };
        AudioContext.prototype.internal_createDynamicsCompressor = AudioContext.prototype.createDynamicsCompressor;
        AudioContext.prototype.createDynamicsCompressor = function() {
            var node = this.internal_createDynamicsCompressor();
            fixSetTarget(node.threshold);
            fixSetTarget(node.knee);
            fixSetTarget(node.ratio);
            fixSetTarget(node.reduction);
            fixSetTarget(node.attack);
            fixSetTarget(node.release);
            return node
        };
        AudioContext.prototype.internal_createBiquadFilter = AudioContext.prototype.createBiquadFilter;
        AudioContext.prototype.createBiquadFilter = function() {
            var node = this.internal_createBiquadFilter();
            fixSetTarget(node.frequency);
            fixSetTarget(node.detune);
            fixSetTarget(node.Q);
            fixSetTarget(node.gain);
            var enumValues = ["LOWPASS", "HIGHPASS", "BANDPASS", "LOWSHELF", "HIGHSHELF", "PEAKING", "NOTCH", "ALLPASS"];
            for (var i = 0; i < enumValues.length; ++i) {
                var enumValue = enumValues[i];
                var newEnumValue = enumValue.toLowerCase();
                if (!node.hasOwnProperty(enumValue)) {
                    node[enumValue] = newEnumValue
                }
            }
            return node
        };
        if (AudioContext.prototype.hasOwnProperty("createOscillator")) {
            AudioContext.prototype.internal_createOscillator = AudioContext.prototype.createOscillator;
            AudioContext.prototype.createOscillator = function() {
                var node = this.internal_createOscillator();
                if (!node.noteOn) node.noteOn = node.start;
                if (!node.noteOff) node.noteOff = node.stop;
                fixSetTarget(node.frequency);
                fixSetTarget(node.detune);
                var enumValues = ["SINE", "SQUARE", "SAWTOOTH", "TRIANGLE", "CUSTOM"];
                for (var i = 0; i < enumValues.length; ++i) {
                    var enumValue = enumValues[i];
                    var newEnumValue = enumValue.toLowerCase();
                    if (!node.hasOwnProperty(enumValue)) {
                        node[enumValue] = newEnumValue
                    }
                }
                if (!node.hasOwnProperty("setWaveTable")) {
                    node.setWaveTable = node.setPeriodicTable
                }
                return node
            }
        }
        AudioContext.prototype.internal_createPanner = AudioContext.prototype.createPanner;
        AudioContext.prototype.createPanner = function() {
            var node = this.internal_createPanner();
            var enumValues = {
                EQUALPOWER: "equalpower",
                HRTF: "HRTF",
                LINEAR_DISTANCE: "linear",
                INVERSE_DISTANCE: "inverse",
                EXPONENTIAL_DISTANCE: "exponential"
            };
            for (var enumValue in enumValues) {
                var newEnumValue = enumValues[enumValue];
                if (!node.hasOwnProperty(enumValue)) {
                    node[enumValue] = newEnumValue
                }
            }
            return node
        };
        if (!AudioContext.prototype.hasOwnProperty("createGainNode")) AudioContext.prototype.createGainNode = AudioContext.prototype.createGain;
        if (!AudioContext.prototype.hasOwnProperty("createDelayNode")) AudioContext.prototype.createDelayNode = AudioContext.prototype.createDelay;
        if (!AudioContext.prototype.hasOwnProperty("createJavaScriptNode")) AudioContext.prototype.createJavaScriptNode = AudioContext.prototype.createScriptProcessor;
        if (!AudioContext.prototype.hasOwnProperty("createWaveTable")) AudioContext.prototype.createWaveTable = AudioContext.prototype.createPeriodicWave
    }
})(window);
JAM.namespace("controller").welcome = function($) {
    "use strict";
    var _$main, _$startButton, _$window, _$body, _$welcome, _$logo, _currentNum, _sessionId, _invitedBy, _invitedClient, _onDisconnected, _onUpdated, _logo, _sound, _exiting = true;

    function init(session, invitedby) {
        var $enter = $("#enter"),
            $chevron = $("#chevron-intro"),
            $footer = $("#footer"),
            $own = $("#own"),
            $tagline = $("#tagline"),
            $chrome = $("#chrome-experiment");
        _$main = $("#main");
        _$welcome = $("#welcome");
        _$body = $("body");
        _$logo = $("#logo");
        _sessionId = session;
        BASE.listen("updateSessionId.welcome", function(e) {
            _sessionId = e.sessionId
        });
        $footer.tween({
            bottom: 0
        }, 600, TWEEN.Easing.Cubic.Out, function() {}, false).start();
        _sound = new JAM.model.AudioPlayer("http://chrome-jam-static.commondatastorage.googleapis.com/sounds/soundlogo_jam.mp3", function(s) {
            s.play()
        });
        _logo = new JAM.model.Swiffy("http://chrome-jam-static.commondatastorage.googleapis.com/swiffy/logo.json", _$logo, function(swiffy) {
            swiffy.start();
            setTimeout(function() {
                _$logo.css("z-index", 15);
                $tagline.fadeIn(150);
                $chrome.addClass("show");
                _exiting = false
            }, 1500)
        });
        _$logo.on("click", function() {
            $enter.trigger("mouseup")
        });
        $enter.on("mouseup", function() {
            if (!_exiting) {
                _exiting = true;
                BASE.off("updateSessionID.welcome");
                setTimeout(function() {
                    if (_logo) _logo.stop();
                    if (_sessionId) {
                        BASE.router.path("/select/" + _sessionId + "/")
                    } else {
                        BASE.router.path("/select/")
                    }
                }, 1e3);
                if (_logo) _logo.outro();
                $enter.addClass("active");
                $enter.fadeOut(100);
                $tagline.fadeOut(100);
                $chrome.removeClass("show");
                BASE.off(".accept")
            }
        });
        $(document).on("keydown.welcome", function(e) {
            var code = BASE.utils.keyToString(e.keyCode);
            if (code === "enter") {
                $enter.trigger("mouseup");
                $(document).off(".welcome")
            }
        });
        center();
        $own.on("click", function(e) {
            if (_logo) _logo.outro();
            setTimeout(function() {
                if (_logo) _logo.stop();
                JAM.entered = true;
                JAM.manager.broadcaster.close();
                BASE.router.path("/select/")
            }, 1e3);
            e.preventDefault()
        });
        setTimeout(function() {
            var chev = new JAM.model.Chevron($chevron, 30, true, 600);
            $chevron.show()
        }, 600);
        _$body.css("background", "#fff");
        JAM.entered = true;
        BASE.utils.preload("http://chrome-jam-static.commondatastorage.googleapis.com/img/interface/all_select.png")
    }

    function center() {
        var $holder = _$welcome,
            $window = $(window),
            $logo = $("#logo"),
            topHeight = 100,
            bottomHeight = 30,
            logoMax = 300,
            vertCenter = function() {
                var calc = $window.height() / 2 - $holder.height() / 2 - bottomHeight,
                    top = calc >= topHeight ? calc : topHeight,
                    windowFourth = $window.height() / 3,
                    logoHeight = windowFourth <= logoMax ? windowFourth : logoMax;
                if (logoHeight < 150) {
                    logoHeight = 150
                }
                $holder.css({
                    "padding-top": top
                });
                $logo.height(logoHeight)
            };
        $window.on("resize", function() {
            vertCenter()
        });
        vertCenter()
    }

    function storeImages() {
        var $chromeExp = $("#chrome-experiment a img")[0],
            $twitter = $("#footer #twitter img")[0],
            $facebook = $("#footer #facebook img")[0],
            $gplus = $("#footer #gplus img")[0],
            $chrome = $("#footer #chrome a img")[0];
        if ($chromeExp) localStorage.setItem("chromeExpImg", BASE.utils.getBase64Image($chromeExp));
        if ($twitter) localStorage.setItem("twitterIcon", BASE.utils.getBase64Image($twitter));
        if ($facebook) localStorage.setItem("facebookIcon", BASE.utils.getBase64Image($facebook));
        if ($gplus) localStorage.setItem("gplusIcon", BASE.utils.getBase64Image($gplus));
        if ($chrome) localStorage.setItem("chromeIcon", BASE.utils.getBase64Image($chrome))
    }

    function getLocalImages() {
        var $chromeExp = $("#chrome-experiment a img"),
            $twitter = $("footer #twitter img"),
            $facebook = $("footer #facebook img"),
            $gplus = $("footer #gplus img"),
            $chrome = $("footer #chrome a img");
        $chromeExp.attr("src", localStorage.getItem("chromeExpImg"));
        $twitter.attr("src", localStorage.getItem("twitterIcon"));
        $facebook.attr("src", localStorage.getItem("facebookIcon"));
        $gplus.attr("src", localStorage.getItem("gplusIcon"));
        $chrome.attr("src", localStorage.getItem("chromeIcon"))
    }
    return init
}(jQuery);