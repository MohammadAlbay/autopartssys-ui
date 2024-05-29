var Suppliers = [];
var Stores = [];
var Categories = [];
var Units = [];
var startNewBillIcon = document.querySelector("img#img_ignition_startbill");
var SupplierPurchasesWindow = {
    Window: document.querySelector("div#purchasebill_from_supplier_window"),
    Table: document.querySelector("div#purchasebill_from_supplier_window > div[left] > table"),
    StartedBill: false,
    UpdateMode: false,
    Input: {
        InputId: document.querySelector("input#purchasebill_bill_input"),
        SelectSupplier: document.querySelector("select#purchasebill_supplier_select"),
        InputTotal: document.querySelector("input#purchasebill_total_input"),
        InputPayed: document.querySelector("input#purchasebill_payed_input"),
        InputRemain: document.querySelector("input#purchasebill_remain_input"),
        SelectStore: document.querySelector("select#purchasebill_store_select"),

        Set(key, value) {
            switch (key) {
                case "id":
                    this.InputId.value = value;
                    break;
                case "total":
                    this.InputTotal.value = value;
                    break;
                case "payed":
                    this.InputPayed.value = value;
                    break;
                case "remain":
                    this.InputRemain.value = value;
                    break;
                default:
                    throw Error("Unknown key");
                    break;
            }
        },
        Get(key) {
            switch (key) {
                case "id":
                    return this.InputId.value;
                    break;
                case "total":
                    return parseFloat(this.InputTotal.value);
                    break;
                case "payed":
                    return parseFloat(this.InputPayed.value);
                    break;
                case "remain":
                    return parseFloat(this.InputRemain.value);
                    break;
                default:
                    throw Error("Unknown key");
                    break;
            }
        }
    },
    Bill: {
        Id: -1,
        Supplier: { Id: undefined, Name: undefined },
        Items: [],
    },
    Activate() {
        for (let i in this.Input) {
            if (this.Input[i] == this.Input.InputId) continue;
            this.Input[i].disabled = false;
        }
    },
    Dectivate() {
        for (let i in this.Input) {
            if (this.Input[i] == this.Input.SelectSupplier) continue;
            this.Input[i].disabled = true;
            this.Input[i].value = "";
        }
    },
    Show() {
        if (this.Input.SelectSupplier.children.length == 0) {
            (async () => {
                await loadRequiredData();
                await displayLoadedData();
            })();
        }
        document.toggleShowHideOfFullView(this.Window, "show");
    },
    Hide() {
        document.toggleShowHideOfFullView(this.Window, "hide");
    },
    AddTableHeader() {
        this.Table.innerHTML = `
                        <tr>
                            <td>#</td>
                            <td>الاسم</td>
                            <td>الشركة</td>
                            <td>الكود</td>
                            <td>الباركود</td>
                            <td>الكمية</td>
                            <td>سعر الشراء</td>
                            <td>الاجمالي</td>
                        </tr>`;
    },
    SelectedSupplier() {
        return { Id: this.Input.SelectSupplier.value, Name: this.Input.SelectSupplier.selectedOptions[0].textContent }
    },
    Clear(autoGenerateColumnHeader = false) {
        this.Bill.Id = -1;
        this.Bill.Items = [];
        this.Bill.Supplier = { Id: undefined, Name: undefined };
        this.Table.replaceChildren();
        this.CartItems.Items = [];
        if (autoGenerateColumnHeader) {
            this.AddTableHeader();
        }
    },
    New() {
        this.StartedBill = true;
        this.UpdateMode = false;

        this.SetSupplier();
        let requestPayload = {
            Task: "create_obill",
            Username: document.CurrentUser.Username,
            Supplier: this.Bill.Supplier.Id
        };
        document.requestService(requestPayload, data => {
            let m = data.Message;
            if (m.Id == -1) {
                alert("لم يتم انشاء الفاتورة");
                this.Cancel();
                return;
            }
            else {
                this.Bill.Id = m.Id;
                this.Input.Set("id", m.Id);
                this.Input.Set("total", 0);
                this.Input.Set("payed", 0);
                this.Input.Set("remain", 0);
                this.AddTableHeader();
                if (this.OnCreate != null)
                    this.OnCreate(this.Bill.Id);
            }

        });


    },
    Cancel() {
        if (!this.StartedBill || this.Bill.Id == -1) {
            alert("لا توجد فاتورة نشطة لالغائها");
            return;
        }
        document.requestService({ Task: "cancel_obill", Id: this.Bill.Id }, data => {
            this.Close();
            alert(data.Message);
        });
    },
    Close() {
        this.StartedBill = false;
        this.Dectivate();
        this.Clear();
        if (this.OnCancel != null)
            this.OnCancel();
    },
    SetSupplier() {
        this.Bill.Supplier = this.SelectedSupplier();
    },
    // AddItem(item) {

    // },
    // RemoveItem(item) {

    // },

    Setup() {
        this.Dectivate();
        //this.Clear();
        this.Input.InputPayed.addEventListener("change", () => {
            const payed = this.Input.Get("payed");
            const total = this.Input.Get("total");
            if (payed > total) {
                alert("القيمة المدفوعه لايمكن ان تكون اكبر من القيمة الاجمالية للفاتورة");
                this.Input.InputPayed.value = total;
                return;
            }
            this.Input.Set("remain", total - payed);
        });
        this.Input.SelectSupplier.addEventListener("change", () => this.SetSupplier());

    },
    async Save() {
        // remove all saved items.. 
        // save new data..
        // save all new items..
        this.Bill.Items = this.CartItems.Items.map(i => i.Item);

        if (this.Bill.Items.length == 0) {
            alert("قم بإضافة اصناف للفاتورة اولا"); return;
        }
        if (this.Input.SelectStore.value == "") {
            alert("قم بتحديد المخزن اولا"); return;
        }
        let requestPayload = {
            Task: "edit_obill",
            Id: this.Bill.Id,
            Canceled: 0,
            Type: 0,
            Total: this.Input.Get("total"),
            Payed: this.Input.Get("payed"),
            Remain: this.Input.Get("remain"),
            Reset: 1
        };
        await document.requestService(requestPayload, async data => {
            this.Bill.Items.forEach(async item => {
                let innerRequestPayload = {
                    Task: "additem_obill",
                    Username: document.CurrentUser.Username,
                    Id: this.Bill.Id,
                    ItemId: item.Id,
                    Store: this.Input.SelectStore.value,
                    Quantity: item.Quantity,
                    Price: item.Price,
                    Total: item.Quantity * item.Price
                };
                await document.requestService(innerRequestPayload, async data => {
                    console.log(data);
                });

                alert("تم الحفظ");
                this.Close();
            });
        });

    },
    OnCreate: null,
    OnCancel: null,

    CartItems: {
        Items: [],
        AddToCart(item) {
            if (this.Items.filter(i => i.Item.Id == item.Id).length > 0) {
                alert("الصنف موجود. قم بتعديل الكمية في الحقل المخصص");
                return;
            }
            item.Quantity = 1;
            let imgStyle = "width:26px; height:26px;display: block;margin-left: auto;margin-right: auto;margin-top: 0.3em;";
            let row = document.createChild("tr", {
                child: [
                    document.createChild("td", { text: item.Id }),
                    document.createChild("td", { text: item.Fullname }),
                    document.createChild("td", { text: item.Company }),
                    document.createChild("td", { text: item.Code }),
                    document.createChild("td", { text: item.Barcode }),
                    document.createChild("td", {
                        "item-quantity-for": item.Id,
                        text: item.Quantity,
                        contenteditable: 'true',
                        event: {
                            onkeyup(self) {
                                try {
                                    const value = parseInt(self.textContent);
                                    if (value < 0) throw Error("Quantity must be in range of [0..N]");
                                    item.Quantity = value;
                                    const priceTD = self.parentElement.querySelector(`td[item-price-for="${item.Id}"]`);
                                    const totalTD = self.parentElement.querySelector(`td[item-total-for="${item.Id}"]`);
                                    const price = parseFloat(priceTD.textContent);
                                    totalTD.textContent = price * value;
                                    SupplierPurchasesWindow.CartItems.CalculateTotal();
                                } catch (e) {
                                    console.log(e);
                                    alert("القيمة غير صحيحة");
                                }
                            }
                        }
                    }),
                    document.createChild("td", {
                        "item-price-for": item.Id,
                        text: item.SPrice,
                        contenteditable: 'true',
                        event: {
                            onkeyup(self) {
                                try {
                                    const value = parseFloat(self.textContent);
                                    if (value < 0) throw Error("Quantity must be in range of [0..N]");
                                    item.SPrice = value;
                                    const quantityTD = self.parentElement.querySelector(`td[item-quantity-for="${item.Id}"]`);
                                    const totalTD = self.parentElement.querySelector(`td[item-total-for="${item.Id}"]`);
                                    const quantity = parseInt(quantityTD.textContent);
                                    totalTD.textContent = quantity * value;
                                    SupplierPurchasesWindow.CartItems.CalculateTotal();
                                } catch (e) {
                                    console.log(e);
                                    alert("القيمة غير صحيحة");
                                }
                            }
                        }
                    }),
                    document.createChild("td", {
                        "item-total-for": item.Id,
                        text: 1 * item.SPrice,
                        contenteditable: 'true'
                    }),
                    document.createChild("td", {
                        child: document.createChild("img", {
                            src: document.CurrentUser.PermissionCode == 0
                                ? "/www/res/images/icons/icons8_remove_48px.png"
                                : "/www/res/images/icons/icons8_fail_48px.png",
                            style: imgStyle + (document.CurrentUser.PermissionCode == 0 ? " cursor: pointer;" : "filter: grayscale(100%);cursor: not-allowed;") +
                                ((/* bill.Canceled*/-1 == 1) ? "filter: grayscale(100%);cursor: not-allowed;" : ""),
                            title: document.CurrentUser.PermissionCode == 0 ? "حذف الفاتورة" : "الغاء الفاتورة",
                            event: {
                                async onclick(self) {
                                    SupplierPurchasesWindow.CartItems.RemoveFromCart(item);
                                }
                            }
                        })
                    })
                ]
            });
            SupplierPurchasesWindow.Table.appendChild(row);
            //SupplierPurchasesWindow.AddItem(item);
            this.Items.push({ Row: row, Item: item });
            this.CalculateTotal();
        },
        RemoveFromCart(item) {
            let Item = this.Items.filter(i => i.Item.Id == item.Id);
            if (Item.length == 0) return;

            Item = Item[0];
            let row = Item.Row;
            row.remove();
            this.Items = this.Items.filter(i => i.Item.Id !== item.Id);
        },
        CalculateTotal() {
            let total = 0;
            this.Items.forEach(i => {
                total += i.Item.SPrice * i.Item.Quantity;
            });
            SupplierPurchasesWindow.Input.Set("total", total);
            return total;
        }
    }
};







