function EventDispatcher() {
    this._listeners = {};
    this._globalListeners = []
}

function cb_setSweep(e, t) {
    e.setSweep(t)
}
var DMAF = DMAF || {};
DMAF.Synth = DMAF.Synth || {};
DMAF.Actions = DMAF.Actions || {};
DMAF.Managers = DMAF.Managers || {};
DMAF.Factories = DMAF.Factories || {};
DMAF.Processors = DMAF.Processors || {};
DMAF.AudioNodes = DMAF.AudioNodes || {};
DMAF.Iterators = DMAF.Iterators || {};
DMAF.Sounds = DMAF.Sounds || {};
DMAF.Utils = DMAF.Utils || {};
DMAF.baseUrl = window.location.origin;
DMAF.soundsPath = "http://chrome-jam-static.commondatastorage.googleapis.com/sounds/";
DMAF.midiPath = "http://chrome-jam-static.commondatastorage.googleapis.com/midi/";
DMAF.preListen = 30;
DMAF.FPS = 8;
DMAF.numberOfFrames = 8;
DMAF.currentFrame = 0;
DMAF.tempo = 460;
DMAF.dispatchFrames = false;
DMAF.formatPriorities = ["ogg"];
var canPlayFormat = function(e) {
    var t = document.createElement("audio");
    switch (e) {
        case "wav":
            return !!(t.canPlayType && t.canPlayType('audio/wav; codecs="1"').replace(/no/, ""));
        case "mp3":
            return !!(t.canPlayType && t.canPlayType("audio/mpeg;").replace(/no/, ""));
        case "aac":
            return !!(t.canPlayType && t.canPlayType('audio/mp4; codecs="mp4a.40.2"').replace(/no/, ""));
        case "ogg":
            return !!(t.canPlayType && t.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ""));
        default:
            DMAF.error("Can't play format", e);
            return false
    }
};
for (var i = 0; i < DMAF.formatPriorities.length; i++) {
    if (canPlayFormat(DMAF.formatPriorities[i])) {
        DMAF.fileFormat = "." + DMAF.formatPriorities[i];
        break
    } else {
        DMAF.fileFormat = false
    }
}
if (!DMAF.fileFormat) {
    DMAF.error("Couldn't play any of the wanted file formats!", DMAF.formatPriorities)
}
DMAF.actionsXMLsrc = "http://chrome-jam-static.commondatastorage.googleapis.com/xml/config.xml";
DMAF.libraryXMLList = [
    ["/xml/PreSounds.xml", false, "loadGlobal"]
];
EventDispatcher.prototype = {
    constructor: EventDispatcher,
    addEventListener: function(e, t) {
        if (e === "*") {
            this._globalListeners.push(t)
        } else {
            if (typeof this._listeners[e] == "undefined") {
                this._listeners[e] = []
            }
            this._listeners[e].push(t)
        }
    },
    removeEventListener: function(e, t) {
        if (this._listeners[e] instanceof Array) {
            var n = this._listeners[e];
            for (var r = 0; r < n.length; r++) {
                if (n[r] === t) {
                    n.splice(r, 1);
                    break
                }
            }
        }
    },
    dispatch: function(e, t) {
        if (typeof e == "string") {
            e = {
                type: e
            }
        } else {
            DMAF.debug("DMAFError: DMAF.dispatch needs a string as an argument. Dispatch aborted.");
            return
        } if (!e.target) {
            e.target = this
        }
        if (this._listeners[e.type] instanceof Array) {
            var n = this._listeners[e.type];
            for (var r = 0; r < n.length; r++) {
                n[r].call(this, e, t)
            }
        }
        for (var i = 0; i < this._globalListeners.length; i++) {
            this._globalListeners[i].call(this, e, t)
        }
    }
};
DMAF.AudioNodes.addNoise = function(e) {
    var t = new XMLHttpRequest;
    t.open("GET", DMAF.soundsPath + "brus.ogg", true);
    t.responseType = "arraybuffer";
    t.onload = function() {
        DMAF.context.decodeAudioData(t.response, function(t) {
            noiseBuffer = t;
            var n = DMAF.context.createBufferSource(),
                r = DMAF.context.createGainNode();
            n.buffer = noiseBuffer;
            n.loop = true;
            r.gain.value = .05;
            n.connect(r);
            r.connect(e);
            n.noteOn(DMAF.context.currentTime)
        }, function() {
            console.log("decoding audio data failed")
        })
    };
    t.send()
};
DMAF.AudioNodes.Distortion = function(e, t) {
    if (!isNaN(t)) {
        t = Math.max(t, -1);
        t = Math.min(t, 1)
    } else {
        t = 0
    } if (!isNaN(e)) {
        e = Math.max(e, 0);
        e = Math.min(e, 1)
    } else {
        e = 1
    }
    var n = DMAF.context,
        r = n.createWaveShaper(),
        i = n.createGainNode(),
        s = n.createGainNode();
    i.connect(r);
    r.connect(s);
    this.input = i;
    this.distortion = r;
    this.output = s;
    this.setGain(e);
    this.setShape(t)
};
DMAF.AudioNodes.Distortion.prototype.connect = function(e) {
    this.output.connect(e)
};
DMAF.AudioNodes.Distortion.prototype.activate = function(e) {
    if (!e) {
        this.input.disconnect();
        this.input.connect(this.output)
    } else {
        this.input.disconnect();
        this.input.connect(this.distortion)
    }
};
DMAF.AudioNodes.Distortion.prototype.setGain = function(e) {
    e = Math.max(e, 0);
    e = Math.min(e, 1);
    this.input.gain.value = e
};
DMAF.AudioNodes.Distortion.prototype.setShape = function(e) {
    e = Math.max(e, -1);
    e = Math.min(e, 1)
};
DMAF.AudioNodes.Filter = function(e, t) {
    var n = DMAF.context.createBiquadFilter(),
        r = DMAF.context.createGainNode(),
        i = DMAF.context.createGainNode(),
        e = e || "lowpass",
        s = t.frequency || 0,
        o = t.q || 0,
        u = t.gain || 0;
    r.connect(n);
    n.connect(i);
    n.Q.value = o;
    n.gain.value = u;
    this.filter = n;
    this.input = r;
    this.output = i;
    this.q = n.Q;
    this.frequency = n.frequency;
    this.gain = n.gain;
    this.setFilterType(e);
    this.setFrequency(s);
    if (n.type === undefined) {
        console.log("Found no filter of type: " + e + ", setting to lowpass");
        n.type = "lowpass"
    }
};
DMAF.AudioNodes.Filter.prototype.connect = function(e) {
    this.output.connect(e)
};
DMAF.AudioNodes.Filter.prototype.activate = function(e) {
    if (!e) {
        this.input.disconnect();
        this.input.connect(this.output)
    } else {
        this.input.disconnect();
        this.input.connect(this.filter)
    }
};
DMAF.AudioNodes.Filter.prototype.setQ = function(e) {
    this.filter.Q.value = e
};
DMAF.AudioNodes.Filter.prototype.setGain = function(e) {
    e = Math.max(e, -46);
    e = Math.min(e, 6);
    this.filter.gain.value = e
};
DMAF.AudioNodes.Filter.prototype.setFrequency = function(e) {
    e = Math.max(e, 20);
    e = Math.min(e, 2e4);
    this.filter.frequency.cancelScheduledValues(0);
    this.filter.frequency.value = e;
    this.filter.frequency.setValueAtTime(e, DMAF.context.currentTime)
};
DMAF.AudioNodes.Filter.prototype.setFilterType = function(e) {
    var t = this.filter.type;
    this.filter.type = this.filterTypes[e];
    if (this.filter.type === undefined) {
        filter.type = t
    }
};
DMAF.AudioNodes.Filter.prototype.filterTypes = {
    lowpass: "lowpass",
    highpass: "highpass",
    bandpass: "bandpass",
    lowshelf: "lowshelf",
    highshelf: "highshelf",
    peaking: "peaking",
    notch: "notch",
    allpass: "allpass"
};
DMAF.AudioNodes.SlapbackDelay = function(e) {
    var t = DMAF.context.createGainNode(),
        n = DMAF.context.createDelayNode(),
        r = DMAF.context.createGainNode(),
        i = DMAF.context.createGainNode(),
        s = DMAF.context.createGainNode();
    n.delayTime.value = parseFloat(e.delayTime);
    r.gain.value = parseFloat(e.feedback);
    s.gain.value = parseFloat(e.wetLevel);
    t.connect(n);
    t.connect(i);
    n.connect(r);
    n.connect(s);
    r.connect(n);
    s.connect(i);
    this.input = t;
    this.output = i;
    this.delayNode = n;
    this.feedbackNode = r;
    this.wetLevel = s;
    this.properties = e;
    DMAF.AudioNodes.addNoise(this.input)
};
DMAF.AudioNodes.SlapbackDelay.prototype.route = function() {
    this.delayNode = DMAF.context.createDelayNode();
    this.feedbackNode = DMAF.context.createGainNode();
    this.wetLevel = DMAF.context.createGainNode();
    this.delayNode.delayTime.value = parseFloat(this.properties.delayTime);
    this.feedbackNode.gain.value = parseFloat(this.properties.feedback);
    this.wetLevel.gain.value = parseFloat(this.properties.wetLevel);
    this.input.connect(this.delayNode);
    this.input.connect(this.output);
    this.delayNode.connect(this.feedbackNode);
    this.delayNode.connect(this.wetLevel);
    this.feedbackNode.connect(this.delayNode);
    this.wetLevel.connect(this.output);
    DMAF.AudioNodes.addNoise(this.input)
};
DMAF.AudioNodes.SlapbackDelay.prototype.connect = function(e) {
    this.output.connect(e)
};
DMAF.AudioNodes.SlapbackDelay.prototype.setAutomatableProperty = function(e, t, n) {
    if (e === "bypass") {
        this.activate(t)
    } else {
        if (e === "level") {
            this.wetLevel.gain.value = t
        } else {
            if (e === "feedback") {
                this.feedbackNode.gain.value = t
            } else {
                if (e === "delay") {
                    this.delayNode.delayTime.value = t
                }
            }
        }
    }
};
DMAF.AudioNodes.SlapbackDelay.prototype.activate = function(e) {
    if (!e) {
        this.input.disconnect();
        this.input.connect(this.output)
    } else {
        this.input.disconnect();
        this.input.connect(this.delayNode);
        this.input.connect(this.output)
    }
};
DMAF.AudioNodes.SlapbackDelay.prototype.setLevel = function(e) {
    e = Math.max(0, e);
    e = Math.min(1, e);
    this.wetLevel.gain.value = e
};
DMAF.AudioNodes.SlapbackDelay.prototype.setFeedback = function(e) {
    e = Math.max(0, level);
    e = Math.min(1, level);
    this.feedbackNode.gain.value = e
};
DMAF.AudioNodes.SlapbackDelay.prototype.setDelay = function(e) {
    this.delayNode.delayTime.value = e
};
DMAF.AudioNodes.StereoDelay = function(e) {
    var t = DMAF.context.createGainNode(),
        n = DMAF.context.createChannelSplitter(2),
        r = new DMAF.AudioNodes.BpmDelay,
        i = new DMAF.AudioNodes.BpmDelay,
        s = DMAF.context.createGainNode(),
        o = DMAF.context.createGainNode(),
        u = DMAF.context.createChannelMerger(),
        a = DMAF.context.createGainNode(),
        f = DMAF.context.createGainNode();
    var l = e.subdivisionL;
    var c = e.subdivisionR;
    var h = parseFloat(e.feedback);
    var p = parseFloat(e.wetLevel);
    if (e.filterOn == 1) {
        var d = DMAF.context.createBiquadFilter();
        d.type = "highpass";
        d.frequency.value = parseFloat(e.filterFrequency);
        t.connect(d);
        d.connect(n)
    } else {
        t.connect(n)
    }
    n.connect(r.delay, 0, 0);
    n.connect(i.delay, 1, 0);
    r.delay.connect(s);
    i.delay.connect(o);
    s.connect(i.delay);
    o.connect(r.delay);
    r.delay.connect(u, 0, 0);
    i.delay.connect(u, 0, 1);
    u.connect(f);
    f.connect(a);
    t.connect(a);
    r.setDelayValue(l);
    i.setDelayValue(c);
    s.gain.value = h;
    o.gain.value = h;
    f.gain.value = p;
    this.input = t;
    this.output = a;
    this.firstNode = n;
    this.delayFeedbackL = s;
    this.delayFeedbackR = o;
    this.wetLevel = f;
    this.delayL = r;
    this.delayR = i;
    DMAF.AudioNodes.addNoise(this.input)
};
DMAF.AudioNodes.StereoDelay.prototype.connect = function(e) {
    this.output.connect(e)
};
DMAF.AudioNodes.StereoDelay.prototype.setAutomatableProperty = function(e, t, n) {
    if (e === "bypass") {
        this.activate(t)
    } else {
        if (e === "level") {
            this.wetLevel.gain.value = t
        } else {
            if (e === "feedback") {
                this.delayFeedbackL.gain.value = t;
                this.delayFeedbackR.gain.value = t
            }
        }
    }
};
DMAF.AudioNodes.StereoDelay.prototype.activate = function(e) {
    if (!e) {
        this.input.disconnect();
        this.input.connect(this.output)
    } else {
        this.input.disconnect();
        this.input.connect(this.firstNode);
        this.input.connect(this.output)
    }
};
DMAF.AudioNodes.StereoDelay.prototype.setLevel = function(e) {
    e = Math.max(0, e);
    e = Math.min(1, e);
    this.wetLevel.gain.value = e
};
DMAF.AudioNodes.StereoDelay.prototype.setFeedback = function(e) {
    e = Math.max(0, e);
    e = Math.min(1, e);
    this.delayFeedbackL.gain.value = e;
    this.delayFeedbackR.gain.value = e
};
DMAF.AudioNodes.StereoDelay.prototype.setTempo = function(e) {
    this.delayL.setTempo(e);
    this.delayR.setTempo(e)
};
DMAF.AudioNodes.StereoDelay.prototype.setDelayIndex = function(e, t) {
    this.delayL.setDelayIndex(e);
    if (t) {
        this.delayR.setDelayIndex(t)
    } else {
        this.delayR.setDelayIndex(t)
    }
};
DMAF.AudioNodes.StereoDelay.prototype.setSubdivision = function(e, t) {
    this.delayL.setDelayValue(e);
    if (t) {
        this.delayR.setDelayValue(t)
    } else {
        this.delayR.setDelayValue(e)
    }
};
DMAF.AudioNodes.PingPongDelay = function(e) {
    var t = DMAF.context.createGainNode(),
        n = DMAF.context.createGainNode(),
        r = DMAF.context.createChannelSplitter(2),
        i = DMAF.context.createGainNode(),
        s = DMAF.context.createGainNode(),
        o = new DMAF.AudioNodes.BpmDelay,
        u = new DMAF.AudioNodes.BpmDelay,
        a = DMAF.context.createChannelMerger(),
        f = DMAF.context.createGainNode();
    t.connect(r);
    r.connect(i, 0, 0);
    r.connect(i, 1, 0);
    i.gain.value = .5;
    i.connect(n);
    if (e.filterOn == 1) {
        var l = DMAF.context.createBiquadFilter();
        l.type = "highpass";
        l.frequency.value = parseFloat(e.filterFrequency);
        n.connect(l);
        l.connect(o.delay)
    } else {
        n.connect(o.delay)
    }
    s.connect(o.delay);
    o.delay.connect(u.delay);
    u.delay.connect(s);
    o.delay.connect(a, 0, 0);
    u.delay.connect(a, 0, 1);
    a.connect(f);
    t.connect(f);
    o.setDelayValue(e.subdivision);
    u.setDelayValue(e.subdivision);
    s.gain.value = parseFloat(e.feedback);
    n.gain.value = parseFloat(e.wetLevel);
    this.input = t;
    this.output = f;
    this.firstNode = r;
    this.wetLevel = n;
    this.feedbackLevel = s;
    this.stereoToMonoMix = i;
    this.delayL = o;
    this.delayR = u;
    this.merger = a;
    this.properties = e;
    DMAF.AudioNodes.addNoise(this.input)
};
DMAF.AudioNodes.PingPongDelay.prototype.route = function() {
    this.merger.disconnect();
    this.wetLevel = DMAF.context.createGainNode();
    this.firstNode = DMAF.context.createChannelSplitter(2);
    this.stereoToMonoMix = DMAF.context.createGainNode();
    this.feedbackLevel = DMAF.context.createGainNode();
    this.delayL = new DMAF.AudioNodes.BpmDelay;
    this.delayR = new DMAF.AudioNodes.BpmDelay;
    this.merger = DMAF.context.createChannelMerger();
    this.input.connect(this.firstNode);
    this.firstNode.connect(this.stereoToMonoMix, 0, 0);
    this.firstNode.connect(this.stereoToMonoMix, 1, 0);
    this.stereoToMonoMix.gain.value = .5;
    this.stereoToMonoMix.connect(this.wetLevel);
    if (this.properties.filterOn == 1) {
        var e = DMAF.context.createBiquadFilter();
        e.type = "highpass";
        e.frequency.value = parseFloat(this.properties.filterFrequency);
        this.wetLevel.connect(e);
        e.connect(this.delayL.delay)
    } else {
        this.wetLevel.connect(this.delayL.delay)
    }
    this.feedbackLevel.connect(this.delayL.delay);
    this.delayL.delay.connect(this.delayR.delay);
    this.delayR.delay.connect(this.feedbackLevel);
    this.delayL.delay.connect(this.merger, 0, 0);
    this.delayR.delay.connect(this.merger, 0, 1);
    this.merger.connect(this.output);
    this.input.connect(this.output);
    this.delayL.setDelayValue(this.properties.subdivision);
    this.delayR.setDelayValue(this.properties.subdivision);
    this.feedbackLevel.gain.value = parseFloat(this.properties.feedback);
    this.wetLevel.gain.value = parseFloat(this.properties.wetLevel);
    DMAF.AudioNodes.addNoise(this.input)
};
DMAF.AudioNodes.PingPongDelay.prototype.connect = function(e) {
    this.output.connect(e)
};
DMAF.AudioNodes.PingPongDelay.prototype.setAutomatableProperty = function(e, t, n) {
    if (e === "bypass") {
        this.activate(t)
    } else {
        if (e === "level") {
            this.wetLevel.gain.value = t
        } else {
            if (e === "feedback") {
                this.feedbackLevel.gain.value = t
            }
        }
    }
};
DMAF.AudioNodes.PingPongDelay.prototype.activate = function(e) {
    if (!e) {
        this.input.disconnect();
        this.input.connect(this.output)
    } else {
        this.input.disconnect();
        this.input.connect(this.firstNode);
        this.input.connect(this.output)
    }
};
DMAF.AudioNodes.PingPongDelay.prototype.setLevel = function(e) {
    e = Math.max(0, e);
    e = Math.min(1, e);
    this.wetLevel.gain.value = e
};
DMAF.AudioNodes.PingPongDelay.prototype.setFeedback = function(e) {
    e = Math.max(0, e);
    e = Math.min(1, e);
    this.feedbackLevel.gain.value = e
};
DMAF.AudioNodes.PingPongDelay.prototype.setTempo = function(e) {
    this.delayL.setTempo(e);
    this.delayR.setTempo(e)
};
DMAF.AudioNodes.PingPongDelay.prototype.setDelayIndex = function(e, t) {
    this.delayL.setDelayIndex(e);
    if (t) {
        this.delayR.setDelayIndex(t)
    } else {
        this.delayR.setDelayIndex(t)
    }
};
DMAF.AudioNodes.PingPongDelay.prototype.setSubdivision = function(e, t) {
    this.delayL.setDelayValue(e);
    if (t) {
        this.delayR.setDelayValue(t)
    } else {
        this.delayR.setDelayValue(e)
    }
};
DMAF.AudioNodes.Convolver = function(e) {
    var t = DMAF.context.createConvolver(),
        n = DMAF.context.createGainNode(),
        r = DMAF.context.createGainNode(),
        i = DMAF.context.createBiquadFilter(),
        s = DMAF.context.createBiquadFilter(),
        o = DMAF.context.createGainNode(),
        u = DMAF.context.createGainNode();
    var a = new XMLHttpRequest;
    a.open("GET", e.impulse, true);
    a.responseType = "arraybuffer";
    a.onreadystatechange = function() {
        if (a.readyState === 4) {
            if (a.status < 300 && a.status > 199 || a.status === 302) {
                DMAF.context.decodeAudioData(a.response, function(e) {
                    t.buffer = e
                }, function(e) {
                    if (e) {
                        console.error("error decoding data: " + e)
                    }
                })
            }
        }
    };
    a.send(null);
    i.type = "highpass";
    if (e.lowCutHz != null) {
        i.frequency.value = parseFloat(e.lowCutHz)
    } else {
        i.frequency.value = 20
    }
    s.type = "lowpass";
    if (e.highCutHz != null) {
        s.frequency.value = parseFloat(e.highCutHz)
    } else {
        s.frequency.value = DMAF.context.sampleRate / 2
    }
    r.gain.value = parseFloat(e.dryLevel);
    o.gain.value = parseFloat(e.wetLevel);
    n.connect(i);
    i.connect(s);
    s.connect(t);
    t.connect(o);
    o.connect(u);
    n.connect(r);
    r.connect(u);
    this.input = n;
    this.output = u;
    this.filterLo = i;
    this.filterHi = s;
    this.dryLevel = r;
    this.wetLevel = o;
    this.convolver = t
};
DMAF.AudioNodes.Convolver.prototype.connect = function(e) {
    this.output.connect(e)
};
DMAF.AudioNodes.Convolver.prototype.setAutomatableProperty = function(e, t, n) {
    if (n != null) {
        if (e === "bypass") {
            this.activate(t)
        } else {
            if (e === "level") {
                this.output.gain.setTargetValueAtTime(t, DMAF.context.currentTime + n, n * .63)
            } else {
                if (e === "wetLevel") {
                    this.wetLevel.gain.setTargetValueAtTime(t, DMAF.context.currentTime + n, n * .63)
                } else {
                    if (e === "dryLevel") {
                        this.dryLevel.gain.setTargetValueAtTime(t, DMAF.context.currentTime + n, n * .63)
                    }
                }
            }
        }
    } else {
        if (e === "bypass") {
            this.activate(t)
        } else {
            if (e === "level") {
                this.output.gain.value = t
            } else {
                if (e === "wetLevel") {
                    this.wetLevel.gain.value = t
                } else {
                    if (e === "dryLevel") {
                        this.dryLevel.gain.value = t
                    }
                }
            }
        }
    }
};
DMAF.AudioNodes.Convolver.prototype.activate = function(e) {
    if (!e) {
        this.input.disconnect();
        this.input.connect(this.output)
    } else {
        this.input.disconnect();
        this.input.connect(this.filterLo);
        this.input.connect(this.dryLevel)
    }
};
DMAF.AudioNodes.Convolver.prototype.setLevel = function(e) {
    e = Math.max(0, e);
    e = Math.min(1, e);
    this.output.gain.value = e
};
DMAF.AudioNodes.Convolver.prototype.setDryLevel = function(e) {
    e = Math.max(0, e);
    e = Math.min(1, e);
    this.dryLevel.gain.value = e
};
DMAF.AudioNodes.Convolver.prototype.setWetLevel = function(e) {
    e = Math.max(0, e);
    e = Math.min(1, e);
    this.wetLevel.gain.value = e
};
DMAF.AudioNodes.BpmDelay = function() {
    this.delay = DMAF.context.createDelayNode();
    this.tempo = DMAF.Processors.getMusicController().player.tempo;
    this.noteDivision = this.times[6];
    DMAF.Processors.getMusicController().player.tempoObservers.push(this);
    this.updateDelayTime()
};
DMAF.AudioNodes.BpmDelay.prototype.setTempo = function(e) {
    this.tempo = e;
    this.updateDelayTime()
};
DMAF.AudioNodes.BpmDelay.prototype.setDelayValue = function(e) {
    var t = 6;
    if (e == "32") {
        t = 0
    } else {
        if (e == "16T") {
            t = 1
        } else {
            if (e == "32D") {
                t = 2
            } else {
                if (e == "16") {
                    t = 3
                } else {
                    if (e == "8T") {
                        t = 4
                    } else {
                        if (e == "16D") {
                            t = 5
                        } else {
                            if (e == "8") {
                                t = 6
                            } else {
                                if (e == "4T") {
                                    t = 7
                                } else {
                                    if (e == "8D") {
                                        t = 8
                                    } else {
                                        if (e == "4") {
                                            t = 9
                                        } else {
                                            if (e == "2T") {
                                                t = 10
                                            } else {
                                                if (e == "4D") {
                                                    t = 11
                                                } else {
                                                    if (e == "2") {
                                                        t = 12
                                                    } else {
                                                        if (e == "2D") {
                                                            t = 13
                                                        } else {
                                                            console.error("bad BPM index")
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    this.setDelayIndex(t)
};
DMAF.AudioNodes.BpmDelay.prototype.setDelayIndex = function(e) {
    this.noteDivision = this.times[e];
    this.updateDelayTime()
};
DMAF.AudioNodes.BpmDelay.prototype.updateDelayTime = function() {
    var e = 60 * this.noteDivision / this.tempo;
    this.delay.delayTime.value = e
};
DMAF.AudioNodes.BpmDelay.prototype.times = [1 / 8, 1 / 4 * 2 / 3, 1 / 8 * 3 / 2, 1 / 4, 1 / 2 * 2 / 3, 1 / 4 * 3 / 2, 1 / 2, 1 * 2 / 3, 1 / 2 * 3 / 2, 1, 2 * 2 / 3, 1 * 3 / 2, 2, 3];
DMAF.AudioNodes.WahWah = function(e) {
    var t = DMAF.context.createGainNode(),
        n = new DMAF.AudioNodes.EnvelopeFollower(.003, .5, this, cb_setSweep),
        r = DMAF.context.createBiquadFilter(),
        i = DMAF.context.createBiquadFilter(),
        s = DMAF.context.createGainNode();
    var o = e.ebableAutoMode;
    r = DMAF.context.createBiquadFilter();
    r.type = "bandpass";
    r.Q.value = 1;
    r.frequency.value = 100;
    i = DMAF.context.createBiquadFilter();
    i.type = "peaking";
    i.Q.value = 5;
    i.frequency.value = 100;
    i.gain.value = 20;
    if (o) {
        t.connect(n.input)
    }
    t.connect(r);
    r.connect(i);
    i.connect(s);
    this.input = t;
    this.output = s;
    this.filterBp = r;
    this.filterPeaking = i;
    this.envelopeFollower = n;
    this.enableAutoMode = o;
    this.baseFrequency = parseFloat(e.baseFrequency);
    this.excursionOctaves = parseInt(e.excursionOctaves);
    this.excursionFrequency = this.baseFrequency * Math.pow(2, this.excursionOctaves);
    this.sweep = parseFloat(e.sweep);
    this.resonance = parseFloat(e.resonance);
    this.sensitivity = Math.pow(10, parseFloat(e.sensitivity));
    this.output.gain.value = 5;
    this.filterBp.frequency.value = this.baseFrequency + this.excursionFrequency * this.sweep;
    this.filterPeaking.frequency.value = this.baseFrequency + this.excursionFrequency * this.sweep;
    if (this.enableAutoMode) {
        this.setAutomode(this.enableAutoMode)
    }
};
DMAF.AudioNodes.WahWah.prototype.connect = function(e) {
    this.output.connect(e)
};
DMAF.AudioNodes.WahWah.prototype.setAutomatableProperty = function(e, t, n) {
    if (e === "bypass") {
        this.activate(t)
    } else {
        if (e === "baseFrequency") {
            this.baseFrequency = t;
            this.excursionFrequency = Math.min(DMAF.context.sampleRate / 2, this.baseFrequency * Math.pow(2, this.excursionOctaves));
            this.filterBp.frequency.value = this.baseFrequency + this.excursionFrequency * this.sweep;
            this.filterPeaking.frequency.value = this.baseFrequency + this.excursionFrequency * this.sweep
        } else {
            if (e === "sensitivity") {
                this.sensitivity = Math.pow(10, t)
            }
        }
    }
};
DMAF.AudioNodes.WahWah.prototype.activate = function(e) {
    if (!e) {
        this.input.disconnect();
        this.input.connect(this.output)
    } else {
        this.input.disconnect();
        this.input.connect(this.filterBp);
        if (this.enableAutoMode) {
            this.input.connect(this.envelopeFollower.input)
        }
    }
};
DMAF.AudioNodes.WahWah.prototype.setBaseFrequency = function(e) {
    this.baseFrequency = 50 * Math.pow(10, e * 2);
    this.excursionFrequency = Math.min(DMAF.context.sampleRate / 2, this.baseFrequency * Math.pow(2, this.excursionOctaves));
    this.filterBp.frequency.value = this.baseFrequency + this.excursionFrequency * this.sweep;
    this.filterPeaking.frequency.value = this.baseFrequency + this.excursionFrequency * this.sweep
};
DMAF.AudioNodes.WahWah.prototype.setExcursionOctaves = function(e) {
    this.excursionOctaves = e;
    this.excursionFrequency = Math.min(DMAF.context.sampleRate / 2, this.baseFrequency * Math.pow(2, this.excursionOctaves));
    this.filterBp.frequency.value = this.baseFrequency + this.excursionFrequency * this.sweep;
    this.filterPeaking.frequency.value = this.baseFrequency + this.excursionFrequency * this.sweep
};
DMAF.AudioNodes.WahWah.prototype.setSweep = function(e) {
    e = Math.max(0, e);
    e = Math.min(1, e);
    this.sweep = Math.pow(e, this.sensitivity);
    this.filterBp.frequency.value = this.baseFrequency + this.excursionFrequency * this.sweep;
    this.filterPeaking.frequency.value = this.baseFrequency + this.excursionFrequency * this.sweep
};
DMAF.AudioNodes.WahWah.prototype.setSensitivity = function(e) {
    e = Math.max(-1, e);
    e = Math.min(1, e);
    this.sensitivity = Math.pow(10, e)
};
DMAF.AudioNodes.WahWah.prototype.setResonance = function(e) {
    this.filterPeaking.Q.value = e
};
DMAF.AudioNodes.WahWah.prototype.setAutomode = function(e) {
    this.enableAutoMode = e;
    if (this.enableAutoMode) {
        this.input.connect(this.envelopeFollower.input);
        this.envelopeFollower.start()
    } else {
        this.envelopeFollower.stop();
        this.input.disconnect();
        this.input.connect(this.filterBp)
    }
};
DMAF.AudioNodes.WahWah.prototype.getBaseFrequency = function() {
    return this.baseFrequency
};
DMAF.AudioNodes.WahWah.prototype.getExcursionOctaves = function() {
    return this.excursionOctaves
};
DMAF.AudioNodes.WahWah.prototype.getSweep = function() {
    return this.sweep
};
DMAF.AudioNodes.WahWah.prototype.getSensitivity = function() {
    return this.sensitivity
};
DMAF.AudioNodes.WahWah.prototype.getResonance = function() {
    return this.resonance
};
DMAF.AudioNodes.WahWah.prototype.getAutomode = function() {
    return this.enableAutoMode
};
DMAF.AudioNodes.Overdrive = function(e) {
    var t = DMAF.context.createGainNode(),
        n = DMAF.context.createGainNode(),
        r = DMAF.context.createWaveShaper(),
        i = DMAF.context.createGainNode(),
        s = DMAF.context.createGainNode();
    t.connect(n);
    n.connect(r);
    r.connect(i);
    i.connect(s);
    this.input = t;
    this.inputDrive = n;
    this.waveshaper = r;
    this.outputGain = i;
    this.output = s;
    this.k_nSamples = 8192;
    this.ws_table = new Float32Array(this.k_nSamples);
    this.drive = parseFloat(e.drive);
    this.algorithmIndex = parseInt(e.algorithmIndex);
    this.outputGainLevel = parseFloat(e.outputGain);
    this.curveAmount = parseFloat(e.curveAmount);
    this.inputDrive.gain.value = Math.pow(10, this.drive / 20);
    this.outputGain.gain.value = Math.pow(10, this.outputGainLevel / 20);
    this.setAlgorithm(this.algorithmIndex)
};
DMAF.AudioNodes.Overdrive.prototype.setAutomatableProperty = function(e, t, n) {
    if (e === "bypass") {
        this.activate(t)
    } else {
        if (e === "drive") {
            this.inputDrive.gain.value = Math.pow(10, t / 20)
        } else {
            if (e === "outputGain") {
                this.outputGain.gain.value = Math.pow(10, t / 20)
            } else {
                if (e === "curveAmount") {
                    this.setCurveAmount(t)
                }
            }
        }
    }
};
DMAF.AudioNodes.Overdrive.prototype.connect = function(e) {
    this.output.connect(e)
};
DMAF.AudioNodes.Overdrive.prototype.activate = function(e) {
    if (!e) {
        this.input.disconnect();
        this.input.connect(this.output)
    } else {
        this.input.disconnect();
        this.input.connect(this.inputDrive)
    }
};
DMAF.AudioNodes.Overdrive.prototype.setDrive = function(e) {
    e = Math.max(0, e);
    e = Math.min(1, e);
    this.drive = -6 + 106 * e;
    this.inputDrive.gain.value = Math.pow(10, this.drive / 20)
};
DMAF.AudioNodes.Overdrive.prototype.setCurveAmount = function(e) {
    this.curveAmount = Math.max(0, e);
    this.curveAmount = Math.min(1, e);
    switch (this.algorithmIndex) {
        case 0:
            DMAF.AudioNodes.Overdrive.curveAlgo0(this.curveAmount, this.k_nSamples, this.ws_table);
            break;
        case 1:
            DMAF.AudioNodes.Overdrive.curveAlgo1(this.curveAmount, this.k_nSamples, this.ws_table);
            break;
        case 2:
            DMAF.AudioNodes.Overdrive.curveAlgo2(this.curveAmount, this.k_nSamples, this.ws_table);
            break;
        case 3:
            DMAF.AudioNodes.Overdrive.curveAlgo3(this.curveAmount, this.k_nSamples, this.ws_table);
            break;
        case 4:
            DMAF.AudioNodes.Overdrive.curveAlgo4(this.curveAmount, this.k_nSamples, this.ws_table);
            break;
        case 5:
            DMAF.AudioNodes.Overdrive.curveAlgo5(this.curveAmount, this.k_nSamples, this.ws_table);
            break
    }
    this.waveshaper.curve = this.ws_table
};
DMAF.AudioNodes.Overdrive.prototype.setOutputGain = function(e) {
    e = Math.max(0, e);
    e = Math.min(1, e);
    this.outputGainLevel = -26 + 31 * e;
    this.outputGain.gain.value = Math.pow(10, this.outputGainLevel / 20)
};
DMAF.AudioNodes.Overdrive.prototype.setAlgorithm = function(e) {
    this.algorithmIndex = Math.max(0, e);
    this.algorithmIndex = Math.min(5, e);
    this.setCurveAmount(this.curveAmount)
};
DMAF.AudioNodes.Overdrive.prototype.getDrive = function() {
    return this.drive
};
DMAF.AudioNodes.Overdrive.prototype.getAlgorithm = function() {
    return this.algorithmIndex
};
DMAF.AudioNodes.Overdrive.prototype.getCurveAmount = function() {
    return this.curveAmount
};
DMAF.AudioNodes.Overdrive.prototype.getWsTable = function() {
    return this.wsTable
};
DMAF.AudioNodes.Overdrive.prototype.getOutputGain = function() {
    return this.outputGainLevel
};
DMAF.AudioNodes.Overdrive.curveAlgo0 = function(e, t, n) {
    if (e >= 0 && e < 1) {
        var r = 2 * e / (1 - e);
        for (var i = 0; i < t; i += 1) {
            var s = i * 2 / t - 1;
            n[i] = (1 + r) * s / (1 + r * Math.abs(s))
        }
    }
};
DMAF.AudioNodes.Overdrive.curveAlgo1 = function(e, t, n) {
    for (var r = 0; r < t; r += 1) {
        var i = r * 2 / t - 1;
        var s = .5 * Math.pow(i + 1.4, 2) - 1;
        if (s >= 0) {
            s *= 5.8
        } else {
            s *= 1.2
        }
        n[r] = DMAF.Utils.tanh(s)
    }
};
DMAF.AudioNodes.Overdrive.curveAlgo2 = function(e, t, n) {
    e = 1 - e;
    for (var r = 0; r < t; r += 1) {
        var i = r * 2 / t - 1;
        var s;
        if (i < 0) {
            s = -Math.pow(Math.abs(i), e + .04)
        } else {
            s = Math.pow(i, e)
        }
        n[r] = DMAF.Utils.tanh(s * 2)
    }
};
DMAF.AudioNodes.Overdrive.curveAlgo3 = function(e, t, n) {
    e = 1 - e;
    if (e > .99) {
        e = .99
    }
    for (var r = 0; r < t; r += 1) {
        var i = r * 2 / t - 1;
        var s = Math.abs(i);
        var o;
        if (s < e) {
            o = s
        } else {
            if (s > e) {
                o = e + (s - e) / (1 + Math.pow((s - e) / (1 - e), 2))
            } else {
                if (s > 1) {
                    o = s
                }
            }
        }
        n[r] = DMAF.Utils.sign(i) * o * (1 / ((e + 1) / 2))
    }
};
DMAF.AudioNodes.Overdrive.curveAlgo4 = function(e, t, n) {
    for (var r = 0; r < t; r += 1) {
        var i = r * 2 / t - 1;
        if (i < -.08905) {
            n[r] = -3 / 4 * (1 - Math.pow(1 - (Math.abs(i) - .032857), 12) + 1 / 3 * (Math.abs(i) - .032847)) + .01
        } else {
            if (i >= -.08905 && i < .320018) {
                n[r] = -6.153 * i * i + 3.9375 * i
            } else {
                n[r] = .630035
            }
        }
    }
};
DMAF.AudioNodes.Overdrive.curveAlgo5 = function(e, t, n) {
    e = 2 + Math.round(e * 14);
    var r = Math.round(Math.pow(2, e - 1));
    for (var i = 0; i < t; i += 1) {
        var s = i * 2 / t - 1;
        n[i] = Math.round(s * r) / r
    }
};
DMAF.AudioNodes.LFO = function(e, t, n, r, i, s, o) {
    this.SR = e;
    this.buffer_size = 256;
    this.type = t;
    this.frequency = n;
    this.offset = r;
    this.oscillation = i;
    this.phase = 0;
    this.phaseInc = 2 * Math.PI * this.frequency * this.buffer_size / this.SR;
    var u = DMAF.context.createJavaScriptNode(this.buffer_size, 1, 1);
    u.onaudioprocess = process_lfo(this);
    this.jsNode = u;
    this.obj = s;
    this.callback = o
};
process_lfo = function(e) {
    function t(t) {
        e.compute()
    }
    return t
};
DMAF.AudioNodes.LFO.prototype.connect = function(e) {
    this.jsNode.connect(e)
};
DMAF.AudioNodes.LFO.prototype.setFrequency = function(e) {
    this.frequency = Math.max(0, e);
    this.frequency = Math.min(20, e);
    this.phaseInc = 2 * Math.PI * this.frequency * this.buffer_size / this.SR
};
DMAF.AudioNodes.LFO.prototype.setOscillation = function(e) {
    this.oscillation = e
};
DMAF.AudioNodes.LFO.prototype.setOffset = function(e) {
    this.offset = e
};
DMAF.AudioNodes.LFO.prototype.setPhase = function(e) {
    this.phase = e
};
DMAF.AudioNodes.LFO.prototype.compute = function() {
    this.phase += this.phaseInc;
    if (this.phase > 2 * Math.PI) {
        this.phase = 0
    }
    this.callback(this.obj, this.offset + this.oscillation * Math.sin(this.phase))
};
DMAF.AudioNodes.EnvelopeFollower = function(e, t, n, r) {
    this.buffersize = 256;
    this.SR = DMAF.context.sampleRate;
    var i = DMAF.context.createGainNode(),
        s = DMAF.context.createJavaScriptNode(this.buffersize, 1, 1);
    i.connect(s);
    this.mixBuffer = new Float32Array(this.buffersize);
    this.attackC = Math.exp(-1 / e * this.SR / this.buffersize);
    this.releaseC = Math.exp(-1 / t * this.SR / this.buffersize);
    this.envelope = 0;
    this.obj = n;
    this.callback = r;
    s.onaudioprocess = process_envelope(this);
    this.input = i;
    this.jsNode = s
};
DMAF.AudioNodes.EnvelopeFollower.prototype.connect = function(e) {
    this.jsNode.connect(e)
};
DMAF.AudioNodes.EnvelopeFollower.prototype.compute = function(e) {
    var t = e.inputBuffer.getChannelData(0).length;
    var n = e.inputBuffer.numberOfChannels;
    if (n > 1) {
        var r;
        var i = 0;
        var s = 0;
        var o;
        for (o = 0; o < t; ++o) {
            for (i = 0; i < n; ++i) {
                r = e.inputBuffer.getChannelData(i)[o];
                s += r * r / n
            }
        }
    } else {
        var r;
        var s = 0;
        for (var o = 0; o < t; ++o) {
            r = e.inputBuffer.getChannelData(0)[o];
            s += r * r
        }
    }
    s = Math.sqrt(s);
    if (this.envelope < s) {
        this.envelope *= this.attackC;
        this.envelope += (1 - this.attackC) * s
    } else {
        this.envelope *= this.releaseC;
        this.envelope += (1 - this.releaseC) * s
    }
    this.callback(this.obj, this.envelope)
};
DMAF.AudioNodes.EnvelopeFollower.prototype.start = function() {
    this.jsNode.connect(DMAF.context.destination);
    this.jsNode.onaudioprocess = process_envelope(this)
};
DMAF.AudioNodes.EnvelopeFollower.prototype.stop = function() {
    this.jsNode.disconnect();
    this.jsNode.onaudioprocess = null
};
process_envelope = function(e) {
    function t(t) {
        e.compute(t)
    }
    return t
};
DMAF.AudioNodes.Chorus = function(e) {
    var t = DMAF.context.createGainNode(),
        n = DMAF.context.createGainNode(),
        r = DMAF.context.createChannelSplitter(2),
        i = DMAF.context.createDelayNode(),
        s = DMAF.context.createDelayNode(),
        o = DMAF.context.createGainNode(),
        u = DMAF.context.createGainNode(),
        a = DMAF.context.createChannelMerger(2),
        f = DMAF.context.createGainNode();
    n.gain.value = .6934;
    t.connect(n);
    n.connect(f);
    n.connect(r);
    r.connect(i, 0);
    r.connect(s, 1);
    i.connect(o);
    s.connect(u);
    o.connect(s);
    u.connect(i);
    i.connect(a, 0, 0);
    s.connect(a, 0, 1);
    a.connect(f);
    this.currentFrequency = parseFloat(e.frequency);
    this.currentDelay = parseFloat(e.delay);
    this.currentDepth = parseFloat(e.depth);
    this.input = t;
    this.attenuator = n;
    this.splitter = r;
    this.delayL = i;
    this.delayR = s;
    this.feedbackGainNodeLR = o;
    this.feedbackGainNodeRL = u;
    this.currentDepth = 1;
    this.output = f;
    this.lfoL = new DMAF.AudioNodes.LFO(DMAF.context.sampleRate, "sin", this.currentFrequency, this.currentDelay, this.currentDelay * this.currentDepth, this, DMAF.AudioNodes.Chorus.cb_setDelayL);
    this.lfoR = new DMAF.AudioNodes.LFO(DMAF.context.sampleRate, "sin", this.currentFrequency, this.currentDelay, this.currentDelay * this.currentDepth, this, DMAF.AudioNodes.Chorus.cb_setDelayR);
    this.lfoR.setPhase(Math.PI / 2);
    this.lfoL.connect(DMAF.context.destination);
    this.lfoR.connect(DMAF.context.destination);
    this.delayL.delayTime = this.currentDelay;
    this.delayR.delayTime = this.currentDelay;
    this.feedbackGainNodeLR.gain.value = parseFloat(e.feedback);
    this.feedbackGainNodeRL.gain.value = parseFloat(e.feedback);
    DMAF.AudioNodes.addNoise(this.input)
};
DMAF.AudioNodes.Chorus.prototype.connect = function(e) {
    this.output.connect(e)
};
DMAF.AudioNodes.Chorus.cb_setDelayL = function(e, t) {
    e.delayL.delayTime.value = t
};
DMAF.AudioNodes.Chorus.cb_setDelayR = function(e, t) {
    e.delayR.delayTime.value = t
};
DMAF.AudioNodes.Chorus.prototype.setAutomatableProperty = function(e, t, n) {
    if (e === "bypass") {
        this.activate(t)
    } else {
        if (e === "depth") {
            this.currentDepth = t;
            this.lfoL.setOscillation(this.currentDepth * this.currentDelay);
            this.lfoR.setOscillation(this.currentDepth * this.currentDelay)
        } else {
            if (e === "frequency") {
                this.currentFrequency = t;
                this.lfoL.setFrequency(this.currentFrequency);
                this.lfoR.setFrequency(this.currentFrequency)
            } else {
                if (e === "feedback") {
                    this.feedbackGainNodeLR.gain.value = t;
                    this.feedbackGainNodeRL.gain.value = t
                }
            }
        }
    }
};
DMAF.AudioNodes.Chorus.prototype.activate = function(e) {
    if (!e) {
        this.input.disconnect();
        this.input.connect(this.output)
    } else {
        this.input.disconnect();
        this.input.connect(this.attenuator)
    }
};
DMAF.AudioNodes.Chorus.prototype.setDepth = function(e) {
    this.currentDepth = e;
    this.lfoL.setOscillation(this.currentDepth * this.currentDelay);
    this.lfoR.setOscillation(this.currentDepth * this.currentDelay)
};
DMAF.AudioNodes.Chorus.prototype.setRate = function(e) {
    this.currentFrequency = 8 * e;
    this.lfoL.setFrequency(this.currentFrequency);
    this.lfoR.setFrequency(this.currentFrequency)
};
DMAF.AudioNodes.Chorus.prototype.setFeedback = function(e) {
    this.feedbackGainNodeLR.gain.value = e;
    this.feedbackGainNodeRL.gain.value = e
};
DMAF.AudioNodes.Chorus.prototype.setDelay = function(e) {
    this.currentDelay = 2e-4 * Math.pow(10, e * 2);
    this.lfoL.setOffset(this.currentDelay);
    this.lfoR.setOffset(this.currentDelay);
    this.setDepth(this.currentDepth)
};
DMAF.AudioNodes.Chorus.prototype.getDepth = function() {
    return this.currentDepth
};
DMAF.AudioNodes.Chorus.prototype.getDelay = function() {
    return this.currentDelay
};
DMAF.AudioNodes.Chorus.prototype.getFeedback = function() {
    return this.feedbackGainNodeLR.gain.value
};
DMAF.AudioNodes.Chorus.prototype.getRate = function() {
    return this.currentFrequency
};
DMAF.AudioNodes.Compressor = function(e) {
    var t = DMAF.context.createDynamicsCompressor(),
        n = DMAF.context.createGainNode(),
        r = DMAF.context.createGainNode(),
        i = DMAF.context.createGainNode();
    t.threshold = parseFloat(e.threshold);
    t.knee = parseFloat(e.knee);
    t.ratio = parseFloat(e.ratio);
    t.attack = parseFloat(e.attack);
    t.release = parseFloat(e.release);
    n.connect(t);
    t.connect(r);
    r.connect(i);
    this.input = n;
    this.output = i;
    this.dynamicsCompressor = t;
    this.makeupGain = r;
    this.autoMakeup = e.autoMakeup;
    if (this.autoMakeup) {
        this.setAutomakeupState(this.autoMakeup)
    }
};
DMAF.AudioNodes.Compressor.prototype.connect = function(e) {
    this.output.connect(e)
};
DMAF.AudioNodes.Compressor.prototype.activate = function(e) {
    if (!e) {
        this.input.disconnect();
        this.input.connect(this.output)
    } else {
        this.input.disconnect();
        this.input.connect(this.dynamicsCompressor)
    }
};
DMAF.AudioNodes.Compressor.prototype.setThreshold = function(e) {
    e = Math.max(0, e);
    e = Math.min(1, e);
    this.dynamicsCompressor.threshold.value = -100 * e;
    if (this.autoMakeup) {
        this.setMakeup(this.computeMakeup())
    }
};
DMAF.AudioNodes.Compressor.prototype.setRatio = function(e) {
    e = Math.max(1, e);
    e = Math.min(50, e);
    this.dynamicsCompressor.ratio.value = e;
    if (this.autoMakeup) {
        this.setMakeup(this.computeMakeup())
    }
};
DMAF.AudioNodes.Compressor.prototype.setKnee = function(e) {
    e = Math.max(1, e);
    e = Math.min(40, e);
    this.dynamicsCompressor.knee.value = e;
    if (this.dynamicsCompressor.autoMakeup) {
        this.setMakeup(this.computeMakeup())
    }
};
DMAF.AudioNodes.Compressor.prototype.setAttack = function(e) {
    e = Math.max(0, e);
    e = Math.min(1, e);
    this.dynamicsCompressor.attack.value = .001 * Math.pow(10, 3 * e)
};
DMAF.AudioNodes.Compressor.prototype.setRelease = function(e) {
    e = Math.max(0, e);
    e = Math.min(1, e);
    this.dynamicsCompressor.release.value = .001 * Math.pow(10, 3 * e)
};
DMAF.AudioNodes.Compressor.prototype.setMakeup = function(e) {
    e = Math.max(1, e);
    this.makeupGain.gain.value = e
};
DMAF.AudioNodes.Compressor.prototype.setAutomakeupState = function(e) {
    if (e) {
        this.autoMakeup = true;
        this.setMakeup(this.computeMakeup())
    } else {
        this.automakeup = false
    }
};
DMAF.AudioNodes.Compressor.prototype.computeMakeup = function() {
    var e = 4;
    return -(this.dynamicsCompressor.threshold.value - this.dynamicsCompressor.threshold.value / this.dynamicsCompressor.ratio.value) / e
};
DMAF.AudioNodes.Compressor.prototype.getThreshold = function() {
    return this.dynamicsCompressor.threshold.value
};
DMAF.AudioNodes.Compressor.prototype.getRatio = function() {
    return this.dynamicsCompressor.ratio.value
};
DMAF.AudioNodes.Compressor.prototype.getKnee = function() {
    return this.dynamicsCompressor.knee.value
};
DMAF.AudioNodes.Compressor.prototype.getAttack = function() {
    return this.dynamicsCompressor.attack.value
};
DMAF.AudioNodes.Compressor.prototype.getRelease = function() {
    return this.dynamicsCompressor.release.value
};
DMAF.AudioNodes.Compressor.prototype.getMakeup = function() {
    return this.makeupGain.gain.value
};
DMAF.AudioNodes.Compressor.prototype.getReduction = function() {
    return this.dynamicsCompressor.reduction
};
DMAF.AudioNodes.Cabinet = function(e) {
    var t = new DMAF.AudioNodes.Convolver({
            impulse: e.impulsePath,
            dryLevel: 0,
            wetLevel: 1
        }),
        n = DMAF.context.createGainNode(),
        r = DMAF.context.createGainNode(),
        i = DMAF.context.createGainNode();
    n.connect(t.input);
    t.connect(r);
    r.connect(i);
    this.input = n;
    this.output = i;
    this.makeup = r;
    this.colvolver = t;
    this.makeup.gain.value = Math.pow(10, e.makeUpGain / 20)
};
DMAF.AudioNodes.Cabinet.prototype.connect = function(e) {
    this.output.connect(e)
};
DMAF.AudioNodes.Cabinet.prototype.activate = function(e) {
    if (!e) {
        this.input.disconnect();
        this.input.connect(this.output)
    } else {
        this.input.disconnect();
        this.input.connect(this.colvolver.input)
    }
};
DMAF.AudioNodes.Equalizer = function(e) {
    var t = DMAF.context.createGainNode(),
        n = DMAF.context.createGainNode();
    var r = parseInt(e.sections);
    var i = new Array(r);
    var s = Math.log(80) / Math.log(10);
    var o = Math.log(DMAF.context.sampleRate / 2) / Math.log(10);
    var u = (o - s) / (r - 1);
    var a;
    var f = t;
    for (var l = 0; l < r; ++l) {
        var c = DMAF.context.createBiquadFilter();
        c.type = "peaking";
        c.frequency.value = Math.pow(10, s + u * l);
        f.connect(c);
        f = c;
        i[l] = c
    }
    f.connect(n);
    i[0].type = "highpass";
    i[r - 1].type = "lowpass";
    for (var l = 0; l < r; ++l) {
        if (e["section" + l + "_frequency"] != null) {
            i[l].frequency.value = parseFloat(e["section" + l + "_frequency"])
        }
        if (e["section" + l + "_q"] != null) {
            i[l].Q.value = parseFloat(e["section" + l + "_q"])
        }
        if (e["section" + l + "_gain"] != null) {
            i[l].gain.value = parseFloat(e["section" + l + "_gain"])
        }
    }
    var h = 100;
    var p = new Float32Array(h);
    s = Math.log(20) / Math.log(10);
    u = (o - s) / (h - 1);
    for (var l = 0; l < h; ++l) {
        p[l] = Math.pow(10, s + u * l)
    }
    this.input = t;
    this.output = n;
    this.nbands = r;
    this.filters = i;
    this.nFrequencyPoints = h;
    this.cb = null;
    this.plotFrequencies = p;
    this.frequencyResponse = new Float32Array(this.nFrequencyPoints);
    this.frequencyResponseTemp = new Float32Array(this.nFrequencyPoints);
    this.phaseResponseTemp = new Float32Array(this.nFrequencyPoints);
    this.refreshFrequencyResponse()
};
DMAF.AudioNodes.Equalizer.prototype.connect = function(e) {
    this.output.connect(e)
};
DMAF.AudioNodes.Equalizer.prototype.activate = function(e) {
    if (!e) {
        this.input.disconnect();
        this.input.connect(this.output)
    } else {
        this.input.disconnect();
        this.input.connect(this.filters[0])
    }
};
DMAF.AudioNodes.Equalizer.prototype.setGain = function(e, t) {
    t = Math.max(0, t);
    t = Math.min(1, t);
    t = -60 + 120 * t;
    this.filters[e].gain.value = t;
    this.refreshFrequencyResponse()
};
DMAF.AudioNodes.Equalizer.prototype.setFrequency = function(e, t) {
    t = Math.max(0, t);
    t = Math.min(1, t);
    t = Math.pow(10, Math.log(DMAF.context.sampleRate / 2) / Math.log(10) * t);
    this.filters[e].frequency.value = t;
    this.refreshFrequencyResponse()
};
DMAF.AudioNodes.Equalizer.prototype.setQ = function(e, t) {
    t = Math.max(0, t);
    t = Math.min(1, t);
    t = 1 + 10 * t;
    this.filters[e].Q.value = t;
    this.refreshFrequencyResponse()
};
DMAF.AudioNodes.Equalizer.prototype.refreshFrequencyResponse = function() {
    if (this.cb == null) {
        return
    }
    this.filters[0].getFrequencyResponse(this.plotFrequencies, this.frequencyResponseTemp, this.phaseResponseTemp);
    for (var e = 0; e < this.nFrequencyPoints; ++e) {
        this.frequencyResponse[e] = this.frequencyResponseTemp[e]
    }
    for (var t = 1; t < this.nbands; ++t) {
        this.filters[t].getFrequencyResponse(this.plotFrequencies, this.frequencyResponseTemp, this.phaseResponseTemp);
        for (var e = 0; e < this.nFrequencyPoints; ++e) {
            this.frequencyResponse[e] *= this.frequencyResponseTemp[e]
        }
    }
    for (var e = 0; e < this.nFrequencyPoints; ++e) {
        this.frequencyResponse[e] = 20 * (Math.log(this.frequencyResponse[e]) / Math.log(10))
    }
    this.cb(this.plotFrequencies, this.frequencyResponse)
};
DMAF.AudioNodes.Equalizer.prototype.setGraphCallback = function(e) {
    this.cb = e;
    this.cb(this.plotFrequencies, this.frequencyResponse)
};
DMAF.AudioNodes.FxGroup = function(e) {
    var t = DMAF.context.createGainNode(),
        n = DMAF.context.createGainNode();
    this.input = t;
    this.output = n;
    this.innerEffects = []
};
DMAF.AudioNodes.FxGroup.prototype.connect = function(e) {
    this.output.connect(e)
};
DMAF.AudioNodes.FxGroup.prototype.getAutomatableProperties = function(e) {
    return this.innerEffects[parseInt(e)].effectNode
};
DMAF.AudioNodes.FxGroup.prototype.init = function() {
    var e = this.innerEffects.length;
    if (e > 0) {
        this.input.connect(this.innerEffects[0].effectNode.input);
        this.innerEffects[e - 1].effectNode.connect(this.output)
    }
};
DMAF.AudioNodes.FxGroup.prototype.activate = function(e) {
    if (!e) {
        this.input.disconnect();
        this.input.connect(this.output)
    } else {
        this.input.disconnect();
        this.input.connect(this.innerEffects[0].effectNode.input);
        this.init()
    }
};
DMAF.AudioNodes.Phaser = function(e) {
    var t = DMAF.context.createGainNode(),
        n = DMAF.context.createChannelSplitter(2),
        r = DMAF.context.createGainNode(),
        i = DMAF.context.createGainNode(),
        s = DMAF.context.createChannelMerger(2),
        o = DMAF.context.createGainNode(),
        u = DMAF.context.createGainNode();
    var a = [];
    var f = [];
    t.connect(n);
    var l = n;
    var c = n;
    a[0] = DMAF.context.createBiquadFilter();
    f[0] = DMAF.context.createBiquadFilter();
    a[0].type = "allpass";
    f[0].type = "allpass";
    n.connect(a[0], 0, 0);
    n.connect(f[0], 1, 0);
    for (var h = 1; h < 4; ++h) {
        a[h] = DMAF.context.createBiquadFilter();
        f[h] = DMAF.context.createBiquadFilter();
        a[h].type = "allpass";
        f[h].type = "allpass";
        l.connect(a[h]);
        c.connect(f[h]);
        l = f[h];
        c = f[h]
    }
    l.connect(r);
    c.connect(i);
    r.connect(a[0]);
    i.connect(f[0]);
    l.connect(s, 0, 0);
    c.connect(s, 0, 1);
    t.connect(u);
    s.connect(u);
    this.currentFrequency = parseFloat(e.frequency);
    this.baseModulationFrequency = 700;
    this.currentDepth = parseFloat(e.depth);
    this.currentStereoPhase = parseFloat(e.stereoPhase);
    this.currentFeedback = parseFloat(e.feedback);
    this.input = t;
    this.splitter = n;
    this.filtersL = a;
    this.filtersR = f;
    this.feedbackGainNodeL = r;
    this.feedbackGainNodeR = i;
    this.filteredSignal = o;
    this.output = u;
    this.lfoL = new DMAF.AudioNodes.LFO(DMAF.context.sampleRate, "sin", this.currentFrequency, this.baseModulationFrequency, this.baseModulationFrequency * this.currentDepth, this, DMAF.AudioNodes.Phaser.cb_setAllpassFrequencyL);
    this.lfoR = new DMAF.AudioNodes.LFO(DMAF.context.sampleRate, "sin", this.currentFrequency, this.baseModulationFrequency, this.baseModulationFrequency * this.currentDepth, this, DMAF.AudioNodes.Phaser.cb_setAllpassFrequencyR);
    this.lfoR.setPhase(this.currentStereoPhase * Math.PI / 180);
    this.lfoL.connect(DMAF.context.destination);
    this.lfoR.connect(DMAF.context.destination);
    r.gain.value = .4;
    i.gain.value = .4;
    DMAF.AudioNodes.addNoise(this.input)
};
DMAF.AudioNodes.Phaser.cb_setAllpassFrequencyL = function(e, t) {
    for (var n = 0; n < 4; ++n) {
        e.filtersL[n].frequency.value = t
    }
};
DMAF.AudioNodes.Phaser.cb_setAllpassFrequencyR = function(e, t) {
    for (var n = 0; n < 4; ++n) {
        e.filtersR[n].frequency.value = t
    }
};
DMAF.AudioNodes.Phaser.prototype.connect = function(e) {
    this.output.connect(e)
};
DMAF.AudioNodes.Phaser.prototype.setAutomatableProperty = function(e, t, n) {
    if (e === "bypass") {
        this.activate(t)
    } else {
        if (e === "depth") {
            this.currentDepth = t;
            this.lfoL.setOscillation(this.baseModulationFrequency * this.currentDepth);
            this.lfoR.setOscillation(this.baseModulationFrequency * this.currentDepth)
        } else {
            if (e === "frequency") {
                this.currentFrequency = t;
                this.lfoL.setFrequency(this.currentFrequency);
                this.lfoR.setFrequency(this.currentFrequency)
            } else {
                if (e === "feedback") {
                    this.feedbackGainNodeL.gain.value = t;
                    this.feedbackGainNodeR.gain.value = t
                }
            }
        }
    }
};
DMAF.AudioNodes.Phaser.prototype.activate = function(e) {
    if (!e) {
        this.input.disconnect();
        this.input.connect(this.output)
    } else {
        this.input.disconnect();
        this.input.connect(this.output);
        this.input.connect(this.splitter)
    }
};
DMAF.AudioNodes.Phaser.prototype.setDepth = function(e) {
    this.currentDepth = e;
    this.lfoL.setOscillation(this.baseModulationFrequency * this.currentDepth);
    this.lfoR.setOscillation(this.baseModulationFrequency * this.currentDepth)
};
DMAF.AudioNodes.Phaser.prototype.setRate = function(e) {
    this.currentFrequency = .1 + 10.9 * e;
    this.lfoL.setFrequency(this.currentFrequency);
    this.lfoR.setFrequency(this.currentFrequency)
};
DMAF.AudioNodes.Phaser.prototype.setBaseFrequency = function(e) {
    this.baseModulationFrequency = 500 + 1e3 * e;
    this.lfoL.setOffset(this.baseModulationFrequency);
    this.lfoR.setOffset(this.baseModulationFrequency);
    this.setDepth(this.currentDepth)
};
DMAF.AudioNodes.Phaser.prototype.setFeedback = function(e) {
    this.feedbackGainNodeL.gain.value = e;
    this.feedbackGainNodeR.gain.value = e
};
DMAF.AudioNodes.Phaser.prototype.setStereoPhase = function(e) {
    this.currentStereoPhase = e * 180;
    var t = this.lfoL.phase + this.currentStereoPhase * Math.PI / 180;
    t = DMAF.Utils.fmod(t, 2 * Math.PI);
    this.lfoR.setPhase(t)
};
DMAF.AudioNodes.Tremolo = function(e) {
    var t = DMAF.context.createGainNode(),
        n = DMAF.context.createChannelSplitter(2),
        r = DMAF.context.createGainNode(),
        i = DMAF.context.createGainNode(),
        s = DMAF.context.createChannelMerger(2),
        o = DMAF.context.createGainNode();
    t.connect(n);
    n.connect(r, 0);
    n.connect(i, 1);
    r.connect(s, 0, 0);
    i.connect(s, 0, 1);
    s.connect(o);
    this.currentFrequency = parseFloat(e.frequency);
    this.intensity = parseFloat(e.intensity);
    this.currentStereoPhase = parseFloat(e.stereoPhase);
    this.input = t;
    this.splitter = n;
    this.amplitudeL = r;
    this.amplitudeR = i;
    this.output = o;
    this.lfoL = new DMAF.AudioNodes.LFO(DMAF.context.sampleRate, "sin", this.currentFrequency, 1 - this.intensity / 2, this.intensity, this, DMAF.AudioNodes.Tremolo.cb_setAmplitudeL);
    this.lfoR = new DMAF.AudioNodes.LFO(DMAF.context.sampleRate, "sin", this.currentFrequency, 1 - this.intensity / 2, this.intensity, this, DMAF.AudioNodes.Tremolo.cb_setAmplitudeR);
    this.lfoR.setPhase(this.currentStereoPhase * Math.PI / 180);
    this.lfoL.connect(DMAF.context.destination);
    this.lfoR.connect(DMAF.context.destination)
};
DMAF.AudioNodes.Tremolo.cb_setAmplitudeL = function(e, t) {
    e.amplitudeL.gain.value = t
};
DMAF.AudioNodes.Tremolo.cb_setAmplitudeR = function(e, t) {
    e.amplitudeR.gain.value = t
};
DMAF.AudioNodes.Tremolo.prototype.connect = function(e) {
    this.output.connect(e)
};
DMAF.AudioNodes.Tremolo.prototype.setAutomatableProperty = function(e, t, n) {
    if (e === "bypass") {
        this.activate(t)
    } else {
        if (e === "intensity") {
            this.intensity = t;
            this.lfoL.setOffset(1 - this.intensity / 2);
            this.lfoR.setOffset(1 - this.intensity / 2);
            this.lfoR.setOscillation(this.intensity);
            this.lfoL.setOscillation(this.intensity)
        } else {
            if (e === "frequency") {
                this.currentFrequency = t;
                this.lfoL.setFrequency(this.currentFrequency);
                this.lfoR.setFrequency(this.currentFrequency)
            } else {
                if (e === "feedback") {
                    this.feedbackGainNodeLR.gain.value = t;
                    this.feedbackGainNodeRL.gain.value = t
                }
            }
        }
    }
};
DMAF.AudioNodes.Tremolo.prototype.activate = function(e) {
    if (!e) {
        this.input.disconnect();
        this.input.connect(this.output)
    } else {
        this.input.disconnect();
        this.input.connect(this.splitter)
    }
};
DMAF.AudioNodes.Tremolo.prototype.setIntensity = function(e) {
    this.intensity = e;
    this.lfoL.setOffset(1 - this.intensity / 2);
    this.lfoR.setOffset(1 - this.intensity / 2);
    this.lfoR.setOscillation(this.intensity);
    this.lfoL.setOscillation(this.intensity)
};
DMAF.AudioNodes.Tremolo.prototype.setRate = function(e) {
    this.currentFrequency = .1 + 10.9 * e;
    this.lfoL.setFrequency(this.currentFrequency);
    this.lfoR.setFrequency(this.currentFrequency)
};
DMAF.AudioNodes.Tremolo.prototype.setStereoPhase = function(e) {
    this.currentStereoPhase = e * 180;
    var t = this.lfoL.phase + this.currentStereoPhase * Math.PI / 180;
    t = DMAF.Utils.fmod(t, 2 * Math.PI);
    this.lfoR.setPhase(t)
};
DMAF.AudioNodes.AutoFilter = function(e) {
    var t = DMAF.context.createGainNode(),
        n = DMAF.context.createBiquadFilter(),
        r = DMAF.context.createGainNode();
    t.connect(n);
    n.connect(r);
    if (e.type === "lowpass") {
        n.type = "lowpass"
    } else {
        if (e.type === "highpass") {
            n.type = "highpass"
        } else {
            if (e.type === "bandpass") {
                n.type = "bandpass"
            } else {
                if (e.type === "lowshelf") {
                    n.type = "lowshelf"
                } else {
                    if (e.type === "highshelf") {
                        n.type = "highshelf"
                    } else {
                        if (e.type === "peaking") {
                            n.type = "peaking"
                        } else {
                            if (e.type === "notch") {
                                n.type = "notch"
                            } else {
                                if (e.type === "allpass") {
                                    n.type = "allpass"
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    n.frequency.value = parseFloat(e.frequency);
    n.Q.value = parseFloat(e.resonance);
    n.gain.value = parseFloat(e.gain);
    this.input = t;
    this.filter = n;
    this.output = r
};
DMAF.AudioNodes.AutoFilter.prototype.connect = function(e) {
    this.output.connect(e)
};
DMAF.AudioNodes.AutoFilter.prototype.setAutomatableProperty = function(e, t, n) {
    if (n != null) {
        if (e === "bypass") {
            this.activate(t)
        } else {
            if (e === "frequency") {
                this.filter.frequency.setTargetValueAtTime(t, DMAF.context.currentTime + n, n * .63)
            } else {
                if (e === "resonance") {
                    this.filter.Q.setTargetValueAtTime(t, DMAF.context.currentTime + n, n * .63)
                } else {
                    if (e === "gain") {
                        this.filter.gain.setTargetValueAtTime(t, DMAF.context.currentTime + n, n * .63)
                    }
                }
            }
        }
    } else {
        if (e === "bypass") {
            this.activate(t)
        } else {
            if (e === "frequency") {
                this.filter.frequency.value = t
            } else {
                if (e === "resonance") {
                    this.filter.Q.value = t
                } else {
                    if (e === "gain") {
                        this.filter.gain.value = t
                    }
                }
            }
        }
    }
};
DMAF.AudioNodes.AutoFilter.prototype.activate = function(e) {
    if (!e) {
        this.input.disconnect();
        this.input.connect(this.output)
    } else {
        this.input.disconnect();
        this.input.connect(this.filter)
    }
};
DMAF.masterVolume = .25;
(function() {
    try {
        DMAF.context = new webkitAudioContext;
        DMAF.context.master = DMAF.context.createGainNode();
        DMAF.context.master.gain.value = DMAF.masterVolume;
        DMAF.context.compressor = DMAF.context.createDynamicsCompressor();
        DMAF.context.master.connect(DMAF.context.compressor);
        DMAF.context.compressor.connect(DMAF.context.destination);
        var e = DMAF.context.createBufferSource();
        var t = DMAF.context.createBuffer(1, 100, 44100);
        e.buffer = t;
        e.noteOn(0);
        DMAF.contextAvailable = true
    } catch (n) {
        DMAF.status = n.message;
        DMAF.contextAvailable = false;
        DMAF.webAudioDNE = true
    }
})();
DMAF.running = false;
DMAF.actionsLoaded = false;
DMAF.active = false;
DMAF.Framework = function() {
    var e;
    if (!DMAF.contextAvailable || !DMAF.fileFormat) {
        e = {
            notSupported: true,
            dispatch: function() {},
            addEventListener: function(e, t) {
                t(e)
            }
        }
    } else {
        if (!DMAF.active) {
            DMAF.init()
        }
        e = DMAF.getCore()
    }
    return e
};
DMAF.checkIfReady = function() {
    if (DMAF.actionsLoaded && DMAF.active) {
        DMAF.running = true;
        DMAF.startTime = DMAF.context.currentTime * 1e3;
        DMAF.getController().onEvent("dmaf_init", 0, {});
        DMAF.getController().dispatchPendingEvents()
    }
};
DMAF.init = function() {
    DMAF.Core = DMAF.getCore();
    DMAF.Controller = DMAF.getController();
    DMAF.SoundManager = DMAF.Managers.getSoundManager();
    DMAF.BeatPatternPlayer = new DMAF.Processors.BeatPatternPlayer;
    DMAF.ActionManager = DMAF.Managers.getActionManager();
    DMAF.AssetsManager = DMAF.Managers.getAssetsManager();
    DMAF.active = true;
    DMAF.checkIfReady()
};
DMAF.debug = function(e, t) {
    DMAF.getCore().debug(e, t)
};
DMAF.error = function(e, t) {
    DMAF.getCore().error(e, t)
};
DMAF.setMasterVolume = function(e) {
    if (typeof e == "number") {
        if (e < -46) {
            e = -46
        } else {
            if (e > 0) {
                e = 0
            }
        }
        DMAF.masterVolume = e;
        var t = DMAF.Managers.getSoundManager().activeSoundInstances;
        for (var n in t) {
            t[n].setVolume()
        }
    }
};
DMAF.mute = function() {
    DMAF.setMasterVolume(-46);
    DMAF.context.master.gain.value = 0
};
DMAF.unMute = function() {
    DMAF.setMasterVolume(0);
    DMAF.context.master.gain.value = .25
};
DMAF.Actions.AbstractAction = function() {};
DMAF.Actions.SoundGenericPlay = function(e) {
    DMAF.Actions.AbstractAction.call(this);
    this.soundId = e.soundId;
    this.soundFile = e.soundFile;
    this.volume = e.volume;
    this.pan = e.pan;
    this.multiSuffix = e.multiSuffix;
    this.preListen = e.preListen;
    this.softLoop = e.softLoop;
    this.loopLength = e.loopLength;
    this.delay = e.delay;
    this.bus = e.bus;
    this.priority = e.priority;
    this.timingCorrection = e.timingCorrection;
    this.reTrig = e.reTrig;
    this.trigger = e.trigger;
    this.returnEvent = e.returnEvent;
    this.returnEventTime = e.returnEventTime;
    this.type = "SOUNDGENERIC_PLAY"
};
DMAF.Actions.SoundGenericPlay.prototype = new DMAF.Actions.AbstractAction;
DMAF.Actions.SoundGenericPlay.prototype.execute = function() {
    if (this.soundId === "multi") {
        DMAF.debug("setting sound id to " + this.trigger);
        this.soundId = this.trigger
    }
    var e;
    e = DMAF.Managers.getSoundManager().getSoundInstance(this.soundId);
    if (!e) {
        e = DMAF.Factories.getSoundInstanceFactory().create("GENERIC", this.soundId);
        e.priority = this.priority;
        e.volume = this.volume;
        e.setVolume();
        e.pan = this.pan;
        e.preListen = this.preListen;
        e.softLoop = this.softLoop === "true";
        e.loopLength = this.loopLength;
        e.returnEvent = this.returnEvent;
        e.priority = this.priority;
        e.timingCorrection = this.timingCorrection;
        e.reTrig = this.reTrig;
        e.returnEventTime = this.returnEventTime;
        DMAF.Managers.getSoundManager().addSoundInstance(e, this.soundId)
    }
    if (this.soundFile == "multi") {
        e.soundFile = this.trigger
    } else {
        e.soundFile = this.soundFile
    }
    e.play(this.actionTime)
};
DMAF.Actions.SoundBasicPlay = function(e) {
    DMAF.Actions.AbstractAction.call(this);
    this.soundId = e.soundId;
    this.file = e.file;
    this.volume = e.volume;
    this.preListen = e.preListen;
    this.priority = e.priority;
    this.timingCorrection = e.timingCorrection;
    this.type = "SOUNDBASIC_PLAY"
};
DMAF.Actions.SoundBasicPlay.prototype = new DMAF.Actions.AbstractAction;
DMAF.Actions.SoundBasicPlay.prototype.execute = function() {
    var e = DMAF.Utils.createUID();
    var t = DMAF.Factories.getSoundInstanceFactory().create("BASIC", e);
    t.volume = this.volume;
    t.setVolume();
    t.file = this.file;
    t.preListen = this.preListen;
    t.timingCorrection = this.timingCorrection;
    t.priority = this.priority;
    t.soundId = this.soundId;
    DMAF.Managers.getSoundManager().addSoundInstance(t, this.soundId + "." + e);
    var n = function(e) {
        e.target.removeEventListener("finished", n);
        DMAF.Managers.getSoundManager().removeSoundInstance(e.target.soundId + "." + e.target.instanceId)
    };
    t.addEventListener("finished", n);
    t.play(this.actionTime)
};
DMAF.Actions.SoundStepPlay = function(e) {
    DMAF.Actions.AbstractAction.call(this);
    this.soundId = e.soundId;
    this.soundFiles = e.soundFiles;
    this.iterator = e.iterator;
    this.volume = e.volume;
    this.preListen = e.preListen;
    this.priority = e.priority;
    this.timingCorrection = e.timingCorrection;
    this.reTrig = e.reTrig;
    this.type = "SOUNDBASIC_PLAY"
};
DMAF.Actions.SoundStepPlay.prototype = new DMAF.Actions.AbstractAction;
DMAF.Actions.SoundStepPlay.prototype.execute = function() {
    var e;
    e = DMAF.Managers.getSoundManager().getSoundInstance(this.soundId);
    if (!e) {
        e = DMAF.Factories.getSoundInstanceFactory().create("STEP", this.soundId);
        e.iterator = DMAF.Factories.getIteratorFactory().createIterator(this.iterator, this.soundFiles);
        e.volume = this.volume;
        e.setVolume();
        e.priority = this.priority;
        e.preListen = this.preListen;
        e.soundFiles = this.soundFiles;
        e.timingCorrection = this.timingCorrection;
        e.soundId = this.soundId;
        e.reTrig = this.reTrig;
        DMAF.Managers.getSoundManager().addSoundInstance(e, this.soundId)
    }
    e.play(this.actionTime)
};
DMAF.Actions.SoundStop = function(e) {
    DMAF.Actions.AbstractAction.call(this);
    this.target = e.target;
    this.targets = e.targets;
    this.delay = e.delay;
    this.type = "SOUND_STOP"
};
DMAF.Actions.SoundStop.prototype = new DMAF.Actions.AbstractAction;
DMAF.Actions.SoundStop.prototype.prepareTimeout = function(e) {
    return function() {
        e.stop()
    }
};
DMAF.Actions.SoundStop.prototype.execute = function() {
    var e, t, n, r, i;
    if (this.target) {
        e = DMAF.Managers.getSoundManager().getActiveSoundInstances(this.target);
        if (this.delay > 0) {
            for (t = 0; t < e.length; t++) {
                i = setTimeout(this.prepareTimeout(e[t]), this.delay);
                DMAF.Managers.getSoundManager().pendingStopActions.push(i)
            }
        } else {
            for (n = 0; n < e.length; n++) {
                e[n].stop()
            }
        }
    }
    if (this.targets) {
        for (t = 0; t < this.targets.length; t++) {
            e = DMAF.Managers.getSoundManager().getActiveSoundInstances(this.targets[t]);
            if (this.delay > 0) {
                for (r = 0; r < e.length; r++) {
                    i = setTimeout(this.prepareTimeout(e[r]), this.delay);
                    DMAF.Managers.getSoundManager().pendingStopActions.push(i)
                }
            } else {
                for (n = 0; n < e.length; n++) {
                    e[n].stop()
                }
            }
        }
    }
};
DMAF.Actions.TransformProcessorCreate = function(e) {
    DMAF.Actions.AbstractAction.call(this);
    this.properties = e;
    this.targetType = e.targetType;
    this.targetParameter = e.targetParameter;
    this.target = e.target;
    this.value = e.value;
    this.shape = e.shape;
    this.ratio = e.ratio;
    this.duration = e.duration;
    this.delay = e.delay;
    this.type = "TRANSFORM_CREATE"
};
DMAF.Actions.TransformProcessorCreate.prototype = new DMAF.Actions.AbstractAction;
DMAF.Actions.TransformProcessorCreate.prototype.execute = function() {
    var e = DMAF.Factories.getProcessorInstanceFactory().create("TRANSFORM", this.properties);
    e.execute()
};
DMAF.Actions.MacroProcessorCreate = function(e) {
    DMAF.Actions.AbstractAction.call(this);
    this.properties = e
};
DMAF.Actions.MacroProcessorCreate.prototype = new DMAF.Actions.AbstractAction;
DMAF.Actions.MacroProcessorCreate.prototype.execute = function() {
    var e = DMAF.Factories.getProcessorInstanceFactory().create("MACRO", this.properties);
    e.execute(this.parameters.value)
};
DMAF.Processors.BeatPatternInstance = function(e, t) {
    this._removeAtSongPosition = null;
    this.events = [];
    this.player = e;
    this.beatPattern = t.beatPattern;
    if (!t.beatPattern) {
        console.error("Found no BeatPattern for channel", t.beatChannel, ". Please check MIDI file.");
        return
    }
    this.beatPatternId = t.beatPattern.patternId;
    this.beatChannel = t.beatChannel;
    this.setAddAtSongPosition(t.addAtSongPosition);
    if (t.loop && t.patternStartPosition.getInBeats() === t.beatPattern.getEndPosition().getInBeats()) {
        this.setPatternPosition(this.beatPattern.getStartPosition())
    } else {
        this.setPatternPosition(t.patternStartPosition)
    }
    this.replaceActivePatterns = t.replaceActivePatterns;
    this.setAsCurrent = t.setAsCurrent;
    this.loop = t.loop;
    this.clearPosition = t.clearPosition;
    this.initRemoveAtSongPosition()
};
DMAF.Processors.BeatPatternInstance.prototype.NAME = "BeatPatternInstance";
DMAF.Processors.BeatPatternInstance.prototype.getAddAtSongPosition = function() {
    return this._addAtSongPosition
};
DMAF.Processors.BeatPatternInstance.prototype.setAddAtSongPosition = function(e) {
    this._addAtSongPosition = new DMAF.Processors.BeatPosition(e.bar, e.beat, this.player.beatsPerBar)
};
DMAF.Processors.BeatPatternInstance.prototype.getPatternPosition = function() {
    return this._patternPosition
};
DMAF.Processors.BeatPatternInstance.prototype.setPatternPosition = function(e) {
    this._patternPosition = new DMAF.Processors.BeatPosition(e.bar, e.beat, this.player.beatsPerBar)
};
DMAF.Processors.BeatPatternInstance.prototype.getRemoveAtSongPosition = function() {
    return this._removeAtSongPosition
};
DMAF.Processors.BeatPatternInstance.prototype.setRemoveAtSongPosition = function(e) {
    this._removeAtSongPosition = new DMAF.Processors.BeatPosition(e.bar, e.beat, this.player.getBeatsPerBar())
};
DMAF.Processors.BeatPatternInstance.prototype.initRemoveAtSongPosition = function() {
    if (!this.loop) {
        this.setRemoveAtSongPosition(this.getAddAtSongPosition());
        var e = this.beatPattern.getEndPosition().getInBeats() - this.getPatternPosition().getInBeats();
        this.getRemoveAtSongPosition().addOffset(new DMAF.Processors.BeatPosition(0, e))
    } else {
        this.setRemoveAtSongPosition(new DMAF.Processors.BeatPosition(999999, 1, this.player.getBeatsPerBar()))
    }
};
DMAF.Processors.BeatPatternInstance.prototype.gotoNextBeat = function() {
    this.getPatternPosition().gotoNextBeat();
    this.getPatternPosition().beatsPerBar = this.player.beatsPerBar;
    if (this.loop && this.getPatternPosition().bar == this.beatPattern.getEndPosition().bar && this.getPatternPosition().beat == this.beatPattern.getEndPosition().beat) {
        this.setPatternPosition(this.beatPattern.getStartPosition())
    }
};
DMAF.Processors.BeatPatternInstance.prototype.executeEvents = function(e, t) {
    this.events = this.beatPattern.getEvents(this.getPatternPosition().bar);
    for (var n = 0; n < this.events.length; n++) {
        var r = this.events[n];
        if (r.getBeat() == this.getPatternPosition().beat) {
            r.execute(e, t)
        }
    }
};
DMAF.Processors.BeatPattern = function(e, t, n) {
    this.events = {};
    this.cuePoints = [];
    this.patternId = e;
    this._startPosition = t || new DMAF.Processors.BeatPosition(0, 0);
    this._endPosition = n || new DMAF.Processors.BeatPosition(0, 0)
};
DMAF.Processors.BeatPattern.prototype.NAME = "BeatPattern";
DMAF.Processors.BeatPattern.prototype.getEndPosition = function() {
    return this._endPosition
};
DMAF.Processors.BeatPattern.prototype.setEndPosition = function(e) {
    this._endPosition = new DMAF.Processors.BeatPosition(e.bar, e.beat)
};
DMAF.Processors.BeatPattern.prototype.getStartPosition = function() {
    return this._startPosition
};
DMAF.Processors.BeatPattern.prototype.setStartPosition = function(e) {
    this._startPosition = new DMAF.Processors.BeatPosition(e.bar, e.beat)
};
DMAF.Processors.BeatPattern.prototype.getEvents = function(e) {
    var t = [];
    if (this.events[e]) {
        for (var n = 0; n < this.events[e].length; n++) {
            t.push(this.events[e][n])
        }
    }
    return t
};
DMAF.Processors.BeatPattern.prototype.addEvent = function(e, t, n) {
    var r = new DMAF.Processors.SynthEvent(e, t, n);
    this.addToEvents(r)
};
DMAF.Processors.BeatPattern.prototype.addSubPattern = function(e, t) {
    for (var n = 0; n < e.events.length; n++) {
        var r = e.events[n];
        this.addEvent(r.eventName, new DMAF.Processors.BeatPosition(r.bar + t.bar - 1, r.beat + t.beat - 1))
    }
};
DMAF.Processors.BeatPattern.prototype.addToEvents = function(e) {
    if (!this.events[e.getBar()]) {
        this.events[e.getBar()] = []
    }
    this.events[e.getBar()].push(e);
    if (this.patternId.indexOf("user_pattern") != -1) {
        DMAF.debug(this.patternId + " added event to dictionary ")
    }
};
DMAF.Processors.BeatPattern.prototype.clearAll = function() {
    this.events = {};
    this.cuePoints = [];
    DMAF.debug(this.patternId + " cleared ")
};
DMAF.Processors.BeatPosition = function(e, t, n, r) {
    this.bar = e;
    this.beat = t;
    this.tick = r || 1;
    this.beatsPerBar = n || 4;
    this.beatCount = this.beat + (this.bar - 1) * this.beatsPerBar
};
DMAF.Processors.BeatPosition.prototype.getInBeats = function() {
    var e = this.beat + (this.bar - 1) * this.beatsPerBar;
    return e
};
DMAF.Processors.BeatPosition.prototype.gotoNextBeat = function() {
    if (this.beat === this.beatsPerBar) {
        this.bar++;
        this.beat = 1;
        this.beatCount++
    } else {
        this.beat++;
        this.beatCount++
    }
};
DMAF.Processors.BeatPosition.prototype.addOffset = function(e) {
    this.beat = this.beat + e.beat;
    while (this.beat > this.beatsPerBar) {
        this.bar++;
        this.beat = this.beat - this.beatsPerBar
    }
    this.bar = this.bar + e.bar
};
DMAF.Processors.BeatEvent = function(e, t, n) {
    this._eventName = e;
    this._bar = t.bar;
    this._beat = t.beat;
    this._tick = t.tick;
    this._beatsPerBar = t.beatsPerBar;
    this._data = n
};
DMAF.Processors.BeatEvent.prototype.NAME = "BeatEvent";
DMAF.Processors.BeatEvent.prototype.getEventName = function() {
    return this._eventName
};
DMAF.Processors.BeatEvent.prototype.setEventName = function(e) {
    this._eventName = e
};
DMAF.Processors.BeatEvent.prototype.getBar = function() {
    return this._bar
};
DMAF.Processors.BeatEvent.prototype.setBar = function(e) {
    this._bar = e
};
DMAF.Processors.BeatEvent.prototype.getBeat = function() {
    return this._beat
};
DMAF.Processors.BeatEvent.prototype.setBeat = function(e) {
    this._beat = e
};
DMAF.Processors.BeatEvent.prototype.getTick = function() {
    return this._tick
};
DMAF.Processors.BeatEvent.prototype.setTick = function(e) {
    this._tick = e
};
DMAF.Processors.BeatEvent.prototype.getData = function() {
    return this._data
};
DMAF.Processors.BeatEvent.prototype.setData = function(e) {
    this._data = e
};
DMAF.Processors.BeatEvent.prototype.getBeatsPerBar = function() {
    return this._beatsPerBar
};
DMAF.Processors.BeatEvent.prototype.setBeatsPerBar = function(e) {
    this._beatsPerBar = e
};
DMAF.Processors.BeatEvent.prototype.execute = function(e, t) {
    e = e + this.getTick() * (t / 480);
    DMAF.getController().onInternalEvent(this.getEventName(), e, this.getData())
};
DMAF.Processors.SynthEvent = function(e, t, n) {
    this._eventName = e;
    this._bar = t.bar;
    this._beat = t.beat;
    this._tick = t.tick;
    this._beatsPerBar = t.beatsPerBar;
    this._data = n
};
DMAF.Processors.SynthEvent.prototype.NAME = "SynthEvent";
DMAF.Processors.SynthEvent.prototype.getEventName = function() {
    return this._eventName
};
DMAF.Processors.SynthEvent.prototype.setEventName = function(e) {
    this._eventName = e
};
DMAF.Processors.SynthEvent.prototype.getBar = function() {
    return this._bar
};
DMAF.Processors.SynthEvent.prototype.setBar = function(e) {
    this._bar = e
};
DMAF.Processors.SynthEvent.prototype.getBeat = function() {
    return this._beat
};
DMAF.Processors.SynthEvent.prototype.setBeat = function(e) {
    this._beat = e
};
DMAF.Processors.SynthEvent.prototype.getTick = function() {
    return this._tick
};
DMAF.Processors.SynthEvent.prototype.setTick = function(e) {
    this._tick = e
};
DMAF.Processors.SynthEvent.prototype.getData = function() {
    return this._data
};
DMAF.Processors.SynthEvent.prototype.setData = function(e) {
    this._data = e
};
DMAF.Processors.SynthEvent.prototype.getBeatsPerBar = function() {
    return this._beatsPerBar
};
DMAF.Processors.SynthEvent.prototype.setBeatsPerBar = function(e) {
    this._beatsPerBar = e
};
DMAF.Processors.SynthEvent.prototype.execute = function(e, t) {
    e = e + this.getTick() * (t / 480);
    var n = this.getData();
    n.noteEndTime = e + n.e * (t / 480) / 1e3 - e;
    DMAF.getController().onInternalEvent(this.getEventName(), e, n)
};
DMAF.Processors.BeatPatternPlayer = function() {
    this.newTempo = 120;
    this.tempo = 120;
    this._beatsPerBar = 4;
    this.newBeats = 4;
    this.beatLength = 60 / this.tempo * 1e3;
    this.barLength = this.beatLength * this._beatsPerBar;
    this.clockState = this.STOPPED;
    this.preListen = 100;
    this.pendingExternalEvents = [];
    this.tempoUpdated = false;
    this.currentBar = 0;
    this.soundManager = DMAF.Managers.getSoundManager();
    this.songPosition = new DMAF.Processors.BeatPosition(0, 0);
    this.pendingPatterns = [];
    this.activePatterns = [];
    this.tempoObservers = [];
    this.currentPattern = new DMAF.Processors.BeatPatternInstance(this, {
        beatPattern: new DMAF.Processors.BeatPattern("master", new DMAF.Processors.BeatPosition(0, 4), new DMAF.Processors.BeatPosition(1, 1)),
        beatChannel: "master",
        addAtSongPosition: new DMAF.Processors.BeatPosition(0, 4),
        patternStartPosition: new DMAF.Processors.BeatPosition(0, 4),
        clearPending: true,
        replaceActivePatterns: true,
        setAsCurrent: true,
        loop: true,
        clearPosition: new DMAF.Processors.BeatPosition(1, 1)
    })
};
DMAF.Processors.BeatPatternPlayer.prototype.PROCESSOR_ID = "BEATPATTERNPLAYER";
DMAF.Processors.BeatPatternPlayer.prototype.getBeatsPerBar = function() {
    return this._beatsPerBar
};
DMAF.Processors.BeatPatternPlayer.prototype.setBeatsPerBar = function(e) {
    if (e !== this._beatsPerBar) {
        this._beatsPerBar = e;
        this.beatLength = 60 / this.tempo * 1e3;
        this.barLength = this.beatLength * this.beatsPerBar;
        this.newBeats = e
    }
};
DMAF.Processors.BeatPatternPlayer.prototype.getCurrentBar = function() {
    return this.songPosition.bar
};
DMAF.Processors.BeatPatternPlayer.prototype.getNextBar = function() {
    return this.getCurrentBar() + 1
};
DMAF.Processors.BeatPatternPlayer.prototype.setCurrentBarTime = function(e) {
    this._currentBarTime = e
};
DMAF.Processors.BeatPatternPlayer.prototype.getCurrentBarTime = function() {
    return this._currentBarTime
};
DMAF.Processors.BeatPatternPlayer.prototype.getNextBarTime = function() {
    return this.currentBarTime + this.barLength
};
DMAF.Processors.BeatPatternPlayer.prototype.getCurrentBeat = function() {
    return this.songPosition.beat
};
DMAF.Processors.BeatPatternPlayer.prototype.getNextBeat = function() {
    var e = this.getCurrentBeat() + 1;
    if (e > this.getBeatsPerBar()) {
        e = 1
    }
    return e
};
DMAF.Processors.BeatPatternPlayer.prototype.setCurrentBeatTime = function(e) {
    this._currentBeatTime = e;
    this._nextBeatTime = e + this.beatLength
};
DMAF.Processors.BeatPatternPlayer.prototype.getCurrentBeatTime = function() {
    return this._currentBeatTime
};
DMAF.Processors.BeatPatternPlayer.prototype.setCurrentSixteenthTime = function(e) {
    this._currentSixteenthTime = e;
    this._nextSixteenthTime = e + this.beatLength / 4
};
DMAF.Processors.BeatPatternPlayer.prototype.getNextSixteenthTime = function() {
    return this._nextSixteenthTime
};
DMAF.Processors.BeatPatternPlayer.prototype.setNextBeatTime = function(e) {
    this._nextBeatTime = e;
    this._currentBeatTime = e - this.beatLength
};
DMAF.Processors.BeatPatternPlayer.prototype.getNextBeatTime = function() {
    return this._nextBeatTime
};
DMAF.Processors.BeatPatternPlayer.prototype.getTempo = function() {
    return this.tempo
};
DMAF.Processors.BeatPatternPlayer.prototype.setTempo = function(e) {
    if (e != this.tempo) {
        this.tempo = e;
        this.beatLength = 60 / this.tempo * 1e3;
        this.barLength = this.beatLength * this.beatsPerBar;
        this.tempoUpdated = true;
        this.newTempo = e;
        var t;
        for (t = 0; t < this.tempoObservers.length; ++t) {
            this.tempoObservers[t].setTempo(this.tempo)
        }
    }
};
DMAF.Processors.BeatPatternPlayer.prototype.getCurrentPatternBar = function() {
    var e;
    if (!this.currentPattern) {
        e = 0
    } else {
        e = this.currentPattern.getPatternPosition().bar
    }
    return e
};
DMAF.Processors.BeatPatternPlayer.prototype.getNextPatternBar = function() {
    return this.getCurrentPatternBar() + 1
};
DMAF.Processors.BeatPatternPlayer.prototype.getCurrentPatternBeat = function() {
    var e;
    if (!this.currentPattern) {
        e = 0
    } else {
        e = this.currentPattern.getPatternPosition().beat
    }
    return e
};
DMAF.Processors.BeatPatternPlayer.prototype.getNextPatternBeat = function() {
    return this.getCurrentPatternBeat() + 1
};
DMAF.Processors.BeatPatternPlayer.prototype.getCurrentPatternId = function() {
    var e;
    if (!this.currentPattern) {
        e = "none"
    } else {
        e = this.currentPattern.beatPatternId
    }
    return e
};
DMAF.Processors.BeatPatternPlayer.prototype.addPattern = function(e) {
    if (this.clockState === this.RUNNING) {
        var t = new DMAF.Processors.BeatPatternInstance(this, e);
        if (e.clearPending) {
            if (e.beatChannel === "main") {
                this.pendingPatterns = []
            } else {
                for (var n = 0; n < this.pendingPatterns.length; n++) {
                    if (this.pendingPatterns[n].beatChannel === e.beatChannel) {
                        this.pendingPatterns.splice(n, 1);
                        n--
                    }
                }
            }
        }
        if (e.useAsTransposePattern) {
            t.useAsTransposePattern = true
        }
        this.pendingPatterns.push(t)
    } else {}
};
DMAF.Processors.BeatPatternPlayer.prototype.addInstantPattern = function(e) {
    var t = new DMAF.Processors.BeatPatternInstance(this, e);
    for (var n = 0; n < this.activePatterns.length; n++) {
        if (this.activePatterns[n].beatChannel === e.beatChannel) {
            this.activePatterns.splice(n, 1);
            n--
        }
    }
    this.activePatterns.push(t);
    if (e.setAsCurrent) {
        this.currentPattern = t
    }
};
DMAF.Processors.BeatPatternPlayer.prototype.updateActivePatterns = function() {
    var e, t, n, r, i, s;
    for (n = 0; n < this.pendingPatterns.length; n++) {
        t = this.pendingPatterns[n].getAddAtSongPosition();
        if (t.bar === this.songPosition.bar && t.beat === this.songPosition.beat) {
            e = this.pendingPatterns[n];
            this.pendingPatterns.splice(n, 1);
            n--;
            if (e.replaceActivePatterns) {
                for (r = 0; r < this.activePatterns.length; r++) {
                    if (e.beatChannel === "main") {
                        this.activePatterns[r].setRemoveAtSongPosition(e.clearPosition)
                    } else {
                        if (e.beatChannel === this.activePatterns[r].beatChannel) {
                            this.activePatterns[r].setRemoveAtSongPosition(e.clearPosition)
                        } else {}
                    }
                }
            }
            for (i = 0; i < this.activePatterns.length; i++) {
                if (this.activePatterns[i].beatPatternId === e.beatPatternId) {
                    this.activePatterns.splice(i, 1);
                    break
                }
            }
            if (e.useAsTransposePattern) {
                DMAF.debug("adding as transpose master", e);
                if (this.activePatterns[0] && this.activePatterns[0].useAsTransposePattern) {
                    this.activePatterns.splice(0, 1)
                }
                this.activePatterns.unshift(e)
            } else {
                this.activePatterns.push(e)
            } if (e.setAsCurrent) {
                this.currentPattern = e
            }
        }
    }
    for (s = 0; s < this.activePatterns.length; s++) {
        if (this.activePatterns[s].getRemoveAtSongPosition().bar === this.songPosition.bar && this.activePatterns[s].getRemoveAtSongPosition().beat === this.songPosition.beat) {
            this.activePatterns.splice(s, 1);
            s--
        }
    }
};
DMAF.Processors.BeatPatternPlayer.prototype.removePattern = function(e, t) {
    if (this.activePatterns[e.patternId]) {
        this.activePatterns[e.patternId].removeAtSongPosition = t
    }
};
DMAF.Processors.BeatPatternPlayer.prototype.clearBeatChannel = function(e, t) {
    DMAF.debug("clear clearBeatChannel " + e);
    for (var n = 0; n < this.activePatterns.length; n++) {
        if (this.pendingPatterns[n].beatChannel === e) {
            this.pendingPatterns[n].removeAtSongPosition = t
        }
    }
    for (n = 0; n < this.activePatterns.length; n++) {
        if (this.activePatterns[n].beatChannel === e) {
            this.activePatterns[n].removeAtSongPosition = t
        }
    }
};
DMAF.Processors.BeatPatternPlayer.prototype.clearActivePatterns = function(e) {
    for (var t = 0; t < this.activePatterns.length; t++) {
        this.activePatterns[t].removeAtSongPosition = e
    }
};
DMAF.Processors.BeatPatternPlayer.prototype.executeEvents = function(e) {
    for (var t = 0; t < this.activePatterns.length; t++) {
        this.activePatterns[t].executeEvents(e, this.beatLength)
    }
};
DMAF.Processors.BeatPatternPlayer.prototype.RUNNING = "running";
DMAF.Processors.BeatPatternPlayer.prototype.PAUSED = "paused";
DMAF.Processors.BeatPatternPlayer.prototype.STOPPED = "stopped";
DMAF.Processors.BeatPatternPlayer.prototype.startClock = function(e, t, n) {
    if (this.clockState !== this.RUNNING) {
        this.beatsPerBar = n;
        this.setTempo(t);
        this.songPosition = new DMAF.Processors.BeatPosition(0, this.getBeatsPerBar(), this.getBeatsPerBar());
        this.setNextBeatTime(e);
        this.setCurrentSixteenthTime(e);
        this.currentFrame = 0;
        this.currentFrameTime = e;
        this.previousFrameTime = this.currentFrameTime;
        this.nextFrameTime = this.currentFrameTime + 1e3 / DMAF.FPS;
        DMAF.Managers.getCheckTimeManager().addFrameListener("checkBeat", this.checkBeat, this);
        this.clockState = this.RUNNING
    } else {
        this.newTempo = t;
        this.newBeats = n
    }
    DMAF.getController().hasSentStartClock = false
};
DMAF.Processors.BeatPatternPlayer.prototype.stopClock = function() {
    this.clockState = this.STOPPED;
    this.pendingPatterns = [];
    for (var e in this.activePatterns) {
        if (this.activePatterns.hasOwnProperty(e)) {
            this.activePatterns[e].setPatternPosition(new DMAF.Processors.BeatPosition(0, 4, this.getBeatsPerBar()))
        }
    }
    this.activePatterns = [];
    this.songPosition = new DMAF.Processors.BeatPosition(0, 0);
    DMAF.Managers.getCheckTimeManager().removeFrameListener("checkBeat")
};
DMAF.Processors.BeatPatternPlayer.prototype.pauseClock = function() {
    this.clockState = this.PAUSED
};
DMAF.Processors.BeatPatternPlayer.prototype.resumeClock = function() {
    this.clockState = this.RUNNING
};
DMAF.Processors.BeatPatternPlayer.prototype.checkBeat = function(e) {
    var t = DMAF.context.currentTime * 1e3;
    while (t - this.getNextBeatTime() - DMAF.preListen > this.beatLength) {
        this.skipBeat(this.getNextBeatTime())
    }
    if (t >= this.getNextBeatTime() - DMAF.preListen) {
        this.updateBeat(this.getNextBeatTime())
    }
};
DMAF.Processors.BeatPatternPlayer.prototype.skipBeat = function(e) {
    this.songPosition.gotoNextBeat();
    if (this.songPosition.beat == 1) {
        this.currentBarTime = e;
        if (this.newTempo != this.tempo) {
            this.setTempo(this.newTempo)
        }
        if (this.newBeats != this.beatsPerBar) {
            this.beatsPerBar = this.newBeats;
            this.songPosition.beatsPerBar = this.beatsPerBar
        }
    }
    this.setCurrentBeatTime(e);
    for (var t in this.activePatterns) {
        if (this.activePatterns.hasOwnProperty(t)) {
            this.activePatterns[t].gotoNextBeat()
        }
    }
    this.updateActivePatterns()
};
DMAF.Processors.BeatPatternPlayer.prototype.updateBeat = function(e) {
    this.songPosition.gotoNextBeat();
    if (this.songPosition.beat == 1) {
        this.currentBarTime = e;
        if (this.newTempo != this.tempo) {
            this.setTempo(this.newTempo)
        }
        if (this.newBeats != this.beatsPerBar) {
            this.beatsPerBar = this.newBeats;
            this.songPosition.beatsPerBar = this.beatsPerBar
        }
    }
    this.setCurrentBeatTime(e);
    for (var t in this.activePatterns) {
        if (this.activePatterns.hasOwnProperty(t)) {
            this.activePatterns[t].gotoNextBeat()
        }
    }
    this.updateActivePatterns();
    this.executeEvents(e)
};
DMAF.Processors.BeatPatternPlayer.prototype.gotoNextBeat = function(e) {
    this.songPosition.gotoNextBeat();
    for (var t in this.activePatterns) {
        if (this.activePatterns.hasOwnProperty(t)) {
            this.activePatterns[t].gotoNextBeat()
        }
    }
    this.updateActivePatterns();
    this.executeEvents(e)
};
DMAF.CoreInstance = function() {
    EventDispatcher.call(this);
    this.activeObjects = {};
    this.buttonListeners = {};
    this.pendingButtons = [];
    this.pendingObjects = [];
    this.debugging = false;
    if (!DMAF.contextAvailable || !DMAF.fileFormat) {} else {
        this.enabled = true
    }
};
DMAF.CoreInstance.prototype = new EventDispatcher;
DMAF.CoreInstance.prototype.constructor = DMAF.CoreInstance;
DMAF.CoreInstance.prototype.debugOn = function(e) {
    if (!e) {
        e = "debug"
    }
    switch (e) {
        case "error":
            this.debugging = false;
            this.errorDebugging = true;
            break;
        case "debug":
            this.debugging = true;
            this.errorDebugging = true;
            break
    }
    DMAF.error("DMAF error debug is on");
    DMAF.debug("DMAF debug is on")
};
DMAF.CoreInstance.prototype.debugOff = function() {
    DMAF.debug("DMAF debug is off");
    this.debugging = false;
    this.errorDebugging = false
};
DMAF.CoreInstance.prototype.debug = function(e, t) {
    if (this.debugging) {
        if (e && t) {
            console.log(DMAF.context.currentTime * 1e3 - DMAF.startTime + ": ", e, t)
        } else {
            console.log(DMAF.context.currentTime * 1e3 - DMAF.startTime + ": ", e)
        }
    }
};
DMAF.CoreInstance.prototype.error = function(e, t) {
    if (this.errorDebugging) {
        if (e && t) {
            console.log(DMAF.context.currentTime * 1e3 - DMAF.startTime + ": ", e, t)
        } else {
            console.log(DMAF.context.currentTime * 1e3 - DMAF.startTime + ": ", e)
        }
    }
};
DMAF.CoreInstance.prototype.enable = function() {
    if (!DMAF.contextAvailable || !DMAF.fileFormat) {
        return
    }
    this.enabled = true;
    DMAF.debug("DMAF enabled")
};
DMAF.CoreInstance.prototype.disable = function() {
    this.enabled = false;
    DMAF.Managers.getSoundManager().stopAllSounds();
    DMAF.debug("DMAF disabled")
};
DMAF.SoundActionFactory = null;
DMAF.SoundInstanceFactory = null;
DMAF.SynthActionFactory = null;
DMAF.SynthInstanceFactory = null;
DMAF.IteratorFactory = null;
DMAF.EffectsFactory = null;
DMAF.ProcessorActionFactory = null;
DMAF.ProcessorInstanceFactory = null;
DMAF.AudioBusFactory = null;
DMAF.Factories.getSynthInstanceFactory = function() {
    if (DMAF.SynthInstanceFactory === null) {
        DMAF.SynthInstanceFactory = new DMAF.Factories.SynthInstanceFactory
    }
    return DMAF.SynthInstanceFactory
};
DMAF.Factories.getSynthActionFactory = function() {
    if (DMAF.SynthActionFactory === null) {
        DMAF.SynthActionFactory = new DMAF.Factories.SynthActionFactory
    }
    return DMAF.SynthActionFactory
};
DMAF.Factories.getSoundActionFactory = function() {
    if (DMAF.SoundActionFactory === null) {
        DMAF.SoundActionFactory = new DMAF.Factories.SoundActionFactory
    }
    return DMAF.SoundActionFactory
};
DMAF.Factories.getSoundInstanceFactory = function() {
    if (DMAF.SoundInstanceFactory === null) {
        DMAF.SoundInstanceFactory = new DMAF.Factories.SoundInstanceFactory
    }
    return DMAF.SoundInstanceFactory
};
DMAF.Factories.getProcessorInstanceFactory = function() {
    if (DMAF.ProcessorInstanceFactory === null) {
        DMAF.ProcessorInstanceFactory = new DMAF.Factories.ProcessorInstanceFactory
    }
    return DMAF.ProcessorInstanceFactory
};
DMAF.Factories.getProcessorActionFactory = function() {
    if (DMAF.ProcessorActionFactory === null) {
        DMAF.ProcessorActionFactory = new DMAF.Factories.ProcessorActionFactory
    }
    return DMAF.ProcessorActionFactory
};
DMAF.Factories.getIteratorFactory = function() {
    if (DMAF.IteratorFactory === null) {
        DMAF.IteratorFactory = new DMAF.Factories.IteratorFactory
    }
    return DMAF.IteratorFactory
};
DMAF.Factories.getEffectsFactory = function() {
    if (DMAF.EffectsFactory === null) {
        DMAF.EffectsFactory = new DMAF.Factories.EffectsFactory
    }
    return DMAF.EffectsFactory
};
DMAF.Factories.getAudioBusFactory = function() {
    if (DMAF.AudioBusFactory === null) {
        DMAF.AudioBusFactory = new DMAF.Factories.AudioBusFactory
    }
    return DMAF.AudioBusFactory
};
DMAF.Factories.SoundActionFactory = function() {
    this.factoryMap = {};
    this.registerCoreTypes()
};
DMAF.Factories.SoundActionFactory.prototype.registerCoreTypes = function() {
    this.factoryMap.SOUNDGENERIC_PLAY = DMAF.Actions.SoundGenericPlay;
    this.factoryMap.SOUNDBASIC_PLAY = DMAF.Actions.SoundBasicPlay;
    this.factoryMap.SOUNDSTEP_PLAY = DMAF.Actions.SoundStepPlay;
    this.factoryMap.SOUND_STOP = DMAF.Actions.SoundStop
};
DMAF.Factories.SoundActionFactory.prototype.create = function(e, t) {
    if (!this.factoryMap[e]) {
        DMAF.debug("DMAFError: Could not create sound action, unknown type: " + e);
        return
    }
    var n = this.factoryMap[e];
    var r = new n(t);
    return r
};
DMAF.Factories.ProcessorActionFactory = function() {
    this.factoryMap = {};
    this.registerCoreTypes()
};
DMAF.Factories.ProcessorActionFactory.prototype.registerCoreTypes = function() {
    this.factoryMap.TRANSFORM_CREATE = DMAF.Actions.TransformProcessorCreate;
    this.factoryMap.MACRO_CREATE = DMAF.Actions.MacroProcessorCreate
};
DMAF.Factories.ProcessorActionFactory.prototype.create = function(e, t) {
    if (!this.factoryMap[e]) {
        DMAF.debug("DMAFError: Could not create processor action, unknown type: " + e);
        return
    }
    var n = this.factoryMap[e];
    var r = new n(t);
    return r
};
DMAF.Factories.SoundInstanceFactory = function(e) {
    this.factoryMap = {};
    this.registerCoreTypes()
};
DMAF.Factories.SoundInstanceFactory.prototype.registerCoreTypes = function() {
    this.factoryMap.GENERIC = DMAF.Sounds.SoundGeneric;
    this.factoryMap.BASIC = DMAF.Sounds.SoundBasic;
    this.factoryMap.STEP = DMAF.Sounds.SoundStep
};
DMAF.Factories.SoundInstanceFactory.prototype.create = function(e, t) {
    if (!this.factoryMap[e]) {
        DMAF.debug("DMAFError: Could not create sound instance, unknown type: " + e);
        return
    }
    var n = this.factoryMap[e];
    var r = new n(t);
    return r
};
DMAF.Factories.ProcessorInstanceFactory = function() {
    this.factoryMap = {};
    this.registerCoreTypes()
};
DMAF.Factories.ProcessorInstanceFactory.prototype.registerCoreTypes = function() {
    this.factoryMap.TRANSFORM = DMAF.Processors.TransformProcessor;
    this.factoryMap.MACRO = DMAF.Processors.MacroProcessor
};
DMAF.Factories.ProcessorInstanceFactory.prototype.create = function(e, t) {
    if (!this.factoryMap[e]) {
        DMAF.debug("DMAFError: Could not create processor instance, unknown type: " + e);
        return
    }
    var n = this.factoryMap[e];
    var r = new n(t);
    return r
};
DMAF.Factories.IteratorFactory = function() {
    this.createIterator = function(e, t) {
        var n;
        switch (e) {
            case "ROUND_ROBIN":
                n = new DMAF.Iterators.RoundRobinIterator(t);
                break;
            case "RANDOM":
                n = new DMAF.Iterators.RandomNextIterator(t);
                break;
            case "RANDOM_FIRST":
                n = new DMAF.Iterators.RandomFirstIterator(t);
                break;
            case "SHUFFLE":
                n = new DMAF.Iterators.ShuffleIterator(t);
                break;
            default:
                n = new DMAF.Iterators.RandomFirstIterator(t);
                DMAF.debug("DMAFWarning: using default iterator");
                break
        }
        return n
    }
};
DMAF.Factories.EffectsFactory = function() {
    this.factoryMap = {};
    this.registerCoreTypes()
};
DMAF.Factories.EffectsFactory.prototype.registerCoreTypes = function() {
    this.factoryMap.CHORUS = DMAF.AudioNodes.Chorus;
    this.factoryMap.OVERDRIVE = DMAF.AudioNodes.Overdrive;
    this.factoryMap.WAHWAH = DMAF.AudioNodes.WahWah;
    this.factoryMap.COMPRESSOR = DMAF.AudioNodes.Compressor;
    this.factoryMap.CABINET = DMAF.AudioNodes.Cabinet;
    this.factoryMap.EQUALIZER = DMAF.AudioNodes.Equalizer;
    this.factoryMap.FXGROUP = DMAF.AudioNodes.FxGroup;
    this.factoryMap.PHASER = DMAF.AudioNodes.Phaser;
    this.factoryMap.TREMOLO = DMAF.AudioNodes.Tremolo;
    this.factoryMap.STEREODELAY = DMAF.AudioNodes.StereoDelay;
    this.factoryMap.SLAPBACK = DMAF.AudioNodes.SlapbackDelay;
    this.factoryMap.PINGPONG = DMAF.AudioNodes.PingPongDelay;
    this.factoryMap.AUTOFILTER = DMAF.AudioNodes.AutoFilter;
    this.factoryMap.CONVOLVER = DMAF.AudioNodes.Convolver
};
DMAF.Factories.EffectsFactory.prototype.create = function(e, t) {
    if (!this.factoryMap[e]) {
        DMAF.debug("DMAFError: Could not create effect, unknown type: " + e);
        return
    }
    var n = this.factoryMap[e];
    var r = new n(t);
    return r
};
DMAF.Factories.AudioBusFactory = function(e) {
    this.factoryMap = {};
    this.registerCoreTypes()
};
DMAF.Factories.AudioBusFactory.prototype.registerCoreTypes = function() {
    this.factoryMap.AUDIOBUS_CREATE = DMAF.Actions.AudioBusCreate
};
DMAF.Factories.AudioBusFactory.prototype.create = function(e, t) {
    if (!this.factoryMap[e]) {
        DMAF.debug("DMAFError: Could not create audio bus, unknown type: " + e);
        return
    }
    var n = this.factoryMap[e];
    var r = new n(t);
    return r
};
DMAF.Iterators.StepSoundIterator = function(e) {
    this.actIndex = 0;
    this.array = e;
    var t = this;
    this.getRandom = function() {
        return Math.floor(Math.random() * t.array.length - 1e-13)
    }
};
DMAF.Iterators.RoundRobinIterator = function(e) {
    DMAF.Iterators.StepSoundIterator.call(this, e);
    this.actIndex = -1;
    var t = this;
    this.getNext = function() {
        t.actIndex++;
        if (t.actIndex >= t.array.length) {
            t.actIndex = 0
        }
        return t.array[t.actIndex]
    }
};
DMAF.Iterators.StepSoundIterator.prototype = new DMAF.Iterators.StepSoundIterator;
DMAF.Iterators.RandomNextIterator = function(e) {
    DMAF.Iterators.StepSoundIterator.call(this, e);
    var t = this;
    this.getNext = function() {
        t.actIndex = t.getRandom();
        return t.array[t.actIndex]
    }
};
DMAF.Iterators.RandomNextIterator.prototype = new DMAF.Iterators.StepSoundIterator;
DMAF.Iterators.RandomFirstIterator = function(e) {
    DMAF.Iterators.RoundRobinIterator.call(this, e);
    this.actIndex = this.getRandom()
};
DMAF.Iterators.RandomFirstIterator.prototype = new DMAF.Iterators.RoundRobinIterator;
DMAF.Iterators.ShuffleIterator = function(e) {
    DMAF.Iterators.StepSoundIterator.call(this, e);
    this.previousSoundIndex = -1;
    this.soundIsPlayed = [];
    var t = this;
    this.getNext = function() {
        t.actIndex = t.getRandom();
        t.checkIfSoundsRemain();
        while (true) {
            if (t.soundIsPlayed[t.actIndex] === false && t.previousSoundIndex !== t.actIndex) {
                break
            } else {
                t.actIndex = t.getRandom()
            }
        }
        t.previousSoundIndex = t.actIndex;
        t.soundIsPlayed[t.actIndex] = true;
        return t.array[t.actIndex]
    }
};
DMAF.Iterators.ShuffleIterator.prototype = new DMAF.Iterators.StepSoundIterator;
DMAF.Iterators.ShuffleIterator.prototype.resetSounds = function() {
    for (var e = 0; e < this.array.length; e++) {
        this.soundIsPlayed[e] = false
    }
};
DMAF.Iterators.ShuffleIterator.prototype.checkIfSoundsRemain = function() {
    for (var e = 0; e < this.array.length; e++) {
        if (this.soundIsPlayed[e] === false) {
            return
        }
    }
    this.resetSounds()
};
DMAF.Managers.SoundManager = function() {
    this.activeSoundElements = [];
    this.idleSoundElements = [];
    this.activeSoundInstances = {};
    for (var e = 0; e < DMAF.voiceCount; e++) {
        this.idleSoundElements.push(new Audio)
    }
};
DMAF.Managers.SoundManager.prototype.pendingStopActions = [];
DMAF.Managers.SoundManager.prototype.getSoundInstance = function(e) {
    if (this.activeSoundInstances[e] != undefined) {
        return this.activeSoundInstances[e]
    } else {
        return false
    }
};
DMAF.Managers.SoundManager.prototype.getActiveSoundInstances = function(e) {
    var t = [];
    for (var n in this.activeSoundInstances) {
        if (n.split(".")[0] === e) {
            t.push(this.activeSoundInstances[n])
        }
    }
    return t
};
DMAF.Managers.SoundManager.prototype.removeSoundInstance = function(e) {
    if (this.activeSoundInstances[e] != undefined) {
        delete this.activeSoundInstances[e];
        return true
    } else {
        return false
    }
};
DMAF.Managers.SoundManager.prototype.addSoundInstance = function(e, t) {
    if (this.activeSoundInstances[t] == undefined) {
        this.activeSoundInstances[t] = e
    }
};
DMAF.Managers.SoundManager.prototype.addIdleSoundElement = function(e) {
    this.idleSoundElements.push(e)
};
DMAF.Managers.SoundManager.prototype.addActiveSoundElement = function(e) {
    this.activeSoundElements.push(e)
};
DMAF.Managers.SoundManager.prototype.removeActiveElement = function(e) {
    for (var t = 0; t < this.activeSoundElements.length; t++) {
        if (this.activeSoundElements[t].id === e) {
            var n = this.activeSoundElements.splice(t, 1)[0];
            this.addIdleSoundElement(n);
            return
        }
    }
    DMAF.error("DMAFError: couldn't find element in active array: " + event.target.id)
};
DMAF.Managers.SoundManager.prototype.onSoundError = function(e) {
    DMAF.error(e, e.srcElement)
};
DMAF.Managers.SoundManager.prototype.getIdleSoundElement = function(e) {
    if (this.idleSoundElements.length > 0) {
        for (var t = 0; t < this.idleSoundElements.length; t++) {
            if (this.idleSoundElements[t].src === e) {
                var n = this.idleSoundElements.splice(t, 1)[0];
                return n
            }
        }
        var n = this.idleSoundElements.splice(0, 1)[0];
        n.src = e;
        return n
    }
    DMAF.debug("DMAFError: out of elements, call canceled");
    return false
};
DMAF.Managers.SoundManager.prototype.startSound = function(e, t, n, r, i) {
    if (!e.id) {
        DMAF.debug("DMAFWarning: no id assigned to element, will not be able to stop manually", e)
    }
    e.gainNode.gain.value = t;
    e.noteOn(0);
    return true
};
DMAF.CheckTimeManager = null;
DMAF.Managers.getCheckTimeManager = function() {
    if (!DMAF.CheckTimeManager) {
        DMAF.CheckTimeManager = new DMAF.Managers.CheckTimeManager
    }
    return DMAF.CheckTimeManager
};
DMAF.Managers.CheckTimeManager = function() {
    this.pendingArray = []
};
DMAF.Managers.CheckTimeManager.prototype.checkFunctionTime = function(e, t, n, r, i) {
    var s;
    if (i && typeof i !== "array") {
        s = i;
        s.actionTime = e;
        s.caller = r;
        s.action = t
    } else {
        s = i ? i : [];
        s.unshift(e);
        s.unshift(r);
        s.unshift(t)
    }
    var o = DMAF.context.currentTime * 1e3;
    if (e > o + DMAF.preListen) {
        var u = e - o - DMAF.preListen;
        n.push(setTimeout(this.runAction, u, s))
    } else {
        this.runAction(s)
    }
};
DMAF.Managers.CheckTimeManager.prototype.runAction = function(e) {
    var t, n, r;
    if (e instanceof Array) {
        t = arguments[0];
        n = arguments[0].shift();
        r = arguments[0].shift()
    } else {
        n = e.action;
        r = e.caller;
        t = [e]
    }
    n.apply(r, t)
};
DMAF.Managers.CheckTimeManager.prototype.checkEventTime = function(e, t, n, r, i) {
    var s = DMAF.context.currentTime * 1e3;
    if (!r) {
        r = DMAF.getController().onEvent
    }
    if (!i) {
        i = DMAF.getController()
    }
    if (t > s + DMAF.preListen) {
        var o = t - s - DMAF.preListen;
        this.pendingArray.push(setTimeout(function() {
            return function() {
                r.apply(i, [e, t, n])
            }
        }(), o))
    } else {
        r.apply(i, [e, t, n])
    }
};
DMAF.Managers.CheckTimeManager.prototype.dropPendingArray = function(e) {
    if (e instanceof Array) {
        while (e.length > 0) {
            clearTimeout(e.pop())
        }
        e = []
    }
};
DMAF.Managers.CheckTimeManager.prototype.addFrameListener = function(e, t, n) {
    var r = DMAF.Managers.getCheckTimeManager();
    var i = r.listeners,
        s = r.contexts;
    if (t && typeof t === "function") {
        s[e] = n;
        i[e] = t
    }
    if (!r.frameIntervalRunning) {
        r.startFrameInterval()
    }
};
DMAF.Managers.CheckTimeManager.prototype.removeFrameListener = function(e) {
    if (this.listeners[e]) {
        delete this.listeners[e]
    }
};
DMAF.Managers.CheckTimeManager.prototype.contexts = {};
DMAF.Managers.CheckTimeManager.prototype.listeners = {};
DMAF.Managers.CheckTimeManager.prototype.frameInterval = null;
DMAF.Managers.CheckTimeManager.prototype.frameIntervalRunning = false;
DMAF.Managers.CheckTimeManager.prototype.startFrameInterval = function() {
    if (!this.frameIntervalRunning) {
        DMAF.Utils.requestNextFrame.call(window, this.executeFrameListeners);
        this.frameIntervalRunning = true
    }
};
DMAF.Managers.CheckTimeManager.prototype.executeFrameListeners = function() {
    var e = DMAF.Managers.getCheckTimeManager().listeners,
        t = DMAF.Managers.getCheckTimeManager().contexts;
    for (var n in e) {
        e[n].call(t[n])
    }
    DMAF.Utils.requestNextFrame.call(window, DMAF.Managers.getCheckTimeManager().executeFrameListeners)
};
DMAF.Managers.ActionManager = function() {
    this.triggers = {};
    this.actionProperties = {};
    this.buttonActions = {};
    this.init()
};
DMAF.Managers.ActionManager.prototype.init = function() {
    var e = new XMLHttpRequest;
    e.open("GET", DMAF.actionsXMLsrc, true);
    e.onreadystatechange = function() {
        if (e.readyState === 4) {
            if (e.status > 199 && e.status < 300 || e.status === 304) {
                if (e.responseXML) {
                    DMAF.Managers.parseActionXML(e.responseXML)
                } else {
                    console.log("ERROR: Config file is unavailable or malformed!")
                }
            }
        }
    };
    e.send(null)
};
DMAF.Managers.ActionManager.prototype.addTrigger = function(e, t) {
    if (this.triggers[e] === undefined) {
        this.triggers[e] = []
    }
    this.triggers[e].push(t)
};
DMAF.Managers.ActionManager.prototype.onEvent = function(e, t, n) {
    if (this.triggers[e] === undefined) {
        DMAF.error("no actions for trigger: " + e);
        return
    }
    var r = this.triggers[e];
    for (var i = 0; i < r.length; i++) {
        if (r[i].delay && r[i].delay > 0) {
            r[i].actionTime = t + r[i].delay
        } else {
            r[i].actionTime = t
        }
        r[i].trigger = e;
        if (n) {
            r[i].parameters = n
        }
        r[i].execute()
    }
};
DMAF.Managers.AssetsManager = function() {
    this.activeAssetsLibraries = {};
    this.pendingAssetsLibraries = {};
    this.loadedSounds = {};
    this.registerLibraries(DMAF.libraryXMLList);
    this.pendingLoads = [];
    this.loader = new Audio;
    this.preloadsInProgress = 0
};
DMAF.Managers.AssetsManager.prototype.getSound = function(e) {
    if (!this.loadedSounds[e]) {
        return false
    } else {
        if (this.loadedSounds[e] instanceof String) {} else {
            var t = DMAF.context.createBufferSource();
            try {
                t.buffer = this.loadedSounds[e]
            } catch (n) {
                DMAF.error("Sound not fully loaded", e)
            }
            t.gainNode = DMAF.context.createGainNode();
            t.connect(t.gainNode);
            t.gainNode.connect(DMAF.context.master);
            return t
        }
    }
    var r = DMAF.Managers.getSoundManager().getIdleSoundElement(this.loadedSounds[e]);
    if (r !== false) {
        return r
    } else {
        if (!this.loadedSounds[e]) {
            DMAF.error("DMAFError: sound not loaded, or not defined in the library: " + e);
            return false
        } else {
            DMAF.debug("DMAFError: sound not fully loaded: " + this.loadedSounds[e].name);
            return false
        }
    }
};
DMAF.Managers.AssetsManager.prototype.proceedLoadingQue = function(e) {
    var t = DMAF.Managers.getAssetsManager();
    if (e.target.response) {
        DMAF.context.decodeAudioData(e.target.response, function(n) {
            t.loadedSounds[e.target.name] = n
        }, function() {
            DMAF.error("error decoding audio data, corrupt or missing file? ");
            t.loadedSounds[e.target.name] = false
        })
    } else {
        DMAF.debug("proceeding loading que after failed load", e.target.name);
        t.loadedSounds[e.target.name] = false
    }
    t.loading = false;
    if (t.pendingLoads.length > 0) {
        var n = t.pendingLoads.pop();
        if (n !== undefined) {
            t.initSound(n.path, n.name)
        } else {
            DMAF.debug("Loading que empty")
        }
    }
};
DMAF.Managers.AssetsManager.prototype.checkIfLoading = function() {
    if (this.preloadsInProgress === 0 && this.loading === false) {
        return false
    } else {
        console.log("is loading");
        return true
    }
};
DMAF.Managers.AssetsManager.prototype.initSound = function(e, t) {
    if (this.loading) {
        this.pendingLoads.unshift({
            path: e,
            name: t
        });
        return
    }
    this.loading = true;
    var n = new XMLHttpRequest;
    n.open("GET", e, true);
    n.responseType = "arraybuffer";
    n.name = t;
    n.onload = this.proceedLoadingQue;
    this.loadedSounds[t] = n;
    n.send()
};
DMAF.Managers.AssetsManager.prototype.loadLibrary = function(e) {
    var t = DMAF.Managers.getAssetsManager();
    if (e instanceof Array) {
        var n = {};
        for (var r = 0; r < e.length; r++) {
            t.activeAssetsLibraries[e[r]] = {
                src: e[r]
            };
            DMAF.debug("starting loading of library: " + e[r]);
            var i = new XMLHttpRequest;
            i.open("GET", e[r], true);
            i.onreadystatechange = function() {
                if (i.readyState === 4) {
                    if (i.status > 199 && i.status < 300 || i.status === 304) {
                        DMAF.Managers.parseSoundXML(i.responseXML)
                    }
                }
            };
            i.send(null);
            delete t.pendingAssetsLibraries[e[r]]
        }
    } else {
        t.activeAssetsLibraries[e] = {
            src: e
        };
        DMAF.debug("starting loading of library: " + e);
        var i = new XMLHttpRequest;
        i.open("GET", e, false);
        i.onreadystatechange = function() {
            if (i.readyState === 4) {
                if (i.status > 199 && i.status < 300 || i.status === 304) {
                    DMAF.Managers.parseSoundXML(i.responseXML)
                }
            }
        };
        i.send(null);
        delete t.pendingAssetsLibraries[e]
    }
};
DMAF.Managers.AssetsManager.prototype.registerLibraries = function(e) {
    for (var t = 0; t < e.length; t++) {
        var n = e[t][0];
        var r;
        if (e[t][1] === false) {
            r = e[t][1]
        } else {
            r = true
        }
        var i;
        if (e[t][2]) {
            i = e[t][2]
        } else {
            if (!r) {
                DMAF.error("DMAFError: library " + n + " is without loading event")
            }
        }
        this.pendingAssetsLibraries[n] = {
            src: n
        };
        if (r) {
            this.loadLibrary(n)
        } else {
            DMAF.getController().addInternalEvent(i, this.loadLibrary, [n])
        }
    }
};
DMAF.Managers.AssetsManager.prototype.getBuffer = function(e) {
    var t = DMAF.Managers.getAssetsManager().loadedSounds[e];
    if (t === false) {
        return false
    } else {
        if (t !== undefined && !(t instanceof XMLHttpRequest)) {
            return t
        } else {
            if (this.loading) {
                this.pendingLoads.unshift({
                    path: DMAF.soundsPath + e + DMAF.fileFormat,
                    name: e
                });
                return
            }
            this.loading = true;
            var n = new XMLHttpRequest;
            n.open("GET", DMAF.soundsPath + e + DMAF.fileFormat, true);
            n.responseType = "arraybuffer";
            n.name = e;
            n.onload = this.proceedLoadingQue;
            this.loadedSounds[e] = n;
            n.send();
            return "loading"
        }
    }
};
DMAF.Managers.AssetsManager.prototype.preloadSamples = function(e, t) {
    function n(e) {
        var t = [];
        var n = e.length;
        for (var r = 0; r < n; r++) {
            for (var i = r + 1; i < n; i++) {
                if (e[r] === e[i]) {
                    i = ++r
                }
            }
            t.push(e[r])
        }
        return t
    }
    if (!e && typeof e !== "array") {
        return
    }
    e = n(e);
    var r = this;
    this.preloadsInProgress++;
    (function() {
        var n = 0;
        var i = e.length;
        var s = t;
        var o = function() {
            if (n === i) {
                DMAF.getCore().dispatch("loadComplete_" + s);
                r.preloadsInProgress--
            }
        };
        var u = function(e) {
            if (e) {
                r.proceedLoadingQue(e);
                var t = function() {
                    if (r.loadedSounds[e.target.name]) {
                        var t = r.loadedSounds[e.target.name].getChannelData === undefined ? false : true;
                        return t
                    } else {
                        return true
                    }
                };
                var i = function() {
                    if (t()) {
                        n++;
                        o()
                    } else {
                        setTimeout(i, 20)
                    }
                };
                i();
                return
            }
            n++;
            o()
        };
        for (var a = 0; a < i; a++) {
            if (DMAF.Managers.getAssetsManager().loadedSounds[e[a]] === undefined) {
                var l = new XMLHttpRequest;
                l.open("GET", DMAF.soundsPath + e[a] + DMAF.fileFormat, true);
                l.responseType = "arraybuffer";
                l.name = e[a];
                l.onload = u;
                r.loadedSounds[e[a]] = l;
                l.send()
            } else {
                if (DMAF.Managers.getAssetsManager().loadedSounds[e[a]] instanceof XMLHttpRequest) {
                    DMAF.Managers.getAssetsManager().loadedSounds[e[a]].onreadystatechange = function() {
                        return function(e) {
                            if (e.target.readyState === 4 && e.target.status > 199 && e.target.status < 305) {
                                u(e)
                            }
                        }
                    }()
                } else {
                    u()
                }
            }
        }
    })()
};
DMAF.Managers.AudioBusManager = function() {
    this.activeAudioBusInstances = {}
};
DMAF.Managers.AudioBusManager.prototype.addAudioBusInstance = function(e) {
    if (!this.activeAudioBusInstances[e.instanceId]) {
        this.activeAudioBusInstances[e.instanceId] = e
    }
};
DMAF.Managers.AudioBusManager.prototype.removeAudioBusInstance = function(e) {
    if (this.activeAudioBusInstances[e]) {
        delete this.activeAudioBusInstances[e]
    }
};
DMAF.Managers.AudioBusManager.prototype.getAudioBusInstance = function(e) {
    if (this.activeAudioBusInstances[e]) {
        return this.activeAudioBusInstances[e]
    } else {
        return false
    }
};
DMAF.Managers.getActionManager = function() {
    if (!DMAF.ActionManager) {
        DMAF.ActionManager = new DMAF.Managers.ActionManager
    }
    return DMAF.ActionManager
};
DMAF.Managers.getSoundManager = function() {
    if (!DMAF.SoundManager) {
        DMAF.SoundManager = new DMAF.Managers.SoundManager
    }
    return DMAF.SoundManager
};
DMAF.Managers.getSynthManager = function() {
    if (!DMAF.SynthManager) {
        DMAF.SynthManager = new DMAF.Managers.SynthManager
    }
    return DMAF.SynthManager
};
DMAF.Managers.getAssetsManager = function() {
    if (!DMAF.AssetsManager) {
        DMAF.AssetsManager = new DMAF.Managers.AssetsManager
    }
    return DMAF.AssetsManager
};
DMAF.Managers.getAudioBusManager = function() {
    if (!DMAF.AudioBusManager) {
        DMAF.AudioBusManager = new DMAF.Managers.AudioBusManager
    }
    return DMAF.AudioBusManager
};
DMAF.Managers.parseActionXML = function(e) {
    var t, n, r, i, s, o, u, a, f = e.getElementsByTagName("sound");
    for (i = 0; i < f.length; i++) {
        t = f[i].getAttribute("action");
        a = f[i];
        switch (t) {
            case "SOUNDGENERIC_PLAY":
                o = a.getAttribute("triggers");
                u = o.split(",");
                for (r = 0; r < u.length; r++) {
                    n = {
                        soundId: a.getElementsByTagName("soundId")[0].textContent,
                        soundFile: a.getElementsByTagName("soundFile")[0].textContent,
                        volume: parseInt(a.getElementsByTagName("volume")[0].textContent, 10),
                        pan: parseInt(a.getElementsByTagName("pan")[0].textContent, 10),
                        preListen: parseInt(a.getElementsByTagName("preListen")[0].textContent, 10),
                        reTrig: isNaN(parseInt(a.getElementsByTagName("reTrig")[0].textContent, 10)) ? a.getElementsByTagName("reTrig")[0].textContent : parseInt(a.getElementsByTagName("reTrig")[0].textContent, 10),
                        softLoop: a.getElementsByTagName("softLoop")[0].textContent,
                        loopLength: parseInt(a.getElementsByTagName("loopLength")[0].textContent, 10),
                        bus: a.getElementsByTagName("bus")[0].textContent,
                        delay: parseInt(a.getElementsByTagName("delay")[0].textContent, 10),
                        priority: parseInt(a.getElementsByTagName("priority")[0].textContent, 10),
                        timingCorrection: a.getElementsByTagName("timingCorrection")[0].textContent,
                        trigger: u[r]
                    };
                    t = DMAF.Factories.getSoundActionFactory().create("SOUNDGENERIC_PLAY", n);
                    DMAF.Managers.getActionManager().addTrigger(u[r], t)
                }
                break;
            case "SOUNDSTEP_PLAY":
                o = a.getAttribute("triggers");
                u = o.split(",");
                for (r = 0; r < u.length; r++) {
                    var l = [],
                        c = a.getElementsByTagName("soundFiles")[0],
                        h = c.getElementsByTagName("sound");
                    for (s = 0; s < h.length; s++) {
                        l.push(h[s].textContent)
                    }
                    n = {
                        soundId: a.getElementsByTagName("soundId")[0].textContent,
                        soundFiles: l,
                        volume: parseInt(a.getElementsByTagName("volume")[0].textContent, 10),
                        preListen: parseInt(a.getElementsByTagName("preListen")[0].textContent, 10),
                        reTrig: isNaN(parseInt(a.getElementsByTagName("reTrig")[0].textContent, 10)) ? a.getElementsByTagName("reTrig")[0].textContent : parseInt(a.getElementsByTagName("reTrig")[0].textContent, 10),
                        iterator: a.getElementsByTagName("generator")[0].textContent,
                        priority: parseInt(a.getElementsByTagName("priority")[0].textContent, 10),
                        timingCorrection: a.getElementsByTagName("timingCorrection")[0].textContent,
                        trigger: u[r],
                        bus: a.getElementsByTagName("bus")[0].textContent,
                        pan: parseInt(a.getElementsByTagName("pan")[0].textContent, 10),
                        loopLength: parseInt(a.getElementsByTagName("loopLength")[0].textContent, 10),
                        delay: parseInt(a.getElementsByTagName("delay")[0].textContent, 10)
                    };
                    t = DMAF.Factories.getSoundActionFactory().create("SOUNDSTEP_PLAY", n);
                    DMAF.Managers.getActionManager().addTrigger(u[r], t)
                }
                break;
            case "SOUNDBASIC_PLAY":
                o = a.getAttribute("triggers");
                u = o.split(",");
                for (r = 0; r < u.length; r++) {
                    n = {
                        soundId: a.getElementsByTagName("soundId")[0].textContent,
                        file: a.getElementsByTagName("soundFile")[0].textContent,
                        volume: parseInt(a.getElementsByTagName("volume")[0].textContent, 10),
                        pan: parseInt(a.getElementsByTagName("pan")[0].textContent, 10),
                        preListen: parseInt(a.getElementsByTagName("preListen")[0].textContent, 10),
                        timingCorrection: a.getElementsByTagName("timingCorrection")[0].textContent,
                        priority: parseInt(a.getElementsByTagName("priority")[0].textContent, 10),
                        trigger: u[r],
                        bus: a.getElementsByTagName("bus")[0].textContent
                    };
                    t = DMAF.Factories.getSoundActionFactory().create("SOUNDBASIC_PLAY", n);
                    DMAF.Managers.getActionManager().addTrigger(u[r], t)
                }
                break;
            case "SOUND_STOP":
                o = a.getAttribute("triggers");
                u = o.split(",");
                for (r = 0; r < u.length; r++) {
                    var p = [],
                        d, v;
                    v = a.getElementsByTagName("targets")[0];
                    if (!v) {
                        d = a.getElementsByTagName("target")
                    } else {
                        d = v.getElementsByTagName("target")
                    }
                    d = v.getElementsByTagName("target");
                    for (s = 0; s < d.length; s++) {
                        p.push(d[s].textContent)
                    }
                    if (p.length > 0) {
                        n = {
                            targets: p,
                            delay: parseInt(a.getElementsByTagName("delay")[0].textContent, 10),
                            trigger: u[r]
                        }
                    } else {
                        n = {
                            target: a.getElementsByTagName("target")[0].textContent,
                            delay: parseInt(a.getElementsByTagName("delay")[0].textContent, 10),
                            trigger: u[r]
                        }
                    }
                    t = DMAF.Factories.getSoundActionFactory().create("SOUND_STOP", n);
                    DMAF.Managers.getActionManager().addTrigger(u[r], t)
                }
                break;
            case "GUITAR_CREATE":
                o = a.getAttribute("triggers");
                u = o.split(",");
                for (r = 0; r < u.length; r++) {
                    var m = a.getElementsByTagName("stringModes")[0];
                    var g = m.getElementsByTagName("sampleMapGroup");
                    var y = {};
                    for (var b = 0; b < g.length; ++b) {
                        var w = g[b].getAttribute("id");
                        var E = w.split("_")[1];
                        if (!y[E]) {
                            y[E] = {};
                            y[E].maps = {}
                        }
                        var S = g[b].getElementsByTagName("sampleMap");
                        for (var x = 0; x < S.length; ++x) {
                            var T = parseInt(S[x].getElementsByTagName("velocityLow")[0].textContent, 10) || 0;
                            var N = parseInt(S[x].getElementsByTagName("velocityHigh")[0].textContent, 10) || 127;
                            y[E].maps[S[x].getElementsByTagName("sampleMapName")[0].textContent] = {
                                velocityLow: T,
                                velocityHigh: N,
                                style: w.split("_")[0]
                            }
                        }
                    }
                    var C = DMAF.Managers.parseEffectsXML(a.getElementsByTagName("effects")[0]);
                    var k = a.getElementsByTagName("bus")[0];
                    n = {
                        effects: C,
                        stringMaps: y,
                        instanceId: a.getElementsByTagName("instanceId")[0].textContent,
                        bus: k ? k.textContent : undefined,
                        ignoreNoteEnd: a.getElementsByTagName("ignoreNoteEnd")[0].textContent === "true" ? true : false,
                        ampAttackTime: parseInt(a.getElementsByTagName("ampAttackTime")[0].textContent, 10),
                        ampDecayTime: parseInt(a.getElementsByTagName("ampDecayTime")[0].textContent, 10),
                        ampReleaseTime: parseInt(a.getElementsByTagName("ampReleaseTime")[0].textContent, 10),
                        ampSustainLevel: parseFloat(a.getElementsByTagName("ampSustainLevel")[0].textContent),
                        ampVelocityRatio: parseFloat(a.getElementsByTagName("ampVelocityRatio")[0].textContent),
                        loop: a.getElementsByTagName("loop")[0].textContent === "true" ? true : false,
                        filterOn: a.getElementsByTagName("filterOn")[0].textContent === "true" ? true : false,
                        filterAttackTime: parseInt(a.getElementsByTagName("filterAttackTime")[0].textContent, 10),
                        filterDecayTime: parseInt(a.getElementsByTagName("filterDecayTime")[0].textContent, 10),
                        filterReleaseTime: parseInt(a.getElementsByTagName("filterReleaseTime")[0].textContent, 10),
                        filterADSRAmount: parseFloat(a.getElementsByTagName("filterADSRAmount")[0].textContent),
                        filterSustainLevel: parseFloat(a.getElementsByTagName("filterSustainLevel")[0].textContent),
                        filterVelocityRatio: parseFloat(a.getElementsByTagName("filterVelocityRatio")[0].textContent),
                        filterQ: parseFloat(a.getElementsByTagName("filterQ")[0].textContent),
                        filterGain: parseFloat(a.getElementsByTagName("filterGain")[0].textContent),
                        filterFrequency: parseFloat(a.getElementsByTagName("filterFrequency")[0].textContent),
                        volume: parseInt(a.getElementsByTagName("volume")[0].textContent, 10)
                    };
                    if (n.bus === undefined) {
                        n.bus = "master"
                    }
                    t = DMAF.Factories.getSynthActionFactory().create("GUITAR_CREATE", n);
                    DMAF.Managers.getActionManager().addTrigger(u[r], t)
                }
                break;
            case "DRUMS_CREATE":
                o = a.getAttribute("triggers");
                u = o.split(",");
                for (r = 0; r < u.length; r++) {
                    var L = {},
                        g;
                    g = a.getElementsByTagName("sampleMap");
                    for (s = 0; s < g.length; s++) {
                        var T = parseInt(g[s].getElementsByTagName("velocityLow")[0].textContent, 10) || 0;
                        var N = parseInt(g[s].getElementsByTagName("velocityHigh")[0].textContent, 10) || 127;
                        L[g[s].getElementsByTagName("sampleMapName")[0].textContent] = {
                            velocityLow: T,
                            velocityHigh: N
                        }
                    }
                    var k = a.getElementsByTagName("bus")[0];
                    n = {
                        sampleMaps: L,
                        effects: C,
                        instanceId: a.getElementsByTagName("instanceId")[0].textContent,
                        bus: k ? k.textContent : undefined,
                        ignoreNoteEnd: a.getElementsByTagName("ignoreNoteEnd")[0].textContent === "true" ? true : false,
                        ampAttackTime: parseInt(a.getElementsByTagName("ampAttackTime")[0].textContent, 10),
                        ampDecayTime: parseInt(a.getElementsByTagName("ampDecayTime")[0].textContent, 10),
                        ampReleaseTime: parseInt(a.getElementsByTagName("ampReleaseTime")[0].textContent, 10),
                        ampSustainLevel: parseFloat(a.getElementsByTagName("ampSustainLevel")[0].textContent),
                        ampVelocityRatio: parseFloat(a.getElementsByTagName("ampVelocityRatio")[0].textContent),
                        loop: a.getElementsByTagName("loop")[0].textContent === "true" ? true : false,
                        filterOn: a.getElementsByTagName("filterOn")[0].textContent === "true" ? true : false,
                        filterAttackTime: parseInt(a.getElementsByTagName("filterAttackTime")[0].textContent, 10),
                        filterDecayTime: parseInt(a.getElementsByTagName("filterDecayTime")[0].textContent, 10),
                        filterReleaseTime: parseInt(a.getElementsByTagName("filterReleaseTime")[0].textContent, 10),
                        filterADSRAmount: parseFloat(a.getElementsByTagName("filterADSRAmount")[0].textContent),
                        filterSustainLevel: parseFloat(a.getElementsByTagName("filterSustainLevel")[0].textContent),
                        filterVelocityRatio: parseFloat(a.getElementsByTagName("filterVelocityRatio")[0].textContent),
                        filterQ: parseFloat(a.getElementsByTagName("filterQ")[0].textContent),
                        filterGain: parseFloat(a.getElementsByTagName("filterGain")[0].textContent),
                        filterFrequency: parseFloat(a.getElementsByTagName("filterFrequency")[0].textContent),
                        volume: parseInt(a.getElementsByTagName("volume")[0].textContent, 10)
                    };
                    if (n.bus === undefined) {
                        n.bus = "master"
                    }
                    t = DMAF.Factories.getSynthActionFactory().create("DRUMS_CREATE", n);
                    DMAF.Managers.getActionManager().addTrigger(u[r], t)
                }
                break;
            case "SYNTH_CREATE":
                o = a.getAttribute("triggers");
                u = o.split(",");
                for (r = 0; r < u.length; r++) {
                    var L = {},
                        g;
                    g = a.getElementsByTagName("sampleMap");
                    for (s = 0; s < g.length; s++) {
                        var T = parseInt(g[s].getElementsByTagName("velocityLow")[0].textContent, 10) || 0;
                        var N = parseInt(g[s].getElementsByTagName("velocityHigh")[0].textContent, 10) || 127;
                        var A = g[s].getElementsByTagName("sampleMapName")[0].textContent;
                        if (A !== "") {
                            L[A] = {
                                velocityLow: T,
                                velocityHigh: N
                            }
                        } else {
                            L[a.getElementsByTagName("instanceId")[0].textContent] = {
                                velocityLow: T,
                                velocityHigh: N
                            }
                        }
                    }
                    var C = DMAF.Managers.parseEffectsXML(a.getElementsByTagName("effects")[0]);
                    var k = a.getElementsByTagName("bus")[0];
                    n = {
                        sampleMaps: L,
                        effects: C,
                        instanceId: a.getElementsByTagName("instanceId")[0].textContent,
                        bus: k ? k.textContent : undefined,
                        ignoreNoteEnd: a.getElementsByTagName("ignoreNoteEnd")[0].textContent === "true" ? true : false,
                        ampAttackTime: parseInt(a.getElementsByTagName("ampAttackTime")[0].textContent, 10),
                        ampDecayTime: parseInt(a.getElementsByTagName("ampDecayTime")[0].textContent, 10),
                        ampReleaseTime: parseInt(a.getElementsByTagName("ampReleaseTime")[0].textContent, 10),
                        ampSustainLevel: parseFloat(a.getElementsByTagName("ampSustainLevel")[0].textContent),
                        ampVelocityRatio: parseFloat(a.getElementsByTagName("ampVelocityRatio")[0].textContent),
                        loop: a.getElementsByTagName("loop")[0].textContent === "true" ? true : false,
                        filterOn: a.getElementsByTagName("filterOn")[0].textContent === "true" ? true : false,
                        filterAttackTime: parseInt(a.getElementsByTagName("filterAttackTime")[0].textContent, 10),
                        filterDecayTime: parseInt(a.getElementsByTagName("filterDecayTime")[0].textContent, 10),
                        filterReleaseTime: parseInt(a.getElementsByTagName("filterReleaseTime")[0].textContent, 10),
                        filterADSRAmount: parseFloat(a.getElementsByTagName("filterADSRAmount")[0].textContent),
                        filterSustainLevel: parseFloat(a.getElementsByTagName("filterSustainLevel")[0].textContent),
                        filterVelocityRatio: parseFloat(a.getElementsByTagName("filterVelocityRatio")[0].textContent),
                        filterQ: parseFloat(a.getElementsByTagName("filterQ")[0].textContent),
                        filterGain: parseFloat(a.getElementsByTagName("filterGain")[0].textContent),
                        filterFrequency: parseFloat(a.getElementsByTagName("filterFrequency")[0].textContent),
                        volume: parseInt(a.getElementsByTagName("volume")[0].textContent, 10)
                    };
                    if (n.bus === undefined) {
                        n.bus = "master"
                    }
                    t = DMAF.Factories.getSynthActionFactory().create("SYNTH_CREATE", n);
                    DMAF.Managers.getActionManager().addTrigger(u[r], t)
                }
                break;
            case "AUDIOBUS_CREATE":
                o = a.getAttribute("triggers");
                u = o.split(",");
                for (r = 0; r < u.length; r++) {
                    var C = DMAF.Managers.parseEffectsXML(a.getElementsByTagName("effects")[0]);
                    n = {
                        effects: C,
                        instanceId: a.getElementsByTagName("instanceId")[0].textContent,
                        output: a.getElementsByTagName("output")[0].textContent,
                        volume: a.getElementsByTagName("volume")[0].textContent,
                        pan: a.getElementsByTagName("pan")[0].textContent
                    };
                    if (n.output === undefined) {
                        n.output = "master"
                    }
                    t = DMAF.Factories.getAudioBusFactory().create("AUDIOBUS_CREATE", n);
                    DMAF.Managers.getActionManager().addTrigger(u[r], t)
                }
                break;
            default:
                if (f[i].getAttribute("action") !== undefined) {
                    DMAF.debug("could not find action: ", f[i])
                }
                break
        }
    }
    f = e.getElementsByTagName("processor");
    for (i = 0; i < f.length; i++) {
        t = f[i].getAttribute("action");
        a = f[i];
        switch (t) {
            case "TRANSFORM_CREATE":
                o = a.getAttribute("triggers");
                u = o.split(",");
                for (r = 0; r < u.length; r++) {
                    var p = [],
                        d, v;
                    v = a.getElementsByTagName("targets")[0];
                    if (v) {
                        d = v.getElementsByTagName("target");
                        for (s = 0; s < d.length; s++) {
                            p.push(d[s].textContent)
                        }
                    }
                    if (p.length) {
                        n = {
                            targetType: a.getElementsByTagName("targetType")[0].textContent,
                            targetParameter: a.getElementsByTagName("targetParameter")[0].textContent,
                            targets: p,
                            value: parseFloat(a.getElementsByTagName("value")[0].textContent),
                            ratio: parseFloat(a.getElementsByTagName("ratio")[0].textContent),
                            shape: a.getElementsByTagName("shape")[0].textContent,
                            duration: parseFloat(a.getElementsByTagName("duration")[0].textContent),
                            delay: parseFloat(a.getElementsByTagName("delay")[0].textContent),
                            trigger: u[r]
                        }
                    } else {
                        var O = a.getElementsByTagName("target")[0].textContent;
                        if (O == "multi") {
                            var M = a.getElementsByTagName("suffix")[0].textContent;
                            O = u[r].replace(M, "")
                        }
                        n = {
                            targetType: a.getElementsByTagName("targetType")[0].textContent,
                            targetParameter: a.getElementsByTagName("targetParameter")[0].textContent,
                            target: O,
                            value: parseFloat(a.getElementsByTagName("value")[0].textContent),
                            ratio: parseInt(a.getElementsByTagName("ratio")[0].textContent),
                            shape: a.getElementsByTagName("shape")[0].textContent,
                            duration: parseFloat(a.getElementsByTagName("duration")[0].textContent),
                            delay: parseFloat(a.getElementsByTagName("delay")[0].textContent),
                            trigger: u[r]
                        }
                    }
                    t = DMAF.Factories.getProcessorActionFactory().create("TRANSFORM_CREATE", n);
                    DMAF.Managers.getActionManager().addTrigger(u[r], t)
                }
                break;
            case "MACRO_CREATE":
                var _ = a.getElementsByTagName("name")[0].textContent;
                var D = a.getElementsByTagName("initValue")[0].textContent;
                o = a.getAttribute("triggers");
                u = o.split(",");
                for (r = 0; r < u.length; r++) {
                    var P = a.getElementsByTagName("targets")[0];
                    var H = P.getElementsByTagName("target");
                    for (var B = 0; B < H.length; ++B) {
                        var j = H[B];
                        n = {
                            targetType: j.getElementsByTagName("targetType")[0].textContent,
                            targetId: j.getElementsByTagName("targetId")[0].textContent,
                            targetParameter: j.getElementsByTagName("targetParameter")[0].textContent,
                            transitionTime: j.getElementsByTagName("transitionTime")[0].textContent,
                            shape: j.getElementsByTagName("shape")[0].textContent,
                            transitionTime: j.getElementsByTagName("transitionTime")[0].textContent,
                            minValue: parseFloat(j.getElementsByTagName("minValue")[0].textContent),
                            maxValue: parseFloat(j.getElementsByTagName("maxValue")[0].textContent)
                        };
                        t = DMAF.Factories.getProcessorActionFactory().create("MACRO_CREATE", n);
                        DMAF.Managers.getActionManager().addTrigger(u[r], t)
                    }
                }
                break;
            default:
                if (a.getAttribute("action") !== undefined) {
                    DMAF.debug("could not find action: ", a)
                }
                break
        }
    }
    DMAF.actionsLoaded = true;
    DMAF.checkIfReady()
};
DMAF.Managers.parseSoundXML = function(e) {
    var t = e.getElementsByTagName("file"),
        n;
    for (n = 0; n < t.length; n++) {
        var r = t[n].getAttribute("name");
        var i = t[n].textContent;
        DMAF.Managers.getAssetsManager().initSound(i, r)
    }
};
DMAF.Managers.parseEffectsXML = function(e) {
    var t = [];
    if (e == undefined) {
        return t
    }
    var n = e.getElementsByTagName("effect");
    var r = [];
    for (var i = 0; i < n.length; ++i) {
        if (n[i].parentNode == e) {
            r.push(n[i])
        }
    }
    for (var s = 0; s < r.length; ++s) {
        var o = {};
        o.type = r[s].getAttribute("type");
        o.params = [];
        var u = r[s].getElementsByTagName("parameter");
        var a = [];
        for (var i = 0; i < u.length; ++i) {
            if (u[i].parentNode == r[s]) {
                a.push(u[i])
            }
        }
        for (var f = 0; f < a.length; ++f) {
            if (o.type == "FXGROUP" && a[f].getAttribute("name") == "innerEffects") {
                o.params.innerEffects = this.parseEffectsXML(a[f])
            } else {
                o.params[a[f].getAttribute("name")] = a[f].textContent
            }
        }
        t.push(o)
    }
    return t
};
DMAF.Processors.AbstractProcessor = function() {};
DMAF.Processors.activeTransforms = [];
DMAF.Processors.noTransformsInProgress = true;
DMAF.Processors.transformResolution = 1e3 / 30;
DMAF.Processors.transformTimer = null;
DMAF.Processors.TransformProcessor = function(e) {
    DMAF.Processors.AbstractProcessor.call(this);
    this.targetType = e.targetType;
    this.targetParameter = e.targetParameter;
    this.target = e.target;
    this.value = e.value;
    this.shape = e.shape;
    this.ratio = e.ratio;
    this.duration = e.duration / 1e3;
    this.delay = e.delay;
    this.type = "TRANSFORM_CREATE"
};
DMAF.Processors.TransformProcessor.prototype = new DMAF.Processors.AbstractProcessor;
DMAF.Processors.TransformProcessor.prototype.execute = function() {
    var e = DMAF.getDynamicValueRetriever().getTargetInstance(this.targetType + ":" + this.target);
    if (!e) {
        return
    }
    var t = this.targetParameter.split(":");
    if (t.length == 1) {
        if (this.shape === "linear") {
            e.setAutomatableProperty(t[0], this.value)
        } else {
            if (this.shape === "exponential") {
                e.setAutomatableProperty(t[0], this.value, this.duration)
            }
        }
    } else {
        var n = e.getAutomatableProperties(t[0]);
        for (var r = 1; r < t.length - 1; r++) {
            n = n.getAutomatableProperties(t[r])
        }
        if (this.shape === "linear") {
            n.setAutomatableProperty(t[t.length - 1], this.value)
        } else {
            if (this.shape === "exponential") {
                n.setAutomatableProperty(t[t.length - 1], this.value, this.duration)
            }
        }
    }
};
DMAF.Processors.processTransforms = function() {
    for (var e = DMAF.Processors.activeTransforms.length - 1; e >= 0; e--) {
        var t = DMAF.Processors.activeTransforms[e];
        if (t.endValue - t.startValue === 0) {
            DMAF.Processors.activeTransforms.splice(e, 1)
        }
        var n = t.startValue + (t.endValue - t.startValue) * ((DMAF.context.currentTime * 1e3 - t.startTime) / (t.endTime - t.startTime));
        if (t.endValue - t.startValue >= 0 && n > t.endValue) {
            if (t.that.targetParameter === "volume") {
                t.targetElement.setVolume(t.endValue)
            } else {
                t.targetElement[t.that.targetParameter] = t.endValue
            }
            DMAF.Processors.activeTransforms.splice(e, 1)
        } else {
            if (t.endValue - t.startValue < 0 && n < t.endValue) {
                if (t.that.targetParameter === "volume") {
                    t.targetElement.setVolume(t.endValue)
                } else {
                    t.targetElement[t.that.targetParameter] = t.endValue
                }
                DMAF.Processors.activeTransforms.splice(e, 1)
            } else {
                if (t.that.targetParameter === "volume") {
                    t.targetElement.setVolume(n)
                } else {
                    t.targetElement[t.that.targetParameter] = n
                }
            }
        }
    }
    if (DMAF.Processors.activeTransforms.length <= 0) {
        clearInterval(DMAF.Processors.transformTimer);
        DMAF.Processors.noTransformsInProgress = true
    }
};
DMAF.Processors.MacroProcessor = function(e) {
    DMAF.Processors.AbstractProcessor.call(this);
    this.targetType = e.targetType;
    this.targetId = e.targetId;
    this.targetParameter = e.targetParameter;
    this.shape = e.shape;
    this.transitionTime = e.transitionTime;
    this.minValue = e.minValue;
    this.maxValue = e.maxValue;
    this.type = "MACRO_CREATE"
};
DMAF.Processors.MacroProcessor.prototype = new DMAF.Processors.AbstractProcessor;
DMAF.Processors.MacroProcessor.prototype.execute = function(e) {
    var t = DMAF.getDynamicValueRetriever().getTargetInstance(this.targetType + ":" + this.targetId);
    if (!t) {
        return
    }
    var n = this.targetParameter.split(":");
    var r = this.minValue + (this.maxValue - this.minValue) * e;
    if (n.length == 1) {
        if (this.shape === "linear") {
            t.setAutomatableProperty(n[0], r)
        } else {
            if (this.shape === "exponential") {
                t.setAutomatableProperty(n[0], r, this.transitionTime)
            }
        }
    } else {
        var i = t.getAutomatableProperties(n[0]);
        for (var s = 1; s < n.length - 1; s++) {
            i = i.getAutomatableProperties(n[s])
        }
        if (this.shape === "linear") {
            i.setAutomatableProperty(n[n.length - 1], r)
        } else {
            if (this.shape === "exponential") {
                i.setAutomatableProperty(n[n.length - 1], r, this.transitionTime)
            }
        }
    }
};
DMAF.Sounds.SoundAbstract = function(e) {
    EventDispatcher.call(this);
    this.soundManager = DMAF.Managers.getSoundManager();
    this.instanceId = e
};
DMAF.Sounds.SoundAbstract.prototype = new EventDispatcher;
DMAF.Sounds.SoundAbstract.prototype.constructor = DMAF.Sounds.AbstractSound;
DMAF.Sounds.SoundAbstract.prototype.stop = function() {
    this.sound.pause();
    DMAF.Managers.getSoundManager().removeActiveElement(this.sound.id);
    DMAF.Managers.getSoundManager().removeSoundInstance(this.soundId + "." + this.instanceId)
};
DMAF.Sounds.SoundAbstract.prototype.setVolume = function(e) {
    var t;
    if (typeof e == "number" && !isNaN(e)) {
        if (e < -46) {
            e = -46
        } else {
            if (e > 0) {
                e = 0
            }
        }
        this.volume = e;
        this.jsVolume = DMAF.Utils.dbToJSVolume(e + DMAF.masterVolume);
        if (this.sound) {
            this.sound.gainNode.gain.value = this.jsVolume
        } else {
            if (this.sounds) {
                for (t = 0; t < this.sounds.lentgh; t++) {
                    this.sounds[t].gainNode.gain.value = this.jsVolume
                }
            }
        }
    } else {
        this.jsVolume = DMAF.Utils.dbToJSVolume(this.volume + DMAF.masterVolume);
        if (this.sound) {
            this.sound.gainNode.gain.value = this.jsVolume
        } else {
            if (this.sounds) {
                for (t = 0; t < this.sounds.lentgh; t++) {
                    this.sounds[t].gainNode.gain.value = this.jsVolume
                }
            }
        }
    }
};
DMAF.Sounds.SoundGeneric = function(e) {
    DMAF.Sounds.SoundAbstract.call(this, e);
    this.sound = null;
    this.sounds = [];
    this.currentFile = "";
    this.soundLength = 0;
    this.loading = false;
    this.playing = false;
    this.currentPosition = 0;
    this.previousActionTime = 0;
    this.currentActionTime = 0;
    this.pendingPlayArray = [];
    this.pendingSoftLoopArr = [];
    var t = this
};
DMAF.Sounds.SoundGeneric.prototype = new DMAF.Sounds.SoundAbstract;
DMAF.Sounds.SoundGeneric.prototype.stop = function() {
    DMAF.Managers.getCheckTimeManager().dropPendingArray(this.pendingSoftLoopArr);
    this.playing = false;
    for (var e = this.sounds.length - 1; e >= 0; e--) {
        this.sounds[e].noteOff(0);
        this.sounds.splice(e, 1)
    }
};
DMAF.Sounds.SoundGeneric.prototype.play = function(e) {
    if (this.loading) {
        return
    }
    var t = DMAF.Managers.getCheckTimeManager();
    t.dropPendingArray(this.pendingStopArray);
    if (this.sounds.length > 0) {
        if (this.reTrig === 0 || this.reTrig === "true") {
            t.dropPendingArray(this.pendingPlayArray)
        } else {
            if (typeof this.reTrig == "number" && this.reTrig > 0) {
                t.dropPendingArray(this.pendingPlayArray);
                if (e - this.reTrig > this.previousActionTime) {
                    this.previousActionTime = e
                } else {
                    return
                }
            } else {
                if (this.softLoop === true) {
                    this.previousActionTime = e
                } else {
                    return
                }
            }
        }
    } else {
        this.previousActionTime = e
    }
    t.checkFunctionTime(e, this.proceedPlay, this.pendingPlayArray, this)
};
DMAF.Sounds.SoundGeneric.prototype.onSoundEnded = function(e) {
    for (var t = this.sounds.length - 1; t >= 0; t--) {
        if (this.sounds[t].playbackState === 3) {
            this.sounds.splice(t, 1)
        }
    }
};
DMAF.Sounds.SoundGeneric.prototype.proceedPlay = function(e) {
    if (this.softLoop && this.timingCorrection === "PLAY") {
        DMAF.Managers.getCheckTimeManager().checkFunctionTime(DMAF.context.currentTime * 1e3 + this.loopLength, this.play, this.pendingSoftLoopArr, this)
    } else {
        if (this.softLoop) {
            DMAF.Managers.getCheckTimeManager().checkFunctionTime(e + this.loopLength, this.play, this.pendingSoftLoopArr, this)
        }
    }
    this.sound = DMAF.Managers.getAssetsManager().getSound(this.soundFile);
    if (this.sound === false) {
        return
    }
    this.sound.id = DMAF.Utils.createUID();
    DMAF.debug("generic sound " + this.sound.src + " id set to: " + this.sound.id);
    this.sound.parentInstance = this;
    this.sound.priority = this.priority;
    this.sound.gainNode.gain.value = this.jsVolume;
    this.sound.noteOn(0);
    this.playing = true;
    this.sounds.push(this.sound);
    if (this.sound.buffer) {
        DMAF.Managers.getCheckTimeManager().checkFunctionTime(DMAF.context.currentTime * 1e3 + this.sound.buffer.duration * 1e3 + 200, this.onSoundEnded, [], this)
    }
};
DMAF.Sounds.SoundStep = function(e) {
    DMAF.Sounds.SoundGeneric.call(this, e);
    this.sound = null;
    this.sounds = [];
    this.currentFile = "";
    this.soundLength = 0;
    this.playing = false;
    this.loading = false
};
DMAF.Sounds.SoundStep.prototype = new DMAF.Sounds.SoundGeneric;
DMAF.Sounds.SoundStep.prototype.getSoundFile = function() {
    var e = this.iterator.getNext();
    return e
};
DMAF.Sounds.SoundStep.prototype.stop = function() {
    DMAF.Managers.getCheckTimeManager().dropPendingArray(this.pendingSoftLoopArr);
    this.playing = false;
    for (var e = this.sounds.length - 1; e >= 0; e--) {
        this.sounds[e].noteOff(0);
        this.sounds.splice(e, 1)
    }
};
DMAF.Sounds.SoundStep.prototype.play = function(e) {
    var t = DMAF.Managers.getCheckTimeManager();
    t.dropPendingArray(this.pendingStopArray);
    if (this.sounds.length > 0) {
        if (this.reTrig === 0 || this.reTrig === "true") {
            t.dropPendingArray(this.pendingPlayArray)
        } else {
            if (typeof this.reTrig == "number" && this.reTrig > 0) {
                t.dropPendingArray(this.pendingPlayArray);
                if (e - this.reTrig > this.previousActionTime) {
                    this.previousActionTime = e
                } else {
                    return
                }
            } else {
                return
            }
        }
    } else {
        this.previousActionTime = e
    }
    t.checkFunctionTime(e, this.proceedPlay, this.pendingPlayArray, this)
};
DMAF.Sounds.SoundStep.prototype.proceedPlay = function(e) {
    this.currentFile = this.getSoundFile();
    this.sound = DMAF.Managers.getAssetsManager().getSound(this.currentFile);
    if (this.sound === false) {
        return
    }
    this.sound.id = DMAF.Utils.createUID();
    this.sound.parentInstance = this;
    this.sound.priority = this.priority;
    var t = this.soundManager.startSound(this.sound, this.jsVolume, e, this.timingCorrection, this.preListen);
    if (t) {
        this.playing = true;
        var n = this;
        this.sounds.push(this.sound)
    } else {
        DMAF.debug("DMAFError: couldn't start sound step (proceedplay)")
    }
};
DMAF.Sounds.SoundBasic = function(e) {
    DMAF.Sounds.SoundAbstract.call(this, e);
    this.sound = null;
    this.file = "";
    this.soundLength = 0;
    this.preListen = 0;
    this.playStartPosition = 0;
    this.timingCorrection = "PLAY";
    this.loading = false;
    var t = this
};
DMAF.Sounds.SoundBasic.prototype = new DMAF.Sounds.SoundAbstract;
DMAF.Sounds.SoundBasic.prototype.play = function(e) {
    if (this.loading) {
        return
    }
    var t = DMAF.Managers.getCheckTimeManager();
    t.dropPendingArray(this.pendingStopArray);
    this.sound = DMAF.Managers.getAssetsManager().getSound(this.file);
    if (this.sound === false) {
        return
    }
    if (this.sound.ended || this.sound.readyState === 4) {
        this.currentFile = this.sound.src;
        this.soundLength = this.sound.duration;
        this.previousActionTime = e;
        t.checkFunctionTime(e, this.proceedPlay, this.pendingPlayArray, this)
    } else {
        this.loading = true;
        var n = this;
        var r = function(i) {
            n.loading = false;
            i.target.removeEventListener("canplaythrough", r, false);
            if (!n.sound) {
                DMAF.debug("DMAFWarning: error fetching sound element: " + n.currentFile)
            }
            n.previousActionTime = e;
            t.checkFunctionTime(e, n.proceedPlay, n.pendingPlayArray, n)
        };
        this.sound.addEventListener("canplaythrough", r, false)
    }
};
DMAF.Sounds.SoundBasic.prototype.onSoundEnded = function(e) {
    var t = e.target.parentInstance;
    DMAF.Managers.getSoundManager().removeActiveElement(e.target.id);
    t.sound.removeEventListener("ended", t.onSoundEnded);
    t.sound = null;
    t.dispatch("finished")
};
DMAF.Sounds.SoundBasic.prototype.proceedPlay = function(e) {
    this.sound.id = DMAF.Utils.createUID();
    this.sound.parentInstance = this;
    this.sound.priority = this.priority;
    this.sound.addEventListener("ended", this.onSoundEnded);
    var t = DMAF.Managers.getSoundManager().startSound(this.sound, this.jsVolume, e, this.timingCorrection);
    if (!t) {
        console.error("Is the following function implemented? CHECK ME.");
        onEnded()
    }
};
DMAF.AudioBus = function(e) {
    this.instanceId = e.instanceId;
    this.outputBus = e.output;
    this.volume = e.volume;
    this.pan = e.pan;
    this.input = DMAF.context.createGainNode();
    this.output = DMAF.context.createGainNode();
    var t = this.input;
    this.effects = DMAF.createEffectsRecursive(this.input, e.effects);
    if (this.effects.length > 0) {
        t = this.effects[this.effects.length - 1].effectNode
    }
    t.connect(this.output);
    if (this.outputBus === "master") {
        this.output.connect(DMAF.context.master)
    } else {
        this.output.connect(DMAF.Managers.getAudioBusManager().getAudioBusInstance(this.outputBus).input)
    }
};
DMAF.AudioBus.prototype.getAutomatableProperties = function(e) {
    if (e.substring(0, 2) == "fx") {
        return this.effects[parseInt(e.substring(2))].effectNode
    }
};
DMAF.AudioBus.prototype.setAutomatableProperty = function(e, t, n) {
    if (n != null) {
        if (e === "volume") {
            this.output.gain.setTargetValueAtTime(parseFloat(t), DMAF.context.currentTime + n, n * .63)
        }
    } else {
        if (e === "volume") {
            this.output.gain.value = parseFloat(t)
        }
    }
};
DMAF.Actions.AudioBusCreate = function(e) {
    this.instanceId = e.instanceId;
    this.properties = e
};
DMAF.Actions.AudioBusCreate.prototype.execute = function(e) {
    var t = DMAF.Managers.getAudioBusManager().getAudioBusInstance(this.instanceId);
    if (!t) {
        t = new DMAF.AudioBus(this.properties);
        DMAF.Managers.getAudioBusManager().addAudioBusInstance(t)
    }
};
DMAF.Synth.SynthNote = function(e, t, n, r) {
    this.ampAttack = 0;
    this.ampDecay = .01;
    this.ampSustain = 1;
    this.ampRelease = .01;
    this.ampVelocityRatio = 1;
    this.velocity = 1;
    this.filterOn = false;
    this.filterAttack = 0;
    this.filterRelease = .01;
    this.filterDecay = .01;
    this.filterSustain = 1;
    this.filterFrequency = 0;
    this.filterADSRAmount = 1;
    this.filterVelocityRatio = 0;
    this.q = 0;
    this.filterGain = 0;
    this.filterType = "lowpass";
    this.midiNote = 64;
    if (r !== undefined) {
        this.sampleGain = r
    }
    if (t) {
        if (t.ampAttack !== undefined) {
            this.ampAttack = t.ampAttack
        }
        if (t.ampDecay !== undefined) {
            this.ampDecay = t.ampDecay;
            this.ampDecay = Math.max(this.ampDecay, .01)
        }
        if (t.ampSustain !== undefined) {
            this.ampSustain = t.ampSustain
        }
        if (t.ampRelease !== undefined) {
            this.ampRelease = t.ampRelease;
            this.ampRelease = Math.max(this.ampRelease, .01)
        }
        if (t.ampVelocityRatio !== undefined) {
            this.ampVelocityRatio = t.ampVelocityRatio
        }
        if (t.velocity !== undefined) {
            this.velocity = t.velocity
        }
        if (t.midiNote !== undefined) {
            this.midiNote = t.midiNote
        }
        if (t.filterAttackTime !== undefined) {
            this.filterAttack = t.filterAttackTime
        }
        if (t.filterDecayTime !== undefined) {
            this.filterDecay = t.filterDecayTime;
            this.filterDecay = Math.max(this.filterDecay, .01)
        }
        if (t.filterSustainLevel !== undefined) {
            this.filterSustain = t.filterSustainLevel
        }
        if (t.filterReleaseTime !== undefined) {
            this.filterRelease = t.filterReleaseTime;
            this.filterRelease = Math.max(this.filterRelease, .01)
        }
        if (t.filterFrequency !== undefined) {
            this.filterFrequency = t.filterFrequency
        }
        if (t.filterADSRAmount !== undefined) {
            this.filterADSRAmount = t.filterADSRAmount
        }
        if (t.filterVelocityRatio !== undefined) {
            this.filterVelocityRatio = t.filterVelocityRatio
        }
        if (t.q !== undefined) {
            this.q = t.q
        }
        if (t.filterType !== undefined) {
            this.filterType = t.filterType
        }
        if (t.midiNote !== undefined) {
            this.midiNote = t.midiNote
        }
        if (t.filterOn !== undefined) {
            this.filterOn = t.filterOn
        }
        if (t.filterGain !== undefined) {
            this.filterGain = t.filterGain
        }
    }
    this.ampAttackConstant = this.ampAttack / 1.4;
    this.ampDecayConstant = this.ampDecay / 1.4;
    this.ampReleaseConstant = this.ampRelease / 1.4;
    this.filterAttackConstant = this.filterAttack / 1.4;
    this.filterDecayConstant = this.filterDecay / 1.4;
    this.filterReleaseConstant = this.filterRelease / 1.4;
    this.filterSustain = Math.pow(this.filterSustain, 4);
    this.oscillator = DMAF.context.createBufferSource();
    this.oscillator.buffer = e;
    if (t.loop === true) {
        this.oscillator.loop = true
    }
    this.ampADSR = DMAF.context.createGainNode();
    this.ampADSR.gain.value = 0;
    if (t.filterOn) {
        var i = DMAF.Utils.MIDIToFrequency(this.filterFrequency * 12 + this.midiNote);
        this.filter = new DMAF.AudioNodes.Filter(this.filterType, {
            frequency: i,
            q: this.q,
            gain: this.filterGain
        });
        this.oscillator.connect(this.filter.input);
        this.filter.connect(this.ampADSR);
        if (n) {
            this.ampADSR.connect(n)
        } else {
            this.ampADSR.connect(DMAF.context.output)
        }
    } else {
        this.oscillator.connect(this.ampADSR);
        if (n) {
            this.ampADSR.connect(n)
        } else {
            this.ampADSR.connect(DMAF.context.output)
        }
    }
};
DMAF.Synth.SynthNote.prototype.play = function(e) {
    var t = e + this.ampAttack,
        n = 1 - this.ampVelocityRatio + this.velocity * this.ampVelocityRatio;
    n *= this.sampleGain;
    var r = Math.pow(this.ampSustain * n, 2),
        i = e + this.filterAttack,
        s = 1 - this.filterVelocityRatio + this.velocity * this.filterVelocityRatio,
        o = this.filterADSRAmount * s,
        u = this.filterFrequency + o,
        a = this.filterFrequency + this.filterSustain * o;
    u = DMAF.Utils.MIDIToFrequency(u * 12 + this.midiNote);
    a = DMAF.Utils.MIDIToFrequency(a * 12 + this.midiNote);
    this.filterFrequency = DMAF.Utils.MIDIToFrequency(this.filterFrequency * 12 + this.midiNote);
    if (this.filterOn) {
        if (u < this.filter.frequency.value) {
            u = this.filter.frequency.value
        }
    }
    u = Math.max(u, 20);
    u = Math.min(u, 2e4);
    a = Math.max(a, 20);
    a = Math.min(a, 2e4);
    if (this.ampAttack > 0) {
        this.ampADSR.gain.cancelScheduledValues(e);
        this.ampADSR.gain.setTargetValueAtTime(n, e, this.ampAttackConstant)
    } else {
        this.ampADSR.gain.cancelScheduledValues(e);
        this.ampADSR.gain.value = n;
        this.ampADSR.gain.setValueAtTime(n, e)
    } if (this.ampSustain < 1) {
        if (this.ampAttack > 0) {
            this.ampADSR.gain.cancelScheduledValues(t);
            this.ampADSR.gain.setTargetValueAtTime(r, t, this.ampDecayConstant)
        } else {
            this.ampADSR.gain.setTargetValueAtTime(r, t, this.ampDecayConstant)
        }
    }
    if (this.filterOn) {
        if (this.filterAttack > 0) {
            this.filter.frequency.cancelScheduledValues(e);
            this.filter.frequency.setTargetValueAtTime(u, e, this.filterAttackConstant)
        } else {
            this.filter.frequency.cancelScheduledValues(e);
            this.filter.frequency.value = u;
            this.filter.frequency.setValueAtTime(u, e)
        } if (this.filterSustain < 1) {
            if (this.filterAttack > 0) {
                this.filter.frequency.cancelScheduledValues(i);
                this.filter.frequency.setTargetValueAtTime(a, i, this.filterDecayConstant)
            } else {
                this.filter.frequency.setTargetValueAtTime(a, i, this.filterDecayConstant)
            }
        }
    } else {} if (this.endTime) {
        this.ampADSR.gain.cancelScheduledValues(this.endTime);
        this.ampADSR.gain.setTargetValueAtTime(0, this.endTime, this.ampReleaseConstant);
        if (this.filterOn) {
            this.filter.frequency.cancelScheduledValues(this.endTime);
            this.filter.frequency.setTargetValueAtTime(this.filterFrequency, this.endTime, this.filterReleaseConstant)
        }
    }
    this.oscillator.noteOn(e)
};
DMAF.Synth.SynthNote.prototype.stop = function(e, t) {
    this.oscillator.noteOff(e + this.ampRelease * 8);
    if (t) {
        this.ampADSR.gain.cancelScheduledValues(e);
        this.ampADSR.gain.setTargetValueAtTime(0, e, this.ampReleaseConstant);
        if (this.filterOn) {
            this.filter.frequency.cancelScheduledValues(e);
            this.filter.frequency.setTargetValueAtTime(this.filterFrequency, e, this.filterReleaseConstant)
        }
    }
};
DMAF.Synth.SynthInstance = function(e) {
    this.ampAttackTime = e.ampAttackTime / 1e3 || 0;
    this.ampReleaseTime = e.ampReleaseTime / 1e3 || 0;
    this.ampDecayTime = e.ampDecayTime / 1e3 || 0;
    this.ampSustainLevel = e.ampSustainLevel !== undefined ? e.ampSustainLevel : 1;
    this.ampVelocityRatio = e.ampVelocityRatio !== undefined ? e.ampVelocityRatio : 1;
    this.filterAttackTime = e.filterAttackTime / 1e3 || 0;
    this.filterReleaseTime = e.filterReleaseTime / 1e3 || 0;
    this.filterDecayTime = e.filterDecayTime / 1e3 || 0;
    this.filterSustainLevel = e.filterSustainLevel !== undefined ? e.filterSustainLevel : 1;
    this.filterFrequency = e.filterFrequency || 0;
    this.filterADSRAmount = e.filterADSRAmount !== undefined ? e.filterADSRAmount : 1;
    this.filterVelocityRatio = e.filterVelocityRatio || 0;
    this.filterType = 0;
    this.filterQ = e.filterQ || 0;
    this.filterGain = e.filterGain || 0;
    this.filterOn = e.filterOn;
    this.sampleMaps = e.sampleMaps;
    this.instanceId = e.instanceId;
    this.ignoreNoteEnd = e.ignoreNoteEnd;
    this.loop = e.loop;
    this.activeNotes = {};
    this.noteOnGuards = {};
    this.volume = DMAF.Utils.dbToWAVolume(e.volume);
    this.noteInput = DMAF.context.createGainNode();
    this.output = DMAF.context.createGainNode();
    if (e.output) {
        this.noteInput.connect(this.output);
        this.output.connect(e.output)
    } else {
        var t = this.noteInput;
        this.effects = DMAF.createEffectsRecursive(t, e.effects);
        if (this.effects.length > 0) {
            t = this.effects[this.effects.length - 1].effectNode
        }
        t.connect(this.output);
        if (e.bus === "master") {
            this.output.connect(DMAF.context.master)
        } else {
            this.output.connect(DMAF.Managers.getAudioBusManager().getAudioBusInstance(e.bus).input)
        }
    }
    this.isSustainOn = false;
    this.sustainNotes = [];
    var n, r, i;
    this.robinMemory = {};
    this.sampleMap = [];
    var s = [];
    for (r in this.sampleMaps) {
        if (r === "multi") {
            r = this.instanceId;
            this.sampleMaps[r] = this.sampleMaps.multi;
            delete this.sampleMaps.multi
        }
        this.robinMemory[r] = {};
        i = DMAF.Managers.getSynthManager().getSampleMap(r);
        for (n in i) {
            this.sampleMap.push(i[n]);
            s.push(i[n].sample)
        }
    }
    DMAF.Managers.getAssetsManager().preloadSamples(s, this.instanceId);
    DMAF.Managers.getCheckTimeManager().addFrameListener(this.instanceId, this.runDisposeCheck, this)
};
DMAF.Synth.SynthInstance.prototype.getAutomatableProperties = function(e) {
    if (e.substring(0, 2) == "fx") {
        return this.effects[parseInt(e.substring(2))].effectNode
    }
};
DMAF.Synth.SynthInstance.prototype.setAutomatableProperty = function(e, t, n) {
    if (n != null) {
        if (e === "volume") {
            this.output.gain.setTargetValueAtTime(parseFloat(t), DMAF.context.currentTime + n, n * .63)
        }
    } else {
        if (e === "volume") {
            this.output.gain.value = parseFloat(t)
        } else {
            if (e === "ampAttackTime") {
                this.ampAttackTime = parseFloat(t)
            } else {
                if (e === "ampDecayTime") {
                    this.ampDecayTime = parseFloat(t)
                } else {
                    if (e === "ampSustainLevel") {
                        this.ampSustainLevel = parseFloat(t)
                    } else {
                        if (e === "ampReleaseTime") {
                            this.ampReleaseTime = parseFloat(t)
                        } else {
                            if (e === "filterAttackTime") {
                                this.filterAttackTime = parseFloat(t)
                            } else {
                                if (e === "filterDecayTime") {
                                    this.filterDecayTime = parseFloat(t)
                                } else {
                                    if (e === "filterSustainLevel") {
                                        this.filterSustainLevel = parseFloat(t)
                                    } else {
                                        if (e === "filterReleaseTime") {
                                            this.filterReleaseTime = parseFloat(t)
                                        } else {
                                            if (e === "filterFrequency") {
                                                this.filterFrequency = parseFloat(t)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
DMAF.Synth.SynthInstance.prototype.play = function(e) {
    if (e.midiNote) {
        if (this.noteOnGuards[e.midiNote]) {
            this.stop(e)
        }
        this.noteOnGuards[e.midiNote] = true
    }
    var t;
    for (var n in this.sampleMaps) {
        if (this.sampleMaps[n].velocityLow <= e.velocity && e.velocity <= this.sampleMaps[n].velocityHigh) {
            if (e.style) {
                if (this.sampleMaps[n].style === e.style) {
                    this.sampleMap = DMAF.Managers.getSynthManager().getSampleMap(n);
                    t = n
                }
            } else {
                this.sampleMap = DMAF.Managers.getSynthManager().getSampleMap(n);
                t = n
            }
        }
    }
    if (t === null && e.style) {
        console.error("Found no sample map for velocity", e.velocity, "in instance", this.instanceId, "with style", e.style, ", data is", e, ", this.sampleMaps are", this.sampleMaps)
    }
    var r = [],
        i = [],
        s = [];
    for (var o in this.sampleMap) {
        if (this.sampleMap.hasOwnProperty(o)) {
            var u = this.sampleMap[o],
                a = DMAF.Utils.toMIDINote;
            if (e.midiNote >= a(u.lowEnd) && e.midiNote <= a(u.highEnd)) {
                r.push(u.sample);
                i.push(DMAF.Utils.MIDIToFrequency(DMAF.Utils.toMIDINote(u.baseNote)));
                if (u.sampleGain !== undefined) {
                    s.push(DMAF.Utils.dbToWAVolume(parseInt(u.sampleGain, 10)))
                } else {
                    s.push(1)
                }
            }
        }
    }
    var f = {
            ampAttack: this.ampAttackTime,
            ampDecay: this.ampDecayTime,
            ampSustain: this.ampSustainLevel,
            ampRelease: this.ampReleaseTime,
            velocity: Math.pow(e.velocity / 127, 1.2),
            ampVelocityRatio: this.ampVelocityRatio,
            filterOn: this.filterOn,
            filterAttackTime: this.filterAttackTime,
            filterReleaseTime: this.filterReleaseTime,
            filterDecayTime: this.filterDecayTime,
            filterSustainLevel: this.filterSustainLevel,
            filterFrequency: this.filterFrequency,
            filterADSRAmount: this.filterADSRAmount,
            filterVelocityRatio: this.filterVelocityRatio,
            filterType: this.filterType,
            q: this.filterQ,
            filterGain: this.filterGain,
            midiNote: e.midiNote,
            loop: this.loop
        },
        l = DMAF.Utils.MIDIToFrequency(e.midiNote);
    if (r.length === 0) {
        return false
    }
    var c, h = 0;
    if (r.length === 1) {
        c = r[0]
    } else {
        if (this.robinMemory[t][e.midiNote] === undefined) {
            this.robinMemory[t][e.midiNote] = 0;
            c = r[0]
        } else {
            var p = this.robinMemory[t][e.midiNote];
            ++p;
            if (p === r.length) {
                p = 0
            }
            this.robinMemory[t][e.midiNote] = p;
            h = p;
            c = r[p]
        }
    } if (c !== undefined) {
        var d = DMAF.Managers.getAssetsManager(),
            v = d.getBuffer(c);
        if (!v) {
            DMAF.error("MISSING FILE ERROR: found no sound file for " + c);
            return false
        } else {
            if (v === "loading") {
                DMAF.debug("TIMING ERROR: " + c + " is still loading");
                return false
            }
        }
        var m = new DMAF.Synth.SynthNote(v, f, this.noteInput, s[h]),
            g = v.length / DMAF.context.sampleRate;
        m.actionTime = e.actionTime / 1e3;
        if (this.ignoreNoteEnd) {
            m.disposeTime = m.actionTime + g
        } else {
            if (this.loop) {
                m.disposeTime = m.actionTime + e.noteEndTime + this.ampReleaseTime / 1e3
            } else {
                m.disposeTime = Math.min(m.actionTime + e.noteEndTime + this.ampReleaseTime / 1e3, m.actionTime + g)
            }
            m.endTime = m.disposeTime
        }
        m.oscillator.playbackRate.value = l / i[h];
        if (!this.activeNotes[e.midiNote]) {
            this.activeNotes[e.midiNote] = []
        }
        this.activeNotes[e.midiNote].push(m);
        this.sustainNotes.push(m);
        m.play(m.actionTime);
        m.stop(m.disposeTime);
        return true
    } else {
        DMAF.error("SAMPLE MAP ERROR: found no sample for: " + this.instanceId + " in sample map at midiNote: " + e.midiNote);
        return false
    }
};
DMAF.Synth.SynthInstance.prototype.stop = function(e) {
    if (e.midiNote) {
        delete this.noteOnGuards[e.midiNote]
    }
    if (this.isSustainOn) {
        for (var t = 0; t < this.sustainNotes.length; ++t) {
            if (e.midiNote === this.sustainNotes[t].midiNote) {
                return
            }
        }
    }
    if (this.ignoreNoteEnd) {
        return
    }
    var n;
    if (e.midiNote) {
        for (var r in this.activeNotes) {
            for (n = this.activeNotes[r].length - 1; n >= 0; n--) {
                if (this.activeNotes[r][n].midiNote && this.activeNotes[r][n].midiNote === e.midiNote) {
                    this.activeNotes[r][n].stop(e.actionTime / 1e3 || DMAF.context.currentTime, true);
                    this.activeNotes[r].splice(n, 1);
                    return
                }
            }
        }
    } else {
        if (e.midiNote) {
            if (this.activeNotes[e.midiNote]) {
                for (n = this.activeNotes[e.midiNote].length - 1; n >= 0; n--) {
                    this.activeNotes[e.midiNote][n].stop(e.actionTime / 1e3 || 0);
                    this.activeNotes[e.midiNote].splice(n, 1)
                }
            }
        }
    }
};
DMAF.Synth.SynthInstance.prototype.stopAll = function(e) {
    var t;
    for (var n in this.activeNotes) {
        for (t = this.activeNotes[n].length - 1; t >= 0; t--) {
            this.activeNotes[n][t].stop(DMAF.context.currentTime, true);
            this.activeNotes[n].splice(t, 1)
        }
    }
};
DMAF.Synth.SynthInstance.prototype.setLevel = function(e, t) {
    if (e === "reset") {
        this.output.gain.value = this.volume;
        return
    }
    if (t) {
        this.output.gain.value = DMAF.Utils.dbToWAVolume(e)
    } else {
        this.output.gain.value = e
    }
};
DMAF.Synth.SynthInstance.prototype.runDisposeCheck = function() {
    var e, t, n, r;
    e = DMAF.context.currentTime;
    for (t in this.activeNotes) {
        if (this.activeNotes.hasOwnProperty(t) && this.activeNotes[t] instanceof Array) {
            r = this.activeNotes[t].length;
            for (n = r - 1; n >= 0; n--) {
                if (this.activeNotes[t][n].disposeTime <= e) {
                    this.activeNotes[t].splice(n, 1)
                }
            }
        }
    }
    n = this.sustainNotes.length;
    while (n--) {
        if (this.sustainNotes[n].disposeTime <= e) {
            this.sustainNotes.splice(n, 1)
        }
    }
};
DMAF.Synth.SynthInstance.prototype.setSustain = function(e) {
    this.isSustainOn = e >= 64 ? true : false;
    if (!this.isSustainOn) {
        for (var t = 0; t < this.sustainNotes.length; ++t) {
            this.stop(this.sustainNotes[t])
        }
        this.sustainNotes = []
    }
};
DMAF.Synth.SynthInstance.prototype.handleControllerMessage = function(e) {
    switch (e.cc) {
        case 64:
            this.setSustain(e.value);
            break;
        default:
            console.log("Unknow controller message " + JSON.stringify(e))
    }
};
DMAF.Synth.SynthInstance.prototype.message = function(e) {
    switch (e.type) {
        case "noteOn":
            this.play(e);
            break;
        case "noteOff":
            this.stop(e);
            break;
        case "controller":
            this.handleControllerMessage(e);
            break;
        default:
            DMAF.debug("Message recieved in synth", e);
            break
    }
};
DMAF.Synth.GuitarInstance = function(e) {
    this.input = DMAF.context.createGainNode();
    this.output = DMAF.context.createGainNode();
    this.currentNotes = {};
    this.synths = {};
    this.instanceId = e.instanceId;
    var t = DMAF.Factories.getSynthInstanceFactory();
    for (var n in e.stringMaps) {
        var r = e;
        r.sampleMaps = e.stringMaps[n].maps;
        r.output = this.input;
        this.synths[n] = t.create("SYNTH", r)
    }
    var i = this.input;
    this.effects = DMAF.createEffectsRecursive(this.input, e.effects);
    if (this.effects.length > 0) {
        i = this.effects[this.effects.length - 1].effectNode
    }
    i.connect(this.output);
    this.setLevel(e.volume, true);
    if (e.bus === "master") {
        this.output.connect(DMAF.context.master)
    } else {
        this.output.connect(DMAF.Managers.getAudioBusManager().getAudioBusInstance(e.bus).input)
    }
    this.instanceId = e.instanceId;
    this.sampleMap = [];
    for (var n in e.stringMaps) {
        for (var s in e.stringMaps[n].maps) {
            var o = DMAF.Managers.getSynthManager().getSampleMap(s);
            for (var u in o) {
                this.sampleMap.push(o[u]);
                DMAF.Managers.getAssetsManager().getBuffer(o[u].sample)
            }
        }
    }
    DMAF.Managers.getCheckTimeManager().addFrameListener(this.instanceId, this.runDisposeCheck, this)
};
DMAF.Synth.GuitarInstance.prototype.getAutomatableProperties = function(e) {
    if (e.substring(0, 2) == "fx") {
        return this.effects[parseInt(e.substring(2))].effectNode
    }
};
DMAF.Synth.GuitarInstance.prototype.setAutomatableProperty = function(e, t, n) {
    if (e === "filterFrequency") {
        for (var r in this.synths) {
            this.synths[r].filterFrequency = parseFloat(t)
        }
    }
};
DMAF.createEffectsRecursive = function(e, t) {
    var n = DMAF.Factories.getEffectsFactory();
    var r = [];
    for (var i = 0; i < t.length; i++) {
        var s = t[i];
        var o = {};
        o.type = t[i].type;
        o.effectNode = n.create(s.type, s.params);
        if (o.type == "FXGROUP") {
            o.effectNode.innerEffects = this.createEffectsRecursive(o.effectNode.input, s.params.innerEffects);
            o.effectNode.init()
        }
        if (parseInt(s.params.active) == 1) {
            o.effectNode.activate(true)
        } else {
            o.effectNode.activate(false)
        }
        r.push(o);
        e.connect(o.effectNode.input);
        e = o.effectNode
    }
    return r
};
DMAF.Synth.GuitarInstance.prototype.play = function(e) {
    e.string = e.string || e.channel + 1;
    e.type = "noteOn";
    var t = false,
        n;
    if (this.currentNotes[e.string]) {
        if (this.currentNotes[e.string].endTime > e.actionTime || !e.noteEndTime || e.easyMode === false) {
            n = {
                type: "noteOff",
                midiNote: this.currentNotes[e.string].midiNote,
                string: e.string,
                actionTime: e.actionTime
            };
            if (DMAF.getController().strummedNoteCache[1] && DMAF.getController().strummedNoteCache[0].string == DMAF.getController().strummedNoteCache[1].string && DMAF.getController().strummedNoteCache[0].fret == DMAF.getController().strummedNoteCache[1].fret) {} else {
                if (e.strumming === false) {
                    t = true
                }
            }
        }
    }
    var r = [];
    if (t) {
        r = ["legato", "normal", "muted", "damped"]
    } else {
        r = ["normal", "muted", "damped", "legato"]
    }
    for (var i in r) {
        if (!r.hasOwnProperty(i)) {
            continue
        }
        if (n) {
            var s = DMAF.Processors.getMusicController().player.activePatterns;
            for (var o = 0; o < s.length; o++) {
                if (s[o].beatChannel === this.instanceId && s[o].beatPatternId !== "empty_pattern") {} else {
                    this.stop(n)
                }
            }
        }
        e.style = r[i];
        var u = this.synths[e.string].play(e);
        if (!u) {
            continue
        }
        if (e.style === "normal" || e.style === "legato") {
            this.currentNotes[e.string] = {
                midiNote: e.midiNote,
                endTime: e.noteEndTime + DMAF.context.currentTime
            }
        }
        break
    }
};
DMAF.Synth.GuitarInstance.prototype.stop = function(e) {
    e.string = e.string || e.channel + 1;
    var t = ["normal", "legato", "damped", "muted"];
    for (var n in t) {
        if (!t.hasOwnProperty(n)) {
            continue
        }
        var r = t[n];
        if (!this.synths[e.string]) {
            continue
        }
        this.synths[e.string].stop(e)
    }
    if (this.currentNotes[e.string] && this.currentNotes[e.string].midiNote === e.midiNote) {
        delete this.currentNotes[e.string]
    }
};
DMAF.Synth.GuitarInstance.prototype.stopAll = function(e) {
    for (var t in this.synths) {
        if (this.synths.hasOwnProperty(t)) {
            this.synths[t].stopAll()
        }
    }
};
DMAF.Synth.GuitarInstance.prototype.setLevel = function(e, t) {
    for (var n in this.synths) {
        if (this.synths.hasOwnProperty(n)) {
            this.synths[n].setLevel(e, t)
        }
    }
};
DMAF.Synth.GuitarInstance.prototype.runDisposeCheck = function() {
    for (var e in this.synths) {
        if (this.synths.hasOwnProperty(e)) {
            this.synths[e].runDisposeCheck()
        }
    }
};
DMAF.Synth.GuitarInstance.prototype.message = function(e) {
    switch (e.type) {
        case "noteOn":
            this.play(e);
            break;
        case "noteOff":
            this.stop(e);
            break;
        case "controller":
            this.play();
            break;
        default:
            DMAF.debug("Message recieved in synth", e);
            break
    }
};
DMAF.Synth.DrumsInstance = function(e) {
    this.sampleMaps = e.sampleMaps;
    this.currentNotes = {};
    var t = DMAF.Factories.getSynthInstanceFactory();
    this.synthInstance = t.create("SYNTH", e);
    this.instanceId = e.instanceId;
    this.setLevel(e.volume);
    var n, r, i;
    this.sampleMap = [];
    for (r in this.sampleMaps) {
        i = DMAF.Managers.getSynthManager().getSampleMap(r);
        for (n in i) {
            this.sampleMap.push(i[n]);
            DMAF.Managers.getAssetsManager().getBuffer(i[n].sample)
        }
    }
    DMAF.Managers.getCheckTimeManager().addFrameListener(this.instanceId, this.runDisposeCheck, this)
};
DMAF.Synth.DrumsInstance.prototype.getAutomatableProperties = function(e) {
    if (e.substring(0, 2) == "fx") {
        return this.synthInstance.effects[parseInt(e.substring(2))].effectNode
    }
};
DMAF.Synth.DrumsInstance.prototype.setAutomatableProperty = function(e, t, n) {
    if (e === "filterFrequency") {
        this.synthInstance.filterFrequency = parseFloat(t)
    }
};
DMAF.Synth.DrumsInstance.prototype.play = function(e) {
    for (var t in this.sampleMaps) {
        if (this.sampleMaps[t].velocityLow <= e.velocity && e.velocity <= this.sampleMaps[t].velocityHigh) {
            this.sampleMap = DMAF.Managers.getSynthManager().getSampleMap(t)
        }
    }
    for (var n in this.sampleMap) {}
    console.log("play " + e.midiNote);
    return;
    var r, i;
    if (e.style) {
        r = e.style;
        i = this.styleToNote(e.style);
        if (!i) {
            return
        }
    } else {
        if (e.midiNote) {
            i = e.midiNote;
            r = this.noteToStyle(e.midiNote);
            if (!r) {
                return
            }
        }
    }
    var s = {
        actionTime: e.actionTime,
        midiNote: i,
        velocity: e.velocity,
        type: "noteOn",
        noteEndTime: e.noteEndTime
    };
    if (this.currentNotes[r]) {
        this.stop({
            midiNote: this.currentNotes[r],
            style: r
        });
        delete this.currentNotes[r]
    }
    if (r.search("hihat") != -1) {
        if (this.currentNotes.hihat_open) {
            this.stop({
                midiNote: this.currentNotes.hihat_open,
                style: "hihat_open"
            });
            delete this.currentNotes.hihat_open
        }
        if (this.currentNotes.hihat_closed) {
            this.stop({
                midiNote: this.currentNotes.hihat_closed,
                style: "hihat_closed"
            });
            delete this.currentNotes.hihat_closed
        }
        if (this.currentNotes.hihat_half_open) {
            this.stop({
                midiNote: this.currentNotes.hihat_half_open,
                style: "hihat_half_open"
            });
            delete this.currentNotes.hihat_half_open
        }
        if (this.currentNotes.alt_hihat_closed) {
            this.stop({
                midiNote: this.currentNotes.alt_hihat_closed,
                style: "alt_hihat_closed"
            });
            delete this.currentNotes.alt_hihat_closed
        }
    }
    this.currentNotes[r] = e.midiNote;
    this.synthInstances[r].play(s)
};
DMAF.Synth.DrumsInstance.prototype.stop = function(e) {
    console.log("stop " + e.midiNote);
    return;
    var t = {
        midiNote: e.midiNote
    };
    var n = e.style;
    if (!n) {
        n = this.noteToStyle(e.midiNote)
    }
    this.synthInstances[n].stop(t)
};
DMAF.Synth.DrumsInstance.prototype.stopAll = function(e) {
    for (var t in this.synths) {
        if (this.synths.hasOwnProperty(t)) {
            this.synths[t].stopAll()
        }
    }
};
DMAF.Synth.DrumsInstance.prototype.setLevel = function(e, t) {
    this.synthInstance.setLevel(e, t)
};
DMAF.Synth.DrumsInstance.prototype.runDisposeCheck = function() {
    this.synthInstance.runDisposeCheck()
};
DMAF.Synth.DrumsInstance.prototype.message = function(e) {
    switch (e.type) {
        case "noteOn":
            this.play(e);
            break;
        case "noteOff":
            this.stop(e);
            break;
        case "controller":
            this.play();
            break;
        default:
            DMAF.debug("Message recieved in drums synth", e);
            break
    }
};
DMAF.Managers.SynthManager = function() {
    this.activeSynthInstances = {};
    this.sampleMap = DMAF.Data.SampleMap
};
DMAF.Managers.SynthManager.prototype.addSynthInstance = function(e) {
    if (!this.activeSynthInstances[e.instanceId]) {
        this.activeSynthInstances[e.instanceId] = e
    }
};
DMAF.Managers.SynthManager.prototype.removeSynthInstance = function(e) {
    if (this.activeSynthInstances[e]) {
        delete this.activeSynthInstances[e]
    }
};
DMAF.Managers.SynthManager.prototype.getActiveInstance = function(e) {
    if (this.activeSynthInstances[e]) {
        return this.activeSynthInstances[e]
    } else {
        return false
    }
};
DMAF.Managers.SynthManager.prototype.getSampleMap = function(e) {
    if (this.sampleMap[e]) {
        return this.sampleMap[e]
    } else {
        DMAF.error("SAMPLE MAP ERROR: Couldn't find any sampleMap with the id " + e);
        return false
    }
};
DMAF.Factories.SynthInstanceFactory = function() {
    this.factoryMap = {};
    this.registerCoreTypes()
};
DMAF.Factories.SynthInstanceFactory.prototype.registerCoreTypes = function() {
    this.factoryMap.SYNTH = DMAF.Synth.SynthInstance;
    this.factoryMap.GUITAR = DMAF.Synth.GuitarInstance;
    this.factoryMap.DRUMS = DMAF.Synth.DrumsInstance
};
DMAF.Factories.SynthInstanceFactory.prototype.create = function(e, t) {
    if (!this.factoryMap[e]) {
        DMAF.error("DMAFError: Could not create synth instance, unknown type: " + e);
        return
    }
    var n = this.factoryMap[e];
    var r = new n(t);
    return r
};
DMAF.Actions.SynthInstanceCreate = function(e) {
    this.instanceId = e.instanceId;
    this.properties = e
};
DMAF.Actions.SynthInstanceCreate.prototype.execute = function() {
    var e;
    if (this.instanceId === "multi") {
        this.properties.instanceId = this.trigger;
        e = DMAF.Managers.getSynthManager().getActiveInstance(this.trigger)
    } else {
        e = DMAF.Managers.getSynthManager().getActiveInstance(this.instanceId)
    } if (!e) {
        var t = DMAF.Factories.getSynthInstanceFactory();
        e = t.create("SYNTH", this.properties);
        DMAF.Managers.getSynthManager().addSynthInstance(e);
        e.setLevel(this.properties.volume, true)
    }
    if (this.parameters) {
        this.parameters.actionTime = this.actionTime;
        e.message(this.parameters)
    }
};
DMAF.Actions.GuitarInstanceCreate = function(e) {
    this.instanceId = e.instanceId;
    this.properties = e
};
DMAF.Actions.GuitarInstanceCreate.prototype.execute = function() {
    var e;
    if (this.instanceId === "multi") {
        this.properties.instanceId = this.trigger;
        e = DMAF.Managers.getSynthManager().getActiveInstance(this.trigger)
    } else {
        e = DMAF.Managers.getSynthManager().getActiveInstance(this.instanceId)
    } if (!e) {
        var t = DMAF.Factories.getSynthInstanceFactory();
        e = t.create("GUITAR", this.properties);
        DMAF.Managers.getSynthManager().addSynthInstance(e);
        e.setLevel(this.properties.volume, true)
    }
    if (this.parameters) {
        var n = {
            actionTime: this.actionTime,
            midiNote: this.parameters.midiNote,
            velocity: this.parameters.velocity,
            type: this.parameters.type,
            string: this.parameters.string,
            noteEndTime: this.parameters.noteEndTime,
            channel: this.parameters.channel,
            sustain: this.parameters.sustain,
            strumming: this.parameters.strumming
        };
        if (this.parameters.easyMode !== undefined) {
            n.easyMode = this.parameters.easyMode
        }
        e.message(n)
    }
};
DMAF.Actions.DrumsInstanceCreate = function(e) {
    this.instanceId = e.instanceId;
    this.properties = e
};
DMAF.Actions.DrumsInstanceCreate.prototype.execute = function() {
    var e;
    if (this.instanceId === "multi") {
        this.properties.instanceId = this.trigger;
        e = DMAF.Managers.getSynthManager().getActiveInstance(this.trigger)
    } else {
        e = DMAF.Managers.getSynthManager().getActiveInstance(this.instanceId)
    } if (!e) {
        var t = DMAF.Factories.getSynthInstanceFactory();
        e = t.create("DRUMS", this.properties);
        DMAF.Managers.getSynthManager().addSynthInstance(e);
        e.setLevel(this.properties.volume, true)
    }
    if (this.parameters) {
        e.message({
            actionTime: this.actionTime,
            midiNote: this.parameters.midiNote,
            velocity: this.parameters.velocity,
            type: this.parameters.type,
            noteEndTime: this.parameters.noteEndTime,
            channel: this.parameters.channel,
            sustain: this.parameters.sustain
        })
    }
};
DMAF.Factories.SynthActionFactory = function() {
    this.factoryMap = {};
    this.registerCoreTypes()
};
DMAF.Factories.SynthActionFactory.prototype.registerCoreTypes = function() {
    this.factoryMap.SYNTH_CREATE = DMAF.Actions.SynthInstanceCreate;
    this.factoryMap.GUITAR_CREATE = DMAF.Actions.GuitarInstanceCreate;
    this.factoryMap.DRUMS_CREATE = DMAF.Actions.DrumsInstanceCreate
};
DMAF.Factories.SynthActionFactory.prototype.create = function(e, t) {
    if (!this.factoryMap[e]) {
        DMAF.error("DMAFError: Could not create synth action, unknown type: " + e);
        return
    }
    var n = this.factoryMap[e];
    var r = new n(t);
    return r
};
DMAF.Utils.ids = [];
DMAF.Utils.createUID = function() {
    var e = Math.floor(Math.random() * 1e5);
    while (DMAF.Utils.ids[e]) {
        e = Math.floor(Math.random() * 1e5)
    }
    DMAF.Utils.ids[e] = true;
    return e
};
DMAF.getController = function() {
    if (!DMAF.Controller) {
        DMAF.Controller = new DMAF.ControllerInstance
    }
    return DMAF.Controller
};
DMAF.getCore = function() {
    if (!DMAF.Core) {
        DMAF.Core = new DMAF.CoreInstance
    }
    return DMAF.Core
};
DMAF.DynamicValueRetriever = null;
DMAF.Utils.DynamicValueRetriever = function() {};
DMAF.Utils.DynamicValueRetriever.prototype.getTargetInstance = function(e) {
    var t = e.split(":");
    var n;
    switch (t[0]) {
        case "sound":
            n = DMAF.Managers.getSoundManager().getActiveSoundInstances(t[1]);
            break;
        case "synth":
            n = DMAF.Managers.getSynthManager().getActiveInstance(t[1]);
            break;
        case "bus":
            n = DMAF.Managers.getAudioBusManager().getAudioBusInstance(t[1]);
            break
    }
    return n
};
DMAF.Utils.DynamicValueRetriever.prototype.getValueFromString = function(e) {
    console.log("I'M NOT TESTED YET!");
    var t = e.split(":");
    var n;
    switch (t[0]) {
        case "sound":
            n = DMAF.Managers.getSoundManager().getActiveSoundInstances(t[1]);
            break
    }
    var r;
    if (n["get" + t[2][0].toUpperCase() + t[2].slice(1)]) {
        r = n["get" + t[2][0].toUpperCase() + t[2].slice(1)]()
    } else {
        r = n[t[2]]
    }
    return r
};
DMAF.Utils.DynamicValueRetriever.prototype.setValueFromString = function(e, t) {
    console.log("IMPLEMENT ME!")
};
DMAF.getDynamicValueRetriever = function() {
    if (!DMAF.DynamicValueRetriever) {
        DMAF.DynamicValueRetriever = new DMAF.Utils.DynamicValueRetriever
    }
    return DMAF.DynamicValueRetriever
};
DMAF.Utils.dbToJSVolume = function(e) {
    var t = Math.max(0, Math.round(100 * Math.pow(2, e / 6)) / 100);
    t = Math.min(1, t);
    return t
};
DMAF.Utils.dbToWAVolume = function(e) {
    var t = Math.max(0, Math.round(100 * Math.pow(2, e / 6)) / 100);
    return t
};
DMAF.Utils.toMIDINote = function(e) {
    var t, n, r, i, s;
    if (e[1] === "#" || e[1].toLowerCase() === "s") {
        n = e[0].toLowerCase() + "sharp";
        s = 2
    } else {
        if (e[1] === "b") {
            n = e[0].toLowerCase() + "flat";
            s = 2
        } else {
            n = e[0].toLowerCase();
            s = 1
        }
    }
    n = DMAF.Utils.logicMIDIMap[n];
    if (e[s] === "-") {
        i = (0 - parseInt(e[s + 1], 10) + 2) * 12
    } else {
        i = (parseInt(e[s], 10) + 2) * 12
    }
    t = i + n;
    return t
};
DMAF.Utils.MIDIToFrequency = function(e) {
    return 8.1757989156 * Math.pow(2, e / 12)
};
DMAF.Utils.logicMIDIMap = {
    cflat: -1,
    c: 0,
    csharp: 1,
    dflat: 1,
    d: 2,
    dsharp: 3,
    eflat: 3,
    e: 4,
    esharp: 5,
    fflat: 4,
    f: 5,
    fsharp: 6,
    gflat: 6,
    g: 7,
    gsharp: 8,
    aflat: 8,
    a: 9,
    asharp: 10,
    bflat: 10,
    b: 11,
    bsharp: 12
};
DMAF.Utils.requestNextFrame = function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(e) {
        window.setTimeout(e, 1e3 / 60)
    }
}();
DMAF.Utils.fmod = function(e, t) {
    var n, r, i = 0,
        s = 0,
        o = 0,
        u = 0;
    n = e.toExponential().match(/^.\.?(.*)e(.+)$/);
    i = parseInt(n[2], 10) - (n[1] + "").length;
    n = t.toExponential().match(/^.\.?(.*)e(.+)$/);
    s = parseInt(n[2], 10) - (n[1] + "").length;
    if (s > i) {
        i = s
    }
    r = e % t;
    if (i < -100 || i > 20) {
        o = Math.round(Math.log(r) / Math.log(10));
        u = Math.pow(10, o);
        return (r / u).toFixed(o - i) * u
    } else {
        return parseFloat(r.toFixed(-i))
    }
};
DMAF.Utils.tanh = function(e) {
    return (Math.exp(e) - Math.exp(-e)) / (Math.exp(e) + Math.exp(-e))
};
DMAF.Utils.sign = function(e) {
    if (e == 0) {
        return 1
    } else {
        return Math.abs(e) / e
    }
};
DMAF.ControllerInstance = function() {
    console.log("version 34");
    DMAF.getCore().addEventListener("*", this.onExternalEvent);
    this.internalEvents = {};
    this.pendingEvents = [];
    this.late = 0;
    this.cool = 0;
    this.lateTimes = [];
    this.metronomeOn = false;
    this.getEventInfo = function() {
        var e = this.late + this.cool;
        console.log("events total:", e, "events late:", this.late, "events on time:", this.cool, "percent late:", this.late / e * 100)
    };
    this.easyMode = false;
    this.transpose = true;
    this.mode = 1;
    this.keyNote = 4;
    this.baseNote = 0;
    this.string = 1;
    this.fret = 0;
    this.octave = 1;
    this.pad = 1;
    this.drum = "kick";
    this.drumLoops = {};
    this.timesToSync = 10;
    this.travelTimes = [];
    this.timeOffsets = [];
    this.guitarOffset = 0;
    this.bassOffset = 0;
    this.keyboardOffset = 0;
    this.pitchOffsets = {};
    DMAF.hackedGuitarOffset = 0;
    this.previousBassNote = {};
    this.currentGuitarNotes = {};
    this.lockedHihats = {};
    this.strummedNoteCache = [];
    this.instrument = "piano_upright";
    this.sendToServer = null;
    var e = this;
    this.pitch = 0;
    this.autoplayPressed = false;
    this.easyModePattern = "p1";
    this.easyModeChord = 0;
    this.currentPianoKey = 1;
    this.currentPianoOctave = 3;
    this.mouseOverStrumming = false;
    this.mouseOverInstrument = false;
    this.isBandLeader = false;
    this.noSession = false;
    this.GUITAR_STYLES = {
        NORMAL: "normal",
        MUTED: "muted",
        DAMPED: "damped",
        LEGATO: "legato"
    };
    this.style = this.GUITAR_STYLES.NORMAL;
    DMAF.serverOffset = 0;
    this.scaleNames = ["OFF", "major", "mixolydian", "majorPentatonic", "minorPentatonic", "dorian", "naturalMinor", "harmonicMinor", "phrygian", "lydian", "locrian", "doubleHarmonic", "halfDim"];
    this.scales = {
        OFF: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        major: [0, -1, 0, -1, 0, 0, -1, 0, -1, 0, -1, 0],
        harmonicMinor: [0, 1, 0, 0, -1, 0, 1, 0, 0, -1, 1, 0],
        naturalMinor: [0, -1, 0, 0, -1, 0, -1, 0, 0, -1, 0, -1],
        majorPentatonic: [0, 1, 0, 1, 0, -1, 1, 0, 1, 0, -1, 1],
        minorPentatonic: [0, -1, 1, 0, -1, 0, 1, 0, -1, 1, 0, -1],
        dorian: [0, 1, 0, 0, -1, 0, 1, 0, 1, 0, 0, -1],
        phrygian: [0, 0, -1, 0, -1, 0, 1, 0, 0, -1, 0, -1],
        lydian: [0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0],
        mixolydian: [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, -1],
        locrian: [0, 0, -1, 0, -1, 0, 0, -1, 0, -1, 0, -1],
        doubleHarmonic: [0, 0, -1, 1, 0, 0, 1, 0, 0, -1, 1, 0],
        halfDim: [0, 1, 0, 0, -1, 0, 0, -1, 0, -1, 0, -1]
    };
    this.availableChords = {
        major: {
            E: ["E", "A", "B", "C#m", "F#m", "G#m"],
            F: ["F", "Bb", "C", "Dm", "Gm", "Am"],
            Fs: ["Gb", "Cb", "Db", "Ebm", "Abm", "Bbm"],
            G: ["G", "C", "D", "Em", "Am", "Bm"],
            Gs: ["Ab", "Db", "Eb", "Fm", "Bbm", "Cm"],
            A: ["A", "D", "E", "F#m", "Bm", "C#m"],
            As: ["Bb", "Eb", "F", "Gm", "Cm", "Dm"],
            B: ["B", "E", "F#", "G#m", "C#m", "D#m"],
            C: ["C", "F", "G", "Am", "Dm", "Em"],
            Cs: ["Db", "Gb", "Ab", "Bbm", "Ebm", "Fm"],
            D: ["D", "G", "A", "Bm", "Em", "F#m"],
            Ds: ["Eb", "Ab", "Bb", "Cm", "Fm", "Gm"]
        },
        minor: {
            E: ["Em", "Am", "Bm", "G", "C", "D"],
            F: ["Fm", "Bbm", "Cm", "Ab", "Db", "Eb"],
            Fs: ["F#m", "Bm", "C#m", "A", "D", "E"],
            G: ["Gm", "Cm", "Dm", "Bb", "Eb", "F"],
            Gs: ["G#m", "C#m", "D#m", "B", "E", "F#"],
            A: ["Am", "Dm", "Em", "C", "F", "G"],
            As: ["A#m", "D#m", "E#m", "C#", "F#", "G#"],
            B: ["Bm", "Em", "F#m", "D", "G", "A"],
            C: ["Cm", "Fm", "Gm", "Eb", "Ab", "Bb"],
            Cs: ["C#m", "F#m", "G#m", "E", "A", "B"],
            D: ["Dm", "Gm", "Am", "F", "Bb", "C"],
            Ds: ["D#m", "G#m", "A#m", "F#", "B", "C#"]
        }
    };
    DMAF.getCore().getAnimationBase = function() {
        var t, n;
        if (e.instrument.search("guitar") !== -1) {
            n = e.string - 1
        } else {
            if (e.instrument.search("bass") !== -1) {
                n = e.string - 1
            } else {
                if (e.instrument.search("key") !== -1) {
                    n = e.currentPianoKey + (e.currentPianoOctave * 12 - 12) - 13
                } else {
                    if (e.instrument.search("drums") !== -1) {
                        var r = ["tom_1", "tom_2", "tom_3", "snare", "snare_rim", "kick", "pedal", "hh_closed", "hh_half", "hh_open", "crash", "ride_bell", "ride_edge"];
                        n = r.indexOf(e.drum)
                    } else {
                        if (e.instrument.search("dm_") !== -1) {
                            n = e.pad - 1
                        }
                    }
                }
            }
        }
        return n
    };
    DMAF.getCore().getCurrentChords = function() {
        var t = ["C", "Cs", "D", "Ds", "E", "F", "Fs", "G", "Gs", "A", "As", "B"];
        if (e.mode === 1) {
            return e.availableChords.major[t[e.keyNote]]
        } else {
            if (e.mode === 6) {
                return e.availableChords.minor[t[e.keyNote]]
            }
        }
    };
    DMAF.getCore().setLatency = function(t) {
        e.reportLatency(t)
    };
    DMAF.getCore().getAvailableKeys = function() {
        var t;
        if (e.mode === 1) {
            t = e.scales.major
        } else {
            if (e.mode === 6) {
                t = e.scales.naturalMinor
            }
        }
        var n = [];
        for (var r = 0; r < t.length; r++) {
            if (t[r] === 0) {
                var i = r + 1 + e.keyNote % 12;
                while (i < 0) {
                    i += 12
                }
                while (i > 12) {
                    i -= 12
                }
                n.push(i)
            }
        }
        var s = n.length;
        for (var o = 0; o < s; o++) {
            n.push(n[o] + 12);
            n.push(n[o] + 24)
        }
        n.sort(function(e, t) {
            if (e < t) {
                return -1
            } else {
                return 1
            }
        });
        return n
    };
    this.createDelegate = function(e, t) {
        return function() {
            e.apply(t, arguments)
        }
    };
    this.createCallbackFunction = function(t, n) {
        if (typeof n === "undefined") {
            n = e
        }
        return this.createDelegate(t, n)
    }
};
DMAF.ControllerInstance.prototype.onInternalEvent = function(e, t, n) {
    if (e === "soundOn") {
        DMAF.unMute()
    }
    if (!DMAF.getCore().enabled) {
        return
    }
    switch (e) {
        default: if (DMAF.running) {
            DMAF.getController().onEvent(e, t, n)
        } else {
            DMAF.getController().pendingEvents.push({
                trigger: e,
                eventTime: t,
                params: n
            })
        }break
    }
};
DMAF.ControllerInstance.prototype.onExternalEvent = function(e, t) {
    t = t || {};
    if (!DMAF.getCore().enabled) {
        return
    }
    var n = e.type;
    var r = DMAF.context.currentTime * 1e3 + DMAF.latency;
    if (n !== "beat" && n !== "strummingMouseOver" && n !== "instrumentMouseOver" && n !== "strummingMouseOut") {}
    if (n === "disconnected") {
        t.channel = t.instrument;
        DMAF.Managers.getCheckTimeManager().checkEventTime("stopPattern", r, t)
    }
    switch (n) {
        case "switchPattern":
        case "switchInstrument":
        case "noteOn":
        case "noteOff":
        case "sustainPressed":
        case "sustainReleased":
        case "switchChord":
            DMAF.getController().processEvent(n, r, t);
            return;
        case "switchKey":
        case "switchScale":
        case "switchTempo":
            DMAF.getController().sendToServer(n, r, t);
            DMAF.Managers.getCheckTimeManager().checkEventTime(n, r, t);
            return;
        case "effectOn":
        case "effectOff":
        case "effectAmountChange":
        case "lockHihatOn":
        case "lockHihatOff":
            t.instrument = DMAF.getController().instrument;
            DMAF.getController().sendToServer(n, r, t);
            DMAF.Managers.getCheckTimeManager().checkEventTime(n, r, t);
            return;
        case "switchMode":
        case "pitchUp":
        case "pitchDown":
        case "instrumentMouseOver":
        case "instrumentMouseOut":
        case "strummingMouseOver":
        case "strummingMouseOut":
        case "mouseUp":
        case "mouseDown":
        case "sync":
        case "metronomeOn":
        case "metronomeOff":
        case "bandLeader":
        case "preload":
        case "loadSample":
        case "startPreview":
        case "stopPreview":
        case "switchStyle":
        case "sessionEnded":
        case "sessionStarted":
        case "players":
            DMAF.getController().handleLocalEvent(n, r, t);
            return;
        default:
            return
    }
};
DMAF.ControllerInstance.prototype.addInternalEvent = function(e, t, n) {
    this.internalEvents[e] = {
        listener: t,
        array: n
    }
};
DMAF.ControllerInstance.prototype.dispatchPendingEvents = function() {
    for (var e = 0; e < this.pendingEvents.length; e++) {
        var t = this.pendingEvents[e];
        DMAF.getController().onEvent(t.trigger, t.eventTime, t.params)
    }
};
DMAF.ControllerInstance.prototype.onServerEvent = function(e, t, n) {
    var r;
    if (!DMAF.getCore().enabled || this.noSession) {
        switch (e) {
            case "sync":
            case "latency":
            case "ping":
            case "switchTempo":
            case "switchKey":
            case "switchScale":
            case "switchChord":
            case "startClock":
                t = 10;
                r = 10;
                break;
            default:
                return
        }
    } else {
        t = t - DMAF.serverOffset;
        r = t - DMAF.context.currentTime * 1e3
    }
    switch (e) {
        case "sync":
            this.startSyncRoutine();
            return;
        case "ping":
            this.proceedSyncRoutine(n);
            return;
        case "latency":
            DMAF.latency = n.delta * 2 + 20;
            console.log("latency set to " + DMAF.latency, n.delta);
            this.cool = 0;
            this.late = 0;
            this.lateTimes = [];
            if (this.isBandLeader) {
                DMAF.getController().sendToServer("startClock", DMAF.context.currentTime * 1e3 + DMAF.latency + 500, n);
                DMAF.Managers.getCheckTimeManager().checkEventTime("startClock", DMAF.context.currentTime * 1e3 + DMAF.latency + 500, n)
            }
            if (this.interval) {
                clearInterval(this.interval)
            }
            if (this.players !== undefined && this.players === 1) {
                return
            }
            this.interval = setInterval(function() {
                DMAF.getController().sendAliveMessage()
            }, 50);
            return;
        case "switchChord":
            if (r < 0) {
                if (r > -4e3) {
                    this.late++;
                    this.lateTimes.push(r);
                    if (this.lateTimes.length > 10) {
                        this.analyzeTravelTimes(e, t, n)
                    }
                }
            } else {
                this.cool++
            }
            this.checkOffsetAndPatternAtSwitchChord(e, t, n);
            DMAF.Managers.getCheckTimeManager().checkEventTime(e, t, n);
            break;
        case "switchKey":
        case "switchTempo":
        case "switchScale":
        case "switchPattern":
        case "switchInstrument":
        case "stopPattern":
        case "key_piano":
        case "key_epiano":
        case "key_strings":
        case "key_brass":
        case "key_seq":
        case "key_organ":
        case "guitar_steel":
        case "guitar_nylon":
        case "guitar_clean":
        case "guitar_crunch":
        case "guitar_dist":
        case "guitar_funky":
        case "bass_pick":
        case "bass_finger":
        case "bass_ac":
        case "drums_standard":
        case "drums_brushes":
        case "dm_hiphop":
        case "dm_techno":
        case "dm_analogue":
        case "effectOn":
        case "effectOff":
        case "effectAmountChange":
        case "instrumentOffset":
        case "lockHihatOn":
        case "lockHihatOff":
        case "startClock":
        case "startDrumLoop":
        case "stopDrumLoop":
        case "stopDrumMachineLoop":
        case "startDrumMachineLoop":
        case "stopAllNotes":
            if (r < 0) {
                if (e === "instrumentOffset" || e === "switchPattern") {} else {
                    if (r > -4e3) {
                        this.late++;
                        this.lateTimes.push(r);
                        if (this.lateTimes.length > 10) {
                            this.analyzeTravelTimes(e, t, n)
                        }
                    }
                }
            } else {
                this.cool++
            }
            DMAF.Managers.getCheckTimeManager().checkEventTime(e, t, n);
            return;
        default:
            return
    }
};
DMAF.ControllerInstance.prototype.analyzeTravelTimes = function(e, t, n) {
    var r = this.late + this.cool;
    if (r < 100) {
        return
    }
    var i = this.late / r * 100;
    if (i < 15) {
        this.late = 0;
        this.cool = 0;
        this.lateTimes = [];
        return
    }
    var s;
    this.lateTimes.sort();
    var o = this.lateTimes;
    if (o[o.length - 1] - o[0] > 100) {
        s = 1;
        for (var u = o.length - 2; u > 0; u--) {
            if (o[u] - o[0] > 100) {
                s++
            }
        }
        for (var a = 0; s > a; a--) {
            o.splice(o.length - 1 - a, 1)
        }
    }
    if (o.length < 10) {
        r -= s;
        return
    }
    lateMeanValue = 0;
    for (var f = 0; f < this.lateTimes.length; f++) {
        lateMeanValue += this.lateTimes[f]
    }
    lateMeanValue /= this.lateTimes.length;
    var l = lateMeanValue * -1 + DMAF.latency;
    this.reportLatency(l);
    this.late = 0;
    this.cool = 0;
    this.lateTimes = []
};
DMAF.ControllerInstance.prototype.calculateAverage = function(e) {
    var t = 0;
    for (var n = 0; n < e.length; n++) {
        t += e[n]
    }
    return t / e.length
};
DMAF.ControllerInstance.prototype.startSyncRoutine = function() {
    if (isNaN(DMAF.context.currentTime) || DMAF.context.currentTime === 0 || DMAF.Managers.getAssetsManager().checkIfLoading()) {
        setTimeout(DMAF.getController().startSyncRoutine, 10);
        return
    }
    DMAF.getController().syncCount = 0;
    DMAF.getController().onEvent("stopClock");
    DMAF.getController().travelTimes = [];
    DMAF.getController().timeOffsets = [];
    DMAF.getController().sendSyncMessage("ping", {
        clientTime: parseInt(DMAF.context.currentTime * 1e3, 10)
    })
};
DMAF.ControllerInstance.prototype.proceedSyncRoutine = function(e) {
    this.syncCount++;
    var t = parseInt(DMAF.context.currentTime * 1e3, 10);
    var n = (t - e.clientTime) / 2;
    if (n === 0) {
        n = 1
    }
    if (DMAF.Managers.getAssetsManager().checkIfLoading()) {
        console.error("IS LOADING DURING SYNC!")
    }
    this.travelTimes.push(n);
    this.timeOffsets.push(e.serverTime + n - t);
    if (this.syncCount === this.timesToSync) {
        DMAF.serverOffset = this.calculateAverage(this.timeOffsets);
        var r = Math.round(this.calculateAverage(this.travelTimes));
        this.sendSyncMessage("latency", {
            delta: r
        })
    } else {
        var i = parseInt(DMAF.context.currentTime * 1e3, 10);
        this.sendSyncMessage("ping", {
            clientTime: i
        })
    }
};
DMAF.ControllerInstance.prototype.onEvent = function(e, t, n) {
    switch (e) {
        case "stopAllNotes":
            var r = DMAF.Managers.getSynthManager().getActiveInstance(n.instrument);
            if (r) {
                r.stopAll()
            }
            return;
        case "startDrumLoop":
            var i = ["kick", "snare", "snare_rim", "hh_closed", "hh_half", "hh_open", "tom_1", "tom_2", "tom_3", "crash", "ride_edge", "ride_bell"];
            var s = n.drum;
            var o = n.instrument;
            this.drumLoops[o] = {};
            this.drumLoops[o].id = "drumLoop" + o + s;
            this.drumLoops[o].drum = s;
            var u = this;
            DMAF.Managers.getCheckTimeManager().addFrameListener(this.drumLoops[o].id, function(e, t) {
                var r = n;
                var s = DMAF.Processors.getMusicController().player.getNextBeat();
                return function() {
                    var e = DMAF.Processors.getMusicController().player.getNextBeat();
                    var n = s + 2;
                    if (n > 4) {
                        n = 1
                    }
                    if (e === n) {
                        s = n;
                        var o = 24 + i.indexOf(this.drumLoops[t].drum);
                        r.type = "noteOn";
                        r.velocity = r.velocity || Math.round(Math.random() * 20) + 90;
                        r.noteEndTime = 1e3;
                        r.midiNote = o;
                        DMAF.Managers.getCheckTimeManager().checkEventTime(r.instrument, DMAF.Processors.getMusicController().player.getNextBeatTime(), r)
                    }
                }
            }(s, o), this);
            var a = 24 + i.indexOf(n.drum);
            n.type = "noteOn";
            n.velocity = n.velocity || Math.round(Math.random() * 20) + 90;
            n.noteEndTime = 1e3;
            n.midiNote = a;
            DMAF.Managers.getCheckTimeManager().checkEventTime(n.instrument, DMAF.Processors.getMusicController().player.getNextBeatTime(), n);
            return;
        case "stopDrumLoop":
            DMAF.Managers.getCheckTimeManager().removeFrameListener("drumLoop" + n.instrument + n.drum);
            return;
        case "startDrumMachineLoop":
            var f = n.pad;
            var o = n.instrument;
            this.drumLoops[o] = {};
            this.drumLoops[o].id = "drumLoop" + o + f;
            this.drumLoops[o].pad = f;
            var u = this;
            DMAF.Managers.getCheckTimeManager().addFrameListener(this.drumLoops[o].id, function(e, t) {
                var r = n;
                var i = DMAF.Processors.getMusicController().player.getNextBeat();
                return function() {
                    var e = DMAF.Processors.getMusicController().player.getNextBeat();
                    var t = i + 2;
                    if (t > 4) {
                        t = 1
                    }
                    if (e === t) {
                        i = t;
                        var s = 24 + n.pad - 1;
                        r.type = "noteOn";
                        r.velocity = r.velocity || Math.round(Math.random() * 20) + 90;
                        r.noteEndTime = 1e3;
                        r.midiNote = s;
                        DMAF.Managers.getCheckTimeManager().checkEventTime(r.instrument, DMAF.Processors.getMusicController().player.getNextBeatTime(), r)
                    }
                }
            }(f, o), this);
            var a = 24 + n.pad - 1;
            n.type = "noteOn";
            n.velocity = n.velocity || Math.round(Math.random() * 20) + 90;
            n.noteEndTime = 1e3;
            n.midiNote = a;
            DMAF.Managers.getCheckTimeManager().checkEventTime(n.instrument, DMAF.Processors.getMusicController().player.getNextBeatTime(), n);
            return;
        case "stopDrumMachineLoop":
            DMAF.Managers.getCheckTimeManager().removeFrameListener("drumLoop" + n.instrument + n.pad);
            return;
        case "switchTempo":
            DMAF.tempo = n.tempo || 75;
            DMAF.tempo *= 4;
            if (this.isBandLeader) {
                DMAF.getController().sendToServer("startClock", DMAF.context.currentTime * 1e3 + DMAF.latency + 500, n);
                DMAF.Managers.getCheckTimeManager().checkEventTime("startClock", DMAF.context.currentTime * 1e3 + DMAF.latency + 500, n)
            }
            return;
        case "switchKey":
            this.keyNote = (4 + n.key) % 12;
            this.baseNote = n.key % 12;
            break;
        case "switchScale":
            if (n.scale === "minor") {
                n.scale = "naturalMinor"
            }
            this.mode = this.scaleNames.indexOf(n.scale);
            return;
        case "switchPattern":
            DMAF.Processors.getMusicController().musicEvent(n.pattern, t, n.channel);
            return;
        case "switchInstrument":
            DMAF.Managers.getActionManager().onEvent(n.instrument, t, n);
            return;
        case "switchChord":
            this.handleSwitchChord(e, t, n);
            return;
        case "stopPattern":
            DMAF.Processors.getMusicController().musicEvent("empty_pattern", t, n.channel);
            return;
        case "effectOn":
            var l = DMAF.Managers.getSynthManager().getActiveInstance(n.instrument);
            if (l.effects != null) {
                if (l.effects.length >= n.fxnr) {
                    if (n.instrument === "guitar_funky") {
                        l.effects[n.fxnr].effectNode.activate(true)
                    } else {
                        l.effects[n.fxnr - 1].effectNode.activate(true)
                    }
                }
            }
            return;
        case "effectOff":
            switch (n.instrument) {
                case "guitar_dist":
                case "guitar_crunch":
                case "guitar_funky":
                    if (n.fxnr === 1) {
                        n.value = 0;
                        DMAF.Managers.getActionManager().onEvent(n.instrument + "_macro" + n.fxnr, t, n);
                        return
                    }
                    break;
                case "key_brass":
                case "key_strings":
                case "key_seq":
                    if (n.fxnr === 2 && this.instrument === n.instrument) {
                        DMAF.getController().sendToServer("effectAmountChange", t, {
                            fxnr: 2,
                            value: 0,
                            instrument: this.instrument
                        });
                        DMAF.Managers.getCheckTimeManager().checkEventTime("effectAmountChange", t, {
                            fxnr: 2,
                            value: 0,
                            instrument: this.instrument
                        });
                        return
                    }
            }
            var l = DMAF.Managers.getSynthManager().getActiveInstance(n.instrument);
            if (l.effects != null) {
                if (l.effects.length >= n.fxnr) {
                    if (n.instrument === "guitar_funky") {
                        l.effects[n.fxnr].effectNode.activate(false)
                    } else {
                        l.effects[n.fxnr - 1].effectNode.activate(false)
                    }
                    n.value = 0;
                    DMAF.Managers.getActionManager().onEvent(n.instrument + "_macro" + n.fxnr, t, n)
                }
            }
            return;
        case "effectAmountChange":
            DMAF.Managers.getActionManager().onEvent(n.instrument + "_macro" + n.fxnr, t, n);
            return;
        case "instrumentOffset":
            this.pitchOffsets[n.instrument] = n.offset;
            return;
        case "lockHihatOn":
            DMAF.Processors.getMusicController().musicEvent("hh_lock__" + n.beatsPerBar, t, n.instrument + "hihatLock");
            this.lockedHihats[n.instrument] = true;
            return;
        case "lockHihatOff":
            DMAF.Processors.getMusicController().musicEvent("empty_pattern", t, n.instrument + "hihatLock");
            delete this.lockedHihats[n.instrument];
            return;
        case "hh_lock":
            for (var c in this.lockedHihats) {
                n = {
                    midiNote: n.n,
                    type: n.t,
                    velocity: n.v,
                    noteEndTime: n.noteEndTime
                };
                DMAF.Managers.getActionManager().onEvent(c, t, n)
            }
            return
    }
    var h = e.split("_");
    if (h[h.length - 1] === "underKeyControll") {
        var o = e.replace("_underKeyControll", "");
        DMAF.Managers.getActionManager().onEvent(o, t, n);
        return
    }
    switch (e) {
        case "drums_standard":
        case "drums_brushes":
        case "dm_hiphop":
        case "dm_techno":
        case "dm_analogue":
        case "metronome":
            if (n.n) {
                n = {
                    midiNote: n.n,
                    type: n.t,
                    velocity: n.v,
                    noteEndTime: n.noteEndTime
                }
            }
            break;
        default:
            if (n && n.type !== "controller") {
                n = this.transposeNoteMessage(e, n)
            }
            break
    }
    switch (e) {
        case "soundOff":
            DMAF.mute();
            break;
        case "stopClock":
            DMAF.Processors.getMusicController().musicEvent("stopClock", t);
            return;
        case "startClock":
            DMAF.Processors.getMusicController().musicEvent(e, t);
            if (this.mouseIsDown && this.easyMode && this.easyModePattern !== "off") {
                n = this.handleSwitchPattern(this.easyModePattern, t, n);
                DMAF.Managers.getCheckTimeManager().checkEventTime("switchPattern", t, n);
                this.sendToServer("switchPattern", t, n)
            }
            if (this.metronomeOn) {
                DMAF.Processors.getMusicController().musicEvent("metronome", t, "metronome")
            }
            return;
        default:
            break
    }
    if (this.internalEvents[e]) {
        this.internalEvents[e].listener(this.internalEvents[e].array);
        return
    }
    DMAF.Managers.getActionManager().onEvent(e, t, n)
};
DMAF.ControllerInstance.prototype.registerBroadcaster = function(e, t) {
    this.sendToServer = this.createCallbackFunction(e, t)
};
DMAF.ControllerInstance.prototype.registerSyncBroadcaster = function(e, t) {
    this.sendSyncMessage = this.createCallbackFunction(e, t)
};
DMAF.ControllerInstance.prototype.registerAliveBroadcaster = function(e, t) {
    this.sendAliveMessage = this.createCallbackFunction(e, t)
};
DMAF.ControllerInstance.prototype.registerLatencyCallback = function(e, t) {
    this.reportLatency = this.createCallbackFunction(e, t)
};
DMAF.ControllerInstance.prototype.transposeNoteMessage = function(e, t) {
    var n = t;
    if (!t) {
        return n
    }
    if (t.n) {
        n = {
            midiNote: t.n,
            type: t.t,
            velocity: t.v,
            noteEndTime: t.noteEndTime,
            channel: t.c
        };
        if (this.transpose) {
            n.midiNote += parseInt(this.baseNote, 10);
            if (this.pitchOffsets[e] !== undefined) {
                n.midiNote += this.pitchOffsets[e]
            }
        }
        var r = n.midiNote % 12 - this.keyNote;
        if (r < 0) {
            r += 12
        }
        var i = r % 12;
        var s = this.scales[this.scaleNames[this.mode]][i];
        n.midiNote += s
    } else {
        if (t.snapToScale) {
            n.midiNote += parseInt(this.baseNote, 10);
            if (this.pitchOffsets[e] !== undefined) {
                n.midiNote += this.pitchOffsets[e]
            }
            var i = n.midiNote % 12 - this.keyNote;
            if (i < 0) {
                i += 12
            }
            var s = this.scales[this.scaleNames[this.mode]][i];
            n.midiNote += s
        }
    }
    var o;
    if (e.search("bass") !== -1) {
        o = [40, 45, 50, 55]
    } else {
        o = [40, 45, 50, 55, 59, 64]
    } if (n.midiNote < o[n.string - 1]) {
        n.midiNote += 12
    }
    if (t.easyMode !== undefined) {
        n.easyMode = t.easyMode
    }
    if (this.instrument.search("bass") !== -1 && n.type === "noteOn") {
        this.previousBassNote.midiNote = n.midiNote
    }
    return n
};
DMAF.ControllerInstance.prototype.handleLocalEvent = function(e, t, n) {
    switch (e) {
        case "players":
            if (n === 1) {
                if (this.interval) {
                    clearInterval(this.interval)
                }
                DMAF.latency = 20
            }
            this.players = n;
            return;
        case "sessionEnded":
            n.channel = this.instrument;
            DMAF.Managers.getCheckTimeManager().checkEventTime("stopPattern", t, n);
            this.noSession = true;
            return;
        case "sessionStarted":
            this.noSession = false;
            return;
        case "startPreview":
            DMAF.Managers.getActionManager().onEvent("preview_" + n.instrument, DMAF.context.currentTime * 1e3, {});
            return;
        case "stopPreview":
            var r = DMAF.Managers.getSoundManager().getSoundInstance("preview");
            if (r) {
                r.stop()
            }
            return;
        case "loadSample":
            DMAF.Managers.getAssetsManager().preloadSamples(["preview_" + n.instrument]);
            return;
        case "preload":
            DMAF.Managers.getActionManager().onEvent(n.instrument, t, {});
            return;
        case "bandLeader":
            this.isBandLeader = true;
            return;
        case "switchMode":
            if (n.mode === "easy") {
                this.easyMode = true
            } else {
                this.easyMode = false
            }
            return;
        case "pitchUp":
            this.pitch++;
            if (this.pitch > 7) {
                this.pitch = 7
            }
            return;
        case "pitchDown":
            this.pitch--;
            if (this.pitch < -7) {
                this.pitch = -7
            }
            return;
        case "instrumentMouseOver":
            this.setMouseOverInstrument(t, true);
            return;
        case "instrumentMouseOut":
            this.setMouseOverInstrument(t, false);
            return;
        case "mouseUp":
            this.setMouseIsDown(t, false);
            return;
        case "mouseDown":
            this.setMouseIsDown(t, true);
            return;
        case "strummingMouseOver":
            this.setMouseOverStrumming(t, true);
            return;
        case "strummingMouseOut":
            this.setMouseOverStrumming(t, false);
            return;
        case "metronomeOn":
            DMAF.Processors.getMusicController().musicEvent("metronome", t, "metronome");
            this.metronomeOn = true;
            return;
        case "metronomeOff":
            DMAF.Processors.getMusicController().musicEvent("empty_pattern", t, "metronome");
            this.metronomeOn = false;
            return
    }
};
DMAF.ControllerInstance.prototype.processEvent = function(e, t, n) {
    switch (e) {
        case "sustainReleased":
            if (this.instrument === "key_piano" || this.instrument === "key_epiano") {
                n.type = "controller";
                n.cc = 64;
                n.value = 0;
                DMAF.getController().sendToServer(this.instrument, t, n);
                DMAF.Managers.getCheckTimeManager().checkEventTime(this.instrument, t, n)
            }
            return;
        case "sustainPressed":
            if (this.instrument === "key_piano" || this.instrument === "key_epiano") {
                n.type = "controller";
                n.cc = 64;
                n.value = 127;
                DMAF.getController().sendToServer(this.instrument, t, n);
                DMAF.Managers.getCheckTimeManager().checkEventTime(this.instrument, t, n)
            }
            return;
        case "switchInstrument":
            this.pad = 1;
            this.drum = "kick";
            this.string = 1;
            this.octave = 1;
            this.currentPianoOctave = 3;
            this.currentPianoKey = 1;
            if (JAM.instrumentsConfig[this.instrument]) {
                if (JAM.instrumentsConfig[this.instrument].fx_defaults) {
                    if (JAM.instrumentsConfig[this.instrument].fx_defaults.fx1) {
                        DMAF.getController().sendToServer("effectOn", t, {
                            fxnr: 1,
                            instrument: this.instrument
                        });
                        DMAF.Managers.getCheckTimeManager().checkEventTime("effectOn", t, {
                            fxnr: 1,
                            instrument: this.instrument
                        });
                        DMAF.getController().sendToServer("effectAmountChange", t, {
                            fxnr: 1,
                            value: JAM.instrumentsConfig[this.instrument].fx_defaults.fx1 / 14,
                            instrument: this.instrument
                        });
                        DMAF.Managers.getCheckTimeManager().checkEventTime("effectAmountChange", t, {
                            fxnr: 1,
                            value: JAM.instrumentsConfig[this.instrument].fx_defaults.fx1 / 14,
                            instrument: this.instrument
                        })
                    } else {
                        DMAF.getController().sendToServer("effectOff", t, {
                            fxnr: 1,
                            instrument: this.instrument
                        });
                        DMAF.Managers.getCheckTimeManager().checkEventTime("effectOff", t, {
                            fxnr: 1,
                            instrument: this.instrument
                        })
                    } if (JAM.instrumentsConfig[this.instrument].fx_defaults.fx2) {
                        DMAF.getController().sendToServer("effectOn", t, {
                            fxnr: 2,
                            instrument: this.instrument
                        });
                        DMAF.Managers.getCheckTimeManager().checkEventTime("effectOn", t, {
                            fxnr: 2,
                            instrument: this.instrument
                        });
                        DMAF.getController().sendToServer("effectAmountChange", t, {
                            fxnr: 2,
                            value: JAM.instrumentsConfig[this.instrument].fx_defaults.fx2 / 14,
                            instrument: this.instrument
                        });
                        DMAF.Managers.getCheckTimeManager().checkEventTime("effectAmountChange", t, {
                            fxnr: 2,
                            value: JAM.instrumentsConfig[this.instrument].fx_defaults.fx2 / 14,
                            instrument: this.instrument
                        })
                    } else {
                        DMAF.getController().sendToServer("effectOff", t, {
                            fxnr: 2,
                            instrument: this.instrument
                        });
                        DMAF.Managers.getCheckTimeManager().checkEventTime("effectOff", t, {
                            fxnr: 2,
                            instrument: this.instrument
                        })
                    }
                } else {
                    DMAF.getController().sendToServer("effectOff", t, {
                        fxnr: 1,
                        instrument: this.instrument
                    });
                    DMAF.Managers.getCheckTimeManager().checkEventTime("effectOff", t, {
                        fxnr: 1,
                        instrument: this.instrument
                    });
                    DMAF.getController().sendToServer("effectOff", t, {
                        fxnr: 2,
                        instrument: this.instrument
                    });
                    DMAF.Managers.getCheckTimeManager().checkEventTime("effectOff", t, {
                        fxnr: 2,
                        instrument: this.instrument
                    })
                }
            }
            this.instrument = n.instrument;
            DMAF.getController().sendToServer(e, t, n);
            DMAF.Managers.getCheckTimeManager().checkEventTime(e, t, n);
            return;
        case "switchPattern":
            if (n.pattern !== undefined) {
                if (n.pattern === "off") {
                    this.easyModePattern = n.pattern;
                    this.mouseIsDown = false;
                    this.sendToServer("stopPattern", t, {
                        channel: this.instrument
                    });
                    DMAF.Managers.getCheckTimeManager().checkEventTime("stopPattern", t, {
                        channel: this.instrument
                    })
                } else {
                    this.easyModePattern = "p" + n.pattern;
                    this.mouseIsDown = true
                }
            }
            if (this.mouseIsDown) {
                n = this.handleSwitchPattern(e, t, n);
                DMAF.Managers.getCheckTimeManager().checkEventTime(e, t, n);
                this.sendToServer(e, t, n)
            }
            return;
        case "noteOn":
            switch (this.instrument) {
                case "key_piano":
                case "key_epiano":
                case "key_strings":
                case "key_brass":
                case "key_seq":
                case "key_organ":
                    this.startPianoNote(this.instrument, t, n);
                    break;
                case "guitar_steel":
                case "guitar_nylon":
                case "guitar_clean":
                case "guitar_crunch":
                case "guitar_dist":
                case "guitar_funky":
                    this.startGuitarNote(this.instrument, t, n);
                    break;
                case "bass_pick":
                case "bass_finger":
                case "bass_ac":
                    this.startBassNote(this.instrument, t, n);
                    break;
                case "drums_standard":
                case "drums_brushes":
                    this.startDrumNote(this.instrument, t, n);
                    break;
                case "dm_hiphop":
                case "dm_techno":
                case "dm_analogue":
                    this.startDrumMachineNote(this.instrument, t, n);
                    break
            }
            return;
        case "noteOff":
            if (this.easyMode && this.easyModePattern !== "off" && this.mouseIsDown) {
                setTimeout(function(e, t, n, r) {
                    return function() {
                        if (!r.mouseIsDown && r.easyMode && r.easyModePattern !== "off") {
                            switch (e) {
                                case "key_piano":
                                case "key_epiano":
                                case "key_strings":
                                case "key_brass":
                                case "key_seq":
                                case "key_organ":
                                case "guitar_steel":
                                case "guitar_nylon":
                                case "guitar_clean":
                                case "guitar_crunch":
                                case "guitar_dist":
                                case "guitar_funky":
                                case "bass_pick":
                                case "bass_finger":
                                case "bass_ac":
                                    n.instrument = e;
                                    DMAF.Managers.getCheckTimeManager().checkEventTime("stopAllNotes", t, n);
                                    r.sendToServer("stopAllNotes", t, n);
                                    break;
                                default:
                                    break
                            }
                        }
                    }
                }(this.instrument, t, n, this), 10);
                return
            }
            switch (this.instrument) {
                case "key_piano":
                case "key_epiano":
                case "key_strings":
                case "key_brass":
                case "key_seq":
                case "key_organ":
                    this.stopPianoNote(this.instrument, t, n);
                    break;
                case "guitar_steel":
                case "guitar_nylon":
                case "guitar_clean":
                case "guitar_crunch":
                case "guitar_dist":
                case "guitar_funky":
                    this.stopGuitarNote(this.instrument, t, n);
                    break;
                case "bass_pick":
                case "bass_finger":
                case "bass_ac":
                    this.stopBassNote(this.instrument, t, n);
                    break;
                case "drums_standard":
                case "drums_brushes":
                    this.stopDrumNote(this.instrument, t, n);
                    break;
                case "dm_hiphop":
                case "dm_techno":
                case "dm_analogue":
                    this.stopDrumMachineNote(this.instrument, t, n);
                    break
            }
            return;
        case "switchChord":
            this.checkOffsetAndPatternAtSwitchChord(e, t, n);
            DMAF.Managers.getCheckTimeManager().checkEventTime(e, t, n);
            this.sendToServer(e, t, n);
            return
    }
};
DMAF.ControllerInstance.prototype.checkOffsetAndPatternAtSwitchChord = function(e, t, n) {
    if (this.instrument.search("guitar") !== -1) {
        for (var r in this.currentGuitarNotes) {
            if (this.currentGuitarNotes[r] !== undefined) {
                DMAF.getController().stopNote(this.currentGuitarNotes[r].midiNote, t, this.currentGuitarNotes[r]);
                delete this.currentGuitarNotes[r]
            }
        }
    }
    if (this.previousBassNote) {
        var i = {
            note: this.previousBassNote.midiNote,
            eventTime: t,
            params: this.previousBassNote
        };
        DMAF.getController().stopNote(i.note, i.eventTime, i.params)
    }
    var s = n.chord - 1,
        o;
    switch (s) {
        case 0:
            o = 0 + (this.keyNote - 4);
            break;
        case 1:
            o = 5 + (this.keyNote - 4);
            break;
        case 2:
            o = 7 + (this.keyNote - 4);
            break;
        case 3:
            if (this.mode === 1) {
                o = 9 + (this.keyNote - 4)
            } else {
                if (this.mode === 6) {
                    o = 3 + (this.keyNote - 4)
                }
            }
            break;
        case 4:
            if (this.mode === 1) {
                o = 2 + (this.keyNote - 4)
            } else {
                if (this.mode === 6) {
                    o = 8 + (this.keyNote - 4)
                }
            }
            break;
        case 5:
            if (this.mode === 1) {
                o = 4 + (this.keyNote - 4)
            } else {
                if (this.mode === 6) {
                    o = 10 + (this.keyNote - 4)
                }
            }
            break
    }
    while (o < 0) {
        o += 12
    }
    while (o > 12) {
        o -= 12
    }
    if (this.instrument.search("guitar") !== -1 || this.instrument.search("bass") !== -1) {
        switch (o - (this.keyNote - 4)) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
                this.setInstrumentOffset(t, 0);
                break;
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
                this.setInstrumentOffset(t, -5);
                break;
            case 10:
            case 11:
                this.setInstrumentOffset(t, -10);
                break;
            default:
                if (this.keyNote < 4) {
                    switch (o - (this.keyNote + 8)) {
                        case 0:
                        case 1:
                        case 2:
                        case 3:
                        case 4:
                            this.setInstrumentOffset(t, 0);
                            break;
                        case 5:
                        case 6:
                        case 7:
                        case 8:
                        case 9:
                            this.setInstrumentOffset(t, -5);
                            break;
                        case 10:
                        case 11:
                            this.setInstrumentOffset(t, -10);
                            break;
                        default:
                            break
                    }
                }
                break
        }
    }
    if (this.mouseIsDown && this.easyMode && this.easyModePattern !== "off") {
        if (this.instrument.search("guitar") !== -1) {
            n = this.getPattern("guitar", t, n, o);
            DMAF.Managers.getCheckTimeManager().checkEventTime("switchPattern", t, n);
            this.sendToServer("switchPattern", t, n)
        } else {
            if (this.instrument.search("bass") !== -1) {
                n = this.getPattern("bass", t, n, o);
                DMAF.Managers.getCheckTimeManager().checkEventTime("switchPattern", t, n);
                this.sendToServer("switchPattern", t, n)
            }
        }
    }
    return
};
DMAF.ControllerInstance.prototype.handleSwitchPattern = function(e, t, n) {
    if (n.pattern === "off") {
        n.pattern = "empty_pattern";
        n.channel = this.instrument
    } else {
        if (this.instrument.search("guitar") !== -1) {
            n = this.getPattern("guitar", t, n)
        } else {
            if (this.instrument.search("bass") !== -1) {
                n = this.getPattern("bass", t, n)
            } else {
                if (this.instrument.search("key") !== -1) {
                    n = this.getPattern("piano", t, n)
                } else {
                    if (this.instrument.search("drums") !== -1) {
                        if (this.drumLoops[this.instrument]) {
                            this.sendToServer("stopDrumLoop", t, {
                                drum: this.drumLoops[this.instrument].drum,
                                instrument: this.instrument
                            });
                            DMAF.Managers.getCheckTimeManager().checkEventTime("stopDrumLoop", t, {
                                drum: this.drumLoops[this.instrument].drum,
                                instrument: this.instrument
                            });
                            delete this.drumLoops[this.instrument]
                        }
                        n = this.getPattern("drums", t, n)
                    } else {
                        if (this.instrument.search("dm_") !== -1) {
                            if (this.drumLoops[this.instrument]) {
                                this.sendToServer("stopDrumMachineLoop", t, {
                                    pad: this.drumLoops[this.instrument].pad,
                                    instrument: this.instrument
                                });
                                DMAF.Managers.getCheckTimeManager().checkEventTime("stopDrumMachineLoop", t, {
                                    pad: this.drumLoops[this.instrument].pad,
                                    instrument: this.instrument
                                });
                                delete this.drumLoops[this.instrument]
                            }
                            n = this.getPattern("drummachine", t, n)
                        }
                    }
                }
            }
        }
    }
    return n
};
DMAF.ControllerInstance.prototype.getPattern = function(e, t, n, r) {
    var i;
    if (r === undefined) {
        r = this.baseNote
    }
    switch (e) {
        case "guitar":
        case "bass":
            if (n && n.string !== undefined) {
                i = "v" + n.string;
                this.string = n.string
            } else {
                if (this.string !== undefined) {
                    i = "v" + this.string
                } else {
                    i = "v1";
                    this.string = 1
                }
            }
            var s;
            var o = Math.floor(r / 12) * 12;
            switch (r % 12) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    s = "E";
                    this.setInstrumentOffset(t, 0 - o);
                    break;
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                    s = "A";
                    this.setInstrumentOffset(t, -5 - o);
                    break;
                case 10:
                case 11:
                    s = "D";
                    this.setInstrumentOffset(t, -10 - o);
                    break
            }
            n.pattern = this.instrument + "__" + this.easyModePattern + "_" + s + "_" + i;
            n.channel = this.instrument;
            break;
        case "piano":
            if (n && n.key <= 3 && n.key >= 1) {
                i = "v1";
                this.currentPianoVoicing = i
            } else {
                if (n && n.key <= 7 && n.key >= 4) {
                    i = "v2";
                    this.currentPianoVoicing = i
                } else {
                    if (n && n.key <= 12 && n.key >= 8) {
                        i = "v3";
                        this.currentPianoVoicing = i
                    } else {
                        i = this.currentPianoVoicing || "v1"
                    }
                }
            }
            n.pattern = this.instrument + "__" + this.easyModePattern + "_" + i;
            n.channel = this.instrument;
            if (n.octave) {
                this.setInstrumentOffset(t, 12 * (n.octave - 3))
            }
            break;
        case "drums":
            i = n.drum || this.drum;
            n.pattern = this.instrument + "__" + this.easyModePattern + "_" + i;
            n.channel = this.instrument;
            break;
        case "drummachine":
            if (n.pad) {
                i = "pad" + n.pad
            } else {
                i = "pad" + this.pad
            }
            n.pattern = this.instrument + "__" + this.easyModePattern + "_" + i;
            n.channel = this.instrument;
            break
    }
    return n
};
DMAF.ControllerInstance.prototype.handleSwitchChord = function(e, t, n) {
    this.easyModeChord = n.chord - 1;
    switch (this.easyModeChord) {
        case 0:
            this.baseNote = 0 + (this.keyNote - 4);
            break;
        case 1:
            this.baseNote = 5 + (this.keyNote - 4);
            break;
        case 2:
            this.baseNote = 7 + (this.keyNote - 4);
            break;
        case 3:
            if (this.mode === 1) {
                this.baseNote = 9 + (this.keyNote - 4)
            } else {
                if (this.mode === 6) {
                    this.baseNote = 3 + (this.keyNote - 4)
                }
            }
            break;
        case 4:
            if (this.mode === 1) {
                this.baseNote = 2 + (this.keyNote - 4)
            } else {
                if (this.mode === 6) {
                    this.baseNote = 8 + (this.keyNote - 4)
                }
            }
            break;
        case 5:
            if (this.mode === 1) {
                this.baseNote = 4 + (this.keyNote - 4)
            } else {
                if (this.mode === 6) {
                    this.baseNote = 10 + (this.keyNote - 4)
                }
            }
            break
    }
    while (this.baseNote < 0) {
        this.baseNote += 12
    }
    while (this.baseNote > 12) {
        this.baseNote -= 12
    }
    return
};
DMAF.ControllerInstance.prototype.setMouseOverInstrument = function(e, t) {
    if (this.easyModePattern !== "off" && this.easyMode === true) {
        return
    }
    return
};
DMAF.ControllerInstance.prototype.setMouseOverStrumming = function(e, t) {
    this.mouseOverStrumming = t
};
DMAF.ControllerInstance.prototype.setMouseIsDown = function(e, t) {
    if (this.easyModePattern !== "off" && this.easyMode === true) {
        return
    }
    this.mouseIsDown = t;
    this.runStateChecks(e)
};
DMAF.ControllerInstance.prototype.runStateChecks = function(e) {
    if (!this.mouseIsDown || !this.mouseOverInstrument) {
        if (this.easyMode && this.easyModePattern === "off" && this.instrument.search("bass") !== -1) {
            if (this.previousBassNote !== undefined && this.previousBassNote.midiNote !== undefined) {
                DMAF.getController().stopNote(this.previousBassNote.midiNote, e, this.previousBassNote)
            }
            return
        }
        if (this.instrument.search("guitar") !== -1) {
            for (var t in this.currentGuitarNotes) {
                if (this.currentGuitarNotes[t] !== undefined) {
                    DMAF.getController().stopNote(this.currentGuitarNotes[t].midiNote, e, this.currentGuitarNotes[t]);
                    delete this.currentGuitarNotes[t]
                }
            }
        }
        if (this.previousBassNote) {
            var n = {
                note: this.previousBassNote.midiNote,
                eventTime: e,
                params: this.previousBassNote
            };
            DMAF.getController().stopNote(n.note, n.eventTime, n.params)
        }
        DMAF.getController().stopGuitarNote(this.instrument, e, {
            string: this.string,
            fret: this.fret,
            style: this.style
        });
        this.sendToServer("stopPattern", e, {
            channel: this.instrument
        });
        DMAF.Managers.getCheckTimeManager().checkEventTime("stopPattern", e, {
            channel: this.instrument
        })
    }
    if (!this.mouseIsDown) {
        this.strummedNoteCache = []
    }
};
DMAF.ControllerInstance.prototype.setInstrumentOffset = function(e, t) {
    this.sendToServer("instrumentOffset", e, {
        offset: t,
        instrument: this.instrument
    });
    DMAF.Managers.getCheckTimeManager().checkEventTime("instrumentOffset", e, {
        offset: t,
        instrument: this.instrument
    })
};
DMAF.ControllerInstance.prototype.startPianoNote = function(e, t, n) {
    if (n.octave > 7) {
        n.octave = 7
    } else {
        if (n.octave < 1) {
            n.octave = 1
        }
    } if (this.easyMode && this.easyModePattern !== "off") {
        if (this.mouseIsDown) {
            n = this.handleSwitchPattern(e, t, n);
            DMAF.Managers.getCheckTimeManager().checkEventTime("switchPattern", t, n);
            this.sendToServer("switchPattern", t, n);
            this.currentPianoOctave = n.octave;
            this.currentPianoKey = n.key
        }
        return
    }
    var r = 12 + 12 * n.octave + (n.key - 1);
    DMAF.getController().playNote(r, t, n)
};
DMAF.ControllerInstance.prototype.stopPianoNote = function(e, t, n) {
    if (n.octave > 7) {
        n.octave = 7
    } else {
        if (n.octave < 1) {
            n.octave = 1
        }
    }
    var r = 12 + 12 * n.octave + (n.key - 1);
    DMAF.getController().stopNote(r, t, n)
};
DMAF.ControllerInstance.prototype.startGuitarNote = function(e, t, n) {
    if (n.string < 1) {
        n.string = 1
    } else {
        if (n.string > 6) {
            n.string = 6
        }
    }
    var r = false;
    if (this.easyMode && this.easyModePattern !== "off") {
        if (this.mouseIsDown) {
            n = this.handleSwitchPattern(e, t, n);
            DMAF.Managers.getCheckTimeManager().checkEventTime("switchPattern", t, n);
            this.sendToServer("switchPattern", t, n)
        }
        return
    } else {
        if (this.easyMode && this.easyModePattern === "off") {
            var i = [0, 2, 2, 1, 0, 0];
            var s = [0, 0, 2, 2, 2, 0];
            var o = [2, 0, 0, 2, 3, 2];
            var u = [i, s, s, s, i, i];
            var a = [i, s, s, i, s, o];
            if (this.mode === 1) {
                n.fret = u[this.easyModeChord][n.string - 1]
            } else {
                n.fret = a[this.easyModeChord][n.string - 1]
            }
            r = true
        }
    }
    var f = [40, 45, 50, 55, 59, 64];
    var l = f[n.string - 1] + n.fret + DMAF.hackedGuitarOffset;
    n.snapToScale = r;
    n.style = this.style;
    n.midiNote = l;
    var c;
    if (this.mouseIsDown) {
        if (n.type === "keyboard") {
            return
        }
        if (this.currentGuitarNotes[n.string]) {
            c = {
                note: this.currentGuitarNotes[n.string].midiNote,
                eventTime: t,
                params: this.currentGuitarNotes[n.string]
            }
        }
        var h = {};
        for (var p in n) {
            h[p] = n[p]
        }
        this.currentGuitarNotes[n.string] = h
    }
    if (!this.easyMode && this.mouseIsDown) {
        this.strummedNoteCache.push({
            string: n.string,
            fret: n.fret
        });
        if (this.strummedNoteCache.length > 2) {
            this.strummedNoteCache.shift()
        }
    }
    if (this.mouseOverStrumming) {
        n.strumming = true
    } else {
        n.strumming = false
    }
    this.string = n.string;
    this.fret = n.fret;
    n.easyMode = this.easyMode;
    DMAF.getController().playNote(l, t, n);
    if (c && c.note !== this.currentGuitarNotes[n.string].midiNote && !this.mouseOverStrumming) {
        DMAF.getController().stopNote(c.note, c.eventTime, c.params)
    }
};
DMAF.ControllerInstance.prototype.stopGuitarNote = function(e, t, n) {
    if (n.string < 1) {
        n.string = 1
    } else {
        if (n.string > 6) {
            n.string = 6
        }
    } if (this.mouseOverStrumming && this.mouseIsDown && !this.easyMode) {
        return
    }
    if (!this.easyMode && this.mouseIsDown) {
        if (this.strummedNoteCache[1] && this.strummedNoteCache[0].string == this.strummedNoteCache[1].string && this.strummedNoteCache[0].fret == this.strummedNoteCache[1].fret) {
            return
        }
    }
    var r = [40, 45, 50, 55, 59, 64];
    var i = r[n.string - 1] + n.fret + DMAF.hackedGuitarOffset;
    n.style = this.style;
    DMAF.getController().stopNote(i, t, n)
};
DMAF.ControllerInstance.prototype.startBassNote = function(e, t, n) {
    if (n.string < 1) {
        n.string = 1
    } else {
        if (n.string > 4) {
            n.string = 4
        }
    }
    n.style = this.style;
    var r = false;
    if (this.easyMode) {
        if (n.type === "keyboard") {
            return
        }
    }
    var i;
    if (this.easyMode && this.easyModePattern !== "off") {
        if (this.mouseIsDown) {
            n = this.handleSwitchPattern(e, t, n);
            DMAF.Managers.getCheckTimeManager().checkEventTime("switchPattern", t, n);
            this.sendToServer("switchPattern", t, n)
        }
        return
    } else {
        if (this.easyMode && this.easyModePattern === "off") {
            var s = [0, 2, 2, 1];
            var o = [0, 0, 2, 2];
            var u = [2, 0, 0, 2];
            var a = [s, o, o, o, s, s];
            var f = [s, o, o, s, o, u];
            if (this.mode === 1) {
                n.fret = a[this.easyModeChord][n.string - 1]
            } else {
                n.fret = f[this.easyModeChord][n.string - 1]
            }
            r = true;
            if (this.previousBassNote !== undefined && this.previousBassNote.midiNote !== undefined) {
                i = {
                    note: this.previousBassNote.midiNote,
                    eventTime: t,
                    params: this.previousBassNote
                }
            }
            var l = {};
            for (var c in n) {
                l[c] = n[c]
            }
            this.previousBassNote = l
        }
    }
    var h = [40, 45, 50, 55];
    var p = h[n.string - 1] + n.fret;
    n.midiNote = p;
    n.snapToScale = r;
    if (!this.easyMode && this.mouseIsDown) {
        this.strummedNoteCache.push({
            string: n.string,
            fret: n.fret
        });
        if (this.strummedNoteCache.length > 2) {
            this.strummedNoteCache.shift()
        }
    }
    DMAF.getController().playNote(p, t, n);
    if (i && i.note !== this.previousBassNote.midiNote) {
        DMAF.getController().stopNote(i.note, i.eventTime, i.params)
    }
};
DMAF.ControllerInstance.prototype.stopBassNote = function(e, t, n) {
    if (n.string < 1) {
        n.string = 1
    } else {
        if (n.string > 4) {
            n.string = 4
        }
    } if (!this.easyMode && this.mouseIsDown) {
        if (this.strummedNoteCache[1] && this.strummedNoteCache[0].string == this.strummedNoteCache[1].string && this.strummedNoteCache[0].fret == this.strummedNoteCache[1].fret) {
            return
        }
    }
    var r = [40, 45, 50, 55];
    var i = r[n.string - 1] + n.fret;
    n.style = this.style;
    DMAF.getController().stopNote(i, t, n)
};
DMAF.ControllerInstance.prototype.startDrumNote = function(e, t, n) {
    var r = ["kick", "snare", "snare_rim", "hh_closed", "hh_half", "hh_open", "tom_1", "tom_2", "tom_3", "crash", "ride_edge", "ride_bell"];
    switch (n.drum) {
        case "hihat_open":
            n.drum = "hh_open";
            break;
        case "hihat_half_open":
            n.drum = "hh_half";
            break;
        case "hihat_closed":
            n.drum = "hh_closed";
            break
    }
    if (this.easyMode && this.easyModePattern !== "off") {
        this.drum = n.drum;
        if (this.drumLoops[this.instrument]) {
            this.sendToServer("stopDrumLoop", t, {
                drum: this.drumLoops[this.instrument].drum,
                instrument: this.instrument
            });
            DMAF.Managers.getCheckTimeManager().checkEventTime("stopDrumLoop", t, {
                drum: this.drumLoops[this.instrument].drum,
                instrument: this.instrument
            });
            delete this.drumLoops[this.instrument]
        }
        if (this.mouseIsDown) {
            n = this.handleSwitchPattern(e, t, n);
            DMAF.Managers.getCheckTimeManager().checkEventTime("switchPattern", t, n);
            this.sendToServer("switchPattern", t, n)
        }
        return
    } else {
        if (this.easyMode && this.easyModePattern === "off") {
            if (this.drumLoops[this.instrument]) {
                this.sendToServer("stopDrumLoop", t, {
                    drum: this.drumLoops[this.instrument].drum,
                    instrument: this.instrument
                });
                DMAF.Managers.getCheckTimeManager().checkEventTime("stopDrumLoop", t, {
                    drum: this.drumLoops[this.instrument].drum,
                    instrument: this.instrument
                });
                n.instrument = this.instrument;
                DMAF.Managers.getCheckTimeManager().checkEventTime("startDrumLoop", t + 16, n);
                this.sendToServer("startDrumLoop", t + 16, n)
            } else {
                n.instrument = this.instrument;
                DMAF.Managers.getCheckTimeManager().checkEventTime("startDrumLoop", t, n);
                this.sendToServer("startDrumLoop", t, n)
            }
            return
        }
    }
    var i = 24 + r.indexOf(n.drum);
    DMAF.getController().playNote(i, t, n)
};
DMAF.ControllerInstance.prototype.stopDrumNote = function(e, t, n) {
    var r = ["kick", "snare", "snare_rim", "hihat_closed", "hihat_half_open", "hihat_open", "tom_1", "tom_2", "tom_3", "crash", "ride_edge", "ride_bell"];
    switch (n.drum) {
        case "hihat_open":
            n.drum = "hh_open";
            break;
        case "hihat_half_open":
            n.drum = "hh_half";
            break;
        case "hihat_closed":
            n.drum = "hh_closed";
            break
    }
    if (this.easyMode && this.easyModePattern === "off") {
        n.instrument = this.instrument;
        this.sendToServer("stopDrumLoop", t, n);
        DMAF.Managers.getCheckTimeManager().checkEventTime("stopDrumLoop", t, n);
        return
    }
    var i = 24 + r.indexOf(n.drum);
    DMAF.getController().stopNote(i, t, n)
};
DMAF.ControllerInstance.prototype.startDrumMachineNote = function(e, t, n) {
    if (this.easyMode && this.easyModePattern !== "off") {
        this.pad = n.pad;
        if (this.drumLoops[this.instrument]) {
            this.sendToServer("stopDrumMachineLoop", t, {
                pad: this.drumLoops[this.instrument].pad,
                instrument: this.instrument
            });
            DMAF.Managers.getCheckTimeManager().checkEventTime("stopDrumMachineLoop", t, {
                pad: this.drumLoops[this.instrument].pad,
                instrument: this.instrument
            });
            delete this.drumLoops[this.instrument]
        }
        if (this.mouseIsDown) {
            n = this.handleSwitchPattern(e, t, n);
            DMAF.Managers.getCheckTimeManager().checkEventTime("switchPattern", t, n);
            this.sendToServer("switchPattern", t, n)
        }
        return
    } else {
        if (this.easyMode && this.easyModePattern === "off") {
            if (this.drumLoops[this.instrument]) {
                this.sendToServer("stopDrumMachineLoop", t, {
                    pad: this.drumLoops[this.instrument].pad,
                    instrument: this.instrument
                });
                DMAF.Managers.getCheckTimeManager().checkEventTime("stopDrumMachineLoop", t, {
                    pad: this.drumLoops[this.instrument].pad,
                    instrument: this.instrument
                });
                n.instrument = this.instrument;
                DMAF.Managers.getCheckTimeManager().checkEventTime("startDrumMachineLoop", t + 16, n);
                this.sendToServer("startDrumMachineLoop", t + 16, n)
            } else {
                n.instrument = this.instrument;
                DMAF.Managers.getCheckTimeManager().checkEventTime("startDrumMachineLoop", t, n);
                this.sendToServer("startDrumMachineLoop", t, n)
            }
            return
        }
    }
    var r = 24 + parseInt(n.pad) - 1;
    DMAF.getController().playNote(r, t, n)
};
DMAF.ControllerInstance.prototype.stopDrumMachineNote = function(e, t, n) {
    if (this.easyMode && this.easyModePattern === "off") {
        n.instrument = this.instrument;
        this.sendToServer("stopDrumMachineLoop", t, n);
        DMAF.Managers.getCheckTimeManager().checkEventTime("stopDrumMachineLoop", t, n);
        return
    }
    if (this.easyMode) {
        DMAF.Managers.getCheckTimeManager().checkEventTime("stopPattern", t, n);
        this.sendToServer("stopPattern", t, n)
    }
    var r = 24 + parseInt(n.pad) - 1;
    DMAF.getController().stopNote(r, t, n)
};
DMAF.ControllerInstance.prototype.playNote = function(e, t, n) {
    n.type = "noteOn";
    n.velocity = n.velocity || Math.round(Math.random() * 20) + 90;
    n.noteEndTime = 1e3;
    n.midiNote = e;
    this.sendToServer(this.instrument, t, n);
    DMAF.Managers.getCheckTimeManager().checkEventTime(this.instrument, t, n)
};
DMAF.ControllerInstance.prototype.stopNote = function(e, t, n) {
    n.type = "noteOff";
    n.velocity = n.velocity || 0;
    n.midiNote = e;
    this.sendToServer(this.instrument, t, n);
    DMAF.Managers.getCheckTimeManager().checkEventTime(this.instrument, t, n)
};
DMAF.Processors.AbstractMusicController = function() {
    this.player = new DMAF.Processors.BeatPatternPlayer
};
DMAF.Processors.AbstractMusicController.prototype.NEXT_BAR = "nextBar";
DMAF.Processors.AbstractMusicController.prototype.NEXT_CUE = "nextCue";
DMAF.Processors.AbstractMusicController.prototype.CURRENT_BEAT = "currentBeat";
DMAF.Processors.AbstractMusicController.prototype.NEXT_BEAT = "nextBeat";
DMAF.Processors.AbstractMusicController.prototype.NEXT_BEAT_2 = "nextBeat2";
DMAF.Processors.AbstractMusicController.prototype.NEXT_BEAT_3 = "nextBeat3";
DMAF.Processors.AbstractMusicController.prototype.NEXT_BEAT_4 = "nextBeat4";
DMAF.Processors.AbstractMusicController.prototype.UPBEAT_2 = "upbeat2";
DMAF.Processors.AbstractMusicController.prototype.UPBEAT_3 = "upbeat3";
DMAF.Processors.AbstractMusicController.prototype.UPBEAT_4 = "upbeat4";
DMAF.Processors.AbstractMusicController.prototype.FIRST_BAR = "firstBar";
DMAF.Processors.AbstractMusicController.prototype.SYNC = "sync";
DMAF.Processors.AbstractMusicController.prototype.SYNC_CURRENT = "syncsync";
DMAF.Processors.AbstractMusicController.prototype.NONE = "none";
DMAF.Processors.AbstractMusicController.prototype.CLEAR_PENDING = true;
DMAF.Processors.AbstractMusicController.prototype.KEEP_PENDING = false;
DMAF.Processors.AbstractMusicController.prototype.REPLACE = true;
DMAF.Processors.AbstractMusicController.prototype.ADD = false;
DMAF.Processors.AbstractMusicController.prototype.LOOP = true;
DMAF.Processors.AbstractMusicController.prototype.SINGLE_SHOT = false;
DMAF.Processors.AbstractMusicController.prototype.NAME = "AbstractMusicController";
DMAF.Processors.AbstractMusicController.prototype.onEvent = function(e) {
    DMAF.error("onEvent not overriden in AbstractMusicController")
};
DMAF.Processors.AbstractMusicController.prototype.songPosition = function(e, t) {
    var n;
    switch (e) {
        case this.NEXT_BAR:
            n = new DMAF.Processors.BeatPosition(this.player.getNextBar(), 1);
            break;
        case this.NEXT_CUE:
            break;
        case this.CURRENT_BEAT:
            n = new DMAF.Processors.BeatPosition(this.player.getCurrentBar(), this.player.getCurrentBeat());
            break;
        case this.NEXT_BEAT:
            if (this.player.getCurrentBeat() === this.player.getBeatsPerBar()) {
                n = new DMAF.Processors.BeatPosition(this.player.getNextBar(), 1)
            } else {
                n = new DMAF.Processors.BeatPosition(this.player.getCurrentBar(), this.player.getNextBeat())
            }
            break;
        case this.NEXT_BEAT_2:
            if (this.player.getCurrentBeat() < 2) {
                n = new DMAF.Processors.BeatPosition(this.player.getCurrentBar(), 2)
            } else {
                n = new DMAF.Processors.BeatPosition(this.player.getNextBar(), 2)
            }
            break;
        case this.NEXT_BEAT_3:
            if (this.player.getCurrentBeat() < 3) {
                n = new DMAF.Processors.BeatPosition(this.player.getCurrentBar(), 3)
            } else {
                n = new DMAF.Processors.BeatPosition(this.player.getNextBar(), 3)
            }
            break;
        case this.NEXT_BEAT_4:
            if (this.player.getCurrentBeat() < 4) {
                n = new DMAF.Processors.BeatPosition(this.player.getCurrentBar(), 4)
            } else {
                n = new DMAF.Processors.BeatPosition(this.player.getNextBar(), 4)
            }
            break;
        default:
            DMAF.error("Unknown mode: " + e);
            break
    }
    if (t) {
        n.addOffset(t)
    }
    return n
};
DMAF.Processors.AbstractMusicController.prototype.patternPosition = function(e, t) {
    var n;
    switch (e) {
        case this.NEXT_BEAT:
            if (this.player.getCurrentPatternBeat() === this.player.getBeatsPerBar()) {
                n = new DMAF.Processors.BeatPosition(this.player.getNextPatternBar(), 1)
            } else {
                n = new DMAF.Processors.BeatPosition(this.player.getCurrentPatternBar(), this.player.getNextPatternBeat())
            }
            break;
        case this.UPBEAT_2:
            n = new DMAF.Processors.BeatPosition(0, 2);
            break;
        case this.UPBEAT_3:
            n = new DMAF.Processors.BeatPosition(0, 3);
            break;
        case this.UPBEAT_4:
            n = new DMAF.Processors.BeatPosition(0, 4);
            break;
        case this.FIRST_BAR:
            n = new DMAF.Processors.BeatPosition(1, 1);
            break;
        case this.SYNC:
            if (this.player.getCurrentPatternBeat() === this.player.getBeatsPerBar()) {
                n = new DMAF.Processors.BeatPosition(this.player.getNextPatternBar(), 1)
            } else {
                n = new DMAF.Processors.BeatPosition(this.player.getCurrentPatternBar(), this.player.getNextPatternBeat())
            }
            break
    }
    if (t) {
        n.addOffset(t)
    }
    return n
};
DMAF.Processors.AbstractMusicController.prototype.clearPosition = function(e, t) {
    var n;
    switch (e) {
        case this.NEXT_BAR:
            n = new DMAF.Processors.BeatPosition(this.player.getNextBar(), 1);
            break;
        case this.NEXT_CUE:
            break;
        case this.NEXT_BEAT:
            if (this.player.getCurrentBeat() === this.player.getBeatsPerBar()) {
                n = new DMAF.Processors.BeatPosition(this.player.getNextBar(), 1)
            } else {
                n = new DMAF.Processors.BeatPosition(this.player.getCurrentBar(), this.player.getNextBeat())
            }
            break;
        case this.NEXT_BEAT_2:
            if (this.player.getCurrentBeatTime() < 2) {
                n = new DMAF.Processors.BeatPosition(this.player.getCurrentBar(), 2)
            } else {
                n = new DMAF.Processors.BeatPosition(this.player.getNextBar(), 2)
            }
            break;
        case this.NEXT_BEAT_3:
            if (this.player.getCurrentBeatTime() < 3) {
                n = new DMAF.Processors.BeatPosition(this.player.getCurrentBar(), 3)
            } else {
                n = new DMAF.Processors.BeatPosition(this.player.getNextBar(), 3)
            }
            break;
        case this.NEXT_BEAT_4:
            if (this.player.getCurrentBeatTime() < 4) {
                n = new DMAF.Processors.BeatPosition(this.player.getCurrentBar(), 4)
            } else {
                n = new DMAF.Processors.BeatPosition(this.player.getNextBar(), 4)
            }
            break;
        case this.NONE:
            n = new DMAF.Processors.BeatPosition(0, 0);
            break
    }
    if (t) {
        n.addOffset(t)
    }
    return n
};
DMAF.Processors.AbstractMusicController.prototype.offset = function(e, t) {
    var n;
    n = new DMAF.Processors.BeatPosition(e, t);
    return n
};
DMAF.Processors.getMusicController = function() {
    if (!DMAF.MusicController) {
        DMAF.MusicController = new DMAF.Processors.MusicController;
        DMAF.MusicController.init()
    }
    return DMAF.MusicController
};
DMAF.Processors.MusicController = function() {
    DMAF.Processors.AbstractMusicController.call(this)
};
DMAF.Processors.MusicController.prototype = new DMAF.Processors.AbstractMusicController;
DMAF.Processors.MusicController.prototype.PROCESSOR_ID = "MUSIC_CONTROLLER";
DMAF.Processors.MusicController.prototype.NAME = "MusicController";
DMAF.Processors.MusicController.prototype.init = function(e) {
    this.data = DMAF.Data.ProjectData();
    this.structure = DMAF.Data.MusicStructure
};
DMAF.Processors.MusicController.prototype.getTransition = function(e) {
    var t = e + "_0_" + this.player.nextBeat;
    return this.getPattern(t)
};
DMAF.Processors.MusicController.prototype.getPattern = function(e) {
    if (this.data[e]) {
        return this.data[e]
    } else {
        console.error("patternName does not exist: " + e);
        return this.data.empty_pattern
    }
};
DMAF.Processors.MusicController.prototype.proceedAddPattern = function(e, t) {
    this.player.addPattern({
        beatPattern: e,
        beatChannel: t,
        addAtSongPosition: this.songPosition(this.NEXT_BEAT),
        patternStartPosition: this.patternPosition(this.NEXT_BEAT),
        clearPending: this.CLEAR_PENDING,
        replaceActivePatterns: this.REPLACE,
        setAsCurrent: true,
        loop: true,
        clearPosition: this.clearPosition(this.NEXT_BEAT)
    })
};
DMAF.Processors.MusicController.prototype.proceedAddPatternNewStructure = function(e, t, n) {
    this.player.addPattern({
        beatPattern: t,
        beatChannel: n,
        addAtSongPosition: this.songPosition(this.NEXT_BAR),
        patternStartPosition: this.patternPosition(this.FIRST_BAR),
        clearPending: this.CLEAR_PENDING,
        replaceActivePatterns: this.REPLACE,
        setAsCurrent: true,
        loop: true,
        clearPosition: this.clearPosition(this.NEXT_BEAT)
    })
};
DMAF.Processors.MusicController.prototype.proceedAddStructure = function(e, t, n) {
    this.player.addPattern({
        beatPattern: e,
        beatChannel: n,
        addAtSongPosition: this.songPosition(this.NEXT_BAR),
        patternStartPosition: this.patternPosition(this.FIRST_BAR),
        clearPending: this.CLEAR_PENDING,
        replaceActivePatterns: this.REPLACE,
        setAsCurrent: false,
        loop: this.SINGLE_SHOT,
        clearPosition: this.clearPosition(this.NEXT_BAR)
    });
    this.player.addPattern({
        beatPattern: t,
        beatChannel: n,
        addAtSongPosition: this.songPosition(this.NEXT_BAR, this.offset(1, 0)),
        patternStartPosition: this.patternPosition(this.FIRST_BAR),
        clearPending: this.KEEP_PENDING,
        replaceActivePatterns: this.REPLACE,
        setAsCurrent: false,
        loop: true,
        clearPosition: this.clearPosition(this.NEXT_BAR, this.offset(1, 0)),
        useAsTransposePattern: true
    })
};
DMAF.Processors.MusicController.prototype.proceedAddInstantStructure = function(e, t) {
    this.player.addPattern({
        beatPattern: e,
        beatChannel: t,
        addAtSongPosition: this.songPosition(this.NEXT_BAR),
        patternStartPosition: this.patternPosition(this.FIRST_BAR),
        clearPending: this.CLEAR_PENDING,
        replaceActivePatterns: this.REPLACE,
        setAsCurrent: false,
        loop: true,
        clearPosition: this.clearPosition(this.NEXT_BAR),
        useAsTransposePattern: true
    })
};
DMAF.Processors.MusicController.prototype.musicEvent = function(e, t, n) {
    var r = e.split("_");
    var i = "";
    for (var s = 0; s < r.length - 1; s++) {
        i += r[s]
    }
    var o = r[r.length - 1];
    var u;
    var a = this;
    if (o === "mute") {
        u = this.data.getPattern("empty_pattern", n || i);
        return
    }
    if (e.split("__")[0] === "structure") {
        if (e.split("__")[2] === "noDelay") {
            u = this.data.getPattern(e.replace("__noDelay", ""), n, "instantMasterStucture")
        } else {
            DMAF.debug("switching master structure", e);
            u = this.data.getPattern(e, n, "masterStructure")
        }
        return
    }
    if (e.split("_")[0] === "newStructure") {
        e = e.replace("newStructure_", "");
        u = this.data.getPattern(e, n || i, "newStructure");
        return
    }
    switch (e) {
        case "empty_pattern":
            u = this.data.getPattern("empty_pattern", n);
            break;
        case "startClock":
            var f = false;
            if (this.player.clockState === this.player.STOPPED) {
                f = true
            }
            this.player.startClock(t, DMAF.tempo, 4);
            if (f) {
                this.data.getPattern("empty_pattern", "master", "newStructure")
            }
            break;
        case "stopClock":
            this.player.stopClock();
            break;
        default:
            u = this.data.getPattern(e, n || i);
            break
    }
};
var DMAF = DMAF || {};
DMAF.Data = DMAF.Data || {};
DMAF.Data.InstrumentMeta = {
    drumset_soft: {
        func: "drums",
        category: "drumset_soft",
        character: 0
    },
    drums_strom: {
        func: "drums",
        category: "drums_strom",
        character: 7
    },
    drums_cr78: {
        func: "drums",
        category: "drums_cr78",
        character: 6
    },
    drums_tonecraft: {
        func: "drums",
        category: "drums_tonecraft",
        character: 6
    },
    tom_brushes: {
        func: "drums",
        category: "tom_brushes",
        character: 1
    },
    synth_chickenfolk_pans: {
        func: "drums",
        category: "synth_chickenfolk_pans",
        character: 8
    },
    fx_hans_brix: {
        func: "drums",
        category: "fx_hans_brix",
        character: 9
    },
    fx_pong: {
        func: "drums",
        category: "fx_pong",
        character: 8
    },
    fx_tricity: {
        func: "drums",
        category: "fx_tricity",
        character: 9
    },
    drums_robyn_beat: {
        func: "drums",
        category: "drums_robyn_beat",
        character: 7
    },
    guitar_acoustic: {
        func: "comp",
        category: "guitar_acoustic",
        character: 0
    },
    guitar_axel: {
        func: "comp",
        category: "guitar_axel",
        character: 0
    },
    guitar_muted: {
        func: "comp",
        category: "guitar_muted",
        character: 2
    },
    marimba: {
        func: "comp",
        category: "marimba",
        character: 0
    },
    piano_ac_soft: {
        func: "comp",
        category: "piano_ac_soft",
        character: 0
    },
    basic_soft_pad: {
        func: "comp",
        category: "basic_soft_pad",
        character: 6
    },
    indy_pad: {
        func: "comp",
        category: "indy_pad",
        character: 8
    },
    synth_appointed_piano: {
        func: "comp",
        category: "synth_appointed_piano",
        character: 7
    },
    synth_bell_transient: {
        func: "comp",
        category: "synth_bell_transient",
        character: 7
    },
    synth_belleclarinet: {
        func: "comp",
        category: "synth_belleclarinet",
        character: 6
    },
    synth_brass_model: {
        func: "comp",
        category: "synth_brass_model",
        character: 6
    },
    synth_corridor_junk_piano: {
        func: "comp",
        category: "synth_corridor_junk_piano",
        character: 8
    },
    elguit_rockabilly: {
        func: "comp",
        category: "elguit_rockabilly",
        character: 2
    },
    pad_descending: {
        func: "comp",
        category: "pad_descending",
        character: 6
    },
    bottle_blow: {
        func: "comp",
        category: "bottle_blow",
        character: 2
    },
    bass_tonecraft: {
        func: "bass",
        category: "bass_tonecraft",
        character: 6
    },
    synth_basik_phat_bass: {
        func: "bass",
        category: "synth_basik_phat_bass",
        character: 6
    },
    cello_marc: {
        func: "bass",
        category: "cello_marc",
        character: 2
    },
    synth_bass: {
        func: "bass",
        category: "synth_bass",
        character: 5
    },
    elbass_clean_thumb: {
        func: "bass",
        category: "elbass_clean_thumb",
        character: 3
    },
    elbass_pickslide: {
        func: "bass",
        category: "elbass_pickslide",
        character: 2
    },
    elbass_clean_long: {
        func: "bass",
        category: "elbass_clean_long",
        character: 4
    },
    bass_synth_arg: {
        func: "bass",
        category: "bass_synth_arg",
        character: 6
    },
    bellus_blingus: {
        func: "other",
        category: "bellus_blingus",
        character: 7
    },
    musicbox: {
        func: "other",
        category: "musicbox",
        character: 2
    },
    synth_8bit_stab: {
        func: "other",
        category: "synth_8bit_stab",
        character: 6
    },
    synth_chordissimo: {
        func: "other",
        category: "synth_chordissimo",
        character: 7
    },
    synth_drops: {
        func: "other",
        category: "synth_drops",
        character: 6
    },
    synth_drums_and_kalimbas: {
        func: "other",
        category: "synth_drums_and_kalimbas",
        character: 4
    },
    synth_glass_feedback: {
        func: "other",
        category: "synth_glass_feedback",
        character: 7
    },
    synth_lute: {
        func: "other",
        category: "synth_lute",
        character: 7
    },
    synth_arp: {
        func: "other",
        category: "synth_arp",
        character: 6
    },
    elguit_amb: {
        func: "other",
        category: "elguit_amb",
        character: 6
    },
    elguit_crunchy: {
        func: "other",
        category: "elguit_crunchy",
        character: 5
    },
    elguit_flutter: {
        func: "other",
        category: "elguit_flutter",
        character: 7
    },
    elguit_rattlepad: {
        func: "other",
        category: "elguit_rattlepad",
        character: 7
    },
    fx_for_walking: {
        func: "other",
        category: "fx_for_walking",
        character: 9
    },
    pad_glassy: {
        func: "other",
        category: "pad_glassy",
        character: 7
    },
    pad_magnetic_spots: {
        func: "other",
        category: "pad_magnetic_spots",
        character: 7
    },
    strings_dusty_violin: {
        func: "other",
        category: "strings_dusty_violin",
        character: 5
    }
};
var DMAF = DMAF || {};
DMAF.Data = DMAF.Data || {};
DMAF.Data.ProjectData = function() {
    var e = {};
    e.empty_pattern = new DMAF.Processors.BeatPattern("empty_pattern", new DMAF.Processors.BeatPosition(1, 1), new DMAF.Processors.BeatPosition(33, 1));
    var t = function(t, r, i) {
        if (e[t] === undefined) {
            n(t, r, i);
            return
        }
        if (i) {
            if (i === "instantMasterStructure") {
                DMAF.Processors.getMusicController().proceedAddInstantStructure(e[t], r)
            } else {
                if (i === "masterStructure") {
                    DMAF.Processors.getMusicController().proceedAddStructure(e.empty_pattern, e[t], r)
                } else {
                    if (i === "newStructure") {
                        DMAF.Processors.getMusicController().proceedAddPatternNewStructure(e.empty_pattern, e[t], r)
                    }
                }
            }
        } else {
            DMAF.Processors.getMusicController().proceedAddPattern(e[t], r)
        }
    };
    var n = function(t, n, i) {
        function u(e) {
            s = 0;
            var t = e.readTo(4);
            var n = e.read32BitInt();
            return {
                id: t,
                length: n,
                data: e.readTo(n)
            }
        }

        function f(e) {
            var t = {};
            t.absoluteTime = s += e.readVariableLengthInt();
            var n = e.read8BitInt();
            if ((n & 240) == 240) {
                if (n == 255) {
                    t.type = "meta";
                    var r = e.read8BitInt();
                    var i = e.readVariableLengthInt();
                    switch (r) {
                        case 0:
                            t.subtype = "sequenceNumber";
                            if (i != 2) {
                                return
                            }
                            t.number = e.read16BitInt();
                            return t;
                        case 1:
                            t.subtype = "text";
                            t.text = e.readTo(i);
                            return t;
                        case 2:
                            t.subtype = "copyrightNotice";
                            t.text = e.readTo(i);
                            return t;
                        case 3:
                            t.subtype = "trackName";
                            t.text = e.readTo(i);
                            return t;
                        case 4:
                            t.subtype = "instrumentName";
                            t.text = e.readTo(i);
                            return t;
                        case 5:
                            t.subtype = "lyrics";
                            t.text = e.readTo(i);
                            return t;
                        case 6:
                            t.subtype = "marker";
                            t.text = e.readTo(i);
                            return t;
                        case 7:
                            t.subtype = "cuePoint";
                            t.text = e.readTo(i);
                            return t;
                        case 32:
                            t.subtype = "midiChannelPrefix";
                            if (i != 1) {
                                return
                            }
                            t.channel = e.read8BitInt();
                            return t;
                        case 47:
                            t.subtype = "endOfTrack";
                            if (i != 0) {
                                return
                            }
                            return t;
                        case 81:
                            t.subtype = "setTempo";
                            if (i != 3) {
                                return
                            }
                            t.microsecondsPerBeat = (e.read8BitInt() << 16) + (e.read8BitInt() << 8) + e.read8BitInt();
                            return t;
                        case 84:
                            t.subtype = "smpteOffset";
                            if (i != 5) {
                                return
                            }
                            var o = e.read8BitInt();
                            t.frameRate = {
                                0: 24,
                                32: 25,
                                64: 29,
                                96: 30
                            }[o & 96];
                            t.hour = o & 31;
                            t.min = e.read8BitInt();
                            t.sec = e.read8BitInt();
                            t.frame = e.read8BitInt();
                            t.subframe = e.read8BitInt();
                            return t;
                        case 88:
                            t.subtype = "timeSignature";
                            if (i != 4) {
                                return
                            }
                            t.numerator = e.read8BitInt();
                            t.denominator = Math.pow(2, e.read8BitInt());
                            t.metronome = e.read8BitInt();
                            t.thirtyseconds = e.read8BitInt();
                            return t;
                        case 89:
                            t.subtype = "keySignature";
                            if (i != 2) {
                                return
                            }
                            t.key = e.read8BitInt();
                            t.scale = e.read8BitInt();
                            return t;
                        case 127:
                            t.subtype = "sequencerSpecific";
                            t.data = e.readTo(i);
                            return t;
                        default:
                            t.subtype = "unknown";
                            t.data = e.readTo(i);
                            return t
                    }
                    t.data = e.readTo(i);
                    return t
                } else {
                    if (n == 240) {
                        t.type = "sysEx";
                        var i = e.readVariableLengthInt();
                        t.data = e.readTo(i);
                        return t
                    } else {
                        if (n == 247) {
                            t.type = "dividedSysEx";
                            var i = e.readVariableLengthInt();
                            t.data = e.readTo(i);
                            return t
                        } else {
                            t.type = "unknown";
                            var i = e.readVariableLengthInt();
                            t.data = e.readTo(i);
                            DMAF.error("unknown MIDI event type byte of length" + i)
                        }
                    }
                }
            } else {
                var u;
                if ((n & 128) == 0) {
                    u = n;
                    n = a
                } else {
                    u = e.read8BitInt();
                    a = n
                }
                var f = n >> 4;
                t.channel = n & 15;
                t.type = "channel";
                switch (f) {
                    case 8:
                        t.subtype = "noteOff";
                        t.midiNote = u;
                        t.velocity = e.read8BitInt();
                        return t;
                    case 9:
                        t.midiNote = u;
                        t.velocity = e.read8BitInt();
                        if (t.velocity == 0) {
                            t.subtype = "noteOff"
                        } else {
                            t.subtype = "noteOn"
                        }
                        return t;
                    case 10:
                        t.subtype = "noteAftertouch";
                        t.midiNote = u;
                        t.amount = e.read8BitInt();
                        return t;
                    case 11:
                        t.subtype = "controller";
                        t.controllerType = u;
                        t.value = e.read8BitInt();
                        return t;
                    case 12:
                        t.subtype = "programChange";
                        t.programNumber = u;
                        return t;
                    case 13:
                        t.subtype = "channelAftertouch";
                        t.amount = u;
                        return t;
                    case 14:
                        t.subtype = "pitchBend";
                        t.value = u + (e.read8BitInt() << 7);
                        return t;
                    default:
                        t.subtype = "unknown";
                        DMAF.error("Unrecognised MIDI event type: " + f)
                }
            }
        }
        var s = 0;
        var o = t;
        t = t.split("__")[0];
        var a;
        var l = new XMLHttpRequest;
        l.open("GET", DMAF.midiPath + t + ".mid", true);
        l.overrideMimeType("text/plain; charset=x-user-defined");
        l.onload = function(t) {
            if (t.target.status !== 200) {
                return
            }
            var s = t.target.response || "";
            var a = [];
            var l = s.length;
            var h = String.fromCharCode;
            for (var p = 0; p < l; p++) {
                a[p] = h(s.charCodeAt(p) & 255)
            }
            var d = a.join("");
            stream = r(d);
            var v = u(stream);
            if (v.id != "MThd" || v.length != 6) {
                DMAF.error("Found no header in midi file..");
                return
            }
            var y = r(v.data);
            var b = y.read16BitInt();
            var w = y.read16BitInt();
            var E = y.read16BitInt();
            if (E & 32768) {
                O = 480;
                DMAF.error("Time division in SMPTE, defaulting to 480 ticks per beat")
            } else {
                O = E
            }
            var S = {
                formatType: b,
                trackCount: w,
                ticksPerBeat: O
            };
            var x = [];
            for (var T = 0; T < S.trackCount; T++) {
                x[T] = [];
                var N = u(stream);
                if (N.id != "MTrk") {
                    DMAF.error("Expected MTrk but I got " + N.id);
                    return
                }
                var C = r(N.data);
                while (!C.endOfFile()) {
                    var L = f(C);
                    x[T].push(L)
                }
            }
            var A = S.trackCount;
            var O = S.ticksPerBeat;
            for (var M = 1; M < A; M++) {
                var _ = x[M];
                var D = _[0].text;
                if (e[D] !== undefined) {
                    continue
                }
                var P = _[1].text;
                var H = new DMAF.Processors.BeatPattern(D, new DMAF.Processors.BeatPosition(1, 1), new DMAF.Processors.BeatPosition(33, 1));
                for (var B = 2; B < _.length; B++) {
                    if (_[B].subtype === "noteOn") {
                        var j = _[B];
                        var F = j.absoluteTime / O;
                        var I = Math.floor(F / 4) + 1;
                        var q = parseInt(F % 4, 10) + 1;
                        var R = F % 4 * O % O;
                        var U;
                        for (var z = B; z < _.length; z++) {
                            if (_[z].subtype === "noteOff" && _[z].midiNote === j.midiNote || _[z].subtype === "noteOn" && _[z].velocity === 0 && _[z].midiNote === j.midiNote) {
                                U = _[z].absoluteTime - j.absoluteTime;
                                break
                            }
                        }
                        H.addEvent(P, new DMAF.Processors.BeatPosition(I, q, 4, R + 1), {
                            n: j.midiNote,
                            v: j.velocity,
                            t: j.subtype,
                            e: U,
                            c: j.channel
                        })
                    }
                }
                e[D] = H
            }
            if (e[o]) {
                if (i) {
                    if (i === "instantMasterStructure") {
                        DMAF.Processors.getMusicController().proceedAddInstantStructure(e[o], n)
                    } else {
                        if (i === "masterStructure") {
                            DMAF.Processors.getMusicController().proceedAddStructure(e.empty_pattern, e[o], n)
                        } else {
                            if (i === "newStructure") {
                                DMAF.Processors.getMusicController().proceedAddPatternNewStructure(e.empty_pattern, e[o], n)
                            }
                        }
                    }
                } else {
                    DMAF.Processors.getMusicController().proceedAddPattern(e[o], n)
                }
            } else {
                console.error("Got no midi file from file server", o)
            }
        };
        l.send(null)
    };
    var r = function(e) {
        function n() {
            var n = (e.charCodeAt(t) << 24) + (e.charCodeAt(t + 1) << 16) + (e.charCodeAt(t + 2) << 8) + e.charCodeAt(t + 3);
            t += 4;
            return n
        }

        function r() {
            var n = (e.charCodeAt(t) << 8) + e.charCodeAt(t + 1);
            t += 2;
            return n
        }

        function i() {
            var n = e.charCodeAt(t);
            t += 1;
            return n
        }

        function s(n) {
            var r = e.substr(t, n);
            t += n;
            return r
        }

        function o() {
            return t >= e.length
        }

        function u() {
            var e = 0;
            while (true) {
                var t = i();
                if (t & 128) {
                    e += t & 127;
                    e <<= 7
                } else {
                    return e + t
                }
            }
        }
        var t = 0;
        return {
            endOfFile: o,
            readTo: s,
            read32BitInt: n,
            read16BitInt: r,
            read8BitInt: i,
            readVariableLengthInt: u
        }
    };
    var i = ["bass_ac__p1_E_v1", "bass_ac__p1_E_v2", "bass_ac__p1_E_v3", "bass_ac__p1_E_v4", "bass_ac__p1_A_v1", "bass_ac__p1_A_v2", "bass_ac__p1_A_v3", "bass_ac__p1_A_v4", "bass_ac__p1_D_v1", "bass_ac__p1_D_v2", "bass_ac__p1_D_v3", "bass_ac__p1_D_v4", "bass_ac__p2_E_v1", "bass_ac__p2_E_v2", "bass_ac__p2_E_v3", "bass_ac__p2_E_v4", "bass_ac__p2_A_v1", "bass_ac__p2_A_v2", "bass_ac__p2_A_v3", "bass_ac__p2_A_v4", "bass_ac__p2_D_v1", "bass_ac__p2_D_v2", "bass_ac__p2_D_v3", "bass_ac__p2_D_v4", "bass_ac__p3_E_v1", "bass_ac__p3_E_v2", "bass_ac__p3_E_v3", "bass_ac__p3_E_v4", "bass_ac__p3_A_v1", "bass_ac__p3_A_v2", "bass_ac__p3_A_v3", "bass_ac__p3_A_v4", "bass_ac__p3_D_v1", "bass_ac__p3_D_v2", "bass_ac__p3_D_v3", "bass_ac__p3_D_v4", "bass_ac__p4_E_v1", "bass_ac__p4_E_v2", "bass_ac__p4_E_v3", "bass_ac__p4_E_v4", "bass_ac__p4_A_v1", "bass_ac__p4_A_v2", "bass_ac__p4_A_v3", "bass_ac__p4_A_v4", "bass_ac__p4_D_v1", "bass_ac__p4_D_v2", "bass_ac__p4_D_v3", "bass_ac__p4_D_v4", "bass_finger__p1_E_v1", "bass_finger__p1_E_v2", "bass_finger__p1_E_v3", "bass_finger__p1_E_v4", "bass_finger__p1_A_v1", "bass_finger__p1_A_v2", "bass_finger__p1_A_v3", "bass_finger__p1_A_v4", "bass_finger__p1_D_v1", "bass_finger__p1_D_v2", "bass_finger__p1_D_v3", "bass_finger__p1_D_v4", "bass_finger__p2_E_v1", "bass_finger__p2_E_v2", "bass_finger__p2_E_v3", "bass_finger__p2_E_v4", "bass_finger__p2_A_v1", "bass_finger__p2_A_v2", "bass_finger__p2_A_v3", "bass_finger__p2_A_v4", "bass_finger__p2_D_v1", "bass_finger__p2_D_v2", "bass_finger__p2_D_v3", "bass_finger__p2_D_v4", "bass_finger__p3_E_v1", "bass_finger__p3_E_v2", "bass_finger__p3_E_v3", "bass_finger__p3_E_v4", "bass_finger__p3_A_v1", "bass_finger__p3_A_v2", "bass_finger__p3_A_v3", "bass_finger__p3_A_v4", "bass_finger__p3_D_v1", "bass_finger__p3_D_v2", "bass_finger__p3_D_v3", "bass_finger__p3_D_v4", "bass_finger__p4_E_v1", "bass_finger__p4_E_v2", "bass_finger__p4_E_v3", "bass_finger__p4_E_v4", "bass_finger__p4_A_v1", "bass_finger__p4_A_v2", "bass_finger__p4_A_v3", "bass_finger__p4_A_v4", "bass_finger__p4_D_v1", "bass_finger__p4_D_v2", "bass_finger__p4_D_v3", "bass_finger__p4_D_v4", "bass_pick__p1_E_v1", "bass_pick__p1_E_v2", "bass_pick__p1_E_v3", "bass_pick__p1_E_v4", "bass_pick__p1_A_v1", "bass_pick__p1_A_v2", "bass_pick__p1_A_v3", "bass_pick__p1_A_v4", "bass_pick__p1_D_v1", "bass_pick__p1_D_v2", "bass_pick__p1_D_v3", "bass_pick__p1_D_v4", "bass_pick__p2_E_v1", "bass_pick__p2_E_v2", "bass_pick__p2_E_v3", "bass_pick__p2_E_v4", "bass_pick__p2_A_v1", "bass_pick__p2_A_v2", "bass_pick__p2_A_v3", "bass_pick__p2_A_v4", "bass_pick__p2_D_v1", "bass_pick__p2_D_v2", "bass_pick__p2_D_v3", "bass_pick__p2_D_v4", "bass_pick__p3_E_v1", "bass_pick__p3_E_v2", "bass_pick__p3_E_v3", "bass_pick__p3_E_v4", "bass_pick__p3_A_v1", "bass_pick__p3_A_v2", "bass_pick__p3_A_v3", "bass_pick__p3_A_v4", "bass_pick__p3_D_v1", "bass_pick__p3_D_v2", "bass_pick__p3_D_v3", "bass_pick__p3_D_v4", "bass_pick__p4_E_v1", "bass_pick__p4_E_v2", "bass_pick__p4_E_v3", "bass_pick__p4_E_v4", "bass_pick__p4_A_v1", "bass_pick__p4_A_v2", "bass_pick__p4_A_v3", "bass_pick__p4_A_v4", "bass_pick__p4_D_v1", "bass_pick__p4_D_v2", "bass_pick__p4_D_v3", "bass_pick__p4_D_v4", "dm_analogue__p1_pad1", "dm_analogue__p1_pad2", "dm_analogue__p1_pad3", "dm_analogue__p1_pad4", "dm_analogue__p1_pad5", "dm_analogue__p1_pad6", "dm_analogue__p1_pad7", "dm_analogue__p1_pad8", "dm_analogue__p1_pad9", "dm_analogue__p2_pad1", "dm_analogue__p2_pad2", "dm_analogue__p2_pad3", "dm_analogue__p2_pad4", "dm_analogue__p2_pad5", "dm_analogue__p2_pad6", "dm_analogue__p2_pad7", "dm_analogue__p2_pad8", "dm_analogue__p2_pad9", "dm_analogue__p3_pad1", "dm_analogue__p3_pad2", "dm_analogue__p3_pad3", "dm_analogue__p3_pad4", "dm_analogue__p3_pad5", "dm_analogue__p3_pad6", "dm_analogue__p3_pad7", "dm_analogue__p3_pad8", "dm_analogue__p3_pad9", "dm_analogue__p4_pad1", "dm_analogue__p4_pad2", "dm_analogue__p4_pad3", "dm_analogue__p4_pad4", "dm_analogue__p4_pad5", "dm_analogue__p4_pad6", "dm_analogue__p4_pad7", "dm_analogue__p4_pad8", "dm_analogue__p4_pad9", "dm_hiphop__p1_pad1", "dm_hiphop__p1_pad2", "dm_hiphop__p1_pad3", "dm_hiphop__p1_pad4", "dm_hiphop__p1_pad5", "dm_hiphop__p1_pad6", "dm_hiphop__p1_pad7", "dm_hiphop__p1_pad8", "dm_hiphop__p1_pad9", "dm_hiphop__p2_pad1", "dm_hiphop__p2_pad2", "dm_hiphop__p2_pad3", "dm_hiphop__p2_pad4", "dm_hiphop__p2_pad5", "dm_hiphop__p2_pad6", "dm_hiphop__p2_pad7", "dm_hiphop__p2_pad8", "dm_hiphop__p2_pad9", "dm_hiphop__p3_pad1", "dm_hiphop__p3_pad2", "dm_hiphop__p3_pad3", "dm_hiphop__p3_pad4", "dm_hiphop__p3_pad5", "dm_hiphop__p3_pad6", "dm_hiphop__p3_pad7", "dm_hiphop__p3_pad8", "dm_hiphop__p3_pad9", "dm_hiphop__p4_pad1", "dm_hiphop__p4_pad2", "dm_hiphop__p4_pad3", "dm_hiphop__p4_pad4", "dm_hiphop__p4_pad5", "dm_hiphop__p4_pad6", "dm_hiphop__p4_pad7", "dm_hiphop__p4_pad8", "dm_hiphop__p4_pad9", "dm_techno__p1_pad1", "dm_techno__p1_pad2", "dm_techno__p1_pad3", "dm_techno__p1_pad4", "dm_techno__p1_pad5", "dm_techno__p1_pad6", "dm_techno__p1_pad7", "dm_techno__p1_pad8", "dm_techno__p1_pad9", "dm_techno__p2_pad1", "dm_techno__p2_pad2", "dm_techno__p2_pad3", "dm_techno__p2_pad4", "dm_techno__p2_pad5", "dm_techno__p2_pad6", "dm_techno__p2_pad7", "dm_techno__p2_pad8", "dm_techno__p2_pad9", "dm_techno__p3_pad1", "dm_techno__p3_pad2", "dm_techno__p3_pad3", "dm_techno__p3_pad4", "dm_techno__p3_pad5", "dm_techno__p3_pad6", "dm_techno__p3_pad7", "dm_techno__p3_pad8", "dm_techno__p3_pad9", "dm_techno__p4_pad1", "dm_techno__p4_pad2", "dm_techno__p4_pad3", "dm_techno__p4_pad4", "dm_techno__p4_pad5", "dm_techno__p4_pad6", "dm_techno__p4_pad7", "dm_techno__p4_pad8", "dm_techno__p4_pad9", "drums_brushes__p1_kick", "drums_brushes__p1_snare", "drums_brushes__p1_snare_rim", "drums_brushes__p1_hh_closed", "drums_brushes__p1_hh_half", "drums_brushes__p1_hh_open", "drums_brushes__p1_tom_1", "drums_brushes__p1_tom_2", "drums_brushes__p1_tom_3", "drums_brushes__p1_crash", "drums_brushes__p1_ride_edge", "drums_brushes__p1_ride_bell", "drums_brushes__p2_kick", "drums_brushes__p2_snare", "drums_brushes__p2_snare_rim", "drums_brushes__p2_hh_closed", "drums_brushes__p2_hh_half", "drums_brushes__p2_hh_open", "drums_brushes__p2_tom_1", "drums_brushes__p2_tom_2", "drums_brushes__p2_tom_3", "drums_brushes__p2_ride_edge", "drums_brushes__p2_crash", "drums_brushes__p2_ride_bell", "drums_brushes__p3_kick", "drums_brushes__p3_snare", "drums_brushes__p3_snare_rim", "drums_brushes__p3_hh_closed", "drums_brushes__p3_hh_half", "drums_brushes__p3_hh_open", "drums_brushes__p3_tom_1", "drums_brushes__p3_tom_2", "drums_brushes__p3_tom_3", "drums_brushes__p3_crash", "drums_brushes__p3_ride_edge", "drums_brushes__p3_ride_bell", "drums_brushes__p4_kick", "drums_brushes__p4_snare", "drums_brushes__p4_snare_rim", "drums_brushes__p4_hh_closed", "drums_brushes__p4_hh_half", "drums_brushes__p4_hh_open", "drums_brushes__p4_tom_1", "drums_brushes__p4_tom_2", "drums_brushes__p4_tom_3", "drums_brushes__p4_crash", "drums_brushes__p4_ride_edge", "drums_brushes__p4_ride_bell", "drums_standard__p1_kick", "drums_standard__p1_snare", "drums_standard__p1_snare_rim", "drums_standard__p1_hh_closed", "drums_standard__p1_hh_half", "drums_standard__p1_hh_open", "drums_standard__p1_tom_1", "drums_standard__p1_tom_2", "drums_standard__p1_tom_3", "drums_standard__p1_crash", "drums_standard__p1_ride_edge", "drums_standard__p1_ride_bell", "drums_standard__p2_kick", "drums_standard__p2_snare", "drums_standard__p2_snare_rim", "drums_standard__p2_hh_closed", "drums_standard__p2_hh_half", "drums_standard__p2_hh_open", "drums_standard__p2_tom_1", "drums_standard__p2_tom_2", "drums_standard__p2_tom_3", "drums_standard__p2_crash", "drums_standard__p2_ride_edge", "drums_standard__p2_ride_bell", "drums_standard__p3_kick", "drums_standard__p3_snare", "drums_standard__p3_snare_rim", "drums_standard__p3_hh_closed", "drums_standard__p3_hh_half", "drums_standard__p3_hh_open", "drums_standard__p3_tom_1", "drums_standard__p3_tom_2", "drums_standard__p3_tom_3", "drums_standard__p3_crash", "drums_standard__p3_ride_edge", "drums_standard__p3_ride_bell", "drums_standard__p4_kick", "drums_standard__p4_snare", "drums_standard__p4_snare_rim", "drums_standard__p4_hh_closed", "drums_standard__p4_hh_half", "drums_standard__p4_hh_open", "drums_standard__p4_tom_1", "drums_standard__p4_tom_2", "drums_standard__p4_tom_3", "drums_standard__p4_crash", "drums_standard__p4_ride_edge", "drums_standard__p4_ride_bell", "guitar_clean__p1_E_v1", "guitar_clean__p1_E_v2", "guitar_clean__p1_E_v3", "guitar_clean__p1_E_v4", "guitar_clean__p1_E_v5", "guitar_clean__p1_E_v6", "guitar_clean__p1_A_v1", "guitar_clean__p1_A_v2", "guitar_clean__p1_A_v3", "guitar_clean__p1_A_v4", "guitar_clean__p1_A_v5", "guitar_clean__p1_A_v6", "guitar_clean__p1_D_v1", "guitar_clean__p1_D_v2", "guitar_clean__p1_D_v3", "guitar_clean__p1_D_v4", "guitar_clean__p1_D_v5", "guitar_clean__p1_D_v6", "guitar_clean__p2_E_v1", "guitar_clean__p2_E_v2", "guitar_clean__p2_E_v3", "guitar_clean__p2_E_v4", "guitar_clean__p2_E_v5", "guitar_clean__p2_E_v6", "guitar_clean__p2_A_v1", "guitar_clean__p2_A_v2", "guitar_clean__p2_A_v3", "guitar_clean__p2_A_v4", "guitar_clean__p2_A_v5", "guitar_clean__p2_A_v6", "guitar_clean__p2_D_v1", "guitar_clean__p2_D_v2", "guitar_clean__p2_D_v3", "guitar_clean__p2_D_v4", "guitar_clean__p2_D_v5", "guitar_clean__p2_D_v6", "guitar_clean__p3_E_v1", "guitar_clean__p3_E_v2", "guitar_clean__p3_E_v3", "guitar_clean__p3_E_v4", "guitar_clean__p3_E_v5", "guitar_clean__p3_E_v6", "guitar_clean__p3_A_v1", "guitar_clean__p3_A_v2", "guitar_clean__p3_A_v3", "guitar_clean__p3_A_v4", "guitar_clean__p3_A_v5", "guitar_clean__p3_A_v6", "guitar_clean__p3_D_v1", "guitar_clean__p3_D_v2", "guitar_clean__p3_D_v3", "guitar_clean__p3_D_v4", "guitar_clean__p3_D_v5", "guitar_clean__p3_D_v6", "guitar_clean__p4_E_v1", "guitar_clean__p4_E_v2", "guitar_clean__p4_E_v3", "guitar_clean__p4_E_v4", "guitar_clean__p4_E_v5", "guitar_clean__p4_E_v6", "guitar_clean__p4_A_v1", "guitar_clean__p4_A_v2", "guitar_clean__p4_A_v3", "guitar_clean__p4_A_v4", "guitar_clean__p4_A_v5", "guitar_clean__p4_A_v6", "guitar_clean__p4_D_v1", "guitar_clean__p4_D_v2", "guitar_clean__p4_D_v3", "guitar_clean__p4_D_v4", "guitar_clean__p4_D_v5", "guitar_clean__p4_D_v6", "guitar_crunch__p1_E_v1", "guitar_crunch__p1_E_v2", "guitar_crunch__p1_E_v3", "guitar_crunch__p1_E_v4", "guitar_crunch__p1_E_v5", "guitar_crunch__p1_E_v6", "guitar_crunch__p1_A_v1", "guitar_crunch__p1_A_v2", "guitar_crunch__p1_A_v3", "guitar_crunch__p1_A_v4", "guitar_crunch__p1_A_v5", "guitar_crunch__p1_A_v6", "guitar_crunch__p1_D_v1", "guitar_crunch__p1_D_v2", "guitar_crunch__p1_D_v3", "guitar_crunch__p1_D_v4", "guitar_crunch__p1_D_v5", "guitar_crunch__p1_D_v6", "guitar_crunch__p2_E_v1", "guitar_crunch__p2_E_v2", "guitar_crunch__p2_E_v3", "guitar_crunch__p2_E_v4", "guitar_crunch__p2_E_v5", "guitar_crunch__p2_E_v6", "guitar_crunch__p2_A_v1", "guitar_crunch__p2_A_v2", "guitar_crunch__p2_A_v3", "guitar_crunch__p2_A_v4", "guitar_crunch__p2_A_v5", "guitar_crunch__p2_A_v6", "guitar_crunch__p2_D_v1", "guitar_crunch__p2_D_v2", "guitar_crunch__p2_D_v3", "guitar_crunch__p2_D_v4", "guitar_crunch__p2_D_v5", "guitar_crunch__p2_D_v6", "guitar_crunch__p3_E_v1", "guitar_crunch__p3_E_v2", "guitar_crunch__p3_E_v3", "guitar_crunch__p3_E_v4", "guitar_crunch__p3_E_v5", "guitar_crunch__p3_E_v6", "guitar_crunch__p3_A_v1", "guitar_crunch__p3_A_v2", "guitar_crunch__p3_A_v3", "guitar_crunch__p3_A_v4", "guitar_crunch__p3_A_v5", "guitar_crunch__p3_A_v6", "guitar_crunch__p3_D_v1", "guitar_crunch__p3_D_v2", "guitar_crunch__p3_D_v3", "guitar_crunch__p3_D_v4", "guitar_crunch__p3_D_v5", "guitar_crunch__p3_D_v6", "guitar_crunch__p4_E_v1", "guitar_crunch__p4_E_v2", "guitar_crunch__p4_E_v3", "guitar_crunch__p4_E_v4", "guitar_crunch__p4_E_v5", "guitar_crunch__p4_E_v6", "guitar_crunch__p4_A_v1", "guitar_crunch__p4_A_v2", "guitar_crunch__p4_A_v3", "guitar_crunch__p4_A_v4", "guitar_crunch__p4_A_v5", "guitar_crunch__p4_A_v6", "guitar_crunch__p4_D_v1", "guitar_crunch__p4_D_v2", "guitar_crunch__p4_D_v3", "guitar_crunch__p4_D_v4", "guitar_crunch__p4_D_v5", "guitar_crunch__p4_D_v6", "guitar_dist__p1_E_v1", "guitar_dist__p1_E_v2", "guitar_dist__p1_E_v3", "guitar_dist__p1_E_v4", "guitar_dist__p1_E_v5", "guitar_dist__p1_E_v6", "guitar_dist__p1_A_v1", "guitar_dist__p1_A_v2", "guitar_dist__p1_A_v3", "guitar_dist__p1_A_v4", "guitar_dist__p1_A_v5", "guitar_dist__p1_A_v6", "guitar_dist__p1_D_v1", "guitar_dist__p1_D_v2", "guitar_dist__p1_D_v3", "guitar_dist__p1_D_v4", "guitar_dist__p1_D_v5", "guitar_dist__p1_D_v6", "guitar_dist__p2_E_v1", "guitar_dist__p2_E_v2", "guitar_dist__p2_E_v3", "guitar_dist__p2_E_v4", "guitar_dist__p2_E_v5", "guitar_dist__p2_E_v6", "guitar_dist__p2_A_v1", "guitar_dist__p2_A_v2", "guitar_dist__p2_A_v3", "guitar_dist__p2_A_v4", "guitar_dist__p2_A_v5", "guitar_dist__p2_A_v6", "guitar_dist__p2_D_v1", "guitar_dist__p2_D_v2", "guitar_dist__p2_D_v3", "guitar_dist__p2_D_v4", "guitar_dist__p2_D_v5", "guitar_dist__p2_D_v6", "guitar_dist__p3_E_v1", "guitar_dist__p3_E_v2", "guitar_dist__p3_E_v3", "guitar_dist__p3_E_v4", "guitar_dist__p3_E_v5", "guitar_dist__p3_E_v6", "guitar_dist__p3_A_v1", "guitar_dist__p3_A_v2", "guitar_dist__p3_A_v3", "guitar_dist__p3_A_v4", "guitar_dist__p3_A_v5", "guitar_dist__p3_A_v6", "guitar_dist__p3_D_v1", "guitar_dist__p3_D_v2", "guitar_dist__p3_D_v3", "guitar_dist__p3_D_v4", "guitar_dist__p3_D_v5", "guitar_dist__p3_D_v6", "guitar_dist__p4_E_v1", "guitar_dist__p4_E_v2", "guitar_dist__p4_E_v3", "guitar_dist__p4_E_v4", "guitar_dist__p4_E_v5", "guitar_dist__p4_E_v6", "guitar_dist__p4_A_v1", "guitar_dist__p4_A_v2", "guitar_dist__p4_A_v3", "guitar_dist__p4_A_v4", "guitar_dist__p4_A_v5", "guitar_dist__p4_A_v6", "guitar_dist__p4_D_v1", "guitar_dist__p4_D_v2", "guitar_dist__p4_D_v3", "guitar_dist__p4_D_v4", "guitar_dist__p4_D_v5", "guitar_dist__p4_D_v6", "guitar_funky__p1_E_v1", "guitar_funky__p1_E_v2", "guitar_funky__p1_E_v3", "guitar_funky__p1_E_v4", "guitar_funky__p1_E_v5", "guitar_funky__p1_E_v6", "guitar_funky__p1_A_v1", "guitar_funky__p1_A_v2", "guitar_funky__p1_A_v3", "guitar_funky__p1_A_v4", "guitar_funky__p1_A_v5", "guitar_funky__p1_A_v6", "guitar_funky__p1_D_v1", "guitar_funky__p1_D_v2", "guitar_funky__p1_D_v3", "guitar_funky__p1_D_v4", "guitar_funky__p1_D_v5", "guitar_funky__p1_D_v6", "guitar_funky__p2_E_v1", "guitar_funky__p2_E_v2", "guitar_funky__p2_E_v3", "guitar_funky__p2_E_v4", "guitar_funky__p2_E_v5", "guitar_funky__p2_E_v6", "guitar_funky__p2_A_v1", "guitar_funky__p2_A_v2", "guitar_funky__p2_A_v3", "guitar_funky__p2_A_v4", "guitar_funky__p2_A_v5", "guitar_funky__p2_A_v6", "guitar_funky__p2_D_v1", "guitar_funky__p2_D_v2", "guitar_funky__p2_D_v3", "guitar_funky__p2_D_v4", "guitar_funky__p2_D_v5", "guitar_funky__p2_D_v6", "guitar_funky__p3_E_v1", "guitar_funky__p3_E_v2", "guitar_funky__p3_E_v3", "guitar_funky__p3_E_v4", "guitar_funky__p3_E_v5", "guitar_funky__p3_E_v6", "guitar_funky__p3_A_v1", "guitar_funky__p3_A_v2", "guitar_funky__p3_A_v3", "guitar_funky__p3_A_v4", "guitar_funky__p3_A_v5", "guitar_funky__p3_A_v6", "guitar_funky__p3_D_v1", "guitar_funky__p3_D_v2", "guitar_funky__p3_D_v3", "guitar_funky__p3_D_v4", "guitar_funky__p3_D_v5", "guitar_funky__p3_D_v6", "guitar_funky__p4_E_v1", "guitar_funky__p4_E_v2", "guitar_funky__p4_E_v3", "guitar_funky__p4_E_v4", "guitar_funky__p4_E_v5", "guitar_funky__p4_E_v6", "guitar_funky__p4_A_v1", "guitar_funky__p4_A_v2", "guitar_funky__p4_A_v3", "guitar_funky__p4_A_v4", "guitar_funky__p4_A_v5", "guitar_funky__p4_A_v6", "guitar_funky__p4_D_v1", "guitar_funky__p4_D_v2", "guitar_funky__p4_D_v3", "guitar_funky__p4_D_v4", "guitar_funky__p4_D_v5", "guitar_funky__p4_D_v6", "guitar_nylon__p1_E_v1", "guitar_nylon__p1_E_v2", "guitar_nylon__p1_E_v3", "guitar_nylon__p1_E_v4", "guitar_nylon__p1_E_v5", "guitar_nylon__p1_E_v6", "guitar_nylon__p1_A_v1", "guitar_nylon__p1_A_v2", "guitar_nylon__p1_A_v3", "guitar_nylon__p1_A_v4", "guitar_nylon__p1_A_v5", "guitar_nylon__p1_A_v6", "guitar_nylon__p1_D_v1", "guitar_nylon__p1_D_v2", "guitar_nylon__p1_D_v3", "guitar_nylon__p1_D_v4", "guitar_nylon__p1_D_v5", "guitar_nylon__p1_D_v6", "guitar_nylon__p2_E_v1", "guitar_nylon__p2_E_v2", "guitar_nylon__p2_E_v3", "guitar_nylon__p2_E_v4", "guitar_nylon__p2_E_v5", "guitar_nylon__p2_E_v6", "guitar_nylon__p2_A_v1", "guitar_nylon__p2_A_v2", "guitar_nylon__p2_A_v3", "guitar_nylon__p2_A_v4", "guitar_nylon__p2_A_v5", "guitar_nylon__p2_A_v6", "guitar_nylon__p2_D_v1", "guitar_nylon__p2_D_v2", "guitar_nylon__p2_D_v3", "guitar_nylon__p2_D_v4", "guitar_nylon__p2_D_v5", "guitar_nylon__p2_D_v6", "guitar_nylon__p3_E_v1", "guitar_nylon__p3_E_v2", "guitar_nylon__p3_E_v3", "guitar_nylon__p3_E_v4", "guitar_nylon__p3_E_v5", "guitar_nylon__p3_E_v6", "guitar_nylon__p3_A_v1", "guitar_nylon__p3_A_v2", "guitar_nylon__p3_A_v3", "guitar_nylon__p3_A_v4", "guitar_nylon__p3_A_v5", "guitar_nylon__p3_A_v6", "guitar_nylon__p3_D_v1", "guitar_nylon__p3_D_v2", "guitar_nylon__p3_D_v3", "guitar_nylon__p3_D_v4", "guitar_nylon__p3_D_v5", "guitar_nylon__p3_D_v6", "guitar_nylon__p4_E_v1", "guitar_nylon__p4_E_v2", "guitar_nylon__p4_E_v3", "guitar_nylon__p4_E_v4", "guitar_nylon__p4_E_v5", "guitar_nylon__p4_E_v6", "guitar_nylon__p4_A_v1", "guitar_nylon__p4_A_v2", "guitar_nylon__p4_A_v3", "guitar_nylon__p4_A_v4", "guitar_nylon__p4_A_v5", "guitar_nylon__p4_A_v6", "guitar_nylon__p4_D_v1", "guitar_nylon__p4_D_v2", "guitar_nylon__p4_D_v3", "guitar_nylon__p4_D_v4", "guitar_nylon__p4_D_v5", "guitar_nylon__p4_D_v6", "guitar_steel__p1_E_v1", "guitar_steel__p1_E_v2", "guitar_steel__p1_E_v3", "guitar_steel__p1_E_v4", "guitar_steel__p1_E_v5", "guitar_steel__p1_E_v6", "guitar_steel__p1_A_v1", "guitar_steel__p1_A_v2", "guitar_steel__p1_A_v3", "guitar_steel__p1_A_v4", "guitar_steel__p1_A_v5", "guitar_steel__p1_A_v6", "guitar_steel__p1_D_v1", "guitar_steel__p1_D_v2", "guitar_steel__p1_D_v3", "guitar_steel__p1_D_v4", "guitar_steel__p1_D_v5", "guitar_steel__p1_D_v6", "guitar_steel__p2_E_v1", "guitar_steel__p2_E_v2", "guitar_steel__p2_E_v3", "guitar_steel__p2_E_v4", "guitar_steel__p2_E_v5", "guitar_steel__p2_E_v6", "guitar_steel__p2_A_v1", "guitar_steel__p2_A_v2", "guitar_steel__p2_A_v3", "guitar_steel__p2_A_v4", "guitar_steel__p2_A_v5", "guitar_steel__p2_A_v6", "guitar_steel__p2_D_v1", "guitar_steel__p2_D_v2", "guitar_steel__p2_D_v3", "guitar_steel__p2_D_v4", "guitar_steel__p2_D_v5", "guitar_steel__p2_D_v6", "guitar_steel__p3_E_v1", "guitar_steel__p3_E_v2", "guitar_steel__p3_E_v3", "guitar_steel__p3_E_v4", "guitar_steel__p3_E_v5", "guitar_steel__p3_E_v6", "guitar_steel__p3_A_v1", "guitar_steel__p3_A_v2", "guitar_steel__p3_A_v3", "guitar_steel__p3_A_v4", "guitar_steel__p3_A_v5", "guitar_steel__p3_A_v6", "guitar_steel__p3_D_v1", "guitar_steel__p3_D_v2", "guitar_steel__p3_D_v3", "guitar_steel__p3_D_v4", "guitar_steel__p3_D_v5", "guitar_steel__p3_D_v6", "guitar_steel__p4_E_v1", "guitar_steel__p4_E_v2", "guitar_steel__p4_E_v3", "guitar_steel__p4_E_v4", "guitar_steel__p4_E_v5", "guitar_steel__p4_E_v6", "guitar_steel__p4_A_v1", "guitar_steel__p4_A_v2", "guitar_steel__p4_A_v3", "guitar_steel__p4_A_v4", "guitar_steel__p4_A_v5", "guitar_steel__p4_A_v6", "guitar_steel__p4_D_v1", "guitar_steel__p4_D_v2", "guitar_steel__p4_D_v3", "guitar_steel__p4_D_v4", "guitar_steel__p4_D_v5", "guitar_steel__p4_D_v6", "hh_lock__4", "hh_lock__8", "hh_lock__16", "key_brass__p1_v1", "key_brass__p1_v2", "key_brass__p1_v3", "key_brass__p2_v1", "key_brass__p2_v2", "key_brass__p2_v3", "key_brass__p3_v1", "key_brass__p3_v2", "key_brass__p3_v3", "key_brass__p4_v1", "key_brass__p4_v2", "key_brass__p4_v3", "key_epiano__p1_v1", "key_epiano__p1_v2", "key_epiano__p1_v3", "key_epiano__p2_v1", "key_epiano__p2_v2", "key_epiano__p2_v3", "key_epiano__p3_v1", "key_epiano__p3_v2", "key_epiano__p3_v3", "key_epiano__p4_v1", "key_epiano__p4_v2", "key_epiano__p4_v3", "key_piano__p1_v1", "key_piano__p1_v2", "key_piano__p1_v3", "key_piano__p2_v1", "key_piano__p2_v2", "key_piano__p2_v3", "key_piano__p3_v1", "key_piano__p3_v2", "key_piano__p3_v3", "key_piano__p4_v1", "key_piano__p4_v2", "key_piano__p4_v3", "key_seq__p1_v1", "key_seq__p1_v2", "key_seq__p1_v3", "key_seq__p2_v1", "key_seq__p2_v2", "key_seq__p2_v3", "key_seq__p3_v1", "key_seq__p3_v2", "key_seq__p3_v3", "key_seq__p4_v1", "key_seq__p4_v2", "key_seq__p4_v3", "key_strings__p1_v1", "key_strings__p1_v2", "key_strings__p1_v3", "key_strings__p2_v1", "key_strings__p2_v2", "key_strings__p2_v3", "key_strings__p3_v1", "key_strings__p3_v2", "key_strings__p3_v3", "key_strings__p4_v1", "key_strings__p4_v2", "key_strings__p4_v3", "metronome", "apanlaban"];
    return {
        getPattern: t,
        availablePatterns: i
    }
};
var DMAF = DMAF || {};
DMAF.Data = DMAF.Data || {};
DMAF.Data.SampleMap = {
    bass_acoustic_hard_1: {
        range_1: {
            sampleGain: "-5",
            lowEnd: "E1",
            highEnd: "Gs1",
            sample: "bass_acoustic_hard_1_2",
            baseNote: "Fs1"
        },
        range_2: {
            sampleGain: "-3",
            lowEnd: "A1",
            highEnd: "B2",
            sample: "bass_acoustic_hard_1_7",
            baseNote: "B1"
        }
    },
    bass_acoustic_hard_2: {
        range_1: {
            sampleGain: "-3",
            lowEnd: "A1",
            highEnd: "Cs2",
            sample: "bass_acoustic_hard_2_2",
            baseNote: "B1"
        },
        range_2: {
            sampleGain: "-3",
            lowEnd: "D2",
            highEnd: "E3",
            sample: "bass_acoustic_hard_2_7",
            baseNote: "E2"
        }
    },
    bass_acoustic_hard_3: {
        range_1: {
            sampleGain: "-3",
            lowEnd: "D2",
            highEnd: "Fs2",
            sample: "bass_acoustic_hard_3_2",
            baseNote: "E2"
        },
        range_2: {
            sampleGain: "-3",
            lowEnd: "G2",
            highEnd: "A3",
            sample: "bass_acoustic_hard_3_7",
            baseNote: "A2"
        }
    },
    bass_acoustic_hard_4: {
        range_1: {
            sampleGain: "-3",
            lowEnd: "G2",
            highEnd: "B2",
            sample: "bass_acoustic_hard_4_2",
            baseNote: "A2"
        },
        range_2: {
            sampleGain: "-3",
            lowEnd: "C3",
            highEnd: "C4",
            sample: "bass_acoustic_hard_4_7",
            baseNote: "D3"
        }
    },
    bass_acoustic_soft_1: {
        range_1: {
            sampleGain: "1",
            lowEnd: "E1",
            highEnd: "Gs1",
            sample: "bass_acoustic_soft_1_2",
            baseNote: "Fs1"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "A1",
            highEnd: "B2",
            sample: "bass_acoustic_soft_1_7",
            baseNote: "B1"
        }
    },
    bass_acoustic_soft_2: {
        range_1: {
            sampleGain: "3",
            lowEnd: "A1",
            highEnd: "Cs2",
            sample: "bass_acoustic_soft_2_2",
            baseNote: "B1"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "D2",
            highEnd: "E3",
            sample: "bass_acoustic_soft_2_7",
            baseNote: "E2"
        }
    },
    bass_acoustic_soft_3: {
        range_1: {
            sampleGain: "3",
            lowEnd: "D2",
            highEnd: "Fs2",
            sample: "bass_acoustic_soft_3_2",
            baseNote: "E2"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "G2",
            highEnd: "A3",
            sample: "bass_acoustic_soft_3_7",
            baseNote: "A2"
        }
    },
    bass_acoustic_soft_4: {
        range_1: {
            sampleGain: "3",
            lowEnd: "G2",
            highEnd: "B2",
            sample: "bass_acoustic_soft_4_2",
            baseNote: "A2"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "C3",
            highEnd: "C4",
            sample: "bass_acoustic_soft_4_7",
            baseNote: "D3"
        }
    },
    bass_acoustic_damped_1: {
        range_1: {
            lowEnd: "E-2",
            highEnd: "Gs-2",
            sample: "bass_acoustic_damped_1_2",
            baseNote: "Fs-2"
        },
        range_2: {
            lowEnd: "A-2",
            highEnd: "B-1",
            sample: "bass_acoustic_damped_1_7",
            baseNote: "B-2"
        }
    },
    bass_acoustic_damped_2: {
        range_1: {
            lowEnd: "A-2",
            highEnd: "Cs-1",
            sample: "bass_acoustic_damped_2_2",
            baseNote: "B-2"
        },
        range_2: {
            lowEnd: "D-1",
            highEnd: "E0",
            sample: "bass_acoustic_damped_2_7",
            baseNote: "E-1"
        }
    },
    bass_acoustic_damped_3: {
        range_1: {
            lowEnd: "D-1",
            highEnd: "Fs-1",
            sample: "bass_acoustic_damped_3_2",
            baseNote: "E-1"
        },
        range_2: {
            lowEnd: "G-1",
            highEnd: "A0",
            sample: "bass_acoustic_damped_3_7",
            baseNote: "A-1"
        }
    },
    bass_acoustic_damped_4: {
        range_1: {
            lowEnd: "G-1",
            highEnd: "B-1",
            sample: "bass_acoustic_damped_4_2",
            baseNote: "A-1"
        },
        range_2: {
            lowEnd: "C0",
            highEnd: "D1",
            sample: "bass_acoustic_damped_4_7",
            baseNote: "D0"
        }
    },
    bass_acoustic_short_1: {
        range_1: {
            lowEnd: "E4",
            highEnd: "Gs4",
            sample: "bass_acoustic_short_1_2",
            baseNote: "Fs4"
        },
        range_2: {
            lowEnd: "A4",
            highEnd: "B5",
            sample: "bass_acoustic_short_1_7",
            baseNote: "B4"
        }
    },
    bass_acoustic_short_2: {
        range_1: {
            lowEnd: "A4",
            highEnd: "Cs5",
            sample: "bass_acoustic_short_2_2",
            baseNote: "B4"
        },
        range_2: {
            lowEnd: "D5",
            highEnd: "E6",
            sample: "bass_acoustic_short_2_7",
            baseNote: "E5"
        }
    },
    bass_acoustic_short_3: {
        range_1: {
            lowEnd: "D5",
            highEnd: "Fs5",
            sample: "bass_acoustic_short_3_2",
            baseNote: "E5"
        },
        range_2: {
            lowEnd: "G5",
            highEnd: "A6",
            sample: "bass_acoustic_short_3_7",
            baseNote: "A5"
        }
    },
    bass_acoustic_short_4: {
        range_1: {
            lowEnd: "G5",
            highEnd: "B5",
            sample: "bass_acoustic_short_4_2",
            baseNote: "A5"
        },
        range_2: {
            lowEnd: "C6",
            highEnd: "D7",
            sample: "bass_acoustic_short_4_7",
            baseNote: "D6"
        }
    },
    bass_acoustic_legato_1: {
        range_1: {
            lowEnd: "E1",
            highEnd: "Gs1",
            sample: "bass_acoustic_soft_1_2",
            baseNote: "Fs1"
        },
        range_2: {
            lowEnd: "A1",
            highEnd: "B2",
            sample: "bass_acoustic_soft_1_7",
            baseNote: "B1"
        }
    },
    bass_acoustic_legato_2: {
        range_1: {
            lowEnd: "A1",
            highEnd: "Cs2",
            sample: "bass_acoustic_soft_2_2",
            baseNote: "B1"
        },
        range_2: {
            lowEnd: "D2",
            highEnd: "E3",
            sample: "bass_acoustic_soft_2_7",
            baseNote: "E2"
        }
    },
    bass_acoustic_legato_3: {
        range_1: {
            lowEnd: "D2",
            highEnd: "Fs2",
            sample: "bass_acoustic_soft_3_2",
            baseNote: "E2"
        },
        range_2: {
            lowEnd: "G2",
            highEnd: "A3",
            sample: "bass_acoustic_soft_3_7",
            baseNote: "A2"
        }
    },
    bass_acoustic_legato_4: {
        range_1: {
            lowEnd: "G2",
            highEnd: "B2",
            sample: "bass_acoustic_soft_4_2",
            baseNote: "A2"
        },
        range_2: {
            lowEnd: "C3",
            highEnd: "C4",
            sample: "bass_acoustic_soft_4_7",
            baseNote: "D3"
        }
    },
    bass_finger_hard_1: {
        range_1: {
            lowEnd: "E1",
            highEnd: "Gs1",
            sample: "bass_finger_hard_1_2",
            baseNote: "Fs1"
        },
        range_2: {
            lowEnd: "A1",
            highEnd: "B2",
            sample: "bass_finger_hard_1_7",
            baseNote: "B1"
        }
    },
    bass_finger_hard_2: {
        range_1: {
            lowEnd: "A1",
            highEnd: "Cs2",
            sample: "bass_finger_hard_2_2",
            baseNote: "B1"
        },
        range_2: {
            lowEnd: "D2",
            highEnd: "E3",
            sample: "bass_finger_hard_2_7",
            baseNote: "E2"
        }
    },
    bass_finger_hard_3: {
        range_1: {
            lowEnd: "D2",
            highEnd: "Fs2",
            sample: "bass_finger_hard_3_2",
            baseNote: "E2"
        },
        range_2: {
            lowEnd: "G2",
            highEnd: "A3",
            sample: "bass_finger_hard_3_7",
            baseNote: "A2"
        }
    },
    bass_finger_hard_4: {
        range_1: {
            lowEnd: "G2",
            highEnd: "B2",
            sample: "bass_finger_hard_4_2",
            baseNote: "A2"
        },
        range_2: {
            lowEnd: "C3",
            highEnd: "D4",
            sample: "bass_finger_hard_4_7",
            baseNote: "D3"
        }
    },
    bass_finger_soft_1: {
        range_1: {
            sampleGain: "3",
            lowEnd: "E1",
            highEnd: "Gs1",
            sample: "bass_finger_soft_1_2",
            baseNote: "Fs1"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "A1",
            highEnd: "B2",
            sample: "bass_finger_soft_1_7",
            baseNote: "B1"
        }
    },
    bass_finger_soft_2: {
        range_1: {
            sampleGain: "3",
            lowEnd: "A1",
            highEnd: "Cs2",
            sample: "bass_finger_soft_2_2",
            baseNote: "B1"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "D2",
            highEnd: "E3",
            sample: "bass_finger_soft_2_7",
            baseNote: "E2"
        }
    },
    bass_finger_soft_3: {
        range_1: {
            sampleGain: "3",
            lowEnd: "D2",
            highEnd: "Fs2",
            sample: "bass_finger_soft_3_2",
            baseNote: "E2"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "G2",
            highEnd: "A3",
            sample: "bass_finger_soft_3_7",
            baseNote: "A2"
        }
    },
    bass_finger_soft_4: {
        range_1: {
            sampleGain: "3",
            lowEnd: "G2",
            highEnd: "B2",
            sample: "bass_finger_soft_4_2",
            baseNote: "A2"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "C3",
            highEnd: "D4",
            sample: "bass_finger_soft_4_7",
            baseNote: "D3"
        }
    },
    bass_finger_damped_1: {
        range_1: {
            lowEnd: "E-2",
            highEnd: "Gs-2",
            sample: "bass_finger_damped_1_2",
            baseNote: "Fs-2"
        },
        range_2: {
            lowEnd: "A-2",
            highEnd: "B-1",
            sample: "bass_finger_damped_1_7",
            baseNote: "B-2"
        }
    },
    bass_finger_damped_2: {
        range_1: {
            lowEnd: "A-2",
            highEnd: "Cs-1",
            sample: "bass_finger_damped_2_2",
            baseNote: "B-2"
        },
        range_2: {
            lowEnd: "D-1",
            highEnd: "E0",
            sample: "bass_finger_damped_2_7",
            baseNote: "E-1"
        }
    },
    bass_finger_damped_3: {
        range_1: {
            lowEnd: "D-1",
            highEnd: "Fs-1",
            sample: "bass_finger_damped_3_2",
            baseNote: "E-1"
        },
        range_2: {
            lowEnd: "G-1",
            highEnd: "A0",
            sample: "bass_finger_damped_3_7",
            baseNote: "A-1"
        }
    },
    bass_finger_damped_4: {
        range_1: {
            lowEnd: "G-1",
            highEnd: "B-1",
            sample: "bass_finger_damped_4_2",
            baseNote: "A-1"
        },
        range_2: {
            lowEnd: "C0",
            highEnd: "D1",
            sample: "bass_finger_damped_4_7",
            baseNote: "D0"
        }
    },
    bass_finger_short_1: {
        range_1: {
            sampleGain: "2",
            lowEnd: "E4",
            highEnd: "Gs4",
            sample: "bass_finger_short_1_2",
            baseNote: "Fs4"
        },
        range_2: {
            sampleGain: "2",
            lowEnd: "A4",
            highEnd: "B5",
            sample: "bass_finger_short_1_7",
            baseNote: "B4"
        }
    },
    bass_finger_short_2: {
        range_1: {
            sampleGain: "2",
            lowEnd: "A4",
            highEnd: "Cs5",
            sample: "bass_finger_short_2_2",
            baseNote: "B4"
        },
        range_2: {
            sampleGain: "2",
            lowEnd: "D5",
            highEnd: "E6",
            sample: "bass_finger_short_2_7",
            baseNote: "E5"
        }
    },
    bass_finger_short_3: {
        range_1: {
            sampleGain: "2",
            lowEnd: "D5",
            highEnd: "Fs5",
            sample: "bass_finger_short_3_2",
            baseNote: "E5"
        },
        range_2: {
            sampleGain: "2",
            lowEnd: "G5",
            highEnd: "A6",
            sample: "bass_finger_short_3_7",
            baseNote: "A5"
        }
    },
    bass_finger_short_4: {
        range_1: {
            sampleGain: "2",
            lowEnd: "G5",
            highEnd: "B5",
            sample: "bass_finger_short_4_2",
            baseNote: "A5"
        },
        range_2: {
            sampleGain: "2",
            lowEnd: "C6",
            highEnd: "D7",
            sample: "bass_finger_short_4_7",
            baseNote: "D6"
        }
    },
    bass_finger_legato_1: {
        range_1: {
            lowEnd: "E1",
            highEnd: "Gs1",
            sample: "bass_finger_legato_1_2",
            baseNote: "Fs1"
        },
        range_2: {
            lowEnd: "A1",
            highEnd: "B2",
            sample: "bass_finger_legato_1_7",
            baseNote: "B1"
        }
    },
    bass_finger_legato_2: {
        range_1: {
            lowEnd: "A1",
            highEnd: "Cs2",
            sample: "bass_finger_legato_2_2",
            baseNote: "B1"
        },
        range_2: {
            lowEnd: "D2",
            highEnd: "E3",
            sample: "bass_finger_legato_2_7",
            baseNote: "E2"
        }
    },
    bass_finger_legato_3: {
        range_1: {
            lowEnd: "D2",
            highEnd: "Fs2",
            sample: "bass_finger_legato_3_2",
            baseNote: "E2"
        },
        range_2: {
            lowEnd: "G2",
            highEnd: "A3",
            sample: "bass_finger_legato_3_7",
            baseNote: "A2"
        }
    },
    bass_finger_legato_4: {
        range_1: {
            lowEnd: "G2",
            highEnd: "B2",
            sample: "bass_finger_legato_4_2",
            baseNote: "A2"
        },
        range_2: {
            lowEnd: "C3",
            highEnd: "D4",
            sample: "bass_finger_legato_4_7",
            baseNote: "D3"
        }
    },
    bass_pick_hard_1: {
        range_1: {
            lowEnd: "E1",
            highEnd: "Gs1",
            sample: "bass_pick_hard_1_2",
            baseNote: "Fs1"
        },
        range_2: {
            lowEnd: "A1",
            highEnd: "B2",
            sample: "bass_pick_hard_1_7",
            baseNote: "B1"
        }
    },
    bass_pick_hard_2: {
        range_1: {
            lowEnd: "A1",
            highEnd: "Cs2",
            sample: "bass_pick_hard_2_2",
            baseNote: "B1"
        },
        range_2: {
            lowEnd: "D2",
            highEnd: "E3",
            sample: "bass_pick_hard_2_7",
            baseNote: "E2"
        }
    },
    bass_pick_hard_3: {
        range_1: {
            lowEnd: "D2",
            highEnd: "Fs2",
            sample: "bass_pick_hard_3_2",
            baseNote: "E2"
        },
        range_2: {
            lowEnd: "G2",
            highEnd: "A3",
            sample: "bass_pick_hard_3_7",
            baseNote: "A2"
        }
    },
    bass_pick_hard_4: {
        range_1: {
            lowEnd: "G2",
            highEnd: "B2",
            sample: "bass_pick_hard_4_2",
            baseNote: "A2"
        },
        range_2: {
            lowEnd: "C3",
            highEnd: "D4",
            sample: "bass_pick_hard_4_7",
            baseNote: "D3"
        }
    },
    bass_pick_soft_1: {
        range_1: {
            sampleGain: "3",
            lowEnd: "E1",
            highEnd: "Gs1",
            sample: "bass_pick_soft_1_2",
            baseNote: "Fs1"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "A1",
            highEnd: "B2",
            sample: "bass_pick_soft_1_7",
            baseNote: "B1"
        }
    },
    bass_pick_soft_2: {
        range_1: {
            sampleGain: "3",
            lowEnd: "A1",
            highEnd: "Cs2",
            sample: "bass_pick_soft_2_2",
            baseNote: "B1"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "D2",
            highEnd: "E3",
            sample: "bass_pick_soft_2_7",
            baseNote: "E2"
        }
    },
    bass_pick_soft_3: {
        range_1: {
            sampleGain: "3",
            lowEnd: "D2",
            highEnd: "Fs2",
            sample: "bass_pick_soft_3_2",
            baseNote: "E2"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "G2",
            highEnd: "A3",
            sample: "bass_pick_soft_3_7",
            baseNote: "A2"
        }
    },
    bass_pick_soft_4: {
        range_1: {
            sampleGain: "3",
            lowEnd: "G2",
            highEnd: "B2",
            sample: "bass_pick_soft_4_2",
            baseNote: "A2"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "C3",
            highEnd: "D4",
            sample: "bass_pick_soft_4_7",
            baseNote: "D3"
        }
    },
    bass_pick_damped_1: {
        range_1: {
            lowEnd: "E-2",
            highEnd: "Gs-2",
            sample: "bass_pick_damped_1_2",
            baseNote: "Fs-2"
        },
        range_2: {
            lowEnd: "A-2",
            highEnd: "B-1",
            sample: "bass_pick_damped_1_7",
            baseNote: "B-2"
        }
    },
    bass_pick_damped_2: {
        range_1: {
            lowEnd: "A-2",
            highEnd: "Cs-1",
            sample: "bass_pick_damped_2_2",
            baseNote: "B-2"
        },
        range_2: {
            lowEnd: "D-1",
            highEnd: "E0",
            sample: "bass_pick_damped_2_7",
            baseNote: "E-1"
        }
    },
    bass_pick_damped_3: {
        range_1: {
            lowEnd: "D-1",
            highEnd: "Fs-1",
            sample: "bass_pick_damped_3_2",
            baseNote: "E-1"
        },
        range_2: {
            lowEnd: "G-1",
            highEnd: "A0",
            sample: "bass_pick_damped_3_7",
            baseNote: "A-1"
        }
    },
    bass_pick_damped_4: {
        range_1: {
            lowEnd: "G-1",
            highEnd: "B-1",
            sample: "bass_pick_damped_4_2",
            baseNote: "A-1"
        },
        range_2: {
            lowEnd: "C0",
            highEnd: "D1",
            sample: "bass_pick_damped_4_7",
            baseNote: "D0"
        }
    },
    bass_pick_muted_1: {
        range_1: {
            lowEnd: "E4",
            highEnd: "Gs4",
            sample: "bass_pick_muted_1_2",
            baseNote: "Fs4"
        },
        range_2: {
            lowEnd: "A4",
            highEnd: "B5",
            sample: "bass_pick_muted_1_7",
            baseNote: "B4"
        }
    },
    bass_pick_muted_2: {
        range_1: {
            lowEnd: "A4",
            highEnd: "Cs5",
            sample: "bass_pick_muted_2_2",
            baseNote: "B4"
        },
        range_2: {
            lowEnd: "D5",
            highEnd: "E6",
            sample: "bass_pick_muted_2_7",
            baseNote: "E5"
        }
    },
    bass_pick_muted_3: {
        range_1: {
            lowEnd: "D5",
            highEnd: "Fs5",
            sample: "bass_pick_muted_3_2",
            baseNote: "E5"
        },
        range_2: {
            lowEnd: "G5",
            highEnd: "A6",
            sample: "bass_pick_muted_3_7",
            baseNote: "A5"
        }
    },
    bass_pick_muted_4: {
        range_1: {
            lowEnd: "G5",
            highEnd: "B5",
            sample: "bass_pick_muted_4_2",
            baseNote: "A5"
        },
        range_2: {
            lowEnd: "C6",
            highEnd: "D7",
            sample: "bass_pick_muted_4_7",
            baseNote: "D6"
        }
    },
    bass_pick_legato_1: {
        range_1: {
            lowEnd: "E1",
            highEnd: "Gs1",
            sample: "bass_pick_legato_1_2",
            baseNote: "Fs1"
        },
        range_2: {
            lowEnd: "A1",
            highEnd: "B2",
            sample: "bass_pick_legato_1_7",
            baseNote: "B1"
        }
    },
    bass_pick_legato_2: {
        range_1: {
            lowEnd: "A1",
            highEnd: "Cs2",
            sample: "bass_pick_legato_2_2",
            baseNote: "B1"
        },
        range_2: {
            lowEnd: "D2",
            highEnd: "E3",
            sample: "bass_pick_legato_2_7",
            baseNote: "E2"
        }
    },
    bass_pick_legato_3: {
        range_1: {
            lowEnd: "D2",
            highEnd: "Fs2",
            sample: "bass_pick_legato_3_2",
            baseNote: "E2"
        },
        range_2: {
            lowEnd: "G2",
            highEnd: "A3",
            sample: "bass_pick_legato_3_7",
            baseNote: "A2"
        }
    },
    bass_pick_legato_4: {
        range_1: {
            lowEnd: "G2",
            highEnd: "B2",
            sample: "bass_pick_legato_4_2",
            baseNote: "A2"
        },
        range_2: {
            lowEnd: "C3",
            highEnd: "D4",
            sample: "bass_pick_legato_4_7",
            baseNote: "D3"
        }
    },
    dm_analogue: {
        range_1: {
            lowEnd: "C0",
            highEnd: "C0",
            sample: "dm_analogue_kick",
            baseNote: "C0"
        },
        range_2: {
            lowEnd: "Cs0",
            highEnd: "Cs0",
            sample: "dm_analogue_snare",
            baseNote: "Cs0"
        },
        range_3: {
            lowEnd: "D0",
            highEnd: "D0",
            sample: "dm_analogue_cowbell",
            baseNote: "D0"
        },
        range_4: {
            lowEnd: "Ds0",
            highEnd: "Ds0",
            sample: "dm_analogue_hihat",
            baseNote: "Ds0"
        },
        range_5: {
            lowEnd: "E0",
            highEnd: "E0",
            sample: "dm_analogue_tom_3",
            baseNote: "E0"
        },
        range_6: {
            lowEnd: "F0",
            highEnd: "F0",
            sample: "dm_analogue_clave",
            baseNote: "F0"
        },
        range_7: {
            lowEnd: "Fs0",
            highEnd: "Fs0",
            sample: "dm_analogue_tom_2",
            baseNote: "Fs0"
        },
        range_8: {
            lowEnd: "G0",
            highEnd: "G0",
            sample: "dm_analogue_tom_1",
            baseNote: "G0"
        },
        range_9: {
            lowEnd: "Gs0",
            highEnd: "Gs0",
            sample: "dm_analogue_crash",
            baseNote: "Gs0"
        }
    },
    dm_hiphop: {
        range_1: {
            lowEnd: "C0",
            highEnd: "C0",
            sample: "dm_hiphop_kick",
            baseNote: "C0"
        },
        range_2: {
            lowEnd: "Cs0",
            highEnd: "Cs0",
            sample: "dm_hiphop_snare",
            baseNote: "Cs0"
        },
        range_3: {
            lowEnd: "D0",
            highEnd: "D0",
            sample: "dm_hiphop_clap",
            baseNote: "D0"
        },
        range_4: {
            lowEnd: "Ds0",
            highEnd: "Ds0",
            sample: "dm_hiphop_hihat",
            baseNote: "Ds0"
        },
        range_5: {
            lowEnd: "E0",
            highEnd: "E0",
            sample: "dm_hiphop_shaker",
            baseNote: "E0"
        },
        range_6: {
            lowEnd: "F0",
            highEnd: "F0",
            sample: "dm_hiphop_block",
            baseNote: "F0"
        },
        range_7: {
            lowEnd: "Fs0",
            highEnd: "Fs0",
            sample: "dm_hiphop_tom",
            baseNote: "Fs0"
        },
        range_8: {
            lowEnd: "G0",
            highEnd: "G0",
            sample: "dm_hiphop_hit",
            baseNote: "G0"
        },
        range_9: {
            lowEnd: "Gs0",
            highEnd: "Gs0",
            sample: "dm_hiphop_crash",
            baseNote: "Gs0"
        }
    },
    dm_techno: {
        range_1: {
            lowEnd: "C0",
            highEnd: "C0",
            sample: "dm_techno_kick",
            baseNote: "C0"
        },
        range_2: {
            lowEnd: "Cs0",
            highEnd: "Cs0",
            sample: "dm_techno_snare",
            baseNote: "Cs0"
        },
        range_3: {
            lowEnd: "D0",
            highEnd: "D0",
            sample: "dm_techno_clap",
            baseNote: "D0"
        },
        range_4: {
            lowEnd: "Ds0",
            highEnd: "Ds0",
            sample: "dm_techno_hihat",
            baseNote: "Ds0"
        },
        range_5: {
            lowEnd: "E0",
            highEnd: "E0",
            sample: "dm_techno_shaker",
            baseNote: "E0"
        },
        range_6: {
            lowEnd: "F0",
            highEnd: "F0",
            sample: "dm_techno_rim",
            baseNote: "F0"
        },
        range_7: {
            lowEnd: "Fs0",
            highEnd: "Fs0",
            sample: "dm_techno_tom_2",
            baseNote: "Fs0"
        },
        range_8: {
            lowEnd: "G0",
            highEnd: "G0",
            sample: "dm_techno_tom_1",
            baseNote: "G0"
        },
        range_9: {
            sampleGain: "2",
            lowEnd: "Gs0",
            highEnd: "Gs0",
            sample: "dm_techno_crash",
            baseNote: "Gs0"
        }
    },
    drums_brushes_v1: {
        range_1: {
            sampleGain: "-3",
            lowEnd: "C0",
            highEnd: "C0",
            sample: "drums_standard_v1_kick",
            baseNote: "C0"
        },
        range_2: {
            lowEnd: "Cs0",
            highEnd: "Cs0",
            sample: "drums_brushes_v1_snare",
            baseNote: "Cs0"
        },
        range_3: {
            lowEnd: "D0",
            highEnd: "D0",
            sample: "drums_brushes_v1_rimshot",
            baseNote: "D0"
        },
        range_4: {
            lowEnd: "Fs0",
            highEnd: "Fs0",
            sample: "drums_brushes_v1_tom_1",
            baseNote: "Fs0"
        },
        range_5: {
            lowEnd: "G0",
            highEnd: "G0",
            sample: "drums_brushes_v1_tom_2",
            baseNote: "G0"
        },
        range_6: {
            lowEnd: "Gs0",
            highEnd: "Gs0",
            sample: "drums_brushes_v1_tom_3",
            baseNote: "Gs0"
        },
        range_7: {
            lowEnd: "A0",
            highEnd: "A0",
            sample: "drums_brushes_v1_crash",
            baseNote: "A0"
        },
        range_8: {
            sampleGain: "-3",
            lowEnd: "As0",
            highEnd: "As0",
            sample: "drums_brushes_v1_ride",
            baseNote: "As0"
        },
        range_9: {
            sampleGain: "-7",
            lowEnd: "B0",
            highEnd: "B0",
            sample: "drums_standard_v1_ride_bell",
            baseNote: "B0"
        },
        range_10: {
            lowEnd: "Ds0",
            highEnd: "Ds0",
            sample: "drums_brushes_hihat_v1_closed",
            baseNote: "Ds0"
        },
        range_11: {
            lowEnd: "E0",
            highEnd: "E0",
            sample: "drums_brushes_hihat_v1_half_open",
            baseNote: "E0"
        },
        range_12: {
            lowEnd: "F0",
            highEnd: "F0",
            sample: "drums_brushes_hihat_v1_open",
            baseNote: "F0"
        },
        range_13: {
            sampleGain: "-3",
            lowEnd: "C1",
            highEnd: "C1",
            sample: "drums_brushes_swipe_1",
            baseNote: "C1"
        },
        range_14: {
            sampleGain: "-3",
            lowEnd: "Cs1",
            highEnd: "Cs1",
            sample: "drums_brushes_swipe_2",
            baseNote: "Cs1"
        }
    },
    drums_brushes_v2: {
        range_1: {
            sampleGain: "0",
            lowEnd: "C0",
            highEnd: "C0",
            sample: "drums_standard_v2_kick",
            baseNote: "C0"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "Cs0",
            highEnd: "Cs0",
            sample: "drums_brushes_v2_snare",
            baseNote: "Cs0"
        },
        range_3: {
            sampleGain: "3",
            lowEnd: "D0",
            highEnd: "D0",
            sample: "drums_brushes_v2_rimshot",
            baseNote: "D0"
        },
        range_4: {
            sampleGain: "3",
            lowEnd: "Fs0",
            highEnd: "Fs0",
            sample: "drums_brushes_v2_tom_1",
            baseNote: "Fs0"
        },
        range_5: {
            sampleGain: "3",
            lowEnd: "G0",
            highEnd: "G0",
            sample: "drums_brushes_v2_tom_2",
            baseNote: "G0"
        },
        range_6: {
            sampleGain: "3",
            lowEnd: "Gs0",
            highEnd: "Gs0",
            sample: "drums_brushes_v2_tom_3",
            baseNote: "Gs0"
        },
        range_7: {
            lowEnd: "A0",
            highEnd: "A0",
            sample: "drums_brushes_v1_crash",
            baseNote: "A0"
        },
        range_8: {
            lowEnd: "As0",
            highEnd: "As0",
            sample: "drums_brushes_v1_ride",
            baseNote: "As0"
        },
        range_9: {
            sampleGain: "-4",
            lowEnd: "B0",
            highEnd: "B0",
            sample: "drums_standard_v2_ride_bell",
            baseNote: "B0"
        },
        range_10: {
            sampleGain: "3",
            lowEnd: "Ds0",
            highEnd: "Ds0",
            sample: "drums_brushes_hihat_v2_closed",
            baseNote: "Ds0"
        },
        range_11: {
            sampleGain: "3",
            lowEnd: "E0",
            highEnd: "E0",
            sample: "drums_brushes_hihat_v2_half_open",
            baseNote: "E0"
        },
        range_12: {
            sampleGain: "3",
            lowEnd: "F0",
            highEnd: "F0",
            sample: "drums_brushes_hihat_v2_open",
            baseNote: "F0"
        },
        range_13: {
            sampleGain: "-3",
            lowEnd: "C1",
            highEnd: "C1",
            sample: "drums_brushes_swipe_1",
            baseNote: "C1"
        },
        range_14: {
            sampleGain: "-3",
            lowEnd: "Cs1",
            highEnd: "Cs1",
            sample: "drums_brushes_swipe_2",
            baseNote: "Cs1"
        }
    },
    drums_brushes_v3: {
        range_1: {
            sampleGain: "3",
            lowEnd: "C0",
            highEnd: "C0",
            sample: "drums_standard_v3_kick",
            baseNote: "C0"
        },
        range_2: {
            sampleGain: "6",
            lowEnd: "Cs0",
            highEnd: "Cs0",
            sample: "drums_brushes_v3_snare",
            baseNote: "Cs0"
        },
        range_3: {
            sampleGain: "6",
            lowEnd: "D0",
            highEnd: "D0",
            sample: "drums_brushes_v3_rimshot",
            baseNote: "D0"
        },
        range_4: {
            sampleGain: "6",
            lowEnd: "Fs0",
            highEnd: "Fs0",
            sample: "drums_brushes_v3_tom_1",
            baseNote: "Fs0"
        },
        range_5: {
            sampleGain: "6",
            lowEnd: "G0",
            highEnd: "G0",
            sample: "drums_brushes_v3_tom_2",
            baseNote: "G0"
        },
        range_6: {
            sampleGain: "6",
            lowEnd: "Gs0",
            highEnd: "Gs0",
            sample: "drums_brushes_v3_tom_3",
            baseNote: "Gs0"
        },
        range_7: {
            lowEnd: "A0",
            highEnd: "A0",
            sample: "drums_brushes_v1_crash",
            baseNote: "A0"
        },
        range_8: {
            sampleGain: "3",
            lowEnd: "As0",
            highEnd: "As0",
            sample: "drums_brushes_v1_ride",
            baseNote: "As0"
        },
        range_9: {
            sampleGain: "-1",
            lowEnd: "B0",
            highEnd: "B0",
            sample: "drums_standard_v3_ride_bell",
            baseNote: "B0"
        },
        range_10: {
            sampleGain: "6",
            lowEnd: "Ds0",
            highEnd: "Ds0",
            sample: "drums_brushes_hihat_v3_closed",
            baseNote: "Ds0"
        },
        range_11: {
            sampleGain: "6",
            lowEnd: "E0",
            highEnd: "E0",
            sample: "drums_brushes_hihat_v3_half_open",
            baseNote: "E0"
        },
        range_12: {
            sampleGain: "6",
            lowEnd: "F0",
            highEnd: "F0",
            sample: "drums_brushes_hihat_v3_open",
            baseNote: "F0"
        },
        range_13: {
            sampleGain: "-3",
            lowEnd: "C1",
            highEnd: "C1",
            sample: "drums_brushes_swipe_1",
            baseNote: "C1"
        },
        range_14: {
            sampleGain: "-3",
            lowEnd: "Cs1",
            highEnd: "Cs1",
            sample: "drums_brushes_swipe_2",
            baseNote: "Cs1"
        }
    },
    drums_brushes_v4: {
        range_1: {
            sampleGain: "6",
            lowEnd: "C0",
            highEnd: "C0",
            sample: "drums_standard_v4_kick",
            baseNote: "C0"
        },
        range_2: {
            sampleGain: "9",
            lowEnd: "Cs0",
            highEnd: "Cs0",
            sample: "drums_brushes_v4_snare",
            baseNote: "Cs0"
        },
        range_3: {
            sampleGain: "9",
            lowEnd: "D0",
            highEnd: "D0",
            sample: "drums_brushes_v4_rimshot",
            baseNote: "D0"
        },
        range_4: {
            sampleGain: "9",
            lowEnd: "Fs0",
            highEnd: "Fs0",
            sample: "drums_brushes_v4_tom_1",
            baseNote: "Fs0"
        },
        range_5: {
            sampleGain: "9",
            lowEnd: "G0",
            highEnd: "G0",
            sample: "drums_brushes_v4_tom_2",
            baseNote: "G0"
        },
        range_6: {
            sampleGain: "9",
            lowEnd: "Gs0",
            highEnd: "Gs0",
            sample: "drums_brushes_v4_tom_3",
            baseNote: "Gs0"
        },
        range_7: {
            lowEnd: "A0",
            highEnd: "A0",
            sample: "drums_brushes_v1_crash",
            baseNote: "A0"
        },
        range_8: {
            sampleGain: "4",
            lowEnd: "As0",
            highEnd: "As0",
            sample: "drums_brushes_v1_ride",
            baseNote: "As0"
        },
        range_9: {
            sampleGain: "2",
            lowEnd: "B0",
            highEnd: "B0",
            sample: "drums_standard_v4_ride_bell",
            baseNote: "B0"
        },
        range_10: {
            sampleGain: "9",
            lowEnd: "Ds0",
            highEnd: "Ds0",
            sample: "drums_brushes_hihat_v4_closed",
            baseNote: "Ds0"
        },
        range_11: {
            sampleGain: "9",
            lowEnd: "E0",
            highEnd: "E0",
            sample: "drums_brushes_hihat_v4_half_open",
            baseNote: "E0"
        },
        range_12: {
            sampleGain: "9",
            lowEnd: "F0",
            highEnd: "F0",
            sample: "drums_brushes_hihat_v4_open",
            baseNote: "F0"
        },
        range_13: {
            sampleGain: "-3",
            lowEnd: "C1",
            highEnd: "C1",
            sample: "drums_brushes_swipe_1",
            baseNote: "C1"
        },
        range_14: {
            sampleGain: "-3",
            lowEnd: "Cs1",
            highEnd: "Cs1",
            sample: "drums_brushes_swipe_2",
            baseNote: "Cs1"
        }
    },
    drums_standard_v1: {
        range_1: {
            lowEnd: "C0",
            highEnd: "C0",
            sample: "drums_standard_v1_kick",
            baseNote: "C0"
        },
        range_2: {
            lowEnd: "Cs0",
            highEnd: "Cs0",
            sample: "drums_standard_v1_snare",
            baseNote: "Cs0"
        },
        range_3: {
            lowEnd: "D0",
            highEnd: "D0",
            sample: "drums_standard_v1_rimshot",
            baseNote: "D0"
        },
        range_4: {
            lowEnd: "Fs0",
            highEnd: "Fs0",
            sample: "drums_standard_v1_tom_1",
            baseNote: "Fs0"
        },
        range_5: {
            lowEnd: "G0",
            highEnd: "G0",
            sample: "drums_standard_v1_tom_2",
            baseNote: "G0"
        },
        range_6: {
            lowEnd: "Gs0",
            highEnd: "Gs0",
            sample: "drums_standard_v1_tom_3",
            baseNote: "Gs0"
        },
        range_7: {
            lowEnd: "A0",
            highEnd: "A0",
            sample: "drums_standard_v1_crash",
            baseNote: "A0"
        },
        range_8: {
            lowEnd: "B0",
            highEnd: "B0",
            sample: "drums_standard_v1_ride_bell",
            baseNote: "B0"
        },
        range_9: {
            lowEnd: "As0",
            highEnd: "As0",
            sample: "drums_standard_v1_ride",
            baseNote: "As0"
        },
        range_10: {
            lowEnd: "Ds0",
            highEnd: "Ds0",
            sample: "drums_standard_hihat_v1_closed",
            baseNote: "Ds0"
        },
        range_11: {
            lowEnd: "E0",
            highEnd: "E0",
            sample: "drums_standard_hihat_v1_half_open",
            baseNote: "E0"
        },
        range_12: {
            lowEnd: "F0",
            highEnd: "F0",
            sample: "drums_standard_hihat_v1_open",
            baseNote: "F0"
        }
    },
    drums_standard_v2: {
        range_1: {
            sampleGain: "3",
            lowEnd: "C0",
            highEnd: "C0",
            sample: "drums_standard_v2_kick",
            baseNote: "C0"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "Cs0",
            highEnd: "Cs0",
            sample: "drums_standard_v2_snare",
            baseNote: "Cs0"
        },
        range_3: {
            sampleGain: "3",
            lowEnd: "D0",
            highEnd: "D0",
            sample: "drums_standard_v2_rimshot",
            baseNote: "D0"
        },
        range_4: {
            sampleGain: "3",
            lowEnd: "Fs0",
            highEnd: "Fs0",
            sample: "drums_standard_v2_tom_1",
            baseNote: "Fs0"
        },
        range_5: {
            sampleGain: "3",
            lowEnd: "G0",
            highEnd: "G0",
            sample: "drums_standard_v2_tom_2",
            baseNote: "G0"
        },
        range_6: {
            sampleGain: "3",
            lowEnd: "Gs0",
            highEnd: "Gs0",
            sample: "drums_standard_v2_tom_3",
            baseNote: "Gs0"
        },
        range_7: {
            lowEnd: "A0",
            highEnd: "A0",
            sample: "drums_standard_v1_crash",
            baseNote: "A0"
        },
        range_8: {
            sampleGain: "3",
            lowEnd: "B0",
            highEnd: "B0",
            sample: "drums_standard_v2_ride_bell",
            baseNote: "B0"
        },
        range_9: {
            lowEnd: "As0",
            highEnd: "As0",
            sample: "drums_standard_v1_ride",
            baseNote: "As0"
        },
        range_10: {
            sampleGain: "3",
            lowEnd: "Ds0",
            highEnd: "Ds0",
            sample: "drums_standard_hihat_v2_closed",
            baseNote: "Ds0"
        },
        range_11: {
            sampleGain: "3",
            lowEnd: "E0",
            highEnd: "E0",
            sample: "drums_standard_hihat_v2_half_open",
            baseNote: "E0"
        },
        range_12: {
            sampleGain: "3",
            lowEnd: "F0",
            highEnd: "F0",
            sample: "drums_standard_hihat_v2_open",
            baseNote: "F0"
        }
    },
    drums_standard_v3: {
        range_1: {
            sampleGain: "6",
            lowEnd: "C0",
            highEnd: "C0",
            sample: "drums_standard_v3_kick",
            baseNote: "C0"
        },
        range_2: {
            sampleGain: "6",
            lowEnd: "Cs0",
            highEnd: "Cs0",
            sample: "drums_standard_v3_snare",
            baseNote: "Cs0"
        },
        range_3: {
            sampleGain: "6",
            lowEnd: "D0",
            highEnd: "D0",
            sample: "drums_standard_v3_rimshot",
            baseNote: "D0"
        },
        range_4: {
            sampleGain: "6",
            lowEnd: "Fs0",
            highEnd: "Fs0",
            sample: "drums_standard_v3_tom_1",
            baseNote: "Fs0"
        },
        range_5: {
            sampleGain: "6",
            lowEnd: "G0",
            highEnd: "G0",
            sample: "drums_standard_v3_tom_2",
            baseNote: "G0"
        },
        range_6: {
            sampleGain: "6",
            lowEnd: "Gs0",
            highEnd: "Gs0",
            sample: "drums_standard_v3_tom_3",
            baseNote: "Gs0"
        },
        range_7: {
            lowEnd: "A0",
            highEnd: "A0",
            sample: "drums_standard_v1_crash",
            baseNote: "A0"
        },
        range_8: {
            sampleGain: "6",
            lowEnd: "B0",
            highEnd: "B0",
            sample: "drums_standard_v3_ride_bell",
            baseNote: "B0"
        },
        range_9: {
            lowEnd: "As0",
            highEnd: "As0",
            sample: "drums_standard_v1_ride",
            baseNote: "As0"
        },
        range_10: {
            sampleGain: "6",
            lowEnd: "Ds0",
            highEnd: "Ds0",
            sample: "drums_standard_hihat_v3_closed",
            baseNote: "Ds0"
        },
        range_11: {
            sampleGain: "6",
            lowEnd: "E0",
            highEnd: "E0",
            sample: "drums_standard_hihat_v3_half_open",
            baseNote: "E0"
        },
        range_12: {
            sampleGain: "6",
            lowEnd: "F0",
            highEnd: "F0",
            sample: "drums_standard_hihat_v3_open",
            baseNote: "F0"
        }
    },
    drums_standard_v4: {
        range_1: {
            sampleGain: "9",
            lowEnd: "C0",
            highEnd: "C0",
            sample: "drums_standard_v4_kick",
            baseNote: "C0"
        },
        range_2: {
            sampleGain: "9",
            lowEnd: "Cs0",
            highEnd: "Cs0",
            sample: "drums_standard_v4_snare",
            baseNote: "Cs0"
        },
        range_3: {
            sampleGain: "9",
            lowEnd: "D0",
            highEnd: "D0",
            sample: "drums_standard_v4_rimshot",
            baseNote: "D0"
        },
        range_4: {
            sampleGain: "9",
            lowEnd: "Fs0",
            highEnd: "Fs0",
            sample: "drums_standard_v4_tom_1",
            baseNote: "Fs0"
        },
        range_5: {
            sampleGain: "9",
            lowEnd: "G0",
            highEnd: "G0",
            sample: "drums_standard_v4_tom_2",
            baseNote: "G0"
        },
        range_6: {
            sampleGain: "9",
            lowEnd: "Gs0",
            highEnd: "Gs0",
            sample: "drums_standard_v4_tom_3",
            baseNote: "Gs0"
        },
        range_7: {
            lowEnd: "A0",
            highEnd: "A0",
            sample: "drums_standard_v1_crash",
            baseNote: "A0"
        },
        range_8: {
            sampleGain: "9",
            lowEnd: "B0",
            highEnd: "B0",
            sample: "drums_standard_v4_ride_bell",
            baseNote: "B0"
        },
        range_9: {
            lowEnd: "As0",
            highEnd: "As0",
            sample: "drums_standard_v1_ride",
            baseNote: "As0"
        },
        range_10: {
            sampleGain: "9",
            lowEnd: "Ds0",
            highEnd: "Ds0",
            sample: "drums_standard_hihat_v4_closed",
            baseNote: "Ds0"
        },
        range_11: {
            sampleGain: "9",
            lowEnd: "E0",
            highEnd: "E0",
            sample: "drums_standard_hihat_v4_half_open",
            baseNote: "E0"
        },
        range_12: {
            sampleGain: "9",
            lowEnd: "F0",
            highEnd: "F0",
            sample: "drums_standard_hihat_v4_open",
            baseNote: "F0"
        }
    },
    guitar_bright_hard_1: {
        range_1: {
            lowEnd: "D1",
            highEnd: "Gs1",
            sample: "guitar_bright_hard_1_2",
            baseNote: "Fs1"
        },
        range_2: {
            lowEnd: "A1",
            highEnd: "E3",
            sample: "guitar_bright_hard_1_7",
            baseNote: "B1"
        }
    },
    guitar_bright_hard_2: {
        range_1: {
            lowEnd: "G1",
            highEnd: "Cs2",
            sample: "guitar_bright_hard_2_2",
            baseNote: "B1"
        },
        range_2: {
            lowEnd: "D2",
            highEnd: "A3",
            sample: "guitar_bright_hard_2_7",
            baseNote: "E2"
        }
    },
    guitar_bright_hard_3: {
        range_1: {
            lowEnd: "C2",
            highEnd: "Fs2",
            sample: "guitar_bright_hard_3_2",
            baseNote: "E2"
        },
        range_2: {
            lowEnd: "G2",
            highEnd: "D4",
            sample: "guitar_bright_hard_3_7",
            baseNote: "A2"
        }
    },
    guitar_bright_hard_4: {
        range_1: {
            lowEnd: "F2",
            highEnd: "B2",
            sample: "guitar_bright_hard_4_2",
            baseNote: "A2"
        },
        range_2: {
            lowEnd: "C3",
            highEnd: "G4",
            sample: "guitar_bright_hard_4_7",
            baseNote: "D3"
        }
    },
    guitar_bright_hard_5: {
        range_1: {
            lowEnd: "A2",
            highEnd: "Ds3",
            sample: "guitar_bright_hard_5_2",
            baseNote: "Cs3"
        },
        range_2: {
            lowEnd: "E3",
            highEnd: "B4",
            sample: "guitar_bright_hard_5_7",
            baseNote: "Fs3"
        }
    },
    guitar_bright_hard_6: {
        range_1: {
            lowEnd: "D3",
            highEnd: "Gs3",
            sample: "guitar_bright_hard_6_2",
            baseNote: "Fs3"
        },
        range_2: {
            lowEnd: "A3",
            highEnd: "E5",
            sample: "guitar_bright_hard_6_7",
            baseNote: "B3"
        }
    },
    guitar_bright_soft_1: {
        range_1: {
            sampleGain: "3",
            lowEnd: "D1",
            highEnd: "Gs1",
            sample: "guitar_bright_soft_1_2",
            baseNote: "Fs1"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "A1",
            highEnd: "E3",
            sample: "guitar_bright_soft_1_7",
            baseNote: "B1"
        }
    },
    guitar_bright_soft_2: {
        range_1: {
            sampleGain: "3",
            lowEnd: "G1",
            highEnd: "Cs2",
            sample: "guitar_bright_soft_2_2",
            baseNote: "B1"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "D2",
            highEnd: "A3",
            sample: "guitar_bright_soft_2_7",
            baseNote: "E2"
        }
    },
    guitar_bright_soft_3: {
        range_1: {
            sampleGain: "3",
            lowEnd: "C2",
            highEnd: "Fs2",
            sample: "guitar_bright_soft_3_2",
            baseNote: "E2"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "G2",
            highEnd: "D4",
            sample: "guitar_bright_soft_3_7",
            baseNote: "A2"
        }
    },
    guitar_bright_soft_4: {
        range_1: {
            sampleGain: "3",
            lowEnd: "F2",
            highEnd: "B2",
            sample: "guitar_bright_soft_4_2",
            baseNote: "A2"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "C3",
            highEnd: "G4",
            sample: "guitar_bright_soft_4_7",
            baseNote: "D3"
        }
    },
    guitar_bright_soft_5: {
        range_1: {
            sampleGain: "3",
            lowEnd: "A2",
            highEnd: "Ds3",
            sample: "guitar_bright_soft_5_2",
            baseNote: "Cs3"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "E3",
            highEnd: "B4",
            sample: "guitar_bright_soft_5_7",
            baseNote: "Fs3"
        }
    },
    guitar_bright_soft_6: {
        range_1: {
            sampleGain: "3",
            lowEnd: "D3",
            highEnd: "Gs3",
            sample: "guitar_bright_soft_6_2",
            baseNote: "Fs3"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "A3",
            highEnd: "E5",
            sample: "guitar_bright_soft_6_7",
            baseNote: "B3"
        }
    },
    guitar_bright_hard_muted_1: {
        range_1: {
            sampleGain: "4",
            lowEnd: "D4",
            highEnd: "Gs4",
            sample: "guitar_bright_hard_muted_1_2",
            baseNote: "Fs4"
        },
        range_2: {
            sampleGain: "4",
            lowEnd: "A4",
            highEnd: "E6",
            sample: "guitar_bright_hard_muted_1_7",
            baseNote: "B4"
        }
    },
    guitar_bright_hard_muted_2: {
        range_1: {
            sampleGain: "4",
            lowEnd: "G4",
            highEnd: "Cs5",
            sample: "guitar_bright_hard_muted_2_2",
            baseNote: "B4"
        },
        range_2: {
            sampleGain: "4",
            lowEnd: "D5",
            highEnd: "A6",
            sample: "guitar_bright_hard_muted_2_7",
            baseNote: "E5"
        }
    },
    guitar_bright_hard_muted_3: {
        range_1: {
            sampleGain: "4",
            lowEnd: "C5",
            highEnd: "Fs5",
            sample: "guitar_bright_hard_muted_3_2",
            baseNote: "E5"
        },
        range_2: {
            sampleGain: "4",
            lowEnd: "G5",
            highEnd: "D7",
            sample: "guitar_bright_hard_muted_3_7",
            baseNote: "A5"
        }
    },
    guitar_bright_hard_muted_4: {
        range_1: {
            sampleGain: "4",
            lowEnd: "F5",
            highEnd: "B5",
            sample: "guitar_bright_hard_muted_4_2",
            baseNote: "A5"
        },
        range_2: {
            sampleGain: "4",
            lowEnd: "C6",
            highEnd: "G7",
            sample: "guitar_bright_hard_muted_4_7",
            baseNote: "D6"
        }
    },
    guitar_bright_hard_muted_5: {
        range_1: {
            sampleGain: "4",
            lowEnd: "A5",
            highEnd: "Ds6",
            sample: "guitar_bright_hard_muted_5_2",
            baseNote: "Cs6"
        },
        range_2: {
            sampleGain: "4",
            lowEnd: "E6",
            highEnd: "B7",
            sample: "guitar_bright_hard_muted_5_7",
            baseNote: "Fs6"
        }
    },
    guitar_bright_hard_muted_6: {
        range_1: {
            sampleGain: "4",
            lowEnd: "D6",
            highEnd: "Gs6",
            sample: "guitar_bright_hard_muted_6_2",
            baseNote: "Fs6"
        },
        range_2: {
            sampleGain: "4",
            lowEnd: "A6",
            highEnd: "E8",
            sample: "guitar_bright_hard_muted_6_7",
            baseNote: "B6"
        }
    },
    guitar_bright_soft_muted_1: {
        range_1: {
            sampleGain: "7",
            lowEnd: "D4",
            highEnd: "Gs4",
            sample: "guitar_bright_soft_muted_1_2",
            baseNote: "Fs4"
        },
        range_2: {
            sampleGain: "7",
            lowEnd: "A4",
            highEnd: "E6",
            sample: "guitar_bright_soft_muted_1_7",
            baseNote: "B4"
        }
    },
    guitar_bright_soft_muted_2: {
        range_1: {
            sampleGain: "7",
            lowEnd: "G4",
            highEnd: "Cs5",
            sample: "guitar_bright_soft_muted_2_2",
            baseNote: "B4"
        },
        range_2: {
            sampleGain: "7",
            lowEnd: "D5",
            highEnd: "A6",
            sample: "guitar_bright_soft_muted_2_7",
            baseNote: "E5"
        }
    },
    guitar_bright_soft_muted_3: {
        range_1: {
            sampleGain: "7",
            lowEnd: "C5",
            highEnd: "Fs5",
            sample: "guitar_bright_soft_muted_3_2",
            baseNote: "E5"
        },
        range_2: {
            sampleGain: "7",
            lowEnd: "G5",
            highEnd: "D7",
            sample: "guitar_bright_soft_muted_3_7",
            baseNote: "A5"
        }
    },
    guitar_bright_soft_muted_4: {
        range_1: {
            sampleGain: "7",
            lowEnd: "F5",
            highEnd: "B5",
            sample: "guitar_bright_soft_muted_4_2",
            baseNote: "A5"
        },
        range_2: {
            sampleGain: "7",
            lowEnd: "C6",
            highEnd: "G7",
            sample: "guitar_bright_soft_muted_4_7",
            baseNote: "D6"
        }
    },
    guitar_bright_soft_muted_5: {
        range_1: {
            sampleGain: "7",
            lowEnd: "A5",
            highEnd: "Ds6",
            sample: "guitar_bright_soft_muted_5_2",
            baseNote: "Cs6"
        },
        range_2: {
            sampleGain: "7",
            lowEnd: "E6",
            highEnd: "B7",
            sample: "guitar_bright_soft_muted_5_7",
            baseNote: "Fs6"
        }
    },
    guitar_bright_soft_muted_6: {
        range_1: {
            sampleGain: "7",
            lowEnd: "D6",
            highEnd: "Gs6",
            sample: "guitar_bright_soft_muted_6_2",
            baseNote: "Fs6"
        },
        range_2: {
            sampleGain: "7",
            lowEnd: "A6",
            highEnd: "E8",
            sample: "guitar_bright_soft_muted_6_7",
            baseNote: "B6"
        }
    },
    guitar_bright_legato_1: {
        range_1: {
            lowEnd: "D1",
            highEnd: "Gs1",
            sample: "guitar_bright_legato_1_2",
            baseNote: "Fs1"
        },
        range_2: {
            lowEnd: "A1",
            highEnd: "E3",
            sample: "guitar_bright_legato_1_7",
            baseNote: "B1"
        }
    },
    guitar_bright_legato_2: {
        range_1: {
            lowEnd: "G1",
            highEnd: "Cs2",
            sample: "guitar_bright_legato_2_2",
            baseNote: "B1"
        },
        range_2: {
            lowEnd: "D2",
            highEnd: "A3",
            sample: "guitar_bright_legato_2_7",
            baseNote: "E2"
        }
    },
    guitar_bright_legato_3: {
        range_1: {
            lowEnd: "C2",
            highEnd: "Fs2",
            sample: "guitar_bright_legato_3_2",
            baseNote: "E2"
        },
        range_2: {
            lowEnd: "G2",
            highEnd: "D4",
            sample: "guitar_bright_legato_3_7",
            baseNote: "A2"
        }
    },
    guitar_bright_legato_4: {
        range_1: {
            lowEnd: "F2",
            highEnd: "B2",
            sample: "guitar_bright_legato_4_2",
            baseNote: "A2"
        },
        range_2: {
            lowEnd: "C3",
            highEnd: "G4",
            sample: "guitar_bright_legato_4_7",
            baseNote: "D3"
        }
    },
    guitar_bright_legato_5: {
        range_1: {
            lowEnd: "A2",
            highEnd: "Ds3",
            sample: "guitar_bright_legato_5_2",
            baseNote: "Cs3"
        },
        range_2: {
            lowEnd: "E3",
            highEnd: "B4",
            sample: "guitar_bright_legato_5_7",
            baseNote: "Fs3"
        }
    },
    guitar_bright_legato_6: {
        range_1: {
            lowEnd: "D3",
            highEnd: "Gs3",
            sample: "guitar_bright_legato_6_2",
            baseNote: "Fs3"
        },
        range_2: {
            sampleGain: "2",
            lowEnd: "A3",
            highEnd: "E5",
            sample: "guitar_bright_legato_6_7",
            baseNote: "B3"
        }
    },
    guitar_bright_damped_1: {
        range_1: {
            lowEnd: "D-2",
            highEnd: "Gs-2",
            sample: "guitar_bright_damped_1_2",
            baseNote: "Fs-2"
        },
        range_2: {
            lowEnd: "A-2",
            highEnd: "E0",
            sample: "guitar_bright_damped_1_7",
            baseNote: "B-2"
        }
    },
    guitar_bright_damped_2: {
        range_1: {
            lowEnd: "G-2",
            highEnd: "Cs-1",
            sample: "guitar_bright_damped_2_2",
            baseNote: "B-2"
        },
        range_2: {
            lowEnd: "D-1",
            highEnd: "A0",
            sample: "guitar_bright_damped_2_7",
            baseNote: "E-1"
        }
    },
    guitar_bright_damped_3: {
        range_1: {
            lowEnd: "C-1",
            highEnd: "Fs-1",
            sample: "guitar_bright_damped_3_2",
            baseNote: "E-1"
        },
        range_2: {
            lowEnd: "G-1",
            highEnd: "D1",
            sample: "guitar_bright_damped_3_7",
            baseNote: "A-1"
        }
    },
    guitar_bright_damped_4: {
        range_1: {
            lowEnd: "F-1",
            highEnd: "B-1",
            sample: "guitar_bright_damped_4_2",
            baseNote: "A-1"
        },
        range_2: {
            lowEnd: "C0",
            highEnd: "G1",
            sample: "guitar_bright_damped_4_7",
            baseNote: "D0"
        }
    },
    guitar_bright_damped_5: {
        range_1: {
            lowEnd: "A-1",
            highEnd: "Ds0",
            sample: "guitar_bright_damped_5_2",
            baseNote: "Cs0"
        },
        range_2: {
            lowEnd: "E0",
            highEnd: "B1",
            sample: "guitar_bright_damped_5_7",
            baseNote: "Fs0"
        }
    },
    guitar_bright_damped_6: {
        range_1: {
            lowEnd: "D0",
            highEnd: "Gs0",
            sample: "guitar_bright_damped_6_2",
            baseNote: "Fs0"
        },
        range_2: {
            lowEnd: "A0",
            highEnd: "E2",
            sample: "guitar_bright_damped_6_7",
            baseNote: "B0"
        }
    },
    guitar_full_hard_1: {
        range_1: {
            lowEnd: "D1",
            highEnd: "Gs1",
            sample: "guitar_full_hard_1_2",
            baseNote: "Fs1"
        },
        range_2: {
            lowEnd: "A1",
            highEnd: "E3",
            sample: "guitar_full_hard_1_7",
            baseNote: "B1"
        }
    },
    guitar_full_hard_2: {
        range_1: {
            lowEnd: "G1",
            highEnd: "Cs2",
            sample: "guitar_full_hard_2_2",
            baseNote: "B1"
        },
        range_2: {
            lowEnd: "D2",
            highEnd: "A3",
            sample: "guitar_full_hard_2_7",
            baseNote: "E2"
        }
    },
    guitar_full_hard_3: {
        range_1: {
            lowEnd: "C2",
            highEnd: "Fs2",
            sample: "guitar_full_hard_3_2",
            baseNote: "E2"
        },
        range_2: {
            lowEnd: "G2",
            highEnd: "D4",
            sample: "guitar_full_hard_3_7",
            baseNote: "A2"
        }
    },
    guitar_full_hard_4: {
        range_1: {
            lowEnd: "F2",
            highEnd: "B2",
            sample: "guitar_full_hard_4_2",
            baseNote: "A2"
        },
        range_2: {
            lowEnd: "C3",
            highEnd: "G4",
            sample: "guitar_full_hard_4_7",
            baseNote: "D3"
        }
    },
    guitar_full_hard_5: {
        range_1: {
            lowEnd: "A2",
            highEnd: "Ds3",
            sample: "guitar_full_hard_5_2",
            baseNote: "Cs3"
        },
        range_2: {
            lowEnd: "E3",
            highEnd: "B4",
            sample: "guitar_full_hard_5_7",
            baseNote: "Fs3"
        }
    },
    guitar_full_hard_6: {
        range_1: {
            lowEnd: "D3",
            highEnd: "Gs3",
            sample: "guitar_full_hard_6_2",
            baseNote: "Fs3"
        },
        range_2: {
            lowEnd: "A3",
            highEnd: "E5",
            sample: "guitar_full_hard_6_7",
            baseNote: "B3"
        }
    },
    guitar_full_soft_1: {
        range_1: {
            sampleGain: "3",
            lowEnd: "D1",
            highEnd: "Gs1",
            sample: "guitar_full_soft_1_2",
            baseNote: "Fs1"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "A1",
            highEnd: "E3",
            sample: "guitar_full_soft_1_7",
            baseNote: "B1"
        }
    },
    guitar_full_soft_2: {
        range_1: {
            sampleGain: "3",
            lowEnd: "G1",
            highEnd: "Cs2",
            sample: "guitar_full_soft_2_2",
            baseNote: "B1"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "D2",
            highEnd: "A3",
            sample: "guitar_full_soft_2_7",
            baseNote: "E2"
        }
    },
    guitar_full_soft_3: {
        range_1: {
            sampleGain: "3",
            lowEnd: "C2",
            highEnd: "Fs2",
            sample: "guitar_full_soft_3_2",
            baseNote: "E2"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "G2",
            highEnd: "D4",
            sample: "guitar_full_soft_3_7",
            baseNote: "A2"
        }
    },
    guitar_full_soft_4: {
        range_1: {
            sampleGain: "3",
            lowEnd: "F2",
            highEnd: "B2",
            sample: "guitar_full_soft_4_2",
            baseNote: "A2"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "C3",
            highEnd: "G4",
            sample: "guitar_full_soft_4_7",
            baseNote: "D3"
        }
    },
    guitar_full_soft_5: {
        range_1: {
            sampleGain: "3",
            lowEnd: "A2",
            highEnd: "Ds3",
            sample: "guitar_full_soft_5_2",
            baseNote: "Cs3"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "E3",
            highEnd: "B4",
            sample: "guitar_full_soft_5_7",
            baseNote: "Fs3"
        }
    },
    guitar_full_soft_6: {
        range_1: {
            sampleGain: "3",
            lowEnd: "D3",
            highEnd: "Gs3",
            sample: "guitar_full_soft_6_2",
            baseNote: "Fs3"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "A3",
            highEnd: "E5",
            sample: "guitar_full_soft_6_7",
            baseNote: "B3"
        }
    },
    guitar_full_hard_muted_1: {
        range_1: {
            lowEnd: "D4",
            highEnd: "Gs4",
            sample: "guitar_full_hard_muted_1_2",
            baseNote: "Fs4"
        },
        range_2: {
            lowEnd: "A4",
            highEnd: "E6",
            sample: "guitar_full_hard_muted_1_7",
            baseNote: "B4"
        }
    },
    guitar_full_hard_muted_2: {
        range_1: {
            lowEnd: "G4",
            highEnd: "Cs5",
            sample: "guitar_full_hard_muted_2_2",
            baseNote: "B4"
        },
        range_2: {
            lowEnd: "D5",
            highEnd: "A6",
            sample: "guitar_full_hard_muted_2_7",
            baseNote: "E5"
        }
    },
    guitar_full_hard_muted_3: {
        range_1: {
            lowEnd: "C5",
            highEnd: "Fs5",
            sample: "guitar_full_hard_muted_3_2",
            baseNote: "E5"
        },
        range_2: {
            lowEnd: "G5",
            highEnd: "D7",
            sample: "guitar_full_hard_muted_3_7",
            baseNote: "A5"
        }
    },
    guitar_full_hard_muted_4: {
        range_1: {
            lowEnd: "F5",
            highEnd: "B5",
            sample: "guitar_full_hard_muted_4_2",
            baseNote: "A5"
        },
        range_2: {
            lowEnd: "C6",
            highEnd: "G7",
            sample: "guitar_full_hard_muted_4_7",
            baseNote: "D6"
        }
    },
    guitar_full_hard_muted_5: {
        range_1: {
            lowEnd: "A5",
            highEnd: "Ds6",
            sample: "guitar_full_hard_muted_5_2",
            baseNote: "Cs6"
        },
        range_2: {
            lowEnd: "E6",
            highEnd: "B7",
            sample: "guitar_full_hard_muted_5_7",
            baseNote: "Fs6"
        }
    },
    guitar_full_hard_muted_6: {
        range_1: {
            lowEnd: "D6",
            highEnd: "Gs6",
            sample: "guitar_full_hard_muted_6_2",
            baseNote: "Fs6"
        },
        range_2: {
            lowEnd: "A6",
            highEnd: "E8",
            sample: "guitar_full_hard_muted_6_7",
            baseNote: "B6"
        }
    },
    guitar_full_soft_muted_1: {
        range_1: {
            sampleGain: "3",
            lowEnd: "D4",
            highEnd: "Gs4",
            sample: "guitar_full_soft_muted_1_2",
            baseNote: "Fs4"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "A4",
            highEnd: "E6",
            sample: "guitar_full_soft_muted_1_7",
            baseNote: "B4"
        }
    },
    guitar_full_soft_muted_2: {
        range_1: {
            sampleGain: "3",
            lowEnd: "G4",
            highEnd: "Cs5",
            sample: "guitar_full_soft_muted_2_2",
            baseNote: "B4"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "D5",
            highEnd: "A6",
            sample: "guitar_full_soft_muted_2_7",
            baseNote: "E5"
        }
    },
    guitar_full_soft_muted_3: {
        range_1: {
            sampleGain: "3",
            lowEnd: "C5",
            highEnd: "Fs5",
            sample: "guitar_full_soft_muted_3_2",
            baseNote: "E5"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "G5",
            highEnd: "D7",
            sample: "guitar_full_soft_muted_3_7",
            baseNote: "A5"
        }
    },
    guitar_full_soft_muted_4: {
        range_1: {
            sampleGain: "3",
            lowEnd: "F5",
            highEnd: "B5",
            sample: "guitar_full_soft_muted_4_2",
            baseNote: "A5"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "C6",
            highEnd: "G7",
            sample: "guitar_full_soft_muted_4_7",
            baseNote: "D6"
        }
    },
    guitar_full_soft_muted_5: {
        range_1: {
            sampleGain: "3",
            lowEnd: "A5",
            highEnd: "Ds6",
            sample: "guitar_full_soft_muted_5_2",
            baseNote: "Cs6"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "E6",
            highEnd: "B7",
            sample: "guitar_full_soft_muted_5_7",
            baseNote: "Fs6"
        }
    },
    guitar_full_soft_muted_6: {
        range_1: {
            sampleGain: "3",
            lowEnd: "D6",
            highEnd: "Gs6",
            sample: "guitar_full_soft_muted_6_2",
            baseNote: "Fs6"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "A6",
            highEnd: "E8",
            sample: "guitar_full_soft_muted_6_7",
            baseNote: "B6"
        }
    },
    guitar_full_legato_1: {
        range_1: {
            lowEnd: "D1",
            highEnd: "Gs1",
            sample: "guitar_full_legato_1_2",
            baseNote: "Fs1"
        },
        range_2: {
            lowEnd: "A1",
            highEnd: "E3",
            sample: "guitar_full_legato_1_7",
            baseNote: "B1"
        }
    },
    guitar_full_legato_2: {
        range_1: {
            lowEnd: "G1",
            highEnd: "Cs2",
            sample: "guitar_full_legato_2_2",
            baseNote: "B1"
        },
        range_2: {
            lowEnd: "D2",
            highEnd: "A3",
            sample: "guitar_full_legato_2_7",
            baseNote: "E2"
        }
    },
    guitar_full_legato_3: {
        range_1: {
            lowEnd: "C2",
            highEnd: "Fs2",
            sample: "guitar_full_legato_3_2",
            baseNote: "E2"
        },
        range_2: {
            lowEnd: "G2",
            highEnd: "D4",
            sample: "guitar_full_legato_3_7",
            baseNote: "A2"
        }
    },
    guitar_full_legato_4: {
        range_1: {
            lowEnd: "F2",
            highEnd: "B2",
            sample: "guitar_full_legato_4_2",
            baseNote: "A2"
        },
        range_2: {
            lowEnd: "C3",
            highEnd: "G4",
            sample: "guitar_full_legato_4_7",
            baseNote: "D3"
        }
    },
    guitar_full_legato_5: {
        range_1: {
            lowEnd: "A2",
            highEnd: "Ds3",
            sample: "guitar_full_legato_5_2",
            baseNote: "Cs3"
        },
        range_2: {
            lowEnd: "E3",
            highEnd: "B4",
            sample: "guitar_full_legato_5_7",
            baseNote: "Fs3"
        }
    },
    guitar_full_legato_6: {
        range_1: {
            lowEnd: "D3",
            highEnd: "Gs3",
            sample: "guitar_full_legato_6_2",
            baseNote: "Fs3"
        },
        range_2: {
            lowEnd: "A3",
            highEnd: "E5",
            sample: "guitar_full_legato_6_7",
            baseNote: "B3"
        }
    },
    guitar_full_damped_1: {
        range_1: {
            lowEnd: "D-2",
            highEnd: "Gs-2",
            sample: "guitar_full_damped_1_2",
            baseNote: "Fs-2"
        },
        range_2: {
            lowEnd: "A-2",
            highEnd: "E0",
            sample: "guitar_full_damped_1_7",
            baseNote: "B-2"
        }
    },
    guitar_full_damped_2: {
        range_1: {
            lowEnd: "G-2",
            highEnd: "Cs-1",
            sample: "guitar_full_damped_2_2",
            baseNote: "B-2"
        },
        range_2: {
            lowEnd: "D-1",
            highEnd: "A0",
            sample: "guitar_full_damped_2_7",
            baseNote: "E-1"
        }
    },
    guitar_full_damped_3: {
        range_1: {
            lowEnd: "C-1",
            highEnd: "Fs-1",
            sample: "guitar_full_damped_3_2",
            baseNote: "E-1"
        },
        range_2: {
            lowEnd: "G-1",
            highEnd: "D1",
            sample: "guitar_full_damped_3_7",
            baseNote: "A-1"
        }
    },
    guitar_full_damped_4: {
        range_1: {
            lowEnd: "F-1",
            highEnd: "B-1",
            sample: "guitar_full_damped_4_2",
            baseNote: "A-1"
        },
        range_2: {
            lowEnd: "C0",
            highEnd: "G1",
            sample: "guitar_full_damped_4_7",
            baseNote: "D0"
        }
    },
    guitar_full_damped_5: {
        range_1: {
            lowEnd: "A-1",
            highEnd: "Ds0",
            sample: "guitar_full_damped_5_2",
            baseNote: "Cs0"
        },
        range_2: {
            lowEnd: "E0",
            highEnd: "B1",
            sample: "guitar_full_damped_5_7",
            baseNote: "Fs0"
        }
    },
    guitar_full_damped_6: {
        range_1: {
            lowEnd: "D0",
            highEnd: "Gs0",
            sample: "guitar_full_damped_6_2",
            baseNote: "Fs0"
        },
        range_2: {
            lowEnd: "A0",
            highEnd: "E2",
            sample: "guitar_full_damped_6_7",
            baseNote: "B0"
        }
    },
    guitar_nylon_hard_1: {
        range_1: {
            lowEnd: "D1",
            highEnd: "Gs1",
            sample: "guitar_nylon_hard_1_2",
            baseNote: "Fs1"
        },
        range_2: {
            lowEnd: "A1",
            highEnd: "E3",
            sample: "guitar_nylon_hard_1_7",
            baseNote: "B1"
        }
    },
    guitar_nylon_hard_2: {
        range_1: {
            lowEnd: "G1",
            highEnd: "Cs2",
            sample: "guitar_nylon_hard_2_2",
            baseNote: "B1"
        },
        range_2: {
            lowEnd: "D2",
            highEnd: "A3",
            sample: "guitar_nylon_hard_2_7",
            baseNote: "E2"
        }
    },
    guitar_nylon_hard_3: {
        range_1: {
            lowEnd: "C2",
            highEnd: "Fs2",
            sample: "guitar_nylon_hard_3_2",
            baseNote: "E2"
        },
        range_2: {
            lowEnd: "G2",
            highEnd: "D4",
            sample: "guitar_nylon_hard_3_7",
            baseNote: "A2"
        }
    },
    guitar_nylon_hard_4: {
        range_1: {
            lowEnd: "F2",
            highEnd: "B2",
            sample: "guitar_nylon_hard_4_2",
            baseNote: "A2"
        },
        range_2: {
            lowEnd: "C3",
            highEnd: "G4",
            sample: "guitar_nylon_hard_4_7",
            baseNote: "D3"
        }
    },
    guitar_nylon_hard_5: {
        range_1: {
            lowEnd: "A2",
            highEnd: "Ds3",
            sample: "guitar_nylon_hard_5_2",
            baseNote: "Cs3"
        },
        range_2: {
            lowEnd: "E3",
            highEnd: "B4",
            sample: "guitar_nylon_hard_5_7",
            baseNote: "Fs3"
        }
    },
    guitar_nylon_hard_6: {
        range_1: {
            lowEnd: "D3",
            highEnd: "Gs3",
            sample: "guitar_nylon_hard_6_2",
            baseNote: "Fs3"
        },
        range_2: {
            lowEnd: "A3",
            highEnd: "E5",
            sample: "guitar_nylon_hard_6_7",
            baseNote: "B3"
        }
    },
    guitar_nylon_soft_1: {
        range_1: {
            sampleGain: "3",
            lowEnd: "D1",
            highEnd: "Gs1",
            sample: "guitar_nylon_soft_1_2",
            baseNote: "Fs1"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "A1",
            highEnd: "E3",
            sample: "guitar_nylon_soft_1_7",
            baseNote: "B1"
        }
    },
    guitar_nylon_soft_2: {
        range_1: {
            sampleGain: "3",
            lowEnd: "G1",
            highEnd: "Cs2",
            sample: "guitar_nylon_soft_2_2",
            baseNote: "B1"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "D2",
            highEnd: "A3",
            sample: "guitar_nylon_soft_2_7",
            baseNote: "E2"
        }
    },
    guitar_nylon_soft_3: {
        range_1: {
            lowEnd: "C2",
            highEnd: "Fs2",
            sample: "guitar_nylon_soft_3_2",
            baseNote: "E2"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "G2",
            highEnd: "D4",
            sample: "guitar_nylon_soft_3_7",
            baseNote: "A2"
        }
    },
    guitar_nylon_soft_4: {
        range_1: {
            sampleGain: "3",
            lowEnd: "F2",
            highEnd: "B2",
            sample: "guitar_nylon_soft_4_2",
            baseNote: "A2"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "C3",
            highEnd: "G4",
            sample: "guitar_nylon_soft_4_7",
            baseNote: "D3"
        }
    },
    guitar_nylon_soft_5: {
        range_1: {
            sampleGain: "3",
            lowEnd: "A2",
            highEnd: "Ds3",
            sample: "guitar_nylon_soft_5_2",
            baseNote: "Cs3"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "E3",
            highEnd: "B4",
            sample: "guitar_nylon_soft_5_7",
            baseNote: "Fs3"
        }
    },
    guitar_nylon_soft_6: {
        range_1: {
            sampleGain: "3",
            lowEnd: "D3",
            highEnd: "Gs3",
            sample: "guitar_nylon_soft_6_2",
            baseNote: "Fs3"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "A3",
            highEnd: "E5",
            sample: "guitar_nylon_soft_6_7",
            baseNote: "B3"
        }
    },
    guitar_nylon_hard_muted_1: {
        range_1: {
            sampleGain: "4",
            lowEnd: "D4",
            highEnd: "Gs4",
            sample: "guitar_nylon_hard_muted_1_2",
            baseNote: "Fs4"
        },
        range_2: {
            sampleGain: "4",
            lowEnd: "A4",
            highEnd: "E6",
            sample: "guitar_nylon_hard_muted_1_7",
            baseNote: "B4"
        }
    },
    guitar_nylon_hard_muted_2: {
        range_1: {
            sampleGain: "4",
            lowEnd: "G4",
            highEnd: "Cs5",
            sample: "guitar_nylon_hard_muted_2_2",
            baseNote: "B4"
        },
        range_2: {
            sampleGain: "4",
            lowEnd: "D5",
            highEnd: "A6",
            sample: "guitar_nylon_hard_muted_2_7",
            baseNote: "E5"
        }
    },
    guitar_nylon_hard_muted_3: {
        range_1: {
            sampleGain: "4",
            lowEnd: "C5",
            highEnd: "Fs5",
            sample: "guitar_nylon_hard_muted_3_2",
            baseNote: "E5"
        },
        range_2: {
            sampleGain: "4",
            lowEnd: "G5",
            highEnd: "D7",
            sample: "guitar_nylon_hard_muted_3_7",
            baseNote: "A5"
        }
    },
    guitar_nylon_hard_muted_4: {
        range_1: {
            sampleGain: "4",
            lowEnd: "F5",
            highEnd: "B5",
            sample: "guitar_nylon_hard_muted_4_2",
            baseNote: "A5"
        },
        range_2: {
            sampleGain: "4",
            lowEnd: "C6",
            highEnd: "G7",
            sample: "guitar_nylon_hard_muted_4_7",
            baseNote: "D6"
        }
    },
    guitar_nylon_hard_muted_5: {
        range_1: {
            sampleGain: "4",
            lowEnd: "A5",
            highEnd: "Ds6",
            sample: "guitar_nylon_hard_muted_5_2",
            baseNote: "Cs6"
        },
        range_2: {
            sampleGain: "4",
            lowEnd: "E6",
            highEnd: "B7",
            sample: "guitar_nylon_hard_muted_5_7",
            baseNote: "Fs6"
        }
    },
    guitar_nylon_hard_muted_6: {
        range_1: {
            sampleGain: "4",
            lowEnd: "D6",
            highEnd: "Gs6",
            sample: "guitar_nylon_hard_muted_6_2",
            baseNote: "Fs6"
        },
        range_2: {
            sampleGain: "4",
            lowEnd: "A6",
            highEnd: "E8",
            sample: "guitar_nylon_hard_muted_6_7",
            baseNote: "B6"
        }
    },
    guitar_nylon_soft_muted_1: {
        range_1: {
            sampleGain: "7",
            lowEnd: "D4",
            highEnd: "Gs4",
            sample: "guitar_nylon_soft_muted_1_2",
            baseNote: "Fs4"
        },
        range_2: {
            sampleGain: "7",
            lowEnd: "A4",
            highEnd: "E6",
            sample: "guitar_nylon_soft_muted_1_7",
            baseNote: "B4"
        }
    },
    guitar_nylon_soft_muted_2: {
        range_1: {
            sampleGain: "7",
            lowEnd: "G4",
            highEnd: "Cs5",
            sample: "guitar_nylon_soft_muted_2_2",
            baseNote: "B4"
        },
        range_2: {
            sampleGain: "7",
            lowEnd: "D5",
            highEnd: "A6",
            sample: "guitar_nylon_soft_muted_2_7",
            baseNote: "E5"
        }
    },
    guitar_nylon_soft_muted_3: {
        range_1: {
            sampleGain: "7",
            lowEnd: "C5",
            highEnd: "Fs5",
            sample: "guitar_nylon_soft_muted_3_2",
            baseNote: "E5"
        },
        range_2: {
            sampleGain: "7",
            lowEnd: "G5",
            highEnd: "D7",
            sample: "guitar_nylon_soft_muted_3_7",
            baseNote: "A5"
        }
    },
    guitar_nylon_soft_muted_4: {
        range_1: {
            sampleGain: "7",
            lowEnd: "F5",
            highEnd: "B5",
            sample: "guitar_nylon_soft_muted_4_2",
            baseNote: "A5"
        },
        range_2: {
            sampleGain: "7",
            lowEnd: "C6",
            highEnd: "G7",
            sample: "guitar_nylon_soft_muted_4_7",
            baseNote: "D6"
        }
    },
    guitar_nylon_soft_muted_5: {
        range_1: {
            sampleGain: "7",
            lowEnd: "A5",
            highEnd: "Ds6",
            sample: "guitar_nylon_soft_muted_5_2",
            baseNote: "Cs6"
        },
        range_2: {
            sampleGain: "7",
            lowEnd: "E6",
            highEnd: "B7",
            sample: "guitar_nylon_soft_muted_5_7",
            baseNote: "Fs6"
        }
    },
    guitar_nylon_soft_muted_6: {
        range_1: {
            sampleGain: "7",
            lowEnd: "D6",
            highEnd: "Gs6",
            sample: "guitar_nylon_soft_muted_6_2",
            baseNote: "Fs6"
        },
        range_2: {
            sampleGain: "7",
            lowEnd: "A6",
            highEnd: "E8",
            sample: "guitar_nylon_soft_muted_6_7",
            baseNote: "B6"
        }
    },
    guitar_nylon_legato_1: {
        range_1: {
            lowEnd: "D1",
            highEnd: "Gs1",
            sample: "guitar_nylon_legato_1_2",
            baseNote: "Fs1"
        },
        range_2: {
            lowEnd: "A1",
            highEnd: "E3",
            sample: "guitar_nylon_legato_1_7",
            baseNote: "B1"
        }
    },
    guitar_nylon_legato_2: {
        range_1: {
            lowEnd: "G1",
            highEnd: "Cs2",
            sample: "guitar_nylon_legato_2_2",
            baseNote: "B1"
        },
        range_2: {
            lowEnd: "D2",
            highEnd: "A3",
            sample: "guitar_nylon_legato_2_7",
            baseNote: "E2"
        }
    },
    guitar_nylon_legato_3: {
        range_1: {
            lowEnd: "C2",
            highEnd: "Fs2",
            sample: "guitar_nylon_legato_3_2",
            baseNote: "E2"
        },
        range_2: {
            lowEnd: "G2",
            highEnd: "D4",
            sample: "guitar_nylon_legato_3_7",
            baseNote: "A2"
        }
    },
    guitar_nylon_legato_4: {
        range_1: {
            lowEnd: "F2",
            highEnd: "B2",
            sample: "guitar_nylon_legato_4_2",
            baseNote: "A2"
        },
        range_2: {
            lowEnd: "C3",
            highEnd: "G4",
            sample: "guitar_nylon_legato_4_7",
            baseNote: "D3"
        }
    },
    guitar_nylon_legato_5: {
        range_1: {
            lowEnd: "A2",
            highEnd: "Ds3",
            sample: "guitar_nylon_legato_5_2",
            baseNote: "Cs3"
        },
        range_2: {
            lowEnd: "E3",
            highEnd: "B4",
            sample: "guitar_nylon_legato_5_7",
            baseNote: "Fs3"
        }
    },
    guitar_nylon_legato_6: {
        range_1: {
            lowEnd: "D3",
            highEnd: "Gs3",
            sample: "guitar_nylon_legato_6_2",
            baseNote: "Fs3"
        },
        range_2: {
            lowEnd: "A3",
            highEnd: "E5",
            sample: "guitar_nylon_legato_6_7",
            baseNote: "B3"
        }
    },
    guitar_nylon_damped_1: {
        range_1: {
            lowEnd: "D-2",
            highEnd: "Gs-2",
            sample: "guitar_nylon_damped_1_2",
            baseNote: "Fs-2"
        },
        range_2: {
            lowEnd: "A-2",
            highEnd: "E0",
            sample: "guitar_nylon_damped_1_7",
            baseNote: "B-2"
        }
    },
    guitar_nylon_damped_2: {
        range_1: {
            lowEnd: "G-2",
            highEnd: "Cs-1",
            sample: "guitar_nylon_damped_2_2",
            baseNote: "B-2"
        },
        range_2: {
            lowEnd: "D-1",
            highEnd: "A0",
            sample: "guitar_nylon_damped_2_7",
            baseNote: "E-1"
        }
    },
    guitar_nylon_damped_3: {
        range_1: {
            lowEnd: "C-1",
            highEnd: "Fs-1",
            sample: "guitar_nylon_damped_3_2",
            baseNote: "E-1"
        },
        range_2: {
            lowEnd: "G-1",
            highEnd: "D1",
            sample: "guitar_nylon_damped_3_7",
            baseNote: "A-1"
        }
    },
    guitar_nylon_damped_4: {
        range_1: {
            lowEnd: "F-1",
            highEnd: "B-1",
            sample: "guitar_nylon_damped_4_2",
            baseNote: "A-1"
        },
        range_2: {
            lowEnd: "C0",
            highEnd: "G1",
            sample: "guitar_nylon_damped_4_7",
            baseNote: "D0"
        }
    },
    guitar_nylon_damped_5: {
        range_1: {
            lowEnd: "A-1",
            highEnd: "Ds0",
            sample: "guitar_nylon_damped_5_2",
            baseNote: "Cs0"
        },
        range_2: {
            lowEnd: "E0",
            highEnd: "B1",
            sample: "guitar_nylon_damped_5_7",
            baseNote: "Fs0"
        }
    },
    guitar_nylon_damped_6: {
        range_1: {
            lowEnd: "D0",
            highEnd: "Gs0",
            sample: "guitar_nylon_damped_6_2",
            baseNote: "Fs0"
        },
        range_2: {
            lowEnd: "A0",
            highEnd: "E2",
            sample: "guitar_nylon_damped_6_7",
            baseNote: "B0"
        }
    },
    guitar_steel_hard_1: {
        range_1: {
            lowEnd: "D1",
            highEnd: "Gs1",
            sample: "guitar_steel_hard_1_2",
            baseNote: "Fs1"
        },
        range_2: {
            lowEnd: "A1",
            highEnd: "E3",
            sample: "guitar_steel_hard_1_7",
            baseNote: "B1"
        }
    },
    guitar_steel_hard_2: {
        range_1: {
            lowEnd: "G1",
            highEnd: "Cs2",
            sample: "guitar_steel_hard_2_2",
            baseNote: "B1"
        },
        range_2: {
            lowEnd: "D2",
            highEnd: "A3",
            sample: "guitar_steel_hard_2_7",
            baseNote: "E2"
        }
    },
    guitar_steel_hard_3: {
        range_1: {
            lowEnd: "C2",
            highEnd: "Fs2",
            sample: "guitar_steel_hard_3_2",
            baseNote: "E2"
        },
        range_2: {
            lowEnd: "G2",
            highEnd: "D4",
            sample: "guitar_steel_hard_3_7",
            baseNote: "A2"
        }
    },
    guitar_steel_hard_4: {
        range_1: {
            lowEnd: "F2",
            highEnd: "B2",
            sample: "guitar_steel_hard_4_2",
            baseNote: "A2"
        },
        range_2: {
            lowEnd: "C3",
            highEnd: "G4",
            sample: "guitar_steel_hard_4_7",
            baseNote: "D3"
        }
    },
    guitar_steel_hard_5: {
        range_1: {
            lowEnd: "A2",
            highEnd: "Ds3",
            sample: "guitar_steel_hard_5_2",
            baseNote: "Cs3"
        },
        range_2: {
            lowEnd: "E3",
            highEnd: "B4",
            sample: "guitar_steel_hard_5_7",
            baseNote: "Fs3"
        }
    },
    guitar_steel_hard_6: {
        range_1: {
            lowEnd: "D3",
            highEnd: "Gs3",
            sample: "guitar_steel_hard_6_2",
            baseNote: "Fs3"
        },
        range_2: {
            lowEnd: "A3",
            highEnd: "E5",
            sample: "guitar_steel_hard_6_7",
            baseNote: "B3"
        }
    },
    guitar_steel_soft_1: {
        range_1: {
            sampleGain: "3",
            lowEnd: "D1",
            highEnd: "Gs1",
            sample: "guitar_steel_soft_1_2",
            baseNote: "Fs1"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "A1",
            highEnd: "E3",
            sample: "guitar_steel_soft_1_7",
            baseNote: "B1"
        }
    },
    guitar_steel_soft_2: {
        range_1: {
            sampleGain: "3",
            lowEnd: "G1",
            highEnd: "Cs2",
            sample: "guitar_steel_soft_2_2",
            baseNote: "B1"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "D2",
            highEnd: "A3",
            sample: "guitar_steel_soft_2_7",
            baseNote: "E2"
        }
    },
    guitar_steel_soft_3: {
        range_1: {
            sampleGain: "3",
            lowEnd: "C2",
            highEnd: "Fs2",
            sample: "guitar_steel_soft_3_2",
            baseNote: "E2"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "G2",
            highEnd: "D4",
            sample: "guitar_steel_soft_3_7",
            baseNote: "A2"
        }
    },
    guitar_steel_soft_4: {
        range_1: {
            sampleGain: "3",
            lowEnd: "F2",
            highEnd: "B2",
            sample: "guitar_steel_soft_4_2",
            baseNote: "A2"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "C3",
            highEnd: "G4",
            sample: "guitar_steel_soft_4_7",
            baseNote: "D3"
        }
    },
    guitar_steel_soft_5: {
        range_1: {
            sampleGain: "3",
            lowEnd: "A2",
            highEnd: "Ds3",
            sample: "guitar_steel_soft_5_2",
            baseNote: "Cs3"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "E3",
            highEnd: "B4",
            sample: "guitar_steel_soft_5_7",
            baseNote: "Fs3"
        }
    },
    guitar_steel_soft_6: {
        range_1: {
            sampleGain: "3",
            lowEnd: "D3",
            highEnd: "Gs3",
            sample: "guitar_steel_soft_6_2",
            baseNote: "Fs3"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "A3",
            highEnd: "E5",
            sample: "guitar_steel_soft_6_7",
            baseNote: "B3"
        }
    },
    guitar_steel_hard_muted_1: {
        range_1: {
            lowEnd: "D4",
            highEnd: "Gs4",
            sample: "guitar_steel_hard_muted_1_2",
            baseNote: "Fs4"
        },
        range_2: {
            lowEnd: "A4",
            highEnd: "E6",
            sample: "guitar_steel_hard_muted_1_7",
            baseNote: "B4"
        }
    },
    guitar_steel_hard_muted_2: {
        range_1: {
            lowEnd: "G4",
            highEnd: "Cs5",
            sample: "guitar_steel_hard_muted_2_2",
            baseNote: "B4"
        },
        range_2: {
            lowEnd: "D5",
            highEnd: "A6",
            sample: "guitar_steel_hard_muted_2_7",
            baseNote: "E5"
        }
    },
    guitar_steel_hard_muted_3: {
        range_1: {
            lowEnd: "C5",
            highEnd: "Fs5",
            sample: "guitar_steel_hard_muted_3_2",
            baseNote: "E5"
        },
        range_2: {
            lowEnd: "G5",
            highEnd: "D7",
            sample: "guitar_steel_hard_muted_3_7",
            baseNote: "A5"
        }
    },
    guitar_steel_hard_muted_4: {
        range_1: {
            lowEnd: "F5",
            highEnd: "B5",
            sample: "guitar_steel_hard_muted_4_2",
            baseNote: "A5"
        },
        range_2: {
            lowEnd: "C6",
            highEnd: "G7",
            sample: "guitar_steel_hard_muted_4_7",
            baseNote: "D6"
        }
    },
    guitar_steel_hard_muted_5: {
        range_1: {
            lowEnd: "A5",
            highEnd: "Ds6",
            sample: "guitar_steel_hard_muted_5_2",
            baseNote: "Cs6"
        },
        range_2: {
            lowEnd: "E6",
            highEnd: "B7",
            sample: "guitar_steel_hard_muted_5_7",
            baseNote: "Fs6"
        }
    },
    guitar_steel_hard_muted_6: {
        range_1: {
            lowEnd: "D6",
            highEnd: "Gs6",
            sample: "guitar_steel_hard_muted_6_2",
            baseNote: "Fs6"
        },
        range_2: {
            lowEnd: "A6",
            highEnd: "E8",
            sample: "guitar_steel_hard_muted_6_7",
            baseNote: "B6"
        }
    },
    guitar_steel_soft_muted_1: {
        range_1: {
            sampleGain: "3",
            lowEnd: "D4",
            highEnd: "Gs4",
            sample: "guitar_steel_soft_muted_1_2",
            baseNote: "Fs4"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "A4",
            highEnd: "E6",
            sample: "guitar_steel_soft_muted_1_7",
            baseNote: "B4"
        }
    },
    guitar_steel_soft_muted_2: {
        range_1: {
            sampleGain: "3",
            lowEnd: "G4",
            highEnd: "Cs5",
            sample: "guitar_steel_soft_muted_2_2",
            baseNote: "B4"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "D5",
            highEnd: "A6",
            sample: "guitar_steel_soft_muted_2_7",
            baseNote: "E5"
        }
    },
    guitar_steel_soft_muted_3: {
        range_1: {
            sampleGain: "3",
            lowEnd: "C5",
            highEnd: "Fs5",
            sample: "guitar_steel_soft_muted_3_2",
            baseNote: "E5"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "G5",
            highEnd: "D7",
            sample: "guitar_steel_soft_muted_3_7",
            baseNote: "A5"
        }
    },
    guitar_steel_soft_muted_4: {
        range_1: {
            sampleGain: "3",
            lowEnd: "F5",
            highEnd: "B5",
            sample: "guitar_steel_soft_muted_4_2",
            baseNote: "A5"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "C6",
            highEnd: "G7",
            sample: "guitar_steel_soft_muted_4_7",
            baseNote: "D6"
        }
    },
    guitar_steel_soft_muted_5: {
        range_1: {
            sampleGain: "3",
            lowEnd: "A5",
            highEnd: "Ds6",
            sample: "guitar_steel_soft_muted_5_2",
            baseNote: "Cs6"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "E6",
            highEnd: "B7",
            sample: "guitar_steel_soft_muted_5_7",
            baseNote: "Fs6"
        }
    },
    guitar_steel_soft_muted_6: {
        range_1: {
            sampleGain: "3",
            lowEnd: "D6",
            highEnd: "Gs6",
            sample: "guitar_steel_soft_muted_6_2",
            baseNote: "Fs6"
        },
        range_2: {
            sampleGain: "3",
            lowEnd: "A6",
            highEnd: "E8",
            sample: "guitar_steel_soft_muted_6_7",
            baseNote: "B6"
        }
    },
    guitar_steel_legato_1: {
        range_1: {
            lowEnd: "D1",
            highEnd: "Gs1",
            sample: "guitar_steel_legato_1_2",
            baseNote: "Fs1"
        },
        range_2: {
            lowEnd: "A1",
            highEnd: "E3",
            sample: "guitar_steel_legato_1_7",
            baseNote: "B1"
        }
    },
    guitar_steel_legato_2: {
        range_1: {
            lowEnd: "G1",
            highEnd: "Cs2",
            sample: "guitar_steel_legato_2_2",
            baseNote: "B1"
        },
        range_2: {
            lowEnd: "D2",
            highEnd: "A3",
            sample: "guitar_steel_legato_2_7",
            baseNote: "E2"
        }
    },
    guitar_steel_legato_3: {
        range_1: {
            lowEnd: "C2",
            highEnd: "Fs2",
            sample: "guitar_steel_legato_3_2",
            baseNote: "E2"
        },
        range_2: {
            lowEnd: "G2",
            highEnd: "D4",
            sample: "guitar_steel_legato_3_7",
            baseNote: "A2"
        }
    },
    guitar_steel_legato_4: {
        range_1: {
            lowEnd: "F2",
            highEnd: "B2",
            sample: "guitar_steel_legato_4_2",
            baseNote: "A2"
        },
        range_2: {
            lowEnd: "C3",
            highEnd: "G4",
            sample: "guitar_steel_legato_4_7",
            baseNote: "D3"
        }
    },
    guitar_steel_legato_5: {
        range_1: {
            lowEnd: "A2",
            highEnd: "Ds3",
            sample: "guitar_steel_legato_5_2",
            baseNote: "Cs3"
        },
        range_2: {
            lowEnd: "E3",
            highEnd: "B4",
            sample: "guitar_steel_legato_5_7",
            baseNote: "Fs3"
        }
    },
    guitar_steel_legato_6: {
        range_1: {
            lowEnd: "D3",
            highEnd: "Gs3",
            sample: "guitar_steel_legato_6_2",
            baseNote: "Fs3"
        },
        range_2: {
            lowEnd: "A3",
            highEnd: "E5",
            sample: "guitar_steel_legato_6_7",
            baseNote: "B3"
        }
    },
    guitar_steel_damped_1: {
        range_1: {
            lowEnd: "D-2",
            highEnd: "Gs-2",
            sample: "guitar_steel_damped_1_2",
            baseNote: "Fs-2"
        },
        range_2: {
            lowEnd: "A-2",
            highEnd: "E0",
            sample: "guitar_steel_damped_1_7",
            baseNote: "B-2"
        }
    },
    guitar_steel_damped_2: {
        range_1: {
            lowEnd: "G-2",
            highEnd: "Cs-1",
            sample: "guitar_steel_damped_2_2",
            baseNote: "B-2"
        },
        range_2: {
            lowEnd: "D-1",
            highEnd: "A0",
            sample: "guitar_steel_damped_2_7",
            baseNote: "E-1"
        }
    },
    guitar_steel_damped_3: {
        range_1: {
            lowEnd: "C-1",
            highEnd: "Fs-1",
            sample: "guitar_steel_damped_3_2",
            baseNote: "E-1"
        },
        range_2: {
            lowEnd: "G-1",
            highEnd: "D1",
            sample: "guitar_steel_damped_3_7",
            baseNote: "A-1"
        }
    },
    guitar_steel_damped_4: {
        range_1: {
            lowEnd: "F-1",
            highEnd: "B-1",
            sample: "guitar_steel_damped_4_2",
            baseNote: "A-1"
        },
        range_2: {
            lowEnd: "C0",
            highEnd: "G1",
            sample: "guitar_steel_damped_4_7",
            baseNote: "D0"
        }
    },
    guitar_steel_damped_5: {
        range_1: {
            lowEnd: "A-1",
            highEnd: "Ds0",
            sample: "guitar_steel_damped_5_2",
            baseNote: "Cs0"
        },
        range_2: {
            lowEnd: "E0",
            highEnd: "B1",
            sample: "guitar_steel_damped_5_7",
            baseNote: "Fs0"
        }
    },
    guitar_steel_damped_6: {
        range_1: {
            lowEnd: "D0",
            highEnd: "Gs0",
            sample: "guitar_steel_damped_6_2",
            baseNote: "Fs0"
        },
        range_2: {
            lowEnd: "A0",
            highEnd: "E2",
            sample: "guitar_steel_damped_6_7",
            baseNote: "B0"
        }
    },
    key_brass: {
        range_1: {
            lowEnd: "C-1",
            highEnd: "G1",
            sample: "key_brass_E1",
            baseNote: "E1"
        },
        range_2: {
            lowEnd: "Gs1",
            highEnd: "C2",
            sample: "key_brass_A1",
            baseNote: "A1"
        },
        range_3: {
            lowEnd: "Cs2",
            highEnd: "F2",
            sample: "key_brass_D2",
            baseNote: "D2"
        },
        range_4: {
            lowEnd: "Fs2",
            highEnd: "As2",
            sample: "key_brass_G2",
            baseNote: "G2"
        },
        range_5: {
            lowEnd: "B2",
            highEnd: "Ds3",
            sample: "key_brass_C3",
            baseNote: "C3"
        },
        range_6: {
            lowEnd: "E3",
            highEnd: "Gs3",
            sample: "key_brass_F3",
            baseNote: "F3"
        },
        range_7: {
            lowEnd: "A3",
            highEnd: "Cs4",
            sample: "key_brass_As3",
            baseNote: "As3"
        },
        range_8: {
            lowEnd: "D4",
            highEnd: "Fs4",
            sample: "key_brass_Ds4",
            baseNote: "Ds4"
        },
        range_9: {
            lowEnd: "G4",
            highEnd: "B4",
            sample: "key_brass_Gs4",
            baseNote: "Gs4"
        },
        range_10: {
            lowEnd: "C5",
            highEnd: "E5",
            sample: "key_brass_Cs5",
            baseNote: "Cs5"
        },
        range_11: {
            lowEnd: "F5",
            highEnd: "C7",
            sample: "key_brass_Fs5",
            baseNote: "Fs5"
        }
    },
    key_epiano: {
        range_1: {
            lowEnd: "C0",
            highEnd: "G1",
            sample: "key_epiano_E1",
            baseNote: "E1"
        },
        range_2: {
            lowEnd: "Gs1",
            highEnd: "C2",
            sample: "key_epiano_A1",
            baseNote: "A1"
        },
        range_3: {
            lowEnd: "Cs2",
            highEnd: "F2",
            sample: "key_epiano_D2",
            baseNote: "D2"
        },
        range_4: {
            lowEnd: "Fs2",
            highEnd: "As2",
            sample: "key_epiano_G2",
            baseNote: "G2"
        },
        range_5: {
            lowEnd: "B2",
            highEnd: "Ds3",
            sample: "key_epiano_C3",
            baseNote: "C3"
        },
        range_6: {
            lowEnd: "E3",
            highEnd: "Gs3",
            sample: "key_epiano_F3",
            baseNote: "F3"
        },
        range_7: {
            lowEnd: "A3",
            highEnd: "Cs4",
            sample: "key_epiano_As3",
            baseNote: "As3"
        },
        range_8: {
            lowEnd: "D4",
            highEnd: "Fs4",
            sample: "key_epiano_Ds4",
            baseNote: "Ds4"
        },
        range_9: {
            lowEnd: "G4",
            highEnd: "B4",
            sample: "key_epiano_Gs4",
            baseNote: "Gs4"
        },
        range_10: {
            lowEnd: "C5",
            highEnd: "E5",
            sample: "key_epiano_Cs5",
            baseNote: "Cs5"
        },
        range_11: {
            lowEnd: "F5",
            highEnd: "C7",
            sample: "key_epiano_Fs5",
            baseNote: "Fs5"
        }
    },
    key_seq: {
        range_1: {
            lowEnd: "C0",
            highEnd: "Fs1",
            sample: "key_seq_D1",
            baseNote: "D1"
        },
        range_2: {
            lowEnd: "G1",
            highEnd: "B1",
            sample: "key_seq_G1",
            baseNote: "G1"
        },
        range_3: {
            lowEnd: "C2",
            highEnd: "E2",
            sample: "key_seq_C2",
            baseNote: "C2"
        },
        range_4: {
            lowEnd: "F2",
            highEnd: "A2",
            sample: "key_seq_F2",
            baseNote: "F2"
        },
        range_5: {
            lowEnd: "As2",
            highEnd: "D3",
            sample: "key_seq_As2",
            baseNote: "As2"
        },
        range_6: {
            lowEnd: "Ds3",
            highEnd: "G3",
            sample: "key_seq_Ds3",
            baseNote: "Ds3"
        },
        range_7: {
            lowEnd: "Gs3",
            highEnd: "C4",
            sample: "key_seq_Gs3",
            baseNote: "Gs3"
        },
        range_8: {
            lowEnd: "Cs4",
            highEnd: "F4",
            sample: "key_seq_Cs4",
            baseNote: "Cs4"
        },
        range_9: {
            lowEnd: "Fs4",
            highEnd: "As4",
            sample: "key_seq_Fs4",
            baseNote: "Fs4"
        },
        range_10: {
            lowEnd: "B4",
            highEnd: "Ds5",
            sample: "key_seq_B4",
            baseNote: "B4"
        },
        range_11: {
            lowEnd: "E5",
            highEnd: "Gs5",
            sample: "key_seq_E5",
            baseNote: "E5"
        },
        range_12: {
            lowEnd: "A5",
            highEnd: "Cs6",
            sample: "key_seq_A5",
            baseNote: "A5"
        },
        range_13: {
            lowEnd: "D6",
            highEnd: "Fs6",
            sample: "key_seq_D6",
            baseNote: "D6"
        },
        range_14: {
            lowEnd: "G6",
            highEnd: "C7",
            sample: "key_seq_G6",
            baseNote: "G6"
        }
    },
    key_strings: {
        range_1: {
            lowEnd: "C0",
            highEnd: "G1",
            sample: "key_strings_E1",
            baseNote: "E1"
        },
        range_2: {
            lowEnd: "Gs1",
            highEnd: "C2",
            sample: "key_strings_A1",
            baseNote: "A1"
        },
        range_3: {
            lowEnd: "Cs2",
            highEnd: "F2",
            sample: "key_strings_D2",
            baseNote: "D2"
        },
        range_4: {
            lowEnd: "Fs2",
            highEnd: "As2",
            sample: "key_strings_G2",
            baseNote: "G2"
        },
        range_5: {
            lowEnd: "B2",
            highEnd: "Ds3",
            sample: "key_strings_C3",
            baseNote: "C3"
        },
        range_6: {
            lowEnd: "E3",
            highEnd: "Gs3",
            sample: "key_strings_F3",
            baseNote: "F3"
        },
        range_7: {
            lowEnd: "A3",
            highEnd: "Cs4",
            sample: "key_strings_As3",
            baseNote: "As3"
        },
        range_8: {
            lowEnd: "D4",
            highEnd: "Fs4",
            sample: "key_strings_Ds4",
            baseNote: "Ds4"
        },
        range_9: {
            lowEnd: "G4",
            highEnd: "B4",
            sample: "key_strings_Gs4",
            baseNote: "Gs4"
        },
        range_10: {
            lowEnd: "C5",
            highEnd: "E5",
            sample: "key_strings_Cs5",
            baseNote: "Cs5"
        },
        range_11: {
            lowEnd: "F5",
            highEnd: "A5",
            sample: "key_strings_Fs5",
            baseNote: "Fs5"
        },
        range_12: {
            lowEnd: "As5",
            highEnd: "C7",
            sample: "key_strings_Fs5",
            baseNote: "B5"
        }
    },
    metronome: {
        range_1: {
            lowEnd: "C0",
            highEnd: "C0",
            sample: "metronome_1",
            baseNote: "C0"
        },
        range_2: {
            lowEnd: "Cs0",
            highEnd: "Cs0",
            sample: "metronome_2",
            baseNote: "Cs0"
        },
        range_3: {
            lowEnd: "D0",
            highEnd: "D0",
            sample: "metronome_2",
            baseNote: "D0"
        },
        range_4: {
            lowEnd: "Ds0",
            highEnd: "Ds0",
            sample: "metronome_2",
            baseNote: "Ds0"
        }
    },
    piano_upright_v1: {
        range_1: {
            sampleGain: "0",
            lowEnd: "C0",
            highEnd: "E0",
            sample: "piano_upright_v1_Cs0",
            baseNote: "Cs0"
        },
        range_2: {
            sampleGain: "0",
            lowEnd: "F0",
            highEnd: "A0",
            sample: "piano_upright_v1_Fs0",
            baseNote: "Fs0"
        },
        range_3: {
            sampleGain: "0",
            lowEnd: "As0",
            highEnd: "D1",
            sample: "piano_upright_v1_B0",
            baseNote: "B0"
        },
        range_4: {
            sampleGain: "0",
            lowEnd: "Ds1",
            highEnd: "G1",
            sample: "piano_upright_v1_E1",
            baseNote: "E1"
        },
        range_5: {
            sampleGain: "0",
            lowEnd: "Gs1",
            highEnd: "C2",
            sample: "piano_upright_v1_A1",
            baseNote: "A1"
        },
        range_6: {
            sampleGain: "0",
            lowEnd: "Cs2",
            highEnd: "F2",
            sample: "piano_upright_v1_D2",
            baseNote: "D2"
        },
        range_7: {
            sampleGain: "0",
            lowEnd: "Fs2",
            highEnd: "As2",
            sample: "piano_upright_v1_G2",
            baseNote: "G2"
        },
        range_8: {
            sampleGain: "0",
            lowEnd: "B2",
            highEnd: "Ds3",
            sample: "piano_upright_v1_C3",
            baseNote: "C3"
        },
        range_9: {
            sampleGain: "0",
            lowEnd: "E3",
            highEnd: "Gs3",
            sample: "piano_upright_v1_F3",
            baseNote: "F3"
        },
        range_10: {
            sampleGain: "0",
            lowEnd: "A3",
            highEnd: "Cs4",
            sample: "piano_upright_v1_As3",
            baseNote: "As3"
        },
        range_11: {
            sampleGain: "0",
            lowEnd: "D4",
            highEnd: "Fs4",
            sample: "piano_upright_v1_Ds4",
            baseNote: "Ds4"
        },
        range_12: {
            sampleGain: "0",
            lowEnd: "G4",
            highEnd: "B4",
            sample: "piano_upright_v1_Gs4",
            baseNote: "Gs4"
        },
        range_13: {
            sampleGain: "0",
            lowEnd: "C5",
            highEnd: "E5",
            sample: "piano_upright_v1_Cs5",
            baseNote: "Cs5"
        },
        range_14: {
            sampleGain: "0",
            lowEnd: "F5",
            highEnd: "A5",
            sample: "piano_upright_v1_Fs5",
            baseNote: "Fs5"
        },
        range_15: {
            sampleGain: "0",
            lowEnd: "As5",
            highEnd: "C7",
            sample: "piano_upright_v1_B5",
            baseNote: "B5"
        }
    },
    piano_upright_v2: {
        range_1: {
            sampleGain: "6",
            lowEnd: "C0",
            highEnd: "E0",
            sample: "piano_upright_v2_Cs0",
            baseNote: "Cs0"
        },
        range_2: {
            sampleGain: "6",
            lowEnd: "F0",
            highEnd: "A0",
            sample: "piano_upright_v2_Fs0",
            baseNote: "Fs0"
        },
        range_3: {
            sampleGain: "6",
            lowEnd: "As0",
            highEnd: "D1",
            sample: "piano_upright_v2_B0",
            baseNote: "B0"
        },
        range_4: {
            sampleGain: "6",
            lowEnd: "Ds1",
            highEnd: "G1",
            sample: "piano_upright_v2_E1",
            baseNote: "E1"
        },
        range_5: {
            sampleGain: "6",
            lowEnd: "Gs1",
            highEnd: "C2",
            sample: "piano_upright_v2_A1",
            baseNote: "A1"
        },
        range_6: {
            sampleGain: "6",
            lowEnd: "Cs2",
            highEnd: "F2",
            sample: "piano_upright_v2_D2",
            baseNote: "D2"
        },
        range_7: {
            sampleGain: "6",
            lowEnd: "Fs2",
            highEnd: "As2",
            sample: "piano_upright_v2_G2",
            baseNote: "G2"
        },
        range_8: {
            sampleGain: "6",
            lowEnd: "B2",
            highEnd: "Ds3",
            sample: "piano_upright_v2_C3",
            baseNote: "C3"
        },
        range_9: {
            sampleGain: "6",
            lowEnd: "E3",
            highEnd: "Gs3",
            sample: "piano_upright_v2_F3",
            baseNote: "F3"
        },
        range_10: {
            sampleGain: "6",
            lowEnd: "A3",
            highEnd: "Cs4",
            sample: "piano_upright_v2_As3",
            baseNote: "As3"
        },
        range_11: {
            sampleGain: "6",
            lowEnd: "D4",
            highEnd: "Fs4",
            sample: "piano_upright_v2_Ds4",
            baseNote: "Ds4"
        },
        range_12: {
            sampleGain: "6",
            lowEnd: "G4",
            highEnd: "B4",
            sample: "piano_upright_v2_Gs4",
            baseNote: "Gs4"
        },
        range_13: {
            sampleGain: "6",
            lowEnd: "C5",
            highEnd: "E5",
            sample: "piano_upright_v2_Cs5",
            baseNote: "Cs5"
        },
        range_14: {
            sampleGain: "6",
            lowEnd: "F5",
            highEnd: "A5",
            sample: "piano_upright_v2_Fs5",
            baseNote: "Fs5"
        },
        range_15: {
            sampleGain: "6",
            lowEnd: "As5",
            highEnd: "C7",
            sample: "piano_upright_v2_B5",
            baseNote: "B5"
        }
    }
}