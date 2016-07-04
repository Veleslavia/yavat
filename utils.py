import os
import base64

import cv2
import json
import numpy as np
import shutil


def split(video_filename, fps=30, start=30, time=30, folder='frames'):
    image_folder = os.path.join(os.path.dirname(video_filename), folder)
    if not os.path.exists(image_folder):
        os.mkdir(image_folder)
    else:
        shutil.rmtree(image_folder)
        os.mkdir(image_folder)
    ret_code = os.system("ffmpeg "
                         "-i {video_filename} "
                         "-s 640x360 "
                         "-ss 00:00:{start_point} "
                         "-t 00:00:{duration} -vf "
                         "fps={fps} "
                         "{folder}/frame%03d.jpg".format(
                            video_filename=video_filename,
                            start_point=start,
                            duration=time,
                            fps=fps,
                            folder=image_folder))
    if int(ret_code) == 0:
        return image_folder


def convert_and_crop_audio(audio_filename, start=30, time=30):

    output_filename = audio_filename.split('.')[0]+".wav"
    ret_code = os.system("ffmpeg "
                         "-i {audio_filename} "
                         "-ss 00:00:{start_point} "
                         "-t 00:00:{duration} "
                         "{output_filename}".format(
                            audio_filename=audio_filename,
                            start_point=start,
                            duration=time,
                            output_filename=output_filename))
    if int(ret_code) == 0:
        return output_filename
    else:
        raise IOError


def make_json(video_filename):
    folder = split(video_filename)
    frames = []
    if folder:
        for frame_filename in os.listdir(folder):
            data_uri = open(os.path.join(folder, frame_filename), "rb").read().encode("base64").replace("\n", "")
            img = "data:image/jpg;base64,{0}".format(data_uri)
            frames.append(img)
        json.dump({"frames": frames}, open(os.path.splitext(video_filename)[0]+".json", "w"))


def json_to_frames(json_filename):
    frames = []
    frames64 = json.load(open(json_filename))
    for elem in frames64["frames"]:
        img = base64.b64decode(elem.split(',')[1])
        npimg = np.fromstring(img, dtype=np.uint8)
        source = cv2.imdecode(npimg, -1)
        frames.append(source)
    return frames