var SearchFunction = {
    Items: [],
    Input: {
        SearchInput: document.querySelector("input#purchasebill_searchitem_input"),
        StoreSelect: document.querySelector("select#purchasebill_store_select")
    },
    Search() {
        if (!SupplierPurchasesWindow.StartedBill) {
            alert("قم بانشاء فاتورة اولا");
            return;
        }
        let searchText = this.Input.SearchInput.value.trim();
        if (searchText.length == 0) {
            alert("قم بادخال قيمة في مربع البحث");
            return;
        }
        if (this.Input.StoreSelect.value == "" || this.Input.StoreSelect.selectedOptions.length == 0) {
            alert("قم باختيار مخزن   ");
            return;
        }
        let requestPayload = {
            Task: "searchitems_cashiersystem",
            SearchValue: searchText,
            Category: "all",
            Store: this.Input.StoreSelect.value
        };
        document.requestService(requestPayload, async data => {
            this.Items = data.Message;
            if (this.Items.length == 0) {
                if (confirm("لم يتم العثور على اي منتج مطابق. هل تريد انشاء منتج جديد ؟ ملاحظة / في حال انشئت منتج جديد سوف يتعين عليك اعادة البحث عند الانتهاء"))
                    AddNewProductDialogFunction.Show();
            } else {
                if (this.Items.length == 1)
                    SupplierPurchasesWindow.CartItems.AddToCart(this.Items[0]);
                else {
                    UnrecognizedItemsDialog.Prepare(this.Items);
                }
            }
        });
    }
}

