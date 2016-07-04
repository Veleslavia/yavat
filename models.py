import os
import dlib

from database import db
from utils import json_to_frames
from settings import *


class Video(db.Model):
    __tablename__ = 'videos'

    youtube_id = db.Column(db.String(), primary_key=True)
    status = db.Column(db.String())
    format = db.Column(db.String())
    title = db.Column(db.String())
    description = db.Column(db.String())
    thumbnails = db.Column(db.String())
    query_name = db.Column(db.String())
    annotation = db.Column(db.String())
    is_solo = db.Column(db.Float())
    wrong_category = db.Column(db.Boolean())
    skip = db.Column(db.Boolean())

    @property
    def path(self):
        return "{dirname}/{filename}.mp4".format(dirname=self.youtube_id[:3], filename=self.youtube_id)

    @property
    def json(self):
        return "{dirname}/{filename}.json".format(dirname=self.youtube_id[:3], filename=self.youtube_id)

    @property
    def audio_filename(self):
        return "{dirname}/{filename}.wav".format(dirname=self.youtube_id[:3], filename=self.youtube_id)

    def annotate(self):
        pass

    def __repr__(self):
        return '<youtube_id {}>\n<status {}>\n<annotation {}>'.format(self.youtube_id, self.status, self.annotation)


class Queries(db.Model):
    __tablename__ = 'queries'

    name = db.Column(db.String(), primary_key=True)
    class_id = db.Column(db.Integer())

    def __init__(self, name, class_id):
        self.name = name
        self.class_id = class_id

    def __repr__(self):
        return '<query content {}, class id {}>'.format(self.name, self.class_id)


class Instruments(db.Model):
    __tablename__ = 'instruments'

    class_id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String())

    def __init__(self, name, class_id):
        self.name = name
        self.class_id = class_id

    def __repr__(self):
        return '<instrument name {}, class id {}>'.format(self.name, self.class_id)


class Tracker:
    def __init__(self, json, previous_frame, left, top, width, height):
        self.tracker = dlib.correlation_tracker()
        self.frames = json_to_frames(os.path.join(CUSTOM_STATIC_PATH, json))
        points = [(left, top, left+width, top+height)]
        self.start_new_tracking(previous_frame, points)

    def start_new_tracking(self, previous_frame, points):
        self.tracker.start_track(self.frames[previous_frame], dlib.rectangle(*points[0]))

    def get_next_box(self, current_frame):
        self.tracker.update(self.frames[current_frame])
        rect = self.tracker.get_position()
        left = int(rect.left())
        top = int(rect.top())
        width = int(rect.right()) - left
        height = int(rect.bottom()) - top
        return left, top, width, height

"""
    def to_json(self):
        tracker_dict = {"tracker": pickle.dumps(self)}
        return tracker_dict
"""