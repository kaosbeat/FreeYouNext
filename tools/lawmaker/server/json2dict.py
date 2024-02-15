import json

def js_r(filename):
   with open(filename) as f_in:
       return(json.load(f_in))

if __name__ == "__main__":
    my_data = js_r('payload.json')
    print(my_data)