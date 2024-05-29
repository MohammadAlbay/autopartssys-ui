var addClientUserDialog = document.querySelector("div#clients_userdialog");
var Clients = [];

async function addClient() {
    let promise = await results;
    await promise.Revalidate();
    let r = promise.Result;
    if (r.filter(row => row.State == false).length > 0) {
        return;
    } else {
        const form = document.forms['form_client'];
        const formdata = new FormData(form);
        formdata.append("Task", "add_client");
        formdata.append("Username", document.CurrentUser.Username);
        await document.requestServiceForForm(formdata, async data => {
            promise.Reset();
            form.reset();
            alert(data.Message);
            document.toggleShowHideOfUserDialog(addClientUserDialog, "hide");
            await loadClients();
        });
    }


}

async function prepareEditClientDialog(id) {
    if (id == null) {
        document.getElementById("clients_userdialog_title").textContent = "إضافة عميل";
        addClientUserDialog.querySelector("button#submitButton").setAttribute('onclick', 'addClient()');
        document.forms['form_client'].reset();
        addClientUserDialog.querySelector("input[name='id_add_client_dialog']").parentElement.setAttribute('hidden', "");
        addClientUserDialog.querySelector("input[name='email_add_client_dialog']").value = "no-mail@domain.com";

        return;
    }
    let client = Clients.filter(c => c.Id == id);
    if (client == null || client.length == 0) return;
    client = client[0];

    let elements = {
        Id: addClientUserDialog.querySelector("input[name='id_add_client_dialog']"),
        EName: addClientUserDialog.querySelector("input[name='clientname_add_client_dialog']"),
        JobTitle: addClientUserDialog.querySelector("input[name='jobtitle_add_client_dialog']"),
        Company: addClientUserDialog.querySelector("input[name='company_add_client_dialog']"),
        Phone: addClientUserDialog.querySelector("input[name='phone_add_client_dialog']"),
        Email: addClientUserDialog.querySelector("input[name='email_add_client_dialog']"),
        MaxDebt: addClientUserDialog.querySelector("input[name='maxdebt_add_client_dialog']"),
        Address: addClientUserDialog.querySelector("input[name='address_add_client_dialog']"),
        Active: addClientUserDialog.querySelector("select[name='activestate_add_client_dialog']"),
    };

    elements.Id.parentElement.removeAttribute('hidden');
    //set valeus
    elements.Id.value = client.Id;
    elements.EName.value = client.EName;
    elements.Company.value = client.Company;
    elements.Address.value = client.Address;
    elements.Phone.value = client.Phone;
    elements.Email.value = client.Email;
    elements.MaxDebt.value = client.MaxDebt;
    elements.JobTitle.value = client.JobTitle;
    elements.Active.value = client.Active;

    document.getElementById("clients_userdialog_title").textContent = "تعديل بيانات عميل";
    let promise = await results;
    promise.Revalidate();
    addClientUserDialog.querySelector("button#submitButton").setAttribute('onclick', 'editClient()');
    document.toggleShowHideOfUserDialog(addClientUserDialog, 'show');
}
async function editClient() { // 
    let promise = await results;
    await promise.Revalidate();
    let r = promise.Result;
    if (r.filter(row => row.State == false).length > 0) {
        return;
    } else {
        const form = document.forms['form_client'];
        const formdata = new FormData(form);
        formdata.append("Task", "edit_client");

        await document.requestServiceForForm(formdata, async data => {
            promise.Reset();
            form.reset();
            alert(data.Message);
            document.toggleShowHideOfUserDialog(addClientUserDialog, "hide");
            await loadClients();
        });
    }

}

async function removeClient(id) {
    let requestPayload = {
        Task: "remove_client",
        Id: id
    };

    if (!confirm("هل انت متأكد من رغبتك في حذف هذا العميل ؟ عملية حذفك للعميل تعني ان كل البيانات المتعلقة به سيتم حذفها تلقائيا")) return;
    document.requestService(requestPayload, async data => {
        alert(data.Message);
        await loadClients();
    });
}
async function loadClients() {

    let requestPayload = {
        Task: "load_client", All: true
    };

    document.requestService(requestPayload, async data => {
        Clients = data.Message;
        await displayClients();
    });
}

