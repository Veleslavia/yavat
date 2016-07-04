var width_global = 640,
    height_global = 360;

var options = ({
    'rate': 30,
    'controls': true,
    'autoplay': false,
    'backwards': false,
    'startFrame': 0,
    'width': '640px',
    'height': '360px'
});

var player = new FramePlayer('my-player', options);
player.play();