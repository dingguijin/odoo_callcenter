/** @odoo-module **/

import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

const agentStatusService = {
    dependencies: ["notification", "action"],
    start(env, { notification, action }) {

        console.log("SERVICE ENV ---------------------", env);
        
        env.bus.on("WEB_CLIENT_READY", null, async () => {
            console.log(">>>>>>> agentStatusService Ready <<<<<<<<<<<<");
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
                            notification.add(payload.message, {
			                    type: "info",
			                    title: "Incoming Call",
                                sticky: true,
                                onClose: function() {                                
                                },
                            });
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
