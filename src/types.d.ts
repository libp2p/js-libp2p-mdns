/**
 *
 * @param {object} peerInfo
 */
declare class GoMulticastDNS {
    constructor(peerInfo: any);
    /**
     *
     * @param {function} callback
     */
    start(callback: (...params: any[]) => any): void;
    /**
     *
     * @param {object} peerInfo
     */
    _onPeer(peerInfo: any): void;
    /**
     *
     * @param {function} callback
     */
    stop(callback: (...params: any[]) => any): void;
}

/**
 *
 * @param {object} peerId
 * @param {object} options
 */
declare class Querier {
    constructor(peerId: any, options: any);
    /**
     *
     * @param {function} callback
     */
    start(callback: (...params: any[]) => any): void;
    /**
     *
     * @param {object} event
     * @param {object} info
     */
    _onResponse(event: any, info: any): void;
    /**
     *
     * @param {function} callback
     */
    stop(callback: (...params: any[]) => any): void;
}

/**
 * Run `fn` for a certain period of time, and then wait for an interval before
 * running it again. `fn` must return an object with a stop function, which is
 * called when the period expires.
 *
 * @param {Function} fn function to run
 * @param {Object} [options]
 * @param {Object} [options.period] Period in ms to run the function for
 * @param {Object} [options.interval] Interval in ms between runs
 * @returns {Object} handle that can be used to stop execution
 */
declare function periodically(fn: (...params: any[]) => any, options?: {
    period?: any;
    interval?: any;
}): any;

/**
 *
 * @param {object} peerInfo
 */
declare class Responder {
    constructor(peerInfo: any);
}

/**
 *
 * @param {object} options
 */
declare class MulticastDNS {
    constructor(options: any);
    /**
     *
     * @param {function} callback
     */
    start(callback: (...params: any[]) => any): void;
    /**
     *
     * @param {object} peerInfo
     */
    _onPeer(peerInfo: any): void;
    /**
     *
     * @param {function} callback
     */
    stop(callback: (...params: any[]) => any): void;
}

