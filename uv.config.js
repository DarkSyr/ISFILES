/* Ultraviolet client config — static hosting + remote Bare */
self.__uv$config = {
  prefix: "/service/",
  /*
   * Bare endpoint(s). Classic UV accepts a string or an array.
   * Replace with any working Bare v1/v2 server if these are down.
   * You do NOT need to run Bare yourself if you use a public one.
   */
  bare: [
    "https://uv.holyubofficial.net/"
  ],
  encodeUrl: Ultraviolet.codec.xor.encode,
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: "/uv.handler.js",
  bundle: "/uv.bundle.js",
  config: "/uv.config.js",
  sw: "/uv.sw.js",
};
