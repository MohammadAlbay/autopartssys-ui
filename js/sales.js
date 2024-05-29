var LoadedBills = [];
var LoadedAccounts = [];
var LoadedPayments = [];
var LoadedClients = [];

//#region UI Components
var BillDetailsScreen = {
    SelectedBill: null,
    SelectedBillDetails: null,
    DetailsWindow: document.querySelector("div[user-screen][name='bill_detials']"),
    Table: document.querySelector("div[user-screen] > table#bill_details_table"),
    DetailsWindowTitle: document.querySelector("div[user-screen] > h1#bill_details_title"),
    OpenBillForCashierUI: document.querySelector("div[user-screen] > img#bill_details_viewbill"),

    Clear() {
        this.SelectedBill = null;
        this.SelectedBillDetails = null;
        this.DetailsWindowTitle.textContent = "";
        this.Table.replaceChildren();
    },
    async Prepare(bill, autoShow = true, onFinish = null) {
        if (bill == null) return;
        this.Clear();
        this.SelectedBill = bill;
        this.SelectedBillDetails = await this.FetchDetails();
        this.DetailsWindowTitle.textContent = "تفاصيل الفاتورة " + bill.Id;
        if (document.currentView.isViewEmbedded) {
            if (bill.Canceled == 1 || bill.Readonly == true) {
                this.OpenBillForCashierUI.style.display = "none";
            }
            else {
                this.OpenBillForCashierUI.style.display = "block";
                this.OpenBillForCashierUI.setAttribute("onclick", `loadOldBill(${JSON.stringify({ BillHead: { ...bill }, BillBody: [...this.SelectedBillDetails] })});document.closeAllOpenPopups();`);
            }
        } else {
            this.OpenBillForCashierUI.style.display = "none";
        }
        this.DisplayDetails();
        if (autoShow)
            this.Show();
        if (onFinish != null)
            onFinish();
    },
    DisplayDetails() {
        this.Table.replaceChildren();
        let imgStyle = "width:26px; height:26px;display: block;margin-left: auto;margin-right: auto;margin-top: 0.3em;";
        let inner = `<tr>
                                    <td>#</td>
                                    <td>الاسم</td>
                                    <td>الباركود</td>
                                    <td>الشركة</td>
                                    <td>الكود</td>
                                    <td>المخزن</td>
                                    <td>الكمية</td>
                                    <td>بسعر الجملة</td>
                                    <td>القيمة</td>
                                    <td>التخفيض</td>
                                    <td>الاجمالي</td>
                                    <td>تعديل بواسطة</td>
                                    <td></td>
                                </tr>`;
        this.Table.innerHTML = inner;
        this.SelectedBillDetails?.forEach(item => {
            document.modifyElement(this.Table, {
                child: document.createChild("tr", {

                    child: [
                        document.createChild("td", { text: item.Itemid }),
                        document.createChild("td", { text: item.Fullname }),
                        document.createChild("td", { text: item.Barcode }),
                        document.createChild("td", { text: item.Company }),
                        document.createChild("td", { text: item.Code }),
                        document.createChild("td", { text: item.Store }),
                        document.createChild("td", { text: item.Quantity }),
                        document.createChild("td", { text: item.UsesWholeSalePrice ? "نعم" : "لا" }),
                        document.createChild("td", { text: item.Price + " د.ل " }),
                        document.createChild("td", { text: item.Discount + " د.ل " }),
                        document.createChild("td", { text: item.Total + " د.ل " }),
                        document.createChild("td", { text: item.Updatedby }),

                        document.createChild("td", {
                            child: document.createChild("img", {
                                src: "/www/res/images/icons/icons8_remove_48px.png",
                                style: imgStyle + (document.CurrentUser.PermissionCode == 0 ? " cursor: pointer;" : "filter: grayscale(100%);cursor: not-allowed;"),
                                title: "حذف هذا الصنف",
                                event: {
                                    async onclick(self) {
                                        if (document.CurrentUser.PermissionCode == 0) {
                                            await document.requestService({ Task: "cancel_ibill", Process: "Cancel", Id: bill.Id }, data => {
                                                TopbarFormElements.Search();
                                            });
                                        }
                                    }
                                }
                            })
                        })
                    ]

                })
            });
        });
    },
    async FetchDetails() {
        let data = [];
        await document.requestService({ Task: "loaditem_ibill", Id: this.SelectedBill.Id }, async d => data = d.Message);
        return data;
    },
    Show() {
        document.toggleShowHideOfFullView(this.DetailsWindow, "show");
    },
    Hide() {
        document.toggleShowHideOfFullView(this.DetailsWindow, "hide");
    }
};
var TopbarFormElements = {
    InputFields: document.querySelector("div.searchbar > input#sbar_inputfield"),
    DateField: document.querySelector("div.searchbar > input#sbar_datefield"),
    DateField2: document.querySelector("div.searchbar > input#sbar_datefield2"),
    Button: document.querySelector("div.searchbar > button#sbar_search_button"),
    PaymentSelect: document.querySelector("div.searchbar > select#sbar_paymentselect"),
    UsersSelect: document.querySelector("div.searchbar > select#sbar_userselect"),
    ClientSelect: document.querySelector("div.searchbar > select#sbar_clientselect"),
    FullPayedSelect: document.querySelector("div.searchbar > select#sbar_fullpayedselect"),

    Activate: () => {
        TopbarFormElements.Button.removeAttribute("disabled");
        TopbarFormElements.InputFields.removeAttribute("disabled");
        TopbarFormElements.InputFields.focus();
    },
    Deactivate: () => {
        TopbarFormElements.Button.setAttribute("disabled", true);
        TopbarFormElements.InputFields.setAttribute("disabled", true);
    },
    Search: (payload = null) => {

        let searchText = TopbarFormElements.InputFields.value.trim();

        if (searchText.length > 0 && !parseInt(searchText)) {
            alert("قم بادخال قيمة عددية في مربع البحث");
            return;
        }
        let requestPayload = payload || {
            Task: "load_ibill",
            Id: searchText,
            Username: TopbarFormElements.UsersSelect.value,
            Client: TopbarFormElements.ClientSelect.value,
            FullPayed: TopbarFormElements.FullPayedSelect.value,
            Payment: TopbarFormElements.PaymentSelect.value,
            Creationdate: formateDate(TopbarFormElements.DateField.valueAsDate),
            Creationdate2: formateDate(TopbarFormElements.DateField2.valueAsDate)
        };

        if (requestPayload.Id === "")
            delete requestPayload.Id;
        if (requestPayload.Username === "all")
            delete requestPayload.Username;
        if (requestPayload.Client === "all")
            delete requestPayload.Client;
        if (requestPayload.FullPayed === "all" || requestPayload.FullPayed === "")
            delete requestPayload.FullPayed;
        if (requestPayload.Payment === "all")
            delete requestPayload.Payment;
        if (requestPayload.Creationdate === "") {
            delete requestPayload.Creationdate;
            delete requestPayload.Creationdate2;
        }
        if (requestPayload?.Creationdate2 === "") {
            delete requestPayload?.Creationdate2;
        }
        document.requestService(requestPayload, async data => {
            LoadedBills = data.Message;
            await TopbarFormElements.displayBills();
            TopbarFormElements.AfterActionSearch = null;
        });
    },

    async displayBills() {
        let table = document.querySelector("Table#table_bills");
        table.replaceChildren();
        let inner = `<tr>
                            <td>#</td>
                            <td>العميل</td>
                            <td>ملغيه</td>
                            <td>المدفوع</td>
                            <td>المتبقي</td>
                            <td>الاجمالي</td>
                            <td>المربح</td>
                            <td>طريقة الدفع</td>
                            <td>النوع</td>
                            <td>تاريخ التسجيل</td>
                            <td>بواسطة</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            </tr>`;
        table.innerHTML = inner;
        let imgStyle = "width:26px; height:26px;display: block;margin-left: auto;margin-right: auto;margin-top: 0.3em;";
        let totals = {
            payed: 0, total: 0, profit: 0, remain: 0
        }
        LoadedBills.forEach(bill => {
            let emptyBill = bill.Total == 0 && bill.Payed == 0;
            let isReadonly = bill.Readonly;
            totals.total += bill.Total;
            totals.remain += bill.Total - bill.Payed;
            totals.profit += bill.Profit;
            totals.payed += bill.Payed;
            document.modifyElement(table, {
                child: document.createChild("tr", {
                    child: [
                        document.createChild("td", { text: bill.Id, style: (bill.Payed === bill.Total) ? "color:green;" : "color: red;" }),
                        document.createChild("td", { text: bill.EName }),
                        document.createChild("td", { text: bill.Canceled ? "نعم" : "لا" }),
                        document.createChild("td", { text: bill.Payed + " د.ل" }),
                        document.createChild("td", { text: (bill.Total - bill.Payed) + " د.ل" }),
                        document.createChild("td", { text: bill.Total + " د.ل" }),
                        document.createChild("td", { text: bill.Profit + " د.ل" }),
                        document.createChild("td", { text: bill.Payment }),
                        document.createChild("td", { text: bill.Type == 0 ? "نقدي" : bill.Type == 1 ? "آجل" : "مبدئية" }),
                        document.createChild("td", { text: bill.Addedby }),
                        document.createChild("td", { text: bill.Creationdate }),
                        document.createChild("td", {
                            child: document.createChild("img", {
                                src: "/www/res/images/icons/icons8_done_96px.png",
                                style: imgStyle + (!isReadonly && !bill.Canceled ? " cursor: pointer;" : "filter: grayscale(100%);cursor: not-allowed;") +
                                    ((bill.Payed === bill.Total) ? "filter: grayscale(100%);cursor: not-allowed;" : ""),
                                title: "انقر لتحديد الفاتورة كـ تم تسديدها",
                                event: {
                                    async onclick(self) {
                                        if (document.CurrentUser.PermissionCode == 0) {
                                            await document.requestService({ Task: "edit_ibill", Payed: bill.Total, Id: bill.Id }, data => {
                                                TopbarFormElements.Search();
                                            });
                                        }
                                    }
                                }
                            })
                        }),
                        document.createChild("td", {
                            child: document.createChild("img", {
                                src: "/www/res/images/icons/icons8_print_96px.png",
                                title: "طباعة الفاتورة  ",
                                style: imgStyle + " cursor: pointer;",
                                event: {
                                    async onclick(self) {
                                        if (bill.Canceled == 1 && document.CurrentUser.PermissionCode != 0) {
                                            alert("لا يمكنك طباعة فاتورة ملغية");
                                            return;
                                        }
                                        await BillDetailsScreen.Prepare(bill, false, () => {
                                            printBill(bill);
                                        });

                                    }
                                }
                            })
                        }),
                        document.createChild("td", {
                            child: document.createChild("img", {
                                src: "/www/res/images/icons/icons8_bill_96px.png",
                                title: "عرض تفاصيل الفاتورة",
                                style: imgStyle + (document.CurrentUser.PermissionCode == 0 ? " cursor: pointer;" : "filter: grayscale(100%);cursor: not-allowed;"),
                                event: {
                                    async onclick(self) {
                                        await BillDetailsScreen.Prepare(bill);
                                    }
                                }
                            })
                        }),
                        document.createChild("td", {
                            child: document.createChild("img", {
                                src: document.CurrentUser.PermissionCode == 0 && emptyBill && !isReadonly
                                    ? "/www/res/images/icons/icons8_remove_48px.png"
                                    : "/www/res/images/icons/icons8_fail_48px.png",
                                style: imgStyle + (document.CurrentUser.PermissionCode == 0 ? " cursor: pointer;" : "filter: grayscale(100%);cursor: not-allowed;") +
                                    ((bill.Canceled == 1) ? "filter: grayscale(100%);cursor: not-allowed;" : ""),
                                title: document.CurrentUser.PermissionCode == 0 && emptyBill && !isReadonly ? "حذف الفاتورة" : "الغاء الفاتورة",
                                event: {
                                    async onclick(self) {
                                        if (document.CurrentUser.PermissionCode == 0) {
                                            await document.requestService({ Task: "cancel_ibill", Process: document.CurrentUser.PermissionCode == 0 && emptyBill && !isReadonly ? "Remove" : "Cancel", Id: bill.Id }, data => {
                                                TopbarFormElements.Search();
                                            });
                                        }
                                    }
                                }
                            })
                        })

                    ]
                })
            });

        });
        // total row
        if (LoadedBills.length != 0 && document.CurrentUser.PermissionCode == 6)
            document.modifyElement(table, {
                child: document.createChild("tr", {
                    child: [
                        document.createChild("td", { text: "الخزينة", colspan: 3, style: "background-color:green; color:white;" }),
                        document.createChild("td", { text: totals.payed + " د.ل" }),
                        document.createChild("td", { text: totals.remain + " د.ل" }),
                        document.createChild("td", { text: totals.total + " د.ل" }),
                        document.createChild("td", { text: totals.profit + " د.ل" }),
                        document.createChild("td", { text: "---" }),
                        document.createChild("td", { text: "---" }),
                        document.createChild("td", { text: "---" }),
                        document.createChild("td", { text: "---" }),
                        document.createChild("td", { text: "---" }),
                        document.createChild("td", { text: "---" }),
                        document.createChild("td", { text: "---" }),
                        document.createChild("td", { text: "---" })
                    ]
                })
            })

    }
}



