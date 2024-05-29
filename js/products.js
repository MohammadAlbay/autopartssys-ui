var categoryUserDialog = document.querySelector("div#category_userdialog");
var productUserDialog = document.querySelector("div#product_userdialog");
var producImageUserDialog = document.querySelector("div#productimage_userdialog");
var productMatchedCarsUserDialog = document.querySelector("div#matchedcars_dialog");
var measuringUnitUserDialog = document.querySelector("div#measuringunit_view");
var categoryFullView = document.querySelector("div#fullview_category");
var LoadedCategories = [];
var Items = [];
var MeasuringUnits = [];
var MatchedCars = [];

function showItemImageDialog(img) {
    if (img == undefined || img === "") return;
    document.getElementById("image_productimage_userdialog").src = img;
    document.toggleShowHideOfUserDialog(producImageUserDialog, "show");
}
async function displayProduct() {
    let table = document.querySelector("table#table_items");
    table.replaceChildren();
    table.innerHTML = `<tr>
                            <td>#</td>
                            <td>الاسم</td>
                            <td>المصنع</td>
                            <td>الكود</td>
                            <td>الباركود</td>
                            <td>س. بيع</td>
                            <td>س. شراء</td>
                            <td>س. الجملة</td>
                            <td>المخزن</td>
                            <td>الفئة</td>
                            <td>الكمية</td>
                            <td>الحالة مفعل</td>
                            <td style="display:none">بواسطة</td>
                            <td>بتاريخ</td>
                            <td></td>
                            <td></td>
                        </tr>`;
    Items.forEach((item, index) => {
        let tr = document.createChild("tr", {});
        document.addElement(tr, "td", { text: item.Id });
        document.addElement(tr, "td", {
            text: item.Fullname, class: "product_link",
            title: "انقر على اسم الصنف لفتح واجهة التعديل", onclick: "searchedItemShowMenu(event," + index + ")"
        });
        document.addElement(tr, "td", { text: item.Company, style: "font-size: 10pt" });
        document.addElement(tr, "td", { text: item.Code, style: "font-size: 10pt" });
        document.addElement(tr, "td", { text: item.Barcode, style: "font-size: 10pt" });
        document.addElement(tr, "td", { text: item.SPrice + " د.ل" });
        document.addElement(tr, "td", { text: item.BPrice + " د.ل" });
        document.addElement(tr, "td", { text: item.WPrice + " د.ل" });
        document.addElement(tr, "td", { text: item.Store, style: "font-size: 10pt" });
        document.addElement(tr, "td", { text: item.Category, style: "font-size: 10pt" });
        document.addElement(tr, "td", { text: item.Quantity });
        document.addElement(tr, "td", { text: item.Active == 1 ? "نعم" : "لا" });
        document.addElement(tr, "td", { text: item.Addedby, style: "display:none" });
        document.addElement(tr, "td", { text: item.Creationdate, style: "font-size: 10pt" });
        if (item.Image !== "") {
            document.addElement(tr, "td", {
                child: document.createChild("img", {
                    src: "/www/res/images/icons/icons8_full_image_96px.png",
                    style: `width:26px; height:26px;display: block;
                            margin-left: auto;margin-right: auto;
                            margin-top: 0.3em; cursor: pointer;`,
                    event: {
                        onclick(self) {
                            showItemImageDialog(item.Image);
                            //alert("image clicked:"+item.Image);
                        }
                    }
                })
            })
        } else {
            document.addElement(tr, "td", {});
        }

        let td2 = document.createChild("td", {});
        document.addElement(td2, "img", {
            src: "/www/res/images/icons/icons8_remove_48px.png",
            style: `width:26px; height:26px;display: block;
                        margin-left: auto;margin-right: auto;
                        margin-top: 0.3em;`+ (document.CurrentUser.PermissionCode == 0 ? " cursor: pointer;" : "filter: grayscale(100%);cursor: not-allowed;"),
            alt: "حذف الصنف",
            title: "حذف الصنف",
            event: {
                onclick(self) {
                    if (document.CurrentUser.PermissionCode == 0) {
                        if (confirm("هل انت متأكد من رغبتك في حذف الصنف ؟"))
                            removeProduct(index);
                    }
                }
            }
        });

        tr.appendChild(td2);
        table.appendChild(tr);
    });
}
function searchedItemShowMenu(event, index) {

    if (index < 0) return;
    let item = Items[index];
    if (item == null) return;
    let menu = MenuManager.GetMenu('Item-Menu');
    menu.setAttribute("item-index", index);

    MenuManager.ShowMenuAtPosition(menu, event.pageX-90, event.pageY - 90);
}
async function prepareMatchedCarsDialog(item) {
    await loadMatchedCars(item.Id);
    document.querySelector("button#matchedcars_add_button").onclick = async (e) => {
        let value = prompt("ادخل اسم المركبة ");
        if (value == null || value == "" || !document.validateName(value)) {
            alert("القيمة غير صحيحة");
            return;
        }

        await addMatchedCar(item.Id, value);
    };
    document.toggleShowHideOfUserDialog(productMatchedCarsUserDialog, "show");
}
async function loadMatchedCars(itemId) {
    await document.requestService({ Task: "load_matchedcars", ItemId: itemId }, async data => {
        MatchedCars = data.Message;
        await displayMatchedCars(data.Message);
    });
}
async function displayMatchedCars(carsData) {
    let container = productMatchedCarsUserDialog.querySelector("div[full-content-container]");
    container.replaceChildren();
    container.innerHTML = '<h4 id="userdialog_category_title">المركبات المتوافقة </h4>';
    carsData.forEach(c => {
        document.modifyElement(container, {
            child: document.createChild("div", {
                class: "riched-content-card",
                child: [
                    document.createChild("font", { text: c.Car }),
                    document.createChild("font", { text: c.Addedby }),
                    document.createChild("font", {
                        text: "حذف", style: "cursor:pointer; color:red",
                        event: {
                            async onclick(self) {
                                await removeMatchedCar(c.Itemid, c.Car);
                            }
                        }
                    }),
                    document.createChild("font", { text: c.Creationdate }),
                    document.createChild("img", { src: "/www/res/images/icons/icons8_Car_96px.png" }),
                ]
            })
        });
    });
}
async function addMatchedCar(itemId, car) {
    if (MatchedCars.filter(c => c.Car == car && c.Itemid == itemId).length > 0) {
        alert("المركبة هذه مسجلة بالفعل");
        return;
    }
    await document.requestService({
        Task: "add_matchedcars",
        ItemId: itemId,
        car: car,
        Username: document.CurrentUser.Username
    }, async data => {
        alert(data.Message);
        await loadMatchedCars(itemId);
    })
}
async function removeMatchedCar(itemId, car) {
    if (!confirm("هل انت متأكد من رغبتك في حذف هذا بيانات المركبة المتوافقة " + car + "؟")) {
        return;
    }
    await document.requestService({
        Task: "remove_matchedcars",
        ItemId: itemId,
        car: car
    }, async data => {
        alert(data.Message);
        await loadMatchedCars(itemId);
    })
}
async function itemsMenuItemSelected(self, index) {
    let menu = MenuManager.GetMenu('Item-Menu');
    let itemIndex = index ?? parseInt(menu.getAttribute("item-index"));
    let item = Items[itemIndex];
    if (item == null) return;

    let menuItem = self?.getAttribute("name");
    switch (menuItem) {
        case "items_matched_cars":
            await prepareMatchedCarsDialog(item);
            break;
        case "items_show_profile":
            await prepareProductDialog(itemIndex);
            break;
        case "items_movdequantity":
            await moveQuantity(item);
        break;
    }
}
async function moveQuantity(item) {
    const store = prompt("ادخل اسم المخزن");
    const quantity = prompt("ادخل القيمة المراد تحويلها");

    let stores = await document.loadAllStores();
    if(stores.filter(s => s.Name == store).length == 0) {
        alert("المخزن غير موجود"); return;
    }
    if(quantity < 0) {
        alert("الكمية المراد تحويلها لا يمكن ان تكون سالبه "); return;
    }
    if(quantity > item.Quantity) {
        alert("الكمية المراد تحويلها اكبر من الكمية الموجودة"); return;
    }
    const requestPayload = {
        Task: "move_quantit_product",
        ItemId: item.Id,
        Store: item.Store,
        ToStore: store,
        MovedQuantity: quantity,
        Remain: item.Quantity - quantity
    }
    await document.requestService(requestPayload, async data => {
        await loadProduct();
    });
}
async function loadProduct(loadAllItems = false) {
    let searchFieldType = document.querySelector("div.searchbar > select[name='product_searchbar_searchfield_type_select']").value
    let requestPayload = {
        Task: "load_product",
        Active: document.querySelector("select#product_searchbar_active_select").value,
        Category: document.querySelector("select#product_searchbar_category_select").value,
        Store: document.querySelector("select#product_searchbar_store_select").value,
        AllowWholeSales: document.querySelector("select#product_searchbar_support_ws_select").value,
        Visible: document.querySelector("select#product_searchbar_visible_select").value,
    }
    if (searchFieldType !== "all" && searchFieldType !== "")
        requestPayload[searchFieldType] = document.querySelector("div.searchbar > input[name='product_searchbar_fieldvalue']").value;

    if (loadAllItems == true) {
        requestPayload = { Task: "load_product" };
    }
    else {
        if (requestPayload.Active == "all" || requestPayload.Active == "")
            delete requestPayload['Active'];
        if (requestPayload.Category == "all" || requestPayload.Category == "")
            delete requestPayload['Category'];
        if (requestPayload.Store == "all" || requestPayload.Store == "")
            delete requestPayload['Store'];
        if (requestPayload.AllowWholeSales == "all" || requestPayload.AllowWholeSales == "")
            delete requestPayload['AllowWholeSales'];
        if (requestPayload.Visible == "all" || requestPayload.Visible == "")
            delete requestPayload['Visible'];
    }
    await document.requestService(requestPayload, async data => {
        Items = data.Message;
        await displayProduct();
    });
}
function openProductUserDialog() {
    if (LoadedCategories == null || LoadedCategories.length == 0) {
        alert("لا يمكنك اضافة صنف بدون توفر فئات في النظام. قم بإضافة فئة اولا");
        return;
    }
    document.closeAllOpenUserDialogs();
    document.toggleShowHideOfUserDialog(productUserDialog, 'show');
}
async function removeProduct(index) {
    if (!confirm("هل انت متأكد من ")) return;
    if (index < 0) return;
    let itemRow = Items[index];
    if (itemRow == null) return;

    await document.requestService({ Task: "remove_product", Id: itemRow.Id }, async data => {
        alert(data.Message);
        await loadProduct(true);
    })
}
async function addProduct() {
    let promise = await results;
    await promise.Revalidate();
    let r = promise.Result;
    if (r.filter(row => row.State == false).length > 0) {
        return;
    } else {
        const form = document.forms['form_product'];
        const formdata = new FormData(form);
        formdata.append("Task", "add_product");
        formdata.append("Username", document.CurrentUser.Username);
        if (confirm("هل تريد اضافة صورة للصنف ؟")) {
            const pickerOpts = {
                types: [
                    {
                        description: "Images",
                        accept: {
                            "image/*": [".png", ".jpeg", ".jpg"],
                        },
                    },
                ],
                excludeAcceptAllOption: true,
                multiple: false,
            };

            const fileHandles = await window.showOpenFilePicker(pickerOpts);

            formdata.append("image", await fileHandles[0].getFile());
        }
        await document.requestServiceForForm(formdata, async data => {
            promise.Reset();
            form.reset();
            alert(data.Message);
            document.toggleShowHideOfUserDialog(productUserDialog, 'hide');
            await loadProduct();
        });
    }
}

