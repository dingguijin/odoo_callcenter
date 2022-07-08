/** @odoo-module **/

import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

const agentStatusService = {
    dependencies: ["notification", "action", "user"],
    start(env, { notification, action, user }) {        
        env.bus.on("WEB_CLIENT_READY", null, async () => {
            const legacyEnv = owl.Component.env;
	        //env.services.legacy_bus_service.onNotification(this, (notifications) => {
            legacyEnv.services.bus_service.onNotification(this, (notifications) => {
		        for (const { payload, type } of notifications) {
                    console.log(">>>>>>> agentStatusService notification: ", payload);

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
                        
                        // setTimeout(function() {
                        //     action.doAction({
                        //         type: "ir.actions.act_window",
                        //         res_model: "res.partner",
                        //         target: "new",
                        //         res_id: payload.caller_res_id,
                        //         views: [[false, "form"]]
                        //     });
                        // });                        
                    }

                    // if (payload.message.type == "agent_phone_talking_call") {
                    // }

                    // if (payload.message.type == "agent_phone_hangup_call") {
                    // }
                    
                }
            });
            legacyEnv.services.bus_service.startPolling();
        });
        return {};
    }
};

registry.category("services").add("agentStatusService", agentStatusService);
