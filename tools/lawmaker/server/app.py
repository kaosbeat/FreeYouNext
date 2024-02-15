#!/usr/bin/env python

import sys
import asyncio
import json
import os
import websockets
import gradio as gr
import torch
# from diffusers import StableDiffusionPipeline
import requests 

import base64
# import time
from functools import partial
# import requests
from PIL import Image, PngImagePlugin
# # from diffusers.utils import load_image
import io
from io import BytesIO
from threading import Thread, Timer
# import random
# from helpers import *
# import numpy
# import copy
# from pythonosc.osc_server import AsyncIOOSCUDPServer
# from pythonosc.dispatcher import Dispatcher
# from pythonosc import osc_server
# from pathlib import Path
# from GPTcommands import getGPTtransform
# from sdapi import makeSDXLimage, makeSDXLimageOutpaint, makeSDXLpipeline, makeSDXLoutpaintpipe, delpipe
# from configdata import status, config, heartbeat

# from db_calls import *






from configdata import status, pipelines, config, payload
from lib.status import statusEncode, statusSend, checkReadyState
# from gpt4all import GPT4All


# def transform_prompt(context, transform_prompt,max_tokens, ):
#     # model = GPT4All('gpt4all-falcon-q4_0.gguf', model_path="/home/kaos/.local/share/nomic.ai/GPT4All/" )
#     model = GPT4All('mistral-7b-instruct-v0.1.Q4_0.gguf', model_path="/home/kaos/.local/share/nomic.ai/GPT4All/" )
#     # model = GPT4All('Mistral Instruct')
#     system_template = context 
#     prompt_template = 'USER: {0}\nASSISTANT: '
#     with model.chat_session(system_template, prompt_template):
#         response = model.generate(transform_prompt, max_tokens=max_tokens, temp=0.7)
#         # print(response)
#         transformedprompt = response
#     return transformedprompt


# def genImg(prompt):
#     pipe = StableDiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5") ##, torch_dtype=torch.float32)
#     pipe = pipe.to("cuda")
#     # prompt = "a photo of an astronaut riding a horse on mars"
#     image = pipe(prompt).images[0]
#     image.save("test.png")


# input = sys.argv[1]
# pipeline = sys.argv[2]
output = []


def test():
    # genImg("test")

    context = input
    for step in pipelines["pipeline"]["steps"]:
        if step["type"] == "text":
            out = transform_prompt(context, step["prompt"], step["config"]["max_tokens"])
            output.append(out)
            context = out
        elif step["type"] == "img":
            genImg(context)
        print(out)
        print("adding a round")        
        # print(sys.argv[1])
        # print(sys.argv[2])

    # print (output)


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

def encode_file_to_base64(path):
    with open(path, 'rb') as file:
        return base64.b64encode(file.read()).decode('utf-8')
    
def decode_and_save_base64(base64_str, save_path):
    if base64_str.startswith("data:image/png;base64,"):
        b64 = base64_str[len("data:image/png;base64,"):]
    else: 
        b64 =  base64_str  # or whatever
    with open(save_path, "wb") as file:
        file.write(base64.b64decode(b64))
    
async def generateAndSwapFace(prompt, face):
    '''
    create a new image using Automatic1111 + reactor
    '''
    global status
    status["sdparams"]["aiready"] = False
    steps = status["sdparams"]["steps"]
    denoising = status["sdparams"]["denoising"]
    sdsavedir = status["sdparams"]["sdsavedir"]

    controlnetpose = encode_file_to_base64("img/pose.png")
    # controlnetpose = "img/pose.png"
    # inputface = encode_file_to_base64("img/kop.jpg")
    # inputface = "img/kop.jpg"
    inputface = "/home/kaos/Documents/kaotec/FreeYouNext/tools/lawmaker/server/img/kop.jpg"
    prompt = "(8k, best quality, masterpiece, highly detailed:1.1),realistic photo of fantastic happy woman,hairstyle of blonde and red short bob hair,modern clothing,cinematic lightning,film grain,dynamic pose,bokeh,dof"
    neg = "ng_deepnegative_v1_75t,worst quality,low quality,normal quality,lowres,bad anatomy,bad hands,((monochrome)),((grayscale)),negative_hand-neg,badhandv4,nude,naked,strabismus,cross-eye,heterochromia,((blurred))"
    payload['alwayson_scripts']['ControlNet']['args'][0]['image']['image'] = controlnetpose
    payload['alwayson_scripts']['ControlNet']['args'][0]['image']['mask'] = None
    payload['alwayson_scripts']['ReActor']['args'][0]['im'] = inputface
    payload['prompt'] = prompt
    payload['negative_prompt'] = neg
    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(None, partial(requests.post, url=f'{config["sd"]["url"]}sdapi/v1/txt2img', json=payload))
    r = response.json()
    if 'error' in r.keys():
        print(r)
    else:
        for n, i in enumerate(r['images']):
            print("saving image ", n)
            image = Image.open(io.BytesIO(base64.b64decode(i.split(",", 1)[0])))

    filename = 'output'+str("test123")
    # impath = os.path.join(sdsavedir, filename + ".png")
    impath = os.path.join("outputs/"+ filename +  ".png")
    print(impath)
    image.save(impath)
    status["apps"]["lawmaker"]['stage'] = 2
    # print( sdsavedir + filename + ".png saved")
    print(impath + ".png saved")
    status["sdparams"]["aiready"] = True
    statusSend(status)



async def handler(websocket):
    """
    Handle a connection 
    """     
    global status
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
                print("The command is:" + str(event))
                
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
                    status["apps"]["lawmaker"]["stage"] = 1
                    print("generating image")

                    decode_and_save_base64(event["data"], "/home/kaos/Documents/kaotec/FreeYouNext/tools/lawmaker/server/img/kop.jpg")
                    await generateAndSwapFace("", "")

                    # inputimg = event["data"]
                    # print(inputimg[0:100])
                    statusSend(status)



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



async def main():    

    async with websockets.serve(handler, "", 8001, max_size=2**22):
        await asyncio.Future()  # run forever
    




# if __name__ == "__main__":
#     main()


if __name__ == "__main__":

    asyncio.run(main())
    