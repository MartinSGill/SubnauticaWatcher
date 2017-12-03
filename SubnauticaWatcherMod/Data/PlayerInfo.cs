namespace SubnauticaWatcherMod.Data
{
    #region imports

    using System;
    using System.Collections.Generic;
    using System.Linq;
    using Oculus.Newtonsoft.Json;
    using Oculus.Newtonsoft.Json.Serialization;
    using UnityEngine;

    #endregion

    [JsonObject(MemberSerialization.OptIn)]
    internal class PlayerInfo : IComparable<PlayerInfo>
    {
        public static readonly PlayerInfo Instance = new PlayerInfo();

        private static readonly LinkedList<PlayerInfo> TrackStore = new LinkedList<PlayerInfo>();
        private static bool _isRecording;
        private readonly object _lock = new object();
        private string _biome = string.Empty;
        private int _x;
        private int _y;
        private int _z;

        public static IList<PlayerInfo> Track => TrackStore.ToArray();

        private static void Log(string message)
        {
            Debug.Log($"[PlayerInfo] {message}");
        }

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

        public int CompareTo(PlayerInfo that)
        {

            lock (_lock)
            {
                if (string.Compare(this._biome, that._biome, StringComparison.Ordinal) != 0)
                    return string.Compare(this._biome, that._biome, StringComparison.Ordinal);

                if (this._x.CompareTo(that._x) != 0) return this._x.CompareTo(that._x);

                // ReSharper disable once ConvertIfStatementToReturnStatement, easier to read like this
                if (_y.CompareTo(that._y) != 0) return _y.CompareTo(that._y);

                return _z.CompareTo(that._z);
            }
        }

        public static void StartRecording()
        {
            TrackStore.Clear();
            _isRecording = true;
        }

        public static void StopRecording()
        {
            _isRecording = false;
        }

        public static void Record()
        {
            if (!_isRecording) return;
            
            var data = new PlayerInfo
            {
                X = Instance.X,
                Y = Instance.Y,
                Z = Instance.Z,
                Biome = Instance.Biome
            };

            if (TrackStore.Count > 0 && TrackStore.Last.Value.CompareTo(data) == 0)
            {
                Log($"Identical Data: {JsonConvert.SerializeObject(data, Formatting.None)} -> {JsonConvert.SerializeObject(TrackStore.Last.Value, Formatting.None)} ");
                return;
            }

            TrackStore.AddLast(data);
        }
    }
}
