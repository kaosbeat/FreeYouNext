from datetime import datetime
import urllib.request
import base64
import json
import time
import os
from configdata import payload
from PIL import Image

webui_server_url = 'http://127.0.0.1:7860'

out_dir = 'api_out'
out_dir_t2i = os.path.join(out_dir, 'txt2img')
out_dir_i2i = os.path.join(out_dir, 'img2img')
os.makedirs(out_dir_t2i, exist_ok=True)
os.makedirs(out_dir_i2i, exist_ok=True)


def timestamp():
    return datetime.fromtimestamp(time.time()).strftime("%Y%m%d-%H%M%S")


def encode_file_to_base64(path):
    with open(path, 'rb') as file:
        return base64.b64encode(file.read()).decode('utf-8')


def decode_and_save_base64(base64_str, save_path):
    with open(save_path, "wb") as file:
        file.write(base64.b64decode(base64_str))


def call_api(api_endpoint, **payload):
    data = json.dumps(payload).encode('utf-8')
    request = urllib.request.Request(
        f'{webui_server_url}/{api_endpoint}',
        headers={'Content-Type': 'application/json'},
        data=data,
    )
    response = urllib.request.urlopen(request)
    return json.loads(response.read().decode('utf-8'))


def call_txt2img_api(**payload):
    response = call_api('sdapi/v1/txt2img', **payload)
    for index, image in enumerate(response.get('images')):
        save_path = os.path.join(out_dir_t2i, f'txt2img-{timestamp()}-{index}.png')
        decode_and_save_base64(image, save_path)


def call_img2img_api(**payload):
    response = call_api('sdapi/v1/img2img', **payload)
    for index, image in enumerate(response.get('images')):
        save_path = os.path.join(out_dir_i2i, f'img2img-{timestamp()}-{index}.png')
        decode_and_save_base64(image, save_path)


if __name__ == '__main__':
    controlnetpose = encode_file_to_base64("img/pose.png")
    # controlnetpose = "img/pose.png"
    # inputface = encode_file_to_base64("img/kop.jpg")
    inputface = "img/kop.jpg"
    prompt = "(8k, best quality, masterpiece, highly detailed:1.1),realistic photo of fantastic happy woman,hairstyle of blonde and red short bob hair,modern clothing,cinematic lightning,film grain,dynamic pose,bokeh,dof"
    neg = "ng_deepnegative_v1_75t,worst quality,low quality,normal quality,lowres,bad anatomy,bad hands,((monochrome)),((grayscale)),negative_hand-neg,badhandv4,nude,naked,strabismus,cross-eye,heterochromia,((blurred))"
    payload['alwayson_scripts']['ControlNet']['args'][0]['image']['image'] = controlnetpose
    payload['alwayson_scripts']['ControlNet']['args'][0]['image']['mask'] = None
    payload['alwayson_scripts']['ReActor']['args'][0]['im'] = inputface
    # payload['alwayson_scripts']['prompt'] = prompt
    # payload['alwayson_scripts']['negative_prompt'] = neg
    call_txt2img_api(**payload)





    # there exist a useful extension that allows converting of webui calls to api payload
    # particularly useful when you wish setup arguments of extensions and scripts
    # https://github.com/huchenlei/sd-webui-api-payload-display