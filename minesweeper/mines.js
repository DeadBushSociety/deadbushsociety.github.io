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
let hour = 0;
let minute = 0;
let second = 0;
let milisecond = 0;
let start_time = 0;
let end_time = 0;
let reset = document.getElementById("reset");

if (flags_left < 100) {
  flags_in_html = "0" + flags_in_html;
}
if (flags_left < 10) {
  flags_in_html = "0" + flags_in_html;
}
document.getElementById("num_flags").innerHTML = flags_in_html;
function total_time() {
  let total_time = end_time - start_time;
  let seconds = Math.floor(total_time / 1000) - minutes * 60 - hour * 3600;
  let minutes = Math.floor(total_time / 60000) - hour * 60;
  let hours = Math.floor(total_time / 3600000);
  let leftover_ms =
    total_time - hours * 3600000 - minutes * 60000 - seconds * 1000;
  console.log(
    hours + " Hr " + minutes + " Min " + seconds + " Sec " + leftover_ms + " Ms"
  );
}

function stopWatch() {
  if (timer) {
    let current_time = new Date().getTime();
    let time_passed = current_time - start_time;
    second = Math.floor(time_passed / 1000) - minute * 60 - hour * 3600;
    minute = Math.floor(time_passed / 60000) - hour * 60;
    hour = Math.floor(time_passed / 3600000);
    milisecond = Math.floor(
      (time_passed - hour * 3600000 - minute * 60000 - second * 1000) / 10
    );

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
        }
        if (!grid[i][j].is_revealed) {
          document.querySelector(`row#r${i} cell#c${j}`).textContent = "•";
          grid[i][j].is_revealed = true;
        }
      }
      if (grid[i][j].flag) {
        document
          .querySelector(`row#r${i} cell#c${j}`)
          .classList.add("flagged-mine");
        document.querySelector(`row#r${i} cell#c${j}`).classList.toggle("flag");
      }
    }
  }
  game_over = true;
  timer = false;
}

function add_flag(cell_row, cell_col, grid) {
  if (!grid[cell_row][cell_col].is_revealed) {
    grid[cell_row][cell_col].flag = !grid[cell_row][cell_col].flag;
    if (grid[cell_row][cell_col].flag) {
      flags_left--;
      document.querySelector(`row#r${cell_row} cell#c${cell_col}`).textContent =
        "X";
    } else {
      flags_left++;
      document.querySelector(`row#r${cell_row} cell#c${cell_col}`).textContent =
        "";
    }
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

function in_bound(row, col) {
  return row >= 0 && col >= 0 && row < num_row && col < num_col;
}

function grid_initialize(num_col, num_row, num_mines) {
  let grid = [];
  let mines_coords = [];

  if (num_mines > num_col * num_row - 4) {
    console.log("Too many mines!");
    return;
  }

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

  do {
    let mine_row = Math.floor(Math.random() * num_row);
    let mine_col = Math.floor(Math.random() * num_col);
    let mine_placed = [mine_row, mine_col];
    if (grid[mine_row][mine_col].is_mine != true) {
      // tva nz shto raboti no raboti. opraajte se
      if (
        (mine_row != 0 || mine_col != 0) &&
        (mine_row != 0 || mine_col != num_col - 1) &&
        (mine_row != num_row - 1 || mine_col != num_col - 1) &&
        (mine_row != num_row - 1 || mine_col != 0)
      ) {
        grid[mine_row][mine_col].is_mine = true;
        mines_coords.push(mine_placed);
      }
    }
  } while (mines_coords.length < num_mines);

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
        if (!timer) {
          if (!game_over && !game_won) {
            timer = true;
            start_time = new Date().getTime();
            stopWatch();
          }
        }
        if (grid[cell_row][cell_col].flag || game_over || game_won) {
          return;
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
                  }
                }
              }
            }
          }
        }
        if (grid[cell_row][cell_col].is_mine) {
          game_over_case(grid);
        } else if (
          !grid[cell_row][cell_col].count == 0 &&
          !grid[cell_row][cell_col].is_revealed
        ) {
          DOMcell.innerText = grid[cell_row][cell_col].count;
          DOMcell.classList.add("revealed");
          grid[cell_row][cell_col].is_revealed = true;
          revealed_cells++;
        } else if (
          grid[cell_row][cell_col].count == 0 &&
          !grid[cell_row][cell_col].is_revealed &&
          !grid[cell_row][cell_col].flag
        ) {
          empty_patches(cell_row, cell_col, grid);
        }
        if (revealed_cells == num_cells - num_mines) {
          for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
              if (grid[row][col].is_mine && !grid[row][col].flag) {
                add_flag(row, col, grid);
              }
            }
          }
          game_won = true;
          timer = false;
          end_time = new Date().getTime();
          total_time();
        }
      });

      DOMcell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        let cell_row = e.target.parentElement.getAttribute("index");
        let cell_col = e.target.getAttribute("index");
        if (game_over || game_won) {
          return;
        }
        add_flag(cell_row, cell_col, grid);
        if (!timer) {
          if (!game_over && !game_won) {
            timer = true;
            start_time = new Date().getTime();
            stopWatch();
          }
        }
      });
    }
    gamefield.appendChild(DOMrow);
  }
}

grid_render(grid_initialize(num_col, num_row, num_mines), num_row, num_col);

function reset_game() {
  location.reload();
}
