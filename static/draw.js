var annotations = []

function remove(arr, item) {
    for(var i = arr.length; i--;) {
        if(arr[i].text === item) {
            arr.splice(i, 1);
        }
    }
}

function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4());
}

function addObject(annotation) {

    var note = document.createElement('div');
    note.className = 'instrument';
    note.id = guidGenerator();

    var textId = document.createElement('div');
    textId.className = 'text_id';
    textId.innerHTML = note.id;
    note.appendChild(textId)

    var delButton = document.createElement('button');
    delButton.className = 'del_button';
    delButton.id = note.id + '_btn'
    delButton.innerHTML = 'Delete';
    note.appendChild(delButton);

    var select = document.createElement('select');
    select.className = 'select'
    var instruments = ["Accordion","Banjo", "Cello", "Drum", "Flute",
                       "Guitar", "Piano", "Saxophone", "Trombone", "Trumpet", "Violin"];
    var fragment = document.createDocumentFragment();
    instruments.forEach(function(instrument, index) {
        var opt = document.createElement('option');
        opt.innerHTML = instrument;
        opt.value = instrument;
        fragment.appendChild(opt);
    });
    select.appendChild(fragment);
    note.appendChild(select);

    var freeComment = document.createElement('textarea');
    freeComment.className = 'free_comment'
    freeComment.rows = '2';
    note.appendChild(freeComment)

    annotation.appendChild(note);

    rectangle = document.createElement('div');
    rectangle.id = note.id+'_rect';
    rectangle.className = 'rectangle'

    document.getElementById('canvas').appendChild(rectangle);

    $('.rectangle')
        .draggable({
            containment: "#canvas"
        })
        .resizable({
            handles: 'ne, sw, nw, ew, ns, we, sn, se',
            containment: "#canvas"
        });
    $(".rectangle").find('.ui-icon').removeClass('ui-icon');

    annotations.push({
            left: rectangle.offsetLeft,
            top: rectangle.offsetTop,
            width: rectangle.offsetWidth,
            height: rectangle.offsetHeight,
            time: document.getElementById("video").currentTime,
            text: note.id+'_rect'
        })

    /*
    document.getElementById(note.id).addEventListener('click', function()
        {
            if (document.getElementById(note.id).className == 'instrument') {
                modifyAnnotation(document.getElementById('canvas'), note.id, true);
            } else {
                modifyAnnotation(document.getElementById('canvas'), note.id, false);
            }
        }
    );
    */

    document.getElementById(delButton.id).addEventListener('click', function ()
        {
            document.getElementById(note.id).remove();
            document.getElementById(note.id+'_rect').remove();
            remove(annotations, note.id+'_rect');
        }
    );


    // initDraw(document.getElementById('canvas'), note.id+'_rect');
}

