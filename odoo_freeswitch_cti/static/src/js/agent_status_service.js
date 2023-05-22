/** @odoo-module **/

import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
var core = require("web.core");

const agentStatusService = {
    dependencies: ["bus_service", "action", "user"],
    start: function(env, {bus_service, action, user}) {
        core.bus.on('web_client_ready', null, () => {
            bus_service.addEventListener('notification', this._onNotification.bind(this));
            bus_service.start();
        });
    },
    
    _onNotification: function({detail: notifications}) {
        console.log(">>>>>>> agentStatusService notifications: ", notifications);
        for (const { payload, type } of notifications) {
            if (type != "agent_update") {
                return;
            }
                
            if (!payload.event_name) {
                return;
            }
            
            if (payload.event_name == "CHANNEL_CREATE") {
                if (payload.call_direction == "outbound") {
                    if (user.partnerId == payload.called_res_id) {
                        notification.add(payload.caller_id, {
                            type: "info",
                            title: "Incoming Call",
                            sticky: true,
                            onClose: function() {                       
                            },
                        });
                        action.doAction({
                            type: "ir.actions.act_window",
                            res_model: "res.partner",
                            target: "new",
                            res_id: payload.caller_res_id,
                            views: [[false, "form"]]
                        });
                    }
                }                    
            }            
        }
    }
};

registry.category("services").add("agentStatusService", agentStatusService);