async function editProduct() {
    let promise = await results;
    await promise.Revalidate();
    let r = promise.Result;
    if (r.filter(row => row.State == false).length > 0) {
        return;
    } else {
        const form = document.forms['form_product'];
        const formdata = new FormData(form);
        formdata.append("Task", "edit_product");
        formdata.append("Username", document.CurrentUser.Username);
        if (confirm("هل تريد تغيير صورة الصنف ؟")) {
            const pickerOpts = {
                types: [
                    {
                        description: "Images",
                        accept: {
                            "image/*": [".png", ".jpeg", ".jpg"],
                        },
                    },
                ],
                excludeAcceptAllOption: true,
                multiple: false,
            };

            const fileHandles = await window.showOpenFilePicker(pickerOpts);
            formdata.append("image", await fileHandles[0].getFile());
        }
        await document.requestServiceForForm(formdata, async data => {
            promise.Reset();
            form.reset();
            alert(data.Message);
            document.toggleShowHideOfUserDialog(productUserDialog, "hide");
            await loadProduct();
        });
    }
}

async function prepareProductDialog(index) {
    if (LoadedCategories == null || LoadedCategories.length == 0) {
        alert("لا يمكنك اضافة صنف بدون توفر فئات في النظام. قم بإضافة فئة اولا");
        return;
    }

    let submitButton = document.querySelector("button#submitButton");
    let titleH4 = document.querySelector("h4#product_useridalog_title");
    const form = document.forms["form_product"];

    if (index == undefined) {
        // for save
        titleH4.textContent = "اضافة صنف جديد";
        submitButton.textContent = "حفظ";
        submitButton.setAttribute("onclick", "addProduct()");

        form.reset();
        form.elements["id_product_dialog"].parentElement.setAttribute("hidden", "");
        form.elements["addedby_product_dialog"].parentElement.setAttribute("hidden", "");
        form.elements["quantity_product_dialog"].parentElement.setAttribute("hidden", "");
        form.elements["basequantity_product_dialog"].parentElement.setAttribute("hidden", "");
        form.elements["store_product_dialog"].parentElement.setAttribute("hidden", "");
        form.elements["visible_state_product_dialog"].parentElement.setAttribute("hidden", "");

        form.elements["active_state_product_dialog"].value = "1";
        form.elements["wholesale_support_product_dialog"].value = "1";
    }
    else {
        if (index < 0) return;
        let item = Items[index];
        if (item == null) return;
        // let item = Items.filter(c => c.Id == itemId);
        // if (item == null || item.length == 0) return;

        // item = item[0];

        form.elements["id_product_dialog"].parentElement.removeAttribute("hidden");
        form.elements["addedby_product_dialog"].parentElement.removeAttribute("hidden");
        form.elements["quantity_product_dialog"].parentElement.removeAttribute("hidden");
        form.elements["basequantity_product_dialog"].parentElement.removeAttribute("hidden");
        form.elements["store_product_dialog"].parentElement.removeAttribute("hidden");
        form.elements["visible_state_product_dialog"].parentElement.removeAttribute("hidden");

        form.elements["id_product_dialog"].value = item.Id;
        form.elements["addedby_product_dialog"].value = item.Addedby;
        form.elements["quantity_product_dialog"].value = item.Quantity;
        form.elements["basequantity_product_dialog"].value = item.BaseQuantity;
        form.elements["store_product_dialog"].value = item.Store;
        form.elements["visible_state_product_dialog"].value = item.Visible;

        form.elements["name_product_dialog"].value = item.Fullname;
        form.elements["company_product_dialog"].value = item.Company;
        form.elements["code_product_dailog"].value = item.Code;
        form.elements["barcode_product_dialog"].value = item.Barcode;
        form.elements["sprice_product_dialog"].value = item.SPrice;
        form.elements["bprice_product_dialog"].value = item.BPrice;
        form.elements["wprice_product_dialog"].value = item.WPrice;
        form.elements["wholesale_support_product_dialog"].value = item.AllowWholeSales;
        form.elements["category_product_dialog"].value = item.Category;
        form.elements["active_state_product_dialog"].value = item.Active;
        form.elements["measuringunit_product_dialog"].value = item.MeasuingUnit;

        [...form.elements["store_product_dialog"].options].forEach(o => {
            if (o.value === item.Store) o.selected = true;
        });
        [...form.elements["category_product_dialog"].options].forEach(o => {
            if (o.value === item.Category) o.selected = true;
        });
        [...form.elements["measuringunit_product_dialog"].options].forEach(o => {
            if (o.value == item.MeasuingUnit) o.selected = true;
        })
        titleH4.textContent = "تعديل بيانات صنف";
        submitButton.textContent = "حفظ التغييرات";
        submitButton.setAttribute("onclick", "editProduct()");

        let promise = await results;
        promise.Revalidate();
    }



    document.closeAllOpenPopups();
    document.toggleShowHideOfUserDialog(productUserDialog, "show");
}



