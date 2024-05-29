
var addAccountUserDialog = document.querySelector("div#add_account_userdialog");
var InfoBook = {
    Accounts: [],
    Permissions: [],
    UserData: {},
}

async function addAccount() {
    let promise = await results;
    await promise.Revalidate();
    let r = promise.Result;
    if (r.filter(row => row.State == false).length > 0) {
        return;
    }
    let requestPayload = {
        Username: document.querySelector("input[name='Username']").value,
        Fullname: document.querySelector("input[name='Fullname']").value,
        PassCode: document.querySelector("input[name='PassCode']").value,
        PermissionCode: parseInt(document.querySelector("select[name='PermissionCode']").value),

    };


    let accounts = await document.loadAllUsers();
    if (accounts.filter(acc => acc.Username === requestPayload.Username).length > 0) {
        alert("الحساب موجود بالفعل");
        return;
    }

    requestPayload.Task = "register_accounts";
    document.requestService(requestPayload, async d => {
        alert(d.Message);
        await loadUsersAccounts();
        await displayData();
        document.toggleShowHideOfUserDialog(addAccountUserDialog, 'hide');
        document.querySelector("input[name='Username']").value = "";
        document.querySelector("input[name='Fullname']").value = "";
        document.querySelector("input[name='PassCode']").value = "";

    });
}
async function loadPermissionsInfo() {
    await document.requestService({ Task: "load_permissions_info" }, async data => {
        InfoBook.Permissions = data.Message;
    });
}
async function deleteAccount(self) {
    let username = self.getAttribute("user-name");
    if (username == undefined || username == "")
        return;

    document.requestService({ Username: username, Task: "remove_account" }, async data => {
        alert(data.Message);
        await loadUsersAccounts();
        await displayData();
    });

    //alert("Function works");
}
function displayPermissionInfo() {
    let select = document.querySelector("select#PermissionCode");
    select.replaceChildren();
    InfoBook.Permissions.forEach(item => {
        document.addElement(select, "option", { text: item.Name, value: item.Id });
    });
}
function GenerateRow(account, count) {
    let tr = document.createElement("TR");
    //td_remove_icon.
    //tr.appendChild(td_count);
    let permissionName = "";
    let permission = InfoBook.Permissions.filter(p => p.Id == account.PermissionCode);
    if (permission == null || permission.length == 0)
        permissionName = "صلاحية غير معروفة";
    else
        permissionName = permission[0].Name;
    document.addElement(tr, "td", { text: count });// count
    document.addElement(tr, "td", { text: account.Username }); // username
    document.addElement(tr, "td", { text: account.Fullname }); // fullname
    document.addElement(tr, "td", { text: permissionName }); // permissioncode

    let td1 = document.createChild("td", {});
    tr.appendChild(td1);
    if (!account.LoggedIn)
        document.addElement(td1, "img", {
            src: "/www/res/images/icons/icons8_no_network_48px.png",
            style: `width:26px; height:26px;display: block;
                    margin-left: auto;margin-right: auto;
                    margin-top: 0.3em;`
        });
    else
        document.addElement(td1, "font", { text: "متصل" });

    let td2 = document.createChild("td", {});
    tr.appendChild(td2);
    let canBeDeleted = false;
    if (InfoBook.UserData.PermissionCode < account.PermissionCode && InfoBook.UserData.Username != account.Username)
        canBeDeleted = true;
    document.addElement(td2, "img", {
        src: "/www/res/images/icons/icons8_denied_48px.png", clickable: "", title: "حذف حساب المستخدم",
        style: `width:26px; height:26px;display: block;
                    margin-left: auto;margin-right: auto;
                    margin-top: 0.3em;` + (canBeDeleted ? "" : "filter: grayscale(100%);cursor: not-allowed;"),
        'user-name': (canBeDeleted ? "" : account.Username),
        event: {
            onclick(self) {
                if (!canBeDeleted) {
                    alert("لا يمكن حذف هذا الحساب");
                    return;
                }
                document.requestService({ Username: account.Username, Task: "remove_account" }, async data => {
                    alert(data.Message);
                    await loadUsersAccounts();
                    await displayData();
                });
            }
        }
    });

    return tr;
}
async function displayData() {
    let table = document.querySelector("table#table_account");
    table.replaceChildren();
    table.innerHTML = "<tr><td>#</td><td>اسم المستخدم</td><td>الاسم بالكامل</td><td> الصلاحية</td><td>متصل بالانترنت</td><td>حذف المستخدم</td></tr>";
    let count = 1;
    InfoBook.Accounts.forEach(account => {
        let row = GenerateRow(account, count);
        table.appendChild(row);
        count++;
    });
}
async function loadUsersAccounts() {
    await document.requestService({ Task: "load_accounts" }, async (data) => {
        InfoBook.Accounts = data.Message;
    });
}




///
/// perpare UI, system functionalities and other client-side-related tasks
function clientUIWork() {
    document.querySelector("div#add_account_userdialog > div[control-area] > button[control-cancel]")
        .addEventListener("click", e => { try { closeAddAccountDialog() } catch { } });




}

/*


 */

var validationMap = [
    {
        Input: "Username",
        ValidateWhen: "input",
        async Validator(v) {
            if (v.length < 4 || v.length > 30)
                return [false, "القيمة المدخله يجب ان تتكون من 4 الى 30 حرف كحد اقصى"];
            else if (!document.validateUsername(v))
                return [false, "القيمة المدخله لا يمكن ان تحتوي على أحرف خاصة كـ علامات الترقيم والاستفهام وغيرها."];
            return [true, v];
        },
    },
    {
        Input: "Fullname",
        ValidateWhen: "input",
        async Validator(v) {
            if (v.length < 4 || v.length > 50)
                return [false, "القيمة المدخله يجب ان تتكون من 4 الى 50 حرف كحد اقصى"];
            else if (!document.validateName(v))
                return [false, "القيمة المدخله لا يمكن ان تحتوي على أحرف خاصة كـ علامات الترقيم والاستفهام وغيرها."];
            return [true, v];
        },
    },
    {
        Input: "PassCode",
        ValidateWhen: "input",
        async Validator(v) {
            if (v.length < 3 || v.length > 45)
                return [false, "القيمة المدخله يجب ان تتكون من 4 الى 50 حرف كحد اقصى"];
            else if (!document.validateName(v))
                return [false, "القيمة المدخله لا يمكن ان تحتوي على أحرف خاصة كـ علامات الترقيم والاستفهام وغيرها."];
            return [true, v];
        },
    },
    {
        Input: "PermissionCode",
        ValidateWhen: "change",
        async Validator(v, element) {
            if (v == "" || element.selectedOptions.length == 0)
                return [false, "يجب اختيار قيمة اولا"];
            return [true, v];
        },
    }
];

var results = document.validateInput(validationMap, document.querySelector("#submitButton"));

async function loadRequiredData() {
    await loadUsersAccounts();
    await loadPermissionsInfo();

    displayPermissionInfo();
    await displayData();
}
clientUIWork();
(async () => {

    let user = sessionStorage.getItem("user");
    if (user == null)
        location.href = "/www/html/login.html"
    InfoBook.UserData = JSON.parse(user);
    if (typeof container === 'undefined') {
        location.href = "/www/html/" + InfoBook.UserData.Page;
    }

    await loadRequiredData();

})();