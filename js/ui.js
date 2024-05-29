var MenuManager = {
    Classes: { ON: "show-scale", OFF: "hide-scale" },
    MenuMap: [],
    Menues: null,

    SetMenuLocation(menu, x,y) {
        if (typeof menu == "string") {
            let menu = this.GetMenu(menu);
            menu.style.left = x + 'px';
            menu.style.top = y + 'px';
        }   
        else {
            try {
                menu.style.left = x + 'px';
                menu.style.top = y + 'px';
            } catch (error) {
                
            }
        }
    },
    GetMenu(name) {
        let result = null;
        this.MenuMap.forEach(pair => {
            if (pair.Name === name) {
                result = pair.Menu;
            }
        });

        if(result == null) throw Error("GetMenu() menu not found");

        return result;

    },
    ShowMenuAtPosition(menu, x, y) {
        if (typeof menu == "string") {
            let m = this.GetMenu(menu);
            m.style.top = y + "px";
            m.style.left = x + "px";
            this.ShowMenu(m);
        }
        else {
            if(menu == null) return;
            menu.style.top = y + "px";
            menu.style.left = x + "px";
            this.ShowMenu(menu);
        }
    },
    ShowMenu(menu) {
        if (typeof menu == "string") {
            this.MenuMap.forEach(pair => {
                if (pair.Name === menu) {
                    if(pair.Menu.style.display =="none")
                        pair.Menu.style.display = "block";
                        pair.Menu.parentElement.style.display = "block";
                    pair.Menu.classList.remove(this.Classes.OFF);
                    pair.Menu.classList.add(this.Classes.ON);
                }
            });
        }
        else {
            try {
                menu.classList.remove(this.Classes.OFF);
                menu.classList.add(this.Classes.ON);
                menu.parentElement.style.display = "block";
            } catch (error) {

            }
        }
    },
    HideMenu(menu) {
        if (typeof menu == "string") {
            this.MenuMap.forEach(pair => {
                if (pair.Name === menu) {
                    pair.Menu.classList.remove(this.Classes.ON);
                    pair.Menu.classList.add(this.Classes.OFF);
                    pair.Menu.parentElement.style.display = "none";
                }
            });
        }
        else {
            try {
                menu.classList.remove(this.Classes.ON);
                menu.classList.add(this.Classes.OFF);
                menu.parentElement.style.display = "none";
            } catch (error) {

            }
        }
    },
    Setup() {
        this.Menues = document.querySelectorAll("div.ux-menu:not(div[sub-menu])");
        if (this.Menues == null || this.Menues.length == 0) return;
        this.Menues.forEach((menu, i) => {
            let name = menu.getAttribute("name");
            if(name == null) throw Error("Menu require attribute name");
            this.MenuMap.push({ Name: name, Menu: menu });
            menu.parentElement.onclick = (e) => { this.HideMenu(menu); };
        });

    }
}


MenuManager.Setup();