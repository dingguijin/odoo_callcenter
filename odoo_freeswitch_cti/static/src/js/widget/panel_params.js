odoo.define('freeswitch_cti.panel_params', function (require) {
    "use strict";

    var core = require('web.core');
    var Widget = require('web.Widget');
    var QWeb = core.qweb;

    var PanelInput = require('freeswitch_cti.panel_input');

    var PanelParams = Widget.extend({
        template: 'panel_params_template',
        events: {
        },

        init: function (parent, options) {
            this._super.apply(this, arguments);
            this.params = options.params;
            this.node = options.node;
        },
        /**
         * Render params.
         *
         * @override
         */
        start: function () {
            var self = this;
            _.each(this.params, function(param) {
                if (param.param_type == "input") {
                    var _param_el = new PanelInput(self, {
                        hide_buttons: false,
                        input: {
                            label: param.param_display,
                            name: param.param_name,
                            value: param.param_value,
                            save: function(value) {
                                self._onClickSave(param.param_name, value);
                            }
                        }
                    });
                    _param_el.appendTo(self.$(".o_flow_panel_params")[0]);
                    param.param_widget = _param_el;
                }                
            });
            
            return this._super.apply(this, arguments);
        },

        //--------------------------------------------------------------------------
        // Handlers
        //--------------------------------------------------------------------------

        /**
         * On click ok.
         *
         * @private
         * @param {MouseEvent} ev
         */
        _onClickSave: function (name, value) {
            var self = this;
            var node_param = JSON.parse(self.node.node_param || "{}");            
            node_param[name] = value;
            node_param = JSON.stringify(node_param);
            this.trigger_up("panel_change_operator_param", {
                "operator_id": self.node.node_id,
                "node_param": node_param
            });
            self.node.node_param = node_param;
        },

    });

    return PanelParams;
});
