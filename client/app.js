function addLogMessage(message) {
    const msgContainer = document.querySelector(".log-message-container");
    const firstChild = msgContainer.firstChild;

    const msgElem = document.createElement("p");
    msgElem.innerHTML = message;

    msgContainer.insertBefore(msgElem, firstChild);
}


function log(...args) {
    const msg = args.reduce((acc, curArg) => {
        let curArgStr;
        if (curArg === undefined) {
            curArgStr = "undefined";
        }
        else if (curArg === null) {
            curArgStr = "null";
        }
        else if (typeof curArg === 'object') {
            curArgStr = JSON.stringify(curArg, undefined, 4);
        }
        else {
            curArgStr = curArg.toString();
        }

        return acc + curArgStr;
    }, "");
    addLogMessage(msg);
}


function remoteDbUrl(dbName) {
    const DB_SERVER_URL = "http://localhost:5984";
    return `${DB_SERVER_URL}/${dbName}`;
}


function setupSyncPair(dbName) {
    const localDb = new PouchDB(dbName);
    const remoteDb = new PouchDB(remoteDbUrl(dbName));

    //
    // Try disabling the sync heartbeat.  Neither of the following seems to
    // change the sync's ability to resume in my testing.
    //

    // const sync = PouchDB.sync(localDb,
    //                           remoteDb,
    //                           {live: true, retry: true, heartbeat: false});

    const sync = PouchDB.sync(localDb,
                              remoteDb,
                              {
                                  live: true,
                                  retry: true,
                                  push: {heartbeat: false},
                                  pull: {heartbeat: false}
                              });

    return {remoteDb, localDb, sync};
}


function updateDocInRemoteDb(syncInfo) {
    const docId       = "mydoc";
    const currentTime = new Date().toString();

    syncInfo.remoteDb.get(docId)
    .catch((err) => {
        if (err.name === "not_found") {
            // The doc doesn't exist yet.  We will create it.
            return {_id: docId};
        }

        log("Not updating document in remote db.  It appears to be offline.");
        throw err;
    })
    .then((doc) => {
        doc.currentTime = currentTime;
        return syncInfo.remoteDb.put(doc);
    })
    .then((putResult) => {
        log("Document updated: ok=", putResult.ok);
    });

}


function main() {
    const syncInfo = setupSyncPair("mytestdb");

    syncInfo.sync
    .on("change", function onChange(info) {
        log("sync event 'change'");
    })
    .on("paused", function onPaused(err) {

        if (err) {
            log("sync event 'paused':", err);
        }
        else {
            log("sync event 'paused'");
        }

    })
    .on("active", function onActive() {
        log("sync event 'active':");
    })
    .on("denied", function onDenied(err) {
        log("sync event 'denied':", err);
    })
    .on("complete", function onComplete(info) {
        log("sync event 'complete':", info);
    })
    .on("error", function onError(err) {
        log("sync event 'error':", err);
    });

    setInterval(
        () => {
            updateDocInRemoteDb(syncInfo);
        },
        3 * 1000
    );
}


window.addEventListener('DOMContentLoaded', (event) => {
    main();
});
