$("#delegateSelector").change(function(){
    $("#current-speaker").text($(this).children("option:selected").val())
    $(this).val("default");
})



$("#duration").change(function(){
    var time = $(this).val().split(":");
    if(time.length>1){
        TOTAL_TIME_LIMIT = parseInt(time[0]*60) + parseInt(time[1]);
    }else if(time.length == 1){
        TOTAL_TIME_LIMIT = parseInt(time[0]);
    }else{
        TOTAL_TIME_LIMIT=0;
    }
    timerInterval = null;
    $("#total-time").html("0:00/"+formatTime(TOTAL_TIME_LIMIT));
})

function formatTotalTime(){
    $("#progress-bar").css("width", 100-(totalTimePassed/TOTAL_TIME_LIMIT)*100+"%");
    if(TOTAL_TIME_LIMIT-totalTimePassed<=10){
        $("#progress-bar").css("background", "orange");
    }
    if(TOTAL_TIME_LIMIT-totalTimePassed<=5){
        $("#progress-bar").css("background", "red");
    }
    if(TOTAL_TIME_LIMIT-totalTimePassed<=0){
        $(".progress").css("background", "red");
    }
}


