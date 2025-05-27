export const MAX_ROOM_SIZE: number = 12;

export const MIN_PLAYER_TO_START: number = 3;

export const START_TIME: number = 30;

export const SHOW_WORD_DIALOG_TIME: number = 10000;

export const MAX_PLAYER_NAME_LENGTH_TABLE: number = 8;

export const MAX_HINT_LENGTH_TABLE: number = 12;

export const MAX_TIP_LENGTH_LIST: number = 15;

export const MAX_PLAYER_NAME_LENGTH_LIST: number = 8;

export const MAX_PLAYER_NAME_LENGTH_END_DIALOG: number = 20;

export const START_CHAR: number = 0;

export const MAX_TIME: number = 300;

export enum GAMESTATUS {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  SHOWWORD = 'showWord',
  END = 'end',
}

export enum SESSION_NAMES {
  ROOM_NAME = 'roomName',
  ROOM_ID = 'roomId',
  PLAYER_ID = 'playerId',
  GAME_STATUS = 'gameStatus',
  PLAYER_SIZE = 'playerSize',
  CURRENT_TURN = 'currentTurn',
  FRONTEND_STATE = 'frontendStatus',
}

export enum STATE_NAMES {
  HINT_UPDATE = 'hintUpdate',
  TIP_UPDATE = 'tipUpdate',
  NEXT_ROUND_UPDATE = 'nextRoundUpdate',
  CHOOSE_WORD_UPDATE = 'chooseWordUpdate',
  CHOOSEN_WORD_UPDATE = 'choosenWordUpdate',
  SHOW_WORD = 'showWord',
}

export enum FRONTEND_STATUS {
  WAIT_HINT = 'Várakozás a segítségadásra...',
  WAIT_TIPPS = 'Várakozás a tippek megadására...',
  WAIT_OTHERS = 'A többi játékos még gondolkozik...',
  WAIT_PROCESS = 'Várakozás a tippek elbírálására...',
  WAIT_CHOOSE_WORD = 'Várakozás a szó kiválasztására...',

  CHOOSE_WORD = 'Válassz ki egy szót!',
  GIVE_TIPP = 'Adj meg egy tippet!',
  GIVE_HINT = 'Adj meg egy segítséget!',
  PROCESS_TIPPS = 'Bíráld el a tippeket!',

  END_ROUND = 'Pontok kiosztása',
}
