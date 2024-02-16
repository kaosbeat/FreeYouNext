pipelines = {"fine": {
                    "context": "", 
                    "steps":[{"type":"text", 
                              "prompt":"you are a novel writer, when given a simple sentence contasining a situation, you write a small story around it, describing what happened before, or what will happen afterwards. You describe the scene and the characters in great detail. You can make things up", 
                              "config":{"max_tokens":200, "temp": 0.7}},
                             {"type":"text", 
                              "prompt":"rewrite the followoing text so the main charcter is guilty of violating several silly laws that you can make up, state the situations and why the charcter is violating the very silly laws, he nmight not be aware of them", 
                              "config":{"max_tokens":200, "temp": 0.7}},
                             {"type":"text", 
                              "prompt":"turn the following into a description of a scene that you describe as if you were a photographer, describe the composition , lights , film type used, depth of field etc ", 
                              "config":{"max_tokens":200, "temp": 0.9}},
                             {"type":"img", "prompt":"", "config":{}}]
                  },
           "test":
          {
               
          }
        }

config = {"sd": {"url": "http://localhost:7860/"}}


payload = {'alwayson_scripts': 
           {'API payload': {'args': []}, 
            'AnimateDiff': {'args': [{'batch_size': 16, 'closed_loop': 'R-P', 'enable': False, 'format': ['GIF', 'PNG'], 'fps': 8, 'interp': 'Off', 'interp_x': 10, 'last_frame': None, 'latent_power': 1, 'latent_power_last': 1, 'latent_scale': 32, 'latent_scale_last': 32, 'loop_number': 0, 'model': 'mm_sd_v15_v2.ckpt', 'overlap': -1, 'request_id': '', 'stride': 1, 'video_length': 16, 'video_path': '', 'video_source': None}]}, 
            'ControlNet': {'args': [{
                'batch_images': '', 
                'control_mode': 
                'Balanced', 
                'enabled': True, 
                'guidance_end': 1, 
                'guidance_start': 0, 
                'image': {
                    'image': 'base64image placeholder', 
                    'mask': 'base64image placeholder'
                    }, 
                'input_mode': 'simple', 
                'is_ui': True, 
                'loopback': False, 
                'low_vram': False, 
                'model': 'control_v11p_sd15_openpose [cab727d4]', 
                'module': 'none', 
                'output_dir': '', 
                'pixel_perfect': False, 
                'processor_res': -1, 
                'resize_mode': 
                'Crop and Resize', 
                'save_detected_map': True, 
                'threshold_a': -1, 
                'threshold_b': -1, 
                'weight': 1}, 
                {'batch_images': '', 'control_mode': 'Balanced', 'enabled': False, 'guidance_end': 1, 'guidance_start': 0, 'image': None, 'input_mode': 'simple', 'is_ui': True, 'loopback': False, 'low_vram': False, 'model': 'None', 'module': 'none', 'output_dir': '', 'pixel_perfect': False, 'processor_res': 512, 'resize_mode': 'Crop and Resize', 'save_detected_map': True, 'threshold_a': 64, 'threshold_b': 64, 'weight': 1}, {'batch_images': '', 'control_mode': 'Balanced', 'enabled': False, 'guidance_end': 1, 'guidance_start': 0, 'image': None, 'input_mode': 'simple', 'is_ui': True, 'loopback': False, 'low_vram': False, 'model': 'None', 'module': 'none', 'output_dir': '', 'pixel_perfect': False, 'processor_res': 512, 'resize_mode': 'Crop and Resize', 'save_detected_map': True, 'threshold_a': 64, 'threshold_b': 64, 'weight': 1}]}, 
            'Extra options': {'args': []}, 
            'Hypertile': {'args': []}, 
            'OpenOutpaint': {'args': []}, 
            'ReActor': {'args': [
                {'_category': 0, 
                 '_exif': None, 
                 '_size': [512, 512], 
                 'im': None, 
                 'info': {'dpi': [72, 72], 'exif': None, 'jfif': 257, 'jfif_density': [1, 1], 'jfif_unit': 0, 'jfif_version': [1, 1]}, 
                 'mode': 'RGB', 
                 'palette': None, 
                 'pyaccess': None, 
                 'readonly': 0}, 
                 True, '0', '0', 'inswapper_128.onnx', 'CodeFormer', 1, True, 'None', 1, 1, False, True, 1, 0, 0, False, 0.5, True, False, 'CUDA', False, 0, 'None', '', None, False, False, 0.5, 0]}, 
            'Refiner': {'args': [False, '', 0.8]}, 
            'Seed': {'args': [-1, False, -1, 0, 0, 0]}
            }, 
            'batch_size': 1, 
            'cfg_scale': 7, 
            'comments': {}, 
            'disable_extra_networks': False, 
            'do_not_save_grid': False, 
            'do_not_save_samples': False, 
            'enable_hr': False, 
            'height': 512, 
            'hr_negative_prompt': '', 
            'hr_prompt': '', 
            'hr_resize_x': 0, 
            'hr_resize_y': 0, 
            'hr_scale': 2, 
            'hr_second_pass_steps': 0, 
            'hr_upscaler': 'Latent', 
            'n_iter': 1, 
            'negative_prompt': '', 
            'override_settings': {}, 
            'override_settings_restore_afterwards': True, 
            'prompt': 'a person looking at the camera, the full body is visible, a crime was just commited by the person', 
            'restore_faces': False, 
            's_churn': 0.0, 
            's_min_uncond': 0, 
            's_noise': 1.0, 
            's_tmax': None, 
            's_tmin': 0.0, 
            'sampler_name': 'Euler a', 
            'script_args': [], 
            'script_name': None, 
            'seed': -1, 
            'seed_enable_extras': True, 
            'seed_resize_from_h': -1, 
            'seed_resize_from_w': -1, 
            'steps': 10, 
            'styles': [], 
            'subseed': -1, 
            'subseed_strength': 0, 
            'tiling': False,
            'width': 512}

