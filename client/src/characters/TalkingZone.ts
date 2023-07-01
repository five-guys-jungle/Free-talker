export interface Coordinate {
    x: number;
    y: number;
}

export interface TalkingZone {
    [placeName: string]: {
      first_seat: Coordinate;
      second_seat: Coordinate;
    };
  }
  