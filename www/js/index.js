"use strict"; // needed for the mobile browser

if (document.deviceready) {
    document.addEventListener('deviceready', onDeviceReady);
} else {
    document.addEventListener('DOMContentLoaded', onDeviceReady);
}

/**
 * Main Initialization function
 */

let pages = [];
let links = [];

let standings = [];

function onDeviceReady() {
    console.log("Ready!");
    
    pages = document.querySelectorAll('[data-role="page"]');
    links = document.querySelectorAll('[data-role="nav"] a');
    
    for(let i=0; i<links.length; i++) {
        links[i].addEventListener("click", navigate);
    }
    
    let refresh = document.querySelector(".refresh");
    console.log(refresh);
    refresh.addEventListener("click", refreshBtn);
    
    serverData.getJSON();
}

function navigate(ev) {
    ev.preventDefault();
    
    let link = ev.currentTarget; 
    console.log(link);
    
    let id = link.href.split("#")[1];
    console.log(id);
    
    history.replaceState({}, "", link.href);
    
    for(let i=0; i<pages.length; i++) {
        if(pages[i].id == id){
            pages[i].classList.add("active");
        } else {
            pages[i].classList.remove("active");
        }
    }
}

function refreshBtn(ev) {
    ev.preventDefault();
    serverData.getJSON();
}

let serverData = {
    url: "http://griffis.edumedia.ca/mad9014/sports/quidditch.php",
    httpRequest: "GET",
    getJSON: function () {
        
        // Add headers and options objects
        // Create an empty Request Headers instance
        let headers = new Headers();

        // Add a header(s)
        // key value pairs sent to the server

        headers.append("Content-Type", "text/plain");
        headers.append("Accept", "application/json; charset=utf-8");
        
        // simply show them in the console
        console.dir("headers: " + headers.get("Content-Type"));
        console.dir("headers: " + headers.get("Accept"));
        
        // Now the best way to get this data all together is to use an options object:
        
         // Create an options object
        let options = {
            method: serverData.httpRequest,
            mode: "cors",
            headers: headers
        };
        
        // Create an request object so everything we need is in one package
        let request = new Request(serverData.url, options);
        console.log(request);
           
        fetch(request)
            .then(function (response) {

                console.log(response);
                return response.json();
            })
            .then(function (data) {
                console.log(data); // now we have JS data, let's display it

                // Call a function that uses the data we recieved  
                displayData(data);
            })
            .catch(function (err) {
                alert("Error: " + err.message);
            });
    }
};

function displayData(data) {
  console.log(data);
    
//    localStorage.setItem("scores", JSON.stringify(data));
//     v comment this out
//    var myScoreData = JSON.parse(localStorage.get("scores"));
//    console.log("From LS: ");
//    console.log(myScoreData);
    
    
    //lets display some data:
    console.log(data.teams);
    console.log(data.scores);
    
    //get our schedule unordered list
    let ul = document.querySelector(".results_list");
    ul.innerHTML = ""; //clear existing list items
    
    standings = []; // refresh
    
    data.teams.forEach(function (value) {
        let team = {
            id: value.id,
            pts: 0,
            W: 0,
            L: 0,
            T: 0
        };
        standings.push(team);
    });
    
    //create list items for each match in the schedule
    data.scores.forEach(function (value) {
       
        let li = document.createElement("li");
        li.className = "score";
        //^ this is for css purposes
        
        let h3 = document.createElement("h3");
        h3.textContent = value.date;
        
        let homeTeam = null;
        let awayTeam = null;
        
        //add our new schedule HTML to the unordered list
        ul.appendChild(li);
        ul.appendChild(h3);
        
        value.games.forEach(function (item) {
            
            homeTeam = getTeamName(data.teams, item.home);
            awayTeam = getTeamName(data.teams, item.away);
            
            let dg = document.createElement("div");
            
            let home = document.createElement("div");
            home.className = "hteam";
            home.innerHTML = homeTeam + " " + "<b>" + item.home_score + "</b>" + "&nbsp" + "<br>";
            
            let away = document.createElement("div");
            away.className = "ateam";
            away.innerHTML = awayTeam + " " + "<b>" + item.away_score + "</b>" + "&nbsp";
            
            dg.appendChild(home);
            dg.appendChild(away);
            ul.appendChild(dg);
            
            if (item.home_score > item.away_score) {
                calculateStandings(item.home, "W");
                calculateStandings(item.away, "L");
            } else if (item.home_score < item.away_score) {
                calculateStandings(item.home, "L");
                calculateStandings(item.away, "W");
            } else {
                calculateStandings(item.home, "T");
                calculateStandings(item.away, "T");
            }
        
        });
});
    console.log("test");
    console.log(standings);
    
    let tbody = document.querySelector("#teamStandings tbody");
    tbody.innerHTML = "";
    
    standings.forEach(function (value){
        
        let wins = value.W;
        let losses = value.L;
        let ties = value.T;
        let points = value.pts;
        let name = getTeamName(data.teams, value.id);
        
        let tr = document.createElement("tr");
        let tdn = document.createElement("td");
       
        tdn.innerHTML = '<img src="img/' + name + '.png"/>' + "<br>" + name;
        
        let tdw = document.createElement("td");
        tdw.textContent = wins;
        let tdl = document.createElement("td");
        tdl.textContent = losses;
        let tdt = document.createElement("td");
        tdt.textContent = ties;
        let tdp = document.createElement("td");
        tdp.textContent = points;
        tr.appendChild(tdn);
        tr.appendChild(tdw);
        tr.appendChild(tdl);
        tr.appendChild(tdt);
        tr.appendChild(tdp);
        tbody.appendChild(tr);
        
        console.log(tbody);
    })
    
}
    
    
    

function getTeamName (teams, id) {
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].id == id) {
            return teams[i].name;
        }
    }
    return "unknown";
}


function calculateStandings(id, result) {
    let win = 2;
    let tie = 1;
    let loss = 0;
    
    standings.forEach(function (value) {
        if (value.id == id) {
            switch (result) {
                    
                case "W":
                    value.pts += win;
                    value.W++;
                    break;
                case "L":
                    value.pts += loss;
                    value.L++;
                    break;
                case "T":
                    value.pts += tie;
                    value.T++;
                    break;
                default:
                    console.log("calculateStandings ERROR");
                    break;
            }
        }
    });
}