namespace SubnauticaWatcherWikiScraper
{
    using System.IO;
    using Newtonsoft.Json;
    using NLog;

    internal class Program
    {
        private static readonly Logger Logger = LogManager.GetCurrentClassLogger();

        public static void Main()
        {
            Logger.Info("Starting.");

            var locations = LocationUpdate.UpdateMapLocations();
            var json = JsonConvert.SerializeObject(locations);
            var outputPath = Path.Combine(Directory.GetCurrentDirectory(), "wiki_map_locations.json");

            Logger.Info($"Writing Data to: '{outputPath}'.");
            File.WriteAllText(outputPath, json);

            Logger.Info("Finished.");
        }
    }
}
