import * as $ from "jquery";

export default class ConnectionMonitor {

  private _failedCalls = 0;
  private readonly _failedCallThreshold = 20;

  private readonly _settingsElement: any;

  public constructor() {
    this._settingsElement = $("#game-updates") as any;
  }

  public AreUpdatesEnabled(): boolean {
    return this._settingsElement.is('.is-checked');
  }

  public Success() {
    this._failedCalls = 0;
  }

  public Fail() {
    this._failedCalls += 1;

    if (this._failedCalls > this._failedCallThreshold) {
      ConnectionMonitor.DisplayErrorMessage();
      this.DisableUpdates();
    }
  }

  private static DisplayErrorMessage() {
    const message = "Too many failed connections. Game Updates Disabled. Re-Enable from Menu.";
    const notification: any = document.querySelector('.mdl-js-snackbar');
    notification.MaterialSnackbar.showSnackbar(
      {
        message: message,
        timeout: 30000
      });
  }

  public DisableUpdates() {
    if (this.AreUpdatesEnabled()) {
      (this._settingsElement)[0].MaterialSwitch.off();
    }
  }
}