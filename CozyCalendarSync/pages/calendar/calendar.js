// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/calendar/calendar.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.

            this.allEvents = [];

            var calendarName = WinJS.Navigation.state.name,
                calendar = WinJS.Navigation.state.calendar,
                pageTitle = document.getElementById("pagetitle");
            
            if (calendarName) {
                pageTitle.innerText = calendarName;
            }
           
            if (calendar) {
                //remplit this.allEvents avec tous les évènements du calendrier du serveur dav
                this.getAllEvents(calendar);
            } else {
                console.log("erreur, aucune donnée");
                return
            }//if(calendar)

            //verifie si le calendrier existe déjà sur le tél.
            var that = this;
            console.log("recherche des calendriers windows");
            Windows.ApplicationModel.Appointments.AppointmentManager.requestStoreAsync(0).then(
                function (store) {
                    return store.findAppointmentCalendarsAsync();
                }).then(function (winCalendars) {
                    if (winCalendars.length === 0) {
                        console.log("Aucun calendrier pour cette application");
                        that.createCalendar(calendar);
                    } else {
                        for (var i = 0; i < winCalendars.length; i++) {
                            if (winCalendars[i].displayName === calendar.displayName) {
                                console.log("calendrier existant dans le tel.");
                                that.updateCalendar(calendar);
                                return;
                            }
                            that.createCalendar(calendar);
                        }
                    }
                    
                });
                     
           
                        
        },

        
        createCalendar: function (davCalendar) {
            var allEvents = this.allEvents,
                that = this,
                localSettings = Windows.Storage.ApplicationData.current.localSettings;
            
            Windows.ApplicationModel.Appointments.AppointmentManager.requestStoreAsync(0).then(
                function (store) {
                    return store.createAppointmentCalendarAsync(davCalendar.displayName);
                })
                .then(function (winCalendar) {
                    console.log("Création du calendrier " + winCalendar.displayName + " sur le téléphone");

                    allEvents.forEach(function (event) {
                        if (event.summary) {
                            var winAppointment = that.createAppointment(event);
                            var davId = event.uid,
                                winId = winAppointment.localId;

                            winCalendar.saveAppointmentAsync(winAppointment).done(function (returnValue) {
                                console.log("rdv enregistré ");
                                localSettings.values[davId] = winId;
                            });
                        }
                    });
                    
                    
                    
                });
                

        },

        updateCalendar: function(davCalendar) {
            console.log("mise à jour du calendrier " + davCalendar.displayName + " sur CozyCalendarSync");

            var local = Windows.Storage.ApplicationData.current.localSettings;
            console.log(local.values);
        },

        displayAllEvents: function () {
            var that = this;
            var allEvents = this.allEvents,
                eventsList = document.getElementById("events-list");//<ul>
                        
            allEvents.forEach(function (event) {
                if (event.summary) {
                    var date = event.startDate.toJSON();
                    var tnode = document.createTextNode(date.day + "/" + date.month + "/" + date.year + " " + event.summary);//peut être à tronquer
                    var li = document.createElement("li");
                    li.appendChild(tnode);
                    eventsList.appendChild(li);

                    li.addEventListener("click", function (e) {
                        var appointment = that.createAppointment(event);
                       
                        // Get the selection rect of the button pressed to add this appointment
                        var boundingRect = e.srcElement.getBoundingClientRect();
                        var selectionRect = { x: boundingRect.left, y: boundingRect.top, width: boundingRect.width, height: boundingRect.height };

                        // ShowAddAppointmentAsync returns an appointment id if the appointment given was added to the user's calendar.
                        // This value should be stored in app data and roamed so that the appointment can be replaced or removed in the future.
                        // An empty string return value indicates that the user canceled the operation before the appointment was added.
                        Windows.ApplicationModel.Appointments.AppointmentManager.showAddAppointmentAsync(appointment, selectionRect, Windows.UI.Popups.Placement.default)
                            .done(function (appointmentId) {
                                if (appointmentId) {
                                   console.log("Appointment Id: " + appointmentId);
                                } else {
                                    console.log("Appointment not added");
                                }
                            });
                    }, false);
                }

            });

        },

        createAppointment: function(ICALEvent){
            var event = ICALEvent,
                date = event.startDate;

            var appt = new Windows.ApplicationModel.Appointments.Appointment();
            appt.details = event.description;
            appt.duration = event.duration.toSeconds() * 1000; //en ms
            appt.location = event.location || "";
            appt.subject = event.summary;
            appt.startTime = new Date(date.year, date.month - 1, date.day, date.hour, date.minute, date.second, 0);
            //apparemment il y a un décalage d'un mois entre Windows et Ical
            console.log(appt);
            return appt;
            
        },
                
        getAllEvents: function (calendar) {
            var allEvents = this.allEvents;
            
            calendar.objects.forEach(function (object) {
                    
                var icalString = object.calendarData,//la propriété calendarData contient la chaine de caractère ics
                    jCal = ICAL.parse(icalString);//premier coup de parser

                if (jCal) {//si la string ics est invalide jCal est undefined
                    var component = new ICAL.Component(jCal);
                } else {
                    console.log("impossible de créer l'évènement");
                    return
                }
                
                if (component) {
                    var subComponents = component.getAllSubcomponents();//[Component, Component, ...]
                    subComponents.forEach(function (subComp) {
                        var event = new ICAL.Event(subComp);
                        allEvents.push(event);
                    });
                }

            });

           // console.log(this.allEvents);
        },


        unload: function () {
            
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        },


        allEvents: []
    });
})();
