function addShow(show_id) {
    if(!shows.find((show)=>show_id===show.imdbID)) {
        getShowData(show_id).then(function(data){
            shows.push(data);
            localforage.setItem('movieinfo_films', shows);
            appendShow(data);
        });
    }
}

function removeShow(show_id) {
    shows = shows.filter(function(show){
        return show.imdbID != show_id;
    });
    localforage.setItem('movieinfo_films', shows);

    //Remove show from DOM
    var node = document.getElementById("show-container-"+show_id);
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }

    var node = document.getElementById("show-title-"+show_id);
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
}

function getShowData(show_id) {
    var promise = new Promise(function(accept, reject){
        //var url = 'http://api.tvmaze.com/shows/' + show_id + '?embed[]=episodes&embed[]=nextepisode&embed[]=previousepisode'
        var url = 'http://www.omdbapi.com/?i=' + show_id + '&plot=short&r=json';

        fetch(url).then(function(response){
            response.json().then(function(data){
                accept(data);
            })
        })
    });
    return promise;
}

function appendShow(show_data){
    var show_div = document.createElement('div');
    var show_title_div = document.createElement('div');

    show_div.innerHTML = new EJS({url: 'show_container.ejs'}).render(show_data);
    show_title_div.innerHTML = new EJS({url: 'show_title.ejs'}).render(show_data);

    var old_show_div = document.getElementById('show-container-'+show_data.id);
    if(old_show_div){
        var parent = old_show_div.parentNode;
        parent.innerHTML = '';
        parent.appendChild(show_div);
    } else {
        document.getElementById('show-content').appendChild(show_div);
        document.getElementById('sidebar').appendChild(show_title_div);
    }
}

function searchForShow(show_query){
    url = `http://www.omdbapi.com/?t=${show_query}&y=&plot=short&r=json`;

    fetch(url).then(function(response){
        response.json().then(function(data){
            if(data.Response === 'False'){
                console.log(data.Error);
            } else {
                addShow(data.imdbID);
            }
        })
    })
}

function refreshShow(show_id){
    getShowData(show_id).then(function(show_data){
        shows.forEach(function(show, index){
            if(show.id === show_id) {
                shows[index] = show_data;
            }
            appendShow(show_data);
        });
        localforage.setItem('movieinfo_films', shows)
    });
}

function refreshShows(){
    last_refreshed = Date.now();
    localforage.setItem('movieinfo_last_refreshed', last_refreshed);

    updateLastUpdated();
    shows.forEach(function(show){
        refreshShow(show.id);
    });
}

function updateLastUpdated(){
    var lastUpdatedTag = document.getElementById('last-updated');

    if(last_refreshed) {
        lastUpdatedTag.innerHTML = moment(last_refreshed).fromNow();
    } else {
        lastUpdatedTag.innerHTML = 'never';
    }
}

function pollAndUpdateLastUpdated(){
    setTimeout(function(){
        updateLastUpdated();
        pollAndUpdateLastUpdated();
    },10000);
}

function toggleSeason(season_id){
    var el = document.getElementById(season_id);

    if(el.style.display === 'none') {
        el.style.display = '';
    } else {
        el.style.display = 'none';
    }
}

function showShow(show_id){
    document.getElementById('show-container-'+show_id).scrollIntoView();
}

function sortShowByName(a, b){
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}

function init() {

    document.addEventListener("DOMContentLoaded", function(event) {

        updateLastUpdated();
        pollAndUpdateLastUpdated();

        var addShowInput = document.getElementById('input-add-show');

        addShowInput.addEventListener('keyup', function(e) {
            if(e.keyCode === 13) {
                var show_query = addShowInput.value;
                searchForShow(show_query);
            }
        });

        var refresh_shows_button = document.getElementById('button-refresh-shows');
        refresh_shows_button.addEventListener('click', function(){
            refreshShows();
        });
    });

    localforage.getItem('movieinfo_films').then(function(shows_data){
        if (shows_data) {
            shows = shows_data;
        }

        shows.sort(sortShowByName).forEach(function(show){
            appendShow(show);
        });

        //refreshShows();
    });

    localforage.getItem('movieinfo_last_refreshed').then(function(data){
        last_refreshed = data ? data : 0;
        updateLastUpdated();
    });
}

var shows = [];
var last_refreshed = 0;
init();
