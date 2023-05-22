/** @odoo-module **/

import { _t } from 'web.core';
import ListController from 'web.ListController';
import ListView from 'web.ListView';
import viewRegistry from 'web.view_registry';

const AgentListController = ListController.extend({
    init: function() {
        this._super.apply(this, arguments);
        const bus_service = owl.Component.env.services.bus_service;
        bus_service.addEventListener('notification', this._onNotification.bind(this));
        bus_service.start();
    },

    _onNotification: function({detail: notifications}) {
        console.log(">>>>>>>>>>>>>>> Agent list GET notifications", notifications);
		for (const { payload, type } of notifications) {
            if (type == "agent_update") {                    
                this.trigger_up("reload");
            }
        }
    }
});

export const AgentListView = ListView.extend({
    config: Object.assign({}, ListView.prototype.config, {
        Controller: AgentListController,
    }),
});

viewRegistry.add('agent_list', AgentListView);
