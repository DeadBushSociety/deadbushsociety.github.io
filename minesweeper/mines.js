const num_col = 18;
const num_row = 32;
const num_mines = 119;
const num_cells = num_col * num_row;
let flags_left = num_mines;
let flags_in_html = flags_left;
let revealed_cells = 0;
let game_over = false;
let game_won = false;
let gamefield = document.querySelector("#gamefield");
let less_than_hundreds = false;
let less_than_tens = false;
let timer = false;
let start_time = 0;
let end_time = 0;
let reset = document.getElementById("reset");

//The amount of mines are checked at the start of the game and the counter is kept as a 3-digit number
if (flags_left < 100) {
  flags_in_html = "0" + flags_in_html;
}
if (flags_left < 10) {
  flags_in_html = "0" + flags_in_html;
}
document.getElementById("num_flags").innerHTML = flags_in_html;

//The game is reset upon the reset button being pressed
function reset_game() {
  location.reload();
}

//The hours, minutes, seconds and miliseconds that have passed within a given period of time are calculated
function timecalc(time) {
  let hour = Math.floor(time / 3600000);
  let minute = Math.floor(time / 60000) - hour * 60;
  let second = Math.floor(time / 1000) - minute * 60 - hour * 3600;
  let milisecond = time - hour * 3600000 - minute * 60000 - second * 1000;
  return [hour, minute, second, milisecond];
}

//The total time that's passed from the start until the end of the game is given
function total_time() {
  let total_time = end_time - start_time;
  let [hours, minutes, seconds, leftover_ms] = timecalc(total_time);
  console.log(
    hours + " Hr " + minutes + " Min " + seconds + " Sec " + leftover_ms + " Ms"
  );
}

//The time that's passed from the start is shown every 10 miliseconds while the game is ongoing
function stopWatch() {
  if (timer) {
    let current_time = new Date().getTime();
    let time_passed = current_time - start_time;
    let [hour, minute, second, milisecond] = timecalc(time_passed);
    milisecond = Math.floor(milisecond / 10);

    let hrString = hour;
    let minString = minute;
    let secString = second;
    let msString = milisecond;

    if (hour < 10) {
      hrString = "0" + hrString;
    }

    if (minute < 10) {
      minString = "0" + minString;
    }

    if (second < 10) {
      secString = "0" + secString;
    }

    if (milisecond < 10) {
      msString = "0" + msString;
    }

    document.getElementById("hr").innerHTML = hrString;
    document.getElementById("min").innerHTML = minString;
    document.getElementById("sec").innerHTML = secString;
    document.getElementById("ms").innerHTML = msString;
    setTimeout(stopWatch, 10);
  }
}

//A condition that a given coordinate is within the borders of the grid is returned
function in_bound(row, col) {
  return row >= 0 && col >= 0 && row < num_row && col < num_col;
}

//An empty pocket and the border of numbers around it are uncovered at the location on the grid where it's called
function empty_patches(cell_row, cell_col, grid) {
  //An array of empty cells with just the coordinate of the given cell in it is created
  let patch_of_zeroes = [[cell_row, cell_col]];
  let number_of_zeroes = 1;
  for (let zero_index = 0; zero_index < number_of_zeroes; zero_index++) {
    //The 8 adjacent cells around the empty cell are uncovered
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let row = patch_of_zeroes[zero_index][0] - 1 + i;
        let col = patch_of_zeroes[zero_index][1] - 1 + j;
        let cell_coordinate = [row, col];

        //Each adjacent cell is checked to be within the borders of the grid
        if (in_bound(row, col)) {
          //If the adjacent cell is empty, isn't a flag and isn't revealed,
          //its coordinate gets added to the array with empty cells, it's set as revealed and the loop is extended with one
          if (
            grid[row][col].count == 0 &&
            !grid[row][col].flag &&
            !grid[row][col].is_revealed
          ) {
            document
              .querySelector(`row#r${row} cell#c${col}`)
              .classList.add("revealed");
            patch_of_zeroes.push(cell_coordinate);
            number_of_zeroes++;
            grid[row][col].is_revealed = true;
            revealed_cells++;
          }
          //If the adjacent cell is a number, isn't revealed and isn't a flag,
          //it gets revealed and its value is set
          else if (
            !grid[row][col].count == 0 &&
            !grid[row][col].is_revealed &&
            !grid[row][col].flag
          ) {
            document
              .querySelector(`row#r${row} cell#c${col}`)
              .classList.add("revealed");
            document.querySelector(`row#r${row} cell#c${col}`).textContent =
              grid[row][col].count;
            grid[row][col].is_revealed = true;
            revealed_cells++;
          }
        }
      }
    }
  }
}

