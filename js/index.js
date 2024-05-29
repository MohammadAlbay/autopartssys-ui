function handleServerLoginCode(p) {
    if (p == 5) {
        alert("قم بتسجيل الدخول اولا");
        location.href = "/www/html/login.html";
        return true;
    }

    return false;
}
function elementPropertySetter(Me, myData) {
    for (let key in myData) {
        if (myData[key] == null) continue;
        if (key == "text")
            Me.innerText = myData[key];
        else if (key == "html")
            Me.innerHTML = myData[key];
        else if (key == "child") {
            let child = myData[key];
            if (Array.isArray(child))
                child.forEach(c => Me.appendChild(c));
            else
                Me.appendChild(child);
        }
        else if (key == "event") {
            let events = myData[key];

            for (let event in events) {
                Me[event] = () => events[event](Me);
            }
        }
        else
            Me.setAttribute(key, myData[key]);
    }
}

function addElement(parent, me, myData) {
    let Me = document.createElement(me);
    elementPropertySetter(Me, myData);

    parent.appendChild(Me);
}
function modifyElement(Me, myData) {
    elementPropertySetter(Me, myData);
    return Me;
}
function createChild(me, myData) {
    let Me = document.createElement(me);
    elementPropertySetter(Me, myData);

    return Me;
}
async function requestServiceForForm(formdata = FormData, onsuccess, onfail, rawhandler) {
    try {
        const task = formdata.get("Task");
        formdata.delete("Task");
        const response = await fetch('/service?Task='+task, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                //'Content-Type': 'multipart/form-data'
            },
            body: formdata
        });
        const data = await response.json();

        if (data == null) return;

        if (rawhandler !== null && rawhandler !== undefined)
            rawhandler(data);
        else {
            let loginRequired = document.handleServerLoginCode(data.State);
            if (data.State != 0 && !loginRequired) {
                if (onfail == undefined) {
                    console.log("REQUEST:" + JSON.stringify(formdata), "RESULT:" + JSON.stringify(data));
                    alert(data.Message);
                }
                else
                    onfail(data);
            }
            else
                onsuccess(data);
        }
    } catch (error) {
        //alert("حذث خطأ ما عند محاولة معالجة طلبك");
        console.log('Error:', error);
    }
}
async function requestService(payload, onsuccess, onfail, rawhandler) {
    if (payload.constructor == FormData)
        return await requestServiceForForm(payload, onsuccess, onfail, rawhandler);

    try {

        const response = await fetch('/service', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (data == null) return;

        if (rawhandler !== null && rawhandler !== undefined)
            rawhandler(data);
        else {
            let loginRequired = document.handleServerLoginCode(data.State);
            if (data.State != 0 && !loginRequired) {
                if (onfail == undefined) {
                    console.log("REQUEST:" + JSON.stringify(payload), "RESULT:" + JSON.stringify(data));
                    alert(data.Message);
                }
                else
                    onfail(data);
            }
            else
                onsuccess(data);
        }
    } catch (error) {
        //alert("حذث خطأ ما عند محاولة معالجة طلبك");
        console.log('Error:', error);
    }
}

function toggleShowHideOfUserDialog(element, state) {
    if (state == undefined) {
        if (element.classList.contains("hide-scale"))
            element.classList.replace("hide-scale", "show-scale");
        else if (element.classList.contains("show-scale"))
            element.classList.replace("show-scale", "hide-scale");
        else {
            element.style.display = "block";
            element.classList.length = 0;
            element.classList.add("show-scale");
        }
    }
    else {
        if (element.style.display == "none")
            element.style.display = "block";

        if (state == "show") {
            if (element.classList.contains("hide-scale"))
                element.classList.replace("hide-scale", "show-scale");
            else
                element.classList.add("show-scale");
        }
        else if (state == "hide") {
            if (element.classList.contains("show-scale"))
                element.classList.replace("show-scale", "hide-scale");
            else
                element.classList.add("hide-scale");
        }
    }
}

function toggleShowHideOfFullView(element, state) {
    if (state == undefined) {
        if (element.classList.contains("hide-fullview"))
            element.classList.replace("hide-fullview", "show-fullview");
        else if (element.classList.contains("show-fullview"))
            element.classList.replace("show-fullview", "hide-fullview");
        else {
            element.style.display = "block";
            element.classList.length = 0;
            element.classList.add("show-fullview");
        }
    }
    else {
        if (element.style.display == "none")
            element.style.display = "block";

        if (state == "show") {
            if (element.classList.contains("hide-fullview"))
                element.classList.replace("hide-fullview", "show-fullview");
            else
                element.classList.add("show-fullview");
        }
        else if (state == "hide") {
            if (element.classList.contains("show-fullview"))
                element.classList.replace("show-fullview", "hide-fullview");
            else
                element.classList.add("hide-fullview");
        }
    }
}

function closeAllOpenUserDialogs(lastOneOnly) {
    let count = 0;
    let userDialogs = document.querySelectorAll("div[user-dialog], div[user-profile]");
    if (lastOneOnly == undefined) {
        userDialogs.forEach(dialog => {
            if (dialog.classList.contains("show-scale")) {
                toggleShowHideOfUserDialog(dialog, "hide");
                count++;
            }
        });
    }
    else {
        for (let i = userDialogs.length - 1; i > -1; i--) {
            let dialog = userDialogs[i];
            if (dialog.classList.contains("show-scale")) {
                toggleShowHideOfUserDialog(dialog, "hide");
                count++;
                break;
            }
        }
    }

    return count;
}

function closeAllOpenFullViews(lastOneOnly) {
    let count = 0;
    let fullViews = document.querySelectorAll("div[full-view], div[user-screen]");

    if (lastOneOnly == undefined) {
        fullViews.forEach(view => {
            if (view.classList.contains("show-fullview")) {
                toggleShowHideOfFullView(view, "hide");
                count++;
            }
        });
    }
    else {
        for (let i = fullViews.length - 1; i > -1; i--) {
            let view = fullViews[i];
            if (view.classList.contains("show-fullview")) {
                toggleShowHideOfFullView(view, "hide");
                count++;
                break;
            }
        }
    }

    return count;
}

function closeAllOpenPopups() {
    closeAllOpenUserDialogs();
    closeAllOpenFullViews();
}

function logout() {
    sessionStorage.removeItem("user");
    location.href = "/www/html/login.html";
}
function requestLogout() {
    let confirmed = confirm("هل انت متأكد من تسجيل الخروج؟")
    if (!confirmed)
        return;
    document.requestService({ Task: "logout" }, data => {
        alert(data.Message);
        document.logout();
    });
}
async function checkServerLoginState() {
    let result = null;
    await requestService({ Task: "check_login" }, null, null, data => {
        let page = location.pathname.split('/').pop();
        if (data.State == 5) {
            if (page !== "login.html") logout();
        }
        result = data;
    });
    return result;
}
window.addEventListener("keydown", e => {

    if (e.keye != undefined) {
        if (e.key == 27) {
            if (closeAllOpenUserDialogs(true) == 0)
                closeAllOpenFullViews(true);
        }
    }
    else if (e.keyCode != undefined) {
        if (e.keyCode == 27) {
            if (closeAllOpenUserDialogs(true) == 0)
                closeAllOpenFullViews(true);
        }
    }
});

async function loadAllStores() {
    let data = [];
    await requestService({ Task: "load_store", All: true }, async d => data = d.Message);
    return data;
}

async function loadAllCategories() {
    let data = [];
    await requestService({ Task: "load_category", All: true }, async d => data = d.Message);
    return data;
}
async function loadAllClients() {
    let data = [];
    await requestService({ Task: "load_client", All: true }, async d => data = d.Message);
    return data;
}
async function loadAllSuppliers() {
    let data = [];
    await requestService({ Task: "load_supplier", All: true }, async d => data = d.Message);
    return data;
}
async function loadAllPaymentOptions() {
    let data = [];
    await requestService({ Task: "load_paymentmethod", All: true }, async d => data = d.Message);
    return data;
}
async function loadConfigurations() {
    let data = {};
    await requestService({ Task: "load_configs", All: true }, async d => data = d.Message);
    return data;
}
async function loadAllUsers() {
    let data = [];
    await requestService({ Task: "load_accounts" }, async d => data = d.Message);
    return data;
}
async function loadAllMeasurmentUnits() {
    let data = [];
    await requestService({ Task: "load_measuringunit", All: true }, async d => data = d.Message);
    return data;
}
function expandContainerArea() {
    let toolbox = document.querySelector("div[toolbox]");
    let middleArea = document.querySelector("div[middle-area]");
    toolbox.classList.remove("show-toolbox");
    middleArea.classList.remove("deexpand-middle-area");
    toolbox.classList.add("hide-toolbox");
    middleArea.classList.add("expand-middle-area");


    document.getElementById("deexpand_button").style.display = "block";
}
function deExpandContainerArea(obj) {
    let toolbox = document.querySelector("div[toolbox]");
    let middleArea = document.querySelector("div[middle-area]");
    toolbox.classList.remove("hide-toolbox");
    middleArea.classList.remove("expand-middle-area");
    toolbox.classList.add("show-toolbox");
    middleArea.classList.add("deexpand-middle-area");

    if (obj != undefined)
        obj.style.display = "none";
}
function toggleContainerArea() {
    if (document.middleAreaExpanded) {
        document.deExpandContainerArea();
        document.middleAreaExpanded = false;
    }
    else {
        document.expandContainerArea();
        document.middleAreaExpanded = true;
    }

}
function openCashierSystem() {
    location.href = "/www/html/cashier.html?bk";
}
function openAccountantSystem() {
    location.href = "/www/html/accountant.html?bk";
}

function pressEscape() {
    window.dispatchEvent(new KeyboardEvent("keydown", { keyCode: 27, key: 27 }));
}

function validatePhoneNumberInput(self) {
    let value = self.value;
    let state = false;
    let required = self.getAttribute("required") != undefined;
    if (value === "") {
        if (!required)
            state = true;
        else {
            self.style.outline = "red 1px solid";
            state = false;
        }
    }
    if (validatePhoneNumber(value)) {
        self.style.outline = "green 1px solid";
        state = true;
    }
    else {
        if (required) {
            state = false;
            self.style.outline = "red 1px solid";
        }
    }
    return state;
}

function validatePhoneNumber(value) {
    return value.match(/(^2189[1|2|4][0-9]{7}$)|(^09[1|2|4][0-9]{7}$)/) != null;
    //(/(2189[124][0-9]{7})|(09[124][0-9]{7})/gi);
}
function validateEmail(value) {
    return value.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
        != null;
}
function validateUsername(value) {
    return value.match(/^([a-zA-Z]{1})([a-zA-Z0-9_]{4,29})$/gm) != null;
}
function validateName(value) {
    return value.match(/^[a-zA-Z0-9_\p{L}\s]+$/u) != null;
}

async function validateInput(M = [{ ValidateWhen: "", Input: "", async Validator(v, elem = null) { } }], submitElement, autoValidate = false) {

    const onsuccess = (v, errorElement, inputElement, r) => {
        errorElement.classList.remove("show-opacity");
        errorElement.classList.add("hide-opacity");
        inputElement.style.borderColor = inputElement.style.outlineColor = "black";
        if (r.filter(row => row.State == false).length == 0) {
            if (submitElement != null)
                submitElement.style.display = "inline";
        }
        
    };

    const onfail = (message, errorElement, inputElement, r) => {
        if (errorElement.style.display === "none")
            errorElement.style.display = "block";

        inputElement.style.borderColor = inputElement.style.outlineColor = "rgb(179, 83, 72)";
        errorElement.classList.remove("hide-opacity");
        errorElement.classList.add("show-opacity");
        errorElement.children[0].textContent = message;
        if (submitElement != null)
            submitElement.style.display = "none";
    }
    let results = [];
    results.length = M.length;
    results = results.map(a => [{ State: false, Value: "", Element: null }]);
    M.forEach(async (m, index) => {
        results[index] = { State: false, Value: "", Element: null };
        let inputElement = document.getElementsByName(m.Input)[0];
        let errorElement = document.querySelector(`div[input-banner][error-for="${m.Input}"]`);

        if (inputElement == null) return;

        results[index].Element = inputElement;

        if (autoValidate) {
            const [state, message] = await m.Validator(inputElement.value.trim(), inputElement, M);
            results[index].State = state;
            results[index].Value = inputElement.value.trim();
            if (state)
                onsuccess(message, errorElement, inputElement, results);
            else
                onfail(message, errorElement, inputElement, results);

            
        }
        else {
            inputElement.addEventListener(m.ValidateWhen ?? "change", async e => {
                const [state, message] = await m.Validator(inputElement.value.trim(), inputElement, M);
                results[index].State = state;
                results[index].Value = inputElement.value.trim();
                if (state)
                    onsuccess(message, errorElement, inputElement, results);
                else
                    onfail(message, errorElement, inputElement, results);

                
            });
        }

    });

    return {
        Result: results,
        Reset() {
            results = resetValidationResult(results);
            this.Result = results;
        },
        Revalidate() {
            results.forEach(async r => {
                if(r.Element.tagName === 'SELECT') {
                    r.Element.dispatchEvent(new Event('change', { bubbles: true }));
                }
                else
                    r.Element.dispatchEvent(new Event('input', { bubbles: true }));
            });
        }
    };
}

function resetValidationResult(result) {
    result = result.map(r => {
        return {
            State: false, Value: "", Element: r.Element
        }
    });
    return result;
}
function imageToUrl(url, callback, outputFormat) {
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        var dataURL;
        canvas.height = this.height;
        canvas.width = this.width;
        ctx.drawImage(this, 0, 0);
        dataURL = canvas.toDataURL(outputFormat);
        callback(dataURL);
        canvas = null;
    };
    img.src = url;
}

