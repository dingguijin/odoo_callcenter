odoo.define('freeswitch_cti.panel_selection', function (require) {
    "use strict";

    var core = require('web.core');
    var Widget = require('web.Widget');

    var QWeb = core.qweb;

    var PanelSelection = Widget.extend({
        template: 'panel_selection_template',
        events: {
        },
        /**  
         * PanelInput options {selection: object}
         * @constructor
         * @override
         * @param {Widget} parent
         * @param {input: input}
         */
        init: function (parent, options) {
            this.selection = options.selection;
            this._super.apply(this, arguments);
            console.log("PanelSelection options", options);
        },
        /**
         * Render attachment.
         *
         * @override
         */
        start: function () {
            var self = this;
            var _id = "#" + self.selection.id;
            this.selection.selection_candidates().then(function(res) {
                self.$(_id).append($('<option/>', {
                }));
                
                _.each(res, function(can) {
                    self.$(_id).append($('<option/>', {
                        value:  can.id,
                        text: can.name
                    }));
                });

                self.$(_id).val(self.selection.value);
            });

            this.$(_id).on("change", function (ev) {
                self.selection.on_change(self.$(_id).val());
            });

            return this._super.apply(this, arguments);
        },

        // for params load and save
        get_widget_value: function() {
        },

        set_widget_value: function(v) {
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
        _onClickSave: function (ev) {
        },

        _onClickEdit: function (ev) {
        },
        
    });

    return PanelSelection;
});
