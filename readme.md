# SubnauticaWatcher Mod

## Purpose

This mod adds a "live" map to the Subnautica game. This can be considered a spoiler for the game.

Should the Subnautica development team ever add an auto-map or ingame map feature, this mod will be obsoleted.

## Capabilities

* Shows current player position
* Shows lifepod position
* Shows all beacons/pings available to player.

__Caveats:__ Background images and additional overlay data taken from Wiki and may be out-of-date.

![Mod in Use](images/mod-example-overlay.png "Mod In Use")

## Installation

__Warning:__ While attempts have been made to ensure this mod does not interfere with other mods, this cannot
be guaranteed.

__Warning:__ Only works on __Experimental__ branch.

__Warning:__ You may need to repeat steps 4 to 6 whenever Steam updates Subnautica.

1. Download the latest Release zip
2. Extract the zip into your Subnautica installation folder, (usually `Steam\steamapps\common\Subnautica`)
3. Unless updating, or unless you have another mod installed it should not normally require overwriting of anything.
4. In your `Steam\steamapps\common\Subnautica\SubnauticaWatcherInstaller` folder run `SubnauticaWatcherInstaller.exe`
5. Click the "Install" button.
6. Check for errors, then exit `SubnauticaWatcherInstaller.exe`.

## Usage

1. Run Subnautica as usual
2. Open Steam Overlay (usually by pressing "shift-tab")
3. Select "Web Browser"
4. Enter the URL: http://localhost:63030

## Troubleshooting

### Untrusted Publisher / Application

If you receive this warning from Windows, it's because this application isn't signed.

If you decide you want to trust this program, or you've read the source code and assured yourself it's benign, then you can [run the program anyway][1].

### Logs

As of version 0.3.0 the installer creates logs to help with error reporting and resolving issues.

You can find the logs in `Steam\steamapps\common\Subnautica\SubnauticaWatcherInstaller\Logs\{data}.log`

### Restore Subnautica to pristine state



1. Delete folder `Steam\steamapps\common\Subnautica\Subnautica_Data\Managed`
2. This will remove not only this mod, but every single other mod/tools/change you've made to this folder.
3. Open Steam
4. Find Saubnautica in your games list
5. Right-click and Select 'Properties'
6. On the 'Local Files' tab click on 'Verify Integrity of Game Files...'

This will cause steam to re-download all files that might have been changed by this mod, or other programs/mods.

[1]:https://www.pcworld.com/article/3197443/windows/how-to-get-past-windows-defender-smartscreen-in-windows-10.html