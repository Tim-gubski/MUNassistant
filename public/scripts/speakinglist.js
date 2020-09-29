// ADD DELEGATE USING SELECTOR
$("#delegateSelector").change(function(){
    // $(this).children("option:selected").val()
    $("tbody").append('<tr id="'+  $(this).children("option:selected").attr("id") +'"><td class="col-12" id="name" class="name"><span class="nameText">'+ $(this).children("option:selected").text() +'</span></td></tr>')
    $(this).val("default");
    updateCurrentSpeaker();
})



//START TIMER
$("#startBtn").click(function(){
  if(TIME_LIMIT>0 && ($("tbody tr").first().text() != "" || $("#current-speaker").text() != "Select Speaker" || window.location.pathname.split("/")[2]=="unmod")){
    startTimer();
  }
})  


// PAUSE TIMER
$("#pauseBtn").click(function(){
  onTimesUp();
})

// SAVE AND DELETE
$("#stopBtn").click(function(){
  onTimesUp();
  $("tbody tr").first().remove();
  updateCurrentSpeaker();
  timePassed = 0;
  timeLeft = TIME_LIMIT;
  timerInterval = null;
  document.getElementById("base-timer-label").innerHTML = formatTime(
    timeLeft
  );
  setCircleDasharray();
  setRemainingPathColor(timeLeft);
  $("#current-speaker").text("Select Speaker")
})


$("#clear").click(function(){
  $("tbody").empty();
})

// CHANGE SPEAKING TIME
$("#time").change(function(){
  var time = $(this).val().split(":");
  if(time.length>1){
    TIME_LIMIT = parseInt(time[0]*60) + parseInt(time[1]);
  }else if(time.length == 1){
    TIME_LIMIT = parseInt(time[0]);
  }else{
    TIME_LIMIT=0;
  }
  timePassed = 0;
  timeLeft = TIME_LIMIT;
  timerInterval = null;
  document.getElementById("base-timer-label").innerHTML = formatTime(
    timeLeft
  );
  setCircleDasharray();
  setRemainingPathColor(timeLeft);
})


// SAVE BUTTON
$("#save").click(function(){
    var rawDels = $("tr").slice(1)
    var delegations = []
    $.each(rawDels,function(){
        delegations.push({
            "id": $(this).attr("id"),
            "name": $(this).children("#name").text()
        })
    })
    var id = window.location.pathname.split("/")[1]
    $.redirect("/"+id+"/speakinglist",
    {
            delegations:delegations
    },
    "POST")
})

// UPDATE FUNCTION
function updateCurrentSpeaker(){
  if($("tbody tr").first().text()!="" || $("#current-speaker").text() != "Select Speaker"){
    $("#currentSpeaker").text($("tbody tr").first().text());
  }else {
    $("#currentSpeaker").text("Add Speakers to List");
    $("#current-speaker").text("Select Speaker")
  }
  
}

// TIMER CODE

const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;

const COLOR_CODES = {
  info: {
    color: "green"
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD
  }
};

var TIME_LIMIT = 0;
var TOTAL_TIME_LIMIT = 0;
let timePassed = 0;
let totalTimePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;
let remainingPathColor = COLOR_CODES.info.color;

document.getElementById("app").innerHTML = `
<div class="base-timer">
  <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="base-timer__circle">
      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
      <path
        id="base-timer-path-remaining"
        stroke-dasharray="283"
        class="base-timer__path-remaining ${remainingPathColor}"
        d="
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
      ></path>
    </g>
  </svg>
  <span id="base-timer-label" class="base-timer__label">${formatTime(
    timeLeft
  )}</span>
</div>
`;

// startTimer();

function onTimesUp() {
  clearInterval(timerInterval);
}

function startTimer() {
  timerInterval = setInterval(() => {
    timePassed += 1;
    totalTimePassed += 1;
    timeLeft = TIME_LIMIT - timePassed;
    document.getElementById("base-timer-label").innerHTML = formatTime(
      timeLeft
    );
    
    setCircleDasharray();
    setRemainingPathColor(timeLeft);

    //TOTAL BAR STUFF
    $("#total-time").html(formatTime(totalTimePassed) + "/"+formatTime(TOTAL_TIME_LIMIT))
    formatTotalTime();
    // if (timeLeft === 0) {
    //   onTimesUp();
    // }
  }, 1000);
}

function formatTime(time) {
  if(time>=0){
    var minutes = Math.floor(time / 60);
    let seconds = time % 60;

    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    return `${minutes}:${seconds}`;
  } else{
    var minutes = Math.ceil(time / 60);
    let seconds = time % 60;
    minutes = `-${minutes}`;
    if (seconds > -10) {
      seconds = `0${seconds*-1}`;
    }else{
      seconds = `${seconds*-1}`;
    }
    return `${minutes}:${seconds}`;
  }
}

function setRemainingPathColor(timeLeft) {
  const { alert, warning, info } = COLOR_CODES;
  if (timeLeft <= alert.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(warning.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(alert.color);
  } else if (timeLeft <= warning.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(alert.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(info.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(warning.color);
  } else {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(alert.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(warning.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(info.color);
  }
}

function calculateTimeFraction() {
  const rawTimeFraction = timeLeft / TIME_LIMIT;
  return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
  const circleDasharray = `${(
    calculateTimeFraction() * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  document
    .getElementById("base-timer-path-remaining")
    .setAttribute("stroke-dasharray", circleDasharray);
}