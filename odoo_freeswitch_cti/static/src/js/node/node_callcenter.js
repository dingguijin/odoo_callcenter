odoo.define('freeswitch_cti.node_assignment', function (require) {
    "use strict";

    var NodeAbstract = require('freeswitch_cti.node_abstract');
    var NodeRegistry = require('freeswitch_cti.node_registry');
    var rpc = require('web.rpc');

    var NodeAssignment = NodeAbstract.extend({
        node_path: function() {
            return ["SUCCESS"];
        },
        
        node_type: function() {
            return "callcenter";
        },

        node_name: function() {
            return "Assign Agent";
        },

        node_icon: function() {
            return "users";
        },

        node_params: function() {
            return [      
                {
                    param_name: "data",
                    param_display: "Callcenter Queue",
                    param_type: "selection",
                    selection_candidates: function() {
                        var promise = new Promise(function(resolve, reject) {

                            var de = rpc.query({
                                model: 'freeswitch_cti.callcenter_queue',
                                method: 'search_read',
                                domain:[],
                                
                            });
                            
                            de.then(function(res) {
                                console.log("search read selection", res);
                                resolve(res);
                            });
                            
                        });
                        return promise;
                    }                        
                }
            ];
        },

        node_seq: function() {
            return 6;
        },

        flow_types: function() {
            return ["incoming_call"];
        }
    });

    NodeRegistry.add("callcenter", new NodeAssignment());
    
    return NodeAssignment;
});