async function getFirstIncomeBillOfYear(year) {
    await document.requestService({Task: "first_ibill", Year: year}, async data => {
        if(data.Message.RemainDays < 7) {
            alert("متبقي اقل من 7 ايام للجرد. ");
        }
        //console.log(data.Message);
    });
}
document.middleAreaExpanded = false;
document.pressEscape = pressEscape;
document.toggleContainerArea = toggleContainerArea;
document.closeAllOpenUserDialogs = closeAllOpenUserDialogs;
document.toggleShowHideOfUserDialog = toggleShowHideOfUserDialog;
document.addElement = addElement;
document.createChild = createChild;
document.modifyElement = modifyElement;
document.handleServerLoginCode = handleServerLoginCode;
document.requestService = requestService;
document.requestServiceForForm = requestServiceForForm;
document.logout = logout;
document.requestLogout = requestLogout;
document.checkServerLoginState = checkServerLoginState;
document.toggleShowHideOfFullView = toggleShowHideOfFullView;
document.closeAllOpenFullViews = closeAllOpenFullViews;
document.closeAllOpenPopups = closeAllOpenPopups;
document.loadAllStores = loadAllStores;
document.loadAllCategories = loadAllCategories;
document.loadAllMeasurmentUnits = loadAllMeasurmentUnits;
document.loadAllClients = loadAllClients;
document.loadAllSuppliers = loadAllSuppliers;
document.loadAllPaymentOptions = loadAllPaymentOptions;
document.loadConfigurations = loadConfigurations;
document.loadAllUsers = loadAllUsers;
document.expandContainerArea = expandContainerArea;
document.deExpandContainerArea = deExpandContainerArea;
document.openCashierSystem = openCashierSystem;
document.openAccountantSystem = openAccountantSystem;
document.validatePhoneNumber = validatePhoneNumber;
document.validatePhoneNumberInput = validatePhoneNumberInput;
document.validateEmail = validateEmail;
document.validateUsername = validateUsername;
document.validateName = validateName;
document.validateInput = validateInput;
document.resetValidationResult = resetValidationResult;
document.imageToUrl = imageToUrl;
document.getFirstIncomeBillOfYear = getFirstIncomeBillOfYear;


window.addEventListener("keydown", e => {
    if ("Enter" === e.key) {
        let btn = document.querySelector("button[accept-button]");
        if (btn == null) return;

        const event = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: true,
        });

        btn.dispatchEvent(event);
    }
});



if (location.pathname.split('/').pop() !== "login.html") {



    // other functions, event handlers
    document.querySelector("div[toolbox] > div[container] > div#tool_logout")
        ?.addEventListener("click", e => {
            requestLogout();
        });


    var CurrentUser = sessionStorage.getItem("user");
    if (CurrentUser == null)
        location.href = "/www/html/login.html";
    else {
        CurrentUser = JSON.parse(CurrentUser);
        document.CurrentUser = CurrentUser;
    }


    checkServerLoginState();

    (async () => {
        let configs = await document.loadConfigurations();
        if (configs.hasOwnProperty("Business")) {
            document.Configs = configs;
        }
        else {
            document.Configs = null;
            alert("حذثت مشكلة في النظام. لم يتمكن النظام من معرفة بيانات النظام. رجاء قم بتسجيل بيانات النظام الاساسية");
            return;
        }

        await document.getFirstIncomeBillOfYear(new Date().getFullYear());
    })();

}