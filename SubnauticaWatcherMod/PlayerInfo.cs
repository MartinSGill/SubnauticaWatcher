namespace SubnauticaWatcherMod
{
    #region imports

    using Newtonsoft.Json;

    #endregion

    [JsonObject(MemberSerialization.OptIn)]
    internal class PlayerInfo
    {
        public static readonly PlayerInfo Instance = new PlayerInfo();
        private readonly object _lock = new object();
        private string _biome;
        private int _x;
        private int _y;
        private int _z;

        [JsonProperty]
        public string Biome
        {
            get
            {
                lock (_lock)
                {
                    return _biome;
                }
            }
            set
            {
                lock (_lock)
                {
                    _biome = value;
                }
            }
        }

        [JsonProperty]
        public int X
        {
            get
            {
                lock (_lock)
                {
                    return _x;
                }
            }
            set
            {
                lock (_lock)
                {
                    _x = value;
                }
            }
        }

        [JsonProperty]
        public int Y
        {
            get
            {
                lock (_lock)
                {
                    return _y;
                }
            }
            set
            {
                lock (_lock)
                {
                    _y = value;
                }
            }
        }

        [JsonProperty]
        public int Z
        {
            get
            {
                lock (_lock)
                {
                    return _z;
                }
            }
            set
            {
                lock (_lock)
                {
                    _z = value;
                }
            }
        }
    }
}
