import os
from flask import Flask, request, session, g, redirect, url_for, abort, \
     render_template, flash, send_from_directory
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Load default config and override config from an environment variable
app.config.update(dict(
    DEBUG=True,
    SECRET_KEY='development key',
    USERNAME='admin',
    PASSWORD='default',
    CUSTOM_STATIC_PATH='/Users/olya/videodb/',
    #SQLALCHEMY_DATABASE_URI="postgresql://mvideo:mvideo@mvideodb.s.upf.edu/mvideodb"
    SQLALCHEMY_DATABASE_URI="postgresql://mvideo:mvideo@localhost/mvideodb"
))
app.config.from_envvar('FLASKR_SETTINGS', silent=True)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db = SQLAlchemy(app)

from models import Video, Queries, Instruments


@app.route('/')
def show_entries(vid=None):
    vid = request.args.get('vid')
    if not vid:
        return redirect(url_for('new_video'))
    else:
        video = Video.query.get(vid)
        return render_template('show_entries.html', video=video)


@app.route('/cdn/<path:filename>')
def custom_static(filename):
    return send_from_directory(app.config['CUSTOM_STATIC_PATH'], filename)


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
    entries = db.session.query(Video, Instruments).\
        join(Queries, Queries.name == Video.query_name).\
        join(Instruments, Queries.class_id == Instruments.class_id).\
        distinct(Instruments.name).all()
    return render_template('new_video.html', entries=entries)