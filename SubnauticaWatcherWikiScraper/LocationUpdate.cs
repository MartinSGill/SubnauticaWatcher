namespace SubnauticaWatcherWikiScraper
{
    #region imports

    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.IO;
    using System.Linq;
    using System.Net;
    using System.Text;
    using System.Text.RegularExpressions;
    using NLog;
    using Supremes;
    using Supremes.Nodes;

    #endregion

    public class LocationUpdate
    {
        private static readonly Logger Logger = LogManager.GetCurrentClassLogger();

        public static IEnumerable<MapLocation> UpdateMapLocations()
        {
            Logger.Info("Begging location update.");

            var response = DownloadPage(new Uri("http://subnautica.wikia.com/wiki/Mapping_Subnautica"));
            var contents = GetPageContents(response);
            var locations = ExtractCoordinates(contents);

            IEnumerable<MapLocation> updateMapLocations = locations as IList<MapLocation> ?? locations.ToList();
            updateMapLocations = LocationPostProcessing.PostProcess(updateMapLocations);

            return updateMapLocations;
        }

        public static string GetPageContents(WebResponse response)
        {
            StreamReader reader = null;
            try
            {
                Logger.Info("Reading Page Data.");
                Debug.Assert(response != null, "response != null");
                reader = new StreamReader(response.GetResponseStream() ?? throw new InvalidOperationException(), Encoding.UTF8);
                return reader.ReadToEnd();
            }
            finally
            {
                reader?.Close();
            }
        }

        public static WebResponse DownloadPage(Uri url)
        {
            WebResponse response = null;
            try
            {
                Logger.Info("Downloading Data.");
                Logger.Debug($"Downloading from: '{url}'");
                var request = (HttpWebRequest) WebRequest.Create(url);
                request.Method = "GET";
                response = request.GetResponse();
                Logger.Debug($"Response Received.");
                return response;
            }
            catch (Exception ex)
            {
                Logger.Error(ex);
                response?.Close();
                throw;
            }
        }

        public static IEnumerable<Tuple<string, Element>> ExtractCoordinateTables(Document document)
        {
            Logger.Info("Looking for Coordinate Tables.");
            var headers = document.Select("h2");

            var result = new List<Tuple<string, Element>>();
            foreach (var header in headers)
            {
                // Hunt for table:
                var next = header.NextElementSibling;
                while (next != null && next.TagName != "table" && next.TagName != "h2")
                {
                    next = next.NextElementSibling;
                }

                if (next != null && next.TagName == "table")
                {
                    Logger.Debug($"Found a table with heading: '{header.Text}'");
                    if (header.Text.Contains("Coordinate Conventions"))
                    {
                        Logger.Debug($"Ignoring table: '{header.Text}'");
                    }
                    else
                    {
                        result.Add(new Tuple<string, Element>(header.Text, next));
                    }
                }
            }

            Logger.Debug($"Found {result.Count} tables." );
            return result;
        }

        public static IEnumerable<IEnumerable<string>> CollectColumns(Tuple<string, IEnumerable<string>> tuple)
        {
            return
                tuple.Item2.Where((e, i) => i % 2 == 0)
                     .Zip(
                         tuple.Item2.Where((e, i) => i % 2 != 0),
                         (s, s1) => new List<string> {s, s1}
                     );
        }

        public static IEnumerable<MapLocation> ExtractCoordinates(string webpage)
        {
            Logger.Info("Looking for Locations.");
            var document = Dcsoup.Parse(webpage);
            var tables = ExtractCoordinateTables(document);

            return tables
                .Select(
                    t => new Tuple<string, IEnumerable<string>>(t.Item1, t.Item2.Select("td").Select(c => c.Text)))
                .Select(
                    tuple => new Tuple<string, IEnumerable<IEnumerable<string>>>(tuple.Item1, CollectColumns(tuple)))
                .SelectMany(ToMapLocationFromCategoryAndColumns);
        }

        public static IEnumerable<MapLocation> ToMapLocationFromCategoryAndColumns(
            Tuple<string, IEnumerable<IEnumerable<string>>> t)
        {
            var header = t.Item1;

            return t.Item2.Select(
                        c =>
                        {
                            var coordList = c as IList<string> ?? c.ToList();

                            try
                            {
                                var coords = Regex.Split(coordList.First(), @"\s+");
                                var comment = coordList.Skip(1).First();

                                return new MapLocation
                                {
                                    RawCategory = header,
                                    RawComment = comment,
                                    X = int.Parse(coords[0]),
                                    Z = int.Parse(coords[1]),
                                    Y = int.Parse(coords[2])
                                };
                            }
                            catch (Exception ex)
                            {
                                Logger.Error($"Cannot Process Entry: '{coordList.First()}' in '{header}'");
                                Logger.Error(ex);
                                return null;
                            }
                        })
                    .Where(i => i != null);
        }
    }
}
