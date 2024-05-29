var PaymentOptions = [];
var paymentDialog = document.querySelector("div#paymentoptions_userdialog");
var PaymentMethodsDialog = {
    Title: paymentDialog.querySelector("h4#paymentmethods_title"),
    OldName: paymentDialog.querySelector("input[name='oldname_paymentmethod_dialog']"),
    Name: paymentDialog.querySelector("input[name='name_paymentmethod_dialog']"),
    Provider: paymentDialog.querySelector("input[name='provider_paymentmethod_dialog']"),
    AddedValue: paymentDialog.querySelector("input[name='addedvalue_paymentmethod_dialog']"),
    IsPercentage: paymentDialog.querySelector("select[name='ispercentage_paymentmethod_dialog']"),
    Active: paymentDialog.querySelector("select[name='active_paymentmethod_dialog']"),
    SaveButton: paymentDialog.querySelector("button#okbutton_paymentmethod_dialog")
}
async function removePaymentMethod(name) {
    document.requestService({ Task: "remove_paymentmethod", Name: name }, async data => {
        alert(data.Message);
        await loadPaymentOptions();
    });
}
async function prepareForEditing(name) {
    if (name == null) {
        PaymentMethodsDialog.SaveButton.onclick = async () => { await addPaymentMethod(); }
        PaymentMethodsDialog.Name.value = "";
        PaymentMethodsDialog.Provider.value = "";
        PaymentMethodsDialog.AddedValue.value = "";
        PaymentMethodsDialog.IsPercentage.value = 1;
        PaymentMethodsDialog.Active.value = 1;
        PaymentMethodsDialog.OldName.value = "";
        PaymentMethodsDialog.Title.textContent = "اضافة طريقة دفع";
    }
    else {
        // for editing..
        let paymentOption = PaymentOptions.filter(m => m.Name === name);
        if (paymentOption == null || paymentOption.length == 0) return;

        paymentOption = paymentOption[0];
        PaymentMethodsDialog.OldName.value = paymentOption.Name;
        PaymentMethodsDialog.SaveButton.onclick = async () => { await editPaymentMethod(); }
        PaymentMethodsDialog.Name.value = paymentOption.Name;
        PaymentMethodsDialog.Provider.value = paymentOption.Provider;
        PaymentMethodsDialog.AddedValue.value = paymentOption.Addedvalue;
        PaymentMethodsDialog.IsPercentage.value = paymentOption.Ispercentage;
        PaymentMethodsDialog.Active.value = paymentOption.Active;
        PaymentMethodsDialog.Title.textContent = "تعديل بيانات طريقة دفع";
        
        let promise = await results;
        promise.Revalidate();
    }

    document.toggleShowHideOfUserDialog(paymentDialog, 'show');
}
async function addPaymentMethod() {
    let promise = await results;
    await promise.Revalidate();
    let r = promise.Result;
    if (r.filter(row => row.State == false).length > 0) {
        return;
    }

    if(PaymentOptions.filter(p => p.Name == PaymentMethodsDialog.Name.value.trim()).length > 0) {
        alert("طريقة الدفع هذه موجودة");
        return;
    }
    let requestPayload = {
        Task: "add_paymentmethod",
        Username: document.CurrentUser.Username,
        Name: PaymentMethodsDialog.Name.value.trim(),
        Provider: PaymentMethodsDialog.Provider.value.trim(),
        AddedValue: PaymentMethodsDialog.AddedValue.value,
        IsPercentage: PaymentMethodsDialog.IsPercentage.value,
        Active: PaymentMethodsDialog.Active.value
    };

    document.requestService(requestPayload, async data => {
        alert(data.Message);
        await loadPaymentOptions();
        document.toggleShowHideOfUserDialog(paymentDialog, 'hide');
    })
}
async function editPaymentMethod() {
    let promise = await results;
    await promise.Revalidate();
    let r = promise.Result;
    if (r.filter(row => row.State == false).length > 0) {
        return;
    }

    if(PaymentOptions.filter(p => p.Name == PaymentMethodsDialog.Name.value.trim() 
                            && p.Name != PaymentMethodsDialog.OldName.value.trim()).length > 0) {
        alert("طريقة الدفع هذه موجودة");
        return;
    }
    let requestPayload = {
        Task: "edit_paymentmethod",
        Username: document.CurrentUser.Username,
        Name: PaymentMethodsDialog.OldName.value.trim(),
        NewName: PaymentMethodsDialog.Name.value.trim(),
        Provider: PaymentMethodsDialog.Provider.value.trim(),
        AddedValue: PaymentMethodsDialog.AddedValue.value,
        IsPercentage: PaymentMethodsDialog.IsPercentage.value,
        Active: PaymentMethodsDialog.Active.value
    };

    document.requestService(requestPayload, async data => {
        alert(data.Message);
        await loadPaymentOptions();
        document.toggleShowHideOfUserDialog(paymentDialog, 'hide');
    })
}
async function displayPaymentOptions() {
    let table_paymentmethods = document.getElementById("table_paymentmethods");
    table_paymentmethods.replaceChildren();
    table_paymentmethods.innerHTML = `<tr>
                                        <td>الاسم</td>
                                        <td>مزود الخدمة</td>
                                        <td>القيمة المضافة</td>
                                        <td>الزيادة بنسبة مئوية</td>
                                        <td>الحالة / مفعل</td>
                                        <td>تاريخ التسجيل</td>
                                        <td>بواسطة</td>
                                        <td></td>
                                        <td></td>
                                    </tr>`;
    PaymentOptions.forEach(m => {
        document.modifyElement(table_paymentmethods, {
            child: document.createChild("tr", {
                child: [
                    document.createChild("td", { text: m.Name }),
                    document.createChild("td", { text: m.Provider }),
                    document.createChild("td", { text: m.Ispercentage == 1 ? m.Addedvalue + " % " : m.Addedvalue + " د.ل " }),
                    document.createChild("td", { text: m.Ispercentage ? "نعم" : "لا" }),
                    document.createChild("td", { text: m.Active ? "نعم" : "لا" }),
                    document.createChild("td", { text: m.Creationdate }),
                    document.createChild("td", { text: m.Addedby }),
                    document.createChild("td", {
                        child: document.createChild("img", {
                            src: "/www/res/images/icons/icons8_edit_property_48px.png",
                            style: `width:26px; height:26px;display: block;
                        margin-left: auto;margin-right: auto;
                        margin-top: 0.3em; cursor: pointer;`,
                            alt: "تعديل بيانات طريقة الدفع",
                            title: "تعديل بيانات طريقة الدفع",
                            event: { onclick(self) { prepareForEditing(m.Name); } }
                        })
                    }),
                    document.createChild("td", {
                        child: document.createChild("img", {
                            src: "/www/res/images/icons/icons8_remove_48px.png",
                            style: `width:26px; height:26px;display: block;
                        margin-left: auto;margin-right: auto;
                        margin-top: 0.3em;`+ (document.CurrentUser.PermissionCode == 0 ? " cursor: pointer;" : "filter: grayscale(100%);cursor: not-allowed;"),
                            alt: "حذف طريقة الدفع",
                            title: "حذف طريقة الدفع",
                            event: { onclick(self) { if (document.CurrentUser.PermissionCode == 0) removePaymentMethod(m.Name); } }
                        })
                    })
                ]
            })
        });
    });
}

