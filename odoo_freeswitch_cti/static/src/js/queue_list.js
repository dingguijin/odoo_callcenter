/** @odoo-module **/

import { _t } from 'web.core';
import ListController from 'web.ListController';
import ListView from 'web.ListView';
import viewRegistry from 'web.view_registry';

const QueueListController = ListController.extend({
    init: function() {
        this._super.apply(this, arguments);
        owl.Component.env.services.bus_service.onNotification(this, (notifications) => {
            console.log(">>>>>>>>>>>>>>> Queue LIST GET notifications", notifications);
		    for (const { payload, type } of notifications) {
                if (type == "queue_update") {                    
                    this.trigger_up("reload");
                }
            }
        });
    }
});

export const QueueListView = ListView.extend({
    config: Object.assign({}, ListView.prototype.config, {
        Controller: QueueListController,
    }),
});

viewRegistry.add('queue_list', QueueListView);
