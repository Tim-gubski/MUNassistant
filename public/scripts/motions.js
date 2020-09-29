var row = "<tr>" + $("tbody tr:first").html() + "</tr>"

// $("tbody").html(localStorage.getItem("motions"))

$("#addButton").click(function(){
    $("tbody").append(row)
})

$("#clear").click(function(){
    $("tbody").empty();
  })

$("table").on("click",".deleteBtn",function(){
    console.log($(this).parent().parent().remove())
})

$("#save").click(function(){
    var rawDels = $("tr").slice(1)
    var motions = []
    $.each(rawDels,function(){
        if($(this).find("#delegateSelector option:selected").html() != "--Delegation--"){
            motions.push({
                "delegation": $(this).find("#delegateSelector option:selected").attr('id'),
                "type": $(this).find("#type").val(),
                "duration": $(this).find("#duration").val(),
                "speakingTime": $(this).find("#speakingTime").val(),
                "topic": $(this).find("#topic").val()
            })
        }
    })
    var id = window.location.pathname.split("/")[1]
    console.log(motions)
    $.redirect("/"+id+"/motions",
    {
            motions:motions
    },
    "POST")
})