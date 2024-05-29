import SWP from "./swp.js"
import AbstractView from "./views/AbstractView.js";
import Accounts from "./views/Accounts.js";
import Notes from "./views/Notes.js";
import Stores from "./views/Stores.js";
import Products from "./views/Products.js";
import Clients from "./views/Clients.js";
import Suppliers from "./views/Suppliers.js";
import PaymentMethods from "./views/PaymentMethods.js";
import Sales from "./views/Sales.js";
import Purchases from "./views/Purchases.js";

// import PostView from "./views/PostView.js";
// import Settings from "./views/Settings.js";
document.currentView = null;

const routes = [
    { path: "/www/html/notes.html", view: Notes },
    { path: "/www/html/accounts.html", view: Accounts },
    { path: "/www/html/stores.html", view: Stores },
    { path: "/www/html/products.html", view: Products },
    { path: "/www/html/clients.html", view: Clients },
    { path: "/www/html/suppliers.html", view: Suppliers },
    { path: "/www/html/paymentmethods.html", view: PaymentMethods },
    { path: "/www/html/sales.html", view: Sales },
    { path: "/www/html/purchases.html", view: Purchases },
];
const previousPage = [
    { search: "note", path: "/www/html/notes.html" },
    { search: "account", path: "/www/html/accounts.html" },
    { search: "store", path: "/www/html/stores.html" },
    { search: "products", path: "/www/html/products.html" },
    { search: "clients", path: "/www/html/clients.html" },
    { search: "suppliers", path: "/www/html/suppliers.html" },
    { search: "paymentmethods", path: "/www/html/paymentmethods.html" },
    { search: "sales", path: "/www/html/sales.html" },
    { search: "purchases", path: "/www/html/purchases.html" },
];
const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = match => {
    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

    return Object.fromEntries(keys.map((key, i) => {
        return [key, values[i]];
    }));
};

const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};

const router = async () => {
    // Test each route for potential match
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path))
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.result != null);

    if (!match) {
        match = {
            route: routes[1],
            result: [location.pathname]
        };
    }

    const view = new match.route.view(getParams(match));


    if (document.currentView == null)
        document.currentView = view;
    else if (view != document.currentView) {
        document.currentView.onUnload();
        document.currentView = view;
    }

    await view.onLoad();

    const app  =document.querySelector("#app");
    app.innerHTML = await view.getHtml();
    const scripts = app.querySelectorAll(`script[embedded-script-for="${view.name}"]`);
    scripts.forEach(script => {
        let newScript = document.createElement("script");
        [...script.attributes].forEach(att => newScript.setAttribute(att.name, att.value));
        let inlineScript = document.createTextNode(script.innerText);
        newScript.appendChild(inlineScript);
        let parent = script.parentElement;
        parent.replaceChild(newScript, script);
    });
    //notes
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
document.addEventListener("DOMContentLoaded", (e) => {
    AbstractView.fragmentContainer = document.getElementById("app");
    document.body.addEventListener("click", e => {
        let target;
        if (e.target.matches("[data-link]"))
            target = e.target;
        else if (e.target.parentElement.matches("[data-link]"))
            target = e.target.parentElement;

        if (target != null) {
            e.preventDefault();
            let url = target.getAttribute("href");
            navigateTo(url);
        }
        else {
            e.preventDefault();
            e.stopPropagation();
        }
    });
    checkForPerviousPage();
    //router();

});