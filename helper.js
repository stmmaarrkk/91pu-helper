const INITIAL_DELAY = 1500; //delay(ms) for loading page
const REDUNDANT_KEY_LIST = {
  "C": 0,
  "C#": 0.5,
  "Db": 0.5,
  "D": 1,
  "D#": 1.5,
  "Eb": 1.5,
  "E": 2,
  "F": 2.5,
  "F#": 3,
  "Gb": 3,
  "G": 3.5, 
  "G#": 4,
  "Ab": 4,
  "A": 4.5,
  "A#": 5,
  "Bb": 5,
  "B": 5.5,
  "COMPENSATION": 6
}
const KEY_LIST = {
  "C": 0,
  "Db": 0.5,
  "D": 1,
  "Eb": 1.5,
  "E": 2,
  "F": 2.5,
  "F#": 3,
  "G": 3.5, 
  "Ab": 4,
  "A": 4.5,
  "Bb": 5,
  "B": 5.5
}

const INVERT_KEY_LIST = {
  0: "C",
  0.5: "Db",
  1: "D",
  1.5: "Eb",
  2: "E",
  2.5: "F",
  3: "F#",
  3.5: "G",
  4: "Ab",
  4.5: "A",
  5: "Bb",
  5.5: "B",
};

const DISPLAY_CAPO_BOUND = 7; //not display play out side of this bound

document.addEventListener(
  "DOMContentLoaded",
  () => {
    console.log("Program started!");
    closeAdvertise();
    console.log("ad closed");

    setTimeout(() => {
      selectKey = getKey();
      selectPlay = getPlay();
      // substitue the capo/play button
      renderOptionsBar(selectKey, selectPlay);
    }, INITIAL_DELAY);
  },
  false
);

// //substitue the capo/play button
// document.getElementsByClassName()

// //get change req from pop-up
// chrome.runtime.onMessage.addListener(changeChord);
// const changeChord = (message, sender, sendResponse) => {
//   console.log("got message from pop-up");
  
// }

const getKey = () => {
  const currentKey = document
    .getElementsByClassName("keys")[0]
    .getElementsByClassName("select")[0].innerText;
  console.log("current key is " + currentKey);
  return currentKey 
}

const getPlay = () => {
  const currentPlay = document
    .getElementsByClassName("capo")[0]
    .getElementsByClassName("select")[0]
    .getAttribute("key");
  console.log("current play key is " + currentPlay );
  return currentPlay 
}
const renderOptionsBar = (selectKey, selectPlay) => {
  renderPlayOptionsBar(selectKey, selectPlay);
  renderKeyOptionsBar(selectKey, selectPlay);
}

const renderPlayOptionsBar = (selectKey, selectPlay) => {
  const playOptionsBar = document.getElementsByClassName("plays")[0];
  playOptionsBar.innerHTML = ""; //clear section
  let dropDownOptions = document.createElement("select");
  dropDownOptions.setAttribute("class", "capo");
  dropDownOptions.addEventListener("change", onSelectPlay); //add click event

  for(let play in KEY_LIST){
    let capo = (KEY_LIST[selectKey] - KEY_LIST[play]) * 2;
    if (capo < 0) {
      capo += 12;
    }

    let option = document.createElement("option");
    option.setAttribute("value", play);
    option.innerText = `Capo: ${capo} (${play})`;
    option.setAttribute("key", play);

    if (play == selectPlay) {
      option.setAttribute("selected", "select");
      option.setAttribute("class", "select");
  }
    dropDownOptions.appendChild(option);
  }

  playOptionsBar.appendChild(dropDownOptions);
}

// const renderPlayOptionsBar = (selectKey, selectPlay) => {
//   const playOptionsBar = document.getElementsByClassName("capo")[0];
//   playOptionsBar.innerHTML = ""; //clear section

//   //compute the numOfCapo and append it
//   for (play in KEY_LIST) {
//     let capo = (KEY_LIST[selectKey] - KEY_LIST[play]) * 2;
//     if (capo < 0) {
//       capo += 12;
//     }

//     //if out of bound and not the currentKey, don't display
//     if (capo > DISPLAY_CAPO_BOUND && play != selectPlay) continue;

//     //create and append node
//     let node = document.createElement("span");
//     let text = document.createTextNode(`${play}(${capo})`);
//     node.appendChild(text);
//     node.setAttribute("play", capo);
//     node.setAttribute("key", play);
//     node.addEventListener("click", onSelectPlay);

//     if (play == selectPlay) node.setAttribute("class", "select");
//     playOptionsBar.appendChild(node);
//   }
// }

