namespace SubnauticaWatcherWikiScraper
{
    #region imports

    using System;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;

    #endregion

    [Flags]
    [JsonConverter(typeof(FlagConverter))]
    public enum Biome : ulong
    {
        Unknown = 0x0,
        BloodKelp = 0x1,
        Bulb = 0x2,
        CragField = 0x4,
        Crash = 0x8,
        Dunes = 0x10,
        GrandReef = 0x20,
        GrassyPlateaus = 0x40,
        KelpForest = 0x80,
        Mountains = 0x100,
        MushroomForest = 0x200,
        SafeShallows = 0x400,
        SeaTreadersPath = 0x800,
        SparseReef = 0x1000,
        UnderwaterIslands = 0x2000,
        FloatingIsland = 0x4000,
        MountainIsland = 0x8000,
        BloodKelpCaves = 0x10000,
        BoneFieldCaves = 0x20000,
        BulbZoneCaves = 0x40000,
        DeepGrandReef = 0x80000,
        DeepSparseReef = 0x100000,
        DunesCaves = 0x200000,
        GrandReefCaves = 0x400000,
        GrassyPlateauCaves = 0x800000,
        InactiveLava = 0x1000000,
        JellyShroomCaves = 0x2000000,
        KelpForestCaves = 0x4000000,
        LaveLakes = 0x8000000,
        LostRiver = 0x10000000,
        MountainRangeCaves = 0x20000000,
        MushroomForestCaves = 0x40000000,
        SafeShallowsCaves = 0x80000000,
        SeaTreadersTunnelCaves = 0x100000000,
        UnderwaterIslandsCaves = 0x200000000
    }

    [JsonConverter(typeof(StringEnumConverter))]
    public enum MarkerType
    {
        Unknown,
        ThermalVent,
        LavaGeyser,
        Wrecks,
        Lifepods,
        Seabases,
        Caves,
        Precursor,
        Transition,
        Leviathan,
        Other
    }

    public class MapLocation
    {
        public int X { get; set; }
        public int Y { get; set; }
        public int Z { get; set; }

        public Biome Biome { get; set; }

        public MarkerType Type { get; set; }

        public string RawComment { get; set; }

        public string RawCategory { get; set; }
    }
}
