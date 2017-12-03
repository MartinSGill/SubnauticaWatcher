namespace SubnauticaWatcherMod.AutoMapper
{
    using System;
    using System.IO;
    using System.Net;
    using ImageMagick;
    using Oculus.Newtonsoft.Json;
    using UnityEngine;

    internal class AutoMapper
    {
        private readonly string[,] _mapGrid;

        private static AutoMapper _instance;

        public static AutoMapper Instance => _instance ?? (_instance = new AutoMapper());

        private static void Log(string message)
        {
            Debug.Log($"[AutoMapper] {message}");
        }

        private AutoMapper()
        {
            _mapGrid = new string[4000, 4000];
        }

        public void UpdateMap(PlayerInfo data)
        {
            if (string.IsNullOrEmpty(_mapGrid[data.X, data.Y]))
            {
                _mapGrid[data.X, data.Y] = data.Biome;
            }
        }

        public string ToJson()
        {
            return JsonConvert.SerializeObject(_mapGrid);
        }

        public static void DrawMap()
        {
            try
            {
                var result = new MagickImage(MagickColor.FromRgb(0, 0, 0), 4096, 4096) {Format = MagickFormat.Png};

                for (var i = -2048; i < 2048; i++) // x
                {
                    for (var j = 2048; j > -2048; j--) // y
                    {
                        var pixelX = i + 2048;
                        var pixelY = j + 2048;
                        var biome = "hello";

                        

                        var hash = biome.GetHashCode();
                        var r = (byte)((hash & 0xFF0000) >> 16);
                        var g = (byte)((hash & 0x00FF00) >> 8);
                        var b = (byte)(hash & 0x0000FF);

                        var color = MagickColor.FromRgb(r, g, b);

                        new Drawables()
                            .FillColor(color)
                            .StrokeColor(color)
                            .Point(pixelX, pixelY)
                            .Draw(result);
                    }
                }

                result.Write(new FileInfo(@"d:\temp\subnautica-map.png"));
            }
            catch (Exception e)
            {
                Log("Error in Draw Map");
                Log(e.Message);
                Log(e.StackTrace);
                throw;
            }
        }
    }
}