//// ------------------------------------------------------------------------------------------------------------
//// ------------------------------------------------------------------------------------------------------------
//// ------------------------------------------------------------------------------------------------------------
//// ------------------------------------------------------------------------------------------------------------

async function removeCategory(categoryName) {
    if (LoadedCategories.length == 0) return;
    if (LoadedCategories.length == 1) {
        alert("لا يمكنك حذف اخر فئة. قم بإنشاء فئة اخرى وحاول مجددا");
        return;
    }
    if (!confirm("هل انت متأكد من رغبتك في حذف هذه الفئة")) return;

    await document.requestService({ Task: "remove_category", Name: categoryName }, async data => {
        alert(data.Message);
        await loadCategories();
    });
}
async function addCategory() {
    const name = document.querySelector("input[input][name='category_name']").value;
    if (LoadedCategories.filter(c => c.Name == name).length > 0) {
        alert("الفئة هذه مسجلة بالفعل");
        return;
    }
    let requestPayload = {
        Task: "add_category",
        Username: document.CurrentUser.Username,
        Name: name,
        Active: document.querySelector("select[input][name='userdialogcategory_activestate_select']").value
    };
    await document.requestService(requestPayload, async data => {
        alert(data.Message);
        document.toggleShowHideOfUserDialog(categoryUserDialog, 'hide');
        await loadCategories();
    });
}
async function editCategory(categoryName) {
    const name = document.querySelector("input[input][name='category_name']").value;
    // if(Categories.filter(c => c.Name == categoryName).length > 0) {
    //     alert("الفئة هذه مسجلة بالفعل");
    //     return;
    // }
    let requestPayload = {
        Task: "edit_category",
        Username: document.CurrentUser.Username,
        Name: categoryName,
        Newname: name,
        Active: document.querySelector("select[input][name='userdialogcategory_activestate_select']").value
    };
    await document.requestService(requestPayload, async data => {
        alert(data.Message);
        document.toggleShowHideOfUserDialog(categoryUserDialog, 'hide');
        await loadCategories();
    });
}