const renderKeyOptionsBar = (selectKey, selectPlay) => {
  const keyOptionsBar = document.getElementsByClassName("ks")[0];
  keyOptionsBar.innerHTML = ""; //clear section

  for (key in KEY_LIST) {
    //create and append node
    let node = document.createElement("span");
    let text = document.createTextNode(key);
    node.appendChild(text);
    node.setAttribute("key", key);
    node.addEventListener("click", onSelectKey);
    if (key == selectKey) node.setAttribute("class", "select");
    keyOptionsBar.appendChild(node);
  }
}

const onSelectKey = (event) => {
  const currentKey = getKey();
  const selectKey = event.target.getAttribute("key");

  if(selectKey == currentKey) return;

  renderOptionsBar(selectKey, getPlay());
}
const onSelectPlay = (event) => {
  const currentPlay = getPlay();
  const selectPlay = event.target.value;

  if(selectPlay == currentPlay) return; 

  //play key changed, rerender
  renderChords(selectPlay, currentPlay);
  renderOptionsBar(getKey(), selectPlay);

}

const renderChords = (selectPlay, currentPlay) => {
  //compute shift
  const offset = REDUNDANT_KEY_LIST [selectPlay] - REDUNDANT_KEY_LIST [currentPlay];
  var chordBlocks = document.getElementsByClassName("tf");

  //change chord by chord
  for(let i = 0; i < chordBlocks.length; i++) {
    const chord = chordBlocks[i].innerText;
    let shiftedChord = "";
    
    //iterate the chord(string)
    let j = 0;
    while(j < chord.length) {
      if (isUpperCase(chord[j])) {
        //it's a basic chord
        if (j + 1 < chord.length && (chord[j + 1] == "#" || chord[j + 1] == "b")) {
          shiftedChord += shiftBasicChord(chord.substring(j, j + 2), offset);
          ++j; //add 1 more to j to skip the next letter
        } else {
          shiftedChord += shiftBasicChord(chord[j], offset);
        }
      } else { //a lowercase letter or number
        shiftedChord += chord[j];
      }
      ++j
    }

    //console.log(`From ${chord} to ${shiftedChord}`);

    chordBlocks[i].replaceWith(substitueChord(shiftedChord));
  }
  
}

const substitueChord = (shiftedChord) => {
  let node = document.createElement("span");
  node.setAttribute("class", "tf");
  var stringPiece = "";
  for (let i = 0; i < shiftedChord.length; i++) {
    //has b or #
    if (shiftedChord[i] == "b" || shiftedChord[i] == "#") {
      if (stringPiece.length > 0){
        node.appendChild(document.createTextNode(stringPiece)); //add piece
      }
      
      //add # or b
      node.appendChild(
        document
          .createElement("sup")
          .appendChild(document.createTextNode(shiftedChord[i]))
      );
      stringPiece = "";
    } else {
      stringPiece = stringPiece + shiftedChord[i];
    }
  }
  if (stringPiece.length > 0)
    node.appendChild(document.createTextNode(stringPiece));//add piece

  return node;
}

const shiftBasicChord = (chord, offset) => {
  if (!(chord in REDUNDANT_KEY_LIST))
   console.error("chord is not in KEY_LIST "+ chord);
  let shiftedChordNum = REDUNDANT_KEY_LIST[chord] + offset;
  if (shiftedChordNum > REDUNDANT_KEY_LIST["B"]) shiftedChordNum -= REDUNDANT_KEY_LIST["COMPENSATION"];
  else if (shiftedChordNum < 0) shiftedChordNum += REDUNDANT_KEY_LIST["COMPENSATION"];

  if (!(shiftedChordNum in INVERT_KEY_LIST))
   console.error("shiftedChordNum is not in LIST"+ shiftedChordNum);
  //console.log(`${chord.main} ${chord.sup} => ${shiftedChord.main}${shiftedChord.sup}`);
  return INVERT_KEY_LIST[shiftedChordNum];//invert mapping to letter
}
// const parseChord = (block) => {
//   let chord = { main: "", sup: "" };
//   if (block.innerText[1] == "#" || block.innerText[1] == "b" ){ //with sharp or flat
//     chord.main = block.innerText.substring(0,2);
//     chord.sup = block.innerText.substring(2);
//   }
//   else{
//     chord.main = block.innerText[0];
//     chord.sup = block.innerText.substring(1);
//   }
//   return chord;
// }

const closeAdvertise = () => {
  var adventiseWindow = document.getElementById("viptoneWindow");
  adventiseWindow.style.visibility = "hidden";
  // var blackBackground = document.getElementById("black-background");
  // blackBackground.style.display = "none";
};

const isUpperCase = (string) => /^[A-Z]*$/.test(string)