async function displayClients() {
    let table = document.querySelector("table#table_clients");
    table.replaceChildren();
    table.innerHTML = `<tr>
                        <td style="display: none">#</td>
                        <td>اسم موظف الشركة</td>
                        <td>المسمى الوظيفي</td>
                        <td>الشركة</td>
                        <td>العنوان</td>
                        <td>رقم الهاتف</td>
                        <td>البريد الالكتروني</td>
                        <td>سقف الديون</td>
                        <td>الديون</td>
                        <td>الحالة / مفعل</td>
                        <td>تاريخ التسجيل</td>
                        <td>بواسطة</td>
                        <td></td>
                        <td></td>
                       </tr>`;

    Clients.forEach(client => {
        let tr = document.createChild("tr", {});
        document.addElement(tr, "td", { text: client.Id, style: "display:none" });
        document.addElement(tr, "td", { text: client.EName });
        document.addElement(tr, "td", { text: client.JobTitle });
        document.addElement(tr, "td", { text: client.Company });
        document.addElement(tr, "td", { text: client.Address });
        document.addElement(tr, "td", { text: client.Phone });
        document.addElement(tr, "td", { text: client.Email });
        document.addElement(tr, "td", { text: client.MaxDebt + " د.ل" });
        document.addElement(tr, "td", { text: client.TotalRequired + " د.ل" });
        document.addElement(tr, "td", { text: client.Active == 1 ? "نعم" : "لا" });
        document.addElement(tr, "td", { text: client.Creationdate });
        document.addElement(tr, "td", { text: client.Addedby });

        let td1 = document.createChild("td", {});
        let td2 = document.createChild("td", {});
        tr.appendChild(td1);
        tr.appendChild(td2);
        document.addElement(td1, "img", {
            src: "/www/res/images/icons/icons8_edit_property_48px.png",
            style: `width:26px; height:26px;display: block;
                        margin-left: auto;margin-right: auto;
                        margin-top: 0.3em; cursor: pointer;`,
            alt: "تعديل بيانات العميل",
            title: "تعديل بيانات العميل",
            onclick: "prepareEditClientDialog(" + client.Id + ")"
        });
        document.addElement(td2, "img", {
            src: "/www/res/images/icons/icons8_remove_48px.png",
            style: `width:26px; height:26px;display: block;
                        margin-left: auto;margin-right: auto;
                        margin-top: 0.3em;`+ (document.CurrentUser.PermissionCode == 0 ? " cursor: pointer;" : "filter: grayscale(100%);cursor: not-allowed;"),
            alt: "حذف العميل",
            title: "حذف العميل",
            onclick: (document.CurrentUser.PermissionCode == 0) ? "removeClient(" + client.Id + ")" : ""
        });
        table.appendChild(tr);
    });
}


var validationMap = [
    {
        Input: "clientname_add_client_dialog",
        ValidateWhen: "input",
        async Validator(v) {
            if (v.length < 4 || v.length > 60)
                return [false, "القيمة المدخله يجب ان تتكون من 4 الى 60 حرف كحد اقصى"];
            else if (!document.validateName(v))
                return [false, "القيمة المدخله لا يمكن ان تحتوي على أحرف خاصة كـ علامات الترقيم والاستفهام وغيرها."];
            return [true, v];
        },
    },
    {
        Input: "jobtitle_add_client_dialog",
        ValidateWhen: "input",
        async Validator(v) {
            if (v.length < 4 || v.length > 60)
                return [false, "القيمة المدخله يجب ان تتكون من 4 الى 60 حرف كحد اقصى"];
            else if (!document.validateName(v))
                return [false, "القيمة المدخله لا يمكن ان تحتوي على أحرف خاصة كـ علامات الترقيم والاستفهام وغيرها."];
            return [true, v];
        },
    },
    {
        Input: "company_add_client_dialog",
        ValidateWhen: "input",
        async Validator(v) {
            if (v.length < 4 || v.length > 60)
                return [false, "القيمة المدخله يجب ان تتكون من 4 الى 60 حرف كحد اقصى"];
            else if (!document.validateName(v))
                return [false, "القيمة المدخله لا يمكن ان تحتوي على أحرف خاصة كـ علامات الترقيم والاستفهام وغيرها."];
            return [true, v];
        },
    },
    {
        Input: "phone_add_client_dialog",
        ValidateWhen: "input",
        async Validator(v) {
            if (v.includes(" ")) {
                let err = false;
                v.split(" ").forEach(n => {
                    if (!document.validatePhoneNumber(n))
                        err = true;
                });
                if (err)
                    return [false, "رقم الهاتف المدخل غير صحيح"];
            }
            else if (!document.validatePhoneNumber(v))
                return [false, "رقم الهاتف المدخل غير صحيح"];
            return [true, v];
        },
    },
    {
        Input: "email_add_client_dialog",
        ValidateWhen: "input",
        async Validator(v) {
            if (v == "")
                return [true, v];
            else if (!document.validateEmail(v))
                return [false, "البريد الالكرتوني غير صحيح"];
            return [true, v];
        },
    },
    {
        Input: "maxdebt_add_client_dialog",
        ValidateWhen: "input",
        async Validator(v) {
            try {
                v = parseFloat(v);
                if (v < -1 || isNaN(v))
                    return [false, "القيمة يجب ان تكون اكبر او تساوي 0"];
                return [true, v];
            } catch {
                return [false, "القيمة يجب ان تكون رقمية وتقبل الاعداد فقط"];
            }
        },
    },
    {
        Input: "address_add_client_dialog",
        ValidateWhen: "input",
        async Validator(v) {
            if (v.length < 4 || v.length > 90)
                return [false, "القيمة المدخله يجب ان تتكون من 4 الى 90 حرف"];
            return [true, v];
        },
    },
    {
        Input: "activestate_add_client_dialog",
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

    if (document.currentView == null) {
        location.href = "/www/html/" + userData.Page
    }
    else if (!document.currentView.isViewEmbedded) {
        let user = sessionStorage.getItem("user");
        if (user == null)
            location.href = "/www/html/login.html"
        let userData = JSON.parse(user);
        if (typeof container === 'undefined') {
            location.href = "/www/html/" + userData.Page;
        }
    }

    await loadClients();
})();