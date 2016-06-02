from app import db


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

    def __init__(self):
        pass

    @property
    def path(self):
        return "{dirname}/{filename}.mp4".format(dirname=self.youtube_id[:3], filename=self.youtube_id)

    def annotate(self):
        pass

    def __repr__(self):
        return '<youtube_id {}>'.format(self.youtube_id)


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
