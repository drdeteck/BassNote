// lib/handlebars/base.js
var Handlebars={};Handlebars.VERSION="1.0.beta.6",Handlebars.helpers={},Handlebars.partials={},Handlebars.registerHelper=function(e,t,n){n&&(t.not=n),this.helpers[e]=t},Handlebars.registerPartial=function(e,t){this.partials[e]=t},Handlebars.registerHelper("helperMissing",function(e){if(arguments.length===2)return undefined;throw new Error("Could not find property '"+e+"'")});var toString=Object.prototype.toString,functionType="[object Function]";Handlebars.registerHelper("blockHelperMissing",function(e,t){var n=t.inverse||function(){},r=t.fn,i="",s=toString.call(e);s===functionType&&(e=e.call(this));if(e===!0)return r(this);if(e===!1||e==null)return n(this);if(s==="[object Array]"){if(e.length>0)for(var o=0,u=e.length;o<u;o++)i+=r(e[o]);else i=n(this);return i}return r(e)}),Handlebars.registerHelper("each",function(e,t){var n=t.fn,r=t.inverse,i="";if(e&&e.length>0)for(var s=0,o=e.length;s<o;s++)i+=n(e[s]);else i=r(this);return i}),Handlebars.registerHelper("if",function(e,t){var n=toString.call(e);return n===functionType&&(e=e.call(this)),!e||Handlebars.Utils.isEmpty(e)?t.inverse(this):t.fn(this)}),Handlebars.registerHelper("unless",function(e,t){var n=t.fn,r=t.inverse;return t.fn=r,t.inverse=n,Handlebars.helpers["if"].call(this,e,t)}),Handlebars.registerHelper("with",function(e,t){return t.fn(e)}),Handlebars.registerHelper("log",function(e){Handlebars.log(e)}),Handlebars.Exception=function(e){var t=Error.prototype.constructor.apply(this,arguments);for(var n in t)t.hasOwnProperty(n)&&(this[n]=t[n]);this.message=t.message},Handlebars.Exception.prototype=new Error,Handlebars.SafeString=function(e){this.string=e},Handlebars.SafeString.prototype.toString=function(){return this.string.toString()},function(){var e={"<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},t=/&(?!\w+;)|[<>"'`]/g,n=/[&<>"'`]/,r=function(t){return e[t]||"&amp;"};Handlebars.Utils={escapeExpression:function(e){return e instanceof Handlebars.SafeString?e.toString():e==null||e===!1?"":n.test(e)?e.replace(t,r):e},isEmpty:function(e){return typeof e=="undefined"?!0:e===null?!0:e===!1?!0:Object.prototype.toString.call(e)==="[object Array]"&&e.length===0?!0:!1}}}(),Handlebars.VM={template:function(e){var t={escapeExpression:Handlebars.Utils.escapeExpression,invokePartial:Handlebars.VM.invokePartial,programs:[],program:function(e,t,n){var r=this.programs[e];return n?Handlebars.VM.program(t,n):r?r:(r=this.programs[e]=Handlebars.VM.program(t),r)},programWithDepth:Handlebars.VM.programWithDepth,noop:Handlebars.VM.noop};return function(n,r){return r=r||{},e.call(t,Handlebars,n,r.helpers,r.partials,r.data)}},programWithDepth:function(e,t,n){var r=Array.prototype.slice.call(arguments,2);return function(n,i){return i=i||{},e.apply(this,[n,i.data||t].concat(r))}},program:function(e,t){return function(n,r){return r=r||{},e(n,r.data||t)}},noop:function(){return""},invokePartial:function(e,t,n,r,i,s){options={helpers:r,partials:i,data:s};if(e===undefined)throw new Handlebars.Exception("The partial "+t+" could not be found");if(e instanceof Function)return e(n,options);if(!Handlebars.compile)throw new Handlebars.Exception("The partial "+t+" could not be compiled when running in runtime-only mode");return i[t]=Handlebars.compile(e),i[t](n,options)}},Handlebars.template=Handlebars.VM.template;

(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['accept.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"welcome\">\n  \n  <div id=\"logo\"></div>\n  <p id=\"tagline\">";
  foundHelper = helpers.tagline;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.tagline; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n  \n  <div id=\"messages\">\n    <p class=\"invite-message message_default\" id=\"message_noname\" data-t=\"message_noname\">";
  foundHelper = helpers.message_noname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.message_noname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n    <p class=\"invite-message\" id=\"message_invited\" data-t=\"message_invited\">";
  foundHelper = helpers.message_invited;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.message_invited; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n    <p class=\"invite-message\" id=\"message_playing\" data-t=\"message_playing\">";
  foundHelper = helpers.message_playing;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.message_playing; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n    <p class=\"invite-message\" id=\"message_left\" data-t=\"message_left\">";
  foundHelper = helpers.message_left;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.message_left; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n    <p class=\"invite-message\" id=\"message_left_noname\" data-t=\"message_left_noname\">";
  foundHelper = helpers.message_left_noname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.message_left_noname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n    <p class=\"invite-message\" id=\"message_full_noname\" data-t=\"message_full_noname\">";
  foundHelper = helpers.message_full_noname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.message_full_noname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n    <p class=\"invite-message\" id=\"message_full\" data-t=\"message_full\">";
  foundHelper = helpers.message_full;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.message_full; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n    <p class=\"invite-message\" id=\"message_ended\" data-t=\"message_ended\">";
  foundHelper = helpers.message_ended;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.message_ended; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n  </div>\n  \n  <h3 id=\"own\" ><a href=\"#/\" data-t=\"start_own_session\">";
  foundHelper = helpers.start_own_session;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.start_own_session; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</a></h3>\n  \n  <div id=\"chrome-experiment\">\n    <a href=\"http://www.chromeexperiments.com/\" target=\"_blank\">\n      <img src=\"http://chrome-jam-static.commondatastorage.googleapis.com/img/interface/chrome-experiment.png\" title=\"";
  foundHelper = helpers.chrome_experiment;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.chrome_experiment; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">\n    </a>\n  </div>\n  \n</div>\n\n<div id=\"chevron-holder\">\n  <div id=\"chevron-intro\">\n    <div id=\"bottom-fill\"></div>\n  </div>\n  <div id=\"enter\" class=\"button\" data-t=\"enter\">";
  foundHelper = helpers.enter;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.enter; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n</div>";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['bass.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <ul class=\"key_string\">\n                ";
  stack1 = depth0.keys;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(2, program2, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            </ul>\n            ";
  return buffer;}
function program2(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                <li id=\"hint-";
  stack1 = depth0['v'];
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\" class=\"string_note hint\" data-note=\"";
  stack1 = depth0['n'];
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\">";
  stack1 = depth0['n'];
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "</li>\n                ";
  return buffer;}

function program4(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <ul class=\"key_string\">\n                ";
  stack1 = depth0.keys;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(5, program5, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            </ul>\n            ";
  return buffer;}
function program5(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                <li id=\"hint-";
  stack1 = depth0['v'];
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\" class=\"string_note hint\" data-note=\"";
  stack1 = depth0['n'];
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\">";
  stack1 = depth0['n'];
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "</li>\n                ";
  return buffer;}

  buffer += "<div id=\"";
  foundHelper = helpers.instrument_ident;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instrument_ident; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" class=\"";
  foundHelper = helpers.instrument_type;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instrument_type; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " instrument_holder\" data-instrument=\"";
  foundHelper = helpers.instrument_type;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instrument_type; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">\n\n    <div class=\"fretboard\"></div>\n    <div class=\"head\"></div>\n\n    <div id=\"strumboard\" class=\"canvas_holder easy_tour playarea\" data-tip=\"play_strings\" data-related=\"strings_part\"></div>\n\n\n    <div id=\"hints\" class=\"pro_tour hint_holder\" data-tip=\"keys_strings\" data-related=\"string_hints\">\n\n        <div id=\"hints-strings\" class=\"string_hints pro_tour\" data-tip=\"frets_bass\" data-related=\"hint_holder\"\n             data-vert=\"below\">\n            ";
  stack1 = depth0.string_hints;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </div>\n\n        <div id=\"hints-frets\" class=\"string_hints\">\n            ";
  stack1 = depth0.fret_hints;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(4, program4, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </div>\n\n    </div>\n\n    <div id=\"modes\">\n        <div id=\"mode-switch\">\n            ";
  stack1 = {};
  stack1['action'] = "toggleMode";
  stack1['title'] = "easypro_alt";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "mode", {hash:stack1}) : helperMissing.call(depth0, "interface", "mode", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n            <div class=\"chord_label knob_label\" data-t=\"instrument_mode\">";
  foundHelper = helpers.instrument_mode;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instrument_mode; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n        </div>\n\n        <div id=\"key-hints\">\n            ";
  stack1 = {};
  stack1['action'] = "toggleHints";
  stack1['count'] = "2";
  stack1['val'] = "1";
  stack1['title'] = "keyboard_hints_alt";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "radio", {hash:stack1}) : helperMissing.call(depth0, "interface", "radio", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n            <div class=\"chord_label knob_label\" data-t=\"key_hints\">";
  foundHelper = helpers.key_hints;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.key_hints; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n        </div>\n    </div>\n\n    <div id=\"patterns\" class=\"easy_tour ap_part\" data-tip=\"change_pattern\" data-related=\"pattern_part\">\n        ";
  stack1 = {};
  stack1['action'] = "changePattern";
  stack1['count'] = "5";
  stack1['val'] = "1";
  stack1['qwerty'] = "qwert";
  stack1['title'] = "pattern_alt";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "radio", {hash:stack1}) : helperMissing.call(depth0, "interface", "radio", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n        <div class=\"chord_label knob_label autoplay_tour\" data-t=\"autoplay\" data-tip=\"autoplay_tip_bass\" data-related=\"ap_part\" data-vert=\"below\">";
  foundHelper = helpers.autoplay;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.autoplay; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n        ";
  stack1 = {};
  stack1['action'] = "changePattern";
  stack1['count'] = "5";
  stack1['val'] = "1";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "hint", {hash:stack1}) : helperMissing.call(depth0, "interface", "hint", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n    </div>\n\n    <div id=\"chords\" class=\"easy_tour\" data-tip=\"change_chord\" data-related=\"chord_part\">\n        ";
  stack1 = {};
  stack1['action'] = "changeChords";
  stack1['count'] = "6";
  stack1['title'] = "chords_alt";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "radio", {hash:stack1}) : helperMissing.call(depth0, "interface", "radio", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n        <div class=\"chord_label knob_label\" data-t=\"chords\">";
  foundHelper = helpers.chords;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.chords; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n        ";
  stack1 = {};
  stack1['action'] = "changeChords";
  stack1['count'] = "6";
  stack1['qwerty'] = "qwerty";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "hint", {hash:stack1}) : helperMissing.call(depth0, "interface", "hint", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n    </div>\n\n    <div id=\"knobs\">\n        <div id=\"effects\">\n            ";
  stack1 = {};
  stack1['action'] = "fx1";
  stack1['min'] = "0";
  stack1['val'] = "0";
  stack2 = depth0.fx1;
  stack1['label'] = stack2;
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "knob", {hash:stack1}) : helperMissing.call(depth0, "interface", "knob", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n            ";
  stack1 = {};
  stack1['action'] = "fx2";
  stack1['min'] = "0";
  stack1['val'] = "0";
  stack2 = depth0.fx2;
  stack1['label'] = stack2;
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "knob", {hash:stack1}) : helperMissing.call(depth0, "interface", "knob", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n        </div>\n    </div>\n\n</div>\n\n";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['chat.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"dragger\"></div>\n<div id=\"title\">\n    <h3 data-t=\"jam_chat\">";
  foundHelper = helpers.jam_chat;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.jam_chat; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</h3>\n    <div class=\"close_btn\" id=\"close-chat\"></div>\n</div>\n<div id=\"chat-container\">\n    <div id=\"chat\" class=\"scrollbar-container\">\n        <div class=\"scrollbar\">\n            <div class=\"track\">\n                <div class=\"thumb\">\n                    <div class=\"end\">\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div class=\"viewport\">\n            <ul class=\"overview\">\n\n                   \n            </ul>\n        </div>\n    </div>\n    <textarea id=\"chat-input\" maxlength=\"75\" data-t=\"type_msg_here\" placeholder=\"";
  foundHelper = helpers.type_msg_here;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.type_msg_here; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"></textarea>\n</div>";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['drums.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n        <div id=\"_drum_";
  stack1 = depth0.drum;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\" class=\"drum drum-";
  stack1 = depth0.drum;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\" data-notes=\"";
  stack1 = depth0.drum;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\"></div>\n        ";
  return buffer;}

  buffer += "<div id=\"";
  foundHelper = helpers.instrument_ident;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instrument_ident; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" class=\"";
  foundHelper = helpers.instrument_type;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instrument_type; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " instrument_holder\" data-instrument=\"";
  foundHelper = helpers.instrument_type;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instrument_type; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">\n\n    <div id=\"paintboard\" class=\"canvas_holder easy_tour\" data-tip=\"play_drums\" data-related=\"drum\"\n         data-top-offset=\"150\"></div>\n    <div id=\"drums\" class=\"playarea\">\n        ";
  stack1 = depth0.collection;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </div>\n\n    <div id=\"controls\">\n        <div id=\"mode-switch\">\n            ";
  stack1 = {};
  stack1['action'] = "toggleMode";
  stack1['title'] = "easypro_alt";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "mode", {hash:stack1}) : helperMissing.call(depth0, "interface", "mode", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n            <div class=\"chord_label knob_label\" data-t=\"instrument_mode\">";
  foundHelper = helpers.instrument_mode;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instrument_mode; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n        </div>\n        <div id=\"key-hints\" class=\"button-container\" class=\"control\">\n            ";
  stack1 = {};
  stack1['action'] = "toggleHints";
  stack1['count'] = "2";
  stack1['val'] = "1";
  stack1['title'] = "keyboard_hints_alt";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "radio", {hash:stack1}) : helperMissing.call(depth0, "interface", "radio", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n            <div class=\"chord_label knob_label\" data-t=\"key_hints\">";
  foundHelper = helpers.key_hints;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.key_hints; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n        </div>\n\n        <div id=\"patterns\" class=\"control easy_tour ap_part\" data-tip=\"change_pattern\" data-related=\"pattern_part\"\n             data-horz=\"right\" data-vert=\"below\">\n            ";
  stack1 = {};
  stack1['action'] = "changePattern";
  stack1['count'] = "5";
  stack1['val'] = "1";
  stack1['qwerty'] = "qwert";
  stack1['title'] = "pattern_alt";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "radio", {hash:stack1}) : helperMissing.call(depth0, "interface", "radio", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n            <div class=\"chord_label knob_label autoplay_tour\" data-t=\"autoplay\" data-tip=\"autoplay_tip_drums\" data-related=\"ap_part\" data-vert=\"below\">";
  foundHelper = helpers.autoplay;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.autoplay; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n\n            ";
  stack1 = {};
  stack1['action'] = "changePattern";
  stack1['count'] = "5";
  stack1['val'] = "1";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "hint", {hash:stack1}) : helperMissing.call(depth0, "interface", "hint", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n        </div>\n\n        <div id=\"knobs\" class=\"control\">\n            ";
  stack1 = {};
  stack1['action'] = "fx1";
  stack1['min'] = "0";
  stack1['val'] = "0";
  stack2 = depth0.fx1;
  stack1['label'] = stack2;
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "knob", {hash:stack1}) : helperMissing.call(depth0, "interface", "knob", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n            ";
  stack1 = {};
  stack1['action'] = "fx2";
  stack1['min'] = "0";
  stack1['val'] = "0";
  stack2 = depth0.fx2;
  stack1['label'] = stack2;
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "knob", {hash:stack1}) : helperMissing.call(depth0, "interface", "knob", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n        </div>\n    </div>\n\n    <div id=\"hihat-lock\">\n        <div class=\"chord_label knob_label\" data-t=\"hihat\">";
  foundHelper = helpers.hihat;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.hihat; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n        ";
  stack1 = {};
  stack1['action'] = "changeLock";
  stack1['max'] = "3";
  stack1['val'] = "0";
  stack1['label'] = "lock";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "lock", {hash:stack1}) : helperMissing.call(depth0, "interface", "lock", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n    </div>\n\n    <div id=\"hints\" class=\"pro_tour\" data-tip=\"keys_drums\" data-top-offset=\"150\" data-left-offset=\"360\"></div>\n\n</div>\n\n";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['ended.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"ended\">\n  <div id=\"jam-logo\" title=\"";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"></div>\n\n  <p id=\"thanks\" data-t=\"ended\">";
  foundHelper = helpers.ended;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.ended; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n\n  <div id=\"newjam\">\n    <a id=\"start-new\" href=\"/select/\" class=\"button-skin\" data-t=\"start_new\">";
  foundHelper = helpers.start_new;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.start_new; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</a>\n  </div>\n\n  <p id=\"share-it\" data-t=\"share_w_friends\">";
  foundHelper = helpers.share_w_friends;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.share_w_friends; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n\n  <div id=\"share\">\n    <ul>\n      <li id=\"gplus\" class=\"social\"></li>\n      <li id=\"facebook\" class=\"social\"></li>\n      <li id=\"twitter\" class=\"social\"></li>\n    </ul>\n  </div>\n</div>";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['error.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"welcome\">\n\n  <div id=\"logo\"></div>\n  <p id=\"tagline\" data-t=\"tagline\">";
  foundHelper = helpers.tagline;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.tagline; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n\n  <div id=\"messages\">\n    <p class=\"invite-message message_default\">\n      <span data-t=\"plumbing_1\">";
  foundHelper = helpers.plumbing_1;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.plumbing_1; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span>\n      <span data-t=\"plumbing_2\">";
  foundHelper = helpers.plumbing_2;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.plumbing_2; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span>\n      <span data-t=\"plumbing_3\">";
  foundHelper = helpers.plumbing_3;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.plumbing_3; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span>\n    </p>\n  </div>\n\n\n  <div id=\"chrome-experiment\">\n    <a href=\"http://www.chromeexperiments.com/\" target=\"_blank\" title=\"";
  foundHelper = helpers.chrome_experiment;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.chrome_experiment; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"></a>\n  </div>\n\n</div>\n\n<div id=\"chevron-holder\">\n  <div id=\"chevron-intro\">\n    <div id=\"bottom-fill\"></div>\n  </div>\n  <div id=\"enter\" class=\"button\" data-t=\"try_again\">";
  foundHelper = helpers.try_again;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.try_again; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n</div>";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['footer.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<ul class=\"right\">\n\n    <li id=\"chrome\" class=\"right\">\n        <a href=\"http://www.google.com/chrome/jam\" target=\"_blank\">\n          <img src=\"http://chrome-jam-static.commondatastorage.googleapis.com/img/interface/chrome.png\"></a>\n    </li>\n\n    <li class=\"footer-social-button right\" id=\"twitter\">\n            <img src=\"http://chrome-jam-static.commondatastorage.googleapis.com/img/interface/twitter.png\"/>\n        <div>\n        <svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" id=\"easy\">\n            <polygon class=\"bg\" points=\" 11,0 48,0 37,28 0,28 \" fill=\"#ce5e1f\"/>\n            <polygon class=\"up\" points=\" 48,0 37,28 0,28 \" fill=\"#b74621\"/>\n            <polygon class=\"up\" points=\" 11,0 0,28 3,26 \" fill=\"#ecbe8b\"/>\n            <polygon class=\"up\" points=\" 48,0 37,28 45,2 \" fill=\"#711c1c\"/>\n        </svg>\n        </div>\n    </li>\n    <li class=\"footer-social-button right\" id=\"facebook\">\n            <img src=\"http://chrome-jam-static.commondatastorage.googleapis.com/img/interface/facebook.png\"/>\n        <div>\n        <svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" id=\"easy\">\n            <polygon class=\"bg\" points=\" 11,0 48,0 37,28 0,28 \" fill=\"#ce5e1f\"/>\n            <polygon class=\"up\" points=\" 48,0 37,28 0,28 \" fill=\"#b74621\"/>\n            <polygon class=\"up\" points=\" 11,0 0,28 3,26 \" fill=\"#ecbe8b\"/>\n            <polygon class=\"up\" points=\" 48,0 37,28 45,2 \" fill=\"#711c1c\"/>\n        </svg>\n        </div>\n    </li>\n    <li class=\"footer-social-button right\" id=\"gplus\">\n            <img src=\"http://chrome-jam-static.commondatastorage.googleapis.com/img/interface/g-plus.png\"/>\n        <div>\n        <svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" id=\"easy\">\n            <polygon class=\"bg\" points=\" 11,0 48,0 37,28 0,28 \" fill=\"#ce5e1f\"/>\n            <polygon class=\"up\" points=\" 48,0 37,28 0,28 \" fill=\"#b74621\"/>\n            <polygon class=\"up\" points=\" 11,0 0,28 3,26 \" fill=\"#ecbe8b\"/>\n            <polygon class=\"up\" points=\" 48,0 37,28 45,2 \" fill=\"#711c1c\"/>\n        </svg>\n        </div>\n    </li>\n</ul>\n\n<ul class=\"left\">\n    <li id=\"terms\" class=\"left\">\n        <a href=\"https://www.google.com/policies/\" target=\"_blank\" data-t=\"terms_privacy\">";
  foundHelper = helpers.terms_privacy;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.terms_privacy; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</a>\n    </li>\n    <li id=\"technology\" class=\"left\">\n        <a href=\"/technology\" target=\"_blank\" data-t=\"technology\">";
  foundHelper = helpers.technology;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.technology; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</a>\n    </li>\n    <li id=\"language-selector\" class=\"left\"><a data-lang=\"";
  foundHelper = helpers.code;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.code; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" class=\"selected\">";
  foundHelper = helpers.language;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.language; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</a> <span>|</span>\n    <a data-lang=\"en\" href=\"#\">english</a>\n    </li>\n</ul>\n";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['guitar.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <ul class=\"key_string\">\n                ";
  stack1 = depth0.keys;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(2, program2, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            </ul>\n            ";
  return buffer;}
function program2(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                <li id=\"hint-";
  stack1 = depth0['v'];
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\" class=\"string_note hint\" data-note=\"";
  stack1 = depth0['n'];
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\">";
  stack1 = depth0['n'];
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "</li>\n                ";
  return buffer;}

function program4(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <ul class=\"key_string\">\n                ";
  stack1 = depth0.keys;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(5, program5, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            </ul>\n            ";
  return buffer;}
function program5(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                <li id=\"hint-";
  stack1 = depth0['v'];
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\" class=\"string_note hint\" data-note=\"";
  stack1 = depth0['n'];
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\">";
  stack1 = depth0['n'];
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "</li>\n                ";
  return buffer;}

  buffer += "<div id=\"";
  foundHelper = helpers.instrument_ident;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instrument_ident; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" class=\"";
  foundHelper = helpers.instrument_type;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instrument_type; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " instrument_holder\" data-instrument=\"";
  foundHelper = helpers.instrument_type;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instrument_type; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">\n\n\n    <div class=\"fretboard\"></div>\n    <div class=\"head\"></div>\n\n    <div id=\"strumboard\" class=\"canvas_holder easy_tour playarea\" data-tip=\"play_strings\" data-related=\"strings_part\"></div>\n\n    <div id=\"hints\" class=\"pro_tour hint_holder\" data-tip=\"keys_strings\" data-related=\"string_hints\">\n\n        <div id=\"hints-strings\" class=\"string_hints pro_tour\" data-tip=\"frets_strings\" data-related=\"hint_holder\"\n             data-vert=\"below\">\n            ";
  stack1 = depth0.string_hints;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </div>\n\n        <div id=\"hints-frets\" class=\"string_hints\">\n            ";
  stack1 = depth0.fret_hints;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(4, program4, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </div>\n\n    </div>\n\n    <div id=\"modes\">\n        <div id=\"mode-switch\">\n            ";
  stack1 = {};
  stack1['action'] = "toggleMode";
  stack1['title'] = "easypro_alt";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "mode", {hash:stack1}) : helperMissing.call(depth0, "interface", "mode", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n            <div class=\"chord_label knob_label\" data-t=\"instrument_mode\">";
  foundHelper = helpers.instrument_mode;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instrument_mode; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n        </div>\n\n        <div id=\"key-hints\">\n            ";
  stack1 = {};
  stack1['action'] = "toggleHints";
  stack1['count'] = "2";
  stack1['val'] = "1";
  stack1['title'] = "keyboard_hints_alt";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "radio", {hash:stack1}) : helperMissing.call(depth0, "interface", "radio", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n            <div class=\"chord_label knob_label\" data-t=\"key_hints\">";
  foundHelper = helpers.key_hints;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.key_hints; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n        </div>\n    </div>\n\n    <div id=\"patterns\" class=\"easy_tour ap_part\" data-tip=\"change_pattern\" data-related=\"pattern_part\" data-vert=\"below\">\n        ";
  stack1 = {};
  stack1['action'] = "changePattern";
  stack1['count'] = "5";
  stack1['val'] = "1";
  stack1['qwerty'] = "qwert";
  stack1['title'] = "pattern_alt";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "radio", {hash:stack1}) : helperMissing.call(depth0, "interface", "radio", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n        <div class=\"chord_label knob_label autoplay_tour\" data-t=\"autoplay\" data-tip=\"autoplay_tip_guitar\" data-related=\"ap_part\" data-vert=\"below\">";
  foundHelper = helpers.autoplay;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.autoplay; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n        ";
  stack1 = {};
  stack1['action'] = "changePattern";
  stack1['count'] = "5";
  stack1['val'] = "1";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "hint", {hash:stack1}) : helperMissing.call(depth0, "interface", "hint", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n    </div>\n\n    <div id=\"chords\" class=\"easy_tour\" data-tip=\"change_chord\" data-related=\"chord_part\">\n        ";
  stack1 = {};
  stack1['action'] = "changeChords";
  stack1['count'] = "6";
  stack1['title'] = "chords_alt";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "radio", {hash:stack1}) : helperMissing.call(depth0, "interface", "radio", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n        <div class=\"chord_label knob_label\" data-t=\"chords\">";
  foundHelper = helpers.chords;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.chords; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n\n        ";
  stack1 = {};
  stack1['action'] = "changeChords";
  stack1['count'] = "6";
  stack1['qwerty'] = "qwerty";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "hint", {hash:stack1}) : helperMissing.call(depth0, "interface", "hint", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n    </div>\n\n    <div id=\"knobs\">\n        <div id=\"effects\">\n            ";
  stack1 = {};
  stack1['action'] = "fx1";
  stack1['min'] = "0";
  stack1['val'] = "0";
  stack2 = depth0.fx1;
  stack1['label'] = stack2;
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "knob", {hash:stack1}) : helperMissing.call(depth0, "interface", "knob", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n            ";
  stack1 = {};
  stack1['action'] = "fx2";
  stack1['min'] = "0";
  stack1['val'] = "0";
  stack2 = depth0.fx2;
  stack1['label'] = stack2;
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "knob", {hash:stack1}) : helperMissing.call(depth0, "interface", "knob", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n        </div>\n\n    </div>\n\n</div>\n";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['header.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n      <li class=\"instrument_thumb ";
  stack1 = depth0.ident;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\" data-value=\"";
  stack1 = depth0.ident;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\">\n      <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"115px\" height=\"64px\" class=\"masker\">\n        <polygon class=\"mask_item\" points=\"35,0 115,0 80,65, 0,65\" data-ident=\"";
  stack1 = depth0.ident;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\" data-tip=\"";
  stack1 = depth0.name;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\"/>\n      </svg>\n      <div class=\"menu_tip\" data-ident=\"";
  stack1 = depth0.ident;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\"><div class=\"tt_content\"><div class=\"tt_text\" data-t=\"";
  stack1 = depth0.fullname;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\">";
  stack1 = depth0.fullname;
  foundHelper = helpers.I18n;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "I18n", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "</div></div><div class=\"tt_arrow_bottom\"></div></div>\n      </li>\n    ";
  return buffer;}

  buffer += "<div id=\"change-instruments\">\n  <ul id=\"instrumentSwitcher\">\n    ";
  stack1 = depth0.instruments;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  </ul>\n</div>\n<nav id=\"header-controls\" class=\"up\">\n\n  <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"814px\" height=\"100px\">\n      <defs>\n        <clipPath id=\"left\">\n           <polygon points=\"0,0 79,0 111,55, 32,55\" />\n        </clipPath>\n        <clipPath id=\"right\">\n           <polygon points=\"32,0 111,0 79,55, 0,55\" />\n        </clipPath>\n        <clipPath id=\"triangle\">\n           <polygon points=\"0,0 116,0 58,100\" />\n        </clipPath>\n\n        <clipPath id=\"left-slider\">\n           <polygon points=\"0,0 200,0 233,55, 31,55\" />\n        </clipPath>\n\n        <clipPath id=\"right-slider\">\n           <polygon points=\"33,0 383,0 351,55, 0,55\" />\n        </clipPath>\n\n      </defs>\n      <g id=\"metronome\" transform=\"translate(0,0)\" clip-path=\"url(#left)\" class=\"menu_item\">\n\n        <g>\n          <rect class=\"label_box\" width=\"111\" height=\"16\" />\n          <foreignobject x=\"0\" y=\"0\" width=\"90\" height=\"16\">\n            <div class=\"label\" data-t=\"metronome\" title=\"";
  foundHelper = helpers.metronome_alt;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.metronome_alt; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">";
  foundHelper = helpers.metronome;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.metronome; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n          </foreignobject>\n        </g>\n\n        <g transform=\"translate(0,16)\">\n          <rect class=\"bg\" width=\"111\"  height=\"39\" />\n\n          <polygon class=\"slider\" points=\"0,4 35,4 53,35, 19,35\" transform=\"translate(51,0)\" />\n\n          <foreignobject x=\"23\" y=\"0\" width=\"38\" height=\"38\">\n            <div class=\"slider-on\" title=\"";
  foundHelper = helpers.on;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.on; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">on</div>\n          </foreignobject>\n\n          <foreignobject x=\"59\" y=\"0\" width=\"38\" height=\"38\">\n            <div class=\"slider-off active\" title=\"";
  foundHelper = helpers.off;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.off; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">off</div>\n          </foreignobject>\n        </g>\n\n      </g>\n\n      <g id=\"tempo\" transform=\"translate(87,0)\" clip-path=\"url(#left)\" class=\"menu_item\" >\n\n        <g>\n          <rect class=\"label_box\" width=\"111\" height=\"16\" />\n          <foreignobject x=\"0\" y=\"0\" width=\"90\" height=\"16\">\n            <div class=\"label\" title=\"";
  foundHelper = helpers.tempo_alt;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.tempo_alt; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" data-t=\"tempo\">";
  foundHelper = helpers.tempo;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.tempo; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n          </foreignobject>\n        </g>\n\n        <g transform=\"translate(0,16)\">\n          <rect class=\"bg\" width=\"111\"  height=\"39\"/>\n\n          <foreignobject x=\"12\" y=\"0\" width=\"90\" height=\"38\">\n            <div class=\"read-out\">120</div>\n          </foreignobject>\n        </g>\n\n      </g>\n\n      <g clip-path=\"url(#left-slider)\" transform=\"translate(166,0)\">\n        <g id=\"tempo-slide\" transform=\"translate(-233,0)\" clip-path=\"url(#left-slider)\">\n\n          <g>\n            <rect class=\"label_box\" width=\"233\" height=\"16\" />\n            <foreignobject x=\"0\" y=\"0\" width=\"215\" height=\"16\">\n              <div class=\"label\"></div>\n            </foreignobject>\n          </g>\n\n          <g transform=\"translate(0,16)\">\n            <rect class=\"bg\" width=\"233\"  height=\"39\"/>\n\n            <foreignobject x=\"12\" y=\"0\" width=\"220\" height=\"38\"></foreignobject>\n          </g>\n\n        </g>\n      </g>\n\n      <g id=\"current-instrument\" transform=\"translate(174,0)\" clip-path=\"url(#triangle)\" class=\"menu_item\">\n        <g>\n          <rect class=\"label_box\" width=\"116\" height=\"16\" />\n          <foreignobject x=\"0\" y=\"0\" width=\"116\" height=\"16\">\n            <div class=\"label\" data-t=\"instrument\" title=\"";
  foundHelper = helpers.current_alt;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.current_alt; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">";
  foundHelper = helpers.instrument;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instrument; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n          </foreignobject>\n        </g>\n\n        <g transform=\"translate(0,16)\">\n          <rect class=\"bg\" width=\"116\"  height=\"84\" />\n\n          <foreignobject x=\"18\" y=\"5\" width=\"84\" height=\"83\">\n            <div id=\"current-instrument-holder\"></div>\n          </foreignobject>\n        </g>\n\n      </g>\n\n      <g id=\"key\" transform=\"translate(266,0)\" clip-path=\"url(#right)\" class=\"menu_item\" >\n\n        <g>\n          <rect class=\"label_box\" width=\"111\" height=\"16\" />\n          <foreignobject x=\"22\" y=\"0\" width=\"90\" height=\"16\">\n            <div class=\"label\" data-t=\"key\" title=\"";
  foundHelper = helpers.key_alt;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.key_alt; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">";
  foundHelper = helpers.key;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.key; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n          </foreignobject>\n        </g>\n\n        <g transform=\"translate(0,16)\">\n          <rect class=\"bg\" width=\"111\"  height=\"39\" />\n\n          <foreignobject x=\"10\" y=\"0\" width=\"90\" height=\"38\">\n            <div class=\"read-out\">E</div>\n          </foreignobject>\n        </g>\n\n      </g>\n\n      <g clip-path=\"url(#right-slider)\" transform=\"translate(344,0)\">\n        <g id=\"key-slide\" transform=\"translate(-383,0)\" clip-path=\"url(#right-slider)\">\n\n          <g>\n            <rect class=\"label_box\" width=\"383\" height=\"16\" />\n            <foreignobject x=\"22\" y=\"0\" width=\"348\" height=\"16\">\n              <div class=\"closer\">x</div>\n              <div class=\"label\" data-t=\"select_key\">";
  foundHelper = helpers.select_key;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.select_key; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n            </foreignobject>\n          </g>\n\n          <g transform=\"translate(0,16)\">\n            <rect class=\"bg\" width=\"383\"  height=\"39\"/>\n            ";
  foundHelper = helpers['key-triangles'];
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0['key-triangles']; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n\n            <g transform=\"translate(272,0)\">\n              <polygon id=\"key-slider\" class=\"slider\" points=\"18,4 52,4 34,35, 0,35\" transform=\"translate(8,0)\" />\n\n              <foreignobject x=\"14\" y=\"0\" width=\"38\" height=\"38\">\n                <div id=\"key-maj\" class=\"slider-on active\" title=\"";
  foundHelper = helpers.major;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.major; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">maj</div>\n              </foreignobject>\n\n              <foreignobject x=\"48\" y=\"0\" width=\"38\" height=\"38\">\n                <div id=\"key-min\" class=\"slider-off\" title=\"";
  foundHelper = helpers.minor;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.minor; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">min</div>\n              </foreignobject>\n            </g>\n\n          </g>\n\n\n        </g>\n      </g>\n\n      <g id=\"help\" transform=\"translate(353,0)\" clip-path=\"url(#right)\" data-tip=\"get_help\" data-vert=\"below\" data-related=\"help_tour\" data-top-offset=\"65\" data-left-offset=\"45\" class=\"header_tour\">\n\n        <g>\n          <rect class=\"label_box\" width=\"111\" height=\"16\" />\n          <foreignobject x=\"22\" y=\"0\" width=\"90\" height=\"16\">\n            <div class=\"label\" data-t=\"help\">";
  foundHelper = helpers.help;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.help; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n          </foreignobject>\n        </g>\n\n        <g transform=\"translate(0,16)\">\n          <rect class=\"bg\" width=\"111\"  height=\"39\" />\n\n          <polygon class=\"slider\" points=\"18,4 52,4 34,35, 0,35\" transform=\"translate(42,0)\" />\n\n          <foreignobject x=\"12\" y=\"0\" width=\"38\" height=\"38\">\n            <div class=\"slider-on\" title=\"";
  foundHelper = helpers.on;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.on; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">on</div>\n          </foreignobject>\n\n          <foreignobject x=\"50\" y=\"0\" width=\"38\" height=\"38\">\n            <div class=\"slider-off active\" title=\"";
  foundHelper = helpers.off;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.off; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">off</div>\n          </foreignobject>\n        </g>\n\n      </g>\n\n  </svg>\n\n  <div id=\"tempo-controls\">\n    <div id=\"tempo-controls-inner\">\n      <div class=\"closer\">x</div>\n      <div class=\"label\"><input id=\"bpm\" value=\"";
  foundHelper = helpers.new_tempo;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.new_tempo; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" data-replace=\"";
  foundHelper = helpers.new_tempo;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.new_tempo; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"/></div>\n      <div id=\"tempo-slider-holder\">\n        <span>40</span>\n        <input id=\"tempo-slider-control\" type=\"range\" min=\"40\" max=\"200\" value=\"120\" step=\"1\"/>\n        <span>200</span>\n      </div>\n    </div>\n  </div>\n\n  <div id=\"metronome_li\">\n    <div id=\"metronome-box\">\n      <div id=\"metronome-arm\"></div>\n    </div>\n  </div>\n\n</nav>\n  <div id=\"end\" title=\"";
  foundHelper = helpers.warn;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.warn; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">\n    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"48px\" height=\"82px\">\n      <defs>\n        <clipPath id=\"close-tri\">\n           <polygon points=\"0,0 48,0 48,82\" />\n        </clipPath>\n      </defs>\n      <g id=\"closebtn\" clip-path=\"url(#close-tri)\" class=\"menu_item\">\n\n        <g>\n          <rect class=\"label_box\" width=\"111\" height=\"16\" />\n          <foreignobject x=\"0\" y=\"0\" width=\"55\" height=\"16\">\n            <div class=\"label\" data-t=\"end\">";
  foundHelper = helpers.end;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.end; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n          </foreignobject>\n        </g>\n\n        <g transform=\"translate(0,16)\">\n          <rect class=\"bg\" width=\"82\"  height=\"66\" />\n\n          <foreignobject x=\"15\" y=\"0\" width=\"38\" height=\"38\">\n            <div class=\"close-x\">x</div>\n          </foreignobject>\n\n        </g>\n\n      </g>\n\n    </svg>\n  </div>\n\n";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['high_latency.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"title\">\n	<h3 id=\"latency-title\" data-t=\"high_latency\">";
  foundHelper = helpers.high_latency;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.high_latency; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</h3>\n	<div class=\"close_btn\" id=\"close-share\">\n	</div>\n</div>\n<div class=\"content\">\n		<p id=\"latency-msg-t\" data-t=\"stay_in_easy_top\">";
  foundHelper = helpers.stay_in_easy_top;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.stay_in_easy_top; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n		<p id=\"latency-msg-b\" data-t=\"stay_in_easy_bottom\">";
  foundHelper = helpers.stay_in_easy_top;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.stay_in_easy_top; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n		<h3 id=\"own\" style=\"display:none\"><a href=\"#/\" data-t=\"start_own_session\">";
  foundHelper = helpers.start_own_session;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.start_own_session; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</a></h3>\n</div>\n";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['instrument_select.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var stack1, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n<li class='dock_item ";
  stack1 = depth0.ident;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "'>\n  <div class=\"instrument_select\">\n  \n    <div class=\"background_triangle_holder\">\n      <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"175px\" height=\"95px\" class=\"background_triangle\">\n          <polygon class=\"player_triangle\" points=\"0,0 0,95 175,95\"/>\n      </svg>\n    </div>\n  \n    <div class=\"bottom_bar\">\n    \n    </div>\n  \n    <div class=\"instrument_item\" data-title=\"";
  stack1 = depth0.fullname;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\">\n    </div>\n  \n\n  </div>\n  <div class=\"menu_tip\" data-ident=\"";
  stack1 = depth0.ident;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\"><div class=\"tt_content\"><div class=\"tt_text\" data-t=\"";
  stack1 = depth0.fullname;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\">";
  stack1 = depth0.fullname;
  foundHelper = helpers.I18n;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "I18n", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "</div></div><div class=\"tt_arrow_bottom\"></div></div>\n</li>\n";
  return buffer;}

  stack1 = depth0.instruments;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['join.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"welcome\">\n\n  <div id=\"logo\"></div>\n  <p id=\"tagline\" data-t=\"tagline\">";
  foundHelper = helpers.tagline;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.tagline; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n\n  <div id=\"messages\">\n    <p class=\"invite-message message_default\">\n      <a id=\"own\" href=\"#/\" data-t=\"enter_link\">";
  foundHelper = helpers.enter_link;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.enter_link; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</a>\n      <span data-t=\"paste_unique\">";
  foundHelper = helpers.paste_unique;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.paste_unique; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span>\n    </p>\n  </div>\n  \n  \n  <div id=\"paste_link\" title=\"";
  foundHelper = helpers.paste_link;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.paste_link; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">\n    \n    <div id=\"nickname-box\">\n      <div id=\"nickname-holder\">\n        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"178px\" height=\"4px\" >\n          <polygon points=\"0,0 0,4 178,4\" id=\"fancytop\"/>\n        </svg>\n        <input id=\"nickname\" data-t=\"paste_link\" placeholder=\"";
  foundHelper = helpers.paste_link;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.paste_link; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" />\n        <div id=\"paste-tip\">\n          <svg class=\"bottom-tri\">\n            <polygon points=\"0,11 11,11 5,0\"/>\n          </svg>\n          <p class=\"share-tip\">\n            ";
  foundHelper = helpers.how_to_paste;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.how_to_paste; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n          </p>\n        </div>  \n      </div>\n    </div>\n    \n  </div>\n  \n  \n\n  <div id=\"chrome-experiment\">\n    <a href=\"http://www.chromeexperiments.com/\" target=\"_blank\" title=\"";
  foundHelper = helpers.chrome_experiment;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.chrome_experiment; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">\n    </a>\n  </div>\n\n</div>\n\n<div id=\"chevron-holder\">\n  <div id=\"chevron-intro\">\n    <div id=\"bottom-fill\"></div>\n  </div>\n  <div id=\"enter\" class=\"button join\" data-t=\"enter\">";
  foundHelper = helpers.enter;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.enter; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n</div>";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['keyboard.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, foundHelper, self=this, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            ";
  stack1 = depth0.sharp;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  return buffer;}
function program2(depth0,data) {
  
  
  return "\n            <li class=\"octave_key octave_sharp\"></li>\n            ";}

function program4(depth0,data) {
  
  
  return "\n            <li class=\"octave_key\"></li>\n            ";}

function program6(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            ";
  stack1 = depth0.sharp;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  return buffer;}
function program7(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <li id=\"_octave_";
  stack1 = depth0.octave;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "_key_";
  stack1 = depth0.pos;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\" data-pos=\"";
  stack1 = depth0.pos;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\" data-octave=\"";
  stack1 = depth0.octave;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\"\n                class=\"keyboard_key sharp\"></li>\n            ";
  return buffer;}

function program9(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <li id=\"_octave_";
  stack1 = depth0.octave;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "_key_";
  stack1 = depth0.pos;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\" data-pos=\"";
  stack1 = depth0.pos;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\" data-octave=\"";
  stack1 = depth0.octave;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\"\n                class=\"keyboard_key white\"></li>\n            ";
  return buffer;}

  buffer += "<div id=\"";
  foundHelper = helpers.instrument_ident;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instrument_ident; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" class=\"";
  foundHelper = helpers.instrument_type;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instrument_type; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " instrument_holder\" data-instrument=\"";
  foundHelper = helpers.instrument_type;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instrument_type; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">\n\n    <div id=\"keyboard-octave\" class=\"pro_tour\" data-tip=\"octave_keyboard\" data-vert=\"below\">\n        <img src=\"http://chrome-jam-static.commondatastorage.googleapis.com/img/interface/octave_arrow.png\" id=\"leftArrow\"/>\n        <ul id=\"octave-full\">\n            ";
  stack1 = depth0.collection;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </ul>\n        <div id=\"octave-dragger\"></div>\n        <img src=\"http://chrome-jam-static.commondatastorage.googleapis.com/img/interface/octave_arrow.png\" id=\"rightArrow\"/>\n    </div>\n\n\n    <div id=\"paintboard\" class=\"canvas_holder easy_tour\" data-tip=\"play_keyboard\" data-related=\"kinview\"></div>\n\n    <div id=\"keyboard-inview\" class=\"kinview pro_tour\" data-tip=\"keys_keyboard\" data-related=\"hint\" >\n\n        <ul id=\"keyboard-full\" class=\"playarea\">\n            ";
  stack1 = depth0.collection;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(6, program6, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </ul>\n    </div>\n\n\n\n    <div id=\"controls\">\n        <div id=\"modes\">\n            <div id=\"mode-switch\">\n                ";
  stack1 = {};
  stack1['action'] = "toggleMode";
  stack1['title'] = "easypro_alt";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "mode", {hash:stack1}) : helperMissing.call(depth0, "interface", "mode", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n                <div class=\"chord_label knob_label\" data-t=\"instrument_mode\">";
  foundHelper = helpers.instrument_mode;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instrument_mode; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n            </div>\n            <div id=\"key-hints\">\n               ";
  stack1 = {};
  stack1['action'] = "toggleHints";
  stack1['count'] = "2";
  stack1['val'] = "1";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "radio", {hash:stack1}) : helperMissing.call(depth0, "interface", "radio", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n               <div class=\"chord_label knob_label\" data-t=\"key_hints\">";
  foundHelper = helpers.key_hints;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.key_hints; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n            </div>\n        </div>\n\n        <div id=\"patterns-chords\">\n            <div id=\"patterns\" class=\"easy_tour ap_part\" data-tip=\"change_pattern\" data-related=\"pattern_part\">\n               ";
  stack1 = {};
  stack1['action'] = "changePattern";
  stack1['count'] = "5";
  stack1['val'] = "1";
  stack1['qwerty'] = "qwert";
  stack1['title'] = "pattern_alt";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "radio", {hash:stack1}) : helperMissing.call(depth0, "interface", "radio", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n               <div class=\"chord_label knob_label autoplay_tour\" data-t=\"autoplay\" data-tip=\"autoplay_tip_keyboard\" data-related=\"ap_part\" data-vert=\"below\">";
  foundHelper = helpers.autoplay;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.autoplay; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n                ";
  stack1 = {};
  stack1['action'] = "changePattern";
  stack1['count'] = "5";
  stack1['val'] = "1";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "hint", {hash:stack1}) : helperMissing.call(depth0, "interface", "hint", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n            </div>\n            <div id=\"chords\" class=\"easy_tour\" data-tip=\"change_chord\" data-related=\"chord_part\">\n              ";
  stack1 = {};
  stack1['action'] = "changeChords";
  stack1['count'] = "6";
  stack1['title'] = "chords_alt";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "radio", {hash:stack1}) : helperMissing.call(depth0, "interface", "radio", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n              <div class=\"chord_label knob_label\" data-t=\"chords\">";
  foundHelper = helpers.chords;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.chords; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n                ";
  stack1 = {};
  stack1['action'] = "changeChords";
  stack1['count'] = "6";
  stack1['qwerty'] = "qwerty";
  stack1['title'] = "keyboard_hints_alt";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "hint", {hash:stack1}) : helperMissing.call(depth0, "interface", "hint", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n            </div>\n        </div>\n\n        <div id=\"knobs\">\n            ";
  stack1 = {};
  stack1['action'] = "fx1";
  stack1['min'] = "1";
  stack1['val'] = "0";
  stack2 = depth0.fx1;
  stack1['label'] = stack2;
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "knob", {hash:stack1}) : helperMissing.call(depth0, "interface", "knob", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n            ";
  stack1 = {};
  stack1['action'] = "fx2";
  stack1['min'] = "1";
  stack1['val'] = "0";
  stack2 = depth0.fx2;
  stack1['label'] = stack2;
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "knob", {hash:stack1}) : helperMissing.call(depth0, "interface", "knob", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n        </div>\n\n    </div>\n    <div id=\"hints\"></div>\n</div>\n\n\n";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['latency_error.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"welcome\">\n\n  <div id=\"logo\"></div>\n  <p id=\"tagline\" data-t=\"tagline\">";
  foundHelper = helpers.tagline;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.tagline; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n\n  <div id=\"messages\">\n    <p class=\"invite-message message_default\">\n      <span data-t=\"latency_error_title_extreme\">";
  foundHelper = helpers.latency_error_title_extreme;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.latency_error_title_extreme; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span> \n      <span data-t=\"latency_extreme_top\">";
  foundHelper = helpers.latency_extreme_top;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.latency_extreme_top; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span> \n      <span data-t=\"latency_extreme_bottom\">";
  foundHelper = helpers.latency_extreme_bottom;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.latency_extreme_bottom; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span> \n    <br/><br/>\n    <h3 id=\"own\" ><a href=\"#/\" data-t=\"start_solo\">";
  foundHelper = helpers.start_solo;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.start_solo; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</a></h3>\n  </div>\n\n\n  <div id=\"chrome-experiment\">\n    <a href=\"http://www.chromeexperiments.com/\" target=\"_blank\" title=\"";
  foundHelper = helpers.chrome_experiment;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.chrome_experiment; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">\n    </a>\n  </div>\n\n</div>\n\n<div id=\"chevron-holder\">\n  <div id=\"chevron-intro\">\n    <div id=\"bottom-fill\"></div>\n  </div>\n  <div id=\"enter\" class=\"button\" data-t=\"try_again\">";
  foundHelper = helpers.try_again;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.try_again; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n</div>";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['machine.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, foundHelper, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  buffer += "<div id=\"";
  foundHelper = helpers.instrument_ident;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instrument_ident; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" class=\"";
  foundHelper = helpers.instrument_type;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instrument_type; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " instrument_holder\" data-instrument=\"";
  foundHelper = helpers.instrument_type;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instrument_type; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">\n\n  <div id=\"paintboard\" class=\"canvas_holder easy_tour\" data-tip=\"play_machine\" data-related=\"pad_part\" data-top-offset=\"100\"></div>\n  \n  <div id=\"pads\" class=\"pad_part playarea\" style=\"z-index: 1; \">\n      <div id=\"_pad_7\" class=\"pad pad-7\" data-notes=\"7\"></div>\n      <div id=\"_pad_8\" class=\"pad pad-8\" data-notes=\"8\"></div>\n      <div id=\"_pad_9\" class=\"pad pad-9\" data-notes=\"9\"></div>\n      \n      <div id=\"_pad_4\" class=\"pad pad-4\" data-notes=\"4\"></div>\n      <div id=\"_pad_5\" class=\"pad pad-5\" data-notes=\"5\"></div>\n      <div id=\"_pad_6\" class=\"pad pad-6\" data-notes=\"6\"></div>\n      \n      <div id=\"_pad_1\" class=\"pad pad-1\" data-notes=\"1\"></div>\n      <div id=\"_pad_2\" class=\"pad pad-2\" data-notes=\"2\"></div>\n      <div id=\"_pad_3\" class=\"pad pad-3\" data-notes=\"3\"></div>    \n  </div>\n\n    <div id=\"mode-switch\">\n        ";
  stack1 = {};
  stack1['action'] = "toggleMode";
  stack1['title'] = "easypro_alt";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "mode", {hash:stack1}) : helperMissing.call(depth0, "interface", "mode", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n        <div class=\"chord_label knob_label\" data-t=\"instrument_mode\">";
  foundHelper = helpers.instrument_mode;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instrument_mode; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n    </div>\n\n    <div id=\"controls\">\n        <div class=\"control\">\n            ";
  stack1 = {};
  stack1['action'] = "fx1";
  stack1['min'] = "0";
  stack1['val'] = "0";
  stack2 = depth0.fx1;
  stack1['label'] = stack2;
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "knob", {hash:stack1}) : helperMissing.call(depth0, "interface", "knob", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n        </div>\n        <div class=\"control\">\n            ";
  stack1 = {};
  stack1['action'] = "fx2";
  stack1['min'] = "0";
  stack1['val'] = "0";
  stack2 = depth0.fx2;
  stack1['label'] = stack2;
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "knob", {hash:stack1}) : helperMissing.call(depth0, "interface", "knob", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n        </div>\n\n        <div id=\"key-hints\">\n           ";
  stack1 = {};
  stack1['action'] = "toggleHints";
  stack1['count'] = "2";
  stack1['val'] = "1";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "radio", {hash:stack1}) : helperMissing.call(depth0, "interface", "radio", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n           <div class=\"chord_label knob_label\" data-t=\"key_hints\">";
  foundHelper = helpers.key_hints;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.key_hints; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n        </div>\n             \n        <div id=\"patterns\" class=\"easy_tour ap_part\" data-tip=\"change_pattern\" data-related=\"pattern_part\" data-horz=\"right\">\n           ";
  stack1 = {};
  stack1['action'] = "changePattern";
  stack1['count'] = "5";
  stack1['val'] = "1";
  stack1['qwerty'] = "qwert";
  stack1['title'] = "pattern_alt";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "radio", {hash:stack1}) : helperMissing.call(depth0, "interface", "radio", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n           <div class=\"chord_label knob_label autoplay_tour\" data-t=\"autoplay\" data-tip=\"autoplay_tip_machine\" data-related=\"ap_part\" data-vert=\"below\">";
  foundHelper = helpers.autoplay;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.autoplay; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n            ";
  stack1 = {};
  stack1['action'] = "changePattern";
  stack1['count'] = "5";
  stack1['val'] = "1";
  stack1['title'] = "keyboard_hints_alt";
  foundHelper = helpers['interface'];
  stack1 = foundHelper ? foundHelper.call(depth0, "hint", {hash:stack1}) : helperMissing.call(depth0, "interface", "hint", {hash:stack1});
  buffer += escapeExpression(stack1) + "\n        </div>\n    </div>\n\n  <div id=\"hints\" class=\"pro_tour\" data-tip=\"keys_machine\" data-top-offset=\"150\"></div>\n </div>\n\n";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['modal.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<div id=\"title\">\n    <h3></h3>\n\n    <div class=\"close_btn\">\n    </div>\n</div>\n<div class=\"content\">\n\n</div>";});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['player.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"player_";
  foundHelper = helpers.player_id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.player_id; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" class=\"instrument_remote  ";
  foundHelper = helpers.local_player;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.local_player; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " ";
  foundHelper = helpers.instrument;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instrument; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">\n  <div class=\"background_triangle_holder before_load\">\n    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"226px\" height=\"150px\" class=\"background_triangle\">\n        <polygon class=\"player_triangle\" points=\"0,50 0,150 226,150\"/>\n    </svg>\n  </div>\n  <div class=\"instrument_icon before_load\">\n    \n      \n  </div>\n  <div class=\"bottom_bar before_load\">\n    <span class=\"nickname\">\n      ";
  foundHelper = helpers.player_nickname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.player_nickname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n    </span>\n    <span class=\"crown ";
  foundHelper = helpers.is_leader;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.is_leader; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"></span>\n  </div>\n  \n  \n <div class=\"chat\">\n  </div> \n\n</div>\n";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['rejoin.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"welcome\">\n\n  <div id=\"logo\"></div>\n  <p id=\"tagline\" data-t=\"tagline\">";
  foundHelper = helpers.tagline;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.tagline; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n\n  <div id=\"messages\">\n    <p class=\"invite-message message_default\" data-t=\"lost_connection\">";
  foundHelper = helpers.lost_connection;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.lost_connection; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n  </div>\n\n  <h3 id=\"own\" ><a href=\"#/\" data-t=\"start_own_session\">";
  foundHelper = helpers.start_own_session;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.start_own_session; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</a></h3>\n\n  <div id=\"chrome-experiment\">\n    <a href=\"http://www.chromeexperiments.com/\" target=\"_blank\" title=\"";
  foundHelper = helpers.chrome_experiment;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.chrome_experiment; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">\n    </a>\n  </div>\n\n</div>\n\n<div id=\"chevron-holder\">\n  <div id=\"chevron-intro\">\n    <div id=\"bottom-fill\"></div>\n  </div>\n  <div id=\"enter\" class=\"button\" data-t=\"rejoin\">";
  foundHelper = helpers.rejoin;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.rejoin; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n</div>";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['select.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"chevron-holder\">\n  <div id=\"chevron-select\"></div>\n</div>\n\n<div id=\"carousel-current\">\n\n</div>\n\n<div id=\"carousel-swiffy\">\n\n</div>\n\n<div id=\"nickname-label\" data-t=\"select_to_jam\">\n  ";
  foundHelper = helpers.select_to_jam;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.select_to_jam; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n</div>\n\n<div id=\"carousel-actions\">\n  <div id=\"nickname-box\">\n    <div id=\"nickname-holder\">\n      <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"178px\" height=\"4px\" >\n        <polygon points=\"0,0 0,4 178,4\" id=\"fancytop\"/>\n      </svg>\n      <input id=\"nickname\" data-t=\"enter_nickname\" placeholder=\"";
  foundHelper = helpers.enter_nickname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.enter_nickname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" maxlength=\"20\"/>\n      \n      \n    </div>\n    <a class=\"button-skin\" id=\"submit-instrument\" data-t=\"jam\">";
  foundHelper = helpers.jam;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.jam; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</a>\n  </div>\n  <h3 id=\"being-played\">\n  </h3>\n  <h4 id=\"taken-nickname\" data-t=\"nickname_taken\">\n    ";
  foundHelper = helpers.nickname_taken;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.nickname_taken; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n  </h4>\n  <h4 id=\"bad-nickname\" data-t=\"nickname_bad\">\n    ";
  foundHelper = helpers.nickname_bad;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.nickname_bad; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n  </h4>\n</div>\n\n\n\n<div id=\"carousel-bottom\">\n  <ul id=\"carousel-list\"></ul>\n</div>\n\n<div id=\"carousel-prev\"></div>\n<div id=\"carousel-next\"></div>\n\n\n";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['session.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n        <div class=\"instrument_remote invite\">\n            <div class=\"background_triangle_holder before_load\">\n                <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"226px\" height=\"150px\" class=\"background_triangle\">\n                    <polygon class=\"player_triangle\" points=\"0,50 0,150 226,150\"/>\n                </svg>\n            </div>\n            <div class=\"plusInvite before_load\">\n                +\n            </div>\n            <div class=\"bottom_bar before_load bottom_invite\" data-t=\"invite_friends\">\n                ";
  stack1 = depth1.invite_friends;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\n            </div>\n        </div>\n        ";
  return buffer;}

  buffer += "<div id=\"instrument_local\">\n    <div id=\"metronome-loader\">\n        <div id=\"metronome-box\">\n            <div id=\"metronome-arm\" class=\"on\"></div>\n        </div>\n        <div id=\"loading\">";
  foundHelper = helpers.loading;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.loading; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n    </div>\n\n</div>\n<div id=\"remotes-holder\" class=\"hide\">\n    <div id=\"remotes\">\n\n      <div id=\"chat-btn\" class=\"before_load\">\n        <div id=\"chat-notification\">\n          <span id=\"count\">3</span>\n        </div>\n        <div id=\"block\">\n          <span data-t=\"jam_chat\">";
  foundHelper = helpers.jam_chat;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.jam_chat; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span>\n          <hr/>\n          <hr/>\n          <hr/>\n          <hr/>\n        </div>\n        <div>\n          <svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\">\n            <polygon points=\"0,0 14,0 0,17\"></polygon>\n          </svg>\n        </div>\n\n        </div>\n\n        ";
  stack1 = depth0.remotes;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.programWithDepth(program1, data, depth0)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </div>\n    <div class=\"clear\">\n    </div>\n</div>\n\n\n";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['share.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"title\">\n    <h3 data-t=\"invite_friend\">";
  foundHelper = helpers.invite_friend;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.invite_friend; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</h3>\n\n    <div class=\"close_btn\" id=\"close-share\">\n    </div>\n</div>\n<div class=\"content\">\n\n    <div class=\"section\">\n        <p data-t=\"share_the_link\" id=\"description\">\n            ";
  foundHelper = helpers.share_the_link;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.share_the_link; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n        </p>\n    </div>\n    <div class=\"section\">\n        <p data-t=\"share_JAM\" class=\"share-tip\">";
  foundHelper = helpers.share_JAM;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.share_JAM; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n        <svg class=\"bottom-tri\">\n            <polygon points=\"0,0 11,0 5,11\"/>\n        </svg>\n        <div id=\"nickname-holder\">\n            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"240px\" height=\"4px\" >\n                <polygon points=\"0,0 0,4 256,4\" id=\"fancytop\"/>\n            </svg>\n            <input value=\"";
  foundHelper = helpers.linked;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.linked; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" class=\"long_link\" id=\"share_link\" readonly=\"readonly\"/>\n        </div>\n    </div>\n\n\n    <div id=\"links\" class=\"section\">\n        <p data-t=\"click_an_icon\" class=\"share-tip\">\n            ";
  foundHelper = helpers.click_an_icon;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.click_an_icon; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n        </p>\n        <svg class=\"bottom-tri\">\n            <polygon points=\"0,0 11,0 5,11\"/>\n        </svg>\n        <ul>\n            <li id=\"twitter\" class=\"social\"></li>\n            <li id=\"gplus\" class=\"social\"></li>\n            <li id=\"facebook\" class=\"social\"></li>\n        </ul>\n    </div>\n</div>";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['technology.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"title\">\n    <h3 data-t=\"technology\">";
  foundHelper = helpers.technology;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.technology; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</h3>\n\n    <div class=\"close_btn\" id=\"close-tech\">\n    </div>\n</div>\n<div id=\"tech\">\n    <div id=\"tech-box\" class=\"scrollbar-container\">\n        <div class=\"scrollbar\">\n            <div class=\"track\">\n                <div class=\"thumb\">\n                    <div class=\"end\">\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div class=\"viewport\">\n            <div class=\"overview\">\n                <span data-t=\"technology_content\">";
  foundHelper = helpers.technology_content;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.technology_content; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span><span data-t=\"tech_links\">";
  foundHelper = helpers.tech_links;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.tech_links; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span>\n            </div>\n        </div>\n    </div>\n</div>\n";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['timeout.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"welcome\">\n\n  <div id=\"logo\"></div>\n  <p id=\"tagline\" data-t=\"tagline\">";
  foundHelper = helpers.tagline;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.tagline; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n\n  <div id=\"messages\">\n    <p class=\"invite-message message_default\" data-t=\"lost_connection\">";
  foundHelper = helpers.timeout;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.timeout; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n  </div>\n\n  <h3 id=\"own\" ><a href=\"#/\" data-t=\"start_own_session\">";
  foundHelper = helpers.start_new;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.start_new; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</a></h3>\n\n  <div id=\"chrome-experiment\">\n    <a href=\"http://www.chromeexperiments.com/\" target=\"_blank\" title=\"";
  foundHelper = helpers.chrome_experiment;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.chrome_experiment; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">\n    </a>\n  </div>\n\n</div>\n\n<div id=\"chevron-holder\">\n  <div id=\"chevron-intro\">\n    <div id=\"bottom-fill\"></div>\n  </div>\n</div>";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['unsupported.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"unsupported\">\n    <div id=\"center\">\n        <iframe width=\"480\" height=\"295\" src=\"http://www.youtube.com/embed/JuJHfkXEI-o\" frameborder=\"0\" allowfullscreen>\n        </iframe>\n        <h1 data-t=\"tagline\">";
  foundHelper = helpers.tagline;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.tagline; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</h1>\n        <p data-t=\"unsupported_copy\">\n            ";
  foundHelper = helpers.unsupported_copy;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.unsupported_copy; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n        </p>\n        <a href=\"http://google.com/chrome/\" class=\"button\" data-t=\"download_chrome\">";
  foundHelper = helpers.download_chrome;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.download_chrome; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</a>\n    </div>\n    <div id=\"chrome-experiment\">\n        <a href=\"http://www.chromeexperiments.com/\" target=\"_blank\" title=\"";
  foundHelper = helpers.chrome_experiment;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.chrome_experiment; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"></a>\n    </div>\n</div>\n";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['upgrade.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"unsupported\">\n\n<div id=\"center\">\n    <img src=\"http://chrome-jam-static.commondatastorage.googleapis.com/img/interface/jam-logo.png\" id=\"jam-logo\"/>\n\n    <h1>";
  foundHelper = helpers.tagline;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.tagline; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</h1>\n\n    <p>\n        ";
  foundHelper = helpers.upgrade_copy;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.upgrade_copy; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n    </p>\n<div/>\n\n<div id=\"chrome-experiment\" class=\"show\">\n    <a href=\"http://www.chromeexperiments.com/\" target=\"_blank\" title=\"";
  foundHelper = helpers.chrome_experiment;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.chrome_experiment; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"></a>\n</div>\n\n</div>";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['warn.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"title\">\n	<h3 data-t=\"warn\">";
  foundHelper = helpers.warn;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.warn; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</h3>\n	<div class=\"close_btn\" id=\"close-share\">\n	</div>\n</div>\n<div class=\"content\">\n	<p data-t=\"are_sure\"> \n		";
  foundHelper = helpers.are_sure;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.are_sure; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n	</p>\n	<a id=\"confirm-end\" href=\"/ended/\" class=\"button-skin\" data-t=\"end\">";
  foundHelper = helpers.end;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.end; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</a>\n	<a href=\"#\" id=\"keep-jamming\" data-t=\"keep_jamming\">";
  foundHelper = helpers.keep_jamming;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.keep_jamming; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</a>\n</div>";
  return buffer;});
})();
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['welcome.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"welcome\">\n    <div id=\"logo\"></div>\n    <p id=\"tagline\" data-t=\"tagline\">";
  foundHelper = helpers.tagline;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.tagline; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n    <div id=\"chrome-experiment\">\n        <a href=\"http://www.chromeexperiments.com/\" target=\"_blank\" title=\"";
  foundHelper = helpers.chrome_experiment;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.chrome_experiment; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"></a>\n    </div>\n</div>\n\n<div id=\"chevron-holder\">\n    <div id=\"chevron-intro\">\n    </div>\n    <div id=\"enter\" class=\"button\" data-t=\"enter\">";
  foundHelper = helpers.enter;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.enter; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n\n</div>\n";
  return buffer;});
})();
