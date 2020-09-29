var committee = JSON.parse(json_committee)

var votingDels = 0

committee.delegations.forEach(function(delegation){
    if(delegation.presentVoting != ""){
        votingDels++
    }
})

var delegations = committee.delegations

var currentDel = 0

updateEverything()



$("#yesBtn").click(function(){
    if(currentDel<=delegations.length){
        $("#yesCount").text(parseInt($("#yesCount").text())+1)
        updateEverything()
    }
})

$("#noBtn").click(function(){
    if(currentDel<=delegations.length){
        $("#noCount").text(parseInt($("#noCount").text())+1)
        updateEverything()
    }
})

$("#absBtn").click(function(){
    if(currentDel<=delegations.length){
        $("#absCount").text(parseInt($("#absCount").text())+1)
        votingDels--
        updateEverything()
    }
})

$("#passBtn").click(function(){
    thisDel = delegations[currentDel-1]
    delegations.remove(delegations[currentDel-1])
    delegations.push(thisDel)
    console.log(delegations)
    currentDel-=1
    updateEverything()
})

//UPDATE ALL THE THINGS
function updateEverything(){
    if(currentDel>=delegations.length){
        $("#currentDelegation").text("Vote Over")        
        $("#pvIndicator").text("")
    }else{
        $("#halfQuorum").text("1/2: " + (Math.floor(votingDels/2)+1))
        $("#twothirdsQuorum").text("2/3: " + Math.ceil(votingDels*2/3))

        $("#currentDelegation").text(delegations[currentDel].name)
        $("#pvIndicator").text(Ucfirst(delegations[currentDel].presentVoting))
        currentDel++
    }

}




// UPPER CASE FIRST LETTER
function Ucfirst(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}


// REMOVE FUNCTION
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
