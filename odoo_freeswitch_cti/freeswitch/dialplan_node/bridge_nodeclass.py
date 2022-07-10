# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 - ~.
# Guijin Ding, dingguijin@gmail.com.
# All rights reserved.
#
#

import logging

_logger = logging.getLogger(__name__)

from .abstract_nodeclass import AbstractNodeClass
from .node_event import NodeEvent

class bridge_NodeClass(AbstractNodeClass):

    async def execute_node(self, event):
        _data = self.node_param.get("data")
        self.send_esl_execute("bridge", _data)
        self.return_result_event(NodeEvent.SUCCESS.name)
        return
        
