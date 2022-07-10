# -*- coding: utf-8 -*-

from enum import Enum

class NodeEvent(Enum):
    SUCCESS = 0
    FAILED = 1
    PLAYBACK_END = 2
    DTMF_0 = 3
    DTMF_1 = 4
    DTMF_2 = 5
    DTMF_3 = 6
    DTMF_4 = 7
    DTMF_5 = 8
    DTMF_6 = 9
    DTMF_7 = 10
    DTMF_8 = 11
    DTMF_9 = 12
    DTMF_SHARP = 13
    DTMF_ASTERISK = 14

    TIMEOUT = 15
    

