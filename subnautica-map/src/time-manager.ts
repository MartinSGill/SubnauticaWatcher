import * as $ from "jquery";
import { IDayNightInfo } from "./interfaces";

export default class TimeManager {

  public UpdateTrigger() {
    $.getJSON("/?DayNightInfo=").done((data: IDayNightInfo) => {
      TimeManager.SetGameTimeCycle(data.DayScalar, data.Day);
    });
  }

  private static ToFuzzyTime(time:number): string {
    // 0 is midnight
    // 0.5 is noon

    if (time < 0.05) return "Around Midnight";
    if (time < 0.2)  return "After Midnight";
    if (time < 0.3)  return "Early Morning";
    if (time < 0.45) return "Morning";
    if (time < 0.55) return "Around Noon";
    if (time < 0.75) return "Afternoon";
    if (time < 0.8)  return "Evening";
    if (time < 0.95) return "Night";

    return "Around Midnight";
  }

  private static SetGameTimeCycle(time: number, days: number) {
    const angle = time * 360;
    const imageResult = $("#day-night-image");
    const imageElement = (imageResult[0] as HTMLImageElement);
    imageElement.src = 'data/day-night-wheel.png';
    imageResult.css('transform', 'rotate(-' + angle + 'deg)');
    imageResult.css('visibility', 'visible');
    $("#day-night-tooltip")[0].innerHTML = TimeManager.ToFuzzyTime(time) +  "<br/>Day " + Math.floor(days);
  }
}