//Gets called when the game is lost
function game_over_case(grid) {
  for (i = 0; i < grid.length; i++) {
    for (j = 0; j < grid[i].length; j++) {
      //Every cell in the grid gets checked if it's a mine
      if (grid[i][j].is_mine) {
        //If the mine has a flag on it,
        //the flag symbol is replaced with an empty string, leaving out the flags placed over cells that aren't mines
        if (grid[i][j].flag) {
          document
            .querySelector(`row#r${i} cell#c${j}`)
            .textContent.replace("X", "");
        }
        //If the mine doesn't have a flag over it,
        //it gets shown on the grid
        if (!grid[i][j].flag) {
          document
            .querySelector(`row#r${i} cell#c${j}`)
            .classList.add("unflagged-mine");
        }
        //The mine symbol gets placed on every cell that's a mine
        document.querySelector(`row#r${i} cell#c${j}`).textContent = "•";
        grid[i][j].is_revealed = true;
      }
    }
  }
  game_over = true;
  timer = false;
}

//A flag is placed at a given location on the grid
function add_flag(cell_row, cell_col, grid) {
  //The first check is that the cell at the location hasn't been revealed yet and changes the cell's flag boolean
  if (!grid[cell_row][cell_col].is_revealed) {
    grid[cell_row][cell_col].flag = !grid[cell_row][cell_col].flag;
    //If the new state of the cell is that it's a flag,
    //the mine counter is updated and the flag symbol is added
    if (grid[cell_row][cell_col].flag) {
      flags_left--;
      document.querySelector(`row#r${cell_row} cell#c${cell_col}`).textContent =
        "X";
    }
    //Otherwise,
    //the mine counter is updated and the flag symbol is removed
    else {
      flags_left++;
      document.querySelector(`row#r${cell_row} cell#c${cell_col}`).textContent =
        "";
    }
    //After the update, the amount of digits of the mine counter's value get checked and updated accordingly
    flags_in_html = flags_left;
    if (flags_left < 0) {
      flags_in_html = flags_left * -1;
    }
    if (flags_left < 100 && flags_left >= 0) {
      flags_in_html = "0" + flags_in_html;
    }
    if (flags_left < 10 && flags_left > -10) {
      flags_in_html = "0" + flags_in_html;
    }
    document.getElementById("num_flags").innerHTML = flags_in_html;
    //If the amount is below 0,
    //the minus symbol gets counted as a digit and only 2 digits of the number are allowed
    if (flags_left < 0) {
      document.getElementById("num_flags").innerHTML =
        "-" + document.getElementById("num_flags").innerHTML;

      //The mine counter bottoms out at -99
      if (flags_left <= -99) {
        document.getElementById("num_flags").innerHTML = -99;
      }
    }
    document
      .querySelector(`row#r${cell_row} cell#c${cell_col}`)
      .classList.toggle("flag");
  }
}

