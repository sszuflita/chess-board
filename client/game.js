Meteor.Router.add({
    '/': 'start',
    '/board/:id': function(id) {
        console.log("board id is", id);
        Session.set('boardId', id);
        return 'board';
    },
    '*': 'not_found'
});

Template.board.game = function() {
    return getCurrentGame();
};

Template.board.events = {
    'keypress input#message': function(e) {
        if (e.charCode == '13') {
            var msg = $('input#message');
            if (msg.val()) {
                addMessage(msg.val());
                msg.val("");
            }
        }
    },
    'dragstart [draggable=true]': function(e) {
        e.dataTransfer.setData("SourceID", e.target.parentNode.id);
        e.dataTransfer.setData("Piece", e.target.innerText);
    },
    'dragover .dropzone': function(e) {
        e.preventDefault();
    },
    'drop .dropzone': function(e) {
        var targetId = e.target.id ? e.target.id : e.target.parentNode.id;
        var sourceId = e.dataTransfer.getData("SourceID");
        var piece = e.dataTransfer.getData("Piece");
        if (sourceId === 'offboard_pieces') {
            putPiece(piece, targetId);
        } else {
            movePiece(sourceId, targetId);
        }
    },
    'click .piece': function(e) {
        var targetId = e.target.id ? e.target.id : e.target.parentNode.id;
        if (e.ctrlKey)
            removePiece(targetId);
    },
    'click .dropzone': function(e) {
        if (e.ctrlKey) {
            $('.dropdown').dropdown();
        }
    }
};

Template.board.rendered = function() {
    $('#messages').scrollTop($('#messages').height());
    $('#message').focus();
};

Template.navigation.events = {
    'click button#reset': function() {
        Games.update({_id: getBoardId()}, {$set: createBoard()});
    },
    'click button#new-board': function(e) {
        var boardId = Games.insert(createBoard());
        Meteor.Router.to("/board/" + boardId);
    }
};

Template.navigation.boardId = function() {
    return getBoardId();
};

getCurrentGame = function() {
    return Games.findOne({_id: getBoardId()});
};

getBoardId = function() {
    return Session.get('boardId');
};

addMessage = function(msg) {
    Games.update({_id: getBoardId()}, {$push: {messages: {text: msg, isMove: false}}});
};

movePiece = function(from, to) {
    var game = getCurrentGame();
    game.pieces[to] = game.pieces[from];
    game.pieces[from] = EMPTY;
    Games.update({_id: getBoardId()}, {$set: {pieces: game.pieces},
        $push: {messages: {text: from + "-" + to, isMove: true}}});
};

putPiece = function(piece, pos) {
    var game = getCurrentGame();
    game.pieces[pos] = piece;
    Games.update({_id: getBoardId()}, {$set: {pieces: game.pieces},
        $push: {messages: {text: "Put " + piece + " on " + pos, isMove: true}}});
};

removePiece = function(pos) {
    var game = getCurrentGame();
    game.pieces[pos] = EMPTY;
    Games.update({_id: getBoardId()}, {$set: {pieces: game.pieces},
        $push: {messages: {text: "Removed the piece on " + pos, isMove: true}}});
};