namespace SubnauticaWatcherInstaller
{
    #region imports

    using System;
    using System.IO;
    using System.Text.RegularExpressions;
    using Microsoft.Win32;

    #endregion

    public class SteamFinder
    {
        public static string FindSteamGamePath(int appid, string gameName)
        {
            if (ReadRegistrySafe("Software\\Valve\\Steam", "SteamPath") == null)
                new Exception("It appears you either don't have steam installed or your regedit variable isn't set.");

            var appsPath = (string) ReadRegistrySafe("Software\\Valve\\Steam", "SteamPath") + "/steamapps/";

            if (File.Exists(appsPath + $"appmanifest_{appid}.acf"))
                return appsPath + "common/" + gameName;
            var path = SearchAllInstalations(appsPath + "libraryfolders.vdf", appid, gameName);
            if (path == "")
                new Exception(
                    $"It appears you don't have {gameName} installed anywhere. Please install {gameName} and try again.");
            else
                return path;
            return "";
        }

        private static string SearchAllInstalations(string libraryfolders, int appid, string gameName)
        {
            var file = new StreamReader(libraryfolders);
            string line;
            while ((line = file.ReadLine()) != null)
            {
                line = line.Trim();
                line = line.Trim('\t');
                line = Regex.Unescape(line);
                var regMatch = Regex.Match(line, "\"(.*)\"\t*\"(.*)\"");
                var key = regMatch.Groups[1].Value;
                var value = regMatch.Groups[2].Value;
                if (!int.TryParse(key, out var number)) continue;
                if (File.Exists(value + $"\\steamapps\\appmanifest_{appid}.acf"))
                {
                    return value + "\\steamapps\\common\\" + gameName;
                }
            }
            return "";
        }

        private static object ReadRegistrySafe(string path, string key)
        {
            using (var subkey = Registry.CurrentUser.OpenSubKey(path))
            {
                var value = subkey?.GetValue(key);
                return value;
            }
        }
    }
}
