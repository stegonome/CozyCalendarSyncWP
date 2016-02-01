// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=329104
(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll());

            var btn = document.getElementById("button");

            btn.addEventListener("click", getCozyCalendars , false);

        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };


    function createTestApt(e) {
        var rdv = new Windows.ApplicationModel.Appointments.Appointment();

        rdv.startTime = new Date(2015, 08, 28, 15); //28 aout 2015 15h00
        rdv.duration = (60 * 60 * 1000) // 1 heure
        rdv.details = "Test de rdv créé programmatiquement"

        var boundingRect =e.srcElement.getBoundingClientRect();
        var selectionRect = { x: boundingRect.left, y: boundingRect.top, width: boundingRect.width, height: boundingRect.height };


        Windows.ApplicationModel.Appointments.AppointmentManager.showAddAppointmentAsync(rdv, selectionRect);

    }


    function getCozyCalendars(e) {
          var xhr = new dav.transport.Basic(
          new dav.Credentials({
              username: 'me',
              password: 'l1HDmgw6mW'
          })
        );

        dav.createAccount({ server: "https://denissignoret.cozycloud.cc/public/sync/principals/me", xhr: xhr })
        .then(function (account) {
            // account instanceof dav.Account
            account.calendars.forEach(function (calendar) {
                console.log('Found calendar named ' + calendar.displayName);
                // etc.
            });
        });
    }
    

    app.start();
})();
