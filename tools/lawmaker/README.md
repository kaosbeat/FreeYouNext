# transformer tools 

## purpose 

Transformer have a simple purpose. Use AI to transform a text into a new text. Maybe create an image to go with that text

# setup
## create pyenv
pyenv virtualenv transformer
pyenv local transformer

# config
select backend, local? remote?

# run webserver
gradio!


## HACK
# DIRTY HACK FIX ME

For the lawmaker faceswap a hackj is needed

in

```stable-diffusion-webui/extensions/sd-webui-reactor/scripts/reactor_swapper.py```

look at line 524 etc

at 
```
                source_img =  Image.open(source_img['im'])
```

otherwise it breaks.
this will brak the calling from the webui...

```  if select_source == 0 and source_img is not None:
                # print(source_img["_size"])
                # inputface = Image.open("img/kop.jpg")  
                # source_img = Image.open("/home/kaos/Documents/kaotec/FreeYouNext/tools/lawmaker/server/img/kop.jpg")  ## >>> kinda works 
                source_img =  Image.open(source_img['im'])
                source_img = cv2.cvtColor(np.array(source_img), cv2.COLOR_RGB2BGR)
```


passing an ABSOLUTE PATH is needed from  the server script