var UnrecognizedItemsDialog = {
    Dialog: document.querySelector("div#unrecognized_dialog"),
    Show() { document.toggleShowHideOfUserDialog(this.Dialog, "show") },
    Hide() { document.toggleShowHideOfUserDialog(this.Dialog, "hide") },
    Prepare(items = [], autoShow = true) {
        if (items.length == 0) return;
        this.Dialog.replaceChildren();
        this.DisplayItems(items);
        if (autoShow)
            this.Show();
    },
    DisplayItems(items) {
        /*<div class="riched-content-card">
                
                <font>محمحمدمحمدمحمدمحمدمدمحمحمدمحمدمحمدمحمدمد</font>
                <font>9458309458304349</font>
                <font>250 LYD</font>
                <font>زيزيوتزيوتزيوتوت</font>
                <img src="/www/res/images/icons/icons8_product_96px.png">
            </div> */
        document.modifyElement(this.Dialog, {
            child: document.createChild("h3", { text: "قائمة الاصناف", style: "text-align:center" })
        })
        items.forEach(item => {
            document.modifyElement(this.Dialog, {
                child: document.createChild("div", {
                    "item-id": item.Id,
                    class: "riched-content-card",
                    child: [
                        document.createChild("font", { text: item.Fullname }),
                        document.createChild("font", { text: item.Barcode }),
                        document.createChild("font", { text: item.SPrice + " د.ل " }),
                        document.createChild("font", { text: item.Company }),
                        document.createChild("img", { src: "/www/res/images/icons/icons8_product_96px.png" }),
                    ],
                    event: {
                        onclick(self) {
                            if (UnrecognizedItemsDialog.OnClose != null) UnrecognizedItemsDialog.OnClose(item);
                            UnrecognizedItemsDialog.Hide();
                        }
                    }
                })
            });
        });

    },


    OnClose: null
}

