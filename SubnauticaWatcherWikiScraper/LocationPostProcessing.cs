namespace SubnauticaWatcherWikiScraper
{
    #region imports

    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text.RegularExpressions;
    using NLog;

    #endregion

    public class LocationPostProcessing
    {
        private static readonly Logger Logger = LogManager.GetCurrentClassLogger();

        private static readonly Regex EditTextRegex = new Regex(
            @"Edit$",
            RegexOptions.Compiled);

        public static IEnumerable<MapLocation> PostProcess(IEnumerable<MapLocation> locations)
        {
            Logger.Info("Starting Post-Processing.");

            var result = locations as IList<MapLocation> ?? locations.ToList();
            return result.Select(
                l =>
                {
                    FixScrapingArtefacts(l);
                    DetermineLocationType(l);
                    DetermineBiome(l);
                    return l;
                });
        }

        private static void FixScrapingArtefacts(MapLocation location)
        {
            location.RawCategory = EditTextRegex.Replace(location.RawCategory, "");
            location.RawComment = EditTextRegex.Replace(location.RawComment, "");
        }

        private static void DetermineLocationType(MapLocation location)
        {
            var type = MarkerType.Unknown;
            if (Regex.IsMatch(location.RawComment, @"Thermal Vents", RegexOptions.Singleline | RegexOptions.IgnoreCase))
            {
                type = MarkerType.ThermalVent;
            }
            else if (Regex.IsMatch(
                location.RawComment,
                @"Lava Geyser",
                RegexOptions.Singleline | RegexOptions.IgnoreCase))
            {
                type = MarkerType.LavaGeyser;
            }
            else if (Regex.IsMatch(location.RawComment, @"wreck", RegexOptions.Singleline | RegexOptions.IgnoreCase))
            {
                type = MarkerType.Wrecks;
            }
            else if (Regex.IsMatch(location.RawComment, @"lifepod", RegexOptions.Singleline | RegexOptions.IgnoreCase))
            {
                type = MarkerType.Lifepods;
            }
            else if (Regex.IsMatch(location.RawComment, @"seabase", RegexOptions.Singleline | RegexOptions.IgnoreCase))
            {
                type = MarkerType.Seabases;
            }
            else if (Regex.IsMatch(location.RawComment, @"cave", RegexOptions.Singleline | RegexOptions.IgnoreCase))
            {
                type = MarkerType.Caves;
            }
            else if (Regex.IsMatch(
                location.RawCategory,
                @"precursor",
                RegexOptions.Singleline | RegexOptions.IgnoreCase))
            {
                type = MarkerType.Precursor;
            }
            else if (Regex.IsMatch(
                location.RawCategory,
                @"leviathan spawn",
                RegexOptions.Singleline | RegexOptions.IgnoreCase))
            {
                type = MarkerType.Leviathan;
            }
            else if (Regex.IsMatch(location.RawCategory, @"minor", RegexOptions.Singleline | RegexOptions.IgnoreCase))
            {
                type = MarkerType.Other;
            }

            if (type != MarkerType.Wrecks
                && Regex.IsMatch(
                    location.RawComment,
                    @"\b(entrance|opening)\b",
                    RegexOptions.Singleline | RegexOptions.IgnoreCase))
            {
                type = MarkerType.Transition;
            }

            if (type == MarkerType.Unknown)
            {
                Logger.Debug($"Unable to determine location type for: {location.RawCategory}, {location.RawComment}");
                type = MarkerType.Other;
            }

            location.Type = type;
        }

        private static IEnumerable<T> GetEnumValues<T>()
        {
            return (T[]) Enum.GetValues(typeof(T));
        }

        private static void DetermineBiome(MapLocation location)
        {
            var biomes = GetEnumValues<Biome>();
            location.Biome =
                biomes.Where(
                          b =>
                          {
                              var name = string.Concat(
                                                   b.ToString()
                                                    .Select(x => char.IsUpper(x) ? " " + x : x.ToString()))
                                               .TrimStart(' ');
                              return location.RawComment.IndexOf(name, StringComparison.InvariantCultureIgnoreCase)
                                     >= 0;
                          })
                      .Aggregate(Biome.Unknown, (combined, value) => combined | value);

            if (location.Biome == Biome.Unknown)
            {
                Logger.Debug($"Unable to determine biome for: {location.RawComment}");
            }
        }
    }
}
