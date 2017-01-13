$(document).ready(function(){
  var human;
  var computer;
  var board = new Board()
  var game;

  function Human(symbol){
    this.name = "Player",
    this.symbol = symbol;
  }
  function Computer(symbol){
    this.name = "Computer",
    this.symbol = symbol;
  }
  //Modal opens when page is rendered. User can choose symbol
  $('#myModal').modal({
      backdrop: 'static',   // This disable for click outside event
      keyboard: true        // This for keyboard event
  })

  $("#xPlayer").on('click',function(){
    human = new Human("X");
    computer = new Computer("O");
    board.initalize();
    board.turn = human;
    game = new Game(human)
    game.play();
  })
  $("#oPlayer").on('click',function(){
    human = new Human("O")
    computer = new Computer("X");
    board.initalize();
    board.turn = computer;
    game = new Game(computer)
    game.play();
  })

  //Board constuctor
  function Board(state,player){
  this.board = state || [];
  this.status = "";
  this.turn = player || "";
  }

  //method calls for an empty board filled with "E"
  Board.prototype.initalize = function(){
    $("td p").empty()
    this.board = ["E","E","E","E","E","E","E","E","E"]
    this.status = "New Game";
  }
  //return true if there is a win. Otherwise, false
  Board.prototype.win = function(){
    var B = this.board;
    //check row
    for (var i = 0; i <= 6; i = i + 3){
      if (B[i] !== "E" && (B[i] === B[i+1]) && (B[i+1] === B[i+2])){
        this.status = "Winner is: " + this.turn.name;
        return true;
      }
    }
    //check column
    for (var i = 0; i <= 2 ; i++ ){
      if (B[i] !== "E" && (B[i] === B[i+3]) && (B[i+3] === B[i+6])){
        this.status = "Winner is: " + this.turn.name;
        return true;
      }
    }
    //check diagonal
    for(var i = 0, j = 4; i <= 2 ; i = i + 2, j = j - 2) {
      if(B[i] !== "E" && (B[i] == B[i + j])  && (B[i + j] === B[i + 2 * j]) ) {
        this.status = "Winner is: " + this.turn.name;
        return true;
      }
    }
    return false
  }

  //checks if the current status is draw. If so, updates the status to "Draw"
  Board.prototype.draw = function(){
    //checks if the board itself is draw
    for(var i = 0; i < this.board.length ; i++){
      if (this.board[i] === "E"){
        return false;
      }
    }
    this.status = "Draw!"
    return true;
  }
  //method returns array of indexes that are not empty cells in the board
  Board.prototype.available = function(){
    var B = this.board;
    var indexes = [];
    for (var i = 0; i < B.length ; i ++){
      if (B[i] === "E"){
        indexes.push(i)
      }
    }
    return indexes;
  }
  //checks first if the User Input is valid or not
  Board.prototype.validMove = function(position){
  var availableCells =  this.available();
  return availableCells.includes(position);
  }
  //updates the board when using jQuery click
  Board.prototype.updateBoard = function(position,playerInput) {
    var availableCells =  this.available();
    if (availableCells.includes(position)){
      this.board[position] = playerInput
    }
  };
  //checks if state is declared winner or draw
  Board.prototype.isTerminal = function(){
    return (this.win() || this.draw());
  }
  //switch the player during state simulation
  Board.prototype.switchPlayer = function(){
    this.turn = (this.turn === human) ? computer : human
  }

  //lists all future possible states in the current state it was called
  Board.prototype.sucessors = function(state){
    var allStatesList = [];
    var allPossibleMoves = state.available();
    var currentBoard = state.board;

    for(var i = 0; i < allPossibleMoves.length; i++){
      var newBoard = currentBoard.slice();
      newBoard[allPossibleMoves[i]] = state.turn.symbol;
      allStatesList.push(new Board(newBoard, state.turn))
    }
    return allStatesList;
  }

  //Game constuctor
  function Game(firstPlayer){
    this.currentPlayer = firstPlayer;
    this.over = false;
    this.win = "";
  }

  Game.prototype.switchPlayer = function(){
    this.currentPlayer = (this.currentPlayer === human) ? computer : human;
    board.switchPlayer();
  }

  Game.prototype.restart = function(){
    board.initalize();
  }

  Game.prototype.gameover = function(){
    if (board.win() || board.draw()){
      if (board.status === "Draw!"){
        $("#game-title").text("The game is...");
        $("#game-status").text("Draw!")
      } else{
        console.log(board.board)
        $("#game-title").text("The winner is...")
        $("#game-status").text(board.turn.name)
      }
      // alert(board.status)
      $('#gameAlert').modal({
        keyboard: true        // This for keyboard event
      })
      game.restart();
    }
  }
  //This is where the game starts!
  Game.prototype.play = function(){
    board.status = "Game playing";
    //if player chose "O", computer goes first as "X"
    if(game.currentPlayer === computer){
      computer.makeMove();
      game.switchPlayer();
    };
    //Event listener for the user to choose where to play
    $("td").click(function(){
      var position = $(this).attr("id");
      var positionNumber = parseInt(position.slice(4,5));
      if(board.validMove(positionNumber)){
      //Checks if the move is valid. If it is, append it.
      //Otherwise, alert the user that it is taken
        $(this).find("p").append(game.currentPlayer.symbol)
        board.updateBoard(positionNumber, game.currentPlayer.symbol)
        //Check if it the game is over or draw
        //If either is true, play new game
        game.gameover();
        game.switchPlayer();
        if (game.currentPlayer.name === "Computer" ){
          computer.makeMove();
          game.gameover();
          game.switchPlayer();
        }
      }else{
        $('#alert').modal({
          keyboard: true        // This for keyboard event
        })
      }
    })
  }
  //This is the brain of the computer : MinMax Algorithm!
  Computer.prototype.makeMove = function() {
    function evaluate(state) {
      //remember that relative to the Computer,
      //the computer wants to get as much points as it can
      if(state.status === "Winner is: Player"){
        return -10
      } else if (state.status === "Winner is: Computer") {
        return 10
      } else{
        return 0
      }
    }
    function max(currentState) {
      if (currentState.isTerminal()){
        return evaluate(currentState)
      }
      currentState.switchPlayer();
      var successors = board.sucessors(currentState) // create all possible states within this current state
      var best = Number.NEGATIVE_INFINITY;
      for(var i = 0; i < successors.length; i++) {
        var moveScore = min(successors[i]);
        best = Math.max(best, moveScore);
      }
      return best;
    }
    function min(currentState) {
      if (currentState.isTerminal()){
        return evaluate(currentState)
      }
      currentState.switchPlayer();
      var successors = board.sucessors(currentState) // create all possible states within this current state
      var best = Number.POSITIVE_INFINITY;
      for(var i = 0; i < successors.length; i++) {
        var moveScore = max(successors[i]);
        best = Math.min(best, moveScore);
      }
      return best;
    }
    function selectMove(state) {
      var successors = board.sucessors(state) //collects all possible states under that current state
      var best = Number.NEGATIVE_INFINITY;
      var bestMove = null;
      for(var i = 0; i < successors.length; i++) {
        //lets evaluate each possible state that the computer can make move on
        var moveScore = min(successors[i]);
        if (moveScore > best) {
          bestMove = successors[i];
          best = moveScore;
        }
      }
      //successors.indexOf(bestMove) is an index, coressponding to the available moves
      //from Board.prototype.available()
      var indexBest = successors.indexOf(bestMove);
      return state.available()[indexBest];
    }
    //Select the best move based on the state that the computer must make move on
    var computerPosition = selectMove(board);
    $("#cell" + computerPosition + " p").append(game.currentPlayer.symbol);
    board.updateBoard(computerPosition,game.currentPlayer.symbol)
  }
})
