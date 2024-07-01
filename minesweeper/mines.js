const num_col = 18;
const num_row = 32;
let num_mines = 119;
const num_cells = num_col * num_row;
let revealed_cells = 0;
let flags_left = num_mines;
let flags_in_html = flags_left;
let game_over = false;
let game_won = false;
let gamefield = document.querySelector(".gamefield");
let timer = false;
let start_time = 0;
let end_time = 0;
let click_count = 0;
let difficulty = "";

function timecalc(time) {
  let hour = Math.floor(time / 3600000);
  let minute = Math.floor(time / 60000) - hour * 60;
  let second = Math.floor(time / 1000) - minute * 60 - hour * 3600;
  let milisecond = time - hour * 3600000 - minute * 60000 - second * 1000;
  return [hour, minute, second, milisecond];
}

function total_time() {
  let total_time = end_time - start_time;
  let [hours, minutes, seconds, leftover_ms] = timecalc(total_time);
  return (
    hours + " Hr " + minutes + " Min " + seconds + " Sec " + leftover_ms + " Ms"
  );
}

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
  let patch_of_zeroes = [[cell_row, cell_col]];
  let number_of_zeroes = 1;
  for (let zero_index = 0; zero_index < number_of_zeroes; zero_index++) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let row = patch_of_zeroes[zero_index][0] - 1 + i;
        let col = patch_of_zeroes[zero_index][1] - 1 + j;
        let cell_coordinate = [row, col];

        if (in_bound(row, col)) {
          if (
            grid[row][col].count == 0 &&
            !grid[row][col].flag &&
            !grid[row][col].is_revealed
          ) {
            document
              .querySelector(`row#r${row} cell#c${col}`)
              .classList.add("revealed");
            document.querySelector(
              `row#r${row} cell#c${col}`
            ).style.background =
              document.getElementById("revealed_colour").value;
            patch_of_zeroes.push(cell_coordinate);
            number_of_zeroes++;
            grid[row][col].is_revealed = true;
            revealed_cells++;
          } else if (
            !grid[row][col].count == 0 &&
            !grid[row][col].is_revealed &&
            !grid[row][col].flag
          ) {
            document
              .querySelector(`row#r${row} cell#c${col}`)
              .classList.add("revealed");
            document.querySelector(
              `row#r${row} cell#c${col}`
            ).style.background =
              document.getElementById("revealed_colour").value;
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

function game_over_case(grid) {
  for (i = 0; i < grid.length; i++) {
    for (j = 0; j < grid[i].length; j++) {
      if (grid[i][j].is_mine) {
        if (grid[i][j].flag) {
          document
            .querySelector(`row#r${i} cell#c${j}`)
            .textContent.replace("X", "");
        }
        if (!grid[i][j].flag) {
          document
            .querySelector(`row#r${i} cell#c${j}`)
            .classList.add("unflagged-mine");
          document.querySelector(`row#r${i} cell#c${j}`).style.background =
            document.getElementById("mine_colour").value;
        }
        document.querySelector(`row#r${i} cell#c${j}`).textContent = "•";
        grid[i][j].is_revealed = true;
      }
    }
  }
  game_over = true;
  timer = false;
}

function update_flag_counter() {
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
}

function add_flag(cell_row, cell_col, grid) {
  if (!grid[cell_row][cell_col].is_revealed) {
    grid[cell_row][cell_col].flag = !grid[cell_row][cell_col].flag;
    if (grid[cell_row][cell_col].flag) {
      flags_left--;
      document.querySelector(`row#r${cell_row} cell#c${cell_col}`).textContent =
        "X";
      document.querySelector(
        `row#r${cell_row} cell#c${cell_col}`
      ).style.background = document.getElementById("flag_colour").value;
    } else {
      flags_left++;
      document.querySelector(`row#r${cell_row} cell#c${cell_col}`).textContent =
        "";
      document.querySelector(
        `row#r${cell_row} cell#c${cell_col}`
      ).style.background = null;
    }
    //After the update, the amount of digits of the mine counter's value get checked and updated accordingly
    update_flag_counter();
    //If the amount is below 0, the minus symbol gets counted as a digit and only 2 digits of the number are allowed
    if (flags_left < 0) {
      document.getElementById("num_flags").innerHTML =
        "-" + document.getElementById("num_flags").innerHTML;

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

  for (let row = 0; row < num_row; row++) {
    grid[row] = [];
    for (let collumn = 0; collumn < num_col; collumn++) {
      grid[row][collumn] = {
        is_checked: false,
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

function bbbv(grid) {
  let required_clicks = 0;
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col].count == 0 && !grid[row][col].is_checked) {
        let patch_of_zeroes = [[row, col]];
        let number_of_zeroes = 1;
        for (let zero_index = 0; zero_index < number_of_zeroes; zero_index++) {
          for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
              let surround_row = patch_of_zeroes[zero_index][0] - 1 + i;
              let surround_col = patch_of_zeroes[zero_index][1] - 1 + j;
              let cell_coordinate = [surround_row, surround_col];
              if (in_bound(surround_row, surround_col)) {
                if (
                  grid[surround_row][surround_col].count == 0 &&
                  !grid[surround_row][surround_col].is_checked
                ) {
                  patch_of_zeroes.push(cell_coordinate);
                  number_of_zeroes++;
                  grid[surround_row][surround_col].is_checked = true;
                } else if (
                  !grid[surround_row][surround_col].count == 0 &&
                  !grid[surround_row][surround_col].is_checked
                ) {
                  grid[surround_row][surround_col].is_checked = true;
                }
              }
            }
          }
        }
        required_clicks++;
      } else if (
        !grid[row][col].count == 0 &&
        !grid[row][col].is_mine &&
        !grid[row][col].is_checked
      ) {
        let buglmao = false;
        let cell_coords = [row, col];
        for (let surround_row = 0; surround_row < 3; surround_row++) {
          for (let surround_col = 0; surround_col < 3; surround_col++) {
            let given_row = cell_coords[0] - 1 + surround_row;
            let given_col = cell_coords[1] - 1 + surround_col;
            if (in_bound(given_row, given_col)) {
              if (grid[given_row][given_col].count == 0) {
                buglmao = true;
              }
            }
          }
        }
        if (!buglmao) {
          required_clicks++;
        }
      }
    }
  }
  return required_clicks;
}
function grid_render(grid, num_row, num_col) {
  for (row_index = 0; row_index < num_row; row_index++) {
    let DOMrow = document.createElement("row");
    DOMrow.setAttribute("id", `r${row_index}`);
    DOMrow.setAttribute("index", row_index);

    for (col_index = 0; col_index < num_col; col_index++) {
      let DOMcell = document.createElement("cell");
      DOMcell.setAttribute("id", `c${col_index}`);
      DOMcell.setAttribute("index", col_index);
      DOMrow.appendChild(DOMcell);

      DOMcell.addEventListener("click", (e) => {
        let cell_row = e.target.parentElement.getAttribute("index");
        let cell_col = e.target.getAttribute("index");

        if (grid[cell_row][cell_col].flag || game_over || game_won) {
          return;
        }

        if (!timer) {
          if (!game_over && !game_won) {
            timer = true;
            start_time = new Date().getTime();
            stopWatch();
          }
        }

        if (
          grid[cell_row][cell_col].is_revealed &&
          !grid[cell_row][cell_col].count == 0
        ) {
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

          if (grid[cell_row][cell_col].count <= num_surrounding_flags) {
            for (i = 0; i < 3; i++) {
              for (j = 0; j < 3; j++) {
                let surround_row = cell_row - 1 + i;
                let surround_col = cell_col - 1 + j;
                if (in_bound(surround_row, surround_col)) {
                  if (
                    grid[surround_row][surround_col].is_mine &&
                    !grid[surround_row][surround_col].flag
                  ) {
                    game_over_case(grid);
                  } else if (
                    grid[surround_row][surround_col].count == 0 &&
                    !grid[surround_row][surround_col].flag &&
                    !grid[surround_row][surround_col].is_revealed
                  ) {
                    empty_patches(surround_row, surround_col, grid);
                  } else if (
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
                    document.querySelector(
                      `row#r${surround_row} cell#c${surround_col}`
                    ).style.background =
                      document.getElementById("revealed_colour").value;
                  }
                }
              }
            }
            click_count++;
          }
        }

        if (grid[cell_row][cell_col].is_mine) {
          click_count++;
          game_over_case(grid);
        } else if (
          !grid[cell_row][cell_col].count == 0 &&
          !grid[cell_row][cell_col].is_revealed
        ) {
          DOMcell.innerText = grid[cell_row][cell_col].count;
          DOMcell.classList.add("revealed");
          DOMcell.style.background =
            document.getElementById("revealed_colour").value;
          grid[cell_row][cell_col].is_revealed = true;
          revealed_cells++;
          click_count++;
        } else if (
          grid[cell_row][cell_col].count == 0 &&
          !grid[cell_row][cell_col].is_revealed &&
          !grid[cell_row][cell_col].flag
        ) {
          empty_patches(cell_row, cell_col, grid);
          click_count++;
        }

        //If all non-mine cells are revealed,
        //the game is won, the total time function is called and the mines, that haven't been flagged, automatically get a flag placed on them
        if (revealed_cells == num_cells - num_mines) {
          game_won = true;
          timer = false;
          let threebv = bbbv(grid);
          let click_efficiency = threebv / click_count;
          end_time = new Date().getTime();
          document.getElementById("stats").style.display = "block";
          document.getElementById(
            "difficulty-stat"
          ).textContent = `${difficulty}`;
          document.getElementById(
            "end-time-stat"
          ).textContent = `${total_time()}`;
          document.getElementById("click-efficiency-stat").textContent = `${(
            click_efficiency * 100
          ).toFixed(2)}%`;
          document.getElementsByClassName("close")[0].onclick = function () {
            document.getElementById("stats").style.display = "none";
          };
          for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
              if (grid[row][col].is_mine && !grid[row][col].flag) {
                add_flag(row, col, grid);
              }
            }
          }
        }
      });

      DOMcell.addEventListener("contextmenu", (e) => {
        e.preventDefault();

        let cell_row = e.target.parentElement.getAttribute("index");
        let cell_col = e.target.getAttribute("index");

        if (game_over || game_won) {
          return;
        }

        if (!timer) {
          if (!game_over && !game_won) {
            timer = true;
            start_time = new Date().getTime();
            stopWatch();
          }
        }
        add_flag(cell_row, cell_col, grid);
        click_count++;
      });
    }
    gamefield.appendChild(DOMrow);
    document.getElementById("reset").onclick = function () {
      location.reload();
    };
  }
}

function start_game() {
  flags_left = num_mines;
  update_flag_counter();
  document.getElementById("main-container").style.display = "flex";
  document.getElementById("difficulties-modal").style.display = "none";
  let grid = grid_initialize(num_col, num_row, num_mines);
  grid_render(grid, num_row, num_col);
}

document.getElementById("deer").onclick = function () {
  num_mines = 20;
  difficulty = "Deer";
  start_game();
};
document.getElementById("easy").onclick = function () {
  difficulty = "Easy";
  num_mines = 40;
  start_game();
};
document.getElementById("medium").onclick = function () {
  difficulty = "Medium";
  num_mines = 70;
  start_game();
};
document.getElementById("hard").onclick = function () {
  difficulty = "Hard";
  num_mines = 100;
  start_game();
};
document.getElementById("extreme").onclick = function () {
  difficulty = "Extreme";
  num_mines = 120;
  start_game();
};
