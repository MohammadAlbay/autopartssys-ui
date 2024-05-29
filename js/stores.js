var storeUserDialog = document.querySelector("div#store_userdialog");
var LoadedStores = [];

async function addStore() {
    let promise = await results;
    await promise.Revalidate();
    let r = promise.Result;
    if (r.filter(row => row.State == false).length > 0) {
        return;
    } else {
        const form = document.forms['form_store'];
        const formdata = new FormData(form);
        formdata.append("Task", "add_store");
        formdata.append("Username", document.CurrentUser.Username);
        await document.requestServiceForForm(formdata, async data => {
            promise.Reset();
            form.reset();
            alert(data.Message);
            document.toggleShowHideOfUserDialog(storeUserDialog, 'hide');
            await loadStores();
        });
    }
}
async function displayStores() {
    let table = document.querySelector("table#table_store");
    table.replaceChildren();
    table.innerHTML = `<tr><td>المخزن</td><td>العنوان </td><td>النوع</td><td>الحالة/مفعل</td><td>بواسطة</td><td>بتاريخ</td><td></td><td></td></tr>`;

    LoadedStores.forEach(element => {
        let tr = document.createChild("tr", {});
        document.addElement(tr, "td", { text: element.Name });
        document.addElement(tr, "td", { text: element.Address });
        document.addElement(tr, "td", { text: element.Type == "main" ? "رئيسي" : "فرعي" });
        document.addElement(tr, "td", { text: element.Active == 0 ? "غير فعال" : "فعال" });
        document.addElement(tr, "td", { text: element.Addedby });
        document.addElement(tr, "td", { text: element.Creationdate });

        let td1 = document.createChild("td", {});
        let td2 = document.createChild("td", {});
        tr.appendChild(td1);
        tr.appendChild(td2);
        document.addElement(td1, "img", {
            src: "/www/res/images/icons/icons8_edit_property_48px.png",
            style: `width:26px; height:26px;display: block;
                        margin-left: auto;margin-right: auto;
                        margin-top: 0.3em; cursor: pointer;`,
            alt: "تعديل بيانات المخزن",
            title: "تعديل بيانات المخزن",
            onclick: "prepareEditUserDialog('" + element.Name + "')"
        });
        document.addElement(td2, "img", {
            src: "/www/res/images/icons/icons8_remove_48px.png",
            style: `width:26px; height:26px;display: block;
                        margin-left: auto;margin-right: auto;
                        margin-top: 0.3em;`+ (document.CurrentUser.PermissionCode == 0 ? " cursor: pointer;" : "filter: grayscale(100%);cursor: not-allowed;"),
            alt: "حذف المخزن",
            title: "حذف المخزن",
            onclick: (document.CurrentUser.PermissionCode == 0) ? "removeStore('" + element.Name + "')" : ""
        });
        table.appendChild(tr);
    });
}
async function prepareEditUserDialog(storeName) {
    const form = document.forms["form_store"];
    if (storeName == null) {
        form.reset();
        form.elements["store_address"] = "الحقل فارغ";
        document.getElementById("store_userdialog_title").textContent = "إضافة مخزن";
        storeUserDialog.querySelector("button#submitButton").setAttribute('onclick', 'addStore()');
    }
    else {
        let store = LoadedStores.filter(s => s.Name == storeName);
        if (store == null || store.length == 0) return;

        store = store[0];
        document.getElementById("store_userdialog_title").textContent = "تعديل بيانات مخزن";

        form.elements["store_name"].value = store.Name;
        form.elements["store_name"].setAttribute("old-name", store.Name);
        form.elements["store_address"].value = store.Address;
        form.elements["store_type"].value = store.Type;
        let options = form.elements["store_type"].options;
        for (let option in options) {
            if (options[option].value == store.Type) {
                options[option].selected = true;
                break;
            }
        }
        form.elements["store_active_state"].value = store.Active;
        storeUserDialog.querySelector("button#submitButton").setAttribute('onclick', 'editStore()');

        let promise = await results;
        promise.Revalidate();
    }

    document.closeAllOpenUserDialogs();
    document.toggleShowHideOfUserDialog(storeUserDialog, "show");
}
async function loadStores() {
    document.requestService({ Task: "load_store", All: true }, async data => {
        LoadedStores = data.Message;
        await displayStores();
    });
}

async function editStore() {
    let promise = await results;
    await promise.Revalidate();
    let r = promise.Result;
    if (r.filter(row => row.State == false).length > 0) {
        return;
    } else {
        const form = document.forms['form_store'];
        const formdata = new FormData(form);
        formdata.append("Task", "edit_store");
        formdata.append("OldName", form.elements["store_name"].getAttribute("old-name"));
        await document.requestServiceForForm(formdata, async data => {
            promise.Reset();
            form.reset();
            alert(data.Message);
            document.toggleShowHideOfUserDialog(storeUserDialog, 'hide');
            await loadStores();
        });
    }
}

async function removeStore(storeName) {
    document.requestService({ Task: "remove_store", Name: storeName }, async data => {
        await loadStores();
    });
}




var validationMap = [
    {
        Input: "store_name",
        ValidateWhen: "input",
        async Validator(v) {
            if (v.length < 1 || v.length > 30)
                return [false, "القيمة المدخله يجب ان تتكون من 1 الى 30 حرف كحد اقصى"];
            else if (!document.validateName(v))
                return [false, "القيمة المدخله لا يمكن ان تحتوي على أحرف خاصة كـ علامات الترقيم والاستفهام وغيرها."];
            return [true, v];
        },
    },
    {
        Input: "store_address",
        ValidateWhen: "input",
        async Validator(v) {
            if (v.length < 4 || v.length > 45)
                return [false, "القيمة المدخله يجب ان تتكون من 4 الى 45 حرف كحد اقصى"];
            else if (!document.validateName(v))
                return [false, "القيمة المدخله لا يمكن ان تحتوي على أحرف خاصة كـ علامات الترقيم والاستفهام وغيرها."];
            return [true, v];
        },
    },
    {
        Input: "store_active_state",
        ValidateWhen: "change",
        async Validator(v, element) {
            if (v == "" || element.selectedOptions.length == 0)
                return [false, "يجب اختيار قيمة اولا"];
            return [true, v];
        },
    },
    {
        Input: "store_type",
        ValidateWhen: "change",
        async Validator(v, element) {
            if (v == "" || element.selectedOptions.length == 0)
                return [false, "يجب اختيار قيمة اولا"];
            return [true, v];
        },
    },
];

var results = document.validateInput(validationMap, document.querySelector("#submitButton"));



(async () => {

    let user = sessionStorage.getItem("user");
    if (user == null)
        location.href = "/www/html/login.html"
    let userData = JSON.parse(user);
    if (typeof container === 'undefined') {
        location.href = "/www/html/" + userData.Page;
    }

    await loadStores();

})();