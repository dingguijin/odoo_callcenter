# Part of Odoo. See LICENSE file for full copyright and licensing details.

import datetime
import logging
import json

from odoo import http

_logger = logging.getLogger(__name__)

class Main(http.Controller):

    @http.route('/web/cti_command', type='json', auth="user", methods=['POST'])
    def cti_command(self, command, parameter, **kw):
        # write command to cti_command and make status new
        http.request.env["freeswitch_cti.cti_command"].send_cti_command(command, parameter)
        return http.request.make_response(json.dumps({"result": "OK"}), [('Content-Type', 'application/json')])

    @http.route('/web/cti_event/<int:event>', type='http', auth="none", methods=['GET'])
    def cti_event(self, event):
        _event = http.request.env['freeswitch_cti.cti_event'].sudo().browse(event)
        if _event.command_id:
            _event.write({"command_record": _event["command_id"]})

        if self._is_agent_list_update_event(_event):
            self._update_agent_status(_event)
            self._send_agent_list_update_event(_event)

        # if self._is_agent_status_event(_event):
        #     self._send_agent_status_event(_event)

        return http.request.make_response(json.dumps({"result": "OK"}), [('Content-Type', 'application/json')])

    def _update_agent_status(self, event):
        if event.name == "CUSTOM" and event.subclass == "sofia::register":
            self._update_agent_status_sofia_register(event)
        if event.name == "CHANNEL_ANSWER":
            self._update_agent_status_channel_answer(event)
        if event.name == "CHANNEL_HANGUP":
            self._update_agent_status_channel_hangup(event)
        if event.name == "CHANNEL_CREATE":
            self._update_agent_status_channel_create(event)
        return

    def _update_agent_status_channel_create(self, event):
        _logger.info("channel create %s" % event.event_content)
        _sip_number = self._get_sip_number_from_event(event)
        if event.call_direction == "inbound":
            self._update_user_phone_status(_sip_number, "calling")
        else:
            self._update_user_phone_status(_sip_number, "ringing")
        return

    def _update_agent_status_channel_hangup(self, event):
        _logger.info("channel hangup %s" % event.event_content)
        _sip_number = self._get_sip_number_from_event(event)
        self._update_user_phone_status(_sip_number, "hangup")
        return

    def _update_agent_status_channel_answer(self, event):
        _logger.info("channel answer %s" % event.event_content)
        _sip_number = self._get_sip_number_from_event(event)
        self._update_user_phone_status(_sip_number, "answer")
        return

    def _get_sip_number_from_event(self, event):
        headers = json.loads(event.event_content)
        _sip_number = None
        if event.call_direction == "inbound":
            _sip_number = headers.get("Caller-Caller-ID-Number")
        else:
            _sip_number = headers.get("Caller-Destination-Number")
        return _sip_number

    def _update_user_phone_status(self, sip_number, status):
        _res_user = http.request.env["res.users"].sudo()
        _sip_user = _res_user.search([("sip_number", "=", sip_number)], limit=1)
        if not _sip_user:
            return
        _sip_user.write({
            "sip_phone_status": status,
            "sip_phone_last_seen": datetime.datetime.now()
        });
        return

    def _update_agent_status_sofia_register(self, event):
        headers = json.loads(event.event_content)
        _logger.info("SOFIA REGISTER %s" % headers)
        _status = headers.get("status") or ""# Registered(UDP)
        _user_agent = headers.get("user-agent") or ""
        _sip_auth_username = headers.get("sip_auth_username") or ""
        _sip_auth_realm = headers.get("sip_auth_realm") or ""
        _sip_phone_ip = headers.get("network-ip") or ""
        if not _sip_auth_username:
            _logger.error("Sofia register no sip auth username %s", headers)
            return
        _res_user = http.request.env["res.users"].sudo()
        _sip_user = _res_user.search([("sip_number", "=", _sip_auth_username)], limit=1)
        if not _sip_user:
            return
        _sip_user.write({
            "sip_register_status": _status,
            "sip_phone_user_agent": _user_agent,
            "sip_phone_ip": _sip_phone_ip,
            "sip_auth_realm": _sip_auth_realm,
            "sip_phone_last_seen": datetime.datetime.now()})
        return
    
    def _is_agent_list_update_event(self, event):
        _events = ["CHANNEL_CREATE", "CHANNEL_HANGUP", "CHANNEL_ANSWER"]
        if event.name in _events:
            return True
        if event.name == "CUSTOM" and event.subclass == "sofia::register":
            return True

        return False

    def _get_res_partner_id_by_phone_number(self, phone_number):
        _res_partner = http.request.env["res.partner"].sudo()
        _res_users = http.request.env["res.users"].sudo()
        if not phone_number:
            return None
        _r = _res_partner.search(["|", ("mobile", "=", phone_number),
                                  ("phone", "=", phone_number)], limit=1)
        if _r:
            return _r.id
        _r = _res_users.search([("sip_number", "=", phone_number)], limit=1)
        if _r:
            return _r.partner_id.id
        return None
    
    def _send_agent_list_update_event(self, event):
        _caller_res_id = self._get_res_partner_id_by_phone_number(event.caller_caller_id_number)
        _called_res_id = self._get_res_partner_id_by_phone_number(event.caller_destination_number)
        http.request.env['bus.bus']._sendone("agent_update", "agent_update", {
            "event_id": event.id,
            "event_name": event.name,
            "event_subclass": event.subclass,
            "caller_id": event.caller_caller_id_number,
            "called_id": event.caller_destination_number,
            "call_direction": event.call_direction,
            "caller_res_id": _caller_res_id,
            "called_res_id": _called_res_id
        })

    def _is_agent_status_event(self, event):
        if event.name in ["CHANNEL_CREATE"]:                
            return True
        return False

    def _send_agent_status_event(self, event):
        if event.name == "CHANNEL_CREATE":
            if event.call_direction == "outbound":
                return self._send_agent_status_incoming_call(event)
        return

    def _send_agent_status_incoming_call(self, event):
        _caller_id = event.caller_caller_id_number
        _called_id = event.caller_destination_number

        if not _called_id:
            return

        _res_partner = http.request.env['res.partner'].sudo()
        _res_user = http.request.env['res.users'].sudo()
        _bus = http.request.env['bus.bus'].sudo()

        _called_user = _res_user.search([("sip_number", "=", _called_id)], limit=1)
        if not _called_user:
            return

        # for internal call caller id is res.users sip_number
        _caller = _res_partner.search(["|", ("phone", "=", _caller_id), ("mobile", "=", _caller_id)], limit=1)
        _caller_res_id = None
        _caller_user_name = None
        
        if _caller:
            _caller_res_id = _caller.id
            _caller_user_name = _caller.name
        
        _internal_caller = _res_user.search([("sip_number", "=", _caller_id)], limit=1)
        if _internal_caller:
            _caller_res_id = _internal_caller.partner_id.id
            _caller_user_name = _internal_caller.name

        _bus._sendone(_called_user.partner_id, "agent_status_service", {
            "type": "agent_phone_incoming_call",
            "message": _caller_id,
            "caller_res_id": _caller_res_id,
            "caller_id": _caller_id,
            "called_id": _called_id,
            "caller_user_name": _caller_user_name,
        })

        _logger.info("Sending agent status service -------------")
        return