function prepareCategoryDialog(categoryName) {
    let submitButton = document.querySelector("button#userdialog_category_submit_button");
    let titleH4 = document.querySelector("h4#userdialog_category_title");
    let categoryNameInput = document.querySelector("input[input][name='category_name']");

    if (categoryName == undefined) {
        // for save
        titleH4.textContent = "اضافة فئة";
        categoryNameInput.value = "";
        submitButton.textContent = "حفظ";
        submitButton.setAttribute("onclick", "addCategory()");
    }
    else {
        // for edit
        let category = LoadedCategories.filter(c => c.Name == categoryName);
        if (category == null || category.length == 0) return;

        category = category[0];

        document.querySelector("select[input][name='userdialogcategory_activestate_select']").value = category.Active;
        titleH4.textContent = "تعديل فئة";
        categoryNameInput.value = category.Name;
        submitButton.textContent = "حفظ التغييرات";
        submitButton.setAttribute("onclick", "editCategory('" + categoryName + "')");
    }
}
async function generateRow(category, table) {
    let tr = document.createChild("tr", {});
    document.addElement(tr, "td", { text: category.Name });
    document.addElement(tr, "td", { text: category.ItemCount });
    document.addElement(tr, "td", { text: category.Active == 1 ? "نعم" : "لا" });
    document.addElement(tr, "td", { text: category.Addedby });
    document.addElement(tr, "td", { text: category.Creationdate });

    let td1 = document.createChild("td", {});
    let td2 = document.createChild("td", {});
    tr.appendChild(td1);
    tr.appendChild(td2);
    document.addElement(td1, "img", {
        src: "/www/res/images/icons/icons8_edit_property_48px.png",
        style: `width:26px; height:26px;display: block;
                        margin-left: auto;margin-right: auto;
                        margin-top: 0.3em; cursor: pointer;`,
        alt: "تعديل بيانات الفئة",
        title: "تعديل بيانات الفئة",
        onclick: "prepareCategoryDialog('" + category.Name + "');document.toggleShowHideOfUserDialog(categoryUserDialog, 'show')"
    });
    document.addElement(td2, "img", {
        src: "/www/res/images/icons/icons8_remove_48px.png",
        style: `width:26px; height:26px;display: block;
                        margin-left: auto;margin-right: auto;
                        margin-top: 0.3em;`+ (document.CurrentUser.PermissionCode == 0 ? " cursor: pointer;" : "filter: grayscale(100%);cursor: not-allowed;"),
        alt: "حذف الفئة",
        title: "حذف الفئة",
        onclick: (document.CurrentUser.PermissionCode == 0) ? "removeCategory('" + category.Name + "')" : ""
    });

    table.appendChild(tr);
}
async function displayCategory() {
    let table = document.querySelector("table#table_category");
    table.replaceChildren();
    table.innerHTML = `<tr>
                            <td>الفئة</td>
                            <td>عدد الاصناف المسجلة </td>
                            <td>الحالة مفعل</td>
                            <td>بواسطة</td>
                            <td>بتاريخ</td>
                            <td></td>
                            <td></td>
                        </tr>`;

    let categoriesSelect = document.forms["form_product"].elements["category_product_dialog"];
    let searchCategorySelect = document.querySelector("select#product_searchbar_category_select");
    //let fullEditProductCategory = document.querySelector("select[input][name='full_edit_product_category']");
    categoriesSelect.replaceChildren();
    searchCategorySelect.replaceChildren();
    document.addElement(searchCategorySelect, "option", { text: "تحديد الفئة", value: "", selected: true, style: "display:none" });
    document.addElement(searchCategorySelect, "option", { text: "غير محدد", value: "all" });
    LoadedCategories.forEach(async cat => {

        if (cat.Active == 1) {
            document.addElement(categoriesSelect, "option", { text: cat.Name, value: cat.Name });
            document.addElement(searchCategorySelect, "option", { text: cat.Name, value: cat.Name });
        }
        await generateRow(cat, table);
    });
}
async function loadCategories(loadAll = false) {
    let requestPayload = { Task: "load_category" };
    if (loadAll != undefined && loadAll == true)
        requestPayload = { Task: "load_category", "All": true };


    await document.requestService(requestPayload, async data => {
        LoadedCategories = data.Message;
        await displayCategory();
    });
}