/*
function modifyAnnotation(canvas, note_id, start) {
    var handlesSize = 8,
        currentHandle = false,
        drag = false;

    var rectangle = document.getElementById(note_id+'_rect');

    var rectangle_left = rectangle.offsetLeft, rectangle_top = rectangle.offsetTop,
        rectangle_width = rectangle.offsetWidth - 4, rectangle_height = rectangle.offsetHeight - 4;

    function exit() {
        document.getElementById(note_id).className = 'instrument';
        document.getElementById(note_id+'_rect').className = 'rectangle';
        annotations.push({
            left: rectangle.offsetLeft,
            top: rectangle.offsetTop,
            width: rectangle.offsetWidth,
            height: rectangle.offsetHeight,
            time: document.getElementById("video").currentTime,
            text: note_id+'_rect'
        })
    }

    function init() {
        document.getElementById(note_id).className = 'active_instrument';
        document.getElementById(note_id+'_rect').className = 'active_rectangle';

        canvas.addEventListener('mousedown', mouseDown, false);
        canvas.addEventListener('mouseup', mouseUp, false);
        canvas.addEventListener('mousemove', mouseMove, false);
    }

    function draw() {
        rectangle.style.left = rectangle_left + 'px';
        rectangle.style.top = rectangle_top + 'px';
        rectangle.style.width = rectangle_width + 'px';
        rectangle.style.height = rectangle_height + 'px';
        if (currentHandle) {
            switch (currentHandle) {
                case 'topleft':
                    canvas.style.cursor = 'nw-resize';
                    break;
                case 'topright':
                    canvas.style.cursor = 'ne-resize';
                    break;
                case 'bottomleft':
                    canvas.style.cursor = 'sw-resize';
                    break;
                case 'bottomright':
                    canvas.style.cursor = 'se-resize';
                    break;
                case 'top':
                    canvas.style.cursor = 'ns-resize';
                    break;
                case 'left':
                    canvas.style.cursor = 'ew-resize';
                    break;
                case 'bottom':
                    canvas.style.cursor = 'ns-resize';
                    break;
                case 'right':
                    canvas.style.cursor = 'ew-resize';
                    break;
                case 'center':
                    canvas.style.cursor = 'move';
            }
        } else {
            canvas.style.cursor = "default";
        }
    };

    function point(x, y) {
        return {
            x: x,
            y: y
        };
    }

    function dist(p1, p2) {
        return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
    }

    function getHandle(mouse) {
        if (dist(mouse, point(rectangle.offsetLeft, rectangle.offsetTop)) <= handlesSize) return 'topleft';
        if (dist(mouse, point(rectangle.offsetLeft + rectangle.offsetWidth, rectangle.offsetTop)) <= handlesSize) return 'topright';
        if (dist(mouse, point(rectangle.offsetLeft, rectangle.offsetTop + rectangle.offsetHeight)) <= handlesSize) return 'bottomleft';
        if (dist(mouse, point(rectangle.offsetLeft + rectangle.offsetWidth, rectangle.offsetTop + rectangle.offsetHeight)) <= handlesSize) return 'bottomright';
        if (dist(mouse, point(rectangle.offsetLeft + rectangle.offsetWidth / 2, rectangle.offsetTop)) <= handlesSize) return 'top';
        if (dist(mouse, point(rectangle.offsetLeft, rectangle.offsetTop + rectangle.offsetHeight / 2)) <= handlesSize) return 'left';
        if (dist(mouse, point(rectangle.offsetLeft + rectangle.offsetWidth / 2, rectangle.offsetTop + rectangle.offsetHeight)) <= handlesSize) return 'bottom';
        if (dist(mouse, point(rectangle.offsetLeft + rectangle.offsetWidth, rectangle.offsetTop + rectangle.offsetHeight / 2)) <= handlesSize) return 'right';
        if (dist(mouse, point(rectangle.offsetLeft + rectangle.offsetWidth / 2, rectangle.offsetTop + rectangle.offsetHeight / 2)) <= handlesSize) return 'center';
        return false;
    }

    function mouseDown() {
        if (currentHandle) drag = true;
        draw();
    }

    function mouseUp() {
        drag = false;
        currentHandle = false;
        draw();
    }

    function mouseStop(e) {
        var previousHandle = false;
        currentHandle = false;
        drag = false;
    }

    function mouseMove(e) {
        var previousHandle = currentHandle;
        if (!drag) currentHandle = getHandle(point(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop));
        draw();
        if (currentHandle && drag) {
            var mousePos = point(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
            switch (currentHandle) {
                case 'topleft':
                    rectangle_width += rectangle.offsetLeft - mousePos.x;
                    rectangle_height += rectangle.offsetTop - mousePos.y;
                    rectangle_left = mousePos.x;
                    rectangle_top = mousePos.y;
                    break;
                case 'topright':
                    rectangle_width = mousePos.x - rectangle.offsetLeft;
                    rectangle_height += rectangle.offsetTop - mousePos.y;
                    rectangle_top = mousePos.y;
                    break;
                case 'bottomleft':
                    rectangle_width += rectangle.offsetLeft - mousePos.x;
                    rectangle_left = mousePos.x;
                    rectangle_height = mousePos.y - rectangle.offsetTop;
                    break;
                case 'bottomright':
                    rectangle_width = mousePos.x - rectangle.offsetLeft;
                    rectangle_height = mousePos.y - rectangle.offsetTop;
                    break;
                case 'top':
                    rectangle_height += rectangle.offsetTop - mousePos.y;
                    rectangle_top = mousePos.y;
                    break;
                case 'left':
                    rectangle_width += rectangle.offsetLeft - mousePos.x;
                    rectangle_left = mousePos.x;
                    break;
                case 'bottom':
                    rectangle_height = mousePos.y - rectangle.offsetTop;
                    break;
                case 'right':
                    rectangle_width = mousePos.x - rectangle.offsetLeft;
                    break;
                case 'center':
                    rectangle_left = mousePos.x - rectangle.offsetWidth / 2;
                    rectangle_top = mousePos.y - rectangle.offsetHeight / 2;
                    break;
            }
        }
        if (drag || currentHandle != previousHandle) draw();
    }

    if (start) {
        init();
        draw();
    } else {
        exit();
    }
}
*/

/*
function initDraw(canvas, uid) {

    function setMousePosition(e) {
        var e = window.event;
        mouse.x = e.pageX - canvas.offsetLeft;
        mouse.y = e.pageY - canvas.offsetTop;
    };

    function OnMouseDownUp(e) {
        setMousePosition(e);
        if (element !== null) {
            element = null;
            canvas.style.cursor = "default";
            console.log("Finish drawing box in coordinates: ", mouse.x, mouse.y);
            canvas.onmousedown = null;
            canvas.onmouseup = null;
            annotations.push({
                left: (mouse.x - mouse.startX < 0) ? mouse.x : mouse.startX,
                top: (mouse.y - mouse.startY < 0) ? mouse.y : mouse.startY,
                width: Math.abs(mouse.x - mouse.startX),
                height: Math.abs(mouse.y - mouse.startY),
                time: document.getElementById("video").currentTime,
                text: uid
        })

        } else {
            console.log("Start drawing box in coordinates: ", mouse.x, mouse.y);
            mouse.startX = mouse.x;
            mouse.startY = mouse.y;
            element = document.createElement('div');
            element.id = uid;
            element.className = 'rectangle'
            element.style.left = mouse.x + 'px';
            element.style.top = mouse.y + 'px';
            canvas.appendChild(element)
            canvas.style.cursor = "crosshair";
        }
    };

    var mouse = {
        x: 0,
        y: 0,
        startX: 0,
        startY: 0
    };
    var element = null;

    canvas.onmousemove = function (e) {
        setMousePosition(e);
        if (element !== null) {
            element.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
            element.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
            element.style.left = (mouse.x - mouse.startX < 0) ? mouse.x + 'px' : mouse.startX + 'px';
            element.style.top = (mouse.y - mouse.startY < 0) ? mouse.y + 'px' : mouse.startY + 'px';
        }
    }

    canvas.onmousedown = function(e) { OnMouseDownUp(e); }
    canvas.onmouseup = function(e) { OnMouseDownUp(e); }

}
*/