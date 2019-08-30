# pouchdb_stops_syncing
Reproduces an issue where PouchDB stops syncing

# Issue

In Safari, if a live sync is successfully established between a local and and remote database and then connectivity is lost to the remote database and then restored, the sync stalls.  After this point, documents written to the remote database no longer sync into the local database.

- This issue exists on mobile Safari as well.
- This issue may be related to issue #7824.

# Info

Environment
- Node.js: v10.13.0
- Safari:  12.1 (13607.1.40.1.5)
- PouchDB: 7.1.1

Adapter: IndexDB (Safari default)

Server: [pouchdb-server](https://www.npmjs.com/package/pouchdb-server) (installed as a dependency is the referenced repository's package.json)

# Reproduce

In order to reproduce this issue in a minimal way,[this repo](https://github.com/kwpeters/pouchdb_stops_syncing) has been created.

1. Clone [this repo](https://github.com/kwpeters/pouchdb_stops_syncing)
    ```
    git clone https://github.com/kwpeters/pouchdb_stops_syncing.git
    ```
2. Install dependencies.
    ```
    npm install
    ```
3. In a Terminal window, start the pouchdb-server that will host the remote
   database.
    ```
    npm run start-db-server
    ```
4. In another Terminal window, start a http server that will host the demo web page.
    ```
    npm run start-http-server
    ```
5. Open Safari and navigate to [http://localhost:8000](http://localhost:8000).  This web page will setup a sync between a local (browser) database and a remote database on the server.  Then, it will attempt to update a document in the __remote__ database every 3 seconds.
5. Observe that the sync has been successfully established.  You should see messages stating that the document was successfully written, followed by messages that the sync object has emitted the "active", "change" and "pause" events.
6. Stop the pouchdb-server running in the server Terminal window by pressing Ctrl-C.  At this point, you will start seeing messages in the browser stating that it cannot update the document in the remote database.  This is expected.
7. Start the pouchdb-server again (the same command as in step 3).
    ```
    npm run start-db-server
    ```
8. Observe that the web page is now able to successfully update the document in the remote database.  Also observe that the sync is no longer working.  The document is being updated, but the sync object is no longer emitting the "active", "change" and "pause" events.

If the above procedure is performed with the Chrome browser, the sync resumes working in step 8 (the "active", "change" and "pause" events resume).

Note:  Once in the state described in step 8, if a document is written to Safari's __local__ database, it seems to "kick start" the sync, and it starts working once again.  I don't feel this should be necessary, though.
