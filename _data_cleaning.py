import os

import psycopg2

from utils import get_length, convert_and_crop_audio, split, make_json
from settings import SQLALCHEMY_DATABASE_URI, CUSTOM_STATIC_PATH


def clean_parts():
    for root, dir, files in os.walk(CUSTOM_STATIC_PATH):
        for filename in files:
            if ".part" in filename:
                os.remove(os.path.join(root, filename))


def set_length():
    connection = psycopg2.connect(SQLALCHEMY_DATABASE_URI)
    cursor = connection.cursor()
    for root, dir, files in os.walk(CUSTOM_STATIC_PATH):
        file_keys = set()
        for filename in files:
            youtube_id = filename.split('.')[0]
            if youtube_id not in file_keys:
                length = get_length(os.path.join(root, filename))
                cursor.execute("UPDATE videos SET length = {length} WHERE youtube_id = '{youtube_id}' ".format(
                    length=length, youtube_id=youtube_id))
                connection.commit()
                file_keys.add(youtube_id)


def delete_top_1000():
    filenames = [line.split()[0] for line in open("/home/olga/sorted_sizes.txt").readlines()][:1000]
    connection = psycopg2.connect(SQLALCHEMY_DATABASE_URI)
    cursor = connection.cursor()
    for filename in filenames:
        path = os.path.join(CUSTOM_STATIC_PATH, filename[:3], filename)
        try:
            os.remove(path+".mp4")
        except:
            pass
        try:
            os.remove(path+".m4a")
        except:
            pass
        try:
            os.remove(path+".webm")
        except:
            pass
        cursor.execute("UPDATE videos SET status = '{status}', skip = TRUE WHERE youtube_id = '{youtube_id}' ".format(
                    status="deleted", youtube_id=filename))
        connection.commit()


def create_json_and_wav():
    connection = psycopg2.connect(SQLALCHEMY_DATABASE_URI)
    cursor = connection.cursor()
    for root, dir, files in os.walk(CUSTOM_STATIC_PATH):
        file_keys = set()
        for filename in files:
            youtube_id = filename.split('.')[0]
            if youtube_id not in file_keys:
                if os.path.exists(os.path.join(root, youtube_id+".m4a")):
                    convert_and_crop_audio(os.path.join(root, youtube_id+".m4a"))
                elif os.path.exists(os.path.join(root, youtube_id+".webm")):
                    convert_and_crop_audio(os.path.join(root, youtube_id+".webm"))
                else:
                    continue
                if os.path.exists(os.path.join(root, youtube_id+".mp4")):
                    make_json(os.path.join(root, youtube_id+".mp4"))
                else:
                    continue
                cursor.execute("UPDATE videos SET status = '{status}' WHERE youtube_id = '{youtube_id}' ".format(
                    status="ready", youtube_id=youtube_id))
                connection.commit()
                file_keys.add(youtube_id)