var AddNewProductDialogFunction = {
    Dialog: document.querySelector("div#purchasing_product_userdialog"),
    Show() { document.toggleShowHideOfUserDialog(this.Dialog, "show") },
    Hide() { document.toggleShowHideOfUserDialog(this.Dialog, "hide") },
    async Save() {
        await addProduct();
        this.Hide();
    }
}


var AddNormalPurchasesDialogFunction = {
    Items: [],
    BillId: -1,
    BillContainer: document.getElementById("normal_billitems_container"),
    Dialog: document.querySelector("div#normalpurchasing_product_userdialog"),
    Show() { document.toggleShowHideOfUserDialog(this.Dialog, "show") },
    Hide() { document.toggleShowHideOfUserDialog(this.Dialog, "hide") },

    async Create() {
        let requestPayload = {
            Task: "create_obill",
            Username: document.CurrentUser.Username,
            Type: 1
        };
        await document.requestService(requestPayload, async data => {
            let m = data.Message;
            if (m.Id == -1) {
                alert("لم يتم انشاء الفاتورة");
                this.Cancel();
                return;
            }
            else {
                AddNormalPurchasesDialogFunction.BillId = m.Id;
            }

        });
    },
    async Save() {
        await this.Create();
        if (this.BillId == -1) {
            alert("قم بإنشاء فاتورة اولا");
            return;
        }
        
        this.Items.forEach(async item => {
            let p = {
                Task: "additem_obill",
                Username: document.CurrentUser.Username,
                Id: AddNormalPurchasesDialogFunction.BillId,
                Quantity: item.Quantity,
                Price: item.Price,
                Total: item.Total,
                Desc: item.Name,
                Type: 1
            };
            await document.requestService(p, async d => {
                console.log(d);
            });
        });
        alert("تم حفظ الفاتورة");
        this.Items = [];
        this.BillId = -1;
        this.Hide();
    },
    async AddToCart() {
        let promise = await nResults;
        await promise.Revalidate();
        let r = promise.Result;
        if (r.filter(row => row.State == false).length > 0) {
            return;
        } else {
            const form = document.forms["normal_purchases_form"];
            if (this.Items.filter(i => i.Name == form["0"].value).length > 0) {
                alert("الصنف موجود بالفعل"); return;
            }
            console.log(form["0"].value);
            const newItem = {
                Name: form["0"].value,
                Quantity: form["1"].value,
                Price: form["2"].value,
                Total: parseFloat(form["2"].value) * parseInt(form["1"].value)
            };
            this.Items.push(newItem);


            this.Display(newItem);
        }
    },
    Display(item) {
        document.modifyElement(this.BillContainer, {
            child: document.createChild("div", {
                class: "riched-content-card",
                child: [
                    document.createChild("font", {text: item.Name}),
                    document.createChild("font", {text: " الكمية "+item.Quantity}),
                    document.createChild("font", {text: item.Price+ " د.ل "}),
                    document.createChild("font", {text: " الاجمالي "+item.Total+ " د.ل "}),
                    document.createChild("img", {src: "/www/res/images/icons/icons8_product_96px.png"})
                ]
            })
        });
    }
}


