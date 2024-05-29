import AbstractView from "./views/AbstractView.js";
import Notes from "./views/Notes.js";
import Products from "./views/Products.js";
import Clients from "./views/Clients.js";
import Sales from "./views/Sales.js";

document.currentView = null;

const routes = [
    { path: "/www/html/notes.html", view: Notes },
    { path: "/www/html/products.html", view: Products },
    { path: "/www/html/clients.html", view: Clients },
    { path: "/www/html/sales.html", view: Sales },
];
const previousPage = [
    { search: "note", path: "/www/html/notes.html" },
    { search: "products", path: "/www/html/products.html" },
    { search: "clients", path: "/www/html/clients.html" },
    { search: "sales", path: "/www/html/sales.html" },
];
const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = match => {
    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

    return Object.fromEntries(keys.map((key, i) => {
        return [key, values[i]];
    }));
};
let appCashierURL =  "";
const navigateTo = url => {
    appCashierURL = url;
    //history.pushState(null, null, url);
    router();
};

const router = async () => {


    // Test each route for potential match
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            result: appCashierURL.match(pathToRegex(route.path)) // location.pathname
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.result != null);

    if (!match) {
        match = {
            route: routes[0],
            result: [location.pathname]
        };
    }

    const view = new match.route.view(getParams(match));
    view.setViewEmbedded = true;

    if (document.currentView == null)
        document.currentView = view;
    else if (view != document.currentView) {
        document.currentView.onUnload();
        document.currentView = view;
    }
    else {
        view.onUnload();
    }

    await view.onLoad();

    let apphost = document.querySelector("#app");
    apphost.innerHTML = await view.getHtml();

    let img = document.createElement("img");
    img.setAttribute("src", "/www/res/images/icons/icons8_close_90px.png");
    img.className = "main_head_closeicon";
    img.setAttribute("title", "اغلاق");
    img.onclick = (e) => {
        window.dispatchEvent(new KeyboardEvent("keydown", {keyCode:27, key: 27}));
    };

    apphost.appendChild(img);
};

/// ----------------------- public functions
window.addEventListener("popstate", router);

function checkForPerviousPage() {
    let s = location.search;
    if (s == "" || s == undefined)
        return;

    s = s.substring(1, s.length);

    previousPage.forEach(item => {
        if (item.search == s)
            navigateTo(item.path);
    });

    //location.search = "";
}
document.addEventListener("DOMContentLoaded", () => {
    AbstractView.fragmentContainer = document.getElementById("app");
    document.body.addEventListener("click", e => {
        let target;
        if (e.target.matches("[data-link]"))
            target = e.target;
        else if (e.target.parentElement.matches("[data-link]"))
            target = e.target.parentElement;

        if (target != null) {
            e.preventDefault();
            document.toggleShowHideOfFullView(appWindow, "show");
            let url = target.getAttribute("href");
            navigateTo(url);


        }
    });
    //checkForPerviousPage();
    //router();
});