//The grid is initialized and the mines and the values around the mines are placed
function grid_initialize(num_col, num_row, num_mines) {
  let grid = [];
  let mines_coords = [];

  //The number of mines are checked that they are less than the number of cells minus four (one for each corner)
  if (num_mines > num_col * num_row - 4) {
    console.log("Too many mines!");
    return;
  }

  //The grid gets created, with each cell having a reveled, mine and flag state, as well as the count, which is for how many mines are around it
  for (let row = 0; row < num_row; row++) {
    grid[row] = [];
    for (let collumn = 0; collumn < num_col; collumn++) {
      grid[row][collumn] = {
        is_revealed: false,
        is_mine: false,
        flag: false,
        count: 0,
      };
    }
  }

  //The available coordinates for mines are created, with the corners being excluded from them
  let available_coords = [];
  for (let rows = 0; rows < grid.length; rows++) {
    for (let cols = 0; cols < grid[rows].length; cols++) {
      if (
        (rows != 0 || cols != 0) &&
        (rows != 0 || cols != num_col - 1) &&
        (rows != num_row - 1 || cols != num_col - 1) &&
        (rows != num_row - 1 || cols != 0)
      ) {
        let coordinate = [rows, cols];
        available_coords.push(coordinate);
      }
    }
  }

  //The mines are randomly placed, with each coordinate where a mine is placed being removed from the available coordinates
  while (mines_coords.length < num_mines) {
    let picked_cell = Math.floor(Math.random() * available_coords.length);
    let mine_coordinates = available_coords[picked_cell];
    grid[mine_coordinates[0]][mine_coordinates[1]].is_mine = true;
    mines_coords.push(mine_coordinates);
    available_coords = available_coords
      .slice(0, picked_cell)
      .concat(available_coords.slice(picked_cell + 1));
  }

  //Each mine coordinate gets passed through here, with each adjacent cell within the borders of the grid getting its count property increased by one
  for (mine_index = 0; mine_index < mines_coords.length; mine_index++) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const row = mines_coords[mine_index][0] - 1 + i;
        const col = mines_coords[mine_index][1] - 1 + j;
        if (in_bound(row, col)) {
          grid[row][col].count++;
        }
      }
    }
  }

  return grid;
}

