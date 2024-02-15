#!/usr/bin/env python

import asyncio
import json
import os
import websockets
import gradio as gr

# import base64
# import time
# from functools import partial
# import requests
# from PIL import Image, PngImagePlugin
# # from diffusers.utils import load_image
# import io
# from io import BytesIO
# from threading import Thread, Timer
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



from configdata import status
from lib.status import statusEncode, statusSend, checkReadyState
from gpt4all import GPT4All


def transform_prompt(context, transform_prompt):
    # model = GPT4All('gpt4all-falcon-q4_0.gguf', model_path="/home/kaos/.local/share/nomic.ai/GPT4All/" )
    model = GPT4All('mistral-7b-instruct-v0.1.Q4_0.gguf', model_path="/home/kaos/.local/share/nomic.ai/GPT4All/" )
    # model = GPT4All('Mistral Instruct')
    system_template = context 
    prompt_template = 'USER: {0}\nASSISTANT: '
    with model.chat_session(system_template, prompt_template):
        response = model.generate(transform_prompt, max_tokens=100, temp=0.7)
        # print(response)
        transformedprompt = response
    return transformedprompt





demo = gr.Interface(
    fn=transform_prompt,
    inputs=["text", "text"],
    outputs=["text"],
)

demo.launch()