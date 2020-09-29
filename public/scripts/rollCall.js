//initial table sort
sortTable()
$("input[type='text']").css('display', 'none');

$("table").on("mouseenter",".presentSelector",function(){
    $(this).addClass("hovered")
})
$("table").on("mouseleave",".presentSelector",function(){
    $(this).removeClass("hovered")
})

$("table").on("click",".presentSelector",function(){
    if($(this).hasClass("selected") && !$(this).parent().children(".presentVotingSelector").hasClass("selected")){
        $(this).removeClass("selected")
        $(this).parent().children(".presentVotingSelector").removeClass("selected")
    }else if($(this).hasClass("selected") && $(this).parent().children(".presentVotingSelector").hasClass("selected")){
        $(this).parent().children(".presentVotingSelector").removeClass("selected")
    }else{
        $(this).addClass("selected")
    }
})

$("table").on("mouseenter",".presentVotingSelector",function(){
    $(this).addClass("hovered")
    $(this).parent().children(".presentSelector").addClass("hovered")
})
$("table").on("mouseleave",".presentVotingSelector",function(){
    $(this).removeClass("hovered")
    $(this).parent().children(".presentSelector").removeClass("hovered")
})


$("table").on("click",".presentVotingSelector",function(){
    if($(this).hasClass("selected")){
        $(this).removeClass("selected")
        $(this).parent().children(".presentSelector").removeClass("selected")
    }else{
        $(this).addClass("selected")
        $(this).parent().children(".presentSelector").addClass("selected")
    }
})



// $("input[type='text']").keypress(function(event){
//     if(event.which === 13){
//         var delName = $(this).val()
//         counter++
//         $(this).val("")
//         $("tbody").append('<tr id="new' + counter + '"><td class="col-4" id="name" class="name" contenteditable="true" data-gramm_editor="false" spellcheck="false"><span class="nameText">' + delName +'<span class="deleteBtn"><i class="fa fa-trash" aria-hidden="true"></i></span></span></td><td class="col-4 presentSelector"></td><td class="col-4 presentVotingSelector"></td></tr>')
//         //SORT
//         sortTable()
//     }
// })

var counter = 0
$("#addButton").click(function(){
    // $("input[type='text']").stop().slideToggle(300)
    $("tbody").append('<tr id="new' + counter + '"><td class="col-4" id="name" class="name" contenteditable="false"><span class="nameText" contenteditable="true"  data-gramm_editor="false" spellcheck="false">New Delegation</span><span class="deleteBtn" contenteditable="false"><i class="fa fa-trash" aria-hidden="true"></i></span></td><td class="col-4 presentSelector"></td><td class="col-4 presentVotingSelector"></td></tr>')
    sortTable()
    $("#new"+counter+" #name .nameText").focus();
    // $("#new"+counter+" #name .nameText").putCursorAtEnd();
    counter++;
})



$("#deselect").click(function(){
    $(".presentSelector").removeClass("selected")
    $(".presentVotingSelector").removeClass("selected")
})

$("table").on("click",".deleteBtn",function(){
    console.log($(this).parent().parent().remove())
})

$("#save").click(function(){
    var rawDels = $("tr").slice(1)
    var delegations = []
    $.each(rawDels,function(){
        console.log($(this).children(".presentSelector").hasClass("selected"))
        if($(this).children(".presentVotingSelector").hasClass("selected")){
            var presentVoting = "presentVoting"
        } else if($(this).children(".presentSelector").hasClass("selected")){
            var presentVoting = "present"
        } else{
            var presentVoting = "none"
        }
        delegations.push({
            "id": $(this).attr("id"),
            "name": $(this).children("#name").text(),
            "presentVoting": presentVoting
        })
    })
    var id = window.location.pathname.split("/")[1]
    console.log(delegations)
    $.redirect("/"+id+"/rollcall",
    {
            delegations:delegations
    },
    "POST")
})

//CANCEL NEW LINE IN EDITABLE

$("table").on("keypress","td#name",function(e){ 
    if(e.which == 13){
        $(':focus').blur();
        sortTable();
    }else if($(this).children(".nameText").text()=="New Delegation"){
        $(this).children(".nameText").text("");
    }
    
    return e.which != 13; 
})

// $("td#name").keypress(function(e){ return e.which != 13; });

//SUPER SORT
$("body").click(function(){
    sortTable()
})

function sortTable() {
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("delTable");
  switching = true;
  /* Make a loop that will continue until
  no switching has been done: */
  while (switching) {
    // Start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /* Loop through all table rows (except the
    first, which contains table headers): */
    for (i = 1; i < (rows.length - 1); i++) {
      // Start by saying there should be no switching:
      shouldSwitch = false;
      /* Get the two elements you want to compare,
      one from current row and one from the next: */
      x = rows[i].getElementsByTagName("TD")[0];
      y = rows[i + 1].getElementsByTagName("TD")[0];
      // Check if the two rows should switch place:
      if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
        // If so, mark as a switch and break the loop:
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch
      and mark that a switch has been done: */
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}
