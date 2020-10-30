export const SERVER_HOST = window.location.hostname;
export const SERVER_PORT = 5000;
export const SERVER_ROOT_URL = `http://${SERVER_HOST}:${SERVER_PORT}`;

export const MAX_CARDS = 4;

export const WS_DATA_ERRORS = ['error'];
export const WS_CONN_ERRORS = ['connect_error', 'connect_timeout', 'disconnect', 'reconnect_error', 'reconnect_failed'];