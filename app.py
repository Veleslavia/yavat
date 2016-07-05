import json
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, jsonify, request, session, redirect, url_for, abort, \
     render_template, flash, send_from_directory
from flask_sqlalchemy import sqlalchemy

from distutils.util import strtobool

from database import db
from models import Video, Queries, Instruments, Tracker
import settings

app = Flask(__name__)
_tracker = None


@app.route('/')
def show_entries():
    vid = request.args.get('vid')
    if not vid:
        return redirect(url_for('new_video'))
    else:
        session['vid'] = vid
        return render_template('show_entries.html', video=Video.query.get(vid))


@app.route('/cdn/<path:filename>')
def custom_static(filename):
    return send_from_directory(app.config['CUSTOM_STATIC_PATH'], filename)


@app.route('/_next_tracking')
def next_tracking():
    global _tracker

    if not session.get('vid'):
        abort(401)

    previous_frame = request.args.get('previous_frame', 0, type=int)
    current_frame = request.args.get('current_frame', 0, type=int)
    left = request.args.get('left', 0, int)
    top = request.args.get('top', 0, int)
    width = request.args.get('width', 0, int)
    height = request.args.get('height', 0, int)
    is_new_box = request.args.get('new_box', 0, int)

    if not _tracker:
        _tracker = Tracker(Video.query.get(session.get('vid')).json,
                                      previous_frame, left, top, width, height)
    elif is_new_box:
        _tracker.start_new_tracking(previous_frame, [(left, top, left+width, top+height)])

    new_left, new_top, new_width, new_height = _tracker.get_next_box(current_frame)
    return jsonify(left=new_left,
                   top=new_top,
                   width=new_width,
                   height=new_height)


@app.route('/_save_annotation')
def save_annotation():
    _video = Video.query.get(session.get('vid'))

    annotation_boxes = request.args.get('annotation_boxes')
    tracking_boxes = request.args.get('tracking_boxes')
    audio_segments = request.args.get('audio_segments')
    wrong_category = request.args.get('wrong_category')
    soloist = request.args.get('soloist')
    instruments = request.args.get('instruments')
    _video.annotation = json.dumps({"info": instruments,
                                    "manual": annotation_boxes,
                                    "auto": tracking_boxes,
                                    "audio": audio_segments})
    _video.is_solo = float(strtobool(soloist))
    _video.wrong_category = wrong_category

    db.session.commit()
    return jsonify(None)


@app.route('/_skip')
def skip():
    _video = Video.query.get(session.get('vid'))
    _video.skip = True
    db.session.commit()
    return redirect(url_for('new_video'))


@app.route('/add', methods=['POST'])
def add_entry():
    if not session.get('logged_in'):
        abort(401)
    return redirect(url_for('show_entries'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form['username'] != app.config['USERNAME']:
            error = 'Invalid username'
        elif request.form['password'] != app.config['PASSWORD']:
            error = 'Invalid password'
        else:
            session['logged_in'] = True
            flash('You were logged in')
            return redirect(url_for('show_entries'))
    return render_template('login.html', error=error)


@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    flash('You were logged out')
    return redirect(url_for('show_entries'))


@app.route('/new_video')
def new_video():
    global _tracker
    _tracker = None
    entries = db.session.query(Video, Instruments).\
        join(Queries, Queries.name == Video.query_name).\
        join(Instruments, Queries.class_id == Instruments.class_id).\
        distinct(Instruments.name).\
        filter(sqlalchemy.and_(Video.annotation.is_(None), ~Video.skip.is_(True), Video.status == 'ready')).all()
    return render_template('new_video.html', entries=entries)


if __name__ == "__main__":
    # Load default config and override config from an environment variable
    app.config.update(dict(
        DEBUG=True,
        SECRET_KEY=settings.SECRET_KEY,
        USERNAME=settings.USERNAME,
        PASSWORD=settings.PASSWORD,
        CUSTOM_STATIC_PATH=settings.CUSTOM_STATIC_PATH,
        SQLALCHEMY_DATABASE_URI=settings.SQLALCHEMY_DATABASE_URI
    ))

    app.config.from_envvar('FLASKR_SETTINGS', silent=True)
    db.init_app(app)
    handler = RotatingFileHandler('app.log', maxBytes=10000, backupCount=1)
    handler.setLevel(logging.INFO)
    app.logger.addHandler(handler)
    app.run(debug=False)