//Updates on the grid are rendered
function grid_render(grid, num_row, num_col) {
  //A DOM value is assigned to each row in the grid
  for (row_index = 0; row_index < num_row; row_index++) {
    let DOMrow = document.createElement("row");
    DOMrow.setAttribute("id", `r${row_index}`);
    DOMrow.setAttribute("index", row_index);

    //A DOM value is assigned for each collumn in every row, turning it into a cell with coordinates that correspond to the coordinates on the grid
    for (col_index = 0; col_index < num_col; col_index++) {
      let DOMcell = document.createElement("cell");
      DOMcell.setAttribute("id", `c${col_index}`);
      DOMcell.setAttribute("index", col_index);
      DOMrow.appendChild(DOMcell);

      //Each cell accepts a left click as input and reacts to it, depending on the conditions
      DOMcell.addEventListener("click", (e) => {
        //The coordinates of the cell that was clicked on get assigned to variables
        let cell_row = e.target.parentElement.getAttribute("index");
        let cell_col = e.target.getAttribute("index");

        //If the game has already ended or the click is on a flag,
        //the function is ended and nothing happens
        if (grid[cell_row][cell_col].flag || game_over || game_won) {
          return;
        }

        //If the click is on a cell, the timer isn't running and the game hasn't ended,
        //the stopwatch function is called
        if (!timer) {
          if (!game_over && !game_won) {
            timer = true;
            start_time = new Date().getTime();
            stopWatch();
          }
        }

        //The click is checked if it's on a revealed cell and that the cell's count is higher than 0
        if (
          grid[cell_row][cell_col].is_revealed &&
          !grid[cell_row][cell_col].count == 0
        ) {
          //The number of flags around the cell are counted
          let num_surrounding_flags = 0;
          for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
              if (in_bound(cell_row - 1 + row, cell_col - 1 + col)) {
                if (grid[cell_row - 1 + row][cell_col - 1 + col].flag) {
                  num_surrounding_flags++;
                }
              }
            }
          }

          //If the number of flags around the cell equal to or are higher than the cell's count property,
          //the rest of the adjacent cells that are within the grid are revealed
          if (grid[cell_row][cell_col].count <= num_surrounding_flags) {
            for (i = 0; i < 3; i++) {
              for (j = 0; j < 3; j++) {
                let surround_row = cell_row - 1 + i;
                let surround_col = cell_col - 1 + j;
                if (in_bound(surround_row, surround_col)) {
                  //If the given adjacent cell is a mine and doesn't have a flag over it,
                  //the game over function is called
                  if (
                    grid[surround_row][surround_col].is_mine &&
                    !grid[surround_row][surround_col].flag
                  ) {
                    game_over_case(grid);
                  }

                  //Otherwise, if the given adjacent cell is an empty one, doesn't have a flag over it and hasn't been revealed,
                  //the empty patches function is called
                  else if (
                    grid[surround_row][surround_col].count == 0 &&
                    !grid[surround_row][surround_col].flag &&
                    !grid[surround_row][surround_col].is_revealed
                  ) {
                    empty_patches(surround_row, surround_col, grid);
                  }

                  //Otherwise, if the given adjacent cell isn't an empty one, doesn't have a flag over it and hasn't been revealed,
                  //it gets revealed and it gets the count property assigned to it
                  else if (
                    !grid[surround_row][surround_col].count == 0 &&
                    !grid[surround_row][surround_col].flag &&
                    !grid[surround_row][surround_col].is_revealed
                  ) {
                    document
                      .querySelector(
                        `row#r${surround_row} cell#c${surround_col}`
                      )
                      .classList.add("revealed");
                    document.querySelector(
                      `row#r${surround_row} cell#c${surround_col}`
                    ).textContent = grid[surround_row][surround_col].count;
                    grid[surround_row][surround_col].is_revealed = true;
                    revealed_cells++;
                  }
                }
              }
            }
          }
        }

        //If the click is on a mine,
        //the game over function is called
        if (grid[cell_row][cell_col].is_mine) {
          game_over_case(grid);
        }

        //Otherwise, if the cell isn't empty and isn't revealed,
        //it gets revealed and the count property is assigned to it
        else if (
          !grid[cell_row][cell_col].count == 0 &&
          !grid[cell_row][cell_col].is_revealed
        ) {
          DOMcell.innerText = grid[cell_row][cell_col].count;
          DOMcell.classList.add("revealed");
          grid[cell_row][cell_col].is_revealed = true;
          revealed_cells++;
        }

        //Otherwise, if the cell is empty, hasn't been revealed and isn't a flag,
        //the empty patches function is called
        else if (
          grid[cell_row][cell_col].count == 0 &&
          !grid[cell_row][cell_col].is_revealed &&
          !grid[cell_row][cell_col].flag
        ) {
          empty_patches(cell_row, cell_col, grid);
        }

        //If all non-mine cells are revealed,
        //the game is won, the total time function is called and the mines, that haven't been flagged, automatically get a flag placed on them
        if (revealed_cells == num_cells - num_mines) {
          game_won = true;
          timer = false;
          end_time = new Date().getTime();
          total_time();
          for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
              if (grid[row][col].is_mine && !grid[row][col].flag) {
                add_flag(row, col, grid);
              }
            }
          }
        }
      });

      //Each cell accepts a right click as input and reacts to it
      DOMcell.addEventListener("contextmenu", (e) => {
        //The context menu is prevented from appearing
        e.preventDefault();

        //The cell coordinates are assigned to variables
        let cell_row = e.target.parentElement.getAttribute("index");
        let cell_col = e.target.getAttribute("index");

        //If the game is over,
        //the function is ended and nothing happens
        if (game_over || game_won) {
          return;
        }

        //If the click is on a cell, the timer hasn't started yet and the game isn't over,
        //the stopwatch function is called
        if (!timer) {
          if (!game_over && !game_won) {
            timer = true;
            start_time = new Date().getTime();
            stopWatch();
          }
        }

        //The add flag function is called
        add_flag(cell_row, cell_col, grid);
      });
    }
    gamefield.appendChild(DOMrow);
  }
}

//The game is started
grid_render(grid_initialize(num_col, num_row, num_mines), num_row, num_col);
