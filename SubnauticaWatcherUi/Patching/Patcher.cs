namespace SubnauticaWatcher.Patching
{
    using System;
    using System.Reflection;
    using Harmony;
    using NLog;

    public static class Patcher
    {
        public static void Patch()
        {
            _logger.Info("Init Harmony");
            var harmony = HarmonyInstance.Create("com.github.martinsgill.subnauticawatcher.mod");
            _logger.Info("Start Patching");
            harmony.PatchAll(Assembly.GetExecutingAssembly());
            _logger.Info("Done Patching");
        }

        private static Logger _logger = LogManager.GetCurrentClassLogger();

        [HarmonyPatch(typeof(Player))]
        [HarmonyPatch("Update")]
        class PlayerPatch
        {
            static void Postfix(Player __instance)
            {
                var biome = __instance.GetBiomeString();

                var pos =
                    $"Position: {__instance.transform.position.x}, {__instance.transform.position.y}, {__instance.transform.position.y}";

                var LocalPos =
                    $"LPosition: {__instance.transform.localPosition.x}, {__instance.transform.localPosition.y}, {__instance.transform.localPosition.y}";

                _logger.Info($"{biome}; {pos}, {LocalPos}");
            }
        }
    }
}