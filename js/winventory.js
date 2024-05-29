var WI = [];
var SearchedItems = [];



async function loadWI() {
    await document.requestService({ Task: "load_warhouseinventory" }, async data => {
        WI = data.Message;
        displayWI(WI);
    });
}

async function addWI(p) {
    let year = p ?? new Date().getFullYear();
    await document.requestService({ Task: "add_warhouseinventory", Year: year }, async data => {
        alert(data.Message);
        await loadWI();
    });
}
async function manualAddWI() {
    let value = prompt("ادخال العام الذي تريد انشاء ملف للجرد (ملاحظة العام الحالي ينشئ ملف للعام القادم)");
    if (value == "") return;

    await addWI(value);
}
async function displayWI() {
    const table = document.querySelector("table#table_winventory");
    table.replaceChildren();
    table.innerHTML = `<tr>
    <td>#</td>
    <td>عام الجرد</td>
    <td>المخازن الغير مجرودة</td>
    <td>تاريخ التسجيل</td>
    <td></td>
    </tr>`;
    WI.forEach((w, i) => {
        document.modifyElement(table, {
            child: document.createChild("tr", {
                child: [
                    document.createChild("td", { text: i + 1 }),
                    document.createChild("td", { text: w.Id }),
                    document.createChild("td", { text: " لا يوجد" }),
                    document.createChild("td", { text: w.Creationdate }),
                    document.createChild("td", {
                        child: document.createChild("img", {
                            src: "/www/res/images/icons/icons8_edit_property_48px.png",
                            style: `width:26px; height:26px;display: block;
                                        margin-left: auto;margin-right: auto;
                                        margin-top: 0.3em; cursor: pointer;`,
                            alt: "تعديل بيانات المخزن",
                            title: "تعديل بيانات المخزن",
                            onclick: `showWIScreen(${w.Id})`
                        })
                    })
                ]
            })
        })
    });
}

async function showWIScreen(id) {

}


async function searchItem() {
    const form = document.forms["wi_form"];
    const searchText = form.elements["searchvalue"];
    const storeSelect = form.elements["store"];

    if(!document.validateName(searchText.value)) {
        alert("error");
        return;
    }
    if(storeSelect.value == "") {
        alert("error2");
        return;
    }
    let formdata = new FormData();
    formdata.append("Task", "searchitems_cashiersystem");
    formdata.append("SearchValue", searchText.value);
    formdata.append("Store", storeSelect.value);
    formdata.append("Category", "all");
    document.requestServiceForForm(formdata, async data => {
        SearchedItems = data.Message;
        await displaySearchedItems();
    });
}
async function displaySearchedItems() {
    const table = document.getElementById("searched_item_table");
    table.replaceChildren();
    table.innerHTML = `<tr>
    <td>#</td>
    <td>الاسم</td>
    <td>الكود</td>
    <td>الباركود </td>
    <td></td>
</tr>`;

    SearchedItems.forEach(item => {
        document.addElement(table, "tr", {
            child: [
                document.createChild("td", {text: item.Id}),
                document.createChild("td", {text: item.Fullname}),
                document.createChild("td", {text: item.Code}),
                document.createChild("td", {text: item.Barcode}),
                document.createChild("td", {
                    child: document.createChild("img", {
                        src: "/www/res/images/icons/icons8_done_96px.png",
                        style: `width:26px; height:26px;display: block;
                        margin-left: auto;margin-right: auto;
                        margin-top: 0.3em; cursor: pointer;`,
                        event: {
                            async onclick(self) {
                                let q = prompt("ادخل الكمية الفعلية للصنف");
                                if(q == "القيمة يجب ان تكون عددية") {
                                    alert(""); return;
                                }
                                q = parseInt(q);
                                
                            }
                        }
                    })
                })
            ]
        });
    });
}


(async () => {

    let user = sessionStorage.getItem("user");
    if (user == null)
        location.href = "/www/html/login.html"
    let userData = JSON.parse(user);
    if (typeof container === 'undefined') {
        location.href = "/www/html/" + userData.Page;
    }

    // if (document.CurrentUser.PermissionCode > 5) {
    //     document.querySelector("#produc_add_product").remove();
    // }

    await loadWI();

    const storeSelect = document.forms["wi_form"].elements["store"];
    storeSelect.replaceChildren();
    //document.addElement(storeSelect, "option", {text: "الكل", value: "all"}); 
    let stores = await document.loadAllStores();
    stores.forEach(async store => {
        document.addElement(storeSelect, "option", { text: store.Name, value: store.Name });
    });
})();