odoo.define('freeswitch_cti.node_playback', function (require) {
    "use strict";

    var NodeAbstract = require('freeswitch_cti.node_abstract');
    var NodeRegistry = require('freeswitch_cti.node_registry');

    var NodePlayback = NodeAbstract.extend({
        node_path: function() {
            return [
                "SUCCESS",
                "FAILED",
                "PLAYBACK_END",
                "PLAYBACK_BREAK",
                "ASR_FAILED",
                "TIMEOUT",
                "HANGUP",
                
                "DTMF_0",
                "DTMF_1",
                "DTMF_2",
                "DTMF_3",
                "DTMF_4",
                "DTMF_5",
                "DTMF_6",
                "DTMF_7",
                "DTMF_8",
                "DTMF_9",

                "DTMF_SHARP",
                "DTMF_ASTERISK"
            ];
        },

        node_type: function() {
            return "playback";
        },

        node_name: function() {
            return "Playback";
        },

        node_icon: function() {
            return "play-circle-o";
        },

        node_params: function() {
            return [
                {
                    param_name: "data",
                    param_display: "Data",
                    param_type: "input"
                }
            ];
        },

        node_seq: function() {
            return 5;
        },

        flow_types: function() {
            return ["incoming_call"];
        }
    });

    NodeRegistry.add("playback", new NodePlayback());
    
    return NodePlayback;
});

