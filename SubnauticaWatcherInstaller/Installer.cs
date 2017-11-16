namespace SubnauticaWatcherInstaller
{
    #region imports

    using System;
    using System.IO;
    using System.Linq;
    using System.Linq.Expressions;
    using Microsoft.Win32;
    using Mono.Cecil;
    using Mono.Cecil.Cil;

    #endregion

    internal delegate void MessageCallback(string message);

    internal class Installer
    {
        private MessageCallback log;
        
        internal Installer(MessageCallback log)
        {
            this.log = log;
        }

        private string SteamPath =>
            Registry.GetValue(@"HKEY_CURRENT_USER\Software\Valve\Steam", "SteamPath", null) as string;

        private string SubnauticaPath => Path.Combine(SteamPath, @"steamapps\common\Subnautica");

        private string SubnauticaManagedPath => Path.Combine(SubnauticaPath, @"Subnautica_Data\Managed");

        private string SubnauticaDllPath => Path.Combine(SubnauticaManagedPath, @"Assembly-CSharp.dll");

        private string SubnauticaDllBackupPath => SubnauticaDllPath + ".subnautica-watcher-backup";

        internal int Install()
        {
            var initialDirectory = Directory.GetCurrentDirectory();
            try
            {
                var exitCode = ValidatePaths();
                if (exitCode != 0) return exitCode;

                exitCode = BackupSubnauticaDll();
                if (exitCode != 0) return exitCode;

                exitCode = UpdateSubnauticaDll();
                if (exitCode != 0) return exitCode;

                return 0;
            }
            finally
            {
                Directory.SetCurrentDirectory(initialDirectory);
            }
        }

        private int BackupSubnauticaDll()
        {
            var backupFilename = Path.GetFileName(SubnauticaDllBackupPath);
            if (File.Exists(SubnauticaDllBackupPath))
            {
                log($"Backup ('{backupFilename}') already exists.");
                return 0;
            }

            try
            {
                File.Copy(
                    SubnauticaDllPath,
                    SubnauticaDllBackupPath);
                log($"Backup of Assembly-CSharp.dll created as '{backupFilename}'.");
            }
            catch (IOException ex)
            {
                log("Error: error attempting to create backup of Assembly-CSharp.dll.");
                log($"Error: {ex.Message}");
                return -4;
            }

            return 0;
        }

        internal int ValidatePaths()
        {
            if (Directory.Exists(SteamPath))
            {
                log($"Found Steam install directory. [{SteamPath}]");

                if (Directory.Exists(SubnauticaPath))
                {
                    log("Found Subnautica install directory.");

                    if (Directory.Exists(SubnauticaManagedPath))
                    {
                        log("Found Subnautica Data directory.");
                        return 0;
                    }

                    log("Error: Unable to determine Subnautica Data directory.");
                    return -3;
                }
                log("Error: Unable to determine Subnautica install directory.");
                return -2;
            }
            log("Error: Unable to determine Steam install directory.");
            return -1;
        }

        private int UpdateSubnauticaDll()
        {
            // Need to be in the correct folder to resolve dependencies correctly
            Directory.SetCurrentDirectory(SubnauticaManagedPath);

            log("Updating Assembly-CSharp.dll to load SubnauticaWatcherMod.");
            var targetAssembly = AssemblyDefinition.ReadAssembly(SubnauticaDllPath);
            if (!CheckPatched(targetAssembly))
                try
                {
                    var modAssemblyPath = Path.Combine(SubnauticaManagedPath, @"SubnauticaWatcherMod.dll");
                    var modAssembly = AssemblyDefinition.ReadAssembly(modAssemblyPath);
                    var modClass = modAssembly.MainModule.GetType("SubnauticaWatcherMod.Patching.Patcher");
                    var modMethod = modClass.Methods.Single(x => x.Name == "Patch");
                    var targetClass = targetAssembly.MainModule.GetType("GameInput");
                    var targetMethod = targetClass.Methods.First(x => x.Name == "Awake");
                    targetMethod.Body.GetILProcessor()
                                .InsertBefore(
                                    targetMethod.Body.Instructions[0],
                                    Instruction.Create(OpCodes.Call, targetMethod.Module.Import(modMethod)));
                    targetAssembly.Write(SubnauticaDllPath);
                    log("Assembly-CSharp.dll successfully updated.");
                }
                catch (Exception ex)
                {
                    log("Error: Failed to update Assembly-CSharp.dll.");
                    log($"Error: {ex.Message}");
                    return -5;
                }
            else
                log("Assembly-CSharp.dll appears to have already been modified; no action taken.");

            return 0;
        }

        internal bool IsPatched
        {
            get
            {
                try
                {
                    return CheckPatched(AssemblyDefinition.ReadAssembly(SubnauticaDllPath));
                }
                catch
                {
                    return false;
                }
            }
        }

        private static bool CheckPatched(AssemblyDefinition targetAssembly)
        {
            var type = targetAssembly.MainModule.GetType("GameInput");
            var methodDefinition = type.Methods.First(x => x.Name == "Awake");

            // Something else might have updated the DLL, so the patch might no longer
            // be the first instruction.
            var hasPatchInstruction = methodDefinition.Body.Instructions
                                                      .Where(x => x.OpCode == OpCodes.Call)
                                                      .Any(
                                                          x => (x.Operand as MethodReference)?.DeclaringType.FullName
                                                               == "SubnauticaWatcherMod.Patching.Patcher");
            return hasPatchInstruction;
        }

        internal void Uninstall()
        {
            log("Error: Sorry, proper uninstall not implemented yet.");
            log("Error: Please manually replace:");
            log($"Error:    {SubnauticaDllPath}");
            log("Error: with:");
            log($"Error:    {SubnauticaDllBackupPath}");
        }
    }
}
