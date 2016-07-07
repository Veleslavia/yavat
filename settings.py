from os.path import expanduser

CUSTOM_STATIC_PATH = expanduser('~/videodb/')
SECRET_KEY = 'development key'
USERNAME = 'admin'
PASSWORD = 'default'
#SQLALCHEMY_DATABASE_URI = "postgresql://mvideo:mvideo@mvideodb.s.upf.edu/mvideodb"
SQLALCHEMY_DATABASE_URI = "postgresql://mvideo:mvideo@localhost/mvideodb"
REMOTE_DATA_LOCATION = 'olga@10.80.29.57:/home/olga/videodb'