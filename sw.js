/// <reference lib="WebWorker" />

"use strict";

/*
 * Scramjet service worker.
 *
 * IMPORTANT:
 * This file must be served from the SAME origin/path as
 * the page using it.
 */

const tabs = new Map();

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

class ControllerReference {

  constructor(prefix, id, port) {

    this.prefix = prefix;
    this.id = id;
    this.port = port;

    port.onmessage = event => {

      const data = event.data;

      if (!data)
        return;

      /*
       * Requests are handled by the controller.
       */
      if (data.$controller$ready) {
        return;
      }

      this.port.postMessage(data);
    };

    port.onmessageerror = console.error;
  }
}


/*
 * Controller initialization.
 */
self.addEventListener("message", event => {

  const data = event.data;

  if (!data || typeof data !== "object")
    return;

  if (
    data.$controller$init &&
    event.ports &&
    event.ports[0]
  ) {

    const init =
      data.$controller$init;

    const existing =
      tabs.get(init.id);

    if (existing) {
      tabs.delete(init.id);
    }

    const controller =
      new ControllerReference(
        init.prefix,
        init.id,
        event.ports[0]
      );

    tabs.set(
      init.id,
      controller
    );

    /*
     * Tell the controller that the
     * service worker is alive.
     */
    controller.port.postMessage({
      $sw$ready: true
    });
  }

});


/*
 * Determine whether a request belongs
 * to one of the Scramjet controllers.
 */
function findController(url) {

  for (const controller of tabs.values()) {

    if (
      url.pathname.startsWith(
        controller.prefix
      )
    ) {
      return controller;
    }

  }

  return null;
}


/*
 * Route proxied requests.
 */
self.addEventListener(
  "fetch",
  event => {

    const url =
      new URL(
        event.request.url
      );

    const controller =
      findController(url);

    if (!controller)
      return;

    event.respondWith(
      new Promise(resolve => {

        const requestId =
          makeId();

        const channel =
          new MessageChannel();

        channel.port1.onmessage =
          event => {

            const response =
              event.data;

            if (
              response &&
              response.body
            ) {

              resolve(
                new Response(
                  response.body,
                  {
                    status:
                      response.status || 200,

                    statusText:
                      response.statusText || "",

                    headers:
                      response.headers || {}
                  }
                )
              );

            } else {

              resolve(
                new Response(
                  "Scramjet request failed.",
                  {
                    status: 502
                  }
                )
              );

            }

          };

        controller.port.postMessage({

          $sw$request: {

            id: requestId,

            url:
              event.request.url,

            method:
              event.request.method,

            headers:
              [...event.request.headers],

            destination:
              event.request.destination,

            mode:
              event.request.mode,

            referrer:
              event.request.referrer

          }

        }, [
          channel.port2
        ]);

      })
    );

  }
);


/*
 * Activate immediately.
 */
self.addEventListener(
  "install",
  event => {

    self.skipWaiting();

  }
);


/*
 * Take control immediately.
 */
self.addEventListener(
  "activate",
  event => {

    event.waitUntil(
      self.clients.claim()
    );

  }
);
