namespace SubnauticaWatcherMod.Patching
{
    #region imports

    using System;
    using System.Reflection;
    using Harmony;
    using Server;
    using UnityEngine;

    #endregion

    public static class Patcher
    {
        private static readonly HttpServer _httpServer = new HttpServer();

        private static void Log(string message)
        {
            Debug.Log($"[SNWatcher] {message}");
        }

        public static void Patch()
        {
            Log("Init Harmony");
            var harmony = HarmonyInstance.Create("com.github.martinsgill.subnauticawatcher.mod");
            Log("Start Patching");
            harmony.PatchAll(Assembly.GetExecutingAssembly());
            Log("Done Patching");

            Log("Starting HTTP Server");
            _httpServer.Start();
        }

        [HarmonyPatch(typeof(Player))]
        [HarmonyPatch("Update")]
        private class PlayerPatch
        {
            private static void Postfix(Player __instance)
            {
                var biome = __instance.GetBiomeString();
                PlayerInfo.Instance.Biome = biome;

                // Yes, Z and Y are supposed to be reversed. Converting Subnautica coords to something more traditional.
                PlayerInfo.Instance.X = (int) Math.Round(
                    (double)__instance.transform.position.x,
                    MidpointRounding.AwayFromZero);
                PlayerInfo.Instance.Z = (int) Math.Round(
                    (double)__instance.transform.position.y,
                    MidpointRounding.AwayFromZero);
                PlayerInfo.Instance.Y = (int) Math.Round(
                    (double)__instance.transform.position.z,
                    MidpointRounding.AwayFromZero);
            }
        }
    }
}