//// -----------------------------------------------------------------------------------------------------------
//// -----------------------------------------------------------------------------------------------------------
//// -----------------------------------------------------------------------------------------------------------

function prepareForEditMeasuringUnit(id) {
    let unit = MeasuringUnits.filter(u => u.Id == id);
    if (unit == null || unit.length == 0) return;

    unit = unit[0];
    let editNameMU = measuringUnitUserDialog.querySelector("input[name='mu-edit-name']");
    let editIdMU = measuringUnitUserDialog.querySelector("input[name='mu-edit-id']");
    let editActiveStateMU = measuringUnitUserDialog.querySelector("select[name='mu-edit-activestate']");
    editIdMU.value = unit.Id;
    editNameMU.value = unit.Name;
    editActiveStateMU.value = unit.Active;
}
async function displayMeasuringUnits() {
    let table = document.querySelector("table#measuringunits_table");
    //let addProductMUField = document.querySelector("select[name='userdialog_product_measuringunit']");
    let productMUField = document.forms["form_product"].elements["measuringunit_product_dialog"];
    //addProductMUField.replaceChildren();
    productMUField.replaceChildren();

    table.replaceChildren();
    table.innerHTML = `<tr>
                            <td>#</td>
                            <td>اسم وحده القياس</td>
                            <td>الحالة/مفعل</td>
                            <td>بواسطة</td>
                            <td>بتاريخ</td>
                            <td></td>
                        </tr>`;
    MeasuringUnits.forEach(unit => {
        if (unit.Active == 1) {
            //document.addElement(addProductMUField, "option", { value: unit.Id, text: unit.Name });
            document.addElement(productMUField, "option", { value: unit.Id, text: unit.Name });
        }
        let tr = document.createChild("tr", {});
        document.addElement(tr, "td", { text: unit.Id });
        document.addElement(tr, "td", { text: unit.Name });
        document.addElement(tr, "td", { text: unit.Active == 1 ? "مفعل" : "غير مفعل" });
        document.addElement(tr, "td", { text: unit.Addedby });
        document.addElement(tr, "td", { text: unit.Creationdate });
        let td2 = document.createChild("td", {});
        document.addElement(td2, "img", {
            src: "/www/res/images/icons/icons8_edit_property_48px.png",
            style: `width:26px; height:26px;display: block;
                        margin-left: auto;margin-right: auto;
                        margin-top: 0.3em; cursor: pointer;`,
            alt: "تعديل بيانات وحدة القياس",
            title: "تعديل بيانات وحدة القياس",
            onclick: "prepareForEditMeasuringUnit(" + unit.Id + ")"
        });

        tr.appendChild(td2);
        table.appendChild(tr);
    });
}
async function loadMeasuringUnits() {
    let requestPayload = {
        Task: "load_measuringunit",
        All:true
    }

    document.requestService(requestPayload, async data => {
        MeasuringUnits = data.Message;
        await displayMeasuringUnits();
    });
}
async function addMeasuringUnits() {
    const value = measuringUnitUserDialog.querySelector("input[name='mu-add-new-name']").value;
    if (MeasuringUnits.filter(c => c.Name == value).length > 0) {
        alert("وحدة القياس هذه مسجلة بالفعل");
        return;
    }
    let requestPayload = {
        Task: "add_measuringunit",
        Username: document.CurrentUser.Username,
        Name: value,
        Active: 1
    };

    document.requestService(requestPayload, async data => {
        alert(data.Message);
        if (data.Message != "لا يمكن تسجيل وحدة القياس اكتر من مرة")
            await loadMeasuringUnits();
    });
}
async function editMeasuringUnits() {
    const id = measuringUnitUserDialog.querySelector("input[name='mu-edit-id']").value;
    const value = measuringUnitUserDialog.querySelector("input[name='mu-add-new-name']").value;
    if (MeasuringUnits.filter(c => c.Name == value && c.Id != id).length > 0) {
        alert("وحدة القياس هذه مسجلة بالفعل");
        return;
    }
    let requestPayload = {
        Task: "edit_measuringunit",
        Name: measuringUnitUserDialog.querySelector("input[name='mu-edit-name']").value,
        Active: measuringUnitUserDialog.querySelector("select[name='mu-edit-activestate']").value,
        Id: id
    };

    document.requestService(requestPayload, async data => {
        alert(data.Message);
        await loadMeasuringUnits();
    });
}

