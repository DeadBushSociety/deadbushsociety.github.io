for (i = 0; i < document.getElementsByClassName("gamefield").length; i++) {
  document.getElementsByClassName("gamefield")[i].style.background =
    document.getElementById("unrevealed_colour").value;
}

document
  .getElementById("revealed_colour")
  .addEventListener(
    "load",
    revealed(document.getElementById("revealed_colour")),
    false
  );

function revealed(colors) {
  colors.addEventListener("input", updateAllRevealed, false);
  colors.select();
}
function updateAllRevealed() {
  for (i = 0; i < document.getElementsByClassName("revealed").length; i++) {
    document.getElementsByClassName("revealed")[i].style.background =
      document.getElementById("revealed_colour").value;
  }
}

document
  .getElementById("unrevealed_colour")
  .addEventListener(
    "load",
    unreavealed(document.getElementById("unrevealed_colour")),
    false
  );

function unreavealed(colors) {
  colors.addEventListener("input", updateAllUnrevealed, false);
  colors.select();
}
function updateAllUnrevealed() {
  for (i = 0; i < document.getElementsByClassName("gamefield").length; i++) {
    document.getElementsByClassName("gamefield")[i].style.background =
      document.getElementById("unrevealed_colour").value;
  }
}

document
  .getElementById("flag_colour")
  .addEventListener(
    "load",
    flags(document.getElementById("flag_colour")),
    false
  );

function flags(colors) {
  colors.addEventListener("input", updateAllFlags, false);
  colors.select();
}
function updateAllFlags() {
  for (i = 0; i < document.getElementsByClassName("flag").length; i++) {
    document.getElementsByClassName("flag")[i].style.background =
      document.getElementById("flag_colour").value;
  }
}

document
  .getElementById("mine_colour")
  .addEventListener(
    "load",
    mines(document.getElementById("mine_colour")),
    false
  );

function mines(colors) {
  colors.addEventListener("input", updateAllMines, false);
  colors.select();
}
function updateAllMines() {
  for (
    i = 0;
    i < document.getElementsByClassName("unflagged-mine").length;
    i++
  ) {
    document.getElementsByClassName("unflagged-mine")[i].style.background =
      document.getElementById("mine_colour").value;
  }
}

function defaultColours() {
  document.getElementById("unrevealed_colour").value = "#2f2f2f";
  updateAllUnrevealed();
  document.getElementById("revealed_colour").value = "#fff3c0";
  updateAllRevealed();
  document.getElementById("flag_colour").value = "#7c1d00";
  updateAllFlags();
  document.getElementById("mine_colour").value = "#e63a21";
  updateAllMines();
}