//#endregion
//#region  UI Events
//TopbarFormFields.InputFields.addEventListener("keydown", e => console.log(e.key));
//#endregion

function fetchTodayBills() {
    let payload = {
        Task: "load_ibill",
        Id: TopbarFormElements.InputFields.value,
        Username: TopbarFormElements.UsersSelect.value,
        Client: TopbarFormElements.ClientSelect.value,
        FullPayed: TopbarFormElements.FullPayedSelect.value,
        Payment: TopbarFormElements.PaymentSelect.value,
        Creationdate: formateDate(new Date()),
        Creationdate2: null
    }
    TopbarFormElements.DateField.valueAsDate = new Date();
    TopbarFormElements.Search(payload);
}

function exportToCSV() {
    if (LoadedBills.length == 0) {
        alert("لتتمكن من تصدير الفواتير يجب تحديد الفواتير من خلال البحث ادناه");
        return;
    }
    let indecator = document.getElementById("ibills_processing_request");
    indecator.style.display = "block";
    indecator.innerText = "قيد المعالجة ...";

    let content = "";
    LoadedBills.forEach(async (bill, index) => {
        await BillDetailsScreen.Prepare(bill, false, () => {
            BillDetailsScreen.SelectedBillDetails.forEach((item, lastIndex) => {
                content += `${item.Id},${item.Itemid},${item.Fullname},
                ${item.Store},${item.Company},${item.Barcode},${item.Code}, 
                ${item.Addedby}, ${item.Updatedby},${item.MeasuringUnit},
                ${item.Quantity},${item.Price},${item.Discount},${item.Total},
                ${item.UsesWholeSalePrice ? "نعم" : "لا"}\n`;

                if (index == LoadedBills.length - 1 && lastIndex == BillDetailsScreen.SelectedBillDetails.length - 1) {
                    download({data:content}, "text/plain;charset=UTF-8", "report.csv");
                    indecator.innerText = "اكتملت المعالجة";
                    setTimeout(() => {
                        document.getElementById("ibills_processing_request").style.display = "none";
                    }, 1500);
                }
            });
        });

    });

}
function download(content, mimeType, filename) {
    const a = document.createElement('a') // Create "a" element
    //var b = new Blob(["➀➁➂ Test"],{encoding:"UTF-8",type:"text/plain;charset=UTF-8"});
    const bytes = new TextEncoder().encode(JSON.stringify(content));
    const blob = new Blob([bytes], {encoding:"UTF-8", type: mimeType }) // Create a blob (file-like object)
    const url = URL.createObjectURL(blob) // Create an object URL from blob
    a.setAttribute('href', url) // Set "a" element link
    a.setAttribute('download', filename) // Set download filename
    a.click() // Start downloading
}
function formateDate(date) {
    if (date == null) return "";
    let year = date.getFullYear();
    let month = (date.getMonth() + 1);
    let day = date.getDate();
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    return `${year}-${month}-${day}`;
}
function printChunkItems(items) {

    let mywindow = window.open('', 'PRINT', 'height=650,width=900,top=100,left=150');

    mywindow.document.write("<html><head><title>Printing Bill</title>");
    mywindow.document.write('<link rel="stylesheet" href="/www/css/normalize.css" />');
    mywindow.document.write('<link rel="stylesheet" href="/www/css/ui.css" />');
    mywindow.document.write('<link rel="stylesheet" href="/www/css/childui.css" />');
    mywindow.document.write(`
    <script>
      var link = document.createElement('link');
      link.rel="stylesheet";
      link.href = "/www/css/childui.css";
      document.head.appendChild(link);
    </script>
    `);
    mywindow.document.write('</head><body>');

    let generatedNoteKids = [];
    if (document.Configs.Note1 !== "") {
        generatedNoteKids.push(
            document.createChild("li", { text: document.Configs.Note1 })
        );
    }
    if (document.Configs.Note2 !== "") {
        generatedNoteKids.push(
            document.createChild("li", { text: document.Configs.Note2 })
        );
    }
    let generatedKids = [];
    generatedKids.push(
        document.createChild("tr", {
            child: [
                document.createChild("td", { text: "#" }),
                document.createChild("td", { text: "الاسم" }),
                document.createChild("td", { text: "الكمية" }),
                document.createChild("td", { text: "تقاس بـ" }),
                document.createChild("td", { text: "بسعر الجملة" }),
                document.createChild("td", { text: "السعر" }),
                document.createChild("td", { text: "التخفيض" }),
                document.createChild("td", { text: "الاجمالي" }),
            ]
        })
    );
    items.forEach(item => {
        generatedKids.push(
            document.createChild("tr", {
                child: [
                    document.createChild("td", { text: item.Id }),
                    document.createChild("td", { text: item.Fullname }),
                    document.createChild("td", { text: item.Quantity }),
                    document.createChild("td", { text: item.MeasuringUnit }),
                    document.createChild("td", { text: item.UsesWholesalePrice ? "نعم" : "لا" }),
                    document.createChild("td", { text: item.Price + "د.ل" }),
                    document.createChild("td", { text: item.Discount + "د.ل" }),
                    document.createChild("td", { text: (item.Price * item.Quantity - item.Discount) + "د.ل" }),
                ]
            })
        );
    });
    let printPageDiv = document.createChild("div", {
        "print-page": true,
        child: document.createChild("div", {
            container: true,

            child: [
                document.createChild("div", {
                    header: true,
                    child: [
                        document.createChild("img", { "sys-icon": true, width: "26", height: "26", src: "/www/res/images/icons/OIG2.hy8fcL.W0mXTKv.jpg" }),
                        document.createChild("h5", { "sys-name": true, text: "Autoparts System" }),
                        document.createChild("h1", { "business-name": true, text: document.Configs.Business }),
                        document.createChild("i", { "address1": true, text: document.Configs.Address1 }),
                        document.createChild("i", { "address2": true, text: document.Configs.Address2 }),
                        document.createChild("i", { "phones": true, text: "الهاتف " + document.Configs.Phone1 + " " + document.Configs.Phone2 }),
                        document.createChild("i", { "bill-type": true, text: (BillDetailsScreen.SelectedBill.Type == 0 ? "نقدي" : BillDetailsScreen.SelectedBill.Type == 1 ? "اجل" : "مبدئية") }),
                        document.createChild("table", {
                            "bill-info": true,
                            child: [
                                document.createChild("tr", {
                                    child: [
                                        document.createChild("td", { text: "#" }),
                                        document.createChild("td", { text: BillDetailsScreen.SelectedBill.Id })
                                    ]
                                }),
                                document.createChild("tr", {
                                    child: [
                                        document.createChild("td", { text: "العميل" }),
                                        document.createChild("td", { text: BillDetailsScreen.SelectedBill.EName })
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                document.createChild("div", {
                    content: true,
                    child: [
                        document.createChild("table", {
                            "bill-items": true,
                            child: generatedKids
                        }),
                        document.createChild("table", {
                            "bill-signitures": true,
                            child: [
                                document.createChild("tr", {
                                    child: [
                                        document.createChild("td", { colspan: "2", style: "padding: 0.1em;text-align: right;", text: "الموظف : " + document.CurrentUser.Fullname }),
                                        document.createChild("td", { colspan: "2", style: "padding: 0.1em;text-align: right;", text: "التاريخ : " + (new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short', }).format(new Date())) }),
                                        document.createChild("td", { style: "padding: 0.1em;text-align: right;", text: " الاجمالي : " + BillDetailsScreen.SelectedBill.Total + "د.ل" }),
                                    ]
                                }),
                                document.createChild("tr", {
                                    child: [
                                        document.createChild("td", { colspan: "2", style: "padding: 0.1em;text-align: right;", text: " المدفوع : " + BillDetailsScreen.SelectedBill.Payed + "د.ل" }),
                                        document.createChild("td", { colspan: "2", style: "padding: 0.1em;text-align: right;", text: " المتبقي : " + (BillDetailsScreen.SelectedBill.Total - BillDetailsScreen.SelectedBill.Payed) + "د.ل" }),
                                        document.createChild("td", { rowspan: "3", style: "padding: 0.1em;", text: "التوقيع / الختم" }),
                                    ]
                                }),
                                document.createChild("tr", {
                                    child: [
                                        document.createChild("td", {
                                            colspan: "4", rowspan: "3", style: "text-align: right;",
                                            child: [
                                                document.createChild("u", { text: "الملاحظات" }),
                                                document.createChild("br", {}),
                                                document.createChild("ul", {
                                                    child: generatedNoteKids
                                                }),
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]

        })
    });

    //console.log(printPageDiv.innerHTML);
    //mywindow.document.write(printPageDiv.innerHTML);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10
    mywindow.addEventListener('load', () => {
        mywindow.document.body.appendChild(printPageDiv);
        setTimeout(() => {
            mywindow.print();
            mywindow.close();
        }, 350);
    }, true);



    return true;
}

function printBill() {
    if (BillDetailsScreen.SelectedBillDetails == 0) {
        alert("لا يمكن طباعة فاتورة فارغة");
        return;
    }
    const chunkSize = 9;
    const r = BillDetailsScreen.SelectedBillDetails.reduce((arr, item, idx) => (arr[idx / chunkSize | 0] ??= []).push(item) && arr, []);
    try {
        r.forEach(items => {
            printChunkItems(items);
        });
    }
    catch (e) {
        alert("حذثت مشكلة اثناء طباعةالفاتورة");
        console.error(e);
    }
}

async function loadRequiredData() {
    let accounts = await document.loadAllUsers();
    let payments = await document.loadAllPaymentOptions(); // all payments
    let clients = await document.loadAllClients();

    LoadedAccounts = accounts;
    LoadedPayments = payments;
    LoadedClients = clients;

}
async function displayRequiredData() {
    TopbarFormElements.UsersSelect.replaceChildren();
    TopbarFormElements.PaymentSelect.replaceChildren();
    TopbarFormElements.ClientSelect.replaceChildren();

    if (document.currentView.isViewEmbedded) {
        document.modifyElement(TopbarFormElements.UsersSelect, {
            disabled: true,
            child: document.createChild("option", {
                text: document.CurrentUser.Fullname,
                value: document.CurrentUser.Username,
                selected: true
            })
        });
    }
    else {
        document.modifyElement(TopbarFormElements.UsersSelect, {
            child: document.createChild("option", { text: "الكل", value: "all", selected: true })
        });
        LoadedAccounts.forEach(account => {
            document.modifyElement(TopbarFormElements.UsersSelect, {
                child: document.createChild("option", { text: account.Fullname, value: account.Usernames })
            });
        });
    }
    document.modifyElement(TopbarFormElements.PaymentSelect, {
        child: document.createChild("option", { text: "الكل", value: "all", selected: true })
    });
    LoadedPayments.forEach(payment => {
        document.modifyElement(TopbarFormElements.PaymentSelect, {
            child: document.createChild("option", { text: payment.Name, value: payment.Name })
        });
    });
    document.modifyElement(TopbarFormElements.ClientSelect, {
        child: document.createChild("option", { text: "الكل", value: "all", selected: true })
    });
    LoadedClients.forEach(client => {
        document.modifyElement(TopbarFormElements.ClientSelect, {
            child: document.createChild("option", { text: client.EName, value: client.Id })
        });
    });
}

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

    //await loadNotes();
    await loadRequiredData();
    await displayRequiredData();

    fetchTodayBills();
})();