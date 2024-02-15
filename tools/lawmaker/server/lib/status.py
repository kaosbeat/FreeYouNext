import json
import os
import websockets

def copy_dict(data, strip_values=False, remove_keys=[]):
    if type(data) is dict:
        out = {}
        for key, value in data.items():
            if key not in remove_keys:
                out[key] = copy_dict(value, strip_values=strip_values, remove_keys=remove_keys)
        return out
    else:
        return [] if strip_values else data

def statusEncode(status):
    invalid = {"connidjson", "connections"}
    jsonstatus = copy_dict(status, False, invalid)
    jsonstatus["connectioninfo"]["connidjson"] = {}
    for event in status["connectioninfo"]["connidjson"]:
        jsonstatus["connectioninfo"]["connidjson"][event] = []
        for connid in status["connectioninfo"]["connidjson"][event]:
            jsonstatus["connectioninfo"]["connidjson"][event].append(str(connid))
    return jsonstatus

def statusSend(status):
    jsonstatus = statusEncode(status)
    websockets.broadcast(status["connectioninfo"]["connections"], json.dumps(jsonstatus))

def checkReadyState(status):
    if (len(status["connectioninfo"]["connidjson"]["screen"]) > 0) and \
        (len(status["connectioninfo"]["connidjson"]["control"]) > 0):
        readystate = True
    else:
        readystate = False
    status["connectioninfo"]["readystate"] = readystate
    statusSend()