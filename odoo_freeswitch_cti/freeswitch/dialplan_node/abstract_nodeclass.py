# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 - ~.
# Guijin Ding, dingguijin@gmail.com.
# All rights reserved.
#
#

import datetime
import json
import logging

_logger = logging.getLogger(__name__)

class AbstractNodeClass():
    def __init__(self, event):
        self.stream = event.get("stream")
        self.event = event.get("event")
        self.node = event.get("node")

        self.node_param = self.node.get("node_param") or "{}"
        self.node_param = self.stream.get_variable_value(self.node_param)
        self.node_param = json.loads(self.node_param)

        self.node_timeout = self.node.get("node_timeout")
        self._start_stamp = datetime.datetime.now()

        if self.node_param.get("clear_dtmf"):
            self.stream.on_clear_dtmf()
        return

    async def execute_node(self, event):
        pass

    def return_result_event(self, result):
        self.stream.server.push_node_event(self.stream, self.node, result)
        return

    def send_esl_execute(self, app, arg=""):
        self.stream._send_esl_execute(app, arg)
        return

    def is_node_timeout(self):
        if not self.node_timeout:
            return False
        _now = datetime.datetime.now()
        if _now - self._start_stamp > datetime.timedelta(seconds=int(self.node_timeout)):
            return True
        return False
