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

status ={}