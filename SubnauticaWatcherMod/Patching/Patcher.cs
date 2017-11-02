namespace SubnauticaWatcherMod.Patching
{
    #region imports

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

                var pos =
                    $"Position: {__instance.transform.position.x}, {__instance.transform.position.y}, {__instance.transform.position.z}";

                var localPos =
                    $"LPosition: {__instance.transform.localPosition.x}, {__instance.transform.localPosition.y}, {__instance.transform.localPosition.z}";

                // Log($"{biome}; {pos}, {localPos}");
            }
        }
    }
}