/*




*/
var validationMap = [
    {
        Input: "name_product_dialog",
        ValidateWhen: "input",
        async Validator(v) {
            if (v.length < 2 || v.length > 60)
                return [false, "القيمة المدخله يجب ان تتكون من 2 الى 60 حرف كحد اقصى"];
            else if (!document.validateName(v))
                return [false, "القيمة المدخله لا يمكن ان تحتوي على أحرف خاصة كـ علامات الترقيم والاستفهام وغيرها."];
            return [true, v];
        },
    },
    {
        Input: "company_product_dialog",
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
        Input: "code_product_dailog",
        ValidateWhen: "input",
        async Validator(v) {
            if (v.length < 2 || v.length > 80)
                return [false, "القيمة المدخله يجب ان تتكون من 2 الى 80 حرف كحد اقصى"];
            else if (!document.validateName(v))
                return [false, "القيمة المدخله لا يمكن ان تحتوي على أحرف خاصة كـ علامات الترقيم والاستفهام وغيرها."];
            return [true, v];
        },
    },
    {
        Input: "barcode_product_dialog",
        ValidateWhen: "input",
        async Validator(v) {
            if (v.length < 8 || v.length > 45)
                return [false, "القيمة المدخله يجب ان تتكون من 8 الى 45 حرف كحد اقصى"];
            else if (!document.validateName(v))
                return [false, "القيمة المدخله لا يمكن ان تحتوي على أحرف خاصة كـ علامات الترقيم والاستفهام وغيرها."];
            return [true, v];
        },
    },
    {
        Input: "sprice_product_dialog",
        ValidateWhen: "input",
        async Validator(v) {
            try {
                v = parseFloat(v);
                if (v < 0 || isNaN(v))
                    return [false, "القيمة يجب ان تكون اكبر او تساوي 0"];
                return [true, v];
            } catch {
                return [false, "القيمة يجب ان تكون رقمية وتقبل الاعداد فقط"];
            }
        },
    },
    {
        Input: "bprice_product_dialog",
        ValidateWhen: "input",
        async Validator(v) {
            try {
                v = parseFloat(v);
                if (v < 0 || isNaN(v))
                    return [false, "القيمة يجب ان تكون اكبر او تساوي 0"];
                return [true, v];
            } catch {
                return [false, "القيمة يجب ان تكون رقمية وتقبل الاعداد فقط"];
            }
        },
    },
    {
        Input: "wprice_product_dialog",
        ValidateWhen: "input",
        async Validator(v) {
            try {
                v = parseFloat(v);
                if (v < 0 || isNaN(v))
                    return [false, "القيمة يجب ان تكون اكبر او تساوي 0"];
                return [true, v];
            } catch {
                return [false, "القيمة يجب ان تكون رقمية وتقبل الاعداد فقط"];
            }
        },
    },
    {
        Input: "wholesale_support_product_dialog",
        ValidateWhen: "change",
        async Validator(v, element) {
            if (v == "" || element.selectedOptions.length == 0)
                return [false, "يجب اختيار قيمة اولا"];
            return [true, v];
        },
    },
    {
        Input: "category_product_dialog",
        ValidateWhen: "change",
        async Validator(v, element) {
            if (v == "" || element.selectedOptions.length == 0)
                return [false, "يجب اختيار قيمة اولا"];
            return [true, v];
        },
    },
    {
        Input: "active_state_product_dialog",
        ValidateWhen: "change",
        async Validator(v, element) {
            if (v == "" || element.selectedOptions.length == 0)
                return [false, "يجب اختيار قيمة اولا"];
            return [true, v];
        },
    },
    {
        Input: "measuringunit_product_dialog",
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

    if (!document.currentView.isViewEmbedded) {
        let user = sessionStorage.getItem("user");
        if (user == null)
            location.href = "/www/html/login.html"
        let userData = JSON.parse(user);
        if (typeof container === 'undefined') {
            location.href = "/www/html/" + userData.Page;
        }
    }

    if (document.CurrentUser.PermissionCode > 5) {
        document.querySelector("#produc_add_product").remove();
    }
    //document.expandContainerArea();

    await loadCategories();
    await loadMeasuringUnits();
    let stores = await document.loadAllStores();
    let searchStoreSelect = document.querySelector("select#product_searchbar_store_select");
    let productStoreField = document.forms["form_product"].elements["store_product_dialog"];
    searchStoreSelect.replaceChildren();
    productStoreField.replaceChildren();
    document.addElement(searchStoreSelect, "option", { text: "تحديد المخزن", value: "", selected: true, style: "display:none" });
    document.addElement(searchStoreSelect, "option", { text: "غير محدد", value: "all" });
    stores.forEach(async store => {
        document.addElement(searchStoreSelect, "option", { text: store.Name, value: store.Name });
        document.addElement(productStoreField, "option", { text: store.Name, value: store.Name });
    });

    MenuManager.Setup();
})();