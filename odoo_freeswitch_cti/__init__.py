# -*- coding: utf-8 -*-

import os
import signal

from . import controllers
from . import models
from . import worker

from . import freeswitch

def post_load():
    print("post load ..... cti freeswitch")
    worker.worker()
    return

def post_init_hook(env):
    #os.kill(os.getpid(), signal.SIGINT)
    print("post init hook ..... cti freeswitch")
    return
