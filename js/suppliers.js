var supplierDialog = document.querySelector("div#suppliers_userdialog");
var Suppliers = [];



async function addSupplier() {
    let promise = await results;
    await promise.Revalidate();
    let r = promise.Result;
    if (r.filter(row => row.State == false).length > 0) {
        return;
    } else {
        const form = document.forms['form_supplier'];
        const formdata = new FormData(form);
        formdata.append("Task", "add_supplier");
        formdata.append("Username", document.CurrentUser.Username);
        await document.requestServiceForForm(formdata, async data => {
            promise.Reset();
            form.reset();
            alert(data.Message);
            document.toggleShowHideOfUserDialog(supplierDialog, 'hide');
            await loadSuppliers();
        });
    }
}
async function prepareEditSupplierDialog(id) {
    let element = {
        Id: supplierDialog.querySelector("input[name='id_suppliers_userdialog']"),
        EName: supplierDialog.querySelector("input[name='suppname_suppliers_userdialog']"),
        JobTitle: supplierDialog.querySelector("input[name='jobtitle_suppliers_userdialog']"),
        Company: supplierDialog.querySelector("input[name='company_suppliers_userdialog']"),
        Phone: supplierDialog.querySelector("input[name='phone_suppliers_userdialog']"),
        Email: supplierDialog.querySelector("input[name='email_suppliers_userdialog']"),
        Address: supplierDialog.querySelector("input[name='address_suppliers_userdialog']"),
        Active: supplierDialog.querySelector("select[name='activestate_suppliers_userdialog']")
    }
    if (id == null) {
        // prepare for add supplier
        element.EName.value = "";
        element.JobTitle.value = "";
        element.Company.value = "";
        element.Phone.value = "";
        element.Email.value = "no-mail@domain.com";
        element.Address.value = "";
        element.Id.parentElement.setAttribute("hidden", "");
        document.getElementById("supplier_userdialog_title").textContent = "إضافة مورد";
        supplierDialog.querySelector("button#submitButton").setAttribute('onclick', 'addSupplier()');
    }
    else {
        // prepare for add supplier
        let supplier = Suppliers.filter(f => f.Id == id);
        if (supplier == null || supplier.length == 0) return;

        supplier = supplier[0];
        element.Id.value = supplier.Id;
        element.EName.value = supplier.EName;
        element.JobTitle.value = supplier.JobTitle;
        element.Company.value = supplier.Company;
        element.Phone.value = supplier.Phone;
        element.Email.value = supplier.Email;
        element.Address.value = supplier.Address;
        element.Active.value = supplier.Active;
        supplierDialog.querySelector("button#submitButton").setAttribute('onclick', 'editSupplier()');

        document.getElementById("supplier_userdialog_title").textContent = "تعديل بيانات مورد";
        let promise = await results;
        promise.Revalidate();

        element.Id.parentElement.removeAttribute("hidden");
    }

    document.toggleShowHideOfUserDialog(supplierDialog, "show");
}
async function editSupplier() {
    let promise = await results;
    await promise.Revalidate();
    let r = promise.Result;
    if (r.filter(row => row.State == false).length > 0) {
        return;
    } else {
        const form = document.forms['form_supplier'];
        const formdata = new FormData(form);
        formdata.append("Task", "edit_supplier");

        await document.requestServiceForForm(formdata, async data => {
            promise.Reset();
            form.reset();
            alert(data.Message);
            document.toggleShowHideOfUserDialog(supplierDialog, "hide");
            await loadSuppliers();
        });
    }
}
async function removeSupplier(id) {
    let requestPayload = {
        Task: "remove_supplier",
        Id: id
    };

    document.requestService(requestPayload, async data => {
        alert(data.Message);
        await loadSuppliers();
    });
}
async function loadSuppliers() {
    let requestPayload = {
        Task: "load_supplier",
        All: true
    };

    document.requestService(requestPayload, async data => {
        Suppliers = data.Message;
        await displaySuppliers();
    });
}
async function displaySuppliers() {
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
                        <td>الديون</td>
                        <td>الحالة / مفعل</td>
                        <td>تاريخ التسجيل</td>
                        <td>بواسطة</td>
                        <td></td>
                        <td></td>
                       </tr>`;

    Suppliers.forEach(supplier => {
        let tr = document.createChild("tr", {});
        document.addElement(tr, "td", { text: supplier.Id, style: "display:none" });
        document.addElement(tr, "td", { text: supplier.EName });
        document.addElement(tr, "td", { text: supplier.JobTitle });
        document.addElement(tr, "td", { text: supplier.Company });
        document.addElement(tr, "td", { text: supplier.Address });
        document.addElement(tr, "td", { text: supplier.Phone });
        document.addElement(tr, "td", { text: supplier.Email });
        document.addElement(tr, "td", { text: 0 + " د.ل" });
        document.addElement(tr, "td", { text: supplier.Active == 1 ? "نعم" : "لا" });
        document.addElement(tr, "td", { text: supplier.Creationdate });
        document.addElement(tr, "td", { text: supplier.Addedby });

        let td1 = document.createChild("td", {});
        let td2 = document.createChild("td", {});
        tr.appendChild(td1);
        tr.appendChild(td2);
        document.addElement(td1, "img", {
            src: "/www/res/images/icons/icons8_edit_property_48px.png",
            style: `width:26px; height:26px;display: block;
                        margin-left: auto;margin-right: auto;
                        margin-top: 0.3em; cursor: pointer;`,
            alt: "تعديل بيانات المورد",
            title: "تعديل بيانات المورد",
            onclick: "prepareEditSupplierDialog(" + supplier.Id + ")"
        });
        document.addElement(td2, "img", {
            src: "/www/res/images/icons/icons8_remove_48px.png",
            style: `width:26px; height:26px;display: block;
                        margin-left: auto;margin-right: auto;
                        margin-top: 0.3em;`+ (document.CurrentUser.PermissionCode == 0 ? " cursor: pointer;" : "filter: grayscale(100%);cursor: not-allowed;"),
            alt: "حذف المورد",
            title: "حذف المورد",
            onclick: (document.CurrentUser.PermissionCode == 0) ? "removeSupplier(" + supplier.Id + ")" : ""
        });
        table.appendChild(tr);
    });
}








var validationMap = [
    {
        Input: "suppname_suppliers_userdialog",
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
        Input: "jobtitle_suppliers_userdialog",
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
        Input: "company_suppliers_userdialog",
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
        Input: "phone_suppliers_userdialog",
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
        Input: "email_suppliers_userdialog",
        ValidateWhen: "input",
        async Validator(v) {
            if (v == "")
                return [true, v];
            else if (!document.validateEmail(v))
                return [false, "البريد الالكتروني غير صحيح"];
            return [true, v];
        },
    },
    {
        Input: "address_suppliers_userdialog",
        ValidateWhen: "input",
        async Validator(v) {
            if (v.length < 4 || v.length > 90)
                return [false, "القيمة المدخله يجب ان تتكون من 4 الى 90 حرف"];
            return [true, v];
        },
    },
    {
        Input: "activestate_suppliers_userdialog",
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


    await loadSuppliers();
})();