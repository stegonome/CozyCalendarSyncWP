(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/home/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            this.test();
            //
           //dav.debug.enabled = true;
            

            // TODO: Initialize the page here.

            //DEBUG ALLER DIRECTEMENT A CALENDAR.HTML
            //WinJS.Navigation.navigate("/pages/calendar/calendar.html");

            var button = document.getElementById("connect_button");
            button.addEventListener("click", this.buttonClickHandler, false);

            var vault = new Windows.Security.Credentials.PasswordVault();

            try {
                var credentials = vault.findAllByResource("cozycalendarsync");
                var user = vault.retrieve("cozycalendarsync", credentials[0].userName);
                var url = user.userName;
                var pwd = user.password;
                document.getElementById("url_input").value = url;
                document.getElementById("password_input").value = pwd;
            } catch (e) {
                console.log("aucun login pour cette application");
            }
            

            
           
        },
        buttonClickHandler: function (e) {
            var sts_str = "";
            var connection_status_div = document.getElementById("connection_status");
            //récupérer les entrées utilisateur
            var url_input = document.getElementById("url_input"),
                pwd_input = document.getElementById("password_input");

            var url = "https://" + url_input.value + ".cozycloud.cc/public/sync/",
                pwd = pwd_input.value;

            //
            sts_str = "Tentative de connexion à : " + url;
            connection_status_div.innerText = sts_str;
            console.log(sts_str);

            //création dav
            var xhr = new dav.transport.Basic(new dav.Credentials({
                username: 'me',
                password: pwd
                })
            );

            var davClient = new dav.Client(xhr);

            davClient.createAccount({ server: url, accountType: "caldav" })
            .then(
                function (account) {
                    //connection réussie
                    sts_str = "Connecté à " + url;
                    connection_status_div.innerText = sts_str;
                    console.log(sts_str);

                    //enregistrer les données de connexion
                    var vault = new Windows.Security.Credentials.PasswordVault();
                    var credentials = new Windows.Security.Credentials.PasswordCredential("cozycalendarsync", url_input.value, pwd);
                    WinJS.Namespace.define("cred", credentials);
                    vault.add(credentials);
                    console.log("enregistrement des données de session");

                    //synchronisation du compte
                    davClient.syncCaldavAccount(account).then(function (syncAccount) {
                        console.log("synchronisation du compte effectuée");
                        //creation des div calendars
                        var calendars_div = document.getElementById("calendars");
                        syncAccount.calendars.forEach(function (calendar) {
                            var name = calendar.displayName;
                            var caldiv = document.createElement("div");
                            caldiv.style.border = "solid";
                            caldiv.style.height = "30px";
                            caldiv.innerText = name;
                            caldiv.onclick = function (e) {
                                WinJS.Navigation.navigate("/pages/calendar/calendar.html", { name: name, calendar: calendar });
                            };
                            calendars_div.appendChild(caldiv);

                        });//forEach
                    });//syncCalDavAccount.then()
                    
                }, function (error) {
                    connection_status_div.innerText = "Impossible d'établir la connexion avec le serveur, essayez de \n" +
                    "rentrer les données de connexion à nouveau.";
                    console.log("Impossible d'établir la connexion avec le serveur");
            });//then()
        },
        test: function () {
           

            var appt = new Windows.ApplicationModel.Appointments.Appointment();
            appt.startTime = new Date(2015, 11, 14, 11, 11, 0, 0);
            appt.subject = "rdv test";
            appt.details = "un test de rdv";
            appt.duration = 60 * 60 * 1000;

            
            

            Windows.ApplicationModel.Appointments.AppointmentManager.requestStoreAsync(0).done(function (apptstore) {
                WinJS.Namespace.define("apptstore", apptstore);

                

                apptstore.findAppointmentCalendarsAsync().done(function (list) {
                    console.log("liste des calendriers", list);

                 list.forEach(function (cal) {
                        cal.deleteAsync().done(function () {
                            console.log("calendrier effacé", cal.displayName);
                        });
                    });
                });

                
               /* var apptCal = apptstore.createAppointmentCalendarAsync("testCal2").done(function (apptCal) {
                    console.log("calendrier créé");
                    WinJS.Namespace.define("apptCal", apptCal);
                    apptCal.saveAppointmentAsync(appt);
                   
                });
                 */
            });
          
        
        }
       
    });
})();
