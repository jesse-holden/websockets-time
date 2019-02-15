import axios from "axios";

export class TimeHandler {
  constructor(timezone) {
    this._time = null;
    this._timezone = timezone;
    this._api = axios.create({
      baseURL: "http://worldtimeapi.org/api/timezone/"
    });
  }

  async update() {
    const response = await this._api.get(this._timezone);
    this._time = response.data.datetime;
  }

  getTime() {
    return this._time;
  }
}
