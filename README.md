# YAVAT


## Dependencies

* [`Dlib` with Python support](http://dlib.net/)
* [`Dlib compilation guide`](http://dlib.net/compile.html)
* [`OpenCV` with Python support](http://opencv.org)
* [`OpenCV compilation guide`](http://www.pyimagesearch.com/2015/06/22/install-opencv-3-0-and-python-2-7-on-ubuntu/)
* For Ubuntu/Debian you can use: sudo apt-get install libopencv-dev python-opencv
* [ Another OpenCV compilation `guide`](https://help.ubuntu.com/community/OpenCV)
* sys.path.append('/usr/local/lib/python2.7/site-packages')
* flask, flask_sqlalchemy

## Potential improvements
https://hub.docker.com/r/dkarchmervue/python27-opencv/
https://github.com/steeve/docker-opencv/blob/master/Dockerfile


## Apache

/var/www/yavat/app.wsgi 

```
import sys
from os.path import expanduser
sys.path.insert(0, expanduser('~/yavat'))

from app import app as application

```

/etc/apache2/sites-available/yavat.conf

``` 
<VirtualHost *>
    ServerName mvideodb.s.upf.edu

    WSGIDaemonProcess app user=oslizovskaia group=mtg_users threads=5
    WSGIScriptAlias / /var/www/yavat/app.wsgi

    <Directory /var/www/yavat>
        WSGIProcessGroup app
        WSGIScriptReloading On
        WSGIApplicationGroup %{GLOBAL}
        Order deny,allow
        Allow from all
    </Directory>
</VirtualHost>

```

sudo a2ensite yavat.conf
sudo service apache2 restart


Finally, use sshfs to mount `videodb` data directory and `mvideodb` PostgreSQL DB on mvideodb server.