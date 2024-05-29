let UserDataEditor = {
    Shown: false,
    Dialog: document.querySelector("div#accouunt_profile"),
    UserIdLabel: document.querySelector("div#accouunt_profile > .userID"),
    Show() {this.Setup(); this.Shown = true; document.closeAllOpenPopups(); document.toggleShowHideOfUserDialog(this.Dialog, "show") },
    Hide() { this.Shown = false; document.toggleShowHideOfUserDialog(this.Dialog, "hide") },
    Setup() {
        if (document.CurrentUser != null) {
            this.UserIdLabel.innerHTML = document.CurrentUser.Fullname;
        }
    },
    ShowEditor() {
        EditorDialog.Show();
    },
    Toggle() {
        if(this.Shown)
            this.Hide();
        else
            this.Show();
    }
}
let EditorDialog = {
    Dialog: document.querySelector("div#edit_account_userdialog"),
    Input: {
        Username: document.querySelector("div#edit_account_userdialog > div > div > input[name='username']"),
        Fullname: document.querySelector("div#edit_account_userdialog > div > div > input[name='fullname']"),
        Password: document.querySelector("div#edit_account_userdialog > div > div > input[name='passcode']"),
    },
    Show() {
        document.closeAllOpenPopups();
        document.toggleShowHideOfUserDialog(this.Dialog, "show");
        this.Prepare();
    },
    Hide() { document.toggleShowHideOfUserDialog(this.Dialog, "hide") },
    Prepare() {
        if (document.CurrentUser == null) {
            this.Hide();
        }
        this.Input.Username.value = document.CurrentUser.Username;
        this.Input.Fullname.value = document.CurrentUser.Fullname;
        this.Input.Password.value = "";
    },
    Save() {
        let requestPayload = {
            Task: "edit_accounts",
            Username: this.Input.Username.value,
            Fullname: this.Input.Fullname.value,
            Passcode: this.Input.Password.value
        }
        if(requestPayload.Passcode === "")
            delete requestPayload.Passcode;
        document.requestService(requestPayload, data => {
            alert(data.Message);
            let user  = JSON.parse(sessionStorage.getItem("user"));
            user.Fullname = requestPayload.Fullname;
            sessionStorage.setItem("user", JSON.stringify(user));
            location.reload();
        });
    }
}

function showChangePriceDialog() {
    document.toggleShowHideOfUserDialog(document.getElementById("change_prices_dialog"), "show");
}
function hideChangePriceDialog() {
    document.toggleShowHideOfUserDialog(document.getElementById("change_prices_dialog"), "hide");
}
async function changePrices() {
    let promise = await resultsCP;
    await promise.Revalidate();
    let r = promise.Result;
    if (r.filter(row => row.State == false).length > 0) {
        return;
    } else {
        let formdata = new FormData(document.forms["form_updateprices"]);
        formdata.append("Task", "changeprices_product");
        await document.requestServiceForForm(formdata,
            async data => {
                hideChangePriceDialog();
                promise.Reset();
                document.forms["form_updateprices"].reset();
                alert(data.Message);
        });
    }
}

/*





 */

var validationMapCP = [
    {
        Input: "prev_price",
        ValidateWhen: "input",
        async Validator(v) {
            try {
                let prev_price = parseFloat(v);
                if(prev_price < 0) throw Error("v can't be negative");
                let current_price = parseFloat(document.forms["form_updateprices"].elements["current_price"].value);
                let change_percentage = document.forms["form_updateprices"].elements["change_percentage"];
                
                let percentage = (current_price/prev_price)*100 - 100;
                change_percentage.value = percentage.toFixed(2);
                
                return [true, v];
            }
            catch {
                return [false, "قيمة الحقل لا يمكن ام تكون فارغة"];
            }
        },
    },
    {
        Input: "current_price",
        ValidateWhen: "input",
        async Validator(v, element, M) {
            try {
                let current_price = parseFloat(v);
                if(current_price < 0) throw Error("v can't be negative");
                let prev_price = parseFloat(document.forms["form_updateprices"].elements["prev_price"].value);
                let change_percentage = document.forms["form_updateprices"].elements["change_percentage"];
                
                let percentage = (current_price/prev_price)*100 - 100;
                change_percentage.value = percentage.toFixed(2);;
                
                return [true, v];
            }
            catch {
                return [false, "قيمة الحقل لا يمكن ام تكون فارغة"];
            }
        },
    },
    {
        Input: "change_percentage",
        ValidateWhen: "input",
        async Validator(v) {
            try {
                parseFloat(v);
                return [true, v];
            }
            catch {
                return [false, "قيمة الحقل لا يمكن ام تكون فارغة"];
            }
            
        },
    },
    {
        Input: "fix_method",
        ValidateWhen: "change",
        async Validator(v, element) {
            if (v == "" || element.selectedOptions.length == 0)
                return [false, "يجب اختيار قيمة اولا"];
            return [true, v];
        },
    }
];

var resultsCP = document.validateInput(validationMapCP, document.querySelector("#submitButton"));
