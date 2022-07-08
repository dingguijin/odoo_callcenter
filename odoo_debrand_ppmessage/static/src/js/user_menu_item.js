/** @odoo-module **/

import {registry} from "@web/core/registry";
import {user_menuitems} from "@web/webclient/user_menu/user_menu_items";


export const debrandService = {  
    dependencies:["title", "menu"],
    start(env, {title, menu}) {
	env.bus.on("WEB_CLIENT_READY", null, async () => {
	    title.setParts({ zopenerp: "PPMessage" } );
	    if (registry.category("user_menuitems")) {
		registry.category("user_menuitems").remove("documentation");
		registry.category("user_menuitems").remove("support");
		registry.category("user_menuitems").remove("odoo_account");
	    }
	});
    }
};

registry.category("services").add("debrandService", debrandService);

