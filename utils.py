from subprocess import call


def split(video, fps=6, start=30, time=30, folder='frames'):
    call(['ffmpeg',
          '-i',
          video,
          '-ss 00:00:{start_point}'.format(start_point=start),
          '-t 00:00:{duration}'.format(duration=time),
          '-vf',
          'fps={fps}'.format(fps=fps),
          '{folder}/frame%03d.jpg'.format(folder=folder)])