async function loadPaymentOptions() {
    document.requestService({ Task: "load_paymentmethod", All: true }, async data => {
        PaymentOptions = data.Message;
        await displayPaymentOptions();
    });
}



/*








*/
var validationMap = [
    {
        Input: "name_paymentmethod_dialog",
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
        Input: "provider_paymentmethod_dialog",
        ValidateWhen: "input",
        async Validator(v) {
            if (v.length < 2 || v.length > 45)
                return [false, "القيمة المدخله يجب ان تتكون من 2 الى 45 حرف كحد اقصى"];
            else if (!document.validateName(v))
                return [false, "القيمة المدخله لا يمكن ان تحتوي على أحرف خاصة كـ علامات الترقيم والاستفهام وغيرها."];
            return [true, v];
        },
    },
    {
        Input: "addedvalue_paymentmethod_dialog",
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
        Input: "ispercentage_paymentmethod_dialog",
        ValidateWhen: "change",
        async Validator(v, element) {
            if (v == "" || element.selectedOptions.length == 0)
                return [false, "يجب اختيار قيمة اولا"];
            return [true, v];
        },
    },
    {
        Input: "active_paymentmethod_dialog",
        ValidateWhen: "change",
        async Validator(v, element) {
            if (v == "" || element.selectedOptions.length == 0)
                return [false, "يجب اختيار قيمة اولا"];
            return [true, v];
        },
    }
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

    await loadPaymentOptions();

})();