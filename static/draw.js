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

    document.getElementById(note.id).addEventListener('click', function()
        {
            if (document.getElementById(note.id).className == 'instrument') {
                document.getElementById(note.id).className = 'active_instrument';
                document.getElementById(note.id+'_rect').className = 'active_rectangle';
            } else {
                document.getElementById(note.id).className = 'instrument';
                document.getElementById(note.id+'_rect').className = 'rectangle';
                var rectangle = document.getElementById(note.id+'_rect');
                annotations.push({
                    left: rectangle.offsetLeft,
                    top: rectangle.offsetTop,
                    width: rectangle.offsetWidth,
                    height: rectangle.offsetHeight,
                    time: document.getElementById("video").currentTime,
                    text: note.id+'_rect'
                })
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
