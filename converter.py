# -*- coding: utf-8 -*-

import os
from moviepy.editor import VideoFileClip
import sys
filename = str(sys.argv[1])
print(filename)
video = VideoFileClip(os.path.realpath(filename))
video.audio.write_audiofile(os.path.realpath(filename.replace('.mp4', '.mp3')))
sys.stdout.flush()
