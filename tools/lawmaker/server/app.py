#!/usr/bin/env python

import sys
import asyncio
import json
import os
import ssl
import websockets
import pathlib
import gradio as gr
import torch
import requests 
import base64
# import time
from functools import partial
from PIL import Image, PngImagePlugin
import io
from io import BytesIO
from threading import Thread, Timer
from configdata import status, pipelines, config, payload
from lib.status import statusEncode, statusSend, checkReadyState
from lib.helpers import age_gender_detector, encode_file_to_base64, decode_and_save_base64, faceswap, getLawPosePrompt
from datetime import datetime

output = []

print(config)


def initApp(apptype):
    global status
    checkReadyState(status)
    if (apptype == "screen"):
        statusSend(status)
    elif (apptype == "control"):
        print("ready to control")
        statusSend(status)
    if (apptype == "lawmaker"):
        statusSend(status)



async def generateAndSwapFace(status, payload, prompt, negative_prompt, pose):
	'''
	create a new image using Automatic1111 + reactor
	'''
	status["sdparams"]["aiready"] = False
	steps = status["sdparams"]["steps"]
	denoising = status["sdparams"]["denoising"]
	sdsavedir = status["sdparams"]["sdsavedir"]
	controlnetpose = encode_file_to_base64(pose)
	# controlnetpose = encode_file_to_base64("img/pose.png")
	# controlnetpose = "img/pose.png"
	# inputface = encode_file_to_base64("img/kop.jpg")
	# inputface = "img/kop.jpg"
	inputface = config["mugshot"]
	# prompt = "(8k, best quality, masterpiece, highly detailed:1.1),realistic photo of fantastic happy woman,hairstyle of blonde and red short bob hair,modern clothing,cinematic lightning,film grain,dynamic pose,bokeh,dof"
	payload['alwayson_scripts']['ControlNet']['args'][0]['image']['image'] = controlnetpose
	payload['alwayson_scripts']['ControlNet']['args'][0]['image']['mask'] = None
	payload['alwayson_scripts']['ReActor']['args'][0]['im'] = inputface
	payload['prompt'] = prompt
	payload['negative_prompt'] = negative_prompt
	loop = asyncio.get_event_loop()
	response = await loop.run_in_executor(None, partial(requests.post, url=f'{config["sd"]["url"]}sdapi/v1/txt2img', json=payload))
	r = response.json()
	if 'error' in r.keys():
		print(r)
	else:
		for n, i in enumerate(r['images']):
			print("saving image ", n)
			image = Image.open(io.BytesIO(base64.b64decode(i.split(",", 1)[0])))
	filename = 'output'+ f'{datetime.utcnow():%Y%m%d_%H%M%S}'
	# impath = os.path.join(sdsavedir, filename + ".png")
	impath = os.path.join("outputs/"+ filename +  ".png")
	print(impath)
	image.save(impath)
	status["apps"]["lawmaker"]['currentfine']["img"] = impath
	# print( sdsavedir + filename + ".png saved")
	print(impath + ".png saved")
	status["sdparams"]["aiready"] = True
	statusSend(status)






async def handler(websocket):
    """
    Handle a connection 
    """     
    global status, config
    while True:
        try:
            message = await websocket.recv()
            # print(message)
            event = json.loads(message)
            print(event["type"])
            if event["type"] == "status":
                if (event["status"] == "init"):
                    status["connectioninfo"]["connections"].append(websocket)
                    # print("appending websocket to status[connectioninfo]")
                    # print (status)
                    # print(connid)
                    status["connectioninfo"]["connidjson"][event["src"]].append(websocket.id)
                    # status["connectioninfo"]["connidjson"][event["src"]].append(str(websocket.id))
                    print(event["src"], " joined session with id:", websocket.id,
                          " and remote_address ", websocket.remote_address)
                    statusSend(status)
                    initApp(event["src"])

            elif event["type"] == "command":
                print("The command is:" + str(event["command"]))
                
                if event["command"] == "reset":
                    status["apps"]["lawmaker"]["stage"] = 0

                if event["command"] == "black":
                    black = status["screen"]["black"]
                    if black:
                        black = False
                    else:
                        black = True
                    status["screen"]["black"] = black
                    statusSend(status)

                elif event["command"] == "inputimage1":
                    status["apps"]["lawmaker"]["stage"] = 1 # generating image
                    statusSend(status)
                    print("generating image")
                    decode_and_save_base64(event["data"], config["mugshot"])
                    age, gender = age_gender_detector(config["mugshot"], 512,512)
                    law, pose, prompt, negative_prompt = getLawPosePrompt(age, gender)
                    print(prompt)
                    await generateAndSwapFace(status, payload, prompt, negative_prompt, pose)  ### generates stable duiffusion image and swaps in current mugshot
                    status["apps"]["lawmaker"]['stage'] = 2 # generating image done
                    status["apps"]["lawmaker"]['currentfine']["law"] = "law" # generating image done
                    statusSend(status)
                    status["apps"]["lawmaker"]['stage'] = 3 # phase2 facxeswap
                    statusSend(status)
                    # webcamface = config["mugshot"]
                    # targetpath = status["apps"]["lawmaker"]['currentfine']["img"] 
                    # outputpath= status["apps"]["lawmaker"]['currentfine']["img"] + "v2.png"
                    # faceswap(targetpath, webcamface, outputpath)
                    # statusSend(status)
                    # status["apps"]["lawmaker"]['stage'] = 4 # phase2 facxeswap done




        except websockets.exceptions.ConnectionClosedOK:
            print("Client disconnected.  Do cleanup")
            for k in  status["connectioninfo"]["connidjson"].keys():
                typeid = k
                if websocket.id in  status["connectioninfo"]["connidjson"][k]:
                    # print(connid[k])
                    status["connectioninfo"]["connidjson"][k].remove(websocket.id)
                    # status["connectioninfo"]["connidjson"][typeid].remove(str(websocket.id))
            print("disconnecting",  typeid)
            statusSend(status)
            status["connectioninfo"]["connections"].remove(websocket)
            checkReadyState(status)
            # print(connections)
            break

        
        
        except websockets.exceptions.ConnectionClosedError:
            for k in status["connectioninfo"]["connidjson"].keys():
                typeid = k
                if websocket.id in status["connectioninfo"]["connidjson"][k]:
                    # print(connid[k])
                    status["connectioninfo"]["connidjson"][k].remove(websocket.id)
                    # status["connectioninfo"]["connidjson"][typeid].remove(str(websocket.id))
            # maybe reset all comnnectionsto reset stale connections? here be bugs...
            # connections = []
            # connid = {"screen": [], "control": []}
            # connidjson = {"screen": [], "control": []}
            print("disconnecting after error",  typeid)
            statusSend(status)
            status["connectioninfo"]["connections"].remove(websocket)
            checkReadyState(status)
            # print(connections)
            break


# ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
# localhost_pem = pathlib.Path(__file__).with_name("self.pem")
# ssl_context.load_cert_chain(localhost_pem)

async def main():    

    # async with websockets.serve(handler, "localhost", 8001, max_size=2**22, ssl=ssl_context):
    async with websockets.serve(handler, "", 8001, max_size=2**22):
        await asyncio.Future()  # run forever


# if __name__ == "__main__":
#     main()


if __name__ == "__main__":

    asyncio.run(main())
    


