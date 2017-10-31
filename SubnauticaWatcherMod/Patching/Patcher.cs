namespace SubnauticaWatcher.Patching
{
    using System;
    using System.Reflection;
    using Harmony;

    public static class Patcher
    {
        public static void Patch()
        {
            UnityEngine.Debug.Log("Init Harmony");
            var harmony = HarmonyInstance.Create("com.github.martinsgill.subnauticawatcher.mod");
            UnityEngine.Debug.Log("Start Patching");
            harmony.PatchAll(Assembly.GetExecutingAssembly());
            UnityEngine.Debug.Log("Done Patching");
        }


        [HarmonyPatch(typeof(Player))]
        [HarmonyPatch("Update")]
        class PlayerPatch
        {
            static void Postfix(Player __instance)
            {
                UnityEngine.Debug.Log("PlayerPatchPostFix");

                var biome = __instance.GetBiomeString();

                var pos =
                    $"Position: {__instance.transform.position.x}, {__instance.transform.position.y}, {__instance.transform.position.z}";

                var LocalPos =
                    $"LPosition: {__instance.transform.localPosition.x}, {__instance.transform.localPosition.y}, {__instance.transform.localPosition.z}";

                UnityEngine.Debug.Log($"{biome}; {pos}, {LocalPos}");
            }
        }
    }
}