prompts = ["you are a journalist"]

status ={
    "type": "status",
    "session": {
                "app":"lawmaker",
                "title":"lawmaker", 
                "path":"/savedir",
                "config": config,
                },
    "apitype" : "diffusers",  # "eden" or "automatic1111" or "diffusers", for eden check old code implementation"

    "connectioninfo": { "connections" : [],
                        "connidjson" : {"screen": [], "control": [], "transformer": [], "config": []},
                        "readystate": False
                        },
    "apps": {
        "lawmaker": {
            "stage": 0, # this var keeps the current stage of the flow. Each component will only act on a certain stage, and update the stage when the task is finished
            "laws": [{"prompt":"a $age -year old $gender person eating a sandwich, world press photo ", 
                      "negative_prompt": "small sandwich, worst quality,low quality,normal quality,lowres,bad anatomy,bad hands,((monochrome)),disfigured, deformed, helmet,negative_hand-neg,badhandv4,nude,naked,strabismus,cross-eye,heterochromia,((blurred)), anime, drawing", 
                      "pose":"/home/kaos/Documents/kaotec/FreeYouNext/tools/lawmaker/server/img/poses/pose_sandwich.png", 
                      "law":"no sandwich"},
                     {"prompt":"a $age -year old $gender person walking backwards on the sidewalk on a sunny day, CCTV footage, cinematic film quality ", 
                      "negative_prompt": "walking normally,  worst quality,low quality,normal quality,lowres,bad anatomy,bad hands,((monochrome)),((grayscale)),negative_hand-neg,badhandv4,nude,naked,strabismus,cross-eye,heterochromia,((blurred)), anime, drawing", 
                      "pose":"/home/kaos/Documents/kaotec/FreeYouNext/tools/lawmaker/server/img/poses/pose_backwards.png", 
                      "law":"no backward walking"},
					           {"prompt":"a $age -year old $gender person walking, ((on the sidewalk)) of an (urban street), wearing casual clothes and sneakers, (black and white filter)",
					            "negative_prompt": "worst quality,low quality,normal quality,lowres,bad anatomy,bad hands,((monochrome)),disfigured, deformed, helmet,negative_hand-neg,badhandv4,nude,naked,strabismus,cross-eye,heterochromia,((blurred)), anime, drawing", 
					            "pose":"/home/kaos/Documents/kaotec/FreeYouNext/tools/lawmaker/server/img/poses/better_pose_sidewalk.png",
				            	"law":"must wear helmet"}
				          	 {"prompt":"a $age -year old $gender person walking, on the sidewalk of an urban street, wearing (mismatching socks and hat),((black and white filter))",
				          	  "negative_prompt": "worst quality,low quality,normal quality,lowres,bad anatomy,bad hands,((monochrome)),disfigured, deformed, helmet,negative_hand-neg,badhandv4,nude,naked,strabismus,cross-eye,heterochromia,((blurred)), anime, drawing, matching socks and hat",
			          		  "pose":"/home/kaos/Documents/kaotec/FreeYouNext/tools/lawmaker/server/img/poses/better_pose_sidewalk.png",
				          	  "law":"no mismatching socks and hats"}
			          		 {"prompt":a $age -year old $gender person walking, stepping on a leaf, (in a park), (((black and white filter))), ((foot on leaf)), wearing casual clothes",
				          	  "negative_prompt":" worst quality,low quality,normal quality,lowres,bad anatomy,bad hands,((monochrome)),disfigured, deformed, helmet,negative_hand-neg,badhandv4,nude,naked,strabismus,cross-eye,heterochromia,((blurred)), anime, drawing",
				          	  "pose":"/home/kaos/Documents/kaotec/FreeYouNext/tools/lawmaker/server/img/poses/better_pose_sidewalk.png",
					            "law":"no stepping on leaves after 8pm"}
                     ],
            "currentfine": {"img":"path/to/imggen/fromweb", "law":"sandwichbreakerlaw"}
            }},

    "screen": { "black": True, "showprompt": False,},
    "control": { "promptmode": "edit"}, # "session" for directly controlling or "edit" for adding to a session
    "sdparams" : {  "aiready": True,
                    "aistarted": False,
                    "airefresh": 10,
                    "sdxl": False,
                    "selmask":"mask1024.png",
                    "maskpath": "data/mask1024.png",
                    "width": 1024,
                    "height": 1024,
                    "sdsavedir": "data/out/coretest",
                    "sampler_index": "DPM++ SDE Karras",
                    "steps":10,
                    "denoising":1,
                    "promptmethod": "osc", #osc for external messages, random for random selection from prompts   
                    "prompt": prompts[0],
                    "negativeprompt": "glitch, error, text, watermark, bad quality, blurry, vertical split, band, strip, frames, gray frames",
                    "globalstylepromptprefix" : "a painting from the renaissance ",
                    "globalstylepromptsuffix" : "intricate details, sharp focus, detailed backgrounds, a baroque painting by boticelli"},
    "transformparams" :{ 
                    "engine": "GPT4all", #openai or GPT4all
                    "code": 0, # openAI last reported status code
                    "codeanswer" : "",
                    "imagetransform": {
                        "enabled": True,
                        "init":'''You are a painter and you describe what you would paint when given a sentence. You describe an image fitting the scene using lots of deatils and object descriptions of everything happening in the image. The total description is about 2 sentences long and only contains elements to describe the image. Not anything like: this is an image depicting, or in this picture we see. No, just the description of objects as if you would see it in a fantasy universe and telling what you're seeing to the person next to you who is blind. ''',
                        "input":"",
                        "answer":""
                    },
                    "metaphortexttransform": {
                        "enabled": False,
                        "init": '''You are master in creating methaphors. When given an input sentence, you reply by giving one methaphor for the whole situation. Not several smaller methaphors, look at it from a holistic perspective. You also never repeat the input sentence or not even paraphrase it, you only give the metaphor, nothing more, nothing less''',
                        "input":"",
                        "answer":""
                    } 
                                          ,
                    "metaphorpaintingtransform": {
                        "enabled": False,
                        "init": '''You are master in describing methaphors graphically. When given metaphor you create a composition like a painter, describing in detail what it should look like, but not saying it is a compostion. You just describe it, objectified, never using the I or you pronouns. Also it can not be longer than 60 words. Pay attention to put in the most important describing adjectives there. Verbs are not needed unless they are useful in describing the content. So you don't say, I see a beautiful orange in a tree, but you just say a beautiful orange in a tree when the methaphor you were given would best be described as a beautiful orange in a tree. Everything you describe must fit into one scenographic composition. If you must use positional descriptions like: 'a bench is in front of the tree with a beautiful orange on it. Behind the tree we see the vast ocean.' ''',
                        "input":"",
                        "answer":""
                        },
                    "soundtransform": {
                        "enabled": False,
                        "init": '''You are a sound designer and you can describe sounds like no other, with details and comparisons so a reader can almost hear a sound when you are describing it.You omit graphical verbs (like look, seem, shine, etc) and adjectives that add nothing to the sound description''',
                        "input":"",
                        "answer":""
                    },
    },
    "fine" :{
        "image": "",

    }
}
