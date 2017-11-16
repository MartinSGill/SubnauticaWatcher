namespace SubnauticaWatcherMod
{
    #region imports

    using Oculus.Newtonsoft.Json;

    #endregion

    [JsonObject(MemberSerialization.OptIn)]
    internal class PlayerInfo
    {
        public static readonly PlayerInfo Instance = new PlayerInfo();
        private readonly object _lock = new object();
        private string _biome = string.Empty;
        private int _x = 0;
        private int _y = 0;
        private int _z = 0;
        
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