async function loadBills() {
    await document.requestService({}, async data => {
        
    });
}
/*|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
|||||||||||||||||||||||||||||||||    EVENTS     |||||||||||||||||||||||||||||||||||||||||||||||||
|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
SupplierPurchasesWindow.OnCancel = () => {
    startNewBillIcon.onclick = () => SupplierPurchasesWindow.New();
    SupplierPurchasesWindow.Dectivate();
    startNewBillIcon.src = "/www/res/images/icons/icons8_create_document_48px.png";
}
SupplierPurchasesWindow.OnCreate = () => {
    startNewBillIcon.onclick = () => SupplierPurchasesWindow.Cancel();
    SupplierPurchasesWindow.Activate();
    startNewBillIcon.src = "/www/res/images/icons/icons8_fail_48px.png";
}
UnrecognizedItemsDialog.OnClose = item => {
    if (item == null) return;

    SupplierPurchasesWindow.CartItems.AddToCart(item);
}
/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////    BASE FUNCTION////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////

async function loadRequiredData() {
    let tempSUppliers = await document.loadAllSuppliers();
    let tempStores = await document.loadAllStores();
    let tempCategories = await document.loadAllCategories()
    let tempUnits = await document.loadAllMeasurmentUnits()
    Suppliers = tempSUppliers.filter(s => s.Active == 1);
    Stores = tempStores.filter(s => s.Active == 1);
    Categories = tempCategories.filter(s => s.Active == 1);
    Units = tempUnits.filter(s => s.Active == 1);
}

async function displayLoadedData() {
    SupplierPurchasesWindow.Input.SelectSupplier.replaceChildren();
    Suppliers.forEach(supplier => {
        document.addElement(SupplierPurchasesWindow.Input.SelectSupplier, "option", {
            text: supplier.EName,
            value: supplier.Id,
            selected: true
        });
    });
    SearchFunction.Input.StoreSelect.replaceChildren();
    Stores.forEach(store => document.addElement(SearchFunction.Input.StoreSelect, "option", {
        text: store.Name,
        value: store.Name,
        selected: true
    }));

    let cateSelect = document.querySelector("select[name='category_product_dialog']");
    cateSelect.replaceChildren();
    Categories.forEach(cat => document.addElement(cateSelect, "option", {
        text: cat.Name,
        value: cat.Name,
        selected: true
    }));
    let unitSelect = document.querySelector("select[name='measuringunit_product_dialog']");
    unitSelect.replaceChildren();
    Units.forEach(unit => document.addElement(unitSelect, "option", {
        text: unit.Name,
        value: unit.Id,
        selected: true
    }));
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
        });
    }
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



/*

n_price */
var nValidationMap = [
    {
        Input: "n_item",
        ValidateWhen: "input",
        async Validator(v) {
            if (v.length < 1 || v.length > 50)
                return [false, "القيمة المدخله يجب ان تتكون من 1 الى 50 حرف كحد اقصى"];
            else if (!document.validateName(v))
                return [false, "القيمة المدخله لا يمكن ان تحتوي على أحرف خاصة كـ علامات الترقيم والاستفهام وغيرها."];
            return [true, v];
        },
    },

    {
        Input: "n_price",
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
        Input: "n_quantity",
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
    }
];

var nResults = document.validateInput(nValidationMap, document.querySelector("#nSubmitButton"));


(async () => {


    SupplierPurchasesWindow.Setup();
    await loadRequiredData();
    await displayLoadedData();
})();