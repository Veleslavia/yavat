var annotations = [];
var tracking_boxes = [];

function saveAnnotation() {

    var activated = document.getElementsByClassName('active_instrument');
    for(var i=0; activated[i]; ++i) {
        activated.className = 'instrument';
    }

    var videoAnnotations = document.getElementsByClassName('instrument');
    var forDatabase = [];
    for(var i=0; videoAnnotations[i]; ++i) {
        forDatabase.push({annotation_id: videoAnnotations[i].id,
                          instrument: document.getElementById(videoAnnotations[i].id+'_select').value,
                          comment: document.getElementById(videoAnnotations[i].id+'_comment').value});
        };

    $.getJSON($SCRIPT_ROOT + '/_save_annotation',
        {annotation_boxes: JSON.stringify(annotations),
         tracking_boxes:  JSON.stringify(tracking_boxes),
         audio_segments: JSON.stringify(segmentData),
         wrong_category: document.getElementById('wrong_category').checked,
         soloist: document.getElementById('soloist').checked,
         instruments: JSON.stringify(forDatabase)
         },
        function(data) {});
}

function update_box(new_box, box_id) {
    var rectangle = document.getElementById(box_id),
        real_left = new_box.left < 0 ? 0 : (new_box.left > width_global ? width_global : new_box.left),
        real_top = new_box.top < 0 ? 0 : (new_box.top > height_global ? height_global : new_box.top),
        real_width = real_left + new_box.width > width_global ? (width_global - real_left - 4) : (new_box.width - 4),
        real_height = real_top + new_box.height > height_global ? (height_global - real_top - 4) : (new_box.height - 4);

    rectangle.style.left = real_left + 'px';
    rectangle.style.top = real_top + 'px';
    rectangle.style.width = real_width + 'px';
    rectangle.style.height = real_height + 'px';
}

function inArray(rectangle, currentFrame, note_id)
{
    var length = annotations.length;
    for( var i=0; i<length; i++)
    {
        if (annotations[i].frame === currentFrame){
            if (annotations[i].left == rectangle.offsetLeft && annotations[i].top == rectangle.offsetTop &&
                annotations[i].width == rectangle.offsetWidth - 4 && annotations[i].height == rectangle.offsetHeight - 4)
            {return true;}
        }
    }
    return false;
}

function addToAnnotations(rectangle, currentFrame, note_id) {
    if (inArray(rectangle, currentFrame, note_id) != true) {
        annotations.push({
            left: rectangle.offsetLeft,
            top: rectangle.offsetTop,
            width: rectangle.offsetWidth - 4,
            height: rectangle.offsetHeight - 4,
            frame: currentFrame,
            text: note_id+'_rect'
        })
    }
}

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
    select.className = 'select';
    select.id = note.id + '_select';
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
    freeComment.className = 'free_comment';
    freeComment.id = note.id + '_comment';
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

    document.getElementById(note.id).addEventListener('click', function()
        {
            if (document.getElementById(note.id).className == 'instrument') {
                document.getElementById(note.id).className = 'active_instrument';
                document.getElementById(note.id+'_rect').className = 'active_rectangle';
            } else {
                document.getElementById(note.id).className = 'instrument';
                document.getElementById(note.id+'_rect').className = 'rectangle';
                var rectangle = document.getElementById(note.id+'_rect');
                addToAnnotations(rectangle, player.currentFrame, note.id);
            }
        }
    );

    document.getElementById(delButton.id).addEventListener('click', function ()
        {
            document.getElementById(note.id).remove();
            document.getElementById(note.id+'_rect').remove();
            remove(annotations, note.id+'_rect');
        }
    );

}
