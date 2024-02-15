## bring our videoo to 512x512

ffmpeg -i 2024-02-11-111119.webm -vf "crop=720:720:280:0,scale=512:512" video.mp4